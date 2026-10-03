import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import {
  ShieldCheck,
  Type,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  FileText,
  AlignLeft,
  Clock,
  Layers,
  Wand2
} from 'lucide-react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import {
  toSentenceCase,
  toLowerCase,
  toUpperCase,
  toCapitalizedCase,
  toAlternatingCase,
  toInverseCase,
  toKebabCase,
  toSnakeCase,
  toCamelCase,
  toPascalCase,
  removeExtraSpaces,
  removeEmptyLines,
  trimLines,
  computeTextStats
} from '../utils/caseConverter.ts';
import pageContent from '../../content/pages/case-converter.json';

const SAMPLE_TEXT = `hello world! welcome to utools bd online platform. 
this is an all-in-one digital utility hub designed for bangladeshi users. 
you can easily convert cases, resize photos, and calculate taxes without any server uploads!`;

export const CaseConverterPage: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Compute text statistics live
  const stats = useMemo(() => computeTextStats(text), [text]);

  const handleCaseChange = (caseFn: (t: string) => string, name: string) => {
    setText(caseFn(text));
    setActiveAction(name);
    setTimeout(() => setActiveAction(null), 1500);
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText('');
    setActiveAction(null);
  };

  return (
    <>
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/case-converter"
        toolName="টেক্সট কেস কনভার্টার ও ক্লিনার (Case Converter)"
        categoryName="টেক্সট টুলস"
        categoryPath="/case-converter"
        faqs={pageContent.faqs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Navigation Breadcrumb bar */}
        <ToolBreadcrumb
          toolName="টেক্সট কেস কনভার্টার"
          categoryName="টেক্সট টুলস"
          categoryPath="/case-converter"
          privacyText="১০০% ক্লায়েন্ট-সাইড • কোনো লেখা সার্ভারে যায় না"
        />

        {/* Heading Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
            <Type className="w-3.5 h-3.5" />
            <span>টেক্সট ও ফরম্যাটিং ইউটিলিটি • ১০০% প্রাইভেট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
            {pageContent.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed max-w-3xl">
            {pageContent.subtitle}
          </p>
        </div>

        {/* Live Text Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#4A5A52] block font-mono">মোট শব্দ</span>
            <span className="text-lg font-bold text-[#084A2E] font-mono">{stats.words}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#4A5A52] block font-mono">অক্ষর (স্পেসসহ)</span>
            <span className="text-lg font-bold text-[#084A2E] font-mono">{stats.characters}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#4A5A52] block font-mono">স্পেস ছাড়া অক্ষর</span>
            <span className="text-lg font-bold text-[#084A2E] font-mono">{stats.charactersNoSpaces}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#4A5A52] block font-mono">মোট লাইন</span>
            <span className="text-lg font-bold text-[#084A2E] font-mono">{stats.lines}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#4A5A52] block font-mono">প্যারাগ্রাফ</span>
            <span className="text-lg font-bold text-[#084A2E] font-mono">{stats.paragraphs}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#4A5A52] block font-mono">পড়ার সময়</span>
            <span className="text-lg font-bold text-[#0B5D3B] font-mono">~{stats.readingTimeMinutes} মি.</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
              <h2 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                কেস কনভার্সন অপশন
              </h2>
            </div>
            {activeAction && (
              <span className="text-xs font-bold text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-0.5 rounded-full animate-fadeIn">
                ✓ {activeAction} সম্পন্ন!
              </span>
            )}
          </div>

          {/* Standard Cases Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => handleCaseChange(toSentenceCase, 'Sentence case')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Sentence case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toLowerCase, 'lower case')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              lower case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toUpperCase, 'UPPER CASE')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              UPPER CASE
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toCapitalizedCase, 'Capitalized Case')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Capitalized Case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toAlternatingCase, 'aLtErNaTiNg cAsE')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              aLtErNaTiNg
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toInverseCase, 'Invert Case')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              iNVERT cASE
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toCamelCase, 'camelCase')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-mono"
            >
              camelCase
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toPascalCase, 'PascalCase')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-mono"
            >
              PascalCase
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toKebabCase, 'kebab-case')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-mono"
            >
              kebab-case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(toSnakeCase, 'snake_case')}
              className="p-2.5 bg-[#FAFAF7] hover:bg-[#0B5D3B] hover:text-white border border-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-mono"
            >
              snake_case
            </button>
          </div>

          {/* Text Cleaning & Formatting Bar */}
          <div className="pt-3 border-t border-[#D5E4DB] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#084A2E] mr-1 flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>টেক্সট ক্লিনার:</span>
            </span>
            <button
              type="button"
              onClick={() => handleCaseChange(removeExtraSpaces, 'অতিরিক্ত স্পেস রিমুভ')}
              className="px-3 py-1.5 bg-[#F0F4F2] hover:bg-[#D5E4DB] text-[#084A2E] text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              অতিরিক্ত স্পেস রিমুভ
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(removeEmptyLines, 'খালি লাইন রিমুভ')}
              className="px-3 py-1.5 bg-[#F0F4F2] hover:bg-[#D5E4DB] text-[#084A2E] text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              খালি লাইন রিমুভ
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange(trimLines, 'প্রতি লাইন ট্রিম')}
              className="px-3 py-1.5 bg-[#F0F4F2] hover:bg-[#D5E4DB] text-[#084A2E] text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              লাইন ট্রিম (Trim)
            </button>
          </div>
        </div>

        {/* Text Area Card */}
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D5E4DB]">
            <span className="text-xs font-bold text-[#084A2E]">
              এখানে আপনার লেখা পেস্ট করুন বা লিখুন
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-[#c8342a] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>মুছে ফেলুন</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="আপনার ইংরেজি বা বাংলা টেক্সট এখানে লিখুন..."
            className="w-full p-4 border border-[#D5E4DB] bg-[#FAFAF7] rounded-xl text-sm text-[#0F1F17] leading-relaxed focus:border-[#0B5D3B] focus:outline-none transition-colors"
          />

          {/* Action Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!text}
                className="px-4 py-2.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট কপি করুন'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!text}
                className="px-4 py-2.5 bg-[#F0F4F2] hover:bg-[#D5E4DB] text-[#084A2E] text-xs font-bold rounded-xl border border-[#D5E4DB] transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>নোট (.txt) ডাউনলোড</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setText(SAMPLE_TEXT)}
              className="text-xs text-[#0B5D3B] hover:underline font-medium cursor-pointer"
            >
              নমুনা টেক্সট লোড করুন
            </button>
          </div>
        </div>

        {/* Educational Reference Guide */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Layers className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-base sm:text-xl font-bold text-[#084A2E] font-serif">
              কোন কেস কখন ব্যবহার করবেন?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
            <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-4 rounded-xl space-y-1.5">
              <span className="font-bold text-[#084A2E] block text-sm">Sentence Case</span>
              <p className="text-[#34443B] leading-relaxed text-xs">
                ইমেইল, অফিশিয়াল নথি এবং সাধারণ আর্টিকেল প্যারাগ্রাফ লেখার জন্য আন্তর্জাতিক মানদণ্ড। বাক্যের প্রথম অক্ষরটি কেবল ক্যাপিটাল হয়।
              </p>
            </div>
            <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-4 rounded-xl space-y-1.5">
              <span className="font-bold text-[#084A2E] block text-sm">Title Case (Capitalized)</span>
              <p className="text-[#34443B] leading-relaxed text-xs">
                ব্লগ পোস্টের হেডলাইন, বইয়ের শিরোনাম, উপস্থাপনা বা বিজ্ঞাপনের ব্যানারের জন্য আদর্শ যেখানে প্রতিটি শব্দের প্রথম অক্ষর বড় হাতের হয়।
              </p>
            </div>
            <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-4 rounded-xl space-y-1.5">
              <span className="font-bold text-[#084A2E] block text-sm">camelCase ও kebab-case</span>
              <p className="text-[#34443B] leading-relaxed text-xs">
                সফটওয়্যার প্রোগ্রামিং, ইউআরএল স্লাগ ও ফাইল নামকরণে ব্যবহৃত হয় যাতে স্পেস ছাড়া একাধিক শব্দ স্পষ্টভাবে পড়া যায়।
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ Accordion */}
        <CmsDynamicContent content={pageContent} />

        {/* Related Tools */}
        <RelatedTools currentToolId="case-converter" />
      </div>
    </>
  );
};
