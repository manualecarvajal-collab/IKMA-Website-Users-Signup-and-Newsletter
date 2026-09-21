import type { Metadata } from "next"
import OurPurposeContent from "./OurPurposeContent"
import { pageSeo } from "@/lib/seo"

export const metadata: Metadata = pageSeo({
  title: "Our Purpose, Mission and Values - IKMA",
  description:
    "Discover the purpose, mission, and core values that drive the International Kingdom Medical Association.",
  path: "/our-purpose",
})

export default function OurPurposePage() {
  return <OurPurposeContent />
}
