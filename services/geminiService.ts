import { GoogleGenAI, Modality } from "@google/genai";
import { OutputFormat, CompressionLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const compressImage = async (
  base64ImageData: string,
  mimeType: string,
  outputFormat: OutputFormat,
  compressionLevel: CompressionLevel
): Promise<string> => {
  
  const qualityDescription = {
    low: "Apply light lossy compression. Prioritize high visual quality over file size reduction. (e.g., for JPEG, aim for a quality setting around 85-95).",
    medium: "Apply a balanced, medium level of lossy compression. Aim for a significant file size reduction with minimal perceivable loss in quality. (e.g., for JPEG, aim for a quality setting around 70-85).",
    high: "Apply aggressive, high lossy compression. Prioritize maximum file size reduction, even if it results in some noticeable quality loss. (e.g., for JPEG, aim for a quality setting around 50-70)."
  };

  const prompt = `
You are an expert image compression utility. Your primary goal is to reduce the file size of the provided image.

**Task:** Compress the image according to these settings.

**Settings:**
1.  **Compression Level:** ${compressionLevel.toUpperCase()}. ${qualityDescription[compressionLevel]}
2.  **Output Format:** Your output MUST be in \`image/${outputFormat}\` format.
3.  **File Size:** The output image should be smaller than the original.
4.  **Integrity:** Do NOT alter the image's dimensions, aspect ratio, or content.
5.  **Output:** Provide ONLY the raw compressed image data. No text, commentary, or watermarks.
`;

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
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }
    
    const textPart = parts.find(part => part.text);
    if (textPart && textPart.text) {
      console.error("Gemini API returned a text response instead of an image:", textPart.text);
      throw new Error("The AI model was unable to process this image. It might be an unsupported format or a content policy issue.");
    }
    
    throw new Error("No image data found in the API response. The model may have failed to generate a compressed image.");

  } catch (error) {
    console.error("Error compressing image with Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.startsWith("The AI model was unable to process this image")) {
            throw error;
        }
        if (error.message.includes("400") || error.message.includes("request failed")) {
            throw new Error("The image format may not be supported or the file is corrupted. Please try a different image.");
        }
    }
    throw new Error("Failed to process image with the AI service. Please try again later.");
  }
};