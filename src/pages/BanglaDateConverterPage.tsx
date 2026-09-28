import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  CalendarDays,
  ArrowLeftRight,
  Copy,
  Check,
  Share2,
  Download,
  AlertTriangle,
  Info,
  ExternalLink,
  WifiOff,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Gift,
  RefreshCw,
  Clock,
  Printer,
  FileText,
  BookmarkCheck,
} from 'lucide-react';
import { toBn } from '../utils/bnDigits.ts';
import {
  BANGLA_MONTHS,
  GREGORIAN_MONTHS_BN,
  BANGLA_WEEKDAYS,
  BANGLA_SEASONS,
  gregorianToBangla,
  banglaToGregorian,
  getHijriDate,
  checkBangladeshHoliday,
  getBanglaDateSuffix,
  BanglaDateResult,
  HijriDateResult,
} from '../utils/banglaDateConverter.ts';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import html2canvas from 'html2canvas-pro';
import pageContent from '../../content/pages/bangla-date-converter.json';

interface WikiHistoryEvent {
  year: number;
  text: string;
  thumbnailUrl?: string;
  wikiUrl?: string;
}

export const BanglaDateConverterPage: React.FC = () => {
  // Mode: 'greg2bangla' or 'bangla2greg'
  const [mode, setMode] = useState<'greg2bangla' | 'bangla2greg'>('greg2bangla');

  // Gregorian input state (YYYY-MM-DD string)
  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [gregDateStr, setGregDateStr] = useState<string>(getTodayDateString());

  // Current active Date object based on Gregorian input
  const activeDate = useMemo(() => {
    if (!gregDateStr) return new Date();
    const [y, m, d] = gregDateStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [gregDateStr]);

  // Derived Bangla and Hijri Date Results
  const banglaResult: BanglaDateResult = useMemo(() => {
    return gregorianToBangla(activeDate);
  }, [activeDate]);

  const hijriResult: HijriDateResult = useMemo(() => {
    return getHijriDate(activeDate);
  }, [activeDate]);

  // Holiday check
  const holiday = useMemo(() => {
    return checkBangladeshHoliday(activeDate, banglaResult.monthIndex, banglaResult.day);
  }, [activeDate, banglaResult]);

  // Bangla input state for reverse conversion (day, month index, year)
  const [bInputDay, setBInputDay] = useState<number>(banglaResult.day);
  const [bInputMonthIdx, setBInputMonthIdx] = useState<number>(banglaResult.monthIndex);
  const [bInputYear, setBInputYear] = useState<number>(banglaResult.year);

  // Sync Bangla inputs when Gregorian date changes
  useEffect(() => {
    setBInputDay(banglaResult.day);
    setBInputMonthIdx(banglaResult.monthIndex);
    setBInputYear(banglaResult.year);
  }, [banglaResult]);

  // Handle Bangla input changes
  const handleBanglaDateChange = (newDay: number, newMonthIdx: number, newYear: number) => {
    setBInputDay(newDay);
    setBInputMonthIdx(newMonthIdx);
    setBInputYear(newYear);

    const convertedGreg = banglaToGregorian(newDay, newMonthIdx, newYear);
    const y = convertedGreg.getFullYear();
    const m = String(convertedGreg.getMonth() + 1).padStart(2, '0');
    const d = String(convertedGreg.getDate()).padStart(2, '0');
    setGregDateStr(`${y}-${m}-${d}`);
  };

  // Reset to today
  const handleSetToday = () => {
    const todayStr = getTodayDateString();
    setGregDateStr(todayStr);
  };

  // Copy to clipboard state
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopyDate = () => {
    const textToCopy = `${banglaResult.formattedFull} | ${banglaResult.formattedGregorian} | ${hijriResult.formattedFull}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Wikipedia "On This Day" State
  const [historyEvents, setHistoryEvents] = useState<WikiHistoryEvent[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const month = String(activeDate.getMonth() + 1).padStart(2, '0');
    const day = String(activeDate.getDate()).padStart(2, '0');

    async function fetchOnThisDay() {
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        // Try backend proxy first, fallback to direct Wikipedia API
        let data: any = null;
        try {
          const res = await fetch(`/api/onthisday?month=${month}&day=${day}`);
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // Proxy failed, try direct Wikipedia API client-side
        }

        if (!data) {
          const directRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${month}/${day}`,
            { headers: { Accept: 'application/json' } }
          );
          if (directRes.ok) {
            data = await directRes.json();
          }
        }

        if (isCancelled) return;

        if (data && Array.isArray(data.selected)) {
          const events: WikiHistoryEvent[] = data.selected.slice(0, 4).map((item: any) => {
            const page = item.pages && item.pages[0];
            return {
              year: item.year,
              text: item.text,
              thumbnailUrl: page?.thumbnail?.source,
              wikiUrl: page?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(item.year)}`,
            };
          });
          setHistoryEvents(events);
        } else {
          setHistoryEvents([]);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setHistoryError('ইন্টারনেট সংযোগ প্রয়োজন এই ফিচারের জন্য');
        }
      } finally {
        if (!isCancelled) {
          setIsHistoryLoading(false);
        }
      }
    }

    fetchOnThisDay();

    return () => {
      isCancelled = true;
    };
  }, [activeDate]);

  // Birthday & Anniversary Card State
  const [cardName, setCardName] = useState<string>('');
  const [cardBirthDate, setCardBirthDate] = useState<string>(getTodayDateString());
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  const cardBanglaDate = useMemo(() => {
    if (!cardBirthDate) return null;
    const [y, m, d] = cardBirthDate.split('-').map(Number);
    if (!y || !m || !d) return null;
    return gregorianToBangla(new Date(y, m - 1, d));
  }, [cardBirthDate]);

  const handleDownloadCard = async () => {
    if (!cardPreviewRef.current) return;
    setIsGeneratingCard(true);
    try {
      const canvas = await html2canvas(cardPreviewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B5D3B',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Bangla-Birthday-${cardBanglaDate?.dayWithSuffix}-${cardBanglaDate?.monthName}.png`;
      a.click();
    } catch (e) {
      console.error('Failed to generate image', e);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!cardBanglaDate) return;
    const nameStr = cardName ? `${cardName} এর ` : 'আমার ';
    const text = `🎉 ${nameStr}বাংলা জন্মদিন: ${cardBanglaDate.dayWithSuffix} ${cardBanglaDate.monthName}, ${cardBanglaDate.yearBn} বঙ্গাব্দ (${cardBanglaDate.seasonName})! \n\nআপনার বাংলা জন্মদিন জানুন Utools.bd থেকে: https://utools.bd/bangla-date-converter`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Certificate / Snapshot Card ref for main converter
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [isDownloadingSnapshot, setIsDownloadingSnapshot] = useState<boolean>(false);

  const handleDownloadSnapshot = async () => {
    if (!snapshotRef.current) return;
    setIsDownloadingSnapshot(true);
    try {
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Bangla-Date-${banglaResult.day}-${banglaResult.monthName}.png`;
      a.click();
    } catch (e) {
      console.error('Failed to export snapshot', e);
    } finally {
      setIsDownloadingSnapshot(false);
    }
  };

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = pageContent.faqs || [];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta name="description" content={pageContent.metaDescription} />
        <link rel="canonical" href="https://utools.bd/bangla-date-converter" />
        <meta property="og:title" content={pageContent.metaTitle} />
        <meta property="og:description" content={pageContent.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://utools.bd/bangla-date-converter" />
        <meta property="og:image" content="https://utools.bd/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta name="twitter:description" content={pageContent.metaDescription} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png?v=2" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#FAFAF7] text-[#0F1F17] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-[#4A5A52] flex items-center space-x-2">
            <Link to="/" className="hover:text-[#0B5D3B] transition-colors">
              হোম
            </Link>
            <span>/</span>
            <span className="text-[#0B5D3B] font-medium">{pageContent.title}</span>
          </nav>

          {/* 1. Header / Hero Section */}
          <section className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3D0] text-[#B45309] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
              <span>{pageContent.badgeText}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F1F17] tracking-tight">
              {pageContent.title}
            </h1>
            <p className="text-sm sm:text-base text-[#4A5A52] max-w-2xl mx-auto">
              {pageContent.subtitle}
            </p>
          </section>

          {/* 2. Main Converter Card (Prominent & Above Fold) */}
          <div className="bg-white border border-[#D5E4DB] rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5E4DB] pb-4">
              <div className="inline-flex p-1 bg-[#F0F4F2] rounded-xl border border-[#D5E4DB]/60">
                <button
                  type="button"
                  onClick={() => setMode('greg2bangla')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'greg2bangla'
                      ? 'bg-[#0B5D3B] text-white shadow-xs'
                      : 'text-[#4A5A52] hover:text-[#0F1F17]'
                  }`}
                >
                  ইংরেজি → বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setMode('bangla2greg')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'bangla2greg'
                      ? 'bg-[#0B5D3B] text-white shadow-xs'
                      : 'text-[#4A5A52] hover:text-[#0F1F17]'
                  }`}
                >
                  বাংলা → ইংরেজি
                </button>
              </div>

              {/* Quick Today Button */}
              <button
                type="button"
                onClick={handleSetToday}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B5D3B] bg-[#E6F4EC] hover:bg-[#D5E4DB] border border-[#0B5D3B]/20 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0B5D3B]" />
                <span>আজকের তারিখ</span>
              </button>
            </div>

            {/* Input Form based on Active Mode */}
            {mode === 'greg2bangla' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#4A5A52]">
                  ইংরেজি তারিখ নির্বাচন করুন (Calendar Picker):
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[240px]">
                    <input
                      type="date"
                      value={gregDateStr}
                      onChange={(e) => setGregDateStr(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] focus:outline-hidden rounded-xl text-sm font-mono text-[#0F1F17]"
                    />
                  </div>
                  <span className="text-xs text-[#4A5A52]">
                    (নির্বাচিত: {toBn(activeDate.getDate())} {GREGORIAN_MONTHS_BN[activeDate.getMonth()]}{' '}
                    {toBn(activeDate.getFullYear())})
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#4A5A52]">
                  বাংলা দিন, মাস ও বছর নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Day Picker */}
                  <div>
                    <label className="block text-[11px] text-[#4A5A52] mb-1">তারিখ / দিন:</label>
                    <select
                      value={bInputDay}
                      onChange={(e) =>
                        handleBanglaDateChange(Number(e.target.value), bInputMonthIdx, bInputYear)
                      }
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] rounded-xl text-xs font-mono font-medium cursor-pointer"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {getBanglaDateSuffix(d)} ({toBn(d)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Picker */}
                  <div>
                    <label className="block text-[11px] text-[#4A5A52] mb-1">মাস:</label>
                    <select
                      value={bInputMonthIdx}
                      onChange={(e) =>
                        handleBanglaDateChange(bInputDay, Number(e.target.value), bInputYear)
                      }
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] rounded-xl text-xs font-medium cursor-pointer"
                    >
                      {BANGLA_MONTHS.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m} ({toBn(idx + 1)}ম মাস)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Picker */}
                  <div>
                    <label className="block text-[11px] text-[#4A5A52] mb-1">বঙ্গাব্দ (বছর):</label>
                    <input
                      type="number"
                      min={1200}
                      max={1600}
                      value={bInputYear}
                      onChange={(e) =>
                        handleBanglaDateChange(bInputDay, bInputMonthIdx, Number(e.target.value) || 1433)
                      }
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] rounded-xl text-xs font-mono font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Output Display Card (Primary prominent result) */}
            <div
              ref={snapshotRef}
              className="relative bg-gradient-to-br from-[#E6F4EC]/70 via-[#F0F4F2] to-[#FFFFFF] border-2 border-[#0B5D3B]/30 rounded-2xl p-5 sm:p-7 space-y-4 shadow-xs"
            >
              {/* Header inside result card */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5E4DB]/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-xs font-bold text-[#084A2E] tracking-wide uppercase">
                    সমতুল্য বাংলা তারিখ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyDate}
                    className="p-1.5 bg-white hover:bg-[#E6F4EC] border border-[#D5E4DB] rounded-lg text-[#084A2E] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="তারিখ কপি করুন"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                        <span className="text-[#10b981] font-semibold text-[11px]">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#4A5A52]" />
                        <span className="text-[11px] text-[#4A5A52]">কপি</span>
                      </>
                    )}
                  </button>

                  {/* Snapshot / Card download button */}
                  <button
                    type="button"
                    onClick={handleDownloadSnapshot}
                    disabled={isDownloadingSnapshot}
                    className="p-1.5 bg-white hover:bg-[#E6F4EC] border border-[#D5E4DB] rounded-lg text-[#084A2E] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="ছবি হিসেবে সংরক্ষণ করুন"
                  >
                    <Download className="w-3.5 h-3.5 text-[#4A5A52]" />
                    <span className="text-[11px] text-[#4A5A52]">ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* Main Bangla Result Typography */}
              <div className="space-y-1">
                <div className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold text-[#084A2E] leading-tight">
                  <span className="font-mono text-[#0B5D3B]">{banglaResult.dayWithSuffix}</span>{' '}
                  <span>{banglaResult.monthName}</span>,{' '}
                  <span className="font-mono">{banglaResult.yearBn}</span>{' '}
                  <span className="text-xl sm:text-2xl text-[#0F1F17] font-semibold">বঙ্গাব্দ</span>
                </div>
                <div className="text-base sm:text-lg text-[#4A5A52] font-medium flex flex-wrap items-center gap-2">
                  <span>বার: <strong className="text-[#084A2E]">{banglaResult.weekdayName}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-[#D5E4DB] text-xs font-semibold text-[#0B5D3B]">
                    ঋতু: {banglaResult.seasonName}
                  </span>
                </div>
              </div>

              {/* Gregorian Equivalent Subtext */}
              <div className="pt-2 border-t border-[#D5E4DB]/60 flex flex-wrap items-center justify-between text-xs sm:text-sm text-[#4A5A52] gap-2">
                <div>
                  ইংরেজি তারিখ:{' '}
                  <strong className="text-[#0F1F17] font-mono">
                    {toBn(activeDate.getDate())} {GREGORIAN_MONTHS_BN[activeDate.getMonth()]}{' '}
                    {toBn(activeDate.getFullYear())} খ্রিস্টাব্দ
                  </strong>{' '}
                  ({activeDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })})
                </div>

                {/* Government Holiday Badge (if applicable) */}
                {holiday && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF3D0] border border-[#F5A524]/40 rounded-full text-xs font-bold text-[#B45309]">
                    <span>🎉 আজ সরকারি ছুটি:</span>
                    <span>{holiday.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Hijri Date Section (Dedicated card below converter) */}
          <section className="bg-white border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F1F17]">হিজরি তারিখ (Islamic Hijri Date)</h2>
                  <p className="text-xs text-[#4A5A52]">উম্মুল কুরা প্রমিত ইসলামিক ক্যালেন্ডার হিসাব</p>
                </div>
              </div>

              <div
                className="group relative cursor-pointer"
                title="হিজরি তারিখ গাণিতিক অ্যালগরিদমে নির্ণয় করা হয়"
              >
                <Info className="w-4 h-4 text-[#4A5A52] hover:text-[#0B5D3B]" />
              </div>
            </div>

            {/* Hijri Output Display */}
            <div className="p-4 bg-[#F8FAF9] border border-[#D5E4DB] rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#4A5A52] block mb-0.5">নির্ধারিত হিজরি সন ও তারিখ:</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#084A2E]">
                  {hijriResult.formattedFull}
                </span>
              </div>
              <div className="text-xs font-mono text-[#0B5D3B] bg-[#E6F4EC] px-3 py-1 rounded-md border border-[#0B5D3B]/20">
                {hijriResult.day} / {hijriResult.monthIndex + 1} / {hijriResult.year} AH
              </div>
            </div>

            {/* Mandatory Disclaimer Banner */}
            <div className="p-3 bg-[#FEF3D0] border border-[#F5A524]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#92400e]">
              <AlertTriangle className="w-4 h-4 text-[#F5A524] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">সতর্কীকরণ ও ধর্মীয় দিকনির্দেশনা: </span>
                <span>
                  এটি একটি গাণিতিক আনুমানিক তারিখ, যা আন্তর্জাতিক মানদণ্ডে হিসাব করা হয়। চাঁদের দেখার
                  ভিত্তিতে সরকারি চাঁদ দেখা কমিটির ঘোষণার সাথে এই তারিখ ১ দিন আগে-পরে হতে পারে। রোজা,
                  ঈদ ও অন্যান্য ধর্মীয় উৎসবের চূড়ান্ত তারিখের জন্য সরকারি চাঁদ দেখা কমিটির আনুষ্ঠানিক
                  বিজ্ঞপ্তি অনুসরণ করুন।
                </span>
              </div>
            </div>
          </section>

          {/* 4. "এই দিনে ইতিহাসে" সেকশন (Wikipedia On This Day) */}
          <section data-nosnippet className="bg-white border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5E4DB] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F1F17]">
                    📅 {toBn(activeDate.getDate())} {GREGORIAN_MONTHS_BN[activeDate.getMonth()]}-এ ইতিহাসে যা ঘটেছিল
                  </h2>
                  <p className="text-xs text-[#4A5A52]">আজকের এই দিনের প্রধান ঐতিহাসিক ঘটনাবলি</p>
                </div>
              </div>

              {/* Attribution */}
              <a
                href={`https://en.wikipedia.org/wiki/${activeDate.toLocaleString('en-US', { month: 'long' })}_${activeDate.getDate()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#4A5A52] hover:text-[#0B5D3B] bg-[#F0F4F2] px-2.5 py-1 rounded-md transition-colors"
              >
                <span>Source: Wikipedia</span>
                <ExternalLink className="w-3 h-3 text-[#0B5D3B]" />
              </a>
            </div>

            {/* Events List / Loading / Fallback */}
            {isHistoryLoading ? (
              // Skeleton cards
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#F8FAF9] border border-[#D5E4DB] rounded-xl animate-pulse space-y-2.5"
                  >
                    <div className="w-16 h-4 bg-[#D5E4DB] rounded" />
                    <div className="w-full h-3 bg-[#D5E4DB]/70 rounded" />
                    <div className="w-3/4 h-3 bg-[#D5E4DB]/50 rounded" />
                  </div>
                ))}
              </div>
            ) : historyError ? (
              // Network Error / Fallback State
              <div className="p-6 text-center bg-[#F8FAF9] border border-dashed border-[#D5E4DB] rounded-xl space-y-2">
                <WifiOff className="w-8 h-8 text-[#4A5A52] mx-auto opacity-60" />
                <p className="text-xs text-[#4A5A52] font-medium">{historyError}</p>
                <p className="text-[11px] text-[#4A5A52]/80">
                  তারিখ রূপান্তর ও অন্যান্য সব ফিচার ব্রাউজারে স্বাভাবিকভাবে সক্রিয় রয়েছে।
                </p>
              </div>
            ) : historyEvents.length > 0 ? (
              // Events grid
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {historyEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#F8FAF9] hover:bg-[#F0F4F2] border border-[#D5E4DB] rounded-xl transition-all flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      {evt.thumbnailUrl ? (
                        <img
                          src={evt.thumbnailUrl}
                          alt="Historical event thumbnail"
                          className="w-14 h-14 rounded-lg object-cover border border-[#D5E4DB] shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#E6F4EC] border border-[#D5E4DB] shrink-0 flex items-center justify-center text-[#0B5D3B]">
                          <FileText className="w-6 h-6 opacity-60" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="inline-block text-xs font-bold text-[#0B5D3B] bg-white px-2 py-0.5 rounded border border-[#0B5D3B]/20 font-mono">
                          সাল: {toBn(evt.year)} ({evt.year})
                        </span>
                        <p className="text-xs text-[#0F1F17] line-clamp-3 leading-relaxed">
                          {evt.text}
                        </p>
                      </div>
                    </div>

                    {evt.wikiUrl && (
                      <div className="pt-2 border-t border-[#D5E4DB]/50 flex justify-end">
                        <a
                          href={evt.wikiUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 text-[11px] text-[#0B5D3B] hover:underline font-semibold"
                        >
                          <span>আরো পড়ুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#4A5A52] bg-[#F8FAF9] rounded-xl">
                এই দিনের জন্য কোনো নির্বাচিত উইকিপিডিয়া ইভেন্ট খুঁজে পাওয়া যায়নি।
              </div>
            )}
          </section>

          {/* 5. জন্মদিন/বার্ষিকী সেভ ও শেয়ার কার্ড (Instagram Story / Square Aspect) */}
          <section className="bg-white border border-[#D5E4DB] rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#D5E4DB] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3D0] text-[#B45309] flex items-center justify-center">
                  <Gift className="w-4 h-4 text-[#F5A524]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F1F17]">
                    বাংলা জন্মদিন ও বার্ষিকী কার্ড জেনারেটর
                  </h2>
                  <p className="text-xs text-[#4A5A52]">
                    আপনার বা প্রিয়জনের বাংলা জন্মদিন বের করে সরাসরি WhatsApp ও সোশ্যাল মিডিয়ায় শেয়ার করুন
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Inputs (Left side) */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A5A52] mb-1">
                    নাম (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="যেমন: আশরাফুল ইসলাম"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5A52] mb-1">
                    ইংরেজি জন্মতারিখ:
                  </label>
                  <input
                    type="date"
                    value={cardBirthDate}
                    onChange={(e) => setCardBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] rounded-xl text-xs font-mono"
                  />
                </div>

                {cardBanglaDate && (
                  <div className="p-3 bg-[#E6F4EC] border border-[#0B5D3B]/20 rounded-xl text-xs text-[#084A2E] space-y-1">
                    <span className="font-semibold block">নির্ধারিত বাংলা জন্মদিন:</span>
                    <p className="font-bold text-sm">
                      {cardBanglaDate.dayWithSuffix} {cardBanglaDate.monthName} ({cardBanglaDate.seasonName})
                    </p>
                    <p className="text-[11px] text-[#4A5A52]">
                      বঙ্গাব্দ: {cardBanglaDate.yearBn} | বার: {cardBanglaDate.weekdayName}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp-এ শেয়ার</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    disabled={isGeneratingCard}
                    className="flex-1 py-2.5 px-4 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGeneratingCard ? 'তৈরি হচ্ছে...' : 'ছবি ডাউনলোড'}</span>
                  </button>
                </div>
              </div>

              {/* Card Preview (Right side) */}
              <div className="lg:col-span-7 flex justify-center">
                <div
                  ref={cardPreviewRef}
                  className="w-full max-w-[340px] aspect-square rounded-2xl p-6 text-white bg-gradient-to-br from-[#0B5D3B] via-[#084A2E] to-[#042818] shadow-lg flex flex-col justify-between relative overflow-hidden border border-white/20 select-none"
                >
                  {/* Decorative backdrop shapes */}
                  <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#F5A524]/10 pointer-events-none" />

                  {/* Card Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#F5A524]" />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-white/90">
                        {cardName ? `${cardName} এর জন্মবার্ষিকী` : 'বাংলা শুভ জন্মতিথি'}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60 font-mono">Utools.bd</span>
                  </div>

                  {/* Card Center Output */}
                  <div className="relative z-10 text-center space-y-2 py-4">
                    <p className="text-xs text-white/80">আপনার জন্মতিথি বাংলায়:</p>
                    <div className="text-3xl font-extrabold text-[#FEF3D0] tracking-tight leading-tight">
                      {cardBanglaDate?.dayWithSuffix} {cardBanglaDate?.monthName}
                    </div>
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/90 backdrop-blur-xs">
                      {cardBanglaDate?.yearBn} বঙ্গাব্দ • {cardBanglaDate?.seasonName}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="relative z-10 border-t border-white/15 pt-2 flex items-center justify-between text-[11px] text-white/70">
                    <span>বার: {cardBanglaDate?.weekdayName}</span>
                    <span>ইংরেজি: {cardBanglaDate?.formattedGregorian}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic CMS Sections (FAQs, Features, Steps, Guidelines, Markdown, etc.) */}
          <CmsDynamicContent content={pageContent} />

          {/* 7. Related Tools Component */}
          <RelatedTools currentToolId="bangla-date-converter" />
        </div>
      </main>
    </>
  );
};
