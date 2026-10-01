import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  PenTool,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  FileText,
  Palette,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Copy,
  Check,
  Sliders,
  Type
} from 'lucide-react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import {
  paginateText,
  HANDWRITING_FONTS,
  PAPER_TYPES,
  INK_COLORS,
  SAMPLE_ASSIGNMENT_TEXT
} from '../utils/textToHandwriting.ts';
import pageContent from '../../content/pages/text-to-handwriting.json';

export const TextToHandwritingPage: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_ASSIGNMENT_TEXT);
  const [selectedFont, setSelectedFont] = useState<string>(HANDWRITING_FONTS[0].id);
  const [selectedPaper, setSelectedPaper] = useState<string>(PAPER_TYPES[0].id);
  const [selectedInk, setSelectedInk] = useState<string>(INK_COLORS[0].hex);
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(2.0);
  const [letterSpacing, setLetterSpacing] = useState<number>(0.5);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const paperRef = useRef<HTMLDivElement | null>(null);

  // Dynamically load Google Handwriting fonts if not loaded
  useEffect(() => {
    const fontLinkId = 'utools-handwriting-fonts';
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement('link');
      link.id = fontLinkId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Indie+Flower&family=Kalam:wght@300;400;700&family=Shadows+Into+Light&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Compute pages dynamically based on text
  const pages = useMemo(() => {
    // 24 lines per page at standard line height
    const linesPerPage = Math.max(16, Math.floor(48 / lineHeight));
    return paginateText(text, linesPerPage, 65);
  }, [text, lineHeight]);

  // Keep page index within bounds
  useEffect(() => {
    if (currentPageIndex >= pages.length) {
      setCurrentPageIndex(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPageIndex]);

  const activeFontObj = useMemo(
    () => HANDWRITING_FONTS.find((f) => f.id === selectedFont) || HANDWRITING_FONTS[0],
    [selectedFont]
  );

  const activePaperObj = useMemo(
    () => PAPER_TYPES.find((p) => p.id === selectedPaper) || PAPER_TYPES[0],
    [selectedPaper]
  );

  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(paperRef.current, {
        scale: 2, // 2x for sharp print quality
        useCORS: true,
        backgroundColor: activePaperObj.bgColor,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `handwritten-assignment-page-${currentPageIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: activePaperObj.bgColor,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`handwritten-notes-page-${currentPageIndex + 1}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentPage = pages[currentPageIndex] || { pageNumber: 1, lines: [] };

  return (
    <>
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/text-to-handwriting"
        toolName="টেক্সট টু হ্যান্ডরাইটিং কনভার্টার (Text to Handwriting)"
        categoryName="টেক্সট টুলস"
        categoryPath="/text-to-handwriting"
        faqs={pageContent.faqs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Navigation Breadcrumb bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরুন</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-xs rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>১০০% ক্লায়েন্ট-সাইড • আপনার লেখা সম্পূর্ণ প্রাইভেট</span>
          </div>
        </div>

        {/* Heading Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 border border-[#0B5D3B]/20 rounded-lg">
            <PenTool className="w-3.5 h-3.5" />
            <span>হস্তলিপি ও অ্যাসাইনমেন্ট জেনারেটর • প্রিন্ট-রেডি</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
            {pageContent.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#34443B] leading-relaxed max-w-3xl">
            {pageContent.subtitle}
          </p>
        </div>

        {/* Main Work Area: Input & Customization on left, Live Paper on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls & Text Input (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Input Box */}
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#084A2E] flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#0B5D3B]" />
                  <span>অ্যাসাইনমেন্ট বা নোটের লেখা পেস্ট করুন:</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_ASSIGNMENT_TEXT)}
                    className="text-[11px] text-[#0B5D3B] hover:text-[#084A2E] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>নমুনা লেখা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="text-[11px] text-[#8C3A3A] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="এখানে আপনার টাইপ করা রচনা, নোট বা অ্যাসাইনমেন্টের লেখা লিখুন..."
                rows={8}
                className="w-full text-xs sm:text-sm p-3.5 border border-[#D5E4DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] focus:border-transparent bg-[#FAFCFB] text-[#1A2E22] resize-y font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-[#4A5A52] pt-1 border-t border-[#E8F1EC]">
                <span>মোট শব্দ: <strong>{text.trim() ? text.trim().split(/\s+/).length : 0}</strong></span>
                <span>অক্ষর: <strong>{text.length}</strong></span>
                <span>মোট পেজ: <strong>{pages.length}</strong></span>
              </div>
            </div>

            {/* Customization Controls Accordion/Card */}
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 rounded-2xl shadow-xs space-y-5">
              <h2 className="text-xs font-bold text-[#084A2E] uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#0B5D3B]" />
                <span>হাতের লেখা ও খাতার স্টাইল নির্বাচন</span>
              </h2>

              {/* Handwriting Font Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#2C3E35] block">
                  হাতের লেখার স্টাইল (Handwriting Font):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HANDWRITING_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={`px-3 py-2 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                        selectedFont === font.id
                          ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 font-bold text-[#084A2E]'
                          : 'border-[#D5E4DB] hover:bg-[#F4F8F5] text-[#34443B]'
                      }`}
                    >
                      <span className="block truncate">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#2C3E35] block">
                  খাতার ধরন (Paper Style):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAPER_TYPES.map((paper) => (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => setSelectedPaper(paper.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedPaper === paper.id
                          ? 'border-[#0B5D3B] bg-[#0B5D3B]/10 font-bold text-[#084A2E]'
                          : 'border-[#D5E4DB] hover:bg-[#F4F8F5] text-[#34443B]'
                      }`}
                    >
                      <span className="block truncate text-xs">{paper.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ink Color Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#2C3E35] block">
                  কলমের কালির রং (Ink Color):
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {INK_COLORS.map((ink) => (
                    <button
                      key={ink.id}
                      type="button"
                      onClick={() => setSelectedInk(ink.hex)}
                      title={ink.name}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${
                        selectedInk === ink.hex
                          ? 'border-[#084A2E] ring-2 ring-[#0B5D3B]/30 font-semibold'
                          : 'border-[#D5E4DB] hover:bg-[#F4F8F5]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: ink.hex }}
                      />
                      <span className="text-[11px]">{ink.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Info (Optional Name / Date) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8F1EC]">
                <div>
                  <label className="text-[11px] font-medium text-[#4A5A52] block mb-1">
                    শিক্ষার্থীর নাম / শিরোনাম (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="উদাঃ রফিক আহমেদ"
                    className="w-full text-xs p-2 border border-[#D5E4DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B5D3B] bg-[#FAFCFB]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#4A5A52] block mb-1">
                    তারিখ / রোল নম্বর (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="উদাঃ ০১/১০/২০২৬"
                    className="w-full text-xs p-2 border border-[#D5E4DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B5D3B] bg-[#FAFCFB]"
                  />
                </div>
              </div>

              {/* Sliders for fine tuning */}
              <div className="space-y-3 pt-2 border-t border-[#E8F1EC]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4A5A52]">অক্ষরের সাইজ (Font Size):</span>
                  <span className="font-mono font-bold text-[#084A2E]">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={26}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#0B5D3B] cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4A5A52]">লাইনের দূরত্ব (Line Spacing):</span>
                  <span className="font-mono font-bold text-[#084A2E]">{lineHeight.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1.6}
                  max={2.6}
                  step={0.1}
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-[#0B5D3B] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Notebook Preview & Download Bar (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Toolbar: Pagination & Export Buttons */}
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-3.5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Pagination controls */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                  disabled={currentPageIndex === 0}
                  className="p-1.5 rounded-lg border border-[#D5E4DB] hover:bg-[#F4F8F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[#084A2E]"
                  title="পূর্ববর্তী পাতা"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-[#084A2E] px-2 py-1 bg-[#F4F8F5] rounded-md font-mono">
                  পৃষ্ঠা {currentPageIndex + 1} / {pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPageIndex >= pages.length - 1}
                  className="p-1.5 rounded-lg border border-[#D5E4DB] hover:bg-[#F4F8F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[#084A2E]"
                  title="পরবর্তী পাতা"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="px-3 py-1.5 bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'তৈরি হচ্ছে...' : 'A4 PDF ডাউনলোড'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isExporting}
                  className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D5E4DB] hover:bg-[#F4F8F5] text-[#084A2E] text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ছবি (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5E4DB] hover:bg-[#F4F8F5] text-[#4A5A52] hover:text-[#084A2E] text-xs rounded-lg transition-colors cursor-pointer hidden sm:flex items-center space-x-1"
                  title="সরাসরি প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
              </div>
            </div>

            {/* Simulated Realistic Paper Canvas */}
            <div className="overflow-x-auto pb-4">
              <div
                ref={paperRef}
                id="handwriting-paper-preview"
                className="relative mx-auto rounded-lg shadow-md border border-[#D1D5DB] transition-all select-none"
                style={{
                  width: '100%',
                  maxWidth: '680px',
                  minHeight: '880px',
                  backgroundColor: activePaperObj.bgColor,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  paddingTop: '60px',
                  paddingBottom: '50px',
                  paddingLeft: activePaperObj.hasMarginLine ? '75px' : '40px',
                  paddingRight: '40px',
                  backgroundImage:
                    activePaperObj.id === 'ruled' || activePaperObj.id === 'yellow'
                      ? `repeating-linear-gradient(transparent, transparent ${fontSize * lineHeight - 1}px, ${activePaperObj.lineColor} ${fontSize * lineHeight - 1}px, ${activePaperObj.lineColor} ${fontSize * lineHeight}px)`
                      : activePaperObj.id === 'grid'
                      ? `linear-gradient(${activePaperObj.lineColor} 1px, transparent 1px), linear-gradient(90deg, ${activePaperObj.lineColor} 1px, transparent 1px)`
                      : 'none',
                  backgroundSize: activePaperObj.id === 'grid' ? '24px 24px' : 'auto',
                }}
              >
                {/* Left Margin Line (Red/Coral) if applicable */}
                {activePaperObj.hasMarginLine && (
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                      left: '60px',
                      width: '1.5px',
                      backgroundColor: activePaperObj.marginColor,
                    }}
                  />
                )}

                {/* Top Header info (Name, Date, Page) */}
                <div className="flex items-center justify-between text-xs mb-6 pb-2 border-b border-dashed border-gray-300 font-sans opacity-70">
                  <div className="text-gray-700 font-medium">
                    {authorName && <span>নাম: {authorName}</span>}
                  </div>
                  <div className="flex items-center space-x-4 text-gray-700">
                    {dateStr && <span>তারিখ: {dateStr}</span>}
                    <span>পৃষ্ঠা: {currentPage.pageNumber}</span>
                  </div>
                </div>

                {/* Handwritten Text Lines */}
                <div
                  style={{
                    fontFamily: activeFontObj.font,
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    letterSpacing: `${letterSpacing}px`,
                    color: selectedInk,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {currentPage.lines.length > 0 ? (
                    currentPage.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className="transition-opacity duration-150"
                        style={{
                          minHeight: `${fontSize * lineHeight}px`,
                          transform: `rotate(${((idx % 3) - 1) * 0.12}deg)`, // natural slight human tilt
                        }}
                      >
                        {line || '\u00A0'}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic font-sans text-sm py-12 text-center">
                      বামে টেক্সট লিখলে এখানে সুন্দর রুলটানা খাতায় হাতের লেখার মতো ফুটে উঠবে...
                    </div>
                  )}
                </div>

                {/* Paper bottom page footer */}
                <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-[11px] text-gray-400">
                  — পৃষ্ঠা {currentPage.pageNumber} —
                </div>
              </div>
            </div>

            {/* Quick helper note */}
            <div className="p-4 bg-[#F4F8F5] border border-[#D5E4DB] rounded-xl text-xs text-[#34443B] space-y-1">
              <p className="font-semibold text-[#084A2E]">💡 নিখুঁত অ্যাসাইনমেন্ট তৈরির টিপস:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#4A5A52]">
                <li>আসল বলপয়েন্ট কলমের মতো দেখতে <strong>রয়েল ব্লু পেন</strong> এবং <strong>রুলটানা খাতা</strong> নির্বাচন করুন।</li>
                <li>বড় লেখার ক্ষেত্রে একাধিক পৃষ্ঠা তৈরি হলে ওপরের পৃষ্ঠা কন্ট্রোলার থেকে পাতা পরিবর্তন করে আলাদা ডাউনলোড করতে পারবেন।</li>
                <li>A4 সাইজ PDF ডাউনলোড করে সরাসরি যেকোনো প্রিন্টারে প্রিন্ট করলে খাঁটি মানুষের হাতের লেখার অ্যাসাইনমেন্টের মতো দেখাবে।</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic CMS and FAQ Section */}
        <CmsDynamicContent content={pageContent} />

        {/* Related Tools Navigation */}
        <RelatedTools currentToolId="text-to-handwriting" />
      </div>
    </>
  );
};
