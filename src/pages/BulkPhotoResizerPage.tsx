import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  FileArchive,
  Layers,
  Settings,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Maximize2,
  FileImage,
  Sparkles,
  X
} from 'lucide-react';
import { GOVERNMENT_PRESET_PROFILES } from '../constants/presets.ts';
import { resizeImage, loadImage, dataUrlToBlob, ResizeResult } from '../utils/imageResize.ts';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/bulk-photo-resizer.json';

export interface BulkImageItem {
  id: string;
  file: File;
  name: string;
  originalSizeKb: number;
  originalWidth?: number;
  originalHeight?: number;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: ResizeResult;
  errorMessage?: string;
}

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const BulkPhotoResizerPage: React.FC = () => {
  // Preset & custom settings
  const [selectedPreset, setSelectedPreset] = useState<string>('bcs_govt_photo');
  const [customWidth, setCustomWidth] = useState<number>(300);
  const [customHeight, setCustomHeight] = useState<number>(300);
  const [customMaxKb, setCustomMaxKb] = useState<number>(100);
  const [customFormat, setCustomFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  // Files list
  const [items, setItems] = useState<BulkImageItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Cancellation flag ref
  const cancelProcessingRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate current active parameters
  const activePreset = useMemo(() => {
    return GOVERNMENT_PRESET_PROFILES.find((p) => p.id === selectedPreset);
  }, [selectedPreset]);

  const activeWidth = activePreset ? activePreset.width : customWidth;
  const activeHeight = activePreset ? activePreset.height : customHeight;
  const activeMaxKb = activePreset ? activePreset.maxSizeKb : customMaxKb;
  const activeFormat = activePreset ? activePreset.format : customFormat;

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  // Handle files ingestion
  const addFiles = async (fileList: FileList | File[]) => {
    setGeneralError(null);
    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (ACCEPTED_FILE_TYPES.includes(file.type)) {
        newFiles.push(file);
      }
    }

    if (newFiles.length === 0) {
      setGeneralError('শুধুমাত্র JPG, PNG বা WebP ছবি আপলোড করুন।');
      return;
    }

    const newItems: BulkImageItem[] = [];

    for (const file of newFiles) {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);
      const originalSizeKb = Number((file.size / 1024).toFixed(1));

      // Try reading dimensions asynchronously
      let originalWidth: number | undefined;
      let originalHeight: number | undefined;
      try {
        const img = await loadImage(previewUrl);
        originalWidth = img.naturalWidth || img.width;
        originalHeight = img.naturalHeight || img.height;
      } catch {
        // continue if dimension reading fails
      }

      newItems.push({
        id,
        file,
        name: file.name,
        originalSizeKb,
        originalWidth,
        originalHeight,
        previewUrl,
        status: 'pending'
      });
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // Add 3 sample photos for zero-friction testing
  const handleAddSampleImages = () => {
    const samples: { name: string; title: string; color1: string; color2: string; isSig?: boolean }[] = [
      {
        name: 'নমুনা_পাসপোর্ট_ছবি_১.jpg',
        title: 'নমুনা ছবি ১ (পাসপোর্ট)',
        color1: '#083f2a',
        color2: '#d8cfb8'
      },
      {
        name: 'নমুনা_প্রার্থী_ছবি_২.jpg',
        title: 'নমুনা ছবি ২ (বিসিএস)',
        color1: '#1e3a8a',
        color2: '#e2e8f0'
      },
      {
        name: 'নমুনা_চাকরি_স্বাক্ষর_৩.jpg',
        title: 'নমুনা স্বাক্ষর ৩',
        color1: '#334155',
        color2: '#ffffff',
        isSig: true
      }
    ];

    const generatedItems: BulkImageItem[] = [];

    samples.forEach((sample) => {
      const canvas = document.createElement('canvas');
      canvas.width = sample.isSig ? 600 : 500;
      canvas.height = sample.isSig ? 200 : 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = sample.color2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (sample.isSig) {
        // Signature line
        ctx.strokeStyle = sample.color1;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 120);
        ctx.bezierCurveTo(200, 40, 350, 160, 500, 100);
        ctx.stroke();

        ctx.fillStyle = sample.color1;
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sample.title, 300, 60);
      } else {
        // Portrait avatar silhouette
        ctx.fillStyle = sample.color1;
        ctx.beginPath();
        ctx.ellipse(250, 440, 180, 140, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fdba74';
        ctx.beginPath();
        ctx.ellipse(250, 240, 100, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sample.title, 250, 70);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], sample.name, { type: 'image/jpeg' });
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      generatedItems.push({
        id,
        file,
        name: sample.name,
        originalSizeKb: Number((file.size / 1024).toFixed(1)),
        originalWidth: canvas.width,
        originalHeight: canvas.height,
        previewUrl: dataUrl,
        status: 'pending'
      });
    });

    setItems((prev) => [...prev, ...generatedItems]);
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Clear all items
  const handleClearAll = () => {
    if (isProcessingAll) {
      cancelProcessingRef.current = true;
    }
    items.forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setItems([]);
  };

  // Batch process all items one by one without freezing the main thread
  const handleProcessAll = async () => {
    if (items.length === 0 || isProcessingAll) return;

    setIsProcessingAll(true);
    cancelProcessingRef.current = false;

    for (let i = 0; i < items.length; i++) {
      if (cancelProcessingRef.current) break;

      const currentItem = items[i];

      // Mark this item as processing
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'processing' } : item))
      );

      try {
        // Allow the UI / React state to update cleanly before starting synchronous canvas processing
        await new Promise((resolve) => setTimeout(resolve, 30));

        const img = await loadImage(currentItem.previewUrl);
        const result = resizeImage(img, {
          width: activeWidth,
          height: activeHeight,
          maxKb: activeMaxKb,
          format: activeFormat,
          fitMode,
          backgroundColor
        });

        // Mark this item as completed
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'completed', result } : item
          )
        );
      } catch (err: unknown) {
        console.error(`Failed to process item ${currentItem.name}:`, err);
        const errMsg = err instanceof Error ? err.message : 'রিসাইজ করতে ব্যর্থ হয়েছে';
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', errorMessage: errMsg } : item
          )
        );
      }

      // Small yield to keep the browser event loop responsive
      await new Promise((resolve) => setTimeout(resolve, 16));
    }

    setIsProcessingAll(false);
  };

  // Download a single item
  const handleDownloadSingle = (item: BulkImageItem) => {
    if (!item.result?.dataUrl) return;

    const ext = activeFormat === 'png' ? 'png' : activeFormat === 'webp' ? 'webp' : 'jpg';
    const baseName = item.name.replace(/\.[^/.]+$/, '') || 'resized_photo';
    const fileName = `${baseName}_${activeWidth}x${activeHeight}.${ext}`;

    const link = document.createElement('a');
    link.href = item.result.dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all completed photos bundled in a ZIP using lazy-loaded JSZip
  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((item) => item.status === 'completed' && item.result?.dataUrl);
    if (completedItems.length === 0 || isZipping) return;

    setIsZipping(true);
    setGeneralError(null);

    try {
      // Lazy-load jszip to keep initial bundle size minimal
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      const ext = activeFormat === 'png' ? 'png' : activeFormat === 'webp' ? 'webp' : 'jpg';
      const folderName = `utools_bd_resized_${activeWidth}x${activeHeight}`;
      const imgFolder = zip.folder(folderName) || zip;

      completedItems.forEach((item, index) => {
        if (!item.result?.dataUrl) return;
        const blob = dataUrlToBlob(item.result.dataUrl);
        const baseName = item.name.replace(/\.[^/.]+$/, '') || `photo_${index + 1}`;
        const fileName = `${baseName}_${activeWidth}x${activeHeight}.${ext}`;
        imgFolder.file(fileName, blob);
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `utools-bd-bulk-photos-${activeWidth}x${activeHeight}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(zipUrl);
      }, 10000);
    } catch (err: unknown) {
      console.error('ZIP generation error:', err);
      setGeneralError('ZIP ফাইল তৈরি করার সময় সমস্যা হয়েছে। অনুগ্রহ করে এককভাবে ছবি ডাউনলোড করুন।');
    } finally {
      setIsZipping(false);
    }
  };

  // Stats calculation
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const processingCount = items.filter((i) => i.status === 'processing').length;
  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const errorCount = items.filter((i) => i.status === 'error').length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Schema.org FAQ structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageContent.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta
          name="description"
          content={pageContent.metaDescription}
        />
        <link rel="canonical" href="https://utools.bd/bulk-photo-resizer" />
        <meta
          property="og:title"
          content={pageContent.metaTitle}
        />
        <meta
          property="og:description"
          content={pageContent.metaOgDescription}
        />
        <meta property="og:url" content="https://utools.bd/bulk-photo-resizer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta
          name="twitter:description"
          content={pageContent.metaDescription}
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Top Breadcrumb & 100% Privacy Guarantee */}
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
          <span>১০০% ক্লায়েন্ট-সাইড অন-ডিভাইস (কোনো ছবি সার্ভারে আপলোড হয় না)</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs px-2.5 py-0.5 border border-[#0B5D3B]/20 font-medium">
            ব্যাচ প্রসেসিং • আনলিমিটেড ফ্রি
          </span>
          <span className="text-xs text-[#4A5A52]">কোনো ফাইল লিমিট নেই</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5A52] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Selling Point Box */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-md bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center shrink-0 text-[#0B5D3B] mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-[#0F1F17]">
            <strong className="text-[#084A2E] block font-serif">
              {pageContent.sellingPointTitle}
            </strong>
            <span className="text-[#34443B] leading-relaxed">
              {pageContent.sellingPointDesc}
            </span>
          </div>
        </div>

        {/* Quick link to single resizer */}
        <Link
          to="/photo-resizer"
          className="shrink-0 text-xs text-[#0B5D3B] hover:text-[#084A2E] font-medium flex items-center space-x-1 border border-[#0B5D3B]/30 bg-[#F0F4F2] px-3 py-1.5"
        >
          <span>একক ছবি রিসাইজার</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Common Settings Panel (Applies to all batch files) */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-6 rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="text-sm sm:text-base font-bold text-[#084A2E] font-serif uppercase tracking-wider">
              ১. সার্বজনীন রিসাইজ সেটিংস (সব ছবির জন্য প্রযোজ্য)
            </h2>
          </div>
          <span className="text-xs text-[#4A5A52]">
            টার্গেট: {activeWidth} × {activeHeight} পিক্সেল
          </span>
        </div>

        {/* Presets Grid */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#084A2E] block">
            সরকারি প্রিসেট বাছাই করুন:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {GOVERNMENT_PRESET_PROFILES.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`text-left p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#084A2E] bg-[#F0F4F2] ring-1 ring-[#084A2E]'
                      : 'border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#084A2E]">
                      {preset.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#0B5D3B] font-bold">
                      {preset.width}×{preset.height}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4A5A52] mt-1 flex items-center justify-between">
                    <span>{preset.org}</span>
                    <span>সর্বোচ্চ {preset.maxSizeKb} KB</span>
                  </div>
                </button>
              );
            })}

            {/* Custom Preset Button */}
            <button
              type="button"
              onClick={() => setSelectedPreset('custom')}
              className={`text-left p-3 border transition-all cursor-pointer ${
                selectedPreset === 'custom'
                  ? 'border-[#084A2E] bg-[#F0F4F2] ring-1 ring-[#084A2E]'
                  : 'border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#084A2E]">
                  কাস্টম মাপ ও সাইজ
                </span>
                <span className="text-[11px] font-mono text-[#0B5D3B] font-bold">
                  ইউজার নির্দিষ্ট
                </span>
              </div>
              <p className="text-[11px] text-[#4A5A52] mt-1">
                নিজের পছন্দমতো প্রস্থ, উচ্চতা ও কেবি সেট করুন
              </p>
            </button>
          </div>
        </div>

        {/* Custom Width, Height, MaxKB Controls (if Custom or fine-tuning) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#D5E4DB]/60">
          <div>
            <label className="text-xs font-semibold text-[#084A2E] block mb-1">
              প্রস্থ (Width px)
            </label>
            <input
              type="number"
              disabled={selectedPreset !== 'custom'}
              value={activeWidth}
              onChange={(e) => setCustomWidth(Math.max(10, parseInt(e.target.value) || 0))}
              className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#084A2E] block mb-1">
              উচ্চতা (Height px)
            </label>
            <input
              type="number"
              disabled={selectedPreset !== 'custom'}
              value={activeHeight}
              onChange={(e) => setCustomHeight(Math.max(10, parseInt(e.target.value) || 0))}
              className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#084A2E] block mb-1">
              সর্বোচ্চ সাইজ (Max KB)
            </label>
            <input
              type="number"
              disabled={selectedPreset !== 'custom'}
              value={activeMaxKb}
              onChange={(e) => setCustomMaxKb(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
              placeholder="0 = কোনো সীমা নেই"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#084A2E] block mb-1">
              আউটপুট ফরম্যাট
            </label>
            <select
              disabled={selectedPreset !== 'custom'}
              value={activeFormat}
              onChange={(e) => setCustomFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
              className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            >
              <option value="jpeg">JPEG / JPG (স্ট্যান্ডার্ড)</option>
              <option value="png">PNG (লসলেস)</option>
              <option value="webp">WebP (আধুনিক কম সাইজ)</option>
            </select>
          </div>
        </div>

        {/* Fit Mode & Background Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D5E4DB]/60">
          <div>
            <label className="text-xs font-semibold text-[#084A2E] block mb-1">
              ফিট মোড (Fit Mode):
            </label>
            <div className="flex border border-[#D5E4DB] bg-[#F0F4F2] p-0.5 text-xs rounded-lg">
              <button
                type="button"
                onClick={() => setFitMode('cover')}
                className={`flex-1 py-1 text-center transition-colors cursor-pointer ${
                  fitMode === 'cover'
                    ? 'bg-[#FFFFFF] font-semibold text-[#084A2E] shadow-xs'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                Cover (কাটছাঁট করে ফিল)
              </button>
              <button
                type="button"
                onClick={() => setFitMode('contain')}
                className={`flex-1 py-1 text-center transition-colors cursor-pointer ${
                  fitMode === 'contain'
                    ? 'bg-[#FFFFFF] font-semibold text-[#084A2E] shadow-xs'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                Contain (পুরো ছবি অক্ষুণ্ণ)
              </button>
              <button
                type="button"
                onClick={() => setFitMode('fill')}
                className={`flex-1 py-1 text-center transition-colors cursor-pointer ${
                  fitMode === 'fill'
                    ? 'bg-[#FFFFFF] font-semibold text-[#084A2E] shadow-xs'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                Stretch (টেনে ফিল)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#084A2E] block mb-1">
              প্যাডিং / ব্যাকগ্রাউন্ড রঙ:
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setBackgroundColor('#ffffff')}
                className={`px-3 py-1 text-xs border cursor-pointer ${
                  backgroundColor === '#ffffff'
                    ? 'border-[#084A2E] bg-[#F0F4F2] font-semibold text-[#084A2E]'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52]'
                }`}
              >
                সাদা (#FFFFFF)
              </button>
              <button
                type="button"
                onClick={() => setBackgroundColor('#d6e6f2')}
                className={`px-3 py-1 text-xs border cursor-pointer ${
                  backgroundColor === '#d6e6f2'
                    ? 'border-[#084A2E] bg-[#F0F4F2] font-semibold text-[#084A2E]'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52]'
                }`}
              >
                পাসপোর্ট স্কাই ব্লু
              </button>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-7 h-7 border border-[#D5E4DB] cursor-pointer bg-transparent"
                title="কাস্টম রঙ নির্বাচন করুন"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer bg-[#FFFFFF]  rounded-2xl ${
          isDragOver
            ? 'border-[#0B5D3B] bg-[#F0F4F2]'
            : 'border-[#D5E4DB] hover:border-[#0B5D3B]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
        />
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto bg-[#F0F4F2] border border-[#D5E4DB] flex items-center justify-center text-[#084A2E] rounded-lg">
            <Upload className="w-7 h-7 text-[#0B5D3B]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#084A2E]">
              একসাথে একাধিক ছবি ড্র্যাগ করে এখানে ছাড়ুন অথবা ফাইল বাছাই করতে ক্লিক করুন
            </p>
            <p className="text-xs text-[#4A5A52]">
              কোনো ফাইলের সংখ্যাসীমা নেই • JPG, PNG বা WebP ফরম্যাট
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              একাধিক ছবি বাছাই করুন
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddSampleImages();
              }}
              className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#0F1F17] px-4 py-2 text-xs font-medium transition-colors cursor-pointer rounded-lg"
            >
              নমুনা ৩টি ছবি যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* General Error Notice */}
      {generalError && (
        <div className="bg-[#fff5f5] border border-[#fecaca] p-4 text-xs text-[#b91c1c] flex items-start space-x-2.5 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{generalError}</p>
        </div>
      )}

      {/* Items List & Action Toolbar */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-xs">
              <span className="font-semibold text-[#084A2E] font-serif text-sm">
                মোট ছবি: {totalCount}টি
              </span>
              <span className="text-[#0B5D3B] font-medium">
                সম্পন্ন: {completedCount}টি
              </span>
              {pendingCount > 0 && (
                <span className="text-[#4A5A52]">অপেক্ষমান: {pendingCount}টি</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 font-medium">ব্যর্থ: {errorCount}টি</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleProcessAll}
                disabled={isProcessingAll || items.length === 0}
                className="bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] px-4 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>প্রসেসিং চলছে ({completedCount}/{totalCount})...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>সব রিসাইজ করুন</span>
                  </>
                )}
              </button>

              {/* Download All as ZIP */}
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={completedCount === 0 || isZipping}
                className="bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] px-4 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ZIP তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>সব ডাউনলোড করুন (ZIP)</span>
                  </>
                )}
              </button>

              {/* Clear All */}
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isProcessingAll}
                className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#4A5A52] hover:text-red-700 px-3 py-2 text-xs transition-colors cursor-pointer disabled:opacity-50 rounded-lg"
                title="লিস্টের সব ছবি মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar when processing */}
          {isProcessingAll && (
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 space-y-1.5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-[#084A2E]">
                <span className="font-semibold">রিসাইজ প্রোগ্রেস</span>
                <span className="font-mono">{completedCount} / {totalCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-[#F0F4F2] h-2.5 border border-[#D5E4DB] overflow-hidden rounded-lg">
                <div
                  className="bg-[#0B5D3B] h-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className={`bg-[#FFFFFF] border p-3 flex flex-col justify-between transition-all space-y-3 relative  rounded-2xl ${
                    item.status === 'completed'
                      ? 'border-[#0B5D3B]/50 ring-1 ring-[#0B5D3B]/20'
                      : item.status === 'processing'
                      ? 'border-[#0B5D3B] ring-2 ring-[#0B5D3B]/30'
                      : item.status === 'error'
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#D5E4DB]'
                  }`}
                >
                  {/* Top: Remove button & Status badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#4A5A52]">
                      #{index + 1}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {item.status === 'completed' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 font-medium flex items-center space-x-1 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>সম্পন্ন</span>
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 font-medium flex items-center space-x-1 border border-amber-300">
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                          <span>প্রসেসিং...</span>
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="bg-[#F0F4F2] text-[#4A5A52] text-[11px] px-2 py-0.5 font-medium flex items-center space-x-1 border border-[#D5E4DB]">
                          <Clock className="w-3 h-3 text-[#4A5A52]" />
                          <span>অপেক্ষমান</span>
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="bg-red-100 text-red-800 text-[11px] px-2 py-0.5 font-medium flex items-center space-x-1 border border-red-300">
                          <AlertCircle className="w-3 h-3 text-red-700" />
                          <span>ব্যর্থ</span>
                        </span>
                      )}

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={item.status === 'processing'}
                        className="text-[#4A5A52] hover:text-red-700 p-0.5 transition-colors cursor-pointer disabled:opacity-30"
                        title="ছবিটি বাদ দিন"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full h-36 bg-[#F0F4F2] border border-[#D5E4DB] overflow-hidden flex items-center justify-center relative rounded-lg">
                    <img
                      src={item.result?.dataUrl || item.previewUrl}
                      alt={item.name}
                      width={item.result?.width || 300}
                      height={item.result?.height || 300}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain"
                    />

                    {/* Compliant Badge for Govt photo */}
                    {item.status === 'completed' && item.result && (
                      <div className="absolute bottom-1 right-1 bg-[#084A2E]/90 text-[#FFFFFF] text-[10px] font-mono px-1.5 py-0.5">
                        {item.result.width}×{item.result.height}
                      </div>
                    )}
                  </div>

                  {/* Metadata Info */}
                  <div className="space-y-1 text-xs">
                    <div
                      className="font-semibold text-[#084A2E] truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#4A5A52] font-mono">
                      <span>আসল: {item.originalSizeKb} KB</span>
                      {item.originalWidth && item.originalHeight && (
                        <span>({item.originalWidth}×{item.originalHeight})</span>
                      )}
                    </div>

                    {item.status === 'completed' && item.result && (
                      <div className="pt-1 border-t border-[#D5E4DB]/60 flex items-center justify-between text-[11px] font-mono font-medium">
                        <span className="text-[#0B5D3B]">
                          নতুন: {item.result.sizeKb} KB
                        </span>
                        <span className="text-[#4A5A52]">
                          (কোয়ালিটি: {item.result.qualityUsed}%)
                        </span>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <p className="text-[11px] text-red-600">
                        {item.errorMessage || 'প্রসেসিং এরর'}
                      </p>
                    )}
                  </div>

                  {/* Individual Download Button */}
                  {item.status === 'completed' && item.result && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="w-full mt-2 border border-[#0B5D3B] bg-[#F0F4F2] hover:bg-[#0B5D3B] hover:text-[#FFFFFF] text-[#084A2E] py-1.5 text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer rounded-lg"
                    >
                      <Download className="w-3 h-3" />
                      <span>ডাউনলোড</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ Accordion / Information Section */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 space-y-4 rounded-2xl">
        <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
          <HelpCircle className="w-4 h-4 text-[#0B5D3B]" />
          <h2 className="text-base font-bold text-[#084A2E] font-serif">
            {pageContent.faqHeading}
          </h2>
        </div>

        <div className="divide-y divide-[#D5E4DB] text-xs sm:text-sm text-[#34443B]">
          {pageContent.faqs.map((faq, idx) => (
            <div key={idx} className="py-3 space-y-1">
              <h3 className="font-semibold text-[#084A2E]">
                {faq.question}
              </h3>
              <p className="text-[#4A5A52] leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="bulk-photo-resizer" />
    </div>
  );
};
