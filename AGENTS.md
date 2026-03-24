<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AI Agent Instructions: UI Implementation (Phase 1)

**Project:** Ishaara - Zero-Hardware Accessibility
**Current Task:** Reconstruct the premium dashboard UI from the provided reference image completely from scratch.

## 🛠️ Core Tech Stack & Rules

1. **Framework:** Next.js 16 (App Router). Use `src/app` directory.
2. **Next.js 16 Strict Rules:**
   - All request-scoped APIs (`cookies()`, `headers()`, `params`, `searchParams`) are **asynchronous** and MUST be `await`ed.
   - If generating middleware, use the new `proxy.ts` convention at the root, not `middleware.ts`.
   - Assume Turbopack is the default bundler.
3. **Language:** TypeScript (Strict typing required for all props). Minimum Node.js version is 20.9+.
4. **Styling:** Tailwind CSS ONLY. Do not use external component libraries (like Material UI, Chakra, or shadcn/ui) unless explicitly requested. Build custom components using raw Tailwind.
5. **Icons:** Use `lucide-react` for all iconography.
6. **Component Model:** Build highly modular components. Do NOT build monolithic files.

## 🎨 Design System & Theme (Based on Reference Image)

The UI is a sleek, dark-mode-only dashboard with deep navy/slate tones and vibrant blue accents.

- **Main Background:** Deep dark navy (approx `bg-[#0B0F17]`).
- **Panel Backgrounds:** Slightly lighter navy with subtle borders (approx `bg-[#131823] border border-slate-800`).
- **Primary Accent:** Soft, vibrant blue for buttons and active states (approx `bg-[#6B9DFE] text-white`).
- **Text Colors:** Primary text is white/off-white (`text-slate-100`). Secondary text is muted blue/grey (`text-slate-400`).
- **Typography:** Clean sans-serif (default Next.js Inter is perfect). Large headings have tight tracking (`tracking-tight`).
- **Border Radius:** Use `rounded-xl` or `rounded-2xl` for large panels, and `rounded-lg` for smaller buttons/inputs.

## 🧩 Architectural Breakdown (Target Layout)

When prompted to build the layout, divide the screen into these specific modular components:

### 1. Global Layout (`src/app/layout.tsx`)

- A full-height, unscrollable flex container (`h-screen w-screen overflow-hidden flex flex-col`).

### 2. Top Navigation (`src/components/layout/TopNav.tsx`)

- **Left:** "Ishaara" text logo.
- **Right:** Navigation links ("Dashboard", "Calibration", "Gestures"), Settings icon, Help icon. Active state (Dashboard) is highlighted in blue.

### 3. Main Workspace (`src/app/page.tsx` splits into two columns)

**Left Column (The Canvas Area):**

- Huge heading: "Precise control, **no sensors required.**" (Blue gradient on the bold text).
- `CameraCanvas.tsx`: A large `rounded-2xl` container. For now, render it as a dark gradient placeholder with corner brackets (like a camera viewfinder).
- `StatusHUD.tsx`: The pill at the top-left of the canvas ("🟢 TRACKING ACTIVE | FPS: 60 | LAT: 45MS").
- `GestureBadge.tsx`: The floating pill at the bottom-center ("ACTION DETECTED: Pinch to Click").
- `FooterBar.tsx`: Bottom row showing "Neural Engine" and "Privacy: Local-Only" badges.

**Right Column (The Control Panel - `Sidebar.tsx`):**

- Fixed width, styled as a subtle card.
- **Header:** Title "Ishaara" and subtitle.
- **Action Buttons:** "Start Camera" (Primary Blue) and "Calibrate Range" (Secondary Outline).
- **Quick Settings:** \* `SliderControl.tsx` for "Cursor Speed" and "Smoothing".
  - `ToggleControl.tsx` for "Show Hand Landmarks".
- **Gesture Map:** A vertical list of `GestureItem.tsx` components (Icon on left, Title/Description on right).

## 🤖 Agent Directives for Generating Code

- **Start Dummy, Then Wire:** Build the UI components as "dumb" visual components first. Use hardcoded placeholder data.
- **Responsive Design:** Ensure the two-column layout switches to a single-column stack on screens smaller than `lg:` (`max-w-screen-lg`).
- **"Use Client":** Only apply the `"use client"` directive to components that actually need it. Keep layout wrappers as Server Components.
<!-- END:nextjs-agent-rules -->
