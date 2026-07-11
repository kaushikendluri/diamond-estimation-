import { DetectionResult } from "@/types/diamond";
import { detectDiamondsFromImage } from "./diamond-detector";

let seedCounter = 1;

/**
 * Builds a `DetectionResult` for an uploaded image. There's no backend yet,
 * so this stands in for the API response — but the diamonds themselves come
 * from `detectDiamondsFromImage`'s real pixel analysis of the photo, not a
 * random scatter, so the shape here matches exactly what a real `/detect`
 * response would look like.
 */
export async function buildMockDetectionResult(params: {
  fileName: string;
  fileSizeBytes: number;
  imageWidth: number;
  imageHeight: number;
  imageUrl: string;
  processingTimeMs: number;
}): Promise<DetectionResult> {
  const diamonds = await detectDiamondsFromImage(params.imageUrl, params.imageWidth, params.imageHeight);
  const avgConfidence =
    diamonds.reduce((acc, d) => acc + d.confidence, 0) / Math.max(1, diamonds.length);

  return {
    id: `det_${Date.now()}_${seedCounter++}`,
    fileName: params.fileName,
    fileSizeBytes: params.fileSizeBytes,
    imageWidth: params.imageWidth,
    imageHeight: params.imageHeight,
    originalImageUrl: params.imageUrl,
    processedImageUrl: params.imageUrl,
    totalDiamonds: diamonds.length,
    detectionAccuracy: Number(avgConfidence.toFixed(3)),
    processingTimeMs: params.processingTimeMs,
    createdAt: new Date().toISOString(),
    diamonds,
  };
}
