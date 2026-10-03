import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import {
  ShieldCheck,
  Coins,
  Scale,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Copy,
  Check,
  Printer,
  HelpCircle,
  Percent,
  Calculator,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  traditionalToGrams,
  gramsToTraditional,
  traditionalToTotalBhori,
  calculateGoldPrice,
  calculateOldGoldTrade,
  BHORI_IN_GRAMS,
  GRAMS_PER_AANA,
  GRAMS_PER_ROTI,
  KARAT_PRESETS,
  GoldKarat,
  MakingChargeType,
  OldGoldTradeType
} from '../utils/goldCalculator.ts';
import { toBanglaNum } from '../utils/bnDigits.ts';
import { convertAmountToBengaliWords } from '../amountToWords.ts';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/gold-calculator.json';

type ActiveTab = 'price' | 'converter' | 'exchange';
type WeightInputMode = 'traditional' | 'grams';

export const GoldCalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('price');
  const [weightMode, setWeightMode] = useState<WeightInputMode>('traditional');

  // ── Traditional Weight Inputs ──
  const [bhoriInput, setBhoriInput] = useState<number>(1);
  const [aanaInput, setAanaInput] = useState<number>(0);
  const [rotiInput, setRotiInput] = useState<number>(0);
  const [pointInput, setPointInput] = useState<number>(0);

  // ── Grams Input ──
  const [gramsInput, setGramsInput] = useState<number>(11.664);

  // ── Karat & Price Inputs ──
  const [selectedKarat, setSelectedKarat] = useState<GoldKarat>('22k');
  const [customPricePerBhori, setCustomPricePerBhori] = useState<number>(
    KARAT_PRESETS['22k'].defaultPricePerBhori
  );

  // ── Making Charge & VAT Inputs ──
  const [makingChargeType, setMakingChargeType] = useState<MakingChargeType>('per_bhori');
  const [makingChargeValue, setMakingChargeValue] = useState<number>(4000);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [vatPercent, setVatPercent] = useState<number>(5);

  // ── Old Gold Trade State ──
  const [tradeType, setTradeType] = useState<OldGoldTradeType>('exchange');
  const [customDeductionPercent, setCustomDeductionPercent] = useState<number>(10);
  const [stoneWeightGrams, setStoneWeightGrams] = useState<number>(0);

  // ── Copy / Print Feedback ──
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);

  // Handle Karat preset change
  const handleKaratChange = (karat: GoldKarat) => {
    setSelectedKarat(karat);
    setCustomPricePerBhori(KARAT_PRESETS[karat].defaultPricePerBhori);
  };

  // Synchronize weights based on active mode
  const effectiveWeightInBhori = useMemo(() => {
    if (weightMode === 'traditional') {
      return traditionalToTotalBhori(bhoriInput, aanaInput, rotiInput, pointInput);
    }
    return (gramsInput || 0) / BHORI_IN_GRAMS;
  }, [weightMode, bhoriInput, aanaInput, rotiInput, pointInput, gramsInput]);

  const effectiveWeightInGrams = useMemo(() => {
    if (weightMode === 'traditional') {
      return traditionalToGrams(bhoriInput, aanaInput, rotiInput, pointInput);
    }
    return Math.round((gramsInput || 0) * 1000) / 1000;
  }, [weightMode, bhoriInput, aanaInput, rotiInput, pointInput, gramsInput]);

  // Handle grams change and auto-populate traditional fields
  const handleGramsChange = (newGrams: number) => {
    setGramsInput(newGrams);
    const trad = gramsToTraditional(newGrams);
    setBhoriInput(trad.bhori);
    setAanaInput(trad.aana);
    setRotiInput(trad.roti);
    setPointInput(trad.point);
  };

  // Handle traditional change and update gramsInput
  const handleTraditionalChange = (
    newBhori: number,
    newAana: number,
    newRoti: number,
    newPoint: number
  ) => {
    setBhoriInput(newBhori);
    setAanaInput(newAana);
    setRotiInput(newRoti);
    setPointInput(newPoint);
    const g = traditionalToGrams(newBhori, newAana, newRoti, newPoint);
    setGramsInput(g);
  };

  // Calculation for New Gold Purchase
  const purchaseResult = useMemo(() => {
    return calculateGoldPrice({
      weightInBhori: effectiveWeightInBhori,
      pricePerBhori: customPricePerBhori,
      makingChargeType,
      makingChargeValue,
      vatPercent: includeVat ? vatPercent : 0
    });
  }, [
    effectiveWeightInBhori,
    customPricePerBhori,
    makingChargeType,
    makingChargeValue,
    includeVat,
    vatPercent
  ]);

  // Calculation for Old Gold Trade
  const tradeResult = useMemo(() => {
    return calculateOldGoldTrade({
      weightInBhori: effectiveWeightInBhori,
      pricePerBhori: customPricePerBhori,
      tradeType,
      deductionPercent: customDeductionPercent,
      stoneWeightGrams
    });
  }, [
    effectiveWeightInBhori,
    customPricePerBhori,
    tradeType,
    customDeductionPercent,
    stoneWeightGrams
  ]);

  // Memo Reference & Print Timestamp
  const [memoRefNumber] = useState(() => {
    const timestamp = Date.now().toString().slice(-6);
    return `UBD-GOLD-${timestamp}`;
  });

  const [printTimestamp] = useState(() => {
    try {
      const now = new Date();
      return `${now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })} • ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  });

  // Convert total amount to Bengali words for receipt
  const amountInWordsText = useMemo(() => {
    try {
      const amount = activeTab === 'exchange' ? tradeResult.netPayout : purchaseResult.totalPrice;
      const res = convertAmountToBengaliWords(Math.round(amount).toString());
      return res.isValid ? res.words : '';
    } catch {
      return '';
    }
  }, [activeTab, tradeResult.netPayout, purchaseResult.totalPrice]);

  // Copy receipt text to clipboard
  const handleCopyReceipt = () => {
    const karatInfo = KARAT_PRESETS[selectedKarat];
    const text = `=== Utools.bd স্বর্ণের হিসাব রশিদ ===
গহনার মান: ${karatInfo.label} (হলমার্ক ${karatInfo.hallmarkCode})
স্বর্ণের ওজন: ${toBanglaNum(effectiveWeightInBhori.toFixed(3))} ভরি (${toBanglaNum(effectiveWeightInGrams.toFixed(3))} গ্রাম)
প্রতি ভরির দর: ৳${toBanglaNum(customPricePerBhori.toLocaleString('en-IN'))}
----------------------------------
খাঁটি সোনার মূল্য: ৳${toBanglaNum(purchaseResult.goldBasePrice.toLocaleString('en-IN'))}
মজুরি (মেকিং চার্জ): ৳${toBanglaNum(purchaseResult.makingCharge.toLocaleString('en-IN'))}
সরকারি ভ্যাট (${toBanglaNum(includeVat ? vatPercent : 0)}%): ৳${toBanglaNum(purchaseResult.vatAmount.toLocaleString('en-IN'))}
==================================
সর্বমোট প্রদেয় বিল: ৳${toBanglaNum(purchaseResult.totalPrice.toLocaleString('en-IN'))}
https://utools.bd/gold-calculator`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 print:p-0 print:m-0 print:max-w-none print:space-y-0">
      {/* ── SEO Head ── */}
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/gold-calculator"
        toolName="স্বর্ণের হিসাব ক্যালকুলেটর (Gold Calculator BD)"
        categoryName="ক্যালকুলেটর"
        categoryPath="/gold-calculator"
        faqs={pageContent.faqs}
      />

      {/* ── Top Breadcrumb & Guarantee ── */}
      <ToolBreadcrumb
        toolName="স্বর্ণের পরিমাপ ও দাম ক্যালকুলেটর"
        categoryName="হিসাব ও ক্যালকুলেটর"
        categoryPath="/gold-calculator"
        privacyText="বাজুস (BAJUS) মানদণ্ড • ১০০% ক্লায়েন্ট-সাইড • অফলাইন সমর্থিত"
        className="no-print"
      />

      {/* ── Title & Intro Header ── */}
      <div className="space-y-2 no-print">
        <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
          <Coins className="w-3.5 h-3.5" />
          <span>জুয়েলারি ও ফিন্যান্সিয়াল ইউটিলিটি • স্বর্ণের পরিমাপক</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed max-w-3xl">
          {pageContent.subtitle}
        </p>
      </div>

      {/* ── Mode Switcher Tabs ── */}
      <div className="border-b border-[#D5E4DB] flex flex-wrap items-center gap-2 no-print">
        <button
          type="button"
          onClick={() => setActiveTab('price')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'price'
              ? 'border-[#0B5D3B] text-[#084A2E] bg-[#0B5D3B]/5'
              : 'border-transparent text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#F0F4F2]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>নতুন গহনা ক্রয়ের হিসাব</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('converter')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'converter'
              ? 'border-[#0B5D3B] text-[#084A2E] bg-[#0B5D3B]/5'
              : 'border-transparent text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#F0F4F2]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ওজন রূপান্তর (ভরি ↔ গ্রাম)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exchange')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'exchange'
              ? 'border-[#0B5D3B] text-[#084A2E] bg-[#0B5D3B]/5'
              : 'border-transparent text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#F0F4F2]'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুরানো সোনা বিক্রয় / বদল</span>
        </button>
      </div>

      {/* ── Main Interactive Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:w-full">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 no-print">
          {/* Card: Weight Input Section */}
          <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-5 sm:p-6 space-y-5 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5E4DB]">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                  স্বর্ণের ওজন নির্ধারণ
                </h2>
              </div>

              {/* Weight Mode Switcher */}
              <div className="inline-flex items-center p-0.5 bg-[#F0F4F2] border border-[#D5E4DB] rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setWeightMode('traditional')}
                  className={`px-3 py-1 font-medium transition-colors rounded-md cursor-pointer ${
                    weightMode === 'traditional'
                      ? 'bg-[#0B5D3B] text-[#FFFFFF]'
                      : 'text-[#4A5A52] hover:text-[#084A2E]'
                  }`}
                >
                  ভরি-আনা-রতি
                </button>
                <button
                  type="button"
                  onClick={() => setWeightMode('grams')}
                  className={`px-3 py-1 font-medium transition-colors rounded-md cursor-pointer ${
                    weightMode === 'grams'
                      ? 'bg-[#0B5D3B] text-[#FFFFFF]'
                      : 'text-[#4A5A52] hover:text-[#084A2E]'
                  }`}
                >
                  গ্রাম (ডিজিটাল স্কেল)
                </button>
              </div>
            </div>

            {/* Mode 1: Traditional Inputs */}
            {weightMode === 'traditional' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#084A2E] mb-1">
                      ভরি (Bhori)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={bhoriInput}
                      onChange={(e) =>
                        handleTraditionalChange(
                          parseFloat(e.target.value) || 0,
                          aanaInput,
                          rotiInput,
                          pointInput
                        )
                      }
                      className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#084A2E] mb-1">
                      আনা (Aana, ০-১৫)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="1"
                      value={aanaInput}
                      onChange={(e) =>
                        handleTraditionalChange(
                          bhoriInput,
                          parseFloat(e.target.value) || 0,
                          rotiInput,
                          pointInput
                        )
                      }
                      className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#084A2E] mb-1">
                      রতি (Roti, ০-৫)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="1"
                      value={rotiInput}
                      onChange={(e) =>
                        handleTraditionalChange(
                          bhoriInput,
                          aanaInput,
                          parseFloat(e.target.value) || 0,
                          pointInput
                        )
                      }
                      className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#084A2E] mb-1">
                      পয়েন্ট (Point, ০-৯.৯)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="9.9"
                      step="0.1"
                      value={pointInput}
                      onChange={(e) =>
                        handleTraditionalChange(
                          bhoriInput,
                          aanaInput,
                          rotiInput,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-3 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-[#4A5A52]">সমপরিমাণ মেট্রিক ওজন:</span>
                  <span className="font-bold font-mono text-[#0B5D3B] text-sm">
                    {toBanglaNum(effectiveWeightInGrams.toFixed(3))} গ্রাম
                  </span>
                </div>
              </div>
            ) : (
              /* Mode 2: Direct Grams Input */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#084A2E] mb-1">
                    ডিজিটাল স্কেলের ওজন (গ্রাম / Grams)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={gramsInput}
                      onChange={(e) => handleGramsChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 border border-[#D5E4DB] bg-[#FAFAF7] text-base text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#4A5A52] font-mono">
                      গ্রাম (g)
                    </span>
                  </div>
                </div>

                <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-3 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-[#4A5A52]">সমপরিমাণ দেশীয় ভরি-আনা-রতি:</span>
                  <span className="font-bold text-[#0B5D3B] text-sm">
                    {toBanglaNum(bhoriInput)} ভরি {toBanglaNum(aanaInput)} আনা{' '}
                    {toBanglaNum(rotiInput)} রতি {toBanglaNum(pointInput)} পয়েন্ট
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: New Jewelry Buying Pricing Form */}
          {activeTab === 'price' && (
            <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-5 sm:p-6 space-y-5 rounded-2xl shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
                <Coins className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                  ক্যারেট নির্বাচন ও প্রতি ভরির বাজারদর
                </h2>
              </div>

              {/* Karat Selection Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(KARAT_PRESETS) as GoldKarat[]).map((karat) => {
                  const info = KARAT_PRESETS[karat];
                  const isSelected = selectedKarat === karat;
                  return (
                    <button
                      key={karat}
                      type="button"
                      onClick={() => handleKaratChange(karat)}
                      className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 ring-1 ring-[#0B5D3B]'
                          : 'border-[#D5E4DB] bg-[#FAFAF7] hover:bg-[#F0F4F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#084A2E]">
                          {karat === '22k'
                            ? '২২ ক্যারেট'
                            : karat === '21k'
                            ? '২১ ক্যারেট'
                            : karat === '18k'
                            ? '১৮ ক্যারেট'
                            : 'সনাতন'}
                        </span>
                        <span className="text-[10px] font-mono text-[#0B5D3B] bg-[#0B5D3B]/10 px-1.5 py-0.5 rounded">
                          {info.hallmarkCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4A5A52] font-mono">
                        ৳{toBanglaNum(info.defaultPricePerBhori.toLocaleString('en-IN'))}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Price Input */}
              <div>
                <label className="block text-xs font-bold text-[#084A2E] mb-1">
                  প্রতি ভরির বর্তমান বাজারদর (টাকা) — আপনার রেট অনুযায়ী পরিবর্তন করতে পারেন
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#4A5A52] font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={customPricePerBhori}
                    onChange={(e) => setCustomPricePerBhori(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Making Charge (মজুরি) Config */}
              <div className="pt-3 border-t border-[#D5E4DB] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#084A2E]">
                    কারিগরের মজুরি (মেকিং চার্জ)
                  </label>
                  <div className="inline-flex text-[11px] border border-[#D5E4DB] bg-[#F0F4F2] rounded-md">
                    <button
                      type="button"
                      onClick={() => setMakingChargeType('per_bhori')}
                      className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                        makingChargeType === 'per_bhori'
                          ? 'bg-[#0B5D3B] text-white'
                          : 'text-[#4A5A52]'
                      }`}
                    >
                      প্রতি ভরি
                    </button>
                    <button
                      type="button"
                      onClick={() => setMakingChargeType('percentage')}
                      className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                        makingChargeType === 'percentage'
                          ? 'bg-[#0B5D3B] text-white'
                          : 'text-[#4A5A52]'
                      }`}
                    >
                      শতাংশ (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMakingChargeType('per_gram')}
                      className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                        makingChargeType === 'per_gram'
                          ? 'bg-[#0B5D3B] text-white'
                          : 'text-[#4A5A52]'
                      }`}
                    >
                      প্রতি গ্রাম
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step={makingChargeType === 'percentage' ? '0.5' : '100'}
                    value={makingChargeValue}
                    onChange={(e) => setMakingChargeValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#4A5A52] font-mono">
                    {makingChargeType === 'percentage'
                      ? '%'
                      : makingChargeType === 'per_gram'
                      ? 'টাকা/গ্রাম'
                      : 'টাকা/ভরি'}
                  </span>
                </div>
              </div>

              {/* VAT Setting */}
              <div className="pt-3 border-t border-[#D5E4DB] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vatCheckbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="rounded text-[#0B5D3B] focus:ring-[#0B5D3B] w-4 h-4 cursor-pointer"
                  />
                  <label
                    htmlFor="vatCheckbox"
                    className="text-xs font-bold text-[#084A2E] cursor-pointer"
                  >
                    সরকারি ভ্যাট ৫% (BAJUS ও NBR প্রমিত)
                  </label>
                </div>

                {includeVat && (
                  <span className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#0B5D3B]/10 px-2 py-0.5 rounded">
                    +৫% যোগ হবে
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Weight Converter Details */}
          {activeTab === 'converter' && (
            <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
                <Scale className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                  প্রমিত রূপান্তর সূত্র ও তুলনা
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-4 rounded-xl space-y-2">
                  <span className="font-bold text-[#084A2E]">ঐতিহ্যবাহী এককসমূহ:</span>
                  <ul className="space-y-1 text-[#34443B]">
                    <li>• ১ ভরি (তোলা) = ১৬ আনা</li>
                    <li>• ১ আনা = ৬ রতি (০.৭২৯ গ্রাম)</li>
                    <li>• ১ রতি = ১০ পয়েন্ট (০.১২১৫ গ্রাম)</li>
                    <li>• ১ ভরি = ৯৬ রতি = ৯৬০ পয়েন্ট</li>
                  </ul>
                </div>

                <div className="bg-[#F0F4F2]/50 border border-[#D5E4DB] p-4 rounded-xl space-y-2">
                  <span className="font-bold text-[#084A2E]">মেট্রিক ওজন সমতুল্য:</span>
                  <ul className="space-y-1 text-[#34443B]">
                    <li>• ১ ভরি = ঠিক ১১.৬৬৪ গ্রাম</li>
                    <li>• ১০ গ্রাম = ০.৮৫৭৩ ভরি (১৩.৭১ আনা)</li>
                    <li>• ১০০ গ্রাম = ৮.৫৭৩৪ ভরি</li>
                    <li>• ১ কিলোগ্রাম (কেজি) = ৮৫.৭৩ ভরি</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Old Gold Exchange & Cash Sale */}
          {activeTab === 'exchange' && (
            <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-5 sm:p-6 space-y-5 rounded-2xl shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#D5E4DB]">
                <RefreshCw className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                  পুরানো সোনা বিক্রি বা বদলের শর্তাবলী
                </h2>
              </div>

              {/* Trade Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTradeType('exchange');
                    setCustomDeductionPercent(10);
                  }}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    tradeType === 'exchange'
                      ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 ring-1 ring-[#0B5D3B]'
                      : 'border-[#D5E4DB] bg-[#FAFAF7] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#084A2E]">
                    নতুন গহনার সাথে বদল (Exchange)
                  </span>
                  <span className="text-[11px] text-[#4A5A52]">
                    বাজুস সাধারণ নিয়ম: ১০% কর্তন
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTradeType('cash');
                    setCustomDeductionPercent(20);
                  }}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    tradeType === 'cash'
                      ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 ring-1 ring-[#0B5D3B]'
                      : 'border-[#D5E4DB] bg-[#FAFAF7] hover:bg-[#F0F4F2]'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#084A2E]">
                    নগদ টাকায় বিক্রি (Cash Sell)
                  </span>
                  <span className="text-[11px] text-[#4A5A52]">
                    বাজুস সাধারণ নিয়ম: ১৫% থেকে ২০% কর্তন
                  </span>
                </button>
              </div>

              {/* Stone weight deduction */}
              <div>
                <label className="block text-xs font-bold text-[#084A2E] mb-1">
                  পাথর / ময়লা / খাঁদ বাদ (যদি থাকে, গ্রাম হিসেবে)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={stoneWeightGrams}
                    onChange={(e) => setStoneWeightGrams(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#4A5A52] font-mono">
                    গ্রাম বাদ
                  </span>
                </div>
              </div>

              {/* Deduction Percent */}
              <div>
                <label className="block text-xs font-bold text-[#084A2E] mb-1">
                  মূল্য কর্তন বা বাট্টার হার (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={customDeductionPercent}
                    onChange={(e) => setCustomDeductionPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#D5E4DB] bg-[#FAFAF7] text-sm text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#4A5A52] font-mono">
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Output Summary Receipt Card (5 cols) */}
        <div id="gold-receipt-print-wrapper" className="lg:col-span-5 space-y-6 print:w-full print:m-0 print:p-0 print:space-y-0">
          <div
            id="gold-receipt-card"
            className="bg-[#FFFFFF] border-2 border-[#0B5D3B] p-6 space-y-6 rounded-2xl shadow-sm relative overflow-hidden print:p-8 print:border-2 print:border-[#0B5D3B] print:rounded-2xl print:shadow-none print:w-full"
          >
            <div className="absolute top-0 right-0 bg-[#0B5D3B] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-lg">
              {activeTab === 'exchange' ? 'বিক্রয় রসিদ' : 'ক্রয় রসিদ'}
            </div>

            {/* Print-Only Official Memo Header */}
            <div className="hidden print:flex justify-between items-center text-[11px] text-[#4A5A52] pb-3 border-b border-[#D5E4DB]">
              <div>
                <span className="font-bold text-[#084A2E]">মেমো নম্বর:</span>{' '}
                <span className="font-mono font-bold text-[#0B5D3B]">{memoRefNumber}</span>
              </div>
              <div>
                <span className="font-bold text-[#084A2E]">তারিখ ও সময়:</span>{' '}
                <span>{printTimestamp}</span>
              </div>
            </div>

            <div className="space-y-1 pb-4 border-b border-[#D5E4DB]">
              <span className="text-[11px] font-mono text-[#0B5D3B] font-bold">
                Utools.bd • ডিজিটাল জুয়েলারি মেমো
              </span>
              <h3 className="text-lg font-bold text-[#084A2E] font-serif">
                {activeTab === 'exchange' ? 'পুরানো সোনা বিক্রির হিসাব' : 'স্বর্ণ ক্রয়ের হিসাব বিবরণী'}
              </h3>
            </div>

            {/* If Buying Tab Active */}
            {activeTab !== 'exchange' ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">সোনার মান (Karat):</span>
                  <span className="font-bold text-[#084A2E]">
                    {KARAT_PRESETS[selectedKarat].label} ({KARAT_PRESETS[selectedKarat].hallmarkCode})
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">সোনার মোট ওজন:</span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    {toBanglaNum(effectiveWeightInBhori.toFixed(3))} ভরি ({toBanglaNum(effectiveWeightInGrams.toFixed(3))} গ্রাম)
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">প্রতি ভরির দর:</span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    ৳{toBanglaNum(customPricePerBhori.toLocaleString('en-IN'))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">খাঁটি সোনার মূল্য:</span>
                  <span className="font-bold text-[#084A2E] font-mono text-sm">
                    ৳{toBanglaNum(purchaseResult.goldBasePrice.toLocaleString('en-IN'))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">কারিগরের মজুরি:</span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    + ৳{toBanglaNum(purchaseResult.makingCharge.toLocaleString('en-IN'))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">
                    সরকারি ভ্যাট ({toBanglaNum(includeVat ? vatPercent : 0)}%):
                  </span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    + ৳{toBanglaNum(purchaseResult.vatAmount.toLocaleString('en-IN'))}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="bg-[#0B5D3B]/10 p-4 rounded-xl border border-[#0B5D3B]/30 flex items-center justify-between">
                  <span className="font-bold text-[#084A2E] text-sm">সর্বমোট প্রদেয় বিল:</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B5D3B]">
                    ৳{toBanglaNum(purchaseResult.totalPrice.toLocaleString('en-IN'))}
                  </span>
                </div>

                {amountInWordsText && (
                  <div className="text-[11px] text-[#34443B] bg-[#FAFAF7] p-2.5 rounded-lg border border-[#D5E4DB] flex items-start gap-1.5">
                    <span className="font-bold text-[#084A2E] shrink-0">কথায়:</span>
                    <span className="italic font-medium">{amountInWordsText}</span>
                  </div>
                )}
              </div>
            ) : (
              /* If Exchange Tab Active */
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">লেনদেনের ধরন:</span>
                  <span className="font-bold text-[#084A2E]">
                    {tradeType === 'exchange' ? 'নতুন গহনার সাথে বদল' : 'নগদ টাকায় বিক্রি'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">সোনার মোট ওজন:</span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    {toBanglaNum(tradeResult.initialWeightGrams.toFixed(3))} গ্রাম
                  </span>
                </div>

                {stoneWeightGrams > 0 && (
                  <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60 text-red-700">
                    <span>পাথর/খাঁদ কর্তন:</span>
                    <span className="font-bold font-mono">
                      - {toBanglaNum(tradeResult.stoneWeightGrams.toFixed(3))} গ্রাম
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">নেট খাঁটি ওজন:</span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    {toBanglaNum(tradeResult.netWeightBhori.toFixed(3))} ভরি ({toBanglaNum(tradeResult.netWeightGrams.toFixed(3))} গ্রাম)
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">বর্তমান বাজারমূল্য (গ্রস):</span>
                  <span className="font-bold text-[#084A2E] font-mono">
                    ৳{toBanglaNum(tradeResult.grossValue.toLocaleString('en-IN'))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60 text-red-700">
                  <span>কর্তন বা বাট্টা ({toBanglaNum(tradeResult.deductionPercent)}%):</span>
                  <span className="font-bold font-mono">
                    - ৳{toBanglaNum(tradeResult.deductionAmount.toLocaleString('en-IN'))}
                  </span>
                </div>

                {/* Grand Net Payout */}
                <div className="bg-[#0B5D3B]/10 p-4 rounded-xl border border-[#0B5D3B]/30 flex items-center justify-between">
                  <span className="font-bold text-[#084A2E] text-sm">প্রকৃত প্রাপ্য টাকা:</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B5D3B]">
                    ৳{toBanglaNum(tradeResult.netPayout.toLocaleString('en-IN'))}
                  </span>
                </div>

                {amountInWordsText && (
                  <div className="text-[11px] text-[#34443B] bg-[#FAFAF7] p-2.5 rounded-lg border border-[#D5E4DB] flex items-start gap-1.5">
                    <span className="font-bold text-[#084A2E] shrink-0">কথায়:</span>
                    <span className="italic font-medium">{amountInWordsText}</span>
                  </div>
                )}
              </div>
            )}

            {/* Official Memo Footer for Print */}
            <div className="hidden print:block pt-6 border-t border-dashed border-[#D5E4DB] space-y-8">
              <div className="text-[11px] text-[#4A5A52] text-center space-y-1">
                <p className="font-semibold text-[#084A2E]">
                  এটি একটি ডিজিটাল হিসাব বিবরণী রসিদ • বাজুস (BAJUS) মানদণ্ড অনুযায়ী প্রস্তুতকৃত
                </p>
                <p className="font-mono text-[10px] text-[#4A5A52]">
                  যাচাই ও হিসাবের জন্য ভিজিট করুন: https://utools.bd/gold-calculator
                </p>
              </div>

              <div className="flex justify-between items-end pt-8 px-6 text-xs text-[#084A2E]">
                <div className="text-center">
                  <div className="w-36 border-t border-[#084A2E] mb-1.5" />
                  <span className="font-medium">গ্রাহকের স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <div className="w-36 border-t border-[#084A2E] mb-1.5" />
                  <span className="font-medium">অনুমোদিত স্বাক্ষর ও সিল</span>
                </div>
              </div>
            </div>

            {/* Actions: Copy & Print */}
            <div className="grid grid-cols-2 gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={handleCopyReceipt}
                className="py-2.5 px-3 border border-[#0B5D3B] bg-[#0B5D3B] text-white hover:bg-[#084A2E] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
              >
                {copiedReceipt ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>কপি সম্পন্ন!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>হিসাব কপি করুন</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB] text-[#084A2E] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট রসিদ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Educational Guide & Hallmark Reference ── */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl no-print">
        <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
          <Info className="w-5 h-5 text-[#0B5D3B]" />
          <h2 className="text-base sm:text-xl font-bold text-[#084A2E] font-serif">
            সোনার ক্যারেট ও খাঁটিত্ব পরিচিতি (Hallmark Purity Guide)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#084A2E] text-base">২২ ক্যারেট (916)</span>
              <span className="bg-[#0B5D3B] text-white text-[10px] font-mono px-2 py-0.5 rounded">
                ৯১.৬% খাঁটি
              </span>
            </div>
            <p className="text-[#34443B] leading-relaxed text-xs">
              গহনা তৈরির আন্তর্জাতিক মান। প্রতি ২৪ ভাগে ২২ ভাগ খাঁটি সোনা এবং ২ ভাগ খাদ (রূপা/তামা)। গায়ে "916" হলমার্ক খোদাই করা থাকে।
            </p>
          </div>

          <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#084A2E] text-base">২১ ক্যারেট (875)</span>
              <span className="bg-[#0B5D3B] text-white text-[10px] font-mono px-2 py-0.5 rounded">
                ৮৭.৫% খাঁটি
              </span>
            </div>
            <p className="text-[#34443B] leading-relaxed text-xs">
              বাংলাদেশে সবচেয়ে জনপ্রিয় ও টেকসই। দৈনন্দিন ব্যবহারের জন্য শক্ত ও চকচকে। গহনায় "875" হলমার্ক সিল দেওয়া থাকে।
            </p>
          </div>

          <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#084A2E] text-base">১৮ ক্যারেট (750)</span>
              <span className="bg-[#0B5D3B] text-white text-[10px] font-mono px-2 py-0.5 rounded">
                ৭৫.০% খাঁটি
              </span>
            </div>
            <p className="text-[#34443B] leading-relaxed text-xs">
              হীরা বা দামি পাথরের সূক্ষ্ম কাজের জন্য শক্ত সোনা। প্রতি ২৪ ভাগে ১৮ ভাগ খাঁটি সোনা। হলমার্ক কোড হলো "750"।
            </p>
          </div>
        </div>
      </section>

      {/* ── CMS Dynamic FAQs & Content ── */}
      <div className="no-print">
        <CmsDynamicContent content={pageContent} />
      </div>

      {/* ── Related Tools ── */}
      <div className="no-print">
        <RelatedTools currentToolId="gold-calculator" />
      </div>
    </div>
  );
};
