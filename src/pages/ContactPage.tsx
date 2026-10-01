import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/contact.json';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [relatedTool, setRelatedTool] = useState('none');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot; must always stay empty
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { copied, copy } = useCopyToClipboard();

  const handleCopyEmail = () => {
    void copy(pageContent.emailAddress || 'contact@utools.bd');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, relatedTool, message, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(
        err?.message ||
          `বার্তা পাঠাতে সমস্যা হয়েছে। সরাসরি ${pageContent.emailAddress || 'contact@utools.bd'}-এ ইমেইল করুন।`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('general');
    setRelatedTool('none');
    setMessage('');
    setSubmitError(null);
    setSubmitted(false);
  };

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'যোগাযোগ — Utools.bd',
    description: 'Utools.bd-এর সাথে যোগাযোগের মাধ্যম। মতামত, বাগ রিপোর্ট বা নতুন টুলের প্রস্তাব পাঠান।',
    url: 'https://utools.bd/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'Utools.bd',
      url: 'https://utools.bd',
      email: pageContent.emailAddress || 'contact@utools.bd'
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta
          name="description"
          content={pageContent.metaDescription}
        />
        <link rel="canonical" href="https://utools.bd/contact" />
        <meta property="og:title" content={pageContent.metaTitle} />
        <meta
          property="og:description"
          content={pageContent.metaDescription}
        />
        <meta property="og:url" content="https://utools.bd/contact" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta
          name="twitter:description"
          content={pageContent.metaDescription}
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(contactSchema)}</script>
      </Helmet>

      {/* Header */}
      <section className="space-y-3 border-b border-[#D5E4DB] pb-6">
        <div className="inline-flex items-center gap-2 bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1 text-xs text-[#084A2E] font-medium rounded-lg">
          <MessageSquare className="w-3.5 h-3.5 text-[#0B5D3B]" />
          <span>{pageContent.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-sm sm:text-base text-[#4A5A52] max-w-2xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </section>

      {/* Official Email Highlight Card */}
      <section className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 border border-[#D5E4DB] bg-[#F0F4F2] flex items-center justify-center text-[#0B5D3B] shrink-0 rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#4A5A52] block font-medium">
              {pageContent.emailLabel || 'অফিসিয়াল যোগাযোগ ইমেইল:'}
            </span>
            <span className="font-mono text-base font-bold text-[#084A2E]">
              {pageContent.emailAddress || 'contact@utools.bd'}
            </span>
            {pageContent.responseNote && (
              <span className="text-[11px] text-[#4A5A52] block mt-0.5">
                {pageContent.responseNote}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#084A2E] px-3 py-1.5 text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer rounded-lg"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>ইমেইল কপি করুন</span>
              </>
            )}
          </button>
          <a
            href="mailto:contact@utools.bd"
            className="bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
          >
            ইমেইল পাঠাতে ক্লিক করুন
          </a>
        </div>
      </section>

      {/* Main Form & Guidelines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Contact Form (2 cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#D5E4DB] p-6 sm:p-8 space-y-6 rounded-2xl">
          <h2 className="text-lg font-bold text-[#084A2E] font-serif border-b border-[#D5E4DB] pb-3">
            বার্তা বা মতামত পাঠান
          </h2>

          {submitted ? (
            <div className="p-6 bg-[#F0F4F2] border border-[#0B5D3B]/40 text-center space-y-3 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#0B5D3B] text-[#FFFFFF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#084A2E] font-serif">
                আপনার বার্তা সফলভাবে গৃহীত হয়েছে!
              </h3>
              <p className="text-xs sm:text-sm text-[#34443B] max-w-md mx-auto leading-relaxed">
                ধন্যবাদ, {name}! আপনার মতামত বা প্রস্তাবনাটি আমাদের নজরে এসেছে। প্রয়োজনে আমরা <span className="font-mono font-medium">{email}</span> ঠিকানায় আপনার সাথে যোগাযোগ করব।
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#0B5D3B] text-[#FFFFFF] text-xs font-medium hover:bg-[#084A2E] transition-colors cursor-pointer"
                >
                  আরেকটি বার্তা পাঠান
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot: hidden from real visitors, bots often fill every input. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] w-px h-px opacity-0"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-xs font-semibold text-[#084A2E] block">
                    আপনার পূর্ণ নাম <span className="text-[#c8342a]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমনঃ মোঃ আশিকুর রহমান"
                    className="w-full px-3 py-2 bg-[#F0F4F2]/40 border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-[#084A2E] block">
                    ইমেইল ঠিকানা <span className="text-[#c8342a]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3 py-2 bg-[#F0F4F2]/40 border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact-subject" className="text-xs font-semibold text-[#084A2E] block">
                    বার্তার বিষয়
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] rounded-lg"
                  >
                    <option value="general">সাধারণ মতামত / প্রশংসা</option>
                    <option value="feature">নতুন টুলের প্রস্তাবনা</option>
                    <option value="bug">ত্রুটি বা বাগ রিপোর্ট</option>
                    <option value="partnership">সহযোগিতা / অংশীদারিত্ব</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-tool" className="text-xs font-semibold text-[#084A2E] block">
                    সম্পর্কিত টুল (যদি প্রযোজ্য হয়)
                  </label>
                  <select
                    id="contact-tool"
                    value={relatedTool}
                    onChange={(e) => setRelatedTool(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] rounded-lg"
                  >
                    <option value="none">কোনো নির্দিষ্ট টুল নয় / সাধারণ</option>
                    <option value="converter">বিজয় ↔ ইউনিকোড কনভার্টার</option>
                    <option value="photo-resizer">সরকারি ছবি ও স্বাক্ষর রিসাইজার</option>
                    <option value="age-calculator">সরকারি চাকরির বয়স ক্যালকুলেটর</option>
                    <option value="amount-in-words">টাকা কথায় কনভার্টার</option>
                    <option value="gpa-calculator">জিপিএ ও সিজিপিএ ক্যালকুলেটর</option>
                    <option value="land-converter">জমির মাপ কনভার্টার</option>
                    <option value="gold-calculator">স্বর্ণের পরিমাপ ও দাম ক্যালকুলেটর</option>
                    <option value="cv-builder">সিভি ও জীবনবৃত্তান্ত মেকার</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="text-xs font-semibold text-[#084A2E] block">
                  আপনার বার্তা বা বিবরণ <span className="text-[#c8342a]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার মতামত, সমস্যা বা নতুন ফিচারের বিস্তারিত বিবরণ এখানে লিখুন..."
                  className="w-full p-3 bg-[#F0F4F2]/40 border border-[#D5E4DB] text-sm text-[#0F1F17] focus:outline-none focus:border-[#0B5D3B] resize-y rounded-2xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#4A5A52]">
                  আপনার তথ্য সম্পূর্ণ গোপন থাকবে, কোথাও প্রকাশ করা হবে না।
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
                </button>
              </div>
              {submitError && (
                <p className="text-xs text-[#c8342a] flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{submitError}</span>
                </p>
              )}
            </form>
          )}
        </div>

        {/* Right: Helpful Guides (1 col) */}
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-3 rounded-2xl">
            <h3 className="text-sm font-bold text-[#084A2E] font-serif flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
              <span>নতুন টুল প্রস্তাব করতে চান?</span>
            </h3>
            <p className="text-xs text-[#4A5A52] leading-relaxed">
              বাংলাদেশে ব্যবহারযোগ্য এমন কোনো টুল যা আপনার বা শিক্ষার্থীদের কাজে আসবে? আমাদের জানান, আমরা ক্লায়েন্ট-সাইড প্রযুক্তি দিয়ে তা বাস্তবায়নের চেষ্টা করব।
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-3 rounded-2xl">
            <h3 className="text-sm font-bold text-[#084A2E] font-serif flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-[#0B5D3B]" />
              <span>বাগ বা গণনায় ভুল পেলে:</span>
            </h3>
            <p className="text-xs text-[#4A5A52] leading-relaxed">
              কোনো টুল যদি অপ্রত্যাশিত ফলাফল দেয় (যেমন নির্দিষ্ট কোনো বিজয় যুক্তবর্ণ বা বয়স হিসাব), তবে ইনপুট টেক্সট বা তারিখ উল্লেখ করে বার্তা পাঠালে দ্রুত সমাধান করা সম্ভব হয়।
            </p>
          </div>

          <div className="bg-[#F0F4F2] border border-[#D5E4DB] p-4 text-xs space-y-2 rounded-2xl">
            <span className="font-bold text-[#084A2E] block">
              গোপনীয়তার নিশ্চয়তা:
            </span>
            <p className="text-[#4A5A52] leading-relaxed">
              আপনার পাঠানো ইমেইল কেবল আপনার সাথে যোগাযোগের উদ্দেশ্যে সংরক্ষিত থাকবে। কোনো স্প্যাম বা প্রচারণামূলক ইমেইল পাঠানো হয় না।
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic CMS Sections (FAQs, Markdown Content, Guidelines, etc.) */}
      <CmsDynamicContent content={pageContent} excludeSections={['contact']} />
    </div>
  );
};
