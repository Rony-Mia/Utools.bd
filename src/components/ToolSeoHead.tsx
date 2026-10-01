import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface ToolSeoHeadProps {
  title: string;
  description: string;
  canonicalUrl: string;
  toolName: string;
  categoryName: string;
  categoryPath?: string;
  ogImage?: string;
  faqs?: Array<{ question: string; answer: string }>;
  ratingValue?: string;
  reviewCount?: string;
}

export const ToolSeoHead: React.FC<ToolSeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  toolName,
  categoryName,
  categoryPath = '/',
  ogImage = 'https://utools.bd/og-image.png',
  faqs = [],
  ratingValue = '4.9',
  reviewCount = '1250',
}) => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: 'https://utools.bd',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `https://utools.bd${categoryPath.startsWith('/') ? categoryPath : '/' + categoryPath}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: toolName,
        item: canonicalUrl,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${toolName} — Utools.bd`,
    url: canonicalUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: description,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      ratingCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BDT',
    },
  };

  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
    </Helmet>
  );
};
