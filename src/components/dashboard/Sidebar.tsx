"use client"
import {
  Video,
  Settings2,
  MousePointerClick,
  ArrowUpDown,
  Keyboard,
  Copy,
  ThumbsUp,
  Sparkles,
} from "lucide-react"
import SliderControl from "../ui/SliderControl"
import ToggleControl from "../ui/ToggleControl"
import { useSettingsStore } from "@/store/useSettingStore"

const GESTURES = [
  { icon: MousePointerClick, name: "Pinch", desc: "Click / Select", color: "text-[#6b9dfe]" },
  { icon: ArrowUpDown, name: "Two Fingers", desc: "Scroll Up/Down", color: "text-cyan-400" },
  { icon: Keyboard, name: "Fist (2s Hold)", desc: "Toggle Keyboard", color: "text-amber-400" },
  { icon: Copy, name: "Peace Sign", desc: "Copy Text", color: "text-emerald-400" },
  { icon: ThumbsUp, name: "Thumbs Up", desc: "Paste Text", color: "text-violet-400" },
]

export default function Sidebar() {
  const { cursorSpeed, cursorSmoothing, setCursorSpeed, setCursorSmoothing } =
    useSettingsStore()

  return (
    <aside className="relative w-full h-full bg-[#131823] border border-slate-800/60 rounded-2xl p-6 flex flex-col gap-7 overflow-y-auto holo-border">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#6b9dfe]" />
          <h2 className="text-xl font-bold text-white">Ishaara</h2>
        </div>
        <p className="text-sm text-slate-400">Zero-Hardware Accessibility</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => alert("✅ Camera Button Clicked via Spatial Pinch!")}
          className="group relative w-full overflow-hidden bg-gradient-to-r from-[#6b9dfe] to-[#5b8af0] hover:from-[#7daafe] hover:to-[#6b9dfe] active:scale-[0.97] text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/25"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Video className="w-5 h-5 fill-slate-950 relative z-10" />
          <span className="relative z-10">Start Camera</span>
        </button>

        <button
          onClick={() => alert("✅ Calibration Clicked!")}
          className="w-full bg-transparent border border-slate-700/60 hover:bg-slate-800/50 hover:border-slate-600 active:scale-[0.97] text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Settings2 className="w-5 h-5" />
          Calibrate Range
        </button>
      </div>

      {/* Quick Settings */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gradient-to-r from-[#6b9dfe]/40 to-transparent" />
          Quick Settings
        </h3>
        <div className="flex flex-col gap-2">
          <SliderControl
            label="Cursor Speed"
            min={0.5} max={3} step={0.1}
            value={cursorSpeed}
            onChange={setCursorSpeed}
            valueLabel={`x${cursorSpeed.toFixed(2)}`}
          />
          <SliderControl
            label="Smoothing (Kalman)"
            min={0.1} max={0.9} step={0.1}
            value={cursorSmoothing}
            onChange={setCursorSmoothing}
            valueLabel={cursorSmoothing.toFixed(1)}
          />
          <div className="h-px w-full bg-slate-800/60 my-2" />
          <ToggleControl label="Show Hand Landmarks" defaultChecked={true} />
        </div>
      </div>

      {/* Gesture Map */}
      <div className="mt-auto pt-5 border-t border-slate-800/60">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gradient-to-r from-[#6b9dfe]/40 to-transparent" />
          Gesture Map
        </h3>

        <div className="flex flex-col gap-3">
          {GESTURES.map((g) => (
            <div
              key={g.name}
              className="group flex items-center gap-3.5 p-2.5 -mx-2.5 rounded-xl hover:bg-slate-800/30 transition-all cursor-default"
            >
              <div className="bg-slate-800/50 group-hover:bg-slate-700/50 p-2.5 rounded-lg border border-slate-700/50 group-hover:border-slate-600/50 transition-all">
                <g.icon className={`w-4.5 h-4.5 ${g.color} transition-all`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {g.name}
                </span>
                <span className="text-xs text-slate-500">{g.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
