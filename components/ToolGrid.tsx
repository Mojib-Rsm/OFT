
import React from 'react';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Zap, 
  StickyNote, 
  Video, 
  Image as ImageIcon, 
  Crop, 
  Stamp, 
  UserSquare, 
  Eraser, 
  MoreHorizontal, 
  Sparkles,
  PenTool,
  Palette,
  Briefcase,
  Mail,
  Megaphone,
  Feather,
  FileDown,
  ScanText,
  Printer,
  FileBadge,
  ScrollText,
  UserCheck,
  CreditCard,
  Flag,
  Gift,
  Files,
  Facebook,
  Download,
  Wand
} from 'lucide-react';
import { ContentType } from '../types';

interface ToolGridProps {
  onSelectTool: (type: ContentType) => void;
}

const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const categories = [
    {
      id: 'shop',
      title: 'কম্পিউটার দোকান ও প্রিন্টিং',
      subtitle: 'স্ক্যান, ফটো, পিডিএফ ও টাইপিং',
      icon: Printer,
      gradient: 'from-teal-500 to-emerald-500',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      text: 'text-teal-600',
      tools: [
        { type: ContentType.DOC_ENHANCER, label: 'ডকুমেন্ট ফিক্সার', icon: ScanText, desc: 'স্ক্যান ও ফটোকপি ক্লিনার' },
        { type: ContentType.PASSPORT, label: 'পাসপোর্ট ফটো', icon: UserSquare, desc: 'ছবি তোলা ও সাইজ করা' },
        { type: ContentType.PDF_MAKER, label: 'PDF মেকার', icon: FileDown, desc: 'ডকুমেন্ট তৈরি ও কনভার্ট' },
        { type: ContentType.IMG_TO_TEXT, label: 'টাইপিং / OCR', icon: Files, desc: 'ছবি থেকে লেখা (OCR)' },
      ]
    },
    {
      id: 'docs',
      title: 'ডকুমেন্ট ও আবেদন',
      subtitle: 'সিভি, চুক্তিপত্র, আবেদন ও ইমেইল',
      icon: Briefcase,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
      tools: [
        { type: ContentType.CV_BIO, label: 'সিভি / বায়োডাটা', icon: UserCheck, desc: 'চাকরি ও বিয়ের বায়োডাটা' },
        { type: ContentType.LEGAL, label: 'চুক্তি / স্ট্যাম্প', icon: ScrollText, desc: 'বাসা ভাড়া ও জমি চুক্তি' },
        { type: ContentType.APPLICATION, label: 'অফিসিয়াল আবেদন', icon: FileBadge, desc: 'NID, ব্যাংক ও সরকারি' },
        { type: ContentType.EMAIL, label: 'ইমেইল / লেটার', icon: Mail, desc: 'ফরমাল ইমেইল ও চিঠি' },
      ]
    },
    {
      id: 'design',
      title: 'গ্রাফিক্স ও ডিজাইন',
      subtitle: 'ব্যানার, কার্ড, লোগো ও এডিটিং',
      icon: Palette,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-600',
      tools: [
        { type: ContentType.VISITING_CARD, label: 'ভিজিটিং কার্ড', icon: CreditCard, desc: 'বিজনেস ও আইডি কার্ড' },
        { type: ContentType.BANNER, label: 'ব্যানার / ফ্লেক্স', icon: Flag, desc: 'দোকান ও নির্বাচনী ব্যানার' },
        { type: ContentType.INVITATION, label: 'ইনভাইটেশন কার্ড', icon: Gift, desc: 'বিয়ে ও জন্মদিন' },
        { type: ContentType.LOGO, label: 'লোগো ডিজাইন', icon: Stamp, desc: 'লোগো ও আইকন' },
        { type: ContentType.THUMBNAIL, label: 'থাম্বনেইল', icon: Crop, desc: 'ইউটিউব থাম্বনেইল' },
        { type: ContentType.IMAGE, label: 'এআই ইমেজ', icon: Sparkles, desc: 'যেকোনো ছবি তৈরি' },
        { type: ContentType.BG_REMOVE, label: 'ব্যাকগ্রাউন্ড', icon: Eraser, desc: 'ব্যাকগ্রাউন্ড পরিবর্তন' },
        { type: ContentType.PHOTO_ENHANCER, label: 'ফটো এনহ্যান্সার', icon: Wand, desc: 'ছবি ক্লিয়ার ও রঙিন' },
      ]
    },
    {
      id: 'social',
      title: 'সোশ্যাল ও ক্রিয়েটিভ',
      subtitle: 'পোস্ট, ক্যাপশন ও মার্কেটিং',
      icon: PenTool,
      gradient: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
      tools: [
        { type: ContentType.POST, label: 'পোস্ট / ক্যাপশন', icon: FileText, desc: 'সোশ্যাল মিডিয়া পোস্ট' },
        { type: ContentType.AD_COPY, label: 'বিজ্ঞাপন / অ্যাড', icon: Megaphone, desc: 'মার্কেটিং কপি' },
        { type: ContentType.COMMENT, label: 'কমেন্ট রিপ্লাই', icon: MessageSquare, desc: 'স্মার্ট রিপ্লাই' },
        { type: ContentType.STORY, label: 'স্টোরি / স্ট্যাটাস', icon: Zap, desc: 'ছোট স্ট্যাটাস' },
        { type: ContentType.FB_VIDEO, label: 'FB ভিডিও টুলস', icon: Facebook, desc: 'ক্যাপশন, ট্যাগ ও স্ক্রিপ্ট' },
        { type: ContentType.FB_DOWNLOADER, label: 'ভিডিও ডাউনলোডার', icon: Download, desc: 'ফেসবুক ভিডিও সেভ' },
        { type: ContentType.SCRIPT, label: 'ভিডিও স্ক্রিপ্ট', icon: Video, desc: 'ভিডিও আইডিয়া' },
        { type: ContentType.OTHER, label: 'অন্যান্য', icon: MoreHorizontal, desc: 'এসএমএস ও অন্যান্য' },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {categories.map((category) => (
        <section key={category.id} className="space-y-5">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${category.gradient} shadow-lg text-white`}>
              <category.icon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 font-bangla">{category.title}</h3>
              <p className="text-slate-500 font-medium text-sm font-bangla">{category.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {category.tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onSelectTool(tool.type)}
                className={`group relative flex flex-col items-start p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white ${category.border} hover:border-transparent`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className={`p-3 rounded-xl mb-4 transition-colors duration-300 ${category.bg} ${category.text} group-hover:scale-110 transform origin-left`}>
                  <tool.icon size={24} />
                </div>
                
                <h4 className="text-lg font-bold text-slate-800 mb-1 font-bangla group-hover:text-indigo-600 transition-colors">
                  {tool.label}
                </h4>
                <p className="text-sm text-slate-500 font-bangla text-left leading-relaxed">
                  {tool.desc}
                </p>

                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.gradient}`}></div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ToolGrid;