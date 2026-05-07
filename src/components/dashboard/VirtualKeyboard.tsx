"use client"

import { useCallback, useEffect, useState } from "react"
import { useKeyboardStore } from "@/store/useKeyboardStore"
import {
  insertAtCursor,
  deleteAtCursor,
  pressEnterAtCursor,
  getActiveValue,
  preventFocusTheft,
} from "@/lib/keyboardDispatch"
import {
  Delete,
  X,
  CornerDownLeft,
  Space,
  Keyboard,
  ArrowBigUp,
  Lock,
  ChevronRight,
} from "lucide-react"

// ─── Layout data ─────────────────────────────────────────────────────────────

const NUMBERS_ROW = [
  { base: "1", shift: "!" },
  { base: "2", shift: "@" },
  { base: "3", shift: "#" },
  { base: "4", shift: "$" },
  { base: "5", shift: "%" },
  { base: "6", shift: "^" },
  { base: "7", shift: "&" },
  { base: "8", shift: "*" },
  { base: "9", shift: "(" },
  { base: "0", shift: ")" },
]

const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

// Page 1: everyday punctuation, operators, brackets
const SYM_PAGE1: string[][] = [
  ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
  ["-", "+", "=", "/", "\\", "|", "<", ">", "?", "_"],
  ["~", "`", "'", '"', ";", ":", ",", ".", "[", "]"],
]

// Page 2: currency, extended typography, arrows
const SYM_PAGE2: string[][] = [
  ["€", "£", "¥", "©", "®", "™", "°", "±", "×", "÷"],
  ["¿", "¡", "«", "»", "\u201C", "\u201D", "\u201E", "…", "–", "—"],
  ["{", "}", "§", "¶", "†", "‡", "•", "·", "←", "→"],
]

// ─── Audio ───────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null

function playKeySound(
  type: "char" | "space" | "delete" | "modifier" | "enter",
) {
  const freqs: Record<string, number> = {
    char: 660,
    space: 300,
    delete: 200,
    modifier: 500,
    enter: 440,
  }
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.connect(g)
    g.connect(audioCtx.destination)
    o.frequency.value = freqs[type]
    o.type = type === "modifier" ? "triangle" : "sine"
    g.gain.setValueAtTime(0.05, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03)
    o.start(audioCtx.currentTime)
    o.stop(audioCtx.currentTime + 0.03)
  } catch {
    /* AudioContext blocked — silent degradation */
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * CharKey — standard character button.
 *
 * CRITICAL: onMouseDown={preventFocusTheft}
 * Without this, clicking the button fires mousedown first, which moves
 * browser focus from the active input to this button. By the time onClick
 * fires, document.activeElement is the button — not the input —
 * so getTarget() would return null and nothing would be inserted.
 *
 * preventDefault() on mousedown stops the focus-move while still
 * allowing the click event to fire normally.
 */
function CharKey({
  display,
  subLabel,
  onClick,
  style,
}: {
  display: string
  subLabel?: string
  onClick: () => void
  style?: React.CSSProperties
}) {
  return (
    <button
      onMouseDown={preventFocusTheft}
      onClick={onClick}
      aria-label={display}
      style={style}
      className="
        kb-key relative flex-1 max-w-[72px] h-12 md:h-14
        bg-slate-800/40 hover:bg-[#6b9dfe]/20 active:scale-95 active:bg-[#6b9dfe]/30
        text-base md:text-lg font-semibold rounded-xl
        border border-slate-700/30 hover:border-[#6b9dfe]/40
        text-slate-200 hover:text-white
        flex flex-col items-center justify-center
        shadow-sm transition-all duration-100 select-none
      "
    >
      <span className="leading-none">{display}</span>
      {subLabel && (
        <span className="text-[9px] text-slate-500 leading-none mt-0.5 font-normal">
          {subLabel}
        </span>
      )}
    </button>
  )
}

/**
 * ModKey — modifier button (Shift, CapsLock, symbols toggle).
 * Also requires onMouseDown={preventFocusTheft} for the same reason.
 */
function ModKey({
  children,
  onClick,
  isActive,
  isCaps,
  ariaLabel,
  wide,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  isActive: boolean
  isCaps?: boolean
  ariaLabel: string
  wide?: boolean
  danger?: boolean
}) {
  return (
    <button
      onMouseDown={preventFocusTheft}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`
        kb-key h-12 md:h-14 rounded-xl flex items-center justify-center gap-1
        border transition-all duration-150 active:scale-95 font-bold text-xs select-none
        ${wide ? "w-16 md:w-20" : "w-12 md:w-14"}
        ${
          danger
            ? "bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border-red-900/30 hover:border-red-700/50"
            : isCaps
              ? "bg-violet-900/40 border-violet-500/60 text-violet-300 shadow-[0_0_15px_rgba(167,139,250,0.3)]"
              : isActive
                ? "bg-[#6b9dfe]/30 border-[#6b9dfe]/60 text-[#6b9dfe] shadow-[0_0_15px_rgba(107,157,254,0.3)]"
                : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
        }
      `}
    >
      {children}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VirtualKeyboard() {
  const {
    isOpen,
    isShiftActive,
    isCapsLock,
    isSymbolsMode,
    isSymbolsPage2,
    close,
    tapShift,
    toggleCapsLock,
    releaseShift,
    toggleSymbols,
    toggleSymbolsPage,
  } = useKeyboardStore()

  const isUpperCase = isShiftActive || isCapsLock

  // ── Live preview ─────────────────────────────────────────────────────────
  // Reads from our lastFocusedElement tracker (in keyboardDispatch), NOT from
  // document.activeElement. This works correctly even while a button has focus.
  const [previewText, setPreviewText] = useState("")

  useEffect(() => {
    if (!isOpen) return
    setPreviewText(getActiveValue())
    const id = setInterval(() => setPreviewText(getActiveValue()), 80)
    return () => clearInterval(id)
  }, [isOpen])

  // ── Insert handler ────────────────────────────────────────────────────────
  const handleChar = useCallback(
    (rawKey: string) => {
      const isLetter = /^[A-Za-z]$/.test(rawKey)
      const char = isLetter
        ? isUpperCase
          ? rawKey.toUpperCase()
          : rawKey.toLowerCase()
        : rawKey

      insertAtCursor(char)
      setPreviewText(getActiveValue())

      // One-shot shift releases after each character; CapsLock stays on
      if (isShiftActive) releaseShift()
    },
    [isUpperCase, isShiftActive, releaseShift],
  )

  const handleNumberKey = useCallback(
    (base: string, shift: string) => {
      // In letters mode: shift/caps makes number row show symbols
      // In numbers themselves — no case logic needed; symbols are explicit
      const char = isUpperCase ? shift : base
      insertAtCursor(char)
      setPreviewText(getActiveValue())
      if (isShiftActive) releaseShift()
    },
    [isUpperCase, isShiftActive, releaseShift],
  )

  const handleDelete = useCallback(() => {
    playKeySound("delete")
    deleteAtCursor()
    setPreviewText(getActiveValue())
  }, [])

  const handleClose = useCallback(() => {
    playKeySound("modifier")
    close()
  }, [close])

  if (!isOpen) return null

  const symRows = isSymbolsPage2 ? SYM_PAGE2 : SYM_PAGE1

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9000] flex justify-center px-2 pb-3 pt-2"
      style={{
        animation: "slide-up-enter 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
      role="dialog"
      aria-label="Virtual Keyboard"
      aria-modal="false"
    >
      <div className="relative w-full max-w-5xl bg-[#0d1420]/95 backdrop-blur-xl rounded-2xl border border-slate-700/40 shadow-[0_-8px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(107,157,254,0.08)] overflow-hidden">
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6b9dfe]/50 to-transparent" />

        <div className="relative z-10 p-3 md:p-4 flex flex-col gap-2">
          {/* ── Top bar ── */}
          <div className="flex items-center gap-2">
            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B0F17]/60 rounded-lg border border-slate-800/50 shrink-0">
              <Keyboard className="w-3.5 h-3.5 text-[#6b9dfe]" />
              <span className="text-[10px] font-bold text-[#6b9dfe] uppercase tracking-widest">
                Ishaara KB
              </span>
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            </div>

            {/* Modifier badges */}
            {isCapsLock && (
              <div className="flex items-center gap-1 px-2 py-1 bg-violet-900/30 border border-violet-700/40 rounded-md shrink-0">
                <Lock className="w-3 h-3 text-violet-400" />
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">
                  CAPS
                </span>
              </div>
            )}
            {isShiftActive && !isCapsLock && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-700/40 rounded-md shrink-0">
                <ArrowBigUp className="w-3 h-3 text-[#6b9dfe]" />
                <span className="text-[9px] font-bold text-[#6b9dfe] uppercase tracking-wider">
                  SHIFT
                </span>
              </div>
            )}
            {isSymbolsMode && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-900/30 border border-amber-700/40 rounded-md shrink-0">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  SYM {isSymbolsPage2 ? "P2" : "P1"}
                </span>
              </div>
            )}

            {/* Preview */}
            <div className="flex-1 flex items-center bg-[#060a12] border border-slate-800/60 rounded-xl px-3 py-2 min-h-[40px] shadow-inner overflow-hidden">
              <span className="flex-1 font-mono text-emerald-400 text-sm break-all tracking-wide truncate">
                {previewText ? (
                  previewText
                ) : (
                  <span className="text-slate-600 italic text-xs font-sans">
                    Click or focus an input, then type...
                  </span>
                )}
                <span
                  className="inline-block w-[2px] h-4 bg-[#6b9dfe] ml-0.5 align-middle rounded-full"
                  style={{ animation: "cursor-blink 1s step-end infinite" }}
                />
              </span>
            </div>

            {/* Close — uses onMouseDown too so close doesn't flicker */}
            <button
              onMouseDown={preventFocusTheft}
              onClick={handleClose}
              aria-label="Close keyboard"
              className="p-2.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-xl border border-red-900/30 hover:border-red-700/50 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Numbers row (letters mode) ── */}
          {!isSymbolsMode && (
            <div className="flex gap-1 w-full justify-center">
              {NUMBERS_ROW.map(({ base, shift }, i) => (
                <CharKey
                  key={base}
                  display={isUpperCase ? shift : base}
                  subLabel={isUpperCase ? base : shift}
                  onClick={() => {
                    playKeySound("char")
                    handleNumberKey(base, shift)
                  }}
                  style={{
                    animation: `key-stagger-in 0.28s cubic-bezier(0.16,1,0.3,1) ${i * 12}ms both`,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Letter rows ── */}
          {!isSymbolsMode && (
            <div className="flex flex-col gap-1 items-center">
              {QWERTY_ROWS.map((row, ri) => (
                <div
                  key={`lr-${ri}`}
                  className="flex gap-1 w-full justify-center"
                >
                  {/* Shift key — left side of row 3 */}
                  {ri === 2 && (
                    <ModKey
                      onClick={() => {
                        playKeySound("modifier")
                        tapShift()
                      }}
                      isActive={isShiftActive || isCapsLock}
                      isCaps={isCapsLock}
                      ariaLabel={
                        isCapsLock
                          ? "CapsLock on (tap to turn off)"
                          : isShiftActive
                            ? "Shift active (tap to cancel)"
                            : "Shift — double-tap for CapsLock"
                      }
                      wide
                    >
                      {isCapsLock ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-[10px]">CAPS</span>
                        </>
                      ) : (
                        <ArrowBigUp className="w-5 h-5" />
                      )}
                    </ModKey>
                  )}

                  {row.map((key, ki) => (
                    <CharKey
                      key={key}
                      display={
                        isUpperCase ? key.toUpperCase() : key.toLowerCase()
                      }
                      onClick={() => {
                        playKeySound("char")
                        handleChar(key)
                      }}
                      style={{
                        animation: `key-stagger-in 0.28s cubic-bezier(0.16,1,0.3,1) ${ri * 8 + ki * 16 + 60}ms both`,
                      }}
                    />
                  ))}

                  {/* Backspace — right side of row 3 */}
                  {ri === 2 && (
                    <ModKey
                      onClick={handleDelete}
                      isActive={false}
                      ariaLabel="Backspace"
                      wide
                    >
                      <Delete className="w-5 h-5" />
                    </ModKey>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Symbol rows ── */}
          {isSymbolsMode && (
            <div className="flex flex-col gap-1 items-center">
              {symRows.map((row, ri) => (
                <div
                  key={`sr-${ri}`}
                  className="flex gap-1 w-full justify-center"
                >
                  {row.map((key, ki) => (
                    <CharKey
                      key={`${ri}-${ki}`}
                      display={key}
                      onClick={() => {
                        playKeySound("char")
                        insertAtCursor(key)
                        setPreviewText(getActiveValue())
                      }}
                      style={{
                        animation: `key-stagger-in 0.22s cubic-bezier(0.16,1,0.3,1) ${ki * 15 + ri * 35}ms both`,
                      }}
                    />
                  ))}
                  {/* Backspace on last row of symbols */}
                  {ri === symRows.length - 1 && (
                    <ModKey
                      onClick={handleDelete}
                      isActive={false}
                      ariaLabel="Backspace"
                    >
                      <Delete className="w-4 h-4" />
                    </ModKey>
                  )}
                </div>
              ))}

              {/* Page 1 / Page 2 toggle */}
              <button
                onMouseDown={preventFocusTheft}
                onClick={() => {
                  playKeySound("modifier")
                  toggleSymbolsPage()
                }}
                aria-label={
                  isSymbolsPage2
                    ? "Back to symbols page 1"
                    : "More symbols — page 2"
                }
                className="mt-1 flex items-center gap-1.5 px-4 py-1.5 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/30 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                {isSymbolsPage2 ? (
                  <>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                    Page 1
                  </>
                ) : (
                  <>
                    Page 2<ChevronRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Bottom row ── */}
          <div className="flex gap-1 w-full justify-center items-center">
            {/* Symbols toggle */}
            <button
              onMouseDown={preventFocusTheft}
              onClick={() => {
                playKeySound("modifier")
                toggleSymbols()
              }}
              aria-label={
                isSymbolsMode ? "Switch to letters" : "Switch to symbols"
              }
              aria-pressed={isSymbolsMode}
              className={`h-11 px-3 rounded-xl flex items-center justify-center gap-1 border text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                isSymbolsMode
                  ? "bg-[#6b9dfe]/20 border-[#6b9dfe]/40 text-[#6b9dfe]"
                  : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
              }`}
            >
              {isSymbolsMode ? "ABC" : "!#1"}
            </button>

            {/* CapsLock dedicated button (letters mode only) */}
            {!isSymbolsMode && (
              <ModKey
                onClick={() => {
                  playKeySound("modifier")
                  toggleCapsLock()
                }}
                isActive={isCapsLock}
                isCaps={isCapsLock}
                ariaLabel={
                  isCapsLock
                    ? "CapsLock ON — tap to turn off"
                    : "CapsLock — tap to turn on"
                }
              >
                <Lock className="w-4 h-4" />
              </ModKey>
            )}

            {/* Space */}
            <button
              onMouseDown={preventFocusTheft}
              onClick={() => {
                playKeySound("space")
                insertAtCursor(" ")
                setPreviewText(getActiveValue())
              }}
              aria-label="Space"
              className="flex-1 h-11 bg-slate-800/40 hover:bg-[#6b9dfe]/15 active:scale-95 rounded-xl border border-slate-700/30 hover:border-[#6b9dfe]/30 text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.25em] uppercase transition-all"
            >
              <Space className="w-4 h-4 opacity-40" />
              Space
            </button>

            {/* Enter */}
            <button
              onMouseDown={preventFocusTheft}
              onClick={() => {
                playKeySound("enter")
                pressEnterAtCursor()
              }}
              aria-label="Enter"
              className="h-11 px-4 bg-[#6b9dfe]/20 hover:bg-[#6b9dfe]/35 active:scale-95 rounded-xl flex items-center justify-center gap-1.5 border border-[#6b9dfe]/30 hover:border-[#6b9dfe]/60 text-[#6b9dfe] hover:text-white text-xs font-bold uppercase tracking-wider transition-all shrink-0"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              Enter
            </button>
          </div>
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee]/30 to-transparent" />
      </div>
    </div>
  )
}
