import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Gift,
  HelpCircle,
  Lock,
  MousePointerClick,
  ShieldCheck,
  Tag,
  Upload,
  User,
  UserX,
  WifiOff,
  Zap,
} from 'lucide-react';
import { TOOLS } from '../data/tools.ts';
import { SITE_UPDATES } from '../data/updates.ts';
import { getToolIcon } from '../data/toolIcons.tsx';
import { toBn } from '../utils/bnDigits.ts';
import { HOMEPAGE_BLOG_POSTS, getCategorySlug } from '../utils/blog.ts';
import { BlogImage } from '../components/blog/BlogImage.tsx';
import type { ToolItem } from '../types.ts';
import { ParallaxLayer, ParallaxScene, ParallaxStage } from '../components/parallax/Parallax.tsx';
import { Diamond, JAMDANI_PATTERN, Ring, SolidDiamond, Wave } from '../components/parallax/scenery.tsx';
import homeContent from '../../content/pages/home.json';
import homeFaqs from '../../content/pages/home-faq.json';

interface HomePageProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenTerms: () => void;
}

const FAQS = homeFaqs;


// ── Static content ───────────────────────────────────────────────────────────

const CATEGORY_TABS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'সকল টুলস' },
  { key: 'text', label: 'টেক্সট রূপান্তর' },
  { key: 'image', label: 'গ্রাফিক্স ও ছবি' },
  { key: 'calculator', label: 'ক্যালকুলেটর' },
  { key: 'document', label: 'সিভি ও ডকুমেন্ট' },
];

const CATEGORY_GRADIENT: Record<string, string> = {
  text: 'linear-gradient(135deg, #FEF3D0, #FDE68A)',
  image: 'linear-gradient(135deg, #E6F4EC, #A7D9BE)',
  calculator: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
  document: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
};

/** Tools added most recently — shown with a "নতুন" badge. */
const NEW_TOOL_IDS = new Set(['typing-test', 'land-converter', 'heic-converter', 'bulk-photo-resizer', 'qr-generator']);

/** Featured tools in the bento section (first one gets the large card). */
const FEATURED_IDS = [
  'photo-resizer',
  'bijoy-converter',
  'cv-builder',
  'pdf-merger',
  'gpa-calculator',
  'age-calculator',
];

const FEATURED_SHORT: Record<string, string> = {
  'bijoy-converter': 'বিজয় ANSI লেখা ইউনিকোডে, ইউনিকোড বিজয়ে',
  'typing-test': 'বাংলা ও ইংরেজি লাইভ WPM স্পিড টেস্ট',
  'cv-builder': '৫টি টেমপ্লেটে বাংলা ও ইংরেজি সিভি',
  'pdf-merger': 'একাধিক PDF এক ফাইলে জোড়া লাগান',
  'gpa-calculator': 'SSC/HSC ও ভার্সিটি CGPA হিসাব',
  'age-calculator': 'সরকারি চাকরির বয়স ও কোটা যাচাই',
};

const STEPS = [
  { icon: MousePointerClick, title: 'টুল বেছে নিন', desc: 'আপনার প্রয়োজন অনুযায়ী ক্যাটাগরি থেকে টুল বেছে নিন' },
  { icon: Upload, title: 'ফাইল বা তথ্য দিন', desc: 'ছবি, পিডিএফ বা যেকোনো তথ্য আপলোড বা টাইপ করুন' },
  { icon: Download, title: 'সাথে সাথে ফলাফল পান', desc: 'সেকেন্ডের মধ্যে ফলাফল ডাউনলোড করুন' },
];

const PRIVACY_POINTS = [
  { icon: Zap, title: 'ক্লায়েন্ট-সাইড প্রসেসিং', desc: 'সব কাজ আপনার ব্রাউজারে হয়, সার্ভারে কিছু যায় না' },
  { icon: UserX, title: 'কোনো সাইনআপ নেই', desc: 'অ্যাকাউন্ট বা ইমেইল ছাড়াই ব্যবহার করুন' },
  { icon: WifiOff, title: 'অফলাইনে কাজ করে', desc: 'একবার পেজ লোড হলে অধিকাংশ টুল ইন্টারনেট ছাড়াও চলে' },
  { icon: Gift, title: 'সম্পূর্ণ বিনামূল্যে', desc: 'কোনো প্রিমিয়াম প্ল্যান নেই, সব টুল ফ্রি' },
];

// ── Small shared pieces ──────────────────────────────────────────────────────

const SectionHeading: React.FC<{
  badge?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  id?: string;
}> = ({ badge, title, subtitle, center, id }) => (
  <div className={`mb-10 md:mb-12 ${center ? 'text-center' : ''}`}>
    {badge && (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-[#E6F4EC] text-[#0B5D3B]">
        {badge}
      </span>
    )}
    <h2 id={id} className="text-3xl lg:text-4xl font-bold text-[#0F1F17] tracking-tight">
      {title}
    </h2>
    {subtitle && <p className="mt-3 text-lg text-[#4A5A52]">{subtitle}</p>}
  </div>
);

const NewBadge: React.FC = () => (
  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F5A524] text-[#0F1F17]">নতুন</span>
);

function findTool(id: string): ToolItem | undefined {
  return TOOLS.find((t) => t.id === id);
}

// ── Hero (multi-layer parallax: glows → jamdani diamonds → motifs → river waves, plus mouse depth) ─────

const Hero: React.FC = () => (
  <ParallaxScene pointer>
    <ParallaxStage>
    {/* far layer: dot grid + soft glows */}
    <ParallaxLayer dist={30} className="left-0 right-0 -top-10 -bottom-10 dot-grid opacity-40" />
    <ParallaxLayer
      dist={70}
      depth={-12}
      className="-top-28 -left-40 w-[560px] h-[560px] rounded-full"
      style={{ background: 'radial-gradient(closest-side, rgba(230,244,236,1), rgba(230,244,236,0.4) 55%, transparent)' }}
    />
    <ParallaxLayer
      dist={-40}
      depth={16}
      className="top-20 -right-24 w-[460px] h-[460px] rounded-full"
      style={{ background: 'radial-gradient(closest-side, rgba(254,243,208,0.95), rgba(254,243,208,0.35) 55%, transparent)' }}
    />

    {/* mid layer: oversized jamdani diamonds that drift and slowly turn with the scroll */}
    <ParallaxLayer dist={90} rot={16} depth={8} className="-top-32 -right-44 w-[580px] h-[580px] text-[#0B5D3B]/[0.09]">
      <Diamond className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={-70} rot={-24} depth={-10} className="bottom-28 -left-44 w-[320px] h-[320px] text-[#F5A524]/30 hidden md:block">
      <Diamond className="w-full h-full" filled={false} />
    </ParallaxLayer>

    {/* near layer: small motifs that move faster than the page */}
    <ParallaxLayer dist={-150} rot={70} depth={26} className="top-[16%] left-[48%] w-4 h-4 text-[#F5A524] hidden md:block">
      <SolidDiamond className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={120} rot={-100} depth={-20} className="top-[64%] left-[46%] w-7 h-7 text-[#0B5D3B]/40 hidden lg:block">
      <Ring className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={-110} rot={40} depth={30} className="top-[30%] right-[5%] w-3 h-3 text-[#0B5D3B]/50 hidden lg:block">
      <SolidDiamond className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={90} rot={120} depth={-28} className="bottom-[26%] right-[12%] w-5 h-5 text-[#F5A524]/80 hidden lg:block">
      <Ring className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={-70} depth={22} className="top-[9%] left-[10%] w-2 h-2 rounded-full bg-[#F5A524]/70 hidden sm:block" />
    <ParallaxLayer dist={60} depth={-18} className="top-[46%] left-[3%] w-2.5 h-2.5 rounded-full bg-[#0B5D3B]/25 hidden md:block" />

    {/* river / paddy waves; the front one has the page colour so the hero melts into the next section */}
    <ParallaxLayer x={-50} dist={26} className="left-[-6%] right-[-6%] bottom-0 h-[150px] text-[#DDEFE4]">
      <Wave variant={0} className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer x={60} dist={-10} className="left-[-6%] right-[-6%] bottom-0 h-[115px] text-[#EAF5EE]">
      <Wave variant={1} className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer x={-40} dist={-38} className="left-[-6%] right-[-6%] -bottom-px h-[80px] text-[#FAFAF7]">
      <Wave variant={2} className="w-full h-full" />
    </ParallaxLayer>
    </ParallaxStage>

    <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 pb-28 lg:pt-24 lg:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 bg-[#E6F4EC]/90 text-[#0B5D3B] border border-[#0B5D3B]/25">
          <span aria-hidden="true">🇧🇩</span>
          <span>{homeContent.heroBadge}</span>
        </div>

        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0F1F17] tracking-tight leading-[1.2] mb-6">
          {homeContent.heroTitlePrefix}<span className="squiggle-underline text-[#0B5D3B]">{homeContent.heroTitleHighlight}</span>{homeContent.heroTitleSuffix}
        </h1>

        <p className="text-lg leading-relaxed mb-10 max-w-xl text-[#4A5A52]">
          {homeContent.heroSubtitle}
        </p>

        <div className="flex flex-wrap gap-4 mb-10">
          <a
            href="#tools"
            className="btn-shine inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white text-base"
            style={{ background: 'linear-gradient(135deg, #0B5D3B, #0D7048)', boxShadow: '0 8px 24px rgba(11,93,59,0.4)' }}
          >
            টুলস দেখুন <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base bg-white/85 text-[#0B5D3B] border-[1.5px] border-[#0B5D3B]/25 hover:bg-[#E6F4EC] transition-colors"
          >
            কীভাবে কাজ করে
          </a>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#4A5A52]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] shrink-0" />
            {homeContent.heroPoints[0]}
          </li>
          <li className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#0B5D3B] shrink-0" />
            {homeContent.heroPoints[1]}
          </li>
        </ul>
      </div>


      {/* Decorative collage of real tools (hidden on small screens). Each card has mouse depth + its own float. */}
      <div className="relative hidden lg:flex items-center justify-center h-[540px]" aria-hidden="true">
        <ParallaxLayer depth={22} className="left-4 top-12 will-change-transform">
          <div className="float-1 w-56 rounded-2xl bg-white/95 border border-[#0B5D3B]/10 shadow-[0_20px_60px_rgba(11,93,59,0.18)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E6F4EC] text-[#0B5D3B]">
              {React.createElement(getToolIcon('pdf-merger'), { className: 'w-4 h-4' })}
            </span>
            <span className="text-xs font-semibold text-[#0F1F17]">পিডিএফ মার্জার</span>
          </div>
          <div className="space-y-2 mb-3">
            {['আবেদনপত্র.pdf', 'সনদ.pdf', 'ছবি.pdf'].map((f, i) => (
              <div
                key={f}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border border-[#0B5D3B]/10 ${i === 0 ? 'bg-[#E6F4EC]' : 'bg-[#F8FAF9]'}`}
              >
                <span className="text-xs text-[#4A5A52]">{f}</span>
              </div>
            ))}
          </div>
          <div className="py-2 rounded-lg text-center text-xs font-semibold text-white bg-[#0B5D3B]">একত্রিত করুন</div>
        </div>
        </ParallaxLayer>
        <ParallaxLayer depth={34} className="right-0 top-8 will-change-transform">
          <div className="float-2 w-56 rounded-2xl bg-white/95 border border-[#0B5D3B]/10 shadow-[0_20px_60px_rgba(11,93,59,0.18)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#FEF3D0] text-[#92400E]">
              {React.createElement(getToolIcon('photo-resizer'), { className: 'w-4 h-4' })}
            </span>
            <span className="text-xs font-semibold text-[#0F1F17]">ছবি রিসাইজার</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-[72px] rounded-xl flex items-center justify-center bg-[#E6F4EC] text-[#0B5D3B]">
              <User className="w-8 h-8" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#F5A524] shrink-0" />
            <div className="w-12 h-[60px] rounded-xl flex items-center justify-center bg-[#E6F4EC] text-[#0B5D3B]">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 text-center px-2 py-1 rounded-lg text-xs font-medium bg-[#E6F4EC] text-[#0B5D3B]">সরকারি</div>
            <div className="flex-1 text-center px-2 py-1 rounded-lg text-xs font-medium bg-[#F0F4F2] text-[#4A5A52]">পাসপোর্ট</div>
          </div>
        </div>
        </ParallaxLayer>
        <ParallaxLayer depth={14} className="left-12 bottom-12 will-change-transform">
          <div className="float-3 w-56 rounded-2xl bg-white/95 border border-[#0B5D3B]/10 shadow-[0_20px_60px_rgba(11,93,59,0.18)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EDE9FE] text-[#5B21B6]">
              {React.createElement(getToolIcon('gpa-calculator'), { className: 'w-4 h-4' })}
            </span>
            <span className="text-xs font-semibold text-[#0F1F17]">জিপিএ ক্যালকুলেটর</span>
          </div>
          <div className="space-y-1.5 mb-3">
            {[['বাংলা', 'A+'], ['ইংরেজি', 'A'], ['গণিত', 'A+']].map(([sub, grade]) => (
              <div key={sub} className="flex items-center justify-between">
                <span className="text-xs text-[#4A5A52]">{sub}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md font-latin ${grade === 'A+' ? 'bg-[#E6F4EC] text-[#0B5D3B]' : 'bg-[#FEF3D0] text-[#B45309]'}`}
                >
                  {grade}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #0B5D3B, #0D7048)' }}>
            <span className="text-xs text-white font-medium">জিপিএ</span>
            <span className="text-lg font-bold text-white font-latin">5.00</span>
          </div>
        </div>
        </ParallaxLayer>

        <span className="absolute right-8 bottom-32 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F5A524] text-[#0F1F17] shadow-[0_4px_12px_rgba(245,165,36,0.4)]">
          নতুন
        </span>
        <span className="absolute left-28 top-44 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E6F4EC]/90 text-[#0B5D3B] border border-[#0B5D3B]/20">
          ✓ ডাউনলোড রেডি
        </span>
      </div>
    </div>
  </ParallaxScene>
);

// ── Stats (all figures are real / derived from the tool list) ───────────────

const Stats: React.FC = () => {
  const stats = [
    { value: `${toBn(TOOLS.length)}টি`, label: homeContent.stats.toolsLabel },
    { value: homeContent.stats.processingValue, label: homeContent.stats.processingLabel },
    { value: homeContent.stats.costValue, label: homeContent.stats.costLabel },
    { value: homeContent.stats.accessValue, label: homeContent.stats.accessLabel },
  ];
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 relative z-20 -mt-2 lg:-mt-6">
      <dl className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl bg-white border border-[#0B5D3B]/10 shadow-[0_20px_60px_rgba(11,93,59,0.12)] overflow-hidden">
        {stats.map((stat, i) => (
          <div key={stat.label} className="p-6 lg:p-8 text-center relative">
            {i < stats.length - 1 && (
              <span className="hidden lg:block absolute right-0 top-6 bottom-6 w-px bg-[#0B5D3B]/10" aria-hidden="true" />
            )}
            <dd className="text-2xl lg:text-3xl font-bold mb-1 text-[#0B5D3B] order-first">{stat.value}</dd>
            <dt className="text-sm text-[#4A5A52]">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
};

// ── Featured tools (bento) ──────────────────────────────────────────────────

const FeaturedTools: React.FC = () => {
  const [lead, ...rest] = FEATURED_IDS.map(findTool).filter((t): t is ToolItem => Boolean(t));
  if (!lead) return null;
  const LeadIcon = getToolIcon(lead.id);

  return (
    <ParallaxScene className="hidden md:block py-20 lg:py-24" aria-labelledby="featured-heading">
    <ParallaxStage>
      <ParallaxLayer dist={80} rot={12} className="-top-16 -right-40 w-[460px] h-[460px] text-[#0B5D3B]/[0.07] hidden md:block">
        <Diamond className="w-full h-full" />
      </ParallaxLayer>
      <ParallaxLayer
        dist={-60}
        className="bottom-0 -left-40 w-[420px] h-[420px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(254,243,208,0.7), transparent)' }}
      />
    </ParallaxStage>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        <SectionHeading
          id="featured-heading"
          badge={homeContent.featuredHeading.badge}
          title={homeContent.featuredHeading.title}
          subtitle={homeContent.featuredHeading.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Large lead card */}
          <Link
            to={lead.link ?? '/'}
            className="tool-card card-hover md:col-span-3 lg:col-span-2 rounded-2xl p-6 relative overflow-hidden bg-white border border-[#0B5D3B]/10 shadow-[0_4px_16px_rgba(11,93,59,0.06)] flex flex-col"
          >
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5A524] text-[#0F1F17]">
              সরকারি চাকরি
            </span>
            <span
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#0B5D3B]"
              style={{ background: CATEGORY_GRADIENT.image }}
            >
              <LeadIcon className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold mb-2 text-[#0F1F17]">{lead.title}</h3>
            <p className="text-sm mb-6 text-[#4A5A52] leading-relaxed">{lead.description}</p>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAF9] mt-auto" aria-hidden="true">
              <div className="flex-1 text-center">
                <div className="w-16 h-20 mx-auto rounded-lg flex items-center justify-center mb-2 bg-[#E6F4EC] border-2 border-dashed border-[#0B5D3B]/20 text-[#0B5D3B]">
                  <User className="w-8 h-8" />
                </div>
                <p className="text-xs text-[#4A5A52]">আসল ছবি</p>
              </div>
              <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0B5D3B] text-white shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
              <div className="flex-1 text-center">
                <div className="w-10 h-12 mx-auto rounded-lg flex items-center justify-center mb-2 bg-[#0B5D3B] text-white">
                  <User className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#0B5D3B]">৩০০×৩০০ • ১০০ KB</p>
              </div>
            </div>

            <span className="tool-arrow flex items-center gap-1 mt-4 text-sm font-semibold text-[#0B5D3B]">
              টুল চালু করুন <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {rest.map((tool) => {
            const Icon = getToolIcon(tool.id);
            return (
              <Link
                key={tool.id}
                to={tool.link ?? '/'}
                className="tool-card card-hover rounded-2xl p-5 bg-white border border-[#0B5D3B]/10 shadow-[0_4px_16px_rgba(11,93,59,0.06)] flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0B5D3B]"
                    style={{ background: CATEGORY_GRADIENT[tool.category] ?? CATEGORY_GRADIENT.image }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  {NEW_TOOL_IDS.has(tool.id) && <NewBadge />}
                </div>
                <h3 className="text-sm font-bold mb-1 text-[#0F1F17] leading-snug">{tool.title}</h3>
                <p className="text-xs text-[#4A5A52] leading-relaxed">{FEATURED_SHORT[tool.id] ?? tool.feature}</p>
                <span className="tool-arrow flex items-center gap-1 mt-3 text-xs font-semibold text-[#0B5D3B]">
                  চালু করুন <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </ParallaxScene>
  );
};

// ── All tools with category filter (state is owned by App so the navbar can drive it) ─

const AllTools: React.FC<{ selectedCategory: string; onSelectCategory: (c: string) => void }> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const filtered = useMemo(
    () => (selectedCategory === 'all' ? TOOLS : TOOLS.filter((t) => t.category === selectedCategory)),
    [selectedCategory],
  );

  return (
    <section id="tools" className="py-20 lg:py-24 bg-white" aria-labelledby="tools-heading">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <SectionHeading
          id="tools-heading"
          title={homeContent.allToolsHeading.title}
          subtitle={homeContent.allToolsHeading.subtitle}
        />

        <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="টুলস ক্যাটাগরি">
          {CATEGORY_TABS.map((tab) => {
            const active = selectedCategory === tab.key;
            const count = tab.key === 'all' ? TOOLS.length : TOOLS.filter((t) => t.category === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectCategory(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                    : 'bg-white text-[#4A5A52] border-[#0B5D3B]/20 hover:text-[#0B5D3B] hover:border-[#0B5D3B]/50'
                }`}
              >
                {tab.label} ({toBn(count)})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => {
            const Icon = getToolIcon(tool.id);
            const tags = tool.feature.split('•').map((t) => t.trim()).filter(Boolean).slice(0, 3);
            const card = (
              <>
                <div className="flex items-start gap-4">
                  <span
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-[#0B5D3B]"
                    style={{ background: CATEGORY_GRADIENT[tool.category] ?? '#E6F4EC' }}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base mb-1 text-[#0F1F17] leading-snug">{tool.title}</h3>
                      {NEW_TOOL_IDS.has(tool.id) && <NewBadge />}
                    </div>
                    <p className="text-sm mb-3 text-[#4A5A52] leading-relaxed line-clamp-3">{tool.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#E6F4EC] text-[#0B5D3B]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="tool-arrow flex items-center justify-end gap-1 mt-4 text-sm font-semibold text-[#0B5D3B]">
                  টুল চালু করুন <ArrowRight className="w-4 h-4" />
                </span>
              </>
            );
            const cls =
              'tool-card card-hover rounded-2xl p-5 bg-[#FAFAF7] border border-[#0B5D3B]/10 flex flex-col justify-between';
            return tool.status === 'active' && tool.link ? (
              <Link key={tool.id} to={tool.link} className={cls}>
                {card}
              </Link>
            ) : (
              <div key={tool.id} className={`${cls} opacity-70`}>
                {card}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// ── About text (existing SEO copy, kept) ────────────────────────────────────

const AboutBand: React.FC = () => (
  <section className="py-16">
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
      <div className="rounded-2xl bg-white border border-[#0B5D3B]/10 p-6 sm:p-8 shadow-[0_4px_16px_rgba(11,93,59,0.05)]">
        <h2 className="text-xl font-bold text-[#0F1F17] mb-3">{homeContent.banner.heading}</h2>
        <p className="text-sm sm:text-base text-[#4A5A52] leading-relaxed">
          {homeContent.banner.description}
        </p>
      </div>
    </div>
  </section>
);

// ── How it works ────────────────────────────────────────────────────────────

const HowItWorks: React.FC = () => (
  <section id="how" className="py-20 lg:py-24 bg-white" aria-labelledby="how-heading">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <SectionHeading
        id="how-heading"
        center
        badge={homeContent.howItWorks.badge}
        title={homeContent.howItWorks.title}
      />
      <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        <span
          className="hidden md:block absolute top-12 left-[20%] right-[20%] border-t-2 border-dashed border-[#0B5D3B]/20"
          aria-hidden="true"
        />
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="text-center relative">
              <div className="relative inline-block mb-6">
                <span className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto relative z-10 bg-white border border-[#0B5D3B]/10 shadow-[0_8px_32px_rgba(11,93,59,0.1)] text-[#0B5D3B]">
                  <Icon className="w-9 h-9" />
                </span>
                <span
                  className="absolute -top-2 -right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white font-latin"
                  style={{ background: i === 0 ? '#0B5D3B' : i === 1 ? '#D98E0B' : '#0D7048' }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#0F1F17]">{homeContent.howItWorks.steps[i]?.title ?? step.title}</h3>
              <p className="text-base leading-relaxed text-[#4A5A52] max-w-xs mx-auto">{homeContent.howItWorks.steps[i]?.desc ?? step.desc}</p>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);

// ── Privacy (dark, layered parallax with waves that flow in from the sections above and below) ────────

const Privacy: React.FC<{ onOpenTerms: () => void }> = ({ onOpenTerms }) => (
  <ParallaxScene data-cursor-theme="dark" className="py-32 lg:py-40 bg-[#052D1C]" aria-labelledby="privacy-heading">
    <ParallaxStage>
    {/* far: tiled jamdani lattice + green glow */}
    <ParallaxLayer
      dist={60}
      className="left-0 right-0 -top-[20%] -bottom-[20%]"
      style={{ backgroundImage: JAMDANI_PATTERN, backgroundSize: '64px 64px' }}
    />
    <ParallaxLayer
      dist={-30}
      className="inset-0"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(13,112,72,0.55), transparent 60%)' }}
    />
    {/* mid: large outlined diamonds */}
    <ParallaxLayer dist={-110} rot={22} className="-bottom-28 -right-24 w-[440px] h-[440px] text-[#F5A524]/[0.22]">
      <Diamond className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={80} rot={-18} className="-top-24 left-[32%] w-[280px] h-[280px] text-white/[0.09] hidden md:block">
      <Diamond className="w-full h-full" filled={false} />
    </ParallaxLayer>
    {/* near: small motifs */}
    <ParallaxLayer dist={-90} rot={90} className="top-[12%] left-[30%] w-4 h-4 text-[#F5A524]/80 hidden md:block">
      <SolidDiamond className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer dist={110} rot={-120} className="bottom-[22%] left-[46%] w-6 h-6 text-white/30 hidden lg:block">
      <Ring className="w-full h-full" />
    </ParallaxLayer>
    {/* wave edges: white flows in from "How it works", page-colour flows out to the release log */}
    <ParallaxLayer x={50} dist={-10} className="left-[-6%] right-[-6%] -top-px h-[80px] text-white">
      <Wave flip variant={1} className="w-full h-full" />
    </ParallaxLayer>
    <ParallaxLayer x={-50} dist={10} className="left-[-6%] right-[-6%] -bottom-px h-[80px] text-[#FAFAF7]">
      <Wave variant={2} className="w-full h-full" />
    </ParallaxLayer>
    </ParallaxStage>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-8 bg-white/10 text-[#F5A524]">
            <ShieldCheck className="w-9 h-9" />
          </span>
          <h2 id="privacy-heading" className="text-3xl lg:text-4xl font-bold mb-6 text-white tracking-tight">
            {homeContent.privacy.heading}
          </h2>
          <p className="text-lg leading-relaxed text-white/75 mb-8">
            {homeContent.privacy.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/privacy-policy"
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#F5A524] text-[#0F1F17] hover:bg-[#FFB83D] transition-colors"
            >
              গোপনীয়তা নীতি
            </Link>
            <Link
              to="/about"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              আমাদের সম্পর্কে
            </Link>
            <button
              type="button"
              onClick={onOpenTerms}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
            >
              ব্যবহারের নিয়ম
            </button>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-4">
          {PRIVACY_POINTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <li key={p.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.07] border border-white/10">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/10 text-[#F5A524]">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{homeContent.privacy.points[i]?.title ?? p.title}</h3>
                  <p className="text-sm text-white/65">{homeContent.privacy.points[i]?.desc ?? p.desc}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#F5A524] shrink-0 mt-1" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </div>
  </ParallaxScene>
);

// ── Latest Blog Posts (Homepage Section) ───────────────────────────────────

const LatestBlogPosts: React.FC = () => {
  const heading = (homeContent as any).blogHeading || {
    badge: 'লেটেস্ট ব্লগ',
    title: 'ব্লগ ও প্রয়োজনীয় নির্দেশিকা',
    subtitle: 'চাকরি, শিক্ষা ও ডিজিটাল জীবনকে সহজ করার নির্ভরযোগ্য সহায়ক গাইড',
  };

  return (
    <section className="py-20 lg:py-24 bg-[#F8FAF9]/60 border-t border-b border-[#D5E4DB]/60" aria-labelledby="blog-heading">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-[#E6F4EC] text-[#0B5D3B]">
              <BookOpen className="w-3.5 h-3.5" /> {heading.badge}
            </span>
            <h2 id="blog-heading" className="text-3xl font-bold text-[#0F1F17] tracking-tight">
              {heading.title}
            </h2>
          </div>
          <p className="text-sm text-[#4A5A52] max-w-md">{heading.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOMEPAGE_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl bg-white border border-[#D5E4DB] p-5 flex flex-col justify-between hover:border-[#0B5D3B]/40 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <Link to={`/blog/${post.slug}`} className="block rounded-xl overflow-hidden aspect-[16/9] bg-[#F0F4F2]">
                  <BlogImage
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    aspectRatio="16/9"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="flex items-center justify-between text-xs text-[#4A5A52] pt-1">
                  {post.category && (
                    <Link
                      to={`/blog/category/${getCategorySlug(post.category)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3D0] text-[#B45309] font-medium text-[11px] hover:bg-[#FDE68A] transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{post.category}</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {post.readTime && (
                      <span className="inline-flex items-center gap-1 text-[#4A5A52]">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </span>
                    )}
                    <span>{toBn(post.date)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0F1F17] leading-snug group-hover:text-[#0B5D3B] transition-colors">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs sm:text-sm text-[#4A5A52] leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D5E4DB]/60 flex items-center justify-between">
                {post.relatedTool && post.relatedToolLabel ? (
                  <Link
                    to={post.relatedTool}
                    className="text-[11px] font-medium text-[#0B5D3B] hover:underline bg-[#E6F4EC] px-2 py-1 rounded-md"
                  >
                    টুল: {post.relatedToolLabel}
                  </Link>
                ) : (
                  <span />
                )}

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center text-xs font-bold text-[#0B5D3B] group-hover:text-[#084A2E]"
                >
                  <span>পড়ুন</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B5D3B] hover:bg-[#084A2E] text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md group cursor-pointer"
          >
            <span>সব আর্টিকেল দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── FAQ ─────────────────────────────────────────────────────────────────────

const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="py-20 lg:py-24 bg-white" aria-labelledby="faq-heading">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-[#E6F4EC] text-[#0B5D3B]">
            <HelpCircle className="w-3.5 h-3.5" /> সাধারণ প্রশ্ন
          </span>
          <h2 id="faq-heading" className="text-3xl font-bold mb-4 text-[#0F1F17] tracking-tight">
            সাধারণ প্রশ্নোত্তর
          </h2>
          <p className="text-base leading-relaxed mb-8 text-[#4A5A52]">
            আপনার যেকোনো প্রশ্নের উত্তর না পেলে আমাদের সাথে যোগাযোগ করুন।
          </p>
          <div className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#0B5D3B]/10">
            <p className="font-semibold mb-1 text-[#0F1F17]">আমাদের জানান</p>
            <p className="text-sm mb-4 text-[#4A5A52]">টুল প্রস্তাব বা মতামত জানাতে যোগাযোগ পেজে যান</p>
            <Link
              to="/contact"
              className="block text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0B5D3B] hover:bg-[#084A2E] transition-colors"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl overflow-hidden bg-[#FAFAF7] border transition-colors ${
                  isOpen ? 'border-[#0B5D3B]/30' : 'border-[#0B5D3B]/10'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  >
                    <span className="font-semibold text-base pr-4 text-[#0F1F17]">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-[#4A5A52] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="px-5 pb-5">
                    <p className="text-sm leading-relaxed text-[#4A5A52]">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── Final CTA ───────────────────────────────────────────────────────────────

const FinalCta: React.FC = () => (
  <section className="py-16 px-4 sm:px-6">
    <div className="max-w-[1200px] mx-auto">
      <ParallaxScene as="div" data-cursor-theme="dark" className="rounded-3xl bg-[#052D1C]">
    <ParallaxStage>
        <ParallaxLayer
          dist={50}
          className="left-0 right-0 -top-[20%] -bottom-[20%]"
          style={{ backgroundImage: JAMDANI_PATTERN, backgroundSize: '64px 64px' }}
        />
        <ParallaxLayer
          dist={-30}
          className="inset-0"
          style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(245,165,36,0.22), transparent 55%)' }}
        />
        <ParallaxLayer dist={-90} rot={24} className="-top-24 -left-16 w-[320px] h-[320px] text-[#F5A524]/[0.18] hidden md:block">
          <Diamond className="w-full h-full" />
        </ParallaxLayer>
        <ParallaxLayer dist={80} rot={-20} className="-bottom-28 -right-10 w-[360px] h-[360px] text-white/[0.09]">
          <Diamond className="w-full h-full" filled={false} />
        </ParallaxLayer>
        <ParallaxLayer dist={-120} rot={80} className="top-[24%] right-[14%] w-4 h-4 text-[#F5A524]/80 hidden md:block">
          <SolidDiamond className="w-full h-full" />
        </ParallaxLayer>
        <ParallaxLayer dist={100} rot={-90} className="bottom-[20%] left-[16%] w-6 h-6 text-white/30 hidden md:block">
          <Ring className="w-full h-full" />
        </ParallaxLayer>
    </ParallaxStage>

          <div className="relative z-10 py-16 lg:py-20 px-8 lg:px-16 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 tracking-tight">আজই আপনার কাজ সহজ করুন</h2>
            <p className="text-lg mb-10 mx-auto text-white/75 max-w-md">
              কোনো রেজিস্ট্রেশন নেই, কোনো পেমেন্ট নেই। এখনই শুরু করুন।
            </p>
            <a
              href="#tools"
              className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg bg-[#F5A524] text-[#0B2D1E] shadow-[0_8px_32px_rgba(245,165,36,0.45)]"
            >
              সব টুলস দেখুন <ArrowRight className="w-5 h-5" />
            </a>
          </div>
      </ParallaxScene>
    </div>
  </section>
);

// ── Page ────────────────────────────────────────────────────────────────────

export const HomePage: React.FC<HomePageProps> = ({ selectedCategory, onSelectCategory, onOpenTerms }) => {
  // Schema.org Structured Data
  const siteAndOrgSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://utools.bd/#organization',
        name: 'Utools.bd',
        url: 'https://utools.bd',
        logo: 'https://utools.bd/og-image.png?v=2',
        description:
          'বাংলা ডিজিটাল ইউটিলিটি হাব — সম্পূর্ণ ব্রাউজার-ভিত্তিক ও নিরাপদ বাংলাদেশি অনলাইন টুলস।'
      },
      {
        '@type': 'WebSite',
        '@id': 'https://utools.bd/#website',
        url: 'https://utools.bd',
        name: 'Utools.bd',
        description: 'প্রয়োজনীয় বাংলা ডিজিটাল ইউটিলিটি হাব',
        inLanguage: 'bn-BD',
        publisher: {
          '@id': 'https://utools.bd/#organization'
        }
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };


  return (
    <div>
      <Helmet>
        <title>{homeContent.metaTitle}</title>
        <meta
          name="description"
          content={homeContent.metaDescription}
        />
        <link rel="canonical" href="https://utools.bd/" />
        <meta property="og:title" content={homeContent.metaTitle} />
        <meta
          property="og:description"
          content={homeContent.metaDescription}
        />
        <meta property="og:url" content="https://utools.bd/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={homeContent.metaTitle} />
        <meta
          name="twitter:description"
          content={homeContent.metaDescription}
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png?v=2" />
        <script type="application/ld+json">{JSON.stringify(siteAndOrgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Hero />
      <Stats />
      <FeaturedTools />
      <AllTools selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />
      <AboutBand />
      <HowItWorks />
      <Privacy onOpenTerms={onOpenTerms} />
      <LatestBlogPosts />
      <FaqSection />
      <FinalCta />
    </div>
  );
};
