import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-24 text-center">
      <svg
        viewBox="0 0 240 200"
        className="w-64 h-56 md:w-80 md:h-64 mb-12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#074469" />
            <stop offset="100%" stopColor="#2a5c82" />
          </linearGradient>
        </defs>

        <g transform="translate(120,90)">
          <path
            d="M0-25 C-10-55,-55-55,-55-20 C-55,10,0,45,0,55 C0,45,55,10,55-20 C55-55,10-55,0-25Z"
            fill="url(#heartGrad)"
            className="animate-pulse"
            style={{ animationDuration: "1.2s" }}
          />
        </g>

        <polyline
          points="20,120 50,120 62,95 80,145 92,120 105,120 110,120 120,100 140,140 150,120 160,120 165,120 180,100 200,125 220,120"
          fill="none"
          stroke="#074469"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="400"
          strokeDashoffset="400"
          className="ekg-line"
        />
      </svg>

      <style>{`
        .ekg-line {
          animation: drawEkg 2s ease-out forwards;
        }
        @keyframes drawEkg {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <h1 className="font-headline-xl text-headline-xl text-primary mb-4">
        404 — Page Not Found
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mb-10">
        The page you are looking for does not exist or has been moved. Let us
        guide you back home.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined">home</span>
        Back to Homepage
      </Link>
    </div>
  )
}
