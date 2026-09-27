import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  AlertCircle,
  Keyboard,
  MousePointerClick,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TypingLanguage, TypingDuration, TypingKeyboardLayout } from '../../utils/typingTest.ts';
import { unicodeToBijoy, bijoyToUnicode } from '../../bijoyConverter.ts';

interface TypingTextDisplayProps {
  referenceText: string;
  userInput: string;
  onInputChange: (newInput: string) => void;
  isFinished: boolean;
  isRunning: boolean;
  onFirstKey: () => void;
  duration: TypingDuration;
  language: TypingLanguage;
  keyboardLayout: TypingKeyboardLayout;
  customTextInput: string;
  onCustomTextChange: (text: string) => void;
  onLoadDynamicWords?: () => void;
  onStartCustomTest: () => void;
}

export const TypingTextDisplay: React.FC<TypingTextDisplayProps> = ({
  referenceText,
  userInput,
  onInputChange,
  isFinished,
  isRunning,
  onFirstKey,
  duration,
  language,
  keyboardLayout,
  customTextInput,
  onCustomTextChange,
  onLoadDynamicWords,
  onStartCustomTest,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);

  // Focus the input on mount or when clicking inside the display box
  const focusInput = () => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [referenceText, isFinished]);

  // Handle paste block on timed tests
  const handlePaste = (e: React.ClipboardEvent) => {
    if (duration !== 'custom') {
      e.preventDefault();
      setPasteWarning('টাইপিং টেস্টে সরাসরি পেস্ট করা যাবে না। অনুগ্রহ করে কিবোর্ডে টাইপ করুন।');
      setTimeout(() => setPasteWarning(null), 3000);
    }
  };

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const value = e.target.value;

    // Trigger timer on first keypress
    if (!isRunning && value.length === 1) {
      onFirstKey();
    }

    onInputChange(value);
  };

  // Composition events for Bangla IMEs (Avro, Bijoy, etc.)
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (!isRunning && e.currentTarget.value.length >= 1) {
      onFirstKey();
    }
  };

  // Segment reference text into words
  const referenceWords = useMemo(() => {
    return referenceText.trim().split(/\s+/).filter(Boolean);
  }, [referenceText]);

  // Split user input by spaces
  const userWords = useMemo(() => {
    return userInput.split(' ');
  }, [userInput]);

  const currentWordIdx = userWords.length - 1;
  const currentWordInput = userWords[currentWordIdx] || '';

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (referenceWords.length === 0) return 0;
    return Math.min(100, Math.round((Math.max(0, currentWordIdx) / referenceWords.length) * 100));
  }, [currentWordIdx, referenceWords.length]);

  // Intl.Segmenter for splitting words into complete grapheme clusters (prevents broken diacritics / dotted circles)
  const segmenter = useMemo(() => {
    return new Intl.Segmenter(language === 'bangla' ? 'bn' : 'en', { granularity: 'grapheme' });
  }, [language]);

  // Current Bijoy key hint
  const currentTargetWord = referenceWords[currentWordIdx] || '';
  const currentBijoyHint = useMemo(() => {
    if (language === 'bangla' && keyboardLayout === 'bijoy' && currentTargetWord) {
      return unicodeToBijoy(currentTargetWord);
    }
    return null;
  }, [language, keyboardLayout, currentTargetWord]);

  // Custom text configuration mode
  if (duration === 'custom' && !isRunning && userInput.length === 0) {
    return (
      <div className="bg-white border border-[#D5E4DB] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_4px_20px_rgba(11,93,59,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F1F17]">
                কাস্টম অনুচ্ছেদ টাইপিং মোড
              </h3>
              <p className="text-xs text-[#4A5A52]">
                নিজের পছন্দমতো অনুচ্ছেদ লিখুন বা পেস্ট করুন অথবা দীর্ঘ টেস্টের (৫-১০ মিনিট) জন্য ৫০০ শব্দ লোড করুন।
              </p>
            </div>
          </div>

          {onLoadDynamicWords && (
            <button
              type="button"
              onClick={onLoadDynamicWords}
              className="px-4 py-2 bg-[#E6F4EC] hover:bg-[#D5E4DB] text-[#0B5D3B] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
              <span>ডাইনামিক ৫০০ শব্দ লোড করুন</span>
            </button>
          )}
        </div>

        <textarea
          rows={6}
          value={customTextInput}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder={
            language === 'bangla'
              ? 'এখানে আপনার বাংলা অনুচ্ছেদ লিখুন বা পেস্ট করুন...'
              : 'Paste or type your custom paragraph here...'
          }
          className="w-full p-4 text-sm sm:text-base border border-[#D5E4DB] rounded-2xl focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/20 outline-hidden bg-[#F8FAF9] font-sans resize-y leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-[#4A5A52]">
            <span>
              মোট শব্দ: <strong className="text-[#0F1F17]">{customTextInput.trim() ? customTextInput.trim().split(/\s+/).length : 0}</strong> •{' '}
              ক্যারেক্টার: <strong>{customTextInput.length}</strong>
            </span>
            {customTextInput && (
              <button
                type="button"
                onClick={() => onCustomTextChange('')}
                className="text-red-600 hover:text-red-700 underline cursor-pointer"
              >
                মুছুন
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={!customTextInput.trim()}
            onClick={onStartCustomTest}
            className="px-6 py-2.5 bg-[#0B5D3B] hover:bg-[#084A2E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F5A524]" />
            <span>কাস্টম টেস্ট শুরু করুন</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-3">
      {/* Paste warning notification */}
      {pasteWarning && (
        <div
          role="alert"
          className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{pasteWarning}</span>
        </div>
      )}

      {/* Main Interactive Typing Canvas — Fully Visible Text, Zero Scrollbars, Premium Design */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className={`relative bg-[#FFFFFF] border rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgba(11,93,59,0.05)] transition-all cursor-text select-none overflow-hidden ${
          isFocused
            ? 'border-[#0B5D3B] ring-4 ring-[#0B5D3B]/10'
            : 'border-[#D5E4DB] hover:border-[#0B5D3B]/40'
        }`}
      >
        {/* Subtle Live Progress Bar at the Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#F0F4F2]">
          <div
            className="h-full bg-[#0B5D3B] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hidden but actively focusable input field */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onCompositionEnd={handleCompositionEnd}
          disabled={isFinished}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className="absolute opacity-0 inset-0 w-full h-full cursor-text z-0 pointer-events-auto"
          aria-label="টাইপিং ইনপুট ফিল্ড"
        />

        {/* Top Header Row inside Card: Mode & Word Progress */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#D5E4DB]/60 text-xs text-[#4A5A52] select-none">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#0B5D3B] animate-pulse" />
            <span className="text-[#0F1F17] font-semibold">
              {language === 'bangla' ? 'বাংলা অনুচ্ছেদ' : 'English Passage'}
            </span>
            <span className="text-[#D5E4DB]">•</span>
            <span>
              {duration === 15 && '১৫ সেকেন্ড মোড'}
              {duration === 30 && '৩০ সেকেন্ড মোড'}
              {duration === 60 && '৬০ সেকেন্ড স্ট্যান্ডার্ড মোড'}
              {duration === 120 && '১২০ সেকেন্ড দীর্ঘ মোড'}
              {duration === 'custom' && 'কাস্টম মোড'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isFocused && !isFinished && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B5D3B] bg-[#E6F4EC] border border-[#0B5D3B]/20 px-2.5 py-0.5 rounded-full">
                <MousePointerClick className="w-3 h-3" />
                ক্লিক করে টাইপ শুরু করুন
              </span>
            )}
            <div className="font-mono text-xs bg-[#F8FAF9] px-2.5 py-1 rounded-lg border border-[#D5E4DB] text-[#0F1F17]">
              শব্দ: <strong className="text-[#0B5D3B]">{Math.min(referenceWords.length, currentWordIdx + 1)}</strong> / {referenceWords.length}
            </div>
          </div>
        </div>

        {/* Complete Paragraph Text Display — Natural Flow, All Words Visible, Zero Clipping */}
        <div className="relative z-10 text-xl sm:text-2xl md:text-[25px] leading-[2.2] sm:leading-[2.3] tracking-normal font-sans select-none pointer-events-none text-left break-words">
          {referenceWords.map((targetWord, wIdx) => {
            const isPast = wIdx < currentWordIdx;
            const isCurrent = wIdx === currentWordIdx;

            // 1. Past completed word in paragraph
            if (isPast) {
              const typed = userWords[wIdx] || '';
              const normalizedTyped =
                keyboardLayout === 'bijoy' ? bijoyToUnicode(typed) || typed : typed;
              const isMatch = normalizedTyped === targetWord;

              return (
                <React.Fragment key={wIdx}>
                  <span
                    className={
                      isMatch
                        ? 'text-[#0B5D3B] font-semibold transition-colors'
                        : 'text-[#DC2626] font-semibold underline decoration-[#DC2626] underline-offset-4'
                    }
                  >
                    {targetWord}
                  </span>
                  {' '}
                </React.Fragment>
              );
            }

            // 2. Current word actively being typed (clean, natural, with sleek pulsing caret)
            if (isCurrent) {
              const normalizedInput =
                keyboardLayout === 'bijoy'
                  ? bijoyToUnicode(currentWordInput) || currentWordInput
                  : currentWordInput;

              const targetGraphemes = Array.from(segmenter.segment(targetWord), (s) => s.segment);
              const inputGraphemes = Array.from(segmenter.segment(normalizedInput), (s) => s.segment);

              return (
                <React.Fragment key={wIdx}>
                  <span
                    ref={activeWordRef}
                    className="relative inline-block text-[#0F1F17] font-semibold border-b-2 border-[#0B5D3B] pb-0.5 transition-all"
                  >
                    {targetGraphemes.map((tg, gIdx) => {
                      const isTyped = gIdx < inputGraphemes.length;
                      const isCaretHere = gIdx === inputGraphemes.length;
                      const userG = inputGraphemes[gIdx];
                      const isCorrect = isTyped && userG === tg;
                      const isPrefix = isTyped && !isCorrect && tg.startsWith(userG);
                      const isError = isTyped && !isCorrect && !isPrefix;

                      let colorClass = 'text-[#0F1F17]';
                      if (isCorrect || isPrefix) {
                        colorClass = 'text-[#0B5D3B] font-bold';
                      } else if (isError) {
                        colorClass = 'text-[#DC2626] bg-red-100/90 rounded-xs px-0.5 font-bold';
                      }

                      return (
                        <span key={gIdx} className="relative inline-block">
                          {/* Sleek, Smooth Animated Caret */}
                          {isCaretHere && isFocused && !isFinished && (
                            <span
                              className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] bg-[#0B5D3B] rounded-full animate-pulse shadow-[0_0_8px_rgba(11,93,59,0.5)]"
                              aria-hidden="true"
                            />
                          )}
                          <span className={colorClass}>{tg}</span>
                        </span>
                      );
                    })}

                    {/* Caret at end of active word if all target letters are typed */}
                    {inputGraphemes.length >= targetGraphemes.length &&
                      isFocused &&
                      !isFinished && (
                        <span
                          className="inline-block w-[2.5px] h-6 bg-[#0B5D3B] rounded-full animate-pulse ml-0.5 align-middle shadow-[0_0_8px_rgba(11,93,59,0.5)]"
                          aria-hidden="true"
                        />
                      )}
                  </span>
                  {' '}
                </React.Fragment>
              );
            }

            // 3. Upcoming unreached words in paragraph (clear slate/charcoal text, easy on the eyes)
            return (
              <React.Fragment key={wIdx}>
                <span className="text-[#64748B] font-normal transition-colors">
                  {targetWord}
                </span>
                {' '}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bijoy Layout Key Assistant Strip (shown below the card for zero disruption) */}
      {currentBijoyHint && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#D5E4DB] text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-[#4A5A52]">
            <Keyboard className="w-4 h-4 text-[#0B5D3B]" />
            <span>সক্রিয় শব্দ: <strong className="text-[#0F1F17]">{currentTargetWord}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[#4A5A52] text-[11px]">বিজয় কী:</span>
            <span className="text-sm font-bold text-[#0B5D3B] bg-[#E6F4EC] px-3 py-0.5 rounded-lg border border-[#0B5D3B]/20">
              {currentBijoyHint}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
