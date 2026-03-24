"use client"

import { useEffect, useRef, useState } from "react"
import { Hand, Loader2, MousePointerClick } from "lucide-react" // <-- Added MousePointerClick
import { handTracker } from "@/lib/handTracking"
import { gestureEngine, GestureType } from "@/lib/gestureEngine" // <-- Added Gesture Engine import
import { DrawingUtils, HandLandmarker } from "@mediapipe/tasks-vision"
import { isMobileDevice } from "@/utils/isMobile"

export default function CameraCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  // NEW: State to hold the current gesture for the UI
  const [currentGesture, setCurrentGesture] = useState<GestureType>("None")

  useEffect(() => {
    let animationFrameId: number

    async function startSystem() {
      if (isMobileDevice()) {
        setIsReady(false)
        return
      }
      // 1. Initialize the AI Model
      await handTracker.initialize()

      // 2. Request Camera Permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 }, // Changed from 1280 to 640
            height: { ideal: 480 }, // Changed from 720 to 480
            frameRate: { ideal: 30 }, // Capped at 30fps for stability
          },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Wait for the video to actually start playing before we begin tracking
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setIsReady(true)
            renderLoop() // Start the 60fps tracking loop
          }
        }
      } catch (error) {
        console.error("Camera access denied:", error)
      }
    }

    // 3. The 60fps Detection Loop
    let lastVideoTime = -1
    let drawingUtils: DrawingUtils | null = null
    let lastAiRunTime = 0
    const AI_FPS_LIMIT = 1000 / 20 // Limit AI to 20 frames per second (50ms gaps)

    const renderLoop = (currentTime: number = performance.now()) => {
      if (!videoRef.current || !canvasRef.current || !handTracker.isReady)
        return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Ensure canvas matches video size
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      // Draw the mirrored video background (This runs fast at 60fps)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(-1, 1)
      ctx.translate(-canvas.width, 0)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // ONLY run the heavy AI math if enough time has passed AND there is a new frame
      if (
        currentTime - lastAiRunTime >= AI_FPS_LIMIT &&
        video.currentTime !== lastVideoTime
      ) {
        lastAiRunTime = currentTime
        lastVideoTime = video.currentTime

        const results = handTracker.detect(video, performance.now())

        // Draw the skeleton
        if (results && results.landmarks.length > 0) {
          if (!drawingUtils) drawingUtils = new DrawingUtils(ctx)

          for (const landmarks of results.landmarks) {
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

            // Detect Gesture
            const detected = gestureEngine.detectGesture(landmarks)
            setCurrentGesture((prev) => (prev !== detected ? detected : prev))
          }
        } else {
          setCurrentGesture("None")
        }
      }
      ctx.restore()

      // Loop again on the next monitor refresh
      animationFrameId = requestAnimationFrame(renderLoop)
    }

    startSystem()

    // Cleanup when leaving the page
    return () => {
      cancelAnimationFrame(animationFrameId)
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative w-full h-[500px] lg:h-full min-h-[400px] bg-[#131823] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between p-6">
      {/* Hidden Video Element (source for the canvas) */}
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* The visible Canvas (where we draw the video + hand skeleton) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 rounded-2xl"
      />

      {/* Top HUD */}
      <div className="flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-3 text-xs font-medium text-slate-300 shadow-lg">
          <span className="flex items-center gap-2">
            {isReady ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            ) : (
              <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
            )}
            {isReady ? "TRACKING ACTIVE" : "INITIALIZING AI..."}
          </span>
          {isReady && (
            <>
              <span className="w-[1px] h-3 bg-slate-600"></span>
              <span>FPS: 60</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom HUD: Dynamic Gesture Badge */}
      <div className="flex justify-center z-10 pointer-events-none">
        <div
          className={`backdrop-blur-md border rounded-2xl p-4 flex items-center gap-4 text-sm font-medium shadow-xl transition-all duration-300 ${
            currentGesture === "Pinch"
              ? "bg-blue-900/40 border-blue-500 scale-105"
              : "bg-[#0B0F17]/80 border-slate-700/50"
          }`}
        >
          <div className="bg-[#131823] p-2 border border-slate-700 rounded-lg">
            {currentGesture === "Pinch" ? (
              <MousePointerClick className="w-6 h-6 text-white animate-bounce" />
            ) : (
              <Hand className="w-6 h-6 text-[#6B9DFE]" />
            )}
          </div>
          <div className="flex flex-col pr-4">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider">
              {currentGesture !== "None" ? "Action Detected" : "System Ready"}
            </span>
            <span
              className={`text-lg tracking-tight ${currentGesture === "Pinch" ? "text-white font-bold" : "text-white"}`}
            >
              {currentGesture === "Pinch"
                ? "Click (Pinch)"
                : "Move hand to test"}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-slate-700 rounded-bl-lg z-10 pointer-events-none"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-slate-700 rounded-tr-lg z-10 pointer-events-none"></div>
    </div>
  )
}
