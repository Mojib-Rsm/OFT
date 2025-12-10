
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig, ContentLanguage } from "../types";

// --- HELPERS ---

const getEnvVar = (key: string): string => {
  // Vite / Client-side
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Node / Server-side fallback
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return "";
};

const getApiKey = (): string => {
  // Strictly prioritize VITE_ prefix for client-side security and visibility
  const key = getEnvVar("VITE_GEMINI_API_KEY") || getEnvVar("VITE_API_KEY") || getEnvVar("GEMINI_API_KEY") || "";
  
  if (!key) {
    console.warn("API Key is missing! Make sure you have VITE_GEMINI_API_KEY in your .env file.");
  } else {
    // Log masked key for debugging assurance (e.g. "AIza...5f8a")
    console.log(`API Key loaded: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
  }
  return key;
};

// --- MODEL CONFIGURATION ---

// Text Model: gemini-2.5-flash is fast, reliable, and multimodal.
const TEXT_MODEL = 'gemini-2.5-flash';

// Image Model: gemini-2.5-flash-image is the default generation model.
const IMAGE_MODEL = 'gemini-2.5-flash-image';


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
  
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing. Ensure 'VITE_GEMINI_API_KEY' is set in your .env file.");
  
  const ai = new GoogleGenAI({ apiKey });

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

  try {
    console.log(`Generating text with ${TEXT_MODEL}...`);
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
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

  } catch (e: any) {
    console.error(`Text Gen Failed:`, e);
    throw e;
  }
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
  
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing. Ensure 'VITE_GEMINI_API_KEY' is set in your .env file.");

  const ai = new GoogleGenAI({ apiKey });

  const finalAspectRatio = passportConfig ? "3:4" : aspectRatio; 
  const isDocEnhancer = type === ContentType.DOC_ENHANCER;
  
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
      } else if (type === ContentType.PHOTO_ENHANCER) {
         if (category.includes('Upscale')) fullPrompt = `Act as a High-End Photo Enhancer. Upscale this image to 4K resolution, sharpen details, and reduce noise. Return ONLY the image.`;
         else if (category.includes('Restore')) fullPrompt = `Act as a Photo Restoration Expert. Restore this old/damaged photo. Fix scratches, tears, and fade. Return ONLY the image.`;
         else if (category.includes('Colorize')) fullPrompt = `Act as a Colorization Expert. Colorize this black and white photo naturally. Return ONLY the image.`;
         else if (category.includes('Face')) fullPrompt = `Act as a Portrait Enhancer. Fix blurry faces, improve skin texture, and sharpen eyes while keeping identity. Return ONLY the image.`;
         else fullPrompt = `Enhance this photo. Improve lighting, sharpness, and clarity. Return ONLY the image.`;
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

  try {
    console.log(`Generating image with ${IMAGE_MODEL}...`);
    const response = await ai.models.generateContent({
         model: IMAGE_MODEL, 
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
     throw new Error("No image output returned from API.");

  } catch (e: any) {
     console.error(`Image Gen Failed:`, e);
     throw e; 
  }
};
