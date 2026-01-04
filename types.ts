export type Language = 'it' | 'en';
export type PlateSize = 'small' | 'medium' | 'large' | 'bowl';

export interface Macronutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  name: string;
  portionGrams: number;
  calories: number;
  minCalories: number; // Lower bound of confidence interval
  maxCalories: number; // Upper bound of confidence interval
  macros: Macronutrients;
  category: string;
}

export interface AnalysisResult {
  items: FoodItem[];
  totalCalories: number;
  minTotalCalories: number; // Lower bound total
  maxTotalCalories: number; // Upper bound total
  totalMacros: Macronutrients;
  reliabilityNote: string;
  reliabilityScore: number; // 0 to 100
  detectedPlateSize?: PlateSize; // The plate size the AI actually used based on visual evidence
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}