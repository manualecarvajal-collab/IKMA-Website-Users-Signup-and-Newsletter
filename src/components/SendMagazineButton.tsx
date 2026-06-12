"use client"

import { useState } from "react"
import MagazineSendModal from "./MagazineSendModal"

interface Subscriber {
  id: string
  nombre: string
  email: string
}

export default function SendMagazineButton({
  revistaId,
  revistaTitulo,
  subscribers,
}: {
  revistaId: string
  revistaTitulo: string
  subscribers: Subscriber[]
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Send to subscribers"
        className="text-tertiary hover:text-tertiary-fixed-dim p-1.5 cursor-pointer bg-transparent border-none outline-none"
      >
        <span className="material-symbols-outlined text-lg">send</span>
      </button>

      {showModal && (
        <MagazineSendModal
          revistaId={revistaId}
          revistaTitulo={revistaTitulo}
          subscribers={subscribers}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
