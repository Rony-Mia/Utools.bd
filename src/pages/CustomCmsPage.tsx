import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CmsDynamicContent, CmsPageData } from '../components/CmsDynamicContent.tsx';
import { CmsPageHeader } from '../components/CmsPageHeader.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

// Load all page JSON files dynamically via Vite glob
const PAGE_MODULES = import.meta.glob<CmsPageData>('../../content/pages/*.json', {
  eager: true,
  import: 'default',
});

// Map of slug -> page data
const PAGES_BY_SLUG: Record<string, CmsPageData> = {};
for (const [filepath, data] of Object.entries(PAGE_MODULES)) {
  const match = filepath.match(/\/content\/pages\/([^/]+)\.json$/);
  if (match && data) {
    const fileSlug = match[1];
    const slug = data.slug || fileSlug;
    PAGES_BY_SLUG[slug] = data;
    PAGES_BY_SLUG[fileSlug] = data;
  }
}

export function getCustomCmsPage(slug: string): CmsPageData | undefined {
  return PAGES_BY_SLUG[slug];
}

export const CustomCmsPage: React.FC = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();

  if (!pageSlug) {
    return <NotFoundPage />;
  }

  const page = PAGES_BY_SLUG[pageSlug];
  if (!page) {
    return <NotFoundPage />;
  }

  const title = page.title || pageSlug;
  const metaTitle = page.metaTitle || `${title} | Utools.bd`;
  const metaDesc =
    page.metaDescription ||
    page.subtitle ||
    page.introText ||
    'Utools.bd — উন্মুক্ত, নিরাপদ ও ব্রাউজার-ভিত্তিক ডিজিটাল ইউটিলিটি প্ল্যাটফর্ম।';

  const canonicalUrl = `https://utools.bd/${pageSlug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={page.metaOgDescription || metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={page.metaOgDescription || metaDesc} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
      </Helmet>

      {/* Header */}
      <CmsPageHeader
        title={page.title}
        subtitle={page.subtitle}
        introText={page.introText}
        badge={page.badge}
        badgeText={page.badgeText}
        fallbackTitle={title}
        fallbackSubtitle=""
        showBackLink={true}
        showPrivacyBadge={true}
      />

      {/* Dynamic Content Sections */}
      <CmsDynamicContent content={page} />

      {/* Cross-linking to popular tools */}
      <RelatedTools currentToolId="converter" />
    </div>
  );
};
