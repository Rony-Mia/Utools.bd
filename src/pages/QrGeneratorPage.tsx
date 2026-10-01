import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  Type,
  Phone,
  Mail,
  Wifi,
  Upload,
  Trash2,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Sliders,
  Maximize,
  Layers,
  Palette
} from 'lucide-react';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/qr-generator.json';

type InputCategory = 'url' | 'text' | 'phone' | 'email' | 'wifi';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export const QrGeneratorPage: React.FC = () => {
  // Category state
  const [category, setCategory] = useState<InputCategory>('url');

  // Specific input states
  const [urlInput, setUrlInput] = useState<string>('https://utools.bd');
  const [textInput, setTextInput] = useState<string>('Utools.bd — সকল প্রাত্যহিক ডিজিটাল টুল এক ঠিকানায়');
  const [phoneInput, setPhoneInput] = useState<string>('+8801700000000');
  
  // Email fields
  const [emailTo, setEmailTo] = useState<string>('support@utools.bd');
  const [emailSubject, setEmailSubject] = useState<string>('জরুরি তথ্য ও সহায়তা');
  const [emailBody, setEmailBody] = useState<string>('আসসালামু আলাইকুম,\nআমার কিছু তথ্য জানার প্রয়োজন ছিল।');

  // WiFi fields
  const [wifiSsid, setWifiSsid] = useState<string>('Utools_HighSpeed_WiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('bangladesh2026');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // Customization controls
  const [fgColor, setFgColor] = useState<string>('#083f2a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrSize, setQrSize] = useState<number>(600);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('H');
  const [marginSize, setMarginSize] = useState<number>(2);

  // Logo overlay
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Compute final encoded string based on selected category
  const encodedValue = useMemo(() => {
    switch (category) {
      case 'url':
        return urlInput.trim() || 'https://utools.bd';
      case 'text':
        return textInput || ' ';
      case 'phone':
        return `tel:${phoneInput.trim()}`;
      case 'email': {
        const to = emailTo.trim();
        const sub = encodeURIComponent(emailSubject);
        const body = encodeURIComponent(emailBody);
        return `mailto:${to}?subject=${sub}&body=${body}`;
      }
      case 'wifi': {
        const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption;
        const pass = wifiEncryption === 'nopass' ? '' : wifiPassword;
        return `WIFI:T:${enc};S:${wifiSsid};P:${pass};H:${wifiHidden ? 'true' : 'false'};;`;
      }
      default:
        return 'https://utools.bd';
    }
  }, [
    category,
    urlInput,
    textInput,
    phoneInput,
    emailTo,
    emailSubject,
    emailBody,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden
  ]);

  // Debounced QR code generation on Canvas
  useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);

    const timer = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsGenerating(false);
        return;
      }

      try {
        // Render base QR code onto the canvas directly
        await QRCode.toCanvas(canvas, encodedValue, {
          width: qrSize,
          margin: marginSize,
          errorCorrectionLevel: logoSrc ? 'H' : errorLevel,
          color: {
            dark: fgColor,
            light: bgColor
          }
        });

        // CRITICAL FIX: QRCode.toCanvas sets `canvas.style.width = size + 'px'` directly
        // on the element inline style. When qrSize is 600, 1000, 1500, or 2000px, this blows out
        // the preview container across the screen. Reset inline styles so CSS preview sizing works.
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';

        // If logo is present, draw logo badge in the center
        if (logoSrc && !isCancelled) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (isCancelled) return;
              const logoDim = Math.floor(canvas.width * 0.22);
              const logoX = (canvas.width - logoDim) / 2;
              const logoY = (canvas.height - logoDim) / 2;
              const padding = Math.max(4, Math.floor(canvas.width * 0.012));

              // Draw clean white background badge for contrast
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(
                logoX - padding,
                logoY - padding,
                logoDim + padding * 2,
                logoDim + padding * 2
              );

              ctx.strokeStyle = fgColor;
              ctx.lineWidth = Math.max(2, Math.floor(canvas.width * 0.004));
              ctx.strokeRect(
                logoX - padding,
                logoY - padding,
                logoDim + padding * 2,
                logoDim + padding * 2
              );

              // Draw logo centered
              ctx.drawImage(img, logoX, logoY, logoDim, logoDim);

              // Keep style normalized
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              setIsGenerating(false);
            };
            img.src = logoSrc;
          } else {
            setIsGenerating(false);
          }
        } else {
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('QR code generation error:', err);
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
        setIsGenerating(false);
      }
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [encodedValue, qrSize, errorLevel, fgColor, bgColor, marginSize, logoSrc]);

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল আপলোড করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoSrc(event.target?.result as string);
      setLogoName(file.name);
      // Auto-elevate error correction to 'H' (30%) for logo scanning reliability
      setErrorLevel('H');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoSrc(null);
    setLogoName(null);
  };

  // Download PNG file
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `utools-bd-qrcode-${category}-${qrSize}px.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download SVG file (Scalable Vector Graphics for ultra-sharp printing)
  const handleDownloadSvg = async () => {
    try {
      let svgString = await QRCode.toString(encodedValue, {
        type: 'svg',
        width: qrSize,
        margin: marginSize,
        errorCorrectionLevel: logoSrc ? 'H' : errorLevel,
        color: {
          dark: fgColor,
          light: bgColor
        }
      });

      // If a logo is uploaded, embed it in the center of the SVG
      if (logoSrc) {
        const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
        if (viewBoxMatch) {
          const [, , vbWidth, vbHeight] = viewBoxMatch[1].split(' ').map(Number);
          const logoDim = vbWidth * 0.22;
          const logoX = (vbWidth - logoDim) / 2;
          const logoY = (vbHeight - logoDim) / 2;
          const padding = Math.max(0.5, vbWidth * 0.015);
          const badgeX = logoX - padding;
          const badgeY = logoY - padding;
          const badgeDim = logoDim + padding * 2;
          const strokeWidth = Math.max(0.2, vbWidth * 0.005);

          const logoSvgSnippet = `  <rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeDim.toFixed(2)}" height="${badgeDim.toFixed(2)}" fill="#ffffff" stroke="${fgColor}" stroke-width="${strokeWidth.toFixed(2)}" />\n  <image href="${logoSrc}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoDim.toFixed(2)}" height="${logoDim.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />\n</svg>`;
          svgString = svgString.replace(/<\/svg>\s*$/, logoSvgSnippet);
        }
      }

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `utools-bd-qrcode-${category}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('Failed to generate SVG:', err);
      alert('SVG তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে PNG ডাউনলোড করুন।');
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2500);
        } catch (clipErr) {
          console.warn('Clipboard write failed, fallback to data url', clipErr);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  // Preset color pairings
  const colorPresets = [
    { label: 'ক্লাসিক কালো', fg: '#000000', bg: '#ffffff' },
    { label: 'রয়্যাল গ্রিন', fg: '#083f2a', bg: '#ffffff' },
    { label: 'নেভি ব্লু', fg: '#1e3a8a', bg: '#ffffff' },
    { label: 'মেরুন লাল', fg: '#7f1d1d', bg: '#ffffff' },
    { label: 'চারকোল স্লেট', fg: '#334155', bg: '#ffffff' },
    { label: 'ওয়ার্ম ক্রিম', fg: '#083f2a', bg: '#f4efe4' }
  ];

  const faqs = pageContent.faqs || [];
  // Schema.org FAQ structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta name="description" content={pageContent.metaDescription} />
        <link rel="canonical" href="https://utools.bd/qr-generator" />
        <meta property="og:title" content={pageContent.metaTitle} />
        <meta property="og:description" content={pageContent.metaDescription} />
        <meta property="og:url" content="https://utools.bd/qr-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta name="twitter:description" content={pageContent.metaDescription} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Top Navigation & Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB]">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরুন</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1.5 shadow-xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>১০০% অন-ডিভাইস স্ট্যাটিক QR • আজীবন কার্যকর • নো ট্র্যাকিং</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs px-2.5 py-0.5 border border-[#0B5D3B]/20 font-medium">
            স্ট্যাটিক QR • নো এক্সপায়ারি
          </span>
          <span className="text-xs text-[#4A5A52]">PNG ও ভেক্টর SVG ডাউনলোড</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5A52] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Main Grid: Left Controls (Inputs & Customization), Right (Live Preview & Downloads) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Customization (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category Tabs */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 sm:p-5 space-y-4 rounded-2xl">
            <h2 className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider">
              ১. কিউআর কোডের ধরন নির্বাচন করুন
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setCategory('url')}
                className={`p-2.5 text-xs font-medium border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                  category === 'url'
                    ? 'border-[#084A2E] bg-[#F0F4F2] text-[#084A2E] font-bold shadow-xs'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52] hover:bg-[#F0F4F2]/50'
                }`}
              >
                <Globe className="w-4 h-4 text-[#0B5D3B]" />
                <span>ওয়েব লিংক</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('text')}
                className={`p-2.5 text-xs font-medium border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                  category === 'text'
                    ? 'border-[#084A2E] bg-[#F0F4F2] text-[#084A2E] font-bold shadow-xs'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52] hover:bg-[#F0F4F2]/50'
                }`}
              >
                <Type className="w-4 h-4 text-[#0B5D3B]" />
                <span>টেক্সট / বার্তা</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('phone')}
                className={`p-2.5 text-xs font-medium border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                  category === 'phone'
                    ? 'border-[#084A2E] bg-[#F0F4F2] text-[#084A2E] font-bold shadow-xs'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52] hover:bg-[#F0F4F2]/50'
                }`}
              >
                <Phone className="w-4 h-4 text-[#0B5D3B]" />
                <span>ফোন নম্বর</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('email')}
                className={`p-2.5 text-xs font-medium border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                  category === 'email'
                    ? 'border-[#084A2E] bg-[#F0F4F2] text-[#084A2E] font-bold shadow-xs'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52] hover:bg-[#F0F4F2]/50'
                }`}
              >
                <Mail className="w-4 h-4 text-[#0B5D3B]" />
                <span>ইমেইল বার্তা</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('wifi')}
                className={`p-2.5 text-xs font-medium border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                  category === 'wifi'
                    ? 'border-[#084A2E] bg-[#F0F4F2] text-[#084A2E] font-bold shadow-xs'
                    : 'border-[#D5E4DB] bg-[#FFFFFF] text-[#4A5A52] hover:bg-[#F0F4F2]/50'
                }`}
              >
                <Wifi className="w-4 h-4 text-[#0B5D3B]" />
                <span>ওয়াইফাই (WiFi)</span>
              </button>
            </div>

            {/* Input fields based on selected category */}
            <div className="pt-2 border-t border-[#D5E4DB]/60 space-y-3">
              {/* URL */}
              {category === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#084A2E] block">
                    ওয়েবসাইট বা পেজের URL লিংক:
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                  />
                  <p className="text-[11px] text-[#4A5A52]">
                    স্ক্যান করলে সরাসরি এই ওয়েবসাইটে রিডাইরেক্ট হবে।
                  </p>
                </div>
              )}

              {/* Text */}
              {category === 'text' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#084A2E] block">
                    প্লেইন টেক্সট বা বার্তা:
                  </label>
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="আপনার বার্তা বা নোট এখানে লিখুন..."
                    className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                  />
                  <p className="text-[11px] text-[#4A5A52]">
                    যেকোনো ডিভাইস দিয়ে স্ক্যান করলে স্ক্রিনে এই বার্তা ভেসে উঠবে।
                  </p>
                </div>
              )}

              {/* Phone */}
              {category === 'phone' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#084A2E] block">
                    মোবাইল বা টেলিফোন নম্বর:
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                  />
                  <p className="text-[11px] text-[#4A5A52]">
                    স্ক্যান করলে ফোনের ডায়ালারে এই নম্বরটি অটোমেটিক চলে আসবে।
                  </p>
                </div>
              )}

              {/* Email */}
              {category === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                      প্রাপকের ইমেইল এড্রেস:
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                      ইমেইলের বিষয় (Subject):
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="জরুরি যোগাযোগ"
                      className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                      বার্তা (Body):
                    </label>
                    <textarea
                      rows={3}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="বিস্তারিত বার্তা..."
                      className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* WiFi */}
              {category === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                      নেটওয়ার্কের নাম (SSID):
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHome_WiFi"
                      className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                        নিরাপত্তা পদ্ধতি (Encryption):
                      </label>
                      <select
                        value={wifiEncryption}
                        onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                        className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] rounded-lg"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (সাধারণ)</option>
                        <option value="WEP">WEP (পুরাতন)</option>
                        <option value="nopass">খোলা / নো পাসওয়ার্ড</option>
                      </select>
                    </div>

                    {wifiEncryption !== 'nopass' && (
                      <div>
                        <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                          ওয়াইফাই পাসওয়ার্ড:
                        </label>
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Password123"
                          className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 text-xs text-[#0F1F17] focus:border-[#0B5D3B] focus:outline-none font-mono rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <label className="flex items-center space-x-2 text-xs text-[#34443B] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded-md text-[#0B5D3B] border-[#D5E4DB]"
                    />
                    <span>লুকানো নেটওয়ার্ক (Hidden SSID)</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 sm:p-5 space-y-5 rounded-2xl">
            <h2 className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>২. ডিজাইন ও রঙ কাস্টমাইজেশন</span>
            </h2>

            {/* Color Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#084A2E] block">
                জনপ্রিয় কালার প্যালেট:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className="border border-[#D5E4DB] p-1.5 text-center bg-[#F8FAF9] hover:bg-[#F0F4F2] transition-colors cursor-pointer text-[11px] rounded-lg"
                  >
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: preset.fg }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: preset.bg }}
                      />
                    </div>
                    <span className="text-[#34443B] block truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D5E4DB]/60">
              <div className="flex items-center justify-between border border-[#D5E4DB] p-2 bg-[#F8FAF9] rounded-lg">
                <span className="text-xs font-semibold text-[#084A2E]">
                  কিউআর কোডের রঙ (Foreground):
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-[#4A5A52]">{fgColor}</span>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 border border-[#D5E4DB] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border border-[#D5E4DB] p-2 bg-[#F8FAF9] rounded-lg">
                <span className="text-xs font-semibold text-[#084A2E]">
                  ব্যাকগ্রাউন্ড রঙ (Background):
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-[#4A5A52]">{bgColor}</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 border border-[#D5E4DB] cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Resolution, Margin, and Error Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#D5E4DB]/60">
              <div>
                <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                  রেজোলিউশন / সাইজ:
                </label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] rounded-lg"
                >
                  <option value={300}>৩০০ × ৩০০ px (ওয়েব / মোবাইল)</option>
                  <option value={600}>৬০০ × ৬০০ px (স্ট্যান্ডার্ড)</option>
                  <option value={1000}>১০০০ × ১০০০ px (হাই প্রিন্টিং)</option>
                  <option value={1500}>১৫০০ × ১৫০০ px (ব্যানার ও ফ্লেক্স)</option>
                  <option value={2000}>২০০০ × ২০০০ px (আল্ট্রা এইচডি)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                  মার্জিন / প্যাডিং:
                </label>
                <select
                  value={marginSize}
                  onChange={(e) => setMarginSize(parseInt(e.target.value))}
                  className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] rounded-lg"
                >
                  <option value={1}>১ মডিউল (কম ফাঁকা)</option>
                  <option value={2}>২ মডিউল (স্ট্যান্ডার্ড)</option>
                  <option value={4}>৪ মডিউল (প্রশস্ত ফাঁকা)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#084A2E] block mb-1">
                  এরর কারেকশন লেভেল:
                </label>
                <select
                  value={errorLevel}
                  disabled={!!logoSrc}
                  onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                  className="w-full bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-1.5 text-xs text-[#0F1F17] disabled:opacity-75 rounded-lg"
                >
                  <option value="L">L — ৭% রিকভারি</option>
                  <option value="M">M — ১৫% রিকভারি</option>
                  <option value="Q">Q — ২৫% রিকভারি</option>
                  <option value="H">H — ৩০% রিকভারি (লোগোর জন্য সেরা)</option>
                </select>
                {logoSrc && (
                  <p className="text-[10px] text-[#0B5D3B] mt-1">
                    * লোগোর জন্য স্বয়ংক্রিয়ভাবে 'H' লেভেল সক্রিয়।
                  </p>
                )}
              </div>
            </div>

            {/* Logo Overlay Section */}
            <div className="pt-3 border-t border-[#D5E4DB]/60 space-y-2">
              <label className="text-xs font-semibold text-[#084A2E] block">
                মাঝখানে লোগো বা ছবি যুক্ত করুন (ঐচ্ছিক):
              </label>

              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {logoSrc ? (
                <div className="flex items-center justify-between border border-[#0B5D3B]/40 bg-[#F0F4F2] p-2.5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={logoSrc}
                      alt="Logo Preview"
                      width={32}
                      height={32}
                      loading="lazy"
                      className="w-8 h-8 object-contain border border-[#D5E4DB] bg-[#ffffff] p-0.5"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#084A2E]">
                        {logoName || 'লোগো ছবি সংযুক্ত'}
                      </p>
                      <p className="text-[11px] text-[#0B5D3B]">
                        মাঝখানে সুচারুভাবে বসানো হয়েছে
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs text-red-600 hover:text-red-800 p-1 flex items-center space-x-1 border border-red-200 bg-[#FFFFFF] px-2 py-1 cursor-pointer rounded-lg"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছে ফেলুন</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full border border-dashed border-[#D5E4DB] hover:border-[#0B5D3B] p-3 text-center bg-[#F8FAF9] hover:bg-[#F0F4F2] transition-colors cursor-pointer flex items-center justify-center space-x-2 text-xs text-[#084A2E] rounded-2xl"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>আপনার ব্র্যান্ড লোগো বা আইকন আপলোড করুন (PNG/JPG)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Action Buttons (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-5 sticky top-6 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#084A2E] font-serif uppercase tracking-wider">
                  লাইভ প্রিভিউ (Live Preview)
                </h2>
              </div>
              <span className="text-[11px] text-[#4A5A52] font-mono">
                {qrSize}×{qrSize} px
              </span>
            </div>

            {/* QR Canvas Display Frame */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F0F4F2]/50 border border-[#D5E4DB] relative overflow-hidden rounded-2xl">
              <div className="qr-canvas-preview p-3 bg-white shadow-xs border border-[#D5E4DB] w-full max-w-[280px] sm:max-w-[300px] aspect-square flex items-center justify-center overflow-hidden rounded-2xl">
                <canvas
                  ref={canvasRef}
                  className="!w-full !h-full !max-w-full !max-h-full block object-contain aspect-square"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>

              {isGenerating && (
                <div className="absolute inset-0 bg-[#FFFFFF]/80 backdrop-blur-[1px] flex items-center justify-center text-xs text-[#084A2E] font-medium z-10">
                  তৈরি হচ্ছে...
                </div>
              )}
            </div>

            {/* Encoded String Summary */}
            <div className="bg-[#F8FAF9] border border-[#D5E4DB] p-2.5 text-[11px] text-[#4A5A52] break-all font-mono rounded-lg">
              <span className="font-bold text-[#084A2E] block not-italic">
                এনকোড করা তথ্য:
              </span>
              <span className="line-clamp-2">{encodedValue}</span>
            </div>

            {/* Download Buttons Group */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="bg-[#0B5D3B] hover:bg-[#084A2E] text-[#FFFFFF] px-4 py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] px-4 py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG ভেক্টর</span>
                </button>
              </div>

              {/* Copy Image to Clipboard */}
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="w-full border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#084A2E] py-2 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer rounded-lg"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-700 font-semibold">ক্লিপবোর্ডে কপি সম্পন্ন!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>ক্লিপবোর্ডে ইমেজ কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic CMS Sections (FAQs, Features, Steps, Guidelines, Markdown, etc.) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="qr-generator" />
    </div>
  );
};
