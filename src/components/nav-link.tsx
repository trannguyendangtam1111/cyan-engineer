"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

/*
 * Top-bar link that marks itself current on its route and any route below it.
 * Home ("/") is current only on the homepage itself.
 */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="
        flex h-10 items-center rounded-full px-3 sm:px-4
        text-[14px] font-medium text-fg-muted
        transition-colors duration-100 ease-in-out
        hover:bg-surface hover:text-fg-strong
        aria-[current=page]:bg-surface aria-[current=page]:text-fg-strong
        focus-visible:outline-none focus-visible:ring-focus
      "
    >
      {children}
    </Link>
  )
}
