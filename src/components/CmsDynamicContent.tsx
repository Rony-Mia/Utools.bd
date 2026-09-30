import React from 'react';
import { HelpCircle, CheckCircle2, ShieldCheck, BookOpen, AlertCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface CmsFaqItem {
  question: string;
  answer: string;
}

export interface CmsFeatureItem {
  title?: string;
  description?: string;
  icon?: string;
}

export interface CmsStepItem {
  step?: number | string;
  title: string;
  description: string;
}

export type CmsPageData = {
  [key: string]: any;
};

export interface CmsDynamicContentProps {
  content?: CmsPageData | null;
  excludeSections?: Array<
    | 'faq'
    | 'faqs'
    | 'rules'
    | 'guidelines'
    | 'sellingPoint'
    | 'features'
    | 'steps'
    | 'howToSteps'
    | 'deepDive'
    | 'guide'
    | 'origin'
    | 'contact'
    | 'markdown'
    | 'lastUpdated'
    | string
  >;
  className?: string;
}

export const CmsDynamicContent: React.FC<CmsDynamicContentProps> = ({
  content,
  excludeSections = [],
  className = '',
}) => {
  if (!content) return null;

  const isExcluded = (section: string) => excludeSections.includes(section);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Guidelines / Rules Section */}
      {!isExcluded('rules') && !isExcluded('guidelines') && (
        <>
          {(content.guidelinesHeading || content.guidelinesTitle || content.photoRules || content.rules) && (
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl">
              {(content.guidelinesHeading || content.guidelinesTitle) && (
                <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#0B5D3B]" />
                  <span>{content.guidelinesHeading || content.guidelinesTitle}</span>
                </h3>
              )}

              {/* Photo rules */}
              {content.photoRules && content.photoRules.length > 0 && (
                <div className="space-y-2">
                  {content.photoRulesTitle && (
                    <h4 className="font-semibold text-sm text-[#0B5D3B]">{content.photoRulesTitle}</h4>
                  )}
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#34443B]">
                    {content.photoRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signature rules */}
              {content.signatureRules && content.signatureRules.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E8EFEA]">
                  {content.signatureRulesTitle && (
                    <h4 className="font-semibold text-sm text-[#0B5D3B]">{content.signatureRulesTitle}</h4>
                  )}
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#34443B]">
                    {content.signatureRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General rules */}
              {content.rules && content.rules.length > 0 && (
                <ul className="space-y-2 text-xs sm:text-sm text-[#34443B]">
                  {content.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* Markdown Content */}
      {!isExcluded('markdown') && content.markdown && (
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-3 rounded-2xl prose prose-green max-w-none text-xs sm:text-sm text-[#34443B]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.markdown}</ReactMarkdown>
        </div>
      )}

      {/* Guide Content */}
      {!isExcluded('guide') && (content.guideTitle || content.guideContent) && (
        <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-3 rounded-2xl">
          {content.guideTitle && (
            <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#0B5D3B]" />
              <span>{content.guideTitle}</span>
            </h3>
          )}
          {content.guideContent && (
            <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed">{content.guideContent}</p>
          )}
        </div>
      )}

      {/* FAQ Section */}
      {!isExcluded('faq') && !isExcluded('faqs') && content.faqs && content.faqs.length > 0 && (
        <section aria-labelledby="cms-faq-heading" className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-7 space-y-4 rounded-2xl">
          <h2 id="cms-faq-heading" className="text-base sm:text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#0B5D3B]" />
            <span>{content.faqHeading || 'সাধারণ প্রশ্নোত্তর (FAQ)'}</span>
          </h2>

          <div className="space-y-4 pt-1 divide-y divide-[#E8EFEA]">
            {content.faqs.map((faq, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                <h3 className="font-bold text-sm sm:text-base text-[#084A2E] mb-1.5 flex items-start space-x-2">
                  <span className="text-[#0B5D3B] select-none">Q.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed pl-5">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
