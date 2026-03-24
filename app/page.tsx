import CameraCanvas from "@/components/dashboard/CameraCanvas"
import Sidebar from "@/components/dashboard/Sidebar"
import MobileGuard from "@/components/layout/MobileGuard"

export default function Dashboard() {
  return (
    <MobileGuard>
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 h-full">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Precise control,{" "}
              <span className="text-[#6B9DFE]">no sensors required.</span>
            </h1>
          </div>
          <CameraCanvas />
        </div>

        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <Sidebar />
        </div>
      </main>
    </MobileGuard>
  )
}
