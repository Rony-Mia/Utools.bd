import React, { useState, useRef, useEffect, useMemo, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  FileText,
  Copy,
  Check,
  Download,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  FileSearch,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  Info,
  ArrowLeftRight,
  Eye,
  FileCheck,
  Sliders,
  Type
} from 'lucide-react';
import {
  recognizeImage,
  recognizePdfScannedPages,
  extractPdfDirectText,
  OcrLanguage,
  OcrProgress,
  toBanglaNum,
  isLikelyBijoyText
} from '../services/ocrEngine.ts';
import { bijoyToUnicode } from '../bijoyConverter.ts';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/image-to-text.json';

type PdfExtractMethod = 'auto_direct' | 'visual_ocr';

export const ImageToTextPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);

  // Settings
  const [language, setLanguage] = useState<OcrLanguage>('ben+eng');
  const [pdfMethod, setPdfMethod] = useState<PdfExtractMethod>('auto_direct');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<OcrProgress>({ status: '', progress: 0 });
  const [extractedText, setExtractedText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usedDirectTextLayer, setUsedDirectTextLayer] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showWhyBreaksGuide, setShowWhyBreaksGuide] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRequestedRef = useRef<boolean>(false);
  const { copied, copy } = useCopyToClipboard();

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setExtractedText('');
    setUsedDirectTextLayer(false);
    setProgress({ status: '', progress: 0 });

    const lowerName = file.name.toLowerCase();
    const isPdfFile = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isImageFile =
      file.type.startsWith('image/') ||
      ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].some((ext) => lowerName.endsWith(ext));

    if (!isPdfFile && !isImageFile) {
      setErrorMessage('অনুগ্রহ করে শুধুমাত্র PDF, JPG, PNG বা WEBP ফাইল নির্বাচন করুন।');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setErrorMessage('ফাইলের আকার সর্বোচ্চ ৩০ মেগাবাইট (30MB) হতে পারে।');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    setSelectedFile(file);
    setIsPdf(isPdfFile);

    if (isPdfFile) {
      setPreviewUrl(null);
      // Try to determine page count quickly
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }
        const ab = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: ab, cMapUrl: '/cmaps/', cMapPacked: true }).promise;
        setPdfPageCount(doc.numPages);
      } catch {
        setPdfPageCount(null);
      }
    } else {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPdfPageCount(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Main processing function
  const processDocument = async (overrideMethod?: PdfExtractMethod) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    cancelRequestedRef.current = false;

    const activeMethod = overrideMethod || (isPdf ? pdfMethod : 'visual_ocr');

    try {
      if (isPdf) {
        if (activeMethod === 'auto_direct') {
          // Attempt direct text extraction first
          setProgress({ status: 'পিডিএফ-এর ডিজিটাল টেক্সট স্তর পরীক্ষা করা হচ্ছে...', progress: 0.2 });

          const directResult = await extractPdfDirectText(selectedFile, (p) => {
            setProgress(p);
          });

          // Check if extracted text has enough content
          if (directResult.hasTextLayer && directResult.text.length > 20) {
            setExtractedText(directResult.text);
            setUsedDirectTextLayer(true);
            setProgress({
              status: directResult.isLikelyBijoy
                ? 'টেক্সট এক্সট্রাক্ট সম্পন্ন! (বিজয়/ANSI ফন্ট শনাক্ত হয়েছে)'
                : 'ডিজিটাল টেক্সট লেয়ার থেকে দ্রুত টেক্সট পাওয়া গেছে!',
              progress: 1
            });
            setIsProcessing(false);
            return;
          }

          // Fallback to Visual OCR if text layer was empty
          setProgress({
            status: 'ডিজিটাল টেক্সট পাওয়া যায়নি। ভিজ্যুয়াল OCR স্ক্যান শুরু হচ্ছে...',
            progress: 0.1
          });
        }

        // Visual OCR for PDF (renders pages to high-res canvas and runs Tesseract)
        setUsedDirectTextLayer(false);
        const result = await recognizePdfScannedPages(
          selectedFile,
          language,
          (prog) => setProgress(prog),
          () => cancelRequestedRef.current
        );

        if (!result || result.trim().length === 0) {
          setErrorMessage('পিডিএফ থেকে কোনো টেক্সট শনাক্ত করা যায়নি। ফাইলটির পৃষ্ঠার মান পরীক্ষা করে আবার চেষ্টা করুন।');
        } else {
          setExtractedText(result);
          setProgress({ status: 'সম্পূর্ণ সফলভাবে টেক্সট এক্সট্রাক্ট হয়েছে!', progress: 1 });
        }
      } else {
        // Image OCR
        setUsedDirectTextLayer(false);
        setProgress({ status: 'ইমেজ বিশ্লেষণ ও OCR ইঞ্জিন প্রস্তুত হচ্ছে...', progress: 0.1 });

        const result = await recognizeImage(selectedFile, language, (prog) => {
          setProgress(prog);
        });

        if (!result || result.trim().length === 0) {
          setErrorMessage('ছবিতে কোনো ছাপার লেখা শনাক্ত করা যায়নি। নিশ্চিত করুন ছবিটি পরিষ্কার, সোজা এবং প্রিন্ট করা লেখার।');
        } else {
          setExtractedText(result);
          setProgress({ status: 'ছবি থেকে সফলভাবে টেক্সট পাওয়া গেছে!', progress: 1 });
        }
      }
    } catch (err: any) {
      if (cancelRequestedRef.current) {
        setErrorMessage('প্রক্রিয়াটি ব্যবহারকারী কর্তৃক বাতিল করা হয়েছে।');
      } else {
        console.error('OCR processing error:', err);
        setErrorMessage(
          err?.message || 'টেক্সট এক্সট্রাক্ট করার সময় ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert current text from Bijoy to Unicode
  const handleConvertToUnicode = () => {
    if (!extractedText) return;
    try {
      const converted = bijoyToUnicode(extractedText);
      setExtractedText(converted);
    } catch {
      // Keep original on error
    }
  };

  // Cancel processing
  const handleCancel = () => {
    cancelRequestedRef.current = true;
    setIsProcessing(false);
    setProgress({ status: 'বাতিল করা হচ্ছে...', progress: 0 });
  };

  // Reset all
  const handleReset = () => {
    cancelRequestedRef.current = true;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPdf(false);
    setPdfPageCount(null);
    setExtractedText('');
    setErrorMessage(null);
    setUsedDirectTextLayer(false);
    setProgress({ status: '', progress: 0 });
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Copy text to clipboard
  const handleCopy = () => {
    if (!extractedText) return;
    void copy(extractedText);
  };

  // Download converted text as .txt
  const handleDownload = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `utools_ocr_text_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Formatted file size in Bengali
  const formattedFileSize = useMemo(() => {
    if (!selectedFile) return '';
    const bytes = selectedFile.size;
    if (bytes < 1024) return `${toBanglaNum(bytes)} Bytes`;
    if (bytes < 1024 * 1024) return `${toBanglaNum((bytes / 1024).toFixed(1))} KB`;
    return `${toBanglaNum((bytes / (1024 * 1024)).toFixed(2))} MB`;
  }, [selectedFile]);

  // Detect whether extracted text looks like Bijoy/SutonnyMJ ANSI
  const isLikelyBijoy = useMemo(() => {
    return isLikelyBijoyText(extractedText);
  }, [extractedText]);

  // Metrics
  const charCount = extractedText.length;
  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const lineCount = extractedText ? extractedText.split('\n').length : 0;

  // Schema.org FAQ structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (pageContent.faqs || []).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta name="description" content={pageContent.metaDescription} />
        <link rel="canonical" href="https://utools.bd/image-to-text" />
        <meta property="og:title" content={pageContent.metaTitle} />
        <meta property="og:description" content={pageContent.metaDescription} />
        <meta property="og:url" content="https://utools.bd/image-to-text" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta name="twitter:description" content={pageContent.metaDescription} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png?v=2" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-[#4A5A52]">
        <Link to="/" className="hover:text-[#084A2E] underline-offset-2 hover:underline">
          হোম
        </Link>
        <span>&gt;</span>
        <span className="text-[#4A5A52]">টেক্সট টুলস</span>
        <span>&gt;</span>
        <span className="text-[#084A2E] font-medium">ছবি ও PDF থেকে বাংলা টেক্সট (OCR)</span>
      </nav>

      {/* Page Header matching standard Utools design */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D5E4DB] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
              <span>TXT-OCR-01 • ১০০% ক্লায়েন্ট-সাইড OCR ইঞ্জিন</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif">
              {pageContent.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>১০০% ক্লায়েন্ট-সাইড • কোনো সার্ভার আপলোড নেই • সম্পূর্ণ বিনামূল্যে</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#4A5A52] max-w-4xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </section>

      {/* Handwriting Notice Banner & Broken Text Quick Helper */}
      <div className="space-y-3">
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center space-x-3 text-xs sm:text-sm text-[#34443B]">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-[#084A2E]">ছাপার লেখা সমর্থন করে: </span>
              বই, খবরের কাগজ, সরকারি সার্কুলার ও প্রিন্ট করা ডকুমেন্টের লেখার জন্য প্রস্তুত। হাতে লেখা লেখার জন্য নির্ভুল হবে না।
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWhyBreaksGuide(!showWhyBreaksGuide)}
            className="inline-flex items-center space-x-1.5 text-xs text-[#0B5D3B] hover:text-[#084A2E] font-medium bg-[#F0F4F2] hover:bg-[#D5E4DB] border border-[#D5E4DB] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Info className="w-3.5 h-3.5 text-[#0B5D3B]" />
            <span>পিডিএফ-এ লেখা ভেঙে গেলে কী করবেন?</span>
            {showWhyBreaksGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Helper: Why PDF text breaks & how to fix it */}
        {showWhyBreaksGuide && (
          <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] rounded-2xl p-5 text-xs sm:text-sm text-[#0F1F17] space-y-3 animate-fadeIn">
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
              <span>পিডিএফ কনভার্ট করলে লেখা ভেঙে যাওয়ার কারণ ও সমাধান</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-[#D5E4DB] space-y-1.5">
                <span className="font-bold text-[#084A2E] block">১. বিজয় (SutonnyMJ) ফন্টের পিডিএফ:</span>
                <p className="text-[#34443B] text-xs leading-relaxed">
                  পুরোনো সরকারি বিজ্ঞপ্তি বা বইয়ে সুতন্বীএমজে ফন্টে লেখা থাকে। সরাসরি টেক্সট কপি করলে এগুলো ইংরেজি কোড (যেমন: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Avwg evsjvq</code>) দেখায়।
                </p>
                <p className="text-[#0B5D3B] font-semibold text-xs">
                  👉 সমাধান: টেক্সট আসার পর ডানপাশের <strong>'বিজয় → ইউনিকোড'</strong> বাটনে চাপ দিন, সাথে সাথে শুদ্ধ বাংলা হয়ে যাবে।
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#D5E4DB] space-y-1.5">
                <span className="font-bold text-[#084A2E] block">২. ভাঙা যুক্তাক্ষর ও কারচিহ্ন (গ্লিফ সমস্যা):</span>
                <p className="text-[#34443B] text-xs leading-relaxed">
                  কিছু পিডিএফ তৈরির সময় বাংলা যুক্তাক্ষর ও হ্রস্ব-ই কার আলাদা হয়ে যায়, ফলে সরাসরি কপি করলে 'ব ি ভ া গ' বা ভাঙা অক্ষর দেখা যায়।
                </p>
                <p className="text-[#0B5D3B] font-semibold text-xs">
                  👉 সমাধান: পিডিএফ আপলোডের পর <strong>'ভিজ্যুয়াল OCR স্ক্যান'</strong> মোড বেছে নিন। এতে পৃষ্ঠাটি চোখের মতো স্ক্যান করে আসল অক্ষর পড়া হয়।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Interactive Tool Workspace (Same balanced grid as ConverterPage) */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* ================= LEFT PANEL: File Upload, Preview & Controls ================= */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 sm:p-6 flex flex-col justify-between rounded-2xl space-y-5">
            <div className="space-y-5">
              {/* Left Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-[#0B5D3B]" />
                  <span className="text-xs sm:text-sm font-bold text-[#084A2E] font-serif">
                    ইনপুট ফাইল ও কনফিগারেশন
                  </span>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#084A2E] flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>ভাষার ধরন নির্বাচন:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('ben+eng')}
                    disabled={isProcessing}
                    className={`py-2 px-2 text-xs font-medium border transition-colors cursor-pointer rounded-lg text-center ${
                      language === 'ben+eng'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#4A5A52] border-[#D5E4DB] hover:text-[#084A2E]'
                    }`}
                  >
                    বাংলা ও English
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('ben')}
                    disabled={isProcessing}
                    className={`py-2 px-2 text-xs font-medium border transition-colors cursor-pointer rounded-lg text-center ${
                      language === 'ben'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#4A5A52] border-[#D5E4DB] hover:text-[#084A2E]'
                    }`}
                  >
                    শুধু বাংলা
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('eng')}
                    disabled={isProcessing}
                    className={`py-2 px-2 text-xs font-medium border transition-colors cursor-pointer rounded-lg text-center ${
                      language === 'eng'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#4A5A52] border-[#D5E4DB] hover:text-[#084A2E]'
                    }`}
                  >
                    শুধু English
                  </button>
                </div>
              </div>

              {/* PDF Extraction Mode (Only shown if PDF is uploaded or to pre-set) */}
              {isPdf && (
                <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#084A2E] flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#0B5D3B]" />
                      <span>পিডিএফ প্রসেসিং মোড:</span>
                    </label>
                    <span className="text-[10px] text-[#4A5A52] font-mono">
                      {pdfPageCount ? `${toBanglaNum(pdfPageCount)} পেজ` : 'PDF'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPdfMethod('auto_direct')}
                      disabled={isProcessing}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        pdfMethod === 'auto_direct'
                          ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                          : 'bg-white text-[#34443B] border-[#D5E4DB] hover:border-[#0B5D3B]'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>স্বয়ংক্রিয় ডিজিটাল লেয়ার</span>
                        {pdfMethod === 'auto_direct' && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">সবচেয়ে দ্রুত টেক্সট এক্সট্রাক্ট</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPdfMethod('visual_ocr')}
                      disabled={isProcessing}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        pdfMethod === 'visual_ocr'
                          ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                          : 'bg-white text-[#34443B] border-[#D5E4DB] hover:border-[#0B5D3B]'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>ভিজ্যুয়াল OCR স্ক্যান</span>
                        {pdfMethod === 'visual_ocr' && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">লেখা ভাঙলে বা স্ক্যান করা হলে</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Drag and Drop Zone */}
              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-[#0B5D3B] bg-[#0B5D3B]/5'
                      : 'border-[#D5E4DB] hover:border-[#0B5D3B] bg-[#F0F4F2]/30 hover:bg-[#F0F4F2]/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#D5E4DB] flex items-center justify-center mx-auto text-[#0B5D3B] shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#084A2E]">
                        ফাইল টেনে আনুন অথবা ক্লিক করে আপলোড করুন
                      </p>
                      <p className="text-xs text-[#4A5A52]">
                        PDF, JPG, PNG, WEBP বা BMP ফরম্যাট সমর্থিত
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center px-3 py-1.5 text-xs text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] rounded-lg font-medium shadow-xs">
                        ফাইল বেছে নিন (Browse)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected File Card & Thumbnail Preview */
                <div className="border border-[#D5E4DB] bg-[#F0F4F2]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#D5E4DB] flex items-center justify-center shrink-0 text-[#0B5D3B]">
                        {isPdf ? <FileText className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs sm:text-sm font-bold text-[#084A2E] truncate font-mono">
                          {selectedFile.name}
                        </h4>
                        <div className="text-[11px] text-[#4A5A52] flex items-center space-x-2 mt-0.5">
                          <span>{formattedFileSize}</span>
                          {isPdf && pdfPageCount && (
                            <>
                              <span className="text-[#D5E4DB]">|</span>
                              <span>{toBanglaNum(pdfPageCount)} টি পেজ</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#084A2E] hover:text-[#0B5D3B] underline shrink-0 cursor-pointer"
                    >
                      বদলান
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Image Preview thumbnail if available */}
                  {previewUrl && (
                    <div className="relative border border-[#D5E4DB] bg-white rounded-xl overflow-hidden max-h-48 flex items-center justify-center p-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-44 object-contain rounded-lg shadow-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message Box */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}
            </div>

            {/* Action Buttons & Progress Bar */}
            <div className="space-y-3 pt-3 border-t border-[#D5E4DB]">
              {isProcessing && (
                <div className="space-y-2 bg-[#F0F4F2]/50 p-3 rounded-xl border border-[#D5E4DB]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#084A2E] truncate pr-2 flex items-center space-x-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-[#0B5D3B] animate-spin shrink-0" />
                      <span>{progress.status || 'প্রসেসিং চলছে...'}</span>
                    </span>
                    <span className="font-mono text-[#0B5D3B] font-bold shrink-0">
                      {toBanglaNum(Math.round(progress.progress * 100))}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-[#D5E4DB] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0B5D3B] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, progress.progress * 100))}%` }}
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-xs text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                </div>
              )}

              {!isProcessing ? (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => processDocument()}
                    disabled={!selectedFile}
                    className={`w-full py-3 px-4 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      selectedFile
                        ? 'bg-[#0B5D3B] hover:bg-[#084A2E] text-white shadow-xs'
                        : 'bg-[#D5E4DB] text-[#4A5A52] cursor-not-allowed'
                    }`}
                  >
                    <FileSearch className="w-4 h-4" />
                    <span>
                      {extractedText ? 'পুনরায় টেক্সট এক্সট্রাক্ট করুন' : 'টেক্সট এক্সট্রাক্ট শুরু করুন'}
                    </span>
                  </button>

                  {/* Quick Shortcut for PDF Visual OCR if user previously used direct layer */}
                  {isPdf && extractedText && usedDirectTextLayer && (
                    <button
                      type="button"
                      onClick={() => {
                        setPdfMethod('visual_ocr');
                        void processDocument('visual_ocr');
                      }}
                      className="w-full sm:w-auto py-3 px-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                      title="লেখা ভাঙলে ভিজ্যুয়াল OCR চালান"
                    >
                      লেখা ভেঙেছে? OCR চালান
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* ================= RIGHT PANEL: Output Editor & Action Tools ================= */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 sm:p-6 flex flex-col justify-between rounded-2xl space-y-4">
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Right Panel Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#D5E4DB] gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-bold text-[#084A2E] font-serif">
                    এক্সট্রাক্ট করা টেক্সট
                  </span>
                  {usedDirectTextLayer && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F0F4F2] text-[#084A2E] border border-[#D5E4DB] rounded-md font-medium">
                      ডিজিটাল লেয়ার
                    </span>
                  )}
                  {!usedDirectTextLayer && extractedText && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#0B5D3B]/10 text-[#0B5D3B] border border-[#0B5D3B]/20 rounded-md font-medium">
                      ভিজ্যুয়াল OCR
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-[#4A5A52] flex items-center space-x-2">
                  <span>বর্ণ: {toBanglaNum(charCount)}</span>
                  <span className="text-[#D5E4DB]">|</span>
                  <span>শব্দ: {toBanglaNum(wordCount)}</span>
                  <span className="text-[#D5E4DB]">|</span>
                  <span>লাইন: {toBanglaNum(lineCount)}</span>
                </div>
              </div>

              {/* Bijoy / SutonnyMJ Detection Notice & 1-Click Fixer */}
              {isLikelyBijoy && extractedText && (
                <div className="bg-amber-50/90 border border-amber-300 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block sm:inline">বিজয় (SutonnyMJ) ফন্ট সনাক্ত: </strong>
                      পিডিএফ-এর টেক্সট বিজয় ANSI কোডে রয়েছে।
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConvertToUnicode}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>ইউনিকোডে রূপান্তর করুন</span>
                  </button>
                </div>
              )}

              {/* Notice if text was extracted directly but user might encounter broken ligatures */}
              {usedDirectTextLayer && !isLikelyBijoy && extractedText && (
                <div className="bg-[#F0F4F2] border border-[#D5E4DB] p-3 rounded-xl flex items-center justify-between gap-2 text-xs text-[#34443B]">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                    <span>কোনো যুক্তাক্ষর বা কারচিহ্ন ভেঙে গেছে?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfMethod('visual_ocr');
                      void processDocument('visual_ocr');
                    }}
                    className="text-xs font-semibold text-[#0B5D3B] hover:text-[#084A2E] underline cursor-pointer shrink-0"
                  >
                    ভিজ্যুয়াল OCR চালান
                  </button>
                </div>
              )}

              {/* Output Textarea */}
              <div className="flex-1 flex flex-col">
                <textarea
                  value={extractedText}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExtractedText(e.target.value)}
                  placeholder="এখানে আপনার ডকুমেন্ট বা ছবির এক্সট্রাক্ট করা টেক্সট প্রদর্শিত হবে। আপনি চাইলে সরাসরি যেকোনো বাক্য পরিবর্তন বা এডিট করতে পারেন..."
                  rows={14}
                  className="w-full flex-1 p-4 bg-[#F0F4F2]/40 border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] leading-relaxed resize-y min-h-[340px] rounded-2xl font-sans"
                />
              </div>
            </div>

            {/* Output Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#D5E4DB]">
              <div className="flex flex-wrap items-center gap-2">
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!extractedText}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border rounded-lg transition-colors cursor-pointer ${
                    copied
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : extractedText
                      ? 'bg-[#0B5D3B] text-white border-[#0B5D3B] hover:bg-[#084A2E]'
                      : 'bg-[#F0F4F2] text-[#4A5A52] border-[#D5E4DB] cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                </button>

                {/* Download TXT */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!extractedText}
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${
                    extractedText
                      ? 'bg-white text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                      : 'bg-[#F0F4F2] text-[#4A5A52] border-[#D5E4DB] cursor-not-allowed'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>.txt ডাউনলোড</span>
                </button>

                {/* Bijoy ↔ Unicode convert trigger */}
                {extractedText && (
                  <button
                    type="button"
                    onClick={handleConvertToUnicode}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium bg-white text-[#084A2E] border border-[#D5E4DB] hover:bg-[#F0F4F2] rounded-lg transition-colors cursor-pointer"
                    title="লেখা যদি SutonnyMJ ফন্টের হয় তবে ইউনিকোডে রূপান্তর করুন"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>বিজয় → ইউনিকোড</span>
                  </button>
                )}
              </div>

              {/* Clear Output */}
              {extractedText && (
                <button
                  type="button"
                  onClick={() => setExtractedText('')}
                  className="text-xs text-[#4A5A52] hover:text-red-600 transition-colors cursor-pointer p-1"
                >
                  পরিষ্কার করুন
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Guide: কেন পিডিএফ কনভার্ট করলে লেখা ভেঙে যায় এবং এর ১০০% প্রতিকার */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-5 rounded-2xl shadow-xs">
        <div className="border-b border-[#D5E4DB] pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
            <span>কেন পিডিএফ কনভার্ট করলে বাংলা লেখা ভেঙে যায়? (কারণ ও সমাধান)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5A52] mt-1">
            পিডিএফ নথির অভ্যন্তরীণ ফন্ট ও গ্লিফ গঠন বুঝে সঠিক মোড ব্যবহারের সহজ নির্দেশিকা
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-[#0F1F17]">
          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#D5E4DB] font-bold text-[#0B5D3B] flex items-center justify-center font-mono">
              ০১
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm">সুতন্বীএমজে ও বিজয় (ANSI) এনকোডিং</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              বাংলাদেশের অধিকাংশ সরকারি সার্কুলার, আইনি নথি ও পুরনো বই সুতন্বীএমজে (SutonnyMJ) ইত্যাদি বিজয় ফন্টে প্রস্তুত করা হয়। পিডিএফের ভেতরে এই অক্ষরগুলো সাধারণ ইংরেজি বা ANSI কোড হিসেবে সংরক্ষিত থাকে। সরাসরি এক্সট্রাক্ট করলে হিজিবিজি অক্ষর দেখা যায়।
            </p>
            <div className="text-[11px] font-semibold text-[#0B5D3B] pt-1">
              প্রতিকার: ডানপাশের 'বিজয় → ইউনিকোড' বাটনে ক্লিক করলেই এক সেকেন্ডে শুদ্ধ বাংলা রূপান্তর হবে।
            </div>
          </div>

          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#D5E4DB] font-bold text-[#0B5D3B] flex items-center justify-center font-mono">
              ০২
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm">যুক্তাক্ষর ও কারচিহ্নের বিচ্ছিন্নতা (Font Subsetting)</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              অনেক সফটওয়্যার পিডিএফ তৈরি করার সময় জটিল বাংলা যুক্তাক্ষর (যেমন ক্ষ, জ্ঞ, ঙ্গ, ক্ত, ত্র) এবং হ্রস্ব-ই কার (ি), একার (ে) আলাদা আলাদা স্বাধীন গ্লিফে খণ্ড করে ফেলে। ডিজিটাল টেক্সট রিডার পড়লে মাঝখানে ফাঁকা বা বিকৃতি সৃষ্টি হয়।
            </p>
            <div className="text-[11px] font-semibold text-[#0B5D3B] pt-1">
              প্রতিকার: 'ভিজ্যুয়াল OCR স্ক্যান' নির্বাচন করুন। এটি চোখের মতো পৃষ্ঠা স্ক্যান করে অক্ষর একীভূত করে।
            </div>
          </div>

          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#D5E4DB] font-bold text-[#0B5D3B] flex items-center justify-center font-mono">
              ০৩
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm">স্ক্যান করা বা মোবাইল ছবির রেজোলিউশন</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              মোবাইল ক্যামেরায় তোলা ছবি বা লো-রেজোলিউশন স্ক্যানে বাংলা মাত্রার দাগ ও বিন্দু ঝাপসা হলে OCR ইঞ্জিন বিভ্রান্ত হতে পারে। আমাদের ইঞ্জিন ৩.০x সুপার-স্যাম্পলিং করে ছবিটিকে শার্প করে নেয়।
            </p>
            <div className="text-[11px] font-semibold text-[#0B5D3B] pt-1">
              প্রতিকার: ছায়ামুক্ত, পর্যাপ্ত আলো ও সোজা অ্যাঙ্গেলে তোলা ছবি আপলোড করুন।
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide Section */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-7 space-y-5 rounded-2xl">
        <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif border-b border-[#D5E4DB] pb-3">
          টুলটি ব্যবহারের সহজ ৪টি ধাপ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm text-[#0F1F17]">
          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#FFFFFF] border border-[#D5E4DB] w-7 h-7 flex items-center justify-center rounded-lg">
              ১
            </div>
            <h3 className="font-bold text-[#084A2E]">ফাইল নির্বাচন করুন</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              আপনার কাঙ্ক্ষিত ছবি (JPG, PNG) বা স্ক্যান করা পিডিএফ ড্রপজোনে আপলোড করুন।
            </p>
          </div>

          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#FFFFFF] border border-[#D5E4DB] w-7 h-7 flex items-center justify-center rounded-lg">
              ২
            </div>
            <h3 className="font-bold text-[#084A2E]">ভাষা ও মোড নির্ধারণ</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              'বাংলা ও English' ভাষা নির্বাচন করুন। পিডিএফ হলে ডিজিটাল বা ভিজ্যুয়াল OCR মোড ঠিক করুন।
            </p>
          </div>

          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#FFFFFF] border border-[#D5E4DB] w-7 h-7 flex items-center justify-center rounded-lg">
              ৩
            </div>
            <h3 className="font-bold text-[#084A2E]">টেক্সট এক্সট্রাক্ট করুন</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              বাটনে ক্লিক করলে আপনার ব্রাউজারের ভেতর অন-ডিভাইস OCR ইঞ্জিন সম্পূর্ণ লেখা এক্সট্রাক্ট করবে।
            </p>
          </div>

          <div className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#FFFFFF] border border-[#D5E4DB] w-7 h-7 flex items-center justify-center rounded-lg">
              ৪
            </div>
            <h3 className="font-bold text-[#084A2E]">কপি বা ডাউনলোড</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              প্রয়োজনে টেক্সট এডিট করুন, এক ক্লিকে ক্লিপবোর্ডে কপি করুন অথবা .txt নোটপ্যাড ফাইল ডাউনলোড করুন।
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Content / FAQs from CMS */}
      <CmsDynamicContent content={pageContent as any} />

      {/* Related Tools Section matching site standard */}
      <RelatedTools currentToolId="image-to-text" />
    </div>
  );
};
