"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/articulos", label: "Articles", icon: "article" },
  { href: "/admin/doctores", label: "Doctors", icon: "stethoscope" },
  { href: "/admin/revistas", label: "Magazines", icon: "menu_book" },
]

export function SidebarNav({ nombre }: { nombre: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin" || pathname === "/admin/"
    return pathname.startsWith(href)
  }

  function linkClasses(href: string) {
    const active = isActive(href)
    return `flex items-center gap-3 px-4 py-3 rounded-l-lg font-body-md text-body-md transition-colors ${
      active
        ? "bg-surface-container-high text-primary border-r-2 border-primary"
        : "text-on-surface-variant hover:bg-surface-container/50 hover:text-primary"
    }`
  }

  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 shrink-0 hidden md:block">
      <div className="p-6 border-b border-outline-variant/20">
        <Link href="/admin" className="font-headline-md text-headline-md text-primary">IKMA CMS</Link>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{nombre}</p>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
            <span className="material-symbols-outlined text-lg">{item.icon}</span> {item.label}
          </Link>
        ))}
        <hr className="my-4 border-outline-variant/20" />
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/40 hover:text-primary transition-colors bg-primary-container/10 border border-primary/20">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Site
        </Link>
      </nav>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname.startsWith(href)
  }

  return (
    <header className="md:hidden bg-surface-container-low border-b border-outline-variant/30 p-4 flex items-center justify-between">
      <Link href="/admin" className="font-headline-md text-headline-md text-primary">IKMA CMS</Link>
      <div className="flex items-center gap-1">
        <Link href="/admin/articulos" className={`p-2 ${isActive("/admin/articulos") ? "text-primary bg-primary-container/20 rounded-lg" : "text-on-surface-variant hover:text-primary"}`} title="Articles">
          <span className="material-symbols-outlined">article</span>
        </Link>
        <Link href="/admin/doctores" className={`p-2 ${isActive("/admin/doctores") ? "text-primary bg-primary-container/20 rounded-lg" : "text-on-surface-variant hover:text-primary"}`} title="Doctors">
          <span className="material-symbols-outlined">stethoscope</span>
        </Link>
        <Link href="/admin/revistas" className={`p-2 ${isActive("/admin/revistas") ? "text-primary bg-primary-container/20 rounded-lg" : "text-on-surface-variant hover:text-primary"}`} title="Magazines">
          <span className="material-symbols-outlined">menu_book</span>
        </Link>
        <span className="w-px h-5 bg-outline-variant/50 mx-1" />
        <Link href="/" className="flex items-center gap-1 bg-primary-container/20 text-primary px-3 py-1.5 rounded-full font-label-bold text-xs hover:bg-primary-container/40 transition-colors" title="Back to Site">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Site
        </Link>
      </div>
    </header>
  )
}
