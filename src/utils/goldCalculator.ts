/**
 * Gold Weight & Price Calculator Utilities (Bangladesh Jewellers Association / BAJUS Standards)
 * 1 Bhori (ভরি / তোলা) = 11.664 Grams (গ্রাম)
 * 1 Bhori = 16 Aana (আনা)
 * 1 Aana = 6 Roti (রতি) => 1 Bhori = 96 Roti
 * 1 Roti = 10 Points (পয়েন্ট) => 1 Bhori = 960 Points (Traditional standard: 1 point = 0.01215 g)
 */

export const BHORI_IN_GRAMS = 11.664;
export const AANA_PER_BHORI = 16;
export const ROTI_PER_AANA = 6;
export const ROTI_PER_BHORI = 96;
export const POINTS_PER_ROTI = 10;
export const POINTS_PER_BHORI = 960;

export const GRAMS_PER_AANA = BHORI_IN_GRAMS / AANA_PER_BHORI; // 0.729 g
export const GRAMS_PER_ROTI = BHORI_IN_GRAMS / ROTI_PER_BHORI; // 0.1215 g
export const GRAMS_PER_POINT = BHORI_IN_GRAMS / POINTS_PER_BHORI; // 0.01215 g

export type GoldKarat = '22k' | '21k' | '18k' | 'traditional';

export interface KaratInfo {
  label: string;
  purityPercent: number;
  hallmarkCode: string;
  defaultPricePerBhori: number;
  description: string;
}

export const KARAT_PRESETS: Record<GoldKarat, KaratInfo> = {
  '22k': {
    label: '২২ ক্যারেট (ক্যাডমিয়াম)',
    purityPercent: 91.6,
    hallmarkCode: '916',
    defaultPricePerBhori: 140000,
    description: 'সর্বোচ্চ খাঁটি গহনার সোনা (৯১.৬% খাঁটি স্বর্ণ + ৮.৪% খাদ মিশ্রণ)'
  },
  '21k': {
    label: '২১ ক্যারেট',
    purityPercent: 87.5,
    hallmarkCode: '875',
    defaultPricePerBhori: 133600,
    description: 'বাংলাদেশে ঐতিহ্যবাহী ও টেকসই গহনার মানদণ্ড (৮৭.৫% খাঁটি স্বর্ণ)'
  },
  '18k': {
    label: '১৮ ক্যারেট',
    purityPercent: 75.0,
    hallmarkCode: '750',
    defaultPricePerBhori: 114500,
    description: 'হীরা ও দামি পাথরের জুয়েলারির জন্য আদর্শ শক্ত সোনা (৭৫.০% খাঁটি স্বর্ণ)'
  },
  traditional: {
    label: 'সনাতন পদ্ধতি (Traditional)',
    purityPercent: 50.0,
    hallmarkCode: 'সনাতন',
    defaultPricePerBhori: 94500,
    description: 'হলমার্কহীন প্রাচীন সনাতন পদ্ধতির সোনা (খাঁটিত্বের কোনো নির্দিষ্ট কোড নেই)'
  }
};

export interface TraditionalWeight {
  bhori: number;
  aana: number;
  roti: number;
  point: number;
}

/**
 * Converts traditional units (Bhori, Aana, Roti, Point) to exact grams.
 */
export function traditionalToGrams(
  bhori: number = 0,
  aana: number = 0,
  roti: number = 0,
  point: number = 0
): number {
  const safeBhori = Math.max(0, bhori || 0);
  const safeAana = Math.max(0, aana || 0);
  const safeRoti = Math.max(0, roti || 0);
  const safePoint = Math.max(0, point || 0);

  const grams =
    safeBhori * BHORI_IN_GRAMS +
    safeAana * GRAMS_PER_AANA +
    safeRoti * GRAMS_PER_ROTI +
    safePoint * GRAMS_PER_POINT;

  return Math.round(grams * 10000) / 10000;
}

/**
 * Converts traditional units to total Bhori as a floating decimal.
 */
export function traditionalToTotalBhori(
  bhori: number = 0,
  aana: number = 0,
  roti: number = 0,
  point: number = 0
): number {
  const grams = traditionalToGrams(bhori, aana, roti, point);
  return grams / BHORI_IN_GRAMS;
}

/**
 * Converts grams into broken-down traditional units (Bhori, Aana, Roti, Point).
 */
export function gramsToTraditional(grams: number): TraditionalWeight {
  if (!grams || grams <= 0) {
    return { bhori: 0, aana: 0, roti: 0, point: 0 };
  }

  // Work with integer points for exact precision (1 point = 0.01215g)
  // Total points = grams / 0.01215
  const totalPoints = Math.round((grams / GRAMS_PER_POINT) * 100) / 100;

  const bhori = Math.floor(totalPoints / POINTS_PER_BHORI);
  const remPointsAfterBhori = totalPoints % POINTS_PER_BHORI;

  const pointsPerAana = POINTS_PER_BHORI / AANA_PER_BHORI; // 60 points
  const aana = Math.floor(remPointsAfterBhori / pointsPerAana);
  const remPointsAfterAana = remPointsAfterBhori % pointsPerAana;

  const roti = Math.floor(remPointsAfterAana / POINTS_PER_ROTI); // 10 points per roti
  const point = Math.round((remPointsAfterAana % POINTS_PER_ROTI) * 100) / 100;

  return {
    bhori,
    aana,
    roti,
    point
  };
}

export type MakingChargeType = 'percentage' | 'per_bhori' | 'per_gram' | 'fixed';

export interface GoldPriceCalculationParams {
  weightInBhori: number;
  pricePerBhori: number;
  makingChargeType: MakingChargeType;
  makingChargeValue: number;
  vatPercent?: number; // Default 5%
}

export interface GoldPriceCalculationResult {
  weightInBhori: number;
  weightInGrams: number;
  pricePerBhori: number;
  pricePerGram: number;
  goldBasePrice: number;
  makingCharge: number;
  subtotal: number;
  vatPercent: number;
  vatAmount: number;
  totalPrice: number;
}

/**
 * Calculates new jewelry purchasing price with making charges and VAT.
 */
export function calculateGoldPrice({
  weightInBhori,
  pricePerBhori,
  makingChargeType,
  makingChargeValue,
  vatPercent = 5
}: GoldPriceCalculationParams): GoldPriceCalculationResult {
  const safeWeightBhori = Math.max(0, weightInBhori || 0);
  const safePriceBhori = Math.max(0, pricePerBhori || 0);
  const weightInGrams = Math.round(safeWeightBhori * BHORI_IN_GRAMS * 1000) / 1000;
  const pricePerGram = safePriceBhori / BHORI_IN_GRAMS;

  const goldBasePrice = safeWeightBhori * safePriceBhori;

  let makingCharge = 0;
  if (makingChargeType === 'percentage') {
    makingCharge = goldBasePrice * (Math.max(0, makingChargeValue || 0) / 100);
  } else if (makingChargeType === 'per_bhori') {
    makingCharge = safeWeightBhori * Math.max(0, makingChargeValue || 0);
  } else if (makingChargeType === 'per_gram') {
    makingCharge = weightInGrams * Math.max(0, makingChargeValue || 0);
  } else {
    makingCharge = Math.max(0, makingChargeValue || 0);
  }

  const subtotal = goldBasePrice + makingCharge;
  const safeVatPercent = Math.max(0, vatPercent || 0);
  const vatAmount = subtotal * (safeVatPercent / 100);
  const totalPrice = Math.round(subtotal + vatAmount);

  return {
    weightInBhori: Math.round(safeWeightBhori * 10000) / 10000,
    weightInGrams,
    pricePerBhori: safePriceBhori,
    pricePerGram: Math.round(pricePerGram * 100) / 100,
    goldBasePrice: Math.round(goldBasePrice),
    makingCharge: Math.round(makingCharge),
    subtotal: Math.round(subtotal),
    vatPercent: safeVatPercent,
    vatAmount: Math.round(vatAmount),
    totalPrice
  };
}

export type OldGoldTradeType = 'exchange' | 'cash';

export interface OldGoldExchangeParams {
  weightInBhori: number;
  pricePerBhori: number;
  tradeType: OldGoldTradeType;
  deductionPercent?: number; // Usually 10% for exchange, 20% for cash
  stoneWeightGrams?: number; // Weight of embedded gems/dirt to deduct
}

export interface OldGoldExchangeResult {
  initialWeightGrams: number;
  stoneWeightGrams: number;
  netWeightGrams: number;
  netWeightBhori: number;
  grossValue: number;
  deductionPercent: number;
  deductionAmount: number;
  netPayout: number;
}

/**
 * Calculates old gold exchange (বদল) or cash sell (নগদ বিক্রয়) payout.
 */
export function calculateOldGoldTrade({
  weightInBhori,
  pricePerBhori,
  tradeType,
  deductionPercent,
  stoneWeightGrams = 0
}: OldGoldExchangeParams): OldGoldExchangeResult {
  const initialWeightGrams = weightInBhori * BHORI_IN_GRAMS;
  const safeStoneGrams = Math.max(0, stoneWeightGrams || 0);
  const netWeightGrams = Math.max(0, initialWeightGrams - safeStoneGrams);
  const netWeightBhori = netWeightGrams / BHORI_IN_GRAMS;

  const defaultDeduction = tradeType === 'exchange' ? 10 : 20;
  const safeDeductionPercent =
    typeof deductionPercent === 'number' && !isNaN(deductionPercent)
      ? Math.max(0, deductionPercent)
      : defaultDeduction;

  const grossValue = netWeightBhori * pricePerBhori;
  const deductionAmount = grossValue * (safeDeductionPercent / 100);
  const netPayout = Math.round(grossValue - deductionAmount);

  return {
    initialWeightGrams: Math.round(initialWeightGrams * 1000) / 1000,
    stoneWeightGrams: safeStoneGrams,
    netWeightGrams: Math.round(netWeightGrams * 1000) / 1000,
    netWeightBhori: Math.round(netWeightBhori * 10000) / 10000,
    grossValue: Math.round(grossValue),
    deductionPercent: safeDeductionPercent,
    deductionAmount: Math.round(deductionAmount),
    netPayout
  };
}
