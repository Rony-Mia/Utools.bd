import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Binary,
  Calculator,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import {
  NumberBase,
  convertNumber,
  getStepExplanation,
  calculateTwosComplement,
  isValidBaseNumber
} from '../utils/numberSystem.ts';
import pageContent from '../../content/pages/number-system-converter.json';

type ActiveTab = 'converter' | 'twosComplement';

const BASE_CONFIGS: Array<{ base: NumberBase; name: string; english: string; hint: string }> = [
  { base: 10, name: 'ডেসিমাল (দশমিক)', english: 'Decimal', hint: '০ থেকে ৯ (ডিজিটাল সাধারণ সংখ্যা)' },
  { base: 2, name: 'বাইনারি', english: 'Binary', hint: 'শুধুমাত্র ০ এবং ১' },
  { base: 8, name: 'অক্টাল', english: 'Octal', hint: '০ থেকে ৭' },
  { base: 16, name: 'হেক্সাডেসিমেল', english: 'Hexadecimal', hint: '০ থেকে ৯ এবং A থেকে F' },
];

export const NumberSystemConverterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');

  // Multi-base synced state
  const [activeBase, setActiveBase] = useState<NumberBase>(10);
  const [inputValue, setInputValue] = useState<string>('25');

  // Step explanation selectors
  const [stepFromBase, setStepFromBase] = useState<NumberBase>(10);
  const [stepToBase, setStepToBase] = useState<NumberBase>(2);

  // 2's complement state
  const [complementInput, setComplementInput] = useState<number>(-25);
  const [bitWidth, setBitWidth] = useState<8 | 16>(8);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute conversion result across all bases
  const conversionResult = useMemo(() => {
    return convertNumber(inputValue, activeBase);
  }, [inputValue, activeBase]);

  // Compute step explanation
  const stepExplanation = useMemo(() => {
    return getStepExplanation(inputValue, stepFromBase, stepToBase);
  }, [inputValue, stepFromBase, stepToBase]);

  // Compute 2's complement
  const complementResult = useMemo(() => {
    return calculateTwosComplement(complementInput, bitWidth);
  }, [complementInput, bitWidth]);

  const handleInputChange = (val: string, base: NumberBase) => {
    setActiveBase(base);
    setInputValue(val);
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getBaseValue = (base: NumberBase): string => {
    if (!conversionResult.isValid) return '';
    switch (base) {
      case 2:
        return conversionResult.binary;
      case 8:
        return conversionResult.octal;
      case 10:
        return conversionResult.decimal;
      case 16:
        return conversionResult.hexadecimal;
    }
  };

  return (
    <>
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/number-system-converter"
        toolName="সংখ্যা পদ্ধতি ও আইসিটি কনভার্টার (Number System Converter)"
        categoryName="হিসাব ও ক্যালকুলেটর"
        categoryPath="/number-system-converter"
        faqs={pageContent.faqs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Navigation Breadcrumb bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরুন</span>
            </Link>
            <span className="text-xs text-[#4A5A52] hidden sm:inline">•</span>
            <span className="text-xs text-[#4A5A52] font-mono hidden sm:inline">CALC-ICT-01</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>HSC ICT ৩য় অধ্যায় • ১০০% ক্লায়েন্ট-সাইড • অফলাইন রেডি</span>
          </div>
        </div>

        {/* Heading Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
            <Binary className="w-3.5 h-3.5" />
            <span>HSC ICT ৩য় অধ্যায় • এডুকেশনাল ইউটিলিটি</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
            {pageContent.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed max-w-3xl">
            {pageContent.subtitle}
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="border-b border-[#D5E4DB] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'converter'
                ? 'border-[#0B5D3B] text-[#084A2E] bg-[#0B5D3B]/5'
                : 'border-transparent text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#F0F4F2]'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>সংখ্যা পদ্ধতি রূপান্তর ও সমাধান</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('twosComplement')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'twosComplement'
                ? 'border-[#0B5D3B] text-[#084A2E] bg-[#0B5D3B]/5'
                : 'border-transparent text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#F0F4F2]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>১ ও ২-এর পরিপূরক (2's Complement)</span>
          </button>
        </div>

        {/* TAB 1: Multi-Base Converter */}
        {activeTab === 'converter' && (
          <div className="space-y-8">
            {/* 4 Synchronized Input Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BASE_CONFIGS.map((cfg) => {
                const isSelected = activeBase === cfg.base;
                const value = isSelected ? inputValue : getBaseValue(cfg.base);
                const hasError = isSelected && !conversionResult.isValid;

                return (
                  <div
                    key={cfg.base}
                    className={`bg-[#FFFFFF] border p-5 rounded-2xl shadow-xs space-y-3 transition-all ${
                      isSelected
                        ? 'border-[#0B5D3B] ring-2 ring-[#0B5D3B]/20'
                        : 'border-[#D5E4DB] hover:border-[#0B5D3B]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#084A2E] block">
                          {cfg.name}
                        </span>
                        <span className="text-[10px] text-[#4A5A52] font-mono">
                          ভিত্তি {cfg.base} ({cfg.english})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#F0F4F2] text-[#084A2E] px-2 py-0.5 rounded">
                        Base {cfg.base}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(e.target.value, cfg.base)}
                        placeholder={`ভিত্তি ${cfg.base} সংখ্যা লিখুন...`}
                        className={`w-full px-3 py-2.5 border bg-[#FAFAF7] text-sm text-[#0F1F17] font-mono font-bold rounded-lg focus:outline-none transition-colors ${
                          hasError
                            ? 'border-[#f8b4b4] bg-[#fdf2f2]'
                            : 'border-[#D5E4DB] focus:border-[#0B5D3B]'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-[#4A5A52] truncate pr-2 text-[10px]">
                        {cfg.hint}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(value, `base-${cfg.base}`)}
                        disabled={!value || hasError}
                        className="p-1 rounded text-[#084A2E] hover:bg-[#F0F4F2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1 shrink-0"
                        title="কপি করুন"
                      >
                        {copiedKey === `base-${cfg.base}` ? (
                          <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === `base-${cfg.base}` ? 'কপি!' : 'কপি'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Message if any input is invalid */}
            {!conversionResult.isValid && (
              <div className="p-3 bg-[#fdf2f2] border border-[#f8b4b4] text-[#c8342a] text-xs rounded-xl flex items-center space-x-2">
                <span>⚠️ {conversionResult.error}</span>
              </div>
            )}

            {/* Step-by-Step Educational Solution Box (HSC ICT Style) */}
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-5 rounded-2xl shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[#0B5D3B]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
                    ধাপে ধাপে সমাধান গাইড (Step-by-Step Solution)
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#4A5A52]">পদ্ধতি বাছুন:</span>
                  <select
                    value={stepFromBase}
                    onChange={(e) => setStepFromBase(parseInt(e.target.value) as NumberBase)}
                    className="p-1.5 border border-[#D5E4DB] rounded-md bg-[#FAFAF7] font-semibold text-[#084A2E]"
                  >
                    <option value={10}>ডেসিমাল (১০)</option>
                    <option value={2}>বাইনারি (২)</option>
                    <option value={8}>অক্টাল (৮)</option>
                    <option value={16}>হেক্সাডেসিমেল (১৬)</option>
                  </select>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4A5A52]" />
                  <select
                    value={stepToBase}
                    onChange={(e) => setStepToBase(parseInt(e.target.value) as NumberBase)}
                    className="p-1.5 border border-[#D5E4DB] rounded-md bg-[#FAFAF7] font-semibold text-[#084A2E]"
                  >
                    <option value={2}>বাইনারি (২)</option>
                    <option value={8}>অক্টাল (৮)</option>
                    <option value={10}>ডেসিমাল (১০)</option>
                    <option value={16}>হেক্সাডেসিমেল (১৬)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-[#0B5D3B]/5 p-4 rounded-xl border border-[#0B5D3B]/20 space-y-1">
                  <h3 className="font-bold text-[#084A2E] font-serif text-sm sm:text-base">
                    {stepExplanation.title}
                  </h3>
                  <p className="text-[#34443B] leading-relaxed">
                    {stepExplanation.description}
                  </p>
                </div>

                <div className="bg-[#FAFAF7] border border-[#D5E4DB] p-4 sm:p-5 rounded-xl space-y-2.5 font-mono text-xs">
                  {stepExplanation.steps.length > 0 ? (
                    stepExplanation.steps.map((st, idx) => (
                      <p key={idx} className="text-[#0F1F17] leading-relaxed">
                        {st}
                      </p>
                    ))
                  ) : (
                    <p className="text-[#4A5A52] font-sans">
                      উপরে কোনো সংখ্যা লিখুন যাতে স্বয়ংক্রিয় সমাধান তৈরি হয়।
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 1's and 2's Complement */}
        {activeTab === 'twosComplement' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Input configuration (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 space-y-5 rounded-2xl shadow-xs">
                  <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
                    <Calculator className="w-4 h-4 text-[#0B5D3B]" />
                    <h2 className="font-bold text-[#084A2E] text-base font-serif">
                      ঋণাত্মক সংখ্যা ও পরিপূরক ইনপুট
                    </h2>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#084A2E]">
                      ডেসিমাল পূর্ণসংখ্যা (ধনাত্মক বা ঋণাত্মক)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={complementInput}
                      onChange={(e) => setComplementInput(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 border border-[#D5E4DB] bg-[#FAFAF7] font-mono font-bold text-sm text-[#0F1F17] rounded-lg focus:border-[#0B5D3B] focus:outline-none"
                    />
                    <span className="text-[11px] text-[#4A5A52]">
                      যেমন: -২৫, -৫, +৩৭ (HSC আইসিটি পরীক্ষায় ঋণাত্মক মান বেশি আসে)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#084A2E]">
                      রেজিস্টার বিট সাইজ (Bit Register)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBitWidth(8)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          bitWidth === 8
                            ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                            : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        ৮-বিট রেজিস্টার (8-bit)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBitWidth(16)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          bitWidth === 16
                            ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 text-[#084A2E] ring-1 ring-[#0B5D3B]'
                            : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        ১৬-বিট রেজিস্টার (16-bit)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 2's Complement Result & Steps (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#FFFFFF] border-2 border-[#0B5D3B] p-6 space-y-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono text-[#0B5D3B] font-bold">
                        HSC ICT ডিজিটাল লজিক হিসাব
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
                        ({complementResult.decimal})₁₀ এর ২-এর পরিপূরক ফলাফল
                      </h3>
                    </div>
                    <span className="bg-[#0B5D3B] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded">
                      {bitWidth}-Bit
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-[#FAFAF7] border border-[#D5E4DB] rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[#4A5A52] block text-[11px]">প্রকৃত বাইনারি মান:</span>
                        <span className="font-bold text-[#084A2E] text-sm">
                          {complementResult.trueBinary}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(complementResult.trueBinary, 'trueBin')}
                        className="p-1.5 rounded hover:bg-[#D5E4DB] text-[#084A2E] cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedKey === 'trueBin' ? <Check className="w-3.5 h-3.5 text-[#0B5D3B]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-3 bg-[#FAFAF7] border border-[#D5E4DB] rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[#4A5A52] block text-[11px]">১-এর পরিপূরক (1's Comp):</span>
                        <span className="font-bold text-[#084A2E] text-sm">
                          {complementResult.onesComplement}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(complementResult.onesComplement, 'onesComp')}
                        className="p-1.5 rounded hover:bg-[#D5E4DB] text-[#084A2E] cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedKey === 'onesComp' ? <Check className="w-3.5 h-3.5 text-[#0B5D3B]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-4 bg-[#0B5D3B]/10 border border-[#0B5D3B]/30 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[#0B5D3B] font-bold block text-[11px]">২-এর পরিপূরক (2's Comp):</span>
                        <span className="font-bold text-[#0B5D3B] text-base sm:text-lg">
                          {complementResult.twosComplement}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(complementResult.twosComplement, 'twosComp')}
                        className="p-1.5 rounded bg-white hover:bg-[#D5E4DB] text-[#0B5D3B] cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedKey === 'twosComp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#D5E4DB] text-xs">
                    <h4 className="font-bold text-[#084A2E] font-serif">ধাপে ধাপে সমাধান:</h4>
                    <div className="space-y-1 text-[#34443B] font-sans">
                      {complementResult.explanation.map((exp, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {exp}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Educational Reference Cheat-Sheet: 0 to 15 Equivalence Table */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Layers className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-base sm:text-xl font-bold text-[#084A2E] font-serif">
              ০ থেকে ১৫ পর্যন্ত চার সংখ্যা পদ্ধতির তুলনামূলক চার্ট
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-center border-collapse">
              <thead>
                <tr className="bg-[#F0F4F2] text-[#084A2E]">
                  <th className="p-2.5 border border-[#D5E4DB] font-bold">ডেসিমাল (১০)</th>
                  <th className="p-2.5 border border-[#D5E4DB] font-bold">বাইনারি (২)</th>
                  <th className="p-2.5 border border-[#D5E4DB] font-bold">অক্টাল (৮)</th>
                  <th className="p-2.5 border border-[#D5E4DB] font-bold">হেক্সাডেসিমেল (১৬)</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(16)].map((_, i) => (
                  <tr key={i} className="hover:bg-[#FAFAF7]">
                    <td className="p-2 border border-[#D5E4DB] font-bold text-[#084A2E]">{i}</td>
                    <td className="p-2 border border-[#D5E4DB]">{i.toString(2).padStart(4, '0')}</td>
                    <td className="p-2 border border-[#D5E4DB]">{i.toString(8)}</td>
                    <td className="p-2 border border-[#D5E4DB] font-bold text-[#0B5D3B]">{i.toString(16).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Dynamic FAQ Accordion */}
        <CmsDynamicContent content={pageContent} />

        {/* Related Tools */}
        <RelatedTools currentToolId="number-system-converter" />
      </div>
    </>
  );
};
