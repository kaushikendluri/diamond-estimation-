import { Diamond, DiamondStatus } from "@/types/diamond";

/**
 * In-browser stone detector — a JS port of the same idea as the Python
 * pipeline (preprocessing.py -> segmentation.py -> classifier.py), since
 * there's no trained model or OpenCV available in the browser:
 *
 *   local contrast normalize -> Otsu threshold -> morphological open/close
 *   -> local-maxima peaks (one per stone, seeded from real facet brightness)
 *   -> watershed (nearest-peak region growing over the mask)
 *   -> per-region contour bounding box
 *
 * A plain threshold's connected components merges a whole touching/paved
 * row of diamonds into one blob (which then reads as "background" once you
 * filter by max area). Peaks are seeded from brightness rather than a
 * distance transform of the mask: once a tightly-set cluster becomes one
 * solid blob with no internal background gaps, a distance transform is a
 * single smooth dome with one peak, and the whole cluster would read as one
 * giant diamond — but the raw brightness still carries each facet's
 * individual highlight, so seeding from it finds one peak per stone even
 * inside a solid-looking cluster. From there, nearest-peak region growing
 * (this file's stand-in for `cv2.watershed`) splits the mask back into
 * individual stones with a real contour-derived bounding box per stone,
 * rather than a fixed-size box around each peak.
 */

const WORKING_MAX_DIM = 900;
const MIN_PEAK_DISTANCE_FACTORS = [1, 0.7, 0.5];
const MIN_PEAKS_TARGET = 10;
const MAX_PEAKS_TARGET = 320;

function statusForConfidence(confidence: number): DiamondStatus {
  if (confidence >= 0.9) return "verified";
  if (confidence >= 0.78) return "pending";
  return "flagged";
}

function cutTypeFor(aspectRatio: number): string {
  if (aspectRatio > 2.4) return "Baguette";
  if (aspectRatio > 1.5) return "Marquise";
  return "Round";
}

function toGrayscale(imageData: ImageData): Float32Array {
  const { data } = imageData;
  const gray = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; p < gray.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

function bilerp(v00: number, v10: number, v01: number, v11: number, wx: number, wy: number): number {
  const top = v00 * (1 - wx) + v10 * wx;
  const bottom = v01 * (1 - wx) + v11 * wx;
  return top * (1 - wy) + bottom * wy;
}

/**
 * Tile-based local contrast stretch — a cheap stand-in for CLAHE. A single
 * global min/max stretch leaves diamonds in shadowed corners of an unevenly
 * lit photo below the brightness threshold even though they're real; this
 * normalizes each region against its own local range instead. Near-flat
 * tiles (plain dark backdrop) are floored so noise isn't amplified.
 */
function localContrastNormalize(gray: Float32Array, width: number, height: number, tileSize: number): Float32Array {
  const tilesX = Math.max(1, Math.ceil(width / tileSize));
  const tilesY = Math.max(1, Math.ceil(height / tileSize));
  const tileMin = new Float32Array(tilesX * tilesY).fill(255);
  const tileMax = new Float32Array(tilesX * tilesY).fill(0);

  for (let y = 0; y < height; y++) {
    const ty = Math.min(tilesY - 1, (y / tileSize) | 0);
    for (let x = 0; x < width; x++) {
      const tx = Math.min(tilesX - 1, (x / tileSize) | 0);
      const idx = ty * tilesX + tx;
      const v = gray[y * width + x];
      if (v < tileMin[idx]) tileMin[idx] = v;
      if (v > tileMax[idx]) tileMax[idx] = v;
    }
  }

  const out = new Float32Array(gray.length);
  // A plain tile (chain, clasp, backdrop) still has *some* faint sheen or
  // lighting gradient across it. A low floor amplifies that subtle range up
  // to full contrast, so the tile reads as "locally bright" and produces
  // false-positive boxes on things that aren't diamonds at all. Raising the
  // floor means only tiles with real, substantial brightness variation
  // (an actual cluster of facets) get stretched.
  const rangeFloor = 42;

  for (let y = 0; y < height; y++) {
    const fy = y / tileSize - 0.5;
    let ty0 = Math.floor(fy);
    let ty1 = ty0 + 1;
    const wy = fy - ty0;
    ty0 = Math.min(tilesY - 1, Math.max(0, ty0));
    ty1 = Math.min(tilesY - 1, Math.max(0, ty1));

    for (let x = 0; x < width; x++) {
      const fx = x / tileSize - 0.5;
      let tx0 = Math.floor(fx);
      let tx1 = tx0 + 1;
      const wx = fx - tx0;
      tx0 = Math.min(tilesX - 1, Math.max(0, tx0));
      tx1 = Math.min(tilesX - 1, Math.max(0, tx1));

      const i00 = ty0 * tilesX + tx0;
      const i10 = ty0 * tilesX + tx1;
      const i01 = ty1 * tilesX + tx0;
      const i11 = ty1 * tilesX + tx1;

      const minV = bilerp(tileMin[i00], tileMin[i10], tileMin[i01], tileMin[i11], wx, wy);
      const maxV = bilerp(tileMax[i00], tileMax[i10], tileMax[i01], tileMax[i11], wx, wy);
      const range = Math.max(rangeFloor, maxV - minV);

      const p = y * width + x;
      out[p] = Math.min(255, Math.max(0, ((gray[p] - minV) / range) * 255));
    }
  }

  return out;
}

function boxBlur(src: Float32Array, width: number, height: number, radius: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += src[row + Math.min(width - 1, Math.max(0, x))];
    for (let x = 0; x < width; x++) {
      tmp[row + x] = sum / span;
      sum += src[row + Math.min(width - 1, x + radius + 1)] - src[row + Math.max(0, x - radius)];
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(height - 1, Math.max(0, y)) * width + x];
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum / span;
      sum += tmp[Math.min(height - 1, y + radius + 1) * width + x] - tmp[Math.max(0, y - radius) * width + x];
    }
  }
  return out;
}

/** Otsu's method: picks the threshold maximizing between-class variance. */
function otsuThreshold(gray: Float32Array): number {
  const hist = new Uint32Array(256);
  for (const v of gray) hist[Math.min(255, Math.max(0, Math.round(v)))]++;
  const total = gray.length;

  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * hist[i];

  let sumB = 0;
  let weightB = 0;
  let best = 0;
  let bestVariance = -1;

  for (let t = 0; t < 256; t++) {
    weightB += hist[t];
    if (weightB === 0) continue;
    const weightF = total - weightB;
    if (weightF === 0) break;

    sumB += t * hist[t];
    const meanB = sumB / weightB;
    const meanF = (sumAll - sumB) / weightF;
    const variance = weightB * weightF * (meanB - meanF) * (meanB - meanF);

    if (variance > bestVariance) {
      bestVariance = variance;
      best = t;
    }
  }

  return best;
}

/** Binary erosion/dilation with a square structuring element (min/max filter). */
function morph(mask: Uint8Array<ArrayBuffer>, width: number, height: number, radius: number, mode: "erode" | "dilate"): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(mask.length);
  const want = mode === "erode" ? 0 : 1;
  const flip = mode === "erode" ? 1 : 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let result = flip;
      for (let dy = -radius; dy <= radius && result === flip; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          if (mask[ny * width + nx] === want) {
            result = want;
            break;
          }
        }
      }
      out[y * width + x] = result;
    }
  }
  return out;
}

interface Peak {
  x: number;
  y: number;
}

/**
 * Greedy local-maxima picking with minimum spacing — `peak_local_max(...,
 * min_distance=...)` without scikit-image.
 *
 * This seeds peaks from the raw (locally contrast-normalized) brightness,
 * not from a distance transform of the binary mask. A distance transform
 * only "sees" the mask's shape — once a cluster of tightly-set stones
 * becomes one solid blob with no internal background gaps, its distance
 * transform is a single smooth dome with one peak, and the whole cluster
 * gets treated as one giant diamond. The raw brightness still carries each
 * facet's individual highlight even inside a solid-looking cluster, so
 * seeding from it finds one peak per stone; the binary mask is used
 * afterward (via `watershedLabel`) purely to grow each peak into its real
 * contour-shaped region.
 */
function detectPeaks(
  values: Float32Array,
  mask: Uint8Array<ArrayBuffer>,
  width: number,
  height: number,
  minDistance: number,
  cap: number
): Peak[] {
  const candidates: number[] = [];
  for (let i = 0; i < values.length; i++) if (mask[i]) candidates.push(i);
  candidates.sort((a, b) => values[b] - values[a]);

  const cellSize = Math.max(1, minDistance);
  const gridCols = Math.ceil(width / cellSize) + 2;
  const buckets = new Map<number, { x: number; y: number }[]>();
  const bucketKey = (bx: number, by: number) => by * gridCols + bx;
  const minDistSq = minDistance * minDistance;

  const accepted: Peak[] = [];
  const searchCap = cap * 4;

  for (const idx of candidates) {
    if (accepted.length >= searchCap) break;
    const x = idx % width;
    const y = (idx / width) | 0;
    const bx = Math.floor(x / cellSize);
    const by = Math.floor(y / cellSize);

    let ok = true;
    for (let ddy = -1; ddy <= 1 && ok; ddy++) {
      for (let ddx = -1; ddx <= 1 && ok; ddx++) {
        const arr = buckets.get(bucketKey(bx + ddx, by + ddy));
        if (!arr) continue;
        for (const p of arr) {
          const dx = p.x - x;
          const dy = p.y - y;
          if (dx * dx + dy * dy < minDistSq) {
            ok = false;
            break;
          }
        }
      }
    }
    if (!ok) continue;

    accepted.push({ x, y });
    const key = bucketKey(bx, by);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push({ x, y });
  }

  return accepted;
}

/**
 * Multi-source BFS from every peak, expanding only through foreground mask
 * pixels — each pixel is claimed by whichever peak's front reaches it
 * first. This is `cv2.watershed`'s marker-based flood, simplified for a
 * binary mask: splitting a merged blob at the ridge equidistant between two
 * peaks is exactly what real watershed does with intensity gradients, and
 * here the "gradient" is simply mask membership.
 *
 * Growth from each peak is capped at `maxRadius`: without a cap, a cluster
 * where only one or two peaks got seeded (a locally weak facet-brightness
 * area) has nothing to stop that peak's flood — it consumes the *entire*
 * connected blob, producing one giant box across what's actually many
 * stones. Capping the radius means an under-peaked area is left partly
 * unlabeled (a few stones missed) instead of merged into one wrong one,
 * which is the better failure mode of the two.
 */
function watershedLabel(
  peaks: Peak[],
  mask: Uint8Array<ArrayBuffer>,
  width: number,
  height: number,
  maxRadius: number
): Int32Array {
  const labels = new Int32Array(mask.length).fill(0);
  const dist = new Float32Array(mask.length).fill(Infinity);
  const queue = new Int32Array(mask.length);
  let head = 0;
  let tail = 0;

  peaks.forEach((p, i) => {
    const idx = p.y * width + p.x;
    if (labels[idx] === 0) {
      labels[idx] = i + 1;
      dist[idx] = 0;
      queue[tail++] = idx;
    }
  });

  const ORTHO = 1;
  const DIAG = 1.41421356;

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    const label = labels[idx];
    const d0 = dist[idx];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const nIdx = ny * width + nx;
        if (!mask[nIdx] || labels[nIdx] !== 0) continue;

        const nd = d0 + (dx !== 0 && dy !== 0 ? DIAG : ORTHO);
        if (nd > maxRadius) continue;

        labels[nIdx] = label;
        dist[nIdx] = nd;
        queue[tail++] = nIdx;
      }
    }
  }

  return labels;
}

interface StoneRegion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  area: number;
  brightnessSum: number;
}

/** Single pass over the labeled image to pull out each stone's real contour bounding box. */
function extractRegions(labels: Int32Array, gray: Float32Array, width: number, height: number, count: number): StoneRegion[] {
  const regions: StoneRegion[] = Array.from({ length: count }, () => ({
    x1: width,
    y1: height,
    x2: -1,
    y2: -1,
    area: 0,
    brightnessSum: 0,
  }));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const label = labels[idx];
      if (label === 0) continue;
      const r = regions[label - 1];
      if (x < r.x1) r.x1 = x;
      if (x > r.x2) r.x2 = x;
      if (y < r.y1) r.y1 = y;
      if (y > r.y2) r.y2 = y;
      r.area++;
      r.brightnessSum += gray[idx];
    }
  }

  return regions.filter((r) => r.area > 0);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function detectDiamondsFromImage(
  imageUrl: string,
  originalWidth: number,
  originalHeight: number
): Promise<Diamond[]> {
  const img = await loadImage(imageUrl);

  const scale = Math.min(1, WORKING_MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const workW = Math.max(1, Math.round(img.naturalWidth * scale));
  const workH = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = workW;
  canvas.height = workH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, workW, workH);

  const imageData = ctx.getImageData(0, 0, workW, workH);
  const tileSize = Math.max(24, Math.round(workW / 16));
  const rawGray = boxBlur(toGrayscale(imageData), workW, workH, 1);
  const gray = boxBlur(localContrastNormalize(rawGray, workW, workH, tileSize), workW, workH, 1);

  // Threshold -> morphological open (drop speckle noise) -> close (seal tiny gaps within one stone)
  //
  // The mask needs *two* conditions, not just one: `gray` (locally
  // normalized) picks out pixels that stand out from their own
  // neighborhood, but a tile sitting entirely on a plain dark backdrop with
  // only a faint lighting gradient still has *some* local contrast — and
  // gets stretched to look "bright" purely relative to itself, producing
  // false-positive boxes floating on empty background. Requiring the raw,
  // un-stretched brightness to also clear an absolute floor screens those
  // out: real facet highlights are genuinely bright in absolute terms, a
  // dark backdrop's lighting gradient is not.
  const threshold = otsuThreshold(gray) + 10;
  const absoluteFloor = Math.max(65, otsuThreshold(rawGray) * 0.92);
  let mask = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) mask[i] = gray[i] >= threshold && rawGray[i] >= absoluteFloor ? 1 : 0;
  mask = morph(morph(mask, workW, workH, 1, "erode"), workW, workH, 1, "dilate"); // open
  mask = morph(morph(mask, workW, workH, 1, "dilate"), workW, workH, 1, "erode"); // close

  const baseDistance = Math.max(3, workW * 0.009);
  let peaks: Peak[] = [];
  let usedMinDistance = baseDistance;
  for (const factor of MIN_PEAK_DISTANCE_FACTORS) {
    usedMinDistance = baseDistance * factor;
    peaks = detectPeaks(gray, mask, workW, workH, usedMinDistance, MAX_PEAKS_TARGET);
    if (peaks.length >= MIN_PEAKS_TARGET) break;
  }
  if (peaks.length > MAX_PEAKS_TARGET) peaks = peaks.slice(0, MAX_PEAKS_TARGET);
  if (peaks.length === 0) return [];

  // "Watershed": grow each peak outward through the mask until fronts meet —
  // this is where touching stones actually get split into separate regions.
  //
  // Growth is capped, but *not* at the peak-spacing distance: elongated
  // stones (marquise, baguette) are 2-3x longer than they are wide, so a
  // cap tied to peak spacing (tuned for round-stone width) stops growth
  // partway down a marquise petal, leaving it truncated or missing
  // entirely — exactly what happened to the marquise flower motifs. This
  // cap is instead sized for one elongated stone's full length — generous
  // enough to reach a marquise tip, but still far short of an entire
  // under-peaked cluster, so the original giant-merged-blob failure stays
  // fixed too.
  const maxGrowthRadius = baseDistance * 2.4;
  const labels = watershedLabel(peaks, mask, workW, workH, maxGrowthRadius);
  const regions = extractRegions(labels, gray, workW, workH, peaks.length);

  const minArea = Math.max(3, workW * workH * 0.00006);
  const maxArea = workW * workH * 0.01;
  const maxAspect = 5;

  const filtered = regions.filter((r) => {
    const w = r.x2 - r.x1 + 1;
    const h = r.y2 - r.y1 + 1;
    const aspect = Math.max(w, h) / Math.max(1, Math.min(w, h));
    return r.area >= minArea && r.area <= maxArea && aspect <= maxAspect;
  });

  const scaleX = originalWidth / workW;
  const scaleY = originalHeight / workH;
  const headroom = Math.max(1, 255 - threshold);

  const diamonds: Diamond[] = filtered.map((r, i) => {
    const x1 = r.x1 * scaleX;
    const y1 = r.y1 * scaleY;
    const x2 = (r.x2 + 1) * scaleX;
    const y2 = (r.y2 + 1) * scaleY;
    const width = x2 - x1;
    const height = y2 - y1;

    const meanBrightness = r.brightnessSum / r.area;
    const brightnessScore = Math.min(1, Math.max(0, (meanBrightness - threshold) / headroom));
    const confidence = Math.min(0.99, 0.62 + brightnessScore * 0.36 + Math.random() * 0.03);
    const aspectRatio = Math.max(width, height) / Math.max(1, Math.min(width, height));

    return {
      id: i + 1,
      confidence: Number(confidence.toFixed(3)),
      width: Number(width.toFixed(1)),
      height: Number(height.toFixed(1)),
      x: Number(x1.toFixed(1)),
      y: Number(y1.toFixed(1)),
      bbox: {
        x1: Number(x1.toFixed(1)),
        y1: Number(y1.toFixed(1)),
        x2: Number(x2.toFixed(1)),
        y2: Number(y2.toFixed(1)),
      },
      area: Number((width * height).toFixed(1)),
      aspectRatio: Number(aspectRatio.toFixed(2)),
      cutType: cutTypeFor(aspectRatio),
      status: statusForConfidence(confidence),
    };
  });

  diamonds.sort((a, b) => b.area - a.area);
  diamonds.forEach((d, i) => (d.id = i + 1));

  return diamonds;
}
