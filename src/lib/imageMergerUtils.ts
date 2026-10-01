import { PDFDocument } from 'pdf-lib';

export type PageSize = 'A4' | 'A3' | 'Letter' | 'Custom' | 'AutoFit';
export type PageOrientation = 'portrait' | 'landscape';
export type LayoutMode = 'grid' | 'vertical' | 'horizontal';
export type ImageFit = 'contain' | 'cover' | 'fill';

export interface MergedCanvasConfig {
  pageSize: PageSize;
  orientation: PageOrientation;
  layoutMode: LayoutMode;
  columns: number;
  rows: number;
  padding: number; // Gap between images in px
  margin: number;  // Outer border margin in px
  backgroundColor: string; // Hex, rgba, or 'transparent'
  borderColor: string;
  borderWidth: number;
  borderRadius?: number;
  imageFit: ImageFit;
  customWidthPx?: number;
  customHeightPx?: number;
}

// Preset page dimensions at 150 DPI (crisp print/screen balance)
export const PAGE_DIMENSIONS_150DPI: Record<
  'A4' | 'A3' | 'Letter',
  { portrait: { width: number; height: number }; landscape: { width: number; height: number } }
> = {
  A4: {
    portrait: { width: 1240, height: 1754 },
    landscape: { width: 1754, height: 1240 },
  },
  A3: {
    portrait: { width: 1754, height: 2480 },
    landscape: { width: 2480, height: 1754 },
  },
  Letter: {
    portrait: { width: 1275, height: 1650 },
    landscape: { width: 1650, height: 1275 },
  },
};

/**
 * Loads an image from a File or Data URL into an HTMLImageElement,
 * optionally pre-applying rotation degrees.
 */
export function loadImageElement(
  source: string | File,
  rotationDegrees = 0
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined in SSR'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      const normalizedAngle = ((rotationDegrees % 360) + 360) % 360;
      if (normalizedAngle === 0) {
        resolve(img);
        return;
      }

      // Offscreen canvas rotation
      try {
        const rad = (normalizedAngle * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        const newWidth = Math.round(img.width * cos + img.height * sin);
        const newHeight = Math.round(img.width * sin + img.height * cos);

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(newWidth, 1);
        canvas.height = Math.max(newHeight, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img);
          return;
        }

        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const rotatedImg = new Image();
        rotatedImg.onload = () => resolve(rotatedImg);
        rotatedImg.onerror = () => resolve(img);
        rotatedImg.src = canvas.toDataURL('image/png');
      } catch {
        resolve(img);
      }
    };

    img.onload = handleLoad;
    img.onerror = () => reject(new Error('Failed to load image'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Draws a rounded rectangle path on a 2D canvas context.
 */
function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  if (r <= 0) {
    ctx.rect(x, y, width, height);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Creates a merged HTML5 canvas combining all passed images based on configuration.
 */
export async function createMergedCanvas(
  images: HTMLImageElement[],
  config: MergedCanvasConfig
): Promise<HTMLCanvasElement> {
  if (typeof document === 'undefined') {
    throw new Error('Canvas cannot be created in SSR environment');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context');
  }

  // 1. Calculate Grid Columns and Rows
  let effectiveCols = Math.max(1, config.columns || 1);
  let effectiveRows = Math.max(1, config.rows || 1);

  if (config.layoutMode === 'vertical') {
    effectiveCols = 1;
    effectiveRows = Math.max(1, images.length);
  } else if (config.layoutMode === 'horizontal') {
    effectiveCols = Math.max(1, images.length);
    effectiveRows = 1;
  } else {
    // Grid mode
    if (images.length > 0 && effectiveCols * effectiveRows < images.length) {
      effectiveRows = Math.ceil(images.length / effectiveCols);
    }
  }

  // 2. Determine Canvas Width and Height
  let canvasW = 1240;
  let canvasH = 1754;

  if (config.pageSize === 'Custom') {
    canvasW = Math.max(100, Math.min(8000, config.customWidthPx || 1200));
    canvasH = Math.max(100, Math.min(8000, config.customHeightPx || 1200));
  } else if (config.pageSize === 'AutoFit') {
    if (images.length === 0) {
      canvasW = 1200;
      canvasH = 1200;
    } else {
      // Estimate cell dimensions from average image sizes
      const avgW = Math.round(images.reduce((sum, img) => sum + img.width, 0) / images.length);
      const avgH = Math.round(images.reduce((sum, img) => sum + img.height, 0) / images.length);
      const targetCellW = Math.min(Math.max(avgW, 300), 1200);
      const targetCellH = Math.min(Math.max(avgH, 300), 1200);

      canvasW = 2 * config.margin + effectiveCols * targetCellW + (effectiveCols - 1) * config.padding;
      canvasH = 2 * config.margin + effectiveRows * targetCellH + (effectiveRows - 1) * config.padding;
    }
  } else {
    // Standard Presets (A4, A3, Letter)
    const dim = PAGE_DIMENSIONS_150DPI[config.pageSize];
    const orientationDim = dim ? dim[config.orientation] : PAGE_DIMENSIONS_150DPI.A4.portrait;
    canvasW = orientationDim.width;
    canvasH = orientationDim.height;
  }

  canvas.width = Math.round(canvasW);
  canvas.height = Math.round(canvasH);

  // 3. Fill Background
  if (config.backgroundColor && config.backgroundColor !== 'transparent') {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (images.length === 0) {
    return canvas;
  }

  // 4. Calculate Cell Dimensions
  const totalMarginX = 2 * config.margin;
  const totalMarginY = 2 * config.margin;
  const totalPaddingX = (effectiveCols - 1) * config.padding;
  const totalPaddingY = (effectiveRows - 1) * config.padding;

  const availW = canvas.width - totalMarginX - totalPaddingX;
  const availH = canvas.height - totalMarginY - totalPaddingY;

  const cellW = Math.max(10, availW / effectiveCols);
  const cellH = Math.max(10, availH / effectiveRows);

  const radius = config.borderRadius ?? 0;
  const bWidth = config.borderWidth ?? 0;
  const bColor = config.borderColor ?? '#d8cfb8';

  // 5. Draw each image into its designated cell
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const colIdx = i % effectiveCols;
    const rowIdx = Math.floor(i / effectiveCols);

    const cellX = config.margin + colIdx * (cellW + config.padding);
    const cellY = config.margin + rowIdx * (cellH + config.padding);

    ctx.save();

    // Clip to rounded rectangle if border radius is set
    if (radius > 0) {
      drawRoundedRectPath(ctx, cellX, cellY, cellW, cellH, radius);
      ctx.clip();
    }

    // Render image with selected fit mode
    if (config.imageFit === 'fill') {
      ctx.drawImage(img, 0, 0, img.width, img.height, cellX, cellY, cellW, cellH);
    } else if (config.imageFit === 'cover') {
      const imgRatio = img.width / img.height;
      const cellRatio = cellW / cellH;

      let srcX = 0;
      let srcY = 0;
      let srcW = img.width;
      let srcH = img.height;

      if (imgRatio > cellRatio) {
        // Image is wider than cell: crop sides
        srcW = img.height * cellRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        // Image is taller than cell: crop top & bottom
        srcH = img.width / cellRatio;
        srcY = (img.height - srcH) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, cellX, cellY, cellW, cellH);
    } else {
      // 'contain' mode: keep whole image visible with aspect ratio preserved
      const imgRatio = img.width / img.height;
      const cellRatio = cellW / cellH;

      let destW = cellW;
      let destH = cellH;
      let destX = cellX;
      let destY = cellY;

      if (imgRatio > cellRatio) {
        destW = cellW;
        destH = cellW / imgRatio;
        destY = cellY + (cellH - destH) / 2;
      } else {
        destH = cellH;
        destW = cellH * imgRatio;
        destX = cellX + (cellW - destW) / 2;
      }

      ctx.drawImage(img, 0, 0, img.width, img.height, destX, destY, destW, destH);
    }

    ctx.restore();

    // Draw Cell Border Stroke (if specified)
    if (bWidth > 0 && bColor) {
      ctx.save();
      ctx.lineWidth = bWidth;
      ctx.strokeStyle = bColor;
      drawRoundedRectPath(ctx, cellX, cellY, cellW, cellH, radius);
      ctx.stroke();
      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Triggers client-side browser file download from Blob URL.
 */
function triggerDownload(url: string, filename: string) {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Exports canvas to PNG, JPEG, or print-ready PDF using pdf-lib.
 */
export async function exportCanvasToFormat(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' | 'application/pdf',
  quality = 0.92,
  filename = 'merged-layout'
): Promise<void> {
  if (typeof document === 'undefined') return;

  const cleanQuality = Math.min(Math.max(quality, 0.2), 1.0);

  // PDF Export
  if (format === 'application/pdf') {
    const pdfDoc = await PDFDocument.create();

    // Prepare JPEG dataURL for optimal PDF embedding
    let exportCanvas = canvas;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      exportCanvas = tempCanvas;
    }

    const dataUrl = exportCanvas.toDataURL('image/jpeg', cleanQuality);
    const res = await fetch(dataUrl);
    const imageBytes = await res.arrayBuffer();
    const embeddedImage = await pdfDoc.embedJpg(imageBytes);

    // PDF point dimension: 1 pt = 1/72 inch (scale 150 DPI canvas by 72/150 = 0.48 or 0.75)
    const ptWidth = Math.round(canvas.width * 0.72);
    const ptHeight = Math.round(canvas.height * 0.72);

    const page = pdfDoc.addPage([ptWidth, ptHeight]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: ptWidth,
      height: ptHeight,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.pdf`);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return;
  }

  // PNG or JPEG Export
  const mimeType = format === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'image/jpeg' ? 'jpg' : 'png';

  let exportCanvas = canvas;
  if (format === 'image/jpeg') {
    // Fill transparent regions with white for JPEG
    exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(canvas, 0, 0);
    }
  }

  exportCanvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.${ext}`);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    },
    mimeType,
    cleanQuality
  );
}

/**
 * Format bytes to readable string in Bengali.
 */
export function formatBytesBengali(bytes: number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (val: number | string) => String(val).replace(/\d/g, (d) => banglaDigits[Number(d)] ?? d);

  if (bytes < 1024) return `${toBn(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${toBn(kb.toFixed(1))} KB`;
  const mb = kb / 1024;
  return `${toBn(mb.toFixed(2))} MB`;
}

/**
 * Convert numbers to Bengali digits.
 */
export function toBanglaDigits(val: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => banglaDigits[Number(d)] ?? d);
}
