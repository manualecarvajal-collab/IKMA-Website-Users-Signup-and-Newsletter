import type { Metadata } from "next"
import WhoWeAreContent from "./WhoWeAreContent"
import { pageSeo } from "@/lib/seo"

export const metadata: Metadata = pageSeo({
  title: "Who We Are - IKMA",
  description:
    "Meet the founders, board of directors, and partner organizations of the International Kingdom Medical Association.",
  path: "/who-we-are",
})

export default function WhoWeArePage() {
  return <WhoWeAreContent />
}
