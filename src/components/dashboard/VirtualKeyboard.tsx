"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  X,
  Delete,
  CornerDownLeft,
  Space,
  ChevronUp,
  Globe,
  ArrowBigUp,
  Lock,
  Hash,
  Keyboard as KeyboardIcon,
} from "lucide-react"
import { useKeyboardStore } from "@/store/useKeyboardStore"
import {
  insertAtCursor,
  deleteAtCursor,
  pressEnterAtCursor,
  preventFocusTheft,
  getActiveValue,
} from "@/lib/keyboardDispatch"

/* ═══════════════════════════════════════════════════════════════════════════════
   LAYOUT DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════════════ */

const QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
]

const SYMBOLS_PAGE1 = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""],
  [".", ",", "?", "!", "'", "#", "%", "^"],
]

const SYMBOLS_PAGE2 = [
  ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
  ["_", "\\", "|", "~", "<", ">", "€", "£", "¥", "•"],
  [".", ",", "?", "!", "'", "&", "@", "°"],
]

/* ═══════════════════════════════════════════════════════════════════════════════
   KEY COMPONENT — Individual key with ripple effect + glassmorphism
   ═══════════════════════════════════════════════════════════════════════════════ */

interface KeyProps {
  label: string
  display?: React.ReactNode
  onPress: () => void
  className?: string
  /** Flex grow factor (1 = normal, 1.5 = wider, etc.) */
  flex?: number
  /** Stagger animation delay in ms */
  delay?: number
  /** Active/toggled state for shift/caps/symbols */
  active?: boolean
  /** Accent color variant */
  variant?: "default" | "action" | "primary" | "danger"
}

function Key({
  label,
  display,
  onPress,
  className = "",
  flex = 1,
  delay = 0,
  active = false,
  variant = "default",
}: KeyProps) {
  const keyRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(() => {
    onPress()

    // Spawn ripple
    const btn = keyRef.current
    if (!btn) return
    const ripple = document.createElement("span")
    ripple.className = "ripple"
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.2
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${rect.width / 2 - size / 2}px`
    ripple.style.top = `${rect.height / 2 - size / 2}px`
    btn.appendChild(ripple)
    ripple.addEventListener("animationend", () => ripple.remove())
  }, [onPress])

  const variantClasses = {
    default: `
      bg-white/[0.06] border-white/[0.08] text-slate-200
      hover:bg-white/[0.12] hover:border-white/[0.15] hover:text-white
      hover:shadow-[0_0_20px_rgba(107,157,254,0.15)]
      active:bg-white/[0.18]
    `,
    action: `
      bg-slate-500/[0.15] border-slate-400/[0.12] text-slate-300
      hover:bg-slate-400/[0.2] hover:border-slate-400/[0.2] hover:text-white
      hover:shadow-[0_0_15px_rgba(148,163,184,0.15)]
      active:bg-slate-400/[0.25]
    `,
    primary: `
      bg-[#6b9dfe]/20 border-[#6b9dfe]/30 text-[#8bb4ff]
      hover:bg-[#6b9dfe]/30 hover:border-[#6b9dfe]/40 hover:text-white
      hover:shadow-[0_0_25px_rgba(107,157,254,0.3)]
      active:bg-[#6b9dfe]/40
    `,
    danger: `
      bg-rose-500/[0.12] border-rose-500/[0.15] text-rose-400
      hover:bg-rose-500/[0.2] hover:border-rose-500/[0.25] hover:text-rose-300
      hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]
      active:bg-rose-500/[0.3]
    `,
  }

  return (
    <button
      ref={keyRef}
      type="button"
      aria-label={label}
      onMouseDown={preventFocusTheft}
      onClick={handleClick}
      className={`
        kb-key relative overflow-hidden
        backdrop-blur-xl border rounded-xl
        font-medium select-none cursor-pointer
        transition-all duration-150 ease-out
        ${variantClasses[variant]}
        ${active ? "!bg-[#6b9dfe]/25 !border-[#6b9dfe]/40 !text-[#8bb4ff] shadow-[0_0_20px_rgba(107,157,254,0.25)]" : ""}
        ${className}
      `}
      style={{
        flex,
        minHeight: 48,
        animationDelay: `${delay}ms`,
        animation: "key-stagger-in 0.3s cubic-bezier(0.23, 1, 0.32, 1) backwards",
      }}
    >
      {display ?? (
        <span className="text-[15px] tracking-wide pointer-events-none relative z-10">
          {label}
        </span>
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   VIRTUAL KEYBOARD — Main Component
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function VirtualKeyboard() {
  const isOpen = useKeyboardStore((s) => s.isOpen)
  const isShiftActive = useKeyboardStore((s) => s.isShiftActive)
  const isCapsLock = useKeyboardStore((s) => s.isCapsLock)
  const isSymbolsMode = useKeyboardStore((s) => s.isSymbolsMode)
  const isSymbolsPage2 = useKeyboardStore((s) => s.isSymbolsPage2)
  const close = useKeyboardStore((s) => s.close)
  const tapShift = useKeyboardStore((s) => s.tapShift)
  const toggleSymbols = useKeyboardStore((s) => s.toggleSymbols)
  const toggleSymbolsPage = useKeyboardStore((s) => s.toggleSymbolsPage)
  const releaseShift = useKeyboardStore((s) => s.releaseShift)

  const [preview, setPreview] = useState("")
  const [lastKey, setLastKey] = useState<string | null>(null)
  const previewIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll the active input's value for the live preview bar
  useEffect(() => {
    if (!isOpen) {
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current)
        previewIntervalRef.current = null
      }
      return
    }
    previewIntervalRef.current = setInterval(() => {
      setPreview(getActiveValue())
    }, 120)
    return () => {
      if (previewIntervalRef.current) clearInterval(previewIntervalRef.current)
    }
  }, [isOpen])

  // Flash last key pressed for visual feedback
  const flashKey = useCallback((key: string) => {
    setLastKey(key)
    setTimeout(() => setLastKey(null), 400)
  }, [])

  const handleChar = useCallback(
    (char: string) => {
      const shouldUpper = isShiftActive || isCapsLock
      const finalChar = shouldUpper ? char.toUpperCase() : char.toLowerCase()
      insertAtCursor(finalChar)
      releaseShift()
      flashKey(char)
    },
    [isShiftActive, isCapsLock, releaseShift, flashKey],
  )

  const handleBackspace = useCallback(() => {
    deleteAtCursor()
    flashKey("⌫")
  }, [flashKey])

  const handleEnter = useCallback(() => {
    pressEnterAtCursor()
    flashKey("↵")
  }, [flashKey])

  const handleSpace = useCallback(() => {
    insertAtCursor(" ")
    releaseShift()
    flashKey("␣")
  }, [releaseShift, flashKey])

  if (!isOpen) return null

  const shouldUpper = isShiftActive || isCapsLock

  // Pick the right layout based on mode
  const rows = isSymbolsMode
    ? isSymbolsPage2
      ? SYMBOLS_PAGE2
      : SYMBOLS_PAGE1
    : QWERTY_ROWS

  let keyIndex = 0

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9998] flex justify-center pointer-events-none"
      role="dialog"
      aria-label="Virtual Keyboard"
    >
      <div
        className="
          pointer-events-auto w-full max-w-[780px] mx-4 mb-4
          bg-[#0c1220]/70 backdrop-blur-2xl
          border border-white/[0.08]
          rounded-3xl overflow-hidden
          shadow-[0_-8px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(107,157,254,0.08)]
          relative
        "
        style={{
          animation:
            "slide-up-enter 0.35s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        }}
      >
        {/* ── Holographic top edge glow ── */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6b9dfe]/50 to-transparent" />
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#6b9dfe]/30 to-transparent blur-sm" />

        {/* ── Ambient corner glows ── */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#6b9dfe]/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#22d3ee]/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* ── Scanline overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015] z-[1]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(107, 157, 254, 0.3) 2px,
              rgba(107, 157, 254, 0.3) 4px
            )`,
          }}
        />

        {/* ════════════ HEADER BAR ════════════ */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
          {/* Preview / status */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <KeyboardIcon className="w-3.5 h-3.5 text-[#6b9dfe]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Ishaara
              </span>
            </div>

            <div className="h-4 w-[1px] bg-white/[0.06]" />

            {/* Live preview */}
            <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono truncate max-w-[300px]">
                {preview || (
                  <span className="text-slate-600 italic">
                    Focus an input to start typing...
                  </span>
                )}
              </span>
              <span
                className="w-[2px] h-3.5 bg-[#6b9dfe] rounded-full"
                style={{ animation: "cursor-blink 1s step-end infinite" }}
              />
            </div>
          </div>

          {/* Mode indicators + close */}
          <div className="flex items-center gap-2 ml-3">
            {isCapsLock && (
              <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/20 rounded-lg px-2 py-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  Caps
                </span>
              </div>
            )}

            {lastKey && (
              <div
                className="bg-[#6b9dfe]/15 border border-[#6b9dfe]/25 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#8bb4ff] tracking-wide"
                style={{ animation: "fade-in 0.1s ease" }}
              >
                {lastKey}
              </div>
            )}

            <button
              type="button"
              onClick={close}
              onMouseDown={preventFocusTheft}
              className="
                p-2 rounded-xl
                bg-white/[0.04] border border-white/[0.06]
                hover:bg-rose-500/15 hover:border-rose-500/25
                text-slate-500 hover:text-rose-400
                transition-all duration-200
              "
              aria-label="Close keyboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ════════════ KEY ROWS ════════════ */}
        <div className="relative z-10 flex flex-col gap-[6px] px-3 pb-3 pt-1">
          {rows.map((row, rowIdx) => {
            const isLastCharRow = rowIdx === rows.length - 1

            return (
              <div key={rowIdx} className="flex gap-[5px] justify-center">
                {/* Shift / Symbols-page toggle on last letter row */}
                {isLastCharRow && !isSymbolsMode && (
                  <Key
                    label="Shift"
                    display={
                      <div className="flex items-center justify-center relative z-10">
                        {isCapsLock ? (
                          <ArrowBigUp className="w-5 h-5 fill-current" />
                        ) : (
                          <ChevronUp
                            className={`w-5 h-5 ${isShiftActive ? "stroke-[3]" : ""}`}
                          />
                        )}
                      </div>
                    }
                    onPress={tapShift}
                    flex={1.4}
                    active={isShiftActive || isCapsLock}
                    variant="action"
                    delay={keyIndex++ * 12}
                  />
                )}

                {isLastCharRow && isSymbolsMode && (
                  <Key
                    label={isSymbolsPage2 ? "1/2" : "2/2"}
                    display={
                      <span className="text-xs font-bold relative z-10">
                        {isSymbolsPage2 ? "1/2" : "2/2"}
                      </span>
                    }
                    onPress={toggleSymbolsPage}
                    flex={1.4}
                    variant="action"
                    delay={keyIndex++ * 12}
                  />
                )}

                {/* Character keys */}
                {row.map((char) => (
                  <Key
                    key={char}
                    label={char}
                    display={
                      <span className="text-[15px] tracking-wide pointer-events-none relative z-10">
                        {!isSymbolsMode && shouldUpper
                          ? char.toUpperCase()
                          : char}
                      </span>
                    }
                    onPress={() => handleChar(char)}
                    delay={keyIndex++ * 12}
                  />
                ))}

                {/* Backspace on last letter row */}
                {isLastCharRow && (
                  <Key
                    label="Backspace"
                    display={
                      <Delete className="w-5 h-5 relative z-10" />
                    }
                    onPress={handleBackspace}
                    flex={1.4}
                    variant="danger"
                    delay={keyIndex++ * 12}
                  />
                )}
              </div>
            )
          })}

          {/* ── Bottom row: Symbols toggle / Space / Enter ── */}
          <div className="flex gap-[5px]">
            <Key
              label={isSymbolsMode ? "ABC" : "123"}
              display={
                <div className="flex items-center gap-1.5 relative z-10">
                  {isSymbolsMode ? (
                    <KeyboardIcon className="w-4 h-4" />
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold">
                    {isSymbolsMode ? "ABC" : "123"}
                  </span>
                </div>
              }
              onPress={toggleSymbols}
              flex={1.5}
              variant="action"
              active={isSymbolsMode}
              delay={keyIndex++ * 12}
            />

            <Key
              label="Globe"
              display={<Globe className="w-4 h-4 relative z-10" />}
              onPress={() => {}}
              flex={0.8}
              variant="action"
              delay={keyIndex++ * 12}
            />

            <Key
              label="Space"
              display={
                <div className="flex items-center gap-2 relative z-10">
                  <Space className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-400 font-medium tracking-wider">
                    space
                  </span>
                </div>
              }
              onPress={handleSpace}
              flex={4}
              delay={keyIndex++ * 12}
            />

            <Key
              label="Enter"
              display={
                <div className="flex items-center gap-1.5 relative z-10">
                  <CornerDownLeft className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-wide">
                    return
                  </span>
                </div>
              }
              onPress={handleEnter}
              flex={1.8}
              variant="primary"
              delay={keyIndex++ * 12}
            />
          </div>
        </div>

        {/* ── Bottom holographic edge ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    </div>
  )
}
