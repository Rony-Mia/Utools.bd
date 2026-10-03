import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import { PDFDocument } from 'pdf-lib';
import {
  UploadCloud,
  FileText,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  RotateCcw,
  Loader2,
  ExternalLink,
  Plus,
  ArrowRight,
  Crop,
  FileCheck
} from 'lucide-react';
import { toBanglaNum } from './AgeCalculatorPage.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/pdf-merger.json';

interface PdfFileItem {
  id: string;
  name: string;
  sizeBytes: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

interface MergeResult {
  url: string;
  fileCount: number;
  totalPages: number;
  totalSizeBytes: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${toBanglaNum(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${toBanglaNum(kb.toFixed(1))} KB`;
  const mb = kb / 1024;
  return `${toBanglaNum(mb.toFixed(2))} MB`;
}

export const PdfMergerPage: React.FC = () => {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState<boolean>(false);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevObjectUrlRef = useRef<string | null>(null);

  // Revoke object URL on unmount or before creating a new one
  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current);
      }
    };
  }, []);

  // Process newly picked/dropped File list
  const handleFilesAdded = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    setIsReadingFiles(true);
    const newItems: PdfFileItem[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith('.pdf') && file.type !== 'application/pdf') {
        errors.push(`"${file.name}": এটি একটি বৈধ পিডিএফ ফাইল নয়। শুধুমাত্র .pdf ফাইল যোগ করুন।`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        let pdfDoc: PDFDocument;
        try {
          pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
        } catch (loadErr: unknown) {
          const errStr = String(loadErr).toLowerCase();
          const errName = (loadErr as { name?: string })?.name?.toLowerCase() || '';
          if (
            errName.includes('password') ||
            errStr.includes('password') ||
            errStr.includes('encrypted') ||
            errStr.includes('decrypt')
          ) {
            errors.push(`"${file.name}": পাসওয়ার্ড-সুরক্ষিত পিডিএফ এখনো সাপোর্টেড না। অনুগ্রহ করে সুরক্ষা অপসারণ করে ফাইলটি দিন।`);
          } else {
            errors.push(`"${file.name}": ফাইলটি ক্ষতিগ্রস্ত বা অবৈধ পিডিএফ (করাপ্টেড)। অনুগ্রহ করে সঠিক ফাইল যোগ করুন।`);
          }
          continue;
        }

        const count = pdfDoc.getPageCount();
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          sizeBytes: file.size,
          pageCount: count,
          buffer,
        });
      } catch (readErr) {
        console.error('Error reading PDF:', readErr);
        errors.push(`"${file.name}": ফাইলটি পড়া সম্ভব হয়নি।`);
      }
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(' | '));
    }

    if (newItems.length > 0) {
      setFiles((prev) => [...prev, ...newItems]);
      // If we had an old result, clear it so user knows they need to merge again
      if (mergeResult) {
        if (prevObjectUrlRef.current) {
          URL.revokeObjectURL(prevObjectUrlRef.current);
          prevObjectUrlRef.current = null;
        }
        setMergeResult(null);
      }
    }

    setIsReadingFiles(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  const handleDropZone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
    if (mergeResult) {
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current);
        prevObjectUrlRef.current = null;
      }
      setMergeResult(null);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setErrorMessage(null);
    if (prevObjectUrlRef.current) {
      URL.revokeObjectURL(prevObjectUrlRef.current);
      prevObjectUrlRef.current = null;
    }
    setMergeResult(null);
  };

  // Reorder using buttons (accessible & mobile-friendly)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Drag and drop reordering inside the list
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFiles((prev) => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, draggedItem);
      return updated;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Execute in-browser PDF Merge using pdf-lib
  const handleMergePdfs = async () => {
    if (files.length < 2) {
      setErrorMessage('মার্জ করতে কমপক্ষে ২টি পিডিএফ ফাইল যোগ করুন।');
      return;
    }

    setErrorMessage(null);
    setIsMerging(true);
    setMergeProgress('মার্জ প্রক্রিয়া শুরু হচ্ছে...');

    try {
      // 1. Create a new empty PDF document
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      // 2. Sequentially copy all pages from each source PDF
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        setMergeProgress(
          `ফাইল ${toBanglaNum(i + 1)}/${toBanglaNum(files.length)} মার্জ হচ্ছে (${item.name})...`
        );

        const srcDoc = await PDFDocument.load(item.buffer);
        const indices = srcDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcDoc, indices);

        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }
        totalPages += indices.length;
      }

      setMergeProgress('চূড়ান্ত পিডিএফ তৈরি ও অপ্টিমাইজ করা হচ্ছে...');

      // 3. Save merged PDF to bytes
      const mergedBytes = await mergedPdf.save();

      // 4. Create local blob URL for download
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current);
      }
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      prevObjectUrlRef.current = downloadUrl;

      setMergeResult({
        url: downloadUrl,
        fileCount: files.length,
        totalPages,
        totalSizeBytes: mergedBytes.byteLength,
      });
    } catch (err) {
      console.error('PDF merge error:', err);
      setErrorMessage('পিডিএফ মার্জ করার সময় ত্রুটি ঘটেছে। অনুগ্রহ করে ফাইলগুলো পুনরায় চেক করে চেষ্টা করুন।');
    } finally {
      setIsMerging(false);
      setMergeProgress('');
    }
  };

  const handleDownload = () => {
    if (!mergeResult) return;
    const a = document.createElement('a');
    a.href = mergeResult.url;
    a.download = 'merged-utools.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Compute total pages and total size for selected files
  const totalPagesSelected = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalBytesSelected = files.reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/pdf-merger"
        toolName="অনলাইন পিডিএফ মার্জার"
        categoryName="পিডিএফ টুলস"
        faqs={pageContent.faqs}
      />

      {/* Top Breadcrumb & Prominent Privacy Guarantee Badge */}
      <ToolBreadcrumb
        toolName="অনলাইন পিডিএফ মার্জার"
        categoryName="পিডিএফ টুলস"
        categoryPath="/pdf-merger"
        privacyText="আনলিমিটেড • ১০০% ক্লায়েন্ট-সাইড • কোনো আপলোড নেই"
      />

      {/* Page Title & Intro */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
          <Layers className="w-3.5 h-3.5" />
          <span>ডকুমেন্ট ইউটিলিটি • প্রফেশনাল পিডিএফ মার্জার</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-sm sm:text-base text-[#34443B] max-w-4xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Main Merger Console Card */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-6 shadow-xs rounded-2xl">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          id="pdf-file-picker"
        />

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDropZone}
          className={`border-2 border-dashed p-6 sm:p-10 text-center transition-all cursor-pointer  rounded-2xl ${
            isDraggingOver
              ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 scale-[0.995]'
              : 'border-[#D5E4DB] hover:border-[#0B5D3B] bg-[#F0F4F2]/30 hover:bg-[#F0F4F2]/60'
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F0F4F2] border border-[#D5E4DB] flex items-center justify-center text-[#0B5D3B]">
              {isReadingFiles ? (
                <Loader2 className="w-7 h-7 animate-spin text-[#0B5D3B]" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
                {isReadingFiles
                  ? 'ফাইল প্রক্রিয়াকরণ ও পেজ লোড হচ্ছে...'
                  : 'পিডিএফ ফাইল নির্বাচন করুন বা এখানে টেনে এনে ছেড়ে দিন'}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5A52]">
                একসাথে একাধিক (১০, ২০ বা ততোধিক) .pdf ফাইল সিলেক্ট করতে পারেন
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px] font-medium text-[#084A2E]">
              <span className="bg-[#FFFFFF] border border-[#D5E4DB] px-2.5 py-1">
                ✓ কোনো ফাইল সীমা নেই
              </span>
              <span className="bg-[#FFFFFF] border border-[#D5E4DB] px-2.5 py-1">
                ✓ কোনো ওয়াটারমার্ক নেই
              </span>
              <span className="bg-[#FFFFFF] border border-[#D5E4DB] px-2.5 py-1">
                ✓ ১০০% গোপনীয় ও নিরাপদ
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-800 flex items-start space-x-3 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-red-900">ফাইল লোডিং সতর্কতা:</div>
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Selected Files List & Reorder Section */}
        {files.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E4DB] pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
                  নির্বাচিত ফাইলসমূহ ({toBanglaNum(files.length)}টি)
                </span>
                <span className="text-xs text-[#4A5A52] font-mono bg-[#F0F4F2] border border-[#D5E4DB] px-2 py-0.5">
                  মোট পেজ: {toBanglaNum(totalPagesSelected)} | আকার: {formatFileSize(totalBytesSelected)}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#084A2E] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>আরও ফাইল যোগ করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 font-medium flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>সবগুলো মুছুন</span>
                </button>
              </div>
            </div>

            {/* Helper Notice for Dragging */}
            <div className="text-[11px] text-[#4A5A52] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>
                ফাইলগুলোর ধারাবাহিক ক্রম পরিবর্তন করতে মাউস দিয়ে ড্র্যাগ করুন অথবা ডানের তীরচিহ্ন (↑ ↓) ব্যবহার করুন।
              </span>
            </div>

            {/* List of Files */}
            <div className="space-y-2">
              {files.map((item, index) => {
                const isItemDragged = draggedIndex === index;
                const isItemOver = dragOverIndex === index;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border p-3 sm:p-3.5 transition-all flex items-center justify-between gap-3 select-none  rounded-2xl ${
                      isItemDragged
                        ? 'opacity-40 bg-[#E6F4EC] border-[#0B5D3B] border-dashed'
                        : isItemOver
                        ? 'border-t-2 border-t-[#0B5D3B] bg-[#F0F4F2]'
                        : 'bg-[#FFFFFF] border-[#D5E4DB] hover:border-[#0B5D3B]/60'
                    }`}
                  >
                    {/* Left: Drag handle + Index + File Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className="cursor-grab active:cursor-grabbing text-[#4A5A52] hover:text-[#084A2E] p-1"
                        title="ড্র্যাগ করে ক্রম পরিবর্তন করুন"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="w-6 h-6 bg-[#F0F4F2] border border-[#D5E4DB] text-xs font-mono font-bold text-[#084A2E] flex items-center justify-center shrink-0 rounded-lg">
                        {toBanglaNum(index + 1)}
                      </div>

                      <div className="w-8 h-8 bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center shrink-0 border border-[#0B5D3B]/20 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-[#0F1F17] truncate font-sans">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#4A5A52] flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                          <span className="text-[#0B5D3B] font-semibold">
                            {toBanglaNum(item.pageCount)}টি পেজ
                          </span>
                          <span className="text-[#D5E4DB]">•</span>
                          <span>{formatFileSize(item.sizeBytes)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Move Up/Down + Remove Button */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="উপরে সরান"
                        className={`p-1.5 border transition-colors cursor-pointer ${
                          index === 0
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === files.length - 1}
                        title="নিচে সরান"
                        className={`p-1.5 border transition-colors cursor-pointer ${
                          index === files.length - 1
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        title="তালিকা থেকে বাদ দিন"
                        className="p-1.5 border border-[#D5E4DB] text-[#c8342a] hover:bg-red-50 transition-colors ml-1 cursor-pointer rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Merge Action Row */}
            <div className="pt-4 border-t border-[#D5E4DB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[#4A5A52]">
                {files.length < 2 ? (
                  <span className="text-amber-700 font-medium">
                    ⚠️ মার্জ চালু করতে কমপক্ষে ২টি পিডিএফ ফাইল যোগ করতে হবে।
                  </span>
                ) : (
                  <span>
                    সর্বমোট <strong>{toBanglaNum(files.length)}টি ফাইল</strong> ({toBanglaNum(totalPagesSelected)}টি পেজ) ক্রমানুসারে একটি ফাইলে মার্জ হবে।
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleMergePdfs()}
                disabled={files.length < 2 || isMerging}
                className={`px-6 py-3 font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs ${
                  files.length < 2 || isMerging
                    ? 'bg-[#D5E4DB] text-[#4A5A52] cursor-not-allowed'
                    : 'bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                    <span>মার্জ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>মার্জ করুন ({toBanglaNum(files.length)}টি ফাইল)</span>
                  </>
                )}
              </button>
            </div>

            {/* Loading / Progress Text */}
            {isMerging && mergeProgress && (
              <div className="bg-[#F0F4F2] border border-[#D5E4DB] p-3 text-xs text-[#084A2E] font-medium flex items-center space-x-2 rounded-2xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B5D3B]" />
                <span>{mergeProgress}</span>
              </div>
            )}
          </div>
        )}

        {/* Merged Result & Download Card */}
        {mergeResult && (
          <div className="bg-[#F0F4F2]/50 border-2 border-[#0B5D3B] p-5 sm:p-6 space-y-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B5D3B]/20 pb-3">
              <div className="flex items-center space-x-2 text-[#0B5D3B]">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-[#084A2E] font-serif text-base sm:text-lg">
                  পিডিএফ সফলভাবে মার্জ সম্পন্ন হয়েছে!
                </h3>
              </div>
              <span className="text-xs text-[#4A5A52] font-mono bg-[#FFFFFF] border border-[#D5E4DB] px-2 py-0.5">
                ফাইলনেম: merged-utools.pdf
              </span>
            </div>

            {/* Meta Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                <span className="block text-[11px] font-medium text-[#4A5A52]">একত্রিত ফাইল</span>
                <span className="font-mono font-bold text-base text-[#084A2E]">
                  {toBanglaNum(mergeResult.fileCount)}টি
                </span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                <span className="block text-[11px] font-medium text-[#4A5A52]">সর্বমোট পেজ</span>
                <span className="font-mono font-bold text-base text-[#0B5D3B]">
                  {toBanglaNum(mergeResult.totalPages)}টি
                </span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                <span className="block text-[11px] font-medium text-[#4A5A52]">আউটপুট সাইজ</span>
                <span className="font-mono font-bold text-base text-[#084A2E]">
                  {formatFileSize(mergeResult.totalSizeBytes)}
                </span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                <span className="block text-[11px] font-medium text-[#4A5A52]">প্রসেসিং মোড</span>
                <span className="font-semibold text-xs text-[#0B5D3B] mt-1 block">
                  ১০০% ক্লায়েন্ট-সাইড
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <a
                  href={mergeResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 text-xs font-medium border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>প্রিভিউ দেখুন</span>
                </a>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3.5 py-2 text-xs font-medium border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#4A5A52] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>নতুন করে মার্জ করুন</span>
                </button>
              </div>

              {/* Main CTA */}
              <button
                type="button"
                onClick={handleDownload}
                className="px-6 py-2.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] font-semibold text-sm flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>মার্জ করা PDF ডাউনলোড করুন</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* On-Page SEO / Educational Content (800-1200+ words)      */}
      {/* ======================================================== */}

      {/* Comprehensive Architectural Deep Dive & Overview */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-5 leading-relaxed text-[#0F1F17] rounded-2xl">
        <div className="space-y-2 border-b border-[#D5E4DB] pb-4">
          <div className="flex items-center space-x-2 text-[#0B5D3B] text-xs font-bold uppercase tracking-wider font-mono">
            <Zap className="w-4 h-4" />
            <span>প্রযুক্তিগত বিশ্লেষণ ও সম্পূর্ণ নির্দেশিকা</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
            কেন Utools.bd-এর পিডিএফ মার্জার সত্যিই "আনলিমিটেড ও নিরাপদ"?
          </h2>
        </div>

        <div className="text-xs sm:text-sm text-[#34443B] space-y-4">
          <p>
            ইন্টারনেটে বহু তথাকথিত "ফ্রি পিডিএফ মার্জার" পাওয়া যায়, কিন্তু বাস্তবে ব্যবহারের সময় প্রায় সবগুলোতেই কঠিন সীমাবদ্ধতা থাকে। বেশিরভাগ প্রচলিত ওয়েবসাইট আপনার ফাইলগুলোকে তাদের ক্লাউড সার্ভারে আপলোড করে প্রসেস করে। সার্ভারের ব্যান্ডউইথ ও কম্পিউটিং খরচের কারণে তারা ২-৩টি ফাইল বা ১০-১৫ মেগাবাইটের পর লিমিটেশন চাপিয়ে দেয়, অথবা ঘণ্টাখানেক অপেক্ষা করতে বলে কিংবা প্রিমিয়াম সাবস্ক্রিপশন কিনতে বাধ্য করে। তদুপরি, আপনার ব্যাংকিং স্টেটমেন্ট, জাতীয় পরিচয়পত্র, জীবনবৃত্তান্ত (CV) কিংবা আইনি দলিলের মতো সংবেদনশীল ও ব্যক্তিগত ফাইল কোনো তৃতীয় পক্ষের সার্ভারে আপলোড হওয়া মারাত্মক গোপনীয়তা ঝুঁকির সৃষ্টি করে।
          </p>
          <p>
            Utools.bd-এর এই পিডিএফ মার্জার তৈরি হয়েছে সম্পূর্ণ আধুনিক <strong>ইন-ব্রাউজার ক্লায়েন্ট-সাইড আর্কিটেকচারে</strong>। এখানে ব্যবহৃত হয়েছে ব্রাউজার-নেটিভ WebAssembly ও অত্যন্ত অপ্টিমাইজড JavaScript ইঞ্জিন। আপনি যখন আপনার কম্পিউটার বা ফোন থেকে ফাইল সিলেক্ট করেন, সেই ফাইলগুলো ইন্টারনেটের মাধ্যমে কোনো রিমোট সার্ভারে প্রেরিত হয় না। আপনার ডিভাইসের নিজস্ব র‍্যাম (RAM) ও প্রসেসর ব্যবহার করে সম্পূর্ণ ব্রাউজার ট্যাবের ভেতরেই সেকেন্ডের ভগ্নাংশে প্রতিটি পেজের ভেক্টর ডেটা পড়ে এবং নতুন একটি একক মার্জড ডকুমেন্টে রূপান্তর করে।
          </p>
          <p>
            যেহেতু কোনো সার্ভার ব্যান্ডউইথ বা প্রসেসিং ব্যয় হয় না, তাই আমাদের পক্ষে <strong>শতভাগ আনলিমিটেড</strong> সেবা দেওয়া সম্ভব। আপনি চাইলে ৫টি, ২০টি কিংবা ৫০টি ফাইল একসাথে মার্জ করতে পারেন। কোনো কৃত্রিম ফাইল সাইজ লিমিট নেই, ওয়াটারমার্ক বসানো হয় না এবং কোনো প্রকার সাইন-আপ বা ক্রেডিট কার্ডের তথ্য চাওয়া হয় না।
          </p>
        </div>
      </section>

      {/* 6 Feature Cards Bento Grid */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
          <span>টুলের মূল বৈশিষ্ট্য ও সুবিধাসমূহ</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2.5 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              আনলিমিটেড ফাইল ও পেজ মার্জ
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              ফাইল সংখ্যা বা পেজের পরিমাণের ওপর কোনো কৃত্রিম বাধা নেই। সাধারণ অ্যাসাইনমেন্ট থেকে শুরু করে শত শত পাতার সরকারি অডিট রিপোর্ট—সবই এক ক্লিকে মার্জ করা সম্ভব।
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2.5 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ১০০% ক্লায়েন্ট-সাইড প্রাইভেসি
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              আপনার ফাইল কোনো অবস্থাতেই ইন্টারনেট পাড়ি দিয়ে আমাদের বা কোনো ক্লাউড সার্ভারে আপলোড হয় না। ফলে আপনার ব্যক্তিগত দলিল, ব্যাংক পেপার ও এনআইডি থাকে ১০০% নিরাপদ।
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2.5 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              কোনো সাইন-আপ বা সাবস্ক্রিপশন নেই
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              অ্যাকাউন্ট খোলা, ওটিপি বা ইমেইল ভেরিফিকেশনের কোনো ঝামেলা নেই। পেজে আসা মাত্রই সরাসরি ব্যবহার শুরু করুন। কোনো হিডেন ফি বা পেইড প্ল্যান নেই।
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2.5 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <GripVertical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ড্র্যাগ-অ্যান্ড-ড্রপ রিঅর্ডারিং
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              ফাইলগুলো আপলোডের পর আপনার পছন্দমতো মাউস দিয়ে টেনে বা মোবাইল তীরচিহ্নের সাহায্যে আগে-পিছে সাজিয়ে নিতে পারবেন, যাতে কাঙ্ক্ষিত ক্রমে পেজগুলো যুক্ত হয়।
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2.5 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              বজ্রগতির তাৎক্ষণিক এক্সিকিউশন
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              সার্ভার কিউ বা আপলোড-ডাউনলোডের অপেক্ষায় নষ্ট হবে না মূল্যবান সময়। লোকাল ডিভাইসের প্রসেসর স্পিডে কাজ চলায় সেকেন্ডের মধ্যেই প্রস্তুত হয়ে যায় চূড়ান্ত ফাইল।
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2.5 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              আসল কোয়ালিটি ও লেআউট অক্ষুণ্ণ
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              কোনো ক্ষতিকর লসি (lossy) কম্প্রেশন প্রয়োগ করা হয় না। প্রতিটি ডকুমেন্টের ফন্ট, ক্লিপ আর্ট, চার্ট ও কালার রেজোলিউশন শতভাগ অপরিবর্তিত থাকে।
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic CMS Sections (Steps, FAQs, Features, Guidelines, Markdown, etc.) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="pdf-merger" />
    </div>
  );
};
