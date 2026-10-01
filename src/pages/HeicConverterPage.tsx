import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
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
  RefreshCw,
  FileImage,
  Sparkles,
  X,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/heic-converter.json';

export type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface HeicFileItem {
  id: string;
  file: File;
  name: string;
  originalSizeBytes: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSizeBytes?: number;
  convertedFileName?: string;
  errorMessage?: string;
}

// Helper to format file size cleanly
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Convert numbers to Bengali digits
function toBanglaNum(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => banglaDigits[Number(d)]);
}

// Check if a file is a valid HEIC / HEIF
function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type === 'image/heic' ||
    type === 'image/heif' ||
    type === 'image/heic-sequence' ||
    type === 'image/heif-sequence'
  );
}

export const HeicConverterPage: React.FC = () => {
  // Output format & quality settings
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState<number>(85);

  // File queue state
  const [items, setItems] = useState<HeicFileItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [skippedMessages, setSkippedMessages] = useState<string[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [activePreviewName, setActivePreviewName] = useState<string>('');

  const cancelConvertingRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.convertedUrl) {
          URL.revokeObjectURL(item.convertedUrl);
        }
      });
    };
  }, [items]);

  // Handle incoming files (drag-drop or file selector)
  const processFileList = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    const newItems: HeicFileItem[] = [];
    const skipped: string[] = [];

    filesArray.forEach((file) => {
      if (isHeicFile(file)) {
        newItems.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          originalSizeBytes: file.size,
          status: 'pending',
        });
      } else {
        skipped.push(`"${file.name}" — এই ফাইলটি HEIC/HEIF ফরম্যাটে নেই, স্কিপ করা হয়েছে`);
      }
    });

    if (skipped.length > 0) {
      setSkippedMessages((prev) => [...prev, ...skipped]);
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
      e.target.value = '';
    }
  };

  // Remove individual item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.convertedUrl) {
        URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Clear all items
  const handleClearAll = () => {
    if (isConvertingAll) {
      cancelConvertingRef.current = true;
    }
    items.forEach((item) => {
      if (item.convertedUrl) {
        URL.revokeObjectURL(item.convertedUrl);
      }
    });
    setItems([]);
    setSkippedMessages([]);
  };

  // Load sample HEIC file for quick testing without iPhone
  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample.heic');
      if (!response.ok) throw new Error('নমুনা ফাইল লোড করা সম্ভব হয়নি');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'iphone_camera_sample.heic', {
        type: 'image/heic',
      });
      processFileList([sampleFile]);
    } catch (err) {
      console.error('Failed to load sample HEIC:', err);
    }
  };

  // Process a single item
  const convertSingleItem = async (
    item: HeicFileItem,
    targetFormat: OutputFormat,
    targetQuality: number
  ): Promise<{
    status: 'completed' | 'error';
    convertedBlob?: Blob;
    convertedUrl?: string;
    convertedSizeBytes?: number;
    convertedFileName?: string;
    errorMessage?: string;
  }> => {
    try {
      // Dynamically import heic2any to keep initial bundle lightweight
      const heic2anyModule = await import('heic2any');
      const heic2any = (heic2anyModule.default || heic2anyModule) as (options: {
        blob: Blob;
        multiple?: boolean;
        toType?: string;
        quality?: number;
        gifInterval?: number;
      }) => Promise<Blob | Blob[]>;

      const mimeType =
        targetFormat === 'png'
          ? 'image/png'
          : targetFormat === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

      const qualityParam = targetFormat === 'png' ? undefined : targetQuality / 100;

      const result = await heic2any({
        blob: item.file,
        toType: mimeType,
        quality: qualityParam,
      });

      const singleBlob: Blob = Array.isArray(result) ? result[0] : result;
      const convertedUrl = URL.createObjectURL(singleBlob);

      const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      const convertedFileName = `${baseName}.${extension}`;

      return {
        status: 'completed',
        convertedBlob: singleBlob,
        convertedUrl,
        convertedSizeBytes: singleBlob.size,
        convertedFileName,
      };
    } catch (err: unknown) {
      console.error(`Conversion error for ${item.name}:`, err);
      const message =
        err instanceof Error ? err.message : 'ফাইলটি রূপান্তর করতে সমস্যা হয়েছে';
      return {
        status: 'error',
        errorMessage: message,
      };
    }
  };

  // Batch convert all pending or error items
  const handleConvertAll = async () => {
    if (items.length === 0 || isConvertingAll) return;

    setIsConvertingAll(true);
    cancelConvertingRef.current = false;

    for (let i = 0; i < items.length; i++) {
      if (cancelConvertingRef.current) break;

      const currentItem = items[i];
      // Only convert items that are not already completed
      if (currentItem.status === 'completed') continue;

      // Mark this item as converting
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'converting', errorMessage: undefined } : item
        )
      );

      // Give browser brief tick to re-render status
      await new Promise((resolve) => setTimeout(resolve, 40));

      const result = await convertSingleItem(currentItem, outputFormat, quality);

      if (cancelConvertingRef.current) break;

      // Update state with result
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? {
                ...item,
                status: result.status,
                convertedBlob: result.convertedBlob,
                convertedUrl: result.convertedUrl,
                convertedSizeBytes: result.convertedSizeBytes,
                convertedFileName: result.convertedFileName,
                errorMessage: result.errorMessage,
              }
            : item
        )
      );
    }

    setIsConvertingAll(false);
  };

  // Convert an individual item if it had an error
  const handleRetrySingle = async (index: number) => {
    const currentItem = items[index];
    if (!currentItem) return;

    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, status: 'converting', errorMessage: undefined } : item
      )
    );

    const result = await convertSingleItem(currentItem, outputFormat, quality);

    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              status: result.status,
              convertedBlob: result.convertedBlob,
              convertedUrl: result.convertedUrl,
              convertedSizeBytes: result.convertedSizeBytes,
              convertedFileName: result.convertedFileName,
              errorMessage: result.errorMessage,
            }
          : item
      )
    );
  };

  // Download individual converted file
  const handleDownloadSingle = (item: HeicFileItem) => {
    if (!item.convertedUrl || !item.convertedFileName) return;
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = item.convertedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all completed files as a ZIP package
  const handleDownloadZip = async () => {
    const completedItems = items.filter(
      (item) => item.status === 'completed' && item.convertedBlob && item.convertedFileName
    );

    if (completedItems.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      // Dynamically import JSZip
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      // Handle identical filenames inside zip
      const usedNames: Record<string, number> = {};

      completedItems.forEach((item) => {
        let fileName = item.convertedFileName!;
        if (usedNames[fileName]) {
          const extIndex = fileName.lastIndexOf('.');
          const base = extIndex !== -1 ? fileName.substring(0, extIndex) : fileName;
          const ext = extIndex !== -1 ? fileName.substring(extIndex) : '';
          usedNames[fileName]++;
          fileName = `${base}_${usedNames[fileName]}${ext}`;
        } else {
          usedNames[fileName] = 1;
        }

        zip.file(fileName, item.convertedBlob!);
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `Utools-HEIC-Converted-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 15000);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Calculations & stats
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const convertingCount = items.filter((i) => i.status === 'converting').length;
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
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/heic-converter"
        toolName="HEIC থেকে JPG/PNG কনভার্টার"
        categoryName="গ্রাফিক্স ও ছবি"
        faqs={pageContent.faqs || []}
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-[#D5E4DB] pb-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#084A2E] hover:text-[#0B5D3B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>টুলবক্সে ফিরে যান</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs text-[#0B5D3B] font-medium bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>১০০% অন-ডিভাইস কনভার্শন • প্রাইভেসি সুরক্ষিত</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#0B5D3B] text-[#FFFFFF] font-bold rounded-md">
            আইফোন ফটো টুল
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#D9E6DE] text-[#084A2E] font-bold rounded-md border border-[#D5E4DB]">
            ব্যাচ প্রসেসিং ও জিপ
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#084A2E] font-serif leading-tight">
          {pageContent.title}
        </h1>
        <p className="text-sm text-[#34443B] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Skipped / Non-HEIC Notice Banner */}
      {skippedMessages.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 space-y-2 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>নন-HEIC ফাইল স্কিপ করা হয়েছে ({toBanglaNum(skippedMessages.length)}টি ফাইল)</span>
            </div>
            <button
              type="button"
              onClick={() => setSkippedMessages([])}
              className="text-amber-800 hover:text-amber-950 text-xs flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>মুছুন</span>
            </button>
          </div>
          <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 pl-1">
            {skippedMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Settings & Configuration Card */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-6 rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#D5E4DB] pb-3">
          <div className="flex items-center space-x-2 text-[#084A2E]">
            <Settings className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-serif">
              কনভার্শন সেটিংস (Output Settings)
            </h2>
          </div>
          <span className="text-xs text-[#4A5A52] font-mono">
            ডিফল্ট: JPG (৮৫% কোয়ালিটি)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#084A2E] block">
              আউটপুট ফরম্যাট নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setOutputFormat('jpeg')}
                className={`py-2.5 px-3 border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  outputFormat === 'jpeg'
                    ? 'border-[#0B5D3B] bg-[#0B5D3B] text-[#FFFFFF] shadow-sm'
                    : 'border-[#D5E4DB] bg-[#F8FAF9] text-[#34443B] hover:border-[#0B5D3B]/60'
                }`}
              >
                <span className="font-bold text-sm">JPG</span>
                <span className={`text-[10px] ${outputFormat === 'jpeg' ? 'text-white/80' : 'text-[#4A5A52]'}`}>
                  সর্বাধিক সামঞ্জস্যপূর্ণ
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOutputFormat('png')}
                className={`py-2.5 px-3 border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  outputFormat === 'png'
                    ? 'border-[#0B5D3B] bg-[#0B5D3B] text-[#FFFFFF] shadow-sm'
                    : 'border-[#D5E4DB] bg-[#F8FAF9] text-[#34443B] hover:border-[#0B5D3B]/60'
                }`}
              >
                <span className="font-bold text-sm">PNG</span>
                <span className={`text-[10px] ${outputFormat === 'png' ? 'text-white/80' : 'text-[#4A5A52]'}`}>
                  লসলেস কোয়ালিটি
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOutputFormat('webp')}
                className={`py-2.5 px-3 border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  outputFormat === 'webp'
                    ? 'border-[#0B5D3B] bg-[#0B5D3B] text-[#FFFFFF] shadow-sm'
                    : 'border-[#D5E4DB] bg-[#F8FAF9] text-[#34443B] hover:border-[#0B5D3B]/60'
                }`}
              >
                <span className="font-bold text-sm">WebP</span>
                <span className={`text-[10px] ${outputFormat === 'webp' ? 'text-white/80' : 'text-[#4A5A52]'}`}>
                  আধুনিক হালকা ওয়েব
                </span>
              </button>
            </div>
            <p className="text-[11px] text-[#4A5A52] pt-0.5">
              {outputFormat === 'jpeg' &&
                'পাসপোর্ট, সরকারি আবেদন বা যেকোনো প্ল্যাটফর্মে আপলোডের জন্য JPG সবচেয়ে নিরাপদ পছন্দ।'}
              {outputFormat === 'png' &&
                'PNG একটি লসলেস ফরম্যাট—ছবির ডিটেইল ও রঙের কোনো কম্প্রেস হয় না।'}
              {outputFormat === 'webp' &&
                'ওয়েবসাইটে ব্যবহার ও দ্রুত লোডিংয়ের জন্য অত্যন্ত কম সাইজের আধুনিক ফরম্যাট।'}
            </p>
          </div>

          {/* Quality Slider (JPG & WebP) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#084A2E]">
                ছবির কোয়ালিটি (Image Quality):
              </label>
              <span className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#F8FAF9] border border-[#D5E4DB] px-2 py-0.5">
                {outputFormat === 'png' ? '১০০% (Lossless)' : `${toBanglaNum(quality)}%`}
              </span>
            </div>

            {outputFormat === 'png' ? (
              <div className="p-3 bg-[#F8FAF9] border border-[#D5E4DB] text-xs text-[#4A5A52] flex items-center space-x-2 rounded-2xl">
                <Check className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                <span>পিএনজি একটি লসলেস ফরম্যাট, তাই এখানে ছবির সম্পূর্ণ কোয়ালিটি ১০০% সংরক্ষিত থাকে।</span>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-[#0B5D3B] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-[#4A5A52]">
                  <span>ছোট সাইজ (৩০%)</span>
                  <span className="font-semibold text-[#084A2E]">সুপারিশকৃত: ৮৫%</span>
                  <span>সর্বোচ্চ ডিটেইল (১০০%)</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#4A5A52]">
              ৮৫% কোয়ালিটিতে ফাইলের সাইজ অনেক কমে আসে অথচ খালি চোখে ছবির স্পষ্টতায় কোনো পার্থক্য বোঝা যায় না।
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer  rounded-2xl ${
          isDragOver
            ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 scale-[0.99]'
            : 'border-[#D5E4DB] bg-[#FFFFFF] hover:border-[#0B5D3B]/70'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept=".heic,.heif,image/heic,image/heif"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-md bg-[#F0F4F2] border border-[#D5E4DB] flex items-center justify-center text-[#0B5D3B]">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-[#084A2E] font-serif">
              আইফোনের HEIC বা HEIF ছবি এখানে টেনে আনুন বা ক্লিক করুন
            </h2>
            <p className="text-xs text-[#4A5A52]">
              একসাথে একাধিক (Multi-select) ছবি নির্বাচন করতে পারেন। কোনো লিমিট নেই।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center space-x-1 text-[11px] bg-[#F8FAF9] border border-[#D5E4DB] px-2.5 py-1 text-[#34443B]">
              <Smartphone className="w-3 h-3 text-[#0B5D3B]" />
              <span>আইফোন .heic / .heif</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] bg-[#F8FAF9] border border-[#D5E4DB] px-2.5 py-1 text-[#34443B]">
              <Layers className="w-3 h-3 text-[#0B5D3B]" />
              <span>আনলিমিটেড ফাইল ব্যাচ</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] bg-[#F8FAF9] border border-[#D5E4DB] px-2.5 py-1 text-[#34443B]">
              <ShieldCheck className="w-3 h-3 text-[#0B5D3B]" />
              <span>১০০% প্রাইভেট ও নিরাপদ</span>
            </span>
          </div>

          {/* Quick Sample Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-[#0B5D3B] hover:text-[#084A2E] font-medium underline underline-offset-4 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>আইফোন ফাইল নেই? নমুনা HEIC ছবি দিয়ে পরীক্ষা করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar & Stats */}
      {items.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 sm:p-5 space-y-4 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[#084A2E] font-serif text-sm">
                মোট ছবি: {toBanglaNum(totalCount)}টি
              </span>
              <span className="text-[#D5E4DB]">|</span>
              <span className="text-emerald-700 font-medium">
                সম্পন্ন: {toBanglaNum(completedCount)}
              </span>
              <span className="text-[#4A5A52]">
                অপেক্ষমান: {toBanglaNum(pendingCount)}
              </span>
              {convertingCount > 0 && (
                <span className="text-[#0B5D3B] font-bold animate-pulse">
                  কনভার্ট হচ্ছে: {toBanglaNum(convertingCount)}
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 font-medium">
                  এরর: {toBanglaNum(errorCount)}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Convert All Button */}
              {pendingCount > 0 || errorCount > 0 ? (
                <button
                  type="button"
                  onClick={handleConvertAll}
                  disabled={isConvertingAll}
                  className="bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] px-4 py-2 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isConvertingAll ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>কনভার্ট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>সব কনভার্ট করুন ({toBanglaNum(pendingCount + errorCount)})</span>
                    </>
                  )}
                </button>
              ) : null}

              {/* Download All as ZIP Button */}
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] px-4 py-2 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isZipping ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>জিপ তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-3.5 h-3.5" />
                      <span>সব ডাউনলোড করুন (ZIP)</span>
                    </>
                  )}
                </button>
              )}

              {/* Clear All */}
              <button
                type="button"
                onClick={handleClearAll}
                className="border border-[#D5E4DB] bg-[#F8FAF9] hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-[#4A5A52] px-3 py-2 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছুন</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#4A5A52]">
                <span>কনভার্শন অগ্রগতি</span>
                <span className="font-mono font-semibold text-[#084A2E]">
                  {toBanglaNum(completedCount)} / {toBanglaNum(totalCount)} টি সম্পন্ন ({toBanglaNum(progressPercent)}%)
                </span>
              </div>
              <div className="w-full bg-[#F0F4F2] h-2 border border-[#D5E4DB] overflow-hidden rounded-lg">
                <div
                  className="bg-[#0B5D3B] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files Grid */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#084A2E] font-serif uppercase tracking-wider">
              ছবির তালিকা ({toBanglaNum(items.length)}টি ফাইল)
            </h2>
            <span className="text-xs text-[#4A5A52]">
              আউটপুট: <strong className="text-[#084A2E] uppercase">{outputFormat}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className={`bg-[#FFFFFF] border p-3 flex flex-col justify-between space-y-3 transition-all  rounded-2xl ${
                    item.status === 'completed'
                      ? 'border-[#0B5D3B]/60 shadow-sm'
                      : item.status === 'error'
                      ? 'border-red-400 bg-red-50/20'
                      : item.status === 'converting'
                      ? 'border-[#0B5D3B] ring-1 ring-[#0B5D3B]/30'
                      : 'border-[#D5E4DB]'
                  }`}
                >
                  {/* Thumbnail & Preview */}
                  <div className="relative aspect-[4/3] bg-[#F0F4F2] border border-[#D5E4DB]/70 flex items-center justify-center overflow-hidden group rounded-lg">
                    {item.status === 'completed' && item.convertedUrl ? (
                      <>
                        <img
                          src={item.convertedUrl}
                          alt={item.name}
                          width={400}
                          height={300}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActivePreviewUrl(item.convertedUrl!);
                            setActivePreviewName(item.convertedFileName || item.name);
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1 text-xs cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>প্রিভিউ দেখুন</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1.5 p-3 text-center">
                        <Smartphone className="w-7 h-7 text-[#0B5D3B]/70" />
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-[#D9E6DE] text-[#084A2E] px-1.5 py-0.5 border border-[#D5E4DB]">
                          আইফোন HEIC
                        </span>
                        <span className="text-[10px] text-[#4A5A52]">
                          কনভার্ট হলে থাম্বনেইল দেখা যাবে
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-[#F8FAF9]/90 backdrop-blur-xs text-[#4A5A52] border border-[#D5E4DB] px-1.5 py-0.5 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>অপেক্ষমান</span>
                        </span>
                      )}
                      {item.status === 'converting' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-[#0B5D3B] text-[#FFFFFF] px-2 py-0.5 font-bold shadow-xs">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>কনভার্ট হচ্ছে...</span>
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-700 text-[#FFFFFF] px-1.5 py-0.5 font-bold shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>সম্পন্ন</span>
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 font-bold">
                          <AlertCircle className="w-3 h-3" />
                          <span>ব্যর্থ</span>
                        </span>
                      )}
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-700 text-white p-1 transition-colors cursor-pointer"
                      title="ছবি মুছুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metadata & Status */}
                  <div className="space-y-1.5 text-xs">
                    <div
                      className="font-semibold text-[#084A2E] truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#4A5A52] font-mono">
                      <span>আসল: {formatSize(item.originalSizeBytes)}</span>
                      <span className="uppercase text-[10px] px-1 bg-[#F0F4F2] border border-[#D5E4DB]">
                        HEIC
                      </span>
                    </div>

                    {/* Converted Stats */}
                    {item.status === 'completed' && item.convertedSizeBytes && (
                      <div className="pt-1.5 border-t border-[#D5E4DB]/60 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#0B5D3B] font-bold">
                          নতুন: {formatSize(item.convertedSizeBytes)}
                        </span>
                        <span className="uppercase text-[10px] font-bold text-[#084A2E]">
                          {outputFormat}
                        </span>
                      </div>
                    )}

                    {/* Error message */}
                    {item.status === 'error' && (
                      <div className="pt-1 border-t border-red-200">
                        <p className="text-[11px] text-red-600 leading-tight">
                          {item.errorMessage || 'প্রসেসিং ব্যর্থ'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRetrySingle(index)}
                          className="mt-1 text-[11px] text-[#0B5D3B] hover:underline font-medium flex items-center space-x-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>আবার চেষ্টা করুন</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Individual Download Button */}
                  {item.status === 'completed' && item.convertedUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="w-full mt-1 border border-[#0B5D3B] bg-[#F0F4F2] hover:bg-[#0B5D3B] hover:text-[#FFFFFF] text-[#084A2E] py-1.5 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড ({outputFormat.toUpperCase()})</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Converted Preview */}
      {activePreviewUrl && (
        <div
          onClick={() => setActivePreviewUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#D5E4DB] max-w-3xl w-full p-4 relative space-y-3 rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#D5E4DB] pb-2">
              <span className="text-xs font-bold text-[#084A2E] truncate max-w-md">
                {activePreviewName}
              </span>
              <button
                type="button"
                onClick={() => setActivePreviewUrl(null)}
                className="text-[#4A5A52] hover:text-[#084A2E] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center overflow-auto bg-[#F0F4F2] p-2">
              <img
                src={activePreviewUrl}
                alt={activePreviewName}
                className="max-h-[65vh] w-auto object-contain shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <a
                href={activePreviewUrl}
                download={activePreviewName}
                className="bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] px-4 py-1.5 text-xs font-bold inline-flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড করুন</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic CMS Sections (Features, FAQs, Guidelines, Markdown, etc.) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="heic-converter" />
    </div>
  );
};
