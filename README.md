# Lumina AI — Diamond Detection & Measurement Platform

Upload a jewelry photo, get every diamond detected and measured, and
draw a box over any section to count just that region. Two parts:

```
diamond_estimation/     Python detection pipeline + FastAPI backend
frontend/                Next.js app (dashboard, upload, analytics, history)
render.yaml              Render Blueprint — deploys both services together
```

## How it fits together

- **Backend** (`diamond_estimation/`) runs a classical computer-vision
  pipeline — CLAHE contrast, Otsu threshold, distance-transform
  watershed, per-stone classification — exposed as a FastAPI service
  (`api.py`, `POST /detect`). See
  [`diamond_estimation/README.md`](diamond_estimation/README.md) for
  the CLI tool this was built from and how to tune detection.
- **Frontend** (`frontend/`) is a Next.js app that uploads an image to
  that backend and renders the results — bounding boxes, per-stone
  table, region selection, analytics, history. It can also run in
  **mock mode**, detecting diamonds entirely client-side in the
  browser (no backend needed) — see
  [`frontend/README.md`](frontend/README.md).

## Running both locally

**Backend:**
```bash
cd diamond_estimation
python -m venv myenv
myenv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

**Frontend**, pointed at that backend:
```bash
cd frontend
npm install
# .env.local:
#   NEXT_PUBLIC_USE_MOCK=false
#   NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Leave `NEXT_PUBLIC_USE_MOCK=true` (or omit `.env.local` entirely) to
run the frontend standalone against its client-side detector instead.

## Deployment

`render.yaml` defines both services as a Render Blueprint (**New →
Blueprint** on render.com, pointed at this repo) — one Node web
service for the frontend, one Python web service for the backend.
The frontend can alternatively be deployed to Vercel (Root Directory:
`frontend`); either way, set `NEXT_PUBLIC_API_URL` to wherever the
backend actually ends up, and add that frontend's URL to the
backend's `CORS_ORIGINS` environment variable so the two can talk to
each other.

Both being on Render's/Vercel's free tiers, expect a 30-60s cold
start on the first request after a period of inactivity.
