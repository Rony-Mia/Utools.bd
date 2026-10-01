import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export interface RelatedToolItem {
  id: string;
  to: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
}

export const ALL_RELATED_TOOLS: RelatedToolItem[] = [
  {
    id: 'amount-in-words',
    to: '/amount-in-words',
    badge: 'কনভার্টার',
    title: 'টাকা কথায় রূপান্তর (Amount in Words)',
    description: 'জমির দলিল, ব্যাংক চেক ও ভাউচারের জন্য যেকোনো টাকার অংক শুদ্ধ প্রমিত বাংলায় কথায় লিখুন।',
    buttonText: 'টাকা কথায় কনভার্টারে যান',
  },
  {
    id: 'gpa-calculator',
    to: '/gpa-calculator',
    badge: 'ক্যালকুলেটর',
    title: 'জিপিএ ও সিজিপিএ ক্যালকুলেটর',
    description: 'এসএসসি, এইচএসসি ও বিশ্ববিদ্যালয় পরীক্ষার জিপিএ ও সিজিপিএ নির্ভুলভাবে গণনা করুন।',
    buttonText: 'জিপিএ ক্যালকুলেটরে যান',
  },
  {
    id: 'age-calculator',
    to: '/age-calculator',
    badge: 'ক্যালকুলেটর',
    title: 'বয়স ক্যালকুলেটর (Age Calculator)',
    description: 'চাকরির আবেদন ও সরকারি সার্কুলারের নির্ধারিত তারিখে বছর, মাস ও দিন ভিত্তিক সঠিক বয়স।',
    buttonText: 'বয়স ক্যালকুলেটরে যান',
  },
  {
    id: 'cv-builder',
    to: '/cv-builder',
    badge: 'সিভি মেকার',
    title: 'সিভি ও বায়োডাটা মেকার (CV Builder)',
    description: 'বাংলাদেশি চাকরিপ্রার্থীদের জন্য আধুনিক ৫টি টেমপ্লেট ও এক ক্লিকে প্রফেশনাল A4 PDF ডাউনলোড।',
    buttonText: 'সিভি মেকারে যান',
  },
  {
    id: 'land-converter',
    to: '/land-converter',
    badge: 'ক্যালকুলেটর',
    title: 'জমির মাপ কনভার্টার (Land Converter)',
    description: 'শতক, বিঘা, কাঠা, কানি, একর, হেক্টর ও বর্গফুটের তাৎক্ষণিক রূপান্তর ও খতিয়ানের মিশ্র রূপ।',
    buttonText: 'জমির মাপ কনভার্টারে যান',
  },
  {
    id: 'gold-calculator',
    to: '/gold-calculator',
    badge: 'ক্যালকুলেটর',
    title: 'স্বর্ণের পরিমাপ ও দাম ক্যালকুলেটর',
    description: 'ভরি, আনা, রতি ও গ্রাম রূপান্তর, স্বর্ণের ভ্যাট, মজুরিসহ মোট দাম এবং পুরাতন সোনা বিক্রয় হিসাব।',
    buttonText: 'স্বর্ণ ক্যালকুলেটরে যান',
  },
  {
    id: 'image-to-pdf',
    to: '/image-to-pdf',
    badge: 'ইমেজ ও PDF',
    title: 'ছবি থেকে পিডিএফ কনভার্টার',
    description: 'একাধিক ছবি এক ক্লিকে প্রমিত A4 সাইজের একক পিডিএফ ফাইলে রূপান্তর ও ডাউনলোড করুন।',
    buttonText: 'ছবি টু PDF-এ যান',
  },
  {
    id: 'number-system-converter',
    to: '/number-system-converter',
    badge: 'আইসিটি',
    title: 'সংখ্যা পদ্ধতি ও আইসিটি কনভার্টার',
    description: 'বাইনারি, অক্টাল, ডেসিমাল ও হেক্সাডেসিমেল রূপান্তর এবং ২-এর পরিপূরকের ধাপে ধাপে সমাধান।',
    buttonText: 'সংখ্যা কনভার্টারে যান',
  },
  {
    id: 'case-converter',
    to: '/case-converter',
    badge: 'টেক্সট',
    title: 'টেক্সট কেস কনভার্টার ও ক্লিনার',
    description: 'Sentence, UPPER, lower case এবং বাংলা লেখার অতিরিক্ত স্পেস ও খালি লাইন দূর করুন।',
    buttonText: 'কেস কনভার্টারে যান',
  },
  {
    id: 'photo-resizer',
    to: '/photo-resizer',
    badge: 'গ্রাফিক্স',
    title: 'সরকারি ছবি ও স্বাক্ষর রিসাইজার',
    description: 'বিসিএস, টেলিটক ও পাসপোর্ট আবেদনের নির্ধারিত পিক্সেল ও কেবি সাইজে ছবির আকার পরিবর্তন।',
    buttonText: 'ছবি রিসাইজারে যান',
  },
  {
    id: 'pdf-merger',
    to: '/pdf-merger',
    badge: 'ডকুমেন্ট',
    title: 'পিডিএফ মার্জার (PDF Merger)',
    description: 'একাধিক পিডিএফ ফাইল একত্র ও ড্র্যাগ করে পেজ রি-অর্ডার করুন সম্পূর্ণ ব্রাউজারে নিরাপদে।',
    buttonText: 'পিডিএফ মার্জারে যান',
  },
  {
    id: 'converter',
    to: '/converter',
    badge: 'টেক্সট',
    title: 'বিজয় ↔ ইউনিকোড কনভার্টার',
    description: 'বিজয় ফন্টের লেখা ইউনিকোডে এবং ইউনিকোড লেখা বিজয়ে রূপান্তর করুন মুহূর্তের মধ্যে।',
    buttonText: 'বিজয় কনভার্টারে যান',
  },
  {
    id: 'typing-test',
    to: '/typing-test',
    badge: 'টেক্সট',
    title: 'টাইপিং স্পিড টেস্ট (Typing Speed Test)',
    description: 'বাংলা ও ইংরেজিতে আপনার টাইপিং গতি (WPM), নির্ভুলতা ও কীবোর্ড ভুল লাইভ পরীক্ষা করুন।',
    buttonText: 'টাইপিং টেস্টে যান',
  },
];

interface RelatedToolsProps {
  currentToolId?: string;
  tools?: RelatedToolItem[];
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentToolId, tools }) => {
  const displayTools =
    tools && tools.length > 0
      ? tools
      : ALL_RELATED_TOOLS.filter((t) => t.id !== currentToolId && t.to !== currentToolId).slice(0, 4);

  return (
    <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs">
      <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
        <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
        <h2 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
          আরও দরকারি টুলস (Related Tools)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {displayTools.map((tool) => (
          <div
            key={tool.id}
            className="border border-[#D5E4DB] bg-[#FFFFFF] p-4 flex flex-col justify-between space-y-3 rounded-2xl"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#F0F4F2] text-[#084A2E]">
                  {tool.badge}
                </span>
              </div>
              <h3 className="font-bold text-[#084A2E] font-serif text-sm">{tool.title}</h3>
              <p className="text-[#34443B] leading-relaxed">{tool.description}</p>
            </div>
            <Link
              to={tool.to}
              className="inline-flex items-center justify-center px-3 py-2 font-medium transition-colors rounded-lg bg-[#F0F4F2] text-[#084A2E] hover:bg-[#D5E4DB] border border-[#D5E4DB]"
            >
              <span>{tool.buttonText}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
