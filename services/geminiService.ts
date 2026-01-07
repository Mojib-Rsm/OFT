
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig, ContentLanguage } from "../types";

// --- MODEL CONFIGURATION ---
const TEXT_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL_FLASH = 'gemini-2.5-flash-image';
const IMAGE_MODEL_PRO = 'gemini-3-pro-image-preview';

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
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      Identify both English and Bengali text if present.
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
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: { parts: contents },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["options"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
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
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const finalAspectRatio = passportConfig ? "3:4" : aspectRatio; 
  const isDocEnhancer = type === ContentType.DOC_ENHANCER;
  
  const isHighQualityTask = [
    ContentType.PASSPORT, 
    ContentType.PHOTO_ENHANCER, 
    ContentType.LOGO, 
    ContentType.DOC_ENHANCER
  ].includes(type);
  
  const modelToUse = isHighQualityTask ? IMAGE_MODEL_PRO : IMAGE_MODEL_FLASH;

  const parts: any[] = [];

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
           ? 'Maintain original clothing but enhance for a professional look.' 
           : `Transform clothing into ${getDressDescription(passportConfig.dress, passportConfig.coupleDress)}.`;
         const bgInstruction = passportConfig.bg.includes('অফিস') 
           ? 'Set background to a blurred high-end office interior.' 
           : `Set background to a solid clean ${passportConfig.bg.split(' ')[0]} color.`;

         fullPrompt = `You are a professional passport photo studio expert.
         Task: Generate a perfect passport-ready photo from the input.
         1. FACE: Maintain 100% facial identity. Sharpen features slightly.
         2. CLOTHING: ${dressInstruction}
         3. BACKGROUND: ${bgInstruction}
         4. ALIGNMENT: Ensure subject is perfectly centered and upright.
         5. STYLE: Studio lighting, clear and official.`;
      } else if (isDocEnhancer) {
         fullPrompt = `Clean this document image. Remove shadows, background patterns, and creases. Make the background pure white and the text solid black or its original color but sharper. Ensure 100% legibility.`;
      } else if (type === ContentType.PHOTO_ENHANCER) {
         if (category.includes('Upscale')) fullPrompt = `Increase resolution and details. Sharpen blurry areas and remove noise/artifacts.`;
         else if (category.includes('Restore')) fullPrompt = `Repair this damaged photo. Fix cracks, scratches, and stains. Restore faded colors or clarify B&W details.`;
         else if (category.includes('Colorize')) fullPrompt = `Add natural, realistic colors to this black and white photo.`;
         else if (category.includes('Face')) fullPrompt = `Focus on enhancing facial details. Clarify eyes, skin texture, and hair while maintaining true identity.`;
         else fullPrompt = `General enhancement: improve lighting, contrast, and overall clarity.`;
      } else {
         fullPrompt = `${promptText || 'Edit this image'}. Style: ${category}. Enhance overall quality.`;
      }
      parts.push({ text: fullPrompt });
  } else {
      let prompt = `Generate a high-quality professional ${category} image. Subject: ${promptText || 'Creative artwork'}.`;
      
      if (type === ContentType.VISITING_CARD) {
          prompt = `Design a high-end professional Business Card. Theme: ${category}. Details to include: ${promptText}. Minimalist, elegant, high-resolution layout.`;
      } else if (type === ContentType.BANNER) {
          prompt = `Create a visually striking banner/poster. Theme: ${category}. Content: ${promptText}. Dynamic composition, bold visual appeal.`;
      } else if (type === ContentType.INVITATION) {
          prompt = `Design an exquisite invitation card. Occasion: ${category}. Details: ${promptText}. Decorative, high-quality textures.`;
      } else if (type === ContentType.LOGO) {
          prompt = `Design a modern, unique logo. Concept: ${category}. Branding details: ${promptText}. Vector style, clean lines, scalable design.`;
      }

      parts.push({ text: prompt });
  }

  try {
    const response = await ai.models.generateContent({
         model: modelToUse, 
         contents: { parts: parts },
         config: { 
            imageConfig: { 
              aspectRatio: (finalAspectRatio || "1:1") as any,
              imageSize: isHighQualityTask ? "1K" : undefined
            }
         },
     });

     if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error("No image candidates returned from API.");
     }

     const firstCandidate = response.candidates[0];

     if (firstCandidate.finishReason === 'SAFETY') {
        throw new Error("আপনার অনুরোধটি এআই সেফটি ফিল্টারের কারণে বাতিল করা হয়েছে। দয়া করে ভিন্নভাবে চেষ্টা করুন।");
     }

     if (!firstCandidate.content || !firstCandidate.content.parts) {
        throw new Error("API returned an empty content structure.");
     }

     const images: string[] = [];
     for (const part of firstCandidate.content.parts) {
       if (part.inlineData) {
         images.push(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
       }
     }

     if (images.length === 0) {
       // If no image part but there is text, maybe it's an error message from the model
       const textMsg = firstCandidate.content.parts.find(p => p.text)?.text;
       throw new Error(textMsg || "এআই কোনো ইমেজ তৈরি করতে পারেনি। দয়া করে প্রম্পট পরিবর্তন করে চেষ্টা করুন।");
     }

     return images;
  } catch (e: any) {
    console.error(`Image Gen Failed:`, e);
    // Rethrow with a cleaner message if it's a known error
    if (e.message?.includes("Safety")) throw e;
    throw new Error(e.message || "ইমেজ জেনারেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
  }
};
