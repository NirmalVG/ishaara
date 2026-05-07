"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Hand,
  Loader2,
  MousePointerClick,
  ArrowUpDown,
  Keyboard,
  Copy,
  ThumbsUp,
  Cpu,
  ShieldCheck,
} from "lucide-react"
import { handTracker } from "@/lib/handTracking"
import type { GestureType } from "@/lib/gestureEngine"
import { DrawingUtils, HandLandmarker } from "@mediapipe/tasks-vision"
import { useInputSettings } from "@/store/useInputSettings"
import { isMobileDevice } from "@/utils/isMobile"

const GESTURE_LABELS: Record<GestureType, { label: string }> = {
  None: { label: "Move hand to begin" },
  Pinch: { label: "Click (Pinch)" },
  TwoFingers: { label: "Scrolling" },
  Fist: { label: "Hold for Keyboard" },
  Peace: { label: "Copy (Peace Sign)" },
  ThumbsUp: { label: "Paste (Thumbs Up)" },
}

function GestureIcon({ gesture }: { gesture: GestureType }) {
  const cls = "w-5 h-5"
  switch (gesture) {
    case "Pinch":
      return (
        <MousePointerClick className={`${cls} text-white animate-bounce`} />
      )
    case "TwoFingers":
      return <ArrowUpDown className={`${cls} text-cyan-400`} />
    case "Fist":
      return <Keyboard className={`${cls} text-amber-400`} />
    case "Peace":
      return <Copy className={`${cls} text-emerald-400`} />
    case "ThumbsUp":
      return <ThumbsUp className={`${cls} text-violet-400`} />
    default:
      return <Hand className={`${cls} text-[#6B9DFE]`} />
  }
}

/**
 * CameraCanvas — renders the webcam feed + MediaPipe landmark overlay.
 *
 * KEY CHANGE FROM ORIGINAL:
 * Previously this component called gestureEngine.detectGesture() itself to
 * display the gesture badge. VirtualCursor also called detectGesture() on the
 * same frame data. That was two computations per frame producing potentially
 * different results (race condition at 20fps).
 *
 * NOW: detectGesture() is called ONCE in VirtualCursor's rAF loop and the
 * result is cached on handTracker.lastDetectedGesture. This component reads
 * that cached value. Single computation, single source of truth.
 *
 * STREAM CLEANUP:
 * The MediaStream is captured in a closure variable (not a ref). React refs
 * are cleared before cleanup functions run in StrictMode. A closure variable
 * is guaranteed to be available when the cleanup executes.
 */
export default function CameraCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentGesture, setCurrentGesture] = useState<GestureType>("None")
  const [fps, setFps] = useState(0)
  const [latency, setLatency] = useState(0)

  const fpsFrames = useRef(0)
  const fpsLastTime = useRef(0)
  const showLandmarks = useInputSettings((s) => s.showLandmarks)

  const updateFps = useCallback(() => {
    fpsFrames.current++
    const now = performance.now()
    const delta = now - fpsLastTime.current
    if (delta >= 1000) {
      setFps(Math.round((fpsFrames.current * 1000) / delta))
      fpsFrames.current = 0
      fpsLastTime.current = now
    }
  }, [])

  useEffect(() => {
    if (isMobileDevice()) return

    let animationFrameId: number
    fpsLastTime.current = performance.now()
    // Closure-captured stream — survives StrictMode double-invoke cleanup
    let capturedStream: MediaStream | null = null

    async function startSystem() {
      await handTracker.initialize()
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 },
          },
        })
        capturedStream = stream // Capture in closure, not ref

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setIsReady(true)
            animationFrameId = requestAnimationFrame(renderLoop)
          }
        }
      } catch (error) {
        console.error("Camera access denied:", error)
      }
    }

    let lastVideoTime = -1
    let drawingUtils: DrawingUtils | null = null
    let lastAiRunTime = 0
    const AI_FPS_LIMIT = 1000 / 20

    const renderLoop = (currentTime: number = performance.now()) => {
      if (!videoRef.current || !canvasRef.current || !handTracker.isReady)
        return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(-1, 1)
      ctx.translate(-canvas.width, 0)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (
        currentTime - lastAiRunTime >= AI_FPS_LIMIT &&
        video.currentTime !== lastVideoTime
      ) {
        lastAiRunTime = currentTime
        lastVideoTime = video.currentTime

        const t0 = performance.now()
        const results = handTracker.detect(video, performance.now())
        const t1 = performance.now()
        setLatency(Math.round(t1 - t0))

        const detectedHands = results?.landmarks ?? []

        if (detectedHands.length > 0) {
          // Read the gesture computed by VirtualCursor's rAF loop.
          // If VirtualCursor hasn't run yet this frame, this falls back to
          // the previous frame's gesture — acceptable for a display badge.
          const detected = handTracker.lastDetectedGesture

          if (showLandmarks) {
            if (!drawingUtils) drawingUtils = new DrawingUtils(ctx)
            for (const landmarks of detectedHands) {
              drawingUtils.drawConnectors(
                landmarks,
                HandLandmarker.HAND_CONNECTIONS,
                {
                  color: "#6B9DFE",
                  lineWidth: 5,
                },
              )
              drawingUtils.drawLandmarks(landmarks, {
                color: "#ffffff",
                lineWidth: 2,
                radius: 4,
              })
            }
          }

          setCurrentGesture((prev) => (prev !== detected ? detected : prev))
        } else {
          setCurrentGesture("None")
        }
      }

      ctx.restore()
      updateFps()
      animationFrameId = requestAnimationFrame(renderLoop)
    }

    startSystem()

    return () => {
      cancelAnimationFrame(animationFrameId)
      // Use closure variable — reliable even if videoRef.current is null
      capturedStream?.getTracks().forEach((track) => track.stop())
      capturedStream = null
    }
  }, [updateFps, showLandmarks])

  const gestureInfo = GESTURE_LABELS[currentGesture]
  const isActive = currentGesture !== "None"

  return (
    <div className="relative w-full h-[500px] lg:h-full min-h-[400px] bg-[#131823] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between p-5">
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 rounded-2xl"
      />

      {/* Top HUD */}
      <div className="flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-3 text-xs font-medium text-slate-300 shadow-lg">
          <span className="flex items-center gap-2">
            {isReady ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            ) : (
              <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
            )}
            {isReady ? "TRACKING ACTIVE" : "INITIALIZING AI..."}
          </span>
          {isReady && (
            <>
              <span className="w-[1px] h-3 bg-slate-600" />
              <span className="font-mono">
                FPS: <span className="text-[#6b9dfe]">{fps}</span>
              </span>
              <span className="w-[1px] h-3 bg-slate-600" />
              <span className="font-mono">
                LAT: <span className="text-cyan-400">{latency}ms</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="flex flex-col gap-3 z-10 pointer-events-none">
        <div className="flex justify-center">
          <div
            className={`backdrop-blur-md border rounded-2xl p-3.5 flex items-center gap-3.5 text-sm font-medium shadow-xl transition-all duration-300 ${
              currentGesture === "Fist"
                ? "bg-amber-900/30 border-amber-500/50 scale-[1.02]"
                : isActive
                  ? "bg-blue-900/30 border-blue-500/50 scale-[1.02]"
                  : "bg-[#0B0F17]/80 border-slate-700/50"
            }`}
          >
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${isActive ? "bg-blue-900/40 border-blue-600/40" : "bg-[#131823] border-slate-700"}`}
            >
              <GestureIcon gesture={currentGesture} />
            </div>
            <div className="flex flex-col pr-3">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                {isActive ? "Action Detected" : "System Ready"}
              </span>
              <span
                className={`text-base tracking-tight ${isActive ? "text-white font-bold" : "text-slate-300"}`}
              >
                {currentGesture === "Fist"
                  ? "✊ Hold 1.5s → Keyboard"
                  : gestureInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2 bg-[#0B0F17]/60 backdrop-blur-sm border border-slate-800/50 rounded-lg px-3 py-1.5">
            <Cpu className="w-3 h-3 text-[#6b9dfe]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Neural Engine v1.0
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#0B0F17]/60 backdrop-blur-sm border border-emerald-900/30 rounded-lg px-3 py-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider">
              Privacy: Local-Only
            </span>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-slate-700/60 rounded-bl-lg z-10 pointer-events-none" />
      <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-slate-700/60 rounded-tr-lg z-10 pointer-events-none" />
      <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-slate-700/60 rounded-tl-lg z-10 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-slate-700/60 rounded-br-lg z-10 pointer-events-none" />
    </div>
  )
}
