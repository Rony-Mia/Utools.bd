import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import {
  ShieldCheck,
  Keyboard,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  TypingLanguage,
  TypingKeyboardLayout,
  TypingDuration,
  TypingDifficulty,
  TypingStatus,
  WpmSample,
  TypingTestResult,
  calculateTypingMetrics,
  analyzeTypingProgress,
} from '../utils/typingTest.ts';
import { generateTypingText, getWordCountForDuration } from '../data/typingWords.ts';
import { saveTestResult } from '../utils/typingHistory.ts';
import { TypingModeSelector } from '../components/typing/TypingModeSelector.tsx';
import { TypingLiveStats } from '../components/typing/TypingLiveStats.tsx';
import { TypingTextDisplay } from '../components/typing/TypingTextDisplay.tsx';
import { TypingResult } from '../components/typing/TypingResult.tsx';
import { TypingHistorySection } from '../components/typing/TypingHistorySection.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/typing-test.json';

export const TypingTestPage: React.FC = () => {
  // ── Configuration State ───────────────────────────────────────────────────
  const [language, setLanguage] = useState<TypingLanguage>('bangla');
  const [keyboardLayout, setKeyboardLayout] = useState<TypingKeyboardLayout>('unicode');
  const [duration, setDuration] = useState<TypingDuration>(60);
  const [difficulty, setDifficulty] = useState<TypingDifficulty>('easy');
  const [customTextInput, setCustomTextInput] = useState<string>('');

  // ── Runtime State ────────────────────────────────────────────────────────
  const [status, setStatus] = useState<TypingStatus>('idle');
  const [referenceText, setReferenceText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpmTimeline, setWpmTimeline] = useState<WpmSample[]>([]);
  const [result, setResult] = useState<TypingTestResult | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState<number>(0);

  // References for high-precision wall-clock timing
  const startTimeRef = useRef<number | null>(null);
  const timerFrameRef = useRef<NodeJS.Timeout | null>(null);
  const secondIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const referenceTextRef = useRef<string>('');
  const userInputRef = useRef<string>('');
  const statusRef = useRef<TypingStatus>('idle');
  const keyboardLayoutRef = useRef<TypingKeyboardLayout>('unicode');

  // Keep refs in sync
  referenceTextRef.current = referenceText;
  userInputRef.current = userInput;
  statusRef.current = status;
  keyboardLayoutRef.current = keyboardLayout;

  // Initialize reference text with exact mode-based word count allocation:
  // 15s -> 35 words | 30s -> 60 words | 60s -> 120 words | 120s -> 250 words | custom -> 500 words
  const setupNewTest = useCallback(
    (lang: TypingLanguage, dur: TypingDuration, diff: TypingDifficulty) => {
      // Clear timers
      if (timerFrameRef.current) clearInterval(timerFrameRef.current);
      if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);

      startTimeRef.current = null;
      setStatus('idle');
      setUserInput('');
      setElapsedSeconds(0);
      setWpmTimeline([]);
      setResult(null);

      if (dur === 'custom') {
        const textToUse =
          customTextInput.trim() ||
          generateTypingText(lang, diff, getWordCountForDuration('custom'));
        setReferenceText(textToUse);
        if (!customTextInput.trim()) {
          setCustomTextInput(textToUse);
        }
      } else {
        const targetWords = getWordCountForDuration(dur);
        const text = generateTypingText(lang, diff, targetWords);
        setReferenceText(text);
      }
    },
    [customTextInput]
  );

  // Initial load
  useEffect(() => {
    setupNewTest(language, duration, difficulty);
  }, []);

  // ── Finish Test Handler ──────────────────────────────────────────────────
  const finishTest = useCallback(() => {
    if (statusRef.current === 'finished') return;

    // Clear timing timers
    if (timerFrameRef.current) clearInterval(timerFrameRef.current);
    if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);

    const now = performance.now();
    const finalElapsed = startTimeRef.current
      ? Math.max(1, (now - startTimeRef.current) / 1000)
      : (typeof duration === 'number' ? duration : 60);

    const analysis = analyzeTypingProgress(
      referenceTextRef.current,
      userInputRef.current,
      keyboardLayoutRef.current
    );
    const metrics = calculateTypingMetrics(
      analysis.totalTyped,
      analysis.correctCount,
      analysis.uncorrectedErrorCount,
      finalElapsed
    );

    const finalResult: TypingTestResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      wpm: metrics.netWpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      totalTypedChars: analysis.totalTyped,
      correctChars: analysis.correctCount,
      uncorrectedErrors: analysis.uncorrectedErrorCount,
      durationMode: typeof duration === 'number' ? (String(duration) as any) : 'custom',
      elapsedSeconds: finalElapsed,
      language,
      keyboardLayout: keyboardLayoutRef.current,
      difficulty,
      wpmTimeline,
      charErrors: analysis.errorChars,
    };

    setResult(finalResult);
    setStatus('finished');

    // Save to localStorage history
    saveTestResult(finalResult);
    setHistoryRefreshKey((prev) => prev + 1);
  }, [duration, language, difficulty, wpmTimeline]);

  // ── Timer Loop when test starts ──────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (status === 'running' || status === 'finished') return;

    setStatus('running');
    const start = performance.now();
    startTimeRef.current = start;

    // High frequency interval (100ms) for smooth remaining time calculation
    timerFrameRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setElapsedSeconds(elapsed);

      // Check for timed test expiry
      if (typeof duration === 'number') {
        const remaining = duration - elapsed;
        if (remaining <= 0) {
          finishTest();
        }
      }
    }, 100);

    // 1-second interval to sample WPM progression for line chart
    let tickCount = 0;
    secondIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      tickCount++;
      const currentElapsed = (performance.now() - startTimeRef.current) / 1000;
      const analysis = analyzeTypingProgress(
        referenceTextRef.current,
        userInputRef.current,
        keyboardLayoutRef.current
      );
      const metrics = calculateTypingMetrics(
        analysis.totalTyped,
        analysis.correctCount,
        analysis.uncorrectedErrorCount,
        currentElapsed
      );

      setWpmTimeline((prev) => [
        ...prev,
        {
          second: tickCount,
          wpm: metrics.netWpm,
          rawWpm: metrics.rawWpm,
          accuracy: metrics.accuracy,
        },
      ]);
    }, 1000);
  }, [status, duration, finishTest]);

  // Handle custom text completion
  const handleInputChange = (newInput: string) => {
    setUserInput(newInput);

    // If custom text mode, finish when user completes all characters
    if (duration === 'custom' && referenceText.length > 0 && newInput.length >= referenceText.length) {
      finishTest();
    }
  };

  // ── Keyboard Shortcuts (Tab or Esc to restart) ───────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Escape') {
        // Prevent default tab navigation only if test is active or finished
        if (status === 'running' || status === 'finished') {
          e.preventDefault();
          setupNewTest(language, duration, difficulty);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, language, duration, difficulty, setupNewTest]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerFrameRef.current) clearInterval(timerFrameRef.current);
      if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);
    };
  }, []);

  // Compute live metrics for display while typing
  const liveAnalysis = analyzeTypingProgress(referenceText, userInput, keyboardLayout);
  const liveMetrics = calculateTypingMetrics(
    liveAnalysis.totalTyped,
    liveAnalysis.correctCount,
    liveAnalysis.uncorrectedErrorCount,
    elapsedSeconds
  );

  const remainingSeconds =
    typeof duration === 'number'
      ? Math.max(0, duration - elapsedSeconds)
      : elapsedSeconds;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      {/* ── SEO Head ─────────────────────────────────────────────────────── */}
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/typing-test"
        toolName="বাংলা টাইপিং টেস্ট অনলাইন"
        categoryName="টাইপিং অনুশীলন"
        faqs={pageContent.faqs}
      />

      {/* ── Top Breadcrumb & Privacy Badge ───────────────────────────────── */}
      <ToolBreadcrumb
        toolName="টাইপিং স্পিড টেস্ট"
        categoryName="টাইপিং অনুশীলন"
        privacyText="🔒 আপনার টাইপিং ডেটা এই ডিভাইসেই থাকে"
      />

      {/* ── Hero Section (Single H1) ─────────────────────────────────────── */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F1F17] tracking-tight">
          {pageContent?.title || 'টাইপিং স্পিড টেস্ট (Typing Speed Test)'}
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5A52] max-w-3xl leading-relaxed">
          {pageContent?.subtitle || 'বাংলা ও ইংরেজিতে আপনার টাইপিং গতি (Words Per Minute), নির্ভুলতা (Accuracy) ও কীবোর্ড ভুল পর্যবেক্ষণ করুন। বিসিএস, সরকারি চাকরি, ব্যাংক পরীক্ষা ও প্রফেশনাল ক্যারিয়ারের প্রস্তুতিতে ১০০% ক্লায়েন্ট-সাইড ও নিরাপদ।'}
        </p>
      </div>

      {/* ── Mode & Settings Selector ─────────────────────────────────────── */}
      <TypingModeSelector
        language={language}
        onLanguageChange={(newLang) => {
          setLanguage(newLang);
          setupNewTest(newLang, duration, difficulty);
        }}
        keyboardLayout={keyboardLayout}
        onKeyboardLayoutChange={(newLayout) => {
          setKeyboardLayout(newLayout);
          setupNewTest(language, duration, difficulty);
        }}
        duration={duration}
        onDurationChange={(newDur) => {
          setDuration(newDur);
          setupNewTest(language, newDur, difficulty);
        }}
        difficulty={difficulty}
        onDifficultyChange={(newDiff) => {
          setDifficulty(newDiff);
          setupNewTest(language, duration, newDiff);
        }}
        onRestart={() => setupNewTest(language, duration, difficulty)}
        isRunning={status === 'running'}
      />

      {/* ── Main Dynamic Workspace: Active Test OR Result Screen ─────────── */}
      {status !== 'finished' ? (
        <div className="space-y-4">
          {/* Live Statistics Bar */}
          <TypingLiveStats
            remainingSeconds={remainingSeconds}
            totalDuration={duration}
            netWpm={liveMetrics.netWpm}
            rawWpm={liveMetrics.rawWpm}
            accuracy={liveMetrics.accuracy}
            uncorrectedErrors={liveAnalysis.uncorrectedErrorCount}
            totalTypedChars={liveAnalysis.totalTyped}
            isRunning={status === 'running'}
          />

          {/* Interactive Typing Text Display Area */}
          <TypingTextDisplay
            referenceText={referenceText}
            userInput={userInput}
            onInputChange={handleInputChange}
            isFinished={false}
            isRunning={status === 'running'}
            onFirstKey={startTimer}
            duration={duration}
            language={language}
            keyboardLayout={keyboardLayout}
            customTextInput={customTextInput}
            onCustomTextChange={setCustomTextInput}
            onLoadDynamicWords={() => {
              const text = generateTypingText(
                language,
                difficulty,
                getWordCountForDuration('custom')
              );
              setCustomTextInput(text);
              setReferenceText(text);
            }}
            onStartCustomTest={() => {
              const textToUse =
                customTextInput.trim() ||
                generateTypingText(
                  language,
                  difficulty,
                  getWordCountForDuration('custom')
                );
              setReferenceText(textToUse);
              setUserInput('');
              startTimer();
            }}
          />
        </div>
      ) : (
        /* Result Screen */
        result && (
          <TypingResult
            result={result}
            onRestart={() => setupNewTest(language, duration, difficulty)}
          />
        )
      )}

      {/* ── Your Progress / History Section ──────────────────────────────── */}
      <TypingHistorySection
        refreshTrigger={historyRefreshKey}
        onStartTest={() => {
          setupNewTest(language, duration, difficulty);
          window.scrollTo({ top: 150, behavior: 'smooth' });
        }}
      />

      {/* ── Dynamic CMS Content Sections (FAQs, Guides, Features, etc.) ─ */}
      <CmsDynamicContent content={pageContent} />

      {/* ── Cross-Linking Section ("আরও দরকারি টুলস") ───────────────────── */}
      <RelatedTools currentToolId="typing-test" />
    </div>
  );
};
