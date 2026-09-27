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

const DURATIONS: Array<{ id: TypingDuration; label: string; tooltip: string }> = [
  { id: 15, label: '১৫ সে.', tooltip: '১৫ সেকেন্ড (৩৫ শব্দ)' },
  { id: 30, label: '৩০ সে.', tooltip: '৩০ সেকেন্ড (৬০ শব্দ)' },
  { id: 60, label: '৬০ সে.', tooltip: '৬০ সেকেন্ড / ১ মিনিট (১২০ শব্দ - স্ট্যান্ডার্ড)' },
  { id: 120, label: '১২০ সে.', tooltip: '১২০ সেকেন্ড / ২ মিনিট (২৫০ শব্দ)' },
  { id: 'custom', label: 'কাস্টম', tooltip: 'কাস্টম মোড (ডাইনামিক ৫০০ শব্দ বা নিজের অনুচ্ছেদ)' },
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
    <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
      {/* Left Group: Language & Layout & Difficulty */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Language Segmented Control */}
        <div className="inline-flex items-center bg-[#F0F4F2] p-0.5 sm:p-1 rounded-xl border border-[#D5E4DB]">
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

        {/* Bangla Keyboard Layout (Unicode / Avro vs Bijoy Classic) */}
        {language === 'bangla' && (
          <div className="inline-flex items-center bg-[#F0F4F2] p-0.5 sm:p-1 rounded-xl border border-[#D5E4DB]">
            <button
              type="button"
              onClick={() => handleKeyboardLayoutClick('unicode')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                keyboardLayout === 'unicode'
                  ? 'bg-[#0B5D3B] text-white shadow-xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="ইউনিকোড / অভ্র ফোনেটিক কিবোর্ড"
            >
              ইউনিকোড (অভ্র)
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardLayoutClick('bijoy')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                keyboardLayout === 'bijoy'
                  ? 'bg-[#0B5D3B] text-white shadow-xs'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="বিজয় ক্লাসিক (ANSI / SutonnyMJ) — সরকারি চাকরি ও টাইপিং পরীক্ষা"
            >
              বিজয় ক্লাসিক
            </button>
          </div>
        )}

        {/* Difficulty Pill */}
        {duration !== 'custom' && (
          <div className="inline-flex items-center bg-[#F8FAF9] p-0.5 sm:p-1 rounded-xl border border-[#D5E4DB]">
            <button
              type="button"
              onClick={() => onDifficultyChange('easy')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'bg-white text-[#0B5D3B] shadow-2xs font-semibold'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="সহজ অনুচ্ছেদ"
            >
              সহজ
            </button>
            <button
              type="button"
              onClick={() => onDifficultyChange('hard')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                difficulty === 'hard'
                  ? 'bg-white text-[#0B5D3B] shadow-2xs font-semibold'
                  : 'text-[#4A5A52] hover:text-[#0F1F17]'
              }`}
              title="কঠিন ও যুক্তাক্ষরযুক্ত অনুচ্ছেদ"
            >
              <Sparkles className="w-3 h-3 text-[#F5A524]" />
              <span>যুক্তাক্ষর</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Group: Duration Selector & Restart Button (full width on mobile, right-aligned on desktop) */}
      <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-2.5 w-full lg:w-auto">
        {/* Duration Segmented Control */}
        <div className="flex-1 lg:flex-initial flex items-center justify-between sm:justify-start gap-1 bg-[#F0F4F2] p-0.5 sm:p-1 rounded-xl border border-[#D5E4DB]">
          {DURATIONS.map((d) => {
            const isActive = duration === d.id;
            return (
              <button
                key={String(d.id)}
                type="button"
                onClick={() => handleDurationClick(d.id)}
                title={d.tooltip}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-[#0B5D3B] text-white shadow-xs'
                    : 'text-[#4A5A52] hover:text-[#0F1F17] hover:bg-white/60'
                }`}
                aria-pressed={isActive}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Quick Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          title="টেস্ট পুনরায় শুরু করুন (Shortcut: Tab বা Esc)"
          className="shrink-0 px-3 sm:px-3.5 py-1.5 rounded-xl border border-[#D5E4DB] bg-white hover:bg-[#F0F4F2] text-[#084A2E] text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিস্টার্ট</span>
          <span className="hidden xl:inline-block font-mono text-[10px] text-[#4A5A52] bg-[#F0F4F2] px-1 py-0.2 rounded border border-[#D5E4DB]">
            Tab
          </span>
        </button>
      </div>
    </div>
  );
};
