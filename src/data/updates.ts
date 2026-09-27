export interface SiteUpdate {
  id: string;
  date: string;
  version: string;
  badge: string;
  badgeType: 'new' | 'update' | 'enhancement';
  title: string;
  description: string;
  toolLink?: string;
  toolName?: string;
}

export const SITE_UPDATES: SiteUpdate[] = [
  {
    id: 'update-land-converter',
    date: '২১ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'জমির মাপ কনভার্টার (Land Area Converter) উন্মোচন',
    description: 'শতক, বিঘা, কাঠা, কানি, একর, হেক্টর ও বর্গফুটের তাৎক্ষণিক রূপান্তর। কানি ও বিঘার আঞ্চলিক সংজ্ঞার বিকল্প এবং দলিল ও খতিয়ানের জন্য মিশ্র রূপ।',
    toolLink: '/land-converter',
    toolName: 'জমির মাপ কনভার্টার দেখুন'
  },
  {
    id: 'update-image-merger',
    date: '২০ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'ইমেজ মার্জার ও কোলাজ মেকার সংযোজন',
    description: 'একাধিক ছবি সহজে জোড়া লাগিয়ে A4 পেজে সাজান, গ্রিড কোলাজ বা ভার্টিক্যাল/হরাইজন্টাল স্ট্রিপ তৈরি করুন। ১০০% ক্লায়েন্ট-সাইড ও নিরাপদ।',
    toolLink: '/image-merger',
    toolName: 'ইমেজ মার্জার দেখুন'
  },
  {
    id: 'update-qr-generator',
    date: '২০ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'কাস্টম QR কোড জেনারেটর সংযোজন',
    description: 'ওয়েবসাইট লিংক, প্লেইন টেক্সট, ফোন নম্বর, ইমেইল বা ওয়াইফাই কানেকশনের জন্য কাস্টম রঙের ও মাঝখানে লোগোসহ হাই-কোয়ালিটি QR কোড তৈরি করুন। কোনো লিমিট নেই।',
    toolLink: '/qr-generator',
    toolName: 'QR জেনারেটর দেখুন'
  },
  {
    id: 'update-heic-converter',
    date: '২০ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'HEIC/HEIF ছবি কনভার্টার প্রকাশ',
    description: 'আইফোনের HEIC ও HEIF ছবি সরাসরি ব্রাউজারে বিনামূল্যে JPG, PNG বা WebP-তে কনভার্ট করুন। ব্যাচ কনভার্ট ও ZIP ডাউনলোড সুবিধাসহ।',
    toolLink: '/heic-converter',
    toolName: 'HEIC কনভার্টার দেখুন'
  },
  {
    id: 'update-bulk-resizer',
    date: '২০ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'বাল্ক ফটো রিসাইজার উন্মোচন',
    description: 'একসাথে আনলিমিটেড ছবি রিসাইজ ও কম্প্রেস করুন সম্পূর্ণ বিনামূল্যে। সরকারি চাকরির ৩০০×৩০০ ও ৩০০×৮০ প্রিসেট এবং এক ক্লিকে ZIP ডাউনলোড।',
    toolLink: '/bulk-photo-resizer',
    toolName: 'বাল্ক রিসাইজার দেখুন'
  },
  {
    id: 'update-gpa-calc',
    date: '১৯ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'জিপিএ ও সিজিপিএ ক্যালকুলেটর সংযোজন',
    description: 'বাংলাদেশি শিক্ষা বোর্ডের এসএসসি/এইচএসসি (৫.০০ স্কেল, ৪র্থ বিষয় বোনাস সহ) এবং বিশ্ববিদ্যালয়ের ক্রেডিট-ওয়েটেড সেমিস্টার ও সামগ্রিক সিজিপিএ (৪.০০ স্কেল) নির্ভুল গণনার সুবিধা।',
    toolLink: '/gpa-calculator',
    toolName: 'জিপিএ ক্যালকুলেটর চালু করুন'
  },
  {
    id: 'update-cv-builder',
    date: '১৭ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'প্রফেশনাল সিভি ও জীবনবৃত্তান্ত মেকার প্রকাশ',
    description: 'সরকারি ও কর্পোরেট চাকরির উপযোগী ৫টি নান্দনিক টেমপ্লেট, বাংলা ও ইংরেজি উভয় ভাষা সাপোর্ট এবং এক ক্লিকে ব্রাউজার থেকেই প্রিন্ট-রেডি A4 PDF ডাউনলোড।',
    toolLink: '/cv-builder',
    toolName: 'সিভি মেকার দেখুন'
  },
  {
    id: 'update-amount-in-words',
    date: '১৬ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'টাকা → কথায় কনভার্টার (Amount in Words) উন্মোচন',
    description: 'ব্যাংক চেক, জমির বায়না দলিল, ভাউচার ও রসিদে লেখার জন্য সংখ্যা বা পয়সা ইনপুট দিলেই শতভাগ প্রমিত ব্যাকরণিক বাংলা কথায় রূপান্তর।',
    toolLink: '/amount-in-words',
    toolName: 'টাকা কথায় কনভার্টার'
  },
  {
    id: 'update-age-calculator',
    date: '১৬ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'নতুন টুল',
    badgeType: 'new',
    title: 'সরকারি চাকরির বয়স ক্যালকুলেটর ও কোটা পরীক্ষক',
    description: 'সার্কুলারের নির্দিষ্ট তারিখে আবেদনকারীর প্রকৃত বছর-মাস-দিন হিসাব, মোট দিন ও সপ্তাহ গণনা এবং সাধারণ প্রার্থী (৩০ বছর) ও কোটাভুক্ত প্রার্থীদের (৩২ বছর) বয়সসীমা যাচাই।',
    toolLink: '/age-calculator',
    toolName: 'বয়স ক্যালকুলেটর'
  },
  {
    id: 'update-photo-resizer',
    date: '১৬ সেপ্টেম্বর ২০২৬',
    version: 'v1.0',
    badge: 'ফিচার আপডেট',
    badgeType: 'update',
    title: 'সরকারি চাকরি ও পাসপোর্ট ছবি রিসাইজার ইঞ্জিন',
    description: 'Teletalk, BPSC ও পাসপোর্ট আবেদনের ৩০০×৩০০ পিক্সেল (১০০KB) ছবি এবং ৩০০×৮০ পিক্সেল (৬০KB) স্বাক্ষর স্বয়ংক্রিয় অনুপাত ঠিক রেখে ব্রাউজারেই রিসাইজ ও অপ্টিমাইজেশন।',
    toolLink: '/photo-resizer',
    toolName: 'ছবি রিসাইজার'
  },
  {
    id: 'update-bijoy-converter',
    date: '১৭ সেপ্টেম্বর ২০২৬',
    version: 'v2.4',
    badge: 'উন্নতি',
    badgeType: 'enhancement',
    title: 'বিজয় ↔ ইউনিকোড ইঞ্জিন ২.৪ অপ্টিমাইজেশন',
    description: 'যুক্তবর্ণ ম্যাপিং ও রিভার্স ইউনিকোড-টু-বিজয় অ্যালগরিদম পরিমার্জন, টেক্সট ফাইল (.txt) আমদানি-রপ্তানি ও লাইভ ডুয়াল প্রিভিউ পারফরম্যান্স বৃদ্ধি।',
    toolLink: '/converter',
    toolName: 'বিজয় কনভার্টার'
  }
];
