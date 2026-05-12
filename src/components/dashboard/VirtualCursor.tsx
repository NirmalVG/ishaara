"use client"

import { useEffect, useRef, useState } from "react"
import { handTracker } from "@/lib/handTracking"
import { gestureEngine } from "@/lib/gestureEngine"
import { useInputSettings } from "@/store/useInputSettings"
import { useKeyboardStore } from "@/store/useKeyboardStore"
import { isMobileDevice } from "@/utils/isMobile"

export default function VirtualCursor() {
  const [isClicking, setIsClicking] = useState(false)
  const [clipboardAction, setClipboardAction] = useState<
    "Copied!" | "Pasted!" | null
  >(null)

  const cursorRef = useRef<HTMLDivElement>(null)
  const wasClickingRef = useRef(false)
  const fistStartTimeRef = useRef(0)
  const fistDropTimeRef = useRef(0)
  const gestureCooldownRef = useRef(0)
  const lastClipboardActionTimeRef = useRef(0)
  const prevFocusYRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef(0)
  const smoothedAiRef = useRef({ x: 0, y: 0 })
  const currentPhysicsPos = useRef({ x: -100, y: -100 })
  const hasInitializedPos = useRef(false)
  const lockedPosRef = useRef({ x: 0, y: 0 })

  const settingsRef = useRef({
    cursorSpeed: useInputSettings.getState().cursorSpeed,
    cursorSmoothing: useInputSettings.getState().cursorSmoothing,
  })

  useEffect(() => {
    if (isMobileDevice()) return

    const unsubscribeSettings = useInputSettings.subscribe((state) => {
      settingsRef.current.cursorSpeed = state.cursorSpeed
      settingsRef.current.cursorSmoothing = state.cursorSmoothing
    })

    if (!hasInitializedPos.current) {
      currentPhysicsPos.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
      hasInitializedPos.current = true
    }

    lastFrameTimeRef.current = performance.now()
    let animationFrameId: number

    const simulateClick = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y)
      if (element instanceof HTMLElement) {
        element.click()
      }
    }

    const showClipboardAction = (action: "Copied!" | "Pasted!") => {
      setClipboardAction(action)
      window.setTimeout(() => setClipboardAction(null), 1500)
    }

    const loop = (currentTime: number) => {
      const dt = Math.min(currentTime - lastFrameTimeRef.current, 32)
      lastFrameTimeRef.current = currentTime
      const fpsMultiplier = dt / 16.666
      const { cursorSpeed, cursorSmoothing } = settingsRef.current
      const latestResults = handTracker.getLastKnownResults()

      if (latestResults?.landmarks.length) {
        const hand = latestResults.landmarks[0]
        const indexTip = hand[8]
        const currentGesture = gestureEngine.detectGesture(hand)
        handTracker.lastDetectedGesture = currentGesture

        const isPinching = currentGesture === "Pinch"
        const rawFocusX = indexTip.x
        const rawFocusY = indexTip.y

        if (smoothedAiRef.current.x === 0) {
          smoothedAiRef.current = { x: rawFocusX, y: rawFocusY }
        }

        if (isPinching && !wasClickingRef.current) {
          lockedPosRef.current = { ...currentPhysicsPos.current }
          simulateClick(lockedPosRef.current.x, lockedPosRef.current.y)
        }

        const aiLerp = isPinching ? 1 : 0.25 * fpsMultiplier
        smoothedAiRef.current.x += (rawFocusX - smoothedAiRef.current.x) * aiLerp
        smoothedAiRef.current.y += (rawFocusY - smoothedAiRef.current.y) * aiLerp

        const targetX = isPinching
          ? lockedPosRef.current.x
          : ((1 - smoothedAiRef.current.x - 0.5) * cursorSpeed + 0.5) *
            window.innerWidth
        const targetY = isPinching
          ? lockedPosRef.current.y
          : ((smoothedAiRef.current.y - 0.5) * cursorSpeed + 0.5) *
            window.innerHeight

        const dx = targetX - currentPhysicsPos.current.x
        const dy = targetY - currentPhysicsPos.current.y
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy)
        const minLerp = (1 - cursorSmoothing) * 0.22
        const normalizedDist = Math.min(distanceToTarget / 600, 1)
        const speedBoost = Math.pow(normalizedDist, 1.5) * 0.5
        let activeLerp = Math.min(minLerp + speedBoost, 0.95) * fpsMultiplier
        if (isPinching) activeLerp = 1

        currentPhysicsPos.current.x += dx * activeLerp
        currentPhysicsPos.current.y += dy * activeLerp

        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${currentPhysicsPos.current.x}px, ${currentPhysicsPos.current.y}px, 0)`
        }

        const now = performance.now()

        if (currentGesture === "TwoFingers") {
          if (prevFocusYRef.current !== null) {
            const velocityY = (rawFocusY - prevFocusYRef.current) * 60
            const scrollVelocity = velocityY * 1000 * fpsMultiplier
            if (Math.abs(scrollVelocity) > 0.5) {
              document
                .getElementById("main-scroll-container")
                ?.scrollBy({ top: scrollVelocity, behavior: "auto" })
              window.scrollBy({ top: scrollVelocity, behavior: "auto" })
            }
          }
          prevFocusYRef.current = rawFocusY
        } else {
          prevFocusYRef.current = null
        }

        if (currentGesture === "Fist") {
          fistDropTimeRef.current = 0
          if (fistStartTimeRef.current === 0) {
            fistStartTimeRef.current = now
          } else if (
            now - fistStartTimeRef.current > 1500 &&
            now - gestureCooldownRef.current > 2000
          ) {
            useKeyboardStore.getState().toggle()
            fistStartTimeRef.current = 0
            gestureCooldownRef.current = now
          }
        } else if (fistStartTimeRef.current > 0) {
          if (fistDropTimeRef.current === 0) {
            fistDropTimeRef.current = now
          } else if (now - fistDropTimeRef.current > 300) {
            fistStartTimeRef.current = 0
            fistDropTimeRef.current = 0
          }
        }

        if (
          currentGesture === "Peace" &&
          now - lastClipboardActionTimeRef.current > 2000
        ) {
          const selectedText = window.getSelection()?.toString()
          if (selectedText) {
            navigator.clipboard
              .writeText(selectedText)
              .then(() => showClipboardAction("Copied!"))
              .catch(() => undefined)
          }
          lastClipboardActionTimeRef.current = now
        }

        if (
          currentGesture === "ThumbsUp" &&
          now - lastClipboardActionTimeRef.current > 2000
        ) {
          navigator.clipboard
            .readText()
            .then((text) => {
              const element = document.activeElement
              if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement
              ) {
                const start = element.selectionStart ?? 0
                const end = element.selectionEnd ?? 0
                element.setRangeText(text, start, end, "end")
                element.dispatchEvent(new Event("input", { bubbles: true }))
                showClipboardAction("Pasted!")
              }
            })
            .catch(() => undefined)
          lastClipboardActionTimeRef.current = now
        }

        if (isPinching !== wasClickingRef.current) {
          setIsClicking(isPinching)
          wasClickingRef.current = isPinching
        }
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
      unsubscribeSettings()
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className={`absolute -left-4 -top-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 ease-out origin-center ${
          isClicking
            ? "bg-[#6B9DFE] border-2 border-white scale-75"
            : "bg-white/30 border border-white/50 backdrop-blur-md scale-100"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
            isClicking ? "bg-white" : "bg-white/90"
          }`}
        />
      </div>

      {clipboardAction ? (
        <div className="absolute top-6 left-6 bg-[#6B9DFE] text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(107,157,254,0.5)] whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
          {clipboardAction}
        </div>
      ) : null}
    </div>
  )
}
