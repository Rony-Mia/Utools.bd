export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author?: string;
  category?: string;
  readTime?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  published?: boolean; // default true
  showOnHomepage?: boolean; // default true
  homepageFeatured?: boolean; // default false
  homepageOrder?: number; // default 1
  relatedArticles?: string[]; // array of article slugs
  relatedTool?: string;
  relatedToolLabel?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  updatedDate?: string;

  // Optional modular sections (FAQ, Steps, Guidelines, Features, Selling Point)
  faqHeading?: string;
  faqs?: Array<{ question?: string; answer?: string }>;
  stepsHeading?: string;
  howToSteps?: Array<{ stepNum?: string; title?: string; desc?: string }>;
  guidelinesHeading?: string;
  guidelines?: Array<{ title?: string; desc?: string }>;
  featuresHeading?: string;
  features?: Array<{ title?: string; desc?: string } | string>;
  sellingPointTitle?: string;
  sellingPointDesc?: string;
}

// 6 fixed categories used across Decap CMS and archive routes
export const CATEGORY_SLUGS: Record<string, string> = {
  'সংস্কৃতি ও ইতিহাস': 'culture-history',
  'চাকরির প্রস্তুতি': 'job-preparation',
  'বাংলা টাইপিং': 'bangla-typing',
  'শিক্ষা ও রেজাল্ট': 'education-results',
  'ডিজিটাল গাইড': 'digital-guide',
  'ইউটিলিটি টিপস': 'utility-tips',
};

export const SLUG_TO_CATEGORY: Record<string, string> = Object.entries(CATEGORY_SLUGS).reduce(
  (acc, [category, slug]) => {
    acc[slug] = category;
    return acc;
  },
  {} as Record<string, string>
);

export const ALL_CATEGORIES = Object.keys(CATEGORY_SLUGS);

// Eagerly import all blog posts from /content/blog/*.json at build time
const blogModules = import.meta.glob<{ default: BlogPost } | BlogPost>(
  '../../content/blog/*.json',
  { eager: true }
);

// All published posts, sorted by newest date first
export const ALL_BLOG_POSTS: BlogPost[] = Object.values(blogModules)
  .map((mod: any) => (mod.default ? mod.default : mod) as BlogPost)
  .filter((post) => post.published !== false && Boolean(post.slug) && Boolean(post.title))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Filtered for homepage: published, showOnHomepage !== false, featured first, ordered by homepageOrder
export const HOMEPAGE_BLOG_POSTS: BlogPost[] = [...ALL_BLOG_POSTS]
  .filter((post) => post.showOnHomepage !== false)
  .sort((a, b) => {
    // 1. Featured first
    if (Boolean(a.homepageFeatured) !== Boolean(b.homepageFeatured)) {
      return a.homepageFeatured ? -1 : 1;
    }
    // 2. By homepageOrder ascending
    const orderA = a.homepageOrder ?? 99;
    const orderB = b.homepageOrder ?? 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // 3. Newest date first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  })
  .slice(0, 3);

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return ALL_BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return ALL_BLOG_POSTS.filter((p) => p.category === category);
}

export function getCategorySlug(category: string): string {
  return CATEGORY_SLUGS[category] || encodeURIComponent(category.toLowerCase());
}

export function getCategoryBySlug(slug: string): string | undefined {
  return SLUG_TO_CATEGORY[slug];
}

/**
 * Returns related posts for a given post.
 * If relatedArticles slugs are specified, matches them first.
 * Then fills remaining up to limit with posts from the same category.
 */
export function getRelatedPosts(currentPost: BlogPost, limit = 3): BlogPost[] {
  const result: BlogPost[] = [];
  const seenSlugs = new Set<string>([currentPost.slug]);

  // 1. From explicit relatedArticles slugs
  if (currentPost.relatedArticles && Array.isArray(currentPost.relatedArticles)) {
    for (const slug of currentPost.relatedArticles) {
      const match = ALL_BLOG_POSTS.find((p) => p.slug === slug);
      if (match && !seenSlugs.has(match.slug)) {
        result.push(match);
        seenSlugs.add(match.slug);
        if (result.length >= limit) return result;
      }
    }
  }

  // 2. From same category
  if (currentPost.category) {
    const sameCat = ALL_BLOG_POSTS.filter(
      (p) => p.category === currentPost.category && !seenSlugs.has(p.slug)
    );
    for (const post of sameCat) {
      result.push(post);
      seenSlugs.add(post.slug);
      if (result.length >= limit) return result;
    }
  }

  // 3. General latest if still needed
  if (result.length < limit) {
    for (const post of ALL_BLOG_POSTS) {
      if (!seenSlugs.has(post.slug)) {
        result.push(post);
        seenSlugs.add(post.slug);
        if (result.length >= limit) break;
      }
    }
  }

  return result;
}
