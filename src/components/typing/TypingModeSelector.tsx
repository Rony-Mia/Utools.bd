import React from 'react';
import { TypingLanguage, TypingDuration, TypingDifficulty, TypingKeyboardLayout } from '../../utils/typingTest.ts';
import { RotateCcw, Globe, Clock, Sparkles, Keyboard } from 'lucide-react';

interface TypingModeSelectorProps {
  language: TypingLanguage;
  onLanguageChange: (lang: TypingLanguage) => void;
  keyboardLayout: TypingKeyboardLayout;
  onKeyboardLayoutChange: (layout: TypingKeyboardLayout) => void;
  duration: TypingDuration;
  onDurationChange: (dur: TypingDuration) => void;
  difficulty: TypingDifficulty;
  onDifficultyChange: (diff: TypingDifficulty) => void;
  onRestart: () => void;
  isRunning: boolean;
}

const DURATIONS: Array<{ id: TypingDuration; label: string; wordCount: string; tooltip: string }> = [
  { id: 15, label: '১৫ সে.', wordCount: '৩৫ শব্দ', tooltip: '১৫ সেকেন্ড: ৩৫টি শব্দ (দ্রুতগতির টাইপারের জন্য নিরাপদ)' },
  { id: 30, label: '৩০ সে.', wordCount: '৬০ শব্দ', tooltip: '৩০ সেকেন্ড: ৬০টি শব্দ (টেক্সট যেন কম না পড়ে)' },
  { id: 60, label: '৬০ সে.', wordCount: '১২০ শব্দ', tooltip: '৬০ সেকেন্ড: ১২০টি শব্দ (স্ট্যান্ডার্ড মোড)' },
  { id: 120, label: '১২০ সে.', wordCount: '২৫০ শব্দ', tooltip: '১২০ সেকেন্ড: ২৫০টি শব্দ (২ মিনিটের টেস্টের জন্য আবশ্যক)' },
  { id: 'custom', label: 'কাস্টম', wordCount: '৫০০ শব্দ', tooltip: 'কাস্টম মোড: ডাইনামিক ৫০০ শব্দ বা নিজের টেক্সট' },
];

export const TypingModeSelector: React.FC<TypingModeSelectorProps> = ({
  language,
  onLanguageChange,
  keyboardLayout,
  onKeyboardLayoutChange,
  duration,
  onDurationChange,
  difficulty,
  onDifficultyChange,
  onRestart,
  isRunning,
}) => {
  const handleLanguageClick = (newLang: TypingLanguage) => {
    if (newLang === language) return;
    if (isRunning) {
      if (!window.confirm('টেস্ট চলাকালীন ভাষা পরিবর্তন করলে বর্তমান টেস্ট রিসেট হয়ে যাবে। এগিয়ে যাবেন?')) {
        return;
      }
    }
    onLanguageChange(newLang);
  };

  const handleKeyboardLayoutClick = (newLayout: TypingKeyboardLayout) => {
    if (newLayout === keyboardLayout) return;
    if (isRunning) {
      if (!window.confirm('কিবোর্ড লেআউট পরিবর্তন করলে বর্তমান টেস্ট রিসেট হবে। এগিয়ে যাবেন?')) {
        return;
      }
    }
    onKeyboardLayoutChange(newLayout);
  };

  const handleDurationClick = (newDur: TypingDuration) => {
    if (newDur === duration) return;
    if (isRunning) {
      if (!window.confirm('টেস্ট চলাকালীন সময় পরিবর্তন করলে টেস্ট রিসেট হবে। এগিয়ে যাবেন?')) {
        return;
      }
    }
    onDurationChange(newDur);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Language & Keyboard Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Language Segmented Control */}
        <div className="inline-flex items-center bg-[#F0F4F2] p-1 rounded-xl border border-[#D5E4DB]">
          <button
            type="button"
            onClick={() => handleLanguageClick('bangla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'bangla'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-[#4A5A52] hover:text-[#0F1F17]'
            }`}
            aria-pressed={language === 'bangla'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>বাংলা</span>
          </button>
          <button
            type="button"
            onClick={() => handleLanguageClick('english')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'english'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-[#4A5A52] hover:text-[#0F1F17]'
            }`}
            aria-pressed={language === 'english'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>English</span>
          </button>
        </div>

        {/* Bangla Keyboard Layout Selector (Unicode vs Bijoy Classic vs Bijoy Unicode) */}
        {language === 'bangla' && (
          <div className="inline-flex items-center bg-[#F0F4F2] p-1 rounded-xl border border-[#D5E4DB]">
            <span className="hidden md:inline-flex items-center gap-1 pl-2 pr-1 text-[11px] text-[#4A5A52] font-semibold">
              <Keyboard className="w-3 h-3 text-[#0B5D3B]" />
              <span>লেআউট:</span>
            </span>
            <button
              type="button"
              onClick={() => handleKeyboardLayoutClick('unicode')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                keyboardLayout === 'unicode'
                  ? 'bg-[#0B5D3B] text-white shadow-xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="অভ্র, ফোনেটিক বা সিস্টেম ইউনিকোড কিবোর্ড"
            >
              ইউনিকোড (অভ্র)
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardLayoutClick('bijoy')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                keyboardLayout === 'bijoy'
                  ? 'bg-[#0B5D3B] text-white shadow-xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="বিজয় ক্লাসিক (ANSI / SutonnyMJ) — সরকারি চাকরি ও টাইপিং পরীক্ষা"
            >
              বিজয় ক্লাসিক
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardLayoutClick('bijoy_unicode')}
              className={`hidden sm:inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                keyboardLayout === 'bijoy_unicode'
                  ? 'bg-[#0B5D3B] text-white shadow-xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="বিজয় লেআউটে ইউনিকোড টাইপিং (Ctrl+Alt+V / জাতীয় লেআউট)"
            >
              বিজয় ইউনিকোড
            </button>
          </div>
        )}

        {/* Difficulty Pill (Only for generated text) */}
        {duration !== 'custom' && (
          <div className="inline-flex items-center bg-[#F8FAF9] p-1 rounded-xl border border-[#D5E4DB]">
            <button
              type="button"
              onClick={() => onDifficultyChange('easy')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'bg-white text-[#0B5D3B] shadow-2xs font-semibold'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
            >
              সহজ
            </button>
            <button
              type="button"
              onClick={() => onDifficultyChange('hard')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                difficulty === 'hard'
                  ? 'bg-white text-[#0B5D3B] shadow-2xs font-semibold'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#F5A524]" />
              <span>যুক্তাক্ষর</span>
            </button>
          </div>
        )}
      </div>

      {/* Middle: Duration Selector */}
      <div className="flex items-center gap-1 bg-[#F0F4F2] p-1 rounded-xl border border-[#D5E4DB] overflow-x-auto max-w-full">
        <span className="hidden sm:inline-flex items-center gap-1 pl-2 pr-1 text-[11px] text-[#4A5A52] font-medium">
          <Clock className="w-3 h-3 text-[#0B5D3B]" />
        </span>
        {DURATIONS.map((d) => {
          const isActive = duration === d.id;
          return (
            <button
              key={String(d.id)}
              type="button"
              onClick={() => handleDurationClick(d.id)}
              title={d.tooltip}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0B5D3B] text-white shadow-xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17] hover:bg-white/60'
              }`}
              aria-pressed={isActive}
            >
              <span>{d.label}</span>
              <span
                className={`text-[10px] font-normal px-1 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#D5E4DB]/50 text-[#4A5A52]'
                }`}
              >
                {d.wordCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Restart Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          title="টেস্ট পুনরায় শুরু করুন (Shortcut: Tab বা Esc)"
          className="px-3.5 py-1.5 rounded-xl border border-[#D5E4DB] bg-white hover:bg-[#F0F4F2] text-[#084A2E] text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিস্টার্ট</span>
          <span className="hidden md:inline-block font-mono text-[10px] text-[#4A5A52] bg-[#F0F4F2] px-1.5 py-0.5 rounded border border-[#D5E4DB]">
            Tab
          </span>
        </button>
      </div>
    </div>
  );
};
