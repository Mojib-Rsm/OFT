
import { createWorker } from 'tesseract.js';

export const generateOcrLocal = async (images: string[]): Promise<string[]> => {
  if (!images || images.length === 0) throw new Error("No images provided for OCR");

  const results: string[] = [];
  
  // Initialize worker for English + Bengali
  const worker = await createWorker('eng+ben');

  try {
    for (const image of images) {
      const { data: { text } } = await worker.recognize(image);
      results.push(text);
    }
    
    await worker.terminate();
    
    // Concatenate all results or return them individually
    // For this app's UI, we return them as an array of options
    return [results.join('\n\n--- Page Break ---\n\n')];
  } catch (error) {
    console.error("Local OCR Failed:", error);
    await worker.terminate();
    throw error;
  }
};
