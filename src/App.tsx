import React, { lazy, Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AppRoutes } from './routes.tsx';
import { ScrollToTop } from './components/ScrollToTop.tsx';
import { SiteBackdrop } from './components/parallax/SiteBackdrop.tsx';
import { CursorFollower } from './components/CursorFollower.tsx';
import { FloatingActions } from './components/floating/FloatingActions.tsx';

// Lazy-load analytics so it never blocks LCP or TBT
const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics }))
);

interface AppProps {
  helmetContext?: Record<string, unknown>;
}

export default function App({ helmetContext }: AppProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const location = useLocation();

  // Admin routes should be a dedicated, self-contained portal without public site chrome
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  if (isAdminRoute) {
    return (
      <HelmetProvider context={helmetContext}>
        <ScrollToTop />
        <main className="min-h-screen">
          <AppRoutes
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onOpenTerms={() => setShowTermsModal(true)}
          />
        </main>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider context={helmetContext}>
      <ScrollToTop />
      <div className="relative min-h-screen flex flex-col bg-[#FAFAF7] text-[#0F1F17]">
        {/* Site-wide parallax backdrop (fixed, decorative, outside <main>) */}
        <SiteBackdrop />
        <CursorFollower />

        {/* Top Navbar */}
        <Navbar
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Main Content Area */}
        <main className="flex-grow relative">
          <AppRoutes
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onOpenTerms={() => setShowTermsModal(true)}
          />
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating back-to-top button (bottom-right, every page) */}
        <FloatingActions />

        {/* Vercel Web Analytics — lazy-loaded to avoid blocking LCP */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        {/* Floating / Direct Terms of Use Modal when triggered from Trust section */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1F17]/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="ব্যবহারের নিয়ম ও তথ্যের নিরাপত্তা নির্দেশিকা">
            <div className="bg-white border border-[#D5E4DB] max-w-lg w-full p-6 relative rounded-2xl shadow-[0_24px_64px_rgba(11,93,59,0.18)]">
              <h3 className="text-lg font-serif font-bold text-[#084A2E] mb-2 pb-2 border-b border-[#D5E4DB]">
                ব্যবহারের নিয়ম ও তথ্যের নিরাপত্তা নির্দেশিকা
              </h3>
              <div className="text-xs sm:text-sm text-[#0F1F17] leading-relaxed space-y-3">
                <p>
                  <strong>১. শতভাগ ক্লায়েন্ট-সাইড প্রসেসিং:</strong> ইউটুলস (Utools.bd)-এর প্রতিটি ইউটিলিটি টুল সম্পূর্ণ ক্লায়েন্ট-সাইড মেমোরিতে পরিচালিত হয়। আপনার টাইপকৃত কোনো টেক্সট, হিসাবের তথ্য বা আপলোডকৃত ফাইল কোনো বাহ্যিক সার্ভার বা ক্লাউড স্টোরেজে জমা হয় না।
                </p>
                <p>
                  <strong>২. উন্মুক্ত ও স্বাধীন ব্যবহার:</strong> ব্যক্তিগত, শিক্ষা ও দাপ্তরিক কাজের উদ্দেশ্যে এই টুলসমূহ বিনামূল্যে ব্যবহার করা যাবে।
                </p>
                <p>
                  <strong>৩. ফলাফলের নির্ভুলতা:</strong> বাংলা যুক্তাক্ষর ও ফন্ট রূপান্তরের ক্ষেত্রে প্রচলিত সুতন্বীএমজে এবং ইউনিকোড স্ট্যান্ডার্ড সতর্কতার সাথে অনুসরণ করা হয়েছে।
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#D5E4DB] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-1.5 bg-[#0B5D3B] text-[#FFFFFF] text-xs font-medium hover:bg-[#084A2E] transition-colors cursor-pointer"
                >
                  সম্মত ও বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HelmetProvider>
  );
}
