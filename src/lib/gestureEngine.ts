import type { NormalizedLandmark } from "@mediapipe/tasks-vision"

export type GestureType =
  | "None"
  | "Pinch"
  | "TwoFingers"
  | "Fist"
  | "Peace"
  | "ThumbsUp"

export class GestureEngine {
  private readonly PINCH_THRESHOLD = 0.05
  private readonly SCROLL_GAP_THRESHOLD = 0.06 // Fingers close together
  private readonly PEACE_GAP_THRESHOLD = 0.1 // Fingers spread apart

  // Helper to calculate 2D distance
  private getDistance(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  public detectGesture(landmarks: NormalizedLandmark[]): GestureType {
    if (!landmarks || landmarks.length < 21) return "None"

    const wrist = landmarks[0]

    // Thumb
    const thumbMcp = landmarks[2]
    const thumbTip = landmarks[4]

    // Finger Tips
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]

    // Knuckles (MCP Joints)
    const indexMcp = landmarks[5]
    const middleMcp = landmarks[9]
    const ringMcp = landmarks[13]
    const pinkyMcp = landmarks[17]

    // 1. Determine which fingers are curled
    // A finger is "curled" if its tip is closer to the wrist than its knuckle.
    const isIndexCurled =
      this.getDistance(indexTip, wrist) < this.getDistance(indexMcp, wrist)
    const isMiddleCurled =
      this.getDistance(middleTip, wrist) < this.getDistance(middleMcp, wrist)
    const isRingCurled =
      this.getDistance(ringTip, wrist) < this.getDistance(ringMcp, wrist)
    const isPinkyCurled =
      this.getDistance(pinkyTip, wrist) < this.getDistance(pinkyMcp, wrist)

    // Thumb logic: Is the tip significantly further from the wrist than its base?
    // Using 1.5x multiplier to require a very deliberate thumb extension.
    // This prevents a loose fist from accidentally registering as ThumbsUp.
    const isThumbExtended =
      this.getDistance(thumbTip, wrist) >
      this.getDistance(thumbMcp, wrist) * 1.5

    // 2. Detect Fist & Thumbs Up
    if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      if (isThumbExtended) {
        return "ThumbsUp" // 4 fingers curled + thumb sticking out
      }
      return "Fist" // All fingers curled
    }

    // 3. Detect Pinch
    const pinchDist = this.getDistance(indexTip, thumbTip)
    if (pinchDist < this.PINCH_THRESHOLD) return "Pinch"

    // 4. Detect Two-Finger Scroll vs. Peace Sign
    // Index and Middle must be extended; Ring and Pinky must be curled.
    if (!isIndexCurled && !isMiddleCurled && isRingCurled && isPinkyCurled) {
      const fingerGap = this.getDistance(indexTip, middleTip)

      if (fingerGap >= this.PEACE_GAP_THRESHOLD) {
        return "Peace" // Fingers spread wide (V shape)
      } else if (fingerGap < this.SCROLL_GAP_THRESHOLD) {
        return "TwoFingers" // Fingers tightly together
      }
    }

    return "None"
  }
}

export const gestureEngine = new GestureEngine()
