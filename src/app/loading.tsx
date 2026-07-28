import Icon from "@/components/Icon"

export default function LoadingPage() {
  return (
    <section className="py-section-padding min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 animate-spin text-primary">
          <Icon name="sync" size={48} />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Loading...</p>
      </div>
    </section>
  )
}
