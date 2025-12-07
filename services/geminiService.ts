
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig, ContentLanguage } from "../types";

// --- HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return "";
};

const getApiKeys = (): string[] => {
  const envKeys = getEnvVar("VITE_GEMINI_API_KEYS") || getEnvVar("VITE_API_KEY") || getEnvVar("GEMINI_API_KEY") || "";
  return envKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

const API_KEYS = getApiKeys();
if (API_KEYS.length === 0) {
  console.error("No API Keys found in environment variables.");
}

// --- CORE REQUEST HANDLER WITH ROTATION ---

async function makeGeminiRequest<T>(
  action: (ai: GoogleGenAI) => Promise<T>,
  retries = 1
): Promise<T> {
  let lastError: any;

  // Try each key
  for (const apiKey of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      return await action(ai);
    } catch (error: any) {
      lastError = error;
      const msg = error.message || '';
      
      // If error is 429 (Quota) or 500+ (Server), try next key/retry
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('500') || msg.includes('503')) {
        console.warn(`Key failed (${apiKey.slice(0,5)}...), trying next...`);
        await delay(1000);
        continue;
      }
      
      // If 403/404/Safety, often key specific or model specific, try next key just in case
      console.warn(`Error with key: ${msg}. Switching key.`);
      continue;
    }
  }
  throw lastError;
}

// --- MODEL STRATEGIES ---

// Text Generation Strategy: gemini-2.5-flash -> gemini-3-pro-preview
const TEXT_MODELS = ['gemini-2.5-flash', 'gemini-3-pro-preview'];

// Image Creation Strategy: gemini-2.5-flash-image
const IMAGE_CREATE_MODELS = ['gemini-2.5-flash-image'];

// Image Editing Strategy: gemini-2.5-flash-image
const IMAGE_EDIT_MODELS = ['gemini-2.5-flash-image'];


// --- MAIN FUNCTIONS ---

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
    4. Legal/Formal: Use proper formal terminology.
    5. OCR/Text Extraction: Extract text exactly as is.
    6. FB Video: Optimized for viral reach, SEO friendly.
    
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
  
  if (type === ContentType.FB_VIDEO) {
      prompt = `
      Generate high-quality Facebook video metadata for: ${context}.
      Category: ${category}.
      
      Instructions based on Category:
      - If 'Viral Caption': Catchy, engaging, with relevant emojis.
      - If 'SEO Tags': Comma-separated high ranking tags/keywords.
      - If 'Script': A structured short video script.
      - If 'Summary': A concise summary of the topic.
      
      Language: ${targetLanguage}.
      Return JSON with 'options' array.
      `;
  }

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

  // Fallback Loop for Models
  let lastError;
  for (const model of TEXT_MODELS) {
    try {
      return await makeGeminiRequest(async (ai) => {
        console.log(`Generating text with ${model}...`);
        const response = await ai.models.generateContent({
          model: model,
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

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty response");
        const parsed = JSON.parse(jsonText);
        return parsed.options || [];
      });
    } catch (e: any) {
      console.warn(`Model ${model} failed: ${e.message}`);
      lastError = e;
      await delay(1000); // Backoff before next model
    }
  }
  throw lastError || new Error("Failed to generate text with all available models.");
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
  const isCreationMode = (!inputImages || inputImages.length === 0);
  
  // Decide which models to use based on mode
  const MODEL_STRATEGY = isCreationMode ? IMAGE_CREATE_MODELS : IMAGE_EDIT_MODELS;

  const parts: any[] = [];

  // Handle Input Images (Editing Mode)
  if (inputImages && inputImages.length > 0) {
      inputImages.forEach(img => {
         const mimeTypeMatch = img.match(/^data:(.*?);base64,/);
         const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
         const base64Data = img.replace(/^data:(.*?);base64,/, '');
         parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
      });

      let fullPrompt = "";
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
  } else {
      // Creation Mode
      let prompt = `Generate a high quality ${category} image. Subject: ${promptText}.`;
      if (overlayText) prompt += " Do NOT write text on the image.";
      
      // Specific prompts for design tools
      if (type === ContentType.VISITING_CARD) {
          prompt = `Design a professional Business Visiting Card. Style: ${category}. Details: ${promptText}. High resolution, clean typography.`;
      } else if (type === ContentType.BANNER) {
          prompt = `Design a vibrant Banner/Poster. Category: ${category}. Context: ${promptText}. Eye-catching, bold colors.`;
      } else if (type === ContentType.INVITATION) {
          prompt = `Design an elegant Invitation Card. Occasion: ${category}. Details: ${promptText}. Decorative, festive style.`;
      }

      prompt += " \n\nCRITICAL: Return ONLY the generated image.";
      parts.push({ text: prompt });
  }

  let errorLogs = [];

  // Fallback Loop
  for (const model of MODEL_STRATEGY) {
    try {
      return await makeGeminiRequest(async (ai) => {
        console.log(`Generating image with ${model}...`);
        
        const response = await ai.models.generateContent({
             model: model, 
             contents: { parts: parts },
             config: { 
                imageConfig: { aspectRatio: finalAspectRatio }
             },
         });
         
         const generatedImages: string[] = [];
         if (response.candidates?.[0]?.content?.parts) {
             for (const part of response.candidates[0].content.parts) {
               if (part.inlineData) {
                 generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
               }
             }
         }
         
         if (generatedImages.length > 0) return generatedImages;
         throw new Error(`${model} returned no images.`);
      });

    } catch (e: any) {
       console.warn(`Model ${model} failed:`, e.message);
       errorLogs.push(`${model}: ${e.message}`);
       await delay(1000);
    }
  }

  throw new Error(`Image Generation Failed. Details: ${errorLogs.join(' | ')}`);
};
