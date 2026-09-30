import React, { useState, useRef, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ScanText,
  Upload,
  Copy,
  Check,
  Download,
  RotateCcw,
  FileText,
  FileImage,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Loader2,
  Languages,
  CheckCircle2,
  Trash2,
  Eye,
} from 'lucide-react';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { toBn } from '../utils/bnDigits.ts';
import pageContent from '../../content/pages/image-to-text.json';

type OcrLanguage = 'ben+eng' | 'ben' | 'eng';

interface LanguageOption {
  id: OcrLanguage;
  label: string;
  sub: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'ben+eng', label: 'বাংলা + ইংরেজি (দ্বিভাষিক)', sub: 'সবচেয়ে নির্ভরযোগ্য ও সাধারণ' },
  { id: 'ben', label: 'শুধুমাত্র বাংলা', sub: 'বই, পত্রিকা ও বাংলা নথির জন্য' },
  { id: 'eng', label: 'শুধুমাত্র English', sub: 'ইংরেজি ফর্ম ও সার্টিফিকেটের জন্য' },
];

export const ImageToTextPage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<OcrLanguage>('ben+eng');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef<boolean>(true);
  const stopOcrRef = useRef<boolean>(false);
  const textareaId = useId();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle incoming file selection
  const handleFileSelection = (selectedFile: File) => {
    setErrorMessage(null);
    stopOcrRef.current = false;

    const fileType = selectedFile.type.toLowerCase();
    const fileName = selectedFile.name.toLowerCase();

    const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp)$/i.test(fileName);
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

    if (!isImage && !isPdf) {
      setErrorMessage('অনুগ্রহ করে শুধুমাত্র ছবি (.jpg, .png, .webp) অথবা PDF ফাইল নির্বাচন করুন।');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    setFile(selectedFile);
    if (isImage) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }

    // Auto-run OCR on file selection
    processFile(selectedFile, selectedLang, isPdf);
  };

  // Process OCR on Image or PDF
  const processFile = async (targetFile: File, lang: OcrLanguage, isPdf: boolean) => {
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('OCR ইঞ্জিন প্রস্তুত করা হচ্ছে...');
    setErrorMessage(null);

    try {
      const { createWorker } = await import('tesseract.js');
      if (!isMountedRef.current || stopOcrRef.current) return;

      setStatusMessage('বাংলা ও ইংরেজি ভাষার ডেটা লোড হচ্ছে...');
      setProgress(15);

      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (!isMountedRef.current || stopOcrRef.current) return;
          if (m.status === 'recognizing text') {
            const p = Math.round((m.progress || 0) * 100);
            setProgress(p);
            setStatusMessage(`টেক্সট শনাক্তকরণ চলছে... ${toBn(p)}%`);
          } else if (m.status === 'loading tesseract core') {
            setProgress(25);
            setStatusMessage('কোর মডেল সক্রিয় হচ্ছে...');
          } else if (m.status === 'loading language traineddata') {
            setProgress(40);
            setStatusMessage('ভাষার ডেটাসেট ডাউনলোড হচ্ছে...');
          }
        },
      });

      if (!isMountedRef.current || stopOcrRef.current) {
        await worker.terminate();
        return;
      }

      let textResult = '';

      if (isPdf) {
        setStatusMessage('পিডিএফ পেজ রেন্ডার করা হচ্ছে...');
        setProgress(30);

        try {
          const pdfjsLib = await import('pdfjs-dist');
          const arrayBuffer = await targetFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;

          const numPages = Math.min(pdfDoc.numPages, 10); // Process up to 10 pages client-side
          const pageTexts: string[] = [];

          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            if (!isMountedRef.current || stopOcrRef.current) break;
            setStatusMessage(`পৃষ্ঠা ${toBn(pageNum)}/${toBn(numPages)} রেন্ডার ও প্রসেসিং...`);
            
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              await (page.render({ canvasContext: ctx, viewport } as any).promise);
              const dataUrl = canvas.toDataURL('image/png');
              const { data } = await worker.recognize(dataUrl);
              pageTexts.push(`--- [পৃষ্ঠা ${toBn(pageNum)}] ---\n` + data.text.trim());
            }
          }

          textResult = pageTexts.join('\n\n');
        } catch (pdfErr) {
          console.error('PDF OCR render error, falling back to direct recognize:', pdfErr);
          const { data } = await worker.recognize(targetFile);
          textResult = data.text;
        }
      } else {
        const { data } = await worker.recognize(targetFile);
        textResult = data.text;
      }

      await worker.terminate();

      if (!isMountedRef.current || stopOcrRef.current) return;

      if (!textResult || textResult.trim().length === 0) {
        setErrorMessage('ছবি থেকে কোনো স্পষ্ট টেক্সট পাওয়া যায়নি। দয়া করে ভালো আলো ও স্পষ্ট প্রিন্ট করা ছবি দিয়ে পুনরায় চেষ্টা করুন।');
      } else {
        setExtractedText(textResult.trim());
      }
      setProgress(100);
      setStatusMessage('সম্পন্ন!');
    } catch (err: any) {
      console.error('OCR Error:', err);
      if (isMountedRef.current) {
        setErrorMessage(
          err?.message || 'টেক্সট এক্সট্রাক্ট করার সময় ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  // Sample image test
  const handleTrySample = () => {
    // Generate an in-browser canvas sample text card with Bangla & English
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#084A2E';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', 260, 80);

    ctx.fillStyle = '#0F1F17';
    ctx.font = '22px sans-serif';
    ctx.fillText('ইউটিলিটি ও ডিজিটাল সেবা পোর্টাল — Utools.bd', 230, 140);
    ctx.fillText('টুল কোড: TXT-OCR-01 (বাংলা ও ইংরেজি টেক্সট এক্সট্রাকশন)', 190, 190);
    ctx.fillText('১ ভরি সোনা = ১১.৬৬৪ গ্রাম (BAJUS প্রমিত হিসাব)', 230, 240);
    ctx.fillText('১ শতাংশ জমি = ৪৩৫.৬ বর্গফুট (সরকারি মানদণ্ড)', 240, 290);

    ctx.fillStyle = '#0B5D3B';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText('Official Demo Certificate • Generated for Instant Testing', 220, 360);

    canvas.toBlob((blob) => {
      if (blob) {
        const sampleFile = new File([blob], 'bangla_sample_document.png', { type: 'image/png' });
        handleFileSelection(sampleFile);
      }
    }, 'image/png');
  };

  // Copy text to clipboard
  const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  // Download as TXT file
  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset
  const handleReset = () => {
    stopOcrRef.current = true;
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage('');
    setExtractedText('');
    setErrorMessage(null);
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate statistics
  const charCount = extractedText.length;
  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const lineCount = extractedText ? extractedText.split('\n').length : 0;

  // Schema structured data
  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'ছবি ও PDF থেকে বাংলা টেক্সট কনভার্টার (OCR)',
      description: 'প্রিন্ট করা বাংলা ও ইংরেজি ডকুমেন্টের ছবি অথবা স্ক্যান করা পিডিএফ থেকে দ্রুত টেক্সট এক্সট্রাক্ট ও কপি করুন। সম্পূর্ণ নিরাপদ ও ক্লায়েন্ট-সাইড।',
      url: 'https://utools.bd/image-to-text',
      inLanguage: 'bn-BD',
    },
    {
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
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>{pageContent.metaTitle || 'ছবি ও PDF থেকে বাংলা টেক্সট (OCR) | Utools.bd'}</title>
        <meta
          name="description"
          content={pageContent.metaDescription || 'প্রিন্ট করা বাংলা ও ইংরেজি ডকুমেন্টের ছবি অথবা স্ক্যান করা পিডিএফ থেকে দ্রুত টেক্সট এক্সট্রাক্ট ও কপি করুন।'}
        />
        <link rel="canonical" href="https://utools.bd/image-to-text" />
        <meta property="og:title" content="ছবি ও PDF থেকে বাংলা টেক্সট (OCR) | Utools.bd" />
        <meta
          property="og:description"
          content="১০০% ক্লায়েন্ট-সাইড বাংলা ও ইংরেজি OCR কনভার্টার। কোনো ফাইল সার্ভারে আপলোড হয় না।"
        />
        <meta property="og:url" content="https://utools.bd/image-to-text" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdSchemas)}</script>
      </Helmet>

      {/* Top Header Card */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-[#0B5D3B] hover:text-[#084A2E] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </Link>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F0F4F2] text-[#084A2E] border border-[#D5E4DB] font-semibold">
            TXT-OCR-01
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
            {pageContent.title || 'ছবি ও PDF থেকে বাংলা টেক্সট (OCR)'}
          </h1>
          <p className="text-xs sm:text-sm text-[#34443B] mt-1 leading-relaxed">
            {pageContent.subtitle ||
              'যেকোনো ছবি বা স্ক্যান করা পিডিএফ ফাইল থেকে প্রিন্ট করা বাংলা ও ইংরেজি লেখা স্বয়ংক্রিয়ভাবে টেক্সটে রূপান্তর করুন।'}
          </p>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-[#0B5D3B] bg-[#F0F4F2] border border-[#D5E4DB] px-3 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#0B5D3B]" />
          <span>
            <strong>১০০% নিরাপদ ও ক্লায়েন্ট-সাইড:</strong> আপনার কোনো ছবি বা পিডিএফ ফাইল সার্ভারে পাঠানো হয় না — সমস্ত প্রসেসিং সরাসরি আপনার ডিভাইসের ব্রাউজারে সম্পন্ন হয়।
          </span>
        </div>
      </div>

      {/* Main Tool Area */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-6 rounded-2xl shadow-xs">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#084A2E] uppercase tracking-wider font-serif flex items-center space-x-1.5">
            <Languages className="w-4 h-4 text-[#0B5D3B]" />
            <span>১. ডকুমেন্টের ভাষা নির্বাচন করুন</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLang(lang.id)}
                disabled={isProcessing}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLang === lang.id
                    ? 'bg-[#0B5D3B] text-white border-[#084A2E] shadow-sm'
                    : 'bg-[#F0F4F2]/50 hover:bg-[#F0F4F2] text-[#0F1F17] border-[#D5E4DB]'
                } ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="font-semibold text-xs sm:text-sm">{lang.label}</div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    selectedLang === lang.id ? 'text-white/80' : 'text-[#4A5A52]'
                  }`}
                >
                  {lang.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#084A2E] uppercase tracking-wider font-serif flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-[#0B5D3B]" />
              <span>২. ছবি বা PDF ফাইল আপলোড করুন</span>
            </label>
            <button
              type="button"
              onClick={handleTrySample}
              disabled={isProcessing}
              className="text-xs text-[#0B5D3B] hover:text-[#084A2E] font-medium flex items-center space-x-1 hover:underline cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>নমুনা দিয়ে টেস্ট করুন</span>
            </button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelection(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              isDragOver
                ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 scale-[0.99]'
                : 'border-[#D5E4DB] hover:border-[#0B5D3B] bg-[#F0F4F2]/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B]">
                <ScanText className="w-6 h-6" />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-60"
                >
                  ফাইল সিলেক্ট করুন
                </button>
                <span className="text-xs text-[#4A5A52] ml-2">অথবা এখানে ফাইল ড্রপ করুন</span>
              </div>

              <p className="text-[11px] text-[#4A5A52]">
                সমর্থিত ফাইল: JPG, PNG, WEBP ছবি এবং স্ক্যানড PDF (সর্বোচ্চ ১০ পৃষ্ঠা)
              </p>
            </div>
          </div>
        </div>

        {/* Selected file preview & details */}
        {file && (
          <div className="bg-[#F0F4F2] border border-[#D5E4DB] p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="ডকুমেন্ট প্রিভিউ"
                  className="w-12 h-12 object-cover rounded-lg border border-[#D5E4DB] bg-white shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white border border-[#D5E4DB] flex items-center justify-center text-[#0B5D3B] shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold text-[#084A2E] truncate">{file.name}</div>
                <div className="text-[11px] text-[#4A5A52]">
                  সাইজ: {toBn((file.size / 1024).toFixed(1))} KB
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing}
              className="p-2 text-[#4A5A52] hover:text-[#991B1B] hover:bg-white rounded-lg transition cursor-pointer disabled:opacity-50"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress bar during processing */}
        {isProcessing && (
          <div className="space-y-2 p-4 bg-[#F0F4F2] border border-[#D5E4DB] rounded-xl">
            <div className="flex items-center justify-between text-xs font-medium text-[#084A2E]">
              <span className="flex items-center space-x-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-[#0B5D3B]" />
                <span>{statusMessage}</span>
              </span>
              <span className="font-mono">{toBn(progress)}%</span>
            </div>
            <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#D5E4DB]">
              <div
                className="bg-[#0B5D3B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-start space-x-2 text-xs sm:text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] p-3.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OCR Result Textarea */}
        {extractedText && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor={textareaId}
                className="block text-xs font-bold text-[#084A2E] uppercase tracking-wider font-serif flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0B5D3B]" />
                <span>শনাক্তকৃত বাংলা ও ইংরেজি টেক্সট</span>
              </label>

              <div className="flex items-center space-x-2 text-[11px] text-[#4A5A52] font-mono">
                <span>শব্দ: {toBn(wordCount)}</span>
                <span>•</span>
                <span>অক্ষর: {toBn(charCount)}</span>
                <span>•</span>
                <span>লাইন: {toBn(lineCount)}</span>
              </div>
            </div>

            <textarea
              id={textareaId}
              rows={10}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full p-4 text-xs sm:text-sm leading-relaxed text-[#0F1F17] bg-[#FFFFFF] border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] focus:border-transparent font-sans"
              placeholder="এখানে আপনার টেক্সট প্রদর্শিত হবে..."
            />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
              >
                {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'কপি হয়েছে!' : 'সব টেক্সট কপি করুন'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2.5 bg-[#F0F4F2] hover:bg-[#D5E4DB] text-[#084A2E] text-xs sm:text-sm font-semibold rounded-xl border border-[#D5E4DB] flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0B5D3B]" />
                <span>ডাউনলোড (.txt)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-white hover:bg-[#F0F4F2] text-[#4A5A52] text-xs sm:text-sm font-medium rounded-xl border border-[#D5E4DB] flex items-center space-x-1.5 transition cursor-pointer ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>নতুন ফাইল</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OCR Quality Tips Card */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl shadow-xs">
        <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
          <span>সর্বোচ্চ নির্ভুল ফলাফল পাওয়ার উপায়</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#34443B]">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#084A2E]">উচ্চ রেজোলিউশন ও স্পষ্ট আলো:</strong> ঝাপসা বা ছায়াযুক্ত ছবি এড়িয়ে দিনের পরিষ্কার আলোতে সোজাভাবে তোলা ছবি আপলোড করুন।
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#084A2E]">সোজা টেক্সট ও সঠিক ওরিয়েন্টেশন:</strong> ছবি উল্টো বা বাঁকা থাকলে আমাদের <Link to="/photo-resizer" className="text-[#0B5D3B] underline font-medium">ফটো ক্রপার</Link> দিয়ে সোজা করে নিন।
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#084A2E]">প্রিন্টেড ফন্টে ৯৫%+ নির্ভুলতা:</strong> বই, পত্রিকা, সার্টিফিকেট ও টাইপ করা নথিতে সবচেয়ে নির্ভুল আউটপুট পাওয়া যায়।
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#084A2E]">সঠিক ভাষা নির্বাচন:</strong> শুধু ইংরেজি কাগজের জন্য &apos;English&apos; এবং বাংলা কাগজের জন্য &apos;বাংলা + ইংরেজি&apos; সিলেক্ট করুন।
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic CMS Sections (FAQs, Guides) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking to other tools */}
      <RelatedTools currentToolId="image-to-text" />
    </div>
  );
};
