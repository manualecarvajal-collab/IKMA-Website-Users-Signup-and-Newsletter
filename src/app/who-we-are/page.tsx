import type { Metadata } from "next"
import WhoWeAreContent from "./WhoWeAreContent"

export const metadata: Metadata = {
  title: "Who We Are - IKMA",
  description:
    "Meet the founders, board of directors, and partner organizations of the International Kingdom Medical Association.",
}

export default function WhoWeArePage() {
  return <WhoWeAreContent />
}
