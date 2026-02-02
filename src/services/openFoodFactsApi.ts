import { Product, OpenFoodFactsProduct } from '../types';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

export class OpenFoodFactsError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'OpenFoodFactsError';
  }
}

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const url = `${BASE_URL}/product/${barcode}.json`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'HalalScanner/1.0 (iOS; contact@halalscanner.app)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new OpenFoodFactsError(
        `Failed to fetch product: ${response.statusText}`,
        response.status
      );
    }

    const data: OpenFoodFactsProduct = await response.json();

    if (data.status === 0 || !data.product) {
      return null;
    }

    return transformProduct(data);
  } catch (error) {
    if (error instanceof OpenFoodFactsError) {
      throw error;
    }
    throw new OpenFoodFactsError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

function transformProduct(data: OpenFoodFactsProduct): Product {
  const product = data.product!;

  // Extract product name
  const name = product.product_name_en ||
               product.product_name ||
               'Unknown Product';

  // Extract brand
  const brand = product.brands || 'Unknown Brand';

  // Extract image URL
  const imageUrl = product.image_front_url || product.image_url;

  // Extract ingredients
  const ingredientsText = product.ingredients_text_en ||
                          product.ingredients_text ||
                          '';

  const ingredients = parseIngredients(ingredientsText, product.ingredients);

  // Extract categories
  const categories = product.categories_tags?.map(tag =>
    tag.replace('en:', '').replace(/-/g, ' ')
  ) || [];

  // Extract labels
  const labels = product.labels_tags?.map(tag =>
    tag.replace('en:', '').replace(/-/g, ' ')
  ) || [];

  // Extract countries
  const countries = product.countries_tags?.map(tag =>
    tag.replace('en:', '').replace(/-/g, ' ')
  ) || [];

  return {
    barcode: data.code,
    name,
    brand,
    imageUrl,
    ingredients,
    ingredientsText,
    categories,
    labels,
    nutritionGrade: product.nutrition_grades,
    countries,
  };
}

function parseIngredients(
  ingredientsText: string,
  ingredientsList?: Array<{ id: string; text: string }>
): string[] {
  // First try to use the structured ingredients list
  if (ingredientsList && ingredientsList.length > 0) {
    return ingredientsList.map(ing =>
      ing.text.toLowerCase().trim()
    ).filter(Boolean);
  }

  // Fall back to parsing the text
  if (!ingredientsText) {
    return [];
  }

  // Clean and split ingredients text
  return ingredientsText
    .toLowerCase()
    // Remove percentages
    .replace(/\d+(\.\d+)?%/g, '')
    // Remove parenthetical content for now (often contains sub-ingredients)
    .replace(/\([^)]*\)/g, ',')
    // Split by common delimiters
    .split(/[,;]/)
    // Clean each ingredient
    .map(ing => ing
      .replace(/\*/g, '')
      .replace(/\./g, '')
      .trim()
    )
    // Filter empty strings
    .filter(ing => ing.length > 1);
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const url = `${BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page_size=10&json=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'HalalScanner/1.0 (iOS; contact@halalscanner.app)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new OpenFoodFactsError(
        `Failed to search products: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return [];
    }

    return data.products.map((product: any) =>
      transformProduct({ code: product.code, product, status: 1, status_verbose: 'product found' })
    );
  } catch (error) {
    if (error instanceof OpenFoodFactsError) {
      throw error;
    }
    throw new OpenFoodFactsError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
