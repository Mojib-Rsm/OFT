
export interface FbVideoResponse {
  sd?: string;
  hd?: string;
  error?: string;
}

export async function getFacebookVideo(url: string): Promise<FbVideoResponse> {
  if (!url) return { error: "Please provide a valid Facebook video URL" };

  // Helper to clean extracted URLs
  const cleanUrl = (link: string) => {
      if (!link) return undefined;
      // Decode HTML entities and unicode
      let cleaned = link.replace(/&amp;/g, "&").replace(/\\/g, "").replace(/u0025/g, "%");
      try {
        return decodeURIComponent(cleaned);
      } catch (e) {
        return cleaned;
      }
  };

  try {
    // 1. Convert URL to mbasic version for easier parsing (Client-side scraping trick)
    // mbasic pages are static HTML, easier to regex than dynamic SPA pages
    let targetUrl = url;
    if (url.includes('www.facebook.com') || url.includes('web.facebook.com') || url.includes('m.facebook.com')) {
        targetUrl = url.replace('www.facebook.com', 'mbasic.facebook.com')
                       .replace('web.facebook.com', 'mbasic.facebook.com')
                       .replace('m.facebook.com', 'mbasic.facebook.com');
    }

    console.log("Fetching from:", targetUrl);
    
    // Using corsproxy.io as primary
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const html = await response.text();

    // Strategy A: Look for mbasic specific anchor tags (Most reliable for mbasic)
    // <a href="/video_redirect/?src=..."
    const redirectMatch = html.match(/href="\/video_redirect\/\?src=([^"]+)"/);
    if (redirectMatch && redirectMatch[1]) {
        const decodedLink = cleanUrl(redirectMatch[1]);
        if (decodedLink) {
            return { sd: decodedLink, hd: decodedLink }; // Usually mbasic gives SD, but it works
        }
    }

    // Strategy B: Regex for standard JSON keys (if mbasic redirects to standard or logic varies)
    const hdMatch = html.match(/"hd_src":"([^"]+)"/) || html.match(/"browser_native_hd_url":"([^"]+)"/) || html.match(/playable_url_quality_hd":"([^"]+)"/);
    const sdMatch = html.match(/"sd_src":"([^"]+)"/) || html.match(/"browser_native_sd_url":"([^"]+)"/) || html.match(/playable_url":"([^"]+)"/);

    if (hdMatch || sdMatch) {
        return {
            hd: hdMatch ? cleanUrl(hdMatch[1]) : undefined,
            sd: sdMatch ? cleanUrl(sdMatch[1]) : undefined
        };
    }

    // Strategy C: Meta Tags (OG Video)
    const metaMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
    if (metaMatch) {
        return { sd: cleanUrl(metaMatch[1]) };
    }

    return { error: "ভিডিও লিংক পাওয়া যায়নি। ভিডিওটি পাবলিক (Public) এবং রিলস/স্টোরি নয় নিশ্চিত করুন।" };
    
  } catch (error: any) {
    console.error("FB Downloader Error:", error);
    return { error: "নেটওয়ার্ক সমস্যা। ভিডিওটি প্রাইভেট হতে পারে অথবা লিংকটি সঠিক নয়।" };
  }
}
