import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Tag,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Clock,
  List,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getBlogPostBySlug,
  ALL_BLOG_POSTS,
  getRelatedPosts,
  getCategorySlug,
  type BlogPost,
} from '../utils/blog.ts';
import { toBn } from '../utils/bnDigits.ts';
import { BlogImage } from '../components/blog/BlogImage.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';

interface TocItem {
  id: string;
  text: string;
}

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  // Scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract H2 headings for Table of Contents
  const tocItems: TocItem[] = useMemo(() => {
    if (!post?.content) return [];
    const lines = post.content.split('\n');
    const items: TocItem[] = [];
    let h2Count = 0;

    for (const line of lines) {
      const match = line.match(/^##\s+(.+)$/);
      if (match) {
        h2Count += 1;
        const rawText = match[1].trim();
        // Remove markdown formatting like bold/links
        const cleanText = rawText.replace(/[*_~`\[\]]|(\(.*\))/g, '');
        const id = `heading-${h2Count}`;
        items.push({ id, text: cleanText });
      }
    }
    return items;
  }, [post?.content]);

// Redirect map for historical/renamed post slugs
const SLUG_REDIRECTS: Record<string, string> = {
  'bijoy-to-unicode-conversion-tips': 'bijoy-to-unicode-converter',
};

  if (!post) {
    if (slug && SLUG_REDIRECTS[slug]) {
      return <Navigate to={`/blog/${SLUG_REDIRECTS[slug]}`} replace />;
    }
    return <Navigate to="/blog" replace />;
  }

  // Related posts
  const relatedPosts = getRelatedPosts(post, 3);

  // Prev / Next Navigation in the chronological list
  const currentIndex = ALL_BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? ALL_BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < ALL_BLOG_POSTS.length - 1 ? ALL_BLOG_POSTS[currentIndex + 1] : null;

  // Social share links
  const postUrl = `https://utools.bd/blog/${post.slug}`;
  const shareTitle = `${post.title} — Utools.bd`;

  const handleCopyLink = () => {
    copy(postUrl);
  };

  const handleWhatsAppShare = () => {
    const text = `📌 ${post.title}\n\n${post.excerpt}\n\nপড়ুন: ${postUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
  };

  // SEO metadata overrides
  const metaTitle = post.seoTitle || (post.title.length > 50 ? post.title : `${post.title} | Utools`);
  const metaDesc = post.metaDescription || post.excerpt;
  const canonical = post.canonicalUrl || postUrl;
  const ogImageUrl = post.image
    ? post.image.startsWith('http')
      ? post.image
      : `https://utools.bd${post.image.startsWith('/') ? post.image : '/' + post.image}`
    : 'https://utools.bd/og-image.png?v=2';

  // Schema.org BlogPosting
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    headline: post.title,
    description: post.excerpt,
    image: ogImageUrl,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'ইউটিলিটি টিম',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Utools.bd',
      url: 'https://utools.bd',
      logo: {
        '@type': 'ImageObject',
        url: 'https://utools.bd/logo.svg',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: 'https://utools.bd/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'ব্লগ ও গাইড',
        item: 'https://utools.bd/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonical,
      },
    ],
  };

  // Optional FAQ schema if post has dynamic FAQs
  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs
            .filter((f) => f && f.question && f.answer)
            .map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
        }
      : null;

  // Track heading IDs inside markdown
  let renderedH2Count = 0;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={ogImageUrl} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      {/* Reading Progress Bar (Fixed Top) */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[#0B5D3B] transition-all duration-150 ease-out shadow-xs"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="min-h-screen bg-[#FAFAF7] text-[#0F1F17] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Breadcrumb & Back */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="text-xs text-[#4A5A52] flex items-center space-x-2" aria-label="ব্রেডক্রাম্ব">
              <Link to="/" className="hover:text-[#0B5D3B] transition-colors">
                হোম
              </Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-[#0B5D3B] transition-colors">
                ব্লগ
              </Link>
              <span>/</span>
              {post.category && (
                <>
                  <Link
                    to={`/blog/category/${getCategorySlug(post.category)}`}
                    className="hover:text-[#0B5D3B] transition-colors"
                  >
                    {post.category}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-[#0B5D3B] font-semibold truncate max-w-[200px] sm:max-w-none">
                {post.title}
              </span>
            </nav>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B5D3B] hover:text-[#084A2E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>সকল ব্লগে ফিরুন</span>
            </Link>
          </div>

          {/* Article Header Card */}
          <article className="bg-white border border-[#D5E4DB] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <header className="space-y-5 border-b border-[#D5E4DB] pb-6">
              {/* Badges / Metadata Row */}
              <div className="flex flex-wrap items-center gap-2">
                {post.category && (
                  <Link
                    to={`/blog/category/${getCategorySlug(post.category)}`}
                    className="px-3 py-1 bg-[#FEF3D0] text-[#B45309] text-xs font-semibold rounded-full flex items-center gap-1 hover:bg-[#FDE68A] transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{post.category}</span>
                  </Link>
                )}

                <span className="px-3 py-1 bg-[#E6F4EC] text-[#0B5D3B] text-xs font-semibold rounded-full flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{toBn(post.date)}</span>
                </span>

                {post.readTime && (
                  <span className="px-3 py-1 bg-[#F0F4F2] text-[#4A5A52] text-xs font-medium rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>পড়ার সময়: {post.readTime}</span>
                  </span>
                )}

                {post.updatedDate && (
                  <span className="px-3 py-1 bg-[#DCFCE7] text-[#166534] text-xs font-semibold rounded-full flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>হালনাগাদ: {toBn(post.updatedDate)}</span>
                  </span>
                )}

                {post.author && (
                  <span className="text-xs text-[#4A5A52] flex items-center gap-1 ml-auto">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold text-[#0F1F17] tracking-tight leading-snug">
                {post.title}
              </h1>

              {/* Excerpt Lead */}
              <p className="text-base sm:text-lg text-[#4A5A52] leading-relaxed italic bg-[#F8FAF9] p-4 sm:p-5 rounded-2xl border border-[#D5E4DB]/60">
                &ldquo;{post.excerpt}&rdquo;
              </p>

              {/* Tags Chips */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-[#4A5A52] font-semibold">ট্যাগ:</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-[#F0F4F2] text-[#084A2E] text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Featured Image (16:9) */}
            {post.image && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[#D5E4DB]/80 shadow-xs bg-[#F0F4F2]">
                <BlogImage
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  priority={true}
                  aspectRatio="16/9"
                />
              </div>
            )}

            {/* Related Tool Banner */}
            {post.relatedTool && post.relatedToolLabel && (
              <div className="p-4 bg-[#E6F4EC]/70 border border-[#0B5D3B]/20 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#0B5D3B] shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-[#0B5D3B] block">সরাসরি টুল ব্যবহার করুন</span>
                    <span className="text-sm font-bold text-[#0F1F17]">{post.relatedToolLabel}</span>
                  </div>
                </div>

                <Link
                  to={post.relatedTool}
                  className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>টুল ওপেন করুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Main Article Content & Table of Contents */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              {/* Table of Contents - Mobile Accordion */}
              {tocItems.length > 0 && (
                <div className="lg:hidden">
                  <div className="border border-[#D5E4DB] rounded-2xl p-4 bg-[#F8FAF9]">
                    <button
                      type="button"
                      onClick={() => setMobileTocOpen(!mobileTocOpen)}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#0F1F17] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <List className="w-4 h-4 text-[#0B5D3B]" />
                        <span>সূচিপত্র ({toBn(tocItems.length)} টি অনুচ্ছেদ)</span>
                      </span>
                      {mobileTocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {mobileTocOpen && (
                      <nav className="mt-3 pt-3 border-t border-[#D5E4DB] space-y-2 text-xs">
                        {tocItems.map((item, idx) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={() => setMobileTocOpen(false)}
                            className="block text-[#4A5A52] hover:text-[#0B5D3B] hover:underline transition-colors pl-2 border-l-2 border-[#D5E4DB] hover:border-[#0B5D3B]"
                          >
                            <span className="font-mono text-[#0B5D3B] mr-1.5">{toBn(idx + 1)}.</span>
                            <span>{item.text}</span>
                          </a>
                        ))}
                      </nav>
                    )}
                  </div>
                </div>
              )}

              {/* Markdown Body */}
              <div className={`min-w-0 ${tocItems.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} prose max-w-none`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, children, ...props }) => (
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1F17] mt-8 mb-4 tracking-tight" {...props}>
                        {children}
                      </h2>
                    ),
                    h2: ({ node, children, ...props }) => {
                      renderedH2Count += 1;
                      const id = `heading-${renderedH2Count}`;
                      return (
                        <h2
                          id={id}
                          className="text-xl sm:text-2xl font-bold text-[#0F1F17] mt-10 mb-4 pt-4 border-b border-[#D5E4DB]/50 pb-2 scroll-mt-20"
                          {...props}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ node, children, ...props }) => (
                      <h3 className="text-lg sm:text-xl font-bold text-[#0F1F17] mt-6 mb-2.5" {...props}>
                        {children}
                      </h3>
                    ),
                    h4: ({ node, children, ...props }) => (
                      <h4 className="text-base sm:text-lg font-bold text-[#0F1F17] mt-4 mb-2" {...props}>
                        {children}
                      </h4>
                    ),
                    p: ({ node, children, ...props }) => (
                      <p className="text-sm sm:text-base text-[#4A5A52] leading-relaxed my-3.5" {...props}>
                        {children}
                      </p>
                    ),
                    strong: ({ node, children, ...props }) => (
                      <strong className="font-bold text-[#0F1F17]" {...props}>
                        {children}
                      </strong>
                    ),
                    em: ({ node, children, ...props }) => (
                      <em className="italic" {...props}>
                        {children}
                      </em>
                    ),
                    ul: ({ node, children, ...props }) => (
                      <ul className="list-disc list-outside ml-5 space-y-1.5 my-3.5 text-sm sm:text-base text-[#4A5A52] leading-relaxed" {...props}>
                        {children}
                      </ul>
                    ),
                    ol: ({ node, children, ...props }) => (
                      <ol className="list-decimal list-outside ml-5 space-y-1.5 my-3.5 text-sm sm:text-base text-[#4A5A52] leading-relaxed" {...props}>
                        {children}
                      </ol>
                    ),
                    li: ({ node, children, ...props }) => (
                      <li className="pl-1" {...props}>
                        {children}
                      </li>
                    ),
                    img: ({ node, src, alt, ...props }) => (
                      <img
                        src={src}
                        alt={alt || 'ব্লগ ছবি'}
                        loading="lazy"
                        decoding="async"
                        className="rounded-2xl max-w-full h-auto my-6 border border-[#D5E4DB] mx-auto shadow-xs"
                        {...props}
                      />
                    ),
                    a: ({ node, href, children, ...props }) => {
                      const isInternal =
                        href &&
                        (href.startsWith('/') ||
                          href.startsWith('https://utools.bd') ||
                          href.startsWith('http://utools.bd'));
                      const cleanHref = href
                        ? href.replace(/^https?:\/\/utools\.bd/, '') || '/'
                        : '#';

                      if (isInternal) {
                        return (
                          <Link
                            to={cleanHref}
                            className="font-semibold text-[#0B5D3B] hover:text-[#084A2E] underline decoration-[#0B5D3B]/40 hover:decoration-[#084A2E] transition-colors"
                            {...props}
                          >
                            {children}
                          </Link>
                        );
                      }

                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-semibold text-[#0B5D3B] hover:text-[#084A2E] underline decoration-[#0B5D3B]/40 hover:decoration-[#084A2E] transition-colors inline-flex items-center gap-1"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    blockquote: ({ node, children, ...props }) => (
                      <blockquote className="border-l-4 border-[#0B5D3B] bg-[#F8FAF9] pl-4 py-3 my-5 rounded-r-xl italic text-[#4A5A52]" {...props}>
                        {children}
                      </blockquote>
                    ),
                    pre: ({ node, children, ...props }) => (
                      <pre className="bg-[#0F1F17] text-[#FAFAF7] p-4 rounded-xl overflow-x-auto my-4 text-xs sm:text-sm font-mono" {...props}>
                        {children}
                      </pre>
                    ),
                    code: ({ node, className, children, ...props }) => (
                      <code className={className ? className : 'px-1.5 py-0.5 bg-[#F0F4F2] text-[#0B5D3B] rounded text-xs font-mono'} {...props}>
                        {children}
                      </code>
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="my-8 border-[#D5E4DB]" {...props} />
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Table of Contents - Desktop Sticky Sidebar */}
              {tocItems.length > 0 && (
                <aside className="hidden lg:block lg:col-span-4">
                  <div className="sticky top-24 border border-[#D5E4DB] rounded-2xl p-5 bg-[#F8FAF9]/80 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#D5E4DB] text-xs font-bold text-[#0F1F17]">
                      <List className="w-4 h-4 text-[#0B5D3B]" />
                      <span>সূচিপত্র (TOC)</span>
                    </div>

                    <nav className="space-y-2 text-xs max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                      {tocItems.map((item, idx) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="block text-[#4A5A52] hover:text-[#0B5D3B] hover:underline transition-colors pl-2.5 border-l-2 border-[#D5E4DB] hover:border-[#0B5D3B] py-0.5 leading-snug"
                        >
                          <span className="font-mono text-[#0B5D3B] mr-1.5">{toBn(idx + 1)}.</span>
                          <span>{item.text}</span>
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              )}
            </div>

            {/* Optional Dynamic CMS Content (Highlight, Features, Steps, Guidelines, FAQs) */}
            <CmsDynamicContent
              content={post as any}
              excludeSections={['markdown', 'lastUpdated', 'contact']}
              className="space-y-8 pt-8 border-t border-[#D5E4DB]"
            />

            {/* Social Share Bar */}
            <div className="pt-6 border-t border-[#D5E4DB] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F1F17]">
                <Share2 className="w-4 h-4 text-[#0B5D3B]" />
                <span>শেয়ার করুন:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleFacebookShare}
                  className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#0c63d4] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white border border-[#D5E4DB] hover:border-[#0B5D3B]/40 text-[#0F1F17] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />
                      <span className="text-[#0B5D3B]">লিংক কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#4A5A52]" />
                      <span>লিংক কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prev / Next Post Navigation */}
            <nav
              className="pt-6 border-t border-[#D5E4DB] grid grid-cols-1 sm:grid-cols-2 gap-4"
              aria-label="আগের ও পরের আর্টিকেল"
            >
              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.slug}`}
                  className="p-4 rounded-2xl border border-[#D5E4DB] hover:border-[#0B5D3B]/40 bg-[#F8FAF9] hover:bg-white transition-all space-y-1 group"
                >
                  <span className="text-[11px] font-semibold text-[#0B5D3B] flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    <span>আগের আর্টিকেল</span>
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F1F17] line-clamp-1 group-hover:text-[#0B5D3B] transition-colors">
                    {prevPost.title}
                  </h4>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  to={`/blog/${nextPost.slug}`}
                  className="p-4 rounded-2xl border border-[#D5E4DB] hover:border-[#0B5D3B]/40 bg-[#F8FAF9] hover:bg-white transition-all space-y-1 sm:text-right group"
                >
                  <span className="text-[11px] font-semibold text-[#0B5D3B] flex items-center gap-1 sm:justify-end">
                    <span>পরের আর্টিকেল</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F1F17] line-clamp-1 group-hover:text-[#0B5D3B] transition-colors">
                    {nextPost.title}
                  </h4>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </article>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="space-y-4 pt-4" aria-labelledby="related-heading">
              <div className="flex items-center gap-2 border-b border-[#D5E4DB] pb-3">
                <BookOpen className="w-5 h-5 text-[#0B5D3B]" />
                <h3 id="related-heading" className="text-lg sm:text-xl font-bold text-[#0F1F17]">
                  সম্পর্কিত আর্টিকেল
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((rel) => (
                  <article
                    key={rel.slug}
                    className="bg-white border border-[#D5E4DB] hover:border-[#0B5D3B]/40 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <Link to={`/blog/${rel.slug}`} className="block rounded-xl overflow-hidden aspect-[16/9] bg-[#F0F4F2]">
                        <BlogImage
                          src={rel.image}
                          alt={rel.imageAlt || rel.title}
                          aspectRatio="16/9"
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="flex items-center justify-between text-[11px] text-[#4A5A52]">
                        {rel.category && (
                          <span className="text-[#B45309] font-medium">{rel.category}</span>
                        )}
                        <span className="font-mono">{toBn(rel.date)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0F1F17] group-hover:text-[#0B5D3B] transition-colors line-clamp-2 leading-snug">
                        <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h4>

                      <p className="text-xs text-[#4A5A52] line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D5E4DB]/60 flex justify-end">
                      <Link
                        to={`/blog/${rel.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5D3B] group-hover:text-[#084A2E]"
                      >
                        <span>পড়ুন</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};
