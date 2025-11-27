
import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Share2, CornerDownRight, Download, Image as ImageIcon, Printer, Grid, Type, FileDown } from 'lucide-react';

interface ResultCardProps {
  content: string;
  index: number;
  overlayText?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ content, index, overlayText }) => {
  const [copied, setCopied] = useState(false);
  const isImage = content.startsWith('data:image');
  const [displayContent, setDisplayContent] = useState<string>(content);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Effect to process image and overlay text if present
  useEffect(() => {
    if (isImage && overlayText) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = content;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original AI image
        ctx.drawImage(img, 0, 0);

        // Configure Text Style
        const fontSize = Math.max(24, img.width / 15); // Dynamic font size based on image width
        ctx.font = `bold ${fontSize}px "Hind Siliguri", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Add minimal shadow/glow for better readability
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        const x = canvas.width / 2;
        const y = canvas.height - (canvas.height * 0.1); // Position at bottom 10%
        
        const lines = overlayText.split('\n');
        // Simple word wrap logic could go here, but for now assuming user manages newlines or short text
        
        // Draw Text Stroke (Outline)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = fontSize / 6;
        lines.forEach((line, i) => {
           const lineY = y - ((lines.length - 1 - i) * (fontSize * 1.2));
           ctx.strokeText(line, x, lineY);
        });

        // Draw Text Fill
        ctx.fillStyle = 'white';
        lines.forEach((line, i) => {
           const lineY = y - ((lines.length - 1 - i) * (fontSize * 1.2));
           ctx.fillText(line, x, lineY);
        });

        // Update state with new image
        setDisplayContent(canvas.toDataURL('image/png'));
      };
    } else {
        setDisplayContent(content);
    }
  }, [content, overlayText, isImage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayContent;
    link.download = `oft-ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfDownload = () => {
    // Basic Markdown to HTML conversion for bold and lines
    const formattedHtml = displayContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold: **text** -> <strong>text</strong>
      .replace(/\n/g, '<br/>'); // Newlines

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Download PDF - OFT AI</title>
            <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Hind Siliguri', sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
                color: #1e293b;
                line-height: 1.6;
              }
              h1, h2, strong {
                font-weight: 700;
                color: #0f172a;
              }
              .content {
                white-space: pre-wrap;
                font-size: 14pt;
              }
              @media print {
                @page { margin: 2cm; size: A4; }
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
               <button onclick="window.print()" style="background: #4f46e5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-family: 'Hind Siliguri';">
                 PDF হিসেবে সেভ করুন / প্রিন্ট করুন
               </button>
            </div>
            <div class="content">${formattedHtml}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      // Optional: Auto print after load
      // printWindow.onload = () => printWindow.print();
    } else {
      alert('পপ-আপ ব্লক করা আছে। দয়া করে পপ-আপ এলাউ করুন।');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        if (isImage) {
            const response = await fetch(displayContent);
            const blob = await response.blob();
            const file = new File([blob], 'generated-image.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'OFT AI Image',
                text: 'Generated by OFT AI'
              });
            } else {
               alert('সরাসরি ইমেজ শেয়ার এই ব্রাউজারে সমর্থিত নয়। দয়া করে ডাউনলোড করুন।');
            }
        } else {
          await navigator.share({
            title: 'OFT AI Content',
            text: displayContent,
          });
        }
      } catch (err) {
        console.error('Error sharing content:', err);
      }
    } else {
      if (!isImage) {
        handleCopy();
        alert('আপনার ব্রাউজারে শেয়ার অপশন নেই। লেখাটি কপি করা হয়েছে।');
      } else {
        alert('আপনার ব্রাউজারে শেয়ার অপশন নেই। দয়া করে ডাউনলোড করুন।');
      }
    }
  };

  const generatePrintSheet = async (count: number) => {
    const img = new Image();
    img.src = displayContent;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // A6 Sheet approx dimensions @ 300 DPI: 1240 x 1748 px
      // 4x6 Sheet approx dimensions @ 300 DPI: 1200 x 1800 px
      
      const sheetWidth = 1200;
      const sheetHeight = 1800;
      
      canvas.width = sheetWidth;
      canvas.height = sheetHeight;
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetWidth, sheetHeight);
      
      // Passport Photo Standard (45x35mm) aspect ratio approx 0.77
      // In pixels for print, approx 413x531 px per photo
      const photoW = 413;
      const photoH = 531;
      const gap = 40;
      
      let cols = 2;
      let rows = Math.ceil(count / cols);
      
      // Center the grid
      const totalGridW = (cols * photoW) + ((cols - 1) * gap);
      const totalGridH = (rows * photoH) + ((rows - 1) * gap);
      const startX = (sheetWidth - totalGridW) / 2;
      const startY = (sheetHeight - totalGridH) / 2;

      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = startX + (col * (photoW + gap));
        const y = startY + (row * (photoH + gap));
        
        ctx.drawImage(img, x, y, photoW, photoH);
        
        // Add cut marks (optional, simplified border)
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `passport-sheet-${count}-copies.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm border border-slate-200 p-0 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="flex h-full relative overflow-hidden">
        {/* Accent Bar */}
        <div className={`w-1.5 absolute left-0 top-0 bottom-0 bg-gradient-to-b ${index % 2 === 0 ? 'from-indigo-500 to-purple-500' : 'from-blue-500 to-cyan-500'}`}></div>
        
        <div className="flex-1 p-5 sm:p-6 pl-7 flex flex-col gap-4">
          <div className="flex-grow">
            {isImage ? (
              <div className="rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative group/img">
                <img src={displayContent} alt="AI Generated" className="w-full h-auto object-contain max-h-[400px]" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none"></div>
                {overlayText && (
                   <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bangla flex items-center gap-1">
                      <Type size={10} />
                      <span>টেক্সট যুক্ত করা হয়েছে</span>
                   </div>
                )}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-slate-800 font-bangla leading-relaxed whitespace-pre-wrap">
                {/* Rudimentary markdown rendering for preview */}
                {displayContent.split('\n').map((line, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 font-bangla mt-2 gap-3">
            <span className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider gap-1 group-hover:text-indigo-500 transition-colors">
              <CornerDownRight size={12} strokeWidth={3} />
              {isImage ? 'ইমেজ ফলাফল' : `অপশন ${index + 1}`}
            </span>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
               <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all bg-slate-50 text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-md border border-transparent hover:border-indigo-100"
              >
                <Share2 size={14} />
                <span className="hidden xs:inline">শেয়ার</span>
              </button>

               {isImage ? (
                 <>
                  {/* Print Sheet Options */}
                  <div className="flex items-center space-x-2 bg-indigo-50/50 p-1 rounded-lg border border-indigo-100/50">
                    <button
                      onClick={() => generatePrintSheet(4)}
                      title="4 copies A6"
                      className="p-1.5 hover:bg-indigo-100 rounded text-indigo-700 transition-colors"
                    >
                      <Grid size={16} />
                      <span className="text-[10px] font-bold ml-1">4 কপি</span>
                    </button>
                    <div className="w-px h-4 bg-indigo-200"></div>
                    <button
                      onClick={() => generatePrintSheet(6)}
                      title="6 copies 4x6"
                      className="p-1.5 hover:bg-indigo-100 rounded text-indigo-700 transition-colors"
                    >
                      <Printer size={16} />
                       <span className="text-[10px] font-bold ml-1">6 কপি</span>
                    </button>
                  </div>

                   <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm bg-slate-800 text-white hover:bg-indigo-600 hover:shadow-indigo-500/30"
                   >
                     <Download size={14} />
                     <span>সেভ</span>
                   </button>
                 </>
               ) : (
                 <>
                 {/* PDF Download Button */}
                  <button
                    onClick={handlePdfDownload}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-transparent hover:border-red-200"
                    title="PDF ডাউনলোড"
                  >
                    <FileDown size={14} />
                    <span className="hidden xs:inline">PDF</span>
                  </button>

                 <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm ${
                    copied
                      ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                      : 'bg-slate-800 text-white hover:bg-indigo-600 hover:shadow-indigo-500/30'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'কপি' : 'কপি'}</span>
                </button>
                </>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
