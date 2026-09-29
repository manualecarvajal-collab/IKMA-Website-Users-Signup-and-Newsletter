"use client"

/**
 * Botón "Sign Up Now" del hero.
 *
 * Baja hasta la sección de inscripción con un desplazamiento animado en vez
 * del salto instantáneo del ancla. Sigue siendo un `<a href="#registro">`, así
 * que sin JavaScript el enlace funciona igual (salto directo).
 */
export default function SignUpButton({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <a
      href="#registro"
      onClick={(e) => {
        const section = document.getElementById("registro")
        if (!section) return // sin destino, dejamos que el ancla haga su trabajo
        e.preventDefault()
        // Respeta la preferencia de movimiento reducido.
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        section.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        })
        window.history.replaceState(null, "", "#registro")
      }}
      className={className}
    >
      {label}
    </a>
  )
}
