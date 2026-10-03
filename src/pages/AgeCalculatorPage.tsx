import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import {
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  Sliders,
  Award
} from 'lucide-react';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/age-calculator.json';

// Convert English numbers to Bengali digits
export function toBanglaNum(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => banglaDigits[Number(d)]);
}

// Bengali Weekday names
const BANGLA_WEEKDAYS = [
  'রবিবার (Sunday)',
  'সোমবার (Monday)',
  'মঙ্গলবার (Tuesday)',
  'বুধবার (Wednesday)',
  'বৃহস্পতিবার (Thursday)',
  'শুক্রবার (Friday)',
  'শনিবার (Saturday)'
];

// Bengali Month names
const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

interface AgeCategory {
  id: string;
  name: string;
  maxAge: number;
  minAge: number;
  description: string;
  tag: string;
}

const GOVERNMENT_QUOTA_CATEGORIES: AgeCategory[] = [
  {
    id: 'general',
    name: 'সাধারণ প্রার্থী (General Candidates)',
    maxAge: 30,
    minAge: 18,
    description: 'সাধারণ ও অন্যান্য সকল প্রার্থীর জন্য সরকারি চাকরির নির্ধারিত বয়সসীমা',
    tag: '৩০ বছর'
  },
  {
    id: 'freedom_fighter',
    name: 'মুক্তিযোদ্ধা / শহীদ মুক্তিযোদ্ধার সন্তান কোটা',
    maxAge: 32,
    minAge: 18,
    description: 'বীর মুক্তিযোদ্ধা ও শহীদ মুক্তিযোদ্ধাদের পুত্র-কন্যাদের জন্য নির্ধারিত বয়সসীমা',
    tag: '৩২ বছর'
  },
  {
    id: 'physically_challenged',
    name: 'প্রতিবন্ধী ও ক্ষুদ্র নৃ-গোষ্ঠী (উপজাতি) কোটা',
    maxAge: 32,
    minAge: 18,
    description: 'শারীরিক প্রতিবন্ধী এবং উপজাতি / ক্ষুদ্র নৃ-গোষ্ঠী প্রার্থীদের জন্য নির্ধারিত সীমা',
    tag: '৩২ বছর'
  },
  {
    id: 'bcs_health',
    name: 'বিসিএস স্বাস্থ্য ও বিশেষ ক্যাডার / চিকিৎসক',
    maxAge: 32,
    minAge: 21,
    description: 'বিসিএস স্বাস্থ্য ক্যাডার (সহকারী সার্জন) ও বিশেষ টেকনিক্যাল পদসমূহের জন্য',
    tag: '৩২ বছর'
  }
];

// Exact difference calculation taking calendar months and leap years into account
function calculateExactDifference(startDate: Date, endDate: Date) {
  let years = endDate.getFullYear() - startDate.getFullYear();

  // Try advancing by years
  let testDate = new Date(startDate.getFullYear() + years, startDate.getMonth(), startDate.getDate());
  if (testDate > endDate) {
    years--;
  }

  // Try advancing by months
  let months = 0;
  while (true) {
    let nextMonth = new Date(startDate.getFullYear() + years, startDate.getMonth() + months + 1, startDate.getDate());
    // handle month end rollover (e.g. Jan 31 -> Feb 28/29)
    if (nextMonth.getDate() !== startDate.getDate()) {
      nextMonth = new Date(startDate.getFullYear() + years, startDate.getMonth() + months + 2, 0);
    }
    if (nextMonth <= endDate) {
      months++;
    } else {
      break;
    }
  }

  // Calculate the intermediate anchor date reached by (startDate + years + months)
  let intermediate = new Date(startDate.getFullYear() + years, startDate.getMonth() + months, startDate.getDate());
  if (intermediate.getDate() !== startDate.getDate()) {
    intermediate = new Date(startDate.getFullYear() + years, startDate.getMonth() + months + 1, 0);
  }

  // Exact difference in remaining days
  const diffMs = endDate.getTime() - intermediate.getTime();
  const days = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  return { years, months, days };
}

// Helper to format date in YYYY-MM-DD
function formatDateToInputString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper to format date in Bengali display
function formatBengaliDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const monthName = BANGLA_MONTHS[m] || '';
  return `${toBanglaNum(d)} ${monthName}, ${toBanglaNum(y)}`;
}

export const AgeCalculatorPage: React.FC = () => {
  // Input states
  // Default birth date: realistic example candidate
  const [birthDateStr, setBirthDateStr] = useState<string>('1998-05-15');
  
  // Target date & today string stay empty during SSR and are filled with the
  // visitor's local date on mount, so prerendered HTML never ships a stale date
  const [todayStr, setTodayStr] = useState<string>('');
  const [targetDateStr, setTargetDateStr] = useState<string>('');

  // Derived from state so the first client render matches the prerendered HTML
  const currentYear = todayStr ? Number(todayStr.slice(0, 4)) : null;

  React.useEffect(() => {
    const today = formatDateToInputString(new Date());
    setTodayStr(today);
    setTargetDateStr((prev) => prev || today);
  }, []);

  // Quota category state
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [customMaxAge, setCustomMaxAge] = useState<number>(30);
  const [customMinAge, setCustomMinAge] = useState<number>(18);

  // Copy notification
  const { copied, copy } = useCopyToClipboard();

  // Parsed dates
  const parsedDates = useMemo(() => {
    if (!birthDateStr || !targetDateStr) {
      return { isValid: false, error: 'অনুগ্রহ করে উভয় তারিখ প্রদান করুন।' };
    }

    const [bY, bM, bD] = birthDateStr.split('-').map(Number);
    const [tY, tM, tD] = targetDateStr.split('-').map(Number);

    const bDate = new Date(bY, bM - 1, bD);
    const tDate = new Date(tY, tM - 1, tD);

    if (isNaN(bDate.getTime()) || isNaN(tDate.getTime())) {
      return { isValid: false, error: 'তারিখের ফরম্যাট সঠিক নয়।' };
    }

    if (bDate > tDate) {
      return {
        isValid: false,
        error: 'জন্ম তারিখ হিসাবের তারিখের চেয়ে পূর্বে হতে হবে।'
      };
    }

    return {
      isValid: true,
      birthDate: bDate,
      targetDate: tDate
    };
  }, [birthDateStr, targetDateStr]);

  // Main exact age calculation
  const ageResult = useMemo(() => {
    if (!parsedDates.isValid || !parsedDates.birthDate || !parsedDates.targetDate) {
      return null;
    }

    const { birthDate, targetDate } = parsedDates;

    // 1. Exact Years, Months, Days
    const { years, months, days } = calculateExactDifference(birthDate, targetDate);

    // 2. Exact Total Days
    const oneDayMs = 1000 * 60 * 60 * 24;
    const utcBirth = Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const totalDays = Math.round((utcTarget - utcBirth) / oneDayMs);

    // 3. Exact Total Weeks + remaining days
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysInWeek = totalDays % 7;

    // 4. Total Approximate Months
    const totalMonths = years * 12 + months;

    // 5. Total Hours
    const totalHours = totalDays * 24;

    // 6. Day of birth
    const birthDayOfWeek = BANGLA_WEEKDAYS[birthDate.getDay()];

    // 7. Next Birthday countdown
    const currentYear = targetDate.getFullYear();
    let nextBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    if (nextBday < targetDate) {
      nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    const nextBdayDiff = calculateExactDifference(targetDate, nextBday);
    const utcNextBday = Date.UTC(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate());
    const nextBdayDays = Math.round((utcNextBday - utcTarget) / oneDayMs);

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      remainingDaysInWeek,
      totalMonths,
      totalHours,
      birthDayOfWeek,
      nextBdayDays,
      nextBdayDiff
    };
  }, [parsedDates]);

  // Active limit parameters
  const activeLimit = useMemo(() => {
    if (selectedCategory === 'custom') {
      return {
        name: 'কাস্টম নির্ধারিত বয়সসীমা',
        maxAge: customMaxAge,
        minAge: customMinAge,
        description: `ব্যবহারকারী নির্ধারিত ন্যূনতম ${customMinAge} বছর ও সর্বোচ্চ ${customMaxAge} বছর সীমা`
      };
    }
    const found = GOVERNMENT_QUOTA_CATEGORIES.find((c) => c.id === selectedCategory);
    return found || GOVERNMENT_QUOTA_CATEGORIES[0];
  }, [selectedCategory, customMaxAge, customMinAge]);

  // Eligibility evaluation
  const eligibility = useMemo(() => {
    if (!ageResult || !parsedDates.isValid || !parsedDates.birthDate || !parsedDates.targetDate) {
      return null;
    }

    const { birthDate, targetDate } = parsedDates;
    const { maxAge, minAge } = activeLimit;

    // Calculate exact max date candidate reaches maxAge
    const maxAgeCutoffDate = new Date(
      birthDate.getFullYear() + maxAge,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    // Calculate exact min date candidate reaches minAge
    const minAgeCutoffDate = new Date(
      birthDate.getFullYear() + minAge,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    // Case 1: Below minimum age
    if (targetDate < minAgeCutoffDate) {
      const needed = calculateExactDifference(targetDate, minAgeCutoffDate);
      return {
        status: 'underage' as const,
        title: '❌ বয়স অপ্রতুল (আবেদনযোগ্য নন)',
        badgeColor: 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]',
        message: `প্রার্থীর বয়স ন্যূনতম ${toBanglaNum(minAge)} বছরের কম।`,
        detail: `আবেদনযোগ্য হতে আরও ${toBanglaNum(needed.years ? `${needed.years} বছর ` : '')}${toBanglaNum(needed.months ? `${needed.months} মাস ` : '')}${toBanglaNum(needed.days)} দিন বাকি আছে।`
      };
    }

    // Case 2: Within age limit (Eligible)
    if (targetDate <= maxAgeCutoffDate) {
      const remaining = calculateExactDifference(targetDate, maxAgeCutoffDate);
      return {
        status: 'eligible' as const,
        title: '✅ আবেদনযোগ্য (Eligible)',
        badgeColor: 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]',
        message: `প্রার্থী ${activeLimit.name}-এর নির্ধারিত ${toBanglaNum(maxAge)} বছর বয়সসীমার আওতাভুক্ত।`,
        detail: `বয়সসীমা অতিক্রান্ত হতে আরও ${toBanglaNum(remaining.years)} বছর ${toBanglaNum(remaining.months)} মাস ${toBanglaNum(remaining.days)} দিন সময় বাকি রয়েছে।`
      };
    }

    // Case 3: Over age limit
    const exceeded = calculateExactDifference(maxAgeCutoffDate, targetDate);
    return {
      status: 'overage' as const,
      title: '❌ বয়সসীমা পার হয়ে গেছে (Not Eligible)',
      badgeColor: 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]',
      message: `প্রার্থীর বয়স ${toBanglaNum(maxAge)} বছরের সরকারি বয়সসীমা অতিক্রম করেছে।`,
      detail: `বয়সসীমার চেয়ে ${toBanglaNum(exceeded.years ? `${exceeded.years} বছর ` : '')}${toBanglaNum(exceeded.months ? `${exceeded.months} মাস ` : '')}${toBanglaNum(exceeded.days)} দিন বেশি হয়েছে।`
    };
  }, [ageResult, parsedDates, activeLimit]);

  // Copy formatted summary
  const handleCopySummary = () => {
    if (!ageResult || !eligibility) return;
    const summary = `【Utools.bd সরকারি চাকরির বয়স হিসাব】
জন্ম তারিখ: ${formatBengaliDate(birthDateStr)}
হিসাবের তারিখ: ${formatBengaliDate(targetDateStr)}
মোট বয়স: ${toBanglaNum(ageResult.years)} বছর ${toBanglaNum(ageResult.months)} মাস ${toBanglaNum(ageResult.days)} দিন
মোট দিন: ${toBanglaNum(ageResult.totalDays.toLocaleString('en-US'))} দিন | মোট সপ্তাহ: ${toBanglaNum(ageResult.totalWeeks)} সপ্তাহ
ক্যাটাগরি: ${activeLimit.name} (সর্বোচ্চ ${toBanglaNum(activeLimit.maxAge)} বছর)
স্ট্যাটাস: ${eligibility.title}
মন্তব্য: ${eligibility.detail}`;

    void copy(summary);
  };

  // Reset to defaults
  const handleReset = () => {
    setBirthDateStr('1998-05-15');
    setTargetDateStr(todayStr);
    setSelectedCategory('general');
    setCustomMaxAge(30);
    setCustomMinAge(18);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/age-calculator"
        toolName="সরকারি চাকরির বয়স ক্যালকুলেটর"
        categoryName="ক্যালকুলেটর"
        faqs={pageContent.faqs || []}
      />

      {/* Top Breadcrumb & Privacy Guarantee */}
      <ToolBreadcrumb
        toolName="বয়স ক্যালকুলেটর"
        categoryName="হিসাব ও ক্যালকুলেটর"
        categoryPath="/age-calculator"
        privacyText="১০০% ক্লায়েন্ট-সাইড • কোনো তথ্য সার্ভারে যায় না"
      />

      {/* Page Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-sm text-[#34443B] max-w-3xl leading-relaxed">
          {pageContent.introText}
        </p>
      </div>

      {/* Main Grid: Input Form & Age Limit Checker on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Date Inputs & Quota Controls (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Date Input Controls */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-5 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <CalendarDays className="w-4 h-4 text-[#0B5D3B]" />
                <span>১. তারিখ নির্বাচন করুন</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-[#084A2E] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            </div>

            {/* Birth Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#084A2E]">
                জন্ম তারিখ (Date of Birth):
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={birthDateStr}
                  onChange={(e) => setBirthDateStr(e.target.value)}
                  max={targetDateStr || todayStr}
                  className="w-full p-2.5 bg-[#F0F4F2]/30 border border-[#D5E4DB] text-sm text-[#0F1F17] font-mono focus:outline-none focus:border-[#0B5D3B] focus:bg-[#FFFFFF] rounded-lg"
                />
              </div>
              <div className="text-[11px] font-medium text-[#4A5A52] flex items-center justify-between">
                <span>প্রদর্শিত: {formatBengaliDate(birthDateStr)}</span>
                {ageResult && (
                  <span className="font-mono text-[#0B5D3B]">জন্মবার: {ageResult.birthDayOfWeek.split(' ')[0]}</span>
                )}
              </div>
            </div>

            {/* Target Date Picker */}
            <div className="space-y-1.5 pt-2 border-t border-[#D5E4DB]/60">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#084A2E]">
                  হিসাবের শেষ তারিখ (Target / Circular Date):
                </label>
                <button
                  type="button"
                  onClick={() => setTargetDateStr(todayStr)}
                  className="text-[11px] font-medium bg-[#F0F4F2] hover:bg-[#D5E4DB]/60 border border-[#D5E4DB] px-2 py-0.5 text-[#084A2E] transition-colors cursor-pointer rounded-lg"
                >
                  আজকের তারিখ
                </button>
              </div>
              <input
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className="w-full p-2.5 bg-[#F0F4F2]/30 border border-[#D5E4DB] text-sm text-[#0F1F17] font-mono focus:outline-none focus:border-[#0B5D3B] focus:bg-[#FFFFFF] rounded-lg"
              />
              <div className="text-[11px] font-medium text-[#4A5A52]">
                প্রদর্শিত: {formatBengaliDate(targetDateStr)}
              </div>
            </div>

            {/* Error Message if any */}
            {!parsedDates.isValid && parsedDates.error && (
              <div className="p-3 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center space-x-2 rounded-2xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parsedDates.error}</span>
              </div>
            )}
          </div>

          {/* Card 2: Age Limit Quota Selector */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-4 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-[#0B5D3B]" />
                <span>২. সরকারি কোটা ও বয়সসীমা নির্ধারণ</span>
              </span>
              <span className="text-[10px] font-mono bg-[#F0F4F2] text-[#084A2E] px-2 py-0.5 border border-[#D5E4DB]">
                BPSC / সার্কুলার
              </span>
            </div>

            {/* Radio / Button Grid for Quota */}
            <div className="space-y-2">
              {GOVERNMENT_QUOTA_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left p-3 border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E] shadow-xs'
                        : 'bg-[#FFFFFF] hover:bg-[#F0F4F2] border-[#D5E4DB] text-[#0F1F17]'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="font-semibold text-xs font-serif leading-snug">
                        {cat.name}
                      </div>
                      <div
                        className={`text-[11px] leading-tight line-clamp-1 ${
                          isSelected ? 'text-[#FFFFFF]/80' : 'text-[#4A5A52]'
                        }`}
                      >
                        {cat.description}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center space-x-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                          isSelected
                            ? 'bg-[#0B5D3B] border-[#0B5D3B] text-[#FFFFFF]'
                            : 'bg-[#F0F4F2] border-[#D5E4DB] text-[#084A2E]'
                        }`}
                      >
                        {cat.tag}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />}
                    </div>
                  </button>
                );
              })}

              {/* Custom Age Limit Option */}
              <button
                type="button"
                onClick={() => setSelectedCategory('custom')}
                className={`w-full text-left p-3 border transition-all cursor-pointer flex items-center justify-between ${
                  selectedCategory === 'custom'
                    ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E] shadow-xs'
                    : 'bg-[#FFFFFF] hover:bg-[#F0F4F2] border-[#D5E4DB] text-[#0F1F17]'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs font-serif leading-snug">
                    কাস্টম বয়সসীমা লিখুন (Custom Limit)
                  </div>
                  <div
                    className={`text-[11px] ${
                      selectedCategory === 'custom' ? 'text-[#FFFFFF]/80' : 'text-[#4A5A52]'
                    }`}
                  >
                    সার্কুলারের বিশেষ বয়সসীমা (যেমন: ৩৫ বা ৪০ বছর) নিজে ইনপুট দিন
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                      selectedCategory === 'custom'
                        ? 'bg-[#0B5D3B] border-[#0B5D3B] text-[#FFFFFF]'
                        : 'bg-[#F0F4F2] border-[#D5E4DB] text-[#084A2E]'
                    }`}
                  >
                    কাস্টম
                  </span>
                </div>
              </button>
            </div>

            {/* Custom Input Fields (Visible only when custom is selected) */}
            {selectedCategory === 'custom' && (
              <div className="p-3 bg-[#F0F4F2]/60 border border-[#D5E4DB] space-y-3 pt-3 rounded-2xl">
                <div className="text-xs font-bold text-[#084A2E] flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>কাস্টম বয়সসীমা কনফিগার করুন:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#4A5A52] mb-1">
                      সর্বোচ্চ বয়স (Max Age):
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="18"
                        max="70"
                        value={customMaxAge}
                        onChange={(e) => setCustomMaxAge(Math.max(18, parseInt(e.target.value) || 30))}
                        className="w-full p-2 border border-[#D5E4DB] bg-[#FFFFFF] font-mono text-sm focus:outline-none focus:border-[#0B5D3B] rounded-lg"
                      />
                      <span className="ml-2 text-xs text-[#4A5A52]">বছর</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#4A5A52] mb-1">
                      ন্যূনতম বয়স (Min Age):
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="14"
                        max="40"
                        value={customMinAge}
                        onChange={(e) => setCustomMinAge(Math.max(14, parseInt(e.target.value) || 18))}
                        className="w-full p-2 border border-[#D5E4DB] bg-[#FFFFFF] font-mono text-sm focus:outline-none focus:border-[#0B5D3B] rounded-lg"
                      />
                      <span className="ml-2 text-xs text-[#4A5A52]">বছর</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Age Breakdown & Quota Eligibility (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 3: Exact Age Primary Display */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-6 shadow-xs rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#0B5D3B]" />
                <span>৩. গণনাকৃত সঠিক বয়স (Exact Age)</span>
              </span>
              <button
                type="button"
                onClick={handleCopySummary}
                disabled={!ageResult}
                className="text-xs border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#084A2E] flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50 rounded-lg"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0B5D3B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
              </button>
            </div>

            {ageResult ? (
              <div className="space-y-6">
                {/* 3 Large Big-Block Counters: Years, Months, Days */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="bg-[#F0F4F2]/60 border border-[#D5E4DB] p-4 flex flex-col justify-center rounded-2xl">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#084A2E] tracking-tight">
                      {toBanglaNum(ageResult.years)}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#4A5A52] mt-1">
                      বছর (Years)
                    </span>
                  </div>

                  <div className="bg-[#F0F4F2]/60 border border-[#D5E4DB] p-4 flex flex-col justify-center rounded-2xl">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#084A2E] tracking-tight">
                      {toBanglaNum(ageResult.months)}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#4A5A52] mt-1">
                      মাস (Months)
                    </span>
                  </div>

                  <div className="bg-[#F0F4F2]/60 border border-[#D5E4DB] p-4 flex flex-col justify-center rounded-2xl">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#084A2E] tracking-tight">
                      {toBanglaNum(ageResult.days)}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#4A5A52] mt-1">
                      দিন (Days)
                    </span>
                  </div>
                </div>

                {/* Sub-headline representation */}
                <div className="bg-[#FFFFFF] border border-[#0B5D3B]/30 p-3 text-center text-xs sm:text-sm font-serif font-bold text-[#084A2E] rounded-2xl">
                  হিসাবের তারিখে বয়স: {toBanglaNum(ageResult.years)} বছর, {toBanglaNum(ageResult.months)} মাস এবং {toBanglaNum(ageResult.days)} দিন
                </div>

                {/* Eligibility Status Banner */}
                {eligibility && (
                  <div className={`p-4 border ${eligibility.badgeColor} space-y-2 transition-all`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {eligibility.status === 'eligible' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-[#d97706] shrink-0" />
                        )}
                        <span className="font-bold text-sm sm:text-base font-serif">
                          {eligibility.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 border border-current bg-white/40">
                        {activeLimit.name.split(' ')[0]} (≤ {toBanglaNum(activeLimit.maxAge)} বছর)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed pl-7 font-sans">
                      {eligibility.message}
                    </p>
                    <div className="text-xs font-medium pl-7 pt-1 border-t border-current/20 font-serif">
                      {eligibility.detail}
                    </div>
                  </div>
                )}

                {/* Granular Total Stats: Days, Weeks, Birthday Countdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3 space-y-1 rounded-2xl">
                    <span className="text-[11px] font-medium text-[#4A5A52] block">মোট অতিক্রান্ত দিন:</span>
                    <span className="text-lg font-bold font-mono text-[#084A2E]">
                      {toBanglaNum(ageResult.totalDays.toLocaleString('en-US'))}
                    </span>
                    <span className="text-[11px] font-medium text-[#4A5A52] block">দিন (Total Days)</span>
                  </div>

                  <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3 space-y-1 rounded-2xl">
                    <span className="text-[11px] font-medium text-[#4A5A52] block">মোট সপ্তাহ ও দিন:</span>
                    <span className="text-lg font-bold font-mono text-[#084A2E]">
                      {toBanglaNum(ageResult.totalWeeks)} সপ্তাহ
                    </span>
                    <span className="text-[11px] font-medium text-[#4A5A52] block">
                      + {toBanglaNum(ageResult.remainingDaysInWeek)} দিন
                    </span>
                  </div>

                  <div className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-3 space-y-1 rounded-2xl">
                    <span className="text-[11px] font-medium text-[#4A5A52] block">পরবর্তী জন্মদিন বাকি:</span>
                    <span className="text-lg font-bold font-mono text-[#0B5D3B]">
                      {toBanglaNum(ageResult.nextBdayDays)} দিন
                    </span>
                    <span className="text-[11px] font-medium text-[#4A5A52] block">
                      ({toBanglaNum(ageResult.nextBdayDiff.months)} মাস {toBanglaNum(ageResult.nextBdayDiff.days)} দিন)
                    </span>
                  </div>
                </div>

                {/* Additional Timeline Details */}
                <div className="border border-[#D5E4DB] bg-[#F0F4F2]/20 p-3.5 space-y-2 text-xs rounded-lg">
                  <div className="font-semibold text-[#084A2E] flex items-center space-x-1.5 font-serif">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
                    <span>গুরুত্বপূর্ণ তথ্য সারসংক্ষেপ:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#34443B]">
                    <div>
                      • জন্মের বার: <strong>{ageResult.birthDayOfWeek}</strong>
                    </div>
                    <div>
                      • মোট অতিবাহিত মাস: <strong>{toBanglaNum(ageResult.totalMonths)} মাস</strong>
                    </div>
                    <div>
                      • অতিবাহিত ঘণ্টা: <strong>{toBanglaNum(ageResult.totalHours.toLocaleString('en-US'))} ঘণ্টা</strong>
                    </div>
                    <div>
                      • হিসাবের ভিত্তি: <strong>ক্যালেন্ডার লিপ-ইয়ার নির্ভুল হিসাব</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#4A5A52] space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#D5E4DB]" />
                <p>সঠিক জন্ম তারিখ ও হিসাবের তারিখ নির্বাচন করলে বয়স প্রদর্শিত হবে।</p>
              </div>
            )}
          </div>

          {/* Quick Date Presets Helper */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 text-xs space-y-2 rounded-2xl">
            <span className="font-semibold text-[#084A2E] block font-serif">
              সাধারণ সরকারি সার্কুলার প্রিসেট (হিসাবের তারিখ পরিবর্তন):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTargetDateStr(todayStr)}
                className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer rounded-lg"
              >
                আজকের তারিখ
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setTargetDateStr(formatDateToInputString(endOfMonth));
                }}
                className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer rounded-lg"
              >
                চলতি মাসের শেষ দিন
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                  setTargetDateStr(formatDateToInputString(firstOfNextMonth));
                }}
                className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer rounded-lg"
              >
                পরবর্তী মাসের ১ম দিন
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const jan1 = new Date(now.getFullYear(), 0, 1);
                  setTargetDateStr(formatDateToInputString(jan1));
                }}
                className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2.5 py-1 text-[#0F1F17] transition-colors cursor-pointer rounded-lg"
              >
                ১ জানুয়ারি{currentYear ? ` (${toBanglaNum(currentYear)} খ্রি.)` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic CMS Sections (Guidelines, Rules, FAQs, Features, Markdown, etc.) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="age-calculator" />
    </div>
  );
};
