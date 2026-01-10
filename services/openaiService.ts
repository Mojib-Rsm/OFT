
import { ContentType, ContentLanguage } from "../types";

// Helper to get OpenAI key with fallbacks for different environments
const getOpenAiKey = () => {
  // Use a broad search to ensure we catch the variable from Vercel or local env
  return (
    process.env.OPENAI_API_KEY || 
    (import.meta as any).env?.OPENAI_API_KEY || 
    (import.meta as any).env?.VITE_OPENAI_API_KEY ||
    (window as any).process?.env?.OPENAI_API_KEY
  );
};

export const generateOpenAIContent = async (
  type: ContentType,
  category: string,
  context: string,
  tone?: string,
  length?: string,
  party?: string,
  userInstruction?: string,
  language: string = ContentLanguage.BANGLA
): Promise<string[]> => {
  const apiKey = getOpenAiKey();
  if (!apiKey) {
    throw new Error("OpenAI API Key খুঁজে পাওয়া যায়নি। Vercel-এ 'OPENAI_API_KEY' ভেরিয়েবলটি সেট করে 'Redeploy' করুন।");
  }

  const targetLanguage = language === ContentLanguage.ENGLISH ? "English" : "Bengali (Bangla script)";
  
  const systemPrompt = `You are a witty, culturally aware social media expert and creative writer for the Bangladesh audience.
Generate engaging, relevant content in ${targetLanguage}.
For social media, use an authentic informal style. For legal/formal applications, use professional formal terminology.
STRICTLY output JSON with a property "options" containing an array of 3 distinct strings.`;

  const userPrompt = `Generate 3 distinct options for a ${type}.
Category: ${category}
Context: ${context || 'General'}
${party ? `Party: ${party}` : ''}
${tone ? `Tone: ${tone}` : ''}
${userInstruction ? `Instruction: ${userInstruction}` : ''}
Return JSON with property "options".`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "OpenAI API Error");
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return content.options || [];
  } catch (error: any) {
    console.error("OpenAI Text Gen Failed:", error);
    if (error.message?.includes("401") || error.message?.includes("invalid_api_key")) {
      throw new Error("OpenAI API Key-টি ভুল বা কাজ করছে না। দয়া করে নতুন কী ব্যবহার করুন।");
    }
    throw error;
  }
};

export const generateOpenAIImage = async (
  promptText: string,
  aspectRatio: string = "1:1"
): Promise<string[]> => {
  const apiKey = getOpenAiKey();
  if (!apiKey) {
    throw new Error("OpenAI API Key খুঁজে পাওয়া যায়নি।");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: promptText,
        n: 1,
        size: aspectRatio === "1:1" ? "1024x1024" : (aspectRatio === "16:9" ? "1024x1792" : "1792x1024"),
        quality: "standard"
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "OpenAI Image Error");
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error("OpenAI did not return any image data.");
    }
    return [data.data[0].url];
  } catch (error: any) {
    console.error("OpenAI Image Gen Failed:", error);
    throw new Error(error.message || "ইমেজ জেনারেশন ব্যর্থ হয়েছে।");
  }
};
