
export interface FbVideoResponse {
  sd?: string;
  hd?: string;
  error?: string;
}

export async function getFacebookVideo(url: string): Promise<FbVideoResponse> {
  if (!url) return { error: "Please provide a valid Facebook video URL" };

  // Helper to clean extracted URLs from JSON/HTML
  const cleanUrl = (link: string) => {
      if (!link) return undefined;
      let cleaned = link;
      
      // Fix common JSON escapes and unicode
      cleaned = cleaned.replace(/\\u0026/g, "&")
                       .replace(/\\u0025/g, "%")
                       .replace(/\\/g, ""); // Remove backslashes
      
      try {
        return decodeURIComponent(cleaned);
      } catch (e) {
        return cleaned;
      }
  };

  // Proxies to bypass CORS. 
  // 'corsproxy.io' is usually most effective for FB. 'allorigins' is a backup.
  const proxies = [
      (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}&t=${Date.now()}`,
      (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`
  ];

  // URL Variant Strategy:
  // 1. mbasic: Often returns a simple HTML with a redirect link (safest parsing).
  // 2. www: Returns big HTML with JSON blobs (contains HD links, but harder to parse).
  let variants: string[] = [];
  
  // Normalize input to generate variants
  if (url.match(/(facebook|fb)\.com/)) {
      // Create mbasic version
      const mbasic = url.replace(/(www|web|m)\.facebook\.com/, 'mbasic.facebook.com');
      // Create www version
      const www = url.replace(/(mbasic|m|web)\.facebook\.com/, 'www.facebook.com');
      
      // Try mbasic first as it's lighter and often works better with proxies, 
      // but ensure we also have the original or www version for HD data.
      variants = [mbasic, www];
      
      // If the input didn't contain a subdomain (e.g. facebook.com/...), add explicit ones
      if (!url.includes('www.') && !url.includes('mbasic.') && !url.includes('m.')) {
          variants = [`https://mbasic.facebook.com${new URL(url).pathname}`, `https://www.facebook.com${new URL(url).pathname}`];
      }
  } else {
      variants = [url];
  }

  // Remove duplicates
  variants = [...new Set(variants)];

  console.log("Starting FB Video fetch process...", variants);

  for (const targetUrl of variants) {
      for (const proxyGen of proxies) {
          try {
              const proxyUrl = proxyGen(targetUrl);
              // console.log(`Trying: ${targetUrl} via proxy`);
              
              const response = await fetch(proxyUrl);
              if (!response.ok) continue;
              
              const html = await response.text();
              if (!html || html.length < 100) continue;

              // --- PARSING LOGIC ---

              // 1. mbasic redirect (High confidence)
              // Pattern: href="/video_redirect/?src=..."
              const redirectMatch = html.match(/href\s*=\s*["']\/video_redirect\/\?src=([^"']+)["']/);
              if (redirectMatch && redirectMatch[1]) {
                   const decodedLink = cleanUrl(redirectMatch[1]);
                   if (decodedLink) {
                       return { sd: decodedLink, hd: decodedLink }; 
                   }
              }

              // 2. JSON data blobs (Common in www)
              // We look for specific keys that hold the MP4 urls
              const hdMatch = html.match(/"hd_src"\s*:\s*"([^"]+)"/) || 
                              html.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/) || 
                              html.match(/playable_url_quality_hd"\s*:\s*"([^"]+)"/);
                              
              const sdMatch = html.match(/"sd_src"\s*:\s*"([^"]+)"/) || 
                              html.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/) || 
                              html.match(/playable_url"\s*:\s*"([^"]+)"/);

              if (hdMatch || sdMatch) {
                  return {
                      hd: hdMatch ? cleanUrl(hdMatch[1]) : undefined,
                      sd: sdMatch ? cleanUrl(sdMatch[1]) : undefined
                  };
              }

              // 3. OpenGraph Tag (Fallback)
              const metaMatch = html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/);
              if (metaMatch && metaMatch[1]) {
                   const link = cleanUrl(metaMatch[1]);
                   if (link) return { sd: link };
              }

              // If we reach here, this specific proxy+url combo didn't yield a video.
              // Continue to next combination.

          } catch (e) {
              console.warn(`Fetch failed for ${targetUrl}`, e);
          }
      }
  }

  return { error: "ভিডিও লিংক খুঁজে পাওয়া যায়নি। ভিডিওটি পাবলিক কিনা নিশ্চিত করুন।" };
}
