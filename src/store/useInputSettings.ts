"use client"

import { create } from "zustand"

interface InputSettingsState {
  cursorSpeed: number
  cursorSmoothing: number
  showLandmarks: boolean
  setCursorSpeed: (speed: number) => void
  setCursorSmoothing: (smoothing: number) => void
  setShowLandmarks: (showLandmarks: boolean) => void
}

export const useInputSettings = create<InputSettingsState>()((set) => ({
  cursorSpeed: 1.5,
  cursorSmoothing: 0.6,
  showLandmarks: true,
  setCursorSpeed: (cursorSpeed) => set({ cursorSpeed }),
  setCursorSmoothing: (cursorSmoothing) => set({ cursorSmoothing }),
  setShowLandmarks: (showLandmarks) => set({ showLandmarks }),
}))
