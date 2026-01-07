
import { ContentType, ContentLanguage } from "../types";

const OPENAI_API_KEY = "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";

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
  const targetLanguage = language === ContentLanguage.ENGLISH ? "English" : "Bengali (Bangla script)";
  
  const systemPrompt = `You are a witty, culturally aware social media expert and creative writer.
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
        "Authorization": `Bearer ${OPENAI_API_KEY}`
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
        throw new Error(err.error?.message || "OpenAI Error");
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return content.options || [];
  } catch (error) {
    console.error("OpenAI Text Gen Failed:", error);
    throw error;
  }
};

export const generateOpenAIImage = async (
  promptText: string,
  aspectRatio: string = "1:1"
): Promise<string[]> => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
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
    return [data.data[0].url];
  } catch (error) {
    console.error("OpenAI Image Gen Failed:", error);
    throw error;
  }
};
