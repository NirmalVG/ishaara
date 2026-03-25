"use client"

interface SliderControlProps {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (val: number) => void
  valueLabel?: string
}

export default function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
  valueLabel,
}: SliderControlProps) {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        <span className="text-xs text-[#6B9DFE] font-mono bg-blue-900/20 px-2 py-0.5 rounded">
          {valueLabel || value}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))} // <-- Push changes up
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6B9DFE] hover:accent-blue-400"
      />
    </div>
  )
}
