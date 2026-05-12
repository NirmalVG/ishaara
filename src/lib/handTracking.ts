import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { GestureType } from "./gestureEngine";

const XNNPACK_INFO_MESSAGE = "Created TensorFlow Lite XNNPACK delegate for CPU";

type ConsoleMethod = (...data: unknown[]) => void;

function suppressTensorFlowDelegateInfo<T>(task: () => Promise<T>) {
  const original = {
    error: console.error.bind(console),
    info: console.info.bind(console),
    log: console.log.bind(console),
    warn: console.warn.bind(console),
  };

  const filter =
    (method: ConsoleMethod): ConsoleMethod =>
    (...data) => {
      if (
        data.some(
          (item) =>
            typeof item === "string" && item.includes(XNNPACK_INFO_MESSAGE),
        )
      ) {
        return;
      }

      method(...data);
    };

  console.error = filter(original.error) as typeof console.error;
  console.info = filter(original.info) as typeof console.info;
  console.log = filter(original.log) as typeof console.log;
  console.warn = filter(original.warn) as typeof console.warn;

  return task().finally(() => {
    console.error = original.error as typeof console.error;
    console.info = original.info as typeof console.info;
    console.log = original.log as typeof console.log;
    console.warn = original.warn as typeof console.warn;
  });
}

/**
 * HandTrackingEngine — singleton that owns the MediaPipe HandLandmarker.
 *
 * KEY ADDITION: lastDetectedGesture
 * VirtualCursor's rAF loop computes the gesture and writes it here once
 * per frame. CameraCanvas reads this cached value for its badge display.
 * This eliminates the double-computation race condition from the original
 * architecture where both components called detectGesture() independently.
 *
 * The flow is now:
 *   CameraCanvas.renderLoop → handTracker.detect() → stores raw landmarks
 *   VirtualCursor.rAF → gestureEngine.detectGesture() → handTracker.lastDetectedGesture
 *   CameraCanvas badge reads ← handTracker.lastDetectedGesture
 */
class HandTrackingEngine {
  private landmarker: HandLandmarker | null = null;
  public isReady = false;
  private lastResults: HandLandmarkerResult | null = null;

  // Written by VirtualCursor after each gesture computation
  public lastDetectedGesture: GestureType = "None";

  async initialize() {
    if (this.isReady) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      this.landmarker = await suppressTensorFlowDelegateInfo(() =>
        HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
      );

      this.isReady = true;
    } catch (error) {
      console.error("❌ Failed to initialize MediaPipe:", error);
    }
  }

  detect(videoElement: HTMLVideoElement, timestamp: number) {
    if (!this.landmarker || !this.isReady) return null;
    // Guard: MediaPipe crashes with "ROI width and height must be > 0" if the
    // video element has no decoded frames yet (dimensions are 0 during warmup).
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return null;
    try {
      this.lastResults = this.landmarker.detectForVideo(videoElement, timestamp);
    } catch {
      // Swallow transient MediaPipe graph errors (e.g. during tab switch / resize)
      return this.lastResults;
    }
    return this.lastResults;
  }

  getLastKnownResults() {
    return this.lastResults;
  }
}

export const handTracker = new HandTrackingEngine();
