import type { Metadata } from "next"
import "./globals.css"
import TopNav from "@/components/layout/TopNav"
import VirtualCursor from "@/components/dashboard/VirtualCursor"
import VirtualKeyboard from "@/components/dashboard/VirtualKeyboard"

export const metadata: Metadata = {
  title: "Ishaara — Hands-Free Computer Control",
  description:
    "Zero-hardware, webcam-based hand gesture control system. Empowering accessibility through AI-powered hand tracking. Free, open source, works on any laptop.",
  keywords: [
    "accessibility",
    "hand tracking",
    "gesture control",
    "MediaPipe",
    "hands-free",
    "assistive technology",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-[#0B0F17] text-slate-100 h-screen w-screen overflow-hidden flex flex-col antialiased"
        suppressHydrationWarning
      >
        <VirtualCursor />
        <VirtualKeyboard />

        <TopNav />
        {children}
      </body>
    </html>
  )
}
