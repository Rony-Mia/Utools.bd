import React from 'react';
import { TypingTestResult, getWpmRating } from '../../utils/typingTest.ts';
import { WpmChart } from './WpmChart.tsx';
import { KeyboardHeatmap } from './KeyboardHeatmap.tsx';
import { TypingShareCard } from './TypingShareCard.tsx';
import { RotateCcw, Zap, Target, CheckCircle2, XCircle, Clock, Globe } from 'lucide-react';

interface TypingResultProps {
  result: TypingTestResult;
  onRestart: () => void;
}

export const TypingResult: React.FC<TypingResultProps> = ({ result, onRestart }) => {
  const rating = getWpmRating(result.wpm, result.language);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Main Score Hero Card */}
      <div className="bg-white border border-[#D5E4DB] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden text-center space-y-4">
        {/* Rating Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border shadow-2xs">
          <span className={`inline-block w-2 h-2 rounded-full ${result.wpm >= 35 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <span className={rating.colorClass.split(' ')[0]}>{rating.badge}</span>
        </div>

        {/* Large Net WPM Number */}
        <div className="space-y-1">
          <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono text-[#0B5D3B] tracking-tight leading-none">
            {result.wpm}
          </div>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#4A5A52]">
            Net Words Per Minute (WPM)
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[#4A5A52] max-w-md mx-auto leading-relaxed">
          {rating.description}
        </p>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 pt-4 border-t border-[#D5E4DB]/60">
          {/* Raw WPM */}
          <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4DB]/60">
            <div className="text-[11px] text-[#4A5A52] flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-[#F5A524]" />
              <span>Raw WPM</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#0F1F17]">
              {result.rawWpm}
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4DB]/60">
            <div className="text-[11px] text-[#4A5A52] flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-[#0B5D3B]" />
              <span>নির্ভুলতা</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#0B5D3B]">
              {result.accuracy}%
            </div>
          </div>

          {/* Correct Characters */}
          <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4DB]/60">
            <div className="text-[11px] text-[#4A5A52] flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>সঠিক অক্ষর</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#0F1F17]">
              {result.correctChars}
            </div>
          </div>

          {/* Errors */}
          <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4DB]/60">
            <div className="text-[11px] text-[#4A5A52] flex items-center justify-center gap-1 mb-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span>ভুল অক্ষর</span>
            </div>
            <div className="text-lg font-bold font-mono text-red-600">
              {result.uncorrectedErrors}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4DB]/60">
            <div className="text-[11px] text-[#4A5A52] flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-[#0B5D3B]" />
              <span>সময়</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#0F1F17]">
              {result.durationMode === 'custom' ? `${Math.round(result.elapsedSeconds)}s` : `${result.durationMode}s`}
            </div>
          </div>

          {/* Language */}
          <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4DB]/60">
            <div className="text-[11px] text-[#4A5A52] flex items-center justify-center gap-1 mb-1">
              <Globe className="w-3 h-3 text-[#0B5D3B]" />
              <span>ভাষা</span>
            </div>
            <div className="text-sm font-bold text-[#0F1F17] capitalize mt-1">
              {result.language === 'bangla' ? 'বাংলা' : 'English'}
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="py-3 px-8 rounded-2xl bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার শুরু করুন</span>
            <span className="font-mono text-xs opacity-75 ml-1 bg-white/20 px-2 py-0.5 rounded">
              Tab ↹
            </span>
          </button>
        </div>
      </div>

      {/* 2. Visualizations: WPM Progress Graph */}
      <WpmChart timeline={result.wpmTimeline} />

      {/* 3. Visualizations: Keyboard / Character Heatmap */}
      <KeyboardHeatmap
        language={result.language}
        keyboardLayout={result.keyboardLayout}
        charErrors={result.charErrors}
      />

      {/* 4. Shareable Certificate / Result Card */}
      <TypingShareCard result={result} />
    </div>
  );
};
