import { GoogleGenAI, Modality } from "@google/genai";
import { OutputFormat, CompressionLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const compressImage = async (
  base64ImageData: string,
  mimeType: string,
  outputFormat: OutputFormat,
  compressionLevel: CompressionLevel
): Promise<string> => {
  
  // A direct, command-like prompt to guide the model effectively and prevent text responses.
  const prompt = `Compress the image.
Compression level: ${compressionLevel}.
Output format: image/${outputFormat}.
Maintain original dimensions.
Return ONLY the image data.`;

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
      // Per documentation, both modalities are required for this model.
      // This allows the model to return a text error if it cannot process the image.
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(part => part.inlineData);

    if (imagePart?.inlineData) {
      return imagePart.inlineData.data;
    }
    
    // If no image is returned, check for a text explanation from the model.
    const textPart = parts.find(part => part.text);
    if (textPart?.text) {
      console.error("Gemini API returned a text response instead of an image:", textPart.text);
      if (textPart.text.toLowerCase().includes('policy')) {
         throw new Error("The image could not be processed due to content policy reasons.");
      }
      throw new Error("The AI model was unable to process this image. It might be an unsupported format or a corrupt file.");
    }
    
    // Fallback error if the response is empty or malformed.
    throw new Error("No image data found in the API response. The model may have failed to generate a compressed image.");

  } catch (error) {
    console.error("Error compressing image with Gemini API:", error);
    // Re-throw specific, user-friendly errors, otherwise provide a generic one.
    if (error instanceof Error && (
        error.message.includes("content policy") ||
        error.message.includes("unsupported format") ||
        error.message.includes("No image data found")
    )) {
        throw error;
    }
    // This catches network errors or other unexpected API issues.
    throw new Error("Failed to communicate with the AI service. Please check your connection and try again.");
  }
};