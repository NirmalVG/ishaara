import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision"
import { GestureType } from "./gestureEngine"

class HandTrackingEngine {
  private landmarker: HandLandmarker | null = null
  public isReady = false

  // 1. The memory variable to hold the last frame's data
  private lastResults: any = null
  public lastGesture: GestureType = "None"

  async initialize() {
    if (this.isReady) return

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      )

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/hand_landmarker.task",
          delegate: "CPU", // Using CPU for stability
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      this.isReady = true
      console.log("✅ MediaPipe Hand Landmarker loaded successfully!")
    } catch (error) {
      console.error("❌ Failed to initialize MediaPipe:", error)
    }
  }

  detect(videoElement: HTMLVideoElement, timestamp: number) {
    if (!this.landmarker || !this.isReady) return null

    // 2. Save the result to memory before returning it
    this.lastResults = this.landmarker.detectForVideo(videoElement, timestamp)
    return this.lastResults
  }

  // 3. The Getter function (Safely inside the class!)
  getLastKnownResults() {
    return this.lastResults
  }
}

// Export the single instance
export const handTracker = new HandTrackingEngine()
