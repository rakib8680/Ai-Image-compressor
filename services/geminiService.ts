
import { GoogleGenAI, Modality } from "@google/genai";
import { OutputFormat } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const compressImage = async (
  base64ImageData: string,
  mimeType: string,
  outputFormat: OutputFormat
): Promise<string> => {
  
  const prompt = `You are an expert image compression engine. Your task is to re-render the following image, significantly reducing its file size while preserving as much visual quality as possible. The final output format must be image/${outputFormat}. Do not add any extra elements, text, or modifications. The goal is high-quality compression.`;

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
