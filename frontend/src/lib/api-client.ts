import axios from "axios";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Shared axios instance for the real backend — the FastAPI service in
 * `backend/api.py` (CLAHE -> watershed ->
 * classifier). Flip `NEXT_PUBLIC_USE_MOCK=false` and point `apiEndpoint`
 * (Settings page) at that service's URL to use it instead of the client-side
 * JS approximation.
 *
 * Contract:
 *   POST {apiEndpoint}/detect (multipart "image" field) -> DetectionResult
 *     minus originalImageUrl/processedImageUrl, which the frontend fills in
 *     itself from a local object URL — the backend is stateless and has
 *     nowhere to host the image for a follow-up GET.
 *
 * Long timeout: a free-tier Render instance spins down when idle and can
 * take 30-60s to wake on the first request after a while, on top of the
 * classical CV pipeline's own few-second processing time.
 */
export const apiClient = axios.create({
  timeout: 90_000,
});

apiClient.interceptors.request.use((config) => {
  const { apiEndpoint } = useSettingsStore.getState().settings;
  config.baseURL = apiEndpoint;
  return config;
});

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
