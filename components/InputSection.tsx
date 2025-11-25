import React, { useState, useRef, useEffect } from 'react';
import { 
  ContentType, 
  PostCategory, 
  CommentCategory, 
  BioCategory, 
  StoryCategory, 
  NoteCategory, 
  ScriptCategory, 
  EmailCategory,
  AdCopyCategory,
  PoemCategory,
  ImageCategory, 
  ThumbnailCategory, 
  LogoCategory, 
  PassportCountry,
  PassportBg,
  PassportDress,
  BgRemoveCategory, 
  OtherCategory, 
  ContentTone, 
  ContentLength, 
  ImageAspectRatio
} from '../types';
import { 
  Wand2, 
  Loader2, 
  MessageSquare, 
  FileText, 
  User, 
  Zap, 
  StickyNote, 
  Video, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Settings, 
  Flag, 
  ChevronDown, 
  Ratio, 
  Crop, 
  Stamp, 
  UserSquare, 
  Eraser, 
  Upload, 
  X,
  ArrowLeft,
  CheckCircle2,
  Palette,
  Shirt,
  Globe,
  Type,
  PenLine,
  Mail,
  Megaphone,
  Feather
} from 'lucide-react';

interface InputSectionProps {
  initialTab?: ContentType;
  onBack?: () => void;
  onGenerate: (type: ContentType, category: string, context: string, tone?: string, length?: string, party?: string, aspectRatio?: string, inputImage?: string, passportConfig?: any, overlayText?: string, userInstruction?: string) => void;
  isLoading: boolean;
}

const POLITICAL_PARTIES = [
  "বাংলাদেশ আওয়ামী লীগ",
  "বাংলাদেশ জাতীয়তাবাদী দল (BNP)",
  "বাংলাদেশ জামায়াতে ইসলামী",
  "জাতীয় পার্টি",
  "ইসলামী আন্দোলন বাংলাদেশ",
  "বৈষম্যবিরোধী ছাত্র আন্দোলন",
  "গণঅধিকার পরিষদ",
  "বাম গণতান্ত্রিক জোট",
  "বর্তমান সরকার",
  "বিরোধী দল"
];

const InputSection: React.FC<InputSectionProps> = ({ initialTab, onBack, onGenerate, isLoading }) => {
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab || ContentType.COMMENT);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Update active tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [postCategory, setPostCategory] = useState<string>(PostCategory.FUNNY);
  const [commentCategory, setCommentCategory] = useState<string>(CommentCategory.PRAISE);
  const [bioCategory, setBioCategory] = useState<string>(BioCategory.ATTITUDE);
  const [storyCategory, setStoryCategory] = useState<string>(StoryCategory.DAILY);
  const [noteCategory, setNoteCategory] = useState<string>(NoteCategory.RANDOM);
  const [scriptCategory, setScriptCategory] = useState<string>(ScriptCategory.REELS);
  const [emailCategory, setEmailCategory] = useState<string>(EmailCategory.LEAVE);
  const [adCopyCategory, setAdCopyCategory] = useState<string>(AdCopyCategory.FB_AD);
  const [poemCategory, setPoemCategory] = useState<string>(PoemCategory.ROMANTIC);
  const [imageCategory, setImageCategory] = useState<string>(ImageCategory.REALISTIC);
  const [thumbnailCategory, setThumbnailCategory] = useState<string>(ThumbnailCategory.YOUTUBE);
  const [logoCategory, setLogoCategory] = useState<string>(LogoCategory.MINIMALIST);
  const [bgRemoveCategory, setBgRemoveCategory] = useState<string>(BgRemoveCategory.WHITE);
  const [otherCategory, setOtherCategory] = useState<string>(OtherCategory.BIRTHDAY);
  
  // Passport Specific States
  const [ppCountry, setPpCountry] = useState<string>(PassportCountry.BD);
  const [ppBg, setPpBg] = useState<string>(PassportBg.WHITE);
  const [ppDress, setPpDress] = useState<string>(PassportDress.ORIGINAL);
  const [ppRetouch, setPpRetouch] = useState<boolean>(true);

  const [context, setContext] = useState<string>('');
  const [overlayText, setOverlayText] = useState<string>('');
  const [userInstruction, setUserInstruction] = useState<string>(''); // New field for comment instructions
  
  const [tone, setTone] = useState<string>(ContentTone.CASUAL);
  const [length, setLength] = useState<string>(ContentLength.MEDIUM);
  const [aspectRatio, setAspectRatio] = useState<string>(ImageAspectRatio.SQUARE);
  const [party, setParty] = useState<string>('');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getActiveCategoryValue = () => {
    switch (activeTab) {
      case ContentType.POST: return postCategory;
      case ContentType.COMMENT: return commentCategory;
      case ContentType.BIO: return bioCategory;
      case ContentType.STORY: return storyCategory;
      case ContentType.NOTE: return noteCategory;
      case ContentType.SCRIPT: return scriptCategory;
      case ContentType.EMAIL: return emailCategory;
      case ContentType.AD_COPY: return adCopyCategory;
      case ContentType.POEM: return poemCategory;
      case ContentType.IMAGE: return imageCategory;
      case ContentType.THUMBNAIL: return thumbnailCategory;
      case ContentType.LOGO: return logoCategory;
      case ContentType.PASSPORT: return 'Passport'; // Dummy category for passport
      case ContentType.BG_REMOVE: return bgRemoveCategory;
      case ContentType.OTHER: return otherCategory;
      default: return '';
    }
  };

  const isPolitical = (category: string) => {
    return category.includes('রাজনৈতিক');
  };
  
  const isImageTool = (type: ContentType) => {
    return [ContentType.IMAGE, ContentType.THUMBNAIL, ContentType.LOGO, ContentType.PASSPORT, ContentType.BG_REMOVE].includes(type);
  };
  
  // Updated logic to support image upload for Comments (Screenshots)
  const supportsImageUpload = (type: ContentType) => {
    return isImageTool(type) || type === ContentType.COMMENT;
  };

  const requiresImageUpload = (type: ContentType) => {
    return [ContentType.PASSPORT, ContentType.BG_REMOVE].includes(type);
  };

  const supportsOverlayText = (type: ContentType) => {
    return [ContentType.IMAGE, ContentType.THUMBNAIL].includes(type);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Handle Paste Events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!supportsImageUpload(activeTab)) return;
      
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) processFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = getActiveCategoryValue();
    const selectedParty = isPolitical(category) ? party : undefined;
    
    // Auto-set aspect ratio for specific tools
    let finalAspectRatio = aspectRatio;
    if (activeTab === ContentType.THUMBNAIL) finalAspectRatio = ImageAspectRatio.LANDSCAPE;
    if (activeTab === ContentType.LOGO) finalAspectRatio = ImageAspectRatio.SQUARE;
    if (activeTab === ContentType.PASSPORT) finalAspectRatio = ImageAspectRatio.TALL; // 3:4 for passport usually

    const passportConfig = activeTab === ContentType.PASSPORT ? {
      country: ppCountry,
      bg: ppBg,
      dress: ppDress,
      aiRetouch: ppRetouch
    } : undefined;

    onGenerate(activeTab, category, context, tone, length, selectedParty, finalAspectRatio, selectedImage || undefined, passportConfig, overlayText, userInstruction);
  };

  const renderCategoryOptions = () => {
    let categories: any = {};
    let currentValue = '';
    let setter: any = () => {};

    if (activeTab === ContentType.PASSPORT) return null; // Handle separately

    switch (activeTab) {
      case ContentType.POST: categories = PostCategory; currentValue = postCategory; setter = setPostCategory; break;
      case ContentType.COMMENT: categories = CommentCategory; currentValue = commentCategory; setter = setCommentCategory; break;
      case ContentType.BIO: categories = BioCategory; currentValue = bioCategory; setter = setBioCategory; break;
      case ContentType.STORY: categories = StoryCategory; currentValue = storyCategory; setter = setStoryCategory; break;
      case ContentType.NOTE: categories = NoteCategory; currentValue = noteCategory; setter = setNoteCategory; break;
      case ContentType.SCRIPT: categories = ScriptCategory; currentValue = scriptCategory; setter = setScriptCategory; break;
      case ContentType.EMAIL: categories = EmailCategory; currentValue = emailCategory; setter = setEmailCategory; break;
      case ContentType.AD_COPY: categories = AdCopyCategory; currentValue = adCopyCategory; setter = setAdCopyCategory; break;
      case ContentType.POEM: categories = PoemCategory; currentValue = poemCategory; setter = setPoemCategory; break;
      case ContentType.IMAGE: categories = ImageCategory; currentValue = imageCategory; setter = setImageCategory; break;
      case ContentType.THUMBNAIL: categories = ThumbnailCategory; currentValue = thumbnailCategory; setter = setThumbnailCategory; break;
      case ContentType.LOGO: categories = LogoCategory; currentValue = logoCategory; setter = setLogoCategory; break;
      case ContentType.BG_REMOVE: categories = BgRemoveCategory; currentValue = bgRemoveCategory; setter = setBgRemoveCategory; break;
      case ContentType.OTHER: categories = OtherCategory; currentValue = otherCategory; setter = setOtherCategory; break;
    }

    return (
      <select
        value={currentValue}
        onChange={(e) => setter(e.target.value)}
        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 pr-8 transition-all font-bangla hover:bg-white"
      >
        {Object.values(categories).map((cat: any) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    );
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case ContentType.POST: return "উদাহরণ: বৃষ্টির দিন, বন্ধুদের সাথে আড্ডা, বর্তমান পরিস্থিতি...";
      case ContentType.COMMENT: return "পোস্টের বিষয় লিখুন (স্ক্রিনশট আপলোড করলে এটি খালি রাখতে পারেন)...";
      case ContentType.BIO: return "উদাহরণ: নাম আকাশ, ছাত্র, ফটোগ্রাফি, বা সমাজসেবা...";
      case ContentType.STORY: return "উদাহরণ: ট্রাফিক জ্যাম, ব্রেকিং নিউজ, শুভ সকাল...";
      case ContentType.NOTE: return "উদাহরণ: আজ খুব বৃষ্টি, বোরিং ক্লাস, নতুন গান...";
      case ContentType.SCRIPT: return "উদাহরণ: আইফোন রিভিউ, রান্নার টিপস, ভ্লগ ইন্ট্রো...";
      case ContentType.EMAIL: return "উদাহরণ: ৩ দিনের ছুটির আবেদন, চাকরির জন্য কভার লেটার...";
      case ContentType.AD_COPY: return "উদাহরণ: নতুন টি-শার্ট কালেকশন, ডিজিটাল মার্কেটিং কোর্স...";
      case ContentType.POEM: return "উদাহরণ: বর্ষাকাল নিয়ে কবিতা, ভালোবাসার ছন্দ...";
      case ContentType.IMAGE: return "উদাহরণ: একটি বিড়াল সানগ্লাস পড়ে বাইক চালাচ্ছে...";
      case ContentType.THUMBNAIL: return "উদাহরণ: 'How to make money online' বা 'গেমিং লাইভস্ট্রিম'...";
      case ContentType.LOGO: return "উদাহরণ: একটি কফি শপের লোগো, বা টেক স্টার্টআপের লোগো...";
      case ContentType.PASSPORT: return "অতিরিক্ত নির্দেশনা (যেমন: চশমা রাখবেন না, হাসি দিন)...";
      case ContentType.BG_REMOVE: return "ছবি আপলোড করুন। কোন ধরণের ব্যাকগ্রাউন্ড চান তা লিখুন (অপশনাল)...";
      case ContentType.OTHER: return "উদাহরণ: বসের কাছে ছুটির আবেদন, বন্ধুর জন্মদিনের মেসেজ...";
      default: return "";
    }
  };

  const getImageUploadLabel = () => {
    if (requiresImageUpload(activeTab)) return "আপনার ছবি আপলোড করুন";
    if (activeTab === ContentType.COMMENT) return "স্ক্রিনশট আপলোড করুন (অপশনাল)";
    return "রেফারেন্স ছবি আপলোড করুন (অপশনাল)";
  };

  const TabButton = ({ type, icon: Icon, label }: { type: ContentType, icon: any, label: string }) => (
    <button
      type="button"
      onClick={() => {
        setActiveTab(type);
        setOverlayText('');
        setUserInstruction('');
        if (!supportsImageUpload(type)) clearImage();
      }}
      className={`relative group flex flex-row items-center justify-center px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm font-bangla whitespace-nowrap flex-shrink-0 ${
        activeTab === type
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-600'
          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 ring-1 ring-slate-200'
      }`}
    >
      <Icon size={16} className={`mr-2 ${activeTab === type ? 'text-indigo-100' : 'text-slate-400 group-hover:text-indigo-500'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50">
        {onBack ? (
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors font-bangla font-semibold px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            <span>হোম-এ ফিরে যান</span>
          </button>
        ) : <div />}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-bangla">
          টুল সিলেক্টর
        </span>
      </div>

      {/* Modern Scrollable Tabs */}
      <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          <TabButton type={ContentType.COMMENT} icon={MessageSquare} label="কমেন্ট" />
          <TabButton type={ContentType.POST} icon={FileText} label="পোস্ট" />
          <TabButton type={ContentType.STORY} icon={Zap} label="স্টোরি" />
          <TabButton type={ContentType.BIO} icon={User} label="বায়ো" />
          <TabButton type={ContentType.POEM} icon={Feather} label="কবিতা" />
          
          <div className="w-px h-6 bg-slate-300 mx-2 self-center flex-shrink-0"></div>
          
          <TabButton type={ContentType.NOTE} icon={StickyNote} label="নোট" />
          <TabButton type={ContentType.SCRIPT} icon={Video} label="স্ক্রিপ্ট" />
          <TabButton type={ContentType.EMAIL} icon={Mail} label="ইমেইল" />
          <TabButton type={ContentType.AD_COPY} icon={Megaphone} label="অ্যাড" />
          
          <div className="w-px h-6 bg-slate-300 mx-2 self-center flex-shrink-0"></div>
          
          <TabButton type={ContentType.IMAGE} icon={ImageIcon} label="ইমেজ" />
          <TabButton type={ContentType.THUMBNAIL} icon={Crop} label="থাম্বনেইল" />
          <TabButton type={ContentType.LOGO} icon={Stamp} label="লোগো" />
          <TabButton type={ContentType.PASSPORT} icon={UserSquare} label="পাসপোর্ট" />
          <TabButton type={ContentType.BG_REMOVE} icon={Eraser} label="ব্যাকগ্রাউন্ড" />
          
          <TabButton type={ContentType.OTHER} icon={MoreHorizontal} label="অন্যান্য" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        
        {/* Passport Specific UI */}
        {activeTab === ContentType.PASSPORT && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
                <Globe size={12} />
                দেশ ও সাইজ
              </label>
              <select
                value={ppCountry}
                onChange={(e) => setPpCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3"
              >
                {Object.values(PassportCountry).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
                <Palette size={12} />
                ব্যাকগ্রাউন্ড কালার
              </label>
              <select
                value={ppBg}
                onChange={(e) => setPpBg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3"
              >
                {Object.values(PassportBg).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
                <Shirt size={12} />
                পোশাক / ড্রেস
              </label>
              <select
                value={ppDress}
                onChange={(e) => setPpDress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3"
              >
                {Object.values(PassportDress).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
                <Wand2 size={12} />
                AI রিটাচ (Beauty Fix)
              </label>
              <div 
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${ppRetouch ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                onClick={() => setPpRetouch(!ppRetouch)}
              >
                 <span className="text-sm font-bangla text-slate-700">অটোমেটিক স্কিন ফিক্স</span>
                 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${ppRetouch ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${ppRetouch ? 'translate-x-4' : 'translate-x-0'}`}></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Category & Party Grid (Hidden for Passport) */}
        {activeTab !== ContentType.PASSPORT && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">
                {isImageTool(activeTab) ? "স্টাইল / ক্যাটাগরি" : "মুড / ক্যাটাগরি"}
              </label>
              <div className="relative group">
                {renderCategoryOptions()}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Political Party Selection */}
            {isPolitical(getActiveCategoryValue()) && !isImageTool(activeTab) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-bangla ml-1 flex items-center gap-2">
                  <Flag size={12} />
                  রাজনৈতিক দল / সংগঠন
                </label>
                <div className="relative group">
                  <select
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    className="w-full appearance-none bg-indigo-50/50 border border-indigo-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 pr-8 transition-all font-bangla hover:bg-indigo-50"
                  >
                    <option value="">কোনো নির্দিষ্ট দল নেই (সাধারণ)</option>
                    {POLITICAL_PARTIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Upload Area */}
        {supportsImageUpload(activeTab) && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
              <Upload size={12} />
              {getImageUploadLabel()}
            </label>
            
            {!selectedImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-400'
                }`}
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-600 font-bangla">
                  ছবি সিলেক্ট করতে ক্লিক করুন, ড্র্যাগ করুন অথবা পেস্ট (Ctrl+V) করুন
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG সাপোর্টেড</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group flex items-center justify-center bg-checkered h-48">
                <img src={selectedImage} alt="Preview" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                   <CheckCircle2 size={10} />
                   <span>রেডি</span>
                </div>
              </div>
            )}
           </div>
        )}

        {/* Context Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">
            {activeTab === ContentType.BIO ? "আপনার সম্পর্কে / কিওয়ার্ডস" 
             : isImageTool(activeTab) ? "অতিরিক্ত নির্দেশনা (অপশনাল)" 
             : "বিষয় / প্রসঙ্গ (যেমন: পোস্টটি কিসের?)"}
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-4 min-h-[80px] resize-none transition-all placeholder:text-slate-400 font-bangla hover:bg-white"
          />
        </div>

        {/* Extra Comment Instruction Input */}
        {activeTab === ContentType.COMMENT && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
              <PenLine size={12} />
              আপনার মন্তব্য / নির্দিষ্ট পয়েন্ট (অপশনাল)
            </label>
            <input
              type="text"
              value={userInstruction}
              onChange={(e) => setUserInstruction(e.target.value)}
              placeholder="উদাহরণ: খাবারের প্রশংসা করো, অথবা দাম বেশি উল্লেখ করো..."
              className="w-full bg-indigo-50/50 border border-indigo-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 transition-all placeholder:text-slate-400 font-bangla hover:bg-indigo-50"
            />
            <p className="text-[10px] text-slate-400 px-1 font-bangla">
              * এখানে আপনি যা লিখবেন, কমেন্টটি সেই অনুযায়ী তৈরি হবে।
            </p>
          </div>
        )}

        {/* Text Overlay Input (For Image/Thumbnail) */}
        {supportsOverlayText(activeTab) && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
              <Type size={12} />
              ইমেজের উপরের লেখা (Text Overlay)
            </label>
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="যেমন: বৃষ্টির দিন, ব্রেকিং নিউজ, অফার চলছে..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 transition-all placeholder:text-slate-400 font-bangla hover:bg-white"
            />
            <p className="text-[10px] text-slate-400 px-1 font-bangla">
              * AI বাংলা লেখা ইমেজে ভুল করতে পারে, তাই এখানে লিখলে সেটি ইমেজের উপর সুন্দরভাবে বসিয়ে দেওয়া হবে।
            </p>
          </div>
        )}

        {/* Image Aspect Ratio Control (Hidden for Passport as it's auto) */}
        {(activeTab === ContentType.IMAGE || activeTab === ContentType.BG_REMOVE) && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
              <Ratio size={12} />
              ইমেজ সাইজ (Aspect Ratio)
            </label>
            <div className="relative group">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 pr-8 transition-all font-bangla hover:bg-white"
              >
                {Object.values(ImageAspectRatio).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Options Toggle (Hidden for Passport) */}
        {!isImageTool(activeTab) && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-600 font-bangla group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-slate-200 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <Settings size={14} />
                </div>
                <span>অ্যাডভান্সড অপশন (Advanced)</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`transform transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showAdvanced && (
              <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 font-bangla uppercase tracking-wider">
                    টোন / মুড
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 font-bangla"
                  >
                    {Object.values(ContentTone).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 font-bangla uppercase tracking-wider">
                    দৈর্ঘ্য
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 font-bangla"
                  >
                    {Object.values(ContentLength).map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (requiresImageUpload(activeTab) && !selectedImage)}
          className="relative w-full overflow-hidden group flex items-center justify-center space-x-2 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-xl text-base px-6 py-4 text-center transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform active:scale-[0.99] font-bangla"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{isImageTool(activeTab) ? 'প্রসেস হচ্ছে...' : 'কন্টেন্ট জেনারেট করুন'}</span>
            </>
          ) : (
            <>
              {isImageTool(activeTab) ? (
                <ImageIcon size={20} className="group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Wand2 size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              )}
              <span>{isImageTool(activeTab) ? 'জেনারেট / এডিট করুন' : 'কন্টেন্ট জেনারেট করুন'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;