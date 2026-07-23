import type { Metadata } from "next"
import OurPurposeContent from "./OurPurposeContent"

export const metadata: Metadata = {
  title: "Our Purpose, Mission and Values - IKMA",
  description:
    "Discover the purpose, mission, and core values that drive the International Kingdom Medical Association.",
}

export default function OurPurposePage() {
  return <OurPurposeContent />
}
