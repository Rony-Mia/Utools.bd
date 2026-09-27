import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import pageContent from '../../../content/pages/typing-test.json';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TYPING_FAQS: FaqItem[] = pageContent.faqs;

export const TypingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-3xl p-5 sm:p-7 md:p-8 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-[#D5E4DB]/60 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-[#E6F4EC] text-[#0B5D3B] flex items-center justify-center">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0F1F17]">
            সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h3>
          <p className="text-xs text-[#4A5A52]">
            টাইপিং স্পিড টেস্ট, WPM পরিমাপ এবং বাংলা টাইপিং সংক্রান্ত প্রয়োজনীয় তথ্য
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {TYPING_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'border-[#0B5D3B]/40 bg-[#F8FAF9]'
                  : 'border-[#D5E4DB]/80 bg-white hover:border-[#D5E4DB]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-bold text-[#0F1F17]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#0B5D3B] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 text-xs text-[#4A5A52] leading-relaxed border-t border-[#D5E4DB]/40 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
