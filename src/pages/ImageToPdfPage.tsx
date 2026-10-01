import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  UploadCloud,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
  Settings,
  HelpCircle,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import {
  generatePdfFromImages,
  ImageToPdfItem,
  ImageToPdfOptions,
  PageSizeOption,
  OrientationOption,
  MarginOption,
  formatFileSize
} from '../utils/imageToPdf.ts';
import pageContent from '../../content/pages/image-to-pdf.json';

export const ImageToPdfPage: React.FC = () => {
  const [images, setImages] = useState<ImageToPdfItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('portrait');
  const [margin, setMargin] = useState<MarginOption>('small');
  const [quality, setQuality] = useState<number>(0.92);

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<{ current: number; total: number } | null>(null);
  const [pdfResult, setPdfResult] = useState<{ url: string; size: number; count: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setErrorMessage('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newItem: ImageToPdfItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            sizeBytes: file.size,
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          setImages((prev) => [...prev, newItem]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImages(updated);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (images.length <= 1) {
      setPdfResult(null);
    }
  };

  const clearAll = () => {
    setImages([]);
    setPdfResult(null);
    setErrorMessage(null);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    setErrorMessage(null);
    setPdfResult(null);

    try {
      const options: ImageToPdfOptions = {
        pageSize,
        orientation,
        margin,
        imageQuality: quality,
      };

      const pdfBytes = await generatePdfFromImages(images, options, (current, total) => {
        setConversionProgress({ current, total });
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfResult({
        url,
        size: blob.size,
        count: images.length,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'পিডিএফ তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsConverting(false);
      setConversionProgress(null);
    }
  };

  return (
    <>
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/image-to-pdf"
        toolName="ছবি থেকে পিডিএফ কনভার্টার (Image to PDF Converter)"
        categoryName="ইমেজ টুলস"
        categoryPath="/image-to-pdf"
        faqs={pageContent.faqs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Navigation Breadcrumb bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরুন</span>
            </Link>
            <span className="text-xs text-[#4A5A52] hidden sm:inline">•</span>
            <span className="text-xs text-[#4A5A52] font-mono hidden sm:inline">IMG-PDF-01</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>১০০% ক্লায়েন্ট-সাইড • কোনো ফাইল সার্ভারে যায় না</span>
          </div>
        </div>

        {/* Heading Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
            <FileText className="w-3.5 h-3.5" />
            <span>ইমেজ ও ডকুমেন্ট ইউটিলিটি • ১০০% প্রাইভেট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
            {pageContent.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed max-w-3xl">
            {pageContent.subtitle}
          </p>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload and Image Ordering List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#0B5D3B]/40 hover:border-[#0B5D3B] bg-[#FFFFFF] hover:bg-[#F0F4F2]/50 transition-all p-8 rounded-2xl text-center cursor-pointer space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#084A2E] text-base font-serif">
                  ছবি নির্বাচন করুন অথবা এখানে টেনে এনে ছাড়ুন
                </p>
                <p className="text-xs text-[#4A5A52]">
                  JPG, PNG, WebP বা GIF • যত খুশি ছবি একসাথে যুক্ত করতে পারেন
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0B5D3B] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#084A2E] transition-colors pointer-events-none"
              >
                <Plus className="w-4 h-4" />
                <span>ছবি ফাইল ব্রাউজ করুন</span>
              </button>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 bg-[#fdf2f2] border border-[#f8b4b4] text-[#c8342a] text-xs rounded-xl flex items-center space-x-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Uploaded Images List / Reordering */}
            {images.length > 0 && (
              <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-[#0B5D3B]" />
                    <h2 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                      নির্বাচিত ছবি ({images.length}টি পৃষ্ঠা)
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-[#c8342a] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>সব মুছুন</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {images.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-[#FAFAF7] border border-[#D5E4DB] rounded-xl hover:border-[#0B5D3B]/40 transition-colors gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs font-bold font-mono flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-[#D5E4DB] shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#084A2E] truncate font-mono">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#4A5A52] font-mono">
                            {item.width} × {item.height} px • {formatFileSize(item.sizeBytes)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImage(index, 'up')}
                          title="উপরে নিন"
                          className="p-1.5 rounded-md hover:bg-[#D5E4DB] text-[#084A2E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => moveImage(index, 'down')}
                          title="নিচে নিন"
                          className="p-1.5 rounded-md hover:bg-[#D5E4DB] text-[#084A2E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(item.id)}
                          title="মুছে ফেলুন"
                          className="p-1.5 rounded-md hover:bg-[#fde8e8] text-[#c8342a] cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: PDF Settings & Conversion Result (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 space-y-5 rounded-2xl shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
                <Settings className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="font-bold text-[#084A2E] text-base font-serif">
                  পিডিএফ পেজ সেটিংস
                </h2>
              </div>

              {/* Page Size Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#084A2E]">
                  পৃষ্ঠার মাপ (Page Size)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      pageSize === 'a4'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    A4 (প্রমিত)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize('letter')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      pageSize === 'letter'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    US Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize('fit')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      pageSize === 'fit'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    ছবির মাপে (Fit)
                  </button>
                </div>
              </div>

              {/* Orientation Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#084A2E]">
                  ওরিয়েন্টেশন (Orientation)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      orientation === 'portrait'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    উল্লম্ব (Portrait)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      orientation === 'landscape'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    অনুভূমিক (Landscape)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('auto')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      orientation === 'auto'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    স্বয়ংক্রিয় (Auto)
                  </button>
                </div>
              </div>

              {/* Margin Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#084A2E]">
                  মার্জিন (Margin)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMargin('none')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      margin === 'none'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    মার্জিন নেই (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin('small')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      margin === 'small'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    স্বল্প (Small)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin('normal')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      margin === 'normal'
                        ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    স্বাভাবিক (Normal)
                  </button>
                </div>
              </div>

              {/* Quality Preset */}
              <div className="space-y-1.5 pt-2 border-t border-[#D5E4DB]">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#084A2E]">ছবির মান ও ফাইলের সাইজ</label>
                  <span className="font-mono text-[#0B5D3B] font-bold">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.98"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-[#0B5D3B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#4A5A52]">
                  <span>ছোট সাইজ (Compact)</span>
                  <span>ব্যালেন্সড (Standard)</span>
                  <span>হাই কোয়ালিটি (HD)</span>
                </div>
              </div>

              {/* Convert Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={images.length === 0 || isConverting}
                  onClick={convertToPdf}
                  className="w-full py-3 px-4 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        পিডিএফ তৈরি হচ্ছে... ({conversionProgress?.current || 1}/{conversionProgress?.total || images.length})
                      </span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>পিডিএফ তৈরি করুন ({images.length}টি পৃষ্ঠা)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result Download Card */}
            {pdfResult && (
              <div className="bg-[#FFFFFF] border-2 border-[#0B5D3B] p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center space-x-2 text-[#0B5D3B]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-base text-[#084A2E] font-serif">
                    পিডিএফ সফলভাবে তৈরি হয়েছে!
                  </h3>
                </div>

                <div className="bg-[#F0F4F2] p-3 rounded-xl border border-[#D5E4DB] space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#4A5A52]">মোট পৃষ্ঠা:</span>
                    <span className="font-bold text-[#084A2E]">{pdfResult.count}টি</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A5A52]">পিডিএফ সাইজ:</span>
                    <span className="font-bold text-[#0B5D3B]">
                      {formatFileSize(pdfResult.size)}
                    </span>
                  </div>
                </div>

                <a
                  href={pdfResult.url}
                  download="utools-images.pdf"
                  className="w-full py-3 px-4 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>এক ক্লিকে PDF ডাউনলোড করুন</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-base sm:text-xl font-bold text-[#084A2E] font-serif">
              কেন Utools.bd-এর ছবি থেকে পিডিএফ কনভার্টার সেরা?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
            <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-5 rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center font-bold">
                🔒
              </div>
              <h3 className="font-bold text-[#084A2E] text-sm">১০০% ডেটা প্রাইভেসি</h3>
              <p className="text-[#34443B] leading-relaxed text-xs">
                অন্যান্য সাইটের মতো ছবি কোনো ক্লাউড সার্ভারে আপলোড হয় না। সম্পূর্ণ ফাইল প্রসেসিং আপনার ডিভাইসের ব্রাউজারেই সম্পন্ন হয়।
              </p>
            </div>

            <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-5 rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center font-bold">
                📑
              </div>
              <h3 className="font-bold text-[#084A2E] text-sm">A4 ও অফিশিয়াল প্রিন্ট লেআউট</h3>
              <p className="text-[#34443B] leading-relaxed text-xs">
                চাকরির আবেদন, NID কার্ডের কপি ও ভার্সিটি অ্যাসাইনমেন্ট জমা দেওয়ার আন্তর্জাতিক প্রমিত A4 ফরম্যাটে নিখুঁত মার্জিন সাপোর্ট।
              </p>
            </div>

            <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-5 rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center font-bold">
                ⚡
              </div>
              <h3 className="font-bold text-[#084A2E] text-sm">আনলিমিটেড ও দ্রুতগতির</h3>
              <p className="text-[#34443B] leading-relaxed text-xs">
                কোনো ওয়াটারমার্ক নেই, কোনো লিমিট নেই। যত খুশি ছবির পাতা একসাথে ড্র্যাগ করে সিরিয়াল অনুযায়ী নিমেষেই একক PDF বানিয়ে নিন।
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ Accordion */}
        <CmsDynamicContent content={pageContent} />

        {/* Related Tools */}
        <RelatedTools currentToolId="image-to-pdf" />
      </div>
    </>
  );
};
