"use client"

import { useEffect, useState } from "react"

export default function MobileGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth < 1024
    setIsMobile(mobile)
  }, [])

  if (isMobile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-3">Desktop Only</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ishaara uses your webcam for gesture tracking and requires a desktop
            browser. Open this on your laptop or PC.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
