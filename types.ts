export enum ContentType {
  POST = 'পোস্ট / ক্যাপশন',
  COMMENT = 'কমেন্ট / রিপ্লাই',
  BIO = 'প্রোফাইল বায়ো',
  STORY = 'স্টোরি / স্ট্যাটাস',
  NOTE = 'নোট (Note)',
  SCRIPT = 'ভিডিও স্ক্রিপ্ট',
  IMAGE = 'এআই ইমেজ',
  THUMBNAIL = 'থাম্বনেইল মেকার',
  LOGO = 'লোগো মেকার',
  PASSPORT = 'পাসপোর্ট ফটো',
  BG_REMOVE = 'ব্যাকগ্রাউন্ড এডিটর',
  OTHER = 'অন্যান্য'
}

export enum PostCategory {
  FUNNY = 'মজার / মিম',
  SAD = 'স্যাড / আবেগপূর্ণ',
  ROMANTIC = 'রোমান্টিক / ভালোবাসা',
  ATTITUDE = 'অ্যাটিটিউড / ভাব',
  MOTIVATIONAL = 'অনুপ্রেরণামূলক',
  FESTIVAL = 'উৎসব / ঈদ / পূজা',
  POLITICAL = 'রাজনৈতিক / সামাজিক',
  FRIENDSHIP = 'বন্ধুত্ব / আড্ডা'
}

export enum CommentCategory {
  PRAISE = 'প্রশংসা / সুন্দর',
  FUNNY = 'মজার / রোস্ট',
  SARCASTIC = 'সার্কাসম / খোঁচা',
  AGREEMENT = 'সহমত / ঠিক',
  QUESTION = 'প্রশ্ন / জিজ্ঞাসা',
  POLITICAL_SUPPORT = 'রাজনৈতিক সমর্থন (পক্ষে)',
  POLITICAL_OPPOSE = 'রাজনৈতিক সমালোচনা (বিপক্ষে)',
  POLITICAL_NEUTRAL = 'রাজনৈতিক আলোচনা (নিরপেক্ষ)'
}

export enum BioCategory {
  ATTITUDE = 'অ্যাটিটিউড / ভাব',
  ISLAMIC = 'ইসলামিক / ধর্মীয়',
  SAD = 'স্যাড / আবেগপূর্ণ',
  PROFESSIONAL = 'প্রফেশনাল / কাজ',
  POETIC = 'কাব্যিক / শৈল্পিক',
  SIMPLE = 'সিম্পল / সাধারণ',
  ACTIVIST = 'সমাজকর্মী / প্রতিবাদী'
}

export enum StoryCategory {
  DAILY = 'দৈনন্দিন জীবন',
  TRAVEL = 'ভ্রমণ / ঘোরাঘুরি',
  FOOD = 'খাবার দাবার',
  THOUGHT = 'র‍্যান্ডম চিন্তা',
  SAD = 'স্যাড / মুড',
  QUESTION = 'প্রশ্ন / পোল',
  POLITICAL = 'রাজনৈতিক / সামাজিক'
}

export enum NoteCategory {
  RANDOM = 'র‍্যান্ডম চিন্তা',
  LOVE = 'ভালোবাসা',
  SAD = 'মন খারাপ',
  FUNNY = 'মজার জোকস',
  MUSIC = 'গানের লাইন',
  ANNOUNCEMENT = 'ঘোষণা'
}

export enum ScriptCategory {
  REELS = 'রিলস / শর্টস',
  TECH = 'টেক রিভিউ',
  VLOG = 'ভ্লগ ইন্ট্রো',
  COMEDY = 'কমেডি স্কিট',
  EDUCATIONAL = 'শিক্ষামূলক'
}

export enum ImageCategory {
  REALISTIC = 'বাস্তবসম্মত (Realistic)',
  ANIME = 'অ্যানিমে (Anime)',
  DIGITAL_ART = 'ডিজিটাল আর্ট (Digital Art)',
  OIL_PAINTING = 'তেলচিত্র (Oil Painting)',
  CYBERPUNK = 'সাইবারপাঙ্ক (Cyberpunk)',
  SKETCH = 'পেন্সিল স্কেচ (Sketch)',
  KB3D = '3D রেন্ডার (3D Render)'
}

export enum ThumbnailCategory {
  YOUTUBE = 'YouTube থাম্বনেইল',
  FACEBOOK = 'Facebook কভার',
  INSTAGRAM = 'Instagram পোস্ট',
  GAMING = 'গেমিং',
  TUTORIAL = 'টিউটোরিয়াল'
}

export enum LogoCategory {
  MINIMALIST = 'মিনিমালিস্ট (Minimalist)',
  MASCOT = 'মাসকট / ক্যারেক্টার',
  ABSTRACT = 'অ্যাবস্ট্রাক্ট (Abstract)',
  VINTAGE = 'ভিন্টেজ (Vintage)',
  CORPORATE = 'কর্পোরেট (Corporate)',
  TECH = 'টেকনোলজি / আইটি'
}

export enum BgRemoveCategory {
  WHITE = 'সাদা ব্যাকগ্রাউন্ড',
  TRANSPARENT = 'সলিড কালার / রিমুভ',
  BLUR = 'ব্লার ব্যাকগ্রাউন্ড',
  SCENERY = 'প্রকৃতির দৃশ্য',
  OFFICE = 'অফিস ব্যাকগ্রাউন্ড'
}

export enum OtherCategory {
  BIRTHDAY = 'জন্মদিনের শুভেচ্ছা',
  ANNIVERSARY = 'বিবাহ বার্ষিকী',
  EMAIL = 'ইমেইল ড্রাফট',
  LEAVE = 'ছুটির আবেদন',
  PROPOSAL = 'প্রেমের প্রস্তাব',
  TEXT_MSG = 'SMS / টেক্সট'
}

// PASSPORT SPECIFIC ENUMS
export enum PassportCountry {
  BD = 'বাংলাদেশ (45x35mm)',
  US = 'আমেরিকা (2x2 inch)',
  IN = 'ইন্ডিয়া (35x35mm)',
  INT = 'ইন্টারন্যাশনাল (35x45mm)'
}

export enum PassportBg {
  WHITE = 'সাদা (White)',
  BLUE = 'নীল (Blue)',
  RED = 'লাল (Red)',
  GREY = 'ধূসর (Light Gray)',
  OFFICE = 'অফিস ব্লার (Office Blur)'
}

export enum PassportDress {
  ORIGINAL = 'আসল পোশাক রাখুন',
  M_SUIT = 'ফরমাল সুট (পুরুষ)',
  M_SHIRT = 'সাদা শার্ট (পুরুষ)',
  W_SUIT = 'ফরমাল ব্লেজার (মহিলা)',
  W_TRADITIONAL = 'মার্জিত পোশাক (মহিলা)',
  STUDENT = 'স্টুডেন্ট ইউনিফর্ম (সাদা)'
}

export enum ContentLength {
  SHORT = 'ছোট (Short)',
  MEDIUM = 'মাঝারি (Medium)',
  LONG = 'বড় (Long)'
}

export enum ContentTone {
  CASUAL = 'সাধারণ / ক্যাজুয়াল',
  PROFESSIONAL = 'প্রফেশনাল / ফরমাল',
  FUNNY = 'মজার / হিউমার',
  SAD = 'আবেগপূর্ণ / ইমোশনাল',
  SARCASTIC = 'সার্কাসম / ব্যঙ্গাত্মক',
  EXCITED = 'উচ্ছ্বসিত / এক্সাইটেড',
  ANGRY = 'রাগান্বিত / সিরিয়াস'
}

export enum ImageAspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  WIDE = '4:3',
  TALL = '3:4'
}

export interface GeneratedContent {
  text: string;
  category: string;
}

export interface PassportConfig {
  country: string;
  bg: string;
  dress: string;
  aiRetouch: boolean;
}

export interface GenerationRequest {
  type: ContentType;
  category: string;
  context: string;
  tone?: string;
  length?: string;
  party?: string;
  aspectRatio?: string;
  inputImage?: string;
  passportConfig?: PassportConfig;
  overlayText?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: ContentType;
  category: string;
  context: string;
  tone?: string;
  length?: string;
  party?: string;
  aspectRatio?: string;
  results: string[];
  hasInputImage?: boolean;
  passportConfig?: PassportConfig;
  overlayText?: string;
}