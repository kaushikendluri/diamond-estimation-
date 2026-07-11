export interface AppSettings {
  confidenceThreshold: number; // 0..1
  modelVersion: string;
  defaultResolution: string;
  apiEndpoint: string;
  notificationsEnabled: boolean;
  language: string;
  theme: "dark" | "light" | "system";
}

export const DEFAULT_SETTINGS: AppSettings = {
  confidenceThreshold: 0.75,
  modelVersion: "DiamondNet v3.2 (Watershed+CNN)",
  defaultResolution: "1920x1080",
  apiEndpoint: "https://api.lumina-ai.com/v1",
  notificationsEnabled: true,
  language: "en",
  theme: "dark",
};

export const MODEL_VERSIONS = [
  "DiamondNet v3.2 (Watershed+CNN)",
  "DiamondNet v3.1",
  "DiamondNet v2.8 (Legacy)",
  "DiamondNet v4.0-beta",
];

export const RESOLUTIONS = ["1280x720", "1920x1080", "2560x1440", "3840x2160"];

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "हिन्दी" },
  { value: "ja", label: "日本語" },
];
