"use client"
import {
  Video,
  Settings2,
  Hand,
  MousePointerClick,
  ArrowUpDown,
  Keyboard,
} from "lucide-react"
import SliderControl from "../ui/SliderControl"
import ToggleControl from "../ui/ToggleControl"

export default function Sidebar() {
  return (
    <aside className="w-full h-full bg-[#131823] border border-slate-800 rounded-2xl p-6 flex flex-col gap-8 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Ishaara</h2>
        <p className="text-sm text-slate-400">Zero-Hardware Accessibility</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => alert("✅ Camera Button Clicked via Spatial Pinch!")}
          className="w-full bg-[#6B9DFE] hover:bg-blue-400 active:scale-95 text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Video className="w-5 h-5 fill-slate-950" />
          Start Camera
        </button>

        <button
          onClick={() => alert("✅ Calibration Clicked!")}
          className="w-full bg-transparent border border-slate-700 hover:bg-slate-800 active:scale-95 text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Settings2 className="w-5 h-5" />
          Calibrate Range
        </button>
      </div>

      {/* Quick Settings Section */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Quick Settings
        </h3>
        <div className="flex flex-col gap-2">
          <SliderControl
            label="Cursor Speed"
            min={0.5}
            max={3}
            step={0.1}
            defaultValue={1.25}
            valueLabel="x1.25"
          />
          <SliderControl
            label="Smoothing (Kalman)"
            min={1}
            max={10}
            step={1}
            defaultValue={8}
            valueLabel="High"
          />
          <div className="h-px w-full bg-slate-800 my-2"></div>
          <ToggleControl label="Show Hand Landmarks" defaultChecked={true} />
        </div>
      </div>

      {/* Gesture Map Section */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Gesture Map
        </h3>

        <div className="flex flex-col gap-4">
          {/* Gesture 1 */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <MousePointerClick className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Pinch</span>
              <span className="text-xs text-slate-500">Click / Select</span>
            </div>
          </div>

          {/* Gesture 2 */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <ArrowUpDown className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">
                Two Fingers
              </span>
              <span className="text-xs text-slate-500">Scroll Up/Down</span>
            </div>
          </div>

          {/* Gesture 3 */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <Keyboard className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Fist</span>
              <span className="text-xs text-slate-500">
                Open Virtual Keyboard
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
