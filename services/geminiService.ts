import { GoogleGenAI, Modality } from "@google/genai";
import { OutputFormat } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const compressImage = async (
  base64ImageData: string,
  mimeType: string,
  outputFormat: OutputFormat
): Promise<string> => {
  
  const prompt = `You are a powerful image compression utility. Your task is to apply aggressive lossy compression to the provided image to drastically reduce its file size. It is crucial that the file size is smaller than the original. Maintain the original image's content and aspect ratio, but prioritize file size reduction above perfect visual fidelity. The output format MUST be image/${outputFormat}. Re-encode the image with a lower quality setting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Error compressing image with Gemini API:", error);
    throw new Error("Failed to process image with the AI service.");
  }
};