import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Globe2,
  FileText,
  Users,
  Heart,
  ArrowLeftRight,
  Crop,
  Calculator,
  Coins,
  GraduationCap
} from 'lucide-react';
import { TOOLS } from '../data/tools.ts';

export const AboutPage: React.FC = () => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: 'https://utools.bd/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'আমাদের সম্পর্কে',
        item: 'https://utools.bd/about'
      }
    ]
  };

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'আমাদের সম্পর্কে — Utools.bd',
    description:
      'Utools.bd সম্পর্কে বিস্তারিত তথ্য — বাংলাদেশি চাকরিপ্রার্থী, শিক্ষার্থী ও পেশাজীবীদের জন্য উন্মুক্ত, নিরাপদ ও ব্রাউজার-ভিত্তিক ডিজিটাল ইউটিলিটি প্ল্যাটফর্ম।',
    url: 'https://utools.bd/about',
    publisher: {
      '@type': 'Organization',
      name: 'Utools.bd',
      url: 'https://utools.bd',
      logo: 'https://utools.bd/og-image.png'
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <Helmet>
        <title>আমাদের সম্পর্কে — Utools.bd | নিরাপদ বাংলা ইউটিলিটি</title>
        <meta
          name="description"
          content="Utools.bd হলো চাকরিপ্রার্থী, শিক্ষার্থী ও পেশাজীবীদের জন্য নির্মিত ১০০% ফ্রি, অফলাইন-রেডি ও নিরাপদ বাংলা ডিজিটাল ইউটিলিটি প্ল্যাটফর্ম।"
        />
        <link rel="canonical" href="https://utools.bd/about" />
        <meta property="og:title" content="আমাদের সম্পর্কে — Utools.bd" />
        <meta
          property="og:description"
          content="Utools.bd হলো বাংলাদেশি চাকরিপ্রার্থী, শিক্ষার্থী ও পেশাজীবীদের জন্য নির্মিত ১০০% ফ্রি, অফলাইন-রেডি ও ব্রাউজার-ভিত্তিক ডিজিটাল ইউটিলিটি প্ল্যাটফর্ম।"
        />
        <meta property="og:url" content="https://utools.bd/about" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="আমাদের সম্পর্কে — Utools.bd" />
        <meta
          name="twitter:description"
          content="Utools.bd হলো বাংলাদেশি চাকরিপ্রার্থী, শিক্ষার্থী ও পেশাজীবীদের জন্য নির্মিত ১০০% ফ্রি, অফলাইন-রেডি ও ব্রাউজার-ভিত্তিক ডিজিটাল ইউটিলিটি প্ল্যাটফর্ম।"
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
      </Helmet>

      {/* Page Header */}
      <section className="space-y-3 border-b border-[#D5E4DB] pb-6">
        <div className="inline-flex items-center gap-2 bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1 text-xs text-[#084A2E] font-medium rounded-lg">
          <Globe2 className="w-3.5 h-3.5 text-[#0B5D3B]" />
          <span>আমাদের পরিচিতি ও লক্ষ্য</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          Utools.bd — আপনার নির্ভরযোগ্য বাংলা ডিজিটাল সঙ্গী
        </h1>
        <p className="text-sm sm:text-base text-[#4A5A52] max-w-3xl leading-relaxed">
          প্রতিদিনের ডিজিটাল কাজের ঝামেলা দূর করে দ্রুত, নিরাপদ ও সম্পূর্ণ বিনামূল্যে প্রয়োজনীয় টুলস সবার কাছে পৌঁছে দেওয়াই ইউটুলস-এর মূল লক্ষ্য।
        </p>
      </section>

      {/* Origin & Mission */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
        <div className="space-y-4 text-sm sm:text-base text-[#0F1F17] leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
            কেন তৈরি হয়েছে Utools.bd?
          </h2>
          <p>
            বাংলাদেশে প্রতিদিন হাজার হাজার শিক্ষার্থী, চাকরিপ্রার্থী ও সাধারণ পেশাজীবী বিভিন্ন অনলাইন সেবা ও আবেদনের জন্য নানা ধরণের বিড়ম্বনায় পড়েন। যেমন— সরকারি চাকরির টেলিটক পোর্টালে (Teletalk/BPSC) আবেদন করতে গিয়ে নির্দিষ্ট ৩০০×৩০০ পিক্সেল ছবি ও ৩০০×৮০ পিক্সেল স্বাক্ষর তৈরি করা, পুরোনো সুতন্বীএমজে (SutonnyMJ) বিজয় ফন্ট থেকে ইউনিকোডে লেখা রূপান্তর করা, সার্কুলারের নির্দিষ্ট তারিখে বয়স নির্ধারণ ও কোটা যাচাই করা, কিংবা ব্যাংক চেকের জন্য টাকার সঠিক কথায় রূপান্তর লেখা।
          </p>
          <p>
            অধিকাংশ সময় এসব সাধারণ কাজের জন্য বিভিন্ন অস্বচ্ছ ওয়েবসাইটে গিয়ে ব্যক্তিগত ছবি ও গোপনীয় তথ্য আপলোড করতে হয়, যাতে তথ্য ফাঁসের ঝুঁকি থাকে। অনেক ওয়েবসাইটে আবার অতিরিক্ত বিজ্ঞাপন, পেইড সাবস্ক্রিপশন বা অ্যাকাউন্ট খোলার বাধ্যবাধকতা থাকে।
          </p>
          <p>
            এই বাস্তবতা থেকেই <strong>Utools.bd</strong>-এর জন্ম। আমরা এমন একটি সর্বজনীন প্ল্যাটফর্ম গড়ে তুলেছি, যা ব্যবহার করার জন্য কোনো রেজিস্ট্রেশন লাগবে না, কোনো ডেটা কোনো সার্ভারে যাবে না এবং প্রতিটি টুল সেকেন্ডের মধ্যে সরাসরি আপনার ব্রাউজারেই কার্যকর হবে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#D5E4DB]">
          <div className="border border-[#D5E4DB] bg-[#F0F4F2]/60 p-4 space-y-1.5 rounded-2xl">
            <div className="flex items-center space-x-2 text-[#084A2E] font-bold text-sm">
              <Users className="w-4 h-4 text-[#0B5D3B]" />
              <span>চাকরিপ্রার্থীদের জন্য</span>
            </div>
            <p className="text-xs text-[#4A5A52] leading-relaxed">
              ছবি ও স্বাক্ষর রিসাইজ, সার্কুলারভিত্তিক বয়স ও কোটা গণনা এবং পেশাদার সিভি তৈরি।
            </p>
          </div>

          <div className="border border-[#D5E4DB] bg-[#F0F4F2]/60 p-4 space-y-1.5 rounded-2xl">
            <div className="flex items-center space-x-2 text-[#084A2E] font-bold text-sm">
              <GraduationCap className="w-4 h-4 text-[#0B5D3B]" />
              <span>শিক্ষার্থীদের জন্য</span>
            </div>
            <p className="text-xs text-[#4A5A52] leading-relaxed">
              এসএসসি, এইচএসসি ও বিশ্ববিদ্যালয় সেমিস্টার গ্রেড ও সিজিপিএ ক্যালকুলেটর।
            </p>
          </div>

          <div className="border border-[#D5E4DB] bg-[#F0F4F2]/60 p-4 space-y-1.5 rounded-2xl">
            <div className="flex items-center space-x-2 text-[#084A2E] font-bold text-sm">
              <Heart className="w-4 h-4 text-[#0B5D3B]" />
              <span>পেশাজীবী ও সাধারণ মানুষের জন্য</span>
            </div>
            <p className="text-xs text-[#4A5A52] leading-relaxed">
              বিজয় ↔ ইউনিকোড টেক্সট কনভার্সন এবং ব্যাংক চেক ও দলিলের জন্য টাকার কথায় রূপান্তর।
            </p>
          </div>
        </div>
      </section>

      {/* Tools Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D5E4DB] pb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
            আমাদের সক্রিয় ডিজিটাল টুলসমূহ
          </h2>
          <span className="text-xs text-[#4A5A52] font-mono">{TOOLS.length}টি টুল উপলব্ধ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 flex flex-col justify-between hover:border-[#0B5D3B]/60 transition-colors rounded-2xl"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-[#F0F4F2] text-[#084A2E] px-2 py-0.5 rounded-sm">
                    {tool.category === 'calculator' ? 'ক্যালকুলেটর' : tool.category === 'text' ? 'টেক্সট ও কনভার্টার' : tool.category === 'image' ? 'ছবি ও গ্রাফিক্স' : 'ডকুমেন্ট'}
                  </span>
                  <span className="text-[11px] font-medium bg-[#0B5D3B] text-[#FFFFFF] px-2 py-0.5">
                    সক্রিয়
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#084A2E] font-serif">
                  {tool.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5A52] leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D5E4DB] flex items-center justify-between">
                <span className="text-xs text-[#0F1F17] truncate max-w-[200px]">
                  {tool.feature}
                </span>
                {tool.link && (
                  <Link
                    to={tool.link}
                    className="inline-flex items-center text-xs font-semibold text-[#0B5D3B] hover:text-[#084A2E] hover:underline"
                  >
                    <span>ব্যবহার করুন</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Architecture Guarantee */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 border border-[#D5E4DB] bg-[#F0F4F2] flex items-center justify-center text-[#0B5D3B] shrink-0 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#084A2E] font-serif">
              ১০০% ক্লায়েন্ট-সাইড প্রাইভেসি গ্যারান্টি
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5A52] mt-1">
              আপনার ডেটা শুধু আপনার কম্পিউটারে — কোনো রিমোট সার্ভার ইনভলভড নয়
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-[#0F1F17] leading-relaxed space-y-4">
          <p>
            Utools.bd কোনো সাধারণ ক্লাউড সফটওয়্যারের মতো কাজ করে না। আধুনিক ওয়েব ব্রাউজারের সক্ষমতাকে কাজে লাগিয়ে আমাদের প্রতিটি অ্যালগরিদম (ছবি প্রসেসিং, টেক্সট কনভার্সন, ক্যালকুলেশন ও PDF তৈরি) সরাসরি আপনার ডিভাইসের মেমোরিতে (RAM) চলে।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start space-x-2 border border-[#D5E4DB] bg-[#F0F4F2]/40 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
              <span className="text-xs text-[#0F1F17]">
                <strong>কোনো সার্ভার আপলোড নেই:</strong> আপনার ছবি বা নথির কোনো বাইটও আমাদের সার্ভারে আপলোড হয় না।
              </span>
            </div>

            <div className="flex items-start space-x-2 border border-[#D5E4DB] bg-[#F0F4F2]/40 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
              <span className="text-xs text-[#0F1F17]">
                <strong>কোনো ডেটাবেজ লগিং নেই:</strong> আমরা আপনার কোনো ব্যক্তিগত হিসাব, জন্মতারিখ বা নাম ট্র্যাক করি না।
              </span>
            </div>

            <div className="flex items-start space-x-2 border border-[#D5E4DB] bg-[#F0F4F2]/40 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
              <span className="text-xs text-[#0F1F17]">
                <strong>অফলাইন কার্যক্ষমতা:</strong> পেজটি একবার লোড হলে ইন্টারনেট সংযোগ বন্ধ করে দিলেও সব টুল কাজ করে।
              </span>
            </div>

            <div className="flex items-start space-x-2 border border-[#D5E4DB] bg-[#F0F4F2]/40 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
              <span className="text-xs text-[#0F1F17]">
                <strong>কোনো সাইন-আপ নেই:</strong> অ্যাকাউন্ট তৈরি, পাসওয়ার্ড বা ওটিপির ঝামেলামুক্ত তাৎক্ষণিক অ্যাক্সেস।
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#D5E4DB] flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[#4A5A52]">
            আমাদের ডেটা সুরক্ষা নীতিমালা সম্পর্কে বিস্তারিত জানতে আমাদের গোপনীয়তা নীতি পড়ুন।
          </p>
          <Link
            to="/privacy-policy"
            className="text-xs font-semibold text-[#0B5D3B] hover:text-[#084A2E] underline flex items-center"
          >
            <span>সম্পূর্ণ গোপনীয়তা নীতি দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#084A2E] text-[#FFFFFF] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold font-serif">
            কোনো প্রশ্ন বা নতুন টুল প্রস্তাবনা আছে?
          </h3>
          <p className="text-xs sm:text-sm text-[#D5E4DB]">
            আমরা নিয়মিত ব্যবহারকারীদের প্রয়োজন অনুযায়ী নতুন সুবিধা যোগ করে চলেছি।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/contact"
            className="px-4 py-2 bg-[#FFFFFF] text-[#084A2E] text-xs sm:text-sm font-semibold hover:bg-[#F0F4F2] transition-colors"
          >
            আমাদের সাথে যোগাযোগ করুন
          </Link>
          <Link
            to="/"
            className="px-4 py-2 border border-[#FFFFFF]/40 text-[#FFFFFF] text-xs sm:text-sm font-medium hover:bg-[#FFFFFF]/10 transition-colors"
          >
            হোমপেজে ফিরুন
          </Link>
        </div>
      </section>
    </div>
  );
};
