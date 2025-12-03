import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig } from "../types";

// --- ENVIRONMENT VARIABLE HANDLING ---

// Helper to safely get env vars in Vite/Standard environments
const getEnvVar = (key: string): string => {
  // Check import.meta.env (Vite standard)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Check process.env (Node/Compat)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return "";
};

// Load Gemini Keys from .env
// Supports comma-separated list in VITE_GEMINI_API_KEYS for rotation
const envGeminiKeys = getEnvVar("VITE_GEMINI_API_KEYS") || getEnvVar("GEMINI_API_KEYS") || "";
const singleGeminiKey = getEnvVar("VITE_API_KEY") || getEnvVar("API_KEY");

const API_KEYS = [
  ...envGeminiKeys.split(',').map(k => k.trim()),
  singleGeminiKey
].filter((key, index, self) => !!key && key.length > 0 && self.indexOf(key) === index); // Unique & non-empty

// Safety Settings to prevent blocking on harmless edits (like passport photos)
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
];

// Helper function to execute API calls with rotation/failover logic for Gemini
const makeGeminiRequest = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  if (API_KEYS.length === 0) {
    console.error("No Gemini API Keys found in environment variables (.env)");
    throw new Error("Gemini API Key is missing. Please check your .env file.");
  }

  let lastError: any = null;

  for (const apiKey of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      return await operation(ai);
    } catch (error: any) {
      console.warn(`Gemini API Key ending in ...${apiKey.slice(-4)} failed. Trying next key. Reason:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("All Gemini API keys failed.");
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
  inputImages?: string[]
): Promise<string[]> => {
  
  const systemInstruction = `
    You are a witty, culturally aware Bengali social media expert and creative writer. 
    Your goal is to generate engaging, relevant, and human-like content for Facebook/Instagram in Bengali (Bangla script).
    
    Content Types & Styles:
    1. Posts/Captions: Engaging, varied length, use emojis.
    2. Comments: Contextual, reply-oriented, natural slang. If an image/screenshot is provided, analyze it thoroughly (read text, understand visual context) and generate relevant comments.
    3. Bios: Short, stylish, identity-focused. Can use vertical bars (|), bullets, or line breaks.
    4. Stories: Very short, punchy, suitable for text overlay on images (under 15 words).
    5. Notes: Extremely short thoughts (max 60 characters) like Instagram Notes.
    6. Scripts: Structured video scripts (Title, Hook, Body, Call to Action).
    7. Emails: Professional or formal format. Subject line must be included.
    8. Ad Copies: Catchy headline, benefit-driven body, strong Call to Action (CTA).
    9. Poems: Rhythmic, artistic, stanza-based structure.
    10. PDF Maker: Structured professional documents (CV, Report, Application). USE MARKDOWN for formatting: use **bold** for headings/key terms, and use newlines for spacing.
    11. Image To Text (OCR): Act as a precise Optical Character Recognition (OCR) scanner. Extract text verbatim from images. Maintain original paragraphs and lists. Support both Bengali and English in the same document.
    12. Others: Formal or informal messages based on the specific category (SMS, Birthday, etc.).

    Guidelines:
    - Use authentic informal Bengali (colloquial/internet slang mixed with standard Bangla where appropriate).
    - Use relevant emojis to make the content lively.
    - Avoid direct translations; use cultural nuances.
    - For Political Comments: Be persuasive, logical, or critical based on whether it is Support or Oppose. Use strong vocabulary appropriate for political discourse.
    - STRICTLY output JSON with a property "options" containing an array of strings.
  `;

  let prompt = `
    Generate 5 distinct options for a ${type} in Bengali based on the following details:
    - Category: ${category}
    - Context/Topic: ${context || 'General/Random'}
    ${party ? `- Target Political Party/Group: ${party}` : ''}
    ${tone ? `- Tone/Mood: ${tone}` : ''}
    ${length ? `- Desired Length: ${length}` : ''}
    ${userInstruction ? `- Specific User Instruction/Point to include: ${userInstruction}` : ''}
    ${inputImages && inputImages.length > 0 ? `- Attached Image(s): This is a screenshot/image. Read any text visible in it and analyze the visual context to generate relevant comments.` : ''}
    
    Specific Instructions:
    - If Bio: Make them look aesthetic (e.g., using "Official Account | Dreamer" style or poetic lines).
    - If Story/Note: Keep it bite-sized. Notes MUST be very short (under 60 chars).
    - If Script: Provide a structured format (Hook, Scene, Dialogue).
    - If Email: Include "Subject:" at the top, then the body.
    - If Ad Copy: Use "Headline:", "Body:", "CTA:" structure.
    - If Poem: Use artistic rhyming and stanzas.
    - If PDF Maker: Create a structured document. Use **Bold** for titles and important labels. Ensure proper spacing (newlines) between sections.
    - If Advanced Tone is 'Sarcastic', be witty and edgy.
    - If Advanced Tone is 'Professional', use proper standard Bangla (Shuddho).
    - If a Political Party is specified, ensure the content specifically targets that party based on the category (e.g., if category is Support, praise them; if Oppose, criticize them).
    - **CRITICAL:** If "Specific User Instruction" is provided, ensure the generated content specifically mentions or addresses that point, while maintaining the style of the Category.
    - **IMAGE ANALYSIS:** If an image is provided, your generated comments MUST be relevant to the text/content shown in the image.
    
    Return a JSON object with a single property 'options' which is an array of strings.
  `;

  // SPECIAL PROMPT FOR IMAGE TO TEXT (OCR)
  if (type === ContentType.IMG_TO_TEXT) {
      prompt = `
      Act as a highly accurate OCR (Optical Character Recognition) tool for Bengali and English text.
      
      Task:
      1. Analyze the attached image(s) and extract ALL visible text.
      2. Fix any potential spelling errors caused by image noise, especially in complex Bangla conjuncts (যুক্তবর্ণ).
      3. Maintain the original formatting structure (paragraphs, lists, newlines) as closely as possible.
      4. If it's handwritten and hard to read, infer the most logical text based on context.
      5. Do NOT summarize. Provide the full extracted text.
      6. If the image contains a table, try to format it with dashes or spacing.
      
      Output:
      Return a JSON object with property "options" containing an array with ONE string: the full extracted text.
      `;
  }

  // 1. Try Gemini
  try {
    const modelId = type === ContentType.IMG_TO_TEXT ? "gemini-1.5-flash" : "gemini-2.5-flash";
    
    return await makeGeminiRequest(async (ai) => {
      let contents: any[] = [];
      
      if (inputImages && inputImages.length > 0) {
        inputImages.forEach(img => {
           const mimeTypeMatch = img.match(/^data:(.*?);base64,/);
           const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
           const base64Data = img.replace(/^data:(.*?);base64,/, '');
           
           contents.push({
             inlineData: {
               mimeType: mimeType,
               data: base64Data
             }
           });
        });
      }
      
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: modelId,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) return [];

      const parsed = JSON.parse(jsonText);
      return parsed.options || [];
    });

  } catch (geminiError) {
    console.error("Gemini generation failed.", geminiError);
    throw geminiError;
  }
};

// Helper function to map UI dress options to detailed English prompts for the AI
const getDressDescription = (dressType: string, coupleDress?: string): string => {
  // Couple Logic
  if (dressType.includes('কাপল') || dressType.includes('Couple')) {
     if (coupleDress) {
        if (coupleDress.includes('Original') || coupleDress.includes('আসল')) return "their original clothing, ensuring it looks neat, clean and professional";
        if (coupleDress.includes('FORMAL')) return "matching formal professional attire for both persons (dark navy business suit for man, formal black blazer or professional saree for woman)";
        if (coupleDress.includes('TRADITIONAL')) return "matching traditional attire for both persons (punjabi/kurta for man, saree/salwar kameez for woman)";
        if (coupleDress.includes('MATCHING_WHITE')) return "matching white shirts or white outfits for both persons";
        if (coupleDress.includes('CASUAL')) return "smart casual outfits for both persons";
     }
     return "matching formal professional attire for both persons";
  }

  // Single Logic
  if (dressType.includes('সুট')) return "a professional dark navy blue business suit with a white shirt and a silk tie";
  if (dressType.includes('সাদা শার্ট')) return "a crisp, clean white formal button-down shirt";
  if (dressType.includes('ব্লেজার')) return "a formal black blazer worn over a professional blouse";
  if (dressType.includes('মার্জিত')) return "modest, formal traditional or professional attire suitable for official documents";
  if (dressType.includes('ইউনিফর্ম') || dressType.includes('Student')) return "a standard white formal school uniform shirt with a collar";
  
  return "formal official attire suitable for passport photos";
};

export const generateImage = async (
  category: string,
  promptText: string,
  aspectRatio: string = "1:1",
  inputImages?: string[], // Changed to array
  passportConfig?: PassportConfig,
  overlayText?: string
): Promise<string[]> => {
  
  let fullPrompt = "";
  const parts: any[] = [];
  const finalAspectRatio = passportConfig ? "3:4" : aspectRatio; 

  // Logic for different image tools
  if (inputImages && inputImages.length > 0) {
    // EDITING MODE (Passport, BG Remove)
    inputImages.forEach(img => {
       const mimeTypeMatch = img.match(/^data:(.*?);base64,/);
       const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
       const base64Data = img.replace(/^data:(.*?);base64,/, '');
       
       parts.push({
         inlineData: { data: base64Data, mimeType: mimeType }
       });
    });

    if (passportConfig) {
       const dressInstruction = passportConfig.dress.includes('আসল') 
         ? 'Ensure clothing looks neat.' 
         : `Change outfit to ${getDressDescription(passportConfig.dress, passportConfig.coupleDress)}.`;

       const bgInstruction = passportConfig.bg.includes('অফিস') 
         ? 'Change background to a blurred professional office.' 
         : `Change background to solid ${passportConfig.bg.split(' ')[0]} color.`;

       const isCouple = passportConfig.dress.includes('Couple') || passportConfig.dress.includes('কাপল');
       
       let identityInstruction = isCouple ? 'faces of the people' : 'face';
       if (isCouple && inputImages.length > 1) {
          identityInstruction = "faces of the people from the provided source images (Combine them if needed)";
       }

       fullPrompt = `GENERATE a professional passport photo based on the provided image(s).
       STRICT INSTRUCTIONS:
       1. IDENTITY: Keep the ${identityInstruction} exactly the same.
       2. CLOTHING: ${dressInstruction}
       3. BACKGROUND: ${bgInstruction}
       4. LIGHTING: Even studio lighting.
       5. ALIGNMENT: Center ${isCouple ? 'heads' : 'head'}, show shoulders.
       ${passportConfig.country.includes('BD') ? 'Format: Bangladesh Passport standard.' : ''}
       ${inputImages.length > 1 ? 'MERGE/COMPOSE the subjects from the input images into a single professional frame.' : ''}
       `;
    } else if (category.includes('Background') || category.includes('ব্যাকগ্রাউন্ড')) {
       fullPrompt = `Edit this image. ${promptText ? promptText : 'Change the background'}. 
       Style: ${category}. Keep the main subject intact.`;
    } else {
       fullPrompt = `Edit this image based on the following instruction: ${promptText || category}.`;
    }
  } else {
    // GENERATION MODE
    const textOverlayInstruction = overlayText ? "IMPORTANT: Do NOT write any text on the image. Leave negative space or clean areas where text can be added later by the user." : "";

    if (category.includes('Thumbnail') || category.includes('থাম্বনেইল')) {
      fullPrompt = `Create a high CTR YouTube/Facebook thumbnail background.
      Topic: ${promptText}. Style: ${category}.
      Vibrant colors, catchy composition.
      ${textOverlayInstruction}`;
    } else if (category.includes('Logo') || category.includes('লোগো')) {
      fullPrompt = `Design a professional logo.
      Brand/Concept: ${promptText}. Style: ${category}.
      Vector art style, simple, iconic, minimalist, white background.
      ${textOverlayInstruction}`;
    } else {
      fullPrompt = `Generate a high quality ${category} style image. 
      Subject/Description: ${promptText || 'A creative artistic composition'}.
      High resolution, detailed, cinematic lighting.
      ${textOverlayInstruction}`;
    }
  }

  // FORCE IMAGE OUTPUT
  fullPrompt += "\nReturn ONLY the generated image. Do not provide any text description or conversational response.";
  
  parts.push({ text: fullPrompt });

  // 1. Try Gemini Image Generation
  try {
    return await makeGeminiRequest(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: {
          imageConfig: { aspectRatio: finalAspectRatio as any },
          safetySettings: SAFETY_SETTINGS as any // Apply safety settings to prevent blocking valid edits
        },
      });

      const generatedImages: string[] = [];
      let textOutput = "";

      if (response.candidates && response.candidates[0]) {
        // If finishReason is SAFETY, we still check content, but we try to avoid throwing immediately if blocked
        // However, usually blocked means no content.
        if (response.candidates[0].finishReason === 'SAFETY') {
             // We configured BLOCK_NONE, so this should happen less.
             // But if it does, we throw a specific error.
             throw new Error("Generation blocked by safety settings (e.g. face policy). Try a different image or description.");
        }

        if (response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              generatedImages.push(`data:${part.inlineData.mimeType};base64,${base64EncodeString}`);
            } else if (part.text) {
              textOutput += part.text;
            }
          }
        }
      }

      if (generatedImages.length === 0) {
        if (textOutput) throw new Error(`AI Response: ${textOutput.substring(0, 250)}`);
        throw new Error("No image generated by Gemini.");
      }

      return generatedImages;
    });

  } catch (geminiError) {
    console.error("Gemini Image Gen failed.", geminiError);
    throw geminiError;
  }
};