import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  AlertTriangle,
  FileText,
  Building2,
  Scale,
  MapPin,
  LandPlot,
  Calculator,
  Compass,
  Sparkles,
} from 'lucide-react';
import {
  UNITS,
  UNIT_GROUP_LABELS,
  UnitGroup,
  KaniBasis,
  BighaBasis,
  getFactors,
  convertLand,
  decompose,
  formatDecomposed,
  parseAreaInput,
  formatAreaNumber,
  getCleanCopyValue,
} from '../landConverter.ts';
import { toBanglaDigits } from '../amountToWords.ts';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/land-converter.json';

interface PresetOption {
  label: string;
  value: string;
  unit: string;
}

const PRESETS: PresetOption[] = [
  { label: '১ বিঘা', value: '1', unit: 'bigha' },
  { label: '১ একর', value: '1', unit: 'acre' },
  { label: '১ কানি', value: '1', unit: 'kani' },
  { label: '১ হেক্টর', value: '1', unit: 'hectare' },
  { label: '১০ শতক', value: '10', unit: 'shotok' },
  { label: '৫ কাঠা', value: '5', unit: 'katha' },
];

export const LandConverterPage: React.FC = () => {
  // Input and settings state (deterministic for SSR prerendering)
  const [inputRaw, setInputRaw] = useState<string>('1');
  const [sourceUnit, setSourceUnit] = useState<string>('bigha');
  const [kaniBasis, setKaniBasis] = useState<KaniBasis>('nol8');
  const [bighaBasis, setBighaBasis] = useState<BighaBasis>('sqft14400');
  const [useBanglaDigits, setUseBanglaDigits] = useState<boolean>(true);

  // Copy tracking states
  const { copy: copyToClipboard } = useCopyToClipboard();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    void copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  // Parse input
  const parsed = useMemo(() => parseAreaInput(inputRaw), [inputRaw]);

  // Conversion factors
  const factors = useMemo(
    () => getFactors(kaniBasis, bighaBasis),
    [kaniBasis, bighaBasis]
  );

  // Base square feet value
  const baseSqft = useMemo(() => {
    if (!parsed.isValid) return 0;
    return convertLand(parsed.value, sourceUnit, 'sqft', factors);
  }, [parsed, sourceUnit, factors]);

  // Mixed representations
  const mixedBigha = useMemo(() => {
    if (!parsed.isValid) return { textBn: '০', textEn: '0' };
    const parts = decompose(baseSqft, ['bigha', 'katha', 'chotak'], factors);
    return {
      textBn: formatDecomposed(parts, true),
      textEn: formatDecomposed(parts, false),
    };
  }, [baseSqft, parsed.isValid, factors]);

  const mixedKani = useMemo(() => {
    if (!parsed.isValid) return { textBn: '০', textEn: '0' };
    const parts = decompose(
      baseSqft,
      ['kani', 'gonda_kani', 'kora_kani', 'kranti', 'til'],
      factors
    );
    return {
      textBn: formatDecomposed(parts, true),
      textEn: formatDecomposed(parts, false),
    };
  }, [baseSqft, parsed.isValid, factors]);

  const mixedAcre = useMemo(() => {
    if (!parsed.isValid) return { textBn: '০', textEn: '0' };
    const parts = decompose(baseSqft, ['acre', 'shotok'], factors);
    return {
      textBn: formatDecomposed(parts, true),
      textEn: formatDecomposed(parts, false),
    };
  }, [baseSqft, parsed.isValid, factors]);

  // Reset handler
  const handleReset = () => {
    setInputRaw('1');
    setSourceUnit('bigha');
    setKaniBasis('nol8');
    setBighaBasis('sqft14400');
  };

  // Card click to make it the source unit
  const handleSelectAsSource = (unitId: string, convVal: number) => {
    setSourceUnit(unitId);
    setInputRaw(getCleanCopyValue(convVal));
  };

  // Units grouped by category
  const groups: UnitGroup[] = [
    'acre_shotok',
    'bigha_katha',
    'kani_gonda',
    'metric',
    'general',
  ];

  const faqs = pageContent.faqs || [];
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta name="description" content={pageContent.metaDescription} />
        <link rel="canonical" href="https://utools.bd/land-converter" />
        <meta property="og:title" content={pageContent.metaTitle} />
        <meta property="og:description" content={pageContent.metaDescription} />
        <meta property="og:url" content="https://utools.bd/land-converter" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta name="twitter:description" content={pageContent.metaDescription} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Top Breadcrumb & Privacy Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরুন</span>
          </Link>
        </div>

        {/* 100% Client-Side Privacy Badge */}
        <div className="flex items-center space-x-2 text-xs font-medium text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1.5 shadow-xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>১০০% ক্লায়েন্ট-সাইড ব্রাউজার কনভার্টার (কোনো তথ্য সার্ভারে যায় না)</span>
        </div>
      </div>

      {/* Page Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#084A2E] font-serif tracking-tight flex items-center gap-2.5">
          <LandPlot className="w-7 h-7 text-[#0B5D3B]" />
          <span>{pageContent.title}</span>
        </h1>
        <p className="text-sm text-[#34443B] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Main Grid: Input Card & Definition Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Card (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D5E4DB] pb-3">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-[#0B5D3B]" />
              <h2 className="text-base font-bold text-[#084A2E] font-serif">
                জমির পরিমাপ ইনপুট
              </h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#084A2E] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg"
              title="রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>

          {/* Amount Input & Unit Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7 space-y-1.5">
              <label
                htmlFor="land-amount-input"
                className="block text-xs font-semibold text-[#084A2E]"
              >
                জমির পরিমাণ (সংখ্যায়)
              </label>
              <input
                id="land-amount-input"
                type="text"
                value={inputRaw}
                onChange={(e) => setInputRaw(e.target.value)}
                placeholder="যেমন: ১ বা ৫.৫"
                className="w-full px-3.5 py-2.5 border border-[#D5E4DB] bg-[#FFFFFF] text-[#0F1F17] text-base font-medium rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]/20 focus:border-[#0B5D3B]"
              />
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label
                htmlFor="land-unit-select"
                className="block text-xs font-semibold text-[#084A2E]"
              >
                যে একক থেকে
              </label>
              <select
                id="land-unit-select"
                value={sourceUnit}
                onChange={(e) => setSourceUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D5E4DB] bg-[#FFFFFF] text-[#0F1F17] text-sm font-medium rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]/20 focus:border-[#0B5D3B] cursor-pointer"
              >
                {groups.map((grp) => (
                  <optgroup key={grp} label={UNIT_GROUP_LABELS[grp].bn}>
                    {UNITS.filter((u) => u.group === grp).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.bn}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message or Helper */}
          {!parsed.isValid && (
            <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start space-x-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{parsed.error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-2 pt-1 border-t border-[#D5E4DB]">
            <span className="text-xs font-semibold text-[#4A5A52] block">
              দ্রুত নির্বাচন (Presets):
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setInputRaw(preset.value);
                    setSourceUnit(preset.unit);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer rounded-lg ${
                    sourceUnit === preset.unit && inputRaw === preset.value
                      ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                      : 'bg-[#F0F4F2] text-[#084A2E] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Definition & Settings Card (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
              <Compass className="w-4 h-4 text-[#0B5D3B]" />
              <h2 className="text-base font-bold text-[#084A2E] font-serif">
                আঞ্চলিক সংজ্ঞা ও সেটিংস
              </h2>
            </div>

            {/* Kani Basis Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#084A2E]">কানির সংজ্ঞা (Kani Basis):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setKaniBasis('nol8')}
                  className={`py-2 px-2.5 text-center font-medium border transition-colors cursor-pointer rounded-lg ${
                    kaniBasis === 'nol8'
                      ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                      : 'bg-[#F0F4F2] text-[#34443B] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
                  }`}
                >
                  ৮ হাত নল (১৭,২৮০ বর্গফুট)
                </button>
                <button
                  type="button"
                  onClick={() => setKaniBasis('shotok40')}
                  className={`py-2 px-2.5 text-center font-medium border transition-colors cursor-pointer rounded-lg ${
                    kaniBasis === 'shotok40'
                      ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                      : 'bg-[#F0F4F2] text-[#34443B] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
                  }`}
                >
                  ৪০ শতক (১৭,৪২৪ বর্গফুট)
                </button>
              </div>
              <p className="text-[11px] text-[#4A5A52] leading-relaxed">
                {kaniBasis === 'nol8'
                  ? 'প্রমিত জরিপ ও দলিল অনুযায়ী ৮ হাত নল = ১২ ফুট। ১ কানি = ২০ গণ্ডা = ১৭,২৮০ বর্গফুট।'
                  : 'ময়মনসিংহ ও কতিপয় অঞ্চলে প্রচলিত: ১ কানি = ঠিক ৪০ শতক = ১৭,৪২৪ বর্গফুট।'}
              </p>
            </div>

            {/* Bigha Basis Toggle */}
            <div className="space-y-2 pt-2 border-t border-[#D5E4DB]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#084A2E]">বিঘার সংজ্ঞা (Bigha Basis):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBighaBasis('sqft14400')}
                  className={`py-2 px-2.5 text-center font-medium border transition-colors cursor-pointer rounded-lg ${
                    bighaBasis === 'sqft14400'
                      ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                      : 'bg-[#F0F4F2] text-[#34443B] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
                  }`}
                >
                  ১৪,৪০০ বর্গফুট (আদর্শ)
                </button>
                <button
                  type="button"
                  onClick={() => setBighaBasis('shotok33')}
                  className={`py-2 px-2.5 text-center font-medium border transition-colors cursor-pointer rounded-lg ${
                    bighaBasis === 'shotok33'
                      ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                      : 'bg-[#F0F4F2] text-[#34443B] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
                  }`}
                >
                  ৩৩ শতক (১৪,৩৭৪.৮ বর্গফুট)
                </button>
              </div>
              <p className="text-[11px] text-[#4A5A52] leading-relaxed">
                {bighaBasis === 'sqft14400'
                  ? 'সরকারি স্ট্যান্ডার্ড: ১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট (১ কাঠা = ৭২০ বর্গফুট)।'
                  : 'আঞ্চলিক রূপ: ১ বিঘা = ৩৩ শতক = ১৪,৩৭৪.৮ বর্গফুট (১ কাঠা = ৭১৮.৭৪ বর্গফুট)।'}
              </p>
            </div>
          </div>

          {/* Number Type Toggle (Bangla vs English Digits) */}
          <div className="pt-3 border-t border-[#D5E4DB] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#084A2E]">সংখ্যার ধরণ:</span>
            <button
              type="button"
              onClick={() => setUseBanglaDigits(!useBanglaDigits)}
              className="text-xs font-medium px-3 py-1.5 border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#084A2E] transition-colors cursor-pointer rounded-lg"
            >
              {useBanglaDigits ? 'বাংলা সংখ্যা (১, ২, ৩)' : 'English Digits (1, 2, 3)'}
            </button>
          </div>
        </div>
      </div>

      {/* "মিশ্র রূপে" Card (Three Lines for Deeds & Records) */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5E4DB] pb-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="text-base font-bold text-[#084A2E] font-serif">
              মিশ্র রূপে ফলাফল (দলিল ও খতিয়ান লেখার জন্য)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#4A5A52] bg-[#F0F4F2] border border-[#D5E4DB] px-2 py-0.5 rounded-sm">
            দলিল / খতিয়ান উপযোগী
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Line 1: Bigha - Katha - Chotak */}
          <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#4A5A52] block">
                ১. বিঘা – কাঠা – ছটাক:
              </span>
              <div className="text-base sm:text-lg font-bold font-serif text-[#084A2E]">
                {useBanglaDigits ? mixedBigha.textBn : mixedBigha.textEn}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'mixed-bigha',
                  useBanglaDigits ? mixedBigha.textBn : mixedBigha.textEn
                )
              }
              className="self-start text-[11px] border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-2.5 py-1 text-[#084A2E] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg font-medium"
            >
              {copiedKey === 'mixed-bigha' ? (
                <>
                  <Check className="w-3 h-3 text-[#0B5D3B]" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Line 2: Kani - Gonda - Kora - Kranti - Til */}
          <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#4A5A52] block">
                ২. কানি – গণ্ডা – কড়া – ক্রান্তি – তিল:
              </span>
              <div className="text-base sm:text-lg font-bold font-serif text-[#084A2E]">
                {useBanglaDigits ? mixedKani.textBn : mixedKani.textEn}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'mixed-kani',
                  useBanglaDigits ? mixedKani.textBn : mixedKani.textEn
                )
              }
              className="self-start text-[11px] border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-2.5 py-1 text-[#084A2E] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg font-medium"
            >
              {copiedKey === 'mixed-kani' ? (
                <>
                  <Check className="w-3 h-3 text-[#0B5D3B]" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Line 3: Acre - Shotok */}
          <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#4A5A52] block">
                ৩. একর – শতক (শতাংশ):
              </span>
              <div className="text-base sm:text-lg font-bold font-serif text-[#084A2E]">
                {useBanglaDigits ? mixedAcre.textBn : mixedAcre.textEn}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'mixed-acre',
                  useBanglaDigits ? mixedAcre.textBn : mixedAcre.textEn
                )
              }
              className="self-start text-[11px] border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-2.5 py-1 text-[#084A2E] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg font-medium"
            >
              {copiedKey === 'mixed-acre' ? (
                <>
                  <Check className="w-3 h-3 text-[#0B5D3B]" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Results Grouped by Category */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5E4DB] pb-2">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif">
            সকল এককে ফলাফল (২৬টি একক)
          </h2>
          <div className="text-xs text-[#4A5A52] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
            <span>যেকোনো কার্ডে ক্লিক করে সেটিকে প্রধান উৎস একক হিসেবে নির্বাচন করতে পারেন।</span>
          </div>
        </div>

        {groups.map((grp) => {
          const groupUnits = UNITS.filter((u) => u.group === grp);
          return (
            <div
              key={grp}
              className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs"
            >
              <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-2.5">
                <span className="w-2.5 h-2.5 bg-[#0B5D3B] rounded-full" />
                <h3 className="text-sm font-bold text-[#084A2E] font-serif uppercase tracking-wider">
                  {UNIT_GROUP_LABELS[grp].bn} ({UNIT_GROUP_LABELS[grp].en})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {groupUnits.map((u) => {
                  const isSource = u.id === sourceUnit;
                  const convVal = parsed.isValid
                    ? convertLand(baseSqft, 'sqft', u.id, factors)
                    : 0;
                  const formattedDisplay = formatAreaNumber(convVal, useBanglaDigits);
                  const cleanCopyVal = getCleanCopyValue(convVal);

                  return (
                    <div
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectAsSource(u.id, convVal)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectAsSource(u.id, convVal);
                        }
                      }}
                      className={`p-3.5 border transition-all flex flex-col justify-between space-y-2.5 cursor-pointer select-none rounded-xl relative ${
                        isSource
                          ? 'border-[#F5A524] bg-[#FFFDF5] shadow-xs ring-1 ring-[#F5A524]'
                          : 'border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2]/60 hover:border-[#0B5D3B]/40'
                      }`}
                    >
                      {/* Top Row: Unit Name, Tags & Copy Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#084A2E] text-sm flex items-center gap-1.5">
                            <span>{u.bn}</span>
                            {isSource && (
                              <span className="text-[10px] bg-[#F5A524] text-white px-1.5 py-0.2 rounded-xs font-sans font-semibold">
                                উৎস
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#4A5A52]">{u.en}</div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {u.kind === 'derived' && (
                            <span
                              title="উৎস তালিকার ক্রম থেকে হিসাব করা, আনুষ্ঠানিক সংজ্ঞা নয়"
                              className="text-[10px] bg-[#F0F4F2] text-[#4A5A52] border border-[#D5E4DB] px-1.5 py-0.5 rounded-sm cursor-help"
                            >
                              হিসাব করা
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(u.id, cleanCopyVal);
                            }}
                            className="p-1 text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#D5E4DB]/40 rounded-sm transition-colors cursor-pointer"
                            title="মান কপি করুন"
                          >
                            {copiedKey === u.id ? (
                              <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Calculated Value */}
                      <div className="pt-1 border-t border-[#D5E4DB]/60 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-bold font-mono text-[#084A2E]">
                          {formattedDisplay}
                        </span>
                        <span className="text-[11px] text-[#4A5A52]">
                          {u.bn.split('/')[0].trim()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Regional Variations Warning / Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 text-xs text-amber-900 flex items-start space-x-3 rounded-2xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <div className="font-bold text-amber-950 text-sm font-serif">
            সতর্কবার্তা ও আঞ্চলিক পরিমাপের ভিন্নতা:
          </div>
          <p>
            বিঘা, কাঠা ও কানির মাপ অঞ্চলভেদে ভিন্ন হতে পারে। এখানে সরকারি প্রচলিত আদর্শ মান
            (১ বিঘা = ১৪,৪০০ বর্গফুট ও কানি = ১৭,২৮০ বর্গফুট) এবং বহুল ব্যবহৃত বিকল্প মান
            অন্তর্ভুক্ত করা হয়েছে। জমির দলিল, খতিয়ান বা সরকারি নথির মাপ সবসময় আগে স্থানীয়
            সাব-রেজিস্ট্রি অফিসের নথির সাথে মিলিয়ে নিন।
          </p>
        </div>
      </div>

      {/* "কেন দরকার" (Use Cases) Section */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 space-y-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
          <HelpCircle className="w-4 h-4 text-[#0B5D3B]" />
          <h2 className="text-base font-bold text-[#084A2E] font-serif uppercase tracking-wider">
            জমির মাপ রূপান্তরের প্রয়োজনীয়তা ও ব্যবহারের ক্ষেত্র
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs text-[#34443B] leading-relaxed">
          {/* Card 1: Deeds and Registration */}
          <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm font-serif">
              ১. জমির দলিল ও রেজিস্ট্রেশন
            </h3>
            <p>
              সাব-রেজিস্ট্রি অফিসে জমি ক্রয়-বিক্রয়ের সাফ-কবলা, হেবা বা বণ্টননামা দলিলে
              শতক, বিঘা বা একরের পরিমাপ প্রমিত মানদণ্ডে নির্ভুলভাবে রূপান্তর করতে হয়।
            </p>
          </div>

          {/* Card 2: Khatian & Porcha */}
          <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm font-serif">
              ২. খতিয়ান ও পর্চা মিলানো
            </h3>
            <p>
              CS, SA, RS, ও সিটি জরিপের খতিয়ানে উল্লেখিত আনা, গণ্ডা, কড়া বা শতকের
              হিসাব বর্তমান প্রমিত এককে মিলিয়ে জমি দখলের সঠিক পরিমাণ নিশ্চিত করা যায়।
            </p>
          </div>

          {/* Card 3: Buy & Sell */}
          <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm font-serif">
              ৩. জমি কেনাবেচা ও দাম যাচাই
            </h3>
            <p>
              কাঠা বা শতক প্রতি বাজার দর হিসাব করে পুরো প্লট, বিঘা বা একরের মোট মূল্য
              নির্ধারণ ও ক্রেতা-বিক্রেতার মধ্যে স্বচ্ছ হিসাব নিশ্চিত করতে সহায়তা করে।
            </p>
          </div>

          {/* Card 4: Plots & Surveys */}
          <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#084A2E] text-sm font-serif">
              ৪. প্লট, ফ্ল্যাট ও নকশা জরিপ
            </h3>
            <p>
              আমিন বা প্রফেশনাল সার্ভেয়ারের ফিতায় পরিমাপকৃত বর্গফুট, বর্গগজ বা বর্গলিংক
              থেকে শতক ও কাঠায় তাৎক্ষণিক রূপান্তর করে রাজউক বা পৌরসভার নকশা প্রস্তুত করা যায়।
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
          <HelpCircle className="w-4 h-4 text-[#0B5D3B]" />
          <h2 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
            {pageContent.faqHeading}
          </h2>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-[#0F1F17] leading-relaxed">
          {faqs.map((f, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="font-bold text-[#084A2E]">{f.question}</h3>
              <p className="text-[#34443B]">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="land-converter" />
    </div>
  );
};
