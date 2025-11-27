
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
  FileDown
} from 'lucide-react';
import { ContentType } from '../types';

interface ToolGridProps {
  onSelectTool: (type: ContentType) => void;
}

const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const categories = [
    {
      id: 'social',
      title: 'সোশ্যাল ও ক্রিয়েটিভ',
      subtitle: 'সোশ্যাল মিডিয়া রাইটিং ও সৃজনশীল লেখা',
      icon: PenTool,
      gradient: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
      tools: [
        { type: ContentType.POST, label: 'পোস্ট / ক্যাপশন', icon: FileText, desc: 'স্মার্ট ও আকর্ষণীয় পোস্ট' },
        { type: ContentType.COMMENT, label: 'কমেন্ট জেনারেটর', icon: MessageSquare, desc: 'উপযুক্ত রিপ্লাই ও কমেন্ট' },
        { type: ContentType.STORY, label: 'স্টোরি / স্ট্যাটাস', icon: Zap, desc: 'ছোট ও পাঞ্চি স্ট্যাটাস' },
        { type: ContentType.BIO, label: 'প্রোফাইল বায়ো', icon: User, desc: 'স্টাইলিশ প্রোফাইল বায়ো' },
        { type: ContentType.POEM, label: 'কবিতা / ছড়া', icon: Feather, desc: 'ছন্দ ও কবিতার লাইন' },
        { type: ContentType.NOTE, label: 'শর্ট নোট (Notes)', icon: StickyNote, desc: '৬০ অক্ষরের নোট' },
      ]
    },
    {
      id: 'image',
      title: 'ইমেজ ও গ্রাফিক্স স্টুডিও',
      subtitle: 'এআই দিয়ে ছবি, লোগো ও এডিটিং',
      icon: Palette,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-600',
      tools: [
        { type: ContentType.IMAGE, label: 'এআই ইমেজ', icon: Sparkles, desc: 'টেক্সট থেকে ছবি তৈরি' },
        { type: ContentType.THUMBNAIL, label: 'থাম্বনেইল মেকার', icon: Crop, desc: 'ইউটিউব ও ফেসবুকের জন্য' },
        { type: ContentType.LOGO, label: 'লোগো ডিজাইন', icon: Stamp, desc: 'ব্র্যান্ড লোগো আইডিয়া' },
        { type: ContentType.PASSPORT, label: 'পাসপোর্ট ফটো', icon: UserSquare, desc: 'অফিসিয়াল ছবির স্টাইল' },
        { type: ContentType.BG_REMOVE, label: 'ব্যাকগ্রাউন্ড এডিটর', icon: Eraser, desc: 'ব্যাকগ্রাউন্ড পরিবর্তন' },
      ]
    },
    {
      id: 'business',
      title: 'বিজনেজ ও প্রফেশনাল',
      subtitle: 'ইমেইল, মার্কেটিং ও প্রোডাক্টিভিটি',
      icon: Briefcase,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
      tools: [
        { type: ContentType.EMAIL, label: 'ইমেইল / লেটার', icon: Mail, desc: 'ফরমাল ইমেইল ও আবেদন' },
        { type: ContentType.AD_COPY, label: 'বিজ্ঞাপন / অ্যাড', icon: Megaphone, desc: 'ফেসবুক অ্যাড ও মার্কেটিং' },
        { type: ContentType.SCRIPT, label: 'ভিডিও স্ক্রিপ্ট', icon: Video, desc: 'রিলস ও ভিডিওর প্ল্যান' },
        { type: ContentType.PDF_MAKER, label: 'PDF মেকার', icon: FileDown, desc: 'সিভি, রিপোর্ট ও ডক' },
        { type: ContentType.OTHER, label: 'অন্যান্য টুলস', icon: MoreHorizontal, desc: 'এসএমএস, উইশ এবং অন্যান্য' },
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
