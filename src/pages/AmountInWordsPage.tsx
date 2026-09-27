import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  FileText,
  CreditCard,
  FileCheck,
  Receipt,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Coins
} from 'lucide-react';
import {
  convertAmountToBengaliWords,
  toBanglaDigits,
  formatBangladeshiCurrency
} from '../amountToWords.ts';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { RelatedTools } from '../components/RelatedTools.tsx';

interface PresetItem {
  label: string;
  value: string;
  description: string;
}

const PRESET_AMOUNTS: PresetItem[] = [
  { label: '১,০০০ ৳', value: '1000', description: 'এক হাজার' },
  { label: '৫,০০০ ৳', value: '5000', description: 'পাঁচ হাজার' },
  { label: '১০,০০০ ৳', value: '10000', description: 'দশ হাজার' },
  { label: '৫০,০০০ ৳', value: '50000', description: 'পঞ্চাশ হাজার' },
  { label: '১,০০,০০০ ৳', value: '100000', description: 'এক লক্ষ' },
  { label: '১০,০০,০০০ ৳', value: '1000000', description: 'দশ লক্ষ' },
  { label: '১,০০,০০,০০০ ৳', value: '10000000', description: 'এক কোটি' },
  { label: '১৫৫০.৫০ ৳', value: '1550.50', description: 'পয়সাসহ উদাহরণ' }
];

export const AmountInWordsPage: React.FC = () => {
  // Input state (English or Bengali digits supported)
  const [inputValue, setInputValue] = useState<string>('1550.50');

  // Copy notification states
  const { copied: copiedPrimary, copy: copyPrimary } = useCopyToClipboard();
  const { copied: copiedColloquial, copy: copyColloquial } = useCopyToClipboard();

  // Active view style toggle for amounts with colloquial options
  const [useColloquialIfAvailable, setUseColloquialIfAvailable] = useState<boolean>(false);

  // Compute conversion result in real-time
  const result = useMemo(() => {
    return convertAmountToBengaliWords(inputValue);
  }, [inputValue]);

  // Copy helper
  const handleCopy = (text: string, isColloquial = false) => {
    void (isColloquial ? copyColloquial(text) : copyPrimary(text));
  };

  // Reset helper
  const handleReset = () => {
    setInputValue('');
  };

  // Set preset
  const handleSelectPreset = (val: string) => {
    setInputValue(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>টাকা কথায় রূপান্তর — Taka to Words Converter | Utools.bd</title>
        <meta
          name="description"
          content="যেকোনো সংখ্যা বা টাকার পরিমাণ তাৎক্ষণিক শুদ্ধ বাংলা ও ইংরেজিতে কথায় লিখুন। ব্যাংক চেক, রসিদ ও দাপ্তরিক ভাউচারের জন্য সেরা টুল।"
        />
        <link rel="canonical" href="https://utools.bd/amount-in-words" />
        <meta
          property="og:title"
          content="টাকা কথায় রূপান্তর — Taka to Words Converter | Utools.bd"
        />
        <meta
          property="og:description"
          content="যেকোনো সংখ্যা বা টাকার পরিমাণ তাৎক্ষণিক শুদ্ধ বাংলা ও ইংরেজিতে কথায় লিখুন। ব্যাংক চেক, রসিদ ও দাপ্তরিক ভাউচারের জন্য সেরা টুল।"
        />
        <meta property="og:url" content="https://utools.bd/amount-in-words" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="টাকা কথায় রূপান্তর | Utools.bd" />
        <meta
          name="twitter:description"
          content="যেকোনো সংখ্যা বা টাকার পরিমাণ শুদ্ধ বাংলা ও ইংরেজিতে কথায় লেখার অনলাইন টুল।"
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
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

      {/* Page Title & Description */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#084A2E] font-serif tracking-tight">
          টাকা → কথায় কনভার্টার (Amount to Bengali Words)
        </h1>
        <p className="text-sm text-[#34443B] max-w-3xl leading-relaxed">
          ব্যাংক চেক, জমির দলিল, স্ট্যাম্প পেপার, ভাউচার ও মানি রিসিটে লেখার জন্য যেকোনো টাকার পরিমাণ
          (হাজার, লক্ষ, কোটি ও পয়সাসহ) <strong>নির্ভুল বাংলা কথায় রূপান্তর</strong> করুন। ইংরেজি বা বাংলা যেকোনো সংখ্যায় টাইপ করা মাত্রই স্বয়ংক্রিয় রেজাল্ট তৈরি হয়।
        </p>
      </div>

      {/* Main Grid: Live Input on Left / Top, Converted Output on Right / Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Number Input & Quick Presets (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Live Amount Input Box */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-4 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-[#0B5D3B]" />
                <span>টাকার পরিমাণ লিখুন (সংখ্যায়)</span>
              </span>
              {inputValue && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-[#084A2E] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>

            {/* Input field with ৳ symbol */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-lg font-bold text-[#0B5D3B] select-none font-serif">
                  ৳
                </span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="যেমন: ১৫৫০.৫০ বা 10000"
                  autoFocus
                  className="w-full pl-9 pr-4 py-3.5 bg-[#F0F4F2]/30 border border-[#D5E4DB] text-lg sm:text-xl font-mono text-[#084A2E] font-semibold focus:outline-none focus:border-[#0B5D3B] focus:bg-[#FFFFFF] placeholder:text-[#4A5A52]/50 rounded-lg"
                />
              </div>
              <div className="text-[11px] text-[#4A5A52] flex flex-wrap justify-between items-center gap-1">
                <span>বাংলা (০-৯) বা ইংরেজি (0-9) উভয় সংখ্যাই সমর্থিত</span>
                {result.isValid && result.normalizedNumber !== undefined && (
                  <span className="font-mono font-medium text-[#0B5D3B]">
                    {result.formattedBengaliNumber} ৳
                  </span>
                )}
              </div>
            </div>

            {/* Validation Notice / Warning */}
            {result.warning && (
              <div className="p-3 bg-[#fffbeb] border border-[#fde68a] text-[#92400e] text-xs flex items-start space-x-2 rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{result.warning}</span>
              </div>
            )}

            {/* Error Message if Invalid */}
            {!result.isValid && result.error && (
              <div className="p-3 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-start space-x-2 rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{result.error}</span>
              </div>
            )}
          </div>

          {/* Card 2: Quick Presets */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-3 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
                <span>কুইক প্রিসেট (Quick Presets)</span>
              </span>
              <span className="text-[11px] font-medium text-[#4A5A52]">ক্লিক করে বসান</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 pt-1">
              {PRESET_AMOUNTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelectPreset(item.value)}
                  className={`text-left p-2.5 border transition-all cursor-pointer ${
                    inputValue === item.value
                      ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E]'
                      : 'bg-[#F0F4F2]/50 hover:bg-[#D5E4DB]/40 border-[#D5E4DB] text-[#0F1F17]'
                  }`}
                >
                  <div className="font-mono font-bold text-xs">{item.label}</div>
                  <div
                    className={`text-[11px] font-medium truncate ${
                      inputValue === item.value ? 'text-[#FFFFFF]/80' : 'text-[#4A5A52]'
                    }`}
                  >
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Output Words & Formatting Details (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 3: Primary Words Display Card */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-5 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-[#0B5D3B]" />
                <span>কথায় রূপান্তর (In Words)</span>
              </span>

              {result.isValid && result.words && (
                <button
                  type="button"
                  onClick={() => handleCopy(result.words || '')}
                  className="text-xs border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/60 px-3 py-1.5 text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer font-medium rounded-lg"
                >
                  {copiedPrimary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />
                      <span className="text-[#0B5D3B]">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>লেখা কপি করুন</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Display Words Box */}
            {result.isValid && result.words ? (
              <div className="space-y-4">
                {/* Highlighted Result Box */}
                <div className="p-5 sm:p-6 bg-[#F0F4F2]/50 border-2 border-[#0B5D3B]/40 relative rounded-2xl">
                  <div className="text-xs font-semibold text-[#0B5D3B] uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                    <span>প্রমিত ব্যাংক ও সরকারি রূপ:</span>
                    <span className="text-[10px] bg-[#0B5D3B] text-[#FFFFFF] px-2 py-0.5 font-sans font-medium">
                      অফিশিয়াল
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#084A2E] leading-relaxed tracking-tight">
                    {result.words}
                  </div>
                </div>

                {/* Colloquial / Shoto Variant (if available, e.g. 1550 -> "পনেরশ পঞ্চাশ") */}
                {result.colloquialWords && (
                  <div className="p-4 bg-[#FFFFFF] border border-[#D5E4DB] space-y-2 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#4A5A52]">
                        কথ্য / প্রচলিত শতক রূপ (Colloquial):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.colloquialWords || '', true)}
                        className="text-[11px] border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2 py-0.5 text-[#084A2E] flex items-center space-x-1 transition-colors cursor-pointer font-medium rounded-lg"
                      >
                        {copiedColloquial ? (
                          <>
                            <Check className="w-3 h-3 text-[#0B5D3B]" />
                            <span className="text-[#0B5D3B]">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-base sm:text-lg font-bold font-serif text-[#0F1F17]">
                      {result.colloquialWords}
                    </div>
                  </div>
                )}

                {/* Numbers Comparison Breakdown Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3 space-y-1 rounded-2xl">
                    <span className="text-[11px] font-medium text-[#4A5A52] block">বাংলাদেশি সংখ্যা পদ্ধতি:</span>
                    <span className="text-base font-bold font-mono text-[#084A2E]">
                      {result.formattedBengaliNumber} ৳
                    </span>
                    <span className="text-[11px] font-medium text-[#4A5A52] block">
                      (কমা ফরম্যাট: হাজার, লক্ষ, কোটি)
                    </span>
                  </div>

                  <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3 space-y-1 rounded-2xl">
                    <span className="text-[11px] font-medium text-[#4A5A52] block">আন্তর্জাতিক ইংরেজি সংখ্যা:</span>
                    <span className="text-base font-bold font-mono text-[#084A2E]">
                      {result.formattedEnglishNumber} BDT
                    </span>
                    <span className="text-[11px] font-medium text-[#4A5A52] block">
                      (English Numeric Equivalent)
                    </span>
                  </div>
                </div>

                {/* Quick Copy Variations (With Matra / Without Matra) */}
                <div className="pt-2 border-t border-[#D5E4DB] flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#4A5A52] font-medium">কুইক কপি অপশন:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(result.words || '')}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/60 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer rounded-lg"
                  >
                    &quot;মাত্র&quot; সহ কপি
                  </button>
                  {result.wordsWithoutMatra && (
                    <button
                      type="button"
                      onClick={() => handleCopy(result.wordsWithoutMatra || '')}
                      className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/60 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer rounded-lg"
                    >
                      &quot;মাত্র&quot; ছাড়া কপি
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(`${result.formattedBengaliNumber} ৳`)}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/60 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer font-mono rounded-lg"
                  >
                    সংখ্যায় (৳) কপি
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-[#4A5A52] space-y-2">
                <Coins className="w-10 h-10 mx-auto text-[#D5E4DB]" />
                <p>বামে টাকার পরিমাণ সংখ্যায় লিখলে এখানে স্বয়ংক্রিয়ভাবে বাংলায় কথায় রূপান্তর হবে।</p>
              </div>
            )}
          </div>

          {/* Quick Guidance Tip */}
          <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-4 text-xs space-y-1.5 rounded-2xl">
            <div className="font-semibold text-[#084A2E] flex items-center space-x-1.5 font-serif">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B]" />
              <span>বাংলাদেশি নাম্বারিং ব্যবস্থার বৈশিষ্ট্য:</span>
            </div>
            <p className="text-[#34443B] leading-relaxed">
              আন্তর্জাতিক পশ্চিমা মিলিয়ন বা বিলিয়নের পরিবর্তে এখানে <strong>হাজার, লক্ষ এবং কোটি</strong> পদ্ধতি
              অনুসরণ করা হয় (যেমন: ১০ লক্ষ = ১ মিলিয়ন, ১ কোটি = ১০ মিলিয়ন)। এটি সরকারি অডিট, বাংলাদেশ ব্যাংক এবং সাব-রেজিস্ট্রার অফিসের শতভাগ প্রমিত নীতিমালার সাথে সংগতিপূর্ণ।
            </p>
          </div>
        </div>
      </div>

      {/* "কেন দরকার" (Use Cases) Section */}
      <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 space-y-5 rounded-2xl">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
          <HelpCircle className="w-4 h-4 text-[#0B5D3B]" />
          <h3 className="text-sm font-bold text-[#084A2E] font-serif uppercase tracking-wider">
            টাকা কথায় লেখার প্রয়োজনীয়তা ও ব্যবহারের ক্ষেত্র (Why Amount in Words is Required)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs text-[#34443B] leading-relaxed">
          {/* Card 1: Cheques */}
          <div className="bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#084A2E] text-sm font-serif">১. ব্যাংক চেক লিখন</h4>
            <p>
              ব্যাংক চেকে সংখ্যায় লেখার পাশাপাশি কথায় লেখা বাধ্যতামূলক। সংখ্যা ও কথায় অমিল হলে চেক বাতিল হয়ে যায়। এই কনভার্টারে বানান ও অর্থের শতভাগ শুদ্ধতা নিশ্চিত হয়।
            </p>
          </div>

          {/* Card 2: Deeds and Stamp Papers */}
          <div className="bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#084A2E] text-sm font-serif">২. দলিল ও স্ট্যাম্প পেপার</h4>
            <p>
              জমি-জমা ক্রয়-বিক্রয়, ফ্ল্যাটের বায়নাপত্র, হেবা দলিল বা স্ট্যাম্প চুক্তিতে মূল্যের পরিমাণ অঙ্কে ও কথায় নিখুঁতভাবে লেখা আইনি সুরক্ষার অপরিহার্য শর্ত।
            </p>
          </div>

          {/* Card 3: Vouchers */}
          <div className="bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#084A2E] text-sm font-serif">৩. অফিসিয়াল ভাউচার ও বিল</h4>
            <p>
              সরকারি দপ্তর, বহুজাতিক প্রতিষ্ঠান ও যেকোনো ব্যবসার ক্যাশ ও ব্যাংক ভাউচারে অডিট স্বচ্ছতা বজায় রাখতে সর্বদা অংক কথায় লিপিবদ্ধ করতে হয়।
            </p>
          </div>

          {/* Card 4: Money Receipts */}
          <div className="bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 flex items-center justify-center text-[#0B5D3B] rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#084A2E] text-sm font-serif">৪. মানি রিসিট ও ক্যাশ মেমো</h4>
            <p>
              দোকান বা ব্যবসা প্রতিষ্ঠানের ইনভয়েস ও রসিদে &quot;টাকা বুঝে পেলাম&quot; সেকশনে কথায় লেখা থাকলে কোনো পক্ষ পরবর্তীতে টাকার অংক পরিবর্তন বা জাল করার সুযোগ পায় না।
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="amount-in-words" />
    </div>
  );
};
