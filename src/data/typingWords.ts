/**
 * Meaningful and inspiring typing paragraphs for Bangla and English.
 * Categorized by difficulty (easy vs hard/যুক্তাক্ষর), structured as authentic,
 * coherent paragraphs and sentences for realistic typing practice and exam preparation.
 */

export interface ParagraphItem {
  id: string;
  topic: string;
  difficulty: 'easy' | 'hard';
  text: string;
}

export const banglaParagraphs: Record<'easy' | 'hard', string[]> = {
  easy: [
    'বাংলাদেশ প্রাকৃতিক সৌন্দর্যের এক অপূর্ব লীলাভূমি। এদেশের সবুজ শ্যামল মাঠ, এঁকেবেঁকে চলা নদী এবং স্নিগ্ধ বাতাস যে কারো মন জুড়িয়ে দেয়। গ্রামের সহজ সরল মানুষের জীবনযাত্রা আমাদের সংস্কৃতির অন্যতম প্রধান বৈশিষ্ট্য। তারা প্রতিদিন সকালে মাঠে যায় এবং কঠোর পরিশ্রম করে সোনালী ফসল ফলায়। নদীমাতৃক এই দেশে পানির কলকল ধ্বনি আর পাখির মিষ্টি গান মিলেমিশে এক শান্ত পরিবেশ তৈরি করে। প্রকৃতির এই রূপ আমাদের মনে গভীর প্রশান্তি এনে দেয়।',
    'নিয়মিত বই পড়ার অভ্যাস মানুষের চিন্তাশক্তিকে উন্নত ও প্রসারিত করে। একটি ভালো বই জ্ঞানের আলো ছড়িয়ে দেয় এবং জীবনের সঠিক পথ দেখায়। প্রতিদিন কিছু সময় নিরিবিলি বসে পড়ার অভ্যাস করলে নতুন নতুন তথ্য জানা যায়। জ্ঞান মানুষকে সচেতন ও আত্মবিশ্বাসী করে তোলে। যারা বইকে বন্ধু হিসেবে গ্রহণ করে, তারা জীবনের কঠিন সময়েও সঠিক সিদ্ধান্ত নিতে পারে। তাই আমাদের উচিত প্রতিদিন অন্তত কিছুটা সময় পড়ার টেবিলে কাটানো।',
    'সততা এবং নিষ্ঠাবান পরিশ্রম মানুষকে জীবনে প্রকৃত সফলতা এনে দেয়। নিজের কাজের প্রতি আন্তরিক থাকলে যেকোনো কঠিন কাজ সহজে সমাধান করা সম্ভব হয়। জীবনে প্রতিকূল পরিস্থিতি আসবেই, কিন্তু ধৈর্য ধরে এগিয়ে যাওয়াই আসল পরীক্ষা। সময়কে সঠিকভাবে মূল্যায়ন করা প্রতিটি মানুষের জন্য জরুরি। অলসতা ত্যাগ করে নিয়ম মেনে কাজ করলে স্বপ্ন বাস্তবে রূপ নেয় এবং সমাজে সম্মানের আসন পাওয়া যায়।',
    'স্বাস্থ্যই সকল সুখের মূল। শরীর ভালো না থাকলে কোনো কাজেই মন বসে না। পরিমিত পুষ্টিকর খাবার গ্রহণ, বিশুদ্ধ পানি পান এবং সময়মতো ঘুমানো সুস্বাস্থ্যের জন্য খুবই দরকার। প্রতিদিন সকালে কিছুটা সময় হালকা ব্যায়াম করলে শরীর সারাদিন সতেজ ও কর্মক্ষম থাকে। পরিষ্কার পরিচ্ছন্ন থাকা এবং ইতিবাচক চিন্তা করা মনকে সবসময় প্রফুল্ল রাখে। সুস্থ জীবনযাপন আমাদের কর্মক্ষমতা বহু গুণ বাড়িয়ে দেয়।',
    'ডিজিটাল প্রযুক্তির ছোঁয়ায় আমাদের দৈনন্দিন জীবন এখন অনেক সহজ হয়ে উঠেছে। ইন্টারনেটের মাধ্যমে ঘরে বসেই দেশ বিদেশের খবর জানা যাচ্ছে এবং নতুন দক্ষতা শেখা সম্ভব হচ্ছে। যোগাযোগের দূরত্ব কমে এসেছে এবং প্রয়োজনীয় কাজ দ্রুত সম্পন্ন করা যাচ্ছে। তবে প্রযুক্তির ভালো দিকগুলো গ্রহণ করে সময় অপচয় রোধ করাও সমান জরুরি। সঠিক ব্যবহারের মাধ্যমেই প্রযুক্তির প্রকৃত সুফল ভোগ করা যায়।',
    'গাছপালা আমাদের পরিবেশের সবচেয়ে বিশ্বস্ত বন্ধু। গাছ আমাদের অক্সিজেন দেয় এবং বাতাস থেকে ক্ষতিকর উপাদান দূর করে পরিবেশকে শীতল রাখে। বিভিন্ন মৌসুমে ফুল ও মিষ্টি ফলে আমাদের চারপাশ ভরে ওঠে। ছায়াঘেরা শান্ত পরিবেশ পশুপাখির নিরাপদ আশ্রয় তৈরি করে। তাই আমাদের প্রত্যেকের উচিত বাড়ির আশেপাশে এবং খালি জায়গায় ফলজ ও বনজ গাছ লাগানো এবং সেগুলোর সঠিক যত্ন নেওয়া।',
    'একটি সুন্দর সমাজের ভিত্তি হলো পারস্পরিক সহানুভূতি এবং ভালোবাসা। অন্যের বিপদে পাশে দাঁড়ানো এবং ছোট বড় সবাইকে সম্মান জানানো প্রতিটি মানুষের নৈতিক দায়িত্ব। হাসিমুখে কথা বলা এবং বিপন্ন মানুষের দিকে সহযোগিতার হাত বাড়িয়ে দিলে সমাজে শান্তি বজায় থাকে। মিলেমিশে থাকার এই মনোভাবই একটি জাতিকে সমৃদ্ধির দিকে এগিয়ে নিয়ে যায়।'
  ],
  hard: [
    'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান রাষ্ট্রের সর্বোচ্চ আইন। এই সংবিধান নাগরিকদের মৌলিক অধিকার, মানবিক মর্যাদা এবং আইনের শাসনের নিশ্চয়তা প্রদান করে। গণতান্ত্রিক শাসনব্যবস্থায় বিচার বিভাগের স্বাধীনতা এবং প্রশাসনিক স্বচ্ছতা জাতীয় উন্নয়নের মূল চালিকাশক্তি। জবাবদিহিমূলক শাসনকাঠামো নিশ্চিত করা গেলে সমাজ থেকে অন্যায় ও বৈষম্য দূর করা সম্ভব হয় এবং অর্থনৈতিক প্রবৃদ্ধির সুফল প্রতিটি নাগরিকের কাছে পৌঁছায়।',
    'তথ্যপ্রযুক্তি এবং কৃত্রিম বুদ্ধিমত্তার দ্রুত বিকাশ একবিংশ শতাব্দীতে আন্তর্জাতিক অর্থনীতিতে বৈপ্লবিক পরিবর্তন এনেছে। অবকাঠামোগত ডিজিটালাইজেশন, সাইবার নিরাপত্তা এবং আধুনিক সফটওয়্যার ব্যবহারের সক্ষমতা দেশের সামগ্রিক উৎপাদনশীলতা বহুলাংশে বৃদ্ধি করে। তরুণ প্রজন্মের মধ্যে বিজ্ঞানমনস্ক দৃষ্টিভঙ্গি এবং প্রযুক্তিগত উদ্ভাবনী শক্তির বিকাশ ঘটাতে পারলে বৈশ্বিক প্রতিযোগিতায় আত্মমর্যাদার সাথে টিকে থাকা সম্ভব হবে।',
    'জলবায়ু পরিবর্তন ও বৈশ্বিক উষ্ণায়ন বর্তমান বিশ্বের অন্যতম প্রধান পরিবেশগত সংকট। অনিয়ন্ত্রিত শিল্পায়ন এবং নির্বিচারে বনভূমি ধ্বংসের ফলে জীববৈচিত্র্য আজ মারাত্মক হুমকির সম্মুখীন। পরিবেশবান্ধব নবায়নযোগ্য জ্বালানি ব্যবহার, টেকসই বর্জ্য ব্যবস্থাপনা এবং কার্যকর বৃক্ষরোপণ কর্মসূচি বাস্তবায়ন করা এখন সময়ের অপরিহার্য দাবি। পরিবেশের ভারসাম্য রক্ষা করতে হলে জাতীয় ও আন্তর্জাতিক পর্যায়ে সম্মিলিত উদ্যোগ গ্রহণ করতে হবে।',
    'আমাদের গৌরবোজ্জ্বল ভাষা আন্দোলন এবং একাত্তরের মহান মুক্তিযুদ্ধ আত্মত্যাগ ও দেশপ্রেমের চিরন্তন অনুপ্রেরণা। মাতৃভাষার মর্যাদা রক্ষা এবং সার্বভৌমত্ব অর্জনে বীর শহীদদের আত্মদান বিশ্ব ইতিহাসে বিরল দৃষ্টান্ত। তাঁদের এই মহান ত্যাগ আমাদের মনে করিয়ে দেয় যে অন্যায়ের বিরুদ্ধে সোচ্চার হওয়া এবং সত্যের পথে অবিচল থাকা প্রত্যেক সচেতন নাগরিকের পবিত্র দায়িত্ব। এই চেতনা হৃদয়ে ধারণ করেই একটি সমৃদ্ধ দেশ গঠন করা সম্ভব।',
    'অর্থনৈতিক স্বনির্ভরতা অর্জন করতে হলে শক্তিশালী ব্যাংকিং ব্যবস্থা, পুঁজিবাজারের স্থায়িত্ব এবং উদ্যোক্তা সংস্কৃতির বিকাশ অপরিহার্য। রপ্তানিমুখী শিল্পের সম্প্রসারণ এবং বৈদেশিক মুদ্রার সুষ্ঠু ব্যবস্থাপনা মুদ্রাস্ফীতি নিয়ন্ত্রণে কার্যকর ভূমিকা পালন করে। উৎপাদনশীল খাতে বিনিয়োগ বৃদ্ধি পেলে কর্মসংস্থানের সুযোগ সৃষ্টি হয়, যা দারিদ্র্য বিমোচনে গুরুত্বপূর্ণ অবদান রাখে। বাস্তবমুখী আর্থিক পরিকল্পনা দেশকে উন্নতির নতুন শিখরে নিয়ে যায়।',
    'উচ্চশিক্ষা এবং গবেষণা প্রতিষ্ঠানগুলো নতুন জ্ঞান সৃষ্টির প্রধান কেন্দ্র। মুক্তবুদ্ধির চর্চা, বস্তুনিষ্ঠ বিশ্লেষণ এবং বৈজ্ঞানিক দৃষ্টিভঙ্গি শিক্ষার্থীদের মননশীল করে গড়ে তোলে। বিশ্ববিদ্যালয়ের শিক্ষকদের অনুপ্রেরণা এবং শিক্ষার্থীদের কঠোর অধ্যবসায় জাতীয় সমস্যা সমাধানের ক্ষেত্রে কার্যকর পথপ্রদর্শক হতে পারে। সৃজনশীল শিক্ষা ব্যবস্থা একটি জাতিকে মেধা ও প্রজ্ঞায় বিশ্বমঞ্চে অনন্য মর্যাদায় প্রতিষ্ঠিত করে।'
  ]
};

export const englishParagraphs: Record<'easy' | 'hard', string[]> = {
  easy: [
    'Nature brings peaceful moments and pure joy to our daily routine. Walking through green parks in the morning, listening to the gentle songs of birds, and feeling the cool breeze refresh the human spirit. Small moments of quiet reflection help us recharge our energy and focus on what truly matters in life. Treating the natural world with respect ensures that future generations will also experience its wondrous charm.',
    'Reading good books is one of the most rewarding habits a person can develop. Through reading, we travel to different places, discover inspiring stories, and learn from the experiences of others. A book sharpens critical thinking and encourages creative ideas that help us solve everyday problems. When we dedicate thirty minutes each day to reading, our understanding of the world expands in meaningful ways.',
    'Consistent daily effort is the true secret behind achieving long-term personal goals. Talent alone cannot guarantee success without dedication, honest work, and patience. When challenges arise, taking small and steady steps forward keeps motivation alive. Building reliable routines and managing time wisely make difficult tasks feel manageable and bring a deep sense of accomplishment.',
    'True friendship and genuine kindness are the pillars of a supportive community. Helping a neighbor in need, sharing kind words, and listening attentively to others create an atmosphere of trust. When people work together toward common goals, society becomes a safer, happier, and more inspiring place for everyone to grow and flourish.',
    'Maintaining a balanced lifestyle requires attention to both physical health and mental peace. Drinking enough fresh water, eating wholesome foods, and getting restful sleep prepare our body for active work. Regular movement and physical activity relieve tension and improve overall productivity. When our body and mind are well cared for, we feel confident and energized throughout the day.',
    'Modern digital technology has made communication faster and more accessible than ever before. People can easily learn new skills, connect with colleagues around the globe, and share ideas instantly. Learning to use these powerful tools responsibly allows individuals to expand their horizons and make positive contributions to their chosen professions.'
  ],
  hard: [
    'Technological transformation and automated intelligence are fundamentally reshaping modern industries and employment landscapes. Organizations that prioritize digital infrastructure, robust cybersecurity protocols, and sophisticated analytical methodologies gain substantial competitive advantages. Cultivating adaptability and continuous technical proficiency remains essential for navigating complex international markets.',
    'Sustainable socioeconomic development necessitates a delicate equilibrium between industrial expansion and ecological preservation. Accelerating carbon emissions and indiscriminate deforestation pose existential threats to terrestrial biodiversity. Implementing comprehensive environmental regulations and investing in renewable energy technologies are vital imperatives for mitigating adverse climatic consequences worldwide.',
    'Effective leadership within complex organizations demands unwavering ethical integrity, exceptional emotional intelligence, and strategic foresight. Leaders who articulate a compelling vision while fostering collaborative transparency inspire extraordinary dedication among their teams. Navigating unprecedented organizational crises requires resilience, analytical deliberation, and disciplined execution.',
    'Scientific inquiry and rigorous empirical research serve as the bedrock of human civilizational advancement. Breakthroughs in biotechnology, molecular medicine, and pharmaceutical engineering have significantly mitigated severe diseases and enhanced life expectancy globally. Maintaining stringent reproducibility standards and ethical oversight ensures that transformative discoveries benefit humanity equitably.',
    'Macroeconomic stability relies upon disciplined monetary governance, transparent financial institutions, and prudent fiscal management. Diversifying export capabilities, stabilizing foreign exchange reserves, and encouraging sustainable foreign direct investments counteract inflationary pressures and stimulate domestic entrepreneurial vitality.'
  ]
};

/**
 * Standard word count target per time duration.
 */
export const MODE_WORD_COUNTS: Record<number | 'custom', number> = {
  15: 35,
  30: 60,
  60: 120,
  120: 250,
  custom: 500,
};

export function getWordCountForDuration(duration: number | 'custom'): number {
  return MODE_WORD_COUNTS[duration] ?? 120;
}

/**
 * Generates a rich, meaningful, coherent paragraph (or multi-paragraph text)
 * whose word count matches or slightly exceeds targetWordCount.
 * Guarantees real, flowing sentences with genuine grammatical structure and meaning.
 */
export function generateTypingText(
  language: 'bangla' | 'english',
  difficulty: 'easy' | 'hard' = 'easy',
  targetWordCount: number = 120
): string {
  const pool = (language === 'bangla' ? banglaParagraphs : englishParagraphs)[difficulty];
  const fallbackPool = (language === 'bangla' ? banglaParagraphs : englishParagraphs)[
    difficulty === 'easy' ? 'hard' : 'easy'
  ];

  // Shuffle paragraph pools
  const allParagraphs = [...pool, ...fallbackPool].sort(() => Math.random() - 0.5);

  let accumulatedWords: string[] = [];

  for (const para of allParagraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    accumulatedWords.push(...words);
    if (accumulatedWords.length >= targetWordCount) {
      break;
    }
  }

  // If still below target, repeat shuffled paragraphs
  while (accumulatedWords.length < targetWordCount) {
    for (const para of allParagraphs) {
      const words = para.trim().split(/\s+/).filter(Boolean);
      accumulatedWords.push(...words);
      if (accumulatedWords.length >= targetWordCount) break;
    }
  }

  // We want to slice at sentence end boundary near targetWordCount if possible
  if (accumulatedWords.length > targetWordCount) {
    const sliced = accumulatedWords.slice(0, targetWordCount);
    // If the last word doesn't end with a sentence terminator, check next 1-5 words to close the sentence gracefully
    const sentenceEndRegex = language === 'bangla' ? /[।!?]$/ : /[.!?]$/;
    let bestEnd = targetWordCount;
    for (let i = targetWordCount - 1; i < Math.min(accumulatedWords.length, targetWordCount + 8); i++) {
      if (sentenceEndRegex.test(accumulatedWords[i])) {
        bestEnd = i + 1;
        break;
      }
    }
    return accumulatedWords.slice(0, bestEnd).join(' ');
  }

  return accumulatedWords.join(' ');
}
