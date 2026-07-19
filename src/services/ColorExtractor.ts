export interface AmbientPalette {
  primary: string;
  secondary: string;
}

const cache = new Map<string, AmbientPalette>();

/**
 * Samples an album cover image and derives a two-tone ambient palette for
 * the background glow. Runs purely client-side on an in-memory canvas —
 * the source image is never written to disk, matching the no-caching
 * stance documented in the README.
 */
export async function extractAmbientPalette(imageUrl: string): Promise<AmbientPalette> {
  const cached = cache.get(imageUrl);
  if (cached) return cached;

  const palette = await new Promise<AmbientPalette>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r1 = 0, g1 = 0, b1 = 0;
        let r2 = 0, g2 = 0, b2 = 0;
        let n1 = 0, n2 = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const pixelIndex = i / 4;
          const y = Math.floor(pixelIndex / size);
          if (y < size / 2) {
            r1 += r; g1 += g; b1 += b; n1++;
          } else {
            r2 += r; g2 += g; b2 += b; n2++;
          }
        }

        const primary = `rgb(${Math.round(r1 / n1)}, ${Math.round(g1 / n1)}, ${Math.round(b1 / n1)})`;
        const secondary = `rgb(${Math.round(r2 / n2)}, ${Math.round(g2 / n2)}, ${Math.round(b2 / n2)})`;
        resolve({ primary, secondary });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Cover konnte nicht geladen werden."));
    img.src = imageUrl;
  }).catch<AmbientPalette>(() => ({ primary: "#18181b", secondary: "#09090b" }));

  cache.set(imageUrl, palette);
  return palette;
}
