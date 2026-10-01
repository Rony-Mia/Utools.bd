import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ToolSeoHead } from '../ToolSeoHead.tsx';
import {
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  Crop,
  FileText,
  Stamp,
  FileImage
} from 'lucide-react';
import { RelatedTools } from '../RelatedTools.tsx';
import { CmsDynamicContent, CmsPageData } from '../CmsDynamicContent.tsx';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PdfToolLayoutProps {
  // SEO Props
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  schemas?: object[];

  // Header Props
  badgeText: string;
  h1: string;
  introText: string;

  // Body
  children: ReactNode;

  // SEO & FAQ
  deepDiveTitle?: string;
  deepDiveContent?: ReactNode;
  featuresTitle?: string;
  featuresGrid?: ReactNode;
  howToSteps?: Array<{ stepNum: string; title: string; desc: string }>;
  faqs?: FaqItem[];
  customFaqContent?: ReactNode;
  cmsContent?: CmsPageData;
  currentToolId: 'pdf-merger' | 'pdf-split' | 'pdf-delete-pages' | 'pdf-rotate' | 'pdf-watermark-page-number' | 'image-to-pdf';
}

export const PdfToolLayout: React.FC<PdfToolLayoutProps> = ({
  title,
  metaDescription,
  canonicalUrl,
  ogTitle,
  ogDescription,
  schemas = [],
  badgeText,
  h1,
  introText,
  children,
  deepDiveTitle,
  deepDiveContent,
  featuresTitle,
  featuresGrid,
  howToSteps,
  faqs,
  customFaqContent,
  cmsContent,
  currentToolId,
}) => {
  const rawFaqs = (faqs && faqs.length > 0) ? faqs : (cmsContent?.faqs || []);
  const effectiveFaqs = rawFaqs
    .filter((f): f is { question: string; answer: string } => Boolean(f?.question && f?.answer))
    .map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <ToolSeoHead
        title={title}
        description={metaDescription}
        canonicalUrl={canonicalUrl}
        toolName={h1}
        categoryName="পিডিএফ টুলস"
        categoryPath="/pdf-merger"
        faqs={effectiveFaqs}
      />
      {schemas && schemas.length > 0 && (
        <Helmet>
          {schemas.map((schema, idx) => (
            <script key={idx} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))}
        </Helmet>
      )}

      {/* Top Breadcrumb & Privacy Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরুন</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>১০০% ক্লায়েন্ট-সাইড • কোনো আপলোড নেই • সম্পূর্ণ বিনামূল্যে</span>
        </div>
      </div>

      {/* Page Heading & Intro */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
          <span>{badgeText}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          {h1}
        </h1>
        <p className="text-sm sm:text-base text-[#34443B] max-w-4xl leading-relaxed">
          {introText}
        </p>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div>{children}</div>

      {/* Deep Dive Guide Section (if provided) */}
      {deepDiveContent && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-4 leading-relaxed text-[#0F1F17] rounded-2xl">
          {deepDiveTitle && (
            <div className="border-b border-[#D5E4DB] pb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
                {deepDiveTitle}
              </h2>
            </div>
          )}
          <div className="text-xs sm:text-sm text-[#34443B] space-y-4">
            {deepDiveContent}
          </div>
        </section>
      )}

      {/* Features Grid (if provided) */}
      {featuresGrid && (
        <section className="space-y-4">
          {featuresTitle && (
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
              <span>{featuresTitle}</span>
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuresGrid}
          </div>
        </section>
      )}

      {/* Step-by-Step Guide */}
      {howToSteps && howToSteps.length > 0 && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-7 space-y-5 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif border-b border-[#D5E4DB] pb-3">
            ব্যবহারের সহজ নিয়মাবলী (ধাপে ধাপে)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-[#0F1F17]">
            {howToSteps.map((step, idx) => (
              <div key={idx} className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
                <div className="text-xs font-mono font-bold text-[#0B5D3B] bg-[#FFFFFF] border border-[#D5E4DB] w-7 h-7 flex items-center justify-center rounded-lg">
                  {step.stepNum}
                </div>
                <h3 className="font-bold text-[#084A2E]">{step.title}</h3>
                <p className="text-xs text-[#34443B] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {(faqs && faqs.length > 0) || customFaqContent ? (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <HelpCircle className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-base sm:text-xl font-bold text-[#084A2E] font-serif">
              প্রায়শই জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)
            </h2>
          </div>

          {customFaqContent ? (
            customFaqContent
          ) : (
            <div className="space-y-6 text-xs sm:text-sm text-[#0F1F17] leading-relaxed">
              {faqs?.map((faq, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="font-bold text-[#084A2E] text-sm sm:text-base">
                    {faq.question}
                  </h3>
                  <p className="text-[#34443B]">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Dynamic CMS Content Sections (FAQs, Guides, Guidelines, Rules, Markdown, etc.) */}
      {cmsContent && (
        <CmsDynamicContent
          content={cmsContent}
          excludeSections={[
            ...(deepDiveContent ? ['deepDive' as const] : []),
            ...(featuresGrid ? ['features' as const] : []),
            ...(howToSteps && howToSteps.length > 0 ? ['howToSteps' as const] : []),
            ...((faqs && faqs.length > 0) || customFaqContent ? ['faq' as const] : []),
          ]}
        />
      )}

      {/* Cross-Link Section: "আরও দরকারি টুলস" */}
      <RelatedTools currentToolId={currentToolId} />
    </div>
  );
};
