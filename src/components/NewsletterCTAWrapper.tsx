import NewsletterCTA from "./NewsletterCTA"
import NewsletterCTAVisibility from "./NewsletterCTAVisibility"

export default function NewsletterCTAWrapper({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <NewsletterCTAVisibility>
      <NewsletterCTA isAuthenticated={isAuthenticated} />
    </NewsletterCTAVisibility>
  )
}
