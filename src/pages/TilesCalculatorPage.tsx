import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Grid,
  Layers,
  Copy,
  Check,
  Share2,
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
} from 'lucide-react';
import {
  WALL_TILE_SIZES,
  FLOOR_TILE_SIZES,
  calculateWallCombo,
  calculateFloorTiles,
  calculateMaterialAndCost,
} from '../utils/tilesCalculator.ts';
import { toBanglaNum } from '../utils/bnDigits.ts';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';

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

  // Success Notification state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Form Input State ──
  const [roomName, setRoomName] = useState<string>('মাস্টার বাথরুম');

  // Wall Tile State
  const [hasWall, setHasWall] = useState<boolean>(true);
  const [wallInputMode, setWallInputMode] = useState<'direct' | 'dimensions'>('direct');
  const [wallPerimeterFt, setWallPerimeterFt] = useState<number>(50); // four walls perimeter
  const [wallDirectSft, setWallDirectSft] = useState<number>(350);
  const [wallHeightFt, setWallHeightFt] = useState<number>(7);
  const [wallDeductionSft, setWallDeductionSft] = useState<number>(20); // door 3x7=21
  const [wallRatePerSft, setWallRatePerSft] = useState<number>(65);

  const [hasSeparateDecorRate, setHasSeparateDecorRate] = useState<boolean>(true);
  const [decorRatePerPcs, setDecorRatePerPcs] = useState<number>(180); // separate rate per piece for decor

  const [selectedWallSizeId, setSelectedWallSizeId] = useState<string>('8x12');
  const [isCustomWallSize, setIsCustomWallSize] = useState<boolean>(false);
  const [customWallTileW, setCustomWallTileW] = useState<number>(12);
  const [customWallTileH, setCustomWallTileH] = useState<number>(8);
  const [wallPcsPerBox, setWallPcsPerBox] = useState<number>(25);

  const [deepLines, setDeepLines] = useState<number>(5.5);
  const [decorLines, setDecorLines] = useState<number>(1);
  const [lightLines, setLightLines] = useState<number>(4);

  // Floor Tile State
  const [hasFloor, setHasFloor] = useState<boolean>(true);
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

  // ── Multi-Room House List ──
  const [houseRooms, setHouseRooms] = useState<RoomRecord[]>([
    {
      id: '1',
      name: 'মাস্টার বাথরুম',
      hasWall: true,
      wallAreaSft: 350,
      wallHeightFt: 7,
      wallTileSizeName: '৮" × ১২"',
      wallTileW: 12,
      wallTileH: 8,
      wallPcsPerBox: 25,
      wallRatePerSft: 65,
      hasSeparateDecorRate: true,
      decorRatePerPcs: 180,
      deepLines: 5.5,
      decorLines: 1,
      lightLines: 4,
      deepBoxes: 11,
      decorBoxes: 2,
      lightBoxes: 8,
      deepPcs: 275,
      decorPcs: 50,
      lightPcs: 200,
      wallTotalBoxes: 21,
      wallTotalPcs: 525,
      wallCost: (275 + 200) * 0.667 * 65 + 50 * 180,

      hasFloor: true,
      floorAreaSft: 48,
      floorTileSizeName: '১২" × ১২" (বাথরুম ফ্লোর)',
      floorTileW: 12,
      floorTileH: 12,
      floorPcsPerBox: 16,
      floorRatePerSft: 75,
      skirtingInches: 4,
      floorWastagePercent: 5,
      floorTotalBoxes: 4,
      floorTotalPcs: 55,
      floorCost: 48 * 75,

      combinedAreaSft: 398,
      totalRoomCost: (275 + 200) * 0.667 * 65 + 50 * 180 + 48 * 75,
      cementBags: Math.round((398 / 100) * 3.2 * 10) / 10,
      sandCft: Math.round((398 / 100) * 11),
      groutKg: Math.round((398 / 150) * 10) / 10,
    },
  ]);

  // Copy feedback
  const [copied, setCopied] = useState<boolean>(false);

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

      // Line breakdown based on height
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
      return wallPerimeterFt * wallHeightFt;
    }
    return wallDirectSft;
  }, [wallInputMode, wallPerimeterFt, wallHeightFt, wallDirectSft]);

  const effectiveWallAreaSft = Math.max(0, calculatedWallGrossSft - wallDeductionSft);

  // ── Computed Gross Floor Area ──
  const calculatedFloorAreaSft = useMemo(() => {
    if (floorInputMode === 'dimensions') {
      return floorLengthFt * floorWidthFt;
    }
    return floorDirectSft;
  }, [floorInputMode, floorLengthFt, floorWidthFt, floorDirectSft]);

  // ── Live Wall Combo Calculation ──
  const currentWallCombo = useMemo(() => {
    return calculateWallCombo({
      wallAreaSft: effectiveWallAreaSft,
      wallHeightFt,
      tileHeightInches: customWallTileH,
      tileWidthInches: customWallTileW,
      pcsPerBox: wallPcsPerBox,
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
      tileLengthInches: customFloorTileW,
      tileWidthInches: customFloorTileH,
      pcsPerBox: floorPcsPerBox,
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
    if (!hasWall) return 0;
    if (hasSeparateDecorRate) {
      const nonDecorPieces = currentWallCombo.deep.pieces + currentWallCombo.light.pieces;
      const nonDecorSft = nonDecorPieces * currentWallCombo.sqftPerPiece;
      const nonDecorCost = nonDecorSft * wallRatePerSft;
      const decorCost = currentWallCombo.decor.pieces * decorRatePerPcs;
      return Math.round(nonDecorCost + decorCost);
    }
    return Math.round(effectiveWallAreaSft * wallRatePerSft);
  }, [
    hasWall,
    hasSeparateDecorRate,
    currentWallCombo,
    wallRatePerSft,
    decorRatePerPcs,
    effectiveWallAreaSft,
  ]);

  const currentRoomFloorCost = useMemo(() => {
    if (!hasFloor) return 0;
    return Math.round(currentFloorResult.totalGrossAreaSft * floorRatePerSft);
  }, [hasFloor, currentFloorResult, floorRatePerSft]);

  const currentRoomTotalArea = (hasWall ? effectiveWallAreaSft : 0) + (hasFloor ? currentFloorResult.totalGrossAreaSft : 0);
  const currentRoomTotalCost = currentRoomWallCost + currentRoomFloorCost;

  // 150 sft = 1 kg putting / grout
  const currentRoomCementBags = Math.round((currentRoomTotalArea / 100) * 3.2 * 10) / 10;
  const currentRoomSandCft = Math.round((currentRoomTotalArea / 100) * 11);
  const currentRoomGroutKg = Math.round((currentRoomTotalArea / 150) * 10) / 10;

  // ── Save or Update Room ──
  const handleSaveRoom = () => {
    if (!hasWall && !hasFloor) {
      alert('অনুগ্রহ করে ওয়াল বা ফ্লোরের মধ্যে অন্তত একটি অপশন নির্বাচন করুন।');
      return;
    }

    const wallSizeLabel = isCustomWallSize
      ? `${customWallTileH}" × ${customWallTileW}" (কাস্টম)`
      : WALL_TILE_SIZES.find((s) => s.id === selectedWallSizeId)?.name || '৮" × ১২"';

    const floorSizeLabel = isCustomFloorSize
      ? `${customFloorTileH}" × ${customFloorTileW}" (কাস্টম)`
      : FLOOR_TILE_SIZES.find((s) => s.id === selectedFloorSizeId)?.name || '২৪" × ২৪"';

    const newRoom: RoomRecord = {
      id: editingRoomId || Date.now().toString(),
      name: roomName.trim() || `রুম ${houseRooms.length + 1}`,
      hasWall,
      wallAreaSft: hasWall ? Math.round(effectiveWallAreaSft) : 0,
      wallHeightFt: hasWall ? wallHeightFt : 0,
      wallTileSizeName: wallSizeLabel,
      wallTileW: customWallTileW,
      wallTileH: customWallTileH,
      wallPcsPerBox,
      wallRatePerSft,
      hasSeparateDecorRate,
      decorRatePerPcs,
      deepLines: hasWall ? deepLines : 0,
      decorLines: hasWall ? decorLines : 0,
      lightLines: hasWall ? lightLines : 0,
      deepBoxes: hasWall ? currentWallCombo.deep.boxes : 0,
      decorBoxes: hasWall ? currentWallCombo.decor.boxes : 0,
      lightBoxes: hasWall ? currentWallCombo.light.boxes : 0,
      deepPcs: hasWall ? currentWallCombo.deep.pieces : 0,
      decorPcs: hasWall ? currentWallCombo.decor.pieces : 0,
      lightPcs: hasWall ? currentWallCombo.light.pieces : 0,
      wallTotalBoxes: hasWall ? currentWallCombo.grandTotalBoxes : 0,
      wallTotalPcs: hasWall ? currentWallCombo.totalPieces : 0,
      wallCost: currentRoomWallCost,

      hasFloor,
      floorAreaSft: hasFloor ? Math.round(currentFloorResult.totalGrossAreaSft) : 0,
      floorTileSizeName: floorSizeLabel,
      floorTileW: customFloorTileW,
      floorTileH: customFloorTileH,
      floorPcsPerBox,
      floorRatePerSft,
      skirtingInches: skirtingHeightInches,
      floorWastagePercent,
      floorTotalBoxes: hasFloor ? currentFloorResult.totalBoxesNeeded : 0,
      floorTotalPcs: hasFloor ? currentFloorResult.totalPieces : 0,
      floorCost: currentRoomFloorCost,

      combinedAreaSft: Math.round(currentRoomTotalArea),
      totalRoomCost: currentRoomTotalCost,
      cementBags: currentRoomCementBags,
      sandCft: currentRoomSandCft,
      groutKg: currentRoomGroutKg,
    };

    if (editingRoomId) {
      setHouseRooms(houseRooms.map((r) => (r.id === editingRoomId ? newRoom : r)));
      setSuccessMessage(`✓ "${newRoom.name}"-এর তথ্য সফলভাবে আপডেট করা হয়েছে!`);
      setEditingRoomId(null);
    } else {
      setHouseRooms([...houseRooms, newRoom]);
      setSuccessMessage(`✓ "${newRoom.name}" সফলভাবে পুরো বাড়ির তালিকায় যোগ হয়েছে!`);
    }

    // ── Clean / Reset Form to default placeholders ──
    setRoomName(`রুম ${houseRooms.length + 2}`);
    setWallDirectSft(0);
    setWallPerimeterFt(0);
    setWallDeductionSft(0);
    setFloorDirectSft(0);
    setFloorLengthFt(0);
    setFloorWidthFt(0);

    // Auto-scroll to summary after small delay
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // ── Load room into form for editing ──
  const handleEditRoom = (room: RoomRecord) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);
    setHasWall(room.hasWall);
    setHasFloor(room.hasFloor);

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

  // ── Copy Memo for WhatsApp ──
  const handleCopyMemo = () => {
    let message = `📋 *Utools.bd — পুরো বাড়ির টাইলস ও খরচ মেমো*\n\n`;

    houseRooms.forEach((r, idx) => {
      message += `*${toBanglaNum(idx + 1)}. ${r.name}* (মোট ${toBanglaNum(r.combinedAreaSft)} SFT)\n`;
      if (r.hasWall) {
        message += `   🧱 ওয়াল টাইলস: ${toBanglaNum(r.wallTotalBoxes)} কার্টন (${r.wallTileSizeName})\n`;
        message += `      • ডিপ: ${toBanglaNum(r.deepBoxes)} ctn | ডেকোর: ${toBanglaNum(r.decorBoxes)} ctn | লাইট: ${toBanglaNum(r.lightBoxes)} ctn\n`;
      }
      if (r.hasFloor) {
        message += `   🏠 ফ্লোর টাইলস: ${toBanglaNum(r.floorTotalBoxes)} কার্টন (${r.floorTileSizeName})\n`;
      }
      message += `   💰 রুমের টাইলসের দাম: ৳${toBanglaNum(r.totalRoomCost.toLocaleString('bn-BD'))}\n`;
      message += `   🧱 সিমেন্ট: ${toBanglaNum(r.cementBags)} বস্তা | বালু: ${toBanglaNum(r.sandCft)} CFT\n\n`;
    });

    message += `---------------------------------\n`;
    message += `📦 *মোট টাইলস দরকার:* ${toBanglaNum(grandTotal.totalBoxes)} কার্টন\n`;
    message += `   • ওয়াল টাইলস: ${toBanglaNum(grandTotal.totalWallBoxes)} কার্টন\n`;
    message += `   • ফ্লোর টাইলস: ${toBanglaNum(grandTotal.totalFloorBoxes)} কার্টন\n`;
    message += `💰 *টাইলসের মোট দাম:* ৳${toBanglaNum(grandTotal.totalTileCost.toLocaleString('bn-BD'))}\n`;
    message += `🧱 *প্রয়োজনীয় সিমেন্ট:* ${toBanglaNum(grandTotal.totalCementBags)} বস্তা (৳${toBanglaNum(grandTotal.totalCementCost.toLocaleString('bn-BD'))})\n`;
    message += `⏳ *প্রয়োজনীয় বালু:* ${toBanglaNum(grandTotal.totalSandCft)} CFT (৳${toBanglaNum(grandTotal.totalSandCost.toLocaleString('bn-BD'))})\n`;
    message += `✨ *পুটিং পাউডার (Grout):* ${toBanglaNum(grandTotal.totalGroutKg)} কেজি (১৫০ SFT-তে ১ কেজি হারে)\n`;
    message += `🛠️ *মিস্ত্রি মজুরি:* ৳${toBanglaNum(grandTotal.totalLaborCost.toLocaleString('bn-BD'))}\n`;
    message += `---------------------------------\n`;
    message += `🏷️ *সর্বমোট প্রজেক্ট বাজেট:* ৳${toBanglaNum(grandTotal.grandProjectCost.toLocaleString('bn-BD'))}\n\n`;
    message += `হিসাবটি তৈরি করা হয়েছে: https://utools.bd/tiles-calculator`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    handleCopyMemo();
    const encoded = encodeURIComponent(
      `Utools.bd টাইলস ও পুরো বাড়ির হিসাব মেমো দেখতে লিংকে যান: https://utools.bd/tiles-calculator`
    );
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // SEO FAQs
  const seoFaqs = [
    {
      question: '১০০ স্কয়ার ফিট টাইলস বসাতে কত বস্তা সিমেন্ট ও বালু লাগে?',
      answer:
        'বাংলাদেশে পিডব্লিউডি (PWD) ও অভিজ্ঞ রাজমিস্ত্রিদের হিসাব অনুযায়ী প্রতি ১০০ স্কয়ার ফিট টাইলসের বেড মসলা (১:৪ অনুপাতে ১ ইঞ্চি পুরু) এবং টাইলসের নিচে সিমেন্টের পেস্টের জন্য গড়ে ৩.০ থেকে ৩.৫ বস্তা সিমেন্ট এবং ১০ থেকে ১২ সিএফটি (CFT) সিলেট বা প্লাস্টারিং বালু প্রয়োজন হয়।',
    },
    {
      question: 'টাইলসের পুটিং বা গ্রাউট পাউডার কত স্কয়ার ফিটে ১ কেজি লাগে?',
      answer:
        'প্রমিত হিসাব অনুযায়ী প্রতি ১৫০ স্কয়ার ফিট টাইলসের জোড়া বা গ্রাউটিং লাইনের ফাঁকা ভরতে গড়ে প্রায় ১ কেজি পুটিং পাউডার (Tile Grout) প্রয়োজন হয়। বড় সাইজের টাইলস (যেমন ২৪"×২৪") হলে জয়েন্ট কম থাকায় ১৫০ থেকে ১৭০ স্কয়ার ফিট এবং ছোট টাইলস হলে প্রায় ১২০ থেকে ১৫০ স্কয়ার ফিটে ১ কেজি পুটিং লাগে।',
    },
    {
      question: 'ওয়াল টাইলসে ডেকোর (Décor) টাইলসের দাম কেন আলাদা হিসাব করা হয়?',
      answer:
        'সাধারণ ওয়াল টাইলস (ডিপ ও লাইট) স্কয়ার ফিট বা কার্টন হিসেবে বিক্রি হলেও ডেকোর/বর্ডার টাইলস আলাদা ডিজাইনার আইটেম হওয়ায় অধিকাংশ শোরুমে পিস হিসেবে (যেমন ১৫০ থেকে ৩০০ টাকা প্রতি পিস) বিক্রি হয়। তাই সাধারণ টাইলসের রেটের সাথে ডেকোরের আলাদা দর গুণ করে সঠিক বাজেট বের করা জরুরি।',
    },
    {
      question: 'ওয়াল টাইলসে দরজা ও জানালার মাপ কীভাবে বাদ দেওয়া হয়?',
      answer:
        'চার দেয়ালের মোট ক্ষেত্রফল (দৈর্ঘ্য × উচ্চতা) বের করার পর বাথরুমের দরজা (সাধারণত ২.৫\' × ৭\' = ১৭.৫ SFT) এবং ভেন্টিলেটর বা জানালা (২\' × ২\' = ৪ SFT) থাকলে সেই মাপটুকু মোট ক্ষেত্রফল থেকে বিয়োগ করে নিট ওয়াল এরিয়া বের করতে হয়। এতে অপ্রয়োজনীয় বাড়তি টাইলস কেনা এড়ানো যায়।',
    },
    {
      question: '১ কার্টন টাইলসে কত স্কয়ার ফিট থাকে?',
      answer:
        'বাংলাদেশে টাইলসের সাইজ অনুযায়ী প্রতি কার্টনের ক্ষেত্রফল নির্ধারিত হয়। যেমন: ৮"×১২" বাথরুম টাইলসে ২৫ পিস (১৬.৬৭ স্কয়ার ফিট), ১০"×১৬" সাইজে ১৫ পিস (১৬.৬৭ স্কয়ার ফিট), ১২"×১৮" সাইজে ১০ পিস (১৫ স্কয়ার ফিট), এবং জনপ্রিয় ২×২ ফিট (২৪"×২৪") ফ্লোর টাইলসের প্রতি বক্সে ৪ পিস অর্থাৎ ঠিক ১৬ স্কয়ার ফিট থাকে।',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <ToolSeoHead
        title="টাইলস ক্যালকুলেটর — ওয়াল কম্বো, ফ্লোর টাইলস কার্টন ও পুরো বাড়ির খরচ হিসাব | Utools.bd"
        description="ওয়াল টাইলসের ডিপ-ডেকোর-লাইট কম্বো, ডেকোর আলাদা রেট, ফ্লোর টাইলস, দরজা-জানালা বাদ, সিমেন্ট-বালু ও পুটিংয়ের সঠিক হিসাব।"
        canonicalUrl="https://utools.bd/tiles-calculator"
        toolName="টাইলস ক্যালকুলেটর (Tiles Calculator BD)"
        categoryName="ক্যালকুলেটর"
        categoryPath="/calculator"
        faqs={seoFaqs}
      />

      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5A52] hover:text-[#0B5D3B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> সকল টুলসে ফিরে যান
        </Link>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E6F4EC] text-[#0B5D3B] border border-[#0B5D3B]/20 mb-3">
          <Grid className="w-4 h-4" />
          <span>ওয়াল কম্বো • ফ্লোর • ডেকোর রেট • সিমেন্ট-বালু • পুরো বাড়ি</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1F17] tracking-tight mb-3">
          টাইলস ক্যালকুলেটর <span className="text-[#0B5D3B]">(Tiles Calculator BD)</span>
        </h1>
        <p className="text-base text-[#4A5A52] leading-relaxed">
          প্রতিটি রুমের ওয়াল ও ফ্লোর টাইলস একসাথে হিসাব করুন, ডেকোরের আলাদা দর দিন এবং এক ক্লিকে পুরো বাড়ির সিমেন্ট-বালুসহ পূর্ণাঙ্গ মেমো তৈরি করুন।
        </p>
      </div>

      {/* Success Toast / Notification */}
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

      {/* Edit Mode Banner */}
      {editingRoomId && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 text-sm font-semibold">
            <Edit2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              আপনি <strong>"{houseRooms.find((r) => r.id === editingRoomId)?.name}"</strong> এডিট করছেন।
              মাপ পরিবর্তন করে নিচের <strong>"✓ পরিবর্তন সংরক্ষণ করুন"</strong> বাটনে চাপুন।
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRoomId(null);
              setRoomName(`রুম ${houseRooms.length + 1}`);
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
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold text-[#0F1F17] mb-1.5 uppercase tracking-wider">
              ১. রুমের নাম নির্ধারণ করুন:
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-base text-[#0F1F17] focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
              placeholder="যেমন: মাস্টার বাথরুম, কিচেন, ড্রয়িং রুম"
            />
          </div>
          <div className="flex items-center gap-4 pt-4 sm:pt-0">
            <label className="flex items-center gap-2 text-sm font-bold text-[#0F1F17] cursor-pointer">
              <input
                type="checkbox"
                checked={hasWall}
                onChange={(e) => setHasWall(e.target.checked)}
                className="w-4 h-4 text-[#0B5D3B] rounded-sm focus:ring-[#0B5D3B]"
              />
              🧱 ওয়াল টাইলস আছে
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-[#0F1F17] cursor-pointer">
              <input
                type="checkbox"
                checked={hasFloor}
                onChange={(e) => setHasFloor(e.target.checked)}
                className="w-4 h-4 text-[#0B5D3B] rounded-sm focus:ring-[#0B5D3B]"
              />
              🏠 ফ্লোর টাইলস আছে
            </label>
          </div>
        </div>

        {/* ── SECTION A: WALL TILES COMBO ── */}
        {hasWall && (
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F1F17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0B5D3B]" /> ওয়াল টাইলস কম্বো (Wall Tiles Combo)
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
                      placeholder="৩৫০"
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
                      placeholder="৫০"
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
                    placeholder="৭"
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
                    placeholder="২০"
                  />
                  <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                    SFT
                  </span>
                </div>
              </div>
            </div>

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
                    placeholder="৬৫"
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
                      placeholder="১৮০"
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

            {/* Wall Tile Size Selector */}
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

            {/* Pattern Rows Breakdown (Deep, Decor, Light) */}
            <div className="p-4 rounded-xl bg-white border border-[#D5E4DB] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F1F17]">
                  🎨 দেয়ালের শেইড সারি (মোট {toBanglaNum(currentWallCombo.totalLines.toFixed(1))} টি লাইন)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#0B5D3B] font-semibold">
                  উচ্চতা {toBanglaNum(wallHeightFt * 12)}" ÷ {toBanglaNum(customWallTileH)}"
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <span className="block text-[11px] font-bold text-blue-900 mb-1">১. ডিপ (Deep) লাইন</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={deepLines}
                    onChange={(e) => setDeepLines(Math.max(0, Number(e.target.value)))}
                    className="w-full py-1 text-center font-bold text-sm bg-white rounded-md border border-blue-300"
                  />
                  <span className="block text-[10px] text-blue-700 mt-1">
                    {toBanglaNum(currentWallCombo.deep.boxes)} ctn ({toBanglaNum(currentWallCombo.deep.pieces)} pcs)
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <span className="block text-[11px] font-bold text-amber-900 mb-1">২. ডেকোর (Decor) লাইন</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={decorLines}
                    onChange={(e) => setDecorLines(Math.max(0, Number(e.target.value)))}
                    className="w-full py-1 text-center font-bold text-sm bg-white rounded-md border border-amber-300"
                  />
                  <span className="block text-[10px] text-amber-700 mt-1">
                    {toBanglaNum(currentWallCombo.decor.boxes)} ctn ({toBanglaNum(currentWallCombo.decor.pieces)} pcs)
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-center">
                  <span className="block text-[11px] font-bold text-slate-800 mb-1">৩. লাইট (Light) লাইন</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={lightLines}
                    onChange={(e) => setLightLines(Math.max(0, Number(e.target.value)))}
                    className="w-full py-1 text-center font-bold text-sm bg-white rounded-md border border-slate-300"
                  />
                  <span className="block text-[10px] text-slate-600 mt-1">
                    {toBanglaNum(currentWallCombo.light.boxes)} ctn ({toBanglaNum(currentWallCombo.light.pieces)} pcs)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION B: FLOOR TILES ── */}
        {hasFloor && (
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F1F17] flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#0B5D3B]" /> ফ্লোর টাইলস পরিমাপ (Floor Tiles)
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
                ফ্লোর ও স্কার্টিং
              </span>
            </div>

            {/* Input Mode: SFT or Dimensions */}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {floorInputMode === 'dimensions' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1F17] mb-1">দৈর্ঘ্য (ফিট)</label>
                    <input
                      type="number"
                      min="0"
                      value={floorLengthFt || ''}
                      onChange={(e) => setFloorLengthFt(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="৮"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1F17] mb-1">প্রস্থ (ফিট)</label>
                    <input
                      type="number"
                      min="0"
                      value={floorWidthFt || ''}
                      onChange={(e) => setFloorWidthFt(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="৬"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1">ফ্লোরের মোট SFT</label>
                  <input
                    type="number"
                    min="0"
                    value={floorDirectSft || ''}
                    onChange={(e) => setFloorDirectSft(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="৪৮"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">ফ্লোর রেট (৳/SFT)</label>
                <input
                  type="number"
                  value={floorRatePerSft || ''}
                  onChange={(e) => setFloorRatePerSft(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-white font-bold text-[#0B5D3B] text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="৮০"
                />
              </div>
            </div>

            {/* Floor Tile Sizes */}
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
        )}

        {/* ── Action Button: Save Room ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveRoom}
            className="w-full py-4 px-6 rounded-2xl bg-[#0B5D3B] hover:bg-[#084A2E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
          >
            {editingRoomId ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingRoomId
              ? '✓ পরিবর্তন সংরক্ষণ করুন (Update Room)'
              : '+ পুরো বাড়ির হিসাবে এই রুমটি যোগ করুন (Add to House Memo)'}
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
                    {/* Wall breakdown if room has wall */}
                    {room.hasWall && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#D5E4DB]/70 space-y-1">
                        <div className="flex justify-between font-bold text-[#0F1F17]">
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

                    {/* Floor breakdown if room has floor */}
                    {room.hasFloor && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#D5E4DB]/70 space-y-1">
                        <div className="flex justify-between font-bold text-[#0F1F17]">
                          <span>🏠 ফ্লোর টাইলস ({room.floorTileSizeName}):</span>
                          <span className="text-[#0B5D3B]">{toBanglaNum(room.floorTotalBoxes)} কার্টন</span>
                        </div>
                        <div className="text-[11px] text-[#4A5A52]">
                          ফ্লোরের দাম: <strong>৳{toBanglaNum(room.floorCost.toLocaleString('bn-BD'))}</strong>
                        </div>
                      </div>
                    )}

                    {/* Materials for this room (150 sft = 1kg grout) */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 bg-white rounded-lg border border-[#D5E4DB]/60">
                        <div className="text-[10px] text-[#4A5A52]">টাইলস মোট দাম</div>
                        <div className="font-bold text-[#0F1F17]">৳{toBanglaNum(room.totalRoomCost.toLocaleString('bn-BD'))}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#D5E4DB]/60">
                        <div className="text-[10px] text-[#4A5A52]">সিমেন্ট দরকার</div>
                        <div className="font-bold text-[#0B5D3B]">{toBanglaNum(room.cementBags)} বস্তা</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#D5E4DB]/60">
                        <div className="text-[10px] text-[#4A5A52]">বালু দরকার</div>
                        <div className="font-bold text-[#0B5D3B]">{toBanglaNum(room.sandCft)} CFT</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Grand Total Memo Card ── */}
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
                ওয়াল: {toBanglaNum(grandTotal.totalWallBoxes)} কার্টন • ফ্লোর: {toBanglaNum(grandTotal.totalFloorBoxes)} কার্টন • মোট এরিয়া: {toBanglaNum(grandTotal.totalArea)} SFT
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

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyMemo}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-[#0B5D3B] text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-[#0B5D3B]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'মেমো কপি হয়েছে!' : 'দোকান মেমো কপি করুন'}
            </button>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#20BD5A] transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" /> WhatsApp এ মেমো পাঠান
            </button>
          </div>
        </div>
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

      {/* ── SEO FAQ Section (Includes 3 Cement, Sand, Putting Calculation FAQs) ── */}
      <div className="mt-12 bg-[#F8FAF9] p-6 sm:p-8 rounded-3xl border border-[#D5E4DB]">
        <h2 className="text-xl font-bold text-[#0F1F17] mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0B5D3B]" /> টাইলস, সিমেন্ট, বালু ও পুটিং হিসাবের সাধারণ প্রশ্নোত্তর (FAQ)
        </h2>
        <div className="space-y-4">
          {seoFaqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-[#D5E4DB]">
              <h3 className="font-bold text-base text-[#0F1F17] mb-1.5">{faq.question}</h3>
              <p className="text-sm text-[#4A5A52] leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12">
        <RelatedTools currentToolId="tiles-calculator" />
      </div>
    </div>
  );
};
