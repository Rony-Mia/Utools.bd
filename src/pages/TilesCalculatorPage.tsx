import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Grid,
  Calculator,
  Layers,
  Sparkles,
  Copy,
  Check,
  Printer,
  Share2,
  HelpCircle,
  Plus,
  Trash2,
  Info,
  DollarSign,
  Package,
  Home,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  WALL_TILE_SIZES,
  FLOOR_TILE_SIZES,
  BANGLADESHI_BRANDS,
  calculateWallCombo,
  calculateFloorTiles,
  calculateMaterialAndCost,
} from '../utils/tilesCalculator.ts';
import { toBanglaNum } from '../utils/bnDigits.ts';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';

type CalculatorTab = 'wall-combo' | 'floor' | 'materials' | 'multi-room';

interface MultiRoomItem {
  id: string;
  roomName: string;
  type: 'wall' | 'floor';
  areaSft: number;
  tileSize: string;
  boxesNeeded: number;
  note: string;
}

export const TilesCalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('wall-combo');
  const [selectedBrand, setSelectedBrand] = useState<string>('dbl');

  // ── Tab 1: Wall Combo State (Excel Formula) ──
  const [wallAreaSft, setWallAreaSft] = useState<number>(350);
  const [wallHeightFt, setWallHeightFt] = useState<number>(7);
  const [selectedWallSizeId, setSelectedWallSizeId] = useState<string>('8x12');
  const [customWallTileW, setCustomWallTileW] = useState<number>(12);
  const [customWallTileH, setCustomWallTileH] = useState<number>(8);
  const [wallPcsPerBox, setWallPcsPerBox] = useState<number>(25);

  const [deepLines, setDeepLines] = useState<number>(5.5);
  const [decorLines, setDecorLines] = useState<number>(1);
  const [lightLines, setLightLines] = useState<number>(4);
  const [wallDeductionSft, setWallDeductionSft] = useState<number>(0);
  const [wallWastagePercent, setWallWastagePercent] = useState<number>(0);

  // ── Tab 2: Floor Tiles State ──
  const [floorInputType, setFloorInputType] = useState<'dimensions' | 'direct'>('direct');
  const [floorLengthFt, setFloorLengthFt] = useState<number>(15);
  const [floorWidthFt, setFloorWidthFt] = useState<number>(12);
  const [floorDirectSft, setFloorDirectSft] = useState<number>(180);
  const [selectedFloorSizeId, setSelectedFloorSizeId] = useState<string>('24x24');
  const [floorPcsPerBox, setFloorPcsPerBox] = useState<number>(4);
  const [skirtingHeightInches, setSkirtingHeightInches] = useState<number>(4);
  const [floorWastagePercent, setFloorWastagePercent] = useState<number>(5);

  // ── Tab 3: Materials & Cost State ──
  const [pricePerBox, setPricePerBox] = useState<number>(850);
  const [laborCostPerSft, setLaborCostPerSft] = useState<number>(22);
  const [cementBagPrice, setCementBagPrice] = useState<number>(520);
  const [sandPricePerCft, setSandPricePerCft] = useState<number>(45);
  const [groutPricePerKg, setGroutPricePerKg] = useState<number>(130);

  // ── Tab 4: Multi-Room Estimator State ──
  const [multiRooms, setMultiRooms] = useState<MultiRoomItem[]>([
    {
      id: '1',
      roomName: 'মাস্টার বাথরুম (ওয়াল কম্বো)',
      type: 'wall',
      areaSft: 350,
      tileSize: '8" × 12"',
      boxesNeeded: 21,
      note: 'ডিপ: ১১ কার্টন, ডেকোর: ২ কার্টন, লাইট: ৮ কার্টন',
    },
    {
      id: '2',
      roomName: 'বেডরুম ১ (ফ্লোর)',
      type: 'floor',
      areaSft: 180,
      tileSize: '24" × 24" (2x2 ft)',
      boxesNeeded: 12,
      note: 'ফ্লোর + স্কার্টিং + ৫% ওয়েস্টেজ',
    },
  ]);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomType, setNewRoomType] = useState<'wall' | 'floor'>('floor');
  const [newRoomArea, setNewRoomArea] = useState<number>(120);

  // ── Copy Feedback ──
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-set preset values when Wall Size changes
  const handleWallSizeChange = (presetId: string) => {
    setSelectedWallSizeId(presetId);
    const preset = WALL_TILE_SIZES.find((s) => s.id === presetId);
    if (preset) {
      setCustomWallTileW(preset.widthInches);
      setCustomWallTileH(preset.heightInches);
      setWallPcsPerBox(preset.defaultPcsPerBox);

      // Recalculate default line breakdown based on height
      const totalLines = (wallHeightFt * 12) / preset.heightInches;
      const defaultDecor = 1;
      const remaining = Math.max(0, totalLines - defaultDecor);
      setDeepLines(Math.round((remaining * 0.55) * 10) / 10);
      setDecorLines(defaultDecor);
      setLightLines(Math.round((remaining * 0.45) * 10) / 10);
    }
  };

  // Auto-set preset values when Floor Size changes
  const handleFloorSizeChange = (presetId: string) => {
    setSelectedFloorSizeId(presetId);
    const preset = FLOOR_TILE_SIZES.find((s) => s.id === presetId);
    if (preset) {
      setFloorPcsPerBox(preset.defaultPcsPerBox);
    }
  };

  // ── Computations ──
  const wallComboResult = useMemo(() => {
    return calculateWallCombo({
      wallAreaSft,
      wallHeightFt,
      tileHeightInches: customWallTileH,
      tileWidthInches: customWallTileW,
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
    customWallTileH,
    customWallTileW,
    wallPcsPerBox,
    deepLines,
    decorLines,
    lightLines,
    wallDeductionSft,
    wallWastagePercent,
  ]);

  const floorResult = useMemo(() => {
    const currentPreset = FLOOR_TILE_SIZES.find((s) => s.id === selectedFloorSizeId) || FLOOR_TILE_SIZES[0];
    return calculateFloorTiles({
      lengthFt: floorInputType === 'dimensions' ? floorLengthFt : 0,
      widthFt: floorInputType === 'dimensions' ? floorWidthFt : 0,
      directAreaSft: floorInputType === 'direct' ? floorDirectSft : 0,
      tileLengthInches: currentPreset.widthInches,
      tileWidthInches: currentPreset.heightInches,
      pcsPerBox: floorPcsPerBox,
      skirtingHeightInches,
      wastagePercent: floorWastagePercent,
    });
  }, [
    floorInputType,
    floorLengthFt,
    floorWidthFt,
    floorDirectSft,
    selectedFloorSizeId,
    floorPcsPerBox,
    skirtingHeightInches,
    floorWastagePercent,
  ]);

  // Compute materials & costs based on currently active context
  const activeAreaForCost = activeTab === 'wall-combo' ? wallComboResult.grossAreaSft : floorResult.totalGrossAreaSft;
  const activeBoxesForCost = activeTab === 'wall-combo' ? wallComboResult.grandTotalBoxes : floorResult.totalBoxesNeeded;

  const costResult = useMemo(() => {
    return calculateMaterialAndCost({
      totalAreaSft: activeAreaForCost,
      totalBoxes: activeBoxesForCost,
      pricePerBox,
      laborCostPerSft,
      cementBagPrice,
      sandPricePerCft,
      groutPricePerKg,
    });
  }, [
    activeAreaForCost,
    activeBoxesForCost,
    pricePerBox,
    laborCostPerSft,
    cementBagPrice,
    sandPricePerCft,
    groutPricePerKg,
  ]);

  // Multi-room grand summary
  const multiRoomGrandTotal = useMemo(() => {
    const totalArea = multiRooms.reduce((acc, r) => acc + r.areaSft, 0);
    const totalBoxes = multiRooms.reduce((acc, r) => acc + r.boxesNeeded, 0);
    const estCost = totalBoxes * pricePerBox;
    return { totalArea, totalBoxes, estCost };
  }, [multiRooms, pricePerBox]);

  const handleAddMultiRoom = () => {
    if (!newRoomName.trim() || newRoomArea <= 0) return;
    const isWall = newRoomType === 'wall';
    const defaultBoxes = isWall
      ? Math.ceil(newRoomArea / 16.67)
      : Math.ceil(newRoomArea / 16.0);

    const newItem: MultiRoomItem = {
      id: Date.now().toString(),
      roomName: newRoomName.trim(),
      type: newRoomType,
      areaSft: newRoomArea,
      tileSize: isWall ? '8" × 12" ওয়াল' : '24" × 24" ফ্লোর',
      boxesNeeded: defaultBoxes,
      note: isWall ? 'ওয়াল টাইলস কম্বো' : 'ফ্লোর ও স্কার্টিং',
    };

    setMultiRooms([...multiRooms, newItem]);
    setNewRoomName('');
    setNewRoomArea(100);
  };

  const handleRemoveMultiRoom = (id: string) => {
    setMultiRooms(multiRooms.filter((r) => r.id !== id));
  };

  // Generate WhatsApp / Copy message
  const handleCopyMemo = () => {
    let message = `📋 *Utools.bd — টাইলস হিসাব মেমো*\n`;
    message += `ব্র্যান্ড: ${BANGLADESHI_BRANDS.find((b) => b.id === selectedBrand)?.name || 'DBL'}\n\n`;

    if (activeTab === 'wall-combo') {
      message += `🛁 *বাথরুম/কিচেন ওয়াল টাইলস কম্বো*\n`;
      message += `• মোট এরিয়া: ${toBanglaNum(wallComboResult.netAreaSft)} স্কয়ার ফিট (উচ্চতা ${toBanglaNum(wallHeightFt)} ফিট)\n`;
      message += `• টাইলসের মাপ: ${selectedWallSizeId}\n`;
      message += `• মোট লাইন (সারি): ${toBanglaNum(wallComboResult.totalLines)} টি\n`;
      message += `-------------------------\n`;
      message += `১. ডিপ (Deep): ${toBanglaNum(wallComboResult.deep.boxes)} কার্টন ${toBanglaNum(wallComboResult.deep.extraPieces)} পিস (${toBanglaNum(wallComboResult.deep.pieces)} পিস)\n`;
      message += `২. ডেকোর (Decor): ${toBanglaNum(wallComboResult.decor.boxes)} কার্টন ${toBanglaNum(wallComboResult.decor.extraPieces)} পিস (${toBanglaNum(wallComboResult.decor.pieces)} পিস)\n`;
      message += `৩. লাইট (Light): ${toBanglaNum(wallComboResult.light.boxes)} কার্টন ${toBanglaNum(wallComboResult.light.extraPieces)} পিস (${toBanglaNum(wallComboResult.light.pieces)} পিস)\n`;
      message += `-------------------------\n`;
      message += `📦 *সর্বমোট কার্টন:* ${toBanglaNum(wallComboResult.grandTotalBoxes)} কার্টন (${toBanglaNum(wallComboResult.totalPieces)} পিস)\n`;
    } else if (activeTab === 'floor') {
      message += `🏠 *ফ্লোর টাইলস হিসাব*\n`;
      message += `• ফ্লোর এরিয়া: ${toBanglaNum(floorResult.floorAreaSft)} SFT (স্কার্টিং: ${toBanglaNum(Math.round(floorResult.skirtingAreaSft))} SFT)\n`;
      message += `• টাইলসের মাপ: ${selectedFloorSizeId}\n`;
      message += `• ফ্লোর পিস: ${toBanglaNum(floorResult.floorPieces)} | স্কার্টিং: ${toBanglaNum(floorResult.skirtingPieces)} পিস\n`;
      message += `• অপচয় (Wastage ${toBanglaNum(floorWastagePercent)}%): ${toBanglaNum(floorResult.wastagePieces)} পিস\n`;
      message += `-------------------------\n`;
      message += `📦 *সর্বমোট দরকার:* ${toBanglaNum(floorResult.totalBoxesNeeded)} কার্টন (${toBanglaNum(floorResult.totalPieces)} পিস)\n`;
    } else {
      message += `🏢 *মাল্টি-রুম টাইলস সামারি মেমো*\n`;
      multiRooms.forEach((r, idx) => {
        message += `${toBanglaNum(idx + 1)}. ${r.roomName} (${toBanglaNum(r.areaSft)} SFT) ➔ ${toBanglaNum(r.boxesNeeded)} কার্টন\n`;
      });
      message += `-------------------------\n`;
      message += `📦 *মোট কার্টন:* ${toBanglaNum(multiRoomGrandTotal.totalBoxes)} টি\n`;
      message += `💰 *আনুমানিক টাইলসের দাম:* ৳${toBanglaNum(multiRoomGrandTotal.estCost.toLocaleString('bn-BD'))}\n`;
    }

    message += `\nহিসাবটি তৈরি করা হয়েছে: https://utools.bd/tiles-calculator`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    handleCopyMemo();
    const encoded = encodeURIComponent(
      `Utools.bd টাইলস হিসাব মেমো দেখতে লিংকে যান: https://utools.bd/tiles-calculator`
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
      question: 'বাথরুম ওয়াল টাইলসে ডিপ, ডেকোর ও লাইট কীভাবে হিসাব করতে হয়?',
      answer:
        'বাথরুমের উচ্চতাকে টাইলের উচ্চতা দিয়ে ভাগ করে মোট সারি (লাইন) বের করা হয়। যেমন ৭ ফিট বাথরুম ও ৮ ইঞ্চি টাইলে মোট ১০.৫টি সারি হয়। নিচে সাধারণত ৫ থেকে ৫.৫ লাইন ডিপ (Deep), মাঝে ১ লাইন ডেকোর বা বর্ডার (Decor) এবং উপরে বাকি অংশ লাইট (Light) টাইলস লাগানো হয়। প্রতি অংশের লাইনের শতকরা অনুপাত দিয়ে মোট পিস ও কার্টনের হিসাব বের করা হয়।',
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
        title="টাইলস ক্যালকুলেটর — বাথরুম কম্বো, ফ্লোর টাইলস কার্টন ও খরচ হিসাব | Utools.bd"
        description="বাথরুম ও কিচেন ওয়াল টাইলসের ডিপ-ডেকোর-লাইট অনুপাত, ফ্লোর টাইলস কার্টন ও পিস হিসাব, স্কার্টিং, সিমেন্ট-বালু ও মিস্ত্রি খরচ ক্যালকুলেটর।"
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
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E6F4EC] text-[#0B5D3B] border border-[#0B5D3B]/20 mb-3">
          <Grid className="w-4 h-4" />
          <span>বাংলাদেশি ব্র্যান্ড ও সাইজ প্রিসেট (DBL, Akij, RAK)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1F17] tracking-tight mb-4">
          টাইলস ক্যালকুলেটর <span className="text-[#0B5D3B]">(Tiles Calculator BD)</span>
        </h1>
        <p className="text-base sm:text-lg text-[#4A5A52] leading-relaxed">
          বাথরুম ও কিচেন ওয়াল টাইলসের <strong>ডিপ-ডেকোর-লাইট</strong> কম্বো, ফ্লোরের কার্টন ও পিস হিসাব, স্কার্টিং, সিমেন্ট-বালু ও পূর্ণাঙ্গ খরচের মেমো।
        </p>
      </div>

      {/* Brand Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5E4DB] shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1F17]">
          <Package className="w-4 h-4 text-[#0B5D3B]" />
          <span>টাইলস ব্র্যান্ড নির্বাচন করুন:</span>
        </div>
        <div className="flex-1 max-w-xs">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-medium text-[#0F1F17] focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
          >
            {BANGLADESHI_BRANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-[#4A5A52] bg-[#E6F4EC] px-3 py-1.5 rounded-lg border border-[#0B5D3B]/10">
          ✓ ১০০% নিরাপদ ও ক্লায়েন্ট-সাইড হিসাব
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-[#EAF2ED] rounded-2xl border border-[#D5E4DB]">
        <button
          type="button"
          onClick={() => setActiveTab('wall-combo')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'wall-combo'
              ? 'bg-white text-[#0B5D3B] shadow-xs'
              : 'text-[#4A5A52] hover:text-[#0F1F17]'
          }`}
        >
          <Layers className="w-4 h-4" /> বাথরুম ওয়াল কম্বো
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('floor')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'floor'
              ? 'bg-white text-[#0B5D3B] shadow-xs'
              : 'text-[#4A5A52] hover:text-[#0F1F17]'
          }`}
        >
          <Grid className="w-4 h-4" /> ফ্লোর টাইলস
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'materials'
              ? 'bg-white text-[#0B5D3B] shadow-xs'
              : 'text-[#4A5A52] hover:text-[#0F1F17]'
          }`}
        >
          <DollarSign className="w-4 h-4" /> সিমেন্ট, বালু ও খরচ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('multi-room')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'multi-room'
              ? 'bg-white text-[#0B5D3B] shadow-xs'
              : 'text-[#4A5A52] hover:text-[#0F1F17]'
          }`}
        >
          <Home className="w-4 h-4" /> পুরো বাড়ির মেমো ({toBanglaNum(multiRooms.length)})
        </button>
      </div>

      {/* ── Tab 1: Wall Combo (Excel Deep-Decor-Light) ── */}
      {activeTab === 'wall-combo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-[#0F1F17] flex items-center gap-2 pb-3 border-b border-[#D5E4DB]">
              <Layers className="w-5 h-5 text-[#0B5D3B]" /> বাথরুম ও কিচেন ওয়াল টাইলস পরিমাপ
            </h2>

            {/* Inputs: Wall Area & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F1F17] mb-1.5">
                  দেয়ালের মোট ক্ষেত্রফল (SFT) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={wallAreaSft || ''}
                    onChange={(e) => setWallAreaSft(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0B5D3B] text-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="যেমন: ৩৫০"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-[#4A5A52]">SFT</span>
                </div>
                <p className="text-[11px] text-[#4A5A52] mt-1">সব দেয়ালের মোট মাপ (চার দেয়াল যোগফল)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F1F17] mb-1.5">
                  দেয়ালের উচ্চতা (ফিট) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={wallHeightFt || ''}
                    onChange={(e) => setWallHeightFt(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0F1F17] text-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="৭"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-[#4A5A52]">ফিট</span>
                </div>
                <p className="text-[11px] text-[#4A5A52] mt-1">বাথরুমের স্ট্যান্ডার্ড উচ্চতা সাধারণত ৭ বা ৮ ফিট</p>
              </div>
            </div>

            {/* Tile Size Presets */}
            <div>
              <label className="block text-sm font-medium text-[#0F1F17] mb-2">
                টাইলসের সাইজ নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {WALL_TILE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleWallSizeChange(size.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedWallSizeId === size.id
                        ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-white hover:text-[#0F1F17]'
                    }`}
                  >
                    <div className="text-sm">{size.name}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{size.popularFor}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Carton Specs */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">১ বক্সে কত পিস?</label>
                <input
                  type="number"
                  min="1"
                  value={wallPcsPerBox || ''}
                  onChange={(e) => setWallPcsPerBox(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#D5E4DB] bg-white font-semibold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">১ পিসের ক্ষেত্রফল</label>
                <div className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E4DB] font-semibold text-sm text-[#0F1F17]">
                  {toBanglaNum(wallComboResult.sqftPerPiece.toFixed(3))} SFT
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">১ বক্সের ক্ষেত্রফল</label>
                <div className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E4DB] font-semibold text-sm text-[#0B5D3B]">
                  {toBanglaNum(wallComboResult.sqftPerBox.toFixed(2))} SFT
                </div>
              </div>
            </div>

            {/* Pattern Rows Breakdown (Deep, Decor, Light) */}
            <div className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#D5E4DB] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0F1F17]">
                  🎨 দেয়ালের শেইড অনুপাত (মোট {toBanglaNum(wallComboResult.totalLines.toFixed(1))} টি সারি/লাইন)
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0B5D3B] font-semibold">
                  উচ্চতা {toBanglaNum(wallHeightFt * 12)}" ÷ {toBanglaNum(customWallTileH)}"
                </span>
              </div>

              <div className="space-y-3">
                {/* Deep Line */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1E3A8A] shrink-0" />
                    <span className="text-sm font-medium text-[#0F1F17]">১. ডিপ (Deep) লাইন (নিচের অংশ):</span>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={wallComboResult.totalLines}
                      value={deepLines}
                      onChange={(e) => setDeepLines(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] bg-white"
                    />
                  </div>
                </div>

                {/* Decor Line */}
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
                      max={wallComboResult.totalLines}
                      value={decorLines}
                      onChange={(e) => setDecorLines(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] bg-white"
                    />
                  </div>
                </div>

                {/* Light Line */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0] border border-[#CBD5E1] shrink-0" />
                    <span className="text-sm font-medium text-[#0F1F17]">৩. লাইট (Light) লাইন (উপরের অংশ):</span>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={wallComboResult.totalLines}
                      value={lightLines}
                      onChange={(e) => setLightLines(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-[#D5E4DB] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Deductions & Wastage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">
                  দরজা ও জানালার মাপ বাদ (SFT)
                </label>
                <input
                  type="number"
                  min="0"
                  value={wallDeductionSft || ''}
                  onChange={(e) => setWallDeductionSft(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] text-sm"
                  placeholder="যেমন: ১৫"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">
                  অপচয় / ভাঙা সতর্কতা (Wastage %)
                </label>
                <select
                  value={wallWastagePercent}
                  onChange={(e) => setWallWastagePercent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] text-sm"
                >
                  <option value="0">০% (সঠিক মাপ)</option>
                  <option value="5">৫% (সাধারণ রিকমেন্ডেড)</option>
                  <option value="10">১০% (নিরাপদ ব্যাকআপ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Visual & Output Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual 2D Bathroom Wall Preview */}
            <div className="bg-white p-6 rounded-3xl border border-[#D5E4DB] shadow-xs">
              <h3 className="text-sm font-bold text-[#0F1F17] mb-3 flex items-center justify-between">
                <span>👁️ দেয়ালের লাইভ প্রিভিউ</span>
                <span className="text-xs font-normal text-[#4A5A52]">উচ্চতা {toBanglaNum(wallHeightFt)} ফিট</span>
              </h3>

              {/* 2D Wall Canvas */}
              <div className="w-full h-56 rounded-2xl overflow-hidden border-2 border-[#D5E4DB] flex flex-col justify-end shadow-inner relative bg-[#F8FAF9]">
                {/* Light Section (Top) */}
                <div
                  className="w-full transition-all duration-300 relative flex items-center justify-center text-xs font-semibold text-[#475569] border-b border-[#CBD5E1]"
                  style={{
                    height: `${(lightLines / (deepLines + decorLines + lightLines || 1)) * 100}%`,
                    background: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
                  }}
                >
                  <div className="text-center px-2 py-1 bg-white/80 rounded-md backdrop-blur-xs shadow-xs text-[11px]">
                    লাইট: {toBanglaNum(wallComboResult.light.boxes)} কার্টন ({toBanglaNum(wallComboResult.light.pieces)} পিস)
                  </div>
                </div>

                {/* Decor Section (Middle) */}
                <div
                  className="w-full transition-all duration-300 relative flex items-center justify-center text-xs font-bold text-[#92400E] border-b border-[#F59E0B]/50"
                  style={{
                    height: `${(decorLines / (deepLines + decorLines + lightLines || 1)) * 100}%`,
                    background: 'repeating-linear-gradient(45deg, #FEF3C7, #FEF3C7 10px, #FDE68A 10px, #FDE68A 20px)',
                  }}
                >
                  <div className="text-center px-2 py-0.5 bg-white/90 rounded-md shadow-xs text-[11px]">
                    ডেকোর: {toBanglaNum(wallComboResult.decor.boxes)} কার্টন ({toBanglaNum(wallComboResult.decor.pieces)} পিস)
                  </div>
                </div>

                {/* Deep Section (Bottom) */}
                <div
                  className="w-full transition-all duration-300 relative flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    height: `${(deepLines / (deepLines + decorLines + lightLines || 1)) * 100}%`,
                    background: 'linear-gradient(180deg, #1E3A8A 0%, #0F172A 100%)',
                  }}
                >
                  <div className="text-center px-2 py-1 bg-black/40 rounded-md backdrop-blur-xs text-[11px]">
                    ডিপ: {toBanglaNum(wallComboResult.deep.boxes)} কার্টন ({toBanglaNum(wallComboResult.deep.pieces)} পিস)
                  </div>
                </div>
              </div>
            </div>

            {/* Results Breakdown Summary */}
            <div className="bg-[#E6F4EC] p-6 sm:p-7 rounded-3xl border border-[#0B5D3B]/20 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#0B5D3B]/15">
                <div>
                  <div className="text-xs font-semibold text-[#0B5D3B] uppercase tracking-wider">সর্বমোট টাইলস দরকার</div>
                  <div className="text-3xl font-extrabold text-[#084A2E]">
                    {toBanglaNum(wallComboResult.grandTotalBoxes)} কার্টন
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#4A5A52]">মোট পিস</div>
                  <div className="text-xl font-bold text-[#0F1F17]">
                    {toBanglaNum(wallComboResult.totalPieces)} পিস
                  </div>
                </div>
              </div>

              {/* Exact Breakdown List */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-[#0B5D3B]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#1E3A8A]" />
                    <span className="font-semibold text-[#0F1F17]">ডিপ (Deep):</span>
                  </div>
                  <div className="font-bold text-[#0B5D3B]">
                    {toBanglaNum(wallComboResult.deep.boxes)} কার্টন{' '}
                    {wallComboResult.deep.extraPieces > 0 && (
                      <span className="text-xs text-[#4A5A52]">
                        ({toBanglaNum(wallComboResult.deep.extraPieces)} পিস)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-[#0B5D3B]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="font-semibold text-[#0F1F17]">ডেকোর (Decor):</span>
                  </div>
                  <div className="font-bold text-[#0B5D3B]">
                    {toBanglaNum(wallComboResult.decor.boxes)} কার্টন{' '}
                    {wallComboResult.decor.extraPieces > 0 && (
                      <span className="text-xs text-[#4A5A52]">
                        ({toBanglaNum(wallComboResult.decor.extraPieces)} পিস)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-[#0B5D3B]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#94A3B8]" />
                    <span className="font-semibold text-[#0F1F17]">লাইট (Light):</span>
                  </div>
                  <div className="font-bold text-[#0B5D3B]">
                    {toBanglaNum(wallComboResult.light.boxes)} কার্টন{' '}
                    {wallComboResult.light.extraPieces > 0 && (
                      <span className="text-xs text-[#4A5A52]">
                        ({toBanglaNum(wallComboResult.light.extraPieces)} পিস)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Share / Copy Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyMemo}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#0B5D3B]/20 text-[#0B5D3B] text-xs font-bold hover:bg-[#F8FAF9] transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-[#0B5D3B]" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'কপি হয়েছে!' : 'মেমো কপি করুন'}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#084A2E] transition-colors shadow-xs"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp এ পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Floor Tiles ── */}
      {activeTab === 'floor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-[#0F1F17] flex items-center gap-2 pb-3 border-b border-[#D5E4DB]">
              <Grid className="w-5 h-5 text-[#0B5D3B]" /> ফ্লোর টাইলসের পরিমাপ ও হিসাব
            </h2>

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
                <label className="block text-sm font-medium text-[#0F1F17] mb-1.5">
                  ফ্লোরের মোট ক্ষেত্রফল (SFT) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={floorDirectSft || ''}
                    onChange={(e) => setFloorDirectSft(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-[#0B5D3B] text-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B5D3B]"
                    placeholder="যেমন: ১৮০"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-[#4A5A52]">SFT</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F1F17] mb-1.5">দৈর্ঘ্য (ফিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={floorLengthFt || ''}
                    onChange={(e) => setFloorLengthFt(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-lg"
                    placeholder="১৫"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F1F17] mb-1.5">প্রস্থ (ফিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={floorWidthFt || ''}
                    onChange={(e) => setFloorWidthFt(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFAF7] font-bold text-lg"
                    placeholder="১২"
                  />
                </div>
              </div>
            )}

            {/* Floor Tile Sizes */}
            <div>
              <label className="block text-sm font-medium text-[#0F1F17] mb-2">
                টাইলসের সাইজ নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FLOOR_TILE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleFloorSizeChange(size.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFloorSizeId === size.id
                        ? 'border-[#0B5D3B] bg-[#E6F4EC] text-[#0B5D3B] font-bold shadow-xs'
                        : 'border-[#D5E4DB] bg-[#FAFAF7] text-[#4A5A52] hover:bg-white hover:text-[#0F1F17]'
                    }`}
                  >
                    <div className="text-sm">{size.name}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{size.popularFor}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skirting & Wastage */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#D5E4DB] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#0F1F17] mb-1">
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
                <p className="text-[11px] text-[#4A5A52] mt-1">
                  দেয়ালের নিচে লাগানোর জন্য স্বয়ংক্রিয় হিসাব
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1F17] mb-1">
                  কাটিং ও ওয়েস্টেজ (Wastage %)
                </label>
                <select
                  value={floorWastagePercent}
                  onChange={(e) => setFloorWastagePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-white"
                >
                  <option value="0">০% (অতিরিক্ত ছাড়া)</option>
                  <option value="5">৫% (সুপারিশকৃত)</option>
                  <option value="10">১০% (ডায়াগোনাল/কোণাকাটা)</option>
                </select>
                <p className="text-[11px] text-[#4A5A52] mt-1">ভাঙা ও কোনা কাটার ব্যাকআপ</p>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 bg-[#E6F4EC] p-6 sm:p-8 rounded-3xl border border-[#0B5D3B]/20 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#0B5D3B]/15">
              <div>
                <div className="text-xs font-semibold text-[#0B5D3B] uppercase tracking-wider">মোট ফ্লোর টাইলস দরকার</div>
                <div className="text-3xl font-extrabold text-[#084A2E]">
                  {toBanglaNum(floorResult.totalBoxesNeeded)} কার্টন
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#4A5A52]">মোট পিস</div>
                <div className="text-2xl font-bold text-[#0F1F17]">
                  {toBanglaNum(floorResult.totalPieces)} টি
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">মূল ফ্লোর এরিয়া:</span>
                <span className="font-bold text-[#0F1F17]">
                  {toBanglaNum(floorResult.floorAreaSft)} SFT ({toBanglaNum(floorResult.floorPieces)} পিস)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">স্কার্টিং বর্ডার এরিয়া:</span>
                <span className="font-bold text-[#0F1F17]">
                  {toBanglaNum(Math.round(floorResult.skirtingAreaSft))} SFT ({toBanglaNum(floorResult.skirtingPieces)} পিস)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">ওয়েস্টেজ ({toBanglaNum(floorWastagePercent)}%):</span>
                <span className="font-bold text-[#0F1F17]">{toBanglaNum(floorResult.wastagePieces)} পিস</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#0B5D3B]/10">
                <span className="text-[#4A5A52]">১ কার্টনে কভার করে:</span>
                <span className="font-semibold text-[#0B5D3B]">
                  {toBanglaNum(floorResult.sqftPerBox.toFixed(1))} SFT
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyMemo}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#0B5D3B]/20 text-[#0B5D3B] text-xs font-bold hover:bg-[#F8FAF9] transition-colors shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-[#0B5D3B]" /> : <Copy className="w-4 h-4" />}
                {copied ? 'কপি হয়েছে!' : 'মেমো কপি'}
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#084A2E] transition-colors shadow-xs"
              >
                <Share2 className="w-4 h-4" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Cement, Sand, Labor Cost ── */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-5">
            <h2 className="text-xl font-bold text-[#0F1F17] flex items-center gap-2 pb-3 border-b border-[#D5E4DB]">
              <DollarSign className="w-5 h-5 text-[#0B5D3B]" /> প্রতি এককের বাজারদর ইনপুট
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">
                  টাইলসের গড় দাম (প্রতি কার্টন / বক্স)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricePerBox || ''}
                    onChange={(e) => setPricePerBox(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] font-bold text-[#0B5D3B]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-[#4A5A52]">টাকা</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">
                  মিস্ত্রি মজুরি (প্রতি স্কয়ার ফিট SFT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={laborCostPerSft || ''}
                    onChange={(e) => setLaborCostPerSft(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] font-bold text-[#0F1F17]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-[#4A5A52]">টাকা/SFT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A5A52] mb-1">সিমেন্ট (বস্তা)</label>
                  <input
                    type="number"
                    value={cementBagPrice || ''}
                    onChange={(e) => setCementBagPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5A52] mb-1">বালু (প্রতি CFT)</label>
                  <input
                    type="number"
                    value={sandPricePerCft || ''}
                    onChange={(e) => setSandPricePerCft(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A5A52] mb-1">
                  টাইলস পুটিং / গ্রাউট পাউডার (প্রতি কেজি)
                </label>
                <input
                  type="number"
                  value={groutPricePerKg || ''}
                  onChange={(e) => setGroutPricePerKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Materials Breakdown */}
          <div className="lg:col-span-6 bg-[#FAFAF7] p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-[#0F1F17] pb-2 border-b border-[#D5E4DB]">
              🏗️ প্রয়োজনীয় মালামাল ও মোট আনুমানিক বাজেট
            </h3>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#D5E4DB]">
                <div className="text-xs text-[#4A5A52]">প্রয়োজনীয় সিমেন্ট</div>
                <div className="text-xl font-extrabold text-[#0B5D3B] mt-1">
                  {toBanglaNum(costResult.cementBags)} বস্তা
                </div>
                <div className="text-[11px] text-[#4A5A52] mt-0.5">
                  ৳{toBanglaNum(costResult.cementCost.toLocaleString('bn-BD'))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#D5E4DB]">
                <div className="text-xs text-[#4A5A52]">প্রয়োজনীয় বালু</div>
                <div className="text-xl font-extrabold text-[#0B5D3B] mt-1">
                  {toBanglaNum(costResult.sandCft)} CFT
                </div>
                <div className="text-[11px] text-[#4A5A52] mt-0.5">
                  ৳{toBanglaNum(costResult.sandCost.toLocaleString('bn-BD'))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#D5E4DB]">
                <div className="text-xs text-[#4A5A52]">টাইলস পুটিং/গ্রাউট</div>
                <div className="text-xl font-extrabold text-[#0B5D3B] mt-1">
                  {toBanglaNum(costResult.groutKg)} কেজি
                </div>
                <div className="text-[11px] text-[#4A5A52] mt-0.5">
                  ৳{toBanglaNum(costResult.groutCost.toLocaleString('bn-BD'))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#D5E4DB]">
                <div className="text-xs text-[#4A5A52]">মিস্ত্রি মজুরি</div>
                <div className="text-xl font-extrabold text-[#0F1F17] mt-1">
                  ৳{toBanglaNum(costResult.laborCost.toLocaleString('bn-BD'))}
                </div>
                <div className="text-[11px] text-[#4A5A52] mt-0.5">
                  {toBanglaNum(Math.round(activeAreaForCost))} SFT এর জন্য
                </div>
              </div>
            </div>

            {/* Total Budget Card */}
            <div className="p-5 rounded-2xl bg-[#0B5D3B] text-white">
              <div className="text-xs font-medium text-emerald-100 uppercase">সর্বমোট প্রজেক্ট খরচ (আনুমানিক)</div>
              <div className="text-3xl font-black mt-1">
                ৳{toBanglaNum(costResult.totalEstimatedCost.toLocaleString('bn-BD'))}
              </div>
              <div className="text-xs text-emerald-100 mt-2">
                টাইলস (৳{toBanglaNum(costResult.tileCost.toLocaleString('bn-BD'))}) + মালামাল + মিস্ত্রি খরচ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Multi-Room Estimator ── */}
      {activeTab === 'multi-room' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E4DB] shadow-xs">
            <h2 className="text-xl font-bold text-[#0F1F17] mb-4 flex items-center justify-between">
              <span>🏠 পুরো বাড়ির সব রুমের টাইলস হিসাব</span>
              <span className="text-xs font-normal text-[#4A5A52]">দোকানে দেওয়ার মতো ফুল মেমো</span>
            </h2>

            {/* Add Room Bar */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4DB] flex flex-wrap items-center gap-3 mb-6">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="রুমের নাম (যেমন: ড্রয়িং রুম, কিচেন)"
                className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-white font-medium"
              />
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as 'wall' | 'floor')}
                className="px-3.5 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-white font-medium"
              >
                <option value="floor">ফ্লোর টাইলস</option>
                <option value="wall">ওয়াল টাইলস</option>
              </select>
              <div className="relative w-28">
                <input
                  type="number"
                  min="1"
                  value={newRoomArea}
                  onChange={(e) => setNewRoomArea(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5E4DB] bg-white font-bold"
                  placeholder="SFT"
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] text-[#4A5A52]">SFT</span>
              </div>
              <button
                type="button"
                onClick={handleAddMultiRoom}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0B5D3B] text-white text-sm font-bold hover:bg-[#084A2E] transition-colors"
              >
                <Plus className="w-4 h-4" /> যোগ করুন
              </button>
            </div>

            {/* Room List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D5E4DB] text-xs font-semibold text-[#4A5A52]">
                    <th className="pb-3">রুমের বিবরণ</th>
                    <th className="pb-3">ধরন</th>
                    <th className="pb-3">ক্ষেত্রফল</th>
                    <th className="pb-3">টাইলস সাইজ</th>
                    <th className="pb-3">প্রয়োজনীয় কার্টন</th>
                    <th className="pb-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E4DB]">
                  {multiRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-[#F8FAF9]">
                      <td className="py-3.5 font-bold text-[#0F1F17]">{room.roomName}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            room.type === 'wall'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {room.type === 'wall' ? 'ওয়াল' : 'ফ্লোর'}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-[#0F1F17]">
                        {toBanglaNum(room.areaSft)} SFT
                      </td>
                      <td className="py-3.5 text-xs text-[#4A5A52]">{room.tileSize}</td>
                      <td className="py-3.5 font-bold text-[#0B5D3B]">
                        {toBanglaNum(room.boxesNeeded)} কার্টন
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMultiRoom(room.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Multi-Room Grand Total Bar */}
            <div className="mt-6 p-6 rounded-2xl bg-[#E6F4EC] border border-[#0B5D3B]/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[#4A5A52]">মোট এরিয়া ও কার্টন:</div>
                <div className="text-2xl font-black text-[#084A2E]">
                  {toBanglaNum(multiRoomGrandTotal.totalArea)} SFT ➔ {toBanglaNum(multiRoomGrandTotal.totalBoxes)} কার্টন
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#4A5A52]">আনুমানিক বাজেট (টাইলস):</div>
                <div className="text-2xl font-black text-[#0B5D3B]">
                  ৳{toBanglaNum(multiRoomGrandTotal.estCost.toLocaleString('bn-BD'))}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyMemo}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-[#0B5D3B]/30 text-[#0B5D3B] text-xs font-bold hover:bg-emerald-50"
                >
                  <Copy className="w-4 h-4" /> কপি মেমো
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#084A2E]"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
