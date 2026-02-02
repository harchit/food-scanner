export interface Product {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  ingredients: string[];
  ingredientsText: string;
  categories: string[];
  labels: string[];
  countries: string[];
  nutritionGrade?: string;
}

export interface HalalAnalysis {
  score: number; // 0-100
  status: HalalStatus;
  haramIngredients: IngredientAnalysis[];
  doubtfulIngredients: IngredientAnalysis[];
  halalIngredients: IngredientAnalysis[];
  summary: string;
  details: string;
}

export type HalalStatus = 'halal' | 'doubtful' | 'haram' | 'unknown';

export interface IngredientAnalysis {
  name: string;
  status: HalalStatus;
  reason: string;
  confidence: number; // 0-100
}

export interface ScanHistoryItem {
  id: string;
  product: Product;
  analysis: HalalAnalysis;
  scannedAt: Date;
}

export interface OpenFoodFactsProduct {
  code: string;
  product?: {
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    image_url?: string;
    image_front_url?: string;
    ingredients_text?: string;
    ingredients_text_en?: string;
    ingredients?: Array<{
      id: string;
      text: string;
    }>;
    categories?: string;
    categories_tags?: string[];
    labels?: string;
    labels_tags?: string[];
    countries?: string;
    countries_tags?: string[];
    nutrition_grades?: string;
  };
  status: number;
  status_verbose: string;
}
