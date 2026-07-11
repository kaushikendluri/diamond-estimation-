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
  const formData = new FormData();
  formData.append("image", file);

  const uploadRes = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      const pct = evt.total ? (evt.loaded / evt.total) * 20 : 10;
      onStage?.("uploading", pct);
    },
  });

  onStage?.("loading-model", 25);
  onStage?.("detecting", 45);
  const detectRes = await apiClient.post<DetectionResult>("/detect", {
    imageId: uploadRes.data.imageId,
  });

  onStage?.("measuring", 85);
  onStage?.("reporting", 95);
  onStage?.("done", 100);

  return detectRes.data;
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
