import { create } from "zustand"

interface SettingsState {
  cursorSpeed: number
  cursorSmoothing: number

  // Keyboard State
  isKeyboardOpen: boolean
  typedText: string
  isShiftActive: boolean
  isSymbolsMode: boolean

  setCursorSpeed: (speed: number) => void
  setCursorSmoothing: (smoothing: number) => void

  // Keyboard Actions
  setKeyboardOpen: (isOpen: boolean) => void
  appendChar: (char: string) => void
  backspace: () => void
  clearText: () => void
  toggleShift: () => void
  toggleSymbols: () => void
  pressEnter: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  cursorSpeed: 1.5,
  cursorSmoothing: 0.6,

  isKeyboardOpen: false,
  typedText: "",
  isShiftActive: false,
  isSymbolsMode: false,

  setCursorSpeed: (speed) => set({ cursorSpeed: speed }),
  setCursorSmoothing: (smoothing) => set({ cursorSmoothing: smoothing }),

  setKeyboardOpen: (isOpen) => set({ isKeyboardOpen: isOpen }),
  appendChar: (char) => {
    const { isShiftActive } = get()
    const finalChar = isShiftActive ? char.toUpperCase() : char.toLowerCase()

    // Dispatch to the active element in the DOM
    const el = document.activeElement
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const start = el.selectionStart || 0
      const end = el.selectionEnd || 0
      el.setRangeText(finalChar, start, end, "end")
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }
    set((state) => ({
      typedText: state.typedText + finalChar,
      // Auto-disable shift after one character (tap shift behavior)
      isShiftActive: false,
    }))
  },
  backspace: () => {
    const el = document.activeElement
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const start = el.selectionStart || 0
      const end = el.selectionEnd || 0
      if (start > 0) {
        el.setRangeText("", start - 1, end === start ? start : end, "end")
        el.dispatchEvent(new Event("input", { bubbles: true }))
      }
    }
    set((state) => ({ typedText: state.typedText.slice(0, -1) }))
  },
  clearText: () => set({ typedText: "" }),
  toggleShift: () => set((state) => ({ isShiftActive: !state.isShiftActive })),
  toggleSymbols: () =>
    set((state) => ({ isSymbolsMode: !state.isSymbolsMode })),
  pressEnter: () => {
    const el = document.activeElement
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const start = el.selectionStart || 0
      const end = el.selectionEnd || 0
      el.setRangeText("\n", start, end, "end")
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }
    set((state) => ({ typedText: state.typedText + "\n" }))
  },
}))
