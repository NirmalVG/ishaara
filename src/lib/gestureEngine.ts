import { NormalizedLandmark } from "@mediapipe/tasks-vision"

export type GestureType = "None" | "Pinch" | "Fist" | "TwoFingers"

export class GestureEngine {
  // Thresholds (You can tweak these later for sensitivity)
  private readonly PINCH_THRESHOLD = 0.05

  // State to prevent spamming 100 clicks a second when holding a pinch
  private isCurrentlyPinching = false

  // A simple math helper to find the distance between two landmarks
  private calculateDistance(
    point1: NormalizedLandmark,
    point2: NormalizedLandmark,
  ): number {
    const dx = point1.x - point2.x
    const dy = point1.y - point2.y
    // We ignore the Z axis for standard 2D clicking to make it more reliable
    return Math.sqrt(dx * dx + dy * dy)
  }

  public detectGesture(landmarks: NormalizedLandmark[]): GestureType {
    if (!landmarks || landmarks.length < 21) return "None"

    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]

    // 1. Detect Pinch (Clicking)
    const pinchDistance = this.calculateDistance(thumbTip, indexTip)

    if (pinchDistance < this.PINCH_THRESHOLD) {
      if (!this.isCurrentlyPinching) {
        this.isCurrentlyPinching = true
        // In the future, this is where we will trigger the actual Windows/Mac click event!
        console.log("🖱️ PINCH DETECTED (Click!)")
      }
      return "Pinch"
    } else {
      this.isCurrentlyPinching = false
    }

    // (We will add Fist and TwoFingers logic here in Phase 2)

    return "None"
  }
}

export const gestureEngine = new GestureEngine()
