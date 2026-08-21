"use client"

import NewsletterForm from "@/components/NewsletterForm"
import type { Recipient } from "@/lib/newsletter-audiences"

export default function NuevaNewsletterForm({ recipients }: { recipients: Recipient[] }) {
  return <NewsletterForm recipients={recipients} />
}
