import React from 'react';
import { Timer, Zap, Target, AlertCircle } from 'lucide-react';

interface TypingLiveStatsProps {
  remainingSeconds: number;
  totalDuration: number | 'custom';
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  uncorrectedErrors: number;
  totalTypedChars: number;
  isRunning: boolean;
}

export const TypingLiveStats: React.FC<TypingLiveStatsProps> = ({
  remainingSeconds,
  totalDuration,
  netWpm,
  accuracy,
  uncorrectedErrors,
  totalTypedChars,
  isRunning,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Time remaining */}
      <div className="bg-white border border-[#D5E4DB] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          isRunning ? 'bg-[#E6F4EC] text-[#0B5D3B]' : 'bg-[#F0F4F2] text-[#4A5A52]'
        }`}>
          <Timer className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#4A5A52] uppercase tracking-wider">
            {totalDuration === 'custom' ? 'সময় ব্যয়' : 'বাকি সময়'}
          </p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[#0F1F17] tracking-tight">
            {totalDuration === 'custom'
              ? `${Math.round(remainingSeconds)}s`
              : `${Math.max(0, Math.ceil(remainingSeconds))}s`}
          </p>
        </div>
      </div>

      {/* Net WPM */}
      <div className="bg-white border border-[#D5E4DB] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FEF3D0] text-[#B45309] flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#F5A524]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#4A5A52] uppercase tracking-wider">
            WPM (গতি)
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B5D3B] tracking-tight">
              {netWpm}
            </span>
            <span className="text-[10px] text-[#4A5A52] font-mono">Net</span>
          </div>
        </div>
      </div>

      {/* Accuracy */}
      <div className="bg-white border border-[#D5E4DB] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#4A5A52] uppercase tracking-wider">
            সঠিকতা (Accuracy)
          </p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[#0F1F17] tracking-tight">
            {totalTypedChars === 0 ? '১০০%' : `${accuracy}%`}
          </p>
        </div>
      </div>

      {/* Errors / Chars */}
      <div className="bg-white border border-[#D5E4DB] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          uncorrectedErrors > 0 ? 'bg-red-50 text-red-600' : 'bg-[#F0F4F2] text-[#4A5A52]'
        }`}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#4A5A52] uppercase tracking-wider">
            ভুল / টাইপড
          </p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[#0F1F17] tracking-tight">
            <span className={uncorrectedErrors > 0 ? 'text-red-600' : 'text-[#4A5A52]'}>
              {uncorrectedErrors}
            </span>
            <span className="text-xs text-[#4A5A52]/70 font-normal mx-1">/</span>
            <span className="text-sm text-[#4A5A52] font-normal">{totalTypedChars}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
