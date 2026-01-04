import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from '../types';

interface Translations {
  header_title: string;
  header_subtitle: string;
  powered_by: string;
  
  hero_title: string;
  hero_subtitle: string;
  
  plate_size_label: string;
  plate_small: string;
  plate_medium: string;
  plate_large: string;
  plate_bowl: string;

  upload_drag: string;
  upload_button: string;
  upload_subtext: string;
  analyzing_title: string;
  analyzing_desc: string;
  
  feature_recognition_title: string;
  feature_recognition_desc: string;
  feature_portion_title: string;
  feature_portion_desc: string;
  feature_analysis_title: string;
  feature_analysis_desc: string;
  
  error_generic: string;
  error_retry: string;
  
  correction_alert_title: string;
  correction_alert_desc: string;

  results_image_label: string;
  results_total_energy: string;
  results_total_desc: string;
  results_range_label: string;
  results_reliability: string;
  results_analyze_another: string;
  
  macro_breakdown: string;
  macro_protein: string;
  macro_carbs: string;
  macro_fat: string;
  macro_protein_desc: string;
  macro_carbs_desc: string;
  macro_fat_desc: string;
  
  table_title: string;
  table_edit_hint: string;
  table_col_ingredient: string;
  table_col_portion: string;
  table_col_calories: string;
  table_col_macros: string;
  table_empty: string;
  table_disclaimer: string;
}

const translations: Record<Language, Translations> = {
  it: {
    header_title: "NutriScan AI",
    header_subtitle: "Sistema di Riconoscimento Cibo",
    powered_by: "Powered by Gemini 3 Pro",
    
    hero_title: "Cosa stai mangiando?",
    hero_subtitle: "Carica una foto del tuo piatto. La nostra AI identificherà gli ingredienti, stimerà le porzioni e calcolerà i valori nutrizionali in pochi secondi.",
    
    plate_size_label: "Dimensione del piatto (per stima accurata)",
    plate_small: "Piattino (Dessert)",
    plate_medium: "Piatto Standard",
    plate_large: "Piatto Grande",
    plate_bowl: "Ciotola / Scodella",

    upload_drag: "Carica la foto del tuo piatto",
    upload_button: "Seleziona Immagine",
    upload_subtext: "Trascina l'immagine qui o clicca per selezionarla.",
    analyzing_title: "Analisi in corso...",
    analyzing_desc: "Stiamo identificando gli ingredienti",
    
    feature_recognition_title: "Riconoscimento Istantaneo",
    feature_recognition_desc: "Identifica ingredienti complessi e piatti pronti.",
    feature_portion_title: "Stima Porzioni",
    feature_portion_desc: "Calcolo del peso basato su riferimenti visivi.",
    feature_analysis_title: "Analisi Completa",
    feature_analysis_desc: "Calorie e macro dettagliati per ogni ingrediente.",
    
    error_generic: "Si è verificato un errore durante l'analisi dell'immagine. Riprova.",
    error_retry: "Riprova con un'altra immagine",
    
    correction_alert_title: "Dimensione piatto corretta automaticamente",
    correction_alert_desc: "L'AI ha rilevato che la dimensione del piatto selezionata non corrispondeva all'immagine. È stata corretta per garantire porzioni precise.",

    results_image_label: "Immagine Analizzata",
    results_total_energy: "Totale Energetico",
    results_total_desc: "Stima totale per il piatto riconosciuto.",
    results_range_label: "Intervallo Stimato",
    results_reliability: "Affidabilità stima",
    results_analyze_another: "Analizza un'altra foto",
    
    macro_breakdown: "Ripartizione Macronutrienti",
    macro_protein: "Proteine",
    macro_carbs: "Carboidrati",
    macro_fat: "Grassi",
    macro_protein_desc: "Costruzione muscolare",
    macro_carbs_desc: "Energia rapida",
    macro_fat_desc: "Energia e ormoni",
    
    table_title: "Dettaglio Ingredienti",
    table_edit_hint: "Clicca sui grammi per modificare e ricalcolare",
    table_col_ingredient: "Ingrediente",
    table_col_portion: "Porzione (g)",
    table_col_calories: "Calorie",
    table_col_macros: "Macros (P/C/G)",
    table_empty: "Nessun ingrediente specifico identificato.",
    table_disclaimer: "* I valori nutrizionali sono stime basate su database standard e porzioni visive.",
  },
  en: {
    header_title: "NutriScan AI",
    header_subtitle: "Food Recognition System",
    powered_by: "Powered by Gemini 3 Pro",
    
    hero_title: "What are you eating?",
    hero_subtitle: "Upload a photo of your meal. Our AI will identify ingredients, estimate portions, and calculate nutritional values in seconds.",
    
    plate_size_label: "Plate Size (for accurate scaling)",
    plate_small: "Small (Dessert)",
    plate_medium: "Standard Plate",
    plate_large: "Large Platter",
    plate_bowl: "Bowl",

    upload_drag: "Upload your meal photo",
    upload_button: "Select Image",
    upload_subtext: "Drag the image here or click to select from gallery.",
    analyzing_title: "Analyzing...",
    analyzing_desc: "Identifying ingredients and calculating macros",
    
    feature_recognition_title: "Instant Recognition",
    feature_recognition_desc: "Identifies complex ingredients and ready-made meals.",
    feature_portion_title: "Portion Estimation",
    feature_portion_desc: "Weight calculation based on visual references.",
    feature_analysis_title: "Complete Analysis",
    feature_analysis_desc: "Detailed calories and macros for every ingredient.",
    
    error_generic: "An error occurred during image analysis. Please try again.",
    error_retry: "Try with another image",
    
    correction_alert_title: "Plate size auto-corrected",
    correction_alert_desc: "AI detected that the selected plate size didn't match the image visuals. It was adjusted to ensure accurate portions.",

    results_image_label: "Analyzed Image",
    results_total_energy: "Total Energy",
    results_total_desc: "Total estimate for the recognized dish.",
    results_range_label: "Estimated Range",
    results_reliability: "Estimation Confidence",
    results_analyze_another: "Analyze another photo",
    
    macro_breakdown: "Macronutrient Breakdown",
    macro_protein: "Protein",
    macro_carbs: "Carbs",
    macro_fat: "Fat",
    macro_protein_desc: "Muscle building",
    macro_carbs_desc: "Quick energy",
    macro_fat_desc: "Energy & hormones",
    
    table_title: "Ingredient Details",
    table_edit_hint: "Click grams to edit & recalculate",
    table_col_ingredient: "Ingredient",
    table_col_portion: "Portion (g)",
    table_col_calories: "Calories",
    table_col_macros: "Macros (P/C/F)",
    table_empty: "No specific ingredients identified.",
    table_disclaimer: "* Nutritional values are estimates based on standard databases and visual portions.",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Set default language to 'en'
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};