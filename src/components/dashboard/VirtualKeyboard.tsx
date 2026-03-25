"use client"

import { useSettingsStore } from "@/store/useSettingStore"
import { Delete, X } from "lucide-react"

const QWERTY_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

export default function VirtualKeyboard() {
  const {
    isKeyboardOpen,
    typedText,
    appendChar,
    backspace,
    setKeyboardOpen,
    clearText,
  } = useSettingsStore()

  // If the gesture hasn't triggered it, hide it entirely.
  if (!isKeyboardOpen) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-[#131823]/95 backdrop-blur-2xl border border-slate-700/80 p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[9000] flex flex-col gap-4">
      {/* The Text Output Screen */}
      <div className="flex items-center gap-4 bg-[#0B0F17] p-4 rounded-2xl border border-slate-800 shadow-inner">
        <div className="flex-1 text-2xl md:text-3xl font-mono text-emerald-400 min-h-[40px] break-all tracking-wide">
          {typedText}
          <span className="animate-pulse inline-block w-3 h-7 md:h-8 bg-[#6B9DFE] ml-1 align-middle rounded-sm"></span>
        </div>
        <button
          onClick={clearText}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-slate-300 transition-all font-bold"
        >
          CLEAR
        </button>
        <button
          onClick={() => setKeyboardOpen(false)}
          className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 active:scale-95 rounded-xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* The Keys */}
      <div className="flex flex-col gap-2 md:gap-3 items-center mt-2">
        {QWERTY_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 w-full justify-center">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => appendChar(key)}
                className="w-12 h-16 md:w-16 md:h-20 bg-slate-800/80 hover:bg-[#6B9DFE] hover:text-slate-950 active:scale-90 text-xl md:text-2xl font-bold rounded-xl transition-all shadow-md border border-slate-700/50 hover:border-[#6B9DFE] flex items-center justify-center text-slate-200"
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom Row: Space & Backspace */}
        <div className="flex gap-2 w-full justify-center mt-1">
          <button
            onClick={() => appendChar(" ")}
            className="w-[50%] max-w-md h-16 md:h-20 bg-slate-800/80 hover:bg-[#6B9DFE] hover:text-slate-950 active:scale-95 text-lg font-bold tracking-widest rounded-xl transition-all shadow-md border border-slate-700/50 hover:border-[#6B9DFE] text-slate-400"
          >
            SPACE
          </button>
          <button
            onClick={backspace}
            className="w-24 h-16 md:h-20 bg-slate-800/80 hover:bg-red-500/80 hover:text-white active:scale-90 flex items-center justify-center rounded-xl transition-all shadow-md border border-slate-700/50 text-slate-400"
          >
            <Delete className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  )
}
