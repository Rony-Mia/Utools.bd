import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb.tsx';
import { Link } from 'react-router-dom';
import {
  Grid,
  Download,
  FileImage,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
  Palette,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Crop,
  ArrowRight
} from 'lucide-react';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/image-merger.json';
import {
  PageSize,
  PageOrientation,
  LayoutMode,
  ImageFit,
  MergedCanvasConfig,
  createMergedCanvas,
  exportCanvasToFormat,
  exportMultiPageCanvasToFormat,
  calculateOptimalGrid,
  loadImageElement,
  formatBytesBengali,
  toBanglaDigits
} from '../lib/imageMergerUtils.ts';
import { ImageSortableGrid, ImageSortableItem } from '../components/image/ImageSortableGrid.tsx';

export const ImageMergerPage: React.FC = () => {
  // Image Items State
  const [items, setItems] = useState<ImageSortableItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Layout Configuration State
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [columns, setColumns] = useState<number>(2);
  const [rows, setRows] = useState<number>(2);

  // Images Per Page State (Customizable)
  const [imagesPerPageMode, setImagesPerPageMode] = useState<'preset' | 'custom' | 'all'>('preset');
  const [imagesPerPage, setImagesPerPage] = useState<number>(4);
  const [customImagesPerPageInput, setCustomImagesPerPageInput] = useState<number>(4);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [exportScope, setExportScope] = useState<'all' | 'current'>('all');

  // Spacing & Border
  const [padding, setPadding] = useState<number>(16);
  const [margin, setMargin] = useState<number>(24);
  const [borderRadius, setBorderRadius] = useState<number>(4);
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [borderColor, setBorderColor] = useState<string>('#d8cfb8');

  // Background & Fit
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [imageFit, setImageFit] = useState<ImageFit>('contain');

  // Custom Size (if pageSize === 'Custom')
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(1200);

  // Export Settings
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'application/pdf'>('image/jpeg');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [exportFilename, setExportFilename] = useState<string>('utools-merged-image');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Live Canvas Preview
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 1240,
    height: 1754,
  });

  // Effective number of images to place on each page
  const targetImagesPerPage =
    imagesPerPageMode === 'all'
      ? Math.max(1, items.length || 1)
      : Math.max(1, imagesPerPage || 1);

  // Total pages needed for the current items list
  const totalPages =
    items.length === 0 ? 1 : Math.max(1, Math.ceil(items.length / targetImagesPerPage));

  // Safe active page index
  const safePageIndex = Math.min(activePageIndex, totalPages - 1);

  // Unique IDs for accessibility
  const paddingInputId = useId();
  const marginInputId = useId();
  const radiusInputId = useId();
  const borderWidthInputId = useId();
  const qualityInputId = useId();
  const filenameInputId = useId();
  const customWidthInputId = useId();
  const customHeightInputId = useId();
  const colsInputId = useId();
  const rowsInputId = useId();

  // Helper to re-render the preview canvas
  const updateCanvasPreview = useCallback(async () => {
    if (items.length === 0) {
      setPreviewDataUrl(null);
      return;
    }

    try {
      const config: MergedCanvasConfig = {
        pageSize,
        orientation,
        layoutMode,
        columns,
        rows,
        padding,
        margin,
        backgroundColor,
        borderColor,
        borderWidth,
        borderRadius,
        imageFit,
        customWidthPx: customWidth,
        customHeightPx: customHeight,
      };

      const startIdx = safePageIndex * targetImagesPerPage;
      const pageItems = imagesPerPageMode === 'all'
        ? items
        : items.slice(startIdx, startIdx + targetImagesPerPage);

      const htmlImages = pageItems.map((it) => it.imgElement);
      const canvas = await createMergedCanvas(htmlImages, config);
      previewCanvasRef.current = canvas;
      setCanvasDimensions({ width: canvas.width, height: canvas.height });
      setPreviewDataUrl(canvas.toDataURL('image/png'));
    } catch (err: unknown) {
      console.error('Failed to render canvas preview:', err);
    }
  }, [
    items,
    safePageIndex,
    targetImagesPerPage,
    imagesPerPageMode,
    pageSize,
    orientation,
    layoutMode,
    columns,
    rows,
    padding,
    margin,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    imageFit,
    customWidth,
    customHeight,
  ]);

  // Debounced effect to update canvas when options or images change
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        updateCanvasPreview();
      }
    }, 80);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [updateCanvasPreview]);

  // Handle uploading multiple files
  const handleUploadFiles = async (files: File[]) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const newItems: ImageSortableItem[] = [];

      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const imgElement = await loadImageElement(file, 0);
        const dataUrl = imgElement.src;

        newItems.push({
          id,
          file,
          dataUrl,
          imgElement,
          rotation: 0,
          name: file.name,
          sizeBytes: file.size,
          width: imgElement.width,
          height: imgElement.height,
        });
      }

      setItems((prev) => {
        const updated = [...prev, ...newItems];
        // Automatically suggest column/row count if grid mode
        if (updated.length > 0 && layoutMode === 'grid') {
          if (updated.length <= 2) {
            setColumns(2);
            setRows(1);
          } else if (updated.length <= 4) {
            setColumns(2);
            setRows(2);
          } else if (updated.length <= 6) {
            setColumns(3);
            setRows(2);
          } else if (updated.length <= 9) {
            setColumns(3);
            setRows(3);
          } else {
            setColumns(4);
            setRows(Math.ceil(updated.length / 4));
          }
        }
        return updated;
      });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'কিছু ছবি লোড করার সময় সমস্যা হয়েছে।'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove individual item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Rotate individual item 90 degrees CW
  const handleRotateItem = async (id: string) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;

    try {
      const newRotation = (target.rotation + 90) % 360;
      const rotatedImg = await loadImageElement(target.file, newRotation);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                rotation: newRotation,
                imgElement: rotatedImg,
                width: rotatedImg.width,
                height: rotatedImg.height,
              }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to rotate image:', err);
    }
  };

  // Reorder items
  const handleReorderItems = (startIndex: number, endIndex: number) => {
    setItems((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // Clear all items
  const handleClearAll = () => {
    setItems([]);
    setPreviewDataUrl(null);
    setErrorMessage(null);
  };

  // Quick Preset Handlers
  const applyPreset = (presetName: string) => {
    setActivePageIndex(0);
    if (presetName === 'a4_1x2') {
      setPageSize('A4');
      setOrientation('portrait');
      setLayoutMode('grid');
      setColumns(1);
      setRows(2);
      setImagesPerPageMode('preset');
      setImagesPerPage(2);
      setCustomImagesPerPageInput(2);
      setPadding(16);
      setMargin(24);
      setImageFit('contain');
    } else if (presetName === 'a4_2x2') {
      setPageSize('A4');
      setOrientation('portrait');
      setLayoutMode('grid');
      setColumns(2);
      setRows(2);
      setImagesPerPageMode('preset');
      setImagesPerPage(4);
      setCustomImagesPerPageInput(4);
      setPadding(16);
      setMargin(24);
      setImageFit('contain');
    } else if (presetName === 'passport_sheet') {
      setPageSize('A4');
      setOrientation('portrait');
      setLayoutMode('grid');
      setColumns(2);
      setRows(3);
      setImagesPerPageMode('preset');
      setImagesPerPage(6);
      setCustomImagesPerPageInput(6);
      setPadding(12);
      setMargin(20);
      setImageFit('contain');
      setBackgroundColor('#ffffff');
      setBorderWidth(1);
      setBorderColor('#cccccc');
    } else if (presetName === 'vertical_strip') {
      setPageSize('AutoFit');
      setLayoutMode('vertical');
      setImagesPerPageMode('all');
      setPadding(10);
      setMargin(15);
      setImageFit('cover');
    } else if (presetName === 'horizontal_row') {
      setPageSize('AutoFit');
      setLayoutMode('horizontal');
      setImagesPerPageMode('all');
      setPadding(10);
      setMargin(15);
      setImageFit('cover');
    } else if (presetName === 'grid_2x4') {
      setPageSize('A4');
      setOrientation('portrait');
      setLayoutMode('grid');
      setColumns(2);
      setRows(4);
      setImagesPerPageMode('preset');
      setImagesPerPage(8);
      setCustomImagesPerPageInput(8);
      setPadding(12);
      setMargin(20);
      setImageFit('contain');
    } else if (presetName === 'grid_3x3') {
      setPageSize('A4');
      setOrientation('portrait');
      setLayoutMode('grid');
      setColumns(3);
      setRows(3);
      setImagesPerPageMode('preset');
      setImagesPerPage(9);
      setCustomImagesPerPageInput(9);
      setPadding(10);
      setMargin(20);
      setImageFit('cover');
    }
  };

  // Handle Images Per Page Preset selection
  const handleSelectImagesPerPagePreset = (id: string) => {
    setActivePageIndex(0);
    if (id === 'all') {
      setImagesPerPageMode('all');
      if (layoutMode === 'grid' && items.length > 0) {
        const opt = calculateOptimalGrid(items.length, orientation);
        setColumns(opt.columns);
        setRows(opt.rows);
      }
      return;
    }

    if (id === 'custom') {
      setImagesPerPageMode('custom');
      const count = Math.max(1, customImagesPerPageInput);
      setImagesPerPage(count);
      if (layoutMode === 'grid') {
        const opt = calculateOptimalGrid(count, orientation);
        setColumns(opt.columns);
        setRows(opt.rows);
      }
      return;
    }

    const num = Number(id);
    if (!isNaN(num) && num > 0) {
      setImagesPerPageMode('preset');
      setImagesPerPage(num);
      setCustomImagesPerPageInput(num);
      if (layoutMode === 'grid') {
        const opt = calculateOptimalGrid(num, orientation);
        setColumns(opt.columns);
        setRows(opt.rows);
      }
    }
  };

  // Handle direct numeric input for custom images per page
  const handleCustomImagesPerPageInputChange = (num: number) => {
    const valid = Math.max(1, Math.min(50, num || 1));
    setCustomImagesPerPageInput(valid);
    setImagesPerPage(valid);
    setImagesPerPageMode('custom');
    setActivePageIndex(0);
    if (layoutMode === 'grid') {
      const opt = calculateOptimalGrid(valid, orientation);
      setColumns(opt.columns);
      setRows(opt.rows);
    }
  };

  // Execute export and download
  const handleExport = async () => {
    if (items.length === 0) {
      setErrorMessage('ডাউনলোড করার আগে অনুগ্রহ করে অন্তত একটি ছবি যোগ করুন।');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const config: MergedCanvasConfig = {
        pageSize,
        orientation,
        layoutMode,
        columns,
        rows,
        padding,
        margin,
        backgroundColor,
        borderColor,
        borderWidth,
        borderRadius,
        imageFit,
        customWidthPx: customWidth,
        customHeightPx: customHeight,
      };

      const cleanFilename = (exportFilename || 'utools-merged-image').trim().replace(/\.[^/.]+$/, '');

      // Generate canvases for all pages if exporting all pages
      if (totalPages > 1 && exportScope === 'all') {
        const canvases: HTMLCanvasElement[] = [];
        for (let p = 0; p < totalPages; p++) {
          const start = p * targetImagesPerPage;
          const pItems = items.slice(start, start + targetImagesPerPage);
          const pCanvas = await createMergedCanvas(
            pItems.map((it) => it.imgElement),
            config
          );
          canvases.push(pCanvas);
        }

        await exportMultiPageCanvasToFormat(
          canvases,
          exportFormat,
          exportQuality,
          cleanFilename,
          'all',
          safePageIndex
        );
      } else {
        // Single page or active page only
        const start = safePageIndex * targetImagesPerPage;
        const pItems = imagesPerPageMode === 'all'
          ? items
          : items.slice(start, start + targetImagesPerPage);

        const canvas = await createMergedCanvas(
          pItems.map((it) => it.imgElement),
          config
        );

        await exportMultiPageCanvasToFormat(
          [canvas],
          exportFormat,
          exportQuality,
          cleanFilename,
          'current',
          safePageIndex
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? `এক্সপোর্ট ব্যর্থ হয়েছে: ${err.message}` : 'ছবি তৈরি করতে সমস্যা হয়েছে।'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Schema.org Structured Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageContent.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/image-merger"
        toolName="ইমেজ মার্জার ও কোলাজ মেকার"
        categoryName="গ্রাফিক্স ও ছবি"
        faqs={pageContent.faqs || []}
      />

      {/* Top Breadcrumb */}
      <ToolBreadcrumb
        toolName="ইমেজ মার্জার ও কোলাজ মেকার"
        categoryName="ইমেজ টুলস"
        categoryPath="/image-merger"
        privacyText="১০০% ক্লায়েন্ট-সাইড • কোনো তথ্য সার্ভারে যায় না"
      />

      {/* HEADER SECTION */}
      <div className="border-b border-[#D5E4DB] pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold bg-[#0B5D3B] text-[#FFFFFF] px-2.5 py-0.5">
              ইমেজ প্রসেসিং ও লেআউট
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#0B5D3B] font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>১০০% ব্রাউজার প্রসেসিং • প্রাইভেট ও নিরাপদ</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#084A2E] tracking-tight">
          {pageContent.title}
        </h1>

        <p className="text-sm sm:text-base text-[#34443B] max-w-4xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* WORKBENCH CONTAINER */}
      <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-5 sm:p-7 lg:p-8 space-y-8 rounded-2xl">
        {/* SECTION 1: UPLOAD & SORTABLE IMAGES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#084A2E]">
              <span className="bg-[#F0F4F2] border border-[#D5E4DB] px-2 py-0.5 font-bold">ধাপ ১</span>
              <span className="font-bold">ছবি আপলোড ও ক্রমবিন্যাস (Images & Reorder)</span>
            </div>
            {items.length > 0 && (
              <span className="text-xs font-mono text-[#4A5A52]">
                {toBanglaDigits(items.length)}টি ছবি লোড করা হয়েছে
              </span>
            )}
          </div>

          <ImageSortableGrid
            items={items}
            onUpload={handleUploadFiles}
            onRemove={handleRemoveItem}
            onRotate={handleRotateItem}
            onReorder={handleReorderItems}
            onClearAll={handleClearAll}
            isLoading={isProcessing}
          />
        </div>

        {/* SECTION 2 & 3: CONFIGURATION AND LIVE PREVIEW (2-COLUMN GRID) */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-[#D5E4DB]">
            {/* LEFT COLUMN: CONTROLS PANEL (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#D5E4DB]">
                <Sliders className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="font-bold text-sm sm:text-base text-[#084A2E] font-serif">
                  লেআউট ও পেজ কনফিগারেশন
                </h2>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#084A2E] block">জনপ্রিয় প্রিসেট (Quick Presets)</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'a4_1x2', label: 'A4 পেজে ২টি ছবি (এপিঠ-ওপিঠ)' },
                    { id: 'a4_2x2', label: 'A4 পেজে ৪টি ছবি (২×২)' },
                    { id: 'passport_sheet', label: 'পাসপোর্ট ছবি শিট (৬টি)' },
                    { id: 'grid_2x4', label: '৮টি ছবির শিট (২×৪)' },
                    { id: 'grid_3x3', label: '৯টি ছবির গ্রিড (৩×৩)' },
                    { id: 'vertical_strip', label: 'লম্বালম্বি স্ট্রিপ (Vertical)' },
                    { id: 'horizontal_row', label: 'পাশাপাশি সারি (Row)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className="text-xs px-2.5 py-1.5 border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#0B5D3B] hover:text-[#FFFFFF] hover:border-[#0B5D3B] text-[#084A2E] transition-colors cursor-pointer rounded-lg"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1 পেজে ছবির সংখ্যা (Images per Page) - Custom & Quick Options */}
              <div className="space-y-2.5 p-3.5 sm:p-4 bg-[#E6F4EC]/50 border-2 border-[#0B5D3B]/25 rounded-2xl shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <Grid className="w-4 h-4 text-[#0B5D3B]" />
                    <label className="text-xs font-bold text-[#084A2E]">
                      ১ পেজে কয়টি ছবি থাকবে? (Images Per Page)
                    </label>
                  </div>
                  {items.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#0B5D3B] bg-[#FFFFFF] px-2.5 py-0.5 rounded-full border border-[#0B5D3B]/20">
                      মোট {toBanglaDigits(items.length)}টি ছবি • পেজ হবে: {toBanglaDigits(totalPages)}টি
                    </span>
                  )}
                </div>

                {/* Pill Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { id: 'all', label: 'সব ছবি ১ পেজে' },
                    { id: '1', label: '১টি ছবি' },
                    { id: '2', label: '২টি (এপিঠ-ওপিঠ)' },
                    { id: '4', label: '৪টি (২×২)' },
                    { id: '6', label: '৬টি (পাসপোর্ট)' },
                    { id: '8', label: '৮টি (২×৪)' },
                    { id: '9', label: '৯টি (৩×৩)' },
                    { id: '12', label: '১২টি' },
                    { id: 'custom', label: 'কাস্টম সংখ্যা ✎' },
                  ].map((opt) => {
                    const isSelected =
                      opt.id === 'all'
                        ? imagesPerPageMode === 'all'
                        : opt.id === 'custom'
                        ? imagesPerPageMode === 'custom'
                        : imagesPerPageMode === 'preset' && imagesPerPage === Number(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectImagesPerPagePreset(opt.id)}
                        className={`px-3 py-1.5 text-xs font-semibold border text-center transition-all cursor-pointer rounded-lg ${
                          isSelected
                            ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B] shadow-xs'
                            : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#E6F4EC]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Number Input Row when 'custom' is active */}
                {imagesPerPageMode === 'custom' && (
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#0B5D3B]/15">
                    <span className="text-xs font-semibold text-[#084A2E]">
                      প্রতি পেজে নির্দিষ্ট সংখ্যা:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={customImagesPerPageInput}
                        onChange={(e) => handleCustomImagesPerPageInputChange(Number(e.target.value))}
                        className="w-20 px-2.5 py-1 bg-white border-2 border-[#0B5D3B] rounded-lg text-xs font-mono font-bold text-[#0B5D3B] text-center focus:outline-none"
                      />
                      <span className="text-xs font-medium text-[#4A5A52]">টি ছবি</span>
                    </div>
                    <span className="text-[11px] text-[#4A5A52]">
                      (গ্রিড কলাম ও সারি স্বয়ংক্রিয়ভাবে হিসাব করা হবে)
                    </span>
                  </div>
                )}
              </div>

              {/* Page Size & Orientation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#084A2E] block">পেজ সাইজ (Page Size)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['A4', 'Letter', 'A3', 'AutoFit', 'Custom'] as PageSize[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPageSize(size)}
                        className={`py-1.5 text-xs font-medium border text-center transition-colors cursor-pointer ${
                          pageSize === size
                            ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                            : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        {size === 'AutoFit' ? 'অটোফিট' : size === 'Custom' ? 'কাস্টম' : size}
                      </button>
                    ))}
                  </div>
                </div>

                {pageSize !== 'AutoFit' && pageSize !== 'Custom' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#084A2E] block">পেজ ওরিয়েন্টেশন</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrientation('portrait')}
                        className={`py-1.5 text-xs font-medium border text-center transition-colors cursor-pointer ${
                          orientation === 'portrait'
                            ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                            : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        লম্বালম্বি (Portrait)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrientation('landscape')}
                        className={`py-1.5 text-xs font-medium border text-center transition-colors cursor-pointer ${
                          orientation === 'landscape'
                            ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                            : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                        }`}
                      >
                        আড়াআড়ি (Landscape)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Dimensions (if Custom PageSize) */}
              {pageSize === 'Custom' && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-[#F0F4F2]/50 border border-[#D5E4DB] rounded-2xl">
                  <div className="space-y-1">
                    <label htmlFor={customWidthInputId} className="text-xs font-bold text-[#084A2E]">
                      কাস্টম প্রস্থ (Width px)
                    </label>
                    <input
                      id={customWidthInputId}
                      type="number"
                      min="200"
                      max="6000"
                      step="50"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs font-mono rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={customHeightInputId} className="text-xs font-bold text-[#084A2E]">
                      কাস্টম উচ্চতা (Height px)
                    </label>
                    <input
                      id={customHeightInputId}
                      type="number"
                      min="200"
                      max="6000"
                      step="50"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs font-mono rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Layout Mode & Grid Matrix */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#084A2E] block">লেআউট বিন্যাস (Layout Mode)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    className={`py-2 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      layoutMode === 'grid'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    গ্রিড কোলাজ (Grid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('vertical')}
                    className={`py-2 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      layoutMode === 'vertical'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    ভার্টিক্যাল স্ট্যাক (Vertical)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('horizontal')}
                    className={`py-2 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      layoutMode === 'horizontal'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    হরাইজন্টাল সারি (Row)
                  </button>
                </div>

                {/* Grid Columns & Rows controls if layoutMode === 'grid' */}
                {layoutMode === 'grid' && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-[#084A2E]">
                        <label htmlFor={colsInputId} className="font-bold">কলাম সংখ্যা (Columns)</label>
                        <span className="font-mono text-[#0B5D3B] font-bold">{columns} কলাম</span>
                      </div>
                      <input
                        id={colsInputId}
                        type="range"
                        min="1"
                        max="6"
                        value={columns}
                        onChange={(e) => {
                          const newCols = Number(e.target.value);
                          setColumns(newCols);
                          if (imagesPerPageMode !== 'all') {
                            const newCount = newCols * rows;
                            setImagesPerPage(newCount);
                            setCustomImagesPerPageInput(newCount);
                            setActivePageIndex(0);
                          }
                        }}
                        className="w-full accent-[#0B5D3B]"
                      />
                      <div className="flex justify-between text-[10px] text-[#4A5A52]">
                        <span>১ কলাম</span>
                        <span>২ (স্ট্যান্ডার্ড)</span>
                        <span>৬ কলাম</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-[#084A2E]">
                        <label htmlFor={rowsInputId} className="font-bold">সারি সংখ্যা (Rows)</label>
                        <span className="font-mono text-[#0B5D3B] font-bold">{rows} সারি</span>
                      </div>
                      <input
                        id={rowsInputId}
                        type="range"
                        min="1"
                        max="8"
                        value={rows}
                        onChange={(e) => {
                          const newRows = Number(e.target.value);
                          setRows(newRows);
                          if (imagesPerPageMode !== 'all') {
                            const newCount = columns * newRows;
                            setImagesPerPage(newCount);
                            setCustomImagesPerPageInput(newCount);
                            setActivePageIndex(0);
                          }
                        }}
                        className="w-full accent-[#0B5D3B]"
                      />
                      <div className="flex justify-between text-[10px] text-[#4A5A52]">
                        <span>১ সারি</span>
                        <span>২ (স্ট্যান্ডার্ড)</span>
                        <span>৮ সারি</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Fit Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#084A2E] block">
                  ছবির অনুপাত ও ফিট (Image Fit)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'contain', label: 'পুরো ছবি ফিট (Contain)' },
                    { id: 'cover', label: 'ঘর পূর্ণ ক্রপ (Cover)' },
                    { id: 'fill', label: 'টেনে পূরণ (Fill)' },
                  ].map((fit) => (
                    <button
                      key={fit.id}
                      type="button"
                      onClick={() => setImageFit(fit.id as ImageFit)}
                      className={`py-1.5 text-xs font-medium border text-center transition-colors cursor-pointer ${
                        imageFit === fit.id
                          ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                          : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                      }`}
                    >
                      {fit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing & Borders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F0F4F2]/40 border border-[#D5E4DB] rounded-2xl">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#084A2E]">
                    <label htmlFor={paddingInputId} className="font-medium">ছবিগুলোর দূরত্ব (Padding)</label>
                    <span className="font-mono text-[#4A5A52]">{padding}px</span>
                  </div>
                  <input
                    id={paddingInputId}
                    type="range"
                    min="0"
                    max="50"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full accent-[#0B5D3B]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#084A2E]">
                    <label htmlFor={marginInputId} className="font-medium">পেজ বর্ডার মার্জিন</label>
                    <span className="font-mono text-[#4A5A52]">{margin}px</span>
                  </div>
                  <input
                    id={marginInputId}
                    type="range"
                    min="0"
                    max="60"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-[#0B5D3B]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#084A2E]">
                    <label htmlFor={radiusInputId} className="font-medium">গোল কোণ (Border Radius)</label>
                    <span className="font-mono text-[#4A5A52]">{borderRadius}px</span>
                  </div>
                  <input
                    id={radiusInputId}
                    type="range"
                    min="0"
                    max="30"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-[#0B5D3B]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#084A2E]">
                    <label htmlFor={borderWidthInputId} className="font-medium">বর্ডার স্ট্রোক (Border Width)</label>
                    <span className="font-mono text-[#4A5A52]">{borderWidth}px</span>
                  </div>
                  <input
                    id={borderWidthInputId}
                    type="range"
                    min="0"
                    max="8"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full accent-[#0B5D3B]"
                  />
                </div>
              </div>

              {/* Background Color & Border Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#084A2E] block">পেজের পটভূমি (Background)</span>
                  <div className="flex items-center space-x-2">
                    {[
                      { label: 'সাদা', val: '#ffffff' },
                      { label: 'ক্রিম', val: '#f4efe4' },
                      { label: 'কালো', val: '#1e293b' },
                      { label: 'স্বচ্ছ', val: 'transparent' },
                    ].map((b) => (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => setBackgroundColor(b.val)}
                        className={`px-2 py-1 text-xs border transition-all cursor-pointer ${
                          backgroundColor === b.val
                            ? 'border-[#0B5D3B] ring-1 ring-[#0B5D3B] font-bold bg-[#FFFFFF]'
                            : 'border-[#D5E4DB] bg-[#FFFFFF]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      title="কাস্টম ব্যাকগ্রাউন্ড কালার"
                      className="w-7 h-7 border border-[#D5E4DB] p-0.5 bg-[#FFFFFF] cursor-pointer rounded-lg"
                    />
                  </div>
                </div>

                {borderWidth > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#084A2E] block">বর্ডার কালার (Border Color)</span>
                    <div className="flex items-center space-x-2">
                      {[
                        { label: 'বেজ', val: '#d8cfb8' },
                        { label: 'কালো', val: '#14231c' },
                        { label: 'সবুজ', val: '#0c5c3d' },
                        { label: 'সাদা', val: '#ffffff' },
                      ].map((c) => (
                        <button
                          key={c.val}
                          type="button"
                          onClick={() => setBorderColor(c.val)}
                          className={`px-2 py-1 text-xs border transition-all cursor-pointer ${
                            borderColor === c.val
                              ? 'border-[#0B5D3B] ring-1 ring-[#0B5D3B] font-bold bg-[#FFFFFF]'
                              : 'border-[#D5E4DB] bg-[#FFFFFF]'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        title="কাস্টম বর্ডার কালার"
                        className="w-7 h-7 border border-[#D5E4DB] p-0.5 bg-[#FFFFFF] cursor-pointer rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW & EXPORT PANEL (5 COLS) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Preview Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#D5E4DB]">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-[#0B5D3B]" />
                  <h3 className="font-bold text-sm text-[#084A2E] font-serif">
                    লাইভ ক্যানভাস প্রিভিউ
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#4A5A52]">
                  {canvasDimensions.width} × {canvasDimensions.height} px
                </span>
              </div>

              {/* Multi-page Navigation Bar if totalPages > 1 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-[#0B5D3B]/20 rounded-xl shadow-xs">
                  <button
                    type="button"
                    disabled={safePageIndex === 0}
                    onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                    className="px-2.5 py-1 text-xs font-bold text-[#0B5D3B] disabled:text-[#A0AEC0] hover:bg-[#E6F4EC] rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> আগের পেজ
                  </button>
                  <div className="text-center">
                    <span className="text-xs font-bold text-[#084A2E]">
                      পেজ {toBanglaDigits(safePageIndex + 1)} / {toBanglaDigits(totalPages)}
                    </span>
                    <span className="block text-[10px] text-[#4A5A52] font-mono">
                      (ছবি {toBanglaDigits(safePageIndex * targetImagesPerPage + 1)} - {toBanglaDigits(Math.min(items.length, (safePageIndex + 1) * targetImagesPerPage))})
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={safePageIndex >= totalPages - 1}
                    onClick={() => setActivePageIndex((p) => Math.min(totalPages - 1, p + 1))}
                    className="px-2.5 py-1 text-xs font-bold text-[#0B5D3B] disabled:text-[#A0AEC0] hover:bg-[#E6F4EC] rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    পরের পেজ <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Viewport Box */}
              <div className="border border-[#D5E4DB] bg-[#E4EEE8]/40 p-4 flex flex-col items-center justify-center min-h-[340px] max-h-[500px] overflow-hidden relative shadow-inner rounded-2xl">
                {previewDataUrl ? (
                  <div className="relative max-w-full max-h-[460px] flex items-center justify-center shadow-lg bg-white">
                    <img
                      src={previewDataUrl}
                      alt="Merged Canvas Live Preview"
                      width={canvasDimensions.width}
                      height={canvasDimensions.height}
                      style={{
                        aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}`,
                      }}
                      className="max-w-full max-h-[440px] object-contain block border border-black/10"
                    />
                  </div>
                ) : (
                  <div className="text-center text-[#4A5A52] text-xs space-y-2">
                    <FileImage className="w-10 h-10 text-[#8A9E92] mx-auto animate-pulse" />
                    <p>ছবি নির্বাচন করলে এখানে রিয়েল-টাইম ক্যানভাস দৃশ্যমান হবে</p>
                  </div>
                )}
              </div>

              {/* EXPORT & DOWNLOAD PANEL */}
              <div className="border border-[#D5E4DB] bg-[#F0F4F2]/50 p-4 space-y-4 rounded-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#D5E4DB]">
                  <span className="text-xs font-bold text-[#084A2E] uppercase tracking-wider">
                    ডাউনলোড অপশন
                  </span>
                  <span className="text-xs font-mono text-[#0B5D3B] font-bold">
                    {exportFormat === 'application/pdf'
                      ? 'PDF ডকুমেন্ট'
                      : exportFormat === 'image/jpeg'
                      ? 'JPEG ছবি'
                      : 'PNG ছবি'}
                  </span>
                </div>

                {/* Format Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('image/jpeg')}
                    className={`py-2 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      exportFormat === 'image/jpeg'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    JPG ইমেজ
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('image/png')}
                    className={`py-2 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      exportFormat === 'image/png'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    PNG ইমেজ
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('application/pdf')}
                    className={`py-2 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      exportFormat === 'application/pdf'
                        ? 'bg-[#0B5D3B] text-[#FFFFFF] border-[#0B5D3B]'
                        : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    PDF ফাইল (প্রিন্ট)
                  </button>
                </div>

                {/* Quality Slider for JPEG / PDF */}
                {exportFormat !== 'image/png' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#084A2E]">
                      <label htmlFor={qualityInputId} className="font-medium">ইমেজ কোয়ালিটি / কম্প্রেশন</label>
                      <span className="font-mono text-[#4A5A52]">{Math.round(exportQuality * 100)}%</span>
                    </div>
                    <input
                      id={qualityInputId}
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.05"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Number(e.target.value))}
                      className="w-full accent-[#0B5D3B]"
                    />
                    <div className="flex justify-between text-[10px] text-[#4A5A52]">
                      <span>মাঝারি (৫০%)</span>
                      <span>উচ্চ (৮৫%)</span>
                      <span>সর্বোচ্চ (১০০%)</span>
                    </div>
                  </div>
                )}

                {/* Export Scope Selector when multiple pages exist */}
                {totalPages > 1 && (
                  <div className="space-y-1.5 p-3 bg-white border border-[#D5E4DB] rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#084A2E]">ডাউনলোড পরিধি (Export Scope):</span>
                      <span className="text-[11px] text-[#0B5D3B] font-semibold bg-[#E6F4EC] px-2 py-0.5 rounded-full">
                        মোট {toBanglaDigits(totalPages)}টি পেজ
                      </span>
                    </div>
                    {exportFormat === 'application/pdf' ? (
                      <p className="text-xs text-[#0B5D3B] font-medium pt-0.5">
                        ✓ একটিমাত্র PDF ফাইলে সব {toBanglaDigits(totalPages)}টি পেজ পর পর সংরক্ষিত হবে।
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setExportScope('all')}
                          className={`py-1.5 text-xs font-semibold border rounded-lg transition-colors cursor-pointer ${
                            exportScope === 'all'
                              ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                              : 'bg-[#F0F4F2] text-[#084A2E] border-[#D5E4DB] hover:bg-[#E6F4EC]'
                          }`}
                        >
                          সব পেজ (ZIP ফাইল)
                        </button>
                        <button
                          type="button"
                          onClick={() => setExportScope('current')}
                          className={`py-1.5 text-xs font-semibold border rounded-lg transition-colors cursor-pointer ${
                            exportScope === 'current'
                              ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                              : 'bg-[#F0F4F2] text-[#084A2E] border-[#D5E4DB] hover:bg-[#E6F4EC]'
                          }`}
                        >
                          বর্তমান পেজ ({toBanglaDigits(safePageIndex + 1)})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Filename Input */}
                <div className="space-y-1">
                  <label htmlFor={filenameInputId} className="text-xs font-bold text-[#084A2E]">
                    ফাইলের নাম
                  </label>
                  <input
                    id={filenameInputId}
                    type="text"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    placeholder="utools-merged-image"
                    className="w-full px-2.5 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs font-mono rounded-lg"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-2.5 border border-[#b84d4d] bg-[#f9e8e8] text-[#8a2424] text-xs flex items-center space-x-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Big Download Button */}
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting || items.length === 0}
                  className="w-full py-3 bg-[#0B5D3B] hover:bg-[#084A2E] disabled:bg-[#8A9E92] text-[#FFFFFF] font-bold text-sm tracking-wide transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting
                      ? 'তৈরি হচ্ছে...'
                      : exportFormat === 'application/pdf'
                      ? totalPages > 1
                        ? `PDF আকারে সব ${toBanglaDigits(totalPages)}টি পেজ ডাউনলোড করুন`
                        : 'PDF আকারে ডাউনলোড করুন'
                      : totalPages > 1 && exportScope === 'all'
                      ? `সব (${toBanglaDigits(totalPages)}টি) পেজ ZIP আকারে ডাউনলোড`
                      : `মার্জ করা ছবি ${totalPages > 1 ? `(পেজ ${toBanglaDigits(safePageIndex + 1)})` : ''} ডাউনলোড করুন`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: EDUCATIONAL DEEP DIVE & SEO CONTENT (800+ Words in Bengali) */}
      <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-6 lg:p-10 space-y-8 text-[#0F1F17] rounded-2xl">
        {/* Title and Intro */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#084A2E]">
            একাধিক ছবি এক পেজে সাজানো ও মার্জ করার প্রয়োজনীয়তা ও সুবিধা
          </h2>
          <p className="text-sm sm:text-base text-[#34443B] leading-relaxed">
            বর্তমান ডিজিটাল প্রশাসনিক যোগাযোগ, প্রাতিষ্ঠানিক প্রজেক্ট পেপার, চাকরির আবেদন এবং ই-কমার্স ব্যবসায় একাধিক ছবিকে সুশৃঙ্খলভাবে একটি ফ্রেমে বা A4 পেজে উপস্থাপন করা একটি অপরিহার্য কাজ। কোনো থার্ড-পার্টি ভারী সফটওয়্যার বা ফটোশপ ছাড়াই সরাসরি ব্রাউজারে ছবি জোড়া লাগানো এবং নিখুঁত প্রিন্ট লেআউটে সাজানোর জন্য Utools.bd-এর <strong>ইমেজ মার্জার ও কোলাজ মেকার</strong> একটি সহজ, শক্তিশালী এবং সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য প্ল্যাটফর্ম।
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 border border-[#D5E4DB] bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B] text-[#FFFFFF] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#084A2E] font-serif">A4 ও Letter পেজে প্রিন্ট ফ্রেন্ডলি</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              পাসপোর্ট সাইজের একাধিক ছবি, স্ট্যাম্প ছবি কিংবা বিভিন্ন প্রশংসাপত্রের ছবিকে একটি A4 পেজে সাজিয়ে সরাসরি প্রিন্ট দিন। ফটো পেপারের অপচয় রোধ ও প্রিন্টিং খরচ কমাতে এটি অতুলনীয়।
            </p>
          </div>

          <div className="p-4 border border-[#D5E4DB] bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B] text-[#FFFFFF] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#084A2E] font-serif">আইডি কার্ড ও সার্টিফিকেটের এপিঠ-ওপিঠ</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              ব্যাংক একাউন্ট খোলা, সিম রেজিস্ট্রেশন বা সরকারি ফর্মের জন্য জাতীয় পরিচয়পত্র (NID) কিংবা ড্রাইভিং লাইসেন্সের সামনের ও পেছনের অংশ এক সারিতে জোড়া লাগিয়ে নিমিষেই PDF বানান।
            </p>
          </div>

          <div className="p-4 border border-[#D5E4DB] bg-[#F0F4F2]/30 space-y-2 rounded-2xl">
            <div className="w-8 h-8 bg-[#0B5D3B] text-[#FFFFFF] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#084A2E] font-serif">১০০% ক্লায়েন্ট-সাইড প্রাইভেসি</h3>
            <p className="text-xs text-[#34443B] leading-relaxed">
              আপনার ব্যক্তিগত বা অফিশিয়াল স্পর্শকাতর ছবিগুলো কোনো ক্লাউড সার্ভার বা ডেটাবেজে আপলোড হয় না। সম্পূর্ণ কম্পোজিশন আপনার ডিভাইসের ব্রাউজারেই প্রক্রিয়াজাত হয়।
            </p>
          </div>
        </div>

        {/* Detailed Practical Use Cases */}
        <div className="space-y-4 pt-4 border-t border-[#D5E4DB]">
          <h3 className="text-lg font-serif font-bold text-[#084A2E]">
            বাস্তব ক্ষেত্রে ইমেজ মার্জার টুলের প্রধান ব্যবহারসমূহ:
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#24332B] leading-relaxed list-disc list-inside">
            <li>
              <strong>সরকারি ও ব্যাংক চাকরির আবেদন কপি:</strong> প্রার্থীর প্রবেশপত্র, প্রশংসাপত্র, বিভিন্ন সনদ বা অভিজ্ঞতার পাতার ছবিগুলোকে একটি নির্দিষ্ট ফাইলে একত্রিত করা।
            </li>
            <li>
              <strong>টেন্ডার ও ইঞ্জিনিয়ারিং পরিদর্শন রিপোর্ট:</strong> প্রজেক্ট সাইটের কাজের অগ্রগতি প্রদর্শনে ২×২ বা ৩×৩ গ্রিডে তারিখ অনুযায়ী ছবি সাজিয়ে রিপোর্ট তৈরি।
            </li>
            <li>
              <strong>পাসপোর্ট সাইজ ছবির ফটো শিট:</strong> ল্যাব বা সাইবার ক্যাফেতে না গিয়ে নিজে নিজের পাসপোর্ট/স্ট্যাম্প ছবি ৪টি বা ৬টি একসাথে সাজিয়ে প্রিন্ট উপযোগী শিট তৈরি।
            </li>
            <li>
              <strong>অনলাইন শপ ও ই-কমার্স ক্যাটালগ:</strong> ফেসবুক পেইজ বা অনলাইন শপের প্রোডাক্ট প্রদর্শনের জন্য বিভিন্ন অ্যাঙ্গেলের ৪টি বা ৬টি ছবি দিয়ে আকর্ষণীয় পণ্য কোলাজ তৈরি।
            </li>
            <li>
              <strong>শিক্ষার্থী ও বৈজ্ঞানিক তুলনা:</strong> মাইক্রোস্কোপিক স্লাইড বা বৈজ্ঞানিক গবেষণার পরীক্ষার তুলনামূলক ছবিগুলোকে পাশাপাশি (Horizontal) সাজিয়ে থিসিস পেপারে ব্যবহার।
            </li>
          </ul>
        </div>

        {/* Dynamic CMS Sections (Steps, FAQs, Features, Guidelines, Markdown, etc.) */}
        <CmsDynamicContent content={pageContent} />
      </div>

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="image-merger" />
    </div>
  );
};
