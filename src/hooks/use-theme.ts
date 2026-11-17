"use client"

import { useState, useEffect } from "react"

type Theme = "dark" | "light"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark"
    setTheme(current)
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)

    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light")
      localStorage.setItem("theme", "light")
    } else {
      document.documentElement.removeAttribute("data-theme")
      localStorage.setItem("theme", "dark")
    }
  }

  return { theme, toggleTheme }
}
