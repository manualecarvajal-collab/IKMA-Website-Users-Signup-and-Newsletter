import type { Metadata } from "next"
import ContactSection from "@/components/ContactSection"
import { pageSeo } from "@/lib/seo"

export const metadata: Metadata = pageSeo({
  title: "Contact Us - IKMA",
  description: "Get in touch with the International Kingdom Medical Association. Send us a message and our team will respond within 24 hours.",
  path: "/contact-us",
})

export default function ContactUsPage() {
  return <ContactSection />
}
