
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

const API_KEYS = [
  ...envGeminiKeys.split(',').map(k => k.trim()),
  singleGeminiKey
].filter((key, index, self) => !!key && key.length > 0 && self.indexOf(key) === index);

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

// Helper function to execute API calls with rotation/failover logic for Gemini
const makeGeminiRequest = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  if (API_KEYS.length === 0) {
    throw new Error("Gemini API Key is missing. Please check your .env file.");
  }

  let lastError: any = null;

  for (const apiKey of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      return await operation(ai);
    } catch (error: any) {
      console.warn(`Key ...${apiKey.slice(-4)} failed: ${error.message}. Switching key...`);
      lastError = error;
      // If error is 429, wait a bit longer before trying next key
      if (error.message?.includes('429')) await delay(1000);
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
  inputImages?: string[],
  language: string = ContentLanguage.BANGLA
): Promise<string[]> => {
  
  const targetLanguage = language === ContentLanguage.ENGLISH ? "English" : "Bengali (Bangla script)";
  
  const systemInstruction = `
    You are a witty, culturally aware social media expert and creative writer. 
    Your goal is to generate engaging, relevant content in ${targetLanguage}.
    
    Content Types & Styles:
    1. Posts/Captions: Engaging, varied length, use emojis.
    2. Comments: Contextual, reply-oriented, natural slang. If an image/screenshot is provided, analyze it thoroughly.
    3. Bios: Short, stylish, identity-focused.
    4. Stories: Very short, punchy (under 15 words).
    5. Notes: Extremely short thoughts (max 60 characters).
    6. Scripts: Structured video scripts (Title, Hook, Body, Call to Action).
    7. Emails: Professional or formal format.
    8. Ad Copies: Catchy headline, benefit-driven body, strong Call to Action.
    9. Poems: Rhythmic, artistic, stanza-based structure.
    10. PDF Maker: Structured professional documents (Report, Assignment). USE MARKDOWN (bold, newlines).
    11. Image To Text (OCR): Extract text verbatim.
    
    // NEW COMPUTER SHOP TOOLS
    12. Legal Agreement (Stamps): Generate formal legal text suitable for Non-Judicial Stamps. Use standard legal Bengali terminology (হলফনামা, চুক্তিপত্র, অঙ্গীকারনামা). Format clearly with "Member 1", "Member 2", "Terms & Conditions", "Witnesses".
    13. Official Application: Formal application letters to Govt/Bank/Union Parishad. Use proper "To/Subject/Body/Sincerely" format.
    14. CV/Bio-data: 
        - If "Corporate": Professional English Resume structure (Summary, Skills, Exp, Edu).
        - If "Marriage": Traditional Bengali Marriage Bio-data structure (Name, Father/Mother, Address, Edu, Physical, Family Details).

    Guidelines:
    - If Language is Bengali, use authentic informal Bengali for social, but FORMAL SADHU/CHOLITO mix for Legal/Applications as appropriate.
    - For Political Comments: Be persuasive, logical, or critical.
    - STRICTLY output JSON with a property "options" containing an array of strings.
  `;

  let prompt = `
    Generate 5 distinct options for a ${type} in ${targetLanguage} based on the following details:
    - Category: ${category}
    - Context/Topic: ${context || 'General/Random'}
    ${party ? `- Target Political Party/Group: ${party}` : ''}
    ${tone ? `- Tone/Mood: ${tone}` : ''}
    ${length ? `- Desired Length: ${length}` : ''}
    ${userInstruction ? `- Specific User Instruction/Point to include: ${userInstruction}` : ''}
    ${inputImages && inputImages.length > 0 ? `- Attached Image(s): Analyze the visual context.` : ''}
    
    Specific Instructions:
    - If Legal: Create a draft suitable for a 300/1000 TK Stamp. Include placeholders for Names/Dates [.......].
    - If CV_BIO: Create a complete structured format. Use Markdown for bold headings.
    - If Application: Standard formal letter format.
    - If PDF Maker: Create a structured document. Use **Bold** for titles.
    - **CRITICAL:** If "Specific User Instruction" is provided, ensure the generated content specifically mentions that point.
    
    Return a JSON object with a single property 'options' which is an array of strings.
  `;

  if (type === ContentType.IMG_TO_TEXT) {
      prompt = `
      Act as a highly accurate OCR (Optical Character Recognition) tool.
      Task: Analyze the attached image(s) and extract ALL visible text.
      Fix potential spelling errors caused by image noise.
      Maintain original formatting.
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
       // Priority 1: gemini-2.5-flash (User List) OR gemini-3-pro for OCR
       const primaryModel = isOCR ? "gemini-3-pro" : "gemini-2.5-flash";
       console.log(`Trying Primary Model: ${primaryModel}`);
       
       const response = await callApi(primaryModel);
       const jsonText = response.text;
       if (!jsonText) throw new Error(`Empty response from ${primaryModel}`);
       const parsed = JSON.parse(jsonText);
       return parsed.options || [];

    } catch (err: any) {
       console.warn(`Primary model failed: ${err.message}. Waiting 1s...`);
       await delay(1000);

       try {
          // Priority 2: gemini-2.0-flash (User List)
          const secondaryModel = "gemini-2.0-flash";
          console.log(`Trying Secondary Model: ${secondaryModel}`);

          const response = await callApi(secondaryModel);
          const jsonText = response.text;
          if (!jsonText) throw new Error(`Empty response from ${secondaryModel}`);
          const parsed = JSON.parse(jsonText);
          return parsed.options || [];

       } catch (err2: any) {
           console.warn(`Secondary model failed: ${err2.message}. Waiting 2s...`);
           await delay(2000);

           try {
               // Priority 3: gemini-3-pro (User List - Strongest)
               const tertiaryModel = "gemini-3-pro";
               console.log(`Trying Tertiary Model: ${tertiaryModel}`);

               const response = await callApi(tertiaryModel);
               const jsonText = response.text;
               if (!jsonText) throw new Error(`Empty response from ${tertiaryModel}`);
               const parsed = JSON.parse(jsonText);
               return parsed.options || [];
           } catch (err3: any) {
               console.error("All text models failed.");
               throw err3;
           }
       }
    }
  });
};

const getDressDescription = (dressType: string, coupleDress?: string): string => {
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
  inputImages?: string[],
  passportConfig?: PassportConfig,
  overlayText?: string
): Promise<string[]> => {
  
  const finalAspectRatio = passportConfig ? "3:4" : aspectRatio; 
  const isDocEnhancer = category.includes('ডকুমেন্ট') || category.includes('DOC_ENHANCER') || category.includes('স্ক্যান');
  const isEditing = (inputImages && inputImages.length > 0) || isDocEnhancer;

  // SCENARIO 1: EDITING (Passport, Bg Remove, Doc Enhancer)
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

         const isCouple = passportConfig.dress.includes('Couple') || passportConfig.dress.includes('কাপল');
         let identityInstruction = isCouple ? 'faces of the people' : 'face';
         if (isCouple && inputImages.length > 1) {
            identityInstruction = "faces of the people from the provided source images (Combine them if needed)";
         }

         fullPrompt = `GENERATE a professional passport photo.
         INSTRUCTIONS:
         1. IDENTITY: Keep ${identityInstruction} EXACTLY the same.
         2. CLOTHING: ${dressInstruction}
         3. BACKGROUND: ${bgInstruction}
         4. ALIGNMENT: Center ${isCouple ? 'heads' : 'head'}.
         ${passportConfig.country.includes('BD') ? 'Format: Bangladesh Passport standard.' : ''}
         ${inputImages.length > 1 ? 'MERGE the subjects into a single frame.' : ''}
         Return ONLY the image.`;
      } else if (isDocEnhancer) {
         fullPrompt = `
           Act as a professional Document Scanner and Restoration AI.
           Task: Enhance this document image for printing.
           1. BACKGROUND: Remove shadows, wrinkles, and dark spots. Make background pure clean WHITE.
           2. TEXT: Sharpen the text. If it is black and white, make text high-contrast BLACK. If colored, keep colors vivid.
           3. ALIGNMENT: Straighten the document if it is skewed (Perspective Correction).
           4. OUTPUT: A high-quality, printable scanned version of the input.
           ${promptText ? `Additional Instruction: ${promptText}` : ''}
           Return ONLY the enhanced image.
         `;
      } else {
         fullPrompt = `Edit this image. ${promptText}. Style: ${category}. Return ONLY the image.`;
      }
      
      parts.push({ text: fullPrompt });

      return await makeGeminiRequest(async (ai) => {
         const errorLog: string[] = [];
         
         const tryModel = async (model: string) => {
             console.log(`Trying Editing Model: ${model}`);
             try {
                const response = await ai.models.generateContent({
                    model: model, 
                    contents: { parts: parts },
                    config: { safetySettings: SAFETY_SETTINGS as any },
                });
                
                const generatedImages: string[] = [];
                let textOutput = "";

                if (response.candidates?.[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    else if (part.text) textOutput += part.text;
                    }
                }
                if (generatedImages.length > 0) return generatedImages;
                throw new Error(textOutput || "No image output.");
             } catch (e: any) {
                errorLog.push(`${model}: ${e.message}`);
                throw e;
             }
         };

         try {
             // Priority 1: gemini-2.5-flash-preview-image (User Requested)
             return await tryModel('gemini-2.5-flash-preview-image');
         } catch (e) {
             console.warn("Editing model 1 failed, trying fallback...");
             await delay(1000);
             try {
                 // Priority 2: gemini-2.0-flash (Stable fallback)
                 return await tryModel('gemini-2.0-flash');
             } catch (e2) {
                 await delay(1000);
                 try {
                     // Final attempt: gemini-3-pro (If available and needed for complex edits)
                     return await tryModel('gemini-3-pro');
                 } catch (e3) {
                     throw new Error(`Editing Failed. Details: ${errorLog.join(' | ')}`);
                 }
             }
         }
      });
  }

  // SCENARIO 2: CREATION (Text to Image)
  else {
      let prompt = `Generate a high quality ${category} image. Subject: ${promptText}.`;
      if (overlayText) prompt += " Do NOT write text on the image.";

      return await makeGeminiRequest(async (ai) => {
         const errorLog: string[] = [];

         try {
             // Priority 1: imagen-4.0-fast-generate (User Requested)
             console.log("Trying Imagen: imagen-4.0-fast-generate");
             const response = await ai.models.generateImages({
                 model: 'imagen-4.0-fast-generate', 
                 prompt: prompt,
                 config: { numberOfImages: 1, aspectRatio: finalAspectRatio as any }
             });
             
             if (response.generatedImages?.length > 0) {
                 return [`data:image/png;base64,${response.generatedImages[0].image.imageBytes}`];
             }
             throw new Error("Imagen returned no images.");

         } catch (err1: any) {
             errorLog.push(`Imagen Fast: ${err1.message}`);
             console.warn("Imagen Fast failed, trying Standard...", err1.message);
             await delay(1000);
             
             try {
                 // Priority 2: imagen-4.0-generate (User Requested)
                 console.log("Trying Imagen: imagen-4.0-generate");
                 const response = await ai.models.generateImages({
                     model: 'imagen-4.0-generate', 
                     prompt: prompt,
                     config: { numberOfImages: 1, aspectRatio: finalAspectRatio as any }
                 });
                 
                 if (response.generatedImages?.length > 0) {
                     return [`data:image/png;base64,${response.generatedImages[0].image.imageBytes}`];
                 }
                 throw new Error("Imagen Standard returned no images.");
             } catch (err2: any) {
                  errorLog.push(`Imagen Std: ${err2.message}`);
                  console.warn("Imagen Standard failed, trying Gemini Generator...", err2.message);
                  await delay(1000);

                  // Priority 3: gemini-2.0-flash-exp (Fallback for images)
                  try {
                      const parts = [{ text: prompt }];
                      console.log("Trying Fallback: gemini-2.0-flash-exp");
                      const response = await ai.models.generateContent({
                          model: 'gemini-2.0-flash-exp', 
                          contents: { parts: parts },
                          config: { safetySettings: SAFETY_SETTINGS as any },
                      });

                      const generatedImages: string[] = [];
                      if (response.candidates?.[0]?.content?.parts) {
                          for (const part of response.candidates[0].content.parts) {
                            if (part.inlineData) generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                          }
                      }
                      if (generatedImages.length > 0) return generatedImages;
                      throw new Error("Gemini returned no images.");
                  } catch (err3: any) {
                      errorLog.push(`Gemini: ${err3.message}`);
                      throw new Error(`Image Generation Failed. Details: ${errorLog.join(' | ')}`);
                  }
             }
         }
      });
  }
};
