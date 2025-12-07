
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
  PdfCategory, 
  ImgToTextCategory, 
  ImageCategory, 
  ThumbnailCategory, 
  LogoCategory, 
  PassportCountry, 
  PassportBg, 
  PassportDress, 
  CoupleDress,
  BgRemoveCategory, 
  OtherCategory, 
  ContentTone, 
  ContentLength, 
  ContentLanguage, 
  ImageAspectRatio, 
  DocEnhancerCategory, 
  LegalCategory, 
  ApplicationCategory, 
  CvCategory, 
  VisitingCardCategory, 
  BannerCategory, 
  InvitationCategory, 
  FbVideoCategory
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
  Feather, 
  FileDown, 
  Users, 
  Plus, 
  ScanText, 
  Languages, 
  ScrollText, 
  FileBadge, 
  UserCheck, 
  CreditCard, 
  Flag as FlagIcon, 
  Gift, 
  Facebook
} from 'lucide-react';

interface InputSectionProps {
  initialTab?: ContentType;
  onBack?: () => void;
  onGenerate: (type: ContentType, category: string, context: string, tone?: string, length?: string, party?: string, aspectRatio?: string, inputImages?: string[], passportConfig?: any, overlayText?: string, userInstruction?: string, language?: string) => void;
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

function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        return JSON.parse(storedValue);
      }
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  }, [key, state]);

  return [state, setState] as const;
}

const InputSection: React.FC<InputSectionProps> = ({ initialTab, onBack, onGenerate, isLoading }) => {
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab || ContentType.COMMENT);
  const [showAdvanced, setShowAdvanced] = usePersistedState<boolean>('oft_show_advanced', false);
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Categories
  const [postCategory, setPostCategory] = usePersistedState<string>('oft_cat_post', PostCategory.FUNNY);
  const [commentCategory, setCommentCategory] = usePersistedState<string>('oft_cat_comment', CommentCategory.PRAISE);
  const [bioCategory, setBioCategory] = usePersistedState<string>('oft_cat_bio', BioCategory.ATTITUDE);
  const [storyCategory, setStoryCategory] = usePersistedState<string>('oft_cat_story', StoryCategory.DAILY);
  const [noteCategory, setNoteCategory] = usePersistedState<string>('oft_cat_note', NoteCategory.RANDOM);
  const [scriptCategory, setScriptCategory] = usePersistedState<string>('oft_cat_script', ScriptCategory.REELS);
  const [emailCategory, setEmailCategory] = usePersistedState<string>('oft_cat_email', EmailCategory.LEAVE);
  const [adCopyCategory, setAdCopyCategory] = usePersistedState<string>('oft_cat_ad', AdCopyCategory.FB_AD);
  const [poemCategory, setPoemCategory] = usePersistedState<string>('oft_cat_poem', PoemCategory.ROMANTIC);
  const [pdfCategory, setPdfCategory] = usePersistedState<string>('oft_cat_pdf', PdfCategory.APPLICATION);
  const [imgToTextCategory, setImgToTextCategory] = usePersistedState<string>('oft_cat_ocr', ImgToTextCategory.DOCUMENT);
  const [imageCategory, setImageCategory] = usePersistedState<string>('oft_cat_image', ImageCategory.REALISTIC);
  const [thumbnailCategory, setThumbnailCategory] = usePersistedState<string>('oft_cat_thumbnail', ThumbnailCategory.YOUTUBE);
  const [logoCategory, setLogoCategory] = usePersistedState<string>('oft_cat_logo', LogoCategory.MINIMALIST);
  const [bgRemoveCategory, setBgRemoveCategory] = usePersistedState<string>('oft_cat_bg', BgRemoveCategory.WHITE);
  const [otherCategory, setOtherCategory] = usePersistedState<string>('oft_cat_other', OtherCategory.BIRTHDAY);
  
  // New Categories for Computer Shop
  const [docEnhancerCategory, setDocEnhancerCategory] = usePersistedState<string>('oft_cat_doc_enhance', DocEnhancerCategory.SCAN_EFFECT);
  const [legalCategory, setLegalCategory] = usePersistedState<string>('oft_cat_legal', LegalCategory.HOUSE_RENT);
  const [applicationCategory, setApplicationCategory] = usePersistedState<string>('oft_cat_app', ApplicationCategory.NID_FIX);
  const [cvCategory, setCvCategory] = usePersistedState<string>('oft_cat_cv', CvCategory.CORPORATE);

  // Design Tools
  const [visitingCardCategory, setVisitingCardCategory] = usePersistedState<string>('oft_cat_vcard', VisitingCardCategory.BUSINESS);
  const [bannerCategory, setBannerCategory] = usePersistedState<string>('oft_cat_banner', BannerCategory.SHOP);
  const [invitationCategory, setInvitationCategory] = usePersistedState<string>('oft_cat_invite', InvitationCategory.WEDDING);

  // FB Video
  const [fbVideoCategory, setFbVideoCategory] = usePersistedState<string>('oft_cat_fb_video', FbVideoCategory.CAPTION);

  // Passport
  const [ppCountry, setPpCountry] = usePersistedState<string>('oft_pp_country', PassportCountry.BD);
  const [ppBg, setPpBg] = usePersistedState<string>('oft_pp_bg', PassportBg.WHITE);
  const [ppDress, setPpDress] = usePersistedState<string>('oft_pp_dress', PassportDress.ORIGINAL);
  const [ppCoupleDress, setPpCoupleDress] = usePersistedState<string>('oft_pp_couple_dress', CoupleDress.ORIGINAL);
  const [ppRetouch, setPpRetouch] = usePersistedState<boolean>('oft_pp_retouch', true);

  // Common Inputs
  const [context, setContext] = usePersistedState<string>('oft_context', '');
  const [overlayText, setOverlayText] = usePersistedState<string>('oft_overlay_text', '');
  const [userInstruction, setUserInstruction] = usePersistedState<string>('oft_user_instruction', '');
  
  // Dynamic Form Data (Not persisted to keep forms clean on switch)
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [tone, setTone] = usePersistedState<string>('oft_tone', ContentTone.CASUAL);
  const [length, setLength] = usePersistedState<string>('oft_length', ContentLength.MEDIUM);
  const [language, setLanguage] = usePersistedState<string>('oft_language', ContentLanguage.BANGLA);
  const [aspectRatio, setAspectRatio] = usePersistedState<string>('oft_aspect_ratio', ImageAspectRatio.SQUARE);
  const [party, setParty] = usePersistedState<string>('oft_party', '');
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
      case ContentType.PDF_MAKER: return pdfCategory;
      case ContentType.IMG_TO_TEXT: return imgToTextCategory;
      case ContentType.IMAGE: return imageCategory;
      case ContentType.THUMBNAIL: return thumbnailCategory;
      case ContentType.LOGO: return logoCategory;
      case ContentType.PASSPORT: return 'Passport';
      case ContentType.BG_REMOVE: return bgRemoveCategory;
      case ContentType.DOC_ENHANCER: return docEnhancerCategory;
      case ContentType.LEGAL: return legalCategory;
      case ContentType.APPLICATION: return applicationCategory;
      case ContentType.CV_BIO: return cvCategory;
      case ContentType.VISITING_CARD: return visitingCardCategory;
      case ContentType.BANNER: return bannerCategory;
      case ContentType.INVITATION: return invitationCategory;
      case ContentType.FB_VIDEO: return fbVideoCategory;
      case ContentType.OTHER: return otherCategory;
      default: return '';
    }
  };

  const isPolitical = (category: string) => category.includes('রাজনৈতিক');
  const isImageTool = (type: ContentType) => [
      ContentType.IMAGE, ContentType.THUMBNAIL, ContentType.LOGO, ContentType.PASSPORT, ContentType.BG_REMOVE, ContentType.DOC_ENHANCER,
      ContentType.VISITING_CARD, ContentType.BANNER, ContentType.INVITATION
  ].includes(type);

  const supportsImageUpload = (type: ContentType) => isImageTool(type) || type === ContentType.COMMENT || type === ContentType.IMG_TO_TEXT;
  const requiresImageUpload = (type: ContentType) => [ContentType.PASSPORT, ContentType.BG_REMOVE, ContentType.IMG_TO_TEXT, ContentType.DOC_ENHANCER].includes(type);
  const allowMultipleImages = activeTab === ContentType.PASSPORT && ppDress === PassportDress.COUPLE;
  const maxImages = allowMultipleImages ? 3 : 1;
  const supportsOverlayText = (type: ContentType) => [ContentType.IMAGE, ContentType.THUMBNAIL, ContentType.VISITING_CARD, ContentType.BANNER, ContentType.INVITATION].includes(type);
  
  // Tools that need specific inputs instead of generic context
  const hasDynamicInputs = [ContentType.CV_BIO, ContentType.LEGAL, ContentType.APPLICATION, ContentType.EMAIL].includes(activeTab);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (allowMultipleImages) {
            setSelectedImages(prev => prev.length >= maxImages ? prev : [...prev, reader.result as string]);
          } else {
            setSelectedImages([reader.result]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { processFile(file); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); };

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
  }, [activeTab, allowMultipleImages, selectedImages]);

  const removeImage = (index: number) => setSelectedImages(prev => prev.filter((_, i) => i !== index));
  const clearAllImages = () => { setSelectedImages([]); if (fileInputRef.current) fileInputRef.current.value = ''; };
  
  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = getActiveCategoryValue();
    const selectedParty = isPolitical(category) ? party : undefined;
    
    let finalAspectRatio = aspectRatio;
    if (activeTab === ContentType.THUMBNAIL) finalAspectRatio = ImageAspectRatio.LANDSCAPE;
    if (activeTab === ContentType.LOGO) finalAspectRatio = ImageAspectRatio.SQUARE;
    if (activeTab === ContentType.PASSPORT) finalAspectRatio = ImageAspectRatio.TALL;
    if (activeTab === ContentType.VISITING_CARD) finalAspectRatio = ImageAspectRatio.LANDSCAPE;
    if (activeTab === ContentType.BANNER) finalAspectRatio = ImageAspectRatio.WIDE; 
    if (activeTab === ContentType.INVITATION) finalAspectRatio = ImageAspectRatio.PORTRAIT;

    const passportConfig = activeTab === ContentType.PASSPORT ? {
      country: ppCountry,
      bg: ppBg,
      dress: ppDress,
      coupleDress: ppDress === PassportDress.COUPLE ? ppCoupleDress : undefined,
      aiRetouch: ppRetouch
    } : undefined;
    
    // Construct Context from Dynamic Fields if applicable
    let finalContext = context;
    
    if (activeTab === ContentType.CV_BIO) {
        finalContext = `
          Name: ${formData.cvName || 'Not specified'}
          Phone/Email: ${formData.cvContact || 'Not specified'}
          Education: ${formData.cvEdu || 'Not specified'}
          Experience: ${formData.cvExp || 'Not specified'}
          Skills: ${formData.cvSkills || 'Not specified'}
          Personal/Family Details: ${formData.cvDetails || 'Not specified'}
        `;
    } else if (activeTab === ContentType.LEGAL) {
        finalContext = `
          First Party (1st): ${formData.legal1st || 'Not specified'}
          Second Party (2nd): ${formData.legal2nd || 'Not specified'}
          Property/Money Details: ${formData.legalDetails || 'Not specified'}
          Terms & Conditions: ${formData.legalTerms || 'Standard terms'}
        `;
    } else if (activeTab === ContentType.APPLICATION || activeTab === ContentType.EMAIL) {
        finalContext = `
          Recipient (To): ${formData.appTo || 'Authority'}
          Subject: ${formData.appSubject || 'Application'}
          Details/Reason: ${formData.appDetails || 'Not specified'}
        `;
    }

    onGenerate(activeTab, category, finalContext, tone, length, selectedParty, finalAspectRatio, selectedImages, passportConfig, overlayText, userInstruction, language);
  };

  const renderCategoryOptions = () => {
    let categories: any = {};
    let currentValue = '';
    let setter: any = () => {};

    if (activeTab === ContentType.PASSPORT) return null;

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
      case ContentType.PDF_MAKER: categories = PdfCategory; currentValue = pdfCategory; setter = setPdfCategory; break;
      case ContentType.IMG_TO_TEXT: categories = ImgToTextCategory; currentValue = imgToTextCategory; setter = setImgToTextCategory; break;
      case ContentType.IMAGE: categories = ImageCategory; currentValue = imageCategory; setter = setImageCategory; break;
      case ContentType.THUMBNAIL: categories = ThumbnailCategory; currentValue = thumbnailCategory; setter = setThumbnailCategory; break;
      case ContentType.LOGO: categories = LogoCategory; currentValue = logoCategory; setter = setLogoCategory; break;
      case ContentType.BG_REMOVE: categories = BgRemoveCategory; currentValue = bgRemoveCategory; setter = setBgRemoveCategory; break;
      case ContentType.DOC_ENHANCER: categories = DocEnhancerCategory; currentValue = docEnhancerCategory; setter = setDocEnhancerCategory; break;
      case ContentType.LEGAL: categories = LegalCategory; currentValue = legalCategory; setter = setLegalCategory; break;
      case ContentType.APPLICATION: categories = ApplicationCategory; currentValue = applicationCategory; setter = setApplicationCategory; break;
      case ContentType.CV_BIO: categories = CvCategory; currentValue = cvCategory; setter = setCvCategory; break;
      case ContentType.VISITING_CARD: categories = VisitingCardCategory; currentValue = visitingCardCategory; setter = setVisitingCardCategory; break;
      case ContentType.BANNER: categories = BannerCategory; currentValue = bannerCategory; setter = setBannerCategory; break;
      case ContentType.INVITATION: categories = InvitationCategory; currentValue = invitationCategory; setter = setInvitationCategory; break;
      case ContentType.FB_VIDEO: categories = FbVideoCategory; currentValue = fbVideoCategory; setter = setFbVideoCategory; break;
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
      case ContentType.VISITING_CARD: return "উদাহরণ: নাম, পদবী, মোবাইল, ঠিকানা...";
      case ContentType.BANNER: return "উদাহরণ: দোকানের নাম, অফার, স্থান...";
      case ContentType.INVITATION: return "উদাহরণ: পাত্র-পাত্রীর নাম, তারিখ, স্থান...";
      case ContentType.FB_VIDEO: return "ভিডিওর বিষয়বস্তু বা লিংক দিন...";
      default: return "বিষয়বস্তু / তথ্য লিখুন...";
    }
  };
  
  const renderDynamicInputs = () => {
    if (activeTab === ContentType.CV_BIO) {
        return (
           <div className="space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <input className="input-field" placeholder="আপনার নাম" onChange={e => handleFormChange('cvName', e.target.value)} />
                 <input className="input-field" placeholder="মোবাইল / ইমেইল" onChange={e => handleFormChange('cvContact', e.target.value)} />
              </div>
              <input className="input-field" placeholder="শিক্ষাগত যোগ্যতা (সংক্ষেপে)" onChange={e => handleFormChange('cvEdu', e.target.value)} />
              <textarea className="input-field h-20" placeholder="অভিজ্ঞতা ও স্কিল (Experience & Skills)" onChange={e => handleFormChange('cvExp', e.target.value)} />
              <textarea className="input-field h-20" placeholder="পারিবারিক / ব্যক্তিগত তথ্য (বায়োডাটার জন্য)" onChange={e => handleFormChange('cvDetails', e.target.value)} />
           </div>
        );
    }
    if (activeTab === ContentType.LEGAL) {
        return (
           <div className="space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <input className="input-field" placeholder="১ম পক্ষ (মালিক/দাতা)" onChange={e => handleFormChange('legal1st', e.target.value)} />
                 <input className="input-field" placeholder="২য় পক্ষ (ভাড়াটিয়া/গ্রহীতা)" onChange={e => handleFormChange('legal2nd', e.target.value)} />
              </div>
              <textarea className="input-field h-20" placeholder="জমি / ফ্লাট / টাকার বিবরণ" onChange={e => handleFormChange('legalDetails', e.target.value)} />
              <textarea className="input-field h-24" placeholder="শর্তাবলী (ভাড়া, মেয়াদ, জামানত ইত্যাদি)" onChange={e => handleFormChange('legalTerms', e.target.value)} />
           </div>
        );
    }
    if (activeTab === ContentType.APPLICATION || activeTab === ContentType.EMAIL) {
        return (
           <div className="space-y-3 animate-in fade-in">
              <input className="input-field" placeholder="প্রাপক (বরাবর), যেমন: প্রধান শিক্ষক / ম্যানেজার" onChange={e => handleFormChange('appTo', e.target.value)} />
              <input className="input-field" placeholder="বিষয় (Subject)" onChange={e => handleFormChange('appSubject', e.target.value)} />
              <textarea className="input-field h-32" placeholder="মূল বিবরণ (কি কারণে আবেদন করছেন?)" onChange={e => handleFormChange('appDetails', e.target.value)} />
           </div>
        );
    }
    return null;
  };

  const getImageUploadLabel = () => {
    if (requiresImageUpload(activeTab)) {
       if (allowMultipleImages) return `আপনার ছবি আপলোড করুন (${selectedImages.length}/${maxImages})`;
       if (activeTab === ContentType.IMG_TO_TEXT) return "ডকুমেন্ট / ইমেজের ছবি আপলোড করুন";
       if (activeTab === ContentType.DOC_ENHANCER) return "ঘোলা বা কালো ডকুমেন্টের ছবি দিন";
       return "আপনার ছবি আপলোড করুন";
    }
    if (activeTab === ContentType.COMMENT) return "স্ক্রিনশট আপলোড করুন (অপশনাল)";
    return "রেফারেন্স ছবি আপলোড করুন (অপশনাল)";
  };

  const TabButton = ({ type, icon: Icon, label }: { type: ContentType, icon: any, label: string }) => (
    <button
      type="button"
      onClick={() => { setActiveTab(type); if (!supportsImageUpload(type)) clearAllImages(); setFormData({}); }}
      className={`relative group flex flex-row items-center justify-center px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm font-bangla whitespace-nowrap flex-shrink-0 ${
        activeTab === type ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 ring-1 ring-slate-200'
      }`}
    >
      <Icon size={16} className={`mr-2 ${activeTab === type ? 'text-indigo-100' : 'text-slate-400 group-hover:text-indigo-500'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50">
        {onBack ? (
          <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors font-bangla font-semibold px-2 py-1 rounded-lg hover:bg-slate-100">
            <ArrowLeft size={18} /><span>হোম-এ ফিরে যান</span>
          </button>
        ) : <div />}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-bangla">টুল সিলেক্টর</span>
      </div>

      <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {/* Shop */}
          <TabButton type={ContentType.DOC_ENHANCER} icon={ScanText} label="ডকুমেন্ট ফিক্সার" />
          <TabButton type={ContentType.PASSPORT} icon={UserSquare} label="পাসপোর্ট" />
          <TabButton type={ContentType.PDF_MAKER} icon={FileDown} label="PDF মেকার" />
          <TabButton type={ContentType.IMG_TO_TEXT} icon={ScanText} label="OCR" />
          <div className="w-px h-6 bg-slate-300 mx-2 self-center flex-shrink-0"></div>
          {/* Docs */}
          <TabButton type={ContentType.CV_BIO} icon={UserCheck} label="সিভি/বায়োডাটা" />
          <TabButton type={ContentType.APPLICATION} icon={FileBadge} label="আবেদন" />
          <TabButton type={ContentType.LEGAL} icon={ScrollText} label="চুক্তি/স্ট্যাম্প" />
          <TabButton type={ContentType.EMAIL} icon={Mail} label="ইমেইল" />
          <div className="w-px h-6 bg-slate-300 mx-2 self-center flex-shrink-0"></div>
          {/* Graphics */}
          <TabButton type={ContentType.VISITING_CARD} icon={CreditCard} label="ভিজিটিং কার্ড" />
          <TabButton type={ContentType.BANNER} icon={FlagIcon} label="ব্যানার" />
          <TabButton type={ContentType.INVITATION} icon={Gift} label="ইনভাইটেশন" />
          <TabButton type={ContentType.LOGO} icon={Stamp} label="লোগো" />
          <TabButton type={ContentType.THUMBNAIL} icon={Crop} label="থাম্বনেইল" />
          <TabButton type={ContentType.IMAGE} icon={ImageIcon} label="এআই ইমেজ" />
          <TabButton type={ContentType.BG_REMOVE} icon={Eraser} label="ব্যাকগ্রাউন্ড" />
          <div className="w-px h-6 bg-slate-300 mx-2 self-center flex-shrink-0"></div>
          {/* Social */}
          <TabButton type={ContentType.POST} icon={FileText} label="পোস্ট" />
          <TabButton type={ContentType.COMMENT} icon={MessageSquare} label="কমেন্ট" />
          <TabButton type={ContentType.STORY} icon={Zap} label="স্টোরি" />
          <TabButton type={ContentType.BIO} icon={User} label="বায়ো" />
          <TabButton type={ContentType.FB_VIDEO} icon={Facebook} label="FB ভিডিও" />
          <TabButton type={ContentType.SCRIPT} icon={Video} label="স্ক্রিপ্ট" />
          <TabButton type={ContentType.OTHER} icon={MoreHorizontal} label="অন্যান্য" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {activeTab === ContentType.PASSPORT && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Globe size={12} /> দেশ ও সাইজ</label>
              <select value={ppCountry} onChange={(e) => setPpCountry(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3">
                {Object.values(PassportCountry).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Palette size={12} /> ব্যাকগ্রাউন্ড কালার</label>
              <select value={ppBg} onChange={(e) => setPpBg(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3">
                {Object.values(PassportBg).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Shirt size={12} /> পোশাক / ড্রেস</label>
              <select value={ppDress} onChange={(e) => setPpDress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3">
                {Object.values(PassportDress).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {ppDress === PassportDress.COUPLE && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                 <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Users size={12} /> কাপল ড্রেস স্টাইল</label>
                <select value={ppCoupleDress} onChange={(e) => setPpCoupleDress(e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3">
                  {Object.values(CoupleDress).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Wand2 size={12} /> AI রিটাচ (Beauty Fix)</label>
              <div className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${ppRetouch ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`} onClick={() => setPpRetouch(!ppRetouch)}>
                 <span className="text-sm font-bangla text-slate-700">অটোমেটিক স্কিন ফিক্স</span>
                 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${ppRetouch ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${ppRetouch ? 'translate-x-4' : 'translate-x-0'}`}></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== ContentType.PASSPORT && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">
                {isImageTool(activeTab) || activeTab === ContentType.IMG_TO_TEXT ? "স্টাইল / ক্যাটাগরি" : "মুড / ক্যাটাগরি"}
              </label>
              <div className="relative group">
                {renderCategoryOptions()}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-indigo-600 transition-colors"><ChevronDown size={16} /></div>
              </div>
            </div>
            {isPolitical(getActiveCategoryValue()) && !isImageTool(activeTab) && activeTab !== ContentType.IMG_TO_TEXT && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-bangla ml-1 flex items-center gap-2"><Flag size={12} /> রাজনৈতিক দল / সংগঠন</label>
                <div className="relative group">
                  <select value={party} onChange={(e) => setParty(e.target.value)} className="w-full appearance-none bg-indigo-50/50 border border-indigo-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 pr-8 transition-all font-bangla hover:bg-indigo-50">
                    <option value="">কোনো নির্দিষ্ট দল নেই (সাধারণ)</option>
                    {POLITICAL_PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500"><ChevronDown size={16} /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {supportsImageUpload(activeTab) && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Upload size={12} /> {getImageUploadLabel()}</label>
            {selectedImages.length === 0 ? (
              <div onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-400'}`}>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Upload size={24} /></div>
                <p className="text-sm font-semibold text-slate-600 font-bangla">ছবি সিলেক্ট করতে ক্লিক করুন, ড্র্যাগ করুন অথবা পেস্ট (Ctrl+V) করুন</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG সাপোর্টেড {allowMultipleImages && `(Max 3 images)`}</p>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" multiple={allowMultipleImages} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                 ))}
                 {allowMultipleImages && selectedImages.length < maxImages && (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors aspect-square">
                       <Plus size={24} className="text-slate-400" />
                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" multiple />
                    </div>
                 )}
              </div>
            )}
           </div>
        )}

        {hasDynamicInputs ? (
            <>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">তথ্য / বিবরণ</label>
               {renderDynamicInputs()}
            </>
        ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">
                {activeTab === ContentType.IMG_TO_TEXT ? "নির্দেশনা (অপশনাল)" : activeTab === ContentType.IMAGE || activeTab === ContentType.THUMBNAIL || activeTab === ContentType.LOGO || activeTab === ContentType.VISITING_CARD || activeTab === ContentType.BANNER || activeTab === ContentType.INVITATION ? "ইমেজ প্রম্পট / বিষয়বস্তু / লেখা" : "বিষয়বস্তু / প্রসঙ্গ / তথ্য"}
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-4 transition-all resize-none font-bangla h-28 hover:bg-white"
              />
            </div>
        )}

        {supportsOverlayText(activeTab) && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Type size={12} /> ইমেজের উপরের লেখা (TEXT OVERLAY)</label>
             <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="যেমন: নাম, ঠিকানা, অফার..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 transition-all font-bangla hover:bg-white"
             />
             <p className="text-[10px] text-slate-400 font-bangla ml-1">বাংলা লেখা ইমেজে ভুল করতে পারে, তাই এখানে লিখলে সেটি ইমেজের উপর সুন্দরভাবে বসিয়ে দেওয়া হবে।</p>
           </div>
        )}

        {activeTab === ContentType.COMMENT && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><PenLine size={12} /> আপনার মন্তব্য / নির্দিষ্ট পয়েন্ট (অপশনাল)</label>
             <input
                type="text"
                value={userInstruction}
                onChange={(e) => setUserInstruction(e.target.value)}
                placeholder="যেমন: দাম নিয়ে অভিযোগ করো, খাবারের প্রশংসা করো..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3.5 transition-all font-bangla hover:bg-white"
             />
           </div>
        )}

        {!isImageTool(activeTab) && activeTab !== ContentType.PASSPORT && activeTab !== ContentType.IMG_TO_TEXT && (
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 transition-colors"
            >
              <Settings size={14} className="mr-1" />
              অ্যাডভান্সড অপশন {showAdvanced ? '(লুকান)' : '(দেখুন)'}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Languages size={12} /> ভাষা (Language)</label>
                   <div className="relative group">
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 pr-8 transition-all font-bangla">
                      {Object.values(ContentLanguage).map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDown size={14} /></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">টোন / মুড</label>
                  <div className="relative group">
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 pr-8 transition-all font-bangla">
                      {Object.values(ContentTone).map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDown size={14} /></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1">দৈর্ঘ্য / সাইজ</label>
                  <div className="relative group">
                    <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 pr-8 transition-all font-bangla">
                      {Object.values(ContentLength).map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDown size={14} /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isImageTool(activeTab) && (
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1"><Ratio size={12} /> অ্যাসপেক্ট রেশিও (Aspect Ratio)</label>
               <div className="flex gap-2 flex-wrap">
                  {Object.values(ImageAspectRatio).map((ratio) => (
                     <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                     >
                        {ratio}
                     </button>
                  ))}
               </div>
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (requiresImageUpload(activeTab) && selectedImages.length === 0)}
          className={`w-full py-4 rounded-xl text-white font-bold font-bangla shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
            isLoading || (requiresImageUpload(activeTab) && selectedImages.length === 0)
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:shadow-indigo-500/50 bg-[length:200%_auto] animate-gradient'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>প্রসেস হচ্ছে...</span>
            </>
          ) : (
            <>
              {activeTab === ContentType.IMG_TO_TEXT ? <ScanText size={20} /> : <Wand2 size={20} />}
              <span>{activeTab === ContentType.IMG_TO_TEXT ? 'টেক্সট এক্সট্রাক্ট করুন' : 'জেনারেট করুন'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;
