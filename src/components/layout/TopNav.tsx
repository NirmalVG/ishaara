import { Settings, CircleHelp, Zap } from "lucide-react"
import Link from "next/link"

export default function TopNav() {
  return (
    <header className="w-full h-16 border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 relative">
      {/* Subtle bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6b9dfe]/20 to-transparent" />

      {/* Logo Area */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6b9dfe] to-[#22d3ee] flex items-center justify-center shadow-[0_0_15px_rgba(107,157,254,0.3)]">
          <Zap className="w-4 h-4 text-slate-950" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Ishaara
        </span>
        <span className="hidden sm:inline-block text-[9px] font-bold text-[#6b9dfe] bg-[#6b9dfe]/10 border border-[#6b9dfe]/20 px-1.5 py-0.5 rounded uppercase tracking-widest ml-1">
          Beta
        </span>
      </div>

      {/* Center Navigation */}
      <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
        <Link
          href="/"
          className="relative px-4 py-2 text-white font-semibold rounded-lg bg-[#6b9dfe]/10 border border-[#6b9dfe]/20 transition-all"
        >
          Dashboard
          <span className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#6b9dfe] rounded-full shadow-[0_0_8px_rgba(107,157,254,0.6)]" />
        </Link>
        <Link
          href="#"
          className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-all"
        >
          Calibration
        </Link>
        <Link
          href="#"
          className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-all"
        >
          Gestures
        </Link>
      </nav>

      {/* Right Icons */}
      <div className="flex items-center gap-2 text-slate-400">
        <button
          className="p-2 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          aria-label="Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
        <button
          className="p-2 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          aria-label="Help & Support"
        >
          <CircleHelp className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  )
}
