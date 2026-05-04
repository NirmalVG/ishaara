import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import TopNav from "@/components/layout/TopNav"
import VirtualCursor from "@/components/dashboard/VirtualCursor"
import VirtualKeyboard from "@/components/dashboard/VirtualKeyboard"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

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
        className={`${geistSans.className} ${geistMono.variable} bg-[#0B0F17] text-slate-100 h-screen w-screen overflow-hidden flex flex-col`}
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
