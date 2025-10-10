import { GoogleGenAI, Modality } from "@google/genai";
import { OutputFormat, CompressionLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const compressImage = async (
  base64ImageData: string,
  mimeType: string,
  outputFormat: OutputFormat,
  compressionLevel: CompressionLevel
): Promise<string> => {
  
  const qualityPrompts = {
    low: "Apply light lossy compression. Prioritize high visual quality over file size reduction. For JPEG, aim for a quality setting around 85-95.",
    medium: "Apply a balanced, medium level of lossy compression. Aim for a significant file size reduction with minimal perceivable loss in quality. For JPEG, aim for a quality setting around 60-75.",
    high: "Apply aggressive, high lossy compression. Prioritize maximum file size reduction, even if it results in some noticeable quality loss. For JPEG, aim for a quality setting around 40-55."
  };
  
  const prompt = `CRITICAL TASK: You are an expert image compression engine. Your ONLY goal is to reduce the file size of the provided image.
  
Instructions:
1.  Compression Level: ${compressionLevel.toUpperCase()}. ${qualityPrompts[compressionLevel]}
2.  Output Format: You MUST output the image in image/${outputFormat} format.
3.  File Size: The output file size MUST be smaller than the original. This is a strict requirement.
4.  Content Integrity: Maintain the original image's content and aspect ratio. Do not crop or alter the image content.
5.  No Extra Output: Do not add any text, commentary, or watermarks. The output should be only the compressed image data.
  
Compress the image now.`;

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

    throw new Error("No image data found in the API response. The model may have failed to generate a compressed image.");
  } catch (error) {
    console.error("Error compressing image with Gemini API:", error);
    if (error instanceof Error && (error.message.includes("400") || error.message.includes("request failed"))) {
        throw new Error("The image format may not be supported or the file is corrupted. Please try a different image.");
    }
    throw new Error("Failed to process image with the AI service. Please try again later.");
  }
};