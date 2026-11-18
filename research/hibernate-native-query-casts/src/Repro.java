import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Version;
import org.hibernate.cfg.Configuration;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/*
 * Runs PostgreSQL cast spellings through Hibernate's native-query path
 * (Session#createNativeQuery) against a real PostGIS database, and prints
 * what Hibernate threw and what PostgreSQL logged for each one.
 */
public class Repro {

    // Built from a char code so this source holds no escape sequences.
    static final String BS = String.valueOf((char) 92);

    public static void main(String[] args) throws Exception {
        Map<String, String> variants = new LinkedHashMap<>();
        String point = "ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)";
        variants.put("V1 ::geography",
                "SELECT id FROM places WHERE ST_DWithin(geom::geography, " + point + "::geography, :radius) ORDER BY id");
        variants.put("V2 CAST(... AS geography)",
                "SELECT id FROM places WHERE ST_DWithin(CAST(geom AS geography), CAST(" + point + " AS geography), :radius) ORDER BY id");
        String esc = BS + ":" + BS + ":";
        variants.put("V3 backslash-escaped \\:\\:",
                "SELECT id FROM places WHERE ST_DWithin(geom" + esc + "geography, " + point + esc + "geography, :radius) ORDER BY id");
        variants.put("V4 quadruple ::::",
                "SELECT id FROM places WHERE ST_DWithin(geom::::geography, " + point + "::::geography, :radius) ORDER BY id");
        variants.put("V5 parameter then cast :radius::float8",
                "SELECT id FROM places WHERE ST_DWithin(CAST(geom AS geography), CAST(" + point + " AS geography), :radius::float8) ORDER BY id");

        DockerImageName image = DockerImageName.parse("postgis/postgis:16-3.4").asCompatibleSubstituteFor("postgres");
        try (PostgreSQLContainer<?> pg = new PostgreSQLContainer<>(image)
                .withCommand("postgres", "-c", "log_statement=all", "-c", "fsync=off")) {
            pg.start();

            Configuration cfg = new Configuration()
                    .setProperty("hibernate.connection.url", pg.getJdbcUrl())
                    .setProperty("hibernate.connection.username", pg.getUsername())
                    .setProperty("hibernate.connection.password", pg.getPassword())
                    .setProperty("hibernate.connection.pool_size", "2");

            System.out.println("=== Hibernate " + Version.getVersionString()
                    + " | PostgreSQL JDBC " + org.postgresql.Driver.getVersion() + " | image postgis/postgis:16-3.4");

            try (SessionFactory sf = cfg.buildSessionFactory()) {
                try (Session s = sf.openSession()) {
                    s.doWork(c -> {
                        try (var st = c.createStatement()) {
                            st.execute("CREATE EXTENSION IF NOT EXISTS postgis");
                            st.execute("CREATE TABLE places (id int PRIMARY KEY, geom geometry(Point, 4326))");
                            // id 1 at the search point, id 2 about 5.5 km east of it
                            st.execute("INSERT INTO places VALUES (1, ST_SetSRID(ST_MakePoint(106.7000, 10.7700), 4326)),"
                                    + " (2, ST_SetSRID(ST_MakePoint(106.7500, 10.7700), 4326))");
                            st.execute("SELECT version()");
                        }
                    });
                }

                for (Map.Entry<String, String> v : variants.entrySet()) {
                    int logMark = pg.getLogs().length();
                    String outcome;
                    try (Session s = sf.openSession()) {
                        List<?> rows = s.createNativeQuery(v.getValue())
                                .setParameter("lng", 106.7)
                                .setParameter("lat", 10.77)
                                .setParameter("radius", 1000.0)
                                .getResultList();
                        outcome = "PASS rows=" + new ArrayList<>(rows);
                    } catch (Exception e) {
                        StringBuilder sb = new StringBuilder("FAIL " + e.getClass().getName() + ": " + e.getMessage());
                        for (Throwable t = e.getCause(); t != null; t = t.getCause()) {
                            sb.append("\n      caused by ").append(t.getClass().getName()).append(": ").append(t.getMessage());
                        }
                        outcome = sb.toString();
                    }
                    Thread.sleep(400);
                    String pgLog = pg.getLogs().substring(logMark);
                    System.out.println();
                    System.out.println("--- " + v.getKey());
                    System.out.println("  input SQL : " + v.getValue());
                    System.out.println("  result    : " + outcome);
                    System.out.println("  postgres  :");
                    for (String line : pgLog.split("\n")) {
                        if (line.contains("LOG:") || line.contains("ERROR:") || line.contains("STATEMENT:") || line.contains("DETAIL:")) {
                            System.out.println("    " + line.replaceFirst("^.*?(LOG|ERROR|STATEMENT|DETAIL):", "$1:"));
                        }
                    }
                }
            }
        }
    }
}
