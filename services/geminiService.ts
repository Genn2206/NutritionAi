import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "../types";

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

export const analyzeFoodImage = async (file: File, language: Language): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);

  // Use Gemini 3 Pro for higher accuracy and reasoning capabilities
  const modelId = "gemini-3-pro-preview";

  const isIt = language === 'it';
  
  const prompt = `
    Act as a high-level clinical nutritional analyst. Your goal is to provide an extremely accurate nutritional estimate by analyzing the provided image.
    
    **IMPORTANT: PROVIDE THE OUTPUT IN ${isIt ? 'ITALIAN' : 'ENGLISH'}.**

    Analysis Phases (use your Thinking Process for this):
    1.  **Visual Scan & References**: Look for items of known size (standard cutlery, glasses, plate rims) to establish a precise geometric scale. If clear references are missing, assume a standard dinner plate (26-28cm) but increase the uncertainty margin.
    2.  **Dish Decomposition**: Identify every visible ingredient. For composite dishes (e.g., lasagna, sandwiches, mixed salads), estimate the volume of individual components (e.g., 120g cooked pasta, 40g ragu, 10g parmesan).
    3.  **Density & Cooking**: Consider density (e.g., salad is voluminous but light, meat is dense). Consider oil absorption in fried foods or sautés (shininess signs).
    4.  **Rigorous Calculation**: Use standard average nutritional data. If in doubt about dressings, be prudently conservative (overestimate calories from hidden fats).

    Required Output:
    Return a JSON object with ingredients, portions in grams, and nutritional values.
    In the 'reliabilityNote' field, explain specifically what visual references you used to deduce the weight in ${isIt ? 'Italian' : 'English'} (e.g., "${isIt ? 'Stimato basandosi sulla dimensione...' : 'Estimated based on the size of...'}").
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
      // Allocate tokens for the model to "think" about geometry and composition before answering
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
                calories: { type: Type.NUMBER, description: "Total kcal for the portion" },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    protein: { type: Type.NUMBER, description: "Protein (g)" },
                    carbs: { type: Type.NUMBER, description: "Carbs (g)" },
                    fat: { type: Type.NUMBER, description: "Fat (g)" },
                  },
                  required: ["protein", "carbs", "fat"],
                },
              },
              required: ["name", "category", "portionGrams", "calories", "macros"],
            },
          },
          totalCalories: { type: Type.NUMBER },
          totalMacros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["protein", "carbs", "fat"],
          },
          reliabilityNote: { type: Type.STRING, description: `Technical explanation of visual estimation and references used in ${isIt ? 'Italian' : 'English'}` },
          reliabilityScore: { type: Type.NUMBER, description: "Confidence score from 0 to 100" },
        },
        required: ["items", "totalCalories", "totalMacros", "reliabilityNote", "reliabilityScore"],
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