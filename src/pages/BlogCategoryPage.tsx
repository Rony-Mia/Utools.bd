import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  ArrowLeft,
  ArrowRight,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  FolderOpen,
} from 'lucide-react';
import {
  getCategoryBySlug,
  getPostsByCategory,
  CATEGORY_SLUGS,
  ALL_CATEGORIES,
  getCategorySlug,
} from '../utils/blog.ts';
import { toBn } from '../utils/bnDigits.ts';
import { BlogImage } from '../components/blog/BlogImage.tsx';

export const BlogCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const categoryName = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  if (!categoryName || !categorySlug) {
    return <Navigate to="/blog" replace />;
  }

  const posts = getPostsByCategory(categoryName);
  const canonicalUrl = `https://utools.bd/blog/category/${categorySlug}`;
  const metaTitle = `${categoryName} বিষয়ক ব্লগ ও গাইড — Utools.bd`;
  const metaDescription = `${categoryName} সম্পর্কিত সব প্রয়োজনীয় নির্দেশিকা, নিয়মাবলী ও ডিজিটাল ইউটিলিটি ব্যবহারের সহজ কার্যকরী সমাধান এক ঠিকানায় সম্পূর্ণ বিনামূল্যে।`;

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: metaTitle,
    description: metaDescription,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, idx) => ({
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
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://utools.bd/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png?v=2" />
        <link rel="alternate" type="application/rss+xml" title="Utools.bd ব্লগ" href="https://utools.bd/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(categorySchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#FAFAF7] text-[#0F1F17] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
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
              <span className="text-[#0B5D3B] font-semibold">{categoryName}</span>
            </nav>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B5D3B] hover:text-[#084A2E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>সকল ব্লগে ফিরুন</span>
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-4 border-b border-[#D5E4DB] pb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3D0] text-[#B45309] text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" />
              <span>ক্যাটাগরি আর্কাইভ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-4.5xl font-extrabold text-[#0F1F17] tracking-tight leading-tight">
              {categoryName}
            </h1>

            <p className="text-sm sm:text-base text-[#4A5A52] max-w-2xl leading-relaxed">
              {metaDescription} মোট প্রকাশিত আর্টিকেল: <strong className="text-[#084A2E] font-bold">{toBn(posts.length)}</strong> টি।
            </p>

            {/* Other Category Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#4A5A52] font-semibold">অন্যান্য ক্যাটাগরি:</span>
              {ALL_CATEGORIES.filter((c) => c !== categoryName).map((cat) => (
                <Link
                  key={cat}
                  to={`/blog/category/${getCategorySlug(cat)}`}
                  className="px-3 py-1 rounded-lg bg-white border border-[#D5E4DB] text-xs font-medium text-[#4A5A52] hover:border-[#0B5D3B]/40 hover:text-[#0B5D3B] transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Articles Grid or Empty State */}
          {posts.length === 0 ? (
            <div className="bg-white border border-dashed border-[#D5E4DB] rounded-3xl p-10 sm:p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F0F4F2] text-[#4A5A52] flex items-center justify-center mx-auto">
                <FolderOpen className="w-7 h-7 text-[#0B5D3B]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0F1F17]">
                  &ldquo;{categoryName}&rdquo; ক্যাটাগরিতে এখনো কোনো পোস্ট নেই
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5A52] max-w-md mx-auto">
                  এই বিষয়ে খুব শীঘ্রই নতুন তথ্যবহুল গাইডলাইন প্রকাশ করা হবে। অন্যান্য ক্যাটাগরির পোস্ট দেখতে পারেন।
                </p>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B5D3B] hover:bg-[#084A2E] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>সকল আর্টিকেল দেখুন</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white border border-[#D5E4DB] hover:border-[#0B5D3B]/40 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3D0] text-[#B45309] font-medium text-[11px]">
                        <Tag className="w-3 h-3" />
                        <span>{post.category}</span>
                      </span>

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

                    <div className="flex items-center justify-end">
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
          )}
        </div>
      </main>
    </>
  );
};
