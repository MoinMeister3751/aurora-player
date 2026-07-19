export interface AmbientPalette {
  primary: string;
  secondary: string;
}

const cache = new Map<string, AmbientPalette>();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hn = h / 360;
  const r = hue2rgb(p, q, hn + 1 / 3);
  const g = hue2rgb(p, q, hn);
  const b = hue2rgb(p, q, hn - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Pushes a sampled color into a visible "glow" range so the ambient
 *  background reads as clearly tinted by the art even when the source
 *  pixels are muted, while still following the art's actual hue. */
function toGlowColor(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b);
  const boostedS = Math.min(1, Math.max(s, 0.35));
  const boostedL = Math.min(0.58, Math.max(l, 0.22));
  const [gr, gg, gb] = hslToRgb(h, boostedS, boostedL);
  return `rgb(${gr}, ${gg}, ${gb})`;
}

/**
 * Samples an album cover image and derives a two-tone ambient palette for
 * the background glow: buckets pixels into a coarse color histogram, then
 * picks the two most prominent, sufficiently-distinct dominant colors
 * (weighted towards saturation so a vivid accent in the art isn't
 * drowned out by a large neutral background). Runs purely client-side on
 * an in-memory canvas — the source image is never written to disk,
 * matching the no-caching stance documented in the README.
 */
export async function extractAmbientPalette(imageUrl: string): Promise<AmbientPalette> {
  const cached = cache.get(imageUrl);
  if (cached) return cached;

  const palette = await (async (): Promise<AmbientPalette> => {
    try {
      // Fetch the raw bytes ourselves and decode via createImageBitmap
      // instead of a DOM <img crossorigin> element: album art is also
      // rendered as a plain <img> elsewhere (no crossOrigin) for the same
      // URL, and browsers can serve that cached non-CORS response to a
      // crossOrigin="anonymous" Image() too, silently tainting the canvas
      // and making every extraction fail into the dark fallback below.
      // A bitmap decoded from bytes we already hold can never taint the
      // canvas, regardless of the source's CORS headers or cache state.
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`cover fetch failed: ${response.status}`);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      const canvas = document.createElement("canvas");
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(bitmap, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      const BUCKET = 24;
      const buckets = new Map<
        string,
        { r: number; g: number; b: number; n: number; sat: number }
      >();

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 200) continue;
        const key = `${Math.round(r / BUCKET)}-${Math.round(g / BUCKET)}-${Math.round(b / BUCKET)}`;
        const [, s] = rgbToHsl(r, g, b);
        const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, sat: 0 };
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        bucket.sat += s;
        bucket.n += 1;
        buckets.set(key, bucket);
      }

      const candidates = Array.from(buckets.values())
        .map((b) => ({
          r: b.r / b.n,
          g: b.g / b.n,
          b: b.b / b.n,
          weight: b.n,
          avgSat: b.sat / b.n,
        }))
        // Favor dominant colors, but let saturated accents compete with
        // larger neutral areas instead of always losing on pixel count.
        .sort((a, b) => b.weight * (0.5 + b.avgSat) - a.weight * (0.5 + a.avgSat));

      const distinct: typeof candidates = [];
      for (const c of candidates) {
        if (
          distinct.every(
            (d) => Math.abs(d.r - c.r) + Math.abs(d.g - c.g) + Math.abs(d.b - c.b) > 60,
          )
        ) {
          distinct.push(c);
        }
        if (distinct.length === 2) break;
      }

      if (distinct.length === 0) {
        throw new Error("no candidate colors");
      }
      const [first, second] = [distinct[0], distinct[1] ?? distinct[0]];

      return {
        primary: toGlowColor(first.r, first.g, first.b),
        secondary: toGlowColor(second.r, second.g, second.b),
      };
    } catch (err) {
      console.warn("Ambient palette extraction failed, using fallback:", err);
      return { primary: "#2a2a30", secondary: "#141417" };
    }
  })();

  cache.set(imageUrl, palette);
  return palette;
}
