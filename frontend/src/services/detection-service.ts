import { DetectionResult, ProcessingStage } from "@/types/diamond";
import { getImageDimensions } from "@/lib/image-utils";
import { buildMockDetectionResult } from "@/lib/mock-engine";
import { apiClient, USE_MOCK } from "@/lib/api-client";

export type StageCallback = (stage: ProcessingStage, progress: number) => void;

const STAGE_SEQUENCE: { stage: ProcessingStage; weight: number; minMs: number }[] = [
  { stage: "uploading", weight: 20, minMs: 500 },
  { stage: "loading-model", weight: 20, minMs: 450 },
  { stage: "detecting", weight: 35, minMs: 700 },
  { stage: "measuring", weight: 15, minMs: 400 },
  { stage: "reporting", weight: 10, minMs: 350 },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMockDetection(file: File, onStage?: StageCallback): Promise<DetectionResult> {
  const start = performance.now();
  const imageUrl = URL.createObjectURL(file);

  let cumulative = 0;
  for (const step of STAGE_SEQUENCE) {
    onStage?.(step.stage, cumulative);
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      await sleep(step.minMs / steps);
      cumulative += step.weight / steps;
      onStage?.(step.stage, Math.min(99, cumulative));
    }
  }

  const { width, height } = await getImageDimensions(imageUrl);

  const result = await buildMockDetectionResult({
    fileName: file.name,
    fileSizeBytes: file.size,
    imageWidth: width,
    imageHeight: height,
    imageUrl,
    processingTimeMs: performance.now() - start,
  });
  result.processingTimeMs = performance.now() - start;

  onStage?.("done", 100);
  return result;
}

async function runRealDetection(file: File, onStage?: StageCallback): Promise<DetectionResult> {
  onStage?.("uploading", 10);
  const imageUrl = URL.createObjectURL(file);

  const formData = new FormData();
  formData.append("image", file);

  onStage?.("loading-model", 20);

  // The backend runs its full CLAHE -> watershed -> classifier pass inside
  // this one call (no separate upload step — it's stateless), so the
  // in-between stages are cosmetic progress rather than real checkpoints.
  const stagePing = setInterval(() => onStage?.("detecting", 45 + Math.random() * 30), 350);
  let detectRes: { data: Omit<DetectionResult, "originalImageUrl" | "processedImageUrl"> };
  try {
    detectRes = await apiClient.post("/detect", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } finally {
    clearInterval(stagePing);
  }

  onStage?.("measuring", 90);
  onStage?.("reporting", 96);

  const result: DetectionResult = {
    ...detectRes.data,
    originalImageUrl: imageUrl,
    processedImageUrl: imageUrl,
  };

  onStage?.("done", 100);
  return result;
}

export async function uploadAndDetect(
  file: File,
  onStage?: StageCallback
): Promise<DetectionResult> {
  try {
    return USE_MOCK ? await runMockDetection(file, onStage) : await runRealDetection(file, onStage);
  } catch (err) {
    onStage?.("error", 0);
    throw err;
  }
}
