# Lumina AI — frontend

Next.js (App Router) frontend for the diamond detection platform. See
the [repo root README](../README.md) for how this fits with the
Python backend.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Detection mode

Controlled by env vars (`.env.local`, not committed):

```bash
NEXT_PUBLIC_USE_MOCK=true    # default — detects diamonds client-side in the browser, no backend needed
# or
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:8000   # points at the FastAPI backend instead
```

The API endpoint can also be changed at runtime from the Settings
page (stored in the browser's localStorage) without rebuilding.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS ·
shadcn/ui · Framer Motion · TanStack Query · Zustand · Recharts ·
react-dropzone · react-zoom-pan-pinch

## Structure

```
src/
├── app/                 routes: landing page, and (app)/ for dashboard/detection/analytics/history/settings/help
├── components/          detection/, dashboard/, layout/, landing/, analytics/, ui/ (shadcn)
├── services/            detection-service.ts — picks mock vs real backend
├── lib/                 diamond-detector.ts (client-side CV heuristic), export.ts, api-client.ts
├── store/                zustand stores (settings, history) — persisted to localStorage
└── types/                shared types matching the backend's DetectionResult contract
```

## Build

```bash
npm run build
npm run start
```

## Deploy

Root Directory must be set to `frontend` (this app lives in a
subfolder of the repo) — see the deployment section in the
[repo root README](../README.md) for Render/Vercel specifics and
required environment variables.
