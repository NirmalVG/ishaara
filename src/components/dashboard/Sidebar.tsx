"use client"
import {
  Video,
  Settings2,
  Hand,
  MousePointerClick,
  ArrowUpDown,
  Keyboard,
  Copy, // <-- NEW
  ThumbsUp, // <-- NEW
} from "lucide-react"
import SliderControl from "../ui/SliderControl"
import ToggleControl from "../ui/ToggleControl"
import { useSettingsStore } from "@/store/useSettingStore"

export default function Sidebar() {
  const { cursorSpeed, cursorSmoothing, setCursorSpeed, setCursorSmoothing } =
    useSettingsStore()

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
            value={cursorSpeed}
            onChange={setCursorSpeed}
            valueLabel={`x${cursorSpeed.toFixed(2)}`}
          />
          <SliderControl
            label="Smoothing (Kalman)"
            min={0.1}
            max={0.9}
            step={0.1}
            value={cursorSmoothing}
            onChange={setCursorSmoothing}
            valueLabel={cursorSmoothing.toFixed(1)}
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
          {/* Gesture 1: Pinch */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <MousePointerClick className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Pinch</span>
              <span className="text-xs text-slate-500">Click / Select</span>
            </div>
          </div>

          {/* Gesture 2: Two Fingers */}
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

          {/* Gesture 3: Fist */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <Keyboard className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Fist</span>
              <span className="text-xs text-slate-500">Toggle Keyboard</span>
            </div>
          </div>

          {/* Gesture 4: Peace Sign (NEW) */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <Copy className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">
                Peace Sign
              </span>
              <span className="text-xs text-slate-500">Copy Text</span>
            </div>
          </div>

          {/* Gesture 5: Thumbs Up (NEW) */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              <ThumbsUp className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">
                Thumbs Up
              </span>
              <span className="text-xs text-slate-500">Paste Text</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
