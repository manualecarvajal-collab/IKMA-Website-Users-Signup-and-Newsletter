import type { Metadata } from "next"
import ContactSection from "@/components/ContactSection"

export const metadata: Metadata = {
  title: "Contact Us - IKMA",
  description: "Get in touch with the International Kingdom Medical Association. Send us a message and our team will respond within 24 hours.",
}

export default function ContactUsPage() {
  return <ContactSection />
}
