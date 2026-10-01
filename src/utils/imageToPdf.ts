import { PDFDocument } from 'pdf-lib';

export type PageSizeOption = 'a4' | 'letter' | 'fit';
export type OrientationOption = 'portrait' | 'landscape' | 'auto';
export type MarginOption = 'none' | 'small' | 'normal';

export interface ImageToPdfItem {
  id: string;
  name: string;
  sizeBytes: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ImageToPdfOptions {
  pageSize: PageSizeOption;
  orientation: OrientationOption;
  margin: MarginOption;
  imageQuality?: number; // 0.1 to 1.0 (default 0.92)
}

const PAGE_DIMENSIONS: Record<'a4' | 'letter', { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

const MARGIN_SIZES: Record<MarginOption, number> = {
  none: 0,
  small: 20,
  normal: 36,
};

/**
 * Loads an image from dataURL into an HTMLImageElement
 */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Converts an image element to a clean JPEG ArrayBuffer via canvas
 * Ensures background is white (no black transparency) and standard JPEG encoding.
 */
export async function imageToJpegBuffer(img: HTMLImageElement, quality = 0.92): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas 2D context');

  // Fill white background for transparent PNGs/WebPs
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'));
          return;
        }
        const arrayBuf = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuf));
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Generates a PDF Document from a list of images using pdf-lib
 */
export async function generatePdfFromImages(
  images: ImageToPdfItem[],
  options: ImageToPdfOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('কমপক্ষে একটি ছবি যোগ করতে হবে।');
  }

  const pdfDoc = await PDFDocument.create();
  const margin = MARGIN_SIZES[options.margin];
  const quality = options.imageQuality ?? 0.92;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    onProgress?.(i + 1, images.length);

    // 1. Load image and convert to JPEG Uint8Array
    const imgEl = await loadImageElement(item.dataUrl);
    const jpegBytes = await imageToJpegBuffer(imgEl, quality);
    const embeddedImg = await pdfDoc.embedJpg(jpegBytes);

    const imgWidth = embeddedImg.width;
    const imgHeight = embeddedImg.height;

    // 2. Determine target page width and height
    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'fit') {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      const baseDim = PAGE_DIMENSIONS[options.pageSize];
      const isImageLandscape = imgWidth > imgHeight;

      let isLandscape = false;
      if (options.orientation === 'landscape') {
        isLandscape = true;
      } else if (options.orientation === 'auto') {
        isLandscape = isImageLandscape;
      }

      pageWidth = isLandscape ? Math.max(baseDim.width, baseDim.height) : Math.min(baseDim.width, baseDim.height);
      pageHeight = isLandscape ? Math.min(baseDim.width, baseDim.height) : Math.max(baseDim.width, baseDim.height);
    }

    // 3. Compute scaled image size preserving aspect ratio within page margins
    const availWidth = Math.max(1, pageWidth - margin * 2);
    const availHeight = Math.max(1, pageHeight - margin * 2);

    const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;

    // Center image on the page
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    // 4. Add page and draw image
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImg, {
      x,
      y,
      width: renderWidth,
      height: renderHeight,
    });
  }

  return await pdfDoc.save();
}

/**
 * Formats file size in readable KB / MB
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
