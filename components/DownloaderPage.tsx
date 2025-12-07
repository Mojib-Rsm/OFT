
import React, { useState } from 'react';
import { Download, Link, Loader2, Video, Clipboard, ArrowLeft, AlertCircle, PlayCircle, FileVideo } from 'lucide-react';
import { getFacebookVideo, FbVideoResponse } from '../services/fbDownloader';

interface DownloaderPageProps {
  onBack: () => void;
}

const DownloaderPage: React.FC<DownloaderPageProps> = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<FbVideoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track download states separately
  const [downloadingHd, setDownloadingHd] = useState(false);
  const [downloadingSd, setDownloadingSd] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      // 5-second timeout safeguard in UI
      const data = await getFacebookVideo(url);
      if (data.error) {
        setError(data.error);
      } else {
        setVideoData(data);
      }
    } catch (err) {
      setError('সার্ভার রেসপন্স করতে দেরি করছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to force download by fetching blob
  const forceDownload = async (videoUrl: string, quality: 'HD' | 'SD') => {
    if (!videoUrl) return;
    
    const setDownloading = quality === 'HD' ? setDownloadingHd : setDownloadingSd;
    setDownloading(true);

    try {
      // Attempt to fetch the video data
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error('Network error');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `facebook_video_${quality}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (e) {
      console.error("Direct download failed, falling back to new tab", e);
      // Fallback: Open in new tab if CORS blocks blob fetch
      window.open(videoUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-bangla">ফেসবুক ভিডিও ডাউনলোডার</h2>
          <p className="text-slate-500 font-bangla text-sm">ফেসবুক রিলস বা ভিডিও লিংক থেকে সহজেই ডাউনলোড করুন</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/10 border border-slate-200 overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleFetchInfo} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
               <Link size={12}/> ভিডিও লিংক (URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
               <div className="relative flex-grow">
                 <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.facebook.com/watch?v=..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-4 shadow-sm transition-all font-sans"
                 />
               </div>
               <button 
                 type="button" 
                 onClick={handlePaste}
                 className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 sm:py-0 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 font-bangla font-semibold whitespace-nowrap"
               >
                  <Clipboard size={18} /> Paste
               </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url}
            className={`w-full py-4 rounded-xl text-white font-bold font-bangla shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
              isLoading || !url
                ? 'bg-slate-400 cursor-not-allowed shadow-none translate-y-0'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>ভিডিও খোঁজা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Video size={20} />
                <span>ভিডিও প্রিভিউ দেখুন</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-red-700 font-bangla">সমস্যা হয়েছে</h4>
            <p className="text-sm text-red-600 font-bangla mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {videoData && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-slate-100 flex items-center gap-2">
              <FileVideo className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-700 font-bangla">ভিডিও পাওয়া গেছে</h3>
           </div>
           
           <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                 
                 {/* Video Preview / Thumbnail */}
                 <div className="w-full md:w-5/12 aspect-video bg-black rounded-xl overflow-hidden shadow-md relative group">
                    {videoData.thumbnail ? (
                        <img 
                            src={videoData.thumbnail} 
                            alt="Video Thumbnail" 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                             <Video size={48} className="text-slate-600" />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="text-white/80 w-16 h-16 drop-shadow-lg" />
                    </div>
                 </div>
                 
                 <div className="flex-1 space-y-5">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2 leading-snug">
                          {videoData.title || "Facebook Video"}
                      </h4>
                      <p className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded font-medium">MP4 Format</p>
                    </div>

                    <div className="space-y-3">
                      {/* HD Button */}
                      {videoData.hd ? (
                        <button 
                          onClick={() => forceDownload(videoData.hd!, 'HD')}
                          disabled={downloadingHd}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-md shadow-blue-200"
                        >
                           {downloadingHd ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                           {downloadingHd ? 'ডাউনলোড শুরু হচ্ছে...' : 'HD কোয়ালিটি ডাউনলোড'}
                        </button>
                      ) : (
                        <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                           HD পাওয়া যায়নি
                        </button>
                      )}

                      {/* SD Button */}
                      {videoData.sd ? (
                        <button 
                          onClick={() => forceDownload(videoData.sd!, 'SD')}
                          disabled={downloadingSd}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-semibold"
                        >
                           {downloadingSd ? <Loader2 size={18} className="animate-spin text-slate-500" /> : <Download size={18} />} 
                           {downloadingSd ? 'ডাউনলোড শুরু হচ্ছে...' : 'SD কোয়ালিটি ডাউনলোড'}
                        </button>
                      ) : (
                        <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                           SD পাওয়া যায়নি
                        </button>
                      )}
                    </div>
                 </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 font-bangla text-center">
                 নোট: ডাউনলোড বাটনে ক্লিক করার পর ফাইল সেভ হতে কয়েক সেকেন্ড সময় লাগতে পারে। দয়া করে অপেক্ষা করুন।
              </div>
           </div>
        </div>
      )}

      {/* Instructions */}
      <div className="grid md:grid-cols-3 gap-4 text-center mt-12">
         <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
            <h4 className="font-bold text-slate-700 font-bangla">লিংক কপি করুন</h4>
            <p className="text-xs text-slate-500 mt-1 font-bangla">ফেসবুক অ্যাপ বা ব্রাউজার থেকে ভিডিওর লিংক কপি করুন</p>
         </div>
         <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
            <h4 className="font-bold text-slate-700 font-bangla">পেস্ট করুন</h4>
            <p className="text-xs text-slate-500 mt-1 font-bangla">উপরের বক্সে লিংকটি পেস্ট করে প্রিভিউ বাটনে ক্লিক করুন</p>
         </div>
         <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
            <h4 className="font-bold text-slate-700 font-bangla">সেভ করুন</h4>
            <p className="text-xs text-slate-500 mt-1 font-bangla">থাম্বনেইল দেখে পছন্দমতো কোয়ালিটি ডাউনলোড করুন</p>
         </div>
      </div>
    </div>
  );
};

export default DownloaderPage;
