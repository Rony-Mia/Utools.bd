import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Scissors,
  Download,
  CheckCircle2,
  FileArchive,
  Layers,
  Sparkles,
  FileText,
  RotateCcw,
  Loader2,
  ExternalLink,
  Info,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck
} from 'lucide-react';
import { PdfToolLayout } from '../components/pdf/PdfToolLayout.tsx';
import { PdfFileDropzone } from '../components/pdf/PdfFileDropzone.tsx';
import {
  getPdfInfo,
  parsePageRangeString,
  extractPages,
  downloadPdfBlob,
  downloadZipBlob,
  formatBytesBengali,
  LoadedPdfInfo
} from '../lib/pdfUtils.ts';
import { toBanglaNum } from './AgeCalculatorPage.tsx';
import pageContent from '../../content/pages/pdf-split.json';

interface SplitPartOutput {
  id: string;
  name: string;
  pageIndices: number[]; // 0-based
  bytes: Uint8Array;
  blobUrl: string;
}

export const PdfSplitPage: React.FC = () => {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdfInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Split mode: 'range' | 'all'
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState<string>('1');

  // Execution state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [splitOutputs, setSplitOutputs] = useState<SplitPartOutput[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // File selection handler
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const info = await getPdfInfo(file);
      setLoadedPdf(info);
      setSplitOutputs([]);

      // Set default range suggestion based on page count
      if (info.pageCount > 1) {
        const mid = Math.ceil(info.pageCount / 2);
        setRangeInput(`1-${mid}, ${mid + 1}-${info.pageCount}`);
      } else {
        setRangeInput('1');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'পিডিএফ লোড করা সম্ভব হয়নি।');
      setLoadedPdf(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Revoke old blob urls
    splitOutputs.forEach((item) => URL.revokeObjectURL(item.blobUrl));
    setLoadedPdf(null);
    setSplitOutputs([]);
    setErrorMessage(null);
    setRangeInput('1');
  };

  // Parsed ranges analysis
  const parsedRangeData = useMemo(() => {
    if (!loadedPdf) return { ranges: [], invalidTokens: [] };
    if (splitMode === 'all') {
      const allPages: number[][] = [];
      for (let i = 0; i < loadedPdf.pageCount; i++) {
        allPages.push([i]);
      }
      return { ranges: allPages, invalidTokens: [] };
    }
    return parsePageRangeString(rangeInput, loadedPdf.pageCount);
  }, [loadedPdf, splitMode, rangeInput]);

  // Execute Split
  const handleExecuteSplit = async () => {
    if (!loadedPdf) return;
    setErrorMessage(null);

    const targetRanges = parsedRangeData.ranges;
    if (targetRanges.length === 0) {
      setErrorMessage('সঠিক পেজ নম্বর বা রেঞ্জ প্রদান করুন (যেমন: 1-3, 5)।');
      return;
    }

    setIsProcessing(true);
    setProgressText('পিডিএফ পেজ আলাদা করা হচ্ছে...');

    try {
      // Clear previous urls
      splitOutputs.forEach((item) => URL.revokeObjectURL(item.blobUrl));

      const outputs: SplitPartOutput[] = [];
      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');

      for (let i = 0; i < targetRanges.length; i++) {
        const pageGroup = targetRanges[i];
        const rangeLabel =
          pageGroup.length === 1
            ? `page-${pageGroup[0] + 1}`
            : `pages-${pageGroup[0] + 1}-to-${pageGroup[pageGroup.length - 1] + 1}`;

        setProgressText(
          `অংশ ${toBanglaNum(i + 1)}/${toBanglaNum(targetRanges.length)} তৈরি হচ্ছে (${rangeLabel})...`
        );

        const subDoc = await extractPages(loadedPdf.doc, pageGroup);
        const subBytes = await subDoc.save();
        const blob = new Blob([subBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        outputs.push({
          id: `part-${i + 1}`,
          name: `${baseName}_part_${i + 1}_(${rangeLabel}).pdf`,
          pageIndices: pageGroup,
          bytes: subBytes,
          blobUrl,
        });
      }

      setSplitOutputs(outputs);
    } catch (err: unknown) {
      console.error('Split error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'স্প্লিট করার সময় অপ্রত্যাশিত ত্রুটি ঘটেছে।'
      );
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  // Download single part
  const handleDownloadPart = (part: SplitPartOutput) => {
    const a = document.createElement('a');
    a.href = part.blobUrl;
    a.download = part.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all parts in a ZIP
  const handleDownloadAllZip = async () => {
    if (splitOutputs.length === 0 || !loadedPdf) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');

      splitOutputs.forEach((part) => {
        zip.file(part.name, part.bytes);
      });

      await downloadZipBlob(zip, `${baseName}_split_parts.zip`);
    } catch (err) {
      console.error('ZIP download error:', err);
      setErrorMessage('ZIP ফাইল তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setIsZipping(false);
    }
  };

  const howToSteps = [
    {
      stepNum: '১',
      title: 'পিডিএফ নির্বাচন করুন',
      desc: 'আপনার কম্পিউটার বা মোবাইল থেকে যে পিডিএফ ফাইলটি ভাগ করতে চান তা সিলেক্ট করুন বা ড্রপ করুন।',
    },
    {
      stepNum: '২',
      title: 'স্প্লিট মোড বেছে নিন',
      desc: 'নির্দিষ্ট পেজ রেঞ্জ (যেমন 1-3, 5-8) দিন অথবা "প্রতিটি পেজ আলাদা ফাইল" অপশন নির্বাচন করুন।',
    },
    {
      stepNum: '৩',
      title: 'স্প্লিট বাটনে ক্লিক করুন',
      desc: '"পিডিএফ স্প্লিট করুন" বাটনে চাপ দিলেই ব্রাউজারে সেকেন্ডের মধ্যে প্রতিটি অংশ আলাদা হয়ে যাবে।',
    },
    {
      stepNum: '৪',
      title: 'ডাউনলোড করুন',
      desc: 'আলাদা আলাদা ফাইলের লিংকে ক্লিক করে অথবা এক ক্লিকে সম্পূর্ণ ZIP ফাইল আকারে ডাউনলোড করে নিন।',
    },
  ];

  return (
    <PdfToolLayout
      title={pageContent.metaTitle}
      metaDescription={pageContent.metaDescription}
      canonicalUrl="https://utools.bd/pdf-split"
      ogTitle={pageContent.metaTitle}
      ogDescription={pageContent.metaDescription}
      badgeText="ডকুমেন্ট ইউটিলিটি • প্রফেশনাল পিডিএফ স্প্লিটার"
      h1={pageContent?.title || "পিডিএফ স্প্লিটার — PDF ফাইল ভাগ ও পেজ আলাদা করুন"}
      introText={pageContent?.introText || "বড় পিডিএফ বই, সরকারি রেজাল্ট শিট বা চাকরির গেজেট থেকে প্রয়োজনীয় পৃষ্ঠাসমূহ আলাদা করুন সহজে ও নিখুঁতভাবে। নির্দিষ্ট রেঞ্জ (যেমন ১-৪, ৭, ১০-১৫) অথবা প্রতিটি পৃষ্ঠাকে একক ফাইলে রূপান্তর করে এক ক্লিকে জিপ (ZIP) ডাউনলোড করুন সম্পূর্ণ ক্লায়েন্ট-সাইড ও নিরাপদে।"}
      faqs={pageContent.faqs}
      howToSteps={howToSteps}
      currentToolId="pdf-split"
      cmsContent={pageContent}
      deepDiveTitle="কেন Utools.bd-এর পিডিএফ স্প্লিটার অনন্য ও নির্ভরযোগ্য?"
      deepDiveContent={
        <>
          <p>
            অনেক সময় আমাদের শত পাতার সরকারি গেজেট বা বড় সিলেবাস ও রেজাল্ট শিট থেকে শুধু নিজের রোল বা নির্দিষ্ট ১-২টি পাতার দরকার পড়ে। প্রচলিত ক্লাউড টুলগুলোতে এই সামান্য কাজের জন্য পুরো ২০-৫০ মেগাবাইটের ফাইল সার্ভারে আপলোড করতে হয়, যা ধীরগতির ইন্টারনেটে দীর্ঘ সময় নষ্ট করে এবং ব্যক্তিগত তথ্যের নিরাপত্তাহীনতা বাড়ায়।
          </p>
          <p>
            Utools.bd-এর পিডিএফ স্প্লিটার সম্পূর্ণ <strong>ইন-ব্রাউজার লোকাল মেমোরি ইঞ্জিনে</strong> কাজ করে। আপনি ফাইল লোড করার সাথে সাথে ব্রাউজারের ভেতর পেজ ইনডেক্স তৈরি হয়ে যায়। কোনো ফাইল ইন্টারনেটে আপলোড না হওয়ায় সেকেন্ডের ভগ্নাংশে কাঙ্ক্ষিত রেঞ্জের পেজগুলো আলাদা হয়ে নতুন পিডিএফে রূপান্তর হয়। আপনি চাইলে একাধিক অংশ তৈরি করে এক ক্লিকে সম্পূর্ণ জিপ (ZIP) হিসেবে ডাউনলোড করতে পারেন।
          </p>
        </>
      }
      featuresTitle="পিডিএফ স্প্লিটারের সেরা বৈশিষ্ট্যসমূহ"
      featuresGrid={
        <>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ফ্লেক্সিবল পেজ রেঞ্জ সাপোর্ট
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              একক পেজ (যেমন 5) কিংবা একাধিক রেঞ্জ (যেমন 1-3, 6-9) কমা দিয়ে খুব সহজেই লিখে ইচ্ছামতো ভাগ করে নিন।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <FileArchive className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              এক ক্লিকে ZIP ডাউনলোড
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              স্প্লিট করা পার্টগুলো একটা একটা করে ডাউনলোড করার পাশাপাশি সবগুলো অংশ একসাথে একটি সুবিধাজনক জিপ ফাইলে সেভ করুন।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ১০০% ক্লায়েন্ট-সাইড প্রাইভেসি
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              আপনার ফাইল কোনো রিমোট সার্ভারে আপলোড হয় না। ফলে ব্যাংক স্টেটমেন্ট ও ব্যক্তিগত নথিপত্র থাকে সম্পূর্ণ ব্যক্তিগত ও সুরক্ষিত।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              বজ্রগতির তাৎক্ষণিক প্রসেসিং
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              সার্ভার কিউ বা ইন্টারনেটের গতির ওপর নির্ভর করতে হয় না; ডিভাইসের সিপিইউ শক্তিতে তৎক্ষণাৎ ফাইল প্রস্তুত হয়ে যায়।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              কোনো সাইন-আপ বা সীমা নেই
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              কোনো ইমেইল বা রেজিস্ট্রেশন ছাড়াই তাৎক্ষণিক ফ্রি ব্যবহার করুন। যত খুশি তত পেজ ও ফাইল স্প্লিট করতে পারেন।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              মূল কোয়ালিটি শতভাগ অপরিবর্তিত
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              ডকুমেন্টের টেক্সট ক্রিস্টাল-ক্লিয়ার ভেক্টর আকারে অক্ষুণ্ণ থাকে; ছবির রেজোলিউশন বিন্দুমাত্র নষ্ট হয় না।
            </p>
          </div>
        </>
      }
    >
      {/* Interactive Tool Console */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-6 shadow-xs rounded-2xl">
        {/* Step 1: Upload or Display Loaded File */}
        {!loadedPdf ? (
          <PdfFileDropzone
            multiple={false}
            onFilesSelected={handleFileSelected}
            isLoading={isLoading}
            loadingText="পিডিএফ লোড ও পেজ বিশ্লেষণ হচ্ছে..."
            errorMessage={errorMessage}
            title="যে পিডিএফ ফাইলটি ভাগ করতে চান তা নির্বাচন করুন"
            subtitle="শুধুমাত্র .pdf ফাইল সমর্থিত • আনলিমিটেড পেজ • কোনো সার্ভার আপলোড নেই"
          />
        ) : (
          <div className="space-y-6">
            {/* Loaded File Meta Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F0F4F2]/60 border border-[#D5E4DB] rounded-2xl">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center shrink-0 border border-[#0B5D3B]/20 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#0F1F17] truncate font-sans">
                    {loadedPdf.name}
                  </h3>
                  <div className="text-xs text-[#4A5A52] font-mono flex items-center space-x-2 mt-0.5">
                    <span className="text-[#0B5D3B] font-bold">
                      সর্বমোট পেজ: {toBanglaNum(loadedPdf.pageCount)}টি
                    </span>
                    <span>•</span>
                    <span>সাইজ: {formatBytesBengali(loadedPdf.sizeBytes)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#4A5A52] hover:text-[#084A2E] text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-center rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>অন্য ফাইল দিন</span>
              </button>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Step 2: Split Controls */}
            <div className="space-y-4 border-t border-[#D5E4DB] pt-5">
              <h3 className="text-sm font-bold text-[#084A2E] font-serif flex items-center space-x-2">
                <Scissors className="w-4 h-4 text-[#0B5D3B]" />
                <span>স্প্লিট করার মোড ও পেজ নির্ধারণ করুন</span>
              </h3>

              {/* Mode Selection Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSplitMode('range')}
                  className={`p-3.5 text-left border transition-all cursor-pointer ${
                    splitMode === 'range'
                      ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 font-semibold text-[#084A2E]'
                      : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#34443B] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">১. নির্দিষ্ট পেজ রেঞ্জ স্প্লিট</span>
                    {splitMode === 'range' && (
                      <span className="text-[10px] bg-[#0B5D3B] text-white px-1.5 py-0.2">সক্রিয়</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#4A5A52]">
                    আপনার পছন্দমতো পেজ রেঞ্জ (যেমন: 1-3, 5, 7-9) দিয়ে আলাদা ফাইল তৈরি করুন।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode('all')}
                  className={`p-3.5 text-left border transition-all cursor-pointer ${
                    splitMode === 'all'
                      ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 font-semibold text-[#084A2E]'
                      : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#34443B] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">২. প্রতিটি পেজ আলাদা ফাইল</span>
                    {splitMode === 'all' && (
                      <span className="text-[10px] bg-[#0B5D3B] text-white px-1.5 py-0.2">সক্রিয়</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#4A5A52]">
                    ডকুমেন্টের প্রতিটি একক পেজ দিয়ে আলাদা আলাদা {toBanglaNum(loadedPdf.pageCount)}টি পিডিএফ তৈরি হবে।
                  </p>
                </button>
              </div>

              {/* Range Input Box (if range mode selected) */}
              {splitMode === 'range' && (
                <div className="space-y-2 bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 rounded-2xl">
                  <label htmlFor="range-input" className="block text-xs font-bold text-[#084A2E]">
                    পেজ রেঞ্জ লিখুন (ইংরেজি বা বাংলায়):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="range-input"
                      type="text"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      placeholder="যেমন: 1-3, 5, 7-9"
                      className="w-full px-3 py-2 text-sm bg-[#FFFFFF] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-mono text-[#084A2E] rounded-lg"
                    />
                  </div>
                  <div className="text-[11px] text-[#4A5A52] flex flex-wrap items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>
                      উদাহরণ: <strong>1-3</strong> (পেজ ১ থেকে ৩), <strong>5</strong> (শুধু পেজ ৫),{' '}
                      <strong>1, 3, 5</strong> (আলাদা আলাদা পেজ)।
                    </span>
                  </div>

                  {/* Invalid Tokens Alert */}
                  {parsedRangeData.invalidTokens.length > 0 && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                      ⚠️ কিছু পেজ নম্বর সঠিক নয় বা মোট পেজ ({toBanglaNum(loadedPdf.pageCount)}) এর বাইরে:{' '}
                      {parsedRangeData.invalidTokens.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Live Preview of Planned Split Parts */}
              <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-[#084A2E] font-bold border-b border-[#D5E4DB] pb-2">
                  <span>তৈরি হতে যাওয়া পিডিএফ অংশসমূহ:</span>
                  <span className="font-mono text-[#0B5D3B]">
                    মোট {toBanglaNum(parsedRangeData.ranges.length)}টি ফাইল তৈরি হবে
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 max-h-40 overflow-y-auto">
                  {parsedRangeData.ranges.length === 0 ? (
                    <span className="text-xs text-[#4A5A52]">
                      কোনো বৈধ পেজ রেঞ্জ নির্ধারণ করা হয়নি।
                    </span>
                  ) : (
                    parsedRangeData.ranges.map((group, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-[#F0F4F2] border border-[#D5E4DB] px-2.5 py-1 flex items-center space-x-1.5 rounded-lg"
                      >
                        <span className="font-bold text-[#084A2E]">পার্ট {toBanglaNum(idx + 1)}:</span>
                        <span className="font-mono text-[#0B5D3B]">
                          {group.length === 1
                            ? `পেজ ${toBanglaNum(group[0] + 1)}`
                            : `পেজ ${toBanglaNum(group[0] + 1)}–${toBanglaNum(group[group.length - 1] + 1)}`}
                        </span>
                        <span className="text-[10px] text-[#4A5A52] font-mono">
                          ({toBanglaNum(group.length)} পেজ)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Button: Split */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleExecuteSplit()}
                  disabled={parsedRangeData.ranges.length === 0 || isProcessing}
                  className={`w-full sm:w-auto px-7 py-3 font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs ${
                    parsedRangeData.ranges.length === 0 || isProcessing
                      ? 'bg-[#D5E4DB] text-[#4A5A52] cursor-not-allowed'
                      : 'bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                      <span>{progressText || 'স্প্লিট করা হচ্ছে...'}</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>
                        পিডিএফ স্প্লিট করুন ({toBanglaNum(parsedRangeData.ranges.length)}টি অংশ)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Split Result & Download Zone */}
            {splitOutputs.length > 0 && (
              <div className="border-2 border-[#0B5D3B] bg-[#F0F4F2]/50 p-5 sm:p-6 space-y-4 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B5D3B]/20 pb-3">
                  <div className="flex items-center space-x-2 text-[#0B5D3B]">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-[#084A2E] font-serif text-base sm:text-lg">
                      পিডিএফ সফলভাবে ভাগ করা হয়েছে! ({toBanglaNum(splitOutputs.length)}টি অংশ প্রস্তুত)
                    </h3>
                  </div>

                  {splitOutputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => void handleDownloadAllZip()}
                      disabled={isZipping}
                      className="px-4 py-2 bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      {isZipping ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileArchive className="w-3.5 h-3.5" />
                      )}
                      <span>সবগুলো ZIP ফাইলে ডাউনলোড করুন (.zip)</span>
                    </button>
                  )}
                </div>

                {/* List of output files */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {splitOutputs.map((part, idx) => (
                    <div
                      key={part.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#FFFFFF] border border-[#D5E4DB] text-xs rounded-2xl"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-6 h-6 bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center font-bold text-xs shrink-0">
                          {toBanglaNum(idx + 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#0F1F17] truncate">{part.name}</div>
                          <div className="text-[11px] text-[#4A5A52] font-mono flex items-center space-x-2">
                            <span className="text-[#0B5D3B]">
                              {toBanglaNum(part.pageIndices.length)}টি পেজ
                            </span>
                            <span>•</span>
                            <span>{formatBytesBengali(part.bytes.byteLength)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href={part.blobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#084A2E] flex items-center space-x-1 transition-colors rounded-lg"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>প্রিভিউ</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDownloadPart(part)}
                          className="px-3 py-1.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>ডাউনলোড</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PdfToolLayout>
  );
};
