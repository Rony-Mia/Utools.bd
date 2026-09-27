import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, SearchX } from 'lucide-react';

const POPULAR_TOOLS: ReadonlyArray<{ to: string; label: string }> = [
  { to: '/converter', label: 'বিজয় ↔ ইউনিকোড কনভার্টার' },
  { to: '/photo-resizer', label: 'সরকারি ও পাসপোর্ট ছবি রিসাইজার' },
  { to: '/age-calculator', label: 'সরকারি চাকরির বয়স ক্যালকুলেটর' },
  { to: '/gpa-calculator', label: 'GPA / CGPA ক্যালকুলেটর' },
  { to: '/amount-in-words', label: 'টাকা কথায় কনভার্টার' },
  { to: '/cv-builder', label: 'সিভি মেকার' },
  { to: '/pdf-merger', label: 'পিডিএফ মার্জার' },
  { to: '/land-converter', label: 'জমির মাপ কনভার্টার' },
];

export const NotFoundPage: React.FC = () => (
  <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-20 text-center">
    <Helmet>
      <title>৪০৪ — পেজটি খুঁজে পাওয়া যায়নি | Utools.bd</title>
      <meta
        name="description"
        content="আপনি যে পেজটি খুঁজছেন সেটি খুঁজে পাওয়া যায়নি। Utools.bd-এর জনপ্রিয় কনভার্টার, ছবি রিসাইজার, বয়স ক্যালকুলেটর ও অন্যান্য টুলস ব্যবহার করুন।"
      />
      <meta name="robots" content="noindex, follow" />
    </Helmet>

    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F4EC] text-[#0B5D3B]">
      <SearchX className="h-8 w-8" aria-hidden="true" />
    </div>
    <p className="text-sm font-semibold tracking-widest text-[#0B5D3B] mb-2">ERROR 404</p>
    <h1 className="text-3xl sm:text-4xl font-bold text-[#0F1F17] tracking-tight mb-4">
      দুঃখিত, পেজটি খুঁজে পাওয়া যায়নি
    </h1>
    <p className="text-[#4A5A52] leading-relaxed mb-8">
      লিংকটি ভুল হতে পারে অথবা পেজটি সরিয়ে ফেলা হয়েছে। নিচের জনপ্রিয় টুলগুলো থেকে বেছে নিন, অথবা হোম পেজে ফিরে যান।
    </p>

    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-full bg-[#0B5D3B] px-6 py-3 font-semibold text-white hover:bg-[#084A2E] transition-colors mb-10"
    >
      <Home className="h-4 w-4" aria-hidden="true" />
      হোম পেজে যান
    </Link>

    <h2 className="text-lg font-bold text-[#0F1F17] mb-4">জনপ্রিয় টুলস</h2>
    <ul className="grid gap-3 sm:grid-cols-2 text-left">
      {POPULAR_TOOLS.map((tool) => (
        <li key={tool.to}>
          <Link
            to={tool.to}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#0B5D3B]/15 bg-white px-4 py-3 text-[#0F1F17] hover:border-[#0B5D3B]/40 hover:bg-[#E6F4EC]/50 transition-colors"
          >
            <span>{tool.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#0B5D3B]" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
