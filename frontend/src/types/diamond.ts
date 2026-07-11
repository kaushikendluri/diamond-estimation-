export type DiamondStatus = "verified" | "flagged" | "pending";

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Diamond {
  id: number;
  confidence: number; // 0..1
  width: number; // px
  height: number; // px
  x: number; // top-left x, px
  y: number; // top-left y, px
  bbox: BoundingBox;
  area: number; // px^2
  aspectRatio: number;
  cutType?: string;
  status: DiamondStatus;
}

export interface DetectionResult {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  imageWidth: number;
  imageHeight: number;
  originalImageUrl: string;
  processedImageUrl: string;
  totalDiamonds: number;
  detectionAccuracy: number; // 0..1
  processingTimeMs: number;
  createdAt: string;
  diamonds: Diamond[];
}

export interface HistoryItem {
  id: string;
  fileName: string;
  thumbnailUrl: string;
  uploadDate: string;
  totalDiamonds: number;
  processingTimeMs: number;
  status: "completed" | "failed" | "processing";
  detectionAccuracy: number;
}

export interface DashboardStats {
  totalImagesProcessed: number;
  totalDiamondsDetected: number;
  detectionAccuracy: number;
  averageProcessingTimeMs: number;
  successRate: number;
}

export interface AnalyticsData {
  detectionTrends: { date: string; diamonds: number; images: number }[];
  sizeDistribution: { bucket: string; count: number }[];
  confidenceDistribution: { bucket: string; count: number }[];
  processingTimeTrends: { date: string; avgMs: number }[];
  uploadHistory: { date: string; uploads: number }[];
}

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "loading-model"
  | "detecting"
  | "measuring"
  | "reporting"
  | "done"
  | "error";

export const PROCESSING_STAGE_LABEL: Record<ProcessingStage, string> = {
  idle: "",
  uploading: "Uploading Image...",
  "loading-model": "Loading AI Model...",
  detecting: "Detecting Diamonds...",
  measuring: "Calculating Measurements...",
  reporting: "Generating Report...",
  done: "Complete",
  error: "Something went wrong",
};
