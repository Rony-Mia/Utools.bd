import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Download,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ExternalLink,
  Info,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { PdfToolLayout } from '../components/pdf/PdfToolLayout.tsx';
import { PdfFileDropzone } from '../components/pdf/PdfFileDropzone.tsx';
import {
  getPdfInfo,
  deletePages,
  downloadPdfBlob,
  formatBytesBengali,
  normalizeBanglaDigits,
  LoadedPdfInfo
} from '../lib/pdfUtils.ts';
import { toBanglaNum } from './AgeCalculatorPage.tsx';

interface DeleteOutput {
  bytes: Uint8Array;
  blobUrl: string;
  name: string;
  originalPageCount: number;
  removedPageCount: number;
  remainingPageCount: number;
}

export const PdfDeletePagesPage: React.FC = () => {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdfInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set of 0-based page indices marked for deletion
  const [pagesToDelete, setPagesToDelete] = useState<Set<number>>(() => new Set<number>());

  // Input string for manual typing (e.g. "2, 4-6")
  const [rangeInput, setRangeInput] = useState<string>('');

  // Process & Download state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [deleteResult, setDeleteResult] = useState<DeleteOutput | null>(null);

  // Handle file selection
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const info = await getPdfInfo(file);
      setLoadedPdf(info);
      setPagesToDelete(new Set());
      setRangeInput('');
      if (deleteResult) {
        URL.revokeObjectURL(deleteResult.blobUrl);
        setDeleteResult(null);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'পিডিএফ লোড করা সম্ভব হয়নি।');
      setLoadedPdf(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (deleteResult) {
      URL.revokeObjectURL(deleteResult.blobUrl);
    }
    setLoadedPdf(null);
    setPagesToDelete(new Set());
    setRangeInput('');
    setDeleteResult(null);
    setErrorMessage(null);
  };

  // Toggle single page deletion
  const handleTogglePage = (pageIndex: number) => {
    setPagesToDelete((prev: Set<number>) => {
      const next = new Set<number>(prev);
      if (next.has(pageIndex)) {
        next.delete(pageIndex);
      } else {
        next.add(pageIndex);
      }
      // Sync range input string
      syncInputFromSet(next);
      return next;
    });
  };

  // Sync range input text from Set
  const syncInputFromSet = (set: Set<number>) => {
    const sorted = Array.from(set).sort((a, b) => a - b);
    if (sorted.length === 0) {
      setRangeInput('');
      return;
    }
    // Turn into 1-based comma separated numbers
    setRangeInput(sorted.map((idx) => idx + 1).join(', '));
  };

  // When user types in range input box, update the set
  const handleRangeInputChange = (inputStr: string) => {
    setRangeInput(inputStr);
    if (!loadedPdf) return;

    const normalized = normalizeBanglaDigits(inputStr);
    const tokens = normalized.split(/[,;\s]+/).map((t) => t.trim()).filter(Boolean);
    const newSet = new Set<number>();

    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        const pageNum = parseInt(token, 10);
        if (pageNum >= 1 && pageNum <= loadedPdf.pageCount) {
          newSet.add(pageNum - 1);
        }
      } else if (/^\d+\s*-\s*\d+$/.test(token)) {
        const parts = token.split('-').map((p) => parseInt(p.trim(), 10));
        const start = Math.min(parts[0], parts[1]);
        const end = Math.max(parts[0], parts[1]);
        for (let p = start; p <= end; p++) {
          if (p >= 1 && p <= loadedPdf.pageCount) {
            newSet.add(p - 1);
          }
        }
      }
    }
    setPagesToDelete(newSet);
  };

  // Quick selection helpers
  const handleSelectOdd = () => {
    if (!loadedPdf) return;
    const newSet = new Set<number>();
    for (let i = 0; i < loadedPdf.pageCount; i++) {
      if ((i + 1) % 2 !== 0) newSet.add(i);
    }
    setPagesToDelete(newSet);
    syncInputFromSet(newSet);
  };

  const handleSelectEven = () => {
    if (!loadedPdf) return;
    const newSet = new Set<number>();
    for (let i = 0; i < loadedPdf.pageCount; i++) {
      if ((i + 1) % 2 === 0) newSet.add(i);
    }
    setPagesToDelete(newSet);
    syncInputFromSet(newSet);
  };

  const handleClearSelection = () => {
    setPagesToDelete(new Set());
    setRangeInput('');
  };

  // Execute Deletion
  const handleExecuteDelete = async () => {
    if (!loadedPdf) return;
    setErrorMessage(null);

    if (pagesToDelete.size === 0) {
      setErrorMessage('মুছে ফেলার জন্য কমপক্ষে একটি পেজ সিলেক্ট করুন।');
      return;
    }

    if (pagesToDelete.size >= loadedPdf.pageCount) {
      setErrorMessage('সবগুলো পেজ মুছে ফেলা যাবে না। নথিতে অন্তত একটি পেজ অবশিষ্ট থাকতে হবে।');
      return;
    }

    setIsProcessing(true);

    try {
      if (deleteResult) {
        URL.revokeObjectURL(deleteResult.blobUrl);
      }

      const indicesToDelete = Array.from(pagesToDelete) as number[];
      const newDoc = await deletePages(loadedPdf.doc, indicesToDelete);
      const newBytes = await newDoc.save();
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');
      setDeleteResult({
        bytes: newBytes,
        blobUrl,
        name: `${baseName}_pages_removed.pdf`,
        originalPageCount: loadedPdf.pageCount,
        removedPageCount: pagesToDelete.size,
        remainingPageCount: loadedPdf.pageCount - pagesToDelete.size,
      });
    } catch (err: unknown) {
      console.error('Delete pages error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'পেজ মুছে ফেলার সময় ত্রুটি ঘটেছে।'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!deleteResult) return;
    const a = document.createElement('a');
    a.href = deleteResult.blobUrl;
    a.download = deleteResult.name;
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
        name: 'পেজ মুছে ফেললে কি বাকি পেজগুলোর লেখা বা ছবির কোয়ালিটি নষ্ট হয়?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'একদমই না! Utools.bd কোনো ইমেজ কম্প্রেশন বা টেক্সট পরিবর্তন করে না। শুধুমাত্র আপনি যে পেজগুলো বাদ দিয়েছেন সেগুলো বাদ দিয়ে বাকি পেজগুলোকে অবিকল মূল রেজোলিউশন ও ফন্টসহ সংরক্ষণ করে নতুন পিডিএফ তৈরি করে।',
        },
      },
      {
        '@type': 'Question',
        name: 'একসাথে একাধিক বা নির্দিষ্ট রেঞ্জের পেজ কীভাবে মুছব?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'আপনি সরাসরি পেজের কার্ডের ওপর ক্লিক করে চেকবক্স সিলেক্ট করতে পারেন, অথবা ইনপুট বক্সে "2, 4-6" এর মতো কমা ও হাইফেন দিয়ে পেজ নম্বর লিখে দিতে পারেন। উভয় পদ্ধতি স্বয়ংক্রিয়ভাবে সিঙ্ক থাকবে।',
        },
      },
      {
        '@type': 'Question',
        name: 'আমার আপলোড করা ডকুমেন্ট কি কোনো সার্ভারে চলে যায়?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'কখনোই না! এটি ১০০% ক্লায়েন্ট-সাইড প্রযুক্তি। আপনার ফাইলের ডেটা সম্পূর্ণভাবে আপনার কম্পিউটারের বা ফোনের ব্রাউজারেই প্রসেস হয়। ইন্টারনেটে কোনো সার্ভারে যায় না বা সংরক্ষিত থাকে না।',
        },
      },
      {
        '@type': 'Question',
        name: 'ভুলবশত সবগুলো পেজ সিলেক্ট করে ফেললে কি ফাইল নষ্ট হবে?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'না, আমাদের সিস্টেমে সুরক্ষিত ভ্যালিডেশন রয়েছে। একটি পিডিএফে অন্তত ১টি পেজ থাকতে হবে; সবগুলো পেজ সিলেক্ট করলে সিস্টেম সতর্কতা প্রদর্শন করবে এবং কাজ সম্পন্ন করতে দেবে না।',
        },
      },
      {
        '@type': 'Question',
        name: 'বড় সরকারি চাকরির সার্কুলার বা স্ক্যান বই থেকে পেজ মুছা যাবে?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'হ্যাঁ, যত বড় সাইজের কিংবা যত বেশি পেজের পিডিএফই হোক না কেন, কোনো কৃত্রিম সীমাবদ্ধতা ছাড়াই অনায়াসে পেজ বাদ দিতে পারবেন।',
        },
      },
      {
        '@type': 'Question',
        name: 'পাসওয়ার্ড প্রটেক্টেড পিডিএফ থেকে পেজ ডিলিট করা সম্ভব কি?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'বর্তমানে এনক্রিপ্ট করা বা পাসওয়ার্ড সুরক্ষিত পিডিএফ সরাসরি সমর্থিত নয়। এই ধরনের ফাইল থেকে পেজ মুছতে হলে প্রথমে সেটির পাসওয়ার্ড সুরক্ষা তুলে নিয়ে সাধারণ আনলকড পিডিএফ হিসেবে আপলোড করতে হবে।',
        },
      },
      {
        '@type': 'Question',
        name: 'মোবাইলে টাচ করে কি পেজ সিলেক্ট করা যাবে?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'হ্যাঁ, মোবাইল ও ট্যাবলেটের জন্য বড় টাচ টার্গেট রাখা হয়েছে, যাতে যেকোনো ডিভাইসে আঙুল দিয়ে ট্যাপ করে সহজে পেজ নির্বাচন করা যায়।',
        },
      },
    ],
  };

  const howToSteps = [
    {
      stepNum: '১',
      title: 'ফাইল আপলোড করুন',
      desc: 'যে পিডিএফ থেকে পৃষ্ঠা বাদ দিতে চান সেটি ব্রাউজ করুন অথবা সরাসরি ড্রপ করুন।',
    },
    {
      stepNum: '২',
      title: 'অপ্রয়োজনীয় পেজ চিহ্নিত করুন',
      desc: 'পেজ গ্রিডে ক্লিক করে অথবা ইনপুট বক্সে পেজ নম্বর লিখে বাদ দেওয়ার পেজগুলো সিলেক্ট করুন।',
    },
    {
      stepNum: '৩',
      title: 'মুছুন বাটনে ক্লিক করুন',
      desc: '"নির্বাচিত পেজ মুছুন" বাটনে চাপ দিয়ে সেকেন্ডের মধ্যে অবশিষ্ট পেজ দিয়ে নতুন পিডিএফ তৈরি করুন।',
    },
    {
      stepNum: '৪',
      title: 'ডাউনলোড করুন',
      desc: 'প্রস্তুতকৃত পরিচ্ছন্ন পিডিএফটি এক ক্লিকে আপনার ডিভাইসে সেভ করে নিন।',
    },
  ];

  return (
    <PdfToolLayout
      title="পিডিএফ পেজ ডিলিট — PDF Delete Pages Online Free | Utools.bd"
      metaDescription="অনলাইনে PDF ফাইল থেকে অপ্রয়োজনীয় পৃষ্ঠা মুছে ফেলুন সহজে ও ফ্রিতে। কোনো পেজ সীমা নেই, ১০০% ক্লায়েন্ট-সাইড ব্রাউজারেই নিরাপদ ও দ্রুত প্রসেসিং।"
      canonicalUrl="https://utools.bd/pdf-delete-pages"
      ogTitle="পিডিএফ পেজ ডিলিট — PDF Delete Pages Online Free | Utools.bd"
      ogDescription="অনলাইনে PDF ফাইল থেকে অপ্রয়োজনীয় পৃষ্ঠা মুছে ফেলুন সহজে ও ফ্রিতে। কোনো পেজ সীমা নেই, ১০০% ক্লায়েন্ট-সাইড ব্রাউজারেই নিরাপদ ও দ্রুত প্রসেসিং।"
      refCode="DOC-PDF-03"
      badgeText="ডকুমেন্ট ইউটিলিটি • প্রফেশনাল পেজ রিমুভার"
      h1="পিডিএফ পেজ ডিলিট — অপ্রয়োজনীয় পৃষ্ঠা মুছে ফেলুন"
      introText="স্ক্যান করা নথির খালি পাতা, অতিরিক্ত কভার পেজ বা গোপনীয় তথ্য সংবলিত নির্দিষ্ট পৃষ্ঠা বাদ দিন এক ক্লিকে। ভিজ্যুয়াল পেজ সিলেক্টর ও রিয়েলটাইম প্রিভিউ সহ ১০০% ক্লায়েন্ট-সাইড ব্রাউজারে সেকেন্ডেই ফ্রেশ ও পরিচ্ছন্ন পিডিএফ ফাইল তৈরি করুন।"
      schemas={[faqSchema]}
      howToSteps={howToSteps}
      currentToolId="pdf-delete-pages"
      deepDiveTitle="কেন পিডিএফ থেকে অপ্রয়োজনীয় পৃষ্ঠা ছাঁটাই করা গুরুত্বপূর্ণ?"
      deepDiveContent={
        <>
          <p>
            বিশ্ববিদ্যালয়ের থিসিস পেপার, চাকরির আবেদন বা ব্যাংকের স্টেটমেন্ট স্ক্যান করার সময় প্রায়ই অপ্রয়োজনীয় কভার পাতা, ব্ল্যাঙ্ক পেজ কিংবা ব্যক্তিগত সংবেদনশীল তথ্যওয়ালা পৃষ্ঠা অন্তর্ভুক্ত হয়ে যায়। অনেক সময় নিয়োগদাতা বা প্রতিষ্ঠানের কাছে অতিরিক্ত পেজ জমা দিলে ফাইল সাইজ বড় হয়ে যায় কিংবা অপ্রাসঙ্গিক তথ্যের কারণে আবেদন বাতিল হতে পারে।
          </p>
          <p>
            Utools.bd-এর <strong>পিডিএফ পেজ ডিলিট</strong> টুলটি অত্যন্ত হালকা ও ব্যবহারবান্ধব। ফাইলটি ব্রাউজারে আপলোড করা মাত্রই প্রতিটি পৃষ্ঠার স্পষ্ট নম্বর প্রদর্শিত হয়। আপনি মাউসের এক ক্লিকে বা মোবাইল টাচে যে পৃষ্ঠাগুলো বাদ দিতে চান তা সিলেক্ট করে দিন। অবশিষ্ট পেজগুলো দিয়ে কোনো বিলম্ব ছাড়াই তাত্ক্ষণিক একটি নতুন ক্লিন পিডিএফ ফাইল তৈরি হয়ে যায়।
          </p>
        </>
      }
      featuresTitle="পিডিএফ পেজ রিমুভারের মূল সুবিধাসমূহ"
      featuresGrid={
        <>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ভিজ্যুয়াল পেজ সিলেকশন
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              প্রতিটি পৃষ্ঠার নম্বরসহ গ্রিড থেকে ক্লিক করে লাল বর্ডার ও ট্র্যাশ আইকন দিয়ে চিহ্নিত করার সুবিধা।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              দ্রুত সিলেক্টর টুলবার
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              এক ক্লিকে জোড় (Even) বা বিজোড় (Odd) পেজ নির্বাচন এবং ক্লিয়ার করার স্মার্ট শর্টকাট।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              ১০০% ক্লায়েন্ট-সাইড নিরাপত্তা
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              কোনো সার্ভার আপলোড নেই। সম্পূর্ণ প্রক্রিয়া ব্রাউজার মেমোরিতে সম্পন্ন হওয়ায় তথ্য থাকে সুরক্ষিত।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              বিদ্যুৎগতির প্রসেসিং
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              লোকাল ডিভাইসের ক্ষমতা ব্যবহার করে সেকেন্ডের ভগ্নাংশে পৃষ্ঠা ছাঁটাই করে ফাইল তৈরি করে।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              সম্পূর্ণ ফ্রি ও নো সাইন-আপ
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              কোনো প্রকার সাবস্ক্রিপশন ফি বা অ্যাকাউন্ট খোলার ঝামেলা ছাড়াই যত খুশি পেজ রিমুভ করুন।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-2 rounded-2xl">
            <div className="w-9 h-9 bg-[#F0F4F2] border border-[#D5E4DB] text-[#0B5D3B] flex items-center justify-center font-bold rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
              অক্ষুণ্ণ ফাইল কোয়ালিটি
            </h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              বাকি পেজগুলোর ভেক্টর ফন্ট, ফরম্যাটিং ও ছবির রেজোলিউশনে কোনো হ্রাস ঘটে না।
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
            title="যে পিডিএফ থেকে পেজ মুছতে চান তা নির্বাচন করুন"
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

            {/* Step 2: Selection Toolbar & Input */}
            <div className="space-y-4 border-t border-[#D5E4DB] pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#084A2E] font-serif flex items-center space-x-2">
                  <Trash2 className="w-4 h-4 text-[#c8342a]" />
                  <span>যে পেজগুলো বাদ দিতে চান তা সিলেক্ট করুন</span>
                </h3>

                {/* Quick Selection Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectOdd}
                    className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F0F4F2] border border-[#D5E4DB] text-[#084A2E] font-medium cursor-pointer rounded-lg"
                  >
                    বিজোড় পেজ
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectEven}
                    className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F0F4F2] border border-[#D5E4DB] text-[#084A2E] font-medium cursor-pointer rounded-lg"
                  >
                    জোড় পেজ
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F0F4F2] border border-[#D5E4DB] text-[#4A5A52] cursor-pointer rounded-lg"
                  >
                    সব আনসিলেক্ট
                  </button>
                </div>
              </div>

              {/* Manual Input Field */}
              <div className="bg-[#F0F4F2]/30 border border-[#D5E4DB] p-3.5 space-y-2 text-xs rounded-lg">
                <label htmlFor="delete-page-input" className="block font-bold text-[#084A2E]">
                  নির্দিষ্ট পেজ নম্বর বা রেঞ্জ লিখে বাদ দিন (যেমন: 2, 4-6):
                </label>
                <input
                  id="delete-page-input"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => handleRangeInputChange(e.target.value)}
                  placeholder="যেমন: 2, 4, 7-9"
                  className="w-full px-3 py-2 text-sm bg-[#FFFFFF] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-mono text-[#084A2E] rounded-lg"
                />
                <div className="text-[11px] text-[#4A5A52] flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>নিচের কার্ডগুলোতে ক্লিক করলেও এই ঘরে পেজ নম্বর যুক্ত হয়ে যাবে।</span>
                </div>
              </div>

              {/* Realtime Live Counter */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl">
                <div>
                  <span className="text-[#4A5A52] block text-[11px]">মূল ডকুমেন্টের পেজ</span>
                  <span className="font-mono font-bold text-sm text-[#084A2E]">
                    {toBanglaNum(loadedPdf.pageCount)}টি
                  </span>
                </div>
                <div>
                  <span className="text-[#c8342a] block text-[11px]">বাদ দেওয়া হবে</span>
                  <span className="font-mono font-bold text-sm text-[#c8342a]">
                    {toBanglaNum(pagesToDelete.size)}টি
                  </span>
                </div>
                <div>
                  <span className="text-[#0B5D3B] block text-[11px]">নতুন ফাইলে অবশিষ্ট থাকবে</span>
                  <span className="font-mono font-bold text-sm text-[#0B5D3B]">
                    {toBanglaNum(Math.max(0, loadedPdf.pageCount - pagesToDelete.size))}টি
                  </span>
                </div>
              </div>

              {/* Visual Page Grid */}
              <div className="space-y-2">
                <div className="text-xs text-[#4A5A52] flex items-center justify-between">
                  <span>পেজ তালিকা (ক্লিক করে বাদ দেওয়ার জন্য চিহ্নিত করুন):</span>
                  <span className="font-mono text-[11px]">
                    {toBanglaNum(pagesToDelete.size)}টি পেজ সিলেক্টেড
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-80 overflow-y-auto p-1 border border-[#D5E4DB] bg-[#F0F4F2]/20 rounded-lg">
                  {Array.from({ length: loadedPdf.pageCount }, (_, idx) => {
                    const isSelectedForDeletion = pagesToDelete.has(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleTogglePage(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTogglePage(idx);
                          }
                        }}
                        className={`border p-3 flex flex-col items-center justify-between gap-2 transition-all cursor-pointer select-none text-center ${
                          isSelectedForDeletion
                            ? 'bg-red-50/70 border-red-400 text-red-800 shadow-xs'
                            : 'bg-[#FFFFFF] border-[#D5E4DB] hover:border-[#0B5D3B] text-[#0F1F17]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[11px]">
                          <span className="font-mono font-bold">
                            #{toBanglaNum(idx + 1)}
                          </span>
                          {isSelectedForDeletion ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-[#D5E4DB]" />
                          )}
                        </div>

                        {/* Page thumbnail placeholder */}
                        <div
                          className={`w-12 h-16 border flex flex-col items-center justify-center text-[10px] font-mono transition-colors ${
                            isSelectedForDeletion
                              ? 'border-red-300 bg-red-100/50 line-through text-red-600'
                              : 'border-[#D5E4DB] bg-[#F0F4F2]/60 text-[#4A5A52]'
                          }`}
                        >
                          <FileText className="w-4 h-4 mb-0.5 opacity-60" />
                          <span>P.{idx + 1}</span>
                        </div>

                        <span
                          className={`text-[10px] px-1 py-0.2 w-full font-medium truncate ${
                            isSelectedForDeletion
                              ? 'bg-red-200/60 text-red-900 font-bold'
                              : 'text-[#4A5A52]'
                          }`}
                        >
                          {isSelectedForDeletion ? 'বাদ যাবে' : 'থাকবে'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleExecuteDelete()}
                  disabled={
                    pagesToDelete.size === 0 ||
                    pagesToDelete.size >= loadedPdf.pageCount ||
                    isProcessing
                  }
                  className={`w-full sm:w-auto px-7 py-3 font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs ${
                    pagesToDelete.size === 0 ||
                    pagesToDelete.size >= loadedPdf.pageCount ||
                    isProcessing
                      ? 'bg-[#D5E4DB] text-[#4A5A52] cursor-not-allowed'
                      : 'bg-[#c8342a] hover:bg-red-800 text-[#FFFFFF] cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                      <span>পেজ মুছে ফেলা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>
                        নির্বাচিত {toBanglaNum(pagesToDelete.size)}টি পেজ মুছুন এবং তৈরি করুন
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Success Result & Download Banner */}
            {deleteResult && (
              <div className="border-2 border-[#0B5D3B] bg-[#F0F4F2]/50 p-5 sm:p-6 space-y-4 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B5D3B]/20 pb-3">
                  <div className="flex items-center space-x-2 text-[#0B5D3B]">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-[#084A2E] font-serif text-base sm:text-lg">
                      পেজ মুছে নতুন পিডিএফ প্রস্তুত করা হয়েছে!
                    </h3>
                  </div>
                  <span className="text-xs text-[#4A5A52] font-mono bg-[#FFFFFF] border border-[#D5E4DB] px-2 py-0.5">
                    {deleteResult.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#4A5A52]">আগের পেজ</span>
                    <span className="font-mono font-bold text-sm text-[#084A2E]">
                      {toBanglaNum(deleteResult.originalPageCount)}টি
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#c8342a]">মুছে ফেলা পেজ</span>
                    <span className="font-mono font-bold text-sm text-[#c8342a]">
                      {toBanglaNum(deleteResult.removedPageCount)}টি
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#0B5D3B]">বর্তমান পেজ</span>
                    <span className="font-mono font-bold text-sm text-[#0B5D3B]">
                      {toBanglaNum(deleteResult.remainingPageCount)}টি
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-2xl">
                    <span className="block text-[11px] font-medium text-[#4A5A52]">নতুন ফাইলের সাইজ</span>
                    <span className="font-mono font-bold text-sm text-[#084A2E]">
                      {formatBytesBengali(deleteResult.bytes.byteLength)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href={deleteResult.blobUrl}
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
                    <span>নতুন পিডিএফ ডাউনলোড করুন</span>
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
