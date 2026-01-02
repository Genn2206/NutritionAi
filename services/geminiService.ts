import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

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

export const analyzeFoodImage = async (file: File): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);

  // Use Gemini 3 Pro for higher accuracy and reasoning capabilities
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    Agisci come un analista nutrizionale clinico di alto livello. Il tuo obiettivo è fornire una stima nutrizionale estremamente accurata analizzando l'immagine fornita.

    Fasi di Analisi (usa il tuo Thinking Process per questo):
    1.  **Scansione Visiva e Riferimenti**: Cerca elementi di dimensione nota (posate standard, bicchieri, bordi del piatto) per stabilire una scala geometrica precisa. Se non ci sono riferimenti chiari, assumi un piatto piano standard (26-28cm) ma aumenta il margine di incertezza.
    2.  **Scomposizione del Piatto**: Identifica ogni ingrediente visibile. Per piatti composti (es. lasagne, panini, insalate miste), stima il volume dei singoli componenti (es. 120g pasta cotta, 40g ragù, 10g parmigiano).
    3.  **Densità e Cottura**: Considera la densità (es. l'insalata è voluminosa ma leggera, la carne è densa). Considera l'assorbimento di olio in fritture o soffritti (segni di lucentezza).
    4.  **Calcolo Rigoroso**: Usa dati nutrizionali medi standard. Se c'è dubbio sui condimenti, sii prudentemente conservativo (sovrastima le calorie da grassi nascosti).

    Output richiesto:
    Restituisci un oggetto JSON con gli ingredienti, le porzioni in grammi e i valori nutrizionali.
    Nel campo 'reliabilityNote', spiega specificamente quali riferimenti visivi hai usato per dedurre il peso (es. "Stimato basandosi sulla dimensione della forchetta standard visibile a sinistra...").
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
                name: { type: Type.STRING, description: "Nome dell'alimento in Italiano" },
                category: { type: Type.STRING, description: "Categoria nutrizionale (es. Carboidrati, Proteine, Verdure)" },
                portionGrams: { type: Type.NUMBER, description: "Stima accurata in grammi" },
                calories: { type: Type.NUMBER, description: "Kcal totali per la porzione" },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    protein: { type: Type.NUMBER, description: "Proteine (g)" },
                    carbs: { type: Type.NUMBER, description: "Carboidrati (g)" },
                    fat: { type: Type.NUMBER, description: "Grassi (g)" },
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
          reliabilityNote: { type: Type.STRING, description: "Spiegazione tecnica della stima visiva e dei riferimenti usati" },
          reliabilityScore: { type: Type.NUMBER, description: "Punteggio di confidenza da 0 a 100" },
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