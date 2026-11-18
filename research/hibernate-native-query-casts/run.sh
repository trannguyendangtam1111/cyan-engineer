#!/usr/bin/env bash
# Runs src/Repro.java once per Hibernate version against postgis/postgis:16-3.4
# (Testcontainers, so Docker must be running) and writes a filtered transcript
# per version to results/. Full output and build files go to target/.
#
# Usage:  ./run.sh                      (all four versions)
#         ./run.sh 6.4.4.Final          (one version)
# Maven:  uses $MVN if set, otherwise mvn on PATH.
set -euo pipefail
cd "$(dirname "$0")"

MVN="${MVN:-mvn}"
VERSIONS=("$@")
[ ${#VERSIONS[@]} -eq 0 ] && VERSIONS=(6.4.4.Final 6.4.5.Final 6.6.59.Final 7.4.16.Final)

# Java classpath separator: ';' on Windows (Git Bash), ':' elsewhere.
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) SEP=';' ;; *) SEP=':' ;; esac

mkdir -p target results
for v in "${VERSIONS[@]}"; do
  cp_file="target/cp-$v.txt"
  "$MVN" -q -Dhibernate.version="$v" dependency:build-classpath \
    -Dmdep.outputFile="$cp_file" -Dmdep.pathSeparator="$SEP"
  cp="$(cat "$cp_file")"
  mkdir -p "target/classes-$v"
  javac -nowarn -d "target/classes-$v" -cp "$cp" src/Repro.java
  # jboss-logging -> java.util.logging, so Hibernate's WARN lines are printed
  java -Dorg.jboss.logging.provider=jdk -cp "target/classes-$v$SEP$cp" Repro \
    > "target/run-$v.log" 2>&1
  # Keep the result lines; drop stack frames, INFO logging, driver metadata
  # queries and the BEGIN/COMMIT around each statement.
  grep -vE '^\s+at |INFO|^[A-Z][a-z]{2} [0-9]+, |SLF4J|pg_catalog|: +(BEGIN|COMMIT)$|execute S_[0-9]+: (BEGIN|COMMIT)|^	' \
    "target/run-$v.log" > "results/hibernate-$v.txt"
  echo "$v -> results/hibernate-$v.txt"
done
