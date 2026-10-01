import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ChefHat,
  ArrowRightLeft,
  Copy,
  Check,
  Flame,
  BookOpen,
  Sparkles,
  Info,
  Scale
} from 'lucide-react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import {
  convertRecipeMeasurement,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  getGasMark,
  INGREDIENTS,
  UNITS,
  POPULAR_OVEN_PRESETS,
  type UnitType
} from '../utils/cookingConverter.ts';
import pageContent from '../../content/pages/cooking-converter.json';

export const CookingConverterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ingredient' | 'oven' | 'cheatsheet'>('ingredient');

  // Ingredient Converter State
  const [amount, setAmount] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<UnitType>('cup');
  const [toUnit, setToUnit] = useState<UnitType>('g');
  const [selectedIngredient, setSelectedIngredient] = useState<string>('flour');
  const [copied, setCopied] = useState<boolean>(false);

  // Oven Temperature State
  const [fahrenheit, setFahrenheit] = useState<number>(350);
  const [celsius, setCelsius] = useState<number>(175);

  // Conversion calculations
  const convertedResult = useMemo(() => {
    return convertRecipeMeasurement(amount, fromUnit, toUnit, selectedIngredient);
  }, [amount, fromUnit, toUnit, selectedIngredient]);

  const activeIngredientObj = useMemo(
    () => INGREDIENTS.find((i) => i.id === selectedIngredient) || INGREDIENTS[0],
    [selectedIngredient]
  );

  const activeFromUnitObj = useMemo(
    () => UNITS.find((u) => u.id === fromUnit) || UNITS[0],
    [fromUnit]
  );

  const activeToUnitObj = useMemo(
    () => UNITS.find((u) => u.id === toUnit) || UNITS[3],
    [toUnit]
  );

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopyResult = () => {
    const textToCopy = `${amount} ${activeFromUnitObj.nameBn.split(' ')[0]} ${activeIngredientObj.nameBn} = ${convertedResult.toFixed(1)} ${activeToUnitObj.nameBn.split(' ')[0]}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFahrenheitChange = (val: number) => {
    setFahrenheit(val);
    setCelsius(Math.round(fahrenheitToCelsius(val)));
  };

  const handleCelsiusChange = (val: number) => {
    setCelsius(val);
    setFahrenheit(Math.round(celsiusToFahrenheit(val)));
  };

  return (
    <>
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/cooking-converter"
        toolName="রান্নার পরিমাপ ও রেসিপি কনভার্টার (Cooking Converter)"
        categoryName="হিসাব ও ক্যালকুলেটর"
        categoryPath="/cooking-converter"
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
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>১০০% ক্লায়েন্ট-সাইড • দ্রুত ও নির্ভুল রেসিপি হিসাব</span>
          </div>
        </div>

        {/* Heading Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
            <ChefHat className="w-3.5 h-3.5" />
            <span>রান্না ও বেকিং ইউটিলিটি • উপাদান-ভিত্তিক নিখুঁত রূপান্তর</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
            {pageContent.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed max-w-3xl">
            {pageContent.subtitle}
          </p>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-[#D5E4DB] space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('ingredient')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'ingredient'
                ? 'border-[#0B5D3B] text-[#084A2E]'
                : 'border-transparent text-[#4A5A52] hover:text-[#084A2E]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>উপাদান ও পরিমাপ রূপান্তর (Cup ⇄ Gram)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('oven')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'oven'
                ? 'border-[#0B5D3B] text-[#084A2E]'
                : 'border-transparent text-[#4A5A52] hover:text-[#084A2E]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>ওভেন তাপমাত্রা (°F ⇄ °C)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cheatsheet')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'cheatsheet'
                ? 'border-[#0B5D3B] text-[#084A2E]'
                : 'border-transparent text-[#4A5A52] hover:text-[#084A2E]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>বেকিং চিট-শিট ও চার্ট</span>
          </button>
        </div>

        {/* TAB 1: Ingredient Measurement Converter */}
        {activeTab === 'ingredient' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 rounded-2xl shadow-xs space-y-6">
              {/* Quick Presets Row */}
              <div className="space-y-2">
                <span className="text-xs text-[#4A5A52] font-medium flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>জনপ্রিয় রেসিপি প্রিসেট (ক্লিক করুন):</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '১ কাপ ময়দা', ing: 'flour', amt: 1, from: 'cup', to: 'g' },
                    { label: '১ কাপ চিনি', ing: 'sugar', amt: 1, from: 'cup', to: 'g' },
                    { label: '১/২ কাপ মাখন', ing: 'butter', amt: 0.5, from: 'cup', to: 'g' },
                    { label: '১ টেবিল চামচ চিনি', ing: 'sugar', amt: 1, from: 'tbsp', to: 'g' },
                    { label: '১ কাপ তেল', ing: 'oil', amt: 1, from: 'cup', to: 'ml' },
                    { label: '২৫০ গ্রাম ময়দা (কত কাপ?)', ing: 'flour', amt: 250, from: 'g', to: 'cup' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedIngredient(preset.ing);
                        setAmount(preset.amt);
                        setFromUnit(preset.from as UnitType);
                        setToUnit(preset.to as UnitType);
                      }}
                      className="text-xs px-3 py-1.5 bg-[#F4F8F5] hover:bg-[#E8F1EC] text-[#084A2E] border border-[#D5E4DB] rounded-lg transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* 1. Select Ingredient (4 cols) */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-[#084A2E] block">
                    ১. রান্নার উপাদান নির্বাচন করুন:
                  </label>
                  <select
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] bg-[#FAFCFB] text-[#1A2E22] font-medium"
                  >
                    {INGREDIENTS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nameBn} ({item.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Amount Input (2 cols) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#084A2E] block">
                    ২. পরিমাণ:
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amount === 0 ? '' : amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    placeholder="১"
                    className="w-full text-xs sm:text-sm p-3 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] bg-[#FAFCFB] text-[#1A2E22] font-mono font-bold"
                  />
                </div>

                {/* 3. From Unit (2 cols) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#084A2E] block">
                    ৩. যে এককে আছে:
                  </label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value as UnitType)}
                    className="w-full text-xs sm:text-sm p-3 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] bg-[#FAFCFB] text-[#1A2E22]"
                  >
                    {UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameBn.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button (1 col) */}
                <div className="md:col-span-1 flex justify-center pt-5">
                  <button
                    type="button"
                    onClick={handleSwapUnits}
                    className="p-3 rounded-xl border border-[#D5E4DB] bg-[#F4F8F5] hover:bg-[#E8F1EC] text-[#084A2E] transition-all cursor-pointer shadow-2xs hover:scale-105"
                    title="একক অদলবদল (Swap)"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* 4. To Unit (3 cols) */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-[#084A2E] block">
                    ৪. যে এককে জানতে চান:
                  </label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value as UnitType)}
                    className="w-full text-xs sm:text-sm p-3 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] bg-[#FAFCFB] text-[#1A2E22]"
                  >
                    {UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameBn.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Big Result Display Card */}
              <div className="p-6 bg-gradient-to-br from-[#F4F8F5] to-[#E6F4EC] border border-[#A7D9BE] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-semibold text-[#0B5D3B] uppercase tracking-wider block">
                    রূপান্তরিত ফলাফল:
                  </span>
                  <div className="text-2xl sm:text-4xl font-extrabold text-[#084A2E] font-mono">
                    {convertedResult.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 0,
                    })}{' '}
                    <span className="text-lg sm:text-xl font-sans font-bold text-[#0B5D3B]">
                      {activeToUnitObj.nameBn.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5A52] pt-1">
                    {amount} {activeFromUnitObj.nameBn.split(' ')[0]} {activeIngredientObj.nameBn} এর সমান।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="px-4 py-2.5 bg-[#FFFFFF] border border-[#0B5D3B] text-[#084A2E] text-xs font-bold rounded-xl shadow-xs hover:bg-[#F0F4F2] flex items-center space-x-2 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#0B5D3B]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
                </button>
              </div>

              {/* Density Note */}
              <div className="flex items-start space-x-2.5 p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E]">
                <Info className="w-4 h-4 shrink-0 text-[#B45309] mt-0.5" />
                <p>
                  <strong>ঘনত্বের ব্যাখ্যা:</strong> ১ কাপ {activeIngredientObj.nameBn} সমান প্রায়{' '}
                  <strong>{activeIngredientObj.gramsPerCup} গ্রাম</strong>। রেসিপি কাপ (স্ট্যান্ডার্ড ২৪০ মিলি) অনুযায়ী
                  এই ওজন নির্ধারিত।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Oven Temperature Converter */}
        {activeTab === 'oven' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 rounded-2xl shadow-xs space-y-6">
              <h2 className="text-sm font-bold text-[#084A2E] uppercase tracking-wide flex items-center space-x-2">
                <Flame className="w-4 h-4 text-[#EA580C]" />
                <span>ওভেনের তাপমাত্রা রূপান্তর (Fahrenheit ⇄ Celsius ⇄ Gas Mark)</span>
              </h2>

              {/* Side by side temperature inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-[#FBFDFB] border border-[#D5E4DB] rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-[#084A2E] block">
                    ফারেনহাইট (°F - Fahrenheit):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="5"
                      value={fahrenheit}
                      onChange={(e) => handleFahrenheitChange(Number(e.target.value) || 0)}
                      className="w-full text-xl sm:text-2xl p-3 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] font-mono font-bold text-[#084A2E] bg-[#FFFFFF]"
                    />
                    <span className="text-xl font-bold text-[#4A5A52]">°F</span>
                  </div>
                </div>

                <div className="p-5 bg-[#FBFDFB] border border-[#D5E4DB] rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-[#084A2E] block">
                    সেলসিয়াস (°C - Celsius):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="5"
                      value={celsius}
                      onChange={(e) => handleCelsiusChange(Number(e.target.value) || 0)}
                      className="w-full text-xl sm:text-2xl p-3 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] font-mono font-bold text-[#084A2E] bg-[#FFFFFF]"
                    />
                    <span className="text-xl font-bold text-[#4A5A52]">°C</span>
                  </div>
                </div>
              </div>

              {/* Gas Mark Badge */}
              <div className="p-4 bg-[#F4F8F5] border border-[#D5E4DB] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#34443B] font-medium">গ্যাস ওভেন মাত্রা (Gas Mark):</span>
                <span className="font-bold text-[#084A2E] bg-[#FFFFFF] px-3 py-1 rounded-lg border border-[#D5E4DB]">
                  {getGasMark(fahrenheit)}
                </span>
              </div>

              {/* Popular Baking Temperatures Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-[#084A2E] uppercase">
                  বহুল ব্যবহৃত বেকিং তাপমাত্রা ও উপযোগী খাবারের তালিকা:
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-[#D5E4DB] rounded-xl overflow-hidden">
                    <thead className="bg-[#F0F4F2] text-[#084A2E] font-semibold text-left">
                      <tr>
                        <th className="p-3 border-b border-[#D5E4DB]">ফারেনহাইট (°F)</th>
                        <th className="p-3 border-b border-[#D5E4DB]">সেলসিয়াস (°C)</th>
                        <th className="p-3 border-b border-[#D5E4DB]">গ্যাস মার্ক</th>
                        <th className="p-3 border-b border-[#D5E4DB]">কোন খাবারে ব্যবহৃত হয়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8F1EC]">
                      {POPULAR_OVEN_PRESETS.map((p, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-[#F9FBF9] cursor-pointer transition-colors"
                          onClick={() => handleFahrenheitChange(p.f)}
                        >
                          <td className="p-3 font-mono font-bold text-[#084A2E]">{p.f}°F</td>
                          <td className="p-3 font-mono font-bold text-[#0B5D3B]">{p.c}°C</td>
                          <td className="p-3 text-[#4A5A52]">{p.gas}</td>
                          <td className="p-3 text-[#34443B]">{p.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Cheat Sheet & Measurement Tables */}
        {activeTab === 'cheatsheet' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 rounded-2xl shadow-xs space-y-6">
              <h2 className="text-sm font-bold text-[#084A2E] uppercase tracking-wide flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#0B5D3B]" />
                <span>রান্না ও বেকিং চিট-শিট চার্ট (Quick Reference Sheet)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spoon & Cup Conversions */}
                <div className="p-4 bg-[#FBFDFB] border border-[#D5E4DB] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#084A2E] border-b border-[#D5E4DB] pb-2">
                    🥄 চামচ ও কাপের সাধারণ অনুপাত (Spoon to Cup)
                  </h3>
                  <ul className="text-xs space-y-2 text-[#34443B]">
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ চা চামচ (1 tsp):</span>
                      <strong className="font-mono text-[#084A2E]">৫ মিলিলিটার (5 ml)</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ টেবিল চামচ (1 tbsp):</span>
                      <strong className="font-mono text-[#084A2E]">৩ চা চামচ = ১৫ মিলিলিটার</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>২ টেবিল চামচ (2 tbsp):</span>
                      <strong className="font-mono text-[#084A2E]">১/৮ কাপ = ৩০ মিলিলিটার</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>৪ টেবিল চামচ (4 tbsp):</span>
                      <strong className="font-mono text-[#084A2E]">১/৪ কাপ = ৬০ মিলিলিটার</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>৮ টেবিল চামচ (8 tbsp):</span>
                      <strong className="font-mono text-[#084A2E]">১/২ কাপ = ১২০ মিলিলিটার</strong>
                    </li>
                    <li className="flex justify-between py-1">
                      <span>১৬ টেবিল চামচ (16 tbsp):</span>
                      <strong className="font-mono text-[#084A2E]">১ কাপ = ২৪০ মিলিলিটার</strong>
                    </li>
                  </ul>
                </div>

                {/* Popular Ingredients Weight per 1 Cup */}
                <div className="p-4 bg-[#FBFDFB] border border-[#D5E4DB] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#084A2E] border-b border-[#D5E4DB] pb-2">
                    ⚖️ প্রতি ১ কাপ (২৪০ মিলি) উপাদানের ওজন
                  </h3>
                  <ul className="text-xs space-y-2 text-[#34443B]">
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ কাপ ময়দা / আটা:</span>
                      <strong className="font-mono text-[#084A2E]">১২০ গ্রাম</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ কাপ সাদা চিনি:</span>
                      <strong className="font-mono text-[#084A2E]">২০০ গ্রাম</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ কাপ গুঁড়া চিনি (আইসিং সুগার):</span>
                      <strong className="font-mono text-[#084A2E]">১২০ গ্রাম</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ কাপ মাখন / ঘি:</span>
                      <strong className="font-mono text-[#084A2E]">২২৭ গ্রাম</strong>
                    </li>
                    <li className="flex justify-between py-1 border-b border-[#E8F1EC]">
                      <span>১ কাপ সয়াবিন / সরিষার তেল:</span>
                      <strong className="font-mono text-[#084A2E]">২১৮ গ্রাম</strong>
                    </li>
                    <li className="flex justify-between py-1">
                      <span>১ কাপ তরল দুধ / পানি:</span>
                      <strong className="font-mono text-[#084A2E]">২৪০ - ২৪৫ গ্রাম</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic CMS and FAQ Section */}
        <CmsDynamicContent content={pageContent} />

        {/* Related Tools Navigation */}
        <RelatedTools currentToolId="cooking-converter" />
      </div>
    </>
  );
};
