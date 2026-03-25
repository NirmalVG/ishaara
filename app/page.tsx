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
              <span className="text-[#6B9DFE]">no sensors required.</span>
            </h1>
          </div>

          <div className="w-full h-[450px] lg:h-[600px] shrink-0">
            <CameraCanvas />
          </div>

          <div className="p-6 bg-[#131823] border border-slate-700 rounded-2xl shrink-0 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-2">
              📋 Gesture Playground
            </h3>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase">
                1. Highlight this text
              </label>
              <p className="text-[#6B9DFE] bg-blue-900/20 p-3 rounded-lg mt-1 select-text">
                Ishaara Hands-Free Computer Test String.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                2. Paste it here
              </label>
              <textarea
                className="w-full h-24 bg-[#0B0F17] border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-[#6B9DFE] focus:ring-1 focus:ring-[#6B9DFE] outline-none transition-all"
                placeholder="Focus this box and give a Thumbs Up..."
              />
            </div>
          </div>

          {/* ✨ SCROLL TESTING BLOCK ✨ */}
          <div className="h-[800px] flex items-end justify-center pb-10 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl shrink-0">
            <p className="text-slate-500 font-bold">
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
