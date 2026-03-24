import { create } from "zustand"

interface SettingsState {
  cursorSpeed: number // Multiplier (1.5x means 50% faster movement)
  cursorSmoothing: number // 0.0 to 1.0 (Higher = more buttery/laggy, Lower = raw/snappy)

  setCursorSpeed: (speed: number) => void
  setCursorSmoothing: (smoothing: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Default Future-Proof Settings
  cursorSpeed: 1.5,
  cursorSmoothing: 0.6,

  setCursorSpeed: (speed) => set({ cursorSpeed: speed }),
  setCursorSmoothing: (smoothing) => set({ cursorSmoothing: smoothing }),
}))
