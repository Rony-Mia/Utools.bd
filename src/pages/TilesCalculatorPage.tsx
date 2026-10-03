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
  Calculator,
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

type MainTab = 'wall-combo' | 'floor';

interface HouseRoom {
  id: string;
  name: string;
  type: 'wall' | 'floor';
  areaSft: number;
  tileSizeName: string;
  tileWidthInches: number;
  tileHeightInches: number;
  pcsPerBox: number;
  ratePerSft: number;
  // Wall-specific
  wallHeightFt?: number;
  deepLines?: number;
  decorLines?: number;
  lightLines?: number;
  deepBoxes?: number;
  decorBoxes?: number;
  lightBoxes?: number;
  deepPcs?: number;
  decorPcs?: number;
  lightPcs?: number;
  // Floor-specific
  skirtingInches?: number;
  wastagePercent?: number;
  // Calculated outputs
  totalPieces: number;
  totalBoxes: number;
  tileCost: number;
  cementBags: number;
  sandCft: number;
  groutKg: number;
}

export const TilesCalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('wall-combo');

  // Global settings for labor & materials rate
  const [laborCostPerSft, setLaborCostPerSft] = useState<number>(22);
  const [cementBagPrice, setCementBagPrice] = useState<number>(520);
  const [sandPricePerCft, setSandPricePerCft] = useState<number>(45);
  const [groutPricePerKg, setGroutPricePerKg] = useState<number>(130);

  // ── Wall Tiles Tab State ──
  const [wallRoomName, setWallRoomName] = useState<string>('মাস্টার বাথরুম');
  const [wallAreaSft, setWallAreaSft] = useState<number>(350);
  const [wallHeightFt, setWallHeightFt] = useState<number>(7);
  const [wallRatePerSft, setWallRatePerSft] = useState<number>(65);

  const [selectedWallSizeId, setSelectedWallSizeId] = useState<string>('8x12');
  const [isCustomWallSize, setIsCustomWallSize] = useState<boolean>(false);
  const [customWallTileW, setCustomWallTileW] = useState<number>(12);
  const [customWallTileH, setCustomWallTileH] = useState<number>(8);
  const [wallPcsPerBox, setWallPcsPerBox] = useState<number>(25);

  const [deepLines, setDeepLines] = useState<number>(5.5);
  const [decorLines, setDecorLines] = useState<number>(1);
  const [lightLines, setLightLines] = useState<number>(4);
  const [wallDeductionSft, setWallDeductionSft] = useState<number>(0);
  const [wallWastagePercent, setWallWastagePercent] = useState<number>(0);

  // ── Floor Tiles Tab State ──
  const [floorRoomName, setFloorRoomName] = useState<string>('বেডরুম ১');
  const [floorInputType, setFloorInputType] = useState<'direct' | 'dimensions'>('direct');
  const [floorLengthFt, setFloorLengthFt] = useState<number>(15);
  const [floorWidthFt, setFloorWidthFt] = useState<number>(12);
  const [floorDirectSft, setFloorDirectSft] = useState<number>(180);
  const [floorRatePerSft, setFloorRatePerSft] = useState<number>(80);

  const [selectedFloorSizeId, setSelectedFloorSizeId] = useState<string>('24x24');
  const [isCustomFloorSize, setIsCustomFloorSize] = useState<boolean>(false);
  const [customFloorTileW, setCustomFloorTileW] = useState<number>(24);
  const [customFloorTileH, setCustomFloorTileH] = useState<number>(24);
  const [floorPcsPerBox, setFloorPcsPerBox] = useState<number>(4);
  const [skirtingHeightInches, setSkirtingHeightInches] = useState<number>(4);
  const [floorWastagePercent, setFloorWastagePercent] = useState<number>(5);

  // ── Edit State for Multi-Room ──
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // ── Multi-Room House List ──
  const [houseRooms, setHouseRooms] = useState<HouseRoom[]>([
    {
      id: '1',
      name: 'মাস্টার বাথরুম (ওয়াল)',
      type: 'wall',
      areaSft: 350,
      tileSizeName: '৮" × ১২"',
      tileWidthInches: 12,
      tileHeightInches: 8,
      pcsPerBox: 25,
      ratePerSft: 65,
      wallHeightFt: 7,
      deepLines: 5.5,
      decorLines: 1,
      lightLines: 4,
      deepBoxes: 11,
      decorBoxes: 2,
      lightBoxes: 8,
      deepPcs: 275,
      decorPcs: 50,
      lightPcs: 200,
      totalPieces: 525,
      totalBoxes: 21,
      tileCost: 350 * 65,
      cementBags: Math.round((350 / 100) * 3.2 * 10) / 10,
      sandCft: Math.round((350 / 100) * 11),
      groutKg: Math.round((350 / 100) * 1.0 * 10) / 10,
    },
    {
      id: '2',
      name: 'বেডরুম ১ (ফ্লোর)',
      type: 'floor',
      areaSft: 180,
      tileSizeName: '২৪" × ২৪" (2x2 ft)',
      tileWidthInches: 24,
      tileHeightInches: 24,
      pcsPerBox: 4,
      ratePerSft: 80,
      skirtingInches: 4,
      wastagePercent: 5,
      totalPieces: 48,
      totalBoxes: 12,
      tileCost: 180 * 80,
      cementBags: Math.round((180 / 100) * 3.2 * 10) / 10,
      sandCft: Math.round((180 / 100) * 11),
      groutKg: Math.round((180 / 100) * 1.0 * 10) / 10,
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

  // ── Live Calculations for Active Tab ──
  const activeWallTileW = isCustomWallSize ? customWallTileW : customWallTileW;
  const activeWallTileH = isCustomWallSize ? customWallTileH : customWallTileH;

  const currentWallCombo = useMemo(() => {
    return calculateWallCombo({
      wallAreaSft,
      wallHeightFt,
      tileHeightInches: activeWallTileH,
      tileWidthInches: activeWallTileW,
      pcsPerBox: wallPcsPerBox,
      deepLines,
      decorLines,
      lightLines,
      deductionSft: wallDeductionSft,
      wastagePercent: wallWastagePercent,
    });
  }, [
    wallAreaSft,
    wallHeightFt,
    activeWallTileH,
    activeWallTileW,
    wallPcsPerBox,
    deepLines,
    decorLines,
    lightLines,
    wallDeductionSft,
    wallWastagePercent,
  ]);

  const activeFloorTileW = isCustomFloorSize ? customFloorTileW : customFloorTileW;
  const activeFloorTileH = isCustomFloorSize ? customFloorTileH : customFloorTileH;

  const currentFloorResult = useMemo(() => {
    return calculateFloorTiles({
      lengthFt: floorInputType === 'dimensions' ? floorLengthFt : 0,
      widthFt: floorInputType === 'dimensions' ? floorWidthFt : 0,
      directAreaSft: floorInputType === 'direct' ? floorDirectSft : 0,
      tileLengthInches: activeFloorTileW,
      tileWidthInches: activeFloorTileH,
      pcsPerBox: floorPcsPerBox,
      skirtingHeightInches,
      wastagePercent: floorWastagePercent,
    });
  }, [
    floorInputType,
    floorLengthFt,
    floorWidthFt,
    floorDirectSft,
    activeFloorTileW,
    activeFloorTileH,
    floorPcsPerBox,
    skirtingHeightInches,
    floorWastagePercent,
  ]);

  // Current active room live cost
  const currentLiveCost = useMemo(() => {
    if (activeTab === 'wall-combo') {
      const tileCost = wallAreaSft * wallRatePerSft;
      const cementBags = Math.round((wallAreaSft / 100) * 3.2 * 10) / 10;
      const sandCft = Math.round((wallAreaSft / 100) * 11);
      const groutKg = Math.round((wallAreaSft / 100) * 1.0 * 10) / 10;
      return { tileCost, cementBags, sandCft, groutKg };
    } else {
      const area = currentFloorResult.totalGrossAreaSft;
      const tileCost = area * floorRatePerSft;
      const cementBags = Math.round((area / 100) * 3.2 * 10) / 10;
      const sandCft = Math.round((area / 100) * 11);
      const groutKg = Math.round((area / 100) * 1.0 * 10) / 10;
      return { tileCost, cementBags, sandCft, groutKg };
    }
  }, [activeTab, wallAreaSft, wallRatePerSft, currentFloorResult, floorRatePerSft]);

  // ── Add or Update Room in Multi-Room House List ──
  const handleSaveRoom = () => {
    if (activeTab === 'wall-combo') {
      const area = Math.max(1, wallAreaSft);
      const tileCost = area * wallRatePerSft;
      const cementBags = Math.round((area / 100) * 3.2 * 10) / 10;
      const sandCft = Math.round((area / 100) * 11);
      const groutKg = Math.round((area / 100) * 1.0 * 10) / 10;

      const sizeLabel = isCustomWallSize
        ? `${customWallTileH}" × ${customWallTileW}" (কাস্টম)`
        : WALL_TILE_SIZES.find((s) => s.id === selectedWallSizeId)?.name || '৮" × ১২"';

      const roomData: HouseRoom = {
        id: editingRoomId || Date.now().toString(),
        name: wallRoomName.trim() || 'বাথরুম/ওয়াল',
        type: 'wall',
        areaSft: area,
        tileSizeName: sizeLabel,
        tileWidthInches: activeWallTileW,
        tileHeightInches: activeWallTileH,
        pcsPerBox: wallPcsPerBox,
        ratePerSft: wallRatePerSft,
        wallHeightFt,
        deepLines,
        decorLines,
        lightLines,
        deepBoxes: currentWallCombo.deep.boxes,
        decorBoxes: currentWallCombo.decor.boxes,
        lightBoxes: currentWallCombo.light.boxes,
        deepPcs: currentWallCombo.deep.pieces,
        decorPcs: currentWallCombo.decor.pieces,
        lightPcs: currentWallCombo.light.pieces,
        totalPieces: currentWallCombo.totalPieces,
        totalBoxes: currentWallCombo.grandTotalBoxes,
        tileCost,
        cementBags,
        sandCft,
        groutKg,
      };

      if (editingRoomId) {
        setHouseRooms(houseRooms.map((r) => (r.id === editingRoomId ? roomData : r)));
        setEditingRoomId(null);
      } else {
        setHouseRooms([...houseRooms, roomData]);
      }
      setWallRoomName(`বাথরুম ${houseRooms.length + 1}`);
    } else {
      const area = currentFloorResult.totalGrossAreaSft;
      const tileCost = area * floorRatePerSft;
      const cementBags = Math.round((area / 100) * 3.2 * 10) / 10;
      const sandCft = Math.round((area / 100) * 11);
      const groutKg = Math.round((area / 100) * 1.0 * 10) / 10;

      const sizeLabel = isCustomFloorSize
        ? `${customFloorTileH}" × ${customFloorTileW}" (কাস্টম)`
        : FLOOR_TILE_SIZES.find((s) => s.id === selectedFloorSizeId)?.name || '২৪" × ২৪"';

      const roomData: HouseRoom = {
        id: editingRoomId || Date.now().toString(),
        name: floorRoomName.trim() || 'ফ্লোর রুম',
        type: 'floor',
        areaSft: Math.round(area),
        tileSizeName: sizeLabel,
        tileWidthInches: activeFloorTileW,
        tileHeightInches: activeFloorTileH,
        pcsPerBox: floorPcsPerBox,
        ratePerSft: floorRatePerSft,
        skirtingInches: skirtingHeightInches,
        wastagePercent: floorWastagePercent,
        totalPieces: currentFloorResult.totalPieces,
        totalBoxes: currentFloorResult.totalBoxesNeeded,
        tileCost,
        cementBags,
        sandCft,
        groutKg,
      };

      if (editingRoomId) {
        setHouseRooms(houseRooms.map((r) => (r.id === editingRoomId ? roomData : r)));
        setEditingRoomId(null);
      } else {
        setHouseRooms([...houseRooms, roomData]);
      }
      setFloorRoomName(`বেডরুম ${houseRooms.length + 1}`);
    }
  };

  // ── Load room into form for editing ──
  const handleEditRoom = (room: HouseRoom) => {
    setEditingRoomId(room.id);
    if (room.type === 'wall') {
      setActiveTab('wall-combo');
      setWallRoomName(room.name);
      setWallAreaSft(room.areaSft);
      setWallRatePerSft(room.ratePerSft);
      if (room.wallHeightFt) setWallHeightFt(room.wallHeightFt);
      if (room.deepLines !== undefined) setDeepLines(room.deepLines);
      if (room.decorLines !== undefined) setDecorLines(room.decorLines);
      if (room.lightLines !== undefined) setLightLines(room.lightLines);
      setWallPcsPerBox(room.pcsPerBox);
      setCustomWallTileW(room.tileWidthInches);
      setCustomWallTileH(room.tileHeightInches);
    } else {
      setActiveTab('floor');
      setFloorRoomName(room.name);
      setFloorInputType('direct');
      setFloorDirectSft(room.areaSft);
      setFloorRatePerSft(room.ratePerSft);
      setFloorPcsPerBox(room.pcsPerBox);
      setCustomFloorTileW(room.tileWidthInches);
      setCustomFloorTileH(room.tileHeightInches);
      if (room.skirtingInches !== undefined) setSkirtingHeightInches(room.skirtingInches);
      if (room.wastagePercent !== undefined) setFloorWastagePercent(room.wastagePercent);
    }

    // Scroll to top smooth
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleDeleteRoom = (id: string) => {
    setHouseRooms(houseRooms.filter((r) => r.id !== id));
    if (editingRoomId === id) setEditingRoomId(null);
  };

  // ── Grand Total Calculations ──
  const grandTotal = useMemo(() => {
    let totalArea = 0;
    let totalBoxes = 0;
    let totalPieces = 0;
    let totalTileCost = 0;
    let totalCementBags = 0;
    let totalSandCft = 0;
    let totalGroutKg = 0;

    houseRooms.forEach((r) => {
      totalArea += r.areaSft;
      totalBoxes += r.totalBoxes;
      totalPieces += r.totalPieces;
      totalTileCost += r.tileCost;
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
      totalBoxes,
      totalPieces,
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
      message += `*${toBanglaNum(idx + 1)}. ${r.name}* (${toBanglaNum(r.areaSft)} SFT - ${r.tileSizeName})\n`;
      if (r.type === 'wall') {
        message += `   • ডিপ: ${toBanglaNum(r.deepBoxes || 0)} কার্টন | ডেকোর: ${toBanglaNum(r.decorBoxes || 0)} কার্টন | লাইট: ${toBanglaNum(r.lightBoxes || 0)} কার্টন\n`;
      }
      message += `   • টাইলস: ${toBanglaNum(r.totalBoxes)} কার্টন | দাম: ৳${toBanglaNum(r.tileCost.toLocaleString('bn-BD'))}\n`;
      message += `   • সিমেন্ট: ${toBanglaNum(r.cementBags)} বস্তা | বালু: ${toBanglaNum(r.sandCft)} CFT\n\n`;
    });

    message += `---------------------------------\n`;
    message += `📦 *মোট টাইলস দরকার:* ${toBanglaNum(grandTotal.totalBoxes)} কার্টন (${toBanglaNum(grandTotal.totalPieces)} পিস)\n`;
    message += `💰 *টাইলসের মোট দাম:* ৳${toBanglaNum(grandTotal.totalTileCost.toLocaleString('bn-BD'))}\n`;
    message += `🧱 *প্রয়োজনীয় সিমেন্ট:* ${toBanglaNum(grandTotal.totalCementBags)} বস্তা (৳${toBanglaNum(grandTotal.totalCementCost.toLocaleString('bn-BD'))})\n`;
    message += `⏳ *প্রয়োজনীয় বালু:* ${toBanglaNum(grandTotal.totalSandCft)} CFT (৳${toBanglaNum(grandTotal.totalSandCost.toLocaleString('bn-BD'))})\n`;
    message += `🛠️ *মিস্ত্রি খরচ:* ৳${toBanglaNum(grandTotal.totalLaborCost.toLocaleString('bn-BD'))}\n`;
    message += `---------------------------------\n`;
    message += `🏷️ *সর্বমোট আনুমানিক বাজেট:* ৳${toBanglaNum(grandTotal.grandProjectCost.toLocaleString('bn-BD'))}\n\n`;
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
      question: '১ কার্টন টাইলসে কত স্কয়ার ফিট থাকে?',
      answer:
        'বাংলাদেশে টাইলসের সাইজ অনুযায়ী প্রতি কার্টনের ক্ষেত্রফল নির্ধারিত হয়। যেমন: ৮"×১২" বাথরুম টাইলসে ২৫ পিস (১৬.৬৭ স্কয়ার ফিট), ১০"×১৬" সাইজে ১৫ পিস (১৬.৬৭ স্কয়ার ফিট), ১২"×১৮" সাইজে ১০ পিস (১৫ স্কয়ার ফিট), এবং জনপ্রিয় ২×২ ফিট (২৪"×২৪") ফ্লোর টাইলসের প্রতি বক্সে ৪ পিস অর্থাৎ ঠিক ১৬ স্কয়ার ফিট থাকে।',
    },
    {
      question: 'ওয়াল টাইলসে ডিপ, ডেকোর ও লাইট কীভাবে হিসাব করতে হয়?',
      answer:
        'দেয়ালের উচ্চতাকে টাইলের উচ্চতা দিয়ে ভাগ করে মোট সারি (লাইন) বের করা হয়। যেমন ৭ ফিট দেয়াল ও ৮ ইঞ্চি টাইলে মোট ১০.৫টি সারি হয়। নিচে সাধারণত ৫ থেকে ৫.৫ লাইন ডিপ (Deep), মাঝে ১ লাইন ডেকোর বা বর্ডার (Decor) এবং উপরে বাকি অংশ লাইট (Light) টাইলস লাগানো হয়। প্রতি অংশের লাইনের শতকরা অনুপাত দিয়ে মোট পিস ও কার্টনের হিসাব বের করা হয়।',
    },
    {
      question: 'টাইলস কেনার সময় কত শতাংশ অতিরিক্ত (Wastage) নেওয়া উচিত?',
      answer:
        'কোনা কাটা, রুমের দেয়াল বাঁকা থাকা বা পরিবহনে ভাঙার ঝুঁকি এড়াতে সোজা ফ্লোরের ক্ষেত্রে ৫% এবং বাথরুম বা ডায়াগোনাল প্যাটার্নের ক্ষেত্রে ৮% থেকে ১০% অতিরিক্ত টাইলস কেনা উচিত। অন্যথায় কাজ শেষে একই লটের বা শেডের টাইলস দোকানে নাও পাওয়া যেতে পারে।',
    },
    {
      question: '১০০ স্কয়ার ফিট টাইলস বসাতে কত বস্তা সিমেন্ট ও বালু লাগে?',
      answer:
        'বাংলাদেশি রাজমিস্ত্রিদের হিসাব অনুযায়ী প্রতি ১০০ স্কয়ার ফিট ফ্লোর টাইলসের মসলা ও জয়েন্ট পেস্টিংয়ের জন্য গড়ে ৩ থেকে ৩.৫ বস্তা সিমেন্ট এবং ১০ থেকে ১২ সিএফটি (CFT) সিলেট বা লাল বালু প্রয়োজন হয়।',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <ToolSeoHead
        title="টাইলস ক্যালকুলেটর — ওয়াল কম্বো, ফ্লোর টাইলস কার্টন ও পুরো বাড়ির খরচ হিসাব | Utools.bd"
        description="ওয়াল টাইলসের ডিপ-ডেকোর-লাইট কম্বো, ফ্লোর টাইলস কার্টন ও পিস হিসাব, স্কার্টিং, প্রতি রুমের আলাদা সিমেন্ট-বালু ও পুরো বাড়ির খরচের মেমো।"
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
          <span>বাথরুম ওয়াল কম্বো • ফ্লোর টাইলস • পুরো বাড়ির মেমো</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1F17] tracking-tight mb-3">
          টাইলস ক্যালকুলেটর <span className="text-[#0B5D3B]">(Tiles Calculator BD)</span>
        </h1>
        <p className="text-base text-[#4A5A52] leading-relaxed">
          ওয়াল টাইলসের <strong>ডিপ-ডেকোর-লাইট</strong> কম্বো ও ফ্লোর টাইলস হিসাব করুন, রেট দিন এবং এক ক্লিকে পুরো বাড়ির মেমো তৈরি করুন।
        </p>
      </div>

      {/* Edit Mode Alert Banner */}
      {editingRoomId && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 text-sm font-semibold">
            <Edit2 className="w-4 h-4 text-amber-700" />
            <span>
              আপনি <strong>"{houseRooms.find((r) => r.id === editingRoomId)?.name}"</strong> এডিট করছেন।
              মাপ পরিবর্তন করে নিচের "পরিবর্তন সংরক্ষণ করুন" বাটনে চাপুন।
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEditingRoomId(null)}
            className="text-xs px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold"
          >
            বাতিল
          </button>
        </div>
      )}

      {/* Streamlined 2-Tab Navigation */}
      <div className="flex gap-2 mb-8 p-1.5 bg-[#EAF2ED] rounded-2xl border border-[#D5E4DB]">
        <button
          type="button"
          onClick={() => setActiveTab('wall-combo')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'wall-combo'
              ? 'bg-white text-[#0B5D3B] shadow-xs'
              : 'text-[#4A5A52] hover:text-[#0F1F17]'
          }`}
        >
          <Layers className="w-4 h-4" /> ওয়াল টাইলস কম্বো (Wall Tiles)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('floor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'floor'
              ? 'bg-white text-[#0B5D3B] shadow-xs'
              : 'text-[#4A5A52] hover:text-[#0F1F17]'
          }`}
        >
          <Grid className="w-4 h-4" /> ফ্লোর টাইলস (Floor Tiles)
        </button>
      </div>

      {/* ── Tab 1: Wall Tiles Combo ── */}
      {activeTab === 'wall-combo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <h2 className="text-xl font-bold text-[#0F1F17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0B5D3B]" /> ওয়াল টাইলস কম্বো পরিমাপ
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
                বাথরুম / কিচেন / দেয়াল
              </span>
            </div>

            {/* Room Name & Rate per SFT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  রুমের নাম (Room Name)
                </label>
                <input
                  type="text"
                  value={wallRoomName}
                  onChange={(e) => setWallRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-semibold text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                  placeholder="যেমন: মাস্টার বাথরুম"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  টাইলসের দাম (টাকা প্রতি SFT)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={wallRatePerSft || ''}
                    onChange={(e) => setWallRatePerSft(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0B5D3B] text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="যেমন: ৬৫"
                  />
                  <span className="absolute right-3 text-xs font-semibold text-[#4A5A52] pointer-events-none">
                    ৳/SFT
                  </span>
                </div>
              </div>
            </div>

            {/* Wall SFT & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  দেয়ালের মোট ক্ষেত্রফল (SFT) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={wallAreaSft || ''}
                    onChange={(e) => setWallAreaSft(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0B5D3B] text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="৩৫০"
                  />
                  <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                    SFT
                  </span>
                </div>
                <p className="text-[11px] text-[#4A5A52] mt-1">সব দেয়ালের মোট মাপ (চার দেয়াল যোগফল)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  দেয়ালের উচ্চতা (ফিট) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={wallHeightFt || ''}
                    onChange={(e) => setWallHeightFt(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0F1F17] text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="৭"
                  />
                  <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                    ফিট
                  </span>
                </div>
                <p className="text-[11px] text-[#4A5A52] mt-1">স্ট্যান্ডার্ড উচ্চতা সাধারণত ৭ বা ৮ ফিট</p>
              </div>
            </div>

            {/* Tile Size Presets + Custom Size Option */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F17] mb-2">
                টাইলসের সাইজ নির্বাচন করুন (অথবা কাস্টম সাইজ লিখুন):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WALL_TILE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleWallSizeChange(size.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedWallSizeId === size.id && !isCustomWallSize
                        ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-white hover:text-[#0F1F17]'
                    }`}
                  >
                    <div className="text-sm font-semibold">{size.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{size.popularFor}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleWallSizeChange('custom')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCustomWallSize
                      ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                      : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-white hover:text-[#0F1F17]'
                  }`}
                >
                  <div className="text-sm font-semibold">✏️ কাস্টম সাইজ</div>
                  <div className="text-[10px] opacity-80 mt-0.5">ইচ্ছেমতো মাপ টাইপ করুন</div>
                </button>
              </div>
            </div>

            {/* Custom Size Inputs (When Custom Selected) */}
            {isCustomWallSize && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 grid grid-cols-2 gap-3">
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

            {/* Carton Box Pieces with CRITICAL WARNING NOTICE */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                    ১ বক্সে কত পিস?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={wallPcsPerBox || ''}
                    onChange={(e) => setWallPcsPerBox(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#D5E4DB] bg-white font-bold text-sm text-[#0B5D3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5A52] mb-1">১ পিসের ক্ষেত্রফল</label>
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E4DB] font-semibold text-sm text-[#0F1F17]">
                    {toBanglaNum(currentWallCombo.sqftPerPiece.toFixed(3))} SFT
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5A52] mb-1">১ বক্সের ক্ষেত্রফল</label>
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E4DB] font-semibold text-sm text-[#0B5D3B]">
                    {toBanglaNum(currentWallCombo.sqftPerBox.toFixed(2))} SFT
                  </div>
                </div>
              </div>

              {/* Company Box Variation Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>জরুরি সতর্কতা:</strong> কোম্পানি ও ব্র্যান্ডভেদে (যেমন: DBL, Akij, RAK ইত্যাদি) একই সাইজের টাইলস হলেও প্রতি কার্টনে পিস সংখ্যা ভিন্ন হতে পারে। আপনার কেনা টাইলসের কার্টনের গায়ে লেখা পিস সংখ্যা দেখে প্রয়োজনে এখানে পরিবর্তন করে নিন।
                </p>
              </div>
            </div>

            {/* Pattern Rows Breakdown (Deep, Decor, Light) */}
            <div className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#D5E4DB] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0F1F17]">
                  🎨 দেয়ালের শেইড অনুপাত (মোট {toBanglaNum(currentWallCombo.totalLines.toFixed(1))} টি সারি/লাইন)
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B] font-semibold">
                  উচ্চতা {toBanglaNum(wallHeightFt * 12)}" ÷ {toBanglaNum(activeWallTileH)}"
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1E3A8A] shrink-0" />
                    <span className="text-sm font-medium text-[#0F1F17]">১. ডিপ (Deep) লাইন (নিচে):</span>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={deepLines}
                      onChange={(e) => setDeepLines(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] shrink-0" />
                    <span className="text-sm font-medium text-[#0F1F17]">২. ডেকোর / বর্ডার (Decor) লাইন:</span>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={decorLines}
                      onChange={(e) => setDecorLines(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#CBD5E1] border border-[#94A3B8] shrink-0" />
                    <span className="text-sm font-medium text-[#0F1F17]">৩. লাইট (Light) লাইন (উপরে):</span>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={lightLines}
                      onChange={(e) => setLightLines(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button: Add Room */}
            <button
              type="button"
              onClick={handleSaveRoom}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0B5D3B] hover:bg-[#084A2E] text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {editingRoomId ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingRoomId
                ? '✓ পরিবর্তন সংরক্ষণ করুন (Update Room)'
                : '+ পুরো বাড়ির হিসাবে এই রুমটি যোগ করুন (Add to House List)'}
            </button>
          </div>

          {/* Right Live Preview & Result (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual 2D Bathroom Wall Preview */}
            <div className="bg-white p-6 rounded-3xl border border-[#D5E4DB] shadow-xs">
              <h3 className="text-sm font-bold text-[#0F1F17] mb-3 flex items-center justify-between">
                <span>👁️ দেয়ালের লাইভ প্রিভিউ</span>
                <span className="text-xs font-normal text-[#4A5A52]">উচ্চতা {toBanglaNum(wallHeightFt)} ফিট</span>
              </h3>

              <div className="w-full h-52 rounded-2xl overflow-hidden border-2 border-[#D5E4DB] flex flex-col justify-end shadow-inner relative bg-[#F8FAF9]">
                {/* Light Section */}
                <div
                  className="w-full transition-all duration-300 relative flex items-center justify-center text-xs font-semibold text-[#475569] border-b border-[#CBD5E1]"
                  style={{
                    height: `${(lightLines / (deepLines + decorLines + lightLines || 1)) * 100}%`,
                    background: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
                  }}
                >
                  <div className="text-center px-2 py-0.5 bg-white/80 rounded-md shadow-xs text-[11px]">
                    লাইট: {toBanglaNum(currentWallCombo.light.boxes)} কার্টন ({toBanglaNum(currentWallCombo.light.pieces)} পিস)
                  </div>
                </div>

                {/* Decor Section */}
                <div
                  className="w-full transition-all duration-300 relative flex items-center justify-center text-xs font-bold text-[#92400E] border-b border-[#F59E0B]/50"
                  style={{
                    height: `${(decorLines / (deepLines + decorLines + lightLines || 1)) * 100}%`,
                    background: 'repeating-linear-gradient(45deg, #FEF3C7, #FEF3C7 10px, #FDE68A 10px, #FDE68A 20px)',
                  }}
                >
                  <div className="text-center px-2 py-0.5 bg-white/90 rounded-md shadow-xs text-[11px]">
                    ডেকোর: {toBanglaNum(currentWallCombo.decor.boxes)} কার্টন ({toBanglaNum(currentWallCombo.decor.pieces)} পিস)
                  </div>
                </div>

                {/* Deep Section */}
                <div
                  className="w-full transition-all duration-300 relative flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    height: `${(deepLines / (deepLines + decorLines + lightLines || 1)) * 100}%`,
                    background: 'linear-gradient(180deg, #1E3A8A 0%, #0F172A 100%)',
                  }}
                >
                  <div className="text-center px-2 py-0.5 bg-black/40 rounded-md text-[11px]">
                    ডিপ: {toBanglaNum(currentWallCombo.deep.boxes)} কার্টন ({toBanglaNum(currentWallCombo.deep.pieces)} পিস)
                  </div>
                </div>
              </div>
            </div>

            {/* Current Room Result Card */}
            <div className="bg-[#E6F4EC] p-6 rounded-3xl border border-[#0B5D3B]/20 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#0B5D3B]/15">
                <div>
                  <div className="text-xs font-semibold text-[#0B5D3B] uppercase tracking-wider">এই রুমের মোট টাইলস</div>
                  <div className="text-3xl font-black text-[#084A2E]">
                    {toBanglaNum(currentWallCombo.grandTotalBoxes)} কার্টন
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#4A5A52]">আনুমানিক দাম</div>
                  <div className="text-xl font-bold text-[#0F1F17]">
                    ৳{toBanglaNum(currentLiveCost.tileCost.toLocaleString('bn-BD'))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between p-2 rounded-xl bg-white/80">
                  <span className="font-medium text-[#1E3A8A]">১. ডিপ (Deep):</span>
                  <span className="font-bold text-[#0B5D3B]">
                    {toBanglaNum(currentWallCombo.deep.boxes)} কার্টন ({toBanglaNum(currentWallCombo.deep.pieces)} পিস)
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white/80">
                  <span className="font-medium text-[#B45309]">২. ডেকোর (Decor):</span>
                  <span className="font-bold text-[#0B5D3B]">
                    {toBanglaNum(currentWallCombo.decor.boxes)} কার্টন ({toBanglaNum(currentWallCombo.decor.pieces)} পিস)
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white/80">
                  <span className="font-medium text-[#475569]">৩. লাইট (Light):</span>
                  <span className="font-bold text-[#0B5D3B]">
                    {toBanglaNum(currentWallCombo.light.boxes)} কার্টন ({toBanglaNum(currentWallCombo.light.pieces)} পিস)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#0B5D3B]/10 grid grid-cols-2 gap-2 text-xs text-[#4A5A52]">
                <div className="p-2 bg-white/60 rounded-lg">
                  সিমেন্ট: <strong>{toBanglaNum(currentLiveCost.cementBags)}</strong> বস্তা
                </div>
                <div className="p-2 bg-white/60 rounded-lg">
                  বালু: <strong>{toBanglaNum(currentLiveCost.sandCft)}</strong> CFT
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Floor Tiles ── */}
      {activeTab === 'floor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <h2 className="text-xl font-bold text-[#0F1F17] flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#0B5D3B]" /> ফ্লোর টাইলস পরিমাপ ও হিসাব
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
                বেডরুম / ড্রয়িং / ফ্লোর
              </span>
            </div>

            {/* Room Name & Rate per SFT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  রুমের নাম (Room Name)
                </label>
                <input
                  type="text"
                  value={floorRoomName}
                  onChange={(e) => setFloorRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-semibold text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                  placeholder="যেমন: বেডরুম ১"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  টাইলসের দাম (টাকা প্রতি SFT)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={floorRatePerSft || ''}
                    onChange={(e) => setFloorRatePerSft(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0B5D3B] text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="৮০"
                  />
                  <span className="absolute right-3 text-xs font-semibold text-[#4A5A52] pointer-events-none">
                    ৳/SFT
                  </span>
                </div>
              </div>
            </div>

            {/* Input Mode Selector */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-[#0F1F17] cursor-pointer">
                <input
                  type="radio"
                  name="floorMode"
                  checked={floorInputType === 'direct'}
                  onChange={() => setFloorInputType('direct')}
                  className="text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                সরাসরি স্কয়ার ফিট (SFT)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[#0F1F17] cursor-pointer">
                <input
                  type="radio"
                  name="floorMode"
                  checked={floorInputType === 'dimensions'}
                  onChange={() => setFloorInputType('dimensions')}
                  className="text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                দৈর্ঘ্য × প্রস্থ (ফিটে)
              </label>
            </div>

            {floorInputType === 'direct' ? (
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">
                  ফ্লোরের মোট ক্ষেত্রফল (SFT) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={floorDirectSft || ''}
                    onChange={(e) => setFloorDirectSft(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0B5D3B] text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="১৮০"
                  />
                  <span className="absolute right-3 text-xs font-bold text-[#4A5A52] pointer-events-none">
                    SFT
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">দৈর্ঘ্য (ফিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={floorLengthFt || ''}
                    onChange={(e) => setFloorLengthFt(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-lg"
                    placeholder="১৫"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1.5">প্রস্থ (ফিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={floorWidthFt || ''}
                    onChange={(e) => setFloorWidthFt(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-lg"
                    placeholder="১২"
                  />
                </div>
              </div>
            )}

            {/* Floor Tile Sizes + Custom Option */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F17] mb-2">
                টাইলসের সাইজ নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FLOOR_TILE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleFloorSizeChange(size.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedFloorSizeId === size.id && !isCustomFloorSize
                        ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-white hover:text-[#0F1F17]'
                    }`}
                  >
                    <div className="text-sm font-semibold">{size.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{size.popularFor}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleFloorSizeChange('custom')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCustomFloorSize
                      ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                      : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-white hover:text-[#0F1F17]'
                  }`}
                >
                  <div className="text-sm font-semibold">✏️ কাস্টম সাইজ</div>
                  <div className="text-[10px] opacity-80 mt-0.5">ইচ্ছেমতো মাপ টাইপ করুন</div>
                </button>
              </div>
            </div>

            {/* Custom Floor Size Inputs */}
            {isCustomFloorSize && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 grid grid-cols-2 gap-3">
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
                    placeholder="24"
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
                    placeholder="24"
                  />
                </div>
              </div>
            )}

            {/* Box Pieces & Notice */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                    ১ বক্সে কত পিস?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={floorPcsPerBox || ''}
                    onChange={(e) => setFloorPcsPerBox(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#D5E4DB] bg-white font-bold text-sm text-[#0B5D3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5A52] mb-1">১ বক্সের ক্ষেত্রফল</label>
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E4DB] font-semibold text-sm text-[#0B5D3B]">
                    {toBanglaNum(currentFloorResult.sqftPerBox.toFixed(2))} SFT
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>জরুরি সতর্কতা:</strong> কোম্পানিভেদে এক কার্টনে পিস সংখ্যা ভিন্ন হতে পারে। আপনার কেনা টাইলসের কার্টনের গায়ে লেখা পিস সংখ্যা দেখে এখানে মিলিয়ে নিন।
                </p>
              </div>
            </div>

            {/* Skirting & Wastage */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#D5E4DB] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                  স্কার্টিং বর্ডার (Skirting)
                </label>
                <select
                  value={skirtingHeightInches}
                  onChange={(e) => setSkirtingHeightInches(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-white"
                >
                  <option value="4">৪ ইঞ্চি স্কার্টিং (প্রমিত)</option>
                  <option value="5">৫ ইঞ্চি স্কার্টিং</option>
                  <option value="0">স্কার্টিং নেই (০")</option>
                </select>
                <p className="text-[11px] text-[#4A5A52] mt-1">দেয়ালের নিচে লাগানোর জন্য হিসাব</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1F17] mb-1">
                  কাটিং ও অপচয় (Wastage %)
                </label>
                <select
                  value={floorWastagePercent}
                  onChange={(e) => setFloorWastagePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-white"
                >
                  <option value="0">০% (অতিরিক্ত ছাড়া)</option>
                  <option value="5">৫% (সুপারিশকৃত)</option>
                  <option value="10">১০% (নিরাপদ ব্যাকআপ)</option>
                </select>
                <p className="text-[11px] text-[#4A5A52] mt-1">ভাঙা ও কোনা কাটার ব্যাকআপ</p>
              </div>
            </div>

            {/* Action Button: Add Room */}
            <button
              type="button"
              onClick={handleSaveRoom}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0B5D3B] hover:bg-[#084A2E] text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {editingRoomId ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingRoomId
                ? '✓ পরিবর্তন সংরক্ষণ করুন (Update Room)'
                : '+ পুরো বাড়ির হিসাবে এই রুমটি যোগ করুন (Add to House List)'}
            </button>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 bg-[#E6F4EC] p-6 sm:p-8 rounded-3xl border border-[#0B5D3B]/20 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#0B5D3B]/15">
              <div>
                <div className="text-xs font-semibold text-[#0B5D3B] uppercase tracking-wider">এই ফ্লোরের টাইলস</div>
                <div className="text-3xl font-black text-[#084A2E]">
                  {toBanglaNum(currentFloorResult.totalBoxesNeeded)} কার্টন
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#4A5A52]">মোট পিস</div>
                <div className="text-2xl font-bold text-[#0F1F17]">
                  {toBanglaNum(currentFloorResult.totalPieces)} টি
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">মূল ফ্লোর এরিয়া:</span>
                <span className="font-bold text-[#0F1F17]">
                  {toBanglaNum(currentFloorResult.floorAreaSft)} SFT
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">স্কার্টিং বর্ডার:</span>
                <span className="font-bold text-[#0F1F17]">
                  {toBanglaNum(Math.round(currentFloorResult.skirtingAreaSft))} SFT ({toBanglaNum(currentFloorResult.skirtingPieces)} পিস)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">অপচয় ({toBanglaNum(floorWastagePercent)}%):</span>
                <span className="font-bold text-[#0F1F17]">
                  {toBanglaNum(currentFloorResult.wastagePieces)} পিস
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">আনুমানিক টাইলসের দাম:</span>
                <span className="font-bold text-[#0B5D3B]">
                  ৳{toBanglaNum(currentLiveCost.tileCost.toLocaleString('bn-BD'))}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#0B5D3B]/10 grid grid-cols-2 gap-2 text-xs text-[#4A5A52]">
              <div className="p-2 bg-white/70 rounded-lg">
                সিমেন্ট: <strong>{toBanglaNum(currentLiveCost.cementBags)}</strong> বস্তা
              </div>
              <div className="p-2 bg-white/70 rounded-lg">
                বালু: <strong>{toBanglaNum(currentLiveCost.sandCft)}</strong> CFT
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSISTENT INTEGRATED SECTION: Cost Analysis & House Summary ── */}
      <div id="cost-analysis" className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#0B5D3B]/20 shadow-md space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div>
            <h2 className="text-2xl font-black text-[#0F1F17] flex items-center gap-2">
              <Building className="w-6 h-6 text-[#0B5D3B]" /> খরচ ও পুরো বাড়ির সমন্বিত হিসাব (Cost Analysis & House Memo)
            </h2>
            <p className="text-xs text-[#4A5A52] mt-1">
              যুক্ত করা প্রতিটি রুমের আলাদা হিসাব ও পুরো বাড়ির গ্র্যান্ড টোটাল মেমো।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E6F4EC] text-[#0B5D3B]">
              মোট রুম: {toBanglaNum(houseRooms.length)} টি
            </span>
          </div>
        </div>

        {/* Global Rates Quick Config */}
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

        {/* Rooms Detailed Breakdown Cards */}
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
                        {room.type === 'wall' ? 'ওয়াল টাইলস কম্বো' : 'ফ্লোর টাইলস'} • {room.tileSizeName} • {toBanglaNum(room.areaSft)} SFT
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

                  {/* Room Specific Tile Output */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#D5E4DB]/60">
                      <span className="font-medium text-[#4A5A52]">টাইলস প্রয়োজন:</span>
                      <span className="font-bold text-[#0B5D3B] text-sm">
                        {toBanglaNum(room.totalBoxes)} কার্টন ({toBanglaNum(room.totalPieces)} পিস)
                      </span>
                    </div>

                    {/* Wall breakdown if available */}
                    {room.type === 'wall' && (
                      <div className="p-2 bg-white/70 rounded-lg text-[11px] text-[#4A5A52] space-y-1">
                        <div>• ডিপ (Deep): <strong>{toBanglaNum(room.deepBoxes || 0)} কার্টন</strong> ({toBanglaNum(room.deepPcs || 0)} পিস)</div>
                        <div>• ডেকোর (Decor): <strong>{toBanglaNum(room.decorBoxes || 0)} কার্টন</strong> ({toBanglaNum(room.decorPcs || 0)} পিস)</div>
                        <div>• লাইট (Light): <strong>{toBanglaNum(room.lightBoxes || 0)} কার্টন</strong> ({toBanglaNum(room.lightPcs || 0)} পিস)</div>
                      </div>
                    )}

                    {/* Materials for this room */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 bg-white rounded-lg border border-[#D5E4DB]/60 text-center">
                        <div className="text-[10px] text-[#4A5A52]">টাইলসের দাম</div>
                        <div className="font-bold text-[#0F1F17]">৳{toBanglaNum(room.tileCost.toLocaleString('bn-BD'))}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#D5E4DB]/60 text-center">
                        <div className="text-[10px] text-[#4A5A52]">সিমেন্ট</div>
                        <div className="font-bold text-[#0B5D3B]">{toBanglaNum(room.cementBags)} বস্তা</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#D5E4DB]/60 text-center">
                        <div className="text-[10px] text-[#4A5A52]">বালু</div>
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
                মোট ক্ষেত্রফল: {toBanglaNum(grandTotal.totalArea)} স্কয়ার ফিট ({toBanglaNum(grandTotal.totalPieces)} পিস টাইলস)
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-200">মোট আনুমানিক প্রজেক্ট খরচ:</div>
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
              <div className="text-emerald-200">মিস্ত্রি মজুরি</div>
              <div className="text-base sm:text-lg font-bold text-white mt-1">
                ৳{toBanglaNum(grandTotal.totalLaborCost.toLocaleString('bn-BD'))}
              </div>
              <div className="text-[10px] text-emerald-200 mt-0.5">
                (৳{toBanglaNum(laborCostPerSft)}/SFT হিসেবে)
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

      {/* ── SEO FAQ Section ── */}
      <div className="mt-12 bg-[#F8FAF9] p-6 sm:p-8 rounded-3xl border border-[#D5E4DB]">
        <h2 className="text-xl font-bold text-[#0F1F17] mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0B5D3B]" /> টাইলস হিসাব ও ব্যবহার বিষয়ক সাধারণ প্রশ্নোত্তর (FAQ)
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
