
export interface FbVideoResponse {
  sd?: string;
  hd?: string;
  thumbnail?: string;
  title?: string;
  error?: string;
}

export async function getFacebookVideo(url: string): Promise<FbVideoResponse> {
  if (!url) return { error: "Please provide a valid Facebook video URL" };

  // Helper to clean extracted URLs
  const cleanUrl = (link: string) => {
      if (!link) return undefined;
      let cleaned = link;
      cleaned = cleaned.replace(/\\u0026/g, "&")
                       .replace(/\\u0025/g, "%")
                       .replace(/\\/g, "");
      try {
        return decodeURIComponent(cleaned);
      } catch (e) {
        return cleaned;
      }
  };

  // Proxies
  // We use parallel fetching to speed up the process significantly
  const getProxifiedUrls = (targetUrl: string) => [
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      // Add a cache buster to prevent stale data
      `https://thingproxy.freeboard.io/fetch/${targetUrl}` 
  ];

  // Prepare URL variants
  let targetUrls: string[] = [];
  
  if (url.match(/(facebook|fb)\.com/)) {
      // 1. mbasic (Fastest & Easiest to parse)
      const mbasic = url.replace(/(www|web|m)\.facebook\.com/, 'mbasic.facebook.com');
      // 2. www (Contains JSON blobs for HD)
      const www = url.replace(/(mbasic|m|web)\.facebook\.com/, 'www.facebook.com');
      
      targetUrls = [mbasic, www];
  } else {
      targetUrls = [url];
  }

  // Flatten into a list of all Proxy + URL combinations
  const requestPromises: Promise<string>[] = [];

  targetUrls.forEach(tUrl => {
      getProxifiedUrls(tUrl).forEach(pUrl => {
          requestPromises.push(
              fetch(pUrl, { 
                  headers: { 
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
                  } 
              })
              .then(res => {
                  if (!res.ok) throw new Error('Network response was not ok');
                  return res.text();
              })
              .then(text => {
                  if(text.length < 100) throw new Error('Empty response');
                  return text;
              })
          );
      });
  });

  try {
      // RACE: Wait for the FIRST successful response (Speed Optimization)
      // We use Promise.any to ignore failures and get the first success
      const html = await (Promise as any).any(requestPromises);

      // --- PARSING ---
      let sd = undefined;
      let hd = undefined;
      let thumbnail = undefined;
      let title = "Facebook Video";

      // 1. Extract Thumbnail (og:image)
      const thumbMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
      if (thumbMatch && thumbMatch[1]) {
          thumbnail = cleanUrl(thumbMatch[1]);
      }

      // 2. Extract Title (og:title)
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
      if (titleMatch && titleMatch[1]) {
          title = cleanUrl(titleMatch[1]) || "Facebook Video";
      }

      // 3. Extract Video Links (HD/SD)
      
      // Method A: JSON extraction (Common in www)
      const hdMatch = html.match(/"hd_src"\s*:\s*"([^"]+)"/) || 
                      html.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/) || 
                      html.match(/playable_url_quality_hd"\s*:\s*"([^"]+)"/);
                      
      const sdMatch = html.match(/"sd_src"\s*:\s*"([^"]+)"/) || 
                      html.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/) || 
                      html.match(/playable_url"\s*:\s*"([^"]+)"/);

      if (hdMatch) hd = cleanUrl(hdMatch[1]);
      if (sdMatch) sd = cleanUrl(sdMatch[1]);

      // Method B: Redirect extraction (Common in mbasic)
      if (!sd && !hd) {
          const redirectMatch = html.match(/href\s*=\s*["']\/video_redirect\/\?src=([^"']+)["']/);
          if (redirectMatch && redirectMatch[1]) {
              sd = cleanUrl(redirectMatch[1]);
          }
      }

      // Method C: OpenGraph Video (Fallback)
      if (!sd && !hd) {
          const metaMatch = html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/);
          if (metaMatch && metaMatch[1]) {
              sd = cleanUrl(metaMatch[1]);
          }
      }

      if (!sd && !hd) {
          throw new Error("No video links found");
      }

      return { sd, hd, thumbnail, title };

  } catch (error) {
      console.error("All proxies failed or no video found", error);
      return { error: "ভিডিওটি প্রাইভেট অথবা লিংকটি কাজ করছে না। দয়া করে পাবলিক ভিডিও লিংক দিন।" };
  }
}
