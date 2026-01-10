
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig, ContentLanguage } from "./types";

// --- MODEL CONFIGURATION ---
// Following the provided guidelines for model selection based on task type.
const TEXT_MODEL = 'gemini-3-flash-preview'; // Basic/Complex Text
const IMAGE_MODEL_FLASH = 'gemini-2.5-flash-image'; // General Image Generation
const IMAGE_MODEL_PRO = 'gemini-3-pro-image-preview'; // High-Quality Image Generation

/**
 * Generates text content (posts, comments, etc.) in Bengali or English.
 */
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
  
  // Rule: API key must be obtained exclusively from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key খুঁজে পাওয়া যায়নি। দয়া করে Vercel Settings-এ 'API_KEY' সেট করুন।");
  }

  // Rule: Create instance right before making an API call
  const ai = new GoogleGenAI({ apiKey });

  const targetLanguage = language === ContentLanguage.ENGLISH ? "English" : "Bengali (Bangla script)";
  
  const systemInstruction = `
    You are a witty, culturally aware social media expert and creative writer for the Bangladesh audience. 
    Generate engaging, relevant content in ${targetLanguage}.
    
    Content Types & Styles:
    1. Posts/Captions: Engaging, varied length, use emojis.
    2. Comments: Contextual, reply-oriented, natural slang.
    3. Bios/Status: Short, stylish.
    4. Legal/Formal: Use proper formal terminology in Bengali.
    5. OCR/Text Extraction: Extract text exactly as is.
    6. FB Video: Optimized for viral reach, SEO friendly metadata.
    
    Guidelines:
    - If Language is Bengali, use authentic informal Bengali for social media.
    - For Legal/Official/Applications, use STRICT FORMAL Bengali.
    - ALWAYS output JSON with a property "options" containing an array of strings.
  `;

  let prompt = `
    Generate 3 distinct options for a ${type} in ${targetLanguage}.
    Category: ${category}
    Context: ${context || 'General'}
    ${party ? `Targeting: ${party}` : ''}
    ${tone ? `Tone: ${tone}` : ''}
    ${userInstruction ? `User specific instruction: ${userInstruction}` : ''}
    
    Return a JSON object with a single property 'options' which is an array of strings.
  `;

  if (type === ContentType.IMG_TO_TEXT) {
      prompt = `
      Act as a highly accurate OCR tool.
      Analyze the attached image(s) and extract ALL visible text.
      Identify both English and Bengali text if present.
      Return a JSON object with property "options" containing an array with ONE string: the full extracted text.
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

    // Rule: Use response.text property (not a method)
    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    const parsed = JSON.parse(jsonText);
    return parsed.options || [];

  } catch (e: any) {
    console.error(`Text Gen Failed:`, e);
    // Explicit 403 handling
    if (e.message?.includes("403") || e.message?.includes("permission")) {
      throw new Error("API Key Permission Denied (403). আপনার কি-টি Gemini API ব্যবহারের জন্য এনাবেল করা আছে কি না নিশ্চিত করুন অথবা একটি পেইড প্রজেক্ট কি ব্যবহার করুন।");
    }
    throw e;
  }
};

/**
 * Image generation and editing.
 */
export const generateImage = async (
  type: ContentType,
  category: string,
  promptText: string,
  aspectRatio: string = "1:1",
  inputImages?: string[],
  passportConfig?: PassportConfig,
  overlayText?: string
): Promise<string[]> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key খুঁজে পাওয়া যায়নি।");
  }

  const ai = new GoogleGenAI({ apiKey });

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
         fullPrompt = `You are a professional passport photo expert. Maintain the face identity 100%. Background: ${passportConfig.bg}. Clothing: Formal. Sharp and clear studio lighting.`;
      } else {
         fullPrompt = `${promptText || 'Enhance this image'}. Focus on quality and the style of ${category}.`;
      }
      parts.push({ text: fullPrompt });
  } else {
      let prompt = `A professional ${category} design for: ${promptText}. Aesthetic, professional lighting.`;
      parts.push({ text: prompt });
  }

  try {
    const response = await ai.models.generateContent({
         model: modelToUse, 
         contents: { parts: parts },
         config: { 
            imageConfig: { 
              aspectRatio: (aspectRatio || "1:1") as any,
              imageSize: isHighQualityTask ? "2K" : "1K" // Upgrade to 2K if pro
            }
         },
     });

     const images: string[] = [];
     if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
          }
        }
     }

     if (images.length === 0) {
        throw new Error("ইমেজ তৈরি করা সম্ভব হয়নি। দয়া করে প্রম্পটটি পুনরায় চেক করুন।");
     }

     return images;
  } catch (e: any) {
    console.error(`Image Gen Failed:`, e);
    if (e.message?.includes("403") || e.message?.includes("permission")) {
        throw new Error("ইমেজ তৈরির অনুমতি নেই (403)। Gemini 3 Pro Image মডেল ব্যবহারের জন্য একটি পেইড প্রোজেক্ট কি (Paid Project Key) সিলেক্ট করুন।");
    }
    throw e;
  }
};
