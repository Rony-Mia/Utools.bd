/**
 * Tiles Calculator Utilities for Utools.bd
 * Based on Bangladeshi ceramic industry standards (DBL, Akij, RAK, Mir, Great Wall, Fresh)
 */

export interface TileSizePreset {
  id: string;
  name: string;
  widthInches: number;
  heightInches: number;
  defaultPcsPerBox: number;
  category: 'wall' | 'floor';
  popularFor?: string;
}

export const WALL_TILE_SIZES: TileSizePreset[] = [
  {
    id: '8x12',
    name: '৮" × ১২" (8" × 12")',
    widthInches: 12,
    heightInches: 8,
    defaultPcsPerBox: 25,
    category: 'wall',
    popularFor: 'বাথরুম ও রান্নাঘর (বাজেট ফ্রেন্ডলি)',
  },
  {
    id: '10x16',
    name: '১০" × ১৬" (10" × 16")',
    widthInches: 16,
    heightInches: 10,
    defaultPcsPerBox: 15,
    category: 'wall',
    popularFor: 'মডার্ন বাথরুম ওয়াল',
  },
  {
    id: '12x18',
    name: '১২" × ১৮" (12" × 18")',
    widthInches: 18,
    heightInches: 12,
    defaultPcsPerBox: 10,
    category: 'wall',
    popularFor: 'প্রিমিয়াম বাথরুম ও কিচেন ওয়াল',
  },
  {
    id: '12x24',
    name: '১২" × ২৪" (12" × 24")',
    widthInches: 24,
    heightInches: 12,
    defaultPcsPerBox: 8,
    category: 'wall',
    popularFor: 'লাক্সারি লার্জ ফরম্যাট ওয়াল',
  },
  {
    id: '10x20',
    name: '১০" × ২০" (10" × 20")',
    widthInches: 20,
    heightInches: 10,
    defaultPcsPerBox: 12,
    category: 'wall',
    popularFor: 'আধুনিক ডিজাইন ওয়াল',
  },
];

export const FLOOR_TILE_SIZES: TileSizePreset[] = [
  {
    id: '24x24',
    name: '২৪" × ২৪" (2 ft × 2 ft)',
    widthInches: 24,
    heightInches: 24,
    defaultPcsPerBox: 4,
    category: 'floor',
    popularFor: 'বেডরুম, ড্রয়িং ও ডাইনিং (সবচেয়ে জনপ্রিয়)',
  },
  {
    id: '16x16',
    name: '১৬" × ১৬" (16" × 16")',
    widthInches: 16,
    heightInches: 16,
    defaultPcsPerBox: 9,
    category: 'floor',
    popularFor: 'ব্যালকনি, সিঁড়ি ও কিচেন ফ্লোর',
  },
  {
    id: '12x12',
    name: '১২" × ১২" (1 ft × 1 ft)',
    widthInches: 12,
    heightInches: 12,
    defaultPcsPerBox: 16,
    category: 'floor',
    popularFor: 'বাথরুম ফ্লোর (নন-স্লিপ খসখসে)',
  },
  {
    id: '32x32',
    name: '৩২" × ৩২" (32" × 32")',
    widthInches: 32,
    heightInches: 32,
    defaultPcsPerBox: 3,
    category: 'floor',
    popularFor: 'লাক্সারি ডুপ্লেক্স ও ড্রয়িং রুম',
  },
  {
    id: '24x48',
    name: '২৪" × ৪৮" (2 ft × 4 ft)',
    widthInches: 48,
    heightInches: 24,
    defaultPcsPerBox: 2,
    category: 'floor',
    popularFor: 'বিগ স্ল্যাব প্রিমিয়াম মার্বেল লুক',
  },
];

export const BANGLADESHI_BRANDS = [
  { id: 'dbl', name: 'DBL Ceramics (ডিবিএল)' },
  { id: 'akij', name: 'Akij Ceramics (আকিজ)' },
  { id: 'rak', name: 'RAK Ceramics (আরএকে)' },
  { id: 'mir', name: 'Mir Ceramic (মীর)' },
  { id: 'greatwall', name: 'Great Wall (গ্রেট ওয়াল)' },
  { id: 'fresh', name: 'Fresh Ceramics (ফ্রেশ)' },
  { id: 'star', name: 'Star Ceramics (স্টার)' },
  { id: 'cbc', name: 'CBC Tiles (সিবিসি)' },
  { id: 'fuwang', name: 'Fu-Wang Ceramic (ফু-ওয়াং)' },
  { id: 'imported', name: 'ইম্পোর্টেড / অন্যান্য ব্র্যান্ড' },
];

export interface WallComboResult {
  sqftPerPiece: number;
  sqftPerBox: number;
  netAreaSft: number;
  grossAreaSft: number;
  totalPieces: number;
  totalBoxesExact: number;
  totalBoxesRounded: number;
  totalLines: number;
  deep: {
    lines: number;
    ratio: number;
    pieces: number;
    boxes: number;
    extraPieces: number;
  };
  decor: {
    lines: number;
    ratio: number;
    pieces: number;
    boxes: number;
    extraPieces: number;
  };
  light: {
    lines: number;
    ratio: number;
    pieces: number;
    boxes: number;
    extraPieces: number;
  };
  grandTotalBoxes: number;
}

export function calculateWallCombo(params: {
  wallAreaSft: number;
  wallHeightFt: number;
  tileHeightInches: number;
  tileWidthInches: number;
  pcsPerBox: number;
  deepLines: number;
  decorLines: number;
  lightLines: number;
  deductionSft?: number;
  wastagePercent?: number;
}): WallComboResult {
  const {
    wallAreaSft,
    wallHeightFt,
    tileHeightInches,
    tileWidthInches,
    pcsPerBox,
    deepLines,
    decorLines,
    lightLines,
    deductionSft = 0,
    wastagePercent = 0,
  } = params;

  const sqftPerPiece = (tileHeightInches * tileWidthInches) / 144;
  const sqftPerBox = sqftPerPiece * pcsPerBox;

  const netAreaSft = Math.max(0, wallAreaSft - deductionSft);
  const grossAreaSft = netAreaSft * (1 + (wastagePercent || 0) / 100);

  const totalPieces = Math.round(grossAreaSft / sqftPerPiece);
  const totalBoxesExact = totalPieces / pcsPerBox;
  const totalBoxesRounded = Math.ceil(totalPieces / pcsPerBox);

  // Vertical lines
  const totalHeightInches = wallHeightFt * 12;
  const totalLines = tileHeightInches > 0 ? totalHeightInches / tileHeightInches : 1;

  const totalSelectedLines = deepLines + decorLines + lightLines;
  const effectiveTotalLines = totalSelectedLines > 0 ? totalSelectedLines : totalLines;

  // Breakdown
  const deepPcs = Math.round((deepLines / effectiveTotalLines) * totalPieces);
  const decorPcs = Math.round((decorLines / effectiveTotalLines) * totalPieces);
  const lightPcs = Math.max(0, totalPieces - deepPcs - decorPcs);

  const deepBoxes = Math.floor(deepPcs / pcsPerBox);
  const deepExtra = deepPcs % pcsPerBox;

  const decorBoxes = Math.floor(decorPcs / pcsPerBox);
  const decorExtra = decorPcs % pcsPerBox;

  const lightBoxes = Math.floor(lightPcs / pcsPerBox);
  const lightExtra = lightPcs % pcsPerBox;

  // Total boxes considering buying full boxes for each variant
  const deepTotalBoxes = Math.ceil(deepPcs / pcsPerBox);
  const decorTotalBoxes = Math.ceil(decorPcs / pcsPerBox);
  const lightTotalBoxes = Math.ceil(lightPcs / pcsPerBox);
  const grandTotalBoxes = deepTotalBoxes + decorTotalBoxes + lightTotalBoxes;

  return {
    sqftPerPiece,
    sqftPerBox,
    netAreaSft,
    grossAreaSft,
    totalPieces,
    totalBoxesExact,
    totalBoxesRounded,
    totalLines,
    deep: {
      lines: deepLines,
      ratio: deepLines / effectiveTotalLines,
      pieces: deepPcs,
      boxes: deepBoxes,
      extraPieces: deepExtra,
    },
    decor: {
      lines: decorLines,
      ratio: decorLines / effectiveTotalLines,
      pieces: decorPcs,
      boxes: decorBoxes,
      extraPieces: decorExtra,
    },
    light: {
      lines: lightLines,
      ratio: lightLines / effectiveTotalLines,
      pieces: lightPcs,
      boxes: lightBoxes,
      extraPieces: lightExtra,
    },
    grandTotalBoxes,
  };
}

export interface FloorTilesResult {
  floorAreaSft: number;
  skirtingAreaSft: number;
  totalNetAreaSft: number;
  totalGrossAreaSft: number;
  sqftPerPiece: number;
  sqftPerBox: number;
  floorPieces: number;
  skirtingPieces: number;
  wastagePieces: number;
  totalPieces: number;
  fullBoxes: number;
  extraPieces: number;
  totalBoxesNeeded: number;
}

export function calculateFloorTiles(params: {
  lengthFt?: number;
  widthFt?: number;
  directAreaSft?: number;
  tileLengthInches: number;
  tileWidthInches: number;
  pcsPerBox: number;
  skirtingHeightInches?: number;
  wastagePercent?: number;
}): FloorTilesResult {
  const {
    lengthFt = 0,
    widthFt = 0,
    directAreaSft = 0,
    tileLengthInches,
    tileWidthInches,
    pcsPerBox,
    skirtingHeightInches = 4,
    wastagePercent = 5,
  } = params;

  const sqftPerPiece = (tileLengthInches * tileWidthInches) / 144;
  const sqftPerBox = sqftPerPiece * pcsPerBox;

  let floorAreaSft = directAreaSft > 0 ? directAreaSft : lengthFt * widthFt;
  let skirtingAreaSft = 0;

  if (skirtingHeightInches > 0) {
    if (lengthFt > 0 && widthFt > 0) {
      const perimeter = 2 * (lengthFt + widthFt);
      skirtingAreaSft = perimeter * (skirtingHeightInches / 12);
    } else if (floorAreaSft > 0) {
      // Estimate perimeter for square room: 4 * sqrt(area)
      const approxSide = Math.sqrt(floorAreaSft);
      const perimeter = 4 * approxSide;
      skirtingAreaSft = perimeter * (skirtingHeightInches / 12);
    }
  }

  const totalNetAreaSft = floorAreaSft + skirtingAreaSft;
  const totalGrossAreaSft = totalNetAreaSft * (1 + (wastagePercent || 0) / 100);

  const floorPieces = Math.ceil(floorAreaSft / sqftPerPiece);
  const skirtingPieces = Math.ceil(skirtingAreaSft / sqftPerPiece);
  const totalPieces = Math.ceil(totalGrossAreaSft / sqftPerPiece);
  const wastagePieces = Math.max(0, totalPieces - floorPieces - skirtingPieces);

  const fullBoxes = Math.floor(totalPieces / pcsPerBox);
  const extraPieces = totalPieces % pcsPerBox;
  const totalBoxesNeeded = Math.ceil(totalPieces / pcsPerBox);

  return {
    floorAreaSft,
    skirtingAreaSft,
    totalNetAreaSft,
    totalGrossAreaSft,
    sqftPerPiece,
    sqftPerBox,
    floorPieces,
    skirtingPieces,
    wastagePieces,
    totalPieces,
    fullBoxes,
    extraPieces,
    totalBoxesNeeded,
  };
}

export interface MaterialCostResult {
  cementBags: number;
  sandCft: number;
  groutKg: number;
  tileCost: number;
  cementCost: number;
  sandCost: number;
  groutCost: number;
  laborCost: number;
  totalEstimatedCost: number;
}

export function calculateMaterialAndCost(params: {
  totalAreaSft: number;
  totalBoxes: number;
  pricePerBox?: number;
  pricePerSft?: number;
  laborCostPerSft?: number;
  cementBagPrice?: number;
  sandPricePerCft?: number;
  groutPricePerKg?: number;
}): MaterialCostResult {
  const {
    totalAreaSft,
    totalBoxes,
    pricePerBox = 0,
    pricePerSft = 0,
    laborCostPerSft = 22,
    cementBagPrice = 520,
    sandPricePerCft = 45,
    groutPricePerKg = 120,
  } = params;

  // Material formulas (BD construction benchmarks):
  // 100 sft tiling needs approx 3.2 bags cement
  const cementBags = Math.round((totalAreaSft / 100) * 3.2 * 10) / 10;
  // 100 sft tiling needs approx 11 cft sand
  const sandCft = Math.round((totalAreaSft / 100) * 11);
  // 100 sft tiling needs approx 1.0 kg grout powder
  const groutKg = Math.round((totalAreaSft / 100) * 1.0 * 10) / 10;

  let tileCost = 0;
  if (pricePerBox > 0) {
    tileCost = totalBoxes * pricePerBox;
  } else if (pricePerSft > 0) {
    tileCost = totalAreaSft * pricePerSft;
  }

  const cementCost = Math.round(cementBags * cementBagPrice);
  const sandCost = Math.round(sandCft * sandPricePerCft);
  const groutCost = Math.round(groutKg * groutPricePerKg);
  const laborCost = Math.round(totalAreaSft * laborCostPerSft);

  const totalEstimatedCost = tileCost + cementCost + sandCost + groutCost + laborCost;

  return {
    cementBags,
    sandCft,
    groutKg,
    tileCost,
    cementCost,
    sandCost,
    groutCost,
    laborCost,
    totalEstimatedCost,
  };
}
