import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TYPING_FAQS: FaqItem[] = [
  {
    question: 'WPM কী?',
    answer:
      'WPM হলো Words Per Minute (প্রতি মিনিটে শব্দের সংখ্যা), যা আন্তর্জাতিকভাবে টাইপিং গতি পরিমাপের একটি সর্বজনীন একক। এর মাধ্যমে নির্ণয় করা হয় আপনি প্রতি মিনিটে কত দ্রুত ও সাবলীলভাবে টাইপ করতে পারেন।'
  },
  {
    question: 'WPM কীভাবে হিসাব হয়?',
    answer:
      'আন্তর্জাতিক প্রমিত নিয়ম অনুযায়ী গড়ে ৫টি অক্ষরকে (স্পেসসহ) ১টি "শব্দ" (Word Equivalent) হিসেবে ধরা হয়। মোট টাইপ করা অক্ষরের ভিত্তিতে Raw WPM বের করা হয় এবং টেস্ট শেষে যে ভুলগুলো ঠিক করা হয়নি সেগুলোর জন্য পেনাল্টি বাদ দিয়ে নেট WPM (Net WPM = Raw WPM - Uncorrected Errors / Minutes) হিসাব করা হয়।'
  },
  {
    question: 'বিজয় ক্লাসিক (ANSI) এবং ইউনিকোড (অভ্র) এর মধ্যে পার্থক্য কী?',
    answer:
      'ইউনিকোড হলো আন্তর্জাতিক স্ট্যান্ডার্ড যা ওয়েবসাইট, ইন্টারনেট ও মোবাইলে সরাসরি ব্যবহৃত হয় (যেমন: অভ্র বা বিজয় ইউনিকোড)। অন্যদিকে বিজয় ক্লাসিক (সুতোন্নিএমজে ফন্ট) সরকারি দপ্তর ও ঐতিহ্যবাহী প্রকাশনায় ব্যবহৃত হয়। Utools.bd-এ আপনি দুটি মোডেই পরীক্ষা দিতে পারবেন; বিজয় ক্লাসিক নির্বাচন করলে শব্দের নিচে প্রতিটি অক্ষরের বিজয় কী-বোর্ড কম্বিনেশন প্রদর্শিত হয়।'
  },
  {
    question: 'বাংলা টাইপিং টেস্ট কীভাবে কাজ করে?',
    answer:
      'আমাদের সিস্টেমে বাংলা ইউনিকোড (Avro, Bijoy Unicode ইত্যাদি) অক্ষরের প্রতিটি বর্ণ, কার ও যুক্তাক্ষর রেফারেন্স টেক্সটের সাথে লাইভ তুলনা করা হয়। প্রমিত ৫-ক্যারেক্টার সূত্রেই বাংলা WPM নির্ণয় করা হয় যা সরকারি ও বেসরকারি চাকরির পরীক্ষার সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ।'
  },
  {
    question: 'Accuracy (নির্ভুলতা) কীভাবে হিসাব হয়?',
    answer:
      'আপনার মোট টাইপ করা অক্ষরের মধ্যে কতগুলো অক্ষর হুবহু সঠিক ছিল তার শতকরা অনুপাতই হলো Accuracy। যেমন: ১০০টি অক্ষর টাইপ করে ৯৬টি সঠিক হলে নির্ভুলতা হবে ৯৬%।'
  },
  {
    question: 'আমার typing history কোথায় থাকে?',
    answer:
      'আপনার টাইপিং পারফরম্যান্স ও হিস্ট্রি সম্পূর্ণ গোপনীয়ভাবে আপনার নিজস্ব ডিভাইসের ব্রাউজারে (localStorage) সংরক্ষিত থাকে। Utools.bd-এর কোনো সার্ভারে কোনো ডেটা পাঠানো বা সংরক্ষণ করা হয় না।'
  },
  {
    question: 'প্রতিটি টাইম মোডে কতটি শব্দ রাখা হয় এবং কেন?',
    answer:
      '১) ১৫ সেকেন্ড: ৩৫টি শব্দ (দ্রুতগতির টাইপাররা ১৫ সেকেন্ডে সর্বোচ্চ ২৫-২৮ শব্দ তোলেন, তাই বক্সে ৩৫টি শব্দ রাখা নিরাপদ)।\n২) ৩০ সেকেন্ড: ৬০টি শব্দ (৩০ সেকেন্ডে দ্রুতগতির টাইপাররা সর্বোচ্চ ৫০ শব্দ তোলেন, যাতে টেক্সট কম না পড়ে)।\n৩) ৬০ সেকেন্ড: ১২০টি শব্দ (১ মিনিটের স্ট্যান্ডার্ড মোড; আন্তর্জাতিক রেকর্ড ১০০+ WPM অনুযায়ী পর্যাপ্ত)।\n৪) ১২০ সেকেন্ড: ২৫০টি শব্দ (২ মিনিটের দীর্ঘ টেস্টে ক্লান্তি ও ভুলের পরও পর্যাপ্ত শব্দ থাকা আবশ্যক)।\n৫) কাস্টম মোড: নিজের টেক্সট অথবা ৫-১০ মিনিট দীর্ঘ অনুশীলনের জন্য ডাইনামিক ৫০০ শব্দ এক ক্লিকে লোড করার সুবিধা।'
  },
  {
    question: 'আমি কি নিজের কোনো টেক্সট বা প্যারাগ্রাফ দিয়ে টেস্ট দিতে পারি?',
    answer:
      'হ্যাঁ! টাইমার অপশন থেকে "কাস্টম" মোড নির্বাচন করে আপনি যেকোনো বাংলা বা ইংরেজি অনুচ্ছেদ পেস্ট করতে পারেন অথবা "ডাইনামিক ৫০০ শব্দ লোড করুন" বাটনে ক্লিক করে দীর্ঘ প্র্যাকটিস করতে পারেন। পুরো প্যারাগ্রাফ শেষ হলে সাথে সাথে আপনার বিস্তারিত রেজাল্ট প্রদর্শিত হবে।'
  }
];

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
