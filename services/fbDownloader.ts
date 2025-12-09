
export interface FbVideoResponse {
  sd?: string;
  hd?: string;
  thumbnail?: string;
  title?: string;
  error?: string;
}

export async function getFacebookVideo(url: string): Promise<FbVideoResponse> {
  if (!url) return { error: "Please provide a valid Facebook video URL" };

  // Improved cleaning function using JSON parse for accurate unescaping
  const cleanUrl = (raw: string) => {
    if (!raw) return undefined;
    try {
      // 1. Try treating it as a JSON string content (handles \u0026, \/, etc. natively)
      // We assume raw is the content INSIDE the quotes from the regex capture
      let res = JSON.parse(`"${raw}"`);
      
      // 2. Decode URI components
      res = decodeURIComponent(res);
      
      // 3. HTML Entity decoding (common in mbasic)
      res = res.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      
      if (res.startsWith('http')) return res;
      return undefined;
    } catch (e) {
      // Fallback manual cleaning
      try {
        let res = raw.replace(/\\u0026/g, '&').replace(/\\u003d/g, '=').replace(/\\u0025/g, '%');
        res = res.replace(/\\/g, ''); 
        res = decodeURIComponent(res);
        if (res.startsWith('http')) return res;
      } catch (e2) {}
      return undefined;
    }
  };

  // Expanded Proxy List
  const getProxifiedUrls = (targetUrl: string) => [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  ];

  let targetUrls: string[] = [];
  
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
      // Create variants
      const wwwUrl = url.replace(/(mbasic|m|web)\.facebook\.com/, 'www.facebook.com');
      const mbasicUrl = url.replace(/(www|web|m)\.facebook\.com/, 'mbasic.facebook.com');
      targetUrls.push(wwwUrl);
      targetUrls.push(mbasicUrl);
  } else {
      targetUrls = [url];
  }

  const requestPromises: Promise<string>[] = [];

  targetUrls.forEach(tUrl => {
      getProxifiedUrls(tUrl).forEach(pUrl => {
          requestPromises.push(
              fetch(pUrl, { 
                  headers: { 
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  } 
              })
              .then(res => {
                  if (!res.ok) throw new Error(`Status ${res.status}`);
                  return res.text();
              })
              .then(text => {
                   if(text.length < 500) throw new Error('Response too short');
                   // Ignore obvious login pages unless they contain open graph video tags (public info)
                   if((text.includes('login_form') || text.includes('Log In to Facebook')) && !text.includes('og:video')) {
                       throw new Error('Login required');
                   }
                   return text;
              })
          );
      });
  });

  try {
      const html = await (Promise as any).any(requestPromises);

      let sd = undefined;
      let hd = undefined;
      let thumbnail = undefined;
      let title = "Facebook Video";

      // --- Metadata Extraction ---
      const thumbMatch = html.match(/property="og:image"\s+content="([^"]+)"/) || 
                         html.match(/"thumbnailUrl"\s*:\s*"([^"]+)"/) ||
                         html.match(/class="[^"]*img[^"]*"\s+src="([^"]+)"/);
      if (thumbMatch) thumbnail = cleanUrl(thumbMatch[1]);

      const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) || 
                         html.match(/<title>(.*?)<\/title>/);
      if (titleMatch) title = titleMatch[1].replace(' | Facebook', '');

      // --- STRATEGY: Regex Parsing ---
      // We look for keys in JSON blobs. 
      // Note: [^"]+ captures until the next quote.
      
      const patterns = {
          hd: [
              /"browser_native_hd_url"\s*:\s*"([^"]+)"/,
              /"playable_url_quality_hd"\s*:\s*"([^"]+)"/,
              /"hd_src"\s*:\s*"([^"]+)"/,
              /"hd_src_no_ratelimit"\s*:\s*"([^"]+)"/,
              /hd_src:"([^"]+)"/,
              /"video_hd_url"\s*:\s*"([^"]+)"/
          ],
          sd: [
              /"browser_native_sd_url"\s*:\s*"([^"]+)"/,
              /"playable_url"\s*:\s*"([^"]+)"/,
              /"sd_src"\s*:\s*"([^"]+)"/,
              /"sd_src_no_ratelimit"\s*:\s*"([^"]+)"/,
              /sd_src:"([^"]+)"/,
              /"video_src"\s*:\s*"([^"]+)"/,
              /"video_actual_url"\s*:\s*"([^"]+)"/,
              /"base_url"\s*:\s*"([^"]+)"/ // DASH manifest base url often works
          ]
      };

      for (const pattern of patterns.hd) {
          const match = html.match(pattern);
          if (match && match[1]) {
              const url = cleanUrl(match[1]);
              if (url) { hd = url; break; }
          }
      }

      for (const pattern of patterns.sd) {
          const match = html.match(pattern);
          if (match && match[1]) {
               const url = cleanUrl(match[1]);
               if (url) { sd = url; break; }
          }
      }

      // --- STRATEGY: Open Graph Fallback ---
      if (!sd && !hd) {
          const ogVideo = html.match(/property="og:video"\s+content="([^"]+)"/);
          if (ogVideo) sd = cleanUrl(ogVideo[1]);
          
          const ogVideoSecure = html.match(/property="og:video:secure_url"\s+content="([^"]+)"/);
          if (ogVideoSecure && !sd) sd = cleanUrl(ogVideoSecure[1]);
      }

      // --- STRATEGY: Mbasic Redirect/DataStore ---
      if (!sd && !hd) {
          const redirectMatch = html.match(/href\s*=\s*["']\/video_redirect\/\?src=([^"']+)["']/);
          if (redirectMatch) {
              sd = cleanUrl(decodeURIComponent(redirectMatch[1]));
          }
          
          if (!sd) {
             const dataStoreRegex = /data-store\s*=\s*["']([^"']+)["']/g;
             let match;
             while ((match = dataStoreRegex.exec(html)) !== null) {
                try {
                   // mbasic often uses HTML entities inside the attribute
                   let jsonStr = match[1].replace(/&quot;/g, '"');
                   const json = JSON.parse(jsonStr);
                   if (json.src) {
                      sd = cleanUrl(json.src);
                      break;
                   }
                   if (json.native_src) {
                      sd = cleanUrl(json.native_src);
                      break;
                   }
                } catch(e) {}
             }
          }
      }

      // --- STRATEGY: Broad MP4 Scan (Last Resort) ---
      if (!sd && !hd) {
          // Matches strings starting with http/https, containing .mp4, and ending before a quote or whitespace
          // FB CDN urls usually have .mp4? or .mp4&
          const looseMatches = html.match(/https?:\/\/[^"'\s]+\.fbcdn\.net[^"'\s]+\.mp4[^"'\s]*/g);
          
          if (looseMatches && looseMatches.length > 0) {
              // Usually the longest URL is the most complete one with tokens
              const candidate = looseMatches.reduce((a, b) => a.length > b.length ? a : b);
              const validLink = cleanUrl(candidate);
              if (validLink) sd = validLink;
          }
      }

      if (!sd && !hd) throw new Error("No video links found");

      return { sd, hd, thumbnail, title };

  } catch (error) {
      console.error("FB Download Error:", error);
      return { error: "ভিডিওটি পাওয়া যায়নি। লিংকটি পাবলিক (Public) কি না চেক করুন অথবা ভিডিওটি প্রাইভেট হতে পারে।" };
  }
}
