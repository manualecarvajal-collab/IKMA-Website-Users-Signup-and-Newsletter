"use client"

export default function ReadMagazineButton({
  isAuthenticated,
  isSubscribed,
  revistaId,
}: {
  isAuthenticated: boolean
  isSubscribed: boolean
  revistaId: string
}) {
  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = "/registro"
      return
    }
    if (!isSubscribed) {
      window.location.href = "/suscripcion-exito"
      return
    }
    window.open(`/api/download-magazine?id=${revistaId}`, "_blank")
  }

  return (
    <button
      onClick={handleClick}
      className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all w-full cursor-pointer"
    >
      Read
    </button>
  )
}
