
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
      try {
        // Multi-pass cleaning for various escape formats
        let cleaned = link
          .replace(/\\u0025/g, "%")
          .replace(/\\u0026/g, "&")
          .replace(/\\u003D/g, "=")
          .replace(/\\/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"');
        
        return decodeURIComponent(cleaned);
      } catch (e) {
        return link;
      }
  };

  // Proxies to try - Added more robust CORS proxies
  const getProxifiedUrls = (targetUrl: string) => [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];

  let targetUrls: string[] = [];
  
  // FB URL Normalization
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
      // 1. Try mbasic (easiest HTML structure)
      targetUrls.push(url.replace(/(www|web|m)\.facebook\.com/, 'mbasic.facebook.com'));
      // 2. Try mobile (sometimes has different meta tags)
      targetUrls.push(url.replace(/(www|web|mbasic)\.facebook\.com/, 'm.facebook.com'));
      // 3. Try desktop (contains high quality JSON blobs)
      targetUrls.push(url.replace(/(mbasic|m|web)\.facebook\.com/, 'www.facebook.com'));
  } else {
      targetUrls = [url];
  }

  const requestPromises: Promise<string>[] = [];

  targetUrls.forEach(tUrl => {
      getProxifiedUrls(tUrl).forEach(pUrl => {
          requestPromises.push(
              fetch(pUrl, { 
                  headers: { 
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
                  } 
              })
              .then(res => {
                  if (!res.ok) throw new Error('Network response was not ok');
                  return res.text();
              })
              .then(text => {
                   if(text.length < 500) throw new Error('Response too short');
                   // If it's a login page, treat as failed request unless we find og tags
                   if(text.includes('login_form') && !text.includes('og:video')) throw new Error('Login required');
                   return text;
              })
          );
      });
  });

  try {
      // Race for the first successful HTML response
      const html = await (Promise as any).any(requestPromises);

      let sd = undefined;
      let hd = undefined;
      let thumbnail = undefined;
      let title = "Facebook Video";

      // Meta extraction
      const thumbMatch = html.match(/property="og:image"\s+content="([^"]+)"/) || html.match(/"thumbnailUrl"\s*:\s*"([^"]+)"/);
      if (thumbMatch) thumbnail = cleanUrl(thumbMatch[1]);

      const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) || html.match(/<title>(.*?)<\/title>/);
      if (titleMatch) title = cleanUrl(titleMatch[1]);

      // --- STRATEGY 1: Advanced Regex for JSON Keys ---
      // Facebook hides URLs in JSON-like structures inside <script> tags
      
      const patterns = {
          hd: [
              /"hd_src"\s*:\s*"([^"]+)"/,
              /"playable_url_quality_hd"\s*:\s*"([^"]+)"/,
              /"browser_native_hd_url"\s*:\s*"([^"]+)"/,
              /hd_src_no_ratelimit:"([^"]+)"/
          ],
          sd: [
              /"sd_src"\s*:\s*"([^"]+)"/,
              /"playable_url"\s*:\s*"([^"]+)"/,
              /"browser_native_sd_url"\s*:\s*"([^"]+)"/,
              /sd_src_no_ratelimit:"([^"]+)"/
          ]
      };

      for (const pattern of patterns.hd) {
          const match = html.match(pattern);
          if (match && match[1]) {
              hd = cleanUrl(match[1]);
              break;
          }
      }

      for (const pattern of patterns.sd) {
          const match = html.match(pattern);
          if (match && match[1]) {
              sd = cleanUrl(match[1]);
              break;
          }
      }

      // --- STRATEGY 2: Redirect Link (Mbasic) ---
      if (!sd && !hd) {
          const redirectMatch = html.match(/href\s*=\s*["']\/video_redirect\/\?src=([^"']+)["']/);
          if (redirectMatch) sd = cleanUrl(redirectMatch[1]);
      }

      // --- STRATEGY 3: OpenGraph & Meta Tags ---
      if (!sd && !hd) {
          const ogVideo = html.match(/property="og:video"\s+content="([^"]+)"/);
          if (ogVideo) sd = cleanUrl(ogVideo[1]);
          
          const ogVideoSecure = html.match(/property="og:video:secure_url"\s+content="([^"]+)"/);
          if (ogVideoSecure && !sd) sd = cleanUrl(ogVideoSecure[1]);
      }

      // --- STRATEGY 4: Twitter Player (often unencrypted) ---
      if (!sd && !hd) {
          const twStream = html.match(/name="twitter:player:stream"\s+content="([^"]+)"/);
          if (twStream) sd = cleanUrl(twStream[1]);
      }

      // --- STRATEGY 5: Brute Force Scan for MP4 ---
      // Sometimes URLs are just sitting in the JS as literals
      if (!sd && !hd) {
          // Look for https://...mp4 patterns
          const mp4Matches = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g);
          if (mp4Matches && mp4Matches.length > 0) {
             // Filter for likely valid video CDN links
             const validMp4 = mp4Matches.find((m: string) => 
                 (m.includes('fbcdn') || m.includes('video')) && !m.includes('byte-range')
             );
             if (validMp4) sd = cleanUrl(validMp4);
          }
      }

      if (!sd && !hd) throw new Error("No video links found");

      return { sd, hd, thumbnail, title };

  } catch (error) {
      console.error("FB Download Error:", error);
      return { error: "ভিডিওটি লোড করা যায়নি। এটি প্রাইভেট হতে পারে অথবা লিংকটি ভুল।" };
  }
}
