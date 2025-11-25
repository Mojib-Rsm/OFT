import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, PassportConfig } from "../types";

// API Keys with failover priority
// The system will try the first key, if it fails, it will try the second one, and so on.
const API_KEYS = [
  "AIzaSyBdLjhEyVIxRiEVdeocFgq4rTqt7rX3zTM", // Newest
  "AIzaSyD5ikt2QSwzXvtLEoHbeNkdo-r8Yrr0Dbk", // Old 1
  "AIzaSyCgDRVbh5rLHqfoTi1mT4vrbz05yx4Cm1c", // Old 2
  process.env.API_KEY
].filter((key): key is string => !!key && key.length > 0);

// Helper function to execute API calls with rotation/failover logic
const makeGeminiRequest = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  if (API_KEYS.length === 0) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable or check configuration.");
  }

  let lastError: any = null;

  for (const apiKey of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      return await operation(ai);
    } catch (error: any) {
      console.warn(`API Key ending in ...${apiKey.slice(-4)} failed. Trying next key. Reason:`, error.message);
      lastError = error;
      // Continue to the next key in the loop
      continue;
    }
  }

  // If all keys fail, throw the last error
  throw lastError || new Error("All API keys failed to generate content.");
};

export const generateBanglaContent = async (
  type: ContentType,
  category: string,
  context: string,
  tone?: string,
  length?: string,
  party?: string,
  userInstruction?: string,
  inputImage?: string
): Promise<string[]> => {
  const modelId = "gemini-2.5-flash"; // Fast and capable for text and multimodal generation
  
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
    10. Others: Formal or informal messages based on the specific category (SMS, Birthday, etc.).

    Guidelines:
    - Use authentic informal Bengali (colloquial/internet slang mixed with standard Bangla where appropriate).
    - Use relevant emojis to make the content lively.
    - Avoid direct translations; use cultural nuances.
    - For Political Comments: Be persuasive, logical, or critical based on whether it is Support or Oppose. Use strong vocabulary appropriate for political discourse.
    - STRICTLY output JSON.
  `;

  const prompt = `
    Generate 5 distinct options for a ${type} in Bengali based on the following details:
    - Category: ${category}
    - Context/Topic: ${context || 'General/Random'}
    ${party ? `- Target Political Party/Group: ${party}` : ''}
    ${tone ? `- Tone/Mood: ${tone}` : ''}
    ${length ? `- Desired Length: ${length}` : ''}
    ${userInstruction ? `- Specific User Instruction/Point to include: ${userInstruction}` : ''}
    ${inputImage ? `- Attached Image: This is a screenshot/image. Read any text visible in it and analyze the visual context to generate relevant comments.` : ''}
    
    Specific Instructions:
    - If Bio: Make them look aesthetic (e.g., using "Official Account | Dreamer" style or poetic lines).
    - If Story/Note: Keep it bite-sized. Notes MUST be very short (under 60 chars).
    - If Script: Provide a structured format (Hook, Scene, Dialogue).
    - If Email: Include "Subject:" at the top, then the body.
    - If Ad Copy: Use "Headline:", "Body:", "CTA:" structure.
    - If Poem: Use artistic rhyming and stanzas.
    - If Advanced Tone is 'Sarcastic', be witty and edgy.
    - If Advanced Tone is 'Professional', use proper standard Bangla (Shuddho).
    - If a Political Party is specified, ensure the content specifically targets that party based on the category (e.g., if category is Support, praise them; if Oppose, criticize them).
    - **CRITICAL:** If "Specific User Instruction" is provided, ensure the generated content specifically mentions or addresses that point, while maintaining the style of the Category.
    - **IMAGE ANALYSIS:** If an image is provided, your generated comments MUST be relevant to the text/content shown in the image.
    
    Return a JSON object with a single property 'options' which is an array of strings.
  `;

  return makeGeminiRequest(async (ai) => {
    try {
      let contents: any = prompt;

      // Handle Multimodal Input (Screenshot/Image)
      if (inputImage) {
        const mimeTypeMatch = inputImage.match(/^data:(.*?);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        const base64Data = inputImage.replace(/^data:(.*?);base64,/, '');

        contents = [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ];
      }

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
                items: {
                  type: Type.STRING
                }
              }
            }
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) return [];

      const parsed = JSON.parse(jsonText);
      return parsed.options || [];
    } catch (error) {
      console.error("Error inside generateBanglaContent:", error);
      throw error;
    }
  });
};

// Helper function to map UI dress options to detailed English prompts for the AI
const getDressDescription = (dressType: string): string => {
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
  inputImageBase64?: string,
  passportConfig?: PassportConfig,
  overlayText?: string
): Promise<string[]> => {
  
  let fullPrompt = "";
  const parts: any[] = [];
  // Passport requires portrait ratio generally, handled by UI logic passing "3:4" or similar
  const finalAspectRatio = passportConfig ? "3:4" : aspectRatio; 

  // Logic for different image tools based on whether input image is present or just generation
  if (inputImageBase64) {
    // EDITING MODE (Passport, BG Remove)
    // Extract correct mime type
    const mimeTypeMatch = inputImageBase64.match(/^data:(.*?);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
    const base64Data = inputImageBase64.replace(/^data:(.*?);base64,/, '');
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });

    if (passportConfig) {
       // Advanced Passport Logic with Strong Instruction
       const dressInstruction = passportConfig.dress.includes('আসল') 
         ? 'Ensure clothing looks neat.' 
         : `Change outfit to ${getDressDescription(passportConfig.dress)}.`;

       const bgInstruction = passportConfig.bg.includes('অফিস') 
         ? 'Change background to a blurred professional office.' 
         : `Change background to solid ${passportConfig.bg.split(' ')[0]} color.`;

       fullPrompt = `GENERATE a professional passport photo based on this image.
       
       STRICT INSTRUCTIONS:
       1. IDENTITY: Keep the face exactly the same.
       2. CLOTHING: ${dressInstruction}
       3. BACKGROUND: ${bgInstruction}
       4. LIGHTING: Even studio lighting.
       5. ALIGNMENT: Center head, show shoulders.
       
       ${passportConfig.country.includes('BD') ? 'Format: Bangladesh Passport standard.' : ''}
       `;
    } else if (category.includes('Background') || category.includes('ব্যাকগ্রাউন্ড')) {
       fullPrompt = `Edit this image. ${promptText ? promptText : 'Change the background'}. 
       Style: ${category}. 
       Keep the main subject intact.`;
    } else {
       fullPrompt = `Edit this image based on the following instruction: ${promptText || category}.`;
    }
  } else {
    // GENERATION MODE (Thumbnail, Logo, Standard Image)
    const textOverlayInstruction = overlayText ? "IMPORTANT: Do NOT write any text on the image. Leave negative space or clean areas where text can be added later by the user." : "";

    if (category.includes('Thumbnail') || category.includes('থাম্বনেইল')) {
      fullPrompt = `Create a high CTR YouTube/Facebook thumbnail background.
      Topic: ${promptText}.
      Style: ${category}.
      Vibrant colors, catchy composition.
      ${textOverlayInstruction}`;
    } else if (category.includes('Logo') || category.includes('লোগো')) {
      fullPrompt = `Design a professional logo.
      Brand/Concept: ${promptText}.
      Style: ${category}.
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

  return makeGeminiRequest(async (ai) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts,
        },
        config: {
          imageConfig: {
            aspectRatio: finalAspectRatio as any,
          }
        },
      });

      const generatedImages: string[] = [];
      let textOutput = "";

      // Parse response for image parts or rejection text
      if (response.candidates && response.candidates[0]) {
        // Check for safety block
        if (response.candidates[0].finishReason === 'SAFETY') {
          throw new Error("Generation blocked by safety settings. Please try a different image or prompt.");
        }

        if (response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              const imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
              generatedImages.push(imageUrl);
            } else if (part.text) {
              textOutput += part.text;
            }
          }
        }
      }

      if (generatedImages.length === 0) {
        if (textOutput) {
          console.warn("Model returned text instead of image:", textOutput);
          // If the model talks, we treat it as an error to the user for now
          // unless it specifically says it can't do it.
          throw new Error(`AI Response: ${textOutput.substring(0, 250)}${textOutput.length > 250 ? '...' : ''}`);
        }
        throw new Error("No image generated. The model might have blocked the request.");
      }

      return generatedImages;

    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  });
};