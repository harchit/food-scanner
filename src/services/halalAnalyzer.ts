import { Product, HalalAnalysis, HalalStatus, IngredientAnalysis } from '../types';

// Clearly haram ingredients - no ambiguity
const HARAM_INGREDIENTS: Record<string, string> = {
  // Pork and pork derivatives
  'pork': 'Pork is not halal',
  'bacon': 'Bacon is derived from pork',
  'ham': 'Ham is derived from pork',
  'lard': 'Lard is pork fat',
  'pork fat': 'Pork fat is not halal',
  'pork gelatin': 'Gelatin derived from pork',
  'pork extract': 'Extract derived from pork',
  'pig': 'Pig-derived ingredient',
  'swine': 'Swine-derived ingredient',
  'pancetta': 'Pancetta is Italian bacon from pork',
  'prosciutto': 'Prosciutto is Italian dry-cured ham',
  'chorizo': 'Often contains pork (check source)',
  'pepperoni': 'Often contains pork',
  'salami': 'Often contains pork',

  // Alcohol
  'alcohol': 'Alcohol is not halal',
  'ethanol': 'Ethanol is alcohol',
  'wine': 'Wine contains alcohol',
  'beer': 'Beer contains alcohol',
  'rum': 'Rum is an alcoholic beverage',
  'whiskey': 'Whiskey is an alcoholic beverage',
  'whisky': 'Whisky is an alcoholic beverage',
  'vodka': 'Vodka is an alcoholic beverage',
  'brandy': 'Brandy is an alcoholic beverage',
  'liquor': 'Liquor contains alcohol',
  'liqueur': 'Liqueur contains alcohol',
  'champagne': 'Champagne contains alcohol',
  'sake': 'Sake contains alcohol',
  'mirin': 'Mirin contains alcohol',

  // Blood
  'blood': 'Blood is not halal',
  'blood plasma': 'Blood products are not halal',
  'black pudding': 'Contains blood',

  // Non-halal meat
  'carnivore': 'Carnivorous animals are not halal',
};

// Doubtful ingredients - may or may not be halal depending on source
const DOUBTFUL_INGREDIENTS: Record<string, { reason: string; confidence: number }> = {
  // Gelatin and collagen
  'gelatin': {
    reason: 'Gelatin source unknown - could be pork, beef, or fish',
    confidence: 50,
  },
  'gelatine': {
    reason: 'Gelatin source unknown - could be pork, beef, or fish',
    confidence: 50,
  },
  'collagen': {
    reason: 'Collagen source unknown - could be from non-halal animal',
    confidence: 50,
  },

  // Animal fats and derivatives
  'animal fat': {
    reason: 'Animal fat source unknown',
    confidence: 40,
  },
  'tallow': {
    reason: 'Tallow source unknown - could be from non-halal animal',
    confidence: 50,
  },
  'shortening': {
    reason: 'May contain animal-derived fats',
    confidence: 60,
  },
  'mono and diglycerides': {
    reason: 'May be derived from animal fats',
    confidence: 70,
  },
  'monoglycerides': {
    reason: 'May be derived from animal fats',
    confidence: 70,
  },
  'diglycerides': {
    reason: 'May be derived from animal fats',
    confidence: 70,
  },
  'glycerides': {
    reason: 'May be derived from animal fats',
    confidence: 70,
  },
  'glycerin': {
    reason: 'May be derived from animal fats (often plant-based)',
    confidence: 75,
  },
  'glycerine': {
    reason: 'May be derived from animal fats (often plant-based)',
    confidence: 75,
  },
  'glycerol': {
    reason: 'May be derived from animal fats (often plant-based)',
    confidence: 75,
  },

  // Enzymes
  'enzymes': {
    reason: 'Enzyme source unknown - may be animal-derived',
    confidence: 60,
  },
  'lipase': {
    reason: 'Lipase may be derived from animal sources',
    confidence: 55,
  },
  'rennet': {
    reason: 'Rennet often derived from calf stomach',
    confidence: 40,
  },
  'pepsin': {
    reason: 'Pepsin often derived from porcine stomach',
    confidence: 30,
  },

  // E-numbers (European food additives)
  'e120': {
    reason: 'E120 (Carmine) is derived from insects',
    confidence: 30,
  },
  'carmine': {
    reason: 'Carmine is derived from cochineal insects',
    confidence: 30,
  },
  'cochineal': {
    reason: 'Cochineal is derived from insects',
    confidence: 30,
  },
  'e441': {
    reason: 'E441 (Gelatin) - source unknown',
    confidence: 50,
  },
  'e542': {
    reason: 'E542 (Bone phosphate) from animal bones',
    confidence: 50,
  },
  'e631': {
    reason: 'E631 may be derived from meat',
    confidence: 60,
  },
  'e635': {
    reason: 'E635 may be derived from meat',
    confidence: 60,
  },
  'e904': {
    reason: 'E904 (Shellac) is derived from insects',
    confidence: 40,
  },
  'shellac': {
    reason: 'Shellac is derived from lac insects',
    confidence: 40,
  },

  // Alcohol derivatives (may have evaporated)
  'wine vinegar': {
    reason: 'Made from wine but alcohol typically evaporated',
    confidence: 70,
  },
  'cooking wine': {
    reason: 'Contains wine, alcohol content varies',
    confidence: 40,
  },
  'vanilla extract': {
    reason: 'Often contains alcohol as solvent',
    confidence: 65,
  },

  // L-cysteine
  'l-cysteine': {
    reason: 'L-cysteine may be derived from human hair or duck feathers',
    confidence: 50,
  },
  'cysteine': {
    reason: 'Cysteine may be derived from non-halal sources',
    confidence: 55,
  },

  // Whey and dairy processing
  'whey': {
    reason: 'Whey processing may use non-halal enzymes',
    confidence: 75,
  },
  'casein': {
    reason: 'Casein processing may use non-halal enzymes',
    confidence: 75,
  },

  // Natural flavors
  'natural flavors': {
    reason: 'Natural flavors may include animal-derived ingredients',
    confidence: 70,
  },
  'natural flavoring': {
    reason: 'Natural flavoring may include animal-derived ingredients',
    confidence: 70,
  },
  'natural flavours': {
    reason: 'Natural flavours may include animal-derived ingredients',
    confidence: 70,
  },

  // Emulsifiers
  'lecithin': {
    reason: 'Lecithin usually from soy or eggs (typically halal)',
    confidence: 85,
  },
  'e471': {
    reason: 'E471 may be derived from animal fats',
    confidence: 60,
  },
  'e472': {
    reason: 'E472 may be derived from animal fats',
    confidence: 60,
  },
  'e473': {
    reason: 'E473 may be derived from animal fats',
    confidence: 60,
  },
  'e474': {
    reason: 'E474 may be derived from animal fats',
    confidence: 60,
  },
  'e475': {
    reason: 'E475 may be derived from animal fats',
    confidence: 60,
  },
  'e476': {
    reason: 'E476 (PGPR) usually plant-based but may be animal-derived',
    confidence: 75,
  },
  'e477': {
    reason: 'E477 may be derived from animal fats',
    confidence: 60,
  },
  'e481': {
    reason: 'E481 may be derived from animal fats',
    confidence: 65,
  },
  'e482': {
    reason: 'E482 may be derived from animal fats',
    confidence: 65,
  },
  'e483': {
    reason: 'E483 may be derived from animal fats',
    confidence: 65,
  },

  // Stearic acid and stearates
  'stearic acid': {
    reason: 'Stearic acid may be animal or plant-derived',
    confidence: 65,
  },
  'magnesium stearate': {
    reason: 'May be derived from animal fats',
    confidence: 70,
  },
  'calcium stearate': {
    reason: 'May be derived from animal fats',
    confidence: 70,
  },
};

// Halal-certified or definitely halal ingredients
const HALAL_INDICATORS = [
  'halal',
  'halal certified',
  'halal gelatin',
  'beef gelatin',
  'fish gelatin',
  'kosher gelatin', // Often acceptable
  'vegetable',
  'plant-based',
  'vegan',
  'vegetarian',
];

export function analyzeHalalStatus(product: Product): HalalAnalysis {
  const haramIngredients: IngredientAnalysis[] = [];
  const doubtfulIngredients: IngredientAnalysis[] = [];
  const halalIngredients: IngredientAnalysis[] = [];

  // Check for halal certification in labels
  const hasHalalCertification = product.labels.some(label =>
    label.toLowerCase().includes('halal')
  );

  const isVegan = product.labels.some(label =>
    label.toLowerCase().includes('vegan')
  );

  const isVegetarian = product.labels.some(label =>
    label.toLowerCase().includes('vegetarian')
  );

  // Analyze each ingredient
  for (const ingredient of product.ingredients) {
    const normalizedIngredient = ingredient.toLowerCase().trim();
    const analysis = analyzeIngredient(normalizedIngredient, hasHalalCertification);

    switch (analysis.status) {
      case 'haram':
        haramIngredients.push(analysis);
        break;
      case 'doubtful':
        doubtfulIngredients.push(analysis);
        break;
      case 'halal':
        halalIngredients.push(analysis);
        break;
    }
  }

  // Also check the raw ingredients text for patterns
  const textAnalysis = analyzeIngredientsText(product.ingredientsText);

  // Merge text analysis results (avoiding duplicates)
  for (const analysis of textAnalysis.haram) {
    if (!haramIngredients.some(h => h.name === analysis.name)) {
      haramIngredients.push(analysis);
    }
  }

  for (const analysis of textAnalysis.doubtful) {
    if (!doubtfulIngredients.some(d => d.name === analysis.name)) {
      doubtfulIngredients.push(analysis);
    }
  }

  // Calculate score
  const score = calculateHalalScore(
    haramIngredients,
    doubtfulIngredients,
    hasHalalCertification,
    isVegan,
    isVegetarian,
    product.ingredients.length
  );

  // Determine overall status
  const status = determineOverallStatus(score, haramIngredients.length > 0);

  // Generate summary and details
  const { summary, details } = generateAnalysisSummary(
    status,
    score,
    haramIngredients,
    doubtfulIngredients,
    hasHalalCertification,
    isVegan,
    isVegetarian,
    product
  );

  return {
    score,
    status,
    haramIngredients,
    doubtfulIngredients,
    halalIngredients,
    summary,
    details,
  };
}

function analyzeIngredient(
  ingredient: string,
  hasHalalCertification: boolean
): IngredientAnalysis {
  // Check for explicit halal indicators first
  for (const indicator of HALAL_INDICATORS) {
    if (ingredient.includes(indicator)) {
      return {
        name: ingredient,
        status: 'halal',
        reason: `Contains halal indicator: ${indicator}`,
        confidence: 95,
      };
    }
  }

  // Check for haram ingredients
  for (const [haramKey, reason] of Object.entries(HARAM_INGREDIENTS)) {
    if (ingredient.includes(haramKey)) {
      return {
        name: ingredient,
        status: 'haram',
        reason,
        confidence: 95,
      };
    }
  }

  // Check for doubtful ingredients
  for (const [doubtfulKey, info] of Object.entries(DOUBTFUL_INGREDIENTS)) {
    if (ingredient.includes(doubtfulKey)) {
      // If product has halal certification, increase confidence
      const adjustedConfidence = hasHalalCertification
        ? Math.min(info.confidence + 30, 95)
        : info.confidence;

      return {
        name: ingredient,
        status: hasHalalCertification ? 'halal' : 'doubtful',
        reason: hasHalalCertification
          ? `${info.reason} - but product has halal certification`
          : info.reason,
        confidence: adjustedConfidence,
      };
    }
  }

  // Default to halal if no issues found
  return {
    name: ingredient,
    status: 'halal',
    reason: 'No haram or doubtful indicators found',
    confidence: 85,
  };
}

function analyzeIngredientsText(text: string): {
  haram: IngredientAnalysis[];
  doubtful: IngredientAnalysis[];
} {
  const haram: IngredientAnalysis[] = [];
  const doubtful: IngredientAnalysis[] = [];

  const normalizedText = text.toLowerCase();

  // Check for haram keywords in the full text
  for (const [haramKey, reason] of Object.entries(HARAM_INGREDIENTS)) {
    if (normalizedText.includes(haramKey)) {
      haram.push({
        name: haramKey,
        status: 'haram',
        reason,
        confidence: 90,
      });
    }
  }

  // Check for doubtful keywords
  for (const [doubtfulKey, info] of Object.entries(DOUBTFUL_INGREDIENTS)) {
    if (normalizedText.includes(doubtfulKey)) {
      doubtful.push({
        name: doubtfulKey,
        status: 'doubtful',
        reason: info.reason,
        confidence: info.confidence,
      });
    }
  }

  return { haram, doubtful };
}

function calculateHalalScore(
  haramIngredients: IngredientAnalysis[],
  doubtfulIngredients: IngredientAnalysis[],
  hasHalalCertification: boolean,
  isVegan: boolean,
  isVegetarian: boolean,
  totalIngredients: number
): number {
  let score = 100;

  // If product has halal certification, start with high confidence
  if (hasHalalCertification) {
    // Even with certification, haram ingredients are a serious issue
    if (haramIngredients.length > 0) {
      score = 15; // Certification may be invalid or data error
    } else {
      score = 95; // Very high confidence with certification
    }
    return Math.max(0, Math.min(100, score));
  }

  // Vegan products are generally halal (no animal products)
  if (isVegan && haramIngredients.length === 0) {
    // Check for alcohol in vegan products
    const hasAlcohol = haramIngredients.some(h =>
      h.name.includes('alcohol') || h.name.includes('wine') || h.name.includes('beer')
    );
    if (!hasAlcohol) {
      return 95;
    }
  }

  // Vegetarian is good but may have animal by-products
  if (isVegetarian && haramIngredients.length === 0) {
    score = 85;
    // Still check for doubtful ingredients
    for (const doubtful of doubtfulIngredients) {
      score -= (100 - doubtful.confidence) * 0.3;
    }
    return Math.max(40, Math.min(100, score));
  }

  // Deduct heavily for haram ingredients
  for (const haram of haramIngredients) {
    score -= 50 * (haram.confidence / 100);
  }

  // Deduct for doubtful ingredients based on their confidence
  for (const doubtful of doubtfulIngredients) {
    // Lower confidence means more doubtful, so deduct more
    const deduction = (100 - doubtful.confidence) * 0.4;
    score -= deduction;
  }

  // If no ingredients could be parsed, we're uncertain
  if (totalIngredients === 0) {
    score = Math.min(score, 50);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function determineOverallStatus(
  score: number,
  hasHaramIngredients: boolean
): HalalStatus {
  if (hasHaramIngredients || score < 30) {
    return 'haram';
  }
  if (score >= 80) {
    return 'halal';
  }
  if (score >= 50) {
    return 'doubtful';
  }
  return 'doubtful';
}

function generateAnalysisSummary(
  status: HalalStatus,
  score: number,
  haramIngredients: IngredientAnalysis[],
  doubtfulIngredients: IngredientAnalysis[],
  hasHalalCertification: boolean,
  isVegan: boolean,
  isVegetarian: boolean,
  product: Product
): { summary: string; details: string } {
  let summary: string;
  let details: string;

  if (hasHalalCertification && haramIngredients.length === 0) {
    summary = 'This product appears to be Halal certified.';
    details = 'The product has halal certification labels and no haram ingredients were detected.';
  } else if (haramIngredients.length > 0) {
    const haramList = haramIngredients.map(h => h.name).join(', ');
    summary = `This product contains haram ingredient(s): ${haramList}`;
    details = haramIngredients.map(h => `• ${h.name}: ${h.reason}`).join('\n');
  } else if (isVegan) {
    summary = 'This product is vegan and likely halal.';
    details = 'Vegan products contain no animal-derived ingredients, making them generally suitable for halal consumption.';
  } else if (isVegetarian) {
    summary = 'This product is vegetarian with some uncertain ingredients.';
    details = 'While vegetarian, some ingredients may have unclear sources. ';
    if (doubtfulIngredients.length > 0) {
      details += 'Doubtful ingredients:\n' +
        doubtfulIngredients.map(d => `• ${d.name}: ${d.reason}`).join('\n');
    }
  } else if (doubtfulIngredients.length > 0) {
    summary = `This product contains ${doubtfulIngredients.length} ingredient(s) with uncertain halal status.`;
    details = 'The following ingredients have unclear sources:\n' +
      doubtfulIngredients.map(d => `• ${d.name}: ${d.reason}`).join('\n');
  } else if (product.ingredients.length === 0) {
    summary = 'Unable to analyze - no ingredient information available.';
    details = 'This product does not have ingredient information in the database. Consider checking the physical packaging.';
  } else {
    summary = 'This product appears to be halal based on ingredients analysis.';
    details = 'No haram or doubtful ingredients were detected in the ingredients list.';
  }

  // Add score context
  if (score >= 80) {
    details += '\n\n✓ High confidence in halal status.';
  } else if (score >= 50) {
    details += '\n\n⚠ Moderate confidence - some uncertainty exists.';
  } else {
    details += '\n\n✗ Low confidence - recommend avoiding or verifying with manufacturer.';
  }

  return { summary, details };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#2EA043';
  if (score >= 60) return '#56D364';
  if (score >= 40) return '#D29922';
  if (score >= 20) return '#E3B341';
  return '#DA3633';
}

export function getStatusLabel(status: HalalStatus): string {
  switch (status) {
    case 'halal':
      return 'Halal';
    case 'doubtful':
      return 'Doubtful';
    case 'haram':
      return 'Not Halal';
    case 'unknown':
      return 'Unknown';
  }
}
