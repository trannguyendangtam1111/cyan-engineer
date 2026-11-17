"use client"

import { Sun, Moon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="
        flex h-10 w-10 items-center justify-center rounded-full
        border border-line bg-surface text-fg-muted
        transition-colors duration-100 ease-in-out
        hover:border-line-hover hover:text-fg-strong
        focus-visible:outline-none focus-visible:ring-focus
      "
      suppressHydrationWarning
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          className="flex"
          aria-hidden
        >
          {theme === "light" ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
