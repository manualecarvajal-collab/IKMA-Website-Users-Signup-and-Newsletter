import Image from "next/image"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import Icon from "@/components/Icon"

export default async function Footer() {
  const t = await getTranslations("Footer")

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-padding grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-gutter font-body-md text-body-md">
        <div className="sm:col-span-2">
          <Image src="/logo.webp" alt="IKMA Logo" width={107} height={32} className="mb-4" />
          <p className="text-on-surface-variant mb-6 max-w-md">
            {t("missionStatement")}
          </p>
          <p className="text-on-surface-variant text-sm mb-2">
            <Icon name="mail" size={14} className="align-text-bottom" /> ikma@emmint.com
          </p>
          <p className="text-on-surface-variant text-sm">
            &copy; 2025 International Kingdom Medical Association. {t("tagline")}
          </p>
        </div>
        <div>
          <h4 className="text-on-background font-bold mb-4">{t("legal")}</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/privacy-policy"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                {t("privacyPolicy")}
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                {t("termsOfService")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-background font-bold mb-4">{t("resources")}</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/donor-rights"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                {t("donorRights")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
