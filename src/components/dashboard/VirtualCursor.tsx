"use client"

import { useEffect, useState, useRef } from "react"
import { handTracker } from "@/lib/handTracking"
import { gestureEngine } from "@/lib/gestureEngine"
import { useSettingsStore } from "@/store/useSettingStore"
import { isMobileDevice } from "@/utils/isMobile"

export default function VirtualCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isClicking, setIsClicking] = useState(false)

  const wasClickingRef = useRef(false)

  // Store the "current" physical position outside of React state
  // so the 60fps physics loop can run incredibly fast without stuttering
  const currentPhysicsPos = useRef({ x: 0, y: 0 })
  const hasInitializedPos = useRef(false)

  useEffect(() => {
    if (isMobileDevice()) return
    let animationFrameId: number

    // Initialize cursor to the center of the screen on first load
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
        console.log(
          "🎯 SYNTHETIC CLICK FIRED ON:",
          element.tagName,
          element.className,
        )
      }
    }

    const updatePhysicsLoop = () => {
      // Fetch the live settings directly from our Global Brain (Zustand)
      const { cursorSpeed, cursorSmoothing } = useSettingsStore.getState()

      const latestResults = handTracker.getLastKnownResults()

      if (latestResults && latestResults.landmarks.length > 0) {
        const hand = latestResults.landmarks[0]
        const indexFinger = hand[8]
        const thumbTip = hand[4]

        // 1. THE MIDPOINT FIX
        // Calculate the exact center between your thumb and index finger
        const focusX = (indexFinger.x + thumbTip.x) / 2
        const focusY = (indexFinger.y + thumbTip.y) / 2

        // 2. Calculate the Target (Apply Speed Multiplier & Center Anchor)
        const rawTargetX = (1 - focusX - 0.5) * cursorSpeed + 0.5
        const rawTargetY = (focusY - 0.5) * cursorSpeed + 0.5

        const targetX = rawTargetX * window.innerWidth
        const targetY = rawTargetY * window.innerHeight

        // 3. LINEAR INTERPOLATION (The Magic Glide)
        const lerpFactor = 1 - cursorSmoothing

        currentPhysicsPos.current.x +=
          (targetX - currentPhysicsPos.current.x) * lerpFactor
        currentPhysicsPos.current.y +=
          (targetY - currentPhysicsPos.current.y) * lerpFactor

        // Update the visual dot
        setPosition({
          x: currentPhysicsPos.current.x,
          y: currentPhysicsPos.current.y,
        })

        // 4. Gesture Processing (Clicking)
        const currentGesture = gestureEngine.detectGesture(hand)
        const isPinching = currentGesture === "Pinch"

        // If pinching NOW, but weren't a millisecond ago -> CLICK!
        if (isPinching && !wasClickingRef.current) {
          simulateClick(
            currentPhysicsPos.current.x,
            currentPhysicsPos.current.y,
          )
        }

        wasClickingRef.current = isPinching
        setIsClicking(isPinching)
      }

      // Loop endlessly as fast as your monitor allows
      animationFrameId = requestAnimationFrame(updatePhysicsLoop)
    }

    updatePhysicsLoop()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] flex items-center justify-center shadow-lg ${
        isClicking
          ? "bg-[#6B9DFE] border-2 border-white scale-75"
          : "bg-white/30 border border-white/50 backdrop-blur-md"
      }`}
      style={{
        transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
        willChange: "transform", // Hardware acceleration hint for the browser
      }}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${isClicking ? "bg-white" : "bg-white/90"}`}
      />
    </div>
  )
}
