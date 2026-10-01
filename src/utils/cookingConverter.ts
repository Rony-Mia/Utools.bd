export type UnitType = 'cup' | 'tbsp' | 'tsp' | 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb';

export interface Ingredient {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'baking' | 'dairy' | 'staples' | 'spices';
  gramsPerCup: number; // weight in grams for 1 standard 240ml cup
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'flour', nameBn: 'ময়দা / আটা', nameEn: 'All-Purpose Flour / Atta', category: 'baking', gramsPerCup: 120 },
  { id: 'sugar', nameBn: 'সাদা চিনি (দানাদার)', nameEn: 'Granulated Sugar', category: 'baking', gramsPerCup: 200 },
  { id: 'powdered_sugar', nameBn: 'গুঁড়া চিনি / আইসিং সুগার', nameEn: 'Powdered / Icing Sugar', category: 'baking', gramsPerCup: 120 },
  { id: 'brown_sugar', nameBn: 'লাল চিনি (ব্রাউন সুগার)', nameEn: 'Brown Sugar', category: 'baking', gramsPerCup: 220 },
  { id: 'butter', nameBn: 'মাখন / ঘি', nameEn: 'Butter / Ghee', category: 'dairy', gramsPerCup: 227 },
  { id: 'oil', nameBn: 'সয়াবিন / সরিষার তেল', nameEn: 'Vegetable / Mustard Oil', category: 'staples', gramsPerCup: 218 },
  { id: 'milk', nameBn: 'তরল দুধ', nameEn: 'Whole Milk', category: 'dairy', gramsPerCup: 245 },
  { id: 'water', nameBn: 'পানি', nameEn: 'Water', category: 'staples', gramsPerCup: 240 },
  { id: 'rice', nameBn: 'চাল / পোলাওর চাল', nameEn: 'Rice / Polao Rice', category: 'staples', gramsPerCup: 185 },
  { id: 'cocoa', nameBn: 'কোকো পাউডার', nameEn: 'Cocoa Powder', category: 'baking', gramsPerCup: 100 },
  { id: 'salt', nameBn: 'টেবিল লবণ', nameEn: 'Table Salt', category: 'spices', gramsPerCup: 292 },
  { id: 'baking_powder', nameBn: 'বেকিং পাউডার', nameEn: 'Baking Powder', category: 'baking', gramsPerCup: 192 },
  { id: 'baking_soda', nameBn: 'বেকিং সোডা', nameEn: 'Baking Soda', category: 'baking', gramsPerCup: 220 },
  { id: 'honey', nameBn: 'মধু / মিষ্টি সিরাপ', nameEn: 'Honey / Syrup', category: 'baking', gramsPerCup: 340 },
  { id: 'semolina', nameBn: 'সুজি (হালুয়া সুজি)', nameEn: 'Semolina / Suji', category: 'staples', gramsPerCup: 170 },
  { id: 'lentils', nameBn: 'মসুর / মুগ ডাল', nameEn: 'Lentils / Daal', category: 'staples', gramsPerCup: 190 },
  { id: 'oats', nameBn: 'ওটস (রোল্ড ওটস)', nameEn: 'Rolled Oats', category: 'staples', gramsPerCup: 90 },
];

export const UNITS: Array<{ id: UnitType; nameBn: string; nameEn: string; isVolume: boolean }> = [
  { id: 'cup', nameBn: 'কাপ (Cup - ২৪০ মি.লি.)', nameEn: 'Cup (240ml)', isVolume: true },
  { id: 'tbsp', nameBn: 'টেবিল চামচ (Tablespoon - ১৫ মি.লি.)', nameEn: 'Tablespoon (tbsp)', isVolume: true },
  { id: 'tsp', nameBn: 'চা চামচ (Teaspoon - ৫ মি.লি.)', nameEn: 'Teaspoon (tsp)', isVolume: true },
  { id: 'g', nameBn: 'গ্রাম (Grams - g)', nameEn: 'Grams (g)', isVolume: false },
  { id: 'kg', nameBn: 'কিলোগ্রাম (Kilogram - kg)', nameEn: 'Kilogram (kg)', isVolume: false },
  { id: 'ml', nameBn: 'মিলিলিটার (Milliliter - ml)', nameEn: 'Milliliter (ml)', isVolume: true },
  { id: 'l', nameBn: 'লিটার (Liter - L)', nameEn: 'Liter (L)', isVolume: true },
  { id: 'oz', nameBn: 'আউন্স (Ounce - oz)', nameEn: 'Ounce (oz)', isVolume: false },
  { id: 'lb', nameBn: 'পাউন্ড (Pound - lb)', nameEn: 'Pound (lb)', isVolume: false },
];

// Helper to get ML volume for volume units
function getVolumeInMl(amount: number, unit: UnitType): number {
  switch (unit) {
    case 'cup': return amount * 240;
    case 'tbsp': return amount * 15;
    case 'tsp': return amount * 5;
    case 'ml': return amount;
    case 'l': return amount * 1000;
    default: return 0;
  }
}

// Helper to convert ML volume back to target volume unit
function getFromMl(ml: number, targetUnit: UnitType): number {
  switch (targetUnit) {
    case 'cup': return ml / 240;
    case 'tbsp': return ml / 15;
    case 'tsp': return ml / 5;
    case 'ml': return ml;
    case 'l': return ml / 1000;
    default: return 0;
  }
}

// Helper to get weight in grams
function getWeightInGrams(amount: number, unit: UnitType): number {
  switch (unit) {
    case 'g': return amount;
    case 'kg': return amount * 1000;
    case 'oz': return amount * 28.3495;
    case 'lb': return amount * 453.592;
    default: return 0;
  }
}

// Helper to convert grams back to target weight unit
function getFromGrams(grams: number, targetUnit: UnitType): number {
  switch (targetUnit) {
    case 'g': return grams;
    case 'kg': return grams / 1000;
    case 'oz': return grams / 28.3495;
    case 'lb': return grams / 453.592;
    default: return 0;
  }
}

const VOLUME_UNITS = new Set<UnitType>(['cup', 'tbsp', 'tsp', 'ml', 'l']);
const WEIGHT_UNITS = new Set<UnitType>(['g', 'kg', 'oz', 'lb']);

/**
 * Converts cooking measurement between volume and weight taking ingredient density into account.
 */
export function convertRecipeMeasurement(
  amount: number,
  fromUnit: UnitType,
  toUnit: UnitType,
  ingredientId: string
): number {
  if (amount <= 0 || isNaN(amount)) return 0;
  if (fromUnit === toUnit) return amount;

  const ingredient = INGREDIENTS.find((i) => i.id === ingredientId) || INGREDIENTS[0];
  const gramsPerMl = ingredient.gramsPerCup / 240;

  const isFromVolume = VOLUME_UNITS.has(fromUnit);
  const isToVolume = VOLUME_UNITS.has(toUnit);

  // Case 1: Volume to Volume
  if (isFromVolume && isToVolume) {
    const ml = getVolumeInMl(amount, fromUnit);
    return getFromMl(ml, toUnit);
  }

  // Case 2: Weight to Weight
  if (!isFromVolume && !isToVolume) {
    const grams = getWeightInGrams(amount, fromUnit);
    return getFromGrams(grams, toUnit);
  }

  // Case 3: Volume to Weight
  if (isFromVolume && !isToVolume) {
    const ml = getVolumeInMl(amount, fromUnit);
    const grams = ml * gramsPerMl;
    return getFromGrams(grams, toUnit);
  }

  // Case 4: Weight to Volume
  const grams = getWeightInGrams(amount, fromUnit);
  const ml = grams / gramsPerMl;
  return getFromMl(ml, toUnit);
}

/**
 * Oven temperature conversion
 */
export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function getGasMark(f: number): string {
  if (f < 275) return '1/4 (খুব মৃদু)';
  if (f < 300) return '1/2 (মৃদু)';
  if (f < 325) return '1 (কম আঁচ)';
  if (f < 350) return '2-3 (হালকা কম আঁচ)';
  if (f < 375) return '4 (মাঝারি আঁচ - স্ট্যান্ডার্ড বেকিং)';
  if (f < 400) return '5 (মাঝারি গরম)';
  if (f < 425) return '6 (উচ্চ আঁচ)';
  if (f < 450) return '7 (বেশি গরম)';
  if (f < 475) return '8 (অতিরিক্ত গরম - পেস্ট্রি/রোস্টিং)';
  return '9-10 (সর্বোচ্চ আঁচ - পিজ্জা)';
}

export const POPULAR_OVEN_PRESETS = [
  { f: 300, c: 150, label: 'স্লো কুকিং / ড্রাই বেকিং (Slow Baking)', gas: 'Gas Mark 2' },
  { f: 325, c: 165, label: 'রিচ ফ্রুট কেক ও চিজকেক (Cheesecake)', gas: 'Gas Mark 3' },
  { f: 350, c: 175, label: 'স্ট্যান্ডার্ড স্পঞ্জ কেক, কুকিজ ও কাপকেক', gas: 'Gas Mark 4' },
  { f: 375, c: 190, label: 'বিস্কুট, রোল ও চিকেন রোস্ট', gas: 'Gas Mark 5' },
  { f: 400, c: 200, label: 'পাফ পেস্ট্রি ও ক্রিস্পি পাই', gas: 'Gas Mark 6' },
  { f: 450, c: 230, label: 'হোমমেড পিজ্জা ও নানরুটি', gas: 'Gas Mark 8' },
];
