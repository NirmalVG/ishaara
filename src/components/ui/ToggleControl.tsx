"use client" // Needs to be client component because it has interactive state

import { useState } from "react"

interface ToggleControlProps {
  label: string
  defaultChecked?: boolean
}

export default function ToggleControl({
  label,
  defaultChecked = false,
}: ToggleControlProps) {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-300 font-medium">{label}</span>

      <button
        type="button"
        onClick={() => setIsChecked(!isChecked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#6B9DFE] focus:ring-offset-2 focus:ring-offset-[#131823] ${
          isChecked ? "bg-[#6B9DFE]" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            isChecked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}
