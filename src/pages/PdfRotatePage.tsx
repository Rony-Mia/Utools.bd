import React, { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  Download,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck,
  FileText,
  AlertTriangle,
  Compass,
  ArrowRight
} from 'lucide-react';
import { PdfToolLayout } from '../components/pdf/PdfToolLayout.tsx';
import { PdfFileDropzone } from '../components/pdf/PdfFileDropzone.tsx';
import {
  getPdfInfo,
  rotatePages,
  downloadPdfBlob,
  formatBytesBengali,
  LoadedPdfInfo
} from '../lib/pdfUtils.ts';
import { toBanglaNum } from './AgeCalculatorPage.tsx';

interface RotateOutput {
  bytes: Uint8Array;
  blobUrl: string;
  name: string;
  totalPageCount: number;
  rotatedCount: number;
}

export const PdfRotatePage: React.FC = () => {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdfInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map of 0-based page index to rotation degrees delta (e.g. 90, 180, 270)
  const [rotations, setRotations] = useState<Map<number, number>>(() => new Map<number, number>());

  // Download & processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rotateResult, setRotateResult] = useState<RotateOutput | null>(null);

  // File selection
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const info = await getPdfInfo(file);
      setLoadedPdf(info);
      setRotations(new Map());
      if (rotateResult) {
        URL.revokeObjectURL(rotateResult.blobUrl);
        setRotateResult(null);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'পিডিএফ লোড করা সম্ভব হয়নি।');
      setLoadedPdf(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (rotateResult) {
      URL.revokeObjectURL(rotateResult.blobUrl);
    }
    setLoadedPdf(null);
    setRotations(new Map());
    setRotateResult(null);
    setErrorMessage(null);
  };

  // Rotate single page: delta is +90 (clockwise) or -90 (counter-clockwise)
  const handleRotateSinglePage = (pageIndex: number, delta: number) => {
    setRotations((prev: Map<number, number>) => {
      const next = new Map<number, number>(prev);
      const current = next.get(pageIndex) || 0;
      const newAngle = (current + delta) % 360;
      const normalized = (newAngle + 360) % 360;
      if (normalized === 0) {
        next.delete(pageIndex);
      } else {
        next.set(pageIndex, normalized);
      }
      return next;
    });
  };

  // Global rotate all pages
  const handleRotateAll = (delta: number) => {
    if (!loadedPdf) return;
    setRotations((prev: Map<number, number>) => {
      const next = new Map<number, number>(prev);
      for (let i = 0; i < loadedPdf.pageCount; i++) {
        const current = next.get(i) || 0;
        const newAngle = (current + delta) % 360;
        const normalized = (newAngle + 360) % 360;
        if (normalized === 0) {
          next.delete(i);
        } else {
          next.set(i, normalized);
        }
      }
      return next;
    });
  };

  // Reset all rotations to 0
  const handleResetAllRotations = () => {
    setRotations(new Map());
  };

  // Execute Rotation
  const handleExecuteRotate = async () => {
    if (!loadedPdf) return;
    setErrorMessage(null);

    setIsProcessing(true);

    try {
      if (rotateResult) {
        URL.revokeObjectURL(rotateResult.blobUrl);
      }

      // Re-load doc fresh from buffer to avoid cumulative rotations
      const freshInfo = await getPdfInfo(new File([loadedPdf.buffer], loadedPdf.name, { type: 'application/pdf' }));
      const rotatedDoc = await rotatePages(freshInfo.doc, rotations);
      const newBytes = await rotatedDoc.save();
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');
      setRotateResult({
        bytes: newBytes,
        blobUrl,
        name: `${baseName}_rotated.pdf`,
        totalPageCount: loadedPdf.pageCount,
        rotatedCount: rotations.size,
      });
    } catch (err: unknown) {
      console.error('Rotate error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'পিডিএফ ঘোরানোর সময় ত্রুটি ঘটেছে।'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!rotateResult) return;
    const a = document.createElement('a');
    a.href = rotateResult.blobUrl;
    a.download = rotateResult.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'পিডিএফ রোটেট করলে কি ফাইলের ভেতরের লেখা বা ছবির মান কমে যায়?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'না, কোনো মান কমে না। এটি শুধুমাত্র পেজের মেটাডেটার ভিউপোর্ট রোটেশন কোণ (যেমন 90°, 180°, 270°) পরিবর্তন করে। ডকুমেন্টের ভেতরের মূল টেক্সট ও হাই-রেজোলিউশন ইমেজ হুবহু অক্ষুণ্ণ থাকে।',
        },
      },
      {
        '@type': 'Question',
        name: 'স্ক্যান করা উল্টো পেজ কীভাবে সোজা করব?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ফাইলটি আপলোড করার পর যে পেজটি উল্টো রয়েছে সেটির ডানে বা বামের রোটেট বাটনে ক্লিক করুন। আর যদি পুরো ডকুমেন্টের সব পেজই উল্টো হয়ে থাকে, তবে উপরের "সব পেজ ১৮০° উল্টান" বা "সব পেজ ৯০° ডানে ঘোরান" বাটনে চাপ দিয়ে এক ক্লিকেই সোজা করতে পারবেন।',
        },
      },
      {
        '@type': 'Question',
        name: 'আমার আপলোড করা ডকুমেন্ট কি নিরাপদ? সার্ভারে জমা থাকে?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'শতভাগ নিরাপদ! এটি সম্পূর্ণ ক্লায়েন্ট-সাইড ব্রাউজার মেমোরিতে চলে। আপনার ফাইলটি কখনোই ইন্টারনেটের মাধ্যমে কোনো সার্ভারে আপলোড হয় না, ফলে ব্যাংক ডকুমেন্ট, পাসপোর্ট বা ব্যক্তিগত দলিল সম্পূর্ণ গোপন ও সুরক্ষিত থাকে।',
        },
      },
      {
        '@type': 'Question',
        name: 'কত বড় বা কত পেজের পিডিএফ রোটেট করা সম্ভব?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'আমাদের সাইটে কোনো ফাইল সাইজ বা পেজ সংখ্যার কৃত্রিম সীমা নেই। আপনার ডিভাইসের মেমোরি অনুযায়ী শত শত পেজের বই বা ডকুমেন্টও অনায়াসে রোটেট করতে পারবেন।',
        },
      },
      {
        '@type': 'Question',
        name: 'স্মার্টফোন দিয়ে কি উল্টো পিডিএফ সোজা করা যায়?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'হ্যাঁ, যেকোনো অ্যান্ড্রয়েড বা আইফোনে ব্রাউজারের মাধ্যমে পেজগুলো দেখে সহজে আঙুল দিয়ে ট্যাপ করে ঘোরানো ও ডাউনলোড করা সম্ভব।',
        },
      },
      {
        '@type': 'Question',
        name: 'রোটেট করার পর কি পূর্বের অবস্থায় ফিরিয়ে নেওয়া যাবে?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'হ্যাঁ, "সব আগের অবস্থায় ফেরত (রিসেট)" বাটনে ক্লিক করলেই পেজগুলো আবার তাদের প্রাথমিক কোণে ফিরে যাবে।',
        },
      },
      {
        '@type': 'Question',
        name: 'পাসওয়ার্ড প্রটেক্টেড পিডিএফ রোটেট করা যাবে কি?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'বর্তমানে পাসওয়ার্ড সুরক্ষিত পিডিএফ সরাসরি সমর্থিত নয়। এনক্রিপ্টেড ফাইলের ক্ষেত্রে আগে পাসওয়ার্ড প্রটেকশন রিমুভ করে সাধারণ আনলকড পিডিএফ আপলোড করতে হবে।',
        },
      },
    ],
  };

  const howToSteps = [
    {
      stepNum: '১',
      title: 'পিডিএফ নির্বাচন করুন',
      desc: 'আপনার কম্পিউটার বা মোবাইল থেকে যে পিডিএফের পৃষ্ঠা উল্টো রয়েছে তা সিলেক্ট বা ড্রপ করুন।',
    },
    {
      stepNum: '২',
      title: 'পেজ ঘোরান',
      desc: 'নির্দিষ্ট পেজের ডানে/বামে বাটনে ক্লিক করুন অথবা এক ক্লিকে সব পেজ একসাথে রোটেট করুন।',
    },
    {
      stepNum: '৩',
      title: 'সেভ বাটনে চাপুন',
      desc: '"ঘোরানো পিডিএফ তৈরি করুন" বাটনে ক্লিক করে ব্রাউজারেই তাৎক্ষণিক ফাইনাল ফাইল প্রস্তুত করুন।',
    },
    {
      stepNum: '৪',
      title: 'ডাউনলোড করুন',
      desc: 'সোজা করা সম্পূর্ণ ফ্রেশ পিডিএফটি এক ক্লিকে ডাউনলোড বা নতুন ট্যাবে প্রিভিউ দেখে নিন।',
    },
  ];

  return (
    <PdfToolLayout
      title="পিডিএফ রোটেট — Rotate PDF Pages Online Free | Utools.bd"
      metaDescription="অনলাইনে PDF ফাইল ও পেজ ঘোরান সহজে ও ফ্রিতে। উল্টো স্ক্যান করা পেজ ৯০°, ১৮০° বা ২৭০° ঘুরিয়ে সোজা করুন। ১০০% ক্লায়েন্ট-সাইড ব্রাউজারেই নিরাপদ প্রসেসিং।"
      canonicalUrl="https://utools.bd/pdf-rotate"
      ogTitle="পিডিএফ রোটেট — Rotate PDF Pages Online Free | Utools.bd"
      ogDescription="অনলাইনে PDF ফাইল ও পেজ ঘোরান সহজে ও ফ্রিতে। উল্টো স্ক্যান করা পেজ ৯০°, ১৮০° বা ২৭০° ঘুরিয়ে সোজা করুন। ১০০% ক্লায়েন্ট-সাইড ব্রাউজারেই নিরাপদ প্রসেসিং।"
      refCode="DOC-PDF-04"
      badgeText="ডকুমেন্ট ইউটিলিটি • প্রফেশনাল পিডিএফ রোটেটর"
      h1="পিডিএফ রোটেট — উল্টো বা বাঁকা পেজ সোজা করুন"
      introText="মোবাইল ক্যামেরা বা স্ক্যানার দিয়ে স্ক্যান করার সময় প্রায়ই নথিপত্রের পাতা উল্টো বা ল্যান্ডস্কেপ হয়ে যায়। একক পেজ বা সকল পেজকে ৯০° ডানে/বামে কিংবা ১৮০° উল্টিয়ে চোখের পলকে সঠিক ওরিয়েন্টেশনে সোজা করুন সম্পূর্ণ ক্লায়েন্ট-সাইড ও নিরাপদে।"
      schemas={[faqSchema]}
      howToSteps={howToSteps}
      currentToolId="pdf-rotate"
      deepDiveTitle="কেন পিডিএফ ডকুমেন্টের সঠিক ওরিয়েন্টেশন বজায় রাখা জরুরি?"
      deepDiveContent={
        <>
          <p>
            সরকারি চাকরির আবেদন, জাতীয় পরিচয়পত্র বা শিক্ষা সনদের পিডিএফ জমা দেওয়ার সময় কোনো পেজ উল্টো বা বাঁকা থাকলে নিয়োগকারী কর্মকর্তা বা স্বয়ংক্রিয় ভেরিফিকেশন সিস্টেম আবেদনটি বাতিল করে দিতে পারে। বিশেষ করে মোবাইল স্ক্যানার অ্যাপ দিয়ে দ্রুত ছবি তোলার সময় বিভিন্ন পেজ বিভিন্ন কোণে (Landscape/Portrait) সেভ হয়ে যায়।
          </p>
          <p>
            Utools.bd-এর <strong>পিডিএফ রোটেট</strong> টুলে কোনো জটিল সফটওয়্যার ইনস্টল ছাড়াই সরাসরি ব্রাউজারের ভেতর প্রতিটি পেজের কোণ পরিবর্তন করা যায়। আপনি দেখতে পাবেন কোন পেজটি কত ডিগ্রিতে রয়েছে। প্রয়োজনমতো নির্দিষ্ট কোনো একটি পেজকে কিংবা এক ক্লিকে পুরো ডকুমেন্টের সব পেজকে ৯০° বা ১৮০° ঘুরিয়ে সোজা করা যায়। কোনো আপলোড ছাড়া মুহূর্তেই প্রস্তুত হয়ে যায় চূড়ান্ত ফাইল।
          </p>
        </>
      }
      featuresTitle="পিডিএফ রোটেটরের প্রধান সুবিধাসমূহ"
      featuresGrid={
        <>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <RotateCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              একক পেজ রোটেশন
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              ডকুমেন্টের ভেতরের যে পেজটি বাঁকা শুধু সেটিতে ক্লিক করে ৯০° ডানে বা বামে ঘোরানোর সুনির্দিষ্ট নিয়ন্ত্রণ।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              বাল্ক অল-পেজ রোটেশন
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              এক ক্লিকে সমস্ত পৃষ্ঠাকে একসাথে ৯০°, ১৮০° বা ২৭০° ঘুরিয়ে সোজা বা ল্যান্ডস্কেপ করার শর্টকাট।
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
              আপনার ফাইল কোনো অবস্থাতেই ইন্টারনেট পেরিয়ে রিমোট সার্ভারে জমা হয় না। আপনার ডিভাইসেই কাজ সম্পন্ন হয়।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              তাৎক্ষণিক এক্সিকিউশন
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              যেহেতু কোনো ভারী কম্প্রেশন বা রূপান্তর নেই, তাই কয়েক সেকেন্ডের মধ্যেই সোজা করা পিডিএফ ডাউনলোড করা যায়।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              সম্পূর্ণ ফ্রি ও সীমাহীন
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              কোনো রেজিস্ট্রেশন বা ট্রায়াল লিমিট নেই। যত খুশি তত পিডিএফ ফাইল যেকোনো সময় আজীবন ফ্রিতে রোটেট করুন।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ১০০% আসল স্পষ্টতা অক্ষুণ্ণ
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              ঘোরানোর ফলে টেক্সটের ধারালো ভাব বা ছবির হাই-কোয়ালিটি রেজোলিউশনের কোনো অপচয় বা সংকোচন ঘটে না।
            </p>
          </div>
        </>
      }
      faqs={faqSchema.mainEntity.map((item) => ({
        question: item.name,
        answer: item.acceptedAnswer.text,
      }))}
    >
      {/* Interactive Tool Console */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-6 shadow-xs rounded-2xl">
        {!loadedPdf ? (
          <PdfFileDropzone
            multiple={false}
            onFilesSelected={handleFileSelected}
            isLoading={isLoading}
            loadingText="পিডিএফ লোড ও পেজ বিশ্লেষণ হচ্ছে..."
            errorMessage={errorMessage}
            title="যে পিডিএফ ফাইলের পেজ ঘোরাতে চান তা নির্বাচন করুন"
            subtitle="শুধুমাত্র .pdf ফাইল সমর্থিত • ১০০% ক্লায়েন্ট-সাইড ও নিরাপদ"
          />
        ) : (
          <div className="space-y-6">
            {/* Loaded File Meta Header */}
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
              <div className="bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start space-x-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 2: Global Rotate Toolbar */}
            <div className="space-y-4 border-t border-[#D5E4DB] pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3.5 text-xs rounded-lg">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#084A2E] block">
                    এক ক্লিকে সকল পেজ একসাথে ঘোরান:
                  </span>
                  <span className="text-[11px] text-[#4A5A52]">
                    পুরো ডকুমেন্টের সবগুলো পৃষ্ঠা একই কোণে ঘুরবে
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRotateAll(90)}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F4F2] border border-[#D5E4DB] text-[#084A2E] font-medium flex items-center space-x-1 cursor-pointer transition-colors rounded-lg"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>সব পেজ ৯০° ডানে</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRotateAll(-90)}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F4F2] border border-[#D5E4DB] text-[#084A2E] font-medium flex items-center space-x-1 cursor-pointer transition-colors rounded-lg"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>সব পেজ ৯০° বামে</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRotateAll(180)}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F4F2] border border-[#D5E4DB] text-[#084A2E] font-medium flex items-center space-x-1 cursor-pointer transition-colors rounded-lg"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>সব পেজ ১৮০° উল্টান</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAllRotations}
                    disabled={rotations.size === 0}
                    className={`px-3 py-1.5 border text-xs font-medium cursor-pointer transition-colors ${
                      rotations.size === 0
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#4A5A52]'
                    }`}
                  >
                    রিসেট
                  </button>
                </div>
              </div>

              {/* Visual Page Grid with Rotation Indicators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#4A5A52]">
                  <span>পেজ তালিকা ও ব্যক্তিগত রোটেশন কন্ট্রোল:</span>
                  <span className="font-mono text-[11px] text-[#0B5D3B] font-bold">
                    {toBanglaNum(rotations.size)}টি পেজে পরিবর্তন হয়েছে
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 max-h-96 overflow-y-auto p-1.5 border border-[#D5E4DB] bg-[#F0F4F2]/20 rounded-lg">
                  {Array.from({ length: loadedPdf.pageCount }, (_, idx) => {
                    const angle = rotations.get(idx) || 0;
                    const isChanged = angle !== 0;

                    return (
                      <div
                        key={idx}
                        className={`border p-3 flex flex-col items-center justify-between gap-2.5 transition-all text-center select-none ${
                          isChanged
                            ? 'bg-[#0B5D3B]/5 border-[#0B5D3B]/60 shadow-xs'
                            : 'bg-[#FFFFFF] border-[#D5E4DB]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[11px]">
                          <span className="font-mono font-bold text-[#084A2E]">
                            #{toBanglaNum(idx + 1)}
                          </span>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.2 border ${
                              isChanged
                                ? 'bg-[#0B5D3B] text-white border-[#0B5D3B] font-bold'
                                : 'bg-[#F0F4F2] text-[#4A5A52] border-[#D5E4DB]'
                            }`}
                          >
                            {toBanglaNum(angle)}°
                          </span>
                        </div>

                        {/* Visual Rotatable Thumbnail Container */}
                        <div className="w-16 h-20 flex items-center justify-center bg-[#F0F4F2]/50 border border-[#D5E4DB] overflow-hidden rounded-lg">
                          <div
                            style={{
                              transform: `rotate(${angle}deg)`,
                              transition: 'transform 0.25s ease-in-out',
                            }}
                            className="w-10 h-14 bg-white border border-[#084A2E]/30 shadow-xs flex flex-col items-center justify-center text-[#084A2E] rounded-lg"
                          >
                            <FileText className="w-5 h-5 opacity-70" />
                            <span className="text-[9px] font-mono font-bold mt-0.5">
                              P.{idx + 1}
                            </span>
                          </div>
                        </div>

                        {/* Rotate Action Buttons */}
                        <div className="flex items-center justify-center space-x-1.5 w-full pt-1 border-t border-[#D5E4DB]/60">
                          <button
                            type="button"
                            onClick={() => handleRotateSinglePage(idx, -90)}
                            title="৯০° বামে ঘোরান"
                            className="p-1.5 border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#084A2E] transition-colors cursor-pointer rounded-lg"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRotateSinglePage(idx, 90)}
                            title="৯০° ডানে ঘোরান"
                            className="p-1.5 border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#084A2E] transition-colors cursor-pointer rounded-lg"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Execute Rotate */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleExecuteRotate()}
                  disabled={isProcessing}
                  className={`w-full sm:w-auto px-7 py-3 font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs ${
                    isProcessing
                      ? 'bg-[#D5E4DB] text-[#4A5A52] cursor-not-allowed'
                      : 'bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                      <span>ঘোরানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4" />
                      <span>
                        {rotations.size > 0
                          ? `ঘোরানো পিডিএফ তৈরি করুন (${toBanglaNum(rotations.size)}টি পেজে পরিবর্তন)`
                          : 'ঘোরানো পিডিএফ তৈরি করুন'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Success Result & Download Banner */}
            {rotateResult && (
              <div className="border-2 border-[#0B5D3B] bg-[#F0F4F2]/50 p-5 sm:p-6 space-y-4 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B5D3B]/20 pb-3">
                  <div className="flex items-center space-x-2 text-[#0B5D3B]">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-[#084A2E] font-serif text-base sm:text-lg">
                      পিডিএফ সফলভাবে ঘোরানো হয়েছে!
                    </h3>
                  </div>
                  <span className="text-xs text-[#4A5A52] font-mono bg-[#FFFFFF] border border-[#D5E4DB] px-2 py-0.5">
                    {rotateResult.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#4A5A52]">সর্বমোট পেজ</span>
                    <span className="font-mono font-bold text-sm text-[#084A2E]">
                      {toBanglaNum(rotateResult.totalPageCount)}টি
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#4A5A52]">ঘোরানো পেজ</span>
                    <span className="font-mono font-bold text-sm text-[#0B5D3B]">
                      {toBanglaNum(rotateResult.rotatedCount)}টি
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#4A5A52]">আউটপুট সাইজ</span>
                    <span className="font-mono font-bold text-sm text-[#084A2E]">
                      {formatBytesBengali(rotateResult.bytes.byteLength)}
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#4A5A52]">প্রসেসিং মোড</span>
                    <span className="font-bold text-xs text-[#0B5D3B] mt-0.5 block">
                      ১০০% ক্লায়েন্ট-সাইড
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href={rotateResult.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 text-xs font-medium border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>প্রিভিউ দেখুন</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] font-semibold text-sm flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ঘোরানো পিডিএফ ডাউনলোড করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PdfToolLayout>
  );
};
