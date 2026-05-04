import CameraCanvas from "@/components/dashboard/CameraCanvas"
import Sidebar from "@/components/dashboard/Sidebar"
import MobileGuard from "@/components/layout/MobileGuard"

export default function Dashboard() {
  return (
    <MobileGuard>
      <main
        id="main-scroll-container"
        className="flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto"
      >
        {/* Left Column (Main Area) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Precise control,{" "}
              <span className="gradient-text-animated">
                no sensors required.
              </span>
            </h1>
            <p className="text-sm text-slate-500 max-w-xl">
              AI-powered hand tracking through your webcam. Zero hardware. Zero
              cost. Full computer control.
            </p>
          </div>

          <div className="w-full h-[450px] lg:h-[600px] shrink-0">
            <CameraCanvas />
          </div>

          <div className="p-6 bg-[#131823]/80 backdrop-blur-sm border border-slate-700/40 rounded-2xl shrink-0 shadow-lg holo-border">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6b9dfe]" />
              Gesture Playground
            </h3>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Highlight this text
              </label>
              <p className="text-[#6B9DFE] bg-blue-900/15 border border-blue-900/20 p-3 rounded-lg mt-1.5 select-text font-mono text-sm">
                Ishaara Hands-Free Computer Test String.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Paste it here
              </label>
              <textarea
                className="w-full h-24 bg-[#0B0F17] border border-slate-700/50 rounded-lg p-3 text-white mt-1.5 focus:border-[#6B9DFE] focus:ring-1 focus:ring-[#6B9DFE]/30 outline-none transition-all font-mono text-sm placeholder:text-slate-600"
                placeholder="Focus this box and give a Thumbs Up to paste..."
              />
            </div>
          </div>

          {/* Scroll Testing Block */}
          <div className="h-[800px] flex items-end justify-center pb-10 bg-gradient-to-b from-slate-800/10 to-slate-800/20 border border-dashed border-slate-700/40 rounded-2xl shrink-0 relative overflow-hidden">
            {/* Grid pattern background */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(107,157,254,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(107,157,254,0.5) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <p className="text-slate-500 font-bold relative z-10">
              👇 You scrolled to the bottom! 👇
            </p>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <Sidebar />
        </div>
      </main>
    </MobileGuard>
  )
}
