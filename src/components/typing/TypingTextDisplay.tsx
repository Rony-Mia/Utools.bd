import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AlertCircle, Keyboard, MousePointerClick, Sparkles, RefreshCw, Info } from 'lucide-react';
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
      setPasteWarning('টাইপিং টেস্টে সরাসরি পেস্ট করা নিষিদ্ধ! অনুগ্রহ করে কিবোর্ডে টাইপ করুন।');
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

  // Auto-scroll active word into view smoothly
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [currentWordIdx]);

  // Intl.Segmenter for splitting words into complete grapheme clusters (prevents broken diacritics / dotted circles)
  const segmenter = useMemo(() => {
    return new Intl.Segmenter(language === 'bangla' ? 'bn' : 'en', { granularity: 'grapheme' });
  }, [language]);

  // Custom text configuration mode
  if (duration === 'custom' && !isRunning && userInput.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-[#D5E4DB] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F1F17]">
                কাস্টম টেক্সট টাইপিং মোড
              </h3>
              <p className="text-xs text-[#4A5A52]">
                নিজের টেক্সট পেস্ট করুন অথবা দীর্ঘ টেস্টের (৫-১০ মিনিট) জন্য ডাইনামিকালি ৫০০ শব্দ লোড করুন।
              </p>
            </div>
          </div>

          {onLoadDynamicWords && (
            <button
              type="button"
              onClick={onLoadDynamicWords}
              className="px-3.5 py-2 bg-[#E6F4EC] hover:bg-[#D5E4DB] text-[#0B5D3B] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="পুরো ডিকশনারি থেকে ৫০০ শব্দ স্বয়ংক্রিয়ভাবে লোড করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
              <span>ডাইনামিক ৫০০ শব্দ লোড করুন</span>
            </button>
          )}
        </div>

        {/* Logic banner for custom mode */}
        <div className="bg-[#F8FAF9] border border-[#D5E4DB] rounded-2xl p-3 flex items-start gap-2 text-xs text-[#4A5A52]">
          <Info className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
          <span>
            <strong>লজিক:</strong> ইউজার যদি নিজের ইচ্ছামতো বেশি সময় (যেমন: ৫ বা ১০ মিনিট) অনুশীলন করতে চান, তবে <strong>ডাইনামিক ৫০০ শব্দ লোড করুন</strong> বাটনে ক্লিক করে পুরো ডিকশনারির ৫০০টি শব্দ বক্সে লোড করে নিতে পারেন।
          </span>
        </div>

        <textarea
          rows={6}
          value={customTextInput}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder={
            language === 'bangla'
              ? 'এখানে আপনার বাংলা অনুচ্ছেদ লিখুন বা পেস্ট করুন (অথবা উপরের "ডাইনামিক ৫০০ শব্দ লোড করুন" চাপুন)...'
              : 'Paste or type your custom text here (or click "Load Dynamic 500 Words" above)...'
          }
          className="w-full p-4 text-sm sm:text-base border border-[#D5E4DB] rounded-2xl focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/20 outline-hidden bg-[#F8FAF9] font-sans resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#4A5A52]">
              মোট শব্দ: <strong className="text-[#0F1F17]">{customTextInput.trim() ? customTextInput.trim().split(/\s+/).length : 0}</strong> •{' '}
              ক্যারেক্টার: <strong>{customTextInput.length}</strong>
            </span>
            {customTextInput && (
              <button
                type="button"
                onClick={() => onCustomTextChange('')}
                className="text-xs text-red-600 hover:text-red-700 underline cursor-pointer"
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
    <div className="relative space-y-2">
      {/* Mode Word Allocation & Progress Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#4A5A52]">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#0B5D3B] animate-pulse" />
          <span>
            {duration === 15 && '১৫ সেকেন্ড মোড • বক্সে ৩৫টি শব্দ বরাদ্দ (অতি দ্রুতগতির জন্য নিরাপদ)'}
            {duration === 30 && '৩০ সেকেন্ড মোড • বক্সে ৬০টি শব্দ বরাদ্দ (টেক্সট যেন কম না পড়ে)'}
            {duration === 60 && '৬০ সেকেন্ড মোড • বক্সে ১২০টি শব্দ বরাদ্দ (১ মিনিটের স্ট্যান্ডার্ড ১০০+ WPM)'}
            {duration === 120 && '১২০ সেকেন্ড মোড • বক্সে ২৫০টি শব্দ বরাদ্দ (২ মিনিটের দীর্ঘ টেস্ট)'}
            {duration === 'custom' && `কাস্টম মোড • বক্সে মোট ${referenceWords.length}টি শব্দ লোড করা`}
          </span>
        </div>
        <div className="font-mono text-[11px] bg-[#F0F4F2] px-2 py-0.5 rounded-md border border-[#D5E4DB]">
          শব্দ: <strong className="text-[#0B5D3B]">{Math.min(referenceWords.length, currentWordIdx + 1)}</strong> / {referenceWords.length}
        </div>
      </div>

      {/* Paste warning notification */}
      {pasteWarning && (
        <div
          role="alert"
          className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2 animate-shake"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{pasteWarning}</span>
        </div>
      )}

      {/* Main Interactive Typing Area */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className={`relative bg-[#FFFFFF] border-2 rounded-3xl p-5 sm:p-7 md:p-8 min-h-[200px] sm:min-h-[240px] max-h-[380px] overflow-y-auto shadow-sm transition-all cursor-text select-none ${
          isFocused
            ? 'border-[#0B5D3B] ring-4 ring-[#0B5D3B]/10'
            : 'border-[#D5E4DB] hover:border-[#0B5D3B]/50'
        }`}
      >
        {/* Hidden but actively focusable input field (preserves mobile virtual keyboard) */}
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

        {/* Focus guidance badge when blurred */}
        {!isFocused && !isFinished && (
          <div className="absolute top-3 right-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B5D3B] bg-[#E6F4EC] border border-[#0B5D3B]/20 px-2.5 py-1 rounded-full shadow-2xs">
              <MousePointerClick className="w-3 h-3" />
              এখানে ক্লিক করে টাইপ শুরু করুন
            </span>
          </div>
        )}

        {/* Word-by-Word Text Display (Guarantees zero broken ligatures or dotted circles) */}
        <div className="relative z-10 text-lg sm:text-xl md:text-2xl leading-[2.4] sm:leading-[2.5] tracking-wide font-sans select-none pointer-events-none flex flex-wrap gap-x-2.5 gap-y-2 items-center">
          {referenceWords.map((targetWord, wIdx) => {
            const isPast = wIdx < currentWordIdx;
            const isCurrent = wIdx === currentWordIdx;
            const isFuture = wIdx > currentWordIdx;

            // Past completed word
            if (isPast) {
              const typed = userWords[wIdx] || '';
              // If Bijoy mode, accept ANSI input converted to Unicode
              const normalizedTyped =
                keyboardLayout === 'bijoy' ? bijoyToUnicode(typed) || typed : typed;
              const isMatch = normalizedTyped === targetWord;

              return (
                <span
                  key={wIdx}
                  className={`inline-block px-1.5 py-0.5 rounded-lg transition-colors font-medium ${
                    isMatch
                      ? 'text-[#0B5D3B]'
                      : 'text-red-600 bg-red-50 underline decoration-red-500 font-semibold'
                  }`}
                >
                  {targetWord}
                </span>
              );
            }

            // Current word being actively typed
            if (isCurrent) {
              // Normalize input in Bijoy mode
              const normalizedInput =
                keyboardLayout === 'bijoy'
                  ? bijoyToUnicode(currentWordInput) || currentWordInput
                  : currentWordInput;

              // Break target word and input into grapheme clusters
              const targetGraphemes = Array.from(segmenter.segment(targetWord), (s) => s.segment);
              const inputGraphemes = Array.from(
                segmenter.segment(normalizedInput),
                (s) => s.segment
              );

              const bijoyHint =
                keyboardLayout === 'bijoy' ? unicodeToBijoy(targetWord) : null;

              return (
                <span
                  key={wIdx}
                  ref={activeWordRef}
                  className="relative inline-flex flex-col items-center bg-[#E6F4EC] border-2 border-[#0B5D3B] rounded-xl px-2.5 py-1 shadow-xs transition-all"
                >
                  {/* Word Graphemes with Caret */}
                  <span className="inline-flex items-center">
                    {targetGraphemes.map((tg, gIdx) => {
                      const isTyped = gIdx < inputGraphemes.length;
                      const isCaretHere = gIdx === inputGraphemes.length;
                      const userG = inputGraphemes[gIdx];
                      const isCorrect = isTyped && userG === tg;
                      const isPrefix = isTyped && !isCorrect && tg.startsWith(userG);
                      const isError = isTyped && !isCorrect && !isPrefix;

                      let colorClass = 'text-[#0F1F17] font-semibold';
                      if (isCorrect || isPrefix) {
                        colorClass = 'text-[#0B5D3B] font-bold';
                      } else if (isError) {
                        colorClass = 'text-red-600 bg-red-100 underline decoration-red-600 font-bold';
                      }

                      return (
                        <span key={gIdx} className="relative inline-block">
                          {/* Visual Caret */}
                          {isCaretHere && isFocused && !isFinished && (
                            <span
                              className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] bg-[#0B5D3B] rounded-full animate-pulse shadow-xs"
                              aria-hidden="true"
                            />
                          )}
                          <span className={colorClass}>{tg}</span>
                        </span>
                      );
                    })}

                    {/* Caret at end of word if user typed all target graphemes */}
                    {inputGraphemes.length >= targetGraphemes.length &&
                      isFocused &&
                      !isFinished && (
                        <span
                          className="inline-block w-[2.5px] h-6 bg-[#0B5D3B] rounded-full animate-pulse shadow-xs ml-0.5"
                          aria-hidden="true"
                        />
                      )}
                  </span>

                  {/* Optional Bijoy Key Shortcut Hint */}
                  {bijoyHint && (
                    <span className="mt-0.5 text-[10px] font-mono tracking-wider font-semibold text-[#0B5D3B] bg-white/80 px-1.5 py-0.2 rounded border border-[#0B5D3B]/20 select-none">
                      বিজয় কী: {bijoyHint}
                    </span>
                  )}
                </span>
              );
            }

            // Future unreached word
            return (
              <span
                key={wIdx}
                className="inline-block px-1.5 py-0.5 text-gray-400 font-normal transition-colors"
              >
                {targetWord}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
