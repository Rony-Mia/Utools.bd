import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  ArrowRight,
  Sparkles,
  Tag,
  ExternalLink,
  Search,
  X,
  Clock,
  BookOpen,
  Filter,
  FileQuestion,
  RotateCcw,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { ALL_BLOG_POSTS, ALL_CATEGORIES, getCategorySlug, type BlogPost } from '../utils/blog.ts';
import { toBn } from '../utils/bnDigits.ts';
import { BlogImage } from '../components/blog/BlogImage.tsx';

export const BlogListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Configure client-side fuzzy search with Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(ALL_BLOG_POSTS, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'excerpt', weight: 0.25 },
        { name: 'tags', weight: 0.15 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, []);

  // Filter posts by search query AND category tab
  const filteredPosts = useMemo(() => {
    let posts = ALL_BLOG_POSTS;

    // 1. Search filter
    const query = searchQuery.trim();
    if (query) {
      posts = fuse.search(query).map((res) => res.item);
    }

    // 2. Category filter
    if (selectedCategory !== 'all') {
      posts = posts.filter((post) => post.category === selectedCategory);
    }

    return posts;
  }, [searchQuery, selectedCategory, fuse]);

  // Compute category post counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_BLOG_POSTS.length };
    ALL_CATEGORIES.forEach((cat) => {
      counts[cat] = ALL_BLOG_POSTS.filter((p) => p.category === cat).length;
    });
    return counts;
  }, []);

  // When no search or category filter is active, highlight the featured post as a Hero Card
  const isDefaultView = !searchQuery.trim() && selectedCategory === 'all';
  const heroPost = isDefaultView
    ? filteredPosts.find((p) => p.homepageFeatured) || filteredPosts[0]
    : null;
  const gridPosts = isDefaultView && heroPost
    ? filteredPosts.filter((p) => p.slug !== heroPost.slug)
    : filteredPosts;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Structured Data (JSON-LD)
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ব্লগ ও গাইড — Utools.bd',
    description: 'চাকরির প্রস্তুতি, সরকারি নিয়মাবলী, বাংলা ফন্ট রূপান্তর ও ডিজিটাল জীবন সহজ করার বাস্তবসম্মত গাইডলাইন।',
    url: 'https://utools.bd/blog',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ALL_BLOG_POSTS.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://utools.bd/blog/${post.slug}`,
        name: post.title,
      })),
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
    ],
  };

  return (
    <>
      <Helmet>
        <title>ব্লগ ও গাইড — Utools.bd | ডিজিটাল ইউটিলিটি গাইডলাইন</title>
        <meta
          name="description"
          content="চাকরির আবেদন, ছবি রিসাইজ, বাংলা টাইপিং, সরকারি সার্কুলার, জমির পরিমাপ ও ডিজিটাল ইউটিলিটি সংক্রান্ত প্রয়োজনীয় তথ্যবহুল ব্লগ ও পূর্ণাঙ্গ গাইডলাইন।"
        />
        <meta property="og:title" content="ব্লগ ও গাইড — Utools.bd | ডিজিটাল ইউটিলিটি গাইডলাইন" />
        <meta
          property="og:description"
          content="চাকরির আবেদন, ছবি রিসাইজ, বাংলা টাইপিং, সরকারি সার্কুলার, জমির পরিমাপ ও ডিজিটাল ইউটিলিটি সংক্রান্ত প্রয়োজনীয় তথ্যবহুল ব্লগ ও পূর্ণাঙ্গ গাইডলাইন।"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://utools.bd/blog" />
        <meta property="og:image" content="https://utools.bd/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ব্লগ ও গাইড — Utools.bd | ডিজিটাল ইউটিলিটি গাইডলাইন" />
        <meta
          name="twitter:description"
          content="চাকরির আবেদন, ছবি রিসাইজ, বাংলা টাইপিং, সরকারি সার্কুলার, জমির পরিমাপ ও ডিজিটাল ইউটিলিটি সংক্রান্ত প্রয়োজনীয় তথ্যবহুল ব্লগ ও পূর্ণাঙ্গ গাইডলাইন।"
        />
        <meta name="twitter:image" content="https://utools.bd/og-image.png?v=2" />
        <link rel="canonical" href="https://utools.bd/blog" />
        <link rel="alternate" type="application/rss+xml" title="Utools.bd ব্লগ" href="https://utools.bd/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#FAFAF7] text-[#0F1F17] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="text-xs text-[#4A5A52] flex items-center space-x-2" aria-label="ব্রেডক্রাম্ব">
            <Link to="/" className="hover:text-[#0B5D3B] transition-colors">
              হোম
            </Link>
            <span>/</span>
            <span className="text-[#0B5D3B] font-semibold">ব্লগ ও গাইড</span>
          </nav>

          {/* Header & Search Bar Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D5E4DB] pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
                <span>ইউটিলিটি ও টেক গাইডলাইন</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-4.5xl font-extrabold text-[#0F1F17] tracking-tight leading-tight">
                ব্লগ ও প্রয়োজনীয় নির্দেশিকা
              </h1>
              <p className="text-sm sm:text-base text-[#4A5A52] leading-relaxed">
                সরকারি চাকরির আবেদন, ছবি ও স্বাক্ষর রিসাইজ, বাংলা ফন্ট রূপান্তর ও দৈনন্দিন ডিজিটাল কাজের সহজ সমাধান।
              </p>
            </div>

            {/* In-page Fuzzy Search Input */}
            <div className="w-full md:w-80 lg:w-96 relative">
              <label htmlFor="blog-search" className="sr-only">
                ব্লগ পোস্ট খুঁজুন
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#4A5A52] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="blog-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ব্লগ খুঁজুন (যেমন: টেলিটক, ইউনিকোড)..."
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:ring-1 focus:ring-[#0B5D3B] text-xs sm:text-sm text-[#0F1F17] rounded-xl shadow-xs transition-all placeholder:text-[#4A5A52]/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="সার্চ মুছুন"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#4A5A52] hover:text-[#0F1F17] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5A52]">
              <Filter className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>ক্যাটাগরি অনুযায়ী ফিল্টার:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-[#0B5D3B] text-white shadow-xs'
                    : 'bg-white border border-[#D5E4DB] text-[#4A5A52] hover:border-[#0B5D3B]/40 hover:text-[#0F1F17]'
                }`}
              >
                <span>সব আর্টিকেল</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[#F0F4F2] text-[#4A5A52]'
                  }`}
                >
                  {toBn(categoryCounts.all || 0)}
                </span>
              </button>

              {ALL_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0B5D3B] text-white shadow-xs'
                        : 'bg-white border border-[#D5E4DB] text-[#4A5A52] hover:border-[#0B5D3B]/40 hover:text-[#0F1F17]'
                    }`}
                  >
                    <span>{cat}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#F0F4F2] text-[#4A5A52]'
                        }`}
                      >
                        {toBn(count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active search or category filter notice */}
          {(!isDefaultView || searchQuery) && (
            <div className="flex items-center justify-between bg-[#E6F4EC]/60 border border-[#0B5D3B]/20 px-4 py-2.5 rounded-xl text-xs text-[#084A2E]">
              <div className="flex items-center gap-2">
                <span>
                  ফলাফল:{' '}
                  <strong className="font-bold text-[#0B5D3B]">
                    {toBn(filteredPosts.length)}
                  </strong>{' '}
                  টি আর্টিকেল পাওয়া গেছে
                </span>
                {searchQuery && (
                  <span className="text-[#4A5A52]">
                    (কীওয়ার্ড: &ldquo;{searchQuery}&rdquo;)
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="text-[#4A5A52]">
                    (ক্যাটাগরি: &ldquo;{selectedCategory}&rdquo;)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B5D3B] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ফিল্টার মুছুন</span>
              </button>
            </div>
          )}

          {/* Empty State when 0 results */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-dashed border-[#D5E4DB] rounded-3xl p-10 sm:p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F0F4F2] text-[#4A5A52] flex items-center justify-center mx-auto">
                <FileQuestion className="w-7 h-7 text-[#0B5D3B]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0F1F17]">কোনো আর্টিকেল পাওয়া যায়নি</h3>
                <p className="text-xs sm:text-sm text-[#4A5A52] max-w-md mx-auto">
                  আপনার দেওয়া সার্চ কি-ওয়ার্ড বা নির্বাচিত ক্যাটাগরিতে কোনো পোস্ট মেলেনি। বানান চেক করুন অথবা ফিল্টার রিসেট করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব আর্টিকেল দেখুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured Post Hero Card (Only on default view) */}
              {heroPost && (
                <section aria-label="ফিচার্ড আর্টিকেল">
                  <article className="bg-white border-2 border-[#0B5D3B]/20 hover:border-[#0B5D3B]/40 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                      {/* Image side */}
                      <div className="lg:col-span-6 overflow-hidden rounded-2xl aspect-[16/9] bg-[#F0F4F2]">
                        <Link to={`/blog/${heroPost.slug}`} className="block w-full h-full">
                          <BlogImage
                            src={heroPost.image}
                            alt={heroPost.imageAlt || heroPost.title}
                            priority={true}
                            aspectRatio="16/9"
                            className="group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                      </div>

                      {/* Content side */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0B5D3B] text-white text-xs font-bold shadow-xs">
                            <Sparkles className="w-3 h-3 text-[#F5A524]" />
                            <span>ফিচার্ড পোস্ট</span>
                          </span>

                          {heroPost.category && (
                            <Link
                              to={`/blog/category/${getCategorySlug(heroPost.category)}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3D0] text-[#B45309] text-xs font-semibold hover:bg-[#FDE68A] transition-colors"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{heroPost.category}</span>
                            </Link>
                          )}

                          <div className="flex items-center gap-2 text-xs font-mono text-[#4A5A52]">
                            {heroPost.readTime && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{heroPost.readTime}</span>
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{toBn(heroPost.date)}</span>
                            </span>
                          </div>
                        </div>

                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F1F17] leading-snug group-hover:text-[#0B5D3B] transition-colors">
                          <Link to={`/blog/${heroPost.slug}`}>{heroPost.title}</Link>
                        </h2>

                        <p className="text-sm sm:text-base text-[#4A5A52] leading-relaxed line-clamp-3">
                          {heroPost.excerpt}
                        </p>

                        {/* Tags */}
                        {heroPost.tags && heroPost.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {heroPost.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-[#F0F4F2] text-[#4A5A52] text-[11px] font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#D5E4DB]/60">
                          {heroPost.relatedTool && heroPost.relatedToolLabel ? (
                            <Link
                              to={heroPost.relatedTool}
                              className="text-xs font-medium text-[#0B5D3B] hover:underline bg-[#E6F4EC] px-3 py-1 rounded-lg inline-flex items-center gap-1"
                            >
                              <span>টুল: {heroPost.relatedToolLabel}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span />
                          )}

                          <Link
                            to={`/blog/${heroPost.slug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-bold rounded-xl transition-all shadow-xs group-hover:shadow"
                          >
                            <span>সম্পূর্ণ পড়ুন</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </section>
              )}

              {/* Main Grid for Remaining Posts */}
              <div className="space-y-6">
                {isDefaultView && heroPost && gridPosts.length > 0 && (
                  <h3 className="text-lg font-bold text-[#0F1F17] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0B5D3B]" />
                    <span>অন্যান্য আর্টিকেলসমূহ</span>
                  </h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post) => (
                    <article
                      key={post.slug}
                      className="bg-white border border-[#D5E4DB] hover:border-[#0B5D3B]/40 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Thumbnail */}
                        <Link
                          to={`/blog/${post.slug}`}
                          className="block rounded-xl overflow-hidden aspect-[16/9] bg-[#F0F4F2]"
                        >
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

                        <h2 className="text-lg font-bold text-[#0F1F17] leading-snug group-hover:text-[#0B5D3B] transition-colors">
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>

                        <p className="text-xs sm:text-sm text-[#4A5A52] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-[#F0F4F2] text-[#4A5A52] text-[10px] font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-[10px] text-[#4A5A52] font-mono">
                                +{toBn(post.tags.length - 3)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#D5E4DB]/60 space-y-3">
                        {post.relatedTool && post.relatedToolLabel && (
                          <div className="text-[11px] text-[#4A5A52] bg-[#F0F4F2] px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                            <span>সম্পর্কিত টুল:</span>
                            <Link
                              to={post.relatedTool}
                              className="font-semibold text-[#0B5D3B] hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>{post.relatedToolLabel}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span />
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5D3B] hover:text-[#084A2E] group/link transition-colors"
                          >
                            <span>সম্পূর্ণ পড়ুন</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};
