import React, { useState, useId } from 'react';
import {
  Stamp,
  Hash,
  Download,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck,
  FileText,
  AlertTriangle,
  RotateCw,
  Image as ImageIcon,
  Type,
  Grid,
  Maximize2,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PdfToolLayout } from '../components/pdf/PdfToolLayout.tsx';
import { PdfFileDropzone } from '../components/pdf/PdfFileDropzone.tsx';
import {
  getPdfInfo,
  addPageNumbers,
  addWatermark,
  downloadPdfBlob,
  formatBytesBengali,
  toBanglaDigits,
  LoadedPdfInfo,
  PageNumberPosition,
  PageNumberFormat,
  WatermarkType,
  WatermarkPosition
} from '../lib/pdfUtils.ts';
import { toBanglaNum } from '../utils/bnDigits.ts';
import pageContent from '../../content/pages/pdf-watermark.json';

interface ProcessOutput {
  bytes: Uint8Array;
  blobUrl: string;
  name: string;
  pageCount: number;
}

export const PdfWatermarkPage: React.FC = () => {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdfInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tab/Mode: 'all' | 'watermark' | 'pagenumber'
  const [activeMode, setActiveMode] = useState<'all' | 'watermark' | 'pagenumber'>('all');

  // Watermark state
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);
  const [wmType, setWmType] = useState<WatermarkType>('text');
  const [wmText, setWmText] = useState<string>('CONFIDENTIAL');
  const [wmTextColor, setWmTextColor] = useState<string>('#64748b');
  const [wmFontSize, setWmFontSize] = useState<number>(44);
  const [wmRotation, setWmRotation] = useState<number>(-45);
  const [wmOpacity, setWmOpacity] = useState<number>(0.22);
  const [wmPosition, setWmPosition] = useState<WatermarkPosition>('center');

  // Watermark Image state
  const [wmImageBytes, setWmImageBytes] = useState<Uint8Array | null>(null);
  const [wmImageFormat, setWmImageFormat] = useState<'png' | 'jpg'>('png');
  const [wmImagePreviewUrl, setWmImagePreviewUrl] = useState<string | null>(null);
  const [wmImageScale, setWmImageScale] = useState<number>(0.4);

  // Page Numbering state
  const [enablePageNumbers, setEnablePageNumbers] = useState<boolean>(true);
  const [pnPosition, setPnPosition] = useState<PageNumberPosition>('bottom-center');
  const [pnFormat, setPnFormat] = useState<PageNumberFormat>('page_x_of_y');
  const [pnStartNumber, setPnStartNumber] = useState<number>(1);
  const [pnFontSize, setPnFontSize] = useState<number>(11);
  const [pnColor, setPnColor] = useState<string>('#333333');
  const [pnMargin, setPnMargin] = useState<number>(24);
  const [pnUseBangla, setPnUseBangla] = useState<boolean>(false);
  const [pnOpacity, setPnOpacity] = useState<number>(0.85);

  // Processing & Download state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processResult, setProcessResult] = useState<ProcessOutput | null>(null);

  // Unique IDs for accessibility
  const wmTextInputId = useId();
  const wmFontSizeInputId = useId();
  const wmRotationInputId = useId();
  const wmOpacityInputId = useId();
  const wmLogoFileInputId = useId();
  const wmLogoScaleInputId = useId();
  const pnStartNumberInputId = useId();
  const pnFontSizeInputId = useId();
  const pnMarginInputId = useId();
  const pnOpacityInputId = useId();

  // File selection
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const info = await getPdfInfo(file);
      setLoadedPdf(info);
      if (processResult) {
        URL.revokeObjectURL(processResult.blobUrl);
        setProcessResult(null);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'পিডিএফ লোড করা সম্ভব হয়নি।');
      setLoadedPdf(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    if (!isJpg && !isPng) {
      setErrorMessage('ওয়াটারমার্ক লোগো হিসেবে শুধুমাত্র PNG বা JPG ইমেজ নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(reader.result);
        setWmImageBytes(bytes);
        setWmImageFormat(isJpg ? 'jpg' : 'png');
        if (wmImagePreviewUrl) URL.revokeObjectURL(wmImagePreviewUrl);
        setWmImagePreviewUrl(URL.createObjectURL(file));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    if (processResult) {
      URL.revokeObjectURL(processResult.blobUrl);
    }
    setLoadedPdf(null);
    setProcessResult(null);
    setErrorMessage(null);
    if (wmImagePreviewUrl) {
      URL.revokeObjectURL(wmImagePreviewUrl);
      setWmImagePreviewUrl(null);
      setWmImageBytes(null);
    }
  };

  // Execute processing
  const handleApplyWatermarkAndPageNumbers = async () => {
    if (!loadedPdf) return;

    const applyWm = activeMode === 'all' || activeMode === 'watermark';
    const applyPn = activeMode === 'all' || activeMode === 'pagenumber';

    if (!applyWm && !applyPn) {
      setErrorMessage('অনুগ্রহ করে ওয়াটারমার্ক অথবা পেজ নম্বর এর মধ্যে অন্তত একটি ফিচার সিলেক্ট করুন।');
      return;
    }

    if (applyWm && wmType === 'text' && !wmText.trim()) {
      setErrorMessage('ওয়াটারমার্ক টেক্সট ফিল্ডে কিছু লিখুন (যেমন: CONFIDENTIAL, খসড়া ইত্যাদি)।');
      return;
    }

    if (applyWm && wmType === 'image' && !wmImageBytes) {
      setErrorMessage('অনুগ্রহ করে ওয়াটারমার্ক হিসেবে একটি লোগো ছবি (PNG/JPG) আপলোড করুন।');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Create a fresh clone of doc from buffer so original stays pristine
      const { PDFDocument } = await import('pdf-lib');
      const freshDoc = await PDFDocument.load(loadedPdf.buffer);

      // 1. Apply Watermark if selected
      if (applyWm) {
        await addWatermark(freshDoc, {
          type: wmType,
          text: wmText.trim(),
          textColor: wmTextColor,
          fontSize: wmFontSize,
          rotationDegrees: wmRotation,
          opacity: wmOpacity,
          position: wmPosition,
          imageBytes: wmImageBytes || undefined,
          imageFormat: wmImageFormat,
          imageScale: wmImageScale,
        });
      }

      // 2. Apply Page Numbers if selected
      if (applyPn) {
        await addPageNumbers(freshDoc, {
          position: pnPosition,
          fontSize: pnFontSize,
          opacity: pnOpacity,
          startNumber: pnStartNumber,
          format: pnFormat,
          color: pnColor,
          margin: pnMargin,
          useBanglaDigits: pnUseBangla,
        });
      }

      const newBytes = await freshDoc.save();
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_watermarked.pdf`;

      setProcessResult({
        bytes: newBytes,
        blobUrl,
        name: outName,
        pageCount: freshDoc.getPageCount(),
      });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? `প্রসেসিংয়ে সমস্যা হয়েছে: ${err.message}`
          : 'অপ্রত্যাশিত কোনো কারণে ফাইল তৈরি করা যায়নি।'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processResult) return;
    const a = document.createElement('a');
    a.href = processResult.blobUrl;
    a.download = processResult.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Preview helper values
  const isWatermarkActive = activeMode === 'all' || activeMode === 'watermark';
  const isPageNumberActive = activeMode === 'all' || activeMode === 'pagenumber';

  // Preview Page Number text generator
  const getPreviewPnText = () => {
    const pNum = pnStartNumber;
    const tNum = loadedPdf?.pageCount || 10;
    const pStr = pnUseBangla ? toBanglaDigits(pNum) : String(pNum);
    const tStr = pnUseBangla ? toBanglaDigits(tNum) : String(tNum);

    switch (pnFormat) {
      case 'page_x_of_y':
        return `Page ${pStr} of ${tStr}`;
      case 'x_of_y':
        return `${pStr} of ${tStr}`;
      case 'number_only':
        return pStr;
      case 'page_x':
        return `Page ${pStr}`;
      case 'bn_page_x':
        return `পৃষ্ঠা ${toBanglaDigits(pNum)}`;
      case 'bn_page_x_of_y':
        return `পৃষ্ঠা ${toBanglaDigits(pNum)} এর ${toBanglaDigits(tNum)}`;
      case 'bn_number_only':
        return toBanglaDigits(pNum);
      default:
        return `Page ${pStr} of ${tStr}`;
    }
  };

  return (
    <PdfToolLayout
      title={pageContent.metaTitle}
      metaDescription={pageContent.metaDescription}
      canonicalUrl="https://utools.bd/pdf-watermark-page-number"
      ogTitle={pageContent.metaTitle}
      ogDescription={pageContent.metaDescription}
      refCode="DOC-PDF-05"
      badgeText="ডকুমেন্ট সিকিউরিটি ও স্ট্যাম্প"
      h1={pageContent?.title || "পিডিএফ ওয়াটারমার্ক ও পেজ নম্বর (PDF Watermark & Page Number)"}
      introText={pageContent?.introText || "অফিসিয়াল ডকুমেন্ট, টেন্ডার পেপার, থিসিস বা আইনি ফাইলে কাস্টম ওয়াটারমার্ক স্ট্যাম্প এবং পেশাদার পেজ নম্বর বসিয়ে নথিকে অপব্যবহারমুক্ত রাখুন। সম্পূর্ণ ক্লায়েন্ট-সাইড প্রযুক্তি, ১০০% সুরক্ষিত ও নিরাপদ।"}
      currentToolId="pdf-watermark-page-number"
      cmsContent={pageContent}
      howToSteps={[
        {
          stepNum: '০১',
          title: 'পিডিএফ নির্বাচন করুন',
          desc: 'আপনার কম্পিউটার বা মোবাইল থেকে যে পিডিএফে ওয়াটারমার্ক বা পেজ নম্বর দিতে চান তা নির্বাচন বা ড্রপ করুন।',
        },
        {
          stepNum: '০২',
          title: 'মোড ও অপশন নির্ধারণ',
          desc: 'টেক্সট বা লোগো ওয়াটারমার্ক, অপাসিটি, পজিশন এবং পেজ নম্বর ফরম্যাট (বাংলা/ইংরেজি) নিজের পছন্দমতো সাজিয়ে নিন।',
        },
        {
          stepNum: '০৩',
          title: 'লাইভ প্রিভিউ পরীক্ষা',
          desc: 'ডানপাশের ইন্টারঅ্যাকটিভ এ-ফোর (A4) প্রিভিউতে ওয়াটারমার্ক ও পেজ নম্বরের সঠিক অবস্থান দেখে নিশ্চিত হন।',
        },
        {
          stepNum: '০৪',
          title: 'এক ক্লিকে ডাউনলোড',
          desc: '"যুক্ত করুন" বাটনে ক্লিক করলেই ব্রাউজারে নিমেষেই প্রসেস হয়ে চূড়ান্ত পিডিএফ ডাউনলোড হয়ে যাবে।',
        },
      ]}
      faqs={pageContent.faqs}
      deepDiveTitle="ডকুমেন্ট নিরাপত্তা ও পেজ নম্বরিংয়ের প্রয়োজনীয়তা"
      deepDiveContent={
        <div className="space-y-4 text-[#24332B] leading-relaxed">
          <p>
            আধুনিক ডিজিটাল যুগে যেকোনো অফিসিয়াল, প্রাতিষ্ঠানিক কিংবা শিক্ষাজীবনের নথিপত্র অন্য কারো মাধ্যমে চুরি বা অনুমতিহীন পুনর্ব্যবহার হওয়ার ঝুঁকি সর্বদা থেকেই যায়। একটি দৃশ্যমান বা সূক্ষ্ম <strong>ওয়াটারমার্ক (Watermark)</strong> ডকুমেন্টের সত্যতা, কপিরাইট এবং গোপনীয়তা রক্ষায় প্রথম প্রতিরক্ষা বলয় হিসেবে কাজ করে।
          </p>
          <p>
            বাংলাদেশে বিভিন্ন সরকারি টেন্ডার, বিসিএস বা ব্যাংক চাকরির আবেদন কপি, কোর্টের হলফনামা, কিংবা ঢাকা বিশ্ববিদ্যালয় ও বুয়েটের থিসিস পেপারে ওয়াটারমার্ক (যেমন: "খসড়া", "CONFIDENTIAL", "শুধুমাত্র দাপ্তরিক কাজের জন্য") অত্যন্ত সুপরিচিত। পাশাপাশি মাল্টিপল পেজের রিপোর্টে প্রতিটি পৃষ্ঠার ধারাবাহিকতা বজায় রাখতে <strong>পেজ নম্বরিং (Page Numbering)</strong> আবশ্যক।
          </p>
          <div className="border-l-4 border-[#0B5D3B] pl-4 py-2 bg-[#F0F4F2]/60 my-4">
            <h4 className="font-bold text-[#084A2E] text-base mb-1">
              কেন Utools.bd-এর ওয়াটারমার্ক ও পেজ নম্বর টুল সেরা?
            </h4>
            <p className="text-sm">
              বেশিরভাগ অনলাইন সাইট ফাইল সার্ভারে আপলোড করায় স্পর্শকাতর ফাইল লিক হওয়ার ভয় থাকে। Utools.bd-তে কোনো ফাইল কোনোদিন আপনার ডিভাইস ছেড়ে কোথাও যায় না। তাছাড়া বাংলা ও ইংরেজি উভয় ভাষায় পেজ নম্বর ও ওয়াটারমার্কের সুবিধা রয়েছে।
            </p>
          </div>
        </div>
      }
    >
      {/* TOOL WORKBENCH */}
      <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-6 lg:p-8 space-y-8 rounded-2xl">
        {/* Step 1: Dropzone (if not loaded yet) */}
        {!loadedPdf && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#084A2E]">
              <span className="bg-[#F0F4F2] border border-[#D5E4DB] px-2 py-0.5 font-bold">ধাপ ১</span>
              <span>পিডিএফ ফাইল নির্বাচন করুন</span>
            </div>

            <PdfFileDropzone
              multiple={false}
              onFilesSelected={handleFileSelected}
              isLoading={isLoading}
              errorMessage={errorMessage}
              title="পিডিএফ ফাইল নির্বাচন করুন বা এখানে টেনে এনে ছেড়ে দিন"
              subtitle="একটি .pdf ফাইল নির্বাচন করুন • সর্বোচ্চ দ্রুত ও ১০০% প্রাইভেট প্রসেসিং"
            />
          </div>
        )}

        {/* Step 2: Loaded PDF Controls & Workbench */}
        {loadedPdf && !processResult && (
          <div className="space-y-8">
            {/* File Info Bar */}
            <div className="border border-[#D5E4DB] bg-[#F0F4F2]/50 p-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 bg-[#0B5D3B] text-[#FFFFFF] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-[#4A5A52]">নির্বাচিত ফাইল:</span>
                    <span className="text-xs font-mono font-bold bg-[#0B5D3B]/10 text-[#084A2E] px-2 py-0.5">
                      {toBanglaNum(loadedPdf.pageCount)} পৃষ্ঠা
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#084A2E] truncate">{loadedPdf.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-[#4A5A52]">
                  সাইজ: {formatBytesBengali(loadedPdf.sizeBytes)}
                </span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#D5E4DB]/30 text-xs font-medium text-[#084A2E] transition-colors cursor-pointer rounded-lg"
                >
                  অন্য ফাইল নিন
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="border-b border-[#D5E4DB] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveMode('all')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeMode === 'all'
                      ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                      : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>উভয়টি একসাথে</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('watermark')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeMode === 'watermark'
                      ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                      : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <Stamp className="w-4 h-4" />
                  <span>ওয়াটারমার্ক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('pagenumber')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeMode === 'pagenumber'
                      ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                      : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span>পেজ নম্বর</span>
                </button>
              </div>

              <div className="text-xs text-[#4A5A52]">
                {activeMode === 'all' && 'ওয়াটারমার্ক এবং পেজ নম্বর দুটোই এক ক্লিকে প্রয়োগ হবে'}
                {activeMode === 'watermark' && 'শুধুমাত্র ওয়াটারমার্ক যুক্ত হবে'}
                {activeMode === 'pagenumber' && 'শুধুমাত্র পৃষ্ঠা নম্বর যুক্ত হবে'}
              </div>
            </div>

            {/* Main Workbench Layout: Options Grid (Left) + Live Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Configuration Panels (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. WATERMARK CONFIGURATION PANEL */}
                {isWatermarkActive && (
                  <div className="border border-[#D5E4DB] bg-[#F0F4F2]/30 p-5 space-y-5 rounded-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                      <div className="flex items-center space-x-2">
                        <Stamp className="w-4 h-4 text-[#0B5D3B]" />
                        <h3 className="font-bold text-[#084A2E] text-sm font-serif">
                          ওয়াটারমার্ক কনফিগারেশন
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#0B5D3B] bg-[#0B5D3B]/10 px-2 py-0.5">
                        {wmType === 'text' ? 'টেক্সট মোড' : 'লোগো মোড'}
                      </span>
                    </div>

                    {/* Watermark Type Selector (Text vs Image) */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setWmType('text')}
                        className={`p-2.5 border text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                          wmType === 'text'
                            ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                            : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>টেক্সট ওয়াটারমার্ক</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWmType('image')}
                        className={`p-2.5 border text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                          wmType === 'image'
                            ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                            : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>লোগো / ইমেজ ওয়াটারমার্ক</span>
                      </button>
                    </div>

                    {/* TEXT WATERMARK CONTROLS */}
                    {wmType === 'text' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor={wmTextInputId} className="text-xs font-bold text-[#084A2E]">
                            ওয়াটারমার্ক টেক্সট
                          </label>
                          <input
                            id={wmTextInputId}
                            type="text"
                            value={wmText}
                            onChange={(e) => setWmText(e.target.value)}
                            placeholder="যেমন: CONFIDENTIAL, খসড়া, গোপনীয়"
                            className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FFFFFF] text-[#084A2E] text-sm focus:outline-none focus:ring-1 focus:ring-[#0B5D3B] rounded-lg"
                          />

                          {/* Quick Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-[#4A5A52]">প্রিসেট:</span>
                            {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'গোপনীয়', 'খসড়া', 'অফিসিয়াল কপি'].map(
                              (preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setWmText(preset)}
                                  className="text-[10px] px-2 py-0.5 border border-[#D5E4DB] bg-[#FFFFFF] text-[#084A2E] hover:bg-[#0B5D3B] hover:text-[#FFFFFF] hover:border-[#0B5D3B] transition-colors cursor-pointer rounded-lg"
                                >
                                  {preset}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Font Size & Rotation Sliders */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[#084A2E]">
                              <label htmlFor={wmFontSizeInputId} className="font-medium">ফন্ট সাইজ</label>
                              <span className="font-mono text-[#4A5A52]">{wmFontSize} pt</span>
                            </div>
                            <input
                              id={wmFontSizeInputId}
                              type="range"
                              min="20"
                              max="90"
                              step="2"
                              value={wmFontSize}
                              onChange={(e) => setWmFontSize(Number(e.target.value))}
                              className="w-full accent-[#0B5D3B]"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[#084A2E]">
                              <label htmlFor={wmRotationInputId} className="font-medium">ঘূর্ণন কোণ (Rotation)</label>
                              <span className="font-mono text-[#4A5A52]">{wmRotation}°</span>
                            </div>
                            <input
                              id={wmRotationInputId}
                              type="range"
                              min="-90"
                              max="90"
                              step="5"
                              value={wmRotation}
                              onChange={(e) => setWmRotation(Number(e.target.value))}
                              className="w-full accent-[#0B5D3B]"
                            />
                            <div className="flex justify-between text-[10px] text-[#4A5A52] pt-0.5">
                              <button type="button" onClick={() => setWmRotation(-45)} className="hover:underline">
                                -৪৫° তির্যক
                              </button>
                              <button type="button" onClick={() => setWmRotation(0)} className="hover:underline">
                                ০° সোজা
                              </button>
                              <button type="button" onClick={() => setWmRotation(45)} className="hover:underline">
                                ৪৫° কোণ
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Color Selector */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-[#084A2E] block">রং নির্বাচন (Color)</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {[
                              { label: 'স্লেট গ্রে', hex: '#64748b' },
                              { label: 'কন্ফিডেনশিয়াল রেড', hex: '#dc2626' },
                              { label: 'ডার্ক গ্রিন', hex: '#0c5c3d' },
                              { label: 'রয়্যাল ব্লু', hex: '#2563eb' },
                              { label: 'চারকোল ব্ল্যাক', hex: '#1e293b' },
                            ].map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() => setWmTextColor(c.hex)}
                                className={`flex items-center space-x-1.5 px-2.5 py-1 border text-xs transition-all cursor-pointer ${
                                  wmTextColor === c.hex
                                    ? 'border-[#0B5D3B] ring-1 ring-[#0B5D3B] bg-[#FFFFFF]'
                                    : 'border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2]'
                                }`}
                              >
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="text-[#084A2E]">{c.label}</span>
                              </button>
                            ))}
                            <input
                              type="color"
                              value={wmTextColor}
                              onChange={(e) => setWmTextColor(e.target.value)}
                              title="কাস্টম রং"
                              className="w-8 h-7 border border-[#D5E4DB] cursor-pointer bg-[#FFFFFF] p-0.5 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IMAGE / LOGO WATERMARK CONTROLS */}
                    {wmType === 'image' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor={wmLogoFileInputId} className="text-xs font-bold text-[#084A2E]">
                            লোগো ছবি আপলোড (PNG / JPG)
                          </label>
                          <input
                            id={wmLogoFileInputId}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleLogoUpload}
                            className="w-full text-xs text-[#084A2E] file:mr-4 file:py-2 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#0B5D3B] file:text-[#FFFFFF] hover:file:bg-[#084A2E] file:cursor-pointer cursor-pointer border border-[#D5E4DB] bg-[#FFFFFF] p-1 rounded-lg"
                          />
                          <p className="text-[11px] text-[#4A5A52]">
                            স্বচ্ছ ব্যাকগ্রাউন্ডের জন্য পিএনজি (PNG) ফরম্যাট লোগো ব্যবহারে নিখুঁত ফলাফল পাওয়া যায়।
                          </p>
                        </div>

                        {wmImagePreviewUrl && (
                          <div className="flex items-center space-x-3 p-2 bg-[#FFFFFF] border border-[#D5E4DB] rounded-lg">
                            <img
                              src={wmImagePreviewUrl}
                              alt="Logo Preview"
                              width={48}
                              height={48}
                              loading="lazy"
                              className="w-12 h-12 object-contain border border-[#D5E4DB] bg-white p-1"
                            />
                            <div className="text-xs">
                              <p className="font-bold text-[#084A2E]">লোগো সফলভাবে লোড হয়েছে</p>
                              <p className="text-[#4A5A52]">ফরম্যাট: {wmImageFormat.toUpperCase()}</p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[#084A2E]">
                              <label htmlFor={wmLogoScaleInputId} className="font-medium">লোগোর আকার (Scale)</label>
                              <span className="font-mono text-[#4A5A52]">{Math.round(wmImageScale * 100)}%</span>
                            </div>
                            <input
                              id={wmLogoScaleInputId}
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={wmImageScale}
                              onChange={(e) => setWmImageScale(Number(e.target.value))}
                              className="w-full accent-[#0B5D3B]"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[#084A2E]">
                              <label htmlFor={wmRotationInputId} className="font-medium">ঘূর্ণন কোণ</label>
                              <span className="font-mono text-[#4A5A52]">{wmRotation}°</span>
                            </div>
                            <input
                              id={wmRotationInputId}
                              type="range"
                              min="-90"
                              max="90"
                              step="5"
                              value={wmRotation}
                              onChange={(e) => setWmRotation(Number(e.target.value))}
                              className="w-full accent-[#0B5D3B]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Common Placement & Opacity Controls */}
                    <div className="pt-3 border-t border-[#D5E4DB] space-y-4">
                      {/* Placement: Center vs Tile */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-[#084A2E] block">প্লেসমেন্ট লেআউট</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setWmPosition('center')}
                            className={`p-2 border text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                              wmPosition === 'center'
                                ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                                : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                            }`}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>কেন্দ্রে একক ওয়াটারমার্ক</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setWmPosition('tile')}
                            className={`p-2 border text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                              wmPosition === 'tile'
                                ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                                : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                            }`}
                          >
                            <Grid className="w-3.5 h-3.5" />
                            <span>টাইল্ড গ্রিড প্যাটার্ন</span>
                          </button>
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#084A2E]">
                          <label htmlFor={wmOpacityInputId} className="font-medium">স্বচ্ছতা / অপাসিটি (Opacity)</label>
                          <span className="font-mono text-[#4A5A52]">{Math.round(wmOpacity * 100)}%</span>
                        </div>
                        <input
                          id={wmOpacityInputId}
                          type="range"
                          min="0.05"
                          max="0.8"
                          step="0.03"
                          value={wmOpacity}
                          onChange={(e) => setWmOpacity(Number(e.target.value))}
                          className="w-full accent-[#0B5D3B]"
                        />
                        <div className="flex justify-between text-[10px] text-[#4A5A52]">
                          <span>খুব হালকা (৫%)</span>
                          <span>অনুমোদিত (২০%-৩০%)</span>
                          <span>গাঢ় (৮০%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PAGE NUMBERING CONFIGURATION PANEL */}
                {isPageNumberActive && (
                  <div className="border border-[#D5E4DB] bg-[#F0F4F2]/30 p-5 space-y-5 rounded-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-[#0B5D3B]" />
                        <h3 className="font-bold text-[#084A2E] text-sm font-serif">
                          পৃষ্ঠা নম্বর (Page Numbering) কনফিগারেশন
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#0B5D3B] bg-[#0B5D3B]/10 px-2 py-0.5">
                        {pnUseBangla ? 'বাংলা সংখ্যা' : 'ইংরেজি সংখ্যা'}
                      </span>
                    </div>

                    {/* Position Picker Grid (6 Positions) */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#084A2E] block">
                        পৃষ্ঠা নম্বরের অবস্থান (Position)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'top-left', label: 'উপরে বামে' },
                          { id: 'top-center', label: 'উপরে মাঝে' },
                          { id: 'top-right', label: 'উপরে ডানে' },
                          { id: 'bottom-left', label: 'নিচে বামে' },
                          { id: 'bottom-center', label: 'নিচে মাঝে (স্ট্যান্ডার্ড)' },
                          { id: 'bottom-right', label: 'নিচে ডানে' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => setPnPosition(pos.id as PageNumberPosition)}
                            className={`p-2 border text-xs font-medium text-center transition-colors cursor-pointer ${
                              pnPosition === pos.id
                                ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                                : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format Selector */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#084A2E] block">ফরম্যাট নির্বাচন</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'page_x_of_y', label: 'Page 1 of 10' },
                          { id: 'x_of_y', label: '1 of 10' },
                          { id: 'number_only', label: '1, 2, 3 (শুধু নম্বর)' },
                          { id: 'bn_page_x_of_y', label: 'পৃষ্ঠা ১ এর ১০' },
                          { id: 'bn_page_x', label: 'পৃষ্ঠা ১' },
                          { id: 'bn_number_only', label: '১, ২, ৩ (বাংলা সংখ্যা)' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => {
                              setPnFormat(fmt.id as PageNumberFormat);
                              if (fmt.id.startsWith('bn_')) setPnUseBangla(true);
                            }}
                            className={`p-2 border text-xs font-mono text-center transition-colors cursor-pointer ${
                              pnFormat === fmt.id
                                ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                                : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Numeric Options (Start, Margin, Font Size) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <label htmlFor={pnStartNumberInputId} className="text-xs font-bold text-[#084A2E]">
                          শুরু হবে কত থেকে?
                        </label>
                        <input
                          id={pnStartNumberInputId}
                          type="number"
                          min="1"
                          max="999"
                          value={pnStartNumber}
                          onChange={(e) => setPnStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full px-2.5 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs font-mono rounded-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor={pnFontSizeInputId} className="text-xs font-bold text-[#084A2E]">
                          ফন্ট সাইজ ({pnFontSize} pt)
                        </label>
                        <input
                          id={pnFontSizeInputId}
                          type="range"
                          min="9"
                          max="18"
                          value={pnFontSize}
                          onChange={(e) => setPnFontSize(Number(e.target.value))}
                          className="w-full accent-[#0B5D3B] mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor={pnMarginInputId} className="text-xs font-bold text-[#084A2E]">
                          বর্ডার মার্জিন ({pnMargin} pt)
                        </label>
                        <input
                          id={pnMarginInputId}
                          type="range"
                          min="10"
                          max="60"
                          value={pnMargin}
                          onChange={(e) => setPnMargin(Number(e.target.value))}
                          className="w-full accent-[#0B5D3B] mt-2"
                        />
                      </div>
                    </div>

                    {/* Language & Digits Toggle */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#D5E4DB] text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer text-[#084A2E]">
                        <input
                          type="checkbox"
                          checked={pnUseBangla}
                          onChange={(e) => setPnUseBangla(e.target.checked)}
                          className="w-4 h-4 accent-[#0B5D3B]"
                        />
                        <span>পৃষ্ঠা সংখ্যা বাংলায় লিখুন (যেমন: ১, ২, ৩)</span>
                      </label>

                      <div className="flex items-center space-x-2">
                        <label htmlFor={pnOpacityInputId} className="text-xs text-[#4A5A52]">অপাসিটি:</label>
                        <input
                          id={pnOpacityInputId}
                          type="range"
                          min="0.3"
                          max="1.0"
                          step="0.05"
                          value={pnOpacity}
                          onChange={(e) => setPnOpacity(Number(e.target.value))}
                          className="w-20 accent-[#0B5D3B]"
                        />
                        <span className="font-mono text-xs">{Math.round(pnOpacity * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 border border-[#b84d4d] bg-[#f9e8e8] text-[#8a2424] text-xs flex items-center space-x-2 rounded-2xl">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Action Trigger Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleApplyWatermarkAndPageNumbers}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 bg-[#0B5D3B] hover:bg-[#084A2E] disabled:bg-[#8A9E92] text-[#FFFFFF] font-bold text-sm tracking-wide transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>পিডিএফ প্রস্তুত করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>ওয়াটারমার্ক ও পেজ নম্বর যুক্ত করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Simulated Preview Mockup (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#084A2E]">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Eye className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>লাইভ ভিজ্যুয়াল সিমুলেশন (পৃষ্ঠা ১)</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#4A5A52]">A4 অনুপাত</span>
                </div>

                {/* Simulated A4 Paper Mockup */}
                <div className="relative w-full aspect-[1/1.414] bg-white border border-[#D5E4DB] shadow-md p-6 overflow-hidden select-none flex flex-col justify-between rounded-2xl">
                  {/* Subtle Document Placeholder Skeleton Lines */}
                  <div className="space-y-3 opacity-25 pointer-events-none">
                    <div className="h-3.5 bg-[#4A5A52] w-3/4" />
                    <div className="h-2 bg-[#4A5A52] w-full" />
                    <div className="h-2 bg-[#4A5A52] w-5/6" />
                    <div className="h-2 bg-[#4A5A52] w-4/5" />
                    <div className="h-10 border border-dashed border-[#4A5A52] w-full mt-4 rounded-lg" />
                    <div className="h-2 bg-[#4A5A52] w-full" />
                    <div className="h-2 bg-[#4A5A52] w-11/12" />
                    <div className="h-2 bg-[#4A5A52] w-2/3" />
                  </div>

                  {/* Dynamic Watermark Overlay */}
                  {isWatermarkActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                      {wmPosition === 'center' ? (
                        <div
                          style={{
                            transform: `rotate(${wmRotation}deg)`,
                            opacity: wmOpacity,
                            color: wmTextColor,
                          }}
                          className="transition-all duration-150 flex items-center justify-center max-w-[90%] text-center"
                        >
                          {wmType === 'text' ? (
                            <span
                              style={{
                                fontSize: `${Math.min(Math.max(wmFontSize * 0.5, 14), 38)}px`,
                                fontWeight: 800,
                                fontFamily: "'Hind Siliguri', sans-serif",
                                lineHeight: 1.1,
                              }}
                              className="tracking-wider whitespace-nowrap"
                            >
                              {wmText || 'CONFIDENTIAL'}
                            </span>
                          ) : wmImagePreviewUrl ? (
                            <img
                              src={wmImagePreviewUrl}
                              alt="Watermark"
                              width={Math.round(Math.max(wmImageScale * 180, 40))}
                              height={Math.round(Math.max(wmImageScale * 180, 40))}
                              style={{ width: `${Math.max(wmImageScale * 180, 40)}px` }}
                              className="object-contain"
                            />
                          ) : (
                            <div className="border border-dashed border-current p-4 text-xs font-mono rounded-2xl">
                              [লোগো আপলোড করুন]
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Tiled Pattern Simulation */
                        <div
                          style={{ opacity: wmOpacity, color: wmTextColor }}
                          className="w-[150%] h-[150%] flex flex-wrap gap-8 items-center justify-center -rotate-12 transition-all duration-150"
                        >
                          {Array.from({ length: 12 }).map((_, idx) => (
                            <div
                              key={idx}
                              style={{ transform: `rotate(${wmRotation}deg)` }}
                              className="text-[12px] font-bold tracking-wider font-mono shrink-0 whitespace-nowrap"
                            >
                              {wmType === 'text'
                                ? wmText || 'CONFIDENTIAL'
                                : wmImagePreviewUrl ? (
                                    <img
                                      src={wmImagePreviewUrl}
                                      alt="wm"
                                      width={40}
                                      height={40}
                                      loading="lazy"
                                      className="w-10 h-10 object-contain inline-block"
                                    />
                                  ) : (
                                    '[LOGO]'
                                  )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Page Number Indicator */}
                  {isPageNumberActive && (
                    <div
                      style={{
                        opacity: pnOpacity,
                        color: pnColor,
                        fontSize: `${Math.max(pnFontSize * 0.85, 9)}px`,
                      }}
                      className={`absolute pointer-events-none font-mono transition-all duration-150 ${
                        pnPosition === 'top-left' ? 'top-3 left-4' : ''
                      } ${pnPosition === 'top-center' ? 'top-3 left-1/2 -translate-x-1/2' : ''} ${
                        pnPosition === 'top-right' ? 'top-3 right-4' : ''
                      } ${pnPosition === 'bottom-left' ? 'bottom-3 left-4' : ''} ${
                        pnPosition === 'bottom-center' ? 'bottom-3 left-1/2 -translate-x-1/2' : ''
                      } ${pnPosition === 'bottom-right' ? 'bottom-3 right-4' : ''}`}
                    >
                      <span>{getPreviewPnText()}</span>
                    </div>
                  )}

                  {/* Corner Badge */}
                  <div className="absolute top-2 right-2 text-[9px] font-mono bg-[#F0F4F2] border border-[#D5E4DB] px-1.5 py-0.5 text-[#084A2E] rounded-lg">
                    পৃষ্ঠা ১/{toBanglaNum(loadedPdf.pageCount)}
                  </div>
                </div>

                <p className="text-[11px] text-[#4A5A52] text-center">
                  * এটি একটি ভিজ্যুয়াল রেসপন্সিভ প্রিভিউ। ডাউনলোড করা চূড়ান্ত পিডিএফে ভেক্টর শার্পনেসে লেখাগুলো নিখুঁত থাকবে।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result & Download Screen */}
        {processResult && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 border border-[#0B5D3B] bg-[#0B5D3B]/5 text-center space-y-4 rounded-2xl">
              <div className="w-14 h-14 bg-[#0B5D3B] text-[#FFFFFF] mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#0B5D3B] uppercase tracking-wider">
                  প্রসেসিং সফলভাবে সম্পন্ন হয়েছে
                </span>
                <h3 className="font-serif font-bold text-[#084A2E] text-xl">
                  আপনার ওয়াটারমার্ক ও পেজ নম্বরযুক্ত পিডিএফ প্রস্তুত!
                </h3>
                <p className="text-xs text-[#4A5A52] max-w-md mx-auto">
                  মোট {toBanglaNum(processResult.pageCount)} পৃষ্ঠায় সফলভাবে ওয়াটারমার্ক ও পেজ নম্বর বসানো হয়েছে।
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-3 bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] font-bold text-sm tracking-wide transition-colors flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>চূড়ান্ত পিডিএফ ডাউনলোড করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-xs font-medium text-[#084A2E] transition-colors cursor-pointer rounded-lg"
                >
                  অন্য ফাইলে কাজ করুন
                </button>
              </div>
            </div>

            {/* Quick Preview iFrame of the result */}
            <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-[#084A2E]">
                <span className="font-bold flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#0B5D3B]" />
                  <span>তৈরিকৃত পিডিএফের ইনস্ট্যান্ট ভিউ:</span>
                </span>
                <a
                  href={processResult.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B5D3B] hover:underline font-mono text-xs"
                >
                  নতুন ট্যাবে বড় করে দেখুন ↗
                </a>
              </div>
              <iframe
                src={processResult.blobUrl}
                title="Generated PDF Preview"
                className="w-full h-96 border border-[#D5E4DB] bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </PdfToolLayout>
  );
};
