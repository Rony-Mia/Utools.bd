import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  EyeOff,
  HardDrive,
  Cpu,
  CheckCircle2,
  FileCheck,
  Mail,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const policySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'গোপনীয়তা নীতি (Privacy Policy) — Utools.bd',
    description:
      'Utools.bd-এর সম্পূর্ণ গোপনীয়তা নীতিমালা — ১০০% ব্রাউজার-ভিত্তিক ক্লায়েন্ট-সাইড প্রযুক্তি, জিরো সার্ভার লগিং ও ডেটা সুরক্ষা প্রতিশ্রুতি।',
    url: 'https://utools.bd/privacy-policy',
    publisher: {
      '@type': 'Organization',
      name: 'Utools.bd',
      url: 'https://utools.bd',
      logo: 'https://utools.bd/og-image.png'
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <Helmet>
        <title>গোপনীয়তা নীতি (Privacy Policy) — Utools.bd</title>
        <meta
          name="description"
          content="Utools.bd-এর গোপনীয়তা নীতি জানুন। কোনো সার্ভার ডেটাবেজ নেই; আপনার ছবি, টেক্সট, বয়স ও ডেটা সরাসরি নিজস্ব ডিভাইসের ব্রাউজারে নিরাপদ থাকে।"
        />
        <link rel="canonical" href="https://utools.bd/privacy-policy" />
        <meta property="og:title" content="গোপনীয়তা নীতি (Privacy Policy) — Utools.bd" />
        <meta
          property="og:description"
          content="Utools.bd-এর গোপনীয়তা নীতি জানুন। ১০০% ব্রাউজার-ভিত্তিক ক্লায়েন্ট-সাইড নিরাপত্তা।"
        />
        <meta property="og:url" content="https://utools.bd/privacy-policy" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="গোপনীয়তা নীতি (Privacy Policy) — Utools.bd" />
        <meta
          name="twitter:description"
          content="Utools.bd-এর গোপনীয়তা নীতি জানুন। ১০০% ব্রাউজার-ভিত্তিক ক্লায়েন্ট-সাইড নিরাপত্তা।"
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(policySchema)}</script>
      </Helmet>

      {/* Header */}
      <section className="space-y-3 border-b border-[#D5E4DB] pb-6">
        <div className="inline-flex items-center gap-2 bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1 text-xs text-[#084A2E] font-medium rounded-lg">
          <Shield className="w-3.5 h-3.5 text-[#0B5D3B]" />
          <span>ডেটা সুরক্ষা ও গোপনীয়তা অঙ্গীকার</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#4A5A52]">
          <span>সর্বশেষ হালনাগাদ: মার্চ ২০২৫</span>
          <span>•</span>
          <span className="text-[#0B5D3B] font-semibold">কার্যকর: সার্বজনীন সংস্করণ</span>
        </div>
      </section>

      {/* Summary Box */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 space-y-4 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 border border-[#D5E4DB] bg-[#F0F4F2] flex items-center justify-center text-[#0B5D3B] shrink-0 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#084A2E] font-serif">
              সংক্ষিপ্ত সারসংক্ষেপ (Quick Summary)
            </h2>
            <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed mt-1">
              Utools.bd এমনভাবে তৈরি করা হয়েছে যাতে ব্যবহারকারীর কোনো ব্যক্তিগত ডেটা সার্ভারে পাঠানোর প্রয়োজনই না পড়ে। আপনি যে টেক্সট কনভার্ট করেন, ছবি রিসাইজ করেন, চাকরির বয়স বা জিপিএ গণনা করেন, কিংবা জীবনবৃত্তান্ত (CV) তৈরি করেন — তার কোনো অংশই কোনো ক্লাউড সার্ভারে আপলোড বা সংরক্ষিত হয় না। সমস্ত কাজ সরাসরি আপনার নিজস্ব ব্রাউজারের অভ্যন্তরীণ মেমোরিতে (Client-Side Memory) সম্পন্ন হয়।
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <div className="space-y-8 text-sm text-[#0F1F17] leading-relaxed">
        {/* Section 1 */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-3 rounded-2xl">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#0B5D3B]" />
            <span>১. ক্লায়েন্ট-সাইড আর্কিটেকচার ও জিরো-সার্ভার ডেটা স্থানান্তর</span>
          </h2>
          <p>
            সাধারণ ওয়েবসাইটে কোনো টেক্সট বা ফাইল প্রসেস করার জন্য ব্যবহারকারীর ইনপুট সার্ভারে পাঠানো হয় এবং সার্ভার থেকে ফলাফল ফেরত আসে। কিন্তু Utools.bd আধুনিক HTML5, JavaScript ও Web Canvas প্রযুক্তির সাহায্যে <strong>১০০% ক্লায়েন্ট-সাইড (Client-side execution)</strong> নীতি অনুসরণ করে।
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[#34443B] pl-2">
            <li>আপনার ব্রাউজার ছাড়া অন্য কোথাও কোনো ইনপুট ফাইল পাঠানো হয় না।</li>
            <li>ওয়েবসাইটে ব্যবহৃত সব লজিক ব্যবহারকারীর নিজস্ব ব্রাউজার মেমোরিতেই তাৎক্ষণিকভাবে কার্যকর হয়।</li>
            <li>আমরা কোনো রিমোট ব্যাকএন্ড ডাটাবেজ মেইনটেইন করি না যেখানে ব্যবহারকারীর ফাইল সংরক্ষিত হতে পারে।</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-3 rounded-2xl">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-[#0B5D3B]" />
            <span>২. ছবি ও স্বাক্ষরের গোপনীয়তা (Photo & Signature Privacy)</span>
          </h2>
          <p>
            সরকারি চাকরির আবেদন বা পাসপোর্টের জন্য যখন আপনি আপনার ছবি বা স্বাক্ষরের ইমেজ আপলোড করেন, তখন ব্রাউজারের স্থানীয় <code>FileReader</code> এবং <code>Canvas</code> অবজেক্টের মাধ্যমে সরাসরি আপনার কম্পিউটারের মেমোরিতে ফাইলটি লোড ও রিসাইজ হয়।
          </p>
          <p>
            টুলটি বন্ধ করার সাথে সাথে ব্রাউজারের মেমোরি থেকে আপনার ছবি সম্পূর্ণ মুক্ত হয়ে যায়। কোনো তৃতীয় পক্ষ বা এমনকি সাইটের প্রশাসকের পক্ষেও আপনার ব্যক্তিগত ছবি দেখা সম্ভব নয়।
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-3 rounded-2xl">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-[#0B5D3B]" />
            <span>৩. স্থানীয় ব্রাউজার স্টোরেজ (Local Storage) ব্যবহার</span>
          </h2>
          <p>
            ব্যবহারকারীর সুবিধার্থে নির্দিষ্ট কিছু টুলে (যেমন সিভি মেকারের খসড়া সংরক্ষণ বা শেষ ব্যবহৃত সেটিংস) আপনার ব্রাউজারের নিজস্ব <code>localStorage</code>-এ ডেটা সংরক্ষিত হতে পারে।
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[#34443B] pl-2">
            <li>এই ডেটা সম্পূর্ণ আপনার ব্রাউজারে থাকে এবং যেকোনো সময় ব্রাউজার ক্যাশ ও হিস্ট্রি ক্লিয়ার করলেই মুছে যায়।</li>
            <li>আমরা এই ডেটা কোনো সেন্ট্রাল সার্ভারে সিঙ্ক বা ব্যাকআপ করি না।</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-3 rounded-2xl">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>৪. কোনো ট্র্যাকিং বা অযাচিত বিজ্ঞাপন নেই</span>
          </h2>
          <p>
            Utools.bd-তে কোনো আগ্রাসী ট্র্যাকিং স্ক্রিপ্ট, আচরণভিত্তিক বিজ্ঞাপনী কুঁকি বা ব্যবহারকারীর পরিচয় সনাক্তকরণ সিস্টেম নেই। আমরা ব্যবহারকারীর ব্যক্তিগত পছন্দের গোপনীয়তাকে সম্পূর্ণ শ্রদ্ধা করি।
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-3 rounded-2xl">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif flex items-center space-x-2">
            <Mail className="w-4 h-4 text-[#0B5D3B]" />
            <span>৫. যোগাযোগ ও তথ্য অনুসন্ধান</span>
          </h2>
          <p>
            যদি আপনি আমাদের সাথে ইমেইল বা যোগাযোগ ফর্মের মাধ্যমে যোগাযোগ করেন, তবে আপনার প্রেরিত বার্তা কেবল অনুসন্ধানের উত্তর দিতে ব্যবহার করা হবে। আপনার ইমেইল ঠিকানা কোনো বাণিজ্যিক তালিকায় অন্তর্ভুক্ত করা হবে না।
          </p>
          <div className="pt-2">
            <p className="text-xs text-[#4A5A52]">
              যেকোনো প্রশ্নের জন্য আমাদের ইমেইল করুন:{' '}
              <a href="mailto:contact@utools.bd" className="font-mono text-[#0B5D3B] underline">
                contact@utools.bd
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-[#D5E4DB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A5A52]">
        <Link to="/" className="text-[#0B5D3B] hover:underline flex items-center">
          ← হোমপেজে ফিরে যান
        </Link>
        <Link to="/about" className="text-[#0B5D3B] hover:underline flex items-center">
          আমাদের সম্পর্কে আরও জানুন →
        </Link>
      </div>
    </div>
  );
};
