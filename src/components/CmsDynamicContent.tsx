import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  BookOpen,
  FileCheck,
  ShieldCheck,
  ListOrdered,
  Camera,
  PenTool,
  Info,
  ExternalLink
} from 'lucide-react';

export interface CmsFaqItem {
  question?: string;
  answer?: string;
}

export interface CmsFeatureItem {
  title?: string;
  desc?: string;
  description?: string;
}

export interface CmsStepItem {
  step?: string;
  title?: string;
  desc?: string;
}

export interface CmsHowToStepItem {
  stepNum?: string;
  title?: string;
  desc?: string;
}

export interface CmsGuidelineItem {
  title?: string;
  desc?: string;
}

export interface CmsParagraphItem {
  para?: string;
}

export interface CmsRuleItem {
  rule?: string;
}

export interface CmsPageData {
  slug?: string;
  title?: string;
  subtitle?: string;
  introText?: string;
  badge?: string;
  badgeText?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaOgDescription?: string;

  // Key Value Proposition / Highlight
  sellingPointTitle?: string;
  sellingPointDesc?: string;

  // Custom Titles & Headings
  presetStepTitle?: string;
  uploadTitle?: string;
  tableTitle?: string;
  useCasesHeading?: string;

  // Features
  featuresTitle?: string;
  featuresHeading?: string;
  features?: Array<CmsFeatureItem | string>;

  // Steps
  stepsHeading?: string;
  steps?: Array<CmsStepItem>;
  howToSteps?: Array<CmsHowToStepItem>;

  // Guidelines
  guidelinesHeading?: string;
  guidelines?: Array<CmsGuidelineItem>;

  // Rules (Photo / Signature)
  photoRulesTitle?: string;
  photoRules?: Array<string | CmsRuleItem>;
  signatureRulesTitle?: string;
  signatureRules?: Array<string | CmsRuleItem>;

  // In-Depth Guides & Articles
  deepDiveTitle?: string;
  deepDiveParagraphs?: Array<string | CmsParagraphItem>;
  guideHeading?: string;
  guideParagraphs?: Array<string | CmsParagraphItem>;
  originTitle?: string;
  originParagraphs?: Array<string | CmsParagraphItem>;

  // Contact & Response
  emailLabel?: string;
  emailAddress?: string;
  responseNote?: string;

  // FAQs
  faqHeading?: string;
  faqs?: Array<CmsFaqItem>;

  // Markdown Body Content
  content?: string;

  // Timestamps
  lastUpdated?: string;

  // Allow extra custom fields
  [key: string]: unknown;
}

export interface CmsDynamicContentProps {
  content?: CmsPageData | null;
  /** Section keys to exclude if the page already custom-renders them */
  excludeSections?: Array<
    | 'sellingPoint'
    | 'features'
    | 'steps'
    | 'howToSteps'
    | 'guidelines'
    | 'rules'
    | 'deepDive'
    | 'guide'
    | 'origin'
    | 'contact'
    | 'faq'
    | 'markdown'
    | 'lastUpdated'
  >;
  className?: string;
}

// Helper: Check if string is non-empty
function hasText(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

// Helper: Check if array has at least one valid element
function hasArray(arr: unknown): arr is unknown[] {
  return Array.isArray(arr) && arr.length > 0;
}

// Helper: Extract text from paragraph item
function extractPara(item: string | CmsParagraphItem | unknown): string {
  if (typeof item === 'string') return item.trim();
  if (item && typeof item === 'object' && 'para' in item) {
    return String((item as CmsParagraphItem).para || '').trim();
  }
  return '';
}

// Helper: Extract rule text
function extractRule(item: string | CmsRuleItem | unknown): string {
  if (typeof item === 'string') return item.trim();
  if (item && typeof item === 'object' && 'rule' in item) {
    return String((item as CmsRuleItem).rule || '').trim();
  }
  return '';
}

export const CmsDynamicContent: React.FC<CmsDynamicContentProps> = ({
  content,
  excludeSections = [],
  className = '',
}) => {
  if (!content) return null;

  const excluded = new Set(excludeSections);

  // 1. Selling Point / Key Highlight Banner
  const showSellingPoint =
    !excluded.has('sellingPoint') &&
    (hasText(content.sellingPointTitle) || hasText(content.sellingPointDesc));

  // 2. Features Grid
  const validFeatures = hasArray(content.features)
    ? content.features.filter((f) => {
        if (typeof f === 'string') return f.trim().length > 0;
        return (f && (hasText(f.title) || hasText(f.desc) || hasText(f.description))) || false;
      })
    : [];
  const showFeatures = !excluded.has('features') && validFeatures.length > 0;

  // 3. Workflow Steps
  const validSteps = hasArray(content.steps)
    ? content.steps.filter((s) => s && (hasText(s.title) || hasText(s.desc)))
    : [];
  const showSteps = !excluded.has('steps') && validSteps.length > 0;

  // 4. How-To Steps
  const validHowToSteps = hasArray(content.howToSteps)
    ? content.howToSteps.filter((s) => s && (hasText(s.title) || hasText(s.desc)))
    : [];
  const showHowToSteps = !excluded.has('howToSteps') && validHowToSteps.length > 0;

  // 5. Official Guidelines
  const validGuidelines = hasArray(content.guidelines)
    ? content.guidelines.filter((g) => g && (hasText(g.title) || hasText(g.desc)))
    : [];
  const showGuidelines = !excluded.has('guidelines') && validGuidelines.length > 0;

  // 6. Photo & Signature Rules
  const validPhotoRules = hasArray(content.photoRules)
    ? content.photoRules.map(extractRule).filter(Boolean)
    : [];
  const validSigRules = hasArray(content.signatureRules)
    ? content.signatureRules.map(extractRule).filter(Boolean)
    : [];
  const showRules =
    !excluded.has('rules') && (validPhotoRules.length > 0 || validSigRules.length > 0);

  // 7. Deep Dive Paragraphs
  const validDeepDiveParas = hasArray(content.deepDiveParagraphs)
    ? content.deepDiveParagraphs.map(extractPara).filter(Boolean)
    : [];
  const showDeepDive = !excluded.has('deepDive') && validDeepDiveParas.length > 0;

  // 8. User Guide Paragraphs
  const validGuideParas = hasArray(content.guideParagraphs)
    ? content.guideParagraphs.map(extractPara).filter(Boolean)
    : [];
  const showGuide = !excluded.has('guide') && validGuideParas.length > 0;

  // 9. Background & Origin Paragraphs
  const validOriginParas = hasArray(content.originParagraphs)
    ? content.originParagraphs.map(extractPara).filter(Boolean)
    : [];
  const showOrigin = !excluded.has('origin') && validOriginParas.length > 0;

  // 10. Official Contact Card
  const showContact = !excluded.has('contact') && hasText(content.emailAddress);

  // 11. FAQ Accordion
  const validFaqs = hasArray(content.faqs)
    ? content.faqs.filter((faq) => faq && hasText(faq.question) && hasText(faq.answer))
    : [];
  const showFaq = !excluded.has('faq') && validFaqs.length > 0;

  // 12. Markdown Content
  const showMarkdown = !excluded.has('markdown') && hasText(content.content);

  // 13. Last Updated
  const showLastUpdated = !excluded.has('lastUpdated') && hasText(content.lastUpdated);

  // Accordion state for FAQs (first FAQ open by default)
  const [openFaqIndices, setOpenFaqIndices] = useState<Set<number>>(new Set([0]));

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // If literally no CMS field is active, render nothing cleanly
  const hasAnySection =
    showSellingPoint ||
    showFeatures ||
    showSteps ||
    showHowToSteps ||
    showGuidelines ||
    showRules ||
    showDeepDive ||
    showGuide ||
    showOrigin ||
    showContact ||
    showFaq ||
    showMarkdown ||
    showLastUpdated;

  if (!hasAnySection) return null;

  return (
    <div className={`space-y-8 md:space-y-10 ${className}`}>
      {/* ── 1. Selling Point / Key Value Proposition Banner ──────────────── */}
      {showSellingPoint && (
        <section className="bg-gradient-to-r from-[#F0F4F2] via-[#FFFFFF] to-[#F0F4F2] border border-[#0B5D3B]/25 p-5 sm:p-7 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="space-y-1.5 flex-1">
              {hasText(content.sellingPointTitle) && (
                <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif tracking-tight">
                  {content.sellingPointTitle}
                </h3>
              )}
              {hasText(content.sellingPointDesc) && (
                <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed">
                  {content.sellingPointDesc}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Features Grid ──────────────────────────────────────────────── */}
      {showFeatures && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.featuresHeading || content.featuresTitle || 'টুলটির মূল সুবিধাসমূহ'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {validFeatures.map((feature, idx) => {
              const title = typeof feature === 'string' ? feature : feature.title || '';
              const desc =
                typeof feature === 'object' && feature !== null
                  ? feature.desc || feature.description || ''
                  : '';
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-[#D5E4DB] hover:border-[#0B5D3B]/40 p-5 rounded-2xl space-y-2 transition-all shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-center space-x-2 text-[#0B5D3B]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0B5D3B]" />
                    <h3 className="font-bold text-[#084A2E] text-sm sm:text-base font-serif">
                      {title}
                    </h3>
                  </div>
                  {hasText(desc) && (
                    <p className="text-xs sm:text-sm text-[#4A5A52] leading-relaxed pl-6">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 3. Workflow Steps ─────────────────────────────────────────────── */}
      {showSteps && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <ListOrdered className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.stepsHeading || 'ব্যবহারের সহজ ধাপসমূহ'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validSteps.map((step, idx) => {
              const stepDisplay = step.step || String(idx + 1);
              return (
                <div
                  key={idx}
                  className="bg-[#F0F4F2]/40 border border-[#D5E4DB] p-4 rounded-xl space-y-2"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0B5D3B] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {stepDisplay}
                    </span>
                    {hasText(step.title) && (
                      <h3 className="font-bold text-[#084A2E] text-xs sm:text-sm">
                        {step.title}
                      </h3>
                    )}
                  </div>
                  {hasText(step.desc) && (
                    <p className="text-xs text-[#4A5A52] leading-relaxed pl-8">
                      {step.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 4. How-To Steps ───────────────────────────────────────────────── */}
      {showHowToSteps && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <BookOpen className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.useCasesHeading || 'কীভাবে ব্যবহার করবেন (How-To Guide)'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {validHowToSteps.map((item, idx) => {
              const num = item.stepNum || String(idx + 1);
              return (
                <div
                  key={idx}
                  className="border border-[#D5E4DB] p-4 bg-[#F0F4F2]/30 space-y-2 rounded-xl"
                >
                  <div className="w-7 h-7 bg-[#FFFFFF] border border-[#D5E4DB] text-[#0B5D3B] text-xs font-mono font-bold flex items-center justify-center rounded-lg">
                    {num}
                  </div>
                  {hasText(item.title) && (
                    <h3 className="font-bold text-[#084A2E] text-xs sm:text-sm">
                      {item.title}
                    </h3>
                  )}
                  {hasText(item.desc) && (
                    <p className="text-xs text-[#34443B] leading-relaxed">{item.desc}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 5. Official Guidelines ─────────────────────────────────────────── */}
      {showGuidelines && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <ShieldCheck className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.guidelinesHeading || 'অফিশিয়াল নির্দেশিকা ও বিধিমালা'}
            </h2>
          </div>
          <div className="space-y-3">
            {validGuidelines.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 rounded-xl space-y-1.5"
              >
                {hasText(item.title) && (
                  <h3 className="font-bold text-[#084A2E] text-xs sm:text-sm flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5D3B] shrink-0" />
                    <span>{item.title}</span>
                  </h3>
                )}
                {hasText(item.desc) && (
                  <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed pl-5">
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Photo & Signature Rules ────────────────────────────────────── */}
      {showRules && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <FileCheck className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.guidelinesHeading || 'অফিশিয়াল পরিমাপ ও আপলোড নিয়মাবলী'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#34443B]">
            {validPhotoRules.length > 0 && (
              <div className="space-y-2.5 bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-[#084A2E]">
                  <Camera className="w-4 h-4 text-[#0B5D3B]" />
                  <h3 className="font-bold font-serif text-sm sm:text-base">
                    {content.photoRulesTitle || 'ছবি সংক্রান্ত নিয়মাবলী'}
                  </h3>
                </div>
                <ul className="space-y-2 pl-1">
                  {validPhotoRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#0B5D3B] font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validSigRules.length > 0 && (
              <div className="space-y-2.5 bg-[#F0F4F2]/30 border border-[#D5E4DB] p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-[#084A2E]">
                  <PenTool className="w-4 h-4 text-[#0B5D3B]" />
                  <h3 className="font-bold font-serif text-sm sm:text-base">
                    {content.signatureRulesTitle || 'স্বাক্ষর সংক্রান্ত নিয়মাবলী'}
                  </h3>
                </div>
                <ul className="space-y-2 pl-1">
                  {validSigRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#0B5D3B] font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 7. Deep Dive Paragraphs ───────────────────────────────────────── */}
      {showDeepDive && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-8 space-y-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <BookOpen className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-2xl font-bold text-[#084A2E] font-serif">
              {content.deepDiveTitle || 'বিস্তারিত গাইড ও পর্যালোচনা'}
            </h2>
          </div>
          <div className="space-y-3.5 text-xs sm:text-sm text-[#34443B] leading-relaxed">
            {validDeepDiveParas.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── 8. User Guide Paragraphs ──────────────────────────────────────── */}
      {showGuide && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Info className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.guideHeading || 'ব্যবহার নির্দেশিকা'}
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-[#34443B] leading-relaxed">
            {validGuideParas.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── 9. Origin & Background Paragraphs ─────────────────────────────── */}
      {showOrigin && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <BookOpen className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.originTitle || 'পটভূমি ও ইতিহাস'}
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-[#34443B] leading-relaxed">
            {validOriginParas.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── 10. Official Contact Card ─────────────────────────────────────── */}
      {showContact && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#4A5A52] block">
                  {content.emailLabel || 'অফিসিয়াল যোগাযোগ'}
                </span>
                <a
                  href={`mailto:${content.emailAddress}`}
                  className="text-base font-bold text-[#084A2E] hover:underline"
                >
                  {content.emailAddress}
                </a>
              </div>
            </div>
            {hasText(content.responseNote) && (
              <div className="text-xs text-[#0B5D3B] bg-[#0B5D3B]/10 border border-[#0B5D3B]/20 px-3 py-1.5 rounded-lg max-w-sm">
                {content.responseNote}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 11. FAQ Accordion ─────────────────────────────────────────────── */}
      {showFaq && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <HelpCircle className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif">
              {content.faqHeading || 'প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)'}
            </h2>
          </div>
          <div className="divide-y divide-[#D5E4DB]/70">
            {validFaqs.map((faq, idx) => {
              const isOpen = openFaqIndices.has(idx);
              return (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between text-left gap-3 group cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-[#084A2E] group-hover:text-[#0B5D3B] transition-colors leading-snug">
                      {faq.question}
                    </span>
                    <span className="w-6 h-6 rounded-md bg-[#F0F4F2] text-[#084A2E] flex items-center justify-center shrink-0 border border-[#D5E4DB] group-hover:bg-[#0B5D3B] group-hover:text-white transition-colors">
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 text-xs sm:text-sm text-[#34443B] leading-relaxed pl-1 pr-6 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 12. Markdown Content ──────────────────────────────────────────── */}
      {showMarkdown && (
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="prose max-w-none text-xs sm:text-sm text-[#34443B] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif mb-4 mt-6 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-xl font-bold text-[#084A2E] font-serif mb-3 mt-6 border-b border-[#D5E4DB] pb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif mb-2 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => <p className="mb-3.5 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1.5 mb-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1.5 mb-4">{children}</ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#0B5D3B] bg-[#F0F4F2]/50 p-4 my-4 rounded-r-xl italic text-[#084A2E]">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B5D3B] hover:text-[#084A2E] underline font-medium inline-flex items-center gap-0.5"
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-[#D5E4DB] rounded-xl">
                    <table className="w-full text-xs text-left divide-y divide-[#D5E4DB]">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#F0F4F2] text-[#084A2E] font-bold">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-[#D5E4DB]">{children}</tbody>
                ),
                th: ({ children }) => <th className="p-2.5">{children}</th>,
                td: ({ children }) => <td className="p-2.5">{children}</td>,
              }}
            >
              {content.content}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* ── 13. Last Updated Badge ────────────────────────────────────────── */}
      {showLastUpdated && (
        <div className="flex items-center space-x-2 text-xs text-[#4A5A52] font-mono justify-end pt-2">
          <Clock className="w-3.5 h-3.5 text-[#0B5D3B]" />
          <span>{content.lastUpdated}</span>
        </div>
      )}
    </div>
  );
};
