import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation, ProductLink } from "../types";

// Primary: High-fidelity image model (Best for realism)
const PRIMARY_MODEL = 'gemini-3-pro-image-preview';
// Fallback: Robust image generation model (If Pro is unavailable/restricted)
const FALLBACK_MODEL = 'gemini-2.5-flash-image';
// Logic: Fast text/multimodal model
const LOGIC_MODEL = 'gemini-3-flash-preview'; 

export const generateTryOnImage = async (
  faceBase64: string,
  clothingBase64: string,
  onKeyError: () => void,
  isFullOutfit: boolean = false
): Promise<string> => {
  
  const aistudio = (window as any).aistudio;
  
  // Key check logic
  if (aistudio && aistudio.hasSelectedApiKey) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
        onKeyError();
        throw new Error("API Key not selected");
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanFace = faceBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const cleanClothing = clothingBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  // 1. Construct the Hyper-Realistic Prompt
  const basePrompt = `
      You are a professional VFX compositor and high-end fashion photographer.
      Task: Create a photorealistic fashion image of a model wearing specific clothing.

      INPUTS:
      1. Reference Face: Use the facial features, skin tone, hair, and head shape from the first image.
      2. Reference Clothing: Use the clothing item(s) from the second image.

      INSTRUCTIONS:
      - **IDENTITY**: The final face MUST BE AN EXACT MATCH to the Reference Face. Do not change ethnicity, age, or key facial features.
      - **OUTFIT COMPOSITION**: 
        ${isFullOutfit 
          ? 'Recreate the **COMPLETE OUTFIT** (Top and Bottom) from the Reference Clothing image exactly as shown. Do not substitute pants/skirts if they are visible in the reference. If the reference is a full-body shot, transfer the entire look.' 
          : 'Use the clothing item from the Reference. If only a single piece (e.g., shirt) is provided, generate realistic matching complementary items (e.g., pants, skirt) that suit the style naturally.'}
      - **BODY**: Generate a realistic body that fits the clothing naturally.
      - **REALISM**: Render with physically accurate fabric textures (folds, shadows, weight). Skin texture must look human, not plastic.
      - **LIGHTING**: Use cinematic, soft studio lighting. 
      - **BACKGROUND**: Blurred luxury boutique or neutral textured wall.
      
      NEGATIVE PROMPT (Avoid these):
      - Cartoon, illustration, 3d render, painting, drawing, distorted face, floating clothes, mannequin, blurry, low resolution, bad anatomy, mismatched skin tone.
  `;

  // 2. Try Primary Model (Gemini 3 Pro)
  try {
    console.log("Attempting generation with", PRIMARY_MODEL, "Full Outfit:", isFullOutfit);
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: {
        parts: [
          { text: basePrompt },
          { inlineData: { data: cleanFace, mimeType: 'image/jpeg' } },
          { text: "Reference Face" },
          { inlineData: { data: cleanClothing, mimeType: 'image/jpeg' } },
          { text: "Reference Clothing" }
        ],
      },
      config: {
        imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
      },
    });

    return extractImageFromResponse(response);

  } catch (primaryError: any) {
    console.warn(`Primary model ${PRIMARY_MODEL} failed:`, primaryError);

    // 3. Fallback to Secondary Model (Gemini 2.5 Flash)
    // Only if the error is NOT about the API key (which would fail everywhere)
    if (primaryError.message?.includes("API key") || primaryError.message?.includes("billing")) {
        throw primaryError;
    }

    try {
        console.log("Falling back to", FALLBACK_MODEL);
        const fallbackResponse = await ai.models.generateContent({
            model: FALLBACK_MODEL,
            contents: {
                parts: [
                    { text: basePrompt + " \n\nRETURN IMAGE ONLY." },
                    { inlineData: { data: cleanFace, mimeType: 'image/jpeg' } },
                    { inlineData: { data: cleanClothing, mimeType: 'image/jpeg' } }
                ]
            },
            // Note: 2.5 Flash Image config is different, generally doesn't take imageSize/aspectRatio in same config object structure in some versions, 
            // but the SDK handles standard generateContent.
        });
        
        return extractImageFromResponse(fallbackResponse);

    } catch (fallbackError) {
        console.error("Fallback model failed:", fallbackError);
        throw new Error("Generation failed on all models. Please try a different image.");
    }
  }
};

// Helper to parse image bytes
function extractImageFromResponse(response: any): string {
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Model returned no image data.");
}

async function fetchImageWithCorsFallback(url: string): Promise<Blob> {
    const proxies = [
        (u: string) => u, // 1. Direct fetch (best case)
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, // 2. AllOrigins
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}` // 3. CORSProxy
    ];

    for (const proxy of proxies) {
        try {
            const proxyUrl = proxy(url);
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const blob = await res.blob();
                // Basic validation to ensure we got an image
                if (blob.type.startsWith('image/')) {
                    return blob;
                }
            }
        } catch (e) {
            console.warn(`Fetch failed for ${url} using proxy.`, e);
        }
    }
    throw new Error("Found image but blocked by website security (CORS). Please save the image and upload manually.");
}

export const extractProductImageFromUrl = async (productUrl: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        // Use a lightweight model to find the image URL using Grounding
        const response = await ai.models.generateContent({
            model: LOGIC_MODEL,
            contents: {
                parts: [{ text: `Analyze this product page URL: ${productUrl}
                
                Task: Identify the direct URL of the main product image (high resolution).
                
                Strategies:
                1. Look for the 'og:image' tag.
                2. Look for the main e-commerce product container image.
                3. If the page is not accessible, perform a Google Image Search for the product name contained in the URL.
                
                Return ONLY the raw image URL string. It should start with http and end with an image extension like .jpg, .png, or .webp. Do not add any text.` }]
            },
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const text = response.text || "";
        console.log("Gemini extraction response:", text);

        // Regex to find first valid http/https URL that looks like an image
        // Prioritizes explicit image extensions
        const imageExtensionRegex = /(https?:\/\/[^\s"'>)]+\.(?:jpg|jpeg|png|webp|gif))/i;
        const generalUrlRegex = /(https?:\/\/[^\s"'>)]+)/;
        
        let match = text.match(imageExtensionRegex) || text.match(generalUrlRegex);
        
        let imageUrl = match ? match[0] : null;

        // Cleanup: Removing Markdown artifacts if any
        if (imageUrl) {
            if (imageUrl.includes('](')) imageUrl = imageUrl.split('](')[1];
            if (imageUrl.endsWith(')')) imageUrl = imageUrl.slice(0, -1);
            if (imageUrl.endsWith('.')) imageUrl = imageUrl.slice(0, -1);
        }

        console.log("Extracted Image URL:", imageUrl);

        if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error("Could not identify a valid image URL from the page.");
        }

        // Fetch with CORS workarounds
        const blob = await fetchImageWithCorsFallback(imageUrl);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error: any) {
        console.error("Link Extraction Error:", error);
        throw new Error(error.message || "Could not extract image. Please try uploading the file directly.");
    }
}

export const suggestMatchingItems = async (clothingBase64: string): Promise<ProductLink[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanClothing = clothingBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: LOGIC_MODEL,
      contents: {
        parts: [
          { inlineData: { data: cleanClothing, mimeType: 'image/jpeg' } },
          { text: `Identify this fashion item. Search for 3 similar or exact match items purchasable in India (Myntra, Ajio, Amazon, Zara, H&M). 
                   For each item found, provide the following details:
                   1. Title of the product
                   2. Direct URL
                   3. Source (Website name)
                   4. Brand Name
                   5. Material Composition (e.g., 100% Cotton, Poly-blend)
                   6. Care Instructions (e.g., Machine Wash, Dry Clean Only)
                   
                   Return the result as a JSON array of objects.` }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              source: { type: Type.STRING },
              brand: { type: Type.STRING },
              material: { type: Type.STRING },
              care: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as ProductLink[];
    }
    
    return [];
  } catch (error) {
    console.error("Matching Search Error:", error);
    return [];
  }
};

export const analyzeStyleAndRecommend = async (faceBase64: string): Promise<Recommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanFace = faceBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: LOGIC_MODEL,
      contents: {
        parts: [
          { inlineData: { data: cleanFace, mimeType: 'image/jpeg' } },
          { text: "Analyze the facial features and skin tone. Suggest 3 trending Indian fashion styles (e.g. Indo-Western, Streetwear, Festive) that suit this person. Return JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
              styleType: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as Recommendation[];
    return [];
  } catch (error) {
    console.error("Recommendation Error:", error);
    return [];
  }
};