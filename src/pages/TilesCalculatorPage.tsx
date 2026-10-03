import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Grid,
  Layers,
  Copy,
  Check,
  Share2,
  Printer,
  Download,
  Loader2,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Info,
  DollarSign,
  AlertTriangle,
  Building,
  CheckCircle2,
  X,
  DoorOpen,
  Globe,
} from 'lucide-react';
import {
  WALL_TILE_SIZES,
  FLOOR_TILE_SIZES,
  calculateWallCombo,
  calculateFloorTiles,
} from '../utils/tilesCalculator.ts';
import { toBanglaNum } from '../utils/bnDigits.ts';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/tiles-calculator.json';

interface RoomRecord {
  id: string;
  name: string;
  // Wall Part
  hasWall: boolean;
  wallAreaSft: number;
  wallHeightFt: number;
  wallTileSizeName: string;
  wallTileW: number;
  wallTileH: number;
  wallPcsPerBox: number;
  wallRatePerSft: number;
  hasSeparateDecorRate: boolean;
  decorRatePerPcs: number;
  deepLines: number;
  decorLines: number;
  lightLines: number;
  deepBoxes: number;
  decorBoxes: number;
  lightBoxes: number;
  deepPcs: number;
  decorPcs: number;
  lightPcs: number;
  wallTotalBoxes: number;
  wallTotalPcs: number;
  wallCost: number;

  // Floor Part
  hasFloor: boolean;
  floorAreaSft: number;
  floorTileSizeName: string;
  floorTileW: number;
  floorTileH: number;
  floorPcsPerBox: number;
  floorRatePerSft: number;
  skirtingInches: number;
  floorWastagePercent: number;
  floorTotalBoxes: number;
  floorTotalPcs: number;
  floorCost: number;

  // Materials & Combined for this room
  combinedAreaSft: number;
  totalRoomCost: number;
  cementBags: number;
  sandCft: number;
  groutKg: number;
}

export const TilesCalculatorPage: React.FC = () => {
  // Global settings for labor & materials rate
  const [laborCostPerSft, setLaborCostPerSft] = useState<number>(22);
  const [cementBagPrice, setCementBagPrice] = useState<number>(520);
  const [sandPricePerCft, setSandPricePerCft] = useState<number>(45);
  const [groutPricePerKg, setGroutPricePerKg] = useState<number>(130);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── Form Input State ──
  const [roomName, setRoomName] = useState<string>('মাস্টার বাথরুম');

  // Wall Tile State
  const [wallInputMode, setWallInputMode] = useState<'direct' | 'dimensions'>('direct');
  const [wallPerimeterFt, setWallPerimeterFt] = useState<number>(50);
  const [wallDirectSft, setWallDirectSft] = useState<number>(350);
  const [wallHeightFt, setWallHeightFt] = useState<number>(7);
  const [wallDeductionSft, setWallDeductionSft] = useState<number>(20);
  const [wallRatePerSft, setWallRatePerSft] = useState<number>(65);

  const [hasSeparateDecorRate, setHasSeparateDecorRate] = useState<boolean>(true);
  const [decorRatePerPcs, setDecorRatePerPcs] = useState<number>(180);

  const [selectedWallSizeId, setSelectedWallSizeId] = useState<string>('8x12');
  const [isCustomWallSize, setIsCustomWallSize] = useState<boolean>(false);
  const [customWallTileW, setCustomWallTileW] = useState<number>(12);
  const [customWallTileH, setCustomWallTileH] = useState<number>(8);
  const [wallPcsPerBox, setWallPcsPerBox] = useState<number>(25);

  const [deepLines, setDeepLines] = useState<number>(5.5);
  const [decorLines, setDecorLines] = useState<number>(1);
  const [lightLines, setLightLines] = useState<number>(4);

  // Floor Tile State
  const [floorInputMode, setFloorInputMode] = useState<'direct' | 'dimensions'>('dimensions');
  const [floorLengthFt, setFloorLengthFt] = useState<number>(8);
  const [floorWidthFt, setFloorWidthFt] = useState<number>(6);
  const [floorDirectSft, setFloorDirectSft] = useState<number>(48);
  const [floorRatePerSft, setFloorRatePerSft] = useState<number>(80);

  const [selectedFloorSizeId, setSelectedFloorSizeId] = useState<string>('12x12');
  const [isCustomFloorSize, setIsCustomFloorSize] = useState<boolean>(false);
  const [customFloorTileW, setCustomFloorTileW] = useState<number>(12);
  const [customFloorTileH, setCustomFloorTileH] = useState<number>(12);
  const [floorPcsPerBox, setFloorPcsPerBox] = useState<number>(16);
  const [skirtingHeightInches, setSkirtingHeightInches] = useState<number>(4);
  const [floorWastagePercent, setFloorWastagePercent] = useState<number>(5);

  // ── Edit State for Multi-Room ──
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // ── Initial House Rooms (Empty by default) ──
  const [houseRooms, setHouseRooms] = useState<RoomRecord[]>([]);

  // ── PDF Generation Loading State ──
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  // Copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  const currentlyEditingRoom = useMemo(
    () => houseRooms.find((r) => r.id === editingRoomId),
    [houseRooms, editingRoomId]
  );

  // ── Wall Size Handler ──
  const handleWallSizeChange = (id: string) => {
    if (id === 'custom') {
      setIsCustomWallSize(true);
      setSelectedWallSizeId('custom');
      return;
    }
    setIsCustomWallSize(false);
    setSelectedWallSizeId(id);
    const preset = WALL_TILE_SIZES.find((s) => s.id === id);
    if (preset) {
      setCustomWallTileW(preset.widthInches);
      setCustomWallTileH(preset.heightInches);
      setWallPcsPerBox(preset.defaultPcsPerBox);

      const totalLines = (wallHeightFt * 12) / preset.heightInches;
      const defaultDecor = 1;
      const remaining = Math.max(0, totalLines - defaultDecor);
      setDeepLines(Math.round(remaining * 0.55 * 10) / 10);
      setDecorLines(defaultDecor);
      setLightLines(Math.round(remaining * 0.45 * 10) / 10);
    }
  };

  // ── Floor Size Handler ──
  const handleFloorSizeChange = (id: string) => {
    if (id === 'custom') {
      setIsCustomFloorSize(true);
      setSelectedFloorSizeId('custom');
      return;
    }
    setIsCustomFloorSize(false);
    setSelectedFloorSizeId(id);
    const preset = FLOOR_TILE_SIZES.find((s) => s.id === id);
    if (preset) {
      setCustomFloorTileW(preset.widthInches);
      setCustomFloorTileH(preset.heightInches);
      setFloorPcsPerBox(preset.defaultPcsPerBox);
    }
  };

  // ── Computed Gross Wall Area ──
  const calculatedWallGrossSft = useMemo(() => {
    if (wallInputMode === 'dimensions') {
      return (wallPerimeterFt || 0) * (wallHeightFt || 0);
    }
    return wallDirectSft || 0;
  }, [wallInputMode, wallPerimeterFt, wallHeightFt, wallDirectSft]);

  const effectiveWallAreaSft = Math.max(0, calculatedWallGrossSft - (wallDeductionSft || 0));

  // ── Computed Gross Floor Area ──
  const calculatedFloorAreaSft = useMemo(() => {
    if (floorInputMode === 'dimensions') {
      return (floorLengthFt || 0) * (floorWidthFt || 0);
    }
    return floorDirectSft || 0;
  }, [floorInputMode, floorLengthFt, floorWidthFt, floorDirectSft]);

  // ── Live Wall Combo Calculation ──
  const currentWallCombo = useMemo(() => {
    return calculateWallCombo({
      wallAreaSft: effectiveWallAreaSft,
      wallHeightFt: wallHeightFt || 7,
      tileHeightInches: customWallTileH || 8,
      tileWidthInches: customWallTileW || 12,
      pcsPerBox: wallPcsPerBox || 25,
      deepLines,
      decorLines,
      lightLines,
      deductionSft: 0,
      wastagePercent: 0,
    });
  }, [
    effectiveWallAreaSft,
    wallHeightFt,
    customWallTileH,
    customWallTileW,
    wallPcsPerBox,
    deepLines,
    decorLines,
    lightLines,
  ]);

  // ── Live Floor Calculation ──
  const currentFloorResult = useMemo(() => {
    return calculateFloorTiles({
      directAreaSft: calculatedFloorAreaSft,
      tileLengthInches: customFloorTileW || 12,
      tileWidthInches: customFloorTileH || 12,
      pcsPerBox: floorPcsPerBox || 16,
      skirtingHeightInches,
      wastagePercent: floorWastagePercent,
    });
  }, [
    calculatedFloorAreaSft,
    customFloorTileW,
    customFloorTileH,
    floorPcsPerBox,
    skirtingHeightInches,
    floorWastagePercent,
  ]);

  // ── Live Cost for Current Room ──
  const currentRoomWallCost = useMemo(() => {
    if (effectiveWallAreaSft <= 0) return 0;
    if (hasSeparateDecorRate) {
      const nonDecorPieces = currentWallCombo.deep.pieces + currentWallCombo.light.pieces;
      const nonDecorSft = nonDecorPieces * currentWallCombo.sqftPerPiece;
      const nonDecorCost = nonDecorSft * wallRatePerSft;
      const decorCost = currentWallCombo.decor.pieces * (decorRatePerPcs || 0);
      return Math.round(nonDecorCost + decorCost);
    }
    return Math.round(effectiveWallAreaSft * wallRatePerSft);
  }, [
    effectiveWallAreaSft,
    hasSeparateDecorRate,
    currentWallCombo,
    wallRatePerSft,
    decorRatePerPcs,
  ]);

  const currentRoomFloorCost = useMemo(() => {
    if (calculatedFloorAreaSft <= 0) return 0;
    return Math.round(currentFloorResult.totalGrossAreaSft * (floorRatePerSft || 0));
  }, [calculatedFloorAreaSft, currentFloorResult, floorRatePerSft]);

  const currentRoomTotalArea = (effectiveWallAreaSft > 0 ? effectiveWallAreaSft : 0) + (calculatedFloorAreaSft > 0 ? currentFloorResult.totalGrossAreaSft : 0);
  const currentRoomTotalCost = currentRoomWallCost + currentRoomFloorCost;

  // 150 sft = 1 kg putting / grout
  const currentRoomCementBags = Math.round((currentRoomTotalArea / 100) * 3.2 * 10) / 10;
  const currentRoomSandCft = Math.round((currentRoomTotalArea / 100) * 11);
  const currentRoomGroutKg = Math.round((currentRoomTotalArea / 150) * 10) / 10;

  // ── Save or Update Room with Flexible SFT Validation ──
  const handleSaveRoom = () => {
    setValidationError(null);

    const isWallActive = effectiveWallAreaSft > 0;
    const isFloorActive = calculatedFloorAreaSft > 0;

    if (!isWallActive && !isFloorActive) {
      setValidationError('ওয়াল অথবা ফ্লোর টাইলসের অন্তত একটির পরিমাপ (SFT) দিন। দুটোই খালি রেখে রুম যোগ করা যাবে না।');
      return;
    }

    const wallSizeLabel = isCustomWallSize
      ? `${customWallTileH}" × ${customWallTileW}" (কাস্টম)`
      : WALL_TILE_SIZES.find((s) => s.id === selectedWallSizeId)?.name || '৮" × ১২"';

    const floorSizeLabel = isCustomFloorSize
      ? `${customFloorTileH}" × ${customFloorTileW}" (কাস্টম)`
      : FLOOR_TILE_SIZES.find((s) => s.id === selectedFloorSizeId)?.name || '২৪" × ২৪"';

    const roomArea =
      (isWallActive ? effectiveWallAreaSft : 0) +
      (isFloorActive ? currentFloorResult.totalGrossAreaSft : 0);
    const roomCost =
      (isWallActive ? currentRoomWallCost : 0) +
      (isFloorActive ? currentRoomFloorCost : 0);
    const roomCementBags = Math.round((roomArea / 100) * 3.2 * 10) / 10;
    const roomSandCft = Math.round((roomArea / 100) * 11);
    const roomGroutKg = Math.round((roomArea / 150) * 10) / 10;

    const newRoom: RoomRecord = {
      id: editingRoomId || Date.now().toString(),
      name: roomName.trim() || `রুম ${houseRooms.length + 1}`,
      hasWall: isWallActive,
      wallAreaSft: isWallActive ? Math.round(effectiveWallAreaSft) : 0,
      wallHeightFt: isWallActive ? wallHeightFt : 0,
      wallTileSizeName: isWallActive ? wallSizeLabel : '',
      wallTileW: customWallTileW,
      wallTileH: customWallTileH,
      wallPcsPerBox,
      wallRatePerSft,
      hasSeparateDecorRate,
      decorRatePerPcs,
      deepLines: isWallActive ? deepLines : 0,
      decorLines: isWallActive ? decorLines : 0,
      lightLines: isWallActive ? lightLines : 0,
      deepBoxes: isWallActive ? currentWallCombo.deep.boxes : 0,
      decorBoxes: isWallActive ? currentWallCombo.decor.boxes : 0,
      lightBoxes: isWallActive ? currentWallCombo.light.boxes : 0,
      deepPcs: isWallActive ? currentWallCombo.deep.pieces : 0,
      decorPcs: isWallActive ? currentWallCombo.decor.pieces : 0,
      lightPcs: isWallActive ? currentWallCombo.light.pieces : 0,
      wallTotalBoxes: isWallActive ? currentWallCombo.grandTotalBoxes : 0,
      wallTotalPcs: isWallActive ? currentWallCombo.totalPieces : 0,
      wallCost: isWallActive ? currentRoomWallCost : 0,

      hasFloor: isFloorActive,
      floorAreaSft: isFloorActive ? Math.round(currentFloorResult.totalGrossAreaSft) : 0,
      floorTileSizeName: isFloorActive ? floorSizeLabel : '',
      floorTileW: customFloorTileW,
      floorTileH: customFloorTileH,
      floorPcsPerBox,
      floorRatePerSft,
      skirtingInches: skirtingHeightInches,
      floorWastagePercent,
      floorTotalBoxes: isFloorActive ? currentFloorResult.totalBoxesNeeded : 0,
      floorTotalPcs: isFloorActive ? currentFloorResult.totalPieces : 0,
      floorCost: isFloorActive ? currentRoomFloorCost : 0,

      combinedAreaSft: Math.round(roomArea),
      totalRoomCost: roomCost,
      cementBags: roomCementBags,
      sandCft: roomSandCft,
      groutKg: roomGroutKg,
    };

    if (editingRoomId) {
      setHouseRooms(houseRooms.map((r) => (r.id === editingRoomId ? newRoom : r)));
      setSuccessMessage(`✓ "${newRoom.name}"-এর তথ্য সফলভাবে আপডেট করা হয়েছে!`);
      setEditingRoomId(null);
    } else {
      setHouseRooms([...houseRooms, newRoom]);
      setSuccessMessage(`✓ "${newRoom.name}" সফলভাবে পুরো বাড়ির তালিকায় যোগ হয়েছে!`);
    }

    // ── Form Reset with clean placeholders ──
    setRoomName('');
    setWallDirectSft(0);
    setWallPerimeterFt(0);
    setWallDeductionSft(0);
    setFloorDirectSft(0);
    setFloorLengthFt(0);
    setFloorWidthFt(0);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // ── Load room into form for editing ──
  const handleEditRoom = (room: RoomRecord) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);

    if (room.hasWall) {
      setWallInputMode('direct');
      setWallDirectSft(room.wallAreaSft);
      setWallHeightFt(room.wallHeightFt);
      setWallRatePerSft(room.wallRatePerSft);
      setHasSeparateDecorRate(room.hasSeparateDecorRate);
      setDecorRatePerPcs(room.decorRatePerPcs);
      setCustomWallTileW(room.wallTileW);
      setCustomWallTileH(room.wallTileH);
      setWallPcsPerBox(room.wallPcsPerBox);
      setDeepLines(room.deepLines);
      setDecorLines(room.decorLines);
      setLightLines(room.lightLines);
    } else {
      setWallInputMode('direct');
      setWallDirectSft(0);
      setWallPerimeterFt(0);
      setWallDeductionSft(0);
    }

    if (room.hasFloor) {
      setFloorInputMode('direct');
      setFloorDirectSft(room.floorAreaSft);
      setFloorRatePerSft(room.floorRatePerSft);
      setCustomFloorTileW(room.floorTileW);
      setCustomFloorTileH(room.floorTileH);
      setFloorPcsPerBox(room.floorPcsPerBox);
      setSkirtingHeightInches(room.skirtingInches);
      setFloorWastagePercent(room.floorWastagePercent);
    } else {
      setFloorInputMode('direct');
      setFloorDirectSft(0);
      setFloorLengthFt(0);
      setFloorWidthFt(0);
    }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDeleteRoom = (id: string) => {
    setHouseRooms(houseRooms.filter((r) => r.id !== id));
    if (editingRoomId === id) setEditingRoomId(null);
  };

  // ── Grand Total Calculations ──
  const grandTotal = useMemo(() => {
    let totalArea = 0;
    let totalWallBoxes = 0;
    let totalFloorBoxes = 0;
    let totalTileCost = 0;
    let totalCementBags = 0;
    let totalSandCft = 0;
    let totalGroutKg = 0;

    houseRooms.forEach((r) => {
      totalArea += r.combinedAreaSft;
      totalWallBoxes += r.wallTotalBoxes;
      totalFloorBoxes += r.floorTotalBoxes;
      totalTileCost += r.totalRoomCost;
      totalCementBags += r.cementBags;
      totalSandCft += r.sandCft;
      totalGroutKg += r.groutKg;
    });

    const totalCementCost = Math.round(totalCementBags * cementBagPrice);
    const totalSandCost = Math.round(totalSandCft * sandPricePerCft);
    const totalGroutCost = Math.round(totalGroutKg * groutPricePerKg);
    const totalLaborCost = Math.round(totalArea * laborCostPerSft);
    const grandProjectCost =
      totalTileCost + totalCementCost + totalSandCost + totalGroutCost + totalLaborCost;

    return {
      totalArea,
      totalWallBoxes,
      totalFloorBoxes,
      totalBoxes: totalWallBoxes + totalFloorBoxes,
      totalTileCost,
      totalCementBags: Math.round(totalCementBags * 10) / 10,
      totalSandCft,
      totalGroutKg: Math.round(totalGroutKg * 10) / 10,
      totalCementCost,
      totalSandCost,
      totalGroutCost,
      totalLaborCost,
      grandProjectCost,
    };
  }, [houseRooms, cementBagPrice, sandPricePerCft, groutPricePerKg, laborCostPerSft]);

  // ── Full Room-by-Room Memo Generator for WhatsApp ──
  const generateFullMemoText = () => {
    let message = `📋 *Utools.bd — পুরো বাড়ির টাইলস ও খরচ মেমো*\n`;
    message += `🔗 *ক্যালকুলেটর টুল লিঙ্ক:* https://utools.bd/tiles-calculator\n`;
    message += `📅 তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    message += `🏠 মোট রুম: ${toBanglaNum(houseRooms.length)} টি | মোট এরিয়া: ${toBanglaNum(grandTotal.totalArea)} SFT\n`;
    message += `------------------------------------------\n\n`;

    houseRooms.forEach((r, idx) => {
      message += `*${toBanglaNum(idx + 1)}. ${r.name}* (মোট ${toBanglaNum(r.combinedAreaSft)} SFT)\n`;
      if (r.hasWall) {
        message += `   🧱 *ওয়াল টাইলস:* ${toBanglaNum(r.wallAreaSft)} SFT [সাইজ: ${r.wallTileSizeName}]\n`;
        message += `      • মোট কার্টন: ${toBanglaNum(r.wallTotalBoxes)} টি (${toBanglaNum(r.wallTotalPcs)} পিস)\n`;
        message += `      • ডিপ: ${toBanglaNum(r.deepBoxes)} কার্টন (${toBanglaNum(r.deepPcs)} পিস)\n`;
        message += `      • ডেকোর: ${toBanglaNum(r.decorBoxes)} কার্টন (${toBanglaNum(r.decorPcs)} পিস)\n`;
        message += `      • লাইট: ${toBanglaNum(r.lightBoxes)} কার্টন (${toBanglaNum(r.lightPcs)} পিস)\n`;
        message += `      • ওয়াল টাইলসের দাম: ৳${toBanglaNum(r.wallCost.toLocaleString('bn-BD'))}\n`;
      }
      if (r.hasFloor) {
        message += `   🏠 *ফ্লোর টাইলস:* ${toBanglaNum(r.floorAreaSft)} SFT [সাইজ: ${r.floorTileSizeName}]\n`;
        message += `      • মোট কার্টন: ${toBanglaNum(r.floorTotalBoxes)} টি (${toBanglaNum(r.floorTotalPcs)} পিস)\n`;
        message += `      • ফ্লোর টাইলসের দাম: ৳${toBanglaNum(r.floorCost.toLocaleString('bn-BD'))}\n`;
      }
      message += `   🧱 সিমেন্ট: ${toBanglaNum(r.cementBags)} বস্তা | বালু: ${toBanglaNum(r.sandCft)} CFT | পুটিং: ${toBanglaNum(r.groutKg)} কেজি\n`;
      message += `   💰 রুমের টাইলসের মোট দাম: ৳${toBanglaNum(r.totalRoomCost.toLocaleString('bn-BD'))}\n\n`;
    });

    message += `==========================================\n`;
    message += `📊 *পুরো বাড়ির সর্বমোট হিসাব ও বাজেট:*\n`;
    message += `📦 মোট টাইলস দরকার: ${toBanglaNum(grandTotal.totalBoxes)} কার্টন`;
    if (grandTotal.totalWallBoxes > 0 || grandTotal.totalFloorBoxes > 0) {
      message += ` (ওয়াল ${toBanglaNum(grandTotal.totalWallBoxes)} + ফ্লোর ${toBanglaNum(grandTotal.totalFloorBoxes)})`;
    }
    message += `\n`;
    message += `💰 টাইলসের মোট দাম: ৳${toBanglaNum(grandTotal.totalTileCost.toLocaleString('bn-BD'))}\n`;
    message += `🧱 প্রয়োজনীয় সিমেন্ট: ${toBanglaNum(grandTotal.totalCementBags)} বস্তা (৳${toBanglaNum(grandTotal.totalCementCost.toLocaleString('bn-BD'))})\n`;
    message += `⏳ প্রয়োজনীয় বালু: ${toBanglaNum(grandTotal.totalSandCft)} CFT (৳${toBanglaNum(grandTotal.totalSandCost.toLocaleString('bn-BD'))})\n`;
    message += `✨ পুটিং পাউডার: ${toBanglaNum(grandTotal.totalGroutKg)} কেজি (৳${toBanglaNum(grandTotal.totalGroutCost.toLocaleString('bn-BD'))})\n`;
    message += `🛠️ মিস্ত্রি মজুরি: ৳${toBanglaNum(grandTotal.totalLaborCost.toLocaleString('bn-BD'))}\n`;
    message += `------------------------------------------\n`;
    message += `🏷️ *সর্বমোট প্রজেক্ট বাজেট: ৳${toBanglaNum(grandTotal.grandProjectCost.toLocaleString('bn-BD'))}*\n\n`;
    message += `🌐 অনলাইনে এই মেমো বিস্তারিত দেখতে বা এডিট করতে লিংকে যান:\nhttps://utools.bd/tiles-calculator`;

    return message;
  };

  // ── High-Resolution Vector/Canvas PDF Generator ──
  const generatePdfBlob = async () => {
    const memoEl = document.getElementById('tiles-memo-print-area');
    if (!memoEl) throw new Error('Memo element not found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvasModule: any = await import('html2canvas-pro');
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const { jsPDF } = await import('jspdf');

    // Position clean export container temporarily at top-left behind page to avoid html2canvas negative offset clipping
    memoEl.style.left = '0px';
    memoEl.style.top = '0px';
    memoEl.style.opacity = '1';
    memoEl.style.zIndex = '-9999';

    try {
      const canvas = await html2canvas(memoEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8; // 8mm safe margin prevents any border clipping
      const printWidth = pageWidth - margin * 2; // 194mm printable width
      const maxPageContentHeight = pageHeight - margin * 2; // 281mm printable height
      const imgHeight = (canvas.height * printWidth) / canvas.width;

      if (imgHeight <= maxPageContentHeight) {
        pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, imgHeight, undefined, 'FAST');
      } else {
        let position = margin;
        let remainingHeight = imgHeight;
        let pageIdx = 0;
        while (remainingHeight > 0) {
          if (pageIdx > 0) {
            pdf.addPage([pageWidth, pageHeight], 'portrait');
          }
          pdf.addImage(imgData, 'JPEG', margin, position, printWidth, imgHeight, undefined, 'FAST');
          remainingHeight -= maxPageContentHeight;
          position -= maxPageContentHeight;
          pageIdx++;
        }
      }

      // Add clickable tool link annotation on the PDF header area
      try {
        pdf.link(margin + 5, margin + 12, 100, 8, { url: 'https://utools.bd/tiles-calculator' });
      } catch {
        // Safe fallback
      }

      const filename = `Utools_Tiles_Memo_${Date.now().toString().slice(-6)}.pdf`;
      const blob = pdf.output('blob');
      return { blob, filename, pdf, canvas };
    } finally {
      memoEl.style.left = '-9999px';
      memoEl.style.top = '0px';
      memoEl.style.opacity = '0';
      memoEl.style.zIndex = '-9999';
    }
  };

  const handleDownloadPdf = async () => {
    if (houseRooms.length === 0) {
      setValidationError('PDF ডাউনলোডের আগে অনুগ্রহ করে কমপক্ষে একটি রুম যোগ করুন।');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const { pdf, filename } = await generatePdfBlob();
      pdf.save(filename);
      setSuccessMessage('✓ A4 সাইজ PDF মেমো সফলভাবে ডাউনলোড হয়েছে!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setValidationError('PDF মেমো তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ── WhatsApp Share Routing (Mobile vs Desktop) ──
  const handleWhatsAppButtonClick = () => {
    if (houseRooms.length === 0) {
      setValidationError('WhatsApp এ মেমো পাঠানোর আগে অনুগ্রহ করে কমপক্ষে একটি রুম যোগ করুন।');
      return;
    }
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobileDevice) {
      handleNativePdfShare();
    } else {
      setShowWhatsAppModal(true);
    }
  };

  // ── WhatsApp Web Sharing (Desktop Browser) ──
  const handleWhatsAppWebShare = async () => {
    setShowWhatsAppModal(false);
    setIsGeneratingPdf(true);
    try {
      const { filename, pdf, canvas } = await generatePdfBlob();

      // 1. Download PDF directly to user's computer
      pdf.save(filename);

      // 2. Copy visual memo image to clipboard for instant Ctrl+V in WhatsApp Web
      try {
        canvas.toBlob(async (pngBlob) => {
          if (pngBlob && typeof navigator.clipboard?.write === 'function') {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': pngBlob }),
              ]);
            } catch (err) {
              console.log('Clipboard copy skipped:', err);
            }
          }
        }, 'image/png');
      } catch {}

      // 3. Compact message focusing on tool link and PDF memo
      const toolUrl = 'https://utools.bd/tiles-calculator';
      let compactMessage = `📋 *Utools.bd — পুরো বাড়ির টাইলস ও খরচ মেমো*\n`;
      compactMessage += `🔗 *ক্যালকুলেটর লিঙ্ক:* ${toolUrl}\n\n`;
      compactMessage += `📅 তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
      compactMessage += `🏠 মোট রুম: ${toBanglaNum(houseRooms.length)} টি | মোট এরিয়া: ${toBanglaNum(grandTotal.totalArea)} SFT\n`;
      compactMessage += `📦 মোট টাইলস দরকার: ${toBanglaNum(grandTotal.totalBoxes)} কার্টন\n`;
      compactMessage += `🏷️ *সর্বমোট প্রজেক্ট বাজেট: ৳${toBanglaNum(grandTotal.grandProjectCost.toLocaleString('bn-BD'))}*\n\n`;
      compactMessage += `📎 *রুমভিত্তিক পূর্ণাঙ্গ হিসাব বিবরণী বিস্তারিত PDF ফাইলে ডাউনলোড হয়েছে।* চ্যাটে ডাউনলোড হওয়া PDF ফাইলটি যুক্ত (📎) করুন অথবা সরাসরি Ctrl+V চেপে পেস্ট করে দিন।`;

      const encoded = encodeURIComponent(compactMessage);
      window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');

      setSuccessMessage(
        '✓ A4 PDF মেমোটি ডাউনলোড হয়েছে এবং WhatsApp Web ওপেন হচ্ছে! চ্যাটে ডাউনলোড হওয়া PDF ফাইলটি ড্র্যাগ/সংযুক্ত করুন অথবা Ctrl+V চাপুন।'
      );
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err) {
      console.error('WhatsApp Web share error:', err);
      setValidationError('মেমো তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ── WhatsApp App Direct PDF File Share (Mobile / Windows Native Share) ──
  const handleNativePdfShare = async () => {
    setShowWhatsAppModal(false);
    setIsGeneratingPdf(true);
    try {
      const { blob, filename } = await generatePdfBlob();
      const pdfFile = new File([blob], filename, { type: 'application/pdf' });
      const toolUrl = 'https://utools.bd/tiles-calculator';
      const shareText = `📋 *Utools.bd — পুরো বাড়ির টাইলস ও খরচ মেমো*\n🔗 *ক্যালকুলেটর লিঙ্ক:* ${toolUrl}\n\n(রুমভিত্তিক পূর্ণাঙ্গ হিসাব মেমো এই PDF ফাইলে সংযুক্ত)`;

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: 'টাইলস ও নির্মাণ মেমো (Utools.bd)',
          text: shareText,
        });
        setSuccessMessage('✓ WhatsApp / অ্যাপে সরাসরি PDF মেমো ফাইল সংযুক্ত করে শেয়ার করা হয়েছে!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        handleWhatsAppWebShare();
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Native share error:', err);
      handleWhatsAppWebShare();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (houseRooms.length === 0) {
      setValidationError('প্রিন্ট করার আগে অনুগ্রহ করে কমপক্ষে একটি রুম যোগ করুন।');
      return;
    }
    window.print();
  };

  return (
    <>
      <div className="no-print max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/tiles-calculator"
        toolName={pageContent.title}
        categoryName="ক্যালকুলেটর"
        categoryPath="/"
        faqs={pageContent.faqs}
        ratingValue="4.9"
        reviewCount="1480"
      />

      {/* Standard Tool Breadcrumb & Privacy Badge */}
      <ToolBreadcrumb
        toolName="টাইলস ক্যালকুলেটর"
        categoryName="ক্যালকুলেটর"
        privacyText="১০০% ক্লায়েন্ট-সাইড • কোনো তথ্য সার্ভারে যায় না"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E6F4EC] text-[#0B5D3B] border border-[#0B5D3B]/20 mb-3">
          <Grid className="w-4 h-4" />
          <span>ওয়াল কম্বো • ফ্লোর • ডেকোর রেট • সিমেন্ট-বালু • পুটিং • পুরো বাড়ি</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1F17] tracking-tight mb-3">
          {pageContent.title}
        </h1>
        <p className="text-base text-[#4A5A52] leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-300 flex items-center justify-between gap-3 text-red-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="p-1 hover:bg-red-100 rounded-lg text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Mode Banner */}
      {editingRoomId && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 text-sm font-semibold">
            <Edit2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              আপনি <strong>"{currentlyEditingRoom?.name}"</strong> এডিট করছেন।
              পূর্বের মাপ পরিবর্তন করতে পারেন, অথবা পূর্বে না থাকা ওয়াল/ফ্লোরের মাপ লিখে নতুন করে যুক্ত করে নিচের <strong>"✓ পরিবর্তন সংরক্ষণ করুন"</strong> বাটনে চাপুন।
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRoomId(null);
              setRoomName('');
              setWallDirectSft(0);
              setFloorDirectSft(0);
            }}
            className="text-xs px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold"
          >
            বাতিল করুন
          </button>
        </div>
      )}

      {/* ── UNIFIED ROOM BUILDER FORM (Wall + Floor Together) ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-8 mb-12">
        {/* Room Header */}
        <div className="pb-4 border-b border-[#D5E4DB]">
          <label className="block text-xs font-bold text-[#0F1F17] mb-1.5 uppercase tracking-wider">
            ১. রুমের নাম নির্ধারণ করুন:
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-base text-[#0F1F17] focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
            placeholder="রুমের নাম লিখুন (যেমন: মাস্টার বাথরুম, কিচেন, বেডরুম ১)"
          />
        </div>

        {/* ── SECTION A: WALL TILES COMBO ── */}
        <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-[#0F1F17] flex items-center gap-2 flex-wrap">
                <Layers className="w-5 h-5 text-[#0B5D3B]" /> ওয়াল টাইলস কম্বো (Wall Tiles Combo)
                {currentlyEditingRoom && !currentlyEditingRoom.hasWall && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    + নতুন ওয়াল যোগ করতে মাপ দিন
                  </span>
                )}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
                ডিপ-ডেকোর-লাইট অনুপাত
              </span>
            </div>

            {/* Input Mode: SFT or Dimensions */}
            <div className="flex gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-[#0F1F17]">
                <input
                  type="radio"
                  name="wallMode"
                  checked={wallInputMode === 'direct'}
                  onChange={() => setWallInputMode('direct')}
                  className="text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                সরাসরি স্কয়ার ফিট (SFT)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#0F1F17]">
                <input
                  type="radio"
                  name="wallMode"
                  checked={wallInputMode === 'dimensions'}
                  onChange={() => setWallInputMode('dimensions')}
                  className="text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                দেয়ালের পরিধি/দৈর্ঘ্য × উচ্চতা (ফিটে)
              </label>
            </div>

            {/* Wall Area & Height Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {wallInputMode === 'direct' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                    মোট দেয়ালের ক্ষেত্রফল (SFT) *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={wallDirectSft || ''}
                      onChange={(e) => setWallDirectSft(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-[#0B5D3B] text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="ওয়ালের SFT লিখুন (যেমন: ৩৫০)"
                    />
                    <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                      SFT
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                    চার দেয়ালের মোট পরিধি (ফিট) *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={wallPerimeterFt || ''}
                      onChange={(e) => setWallPerimeterFt(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="চার দেয়ালের পরিধি (ফিট)"
                    />
                    <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                      ফিট
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                  দেয়ালের উচ্চতা (ফিট) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={wallHeightFt || ''}
                    onChange={(e) => setWallHeightFt(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="উচ্চতা (যেমন: ৭)"
                  />
                  <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                    ফিট
                  </span>
                </div>
              </div>

              {/* Deduction for Doors & Windows */}
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1 flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>দরজা-জানালা বাদ (Deduction SFT)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={wallDeductionSft || ''}
                    onChange={(e) => setWallDeductionSft(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-red-600 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="বাদ দেওয়ার মাপ (যেমন: ২০)"
                  />
                  <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                    SFT
                  </span>
                </div>
              </div>
            </div>

            {/* Wall Tile Size Selector (Moved right after SFT/Area) */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F17] mb-2">
                ওয়াল টাইলসের সাইজ নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WALL_TILE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleWallSizeChange(size.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedWallSizeId === size.id && !isCustomWallSize
                        ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                        : 'border-[#D5E4DB] bg-white text-[#4A5A52] hover:text-[#0F1F17]'
                    }`}
                  >
                    <div className="text-xs font-bold">{size.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{size.popularFor}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleWallSizeChange('custom')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isCustomWallSize
                      ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                      : 'border-[#D5E4DB] bg-white text-[#4A5A52] hover:text-[#0F1F17]'
                  }`}
                >
                  <div className="text-xs font-bold">✏️ কাস্টম সাইজ</div>
                  <div className="text-[10px] opacity-80 mt-0.5">ম্যানুয়াল মাপ টাইপ করুন</div>
                </button>
              </div>
            </div>

            {/* Custom Wall Size Fields */}
            {isCustomWallSize && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    টাইলের উচ্চতা (ইঞ্চি)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customWallTileH || ''}
                    onChange={(e) => setCustomWallTileH(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-sm"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    টাইলের প্রস্থ (ইঞ্চি)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customWallTileW || ''}
                    onChange={(e) => setCustomWallTileW(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-sm"
                    placeholder="12"
                  />
                </div>
              </div>
            )}

            {/* Rates: Regular Rate & Separate Decor Rate */}
            <div className="p-4 rounded-xl bg-white border border-[#D5E4DB] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                  সাধারণ ওয়াল টাইলসের দর (ডিপ ও লাইট)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={wallRatePerSft || ''}
                    onChange={(e) => setWallRatePerSft(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3 pr-14 py-2 rounded-lg border border-[#D5E4DB] font-bold text-[#0B5D3B] text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="যেমন: ৬৫"
                  />
                  <span className="absolute right-3 text-xs font-semibold text-[#4A5A52]">৳/SFT</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#0F1F17]">
                    ডেকোর (Décor) টাইলসের আলাদা দর?
                  </label>
                  <label className="text-xs flex items-center gap-1.5 font-medium cursor-pointer text-[#0B5D3B]">
                    <input
                      type="checkbox"
                      checked={hasSeparateDecorRate}
                      onChange={(e) => setHasSeparateDecorRate(e.target.checked)}
                      className="rounded-sm text-[#0B5D3B]"
                    />
                    আলাদা রেট চালু
                  </label>
                </div>
                {hasSeparateDecorRate ? (
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={decorRatePerPcs || ''}
                      onChange={(e) => setDecorRatePerPcs(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-3 pr-16 py-2 rounded-lg border border-amber-300 bg-amber-50/50 font-bold text-amber-900 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="যেমন: ১৮০"
                    />
                    <span className="absolute right-3 text-xs font-semibold text-amber-800">৳/পিস</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#4A5A52] py-2">
                    সাধারণ রেট (৳{toBanglaNum(wallRatePerSft)}/SFT) অনুযায়ীই ডেকোর হিসাব হবে।
                  </div>
                )}
              </div>
            </div>

            {/* Box pieces & Variation notice */}
            <div className="p-3.5 rounded-xl bg-white border border-[#D5E4DB] space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[#0F1F17]">১ বক্সে কত পিস থাকে?</span>
                <div className="w-28">
                  <input
                    type="number"
                    min="1"
                    value={wallPcsPerBox || ''}
                    onChange={(e) => setWallPcsPerBox(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] text-[#0B5D3B]"
                  />
                </div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900">
                  <strong>সতর্কতা:</strong> কোম্পানিভেদে এক বক্সে কত পিস থাকে তা পরিবর্তন হতে পারে। আপনার টাইলসের প্যাকেটের গায়ের পিস সংখ্যা দেখে এখানে মিলিয়ে নিন।
                </p>
              </div>
            </div>

            {/* Pattern Rows Breakdown (Deep, Decor, Light) - Responsive: vertical on mobile, 3 cols on sm+ */}
            <div className="p-4 rounded-xl bg-white border border-[#D5E4DB] space-y-3">
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="font-bold text-[#0F1F17]">
                  🎨 দেয়ালের শেইড সারি (মোট {toBanglaNum(currentWallCombo.totalLines.toFixed(1))} টি লাইন)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#0B5D3B] font-semibold">
                  উচ্চতা {toBanglaNum(wallHeightFt * 12)}" ÷ {toBanglaNum(customWallTileH)}"
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between sm:flex-col sm:text-center gap-3">
                  <div className="text-left sm:text-center">
                    <span className="block text-xs font-bold text-blue-900">১. ডিপ (Deep) লাইন</span>
                    <span className="block text-[11px] text-blue-700 mt-0.5">
                      {toBanglaNum(currentWallCombo.deep.boxes)} ctn ({toBanglaNum(currentWallCombo.deep.pieces)} pcs)
                    </span>
                  </div>
                  <div className="w-24 sm:w-full">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={deepLines}
                      onChange={(e) => setDeepLines(Math.max(0, Number(e.target.value)))}
                      className="w-full py-1.5 text-center font-bold text-base sm:text-sm bg-white rounded-lg border border-blue-300 text-blue-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between sm:flex-col sm:text-center gap-3">
                  <div className="text-left sm:text-center">
                    <span className="block text-xs font-bold text-amber-900">২. ডেকোর (Decor) লাইন</span>
                    <span className="block text-[11px] text-amber-700 mt-0.5">
                      {toBanglaNum(currentWallCombo.decor.boxes)} ctn ({toBanglaNum(currentWallCombo.decor.pieces)} pcs)
                    </span>
                  </div>
                  <div className="w-24 sm:w-full">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={decorLines}
                      onChange={(e) => setDecorLines(Math.max(0, Number(e.target.value)))}
                      className="w-full py-1.5 text-center font-bold text-base sm:text-sm bg-white rounded-lg border border-amber-300 text-amber-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-between sm:flex-col sm:text-center gap-3">
                  <div className="text-left sm:text-center">
                    <span className="block text-xs font-bold text-slate-800">৩. লাইট (Light) লাইন</span>
                    <span className="block text-[11px] text-slate-600 mt-0.5">
                      {toBanglaNum(currentWallCombo.light.boxes)} ctn ({toBanglaNum(currentWallCombo.light.pieces)} pcs)
                    </span>
                  </div>
                  <div className="w-24 sm:w-full">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={lightLines}
                      onChange={(e) => setLightLines(Math.max(0, Number(e.target.value)))}
                      className="w-full py-1.5 text-center font-bold text-base sm:text-sm bg-white rounded-lg border border-slate-300 text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* ── SECTION B: FLOOR TILES ── */}
        <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-[#0F1F17] flex items-center gap-2 flex-wrap">
                <Grid className="w-5 h-5 text-[#0B5D3B]" /> ফ্লোর টাইলস পরিমাপ (Floor Tiles)
                {currentlyEditingRoom && !currentlyEditingRoom.hasFloor && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    + নতুন ফ্লোর যোগ করতে মাপ দিন
                  </span>
                )}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
                ফ্লোর ও স্কার্টিং
              </span>
            </div>

            {/* Input Mode: Dimensions or SFT */}
            <div className="flex gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-[#0F1F17]">
                <input
                  type="radio"
                  name="floorMode"
                  checked={floorInputMode === 'dimensions'}
                  onChange={() => setFloorInputMode('dimensions')}
                  className="text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                দৈর্ঘ্য × প্রস্থ (ফিটে)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#0F1F17]">
                <input
                  type="radio"
                  name="floorMode"
                  checked={floorInputMode === 'direct'}
                  onChange={() => setFloorInputMode('direct')}
                  className="text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                সরাসরি স্কয়ার ফিট (SFT)
              </label>
            </div>

            {/* Floor Area / Dimensions Inputs */}
            <div>
              {floorInputMode === 'dimensions' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1F17] mb-1">দৈর্ঘ্য (ফিট) *</label>
                    <input
                      type="number"
                      min="0"
                      value={floorLengthFt || ''}
                      onChange={(e) => setFloorLengthFt(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="দৈর্ঘ্য লিখুন (যেমন: ১০)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1F17] mb-1">প্রস্থ (ফিট) *</label>
                    <input
                      type="number"
                      min="0"
                      value={floorWidthFt || ''}
                      onChange={(e) => setFloorWidthFt(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="প্রস্থ লিখুন (যেমন: ৬)"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1">ফ্লোরের মোট ক্ষেত্রফল (SFT) *</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={floorDirectSft || ''}
                      onChange={(e) => setFloorDirectSft(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-[#0B5D3B] text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="ফ্লোরের SFT লিখুন (যেমন: ৪৮)"
                    />
                    <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                      SFT
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Floor Tile Sizes (Moved right after SFT/Area) */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F17] mb-2">
                ফ্লোর টাইলসের সাইজ নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FLOOR_TILE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleFloorSizeChange(size.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedFloorSizeId === size.id && !isCustomFloorSize
                        ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                        : 'border-[#D5E4DB] bg-white text-[#4A5A52] hover:text-[#0F1F17]'
                    }`}
                  >
                    <div className="text-xs font-bold">{size.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{size.popularFor}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleFloorSizeChange('custom')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isCustomFloorSize
                      ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                      : 'border-[#D5E4DB] bg-white text-[#4A5A52] hover:text-[#0F1F17]'
                  }`}
                >
                  <div className="text-xs font-bold">✏️ কাস্টম সাইজ</div>
                  <div className="text-[10px] opacity-80 mt-0.5">ম্যানুয়াল মাপ টাইপ করুন</div>
                </button>
              </div>
            </div>

            {/* Custom Floor Size Fields */}
            {isCustomFloorSize && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    টাইলের দৈর্ঘ্য (ইঞ্চি)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customFloorTileW || ''}
                    onChange={(e) => setCustomFloorTileW(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    টাইলের প্রস্থ (ইঞ্চি)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customFloorTileH || ''}
                    onChange={(e) => setCustomFloorTileH(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-sm"
                  />
                </div>
              </div>
            )}

            {/* Floor Rate Input */}
            <div className="p-4 rounded-xl bg-white border border-[#D5E4DB]">
              <label className="block text-xs font-semibold text-[#0F1F17] mb-1">ফ্লোর টাইলসের দর (৳/SFT)</label>
              <div className="relative flex items-center max-w-sm">
                <input
                  type="number"
                  value={floorRatePerSft || ''}
                  onChange={(e) => setFloorRatePerSft(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-3 pr-14 py-2 rounded-lg border border-[#D5E4DB] font-bold text-[#0B5D3B] text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="যেমন: ৮০"
                />
                <span className="absolute right-3 text-xs font-semibold text-[#4A5A52]">৳/SFT</span>
              </div>
            </div>

            {/* Skirting, Wastage & Box Pieces */}
            <div className="p-4 rounded-xl bg-white border border-[#D5E4DB] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">১ বক্সে কত পিস?</label>
                <input
                  type="number"
                  min="1"
                  value={floorPcsPerBox || ''}
                  onChange={(e) => setFloorPcsPerBox(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#D5E4DB] font-bold text-sm text-[#0B5D3B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">স্কার্টিং বর্ডার</label>
                <select
                  value={skirtingHeightInches}
                  onChange={(e) => setSkirtingHeightInches(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#D5E4DB] text-xs font-medium"
                >
                  <option value="4">৪ ইঞ্চি স্কার্টিং</option>
                  <option value="5">৫ ইঞ্চি স্কার্টিং</option>
                  <option value="0">স্কার্টিং নেই (০")</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">অপচয় (Wastage)</label>
                <select
                  value={floorWastagePercent}
                  onChange={(e) => setFloorWastagePercent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#D5E4DB] text-xs font-medium"
                >
                  <option value="5">৫% (সুপারিশকৃত)</option>
                  <option value="10">১০% (নিরাপদ ব্যাকআপ)</option>
                  <option value="0">০% (অতিরিক্ত ছাড়া)</option>
                </select>
              </div>
            </div>
          </div>

        {/* ── Action Button: Save Room ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveRoom}
            className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0B5D3B] hover:bg-[#084A2E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
          >
            {editingRoomId ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{editingRoomId ? 'পরিবর্তন সংরক্ষণ করুন' : 'রুমটি যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* ── INTEGRATED COST ANALYSIS & WHOLE HOUSE SUMMARY ── */}
      <div id="cost-analysis" className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#0B5D3B]/25 shadow-md space-y-8 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div>
            <h2 className="text-2xl font-black text-[#0F1F17] flex items-center gap-2">
              <Building className="w-6 h-6 text-[#0B5D3B]" /> খরচ ও পুরো বাড়ির সমন্বিত মেমো (Cost Analysis & House Memo)
            </h2>
            <p className="text-xs text-[#4A5A52] mt-1">
              যুক্ত করা প্রতিটি রুমের পূর্ণাঙ্গ হিসাব ও পুরো বাড়ির গ্র্যান্ড টোটাল মেমো।
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
            মোট রুম: {toBanglaNum(houseRooms.length)} টি
          </span>
        </div>

        {/* Quick Rate Config: Cement, Sand, Grout, Labor */}
        <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#D5E4DB] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">মিস্ত্রি খরচ (৳/SFT)</label>
            <input
              type="number"
              value={laborCostPerSft}
              onChange={(e) => setLaborCostPerSft(Math.max(0, Number(e.target.value)))}
              className="w-full px-2.5 py-1 rounded-lg border border-[#D5E4DB] bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">সিমেন্ট (বস্তা ৳)</label>
            <input
              type="number"
              value={cementBagPrice}
              onChange={(e) => setCementBagPrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-2.5 py-1 rounded-lg border border-[#D5E4DB] bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">বালু (CFT ৳)</label>
            <input
              type="number"
              value={sandPricePerCft}
              onChange={(e) => setSandPricePerCft(Math.max(0, Number(e.target.value)))}
              className="w-full px-2.5 py-1 rounded-lg border border-[#D5E4DB] bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[#4A5A52] mb-1 font-medium">পুটিং/গ্রাউট (কেজি ৳)</label>
            <input
              type="number"
              value={groutPricePerKg}
              onChange={(e) => setGroutPricePerKg(Math.max(0, Number(e.target.value)))}
              className="w-full px-2.5 py-1 rounded-lg border border-[#D5E4DB] bg-white font-bold"
            />
          </div>
        </div>

        {/* Room List Breakdown */}
        {houseRooms.length === 0 ? (
          <div className="text-center py-10 bg-[#F8FAF9] rounded-2xl border border-dashed border-[#D5E4DB]">
            <p className="text-sm font-semibold text-[#4A5A52]">এখনো কোনো রুম যোগ করা হয়নি।</p>
            <p className="text-xs text-[#4A5A52] mt-1">
              উপরের ফর্ম থেকে মাপ দিয়ে <strong>"+ পুরো বাড়ির হিসাবে এই রুমটি যোগ করুন"</strong> বাটনে চাপ দিন।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F1F17]">
              🏠 যুক্ত করা রুমগুলোর আলাদা হিসাব তালিকা:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {houseRooms.map((room, idx) => (
                <div
                  key={room.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    editingRoomId === room.id
                      ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                      : 'border-[#D5E4DB] bg-[#F8FAF9] hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#D5E4DB]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0B5D3B]">#{toBanglaNum(idx + 1)}</span>
                        <h4 className="font-bold text-base text-[#0F1F17]">{room.name}</h4>
                      </div>
                      <div className="text-xs text-[#4A5A52] mt-0.5">
                        মোট ক্ষেত্রফল: <strong>{toBanglaNum(room.combinedAreaSft)} SFT</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditRoom(room)}
                        className="p-1.5 text-[#0B5D3B] hover:bg-[#E6F4EC] rounded-lg transition-colors"
                        title="এডিট করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    {/* Wall breakdown ONLY if room has wall */}
                    {room.hasWall && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#D5E4DB]/70 space-y-1">
                        <div className="flex justify-between items-center font-bold text-[#0F1F17]">
                          <span>🧱 ওয়াল টাইলস ({room.wallTileSizeName}):</span>
                          <span className="text-[#0B5D3B]">{toBanglaNum(room.wallTotalBoxes)} কার্টন</span>
                        </div>
                        <div className="text-[11px] text-[#4A5A52] flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>• ডিপ: <strong>{toBanglaNum(room.deepBoxes)}</strong> ctn ({toBanglaNum(room.deepPcs)} pcs)</span>
                          <span>• ডেকোর: <strong>{toBanglaNum(room.decorBoxes)}</strong> ctn ({toBanglaNum(room.decorPcs)} pcs)</span>
                          <span>• লাইট: <strong>{toBanglaNum(room.lightBoxes)}</strong> ctn ({toBanglaNum(room.lightPcs)} pcs)</span>
                        </div>
                        <div className="text-[11px] text-[#4A5A52] pt-0.5">
                          ওয়াল টাইলসের দাম: <strong>৳{toBanglaNum(room.wallCost.toLocaleString('bn-BD'))}</strong>
                        </div>
                      </div>
                    )}

                    {/* Floor breakdown ONLY if room has floor */}
                    {room.hasFloor && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#D5E4DB]/70 space-y-1">
                        <div className="flex justify-between items-center font-bold text-[#0F1F17]">
                          <span>🏠 ফ্লোর টাইলস ({room.floorTileSizeName}):</span>
                          <span className="text-[#0B5D3B]">{toBanglaNum(room.floorTotalBoxes)} কার্টন</span>
                        </div>
                        <div className="text-[11px] text-[#4A5A52]">
                          ফ্লোরের দাম: <strong>৳{toBanglaNum(room.floorCost.toLocaleString('bn-BD'))}</strong>
                        </div>
                      </div>
                    )}

                    {/* Materials for this room (150 sft = 1kg grout) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 bg-white rounded-xl border border-[#D5E4DB]/80 shadow-2xs">
                        <div className="text-[10px] text-[#4A5A52] font-medium">টাইলস মোট দাম</div>
                        <div className="font-bold text-xs text-[#0F1F17] mt-0.5">৳{toBanglaNum(room.totalRoomCost.toLocaleString('bn-BD'))}</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#D5E4DB]/80 shadow-2xs">
                        <div className="text-[10px] text-[#4A5A52] font-medium">সিমেন্ট দরকার</div>
                        <div className="font-bold text-xs text-[#0B5D3B] mt-0.5">{toBanglaNum(room.cementBags)} বস্তা</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#D5E4DB]/80 shadow-2xs">
                        <div className="text-[10px] text-[#4A5A52] font-medium">বালু দরকার</div>
                        <div className="font-bold text-xs text-[#0B5D3B] mt-0.5">{toBanglaNum(room.sandCft)} CFT</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#D5E4DB]/80 shadow-2xs">
                        <div className="text-[10px] text-[#4A5A52] font-medium">পুটিং দরকার</div>
                        <div className="font-bold text-xs text-emerald-700 mt-0.5">{toBanglaNum(room.groutKg)} কেজি</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Grand Total Memo Card ── */}
        {houseRooms.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B5D3B] text-white shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-600/60">
              <div>
                <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  পুরো বাড়ির সর্বমোট হিসাব ও বাজেট
                </div>
                <div className="text-3xl sm:text-4xl font-black mt-1">
                  {toBanglaNum(grandTotal.totalBoxes)} কার্টন টাইলস
                </div>
                <div className="text-xs text-emerald-100 mt-1">
                  {grandTotal.totalWallBoxes > 0 && `ওয়াল: ${toBanglaNum(grandTotal.totalWallBoxes)} কার্টন • `}
                  {grandTotal.totalFloorBoxes > 0 && `ফ্লোর: ${toBanglaNum(grandTotal.totalFloorBoxes)} কার্টন • `}
                  মোট এরিয়া: {toBanglaNum(grandTotal.totalArea)} SFT
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-200">সর্বমোট প্রজেক্ট বাজেট:</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  ৳{toBanglaNum(grandTotal.grandProjectCost.toLocaleString('bn-BD'))}
                </div>
              </div>
            </div>

            {/* Material Totals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                <div className="text-emerald-200">টাইলসের মোট দাম</div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  ৳{toBanglaNum(grandTotal.totalTileCost.toLocaleString('bn-BD'))}
                </div>
              </div>
              <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                <div className="text-emerald-200">মোট সিমেন্ট দরকার</div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {toBanglaNum(grandTotal.totalCementBags)} বস্তা
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5">
                  (৳{toBanglaNum(grandTotal.totalCementCost.toLocaleString('bn-BD'))})
                </div>
              </div>
              <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                <div className="text-emerald-200">মোট বালু দরকার</div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {toBanglaNum(grandTotal.totalSandCft)} CFT
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5">
                  (৳{toBanglaNum(grandTotal.totalSandCost.toLocaleString('bn-BD'))})
                </div>
              </div>
              <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                <div className="text-emerald-200">পুটিং পাউডার (১৫০ SFT/১kg)</div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {toBanglaNum(grandTotal.totalGroutKg)} কেজি
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5">
                  (৳{toBanglaNum(grandTotal.totalGroutCost.toLocaleString('bn-BD'))})
                </div>
              </div>
            </div>

            {/* Action Buttons: PDF, Print, WhatsApp */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white text-[#0B5D3B] text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                title="সরাসরি A4 PDF মেমো ফাইল ডাউনলোড করুন"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B5D3B]" />
                ) : (
                  <Download className="w-4 h-4 text-[#0B5D3B]" />
                )}
                {isGeneratingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={isGeneratingPdf}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white text-[#0B5D3B] text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 text-[#0B5D3B]" /> প্রিন্ট মেমো
              </button>
              <button
                type="button"
                onClick={handleWhatsAppButtonClick}
                disabled={isGeneratingPdf}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#20BD5A] transition-colors shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {isGeneratingPdf ? 'প্রসেসিং হচ্ছে...' : 'WhatsApp এ মেমো পাঠান'}
              </button>
            </div>
          </div>
        )}

      {/* ── WhatsApp Sharing Choice Modal (Desktop) ── */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-emerald-200 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#0F1F17] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#25D366]" /> WhatsApp এ মেমো পাঠানোর মাধ্যম
              </h3>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              আপনি আপনার কম্পিউটারে কোন মাধ্যমে মেমোটি পাঠাতে চান তা নির্বাচন করুন:
            </p>

            <div className="space-y-3">
              {/* Option 1: WhatsApp Web */}
              <button
                type="button"
                onClick={handleWhatsAppWebShare}
                className="w-full p-4 rounded-2xl border-2 border-[#25D366] bg-emerald-50/60 hover:bg-emerald-50 flex items-start gap-3.5 text-left transition-all group shadow-xs active:scale-[0.99]"
              >
                <div className="p-3 bg-[#25D366] text-white rounded-xl group-hover:scale-105 transition-transform shadow-xs shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F1F17] flex items-center gap-1.5">
                    WhatsApp Web (ব্রাউজারে)
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      পিসির জন্য সেরা
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    ব্রাউজারে সরাসরি WhatsApp Web ওপেন হবে। PDF মেমোটি স্বয়ংক্রিয়ভাবে ডাউনলোড হবে, চ্যাটে ক্যালকুলেটর লিঙ্ক যুক্ত হবে এবং মেমোর ছবি ক্লিপবোর্ডে কপি থাকবে।
                  </p>
                </div>
              </button>

              {/* Option 2: WhatsApp Desktop App via Windows Share */}
              <button
                type="button"
                onClick={handleNativePdfShare}
                className="w-full p-4 rounded-2xl border border-gray-200 hover:border-emerald-400 bg-gray-50/60 hover:bg-white flex items-start gap-3.5 text-left transition-all group shadow-xs active:scale-[0.99]"
              >
                <div className="p-3 bg-[#0B5D3B] text-white rounded-xl group-hover:scale-105 transition-transform shadow-xs shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F1F17]">
                    WhatsApp App (সরাসরি PDF ফাইল)
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Windows Share উইন্ডো ওপেন হবে এবং সবুজ WhatsApp আইকনে চাপ দিলে সরাসরি PDF ফাইলটি WhatsApp অ্যাপে এটাচ হয়ে যাবে।
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                বাতিল করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ── Brand Reference Guide & Specifications ── */}
      <div className="mt-12 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs">
        <h2 className="text-xl font-bold text-[#0F1F17] mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#0B5D3B]" /> কোন সাইজের টাইলস বক্সে কত পিস থাকে? (BD Standard Chart)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-bold text-[#0B5D3B] mb-2">🧱 ওয়াল টাইলস (Wall Tiles):</h3>
            <ul className="space-y-1.5 text-[#4A5A52]">
              <li>• <strong>৮" × ১২" (8"×12"):</strong> প্রতি বক্সে ২৫ পিস = ১৬.৬৭ স্কয়ার ফিট (DBL/Akij)</li>
              <li>• <strong>১০" × ১৬" (10"×16"):</strong> প্রতি বক্সে ১৫ পিস = ১৬.৬৭ স্কয়ার ফিট</li>
              <li>• <strong>১২" × ১৮" (12"×18"):</strong> প্রতি বক্সে ১০ পিস = ১৫.০০ স্কয়ার ফিট</li>
              <li>• <strong>১২" × ২৪" (12"×24"):</strong> প্রতি বক্সে ৮ পিস = ১৬.০০ স্কয়ার ফিট</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-[#0B5D3B] mb-2">🏠 ফ্লোর টাইলস (Floor Tiles):</h3>
            <ul className="space-y-1.5 text-[#4A5A52]">
              <li>• <strong>২৪" × ২৪" (2x2 ft):</strong> প্রতি বক্সে ৪ পিস = ১৬.০০ স্কয়ার ফিট (সবচেয়ে বেশি বিক্রিত)</li>
              <li>• <strong>১৬" × ১৬" (16"×16"):</strong> প্রতি বক্সে ৯ পিস = ১৬.০০ স্কয়ার ফিট</li>
              <li>• <strong>১২" × ১২" (1x1 ft):</strong> প্রতি বক্সে ১৬ পিস = ১৬.০০ স্কয়ার ফিট (বাথরুম ফ্লোর)</li>
              <li>• <strong>৩২" × ৩২" (32"×32"):</strong> প্রতি বক্সে ৩ পিস = ২১.৩৩ স্কয়ার ফিট</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Educational Guide & Technical Formulas ── */}
      <section className="mt-12 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-6">
        <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
          <Info className="w-5 h-5 text-[#0B5D3B]" />
          <h2 className="text-xl font-bold text-[#0F1F17]">
            টাইলস ও নির্মাণ সামগ্রী হিসাবের প্রমিত নির্দেশিকা (Tiles Calculation Guide BD)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-5 rounded-2xl space-y-2">
            <span className="font-bold text-[#0B5D3B] text-base block">🧱 কার্টন ও SFT রূপান্তর</span>
            <p className="text-[#4A5A52] leading-relaxed text-xs">
              ১ কার্টনে মোট স্কয়ার ফিট = (দৈর্ঘ্য" × প্রস্থ" × প্রতি বক্সের পিস) ÷ ১৪৪। মোট স্কয়ার ফিটকে ১ বক্সের স্কয়ার ফিট দিয়ে ভাগ করলেই মোট কার্টন সংখ্যা বের হয়ে যায়।
            </p>
          </div>

          <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-5 rounded-2xl space-y-2">
            <span className="font-bold text-[#0B5D3B] text-base block">🏗️ সিমেন্ট ও বালুর অনুপাত (১:৪)</span>
            <p className="text-[#4A5A52] leading-relaxed text-xs">
              প্রতি ১০০ স্কয়ার ফিট টাইলসের বেড মসলা ও পেস্টিং ঘোলার জন্য গড়ে ৩.২ বস্তা সিমেন্ট এবং ১১ সিএফটি (CFT) সিলেট বা প্লাস্টারিং বালু প্রয়োজন হয়।
            </p>
          </div>

          <div className="border border-[#D5E4DB] bg-[#FAFAF7] p-5 rounded-2xl space-y-2">
            <span className="font-bold text-[#0B5D3B] text-base block">✨ পুটিং পাউডার (Grout)</span>
            <p className="text-[#4A5A52] leading-relaxed text-xs">
              প্রতি ১৫০ স্কয়ার ফিট টাইলসের জয়েন্ট বা ফাঁকা অংশ ভরার জন্য গড়ে ১ কেজি পুটিং পাউডার লাগে। বাথরুম ও ভেজা মেঝের জন্য ওয়াটারপ্রুফ পুটিং আবশ্যক।
            </p>
          </div>
        </div>
      </section>

      {/* ── CMS Dynamic FAQs & How-To Content ── */}
      <div className="mt-12">
        <CmsDynamicContent content={pageContent} />
      </div>

      {/* Related Tools */}
      <div className="mt-12">
        <RelatedTools currentToolId="tiles-calculator" />
      </div>
    </div>

    {/* ── DEDICATED A4 PRINT & PDF MEMO VOUCHER (Clean A4 layout with room-by-room details) ── */}
    <div
      id="tiles-memo-print-area"
      className="text-[#0F1F17] font-sans"
      style={{
        position: 'fixed',
        top: 0,
        left: '-9999px',
        width: '794px',
        boxSizing: 'border-box',
        padding: '24px 28px',
        zIndex: -9999,
        pointerEvents: 'none',
        opacity: 0,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b-2 border-[#0B5D3B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0B5D3B] tracking-tight">
              Utools.bd
            </h1>
            <span className="text-[11px] bg-[#E6F4EC] text-[#0B5D3B] font-bold px-2 py-0.5 rounded border border-[#0B5D3B]/30">
              ডিজিটাল টাইলস ও নির্মাণ মেমো
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            পুরো বাড়ির কক্ষভিত্তিক টাইলস, সিমেন্ট, বালু ও পুটিং খরচের খসড়া বিবরণী
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] text-gray-500 font-bold">অনলাইন টুল লিংক:</span>
            <a
              href="https://utools.bd/tiles-calculator"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-[#0B5D3B] font-bold underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300"
            >
              https://utools.bd/tiles-calculator
            </a>
          </div>
        </div>
        <div className="text-right text-xs space-y-1">
          <div>
            <span className="font-bold text-gray-700">তারিখ:</span>{' '}
            {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div>
            <span className="font-bold text-gray-700">মোট রুম:</span> {toBanglaNum(houseRooms.length)} টি
          </div>
          <div>
            <span className="font-bold text-gray-700">মোট এরিয়া:</span> {toBanglaNum(grandTotal.totalArea)} SFT
          </div>
        </div>
      </div>

      {/* Applied Rates Banner */}
      <div className="my-3 py-2 px-3 bg-gray-50 rounded border border-gray-200 grid grid-cols-4 gap-2 text-[11px] text-center">
        <div>
          <span className="text-gray-500 block">মিস্ত্রি মজুরি রেট</span>
          <span className="font-bold text-[#0B5D3B]">৳{toBanglaNum(laborCostPerSft)}/SFT</span>
        </div>
        <div>
          <span className="text-gray-500 block">সিমেন্ট রেট</span>
          <span className="font-bold text-[#0B5D3B]">৳{toBanglaNum(cementBagPrice)}/বস্তা</span>
        </div>
        <div>
          <span className="text-gray-500 block">বালু রেট</span>
          <span className="font-bold text-[#0B5D3B]">৳{toBanglaNum(sandPricePerCft)}/CFT</span>
        </div>
        <div>
          <span className="text-gray-500 block">পুটিং/গ্রাউট রেট</span>
          <span className="font-bold text-[#0B5D3B]">৳{toBanglaNum(groutPricePerKg)}/কেজি</span>
        </div>
      </div>

      {/* Room-by-Room Detailed Table */}
      <div className="my-4">
        <h2 className="text-sm font-bold text-[#0B5D3B] mb-2 pb-1 border-b border-gray-200">
          ১. কক্ষভিত্তিক বিস্তারিত হিসাব বিবরণী (Room-by-Room Breakdown)
        </h2>
        <table className="w-full text-[11px] border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
              <th className="border border-gray-300 p-1.5 text-center w-8">নং</th>
              <th className="border border-gray-300 p-1.5 text-left">রুমের নাম ও মোট মাপ</th>
              <th className="border border-gray-300 p-1.5 text-left">ওয়াল টাইলস (কার্টন ও পিস)</th>
              <th className="border border-gray-300 p-1.5 text-left">ফ্লোর টাইলস (কার্টন ও পিস)</th>
              <th className="border border-gray-300 p-1.5 text-left">প্রয়োজনীয় মালামাল</th>
              <th className="border border-gray-300 p-1.5 text-right">টাইলসের দাম</th>
            </tr>
          </thead>
          <tbody>
            {houseRooms.map((room, idx) => (
              <tr key={room.id} className="border-b border-gray-200">
                <td className="border border-gray-300 p-1.5 text-center font-bold">{toBanglaNum(idx + 1)}</td>
                <td className="border border-gray-300 p-1.5">
                  <div className="font-bold text-gray-900">{room.name}</div>
                  <div className="text-[10px] text-gray-500">মোট: {toBanglaNum(room.combinedAreaSft)} SFT</div>
                </td>
                <td className="border border-gray-300 p-1.5">
                  {room.hasWall ? (
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-800">
                        {room.wallTileSizeName}: {toBanglaNum(room.wallTotalBoxes)} কার্টন ({toBanglaNum(room.wallTotalPcs)} পিস)
                      </div>
                      <div className="text-[10px] text-gray-600">
                        ডিপ: {toBanglaNum(room.deepBoxes)} ctn ({toBanglaNum(room.deepPcs)} পিস) • ডেকোর: {toBanglaNum(room.decorBoxes)} ctn ({toBanglaNum(room.decorPcs)} পিস) • লাইট: {toBanglaNum(room.lightBoxes)} ctn ({toBanglaNum(room.lightPcs)} পিস)
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold">
                        দাম: ৳{toBanglaNum(room.wallCost.toLocaleString('bn-BD'))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">প্রযোজ্য নয়</span>
                  )}
                </td>
                <td className="border border-gray-300 p-1.5">
                  {room.hasFloor ? (
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-800">
                        {room.floorTileSizeName}: {toBanglaNum(room.floorTotalBoxes)} কার্টন ({toBanglaNum(room.floorTotalPcs)} পিস)
                      </div>
                      <div className="text-[10px] text-gray-600">
                        এরিয়া: {toBanglaNum(room.floorAreaSft)} SFT
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold">
                        দাম: ৳{toBanglaNum(room.floorCost.toLocaleString('bn-BD'))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">প্রযোজ্য নয়</span>
                  )}
                </td>
                <td className="border border-gray-300 p-1.5 text-[10px]">
                  <div>সিমেন্ট: <strong className="text-gray-800">{toBanglaNum(room.cementBags)}</strong> বস্তা</div>
                  <div>বালু: <strong className="text-gray-800">{toBanglaNum(room.sandCft)}</strong> CFT</div>
                  <div>পুটিং: <strong className="text-gray-800">{toBanglaNum(room.groutKg)}</strong> কেজি</div>
                </td>
                <td className="border border-gray-300 p-1.5 text-right font-bold text-gray-900">
                  ৳{toBanglaNum(room.totalRoomCost.toLocaleString('bn-BD'))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* House Grand Total Summary Block */}
      <div className="my-4 p-4 rounded-lg bg-emerald-50 border-2 border-[#0B5D3B]">
        <h2 className="text-sm font-bold text-[#0B5D3B] mb-2 pb-1 border-b border-emerald-200">
          ২. পুরো বাড়ির সর্বমোট সারসংক্ষেপ ও চূড়ান্ত বাজেট (Whole House Grand Summary)
        </h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 border-r border-emerald-200 pr-3">
            <div className="flex justify-between">
              <span className="text-gray-600">মোট এরিয়া:</span>
              <span className="font-bold">{toBanglaNum(grandTotal.totalArea)} SFT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ওয়াল টাইলস কার্টন:</span>
              <span className="font-bold">{toBanglaNum(grandTotal.totalWallBoxes)} কার্টন</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ফ্লোর টাইলস কার্টন:</span>
              <span className="font-bold">{toBanglaNum(grandTotal.totalFloorBoxes)} কার্টন</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-200 text-sm font-bold text-[#0B5D3B]">
              <span>সর্বমোট টাইলস দরকার:</span>
              <span>{toBanglaNum(grandTotal.totalBoxes)} কার্টন</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600">টাইলসের মোট দাম:</span>
              <span className="font-bold text-gray-900">৳{toBanglaNum(grandTotal.totalTileCost.toLocaleString('bn-BD'))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">মোট সিমেন্ট ({toBanglaNum(grandTotal.totalCementBags)} বস্তা):</span>
              <span className="font-bold text-gray-900">৳{toBanglaNum(grandTotal.totalCementCost.toLocaleString('bn-BD'))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">মোট বালু ({toBanglaNum(grandTotal.totalSandCft)} CFT):</span>
              <span className="font-bold text-gray-900">৳{toBanglaNum(grandTotal.totalSandCost.toLocaleString('bn-BD'))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">পুটিং পাউডার ({toBanglaNum(grandTotal.totalGroutKg)} কেজি):</span>
              <span className="font-bold text-gray-900">৳{toBanglaNum(grandTotal.totalGroutCost.toLocaleString('bn-BD'))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">মিস্ত্রি মজুরি ({toBanglaNum(grandTotal.totalArea)} SFT):</span>
              <span className="font-bold text-gray-900">৳{toBanglaNum(grandTotal.totalLaborCost.toLocaleString('bn-BD'))}</span>
            </div>
            <div className="flex justify-between pt-1 border-t-2 border-[#0B5D3B] text-base font-black text-[#0B5D3B]">
              <span>সর্বমোট প্রজেক্ট বাজেট:</span>
              <span>৳{toBanglaNum(grandTotal.grandProjectCost.toLocaleString('bn-BD'))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Link Banner & Online Verification */}
      <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between text-[11px] text-emerald-950">
        <div>
          <span className="font-bold">🌐 অনলাইনে এই হিসাবটি দেখতে, এডিট করতে বা নতুন রুম যুক্ত করতে ভিজিট করুন:</span>{' '}
          <a
            href="https://utools.bd/tiles-calculator"
            target="_blank"
            rel="noreferrer"
            className="font-bold underline text-[#0B5D3B]"
          >
            https://utools.bd/tiles-calculator
          </a>
        </div>
        <div className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
          Utools.bd
        </div>
      </div>

      {/* Terms & Signatures */}
      <div className="mt-4 pt-3 border-t border-gray-300 text-[10px] text-gray-500">
        <p>• নোট: টাইলসে ৫% কাটিং ও ভেঙে যাওয়ার অপচয় এবং সিমেন্ট-বালুতে ৩% অপচয় যুক্ত রয়েছে। প্রতি ১৫০ SFT টাইলসে ১ কেজি পুটিং পাউডার ও ১:৪ সিমেন্ট-বালু মসলা অনুপাত প্রমিত হিসাব হিসেবে ধরা হয়েছে।</p>
        <p className="mt-0.5">• এটি Utools.bd ক্লায়েন্ট-সাইড প্রযুক্তি দ্বারা তৈরি কম্পিউটার জেনারেটেড ডিজিটাল হিসাব ভাউচার।</p>
      </div>

      <div className="mt-10 pt-4 flex justify-between items-center text-xs text-gray-700">
        <div className="text-center w-48 border-t border-gray-400 pt-1.5 font-bold">
          হিসাব প্রস্তুতকারীর স্বাক্ষর
        </div>
        <div className="text-center w-48 border-t border-gray-400 pt-1.5 font-bold">
          গ্রাহক / বাড়ির মালিকের স্বাক্ষর
        </div>
      </div>
    </div>
  </>
);
};
