import React, { useState, useRef, useEffect, useMemo, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Upload,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  Sliders,
  ShieldCheck,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { PresetProfile } from '../types.ts';
import { GOVERNMENT_PRESET_PROFILES } from '../constants/presets.ts';
import { resizeImage } from '../utils/imageResize.ts';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/photo-resizer.json';

const ACCEPTED_UPLOAD_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_UPLOAD_MB = 15;

export const PhotoResizerPage: React.FC = () => {
  // Preset selection
  const [selectedPreset, setSelectedPreset] = useState<string>('bcs_govt_photo');
  const [customWidth, setCustomWidth] = useState<number>(300);
  const [customHeight, setCustomHeight] = useState<number>(300);
  const [customMaxKb, setCustomMaxKb] = useState<number>(100);
  const [customFormat, setCustomFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');

  // Image source state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalMeta, setOriginalMeta] = useState<{
    name: string;
    width: number;
    height: number;
    sizeKb: number;
  } | null>(null);

  // Transform controls
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [backgroundColor] = useState<string>('#ffffff');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Result state
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<{
    width: number;
    height: number;
    sizeKb: number;
    format: string;
    qualityUsed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Determine active parameters
  const currentPreset = useMemo(() => {
    return GOVERNMENT_PRESET_PROFILES.find((p) => p.id === selectedPreset);
  }, [selectedPreset]);

  const activeWidth = currentPreset ? currentPreset.width : customWidth;
  const activeHeight = currentPreset ? currentPreset.height : customHeight;
  const activeMaxKb = currentPreset ? currentPreset.maxSizeKb : customMaxKb;
  const activeFormat = currentPreset ? currentPreset.format : customFormat;

  // Set default sample image on first load
  useEffect(() => {
    loadSampleImage('photo');
  }, []);

  // Handle Preset change
  const handlePresetSelect = (id: string) => {
    setSelectedPreset(id);
    const preset = GOVERNMENT_PRESET_PROFILES.find((p) => p.id === id);
    if (preset) {
      if (preset.id === 'govt_signature') {
        loadSampleImage('signature');
      } else {
        if (originalMeta?.name.includes('স্বাক্ষর')) {
          loadSampleImage('photo');
        }
      }
    }
  };

  // Helper to load sample portrait or signature
  const loadSampleImage = (type: 'photo' | 'signature') => {
    const canvas = document.createElement('canvas');
    if (type === 'signature') {
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 200);

        ctx.fillStyle = '#083f2a';
        ctx.font = 'italic 52px "Hind Siliguri", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Md. Rafiqul Islam', 300, 90);

        ctx.strokeStyle = '#083f2a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, 130);
        ctx.bezierCurveTo(240, 160, 360, 120, 460, 140);
        ctx.stroke();

        ctx.font = '16px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#6b6255';
        ctx.fillText('(নমুনা স্বাক্ষর - প্রিভিউ টেস্ট)', 300, 175);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageSrc(dataUrl);
      setOriginalMeta({
        name: 'নমুনা_স্বাক্ষর.jpg',
        width: 600,
        height: 200,
        sizeKb: 42
      });
    } else {
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Subtle gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, 640);
        grad.addColorStop(0, '#f0f4f8');
        grad.addColorStop(1, '#d9e2ec');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 640);

        // Body silhouette
        ctx.fillStyle = '#102a43';
        ctx.beginPath();
        ctx.ellipse(320, 560, 200, 160, 0, 0, Math.PI * 2);
        ctx.fill();

        // Collar/Tie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(270, 420);
        ctx.lineTo(320, 500);
        ctx.lineTo(370, 420);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0c5c3d';
        ctx.beginPath();
        ctx.moveTo(310, 440);
        ctx.lineTo(330, 440);
        ctx.lineTo(325, 540);
        ctx.lineTo(315, 540);
        ctx.closePath();
        ctx.fill();

        // Head/Face silhouette
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.ellipse(320, 300, 110, 140, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1f2933';
        ctx.beginPath();
        ctx.ellipse(320, 230, 115, 80, 0, 0, Math.PI);
        ctx.fill();

        // Label
        ctx.fillStyle = '#334e68';
        ctx.font = '22px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('নমুনা পাসপোর্ট ছবি (পাসপোর্ট / বিসিএস প্রিসেট)', 320, 80);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageSrc(dataUrl);
      setOriginalMeta({
        name: 'নমুনা_ছবি.jpg',
        width: 640,
        height: 640,
        sizeKb: 68
      });
    }

    // Reset transformations
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Handle File Upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);

    if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
      setUploadError('শুধুমাত্র JPG, PNG বা WebP ছবি আপলোড করা যাবে।');
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setUploadError(`ছবির সর্বোচ্চ আকার ${MAX_UPLOAD_MB} MB; এই ফাইলটি ${(file.size / (1024 * 1024)).toFixed(1)} MB।`);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('ফাইলটি পড়া যায়নি। অন্য একটি ছবি চেষ্টা করুন।');
    };
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        setUploadError('ছবিটি খোলা যায়নি (ফাইলটি ক্ষতিগ্রস্ত হতে পারে)।');
      };
      img.onload = () => {
        setImageSrc(dataUrl);
        setOriginalMeta({
          name: file.name,
          width: img.width,
          height: img.height,
          sizeKb: Number((file.size / 1024).toFixed(1))
        });
        setZoom(1);
        setRotation(0);
        setOffsetX(0);
        setOffsetY(0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Load the raw source image into imgElementRef whenever a new image is
  // selected — this does NOT trigger processing, it just makes the image
  // available for the live crop-stage preview and for the manual Process step
  const [imageReadyTick, setImageReadyTick] = useState<number>(0);
  useEffect(() => {
    if (!imageSrc) {
      imgElementRef.current = null;
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imgElementRef.current = img;
      setImageReadyTick((t) => t + 1);
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  // Any change to the image or crop/zoom/output settings invalidates the
  // previously processed result — the user must click "প্রসেস করুন" again to
  // (re)generate the actual resized/compressed output. Nothing is auto-run.
  useEffect(() => {
    setResultDataUrl(null);
    setResultMeta(null);
  }, [
    imageSrc,
    activeWidth,
    activeHeight,
    activeMaxKb,
    activeFormat,
    zoom,
    rotation,
    offsetX,
    offsetY,
    fitMode,
    backgroundColor
  ]);

  // Main 100% Client-Side Image Processing Routine with Binary Search Optimization
  // Runs only when the user explicitly clicks the Process button.
  const processImage = () => {
    if (!imageSrc || !imgElementRef.current) return;
    setIsProcessing(true);

    try {
      const result = resizeImage(imgElementRef.current, {
        width: activeWidth,
        height: activeHeight,
        maxKb: activeMaxKb,
        format: activeFormat,
        fitMode,
        backgroundColor,
        zoom,
        rotation,
        offsetX,
        offsetY
      });

      setResultDataUrl(result.dataUrl);
      setResultMeta({
        width: result.width,
        height: result.height,
        sizeKb: result.sizeKb,
        format: result.format,
        qualityUsed: result.qualityUsed
      });
    } catch (err) {
      console.error('Client-side processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement('a');
    const ext = activeFormat === 'png' ? 'png' : activeFormat === 'webp' ? 'webp' : 'jpg';
    link.download = `utools-bd-${activeWidth}x${activeHeight}-${selectedPreset}.${ext}`;
    link.href = resultDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if output complies with Govt specs
  const isCompliant = useMemo(() => {
    if (!resultMeta) return false;
    const correctDims = resultMeta.width === activeWidth && resultMeta.height === activeHeight;
    const correctSize = activeMaxKb ? resultMeta.sizeKb <= activeMaxKb : true;
    return correctDims && correctSize;
  }, [resultMeta, activeWidth, activeHeight, activeMaxKb]);

  // Display-frame pixel size for the output preview box (mirrors the CSS box
  // sizing below so drag/zoom math converts screen px <-> canvas px correctly)
  const frameWidthPx = activeHeight < 150 ? 300 : activeWidth > 350 ? 240 : activeWidth;
  const frameHeightPx =
    activeHeight < 150 ? 80 : activeHeight > 350 ? (240 * activeHeight) / activeWidth : activeHeight;

  // Live geometry for the draggable crop-stage image: replicates the same
  // cover/contain/fill + zoom + offset math as resizeImage(), but computed in
  // display pixels so it can be rendered instantly via CSS (no re-encode).
  const liveCropGeometry = useMemo(() => {
    const srcImg = imgElementRef.current;
    if (!srcImg || !imageSrc) return null;

    const srcW = srcImg.naturalWidth || srcImg.width || activeWidth;
    const srcH = srcImg.naturalHeight || srcImg.height || activeHeight;

    let drawW = activeWidth;
    let drawH = activeHeight;
    if (fitMode === 'cover') {
      const scale = Math.max(activeWidth / srcW, activeHeight / srcH);
      drawW = srcW * scale;
      drawH = srcH * scale;
    } else if (fitMode === 'contain') {
      const scale = Math.min(activeWidth / srcW, activeHeight / srcH);
      drawW = srcW * scale;
      drawH = srcH * scale;
    }

    const scaleX = frameWidthPx / activeWidth;
    const scaleY = frameHeightPx / activeHeight;
    const imgW = drawW * zoom * scaleX;
    const imgH = drawH * zoom * scaleY;
    const centerX = frameWidthPx / 2 + offsetX * scaleX;
    const centerY = frameHeightPx / 2 + offsetY * scaleY;

    return { imgW, imgH, left: centerX - imgW / 2, top: centerY - imgH / 2 };
    // imageReadyTick is included so this recomputes once imgElementRef is
    // populated after an image finishes loading (the ref itself isn't reactive)
  }, [imageSrc, imageReadyTick, fitMode, zoom, offsetX, offsetY, activeWidth, activeHeight, frameWidthPx, frameHeightPx]);

  // Drag-to-reposition directly on the preview: pointer events unify mouse & touch
  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY
    };
    setIsDragging(true);
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const scaleX = frameWidthPx / activeWidth;
    const scaleY = frameHeightPx / activeHeight;
    const deltaXpx = e.clientX - drag.startClientX;
    const deltaYpx = e.clientY - drag.startClientY;

    const newOffsetX = Math.round(
      Math.max(-150, Math.min(150, drag.startOffsetX + deltaXpx / scaleX))
    );
    const newOffsetY = Math.round(
      Math.max(-150, Math.min(150, drag.startOffsetY + deltaYpx / scaleY))
    );
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
  };

  const handlePreviewPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      dragStateRef.current = null;
      setIsDragging(false);
    }
  };

  // Scroll-to-zoom directly on the preview (attached natively so preventDefault
  // reliably stops the page from scrolling while zooming)
  useEffect(() => {
    const el = previewFrameRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!imageSrc) return;
      e.preventDefault();
      setZoom((z) => {
        const next = z - e.deltaY * 0.001;
        return Math.max(0.5, Math.min(2.5, Number(next.toFixed(2))));
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [imageSrc]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta
          name="description"
          content={pageContent.metaDescription}
        />
        <link rel="canonical" href="https://utools.bd/photo-resizer" />
        <meta
          property="og:title"
          content={pageContent.metaTitle}
        />
        <meta
          property="og:description"
          content={pageContent.metaDescription}
        />
        <meta property="og:url" content="https://utools.bd/photo-resizer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta
          name="twitter:description"
          content={pageContent.metaDescription}
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
      </Helmet>

      {/* Top Breadcrumb & Privacy Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরুন</span>
          </Link>
        </div>

        {/* 100% Client-Side Privacy Badge */}
        <div className="flex items-center space-x-2 text-xs font-medium text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1.5 shadow-xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>১০০% ক্লায়েন্ট-সাইড ব্রাউজার প্রসেসিং (গোপনীয়তা সুরক্ষিত, নো সার্ভার আপলোড)</span>
        </div>
      </div>

      {/* Page Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-sm text-[#34443B] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Preset Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#084A2E] uppercase tracking-wider block font-serif">
          {pageContent.presetStepTitle}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {GOVERNMENT_PRESET_PROFILES.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.id)}
                className={`text-left p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E] shadow-sm'
                    : 'bg-[#FFFFFF] hover:bg-[#F0F4F2] border-[#D5E4DB] text-[#0F1F17]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 truncate max-w-[110px] ${
                        isSelected ? 'bg-[#0B5D3B] text-[#FFFFFF]' : 'bg-[#F0F4F2] text-[#084A2E]'
                      }`}
                      title={p.org}
                    >
                      {p.org}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFFFFF] shrink-0" />}
                  </div>
                  <h3 className="font-semibold text-xs leading-snug font-serif mb-1">
                    {p.name}
                  </h3>
                </div>
                <div className="pt-2 mt-2 border-t border-current/20 flex items-center justify-between text-[11px] font-mono">
                  <span>{p.width}×{p.height} px</span>
                  <span>≤ {p.maxSizeKb} KB</span>
                </div>
              </button>
            );
          })}

          {/* Custom Option */}
          <button
            type="button"
            onClick={() => setSelectedPreset('custom')}
            className={`text-left p-3 border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPreset === 'custom'
                ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                : 'bg-[#FFFFFF] hover:bg-[#F0F4F2] border-[#D5E4DB] text-[#0F1F17]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 ${
                    selectedPreset === 'custom' ? 'bg-[#0B5D3B] text-[#FFFFFF]' : 'bg-[#F0F4F2] text-[#084A2E]'
                  }`}
                >
                  CUSTOM
                </span>
                {selectedPreset === 'custom' && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFFFFF]" />}
              </div>
              <h3 className="font-semibold text-xs leading-snug font-serif mb-1">
                কাস্টম সাইজ ও কম্প্রেশন
              </h3>
            </div>
            <div className="pt-2 mt-2 border-t border-current/20 text-[11px] font-mono">
              ইচ্ছামতো px ও KB নির্ধারণ
            </div>
          </button>
        </div>
      </div>

      {/* Custom Parameters Form (When custom selected) */}
      {selectedPreset === 'custom' && (
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs rounded-2xl">
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">প্রস্থ (Width - পিক্সেল):</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-full p-2 border border-[#D5E4DB] bg-[#F0F4F2]/30 font-mono text-sm focus:outline-none focus:border-[#0B5D3B] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">উচ্চতা (Height - পিক্সেল):</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-full p-2 border border-[#D5E4DB] bg-[#F0F4F2]/30 font-mono text-sm focus:outline-none focus:border-[#0B5D3B] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">সর্বোচ্চ ফাইল সাইজ (Max KB):</label>
            <input
              type="number"
              value={customMaxKb}
              onChange={(e) => setCustomMaxKb(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-full p-2 border border-[#D5E4DB] bg-[#F0F4F2]/30 font-mono text-sm focus:outline-none focus:border-[#0B5D3B] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">ফরম্যাট (Format):</label>
            <select
              value={customFormat}
              onChange={(e) => setCustomFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
              className="w-full p-2 border border-[#D5E4DB] bg-[#F0F4F2]/30 text-sm focus:outline-none focus:border-[#0B5D3B] rounded-lg"
            >
              <option value="jpeg">JPEG (.jpg) - সরকারি মান</option>
              <option value="png">PNG (.png)</option>
              <option value="webp">WebP (.webp)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Workspace: 2 Side-by-Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Side: Upload & Adjustment Studio */}
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 flex flex-col justify-between space-y-6 rounded-2xl">
          <div className="space-y-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <FileImage className="w-4 h-4 text-[#0B5D3B]" />
                <span>২. ইনপুট ছবি ও পজিশনিং</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => loadSampleImage('photo')}
                  className="text-[11px] text-[#084A2E] hover:underline cursor-pointer"
                >
                  নমুনা ছবি
                </button>
                <span className="text-[#D5E4DB]">|</span>
                <button
                  type="button"
                  onClick={() => loadSampleImage('signature')}
                  className="text-[11px] text-[#084A2E] hover:underline cursor-pointer"
                >
                  নমুনা স্বাক্ষর
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D5E4DB] hover:border-[#0B5D3B] bg-[#F0F4F2]/30 hover:bg-[#F0F4F2]/60 p-4 text-center cursor-pointer transition-colors rounded-2xl"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-[#084A2E]" />
              <div className="text-xs font-semibold text-[#084A2E]">
                ছবি নির্বাচন করতে ক্লিক করুন অথবা এখানে টেনে আনুন
              </div>
              <div className="text-[11px] text-[#4A5A52] mt-1 font-mono">
                JPG, PNG, WebP (ব্রাউজার মেমোরিতে নিরাপদে প্রসেস হবে)
              </div>
            </div>

            {uploadError && (
              <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] p-2.5 flex items-start space-x-2 text-xs rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Original Metadata Tag */}
            {originalMeta && (
              <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-2.5 flex items-center justify-between text-xs font-mono rounded-lg">
                <span className="truncate max-w-[200px] text-[#0F1F17]" title={originalMeta.name}>
                  {originalMeta.name}
                </span>
                <span className="text-[#4A5A52]">
                  মূল: {originalMeta.width}×{originalMeta.height} px | {originalMeta.sizeKb} KB
                </span>
              </div>
            )}

            {/* Interactive Crop / Pan / Zoom Sliders */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-[#084A2E] font-semibold">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>ক্রপ ও জুম নিয়ন্ত্রণ:</span>
                </span>
                <span className="font-mono text-[11px] text-[#4A5A52]">{Math.round(zoom * 100)}%</span>
              </div>

              {/* Zoom Slider */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                  disabled={zoom <= 0.5}
                  aria-label="জুম আউট"
                  className="shrink-0 p-1 rounded-md hover:bg-[#D5E4DB]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4 text-[#4A5A52]" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#0B5D3B]"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
                  disabled={zoom >= 2.5}
                  aria-label="জুম ইন"
                  className="shrink-0 p-1 rounded-md hover:bg-[#D5E4DB]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4 text-[#4A5A52]" />
                </button>
              </div>

              {/* Pan Horizontal & Vertical */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <div className="flex justify-between text-[#4A5A52] mb-1">
                    <span>অনুভূমিক সরান (X):</span>
                    <span className="font-mono">{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="2"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                    className="w-full accent-[#0B5D3B]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[#4A5A52] mb-1">
                    <span>উল্লম্ব সরান (Y):</span>
                    <span className="font-mono">{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="2"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                    className="w-full accent-[#0B5D3B]"
                  />
                </div>
              </div>

              {/* Rotate & Reset row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D5E4DB] text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#084A2E]" />
                    <span>৯০° ঘোরান ({rotation}°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#084A2E]" />
                    <span>রিসেট</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-[#4A5A52]">ফিট মোড:</label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as 'cover' | 'contain' | 'fill')}
                    className="border border-[#D5E4DB] bg-[#F0F4F2]/30 px-2 py-1 text-xs focus:outline-none rounded-lg"
                  >
                    <option value="cover">ফিল ও ক্রপ (Fill/Cover)</option>
                    <option value="contain">সম্পূর্ণ ছবি (Contain)</option>
                    <option value="fill">টান টান (Stretch)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines hint */}
          <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3 text-xs font-medium text-[#34443B] leading-relaxed rounded-2xl">
            💡 <strong>টিপস:</strong> সরকারি চাকরি ও বিসিএস আবেদনে ছবির ব্যাকগ্রাউন্ড সাদা বা হালকা একরঙা হতে হবে।
            স্বাক্ষরের জন্য সাদা কাগজে কালো কালির কলম দিয়ে স্বাক্ষর করে ছবি তুলে এখানে ক্রপ করুন।
          </div>
        </div>

        {/* Right Side: Processed Output Preview & Compliance */}
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 flex flex-col justify-between space-y-6 rounded-2xl">
          <div className="space-y-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0B5D3B]" />
                <span>৩. চূড়ান্ত আউটপুট ও ভেরিফিকেশন</span>
              </span>
              <div className="text-[11px] font-mono text-[#0B5D3B] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span>ক্যানভাস বাইনারি অপ্টিমাইজার</span>
              </div>
            </div>

            {/* Compliance Badge Banner */}
            <div
              className={`p-3 border flex items-center justify-between text-xs ${
                !resultMeta
                  ? 'bg-[#F0F4F2] border-[#D5E4DB] text-[#0F1F17]'
                  : isCompliant
                  ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                  : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
              }`}
            >
              <div className="flex items-center space-x-2">
                {!resultMeta ? (
                  <Sliders className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                ) : isCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />
                )}
                <div>
                  <div className="font-semibold">
                    {!resultMeta
                      ? 'ক্রপ ও জুম ঠিক করে "প্রসেস করুন" বাটনে ক্লিক করুন'
                      : isCompliant
                      ? 'সরকারি আবেদনের মানদণ্ড অনুযায়ী প্রস্তুত ✓'
                      : 'সাইজ বা পরিমাপ যাচাই করুন'}
                  </div>
                  <div className="text-[11px] opacity-80 font-mono">
                    নির্ধারিত: {activeWidth}×{activeHeight} px | অনূর্ধ্ব {activeMaxKb} KB
                  </div>
                </div>
              </div>

              {resultMeta && (
                <div className="text-right font-mono">
                  <div className="font-bold">{resultMeta.sizeKb} KB</div>
                  <div className="text-[10px] opacity-75">{resultMeta.format}</div>
                </div>
              )}
            </div>

            {/* Visual Canvas Display Frame */}
            <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden rounded-2xl">
              {isProcessing && (
                <div className="absolute inset-0 bg-[#FFFFFF]/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-2 text-xs text-[#084A2E]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0B5D3B]" />
                  <span>ছবি অপ্টিমাইজেশন চলছে...</span>
                </div>
              )}

              {imageSrc ? (
                <div className="flex flex-col items-center space-y-3">
                  <div
                    ref={previewFrameRef}
                    onPointerDown={handlePreviewPointerDown}
                    onPointerMove={handlePreviewPointerMove}
                    onPointerUp={handlePreviewPointerUp}
                    onPointerCancel={handlePreviewPointerUp}
                    className="relative border-2 border-[#084A2E] shadow-sm overflow-hidden rounded-lg select-none"
                    style={{
                      width: `${frameWidthPx}px`,
                      height: `${frameHeightPx}px`,
                      backgroundColor,
                      touchAction: 'none',
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                  >
                    {liveCropGeometry && (
                      <img
                        src={imageSrc}
                        alt="Crop preview"
                        draggable={false}
                        className="absolute pointer-events-none"
                        style={{
                          width: `${liveCropGeometry.imgW}px`,
                          height: `${liveCropGeometry.imgH}px`,
                          left: `${liveCropGeometry.left}px`,
                          top: `${liveCropGeometry.top}px`,
                          transform: `rotate(${rotation}deg)`,
                          objectFit: 'fill'
                        }}
                      />
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-xs font-mono text-[#4A5A52] bg-[#FFFFFF] px-2 py-0.5 border border-[#D5E4DB]">
                      {resultMeta
                        ? `আউটপুট রেজোলিউশন: ${resultMeta.width} × ${resultMeta.height} px (${resultMeta.format})`
                        : `টার্গেট: ${activeWidth} × ${activeHeight} px`}
                    </span>
                    <div className="text-[11px] text-[#4A5A52]">
                      🖱️ ছবি টেনে সরান • স্ক্রল করে জুম করুন
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-[#4A5A52]">
                  কোনো ছবি লোড করা হয়নি
                </div>
              )}
            </div>

            {/* Quality & Encoding Details */}
            {resultMeta && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-2 rounded-lg">
                  <span className="block text-[11px] font-medium text-[#4A5A52]">প্রস্থ ও উচ্চতা</span>
                  <span className="font-mono font-bold text-[#084A2E]">{resultMeta.width}×{resultMeta.height}</span>
                </div>
                <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-2 rounded-lg">
                  <span className="block text-[11px] font-medium text-[#4A5A52]">ফাইল সাইজ</span>
                  <span className={`font-mono font-bold ${resultMeta.sizeKb <= activeMaxKb ? 'text-[#0B5D3B]' : 'text-[#c8342a]'}`}>
                    {resultMeta.sizeKb} KB
                  </span>
                </div>
                <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-2 rounded-lg">
                  <span className="block text-[11px] font-medium text-[#4A5A52]">বাইনারি কোয়ালিটি</span>
                  <span className="font-mono font-bold text-[#084A2E]">{resultMeta.qualityUsed}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="pt-4 border-t border-[#D5E4DB] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={processImage}
              disabled={!imageSrc}
              className={`px-4 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm rounded-lg ${
                !imageSrc
                  ? 'bg-[#D5E4DB]/50 text-[#4A5A52] cursor-not-allowed'
                  : resultDataUrl
                  ? 'border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#0F1F17] cursor-pointer'
                  : 'bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] cursor-pointer'
              }`}
            >
              {resultDataUrl ? (
                <RefreshCw className="w-3.5 h-3.5 text-[#084A2E]" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>{resultDataUrl ? 'পুনরায় প্রসেস করুন' : 'প্রসেস করুন'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!resultDataUrl}
              className={`px-5 py-2 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
                resultDataUrl
                  ? 'bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] cursor-pointer'
                  : 'bg-[#D5E4DB]/50 text-[#4A5A52] cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>রিসাইজড ছবি ডাউনলোড করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic CMS Rules, Guidelines, & Sections */}
      <CmsDynamicContent content={pageContent} excludeSections={['faq']} />

      {/* Org-wise Size Reference Table */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-4 rounded-2xl">
        <h3 className="text-sm font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-[#0B5D3B]" />
          <span>{pageContent.tableTitle || 'বিভিন্ন প্রতিষ্ঠানের নির্ধারিত মাপের রেফারেন্স টেবিল'}</span>
        </h3>

        <div className="overflow-x-auto border border-[#D5E4DB]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F0F4F2] text-[#084A2E] border-b border-[#D5E4DB]">
              <tr>
                <th className="p-2.5">প্রতিষ্ঠান / ক্ষেত্র</th>
                <th className="p-2.5">মাপ (পিক্সেল)</th>
                <th className="p-2.5">সর্বোচ্চ সাইজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5E4DB]">
              {GOVERNMENT_PRESET_PROFILES.map((profile) => (
                <tr key={profile.id} className="hover:bg-[#F0F4F2]/50">
                  <td className="p-2.5 text-[#0F1F17]">
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-[11px] text-[#4A5A52]">{profile.org}</div>
                  </td>
                  <td className="p-2.5 font-mono text-[#084A2E]">
                    {profile.width} × {profile.height}
                  </td>
                  <td className="p-2.5 font-mono text-[#084A2E]">
                    {profile.maxSizeKb} KB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic CMS FAQs & More */}
      <CmsDynamicContent
        content={pageContent}
        excludeSections={['rules', 'guidelines', 'sellingPoint', 'features', 'steps', 'howToSteps', 'deepDive', 'guide', 'origin', 'contact', 'markdown', 'lastUpdated']}
      />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="photo-resizer" />
    </div>
  );
};
