import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  Calculator,
  ChevronDown,
  Coins,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import {
  VORI_IN_GRAM,
  GOLD_UNITS,
  GoldUnitKey,
  GOLD_UNITS_IN_GRAM,
  parseGoldInput,
  convertGoldWeight,
  decomposeGoldWeight,
  formatGoldNumber,
  formatTaka,
} from '../utils/goldWeightConverter.ts';
import { toBn } from '../utils/bnDigits.ts';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { RelatedTools } from '../components/RelatedTools.tsx';

interface PresetOption {
  label: string;
  value: string;
  unit: GoldUnitKey;
}

const PRESETS: PresetOption[] = [
  { label: '১ ভরি', value: '1', unit: 'vori' },
  { label: '১০ গ্রাম', value: '10', unit: 'gram' },
  { label: '১ আনা', value: '1', unit: 'ana' },
  { label: '১ রতি', value: '1', unit: 'rati' },
  { label: '১ তোলা', value: '1', unit: 'tola' },
  { label: '১ কেজি', value: '1', unit: 'kg' },
];

export const GoldWeightConverterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query params on initial mount
  const initialFrom = useMemo<GoldUnitKey>(() => {
    const fromParam = searchParams.get('from') || searchParams.get('unit');
    if (fromParam && fromParam in GOLD_UNITS_IN_GRAM) {
      return fromParam as GoldUnitKey;
    }
    return 'vori';
  }, [searchParams]);

  const initialTo = useMemo<GoldUnitKey | null>(() => {
    const toParam = searchParams.get('to');
    if (toParam && toParam in GOLD_UNITS_IN_GRAM) {
      return toParam as GoldUnitKey;
    }
    return null;
  }, [searchParams]);

  const initialVal = useMemo<string>(() => {
    const valParam = searchParams.get('value') || searchParams.get('amount');
    if (valParam && valParam.trim() !== '') {
      return valParam.trim();
    }
    return '1';
  }, [searchParams]);

  const [inputRaw, setInputRaw] = useState<string>(initialVal);
  const [sourceUnit, setSourceUnit] = useState<GoldUnitKey>(initialFrom);
  const [targetUnitFocus, setTargetUnitFocus] = useState<GoldUnitKey | null>(initialTo);
  const [useBanglaDigits, setUseBanglaDigits] = useState<boolean>(true);

  // Optional Price Calculator State
  const [showPriceCalc, setShowPriceCalc] = useState<boolean>(true);
  const [priceRateUnit, setPriceRateUnit] = useState<'vori' | 'gram'>('vori');
  const [manualPriceRate, setManualPriceRate] = useState<string>('');

  // Copy tracking states
  const { copy: copyToClipboard } = useCopyToClipboard();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Open FAQ accordion index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Synchronize URL if user changes source unit
  const handleSelectSourceUnit = (unit: GoldUnitKey) => {
    setSourceUnit(unit);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('from', unit);
    setSearchParams(newParams, { replace: true });
  };

  const handleCopy = (key: string, text: string) => {
    void copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  // Parse input
  const parsed = useMemo(() => parseGoldInput(inputRaw), [inputRaw]);

  // Convert to all units
  const conversions = useMemo(() => {
    if (!parsed.isValid) {
      return convertGoldWeight(0, sourceUnit);
    }
    return convertGoldWeight(parsed.value, sourceUnit);
  }, [parsed, sourceUnit]);

  // Traditional Memo decomposition (ভরি - আনা - রতি - পয়েন্ট)
  const decomposition = useMemo(() => {
    if (!parsed.isValid) {
      return {
        vori: 0,
        ana: 0,
        rati: 0,
        point: 0,
        textBn: '০ ভরি',
        textEn: '0 Vori',
      };
    }
    return decomposeGoldWeight(parsed.value, sourceUnit);
  }, [parsed, sourceUnit]);

  // Optional price calculation
  const calculatedPrice = useMemo(() => {
    if (!parsed.isValid || parsed.value <= 0) return 0;
    const cleanPrice = manualPriceRate.replace(/[\s,০-৯]/g, (d) => {
      const bMap: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
      };
      return bMap[d] ?? d;
    }).replace(/,/g, '');

    const rateNum = Number(cleanPrice);
    if (!isFinite(rateNum) || rateNum <= 0) return 0;

    if (priceRateUnit === 'vori') {
      const voriWeight = conversions.vori;
      return voriWeight * rateNum;
    } else {
      const gramWeight = conversions.gram;
      return gramWeight * rateNum;
    }
  }, [parsed, manualPriceRate, priceRateUnit, conversions]);

  // Reset handler
  const handleReset = () => {
    setInputRaw('1');
    setSourceUnit('vori');
    setTargetUnitFocus(null);
    setManualPriceRate('');
    const newParams = new URLSearchParams();
    setSearchParams(newParams, { replace: true });
  };

  // Card click to make it the source unit
  const handleSelectAsSource = (unitId: GoldUnitKey, convVal: number) => {
    handleSelectSourceUnit(unitId);
    if (convVal > 0) {
      const rounded = Number(convVal.toFixed(4));
      setInputRaw(rounded.toString());
    }
  };

  // Exact 7 FAQs derived directly from VORI_IN_GRAM
  const faqs = useMemo(() => [
    {
      question: '১ ভরি সোনা কত গ্রাম?',
      answer: `১ ভরি = ${VORI_IN_GRAM} গ্রাম (BAJUS-এর প্রমিত হিসাব অনুযায়ী)। বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন সারা দেশে এই মানদণ্ডেই স্বর্ণ কেনাবেচা পরিচালনা করে।`,
    },
    {
      question: '১ আনা সমান কত গ্রাম?',
      answer: `১ আনা = ${(VORI_IN_GRAM / 16).toFixed(3)} গ্রাম (প্রায়); অর্থাৎ ${VORI_IN_GRAM} ÷ ১৬ = ০.৭২৯ গ্রাম। ১ ভরিতে মোট ১৬ আনা থাকে।`,
    },
    {
      question: '১ রতি সমান কত গ্রাম?',
      answer: `১ রতি = ${(VORI_IN_GRAM / 96).toFixed(4)} গ্রাম; অর্থাৎ ${VORI_IN_GRAM} ÷ ৯৬ = ০.১২১৫ গ্রাম। ১ আনায় ৬ রতি এবং ১ ভরিতে মোট ৯৬ রতি হিসাব করা হয়।`,
    },
    {
      question: '১ ভরি সমান কত আনা?',
      answer: '১ ভরি সমান ১৬ আনা। গহনা তৈরির মেমো ও মজুরি হিসাবে আনা একটি অত্যন্ত পরিচিত প্রচলিত একক।',
    },
    {
      question: '১ ভরি সমান কত রতি?',
      answer: '১ ভরি সমান ৯৬ রতি (১৬ আনা × ৬ রতি/আনা = ৯৬ রতি)। রতির সূক্ষ্ম ভগ্নাংশ দিয়ে মূল্যবান রত্ন ও সোনার অলংকার নিখুঁতভাবে মাপা হয়।',
    },
    {
      question: 'ভরি, আনা, রতি ও পয়েন্টের মধ্যে সম্পর্ক কী?',
      answer: `১ ভরি = ১৬ আনা = ৯৬ রতি = ৯৬০ পয়েন্ট = ${VORI_IN_GRAM} গ্রাম (যেখানে ১ আনা = ৬ রতি = ৬০ পয়েন্ট এবং ১ রতি = ১০ পয়েন্ট)। পয়েন্ট হলো স্বর্ণকারদের ব্যবহৃত ক্ষুদ্রতম পরিমাপক একক।`,
    },
    {
      question: 'ভরি আর তোলা কি একই জিনিস?',
      answer: `হ্যাঁ, তোলা ও ভরি অভিন্ন ওজনের দুটি ভিন্ন প্রচলিত নাম। ১ তোলা = ১ ভরি = ${VORI_IN_GRAM} গ্রাম। পুরোনো আমল থেকেই ভারতীয় উপমহাদেশে এই দুটি শব্দ সমার্থক হিসেবে ব্যবহৃত হয়ে আসছে।`,
    },
  ], []);

  // FAQ Schema JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  // Primary highlight unit to compare with
  const primaryCompareUnit: GoldUnitKey = sourceUnit === 'gram' ? 'vori' : 'gram';
  const primaryCompareMeta = GOLD_UNITS.find((u) => u.id === primaryCompareUnit)!;
  const primaryFormatted = formatGoldNumber(conversions[primaryCompareUnit], useBanglaDigits, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>সোনার ওজন কনভার্টার (Gram to Vori) — আনা, রতি | Utools.bd</title>
        <meta
          name="description"
          content="১ ভরি সোনা কত গ্রাম, আনা বা রতি? (Gram to Vori, Vori Ana Roti Calculator) BAJUS নিয়ম অনুযায়ী নির্ভুল সোনার ওজন কনভার্টার।"
        />
        <link rel="canonical" href="https://utools.bd/gold-weight-converter" />
        <meta
          property="og:title"
          content="সোনার ওজন কনভার্টার (Gram to Vori) — আনা, রতি | Utools.bd"
        />
        <meta
          property="og:description"
          content="১ ভরি সোনা কত গ্রাম, আনা বা রতি? (Gram to Vori, Vori Ana Roti Calculator) BAJUS নিয়ম অনুযায়ী নির্ভুল সোনার ওজন কনভার্টার।"
        />
        <meta property="og:url" content="https://utools.bd/gold-weight-converter" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="সোনার ওজন কনভার্টার (Gram to Vori) — আনা, রতি | Utools.bd"
        />
        <meta
          name="twitter:description"
          content="১ ভরি সোনা কত গ্রাম, আনা বা রতি? (Gram to Vori, Vori Ana Roti Calculator) BAJUS নিয়ম অনুযায়ী নির্ভুল সোনার ওজন কনভার্টার।"
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Top Breadcrumb & Privacy Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors rounded-lg font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরুন</span>
          </Link>
        </div>

        {/* 100% Client-Side Privacy Badge */}
        <div className="flex items-center space-x-2 text-xs font-medium text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1.5 shadow-xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>১০০% ক্লায়েন্ট-সাইড ব্রাউজার কনভার্টার (কোনো ডেটা সার্ভারে যায় না)</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#E6F4EC] border border-[#0B5D3B]/20 px-3 py-1 text-xs text-[#084A2E] font-medium rounded-full">
          <Scale className="w-3.5 h-3.5 text-[#0B5D3B]" />
          <span>বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS) প্রমিত মানদণ্ড</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          সোনার ওজন কনভার্টার (ভরি, আনা, রতি ও গ্রাম হিসাব)
        </h1>
        <p className="text-sm sm:text-base text-[#4A5A52] leading-relaxed max-w-3xl">
          গ্রাম, ভরি, আনা, রতি ও পয়েন্ট — সব ইউনিটে তাৎক্ষণিক রূপান্তর (Gram to Vori, Vori Ana Roti Calculator)
        </p>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 sm:p-4 rounded-2xl flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#084A2E] flex items-center gap-1.5 mr-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
          <span>দ্রুত প্রিসেট:</span>
        </span>
        {PRESETS.map((p) => {
          const isActive = sourceUnit === p.unit && inputRaw === p.value;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                handleSelectSourceUnit(p.unit);
                setInputRaw(p.value);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0B5D3B] text-white border-[#0B5D3B] shadow-xs'
                  : 'bg-[#FAFAF7] text-[#0F1F17] border-[#D5E4DB] hover:bg-[#F0F4F2] hover:border-[#0B5D3B]/40'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-xs">
        {/* Input Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div>
            <h2 className="text-base font-bold text-[#084A2E] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#0B5D3B]" />
              <span>সোনার ওজন ও একক নির্বাচন করুন</span>
            </h2>
            <p className="text-xs text-[#4A5A52] mt-0.5">
              যেকোনো ঘরে সংখ্যা লিখলে বাকি সব এককে একসাথেই রিয়েল-টাইম হিসাব প্রদর্শিত হবে
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Digit toggle button */}
            <button
              type="button"
              onClick={() => setUseBanglaDigits((prev) => !prev)}
              className="text-xs border border-[#D5E4DB] bg-[#FAFAF7] hover:bg-[#F0F4F2] text-[#084A2E] px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="font-mono font-bold text-[#0B5D3B]">
                {useBanglaDigits ? '১২৩' : '123'}
              </span>
              <span>{useBanglaDigits ? 'বাংলা সংখ্যা' : 'English Digits'}</span>
            </button>

            {/* Reset button */}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs border border-[#D5E4DB] bg-[#FAFAF7] hover:bg-[#F0F4F2] text-[#4A5A52] hover:text-[#084A2E] px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>

        {/* Input Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Number Input Field */}
          <div className="md:col-span-7 space-y-1.5">
            <label htmlFor="gold-amount-input" className="block text-xs font-semibold text-[#0F1F17]">
              ওজনের পরিমাণ (সংখ্যা লিখুন):
            </label>
            <div className="relative">
              <input
                id="gold-amount-input"
                type="text"
                inputMode="decimal"
                value={inputRaw}
                onChange={(e) => setInputRaw(e.target.value)}
                placeholder="যেমন: ১ বা ১১.৬৬৪"
                className={`w-full bg-[#FAFAF7] border rounded-xl px-4 py-3 text-lg font-mono text-[#0F1F17] focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] transition-all ${
                  !parsed.isValid && inputRaw.trim() !== ''
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-[#D5E4DB]'
                }`}
              />
              {inputRaw && (
                <button
                  type="button"
                  onClick={() => setInputRaw('')}
                  aria-label="ইনপুট মুছুন"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            {!parsed.isValid && inputRaw.trim() !== '' && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{parsed.error}</span>
              </p>
            )}
          </div>

          {/* Source Unit Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label htmlFor="gold-unit-select" className="block text-xs font-semibold text-[#0F1F17]">
              ইনপুট একক (কোন এককে দিচ্ছেন):
            </label>
            <div className="relative">
              <select
                id="gold-unit-select"
                value={sourceUnit}
                onChange={(e) => handleSelectSourceUnit(e.target.value as GoldUnitKey)}
                className="w-full bg-[#FAFAF7] border border-[#D5E4DB] rounded-xl px-4 py-3 text-base font-semibold text-[#084A2E] focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] transition-all cursor-pointer appearance-none pr-10"
              >
                {GOLD_UNITS.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nameBn} ({unit.nameEn})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#4A5A52] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Source Unit Quick Switcher Pills */}
        <div className="pt-1">
          <span className="text-[11px] font-medium text-[#4A5A52] block mb-2">
            এক ক্লিকে ইনপুট একক বদলান:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {GOLD_UNITS.map((unit) => {
              const isSelected = sourceUnit === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => handleSelectSourceUnit(unit.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#084A2E] text-white border-[#084A2E] shadow-xs'
                      : 'bg-[#FFFFFF] text-[#4A5A52] border-[#D5E4DB] hover:border-[#0B5D3B]/40 hover:text-[#084A2E]'
                  }`}
                >
                  <span>{unit.nameBn}</span>
                  <span className={`text-[10px] opacity-75 font-mono`}>({unit.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Featured Result Card */}
        <div className="rounded-2xl p-5 sm:p-6 bg-linear-to-br from-[#E6F4EC] to-[#F0FDF4] border border-[#0B5D3B]/20 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D3B]">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>প্রধান রূপান্তর ফলাফল</span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#084A2E] font-mono tracking-tight flex items-baseline gap-2">
                <span>{primaryFormatted.text}</span>
                <span className="text-lg sm:text-xl font-serif text-[#0B5D3B]">
                  {primaryCompareMeta.nameBn}
                </span>
                {primaryFormatted.isApprox && (
                  <span className="text-xs font-normal text-[#4A5A52] bg-white/70 px-2 py-0.5 rounded-md border border-[#D5E4DB]">
                    (প্রায়)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4A5A52]">
                ইনপুট: {useBanglaDigits ? toBn(inputRaw || '০') : (inputRaw || '0')}{' '}
                {GOLD_UNITS.find((u) => u.id === sourceUnit)?.nameBn}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'primary-hero',
                    `${primaryFormatted.text} ${primaryCompareMeta.nameBn}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#0B5D3B]/20 hover:border-[#0B5D3B] text-[#084A2E] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                {copiedKey === 'primary-hero' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Traditional Memo Decomposition: ভরি - আনা - রতি - পয়েন্ট */}
        <div className="bg-[#FAFAF7] border border-[#D5E4DB] rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>ঐতিহ্যবাহী অলংকার মেমো রূপ (Traditional Jewelry Format)</span>
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'memo-breakdown',
                  useBanglaDigits ? decomposition.textBn : decomposition.textEn
                )
              }
              className="text-xs text-[#0B5D3B] hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
            >
              {copiedKey === 'memo-breakdown' ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>মেমো টেক্সট কপি</span>
                </>
              )}
            </button>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0F1F17] font-mono bg-white p-3 rounded-xl border border-[#D5E4DB] shadow-2xs">
            {useBanglaDigits ? decomposition.textBn : decomposition.textEn}
          </div>
          <p className="text-[11px] text-[#4A5A52] leading-relaxed">
            স্বর্ণকারদের মেমো বা রসিদে ভরি, আনা, রতি ও পয়েন্টে বিভক্ত করে যেভাবে হিসাব লেখা হয়, এখানে হুবহু সেই ফর্মুলায় বিভাজন দেখানো হয়েছে।
          </p>
        </div>

        {/* All Units Real-Time Output Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#D5E4DB]/60">
            <h3 className="text-sm font-bold text-[#084A2E] flex items-center gap-1.5">
              <span>সকল এককে একনজরে রূপান্তরিত মান</span>
            </h3>
            <span className="text-xs text-[#4A5A52]">
              কার্ডে ক্লিক করে সেটিকে উৎস একক বানাতে পারেন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {GOLD_UNITS.map((unit) => {
              const isSource = sourceUnit === unit.id;
              const isTargetFocus = targetUnitFocus === unit.id;
              const convertedValue = conversions[unit.id];
              const formatted = formatGoldNumber(convertedValue, useBanglaDigits, 4);

              return (
                <div
                  key={unit.id}
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                    isSource
                      ? 'bg-[#E6F4EC]/60 border-[#0B5D3B] ring-1 ring-[#0B5D3B]/20 shadow-2xs'
                      : isTargetFocus
                      ? 'bg-[#FEF3D0]/60 border-[#F5A524] ring-1 ring-[#F5A524]/40 shadow-xs'
                      : 'bg-[#FAFAF7] border-[#D5E4DB] hover:border-[#0B5D3B]/40 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F1F17] font-serif">
                          {unit.nameBn}
                        </span>
                        <span className="text-[11px] font-mono text-[#4A5A52]">
                          ({unit.nameEn})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isSource
                            ? 'bg-[#0B5D3B] text-white'
                            : isTargetFocus
                            ? 'bg-[#F5A524] text-[#0F1F17]'
                            : 'bg-white text-[#4A5A52] border border-[#D5E4DB]'
                        }`}
                      >
                        {isSource ? 'উৎস একক' : isTargetFocus ? 'টার্গেট একক' : unit.badgeBn}
                      </span>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between">
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#084A2E] tracking-tight">
                        {formatted.text}
                      </div>
                      <span className="text-xs font-semibold text-[#4A5A52] font-mono">
                        {unit.symbol}
                      </span>
                    </div>

                    {formatted.isApprox && (
                      <span className="inline-block text-[10px] text-[#D98E0B] font-medium">
                        * ৪ দশমিক স্থানে আসন্ন মান (প্রায়)
                      </span>
                    )}

                    <p className="text-[11px] text-[#4A5A52] pt-1 border-t border-[#D5E4DB]/50">
                      {unit.descriptionBn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D5E4DB]/60">
                    <button
                      type="button"
                      onClick={() => handleSelectAsSource(unit.id, convertedValue)}
                      className="text-[11px] text-[#0B5D3B] hover:underline font-medium cursor-pointer"
                    >
                      {isSource ? '✓ বর্তমান উৎস' : 'উৎস হিসেবে নিন →'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(`unit-${unit.id}`, `${formatted.text} ${unit.nameBn}`)
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4A5A52] hover:text-[#084A2E] p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                      title="কপি করুন"
                    >
                      {copiedKey === `unit-${unit.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Gold Price Calculator Section (User Manual Input, No Live API) */}
        <div className="border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#F5A524]" />
              <h3 className="text-base font-bold text-[#084A2E] font-serif">
                সোনার আনুমানিক মূল্য ক্যালকুলেটর (ঐচ্ছিক)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPriceCalc((prev) => !prev)}
              className="text-xs text-[#0B5D3B] hover:underline font-semibold cursor-pointer"
            >
              {showPriceCalc ? 'সংক্ষেপ করুন ▲' : 'ক্যালকুলেটর খুলুন ▼'}
            </button>
          </div>

          {showPriceCalc && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-7 space-y-1.5">
                  <label htmlFor="gold-rate-input" className="block text-xs font-semibold text-[#0F1F17]">
                    আজকের স্বর্ণের দর (টাকা):
                  </label>
                  <div className="relative">
                    <input
                      id="gold-rate-input"
                      type="text"
                      inputMode="numeric"
                      value={manualPriceRate}
                      onChange={(e) => setManualPriceRate(e.target.value)}
                      placeholder="যেমন: ১৫০,০০০ বা ১৫৫০০০"
                      className="w-full bg-[#FAFAF7] border border-[#D5E4DB] rounded-xl px-4 py-2.5 text-base font-mono text-[#0F1F17] focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                    />
                    {manualPriceRate && (
                      <button
                        type="button"
                        onClick={() => setManualPriceRate('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <span className="block text-xs font-semibold text-[#0F1F17]">
                    দর কোন এককে:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriceRateUnit('vori')}
                      className={`text-xs py-2.5 px-3 rounded-xl border font-semibold transition-all cursor-pointer text-center ${
                        priceRateUnit === 'vori'
                          ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                          : 'bg-[#FAFAF7] text-[#4A5A52] border-[#D5E4DB] hover:bg-white'
                      }`}
                    >
                      প্রতি ভরি দর
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceRateUnit('gram')}
                      className={`text-xs py-2.5 px-3 rounded-xl border font-semibold transition-all cursor-pointer text-center ${
                        priceRateUnit === 'gram'
                          ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                          : 'bg-[#FAFAF7] text-[#4A5A52] border-[#D5E4DB] hover:bg-white'
                      }`}
                    >
                      প্রতি গ্রাম দর
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Calculation Output Box */}
              {calculatedPrice > 0 ? (
                <div className="bg-[#FAFAF7] border border-[#0B5D3B]/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#0B5D3B]">
                      মোট প্রাক্কলিত মূল্য (আনুমানিক স্বর্ণমূল্য)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#084A2E] font-mono">
                      {formatTaka(calculatedPrice, useBanglaDigits)}
                    </div>
                    <div className="text-xs text-[#4A5A52] flex flex-wrap gap-2 pt-0.5">
                      <span>
                        মোট ওজন: {formatGoldNumber(conversions.vori, useBanglaDigits, 3).text} ভরি
                        ({formatGoldNumber(conversions.gram, useBanglaDigits, 3).text} গ্রাম)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy('calculated-price', formatTaka(calculatedPrice, useBanglaDigits))
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D5E4DB] text-[#084A2E] shadow-2xs hover:shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                  >
                    {copiedKey === 'calculated-price' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#0B5D3B]" />
                        <span>মূল্য কপি</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              {/* Strict User-Input Disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-[#FEF3D0]/50 border border-[#F5A524]/30 rounded-xl text-xs text-[#78350F]">
                <Info className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                <p>
                  <strong>ডিসক্লেইমার:</strong> সোনার দাম ম্যানুয়ালি ইনপুট দিন — এই টুল কোনো লাইভ মূল্য দেখায় না বা কোনো বাহ্যিক API ব্যবহার করে না; শুধু আপনার প্রদান করা দর অনুযায়ী মোট ওজন গুণ করে ফলাফল হিসাব করে।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official BAJUS Reference Conversion Table */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 lg:p-8 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0B5D3B]" />
            <span>বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS) প্রমিত সোনার ওজন পরিমাপের তালিকা</span>
          </h2>
          <p className="text-xs text-[#4A5A52]">
            সারা বাংলাদেশে সোনার অলংকার ক্রয়-বিক্রয় ও হলমার্ক করার ক্ষেত্রে নিচের প্রমিত অনুপাতসমূহ অনুসরণ করা হয়:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#FAFAF7] border-b border-[#D5E4DB] text-[#084A2E]">
                <th className="py-3 px-3 sm:px-4 font-bold">একক (Unit)</th>
                <th className="py-3 px-3 sm:px-4 font-bold">ভরি ভিত্তিক অনুপাত</th>
                <th className="py-3 px-3 sm:px-4 font-bold">আনা / রতি অনুপাত</th>
                <th className="py-3 px-3 sm:px-4 font-bold">মেট্রিক গ্রাম (Gram) মান</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5E4DB]/60 text-[#0F1F17]">
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ ভরি (Vori)</td>
                <td className="py-2.5 px-3 sm:px-4">১ ভরি = ১ তোলা</td>
                <td className="py-2.5 px-3 sm:px-4">১৬ আনা = ৯৬ রতি = ৯৬০ পয়েন্ট</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  {toBn(VORI_IN_GRAM)} গ্রাম (একক উৎস মান)
                </td>
              </tr>
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ তোলা (Tola)</td>
                <td className="py-2.5 px-3 sm:px-4">১ তোলা = ১ ভরি</td>
                <td className="py-2.5 px-3 sm:px-4">১৬ আনা = ৯৬ রতি</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  {toBn(VORI_IN_GRAM)} গ্রাম
                </td>
              </tr>
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ আনা (Ana)</td>
                <td className="py-2.5 px-3 sm:px-4">১/১৬ ভরি (০.০৬২৫ ভরি)</td>
                <td className="py-2.5 px-3 sm:px-4">৬ রতি = ৬০ পয়েন্ট</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  {toBn((VORI_IN_GRAM / 16).toFixed(3))} গ্রাম (প্রায়)
                </td>
              </tr>
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ রতি (Rati)</td>
                <td className="py-2.5 px-3 sm:px-4">১/৯৬ ভরি (০.০১০৪১ ভরি)</td>
                <td className="py-2.5 px-3 sm:px-4">১০ পয়েন্ট (১/৬ আনা)</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  {toBn((VORI_IN_GRAM / 96).toFixed(4))} গ্রাম
                </td>
              </tr>
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ পয়েন্ট (Point)</td>
                <td className="py-2.5 px-3 sm:px-4">১/৯৬০ ভরি</td>
                <td className="py-2.5 px-3 sm:px-4">০.১ রতি</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  {toBn((VORI_IN_GRAM / 960).toFixed(5))} গ্রাম
                </td>
              </tr>
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ গ্রাম (Gram)</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono">
                  {toBn((1 / VORI_IN_GRAM).toFixed(4))} ভরি (প্রায়)
                </td>
                <td className="py-2.5 px-3 sm:px-4 font-mono">
                  {toBn((16 / VORI_IN_GRAM).toFixed(3))} আনা
                </td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  ১ গ্রাম = ১০০০ মিলিগ্রাম
                </td>
              </tr>
              <tr className="hover:bg-[#FAFAF7]">
                <td className="py-2.5 px-3 sm:px-4 font-bold text-[#084A2E]">১ কেজি (Kilogram)</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono">
                  {toBn((1000 / VORI_IN_GRAM).toFixed(3))} ভরি
                </td>
                <td className="py-2.5 px-3 sm:px-4">১০০০ গ্রাম</td>
                <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0B5D3B]">
                  ১,০০০ গ্রাম
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ Section) */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 lg:p-8 space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D3B] bg-[#E6F4EC] px-3 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
            সোনার ওজন পরিমাপ সংক্রান্ত সাধারণ প্রশ্নোত্তর (FAQ)
          </h2>
          <p className="text-xs text-[#4A5A52]">
            স্বর্ণ কেনাবেচা ও ওজনের সমীকরণ নিয়ে ক্রেতা ও বিক্রেতাদের সচরাচর করা গুরুত্বপূর্ণ প্রশ্নাবলীর সঠিক সমাধান:
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.question}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isOpen ? 'border-[#0B5D3B]/40 bg-[#FAFAF7]' : 'border-[#D5E4DB] bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-[#0F1F17] hover:text-[#084A2E] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#0B5D3B] font-mono text-sm font-bold">
                      {toBn(idx + 1)}.
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#4A5A52] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0B5D3B]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-[#4A5A52] leading-relaxed border-t border-[#D5E4DB]/40 mt-1">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Link Section: "আরও দরকারি টুলস" */}
      <RelatedTools currentToolId="gold-weight-converter" />
    </div>
  );
};
