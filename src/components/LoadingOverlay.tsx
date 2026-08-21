"use client"

// Full-screen blocking overlay shown during long operations (account
// deletion, sign-out) so the page doesn't look frozen while we await the
// server action and reload.
export default function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface px-10 py-8 shadow-xl">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {message && <p className="font-label-bold text-label-bold text-on-surface">{message}</p>}
      </div>
    </div>
  )
}
