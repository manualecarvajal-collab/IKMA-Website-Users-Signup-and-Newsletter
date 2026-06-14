"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/articulos", label: "Articles", icon: "article" },
  { href: "/admin/doctores", label: "Doctors", icon: "stethoscope" },
  { href: "/admin/revistas", label: "Magazines", icon: "menu_book" },
]

export function SidebarNav({ 
  nombre, 
  isOpen, 
  setIsOpen 
}: { 
  nombre: string, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void 
}) {
  const pathname = usePathname()

  // Close sidebar when pathname changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])

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
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-low border-r border-outline-variant/30 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <div>
            <Link href="/admin" className="font-headline-md text-headline-md text-primary">IKMA CMS</Link>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{nombre}</p>
          </div>
          <button 
            className="md:hidden p-2 text-on-surface-variant"
            onClick={() => setIsOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
              <span className="material-symbols-outlined text-lg">{item.icon}</span> {item.label}
            </Link>
          ))}
          <hr className="my-4 border-outline-variant/20" />
          {pathname === "/admin" || pathname === "/admin/" ? (
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/40 hover:text-primary transition-colors bg-primary-container/10 border border-primary/20">
              <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Site
            </Link>
          ) : (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-primary-container/40 hover:text-primary transition-colors bg-primary-container/10 border border-primary/20">
              <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Dashboard
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}

export function MobileNav({ setIsOpen }: { setIsOpen: (open: boolean) => void }) {
  const pathname = usePathname()
  const isDashboard = pathname === "/admin" || pathname === "/admin/"
  return (
    <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* IZQUIERDA: Botón Volver al Dashboard / Sitio */}
        <div className="w-1/3 flex justify-start">
          <Link href={isDashboard ? "/" : "/admin"} className="flex items-center gap-2 text-gray-600 hover:text-ikmaBlue hover:bg-gray-100 bg-gray-50 border border-gray-200 px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path>
            </svg>
            <span className="hidden sm:inline">{isDashboard ? "Back to Site" : "Dashboard"}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        {/* CENTRO: Logo IKMA CMS */}
        <div className="w-1/3 flex justify-center">
          <Link href="/admin" className="text-ikmaBlue font-black text-lg md:text-2xl tracking-tight select-none">
            IKMA CMS
          </Link>
        </div>

        {/* DERECHA: Botón de Hamburguesa para activar el Sidebar */}
        <div className="w-1/3 flex justify-end">
          <button 
            id="btn-open-sidebar" 
            className="p-2 rounded-lg text-gray-600 hover:text-ikmaBlue hover:bg-gray-100 focus:outline-none transition-all duration-200" 
            aria-label="Abrir menú"
            onClick={() => setIsOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
            </svg>
          </button>
        </div>

      </div>
    </header>
  )
}

export function AdminNavWrapper({ 
  nombre, 
  children 
}: { 
  nombre: string, 
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <SidebarNav nombre={nombre} isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileNav setIsOpen={setIsOpen} />
        <main className="flex-1 bg-surface">{children}</main>
      </div>
    </div>
  )
}
