"use client"

import { useCallback } from "react"
import { useSettingsStore } from "@/store/useSettingStore"
import { Delete, X, ArrowBigUp, CornerDownLeft, Hash, Space, Keyboard } from "lucide-react"

const NUMBERS_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
const QWERTY_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]
const SYM_ROWS = [
  ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
  ["-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"],
  ["`", "~", "{", "}", "|", ":", '"'],
]

let audioCtx: AudioContext | null = null
function playKeySound(freq = 800) {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.connect(g); g.connect(audioCtx.destination)
    o.frequency.value = freq; o.type = "sine"
    g.gain.setValueAtTime(0.05, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.025)
    o.start(audioCtx.currentTime); o.stop(audioCtx.currentTime + 0.025)
  } catch { /* silent */ }
}

function insertRaw(char: string) {
  const el = document.activeElement
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const s = el.selectionStart || 0, e = el.selectionEnd || 0
    el.setRangeText(char, s, e, "end")
    el.dispatchEvent(new Event("input", { bubbles: true }))
  }
  useSettingsStore.setState((st) => ({ typedText: st.typedText + char }))
}

export default function VirtualKeyboard() {
  const { isKeyboardOpen, typedText, isShiftActive, isSymbolsMode, appendChar, backspace, setKeyboardOpen, clearText, toggleShift, toggleSymbols, pressEnter } = useSettingsStore()

  const tap = useCallback((key: string, action: () => void) => {
    playKeySound(key === " " ? 400 : 600 + Math.random() * 400)
    action()
  }, [])

  if (!isKeyboardOpen) return null

  const rows = isSymbolsMode ? SYM_ROWS : QWERTY_LAYOUT

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9000] flex justify-center px-3 pb-4 pt-2" style={{ animation: "slide-up-enter 0.35s cubic-bezier(0.16,1,0.3,1) forwards" }}>
      <div className="relative w-full max-w-5xl glass-panel rounded-2xl border border-slate-700/40 shadow-[0_-8px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(107,157,254,0.08)] overflow-hidden scanline-overlay">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6b9dfe]/50 to-transparent" />
        <div className="absolute inset-0 pointer-events-none scanline-beam" />

        <div className="relative z-10 p-4 flex flex-col gap-3">
          {/* Top Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#0B0F17]/60 rounded-lg border border-slate-800/50">
              <Keyboard className="w-3.5 h-3.5 text-[#6b9dfe]" />
              <span className="text-[10px] font-bold text-[#6b9dfe] uppercase tracking-widest">Active</span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="flex-1 flex items-center bg-[#060a12] border border-slate-800/60 rounded-xl px-4 py-2.5 min-h-[44px] shadow-inner">
              <span className="flex-1 text-base md:text-lg font-mono text-emerald-400 break-all tracking-wide leading-relaxed whitespace-pre-wrap">
                {typedText || <span className="text-slate-600 italic text-sm font-sans">Start typing...</span>}
                <span className="inline-block w-[2px] h-5 bg-[#6b9dfe] ml-0.5 align-middle rounded-full" style={{ animation: "cursor-blink 1s step-end infinite" }} />
              </span>
            </div>
            <button onClick={() => tap("c", clearText)} className="kb-key px-3 py-2.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-200 border border-slate-700/40 transition-all uppercase tracking-wider">Clear</button>
            <button onClick={() => setKeyboardOpen(false)} className="kb-key p-2.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-xl border border-red-900/30 hover:border-red-700/50 transition-all"><X className="w-4 h-4" /></button>
          </div>

          {/* Numbers Row */}
          {!isSymbolsMode && (
            <div className="flex gap-1.5 w-full justify-center">
              {NUMBERS_ROW.map((k, i) => (
                <button key={`n-${k}`} onClick={() => tap(k, () => insertRaw(k))} className="kb-key flex-1 max-w-[72px] h-11 bg-slate-800/40 hover:bg-[#6b9dfe]/20 text-sm font-semibold rounded-lg border border-slate-700/30 hover:border-[#6b9dfe]/40 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm" style={{ animation: `key-stagger-in 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 15}ms both` }}>
                  {k}
                </button>
              ))}
            </div>
          )}

          {/* Letter / Symbol Rows */}
          <div className="flex flex-col gap-1.5 items-center">
            {rows.map((row, ri) => (
              <div key={`r-${ri}`} className="flex gap-1.5 w-full justify-center">
                {!isSymbolsMode && ri === 2 && (
                  <button onClick={() => tap("s", toggleShift)} className={`kb-key w-14 h-12 md:h-14 rounded-xl flex items-center justify-center border transition-all text-sm font-bold ${isShiftActive ? "bg-[#6b9dfe]/30 border-[#6b9dfe]/60 text-[#6b9dfe] shadow-[0_0_15px_rgba(107,157,254,0.3)]" : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"}`}>
                    <ArrowBigUp className="w-5 h-5" />
                  </button>
                )}
                {row.map((key, ki) => {
                  const display = isSymbolsMode ? key : isShiftActive ? key.toUpperCase() : key.toLowerCase()
                  return (
                    <button key={`k-${key}-${ri}`} onClick={() => tap(key, () => isSymbolsMode ? insertRaw(key) : appendChar(key))} className="kb-key flex-1 max-w-[72px] h-12 md:h-14 bg-slate-800/40 hover:bg-[#6b9dfe]/20 text-base md:text-lg font-semibold rounded-xl border border-slate-700/30 hover:border-[#6b9dfe]/40 text-slate-200 hover:text-white flex items-center justify-center shadow-sm transition-all" style={{ animation: `key-stagger-in 0.3s cubic-bezier(0.16,1,0.3,1) ${(ri * 10 + ki * 20 + 100)}ms both` }}>
                      {display}
                    </button>
                  )
                })}
                {!isSymbolsMode && ri === 2 && (
                  <button onClick={() => tap("d", backspace)} className="kb-key w-14 h-12 md:h-14 bg-slate-800/40 hover:bg-red-900/30 rounded-xl flex items-center justify-center border border-slate-700/30 hover:border-red-700/40 text-slate-400 hover:text-red-400 transition-all">
                    <Delete className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="flex gap-1.5 w-full justify-center items-center">
            <button onClick={() => tap("sym", toggleSymbols)} className={`kb-key h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 border text-xs font-bold uppercase tracking-wider transition-all ${isSymbolsMode ? "bg-[#6b9dfe]/20 border-[#6b9dfe]/40 text-[#6b9dfe]" : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"}`}>
              <Hash className="w-3.5 h-3.5" />{isSymbolsMode ? "ABC" : "?#1"}
            </button>
            <button onClick={() => tap(",", () => insertRaw(","))} className="kb-key w-11 h-11 bg-slate-800/40 hover:bg-[#6b9dfe]/20 rounded-xl border border-slate-700/30 text-slate-400 hover:text-white flex items-center justify-center text-lg font-bold transition-all">,</button>
            <button onClick={() => tap(" ", () => appendChar(" "))} className="kb-key flex-1 max-w-lg h-11 bg-slate-800/40 hover:bg-[#6b9dfe]/15 rounded-xl border border-slate-700/30 hover:border-[#6b9dfe]/30 text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.3em] uppercase transition-all" style={{ animation: "key-stagger-in 0.4s cubic-bezier(0.16,1,0.3,1) 250ms both" }}>
              <Space className="w-4 h-4 opacity-40" />Space
            </button>
            <button onClick={() => tap(".", () => insertRaw("."))} className="kb-key w-11 h-11 bg-slate-800/40 hover:bg-[#6b9dfe]/20 rounded-xl border border-slate-700/30 text-slate-400 hover:text-white flex items-center justify-center text-lg font-bold transition-all">.</button>
            <button onClick={() => tap("e", pressEnter)} className="kb-key h-11 px-4 bg-[#6b9dfe]/20 hover:bg-[#6b9dfe]/35 rounded-xl flex items-center justify-center gap-1.5 border border-[#6b9dfe]/30 hover:border-[#6b9dfe]/60 text-[#6b9dfe] hover:text-white text-xs font-bold uppercase tracking-wider transition-all">
              <CornerDownLeft className="w-3.5 h-3.5" />Enter
            </button>
            {isSymbolsMode && (
              <button onClick={() => tap("d", backspace)} className="kb-key w-12 h-11 bg-slate-800/40 hover:bg-red-900/30 rounded-xl flex items-center justify-center border border-slate-700/30 hover:border-red-700/40 text-slate-400 hover:text-red-400 transition-all">
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee]/30 to-transparent" />
      </div>
    </div>
  )
}
