import axios from "axios";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Shared axios instance for the real backend. The app currently runs against
 * `detection-service.ts`'s mock engine (no backend exists yet) — this client
 * is wired up so flipping `NEXT_PUBLIC_USE_MOCK=false` and pointing
 * `apiEndpoint` (Settings page) at a live API is the only change required.
 *
 * Expected contract:
 *   POST {apiEndpoint}/upload            -> { imageUrl, imageWidth, imageHeight }
 *   POST {apiEndpoint}/detect            -> DetectionResult
 *   GET  {apiEndpoint}/history           -> HistoryItem[]
 *   GET  {apiEndpoint}/analytics         -> AnalyticsData
 */
export const apiClient = axios.create({
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const { apiEndpoint } = useSettingsStore.getState().settings;
  config.baseURL = apiEndpoint;
  return config;
});

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
