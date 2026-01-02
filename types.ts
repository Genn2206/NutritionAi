export interface Macronutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  name: string;
  portionGrams: number;
  calories: number;
  macros: Macronutrients;
  category: string;
}

export interface AnalysisResult {
  items: FoodItem[];
  totalCalories: number;
  totalMacros: Macronutrients;
  reliabilityNote: string;
  reliabilityScore: number; // 0 to 100
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}