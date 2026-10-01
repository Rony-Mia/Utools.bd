import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage.tsx').then((m) => ({ default: m.HomePage })));
const ConverterPage = lazy(() => import('./pages/ConverterPage.tsx').then((m) => ({ default: m.ConverterPage })));
const PhotoResizerPage = lazy(() => import('./pages/PhotoResizerPage.tsx').then((m) => ({ default: m.PhotoResizerPage })));
const AgeCalculatorPage = lazy(() => import('./pages/AgeCalculatorPage.tsx').then((m) => ({ default: m.AgeCalculatorPage })));
const AmountInWordsPage = lazy(() => import('./pages/AmountInWordsPage.tsx').then((m) => ({ default: m.AmountInWordsPage })));
const CvBuilderPage = lazy(() => import('./pages/CvBuilderPage.tsx').then((m) => ({ default: m.CvBuilderPage })));
const GpaCalculatorPage = lazy(() => import('./pages/GpaCalculatorPage.tsx').then((m) => ({ default: m.GpaCalculatorPage })));
const LandConverterPage = lazy(() => import('./pages/LandConverterPage.tsx').then((m) => ({ default: m.LandConverterPage })));
const PdfMergerPage = lazy(() => import('./pages/PdfMergerPage.tsx').then((m) => ({ default: m.PdfMergerPage })));
const PdfSplitPage = lazy(() => import('./pages/PdfSplitPage.tsx').then((m) => ({ default: m.PdfSplitPage })));
const PdfDeletePagesPage = lazy(() => import('./pages/PdfDeletePagesPage.tsx').then((m) => ({ default: m.PdfDeletePagesPage })));
const PdfRotatePage = lazy(() => import('./pages/PdfRotatePage.tsx').then((m) => ({ default: m.PdfRotatePage })));
const PdfWatermarkPage = lazy(() => import('./pages/PdfWatermarkPage.tsx').then((m) => ({ default: m.PdfWatermarkPage })));
const ImageMergerPage = lazy(() => import('./pages/ImageMergerPage.tsx').then((m) => ({ default: m.ImageMergerPage })));
const ImageToTextPage = lazy(() => import('./pages/ImageToTextPage.tsx').then((m) => ({ default: m.ImageToTextPage })));
const BulkPhotoResizerPage = lazy(() => import('./pages/BulkPhotoResizerPage.tsx').then((m) => ({ default: m.BulkPhotoResizerPage })));
const HeicConverterPage = lazy(() => import('./pages/HeicConverterPage.tsx').then((m) => ({ default: m.HeicConverterPage })));
const QrGeneratorPage = lazy(() => import('./pages/QrGeneratorPage.tsx').then((m) => ({ default: m.QrGeneratorPage })));
const BanglaDateConverterPage = lazy(() => import('./pages/BanglaDateConverterPage.tsx').then((m) => ({ default: m.BanglaDateConverterPage })));
const TypingTestPage = lazy(() => import('./pages/TypingTestPage.tsx').then((m) => ({ default: m.TypingTestPage })));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage.tsx').then((m) => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.tsx').then((m) => ({ default: m.PrivacyPolicyPage })));
const BlogListPage = lazy(() => import('./pages/BlogListPage.tsx').then((m) => ({ default: m.BlogListPage })));
const BlogCategoryPage = lazy(() => import('./pages/BlogCategoryPage.tsx').then((m) => ({ default: m.BlogCategoryPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.tsx').then((m) => ({ default: m.BlogPostPage })));
const GoldCalculatorPage = lazy(() => import('./pages/GoldCalculatorPage.tsx').then((m) => ({ default: m.GoldCalculatorPage })));
const ImageToPdfPage = lazy(() => import('./pages/ImageToPdfPage.tsx').then((m) => ({ default: m.ImageToPdfPage })));
const NumberSystemConverterPage = lazy(() => import('./pages/NumberSystemConverterPage.tsx').then((m) => ({ default: m.NumberSystemConverterPage })));
const CaseConverterPage = lazy(() => import('./pages/CaseConverterPage.tsx').then((m) => ({ default: m.CaseConverterPage })));
const CustomCmsPage = lazy(() => import('./pages/CustomCmsPage.tsx').then((m) => ({ default: m.CustomCmsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx').then((m) => ({ default: m.NotFoundPage })));

// Every lazy importer above, using the exact same specifiers as the lazy()
// calls so they resolve against the same module records in this bundle.
// prerender.ts awaits this (via preloadAllPages) before its trigger pass so
// each React.lazy() ctor() resolves off an already-cached module instead of
// a fresh disk read.
const LAZY_PAGE_IMPORTERS: Array<() => Promise<unknown>> = [
  () => import('./pages/HomePage.tsx'),
  () => import('./pages/ConverterPage.tsx'),
  () => import('./pages/PhotoResizerPage.tsx'),
  () => import('./pages/AgeCalculatorPage.tsx'),
  () => import('./pages/AmountInWordsPage.tsx'),
  () => import('./pages/CvBuilderPage.tsx'),
  () => import('./pages/GpaCalculatorPage.tsx'),
  () => import('./pages/LandConverterPage.tsx'),
  () => import('./pages/PdfMergerPage.tsx'),
  () => import('./pages/PdfSplitPage.tsx'),
  () => import('./pages/PdfDeletePagesPage.tsx'),
  () => import('./pages/PdfRotatePage.tsx'),
  () => import('./pages/PdfWatermarkPage.tsx'),
  () => import('./pages/ImageMergerPage.tsx'),
  () => import('./pages/ImageToTextPage.tsx'),
  () => import('./pages/BulkPhotoResizerPage.tsx'),
  () => import('./pages/HeicConverterPage.tsx'),
  () => import('./pages/QrGeneratorPage.tsx'),
  () => import('./pages/BanglaDateConverterPage.tsx'),
  () => import('./pages/TypingTestPage.tsx'),
  () => import('./pages/AboutPage.tsx'),
  () => import('./pages/ContactPage.tsx'),
  () => import('./pages/PrivacyPolicyPage.tsx'),
  () => import('./pages/BlogListPage.tsx'),
  () => import('./pages/BlogCategoryPage.tsx'),
  () => import('./pages/BlogPostPage.tsx'),
  () => import('./pages/GoldCalculatorPage.tsx'),
  () => import('./pages/ImageToPdfPage.tsx'),
  () => import('./pages/NumberSystemConverterPage.tsx'),
  () => import('./pages/CaseConverterPage.tsx'),
  () => import('./pages/CustomCmsPage.tsx'),
  () => import('./pages/NotFoundPage.tsx'),
];

/** Used only by prerender.ts's warm-up pass — not called from the app itself. */
export async function preloadAllPages(): Promise<void> {
  await Promise.all(LAZY_PAGE_IMPORTERS.map((load) => load()));
}

// Rendered through the catch-all route above and written to dist/404.html by
// prerender.ts (served with a real 404 status by server.ts / the hosting platform).
export const NOT_FOUND_ROUTE = '/__404__';

export const STATIC_PRERENDER_ROUTES = [
  '/',
  '/converter',
  '/photo-resizer',
  '/bulk-photo-resizer',
  '/heic-converter',
  '/image-merger',
  '/image-to-text',
  '/qr-generator',
  '/age-calculator',
  '/amount-in-words',
  '/bangla-date-converter',
  '/typing-test',
  '/cv-builder',
  '/gpa-calculator',
  '/land-converter',
  '/pdf-merger',
  '/pdf-split',
  '/pdf-delete-pages',
  '/pdf-rotate',
  '/pdf-watermark-page-number',
  '/gold-calculator',
  '/image-to-pdf',
  '/number-system-converter',
  '/case-converter',
  '/about',
  '/contact',
  '/privacy-policy',
  '/blog',
  '/blog/category/culture-history',
  '/blog/category/job-preparation',
  '/blog/category/bangla-typing',
  '/blog/category/education-results',
  '/blog/category/digital-guide',
  '/blog/category/utility-tips',
] as const;

export const PRERENDER_ROUTES = STATIC_PRERENDER_ROUTES;

export interface AppRoutesProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenTerms?: () => void;
}

/** Plain, unstyled placeholder — only ever visible for a moment on a slow connection while a tool's chunk downloads. */
const RouteFallback: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center" aria-busy="true" aria-live="polite">
    <span className="sr-only">লোড হচ্ছে…</span>
  </div>
);

export function AppRoutes({
  selectedCategory = 'all',
  onSelectCategory = () => {},
  onOpenTerms = () => {},
}: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              onOpenTerms={onOpenTerms}
            />
          }
        />
        <Route path="/converter" element={<ConverterPage />} />
        <Route path="/photo-resizer" element={<PhotoResizerPage />} />
        <Route path="/bulk-photo-resizer" element={<BulkPhotoResizerPage />} />
        <Route path="/heic-converter" element={<HeicConverterPage />} />
        <Route path="/image-merger" element={<ImageMergerPage />} />
        <Route path="/image-to-text" element={<ImageToTextPage />} />
        <Route path="/qr-generator" element={<QrGeneratorPage />} />
        <Route path="/age-calculator" element={<AgeCalculatorPage />} />
        <Route path="/amount-in-words" element={<AmountInWordsPage />} />
        <Route path="/bangla-date-converter" element={<BanglaDateConverterPage />} />
        <Route path="/typing-test" element={<TypingTestPage />} />
        <Route path="/cv-builder" element={<CvBuilderPage />} />
        <Route path="/gpa-calculator" element={<GpaCalculatorPage />} />
        <Route path="/land-converter" element={<LandConverterPage />} />
        <Route path="/pdf-merger" element={<PdfMergerPage />} />
        <Route path="/pdf-split" element={<PdfSplitPage />} />
        <Route path="/pdf-delete-pages" element={<PdfDeletePagesPage />} />
        <Route path="/pdf-rotate" element={<PdfRotatePage />} />
        <Route path="/pdf-watermark-page-number" element={<PdfWatermarkPage />} />
        <Route path="/gold-calculator" element={<GoldCalculatorPage />} />
        <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/number-system-converter" element={<NumberSystemConverterPage />} />
        <Route path="/case-converter" element={<CaseConverterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/category/:categorySlug" element={<BlogCategoryPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/:pageSlug" element={<CustomCmsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
