"use client"

/**
 * ToggleControl — controlled component.
 *
 * WHY CONTROLLED (checked + onChange) instead of internal useState:
 * The old version used defaultChecked + internal state, which made it an
 * "uncontrolled" component. This means the parent (Sidebar) had no way to
 * know the toggle's current value — it was hidden inside the component.
 *
 * Now that showLandmarks lives in useInputSettings (persisted), the parent
 * passes `checked={showLandmarks}` and `onChange={setShowLandmarks}`.
 * The toggle's visual state always matches the store. This is the "controlled
 * component" pattern — the same pattern React uses for <input value={...}/>.
 *
 * ACCESSIBILITY ADDITIONS:
 * - role="switch" (correct ARIA role for toggle buttons)
 * - aria-checked (screen readers announce the current state)
 * - focus ring (keyboard navigation)
 */
interface ToggleControlProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

export default function ToggleControl({
  label,
  checked,
  onChange,
}: ToggleControlProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span
        className="text-sm text-slate-300 font-medium"
        id={`toggle-label-${label.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`toggle-label-${label.replace(/\s+/g, "-").toLowerCase()}`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9DFE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131823] ${
          checked ? "bg-[#6B9DFE]" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}
