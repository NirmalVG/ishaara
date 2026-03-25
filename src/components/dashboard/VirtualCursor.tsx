"use client"

import { useEffect, useState, useRef } from "react"

import { handTracker } from "@/lib/handTracking"

import { gestureEngine } from "@/lib/gestureEngine"

import { useSettingsStore } from "@/store/useSettingStore"

import { isMobileDevice } from "@/utils/isMobile"

export default function VirtualCursor() {
  const [isClicking, setIsClicking] = useState(false)

  const [clipboardAction, setClipboardAction] = useState<
    "Copied!" | "Pasted!" | null
  >(null)

  const cursorRef = useRef<HTMLDivElement>(null)

  const wasClickingRef = useRef(false)

  const fistStartTimeRef = useRef<number>(0)

  const gestureCooldownRef = useRef<number>(0)

  const lastClipboardActionTimeRef = useRef<number>(0)

  // ✨ SCROLL REFS ✨

  const scrollAnchorRef = useRef<number | null>(null)

  const lastTwoFingersTimeRef = useRef<number>(0) // Memory timer for the flicker bug

  const lastFrameTimeRef = useRef<number>(0)

  const smoothedAiRef = useRef({ x: 0, y: 0 })

  const currentPhysicsPos = useRef({ x: -100, y: -100 })

  const hasInitializedPos = useRef(false)

  const lockedPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isMobileDevice()) return

    let animationFrameId: number

    lastFrameTimeRef.current = performance.now()

    if (!hasInitializedPos.current) {
      currentPhysicsPos.current = {
        x: window.innerWidth / 2,

        y: window.innerHeight / 2,
      }

      hasInitializedPos.current = true
    }

    const simulateClick = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y)

      if (element && element instanceof HTMLElement) {
        element.click()

        console.log("🎯 SYNTHETIC CLICK FIRED ON:", element.tagName)
      }
    }

    const updatePhysicsLoop = (currentTime: number) => {
      const dt = Math.min(currentTime - lastFrameTimeRef.current, 32)

      lastFrameTimeRef.current = currentTime

      const fpsMultiplier = dt / 16.666

      const { cursorSpeed, cursorSmoothing } = useSettingsStore.getState()

      const latestResults = handTracker.getLastKnownResults()

      if (latestResults && latestResults.landmarks.length > 0) {
        const hand = latestResults.landmarks[0]

        const indexTip = hand[8]

        const currentGesture = gestureEngine.detectGesture(hand)

        const isPinching = currentGesture === "Pinch"

        const rawFocusX = indexTip.x

        const rawFocusY = indexTip.y

        if (smoothedAiRef.current.x === 0) {
          smoothedAiRef.current = { x: rawFocusX, y: rawFocusY }
        }

        // --- POSITION LOCKING ON CLICK ---

        if (isPinching && !wasClickingRef.current) {
          lockedPosRef.current = {
            x: currentPhysicsPos.current.x,

            y: currentPhysicsPos.current.y,
          }

          simulateClick(lockedPosRef.current.x, lockedPosRef.current.y)
        }

        // --- LAYER 1: AI MICRO-JITTER FILTER ---

        const aiLerp = isPinching ? 1.0 : 0.4 * fpsMultiplier

        smoothedAiRef.current.x +=
          (rawFocusX - smoothedAiRef.current.x) * aiLerp

        smoothedAiRef.current.y +=
          (rawFocusY - smoothedAiRef.current.y) * aiLerp

        // --- CALCULATE TARGET ---

        let targetX, targetY

        if (isPinching) {
          targetX = lockedPosRef.current.x

          targetY = lockedPosRef.current.y
        } else {
          const rawTargetX =
            (1 - smoothedAiRef.current.x - 0.5) * cursorSpeed + 0.5

          const rawTargetY = (smoothedAiRef.current.y - 0.5) * cursorSpeed + 0.5

          targetX = rawTargetX * window.innerWidth

          targetY = rawTargetY * window.innerHeight
        }

        // --- LAYER 2: DYNAMIC VELOCITY PHYSICS ---

        const dx = targetX - currentPhysicsPos.current.x

        const dy = targetY - currentPhysicsPos.current.y

        const distanceToTarget = Math.sqrt(dx * dx + dy * dy)

        const minLerp = (1 - cursorSmoothing) * 0.12

        const speedBoost = Math.min(distanceToTarget / 800, 0.4)

        let activeLerp = minLerp + speedBoost

        activeLerp = Math.min(activeLerp, 1.0) * fpsMultiplier

        if (isPinching) activeLerp = 1.0

        currentPhysicsPos.current.x += dx * activeLerp

        currentPhysicsPos.current.y += dy * activeLerp

        // --- INSTANT DOM UPDATE ---

        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${currentPhysicsPos.current.x}px, ${currentPhysicsPos.current.y}px, 0)`
        }

        // --- GESTURE ACTIONS ---

        const now = performance.now()

        // 1. Two-Finger Scroll (✨ ANCHOR MEMORY MODE ✨)

        if (currentGesture === "TwoFingers") {
          lastTwoFingersTimeRef.current = now // Update our memory timer

          if (scrollAnchorRef.current === null) {
            scrollAnchorRef.current = rawFocusY
          } else {
            const deltaY = rawFocusY - scrollAnchorRef.current

            let scrollVelocity = 0

            if (deltaY > 0.04) {
              scrollVelocity = (deltaY - 0.04) * 400 * fpsMultiplier
            } else if (deltaY < -0.04) {
              scrollVelocity = (deltaY + 0.04) * 400 * fpsMultiplier
            }

            if (Math.abs(scrollVelocity) > 1) {
              const scrollContainer = document.getElementById(
                "main-scroll-container",
              )

              if (scrollContainer) {
                scrollContainer.scrollBy({
                  top: Math.round(scrollVelocity),

                  behavior: "auto",
                })
              } else {
                window.scrollBy({
                  top: Math.round(scrollVelocity),

                  behavior: "auto",
                })
              }
            }
          }
        } else {
          // THE FIX: Only clear the anchor if the camera hasn't seen the gesture for 300ms

          if (now - lastTwoFingersTimeRef.current > 300) {
            scrollAnchorRef.current = null
          }
        }

        // 2. Fist to Keyboard

        if (currentGesture === "Fist") {
          if (fistStartTimeRef.current === 0) {
            fistStartTimeRef.current = now
          } else if (
            now - fistStartTimeRef.current > 2000 &&
            now - gestureCooldownRef.current > 3000
          ) {
            const store = useSettingsStore.getState()

            store.setKeyboardOpen(!store.isKeyboardOpen)

            fistStartTimeRef.current = 0

            gestureCooldownRef.current = now
          }
        } else {
          fistStartTimeRef.current = 0
        }

        // 3. Peace Sign to Copy

        if (
          currentGesture === "Peace" &&
          now - lastClipboardActionTimeRef.current > 2000
        ) {
          try {
            const selectedText = window.getSelection()?.toString()

            if (selectedText) {
              navigator.clipboard.writeText(selectedText)

              setClipboardAction("Copied!")

              setTimeout(() => setClipboardAction(null), 1500)
            }
          } catch (err) {}

          lastClipboardActionTimeRef.current = now
        }

        // 4. Thumbs Up to Paste

        if (
          currentGesture === "ThumbsUp" &&
          now - lastClipboardActionTimeRef.current > 2000
        ) {
          try {
            navigator.clipboard.readText().then((text) => {
              const activeElement = document.activeElement

              if (
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement
              ) {
                const start = activeElement.selectionStart || 0

                const end = activeElement.selectionEnd || 0

                activeElement.setRangeText(text, start, end, "end")

                setClipboardAction("Pasted!")

                setTimeout(() => setClipboardAction(null), 1500)
              }
            })
          } catch (err) {}

          lastClipboardActionTimeRef.current = now
        }

        if (isPinching !== wasClickingRef.current) {
          setIsClicking(isPinching)

          wasClickingRef.current = isPinching
        }
      }

      animationFrameId = requestAnimationFrame(updatePhysicsLoop)
    }

    animationFrameId = requestAnimationFrame(updatePhysicsLoop)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: `translate3d(-100px, -100px, 0)`,

        willChange: "transform",
      }}
    >
      <div
        className={`absolute -left-4 -top-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 ease-out origin-center ${
          isClicking
            ? "bg-[#6B9DFE] border-2 border-white scale-75"
            : "bg-white/30 border border-white/50 backdrop-blur-md scale-100"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${isClicking ? "bg-white" : "bg-white/90"}`}
        />
      </div>

      {clipboardAction && (
        <div className="absolute top-6 left-6 bg-[#6B9DFE] text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(107,157,254,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
          {clipboardAction}
        </div>
      )}
    </div>
  )
}
