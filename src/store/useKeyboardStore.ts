"use client"

import { create } from "zustand"

interface KeyboardState {
  isOpen: boolean
  isShiftActive: boolean // one-shot shift: next char uppercase, then auto-releases
  isCapsLock: boolean // sticky: all chars uppercase until toggled off
  isSymbolsMode: boolean // symbols page 1
  isSymbolsPage2: boolean // symbols page 2 (only when isSymbolsMode is true)

  open: () => void
  close: () => void
  toggle: () => void

  /**
   * SHIFT vs CAPS LOCK behavior:
   *
   * tapShift() — single tap activates one-shot shift (releases after one char).
   *              double-tap within 400ms activates CapsLock instead.
   *              This mirrors standard desktop OS behavior.
   *
   * releaseShift() — called after each char insert. Does nothing when CapsLock
   *                  is on (CapsLock only turns off via another tapShift or
   *                  toggleCapsLock).
   */
  tapShift: () => void
  toggleCapsLock: () => void
  releaseShift: () => void
  toggleSymbols: () => void
  toggleSymbolsPage: () => void
}

export const useKeyboardStore = create<KeyboardState>()((set, get) => {
  let lastShiftTapTime = 0
  const DOUBLE_TAP_WINDOW = 400 // ms — same as most OS double-click defaults

  return {
    isOpen: false,
    isShiftActive: false,
    isCapsLock: false,
    isSymbolsMode: false,
    isSymbolsPage2: false,

    open: () => set({ isOpen: true }),

    // Reset ALL modifier state on close — never leave keyboard in a stuck state
    close: () =>
      set({
        isOpen: false,
        isShiftActive: false,
        isCapsLock: false,
        isSymbolsMode: false,
        isSymbolsPage2: false,
      }),

    toggle: () => set((s) => ({ isOpen: !s.isOpen })),

    tapShift: () => {
      const now = Date.now()
      const delta = now - lastShiftTapTime
      lastShiftTapTime = now
      const { isCapsLock } = get()

      if (delta < DOUBLE_TAP_WINDOW) {
        // Double-tap: toggle CapsLock, always clear one-shot shift
        set({ isCapsLock: !isCapsLock, isShiftActive: false })
      } else {
        // Single tap: toggle one-shot shift
        set((s) => ({ isShiftActive: !s.isShiftActive }))
      }
    },

    // Direct CapsLock toggle — useful for a dedicated Caps key
    toggleCapsLock: () =>
      set((s) => ({
        isCapsLock: !s.isCapsLock,
        isShiftActive: false,
      })),

    // Called after each character is inserted
    releaseShift: () => {
      if (!get().isCapsLock) set({ isShiftActive: false })
      // If CapsLock is on, shift stays "logically active" via isCapsLock
    },

    toggleSymbols: () =>
      set((s) => ({
        isSymbolsMode: !s.isSymbolsMode,
        isSymbolsPage2: false, // always land on page 1 when entering symbols
      })),

    toggleSymbolsPage: () =>
      set((s) => ({ isSymbolsPage2: !s.isSymbolsPage2 })),
  }
})
