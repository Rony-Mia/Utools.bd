import React, { useState } from 'react';
import { TypingLanguage, TypingKeyboardLayout } from '../../utils/typingTest.ts';
import { Keyboard, Info } from 'lucide-react';

interface KeyboardHeatmapProps {
  language: TypingLanguage;
  keyboardLayout?: TypingKeyboardLayout;
  charErrors: Record<string, number>;
}

interface KeyConfig {
  key: string;
  bijoyNormal?: string;
  bijoyShift?: string;
  avroPhonetic?: string;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  [
    { key: 'q', bijoyNormal: 'ঙ', bijoyShift: 'ং', avroPhonetic: 'q' },
    { key: 'w', bijoyNormal: 'য', bijoyShift: 'য়', avroPhonetic: 'w/ও' },
    { key: 'e', bijoyNormal: 'ড', bijoyShift: 'ঢ', avroPhonetic: 'e/এ' },
    { key: 'r', bijoyNormal: 'প', bijoyShift: 'ফ', avroPhonetic: 'r/র' },
    { key: 't', bijoyNormal: 'ট', bijoyShift: 'ঠ', avroPhonetic: 't/ট' },
    { key: 'y', bijoyNormal: 'চ', bijoyShift: 'ছ', avroPhonetic: 'y/ই' },
    { key: 'u', bijoyNormal: 'জ', bijoyShift: 'ঝ', avroPhonetic: 'u/উ' },
    { key: 'i', bijoyNormal: 'হ', bijoyShift: 'ঞ', avroPhonetic: 'i/ই' },
    { key: 'o', bijoyNormal: 'গ', bijoyShift: 'ঘ', avroPhonetic: 'o/ও' },
    { key: 'p', bijoyNormal: 'ড়', bijoyShift: 'ঢ়', avroPhonetic: 'p/প' },
  ],
  [
    { key: 'a', bijoyNormal: 'ৃ', bijoyShift: 'ঋ', avroPhonetic: 'a/আ' },
    { key: 's', bijoyNormal: 'ু', bijoyShift: 'ূ', avroPhonetic: 's/স' },
    { key: 'd', bijoyNormal: 'ি', bijoyShift: 'ী', avroPhonetic: 'd/দ' },
    { key: 'f', bijoyNormal: 'া', bijoyShift: 'অ', avroPhonetic: 'f/ফ' },
    { key: 'g', bijoyNormal: '্', bijoyShift: '।', avroPhonetic: 'g/গ' },
    { key: 'h', bijoyNormal: 'ব', bijoyShift: 'ভ', avroPhonetic: 'h/হ' },
    { key: 'j', bijoyNormal: 'ক', bijoyShift: 'খ', avroPhonetic: 'j/জ' },
    { key: 'k', bijoyNormal: 'ত', bijoyShift: 'থ', avroPhonetic: 'k/ক' },
    { key: 'l', bijoyNormal: 'দ', bijoyShift: 'ধ', avroPhonetic: 'l/ল' },
  ],
  [
    { key: 'z', bijoyNormal: '্র', bijoyShift: '্য', avroPhonetic: 'z/য' },
    { key: 'x', bijoyNormal: 'ও', bijoyShift: 'ৌ', avroPhonetic: 'x' },
    { key: 'c', bijoyNormal: 'এ', bijoyShift: 'ঐ', avroPhonetic: 'c/চ' },
    { key: 'v', bijoyNormal: 'র', bijoyShift: 'ল', avroPhonetic: 'v/ভ' },
    { key: 'b', bijoyNormal: 'ন', bijoyShift: 'ণ', avroPhonetic: 'b/ব' },
    { key: 'n', bijoyNormal: 'স', bijoyShift: 'ষ', avroPhonetic: 'n/ন' },
    { key: 'm', bijoyNormal: 'শ', bijoyShift: 'স', avroPhonetic: 'm/ম' },
  ],
];

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({
  language,
  keyboardLayout = 'unicode',
  charErrors,
}) => {
  const isBijoy = language === 'bangla' && keyboardLayout === 'bijoy';
  const totalErrors = Object.values(charErrors).reduce((sum, count) => sum + count, 0);
  const maxKeyError = Math.max(1, ...Object.values(charErrors));

  // Determine error count for a specific physical key
  const getKeyErrorCount = (keyConfig: KeyConfig): number => {
    let count = charErrors[keyConfig.key] || 0;
    if (language === 'bangla') {
      if (isBijoy) {
        if (keyConfig.bijoyNormal && charErrors[keyConfig.bijoyNormal]) {
          count += charErrors[keyConfig.bijoyNormal];
        }
        if (keyConfig.bijoyShift && charErrors[keyConfig.bijoyShift]) {
          count += charErrors[keyConfig.bijoyShift];
        }
      }
    }
    return count;
  };

  const getKeyColor = (count: number) => {
    if (!count || count === 0) {
      return 'bg-white border-[#D5E4DB] text-[#0F1F17] hover:border-[#0B5D3B]/40';
    }
    const ratio = count / maxKeyError;
    if (ratio > 0.6) {
      return 'bg-red-500 border-red-600 text-white font-bold shadow-xs';
    }
    if (ratio > 0.3) {
      return 'bg-red-300 border-red-400 text-red-950 font-bold';
    }
    return 'bg-red-100 border-red-200 text-red-800 font-semibold';
  };

  const errorEntries = Object.entries(charErrors)
    .filter(([char]) => char.trim().length > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5E4DB]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0F1F17]">
              {isBijoy
                ? 'বিজয় কিবোর্ড লেআউট ও এরর হিটম্যাপ (Bijoy Keyboard Heatmap)'
                : language === 'bangla'
                ? 'ইউনিকোড কিবোর্ড লেআউট ও এরর হিটম্যাপ'
                : 'Keyboard Error Heatmap (QWERTY)'}
            </h4>
            <p className="text-[11px] text-[#4A5A52]">
              {isBijoy
                ? 'বিজয় লেআউটের প্রতিটি কী-এর স্বাভাবিক ও শিফট (Shift) অক্ষরসহ ভুলের পরিসংখ্যান'
                : 'যেসব কী (Keys) টাইপ করার সময় ভুল হয়েছে তা রঙের তীব্রতায় নির্দেশিত'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#0B5D3B] bg-[#E6F4EC] px-3 py-1 rounded-lg border border-[#0B5D3B]/20">
          মোট ভুল: <strong>{totalErrors}</strong>
        </span>
      </div>

      {/* Visual QWERTY / Bijoy Keyboard Display */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[540px] max-w-[720px] mx-auto space-y-1.5 p-3 bg-[#F8FAF9] rounded-2xl border border-[#D5E4DB]/70">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`flex items-center justify-center gap-1.5 ${
                rowIdx === 1 ? 'pl-4' : rowIdx === 2 ? 'pl-8' : ''
              }`}
            >
              {row.map((k) => {
                const count = getKeyErrorCount(k);
                const colorClass = getKeyColor(count);

                return (
                  <div
                    key={k.key}
                    title={
                      isBijoy
                        ? `Key ${k.key.toUpperCase()}: স্বাভাবিক: ${k.bijoyNormal}, শিফট: ${k.bijoyShift} (ভুল: ${count})`
                        : `Key ${k.key.toUpperCase()} (ভুল: ${count})`
                    }
                    className={`relative w-11 sm:w-13 h-12 sm:h-14 rounded-xl border flex flex-col justify-between p-1 text-center transition-all hover:scale-105 select-none shadow-2xs ${colorClass}`}
                  >
                    {isBijoy ? (
                      <>
                        {/* Top: Shift character */}
                        <div className="flex items-center justify-between text-[11px] sm:text-xs leading-none">
                          <span className="font-sans font-bold text-amber-600">
                            {k.bijoyShift}
                          </span>
                          <span className="font-mono text-[9px] opacity-50 uppercase">
                            {k.key}
                          </span>
                        </div>
                        {/* Bottom: Normal character */}
                        <div className="text-left text-sm sm:text-base font-bold font-sans leading-none pb-0.5">
                          {k.bijoyNormal}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-left font-mono text-[10px] font-semibold uppercase opacity-60">
                          {k.key}
                        </div>
                        {language === 'bangla' && k.avroPhonetic && (
                          <div className="text-center text-[10px] font-sans font-bold text-[#0B5D3B]">
                            {k.avroPhonetic.split('/')[1] || k.avroPhonetic}
                          </div>
                        )}
                      </>
                    )}

                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white font-mono text-[9px] flex items-center justify-center shadow-xs">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Spacebar key */}
          <div className="flex justify-center pt-1">
            <div className="w-56 sm:w-64 h-8 rounded-xl border border-[#D5E4DB] bg-white text-[#4A5A52] font-mono text-xs flex items-center justify-center shadow-2xs">
              Space
            </div>
          </div>
        </div>
      </div>

      {/* Top Errored Characters List if any */}
      {errorEntries.length > 0 && (
        <div className="pt-2 border-t border-[#D5E4DB]/60 space-y-2">
          <div className="text-xs font-semibold text-[#0F1F17] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0B5D3B]" />
            <span>সবচেয়ে বেশি ভুলের তালিকা:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {errorEntries.slice(0, 10).map(([char, count]) => (
              <span
                key={char}
                className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <span className="font-bold text-sm">{char}</span>
                <span className="font-mono text-[10px] px-1 py-0.2 rounded-full bg-red-200 text-red-900">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#4A5A52] border-t border-[#D5E4DB]/40">
        <span className="font-medium text-[#084A2E]">
          {isBijoy ? '💡 সোনালী অক্ষর = Shift কী ধরে চাপতে হবে' : '💡 নিয়মিত অভ্যাসে ভুল কমে গতি বৃদ্ধি পায়'}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-[#D5E4DB]" />
            ভুল নেই
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-200" />
            কম ভুল
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500" />
            বেশি ভুল
          </span>
        </div>
      </div>
    </div>
  );
};
