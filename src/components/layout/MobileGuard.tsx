"use client"

import { useEffect, useState } from "react"
import { Monitor } from "lucide-react"

export default function MobileGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth < 1024
    setIsMobile(mobile)
  }, [])

  // Render nothing during SSR / before useEffect fires
  // Prevents flash of wrong content on either device type
  if (isMobile === null) return null

  if (isMobile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-[#131823] border border-slate-700 flex items-center justify-center">
            <Monitor className="w-10 h-10 text-[#6B9DFE]" />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Desktop Only
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ishaara uses your webcam for real-time hand gesture tracking. This
              requires a desktop or laptop browser to work correctly.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-800" />

          {/* Steps */}
          <div className="w-full flex flex-col gap-3 text-left">
            {[
              "Open a desktop or laptop browser",
              "Navigate to this URL",
              "Allow camera permissions when prompted",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-700 text-[#6B9DFE] text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-400">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
