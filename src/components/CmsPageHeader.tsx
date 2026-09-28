import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export interface CmsPageHeaderProps {
  title?: string | null;
  subtitle?: string | null;
  introText?: string | null;
  badge?: string | null;
  badgeText?: string | null;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  fallbackBadge?: string;
  showBackLink?: boolean;
  showPrivacyBadge?: boolean;
  className?: string;
}

export const CmsPageHeader: React.FC<CmsPageHeaderProps> = ({
  title,
  subtitle,
  introText,
  badge,
  badgeText,
  fallbackTitle,
  fallbackSubtitle,
  fallbackBadge,
  showBackLink = true,
  showPrivacyBadge = true,
  className = '',
}) => {
  const displayTitle = (title && title.trim()) || fallbackTitle;
  const displaySubtitle = (subtitle && subtitle.trim()) || (introText && introText.trim()) || fallbackSubtitle;
  const displayBadge = (badge && badge.trim()) || (badgeText && badgeText.trim()) || fallbackBadge;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top bar with back to home and privacy badge */}
      {(showBackLink || showPrivacyBadge) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5E4DB]">
          {showBackLink && (
            <Link
              to="/"
              className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরুন</span>
            </Link>
          )}

          {showPrivacyBadge && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
              <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
              <span>১০০% ক্লায়েন্ট-সাইড • কোনো আপলোড নেই • সম্পূর্ণ বিনামূল্যে</span>
            </div>
          )}
        </div>
      )}

      {/* Main Title & Subtitle */}
      <div className="space-y-2 text-left">
        {displayBadge && (
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
            <span>{displayBadge}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#084A2E] font-serif tracking-tight">
          {displayTitle}
        </h1>

        {displaySubtitle && (
          <p className="text-xs sm:text-sm text-[#4A5A52] max-w-3xl leading-relaxed">
            {displaySubtitle}
          </p>
        )}
      </div>
    </div>
  );
};
