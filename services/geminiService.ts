import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig, ContentLanguage } from "../types";

// --- ENVIRONMENT VARIABLE HANDLING ---

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return "";
};

const envGeminiKeys = getEnvVar("VITE_GEMINI_API_KEYS") || getEnvVar("GEMINI_API_KEYS") || "";
const singleGeminiKey = getEnvVar("VITE_API_KEY") || getEnvVar("API_KEY");

// Clean and filter keys
const API_KEYS = [
  ...envGeminiKeys.split(',').map(k => k.trim()),
  singleGeminiKey ? singleGeminiKey.trim() : ""
].filter((key, index, self) => !!key && key.length > 10 && self.indexOf(key) === index);

console.log(`Loaded ${API_KEYS.length} API Keys for rotation.`);

// Safety Settings
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
];

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to extract wait time from error message
const parseRetryAfter = (errorMessage: string): number => {
  // Pattern 1: "retry in 30.900s" or "retry in 2.3s"
  const matchIn = errorMessage.match(/retry in (\d+(\.\d+)?)s/i);
  if (matchIn && matchIn[1]) {
    return Math.ceil(parseFloat(matchIn[1]) * 1000);
  }

  // Pattern 2: "retryDelay": "30s" (sometimes in JSON details)
  const matchJson = errorMessage.match(/"retryDelay"\s*:\s*"(\d+(\.\d+)?)s"/);
  if (matchJson && matchJson[1]) {
    return Math.ceil(parseFloat(matchJson[1]) * 1000);
  }

  return 0;
};

// Helper function to execute API calls with rotation/failover logic for Gemini
const makeGeminiRequest = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  if (API_KEYS.length === 0) {
    throw new Error("Gemini API Key is missing. Please check your .env file.");
  }

  let lastError: any = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i];
    const ai = new GoogleGenAI({ apiKey });
    
    // Retry logic per key
    const maxRetries = 2; 
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(ai);
      } catch (error: any) {
        lastError = error;
        
        const msg = (error.message || JSON.stringify(error)).toLowerCase();
        
        // --- CRITICAL ERROR CHECKS ---

        // 1. Invalid/Leaked Key (403)
        const isForbidden = msg.includes('403') || msg.includes('permission_denied') || msg.includes('leaked') || msg.includes('api key not valid');
        if (isForbidden) {
            console.error(`Key ...${apiKey.slice(-4)} is INVALID/LEAKED. Skipping immediately.`);
            break; 
        }

        // 2. Rate Limits (429) / Quota
        const isQuota = msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
        const isCompositeQuota = msg.includes('editing failed') && isQuota;
        
        // 3. Daily Limit Hard Stop
        const isDailyLimit = msg.includes('generaterequestsperday');
        if (isDailyLimit) {
            console.warn(`Key ...${apiKey.slice(-4)} hit DAILY limit. Switching key.`);
            break; 
        }

        // --- ROTATION STRATEGY ---

        // If we have multiple keys and hit a rate limit, switch IMMEDIATELY.
        if ((isQuota || isCompositeQuota) && API_KEYS.length > 1) {
             console.warn(`Key ...${apiKey.slice(-4)} hit rate limit. Switching to next key immediately.`);
             break; 
        }

        // Server errors
        const isServer = msg.includes('503') || msg.includes('500') || msg.includes('overloaded');
        
        // If it's not a retryable error type, give up on this key
        if (!isQuota && !isServer && !isCompositeQuota) {
          break;
        }

        if (attempt === maxRetries) {
          console.warn(`Key ...${apiKey.slice(-4)} max retries exhausted.`);
          break;
        }

        // --- DYNAMIC WAIT TIME ---
        let waitTime = 2000; 
        const requiredWait = parseRetryAfter(msg);

        if (requiredWait > 0) {
            // Add buffer
            waitTime = requiredWait + 2000;
            // Cap max wait at 20s for better UX on Paid plans
            if (waitTime > 20000) waitTime = 20000;
        } else if (isQuota || isCompositeQuota) {
            waitTime = 3000 * (attempt + 1);
        }
        
        console.warn(`Key ...${apiKey.slice(-4)} busy (Attempt ${attempt + 1}). Waiting ${Math.round(waitTime/1000)}s...`);
        await delay(waitTime);
      }
    }

    if (i < API_KEYS.length - 1) {
        console.log(`Switching to next API Key...`);
    }
  }

  throw lastError || new Error("All Gemini API keys failed. Please try again later.");
};

// --- MAIN SERVICE FUNCTIONS ---

export const generateBanglaContent = async (
  type: ContentType,
  category: string,
  context: string,
  tone?: string,
  length?: string,
  party?: string,
  userInstruction?: string,
  inputImages?: string[],
  language: string = ContentLanguage.BANGLA
): Promise<string[]> => {
  
  const targetLanguage = language === ContentLanguage.ENGLISH ? "English" : "Bengali (Bangla script)";
  
  const systemInstruction = `
    You are a witty, culturally aware social media expert and creative writer. 
    Your goal is to generate engaging, relevant content in ${targetLanguage}.
    
    Content Types & Styles:
    1. Posts/Captions: Engaging, varied length, use emojis.
    2. Comments: Contextual, reply-oriented, natural slang.
    3. Bios/Status: Short, stylish.
    4. Legal/Formal: Use proper formal terminology (Sadhu/Cholito mix where appropriate).
    5. OCR/Text Extraction: Extract text exactly as is.
    
    Guidelines:
    - If Language is Bengali, use authentic informal Bengali for social, but FORMAL for Legal/Applications.
    - STRICTLY output JSON with a property "options" containing an array of strings.
  `;

  let prompt = `
    Generate 3 distinct options for a ${type} in ${targetLanguage}.
    Category: ${category}
    Context: ${context || 'General'}
    ${party ? `Party: ${party}` : ''}
    ${tone ? `Tone: ${tone}` : ''}
    ${userInstruction ? `Instruction: ${userInstruction}` : ''}
    
    Return a JSON object with a single property 'options' which is an array of strings.
  `;

  if (type === ContentType.IMG_TO_TEXT) {
      prompt = `
      Act as a highly accurate OCR tool.
      Task: Analyze the attached image(s) and extract ALL visible text.
      Return a JSON object with property "options" containing an array with ONE string: the full extracted text.
      `;
  }

  return await makeGeminiRequest(async (ai) => {
    let contents: any[] = [];
    
    if (inputImages && inputImages.length > 0) {
      inputImages.forEach(img => {
         const mimeTypeMatch = img.match(/^data:(.*?);base64,/);
         const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
         const base64Data = img.replace(/^data:(.*?);base64,/, '');
         contents.push({ inlineData: { mimeType, data: base64Data } });
      });
    }
    
    contents.push({ text: prompt });

    const callApi = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
    };

    const isOCR = type === ContentType.IMG_TO_TEXT;
    
    try {
       // Priority 1
       const primaryModel = isOCR ? "gemini-3-pro-preview" : "gemini-2.5-flash";
       console.log(`Trying Primary Model: ${primaryModel}`);
       
       const response = await callApi(primaryModel);
       const jsonText = response.text;
       if (!jsonText) throw new Error(`Empty response from ${primaryModel}`);
       const parsed = JSON.parse(jsonText);
       return parsed.options || [];

    } catch (err: any) {
       console.warn(`Primary model failed: ${err.message}.`);
       const msg = (err.message || "").toLowerCase();
       
       if (msg.includes('403') || msg.includes('permission_denied') || msg.includes('leaked')) throw err; 
       
       // Allow fallback for ANY Quota (429) or Server Error (500)
       try {
          // Priority 2
          const secondaryModel = "gemini-flash-lite-latest";
          console.log(`Trying Secondary Model: ${secondaryModel}`);
          const response = await callApi(secondaryModel);
          const parsed = JSON.parse(response.text || "{}");
          return parsed.options || [];
       } catch (err2: any) {
           throw err2;
       }
    }
  });
};

const getDressDescription = (dressType: string, coupleDress?: string): string => {
  if (dressType.includes('কাপল') || dressType.includes('Couple')) {
     if (coupleDress) {
        if (coupleDress.includes('Original')) return "their original clothing, ensuring it looks neat";
        if (coupleDress.includes('FORMAL')) return "matching formal professional attire";
        if (coupleDress.includes('TRADITIONAL')) return "matching traditional attire";
        if (coupleDress.includes('MATCHING_WHITE')) return "matching white outfits";
     }
     return "matching formal professional attire";
  }
  if (dressType.includes('সুট')) return "a professional dark navy blue business suit with a white shirt";
  if (dressType.includes('সাদা শার্ট')) return "a crisp, clean white formal button-down shirt";
  if (dressType.includes('ব্লেজার')) return "a formal black blazer";
  return "formal official attire suitable for passport photos";
};

// MODIFIED SIGNATURE: Now accepts 'type' (ContentType) as the first argument
export const generateImage = async (
  type: ContentType,
  category: string,
  promptText: string,
  aspectRatio: string = "1:1",
  inputImages?: string[],
  passportConfig?: PassportConfig,
  overlayText?: string
): Promise<string[]> => {
  
  const finalAspectRatio = passportConfig ? "3:4" : aspectRatio; 
  const isDocEnhancer = type === ContentType.DOC_ENHANCER;
  const isEditing = (inputImages && inputImages.length > 0) || isDocEnhancer;

  // SCENARIO 1: EDITING (Image-to-Image)
  if (isEditing && inputImages && inputImages.length > 0) {
      let fullPrompt = "";
      const parts: any[] = [];
      
      inputImages.forEach(img => {
         const mimeTypeMatch = img.match(/^data:(.*?);base64,/);
         const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
         const base64Data = img.replace(/^data:(.*?);base64,/, '');
         parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
      });

      if (passportConfig) {
         const dressInstruction = passportConfig.dress.includes('আসল') 
           ? 'Ensure clothing looks neat.' 
           : `Change outfit to ${getDressDescription(passportConfig.dress, passportConfig.coupleDress)}.`;
         const bgInstruction = passportConfig.bg.includes('অফিস') 
           ? 'Change background to a blurred professional office.' 
           : `Change background to solid ${passportConfig.bg.split(' ')[0]} color.`;

         fullPrompt = `GENERATE a professional passport photo.
         INSTRUCTIONS:
         1. IDENTITY: Keep faces EXACTLY the same.
         2. CLOTHING: ${dressInstruction}
         3. BACKGROUND: ${bgInstruction}
         4. ALIGNMENT: Center subject.
         Return ONLY the image.`;
      } else if (isDocEnhancer) {
         fullPrompt = `Act as a Document Scanner. Enhance this document: Remove shadows, make background white, sharpen text. Return ONLY the image.`;
      } else {
         fullPrompt = `Edit this image. ${promptText}. Style: ${category}. Return ONLY the image.`;
      }
      
      parts.push({ text: fullPrompt });

      return await makeGeminiRequest(async (ai) => {
         const tryModel = async (model: string) => {
             console.log(`Trying Editing Model: ${model}`);
             const config: any = { safetySettings: SAFETY_SETTINGS };
             if (model.includes('image')) {
                config.imageConfig = { aspectRatio: finalAspectRatio };
             }
             
             const response = await ai.models.generateContent({
                 model: model, 
                 contents: { parts: parts },
                 config: config,
             });
             
             const generatedImages: string[] = [];
             if (response.candidates?.[0]?.content?.parts) {
                 for (const part of response.candidates[0].content.parts) {
                   if (part.inlineData) generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                 }
             }
             if (generatedImages.length > 0) return generatedImages;
             throw new Error("No image output.");
         };

         // Attempt models in sequence. 
         try {
             return await tryModel('gemini-2.5-flash-image');
         } catch (e: any) {
             const msg = (e.message || "").toLowerCase();
             
             if (msg.includes('403') || msg.includes('permission_denied') || msg.includes('leaked')) throw e; 
             
             console.warn("gemini-2.5-flash-image failed, trying fallback to Pro...");
             
             try {
                 return await tryModel('gemini-3-pro-image-preview');
             } catch (e2: any) {
                 // Propagate composite error 
                 throw new Error(`Editing Failed. Details: ${e.message} | ${e2.message}`);
             }
         }
      });
  }

  // SCENARIO 2: CREATION (Text-to-Image)
  else {
      let prompt = `Generate a high quality ${category} image. Subject: ${promptText}.`;
      if (overlayText) prompt += " Do NOT write text on the image.";
      
      const geminiFallbackPrompt = `${prompt} \n\nCRITICAL: Return ONLY the generated image.`;

      return await makeGeminiRequest(async (ai) => {
         // Try Imagen first
         try {
             console.log("Trying Imagen: imagen-4.0-fast-generate");
             const response = await ai.models.generateImages({
                 model: 'imagen-4.0-fast-generate', 
                 prompt: prompt,
                 config: { numberOfImages: 1, aspectRatio: finalAspectRatio as any }
             });
             if (response.generatedImages?.length > 0) {
                 return [`data:image/png;base64,${response.generatedImages[0].image.imageBytes}`];
             }
             throw new Error("No images from Imagen.");
         } catch (err: any) {
             const msg = (err.message || "").toLowerCase();
             if (msg.includes('403') || msg.includes('permission_denied')) throw err;
             
             console.warn("Imagen failed, trying Gemini fallback...");
             
             // Fallback to Gemini 2.5 Flash Image
             try {
                  const parts = [{ text: geminiFallbackPrompt }];
                  console.log("Trying Fallback: gemini-2.5-flash-image");
                  const response = await ai.models.generateContent({
                      model: 'gemini-2.5-flash-image', 
                      contents: { parts: parts },
                      config: { 
                         safetySettings: SAFETY_SETTINGS as any,
                         imageConfig: { aspectRatio: finalAspectRatio }
                      },
                  });
                  const generatedImages: string[] = [];
                  if (response.candidates?.[0]?.content?.parts) {
                      for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                      }
                  }
                  if (generatedImages.length > 0) return generatedImages;
                  throw new Error("No images from Gemini fallback.");
             } catch (err2) {
                 throw err2;
             }
         }
      });
  }
};