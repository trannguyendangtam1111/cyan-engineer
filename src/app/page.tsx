import { Hero } from "@/components/hero"
import { BentoGrid } from "@/components/bento-grid"

export default function Home() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      {/* Top-bar → Hero */}
      <div className="mt-6 sm:mt-10 lg:mt-12">
        <Hero />
      </div>

      {/* Hero → Bento */}
      <div className="mt-10 sm:mt-12 lg:mt-14">
        <BentoGrid />
      </div>

      {/* Bento → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}
