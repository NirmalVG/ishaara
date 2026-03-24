import { Settings, CircleHelp } from "lucide-react"
import Link from "next/link"

export default function TopNav() {
  return (
    <header className="w-full h-16 border-b border-slate-800 bg-[#0B0F17] flex items-center justify-between px-6 shrink-0 z-10 relative">
      {/* Logo Area */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-white">
          Ishaara
        </span>
      </div>

      {/* Center Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        {/* The Dashboard is currently active, so we use our bright blue accent */}
        <Link href="/" className="text-[#6B9DFE] font-semibold">
          Dashboard
        </Link>
        <Link
          href="#"
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          Calibration
        </Link>
        <Link
          href="#"
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          Gestures
        </Link>
      </nav>

      {/* Right Icons */}
      <div className="flex items-center gap-4 text-slate-400">
        <button
          className="hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          className="hover:text-white transition-colors"
          aria-label="Help & Support"
        >
          <CircleHelp className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
