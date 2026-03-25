import { create } from "zustand"

interface SettingsState {
  cursorSpeed: number
  cursorSmoothing: number

  // NEW: Keyboard State
  isKeyboardOpen: boolean
  typedText: string

  setCursorSpeed: (speed: number) => void
  setCursorSmoothing: (smoothing: number) => void

  // NEW: Keyboard Actions
  setKeyboardOpen: (isOpen: boolean) => void
  appendChar: (char: string) => void
  backspace: () => void
  clearText: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  cursorSpeed: 1.5,
  cursorSmoothing: 0.6,

  isKeyboardOpen: false,
  typedText: "",

  setCursorSpeed: (speed) => set({ cursorSpeed: speed }),
  setCursorSmoothing: (smoothing) => set({ cursorSmoothing: smoothing }),

  setKeyboardOpen: (isOpen) => set({ isKeyboardOpen: isOpen }),
  appendChar: (char) => set((state) => ({ typedText: state.typedText + char })),
  backspace: () =>
    set((state) => ({ typedText: state.typedText.slice(0, -1) })),
  clearText: () => set({ typedText: "" }),
}))
