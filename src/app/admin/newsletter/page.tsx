import { getNewsletters } from "@/lib/supabase/admin-actions"
import NewsletterList from "@/components/NewsletterList"
import Link from "next/link"
import Icon from "@/components/Icon"

export default async function NewsletterPage() {
  const newsletters = await getNewsletters()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Newsletter</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Send and manage newsletters to your subscribers.
          </p>
        </div>
        <Link
          href="/admin/newsletter/nueva"
          className="flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all"
        >
          <Icon name="send" size={18} />
          Send a Newsletter
        </Link>
      </div>

      <div className="bg-surface rounded-xl p-6 border border-outline-variant/20">
        <NewsletterList newsletters={newsletters} />
      </div>
    </div>
  )
}
