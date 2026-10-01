import React, { useState, useMemo, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  FileText,
  RotateCcw,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { ConversionMode } from '../types.ts';
import {
  bijoyToUnicode,
  unicodeToBijoy,
  SAMPLE_BIJOY_TEXT,
  SAMPLE_UNICODE_TEXT,
  CONVERSION_MAP
} from '../bijoyConverter.ts';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/converter.json';

export const ConverterPage: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('bijoy_to_unicode');
  const [inputText, setInputText] = useState<string>(SAMPLE_BIJOY_TEXT);
  const { copied, copy } = useCopyToClipboard();
  const [syncPulse, setSyncPulse] = useState<boolean>(false);
  const [showMappingTable, setShowMappingTable] = useState<boolean>(false);
  const [searchMap, setSearchMap] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live conversion using the exact verified logic
  const outputText = useMemo(() => {
    if (!inputText) return '';
    return mode === 'bijoy_to_unicode'
      ? bijoyToUnicode(inputText)
      : unicodeToBijoy(inputText);
  }, [inputText, mode]);

  // Word and character counts
  const inputCharCount = inputText.length;
  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputCharCount = outputText.length;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  // Swap conversion mode
  const handleSwapMode = () => {
    if (mode === 'bijoy_to_unicode') {
      setMode('unicode_to_bijoy');
      setInputText(outputText || SAMPLE_UNICODE_TEXT);
    } else {
      setMode('bijoy_to_unicode');
      setInputText(outputText || SAMPLE_BIJOY_TEXT);
    }
  };

  // Trigger manual re-conversion animation
  const handleReconvert = () => {
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 500);
  };

  // Copy to clipboard
  const handleCopy = () => {
    void copy(outputText);
  };

  // Download converted text as .txt
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `utools_${mode === 'bijoy_to_unicode' ? 'unicode' : 'bijoy'}_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload .txt file
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  // Generate verified character mappings directly from CONVERSION_MAP
  const verifiedMappings = useMemo(() => {
    const list = Object.entries(CONVERSION_MAP).map(([bijoyKey, banglaChar]) => ({
      bijoy: bijoyKey,
      unicode: banglaChar
    }));

    if (!searchMap) return list;
    const q = searchMap.toLowerCase();
    return list.filter(m => m.bijoy.toLowerCase().includes(q) || m.unicode.includes(q));
  }, [searchMap]);

  const faqs = pageContent.faqs || [];
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/converter"
        toolName="বিজয় ↔ ইউনিকোড টেক্সট কনভার্টার"
        categoryName="টেক্সট রূপান্তর"
        faqs={faqs}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#4A5A52]">
        <Link to="/" className="hover:text-[#084A2E] underline-offset-2 hover:underline">
          হোম
        </Link>
        <span>&gt;</span>
        <span className="text-[#4A5A52]">টেক্সট টুলস</span>
        <span>&gt;</span>
        <span className="text-[#084A2E] font-medium">বিজয় ↔ ইউনিকোড</span>
      </nav>

      {/* Page Header */}
      <section className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif">
          {pageContent.title}
        </h1>
        <p className="text-sm sm:text-base text-[#4A5A52] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </section>

      {/* Mode Toggle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5E4DB] pb-4">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => setMode('bijoy_to_unicode')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
              mode === 'bijoy_to_unicode'
                ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                : 'bg-[#FFFFFF] text-[#4A5A52] border-[#D5E4DB] hover:text-[#084A2E]'
            }`}
          >
            বিজয় (ANSI) → ইউনিকোড
          </button>

          <button
            type="button"
            onClick={() => setMode('unicode_to_bijoy')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium border transition-colors cursor-pointer flex items-center space-x-1.5 ${
              mode === 'unicode_to_bijoy'
                ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                : 'bg-[#FFFFFF] text-[#4A5A52] border-[#D5E4DB] hover:text-[#084A2E]'
            }`}
          >
            <span>ইউনিকোড → বিজয় (ANSI)</span>
            <span className="text-[10px] px-1 py-0.2 bg-[#D5E4DB] text-[#084A2E] rounded-md font-semibold">
              বেটা
            </span>
          </button>
        </div>

        {/* Small Swap Button */}
        <button
          type="button"
          onClick={handleSwapMode}
          className="inline-flex items-center px-3 py-1.5 text-xs text-[#084A2E] hover:text-[#0B5D3B] bg-[#FFFFFF] border border-[#D5E4DB] transition-colors cursor-pointer rounded-lg"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5 text-[#0B5D3B]" />
          <span>মোড উল্টান</span>
        </button>
      </div>

      {/* Two Side-by-Side Panels */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 items-stretch">
          {/* Left Panel: Input */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 flex flex-col justify-between rounded-2xl">
            <div>
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D5E4DB]">
                <span className="text-xs sm:text-sm font-bold text-[#084A2E] font-serif">
                  {mode === 'bijoy_to_unicode'
                    ? 'ইনপুট: SUTONNYMJ / ANSI টেক্সট'
                    : 'ইনপুট: আধুনিক ইউনিকোড (বাংলা)'}
                </span>
                <div className="text-[11px] font-mono text-[#4A5A52] flex items-center space-x-2">
                  <span>বর্ণ: {inputCharCount}</span>
                  <span className="text-[#D5E4DB]">|</span>
                  <span>শব্দ: {inputWordCount}</span>
                </div>
              </div>

              {/* Input Textarea */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === 'bijoy_to_unicode'
                    ? 'সুতন্বীএমজে বা বিজয় ANSI ফন্টে লেখা টেক্সট এখানে পেস্ট করুন...'
                    : 'ইউনিকোড বাংলা টেক্সট এখানে পেস্ট বা টাইপ করুন...'
                }
                rows={12}
                className={`w-full p-3 bg-[#F0F4F2]/40 border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] leading-relaxed resize-y min-h-[280px]  rounded-2xl ${
                  mode === 'bijoy_to_unicode' ? 'font-mono' : 'font-sans'
                }`}
              />
            </div>

            {/* Left Panel Footer Buttons */}
            <div className="pt-3 border-t border-[#D5E4DB] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() =>
                    setInputText(mode === 'bijoy_to_unicode' ? SAMPLE_BIJOY_TEXT : SAMPLE_UNICODE_TEXT)
                  }
                  className="text-[#084A2E] hover:text-[#0B5D3B] flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>নমুনা টেক্সট যোগ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-[#c8342a] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg"
                >
                  <Upload className="w-3.5 h-3.5 text-[#084A2E]" />
                  <span>ফাইল আপলোড (.txt)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Center Swap Button */}
          <div className="flex sm:hidden justify-center my-1">
            <button
              type="button"
              onClick={handleSwapMode}
              title="মোড পরিবর্তন করুন"
              className="w-9 h-9 rounded-full border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#0B5D3B] flex items-center justify-center shadow-sm cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 flex flex-col justify-between rounded-2xl">
            <div>
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D5E4DB]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-bold text-[#084A2E] font-serif">
                    {mode === 'bijoy_to_unicode'
                      ? 'আউটপুট: আধুনিক ইউনিকোড (বাংলা)'
                      : 'আউটপুট: SUTONNYMJ / ANSI টেক্সট'}
                  </span>
                  <span className="inline-flex items-center text-[11px] text-[#0B5D3B] font-sans font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full bg-[#0B5D3B] mr-1 ${syncPulse ? 'scale-150' : ''}`}></span>
                    স্বয়ংক্রিয় সিঙ্কড
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[#4A5A52] flex items-center space-x-2">
                  <span>বর্ণ: {outputCharCount}</span>
                  <span className="text-[#D5E4DB]">|</span>
                  <span>শব্দ: {outputWordCount}</span>
                </div>
              </div>

              {/* Output Textarea */}
              <textarea
                readOnly
                value={outputText}
                placeholder="রূপান্তরিত ফলাফল এখানে রিয়েল-টাইমে প্রদর্শিত হবে..."
                rows={12}
                className={`w-full p-3 bg-[#F0F4F2]/20 border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none leading-relaxed resize-y min-h-[280px]  rounded-2xl ${
                  mode === 'bijoy_to_unicode' ? 'font-sans' : 'font-mono'
                } ${syncPulse ? 'ring-1 ring-[#0B5D3B]' : ''}`}
              />
            </div>

            {/* Right Panel Footer Buttons */}
            <div className="pt-3 border-t border-[#D5E4DB] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleReconvert}
                  className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] flex items-center space-x-1 transition-colors cursor-pointer rounded-lg"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-[#084A2E] ${syncPulse ? 'animate-spin' : ''}`} />
                  <span>পুনরায় রূপান্তর</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!outputText}
                  className={`border border-[#D5E4DB] px-2.5 py-1 flex items-center space-x-1 transition-colors ${
                    outputText
                      ? 'bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#0F1F17] cursor-pointer'
                      : 'bg-[#D5E4DB]/30 text-[#4A5A52] cursor-not-allowed'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#084A2E]" />
                  <span>ডাউনলোড (.txt)</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!outputText}
                  className={`px-4 py-1.5 font-medium flex items-center space-x-1.5 transition-colors ${
                    copied
                      ? 'bg-[#084A2E] text-[#FFFFFF]'
                      : outputText
                      ? 'bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] cursor-pointer'
                      : 'bg-[#D5E4DB]/50 text-[#4A5A52] cursor-not-allowed'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>কপি হয়েছে ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Center Indicator / Direction Arrow Button (Desktop & Tablet) */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={handleSwapMode}
            title="মোড পরিবর্তন করুন"
            className="w-10 h-10 rounded-full border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] text-[#0B5D3B] flex items-center justify-center transition-all hover:scale-105 shadow-sm cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accuracy & Notes Info Box */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-4 rounded-2xl">
        <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
          <Info className="w-4 h-4 text-[#0B5D3B]" />
          <h2 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
            নির্ভুলতা ও সীমাবদ্ধতা নির্দেশিকা (Accuracy & Notes)
          </h2>
        </div>

        <ul className="text-xs sm:text-sm text-[#0F1F17] space-y-2.5 leading-relaxed list-disc list-inside">
          <li>
            <strong className="font-semibold text-[#084A2E]">সমর্থিত ফন্ট পরিবার:</strong> SutonnyMJ, Boishakhi, Sutonny, ইত্যাদি বিজয় ANSI এনকোডিংয়ের যে কোনো ফন্টের লেখা সম্পূর্ণ নির্ভুলভাবে ইউনিকোডে রূপান্তর করা সম্ভব।
          </li>
          <li>
            <strong className="font-semibold text-[#084A2E]">স্বয়ংক্রিয় যুক্তাক্ষর ও কার স্থানান্তর:</strong> বাংলায় একার (ে), ই-কার (ি), এবং ঐ-কার (ৈ)-এর মতো প্রি-কারগুলো টাইপিংয়ে পূর্বে আসলেও ইউনিকোড স্পেসিফিকেশন অনুযায়ী ব্যঞ্জনের পরবর্তী সঠিক স্থানে সাজানো হয়।
          </li>
          <li>
            <strong className="font-semibold text-[#084A2E]">জটিল যুক্তবর্ণ হ্যান্ডলিং:</strong> ক্ষ, জ্ঞ, ত্ত, ঙ্ক, ঙ্গ, ত্র, ভ্র, ষ্ণ সহ প্রায় শতাধিক জটিল বাংলা যুক্তবর্ণ ও রেফ স্বয়ংক্রিয়ভাবে সঠিক ব্যাকরণগত ক্রমানুসারে প্রক্রিয়াভুক্ত হয়।
          </li>
          <li>
            <strong className="font-semibold text-[#084A2E]">গোপনীয়তা নিশ্চয়তা:</strong> সমস্ত কনভার্সন ফাংশন সরাসরি আপনার ব্রাউজারের জাভাস্ক্রিপ্টে কার্যকর হয়। আপনার কোনো ডেটা কোথাও আপলোড বা সেভ হয় না।
          </li>
        </ul>
      </section>

      {/* Verified Character Mapping Reference (Generated FROM CONVERSION_MAP) */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E4DB] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#084A2E] font-serif flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
              <span>কনভার্সন ম্যাপ রেফারেন্স (CONVERSION_MAP ভিত্তিক ক্যারেক্টার টেবিল)</span>
            </h3>
            <p className="text-xs text-[#4A5A52] mt-0.5">
              প্রকৃত কনভার্সন ম্যাপিং টেবিল থেকে সরাসরি জেনারেট করা তালিকা
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchMap}
              onChange={(e) => setSearchMap(e.target.value)}
              placeholder="অক্ষর বা কি খুঁজুন..."
              className="px-2.5 py-1 text-xs bg-[#F0F4F2] border border-[#D5E4DB] focus:outline-none focus:border-[#0B5D3B] rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowMappingTable(!showMappingTable)}
              className="text-xs border border-[#D5E4DB] bg-[#F0F4F2] px-2.5 py-1 text-[#084A2E] flex items-center space-x-1 cursor-pointer rounded-lg"
            >
              <span>{showMappingTable ? 'লুকান' : 'প্রদর্শন করুন'}</span>
              {showMappingTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showMappingTable && (
          <div className="pt-4 space-y-3">
            <div className="max-h-72 overflow-y-auto border border-[#D5E4DB]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0F4F2] text-[#084A2E] border-b border-[#D5E4DB] sticky top-0">
                  <tr>
                    <th className="p-2.5 font-mono">Bijoy (SutonnyMJ কি)</th>
                    <th className="p-2.5 font-sans">ইউনিকোড আউটপুট</th>
                    <th className="p-2.5 font-mono text-[#4A5A52]">ইউনিকোড কোডপয়েন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E4DB]">
                  {verifiedMappings.slice(0, 80).map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F0F4F2]/50">
                      <td className="p-2 font-mono text-[#084A2E] font-medium bg-[#F0F4F2]/30">
                        {item.bijoy}
                      </td>
                      <td className="p-2 font-sans text-base text-[#0F1F17]">
                        {item.unicode}
                      </td>
                      <td className="p-2 font-mono text-[#4A5A52]">
                        {Array.from(item.unicode)
                          .map((c: string) => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'))
                          .join(' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#4A5A52] font-mono text-right">
              মোট {verifiedMappings.length} টি এনকোডিং ম্যাপিং লোড করা হয়েছে
            </p>
          </div>
        )}
      </section>

      {/* Dynamic CMS Sections (FAQ, Features, Guides, Markdown, etc.) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="converter" />
    </div>
  );
};
