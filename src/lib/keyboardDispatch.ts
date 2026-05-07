/**
 * keyboardDispatch.ts — pure DOM keyboard actions
 *
 * ROOT BUG FIXED: FOCUS THEFT
 * Every keyboard button is an HTML <button>. When clicked, the browser fires
 * mousedown first — which moves focus from the active input TO the button.
 * By the time the click handler fires, document.activeElement is the button,
 * not the input. getActiveEditable() returns null. Nothing is inserted.
 *
 * THE FIX — two layers:
 * 1. preventFocusTheft() — call on every button's onMouseDown. Calls
 *    e.preventDefault() which stops the browser from moving focus on mousedown.
 *    The button still fires click. The input keeps focus.
 * 2. lastFocusedElement — a module-level ref that tracks the last focused
 *    editable element. Even if focus somehow moves, we still have a target.
 *
 * REACT CONTROLLED INPUTS BUG FIXED:
 * setRangeText() mutates the DOM .value directly, bypassing React's synthetic
 * event system. React controlled inputs (with value={state} onChange={...})
 * track their value in the fiber tree. After setRangeText, the DOM value
 * changes but React's internal value doesn't — so on the next render React
 * overwrites your change with its stale state.
 *
 * THE FIX — nativeInputValueSetter:
 * React monkey-patches HTMLInputElement.prototype.value. We reach around it
 * to the original Object.getOwnPropertyDescriptor setter, which triggers
 * React's internal change detection correctly.
 */

type EditableElement = HTMLInputElement | HTMLTextAreaElement

// ─── Focus tracking ──────────────────────────────────────────────────────────

/**
 * Module-level ref to the last known focused editable element.
 * Updated on every focusin event on any input/textarea.
 * This is what insertAtCursor reads — not document.activeElement —
 * so we always have a valid target even after button mousedown steals focus.
 */
let lastFocusedElement: EditableElement | null = null

if (typeof window !== "undefined") {
  window.addEventListener(
    "focusin",
    (e) => {
      const el = e.target
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        lastFocusedElement = el
      }
    },
    true, // capture phase — fires before any React handler
  )
}

/**
 * Call this on onMouseDown of every keyboard button.
 * Prevents the browser from moving focus away from the active input.
 *
 * Usage: <button onMouseDown={preventFocusTheft} onClick={...}>
 */
export function preventFocusTheft(e: React.MouseEvent | MouseEvent): void {
  e.preventDefault()
}

/**
 * Returns the element we should type into:
 * 1. The last focused editable (tracked above) — most reliable
 * 2. Current document.activeElement if it's editable — fallback
 * 3. null — keyboard not pointing at anything typeable
 */
function getTarget(): EditableElement | null {
  // Prefer our tracked element if it's still in the DOM
  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    return lastFocusedElement
  }
  // Fallback: maybe focus is currently on an editable
  const el = document.activeElement
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    lastFocusedElement = el
    return el
  }
  return null
}

// ─── React controlled input interop ─────────────────────────────────────────

/**
 * Get React's internal value setter for input/textarea elements.
 * React replaces the native .value setter with its own tracker.
 * We need the ORIGINAL setter to trigger React's change detection
 * when we mutate the value programmatically.
 *
 * This is the same technique used by react-testing-library's fireEvent.
 */
function getNativeSetter(el: EditableElement): ((v: string) => void) | null {
  const proto =
    el instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : HTMLTextAreaElement.prototype
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value")
  return descriptor?.set ?? null
}

/**
 * Set the value of an input and correctly notify React.
 * Using el.value = x bypasses React's fiber; this doesn't.
 */
function setValueAndNotify(el: EditableElement, newValue: string): void {
  const nativeSetter = getNativeSetter(el)
  if (nativeSetter) {
    nativeSetter.call(el, newValue)
  } else {
    el.value = newValue // non-React fallback
  }
  // React 16+ listens for this to trigger onChange
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Insert a string at the current cursor position.
 * Works with: plain inputs, textareas, React controlled inputs.
 */
export function insertAtCursor(char: string): void {
  const el = getTarget()
  if (!el) return

  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length

  const newValue = el.value.slice(0, start) + char + el.value.slice(end)
  const newCursor = start + char.length

  setValueAndNotify(el, newValue)

  // Restore cursor position — setValueAndNotify moves it to end
  requestAnimationFrame(() => {
    el.setSelectionRange(newCursor, newCursor)
  })
}

/**
 * Delete one character to the left (backspace).
 * If text is selected, deletes the selection.
 */
export function deleteAtCursor(): void {
  const el = getTarget()
  if (!el) return

  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length

  let newValue: string
  let newCursor: number

  if (end > start) {
    // Delete selection
    newValue = el.value.slice(0, start) + el.value.slice(end)
    newCursor = start
  } else if (start > 0) {
    // Backspace one character — handle surrogate pairs (emoji)
    // Using Array.from correctly counts multi-codepoint chars
    const chars = Array.from(el.value)
    // Find char boundary — charCodeAt approach for surrogate pairs
    const before = el.value.slice(0, start)
    const lastChar = Array.from(before).pop() ?? ""
    newValue =
      el.value.slice(0, start - lastChar.length) + el.value.slice(start)
    newCursor = start - lastChar.length
  } else {
    return // Nothing to delete
  }

  setValueAndNotify(el, newValue)

  requestAnimationFrame(() => {
    el.setSelectionRange(newCursor, newCursor)
  })
}

/**
 * Press Enter:
 * - textarea → insert newline at cursor
 * - input with form → submit the form
 * - input without form → dispatch synthetic Enter keydown (for React onKeyDown handlers)
 */
export function pressEnterAtCursor(): void {
  const el = getTarget()
  if (!el) return

  if (el instanceof HTMLTextAreaElement) {
    insertAtCursor("\n")
    return
  }

  if (el.form) {
    el.form.requestSubmit()
  } else {
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      }),
    )
  }
}

/**
 * Read the current value of the last focused input.
 * Used by VirtualKeyboard preview — reads from our tracked element,
 * not document.activeElement, so it works even while a key button has focus.
 */
export function getActiveValue(): string {
  return getTarget()?.value ?? ""
}

/**
 * Manually register a specific element as the typing target.
 * Call this if you have a custom input wrapper that doesn't fire focusin
 * or if you want to force the keyboard to target a specific element.
 */
export function setTypingTarget(el: EditableElement | null): void {
  lastFocusedElement = el
}
