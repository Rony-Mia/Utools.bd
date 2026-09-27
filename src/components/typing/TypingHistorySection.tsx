import React, { useState, useEffect, useRef } from 'react';
import {
  TypingHistoryItem,
  getHistory,
  getPersonalBest,
  clearHistory,
  exportHistoryJson,
  importBackup,
} from '../../utils/typingHistory.ts';
import {
  TrendingUp,
  Award,
  Download,
  Upload,
  Trash2,
  Clock,
  Globe,
  Calendar,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface TypingHistorySectionProps {
  onStartTest: () => void;
  refreshTrigger?: number;
}

export const TypingHistorySection: React.FC<TypingHistorySectionProps> = ({
  onStartTest,
  refreshTrigger = 0,
}) => {
  const [history, setHistory] = useState<TypingHistoryItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'bangla' | 'english'>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  // Modals & States
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history
  const reloadData = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    reloadData();
  }, [refreshTrigger]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Filtered items
  const filteredHistory = history.filter((item) => {
    if (selectedLanguage !== 'all' && item.language !== selectedLanguage) return false;
    if (selectedMode !== 'all' && item.mode !== selectedMode) return false;
    return true;
  });

  const personalBest = getPersonalBest(
    selectedLanguage === 'all' ? undefined : selectedLanguage,
    selectedMode === 'all' ? undefined : selectedMode
  );

  // Clear handler
  const handleConfirmClear = () => {
    clearHistory();
    reloadData();
    setShowClearConfirm(false);
    showFeedback('success', 'সকল টাইপিং হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Export handler
  const handleExport = () => {
    try {
      const json = exportHistoryJson();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `utools-typing-backup-${dateStr}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showFeedback('success', 'হিস্ট্রি ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন হয়েছে।');
    } catch (err: any) {
      showFeedback('error', 'হিস্ট্রি এক্সপোর্ট করতে সমস্যা হয়েছে: ' + (err?.message || 'unknown error'));
    }
  };

  // File input change handler for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPendingImportData(content);
        setShowImportModal(true);
      }
    };
    reader.onerror = () => {
      showFeedback('error', 'ফাইলটি পড়তে ব্যর্থ হয়েছে।');
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Execute Import (merge or replace)
  const handleExecuteImport = (mode: 'merge' | 'replace') => {
    if (!pendingImportData) return;
    const result = importBackup(pendingImportData, mode);
    setShowImportModal(false);
    setPendingImportData(null);

    if (result.success) {
      reloadData();
      showFeedback(
        'success',
        `সফলভাবে ব্যাকআপ রিস্টোর করা হয়েছে! (মোট ${result.count}টি রেকর্ড সংরক্ষিত)`
      );
    } else {
      showFeedback('error', result.error || 'ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে।');
    }
  };

  // Progression Line Data for plain SVG chart (reverse chronological for display)
  const chartItems = [...filteredHistory].reverse().slice(-20); // up to last 20 tests

  return (
    <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-3xl p-5 sm:p-7 md:p-8 shadow-xs space-y-7">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D5E4DB]/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F1F17]">
              তোমার উন্নতি (Your Progress)
            </h3>
            <p className="text-xs text-[#4A5A52]">
              আপনার ডিভাইসে সংরক্ষিত টাইপিং পারফরম্যান্স ও ব্যক্তিগত সেরা রেকর্ড
            </p>
          </div>
        </div>

        {/* Action Buttons: Export / Import / Clear */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl border border-[#D5E4DB] bg-white hover:bg-[#F0F4F2] disabled:opacity-50 text-xs font-semibold text-[#084A2E] flex items-center gap-1.5 transition-all cursor-pointer"
            title="হিস্ট্রি JSON ফাইল হিসেবে ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ব্যাকআপ ডাউনলোড</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-[#D5E4DB] bg-white hover:bg-[#F0F4F2] text-xs font-semibold text-[#084A2E] flex items-center gap-1.5 transition-all cursor-pointer"
            title="পূর্বে সংরক্ষিত JSON ব্যাকআপ থেকে হিস্ট্রি ফিরিয়ে আনুন"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">রিস্টোর</span>
          </button>

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="হিস্ট্রি মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ক্লিয়ার</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          role="status"
          className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2 animate-fadeIn ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Language Filter */}
        <div className="flex items-center gap-1 bg-[#F0F4F2] p-1 rounded-xl border border-[#D5E4DB]">
          <button
            type="button"
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedLanguage === 'all'
                ? 'bg-white text-[#0B5D3B] shadow-2xs'
                : 'text-[#4A5A52] hover:text-[#0F1F17]'
            }`}
          >
            সব ভাষা
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('bangla')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedLanguage === 'bangla'
                ? 'bg-white text-[#0B5D3B] shadow-2xs'
                : 'text-[#4A5A52] hover:text-[#0F1F17]'
            }`}
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('english')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedLanguage === 'english'
                ? 'bg-white text-[#0B5D3B] shadow-2xs'
                : 'text-[#4A5A52] hover:text-[#0F1F17]'
            }`}
          >
            English
          </button>
        </div>

        {/* Mode Filter */}
        <div className="flex items-center gap-1 bg-[#F0F4F2] p-1 rounded-xl border border-[#D5E4DB] overflow-x-auto max-w-full">
          {['all', '15', '30', '60', '120', 'custom'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMode(m)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedMode === m
                  ? 'bg-white text-[#0B5D3B] shadow-2xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
            >
              {m === 'all' ? 'সব সময়' : m === 'custom' ? 'কাস্টম' : `${m}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Empty State OR Active Stats */}
      {history.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-3xl bg-[#F8FAF9] border-2 border-dashed border-[#D5E4DB] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4EC] text-[#0B5D3B] mx-auto flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#0F1F17]">
              এখনো কোনো টেস্ট দেননি
            </h4>
            <p className="text-xs text-[#4A5A52] max-w-md mx-auto leading-relaxed">
              একটি টাইপিং টেস্ট দিয়ে শুরু করুন এবং আপনার গতি ও নির্ভুলতার উন্নতি স্বয়ংক্রিয়ভাবে ট্র্যাক করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={onStartTest}
            className="py-2.5 px-6 rounded-xl bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>প্রথম টেস্ট শুরু করুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Personal Best & High-level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Personal Best Card */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#0B5D3B] to-[#084A2E] rounded-3xl p-5 sm:p-6 text-white shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#F5A524]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                    ব্যক্তিগত সেরা (Personal Best)
                  </span>
                </div>
                <span className="text-[10px] text-white/70 font-mono">Utools.bd</span>
              </div>

              {personalBest ? (
                <div className="py-4 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-[#FEF3D0] leading-none">
                      {personalBest.wpm}
                    </span>
                    <span className="text-xs font-bold uppercase text-white/80">Net WPM</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/85">
                    <span>নির্ভুলতা: <strong>{personalBest.accuracy}%</strong></span>
                    <span>•</span>
                    <span className="capitalize">{personalBest.language === 'bangla' ? 'বাংলা' : 'English'}</span>
                    <span>•</span>
                    <span>{personalBest.mode === 'custom' ? 'কাস্টম' : `${personalBest.mode} সে.`}</span>
                  </div>

                  <p className="text-[10px] text-white/60 font-mono pt-1">
                    তারিখ: {new Date(personalBest.date).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-xs text-white/70 text-center">
                  এই ফিল্টারের জন্য কোনো রেকর্ড পাওয়া যায়নি
                </div>
              )}
            </div>

            {/* Progress Progression SVG Graph (Right) */}
            <div className="md:col-span-7 bg-[#F8FAF9] rounded-3xl p-4 sm:p-5 border border-[#D5E4DB] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F1F17]">WPM উন্নতির গ্রাফ</span>
                <span className="text-[11px] text-[#4A5A52]">
                  সর্বশেষ {chartItems.length}টি টেস্টের ট্র্যাকিং
                </span>
              </div>

              {chartItems.length >= 2 ? (
                <div className="w-full select-none">
                  {(() => {
                    const maxVal = Math.max(40, ...chartItems.map((i) => i.wpm));
                    const width = 500;
                    const height = 120;
                    const padX = 20;
                    const padY = 16;
                    const chartW = width - padX * 2;
                    const chartH = height - padY * 2;

                    const points = chartItems
                      .map((item, idx) => {
                        const x = padX + (idx / (chartItems.length - 1)) * chartW;
                        const y = padY + chartH - (item.wpm / maxVal) * chartH;
                        return `${x},${y}`;
                      })
                      .join(' ');

                    return (
                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                        <polyline
                          fill="none"
                          stroke="#0B5D3B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                        {chartItems.map((item, idx) => {
                          const x = padX + (idx / (chartItems.length - 1)) * chartW;
                          const y = padY + chartH - (item.wpm / maxVal) * chartH;
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="3.5"
                              fill="#FFFFFF"
                              stroke="#0B5D3B"
                              strokeWidth="2"
                            >
                              <title>{`${item.wpm} WPM (${item.accuracy}%)`}</title>
                            </circle>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#4A5A52]">
                  আরও কয়েকটি টেস্ট দিন, তাহলে আপনার উন্নতির গ্রাফ এখানে স্বয়ংক্রিয়ভাবে তৈরি হবে।
                </div>
              )}

              <div className="text-[10px] text-[#4A5A52] flex justify-between">
                <span>পুরোনো</span>
                <span>সাম্প্রতিক</span>
              </div>
            </div>
          </div>

          {/* Recent History Table (Desktop) / Cards (Mobile) */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#0F1F17]">
              সাম্প্রতিক টেস্টসমূহ (সর্বশেষ {Math.min(10, filteredHistory.length)}টি)
            </h4>

            {filteredHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#4A5A52] bg-[#F8FAF9] rounded-2xl border border-[#D5E4DB]">
                এই ফিল্টারে কোনো টেস্টের ইতিহাস পাওয়া যায়নি।
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#D5E4DB]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAF9] text-[#4A5A52] font-semibold border-b border-[#D5E4DB]">
                      <tr>
                        <th className="py-3 px-4">তারিখ ও সময়</th>
                        <th className="py-3 px-4">ভাষা</th>
                        <th className="py-3 px-4">মোড</th>
                        <th className="py-3 px-4">Net WPM</th>
                        <th className="py-3 px-4">নির্ভুলতা</th>
                        <th className="py-3 px-4">ভুল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5E4DB]/60 bg-white">
                      {filteredHistory.slice(0, 10).map((item) => (
                        <tr key={item.id} className="hover:bg-[#F8FAF9]/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-[#4A5A52]">
                            {new Date(item.date).toLocaleDateString('bn-BD')} {new Date(item.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 capitalize font-semibold text-[#0F1F17]">
                            {item.language === 'bangla' ? 'বাংলা' : 'English'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#4A5A52]">
                            {item.mode === 'custom' ? 'কাস্টম' : `${item.mode}s`}
                          </td>
                          <td className="py-3 px-4 font-bold font-mono text-[#0B5D3B] text-sm">
                            {item.wpm}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#0F1F17]">
                            {item.accuracy}%
                          </td>
                          <td className="py-3 px-4 font-mono text-red-600">
                            {item.uncorrectedErrors}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-2.5">
                  {filteredHistory.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-[#D5E4DB] bg-[#F8FAF9] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0F1F17] capitalize">
                          {item.language === 'bangla' ? 'বাংলা' : 'English'} • {item.mode === 'custom' ? 'কাস্টম' : `${item.mode}s`}
                        </span>
                        <span className="text-[10px] text-[#4A5A52] font-mono">
                          {new Date(item.date).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D5E4DB]/40">
                        <span className="text-base font-bold font-mono text-[#0B5D3B]">
                          {item.wpm} <span className="text-[10px] uppercase font-sans text-[#4A5A52]">WPM</span>
                        </span>
                        <span className="font-mono text-[#0F1F17]">
                          নির্ভুলতা: <strong>{item.accuracy}%</strong>
                        </span>
                        <span className="font-mono text-red-600">
                          ভুল: {item.uncorrectedErrors}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear History */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-xl border border-[#D5E4DB]">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0F1F17]">
                আপনি কি নিশ্চিত?
              </h4>
              <p className="text-xs text-[#4A5A52] mt-1 leading-relaxed">
                আপনার সব typing history এই ডিভাইস থেকে মুছে যাবে। এই কাজটি আর পূর্বাবস্থায় ফেরানো যাবে না।
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#D5E4DB] text-xs font-semibold text-[#4A5A52] hover:bg-[#F0F4F2] transition-all cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                হিস্ট্রি মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Backup Options (Merge or Replace) */}
      {showImportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-xl border border-[#D5E4DB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F1F17]">
                  ব্যাকআপ কীভাবে রিস্টোর করবেন?
                </h4>
                <p className="text-xs text-[#4A5A52]">
                  আপনার পূর্ববর্তী ফলাফলের সাথে নতুন ডেটা যোগ করতে পছন্দ নির্বাচন করুন
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <button
                type="button"
                onClick={() => handleExecuteImport('merge')}
                className="w-full p-4 rounded-2xl border border-[#D5E4DB] hover:border-[#0B5D3B] hover:bg-[#F8FAF9] text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-[#0B5D3B] flex items-center justify-between">
                  <span>মার্জ (Merge) — প্রস্তাবিত</span>
                  <span className="text-[10px] bg-[#E6F4EC] px-2 py-0.5 rounded-full">যোগ হবে</span>
                </div>
                <p className="text-[#4A5A52] text-[11px] mt-1">
                  বর্তমান হিস্ট্রির সাথে ব্যাকআপের টেস্টগুলো যুক্ত হবে (কোনো ডুপ্লিকেট হবে না)।
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteImport('replace')}
                className="w-full p-4 rounded-2xl border border-[#D5E4DB] hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-amber-700 flex items-center justify-between">
                  <span>প্রতিস্থাপন (Replace)</span>
                  <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">মুছে নতুন বসবে</span>
                </div>
                <p className="text-[#4A5A52] text-[11px] mt-1">
                  বর্তমান হিস্ট্রি মুছে দিয়ে ব্যাকআপের ডেটা দিয়ে সম্পূর্ণ প্রতিস্থাপন করবে।
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setPendingImportData(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#D5E4DB] text-xs font-semibold text-[#4A5A52] hover:bg-[#F0F4F2] transition-all cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
