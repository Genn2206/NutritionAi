import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language, PlateSize } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeFoodImage = async (file: File, language: Language, plateSize: PlateSize): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);

  // Use Gemini 3 Pro for higher accuracy and reasoning capabilities
  const modelId = "gemini-3-pro-preview";

  const isIt = language === 'it';
  
  const plateSizeDescriptions = {
    small: isIt ? "piattino da dessert (circa 18-20cm)" : "small dessert plate (approx 18-20cm)",
    medium: isIt ? "piatto piano standard (circa 26-28cm)" : "standard dinner plate (approx 26-28cm)",
    large: isIt ? "piatto da portata grande (30cm+)" : "large serving platter (30cm+)",
    bowl: isIt ? "scodella/ciotola profonda" : "deep bowl",
  };

  const selectedPlateDesc = plateSizeDescriptions[plateSize];

  const prompt = `
    Act as an elite clinical dietitian and expert in food calorimetry and computer vision. Your objective is to MINIMIZE ERROR in caloric estimation.
    
    **OUTPUT LANGUAGE**: ${isIt ? 'ITALIAN' : 'ENGLISH'}.
    
    **INPUT CONTEXT**: User claims the food is on/in a: **${selectedPlateDesc}**.
    
    **CRITICAL ERROR REDUCTION PROTOCOL (Thinking Process)**:
    1.  **Geometry & Depth Engine**: 
        *   **Reference Calibration**: Use the provided plate size (${selectedPlateDesc}) to establish an absolute scale (mm per pixel).
        *   **3D Volumetrics**: Analyze shadows, shading gradients, and occlusion to estimate the Z-axis (height/thickness) of the food. 
        *   *Example*: A flat pizza slice is different from a mound of risotto. Use shadow length and curvature to infer pile height.
        *   **Check**: Does the visual evidence match the user's selected plate? If user said "Small Plate" but you see a "Large Platter", or if "Plate" is actually a "Bowl", detect the TRUE size and use 'detectedPlateSize' to correct it.

    2.  **THE "HIDDEN FAT" ADJUSTMENT**: 
        *   Visual analysis typically UNDERESTIMATES calories because it misses cooking fats.
        *   Look for *sheen* or *gloss* on vegetables, meats, or pasta. This indicates oil/butter.
        *   **Rule**: If the food is cooked (sautéed, roasted, fried) or has sauce, ADD 10-20% to your volumetric calorie calculation to account for absorbed oils.
        *   Assume "Restaurant Standard" (heavy oil/butter use) unless the food looks explicitly steamed/dry.
        
    3.  **Density Analysis**: Differentiate between loose volume (e.g., fluffy salad) and dense volume (e.g., mashed potatoes, compressed rice).
    
    4.  **Range Calculation**: Because single-point estimates are error-prone, calculate a 'min' (conservative home-cooking) and 'max' (restaurant style) for every item.

    **Required Output**:
    Return a JSON object.
    The 'calories' field should be the *Most Probable* value (leaning towards the higher end of the range for safety).
    Include 'minCalories' and 'maxCalories' for every item and the totals.
    The 'detectedPlateSize' must be one of: 'small', 'medium', 'large', 'bowl'.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      // Allocate tokens for the model to deeply analyze density and hidden fats
      thinkingConfig: {
        thinkingBudget: 2048,
      },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: `Name of the food item in ${isIt ? 'Italian' : 'English'}` },
                category: { type: Type.STRING, description: `Nutritional category in ${isIt ? 'Italian' : 'English'}` },
                portionGrams: { type: Type.NUMBER, description: "Accurate estimate in grams" },
                calories: { type: Type.NUMBER, description: "Most probable caloric value (weighted for hidden fats)" },
                minCalories: { type: Type.NUMBER, description: "Lower bound estimate" },
                maxCalories: { type: Type.NUMBER, description: "Upper bound estimate (high fat assumption)" },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                  },
                  required: ["protein", "carbs", "fat"],
                },
              },
              required: ["name", "category", "portionGrams", "calories", "minCalories", "maxCalories", "macros"],
            },
          },
          totalCalories: { type: Type.NUMBER },
          minTotalCalories: { type: Type.NUMBER },
          maxTotalCalories: { type: Type.NUMBER },
          totalMacros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["protein", "carbs", "fat"],
          },
          reliabilityNote: { type: Type.STRING, description: `Technical note about density and hidden fats in ${isIt ? 'Italian' : 'English'}` },
          reliabilityScore: { type: Type.NUMBER, description: "Confidence score from 0 to 100" },
          detectedPlateSize: { type: Type.STRING, enum: ['small', 'medium', 'large', 'bowl'] },
        },
        required: ["items", "totalCalories", "minTotalCalories", "maxTotalCalories", "totalMacros", "reliabilityNote", "reliabilityScore", "detectedPlateSize"],
      },
    },
  });

  const jsonStr = response.text;
  if (!jsonStr) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Invalid response format");
  }
};