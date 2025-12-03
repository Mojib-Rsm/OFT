
export enum ContentType {
  POST = 'পোস্ট / ক্যাপশন',
  COMMENT = 'কমেন্ট / রিপ্লাই',
  BIO = 'প্রোফাইল বায়ো',
  STORY = 'স্টোরি / স্ট্যাটাস',
  NOTE = 'নোট (Note)',
  SCRIPT = 'ভিডিও স্ক্রিপ্ট',
  EMAIL = 'ইমেইল / লেটার',
  AD_COPY = 'বিজ্ঞাপন / মার্কেটিং',
  POEM = 'কবিতা / ছড়া',
  IMAGE = 'এআই ইমেজ',
  THUMBNAIL = 'থাম্বনেইল মেকার',
  LOGO = 'লোগো মেকার',
  PASSPORT = 'পাসপোর্ট ফটো',
  BG_REMOVE = 'ব্যাকগ্রাউন্ড এডিটর',
  PDF_MAKER = 'পিডিএফ মেকার (PDF)',
  IMG_TO_TEXT = 'ইমেজ টু টেক্সট (OCR)',
  DOC_ENHANCER = 'ডকুমেন্ট ফিক্সার (ক্লিয়ার)',
  LEGAL = 'চুক্তিপত্র / স্ট্যাম্প',
  APPLICATION = 'অফিসিয়াল আবেদন',
  CV_BIO = 'সিভি / বায়োডাটা',
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

export enum EmailCategory {
  LEAVE = 'ছুটির আবেদন (Leave)',
  JOB = 'চাকরির আবেদন (Job)',
  RESIGNATION = 'Resignation Letter',
  INVITATION = 'দাওয়াত / আমন্ত্রণ',
  COMPLAINT = 'অভিযোগ (Complaint)',
  SPONSORSHIP = 'স্পন্সরশিপ রিকোয়েস্ট',
  FORMAL = 'অফিশিয়াল ইমেইল'
}

export enum AdCopyCategory {
  FB_AD = 'ফেসবুক অ্যাড ক্যাপশন',
  PRODUCT_DESC = 'প্রোডাক্ট ডেসক্রিপশন',
  OFFER = 'অফার / সেল পোস্ট',
  REAL_ESTATE = 'জমি / ফ্ল্যাট বিক্রয়',
  COURSE = 'কোর্স / কোচিং প্রোমো'
}

export enum PoemCategory {
  ROMANTIC = 'ভালোবাসার কবিতা',
  SAD = 'বিরহের কবিতা',
  NATURE = 'প্রকৃতি নিয়ে',
  FUNNY = 'মজার ছড়া',
  MOTIVATIONAL = 'অনুপ্রেরণামূলক',
  LYRICS = 'গানের কথা (Lyrics)'
}

export enum PdfCategory {
  RESUME = 'সিভি / বায়োডাটা (Resume)',
  APPLICATION = 'দরখাস্ত / আবেদনপত্র',
  REPORT = 'রিপোর্ট / প্রতিবেদন',
  ASSIGNMENT = 'অ্যাসাইনমেন্ট',
  COVER_LETTER = 'কভার লেটার',
  INVOICE = 'ইনভয়েস / মেমো'
}

export enum ImgToTextCategory {
  DOCUMENT = 'ডকুমেন্ট / পিডিএফ পেজ',
  HANDWRITTEN = 'হাতের লেখা (Handwritten)',
  BANNER = 'ব্যানার / পোস্টার',
  TABLE = 'টেবিল / চার্ট ডাটা',
  MATH = 'গাণিতিক সমস্যা / অংক'
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

// Computer Shop Categories
export enum DocEnhancerCategory {
  SCAN_EFFECT = 'স্ক্যান ইফেক্ট (সাদা-কালো)',
  BRIGHTEN = 'ব্রাইট & শার্প (রঙিন)',
  MAGIC_ERASER = 'দাগ/কালি রিমুভ',
  OLD_RESTORE = 'পুরনো দলিল ঠিক করা'
}

export enum LegalCategory {
  HOUSE_RENT = 'বাড়ি ভাড়া চুক্তিপত্র',
  AFFIDAVIT = 'হলফনামা (Affidavit)',
  LAND_SALE = 'জমি বিক্রয় চুক্তি',
  PARTNERSHIP = 'ব্যবসায়িক পার্টনারশিপ',
  LOAN_DEED = 'টাকা ধার বা লোন চুক্তি',
  GENERAL = 'সাধারণ স্ট্যাম্প'
}

export enum ApplicationCategory {
  NID_FIX = 'NID / ভোটার আইডি সংশোধন',
  BANK = 'ব্যাংক (চেক বই/লোন)',
  GOVT_OFFICE = 'সরকারি অফিস / ডিসি অফিস',
  UNION = 'ইউনিয়ন পরিষদ / কাউন্সিলর',
  POLICE = 'থানা / জিডি (GD)',
  ACADEMIC = 'স্কুল / কলেজ ছুটি'
}

export enum CvCategory {
  CORPORATE = 'কর্পোরেট সিভি (English)',
  GOVT_JOB = 'সরকারি চাকরির সিভি (Bangla)',
  MARRIAGE_MALE = 'বিয়ের বায়োডাটা (পাত্র)',
  MARRIAGE_FEMALE = 'বিয়ের বায়োডাটা (পাত্রী)',
  FRESHER = 'ফ্রেশার / ছাত্র'
}

export enum OtherCategory {
  BIRTHDAY = 'জন্মদিনের শুভেচ্ছা',
  ANNIVERSARY = 'বিবাহ বার্ষিকী',
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
  STUDENT = 'স্টুডেন্ট ইউনিফর্ম (সাদা)',
  COUPLE = 'কাপল / দম্পতি (উভয়)'
}

export enum CoupleDress {
  ORIGINAL = 'আসল পোশাক (Original)',
  FORMAL = 'ফরমাল (সুট/শাড়ি/ব্লেজার)',
  TRADITIONAL = 'ট্রেডিশনাল (পাঞ্জাবি/শাড়ি)',
  MATCHING_WHITE = 'ম্যাচিং সাদা পোশাক',
  CASUAL_SMART = 'স্মার্ট ক্যাজুয়াল'
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

export enum ContentLanguage {
  BANGLA = 'বাংলা (Bangla)',
  ENGLISH = 'ইংরেজি (English)',
  BANGLISH = 'বাংলিশ (Banglish)'
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
  coupleDress?: string;
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
  inputImages?: string[]; 
  passportConfig?: PassportConfig;
  overlayText?: string;
  userInstruction?: string;
  language?: string;
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
  inputImages?: string[];
  passportConfig?: PassportConfig;
  overlayText?: string;
  userInstruction?: string;
  language?: string;
}
