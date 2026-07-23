import Image from "next/image"
import Link from "next/link"
import ContactSection from "./ContactSection"
import { T } from "@/components/T"
import Icon from "@/components/Icon"

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant">
      <ContactSection />
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-padding grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-gutter font-body-md text-body-md">
        <div className="sm:col-span-2">
          <Image src="/logo.webp" alt="IKMA Logo" width={107} height={32} className="mb-4" />
          <p className="text-on-surface-variant mb-6 max-w-md">
            <T en="We have God&apos;s grace and wisdom to bring solutions to the problems facing our society." es="Tenemos la gracia y sabiduría de Dios para traer soluciones a los problemas que enfrenta nuestra sociedad." />
          </p>
          <p className="text-on-surface-variant text-sm mb-2">
            <Icon name="mail" size={14} className="align-text-bottom" /> ikma@emmint.com
          </p>
          <p className="text-on-surface-variant text-sm">
            &copy; 2025 International Kingdom Medical Association. <T en="Healing through faith and excellence." es="Sanando a través de la fe y la excelencia." />
          </p>
        </div>
        <div>
          <h4 className="text-on-background font-bold mb-4">Legal</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/privacy-policy"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                <T en="Privacy Policy" es="Política de Privacidad" />
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                <T en="Terms of Service" es="Términos del Servicio" />
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-background font-bold mb-4"><T en="Resources" es="Recursos" /></h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                <T en="Donor Rights" es="Derechos del Donante" />
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                <T en="Annual Report" es="Informe Anual" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
