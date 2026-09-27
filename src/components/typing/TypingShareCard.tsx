import React, { useRef, useState } from 'react';
import { TypingTestResult, getWpmRating } from '../../utils/typingTest.ts';
import { Download, Share2, MessageCircle, Check, Award, Sparkles } from 'lucide-react';

interface TypingShareCardProps {
  result: TypingTestResult;
}

export const TypingShareCard: React.FC<TypingShareCardProps> = ({ result }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const rating = getWpmRating(result.wpm, result.language);
  const formattedDate = new Date(result.date).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Download high-resolution PNG using html2canvas-pro
  const handleDownloadImage = async () => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);

    try {
      const html2canvasModule: any = await import('html2canvas-pro');
      const html2canvas = (html2canvasModule.default || html2canvasModule) as any;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B5D3B',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const dateStr = new Date(result.date).toISOString().split('T')[0];
      link.download = `utools-typing-result-${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('[TypingShareCard] Failed to export image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // WhatsApp share message
  const handleWhatsAppShare = () => {
    const text = `⚡ আমি Utools.bd-তে টাইপিং স্পিড টেস্ট দিয়েছি!\n\n🏆 Net WPM: ${result.wpm}\n🎯 নির্ভুলতা: ${result.accuracy}%\n🌐 ভাষা: ${result.language === 'bangla' ? 'বাংলা' : 'English'}\n\nআপনার টাইপিং গতি পরীক্ষা করুন: https://utools.bd/typing-test`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Web Share API with clipboard fallback
  const handleNativeShare = async () => {
    const shareData = {
      title: 'আমার টাইপিং স্পিড রেজাল্ট — Utools.bd',
      text: `আমি Utools.bd-তে ${result.wpm} WPM গতি ও ${result.accuracy}% নির্ভুলতা অর্জন করেছি!`,
      url: 'https://utools.bd/typing-test',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[TypingShareCard] Web Share failed, falling back:', err);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(
        `${shareData.text} আপনিও টেস্ট দিন: ${shareData.url}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#D5E4DB] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      <div className="border-b border-[#D5E4DB]/60 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F1F17] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#0B5D3B]" />
            <span>শেয়ারেবল রেজাল্ট কার্ড</span>
          </h3>
          <p className="text-xs text-[#4A5A52]">
            সোশ্যাল মিডিয়া ও বন্ধুদের সাথে শেয়ার করার জন্য সার্টিফিকেট কার্ড
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Card Visual Preview (Left/Top) */}
        <div className="md:col-span-6 flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-[340px] aspect-square rounded-3xl p-6 text-white bg-gradient-to-br from-[#0B5D3B] via-[#084A2E] to-[#042818] shadow-lg flex flex-col justify-between relative overflow-hidden border border-white/20 select-none"
          >
            {/* Decorative background shapes */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#F5A524]/10 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F5A524]" />
                <span className="text-[12px] font-bold tracking-wider uppercase text-white/90">
                  টাইপিং স্পিড টেস্ট
                </span>
              </div>
              <span className="text-[11px] text-white/70 font-mono font-bold tracking-tight">
                Utools.bd
              </span>
            </div>

            {/* Center: Prominent Net WPM & Accuracy */}
            <div className="relative z-10 text-center space-y-1.5 py-3">
              <div className="text-5xl font-extrabold font-mono text-[#FEF3D0] tracking-tight leading-none drop-shadow-xs">
                {result.wpm}
              </div>
              <p className="text-xs font-semibold tracking-widest uppercase text-white/80">
                Words Per Minute (Net WPM)
              </p>

              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/90 backdrop-blur-xs">
                <span>নির্ভুলতা: <strong>{result.accuracy}%</strong></span>
                <span>•</span>
                <span>ভুল: <strong>{result.uncorrectedErrors}</strong></span>
              </div>
            </div>

            {/* Footer with Metadata */}
            <div className="relative z-10 border-t border-white/15 pt-2.5 flex items-center justify-between text-[11px] text-white/75">
              <div>
                <span className="capitalize">{result.language === 'bangla' ? 'বাংলা' : 'English'}</span>
                <span className="mx-1">•</span>
                <span>{result.durationMode === 'custom' ? 'কাস্টম' : `${result.durationMode} সে.`}</span>
              </div>
              <span className="text-[10px] text-white/60 font-mono">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Right/Bottom) */}
        <div className="md:col-span-6 space-y-3">
          <p className="text-xs text-[#4A5A52] leading-relaxed">
            আপনার অর্জিত ফলাফলটি সোশ্যাল মিডিয়ায় শেয়ার করুন অথবা সরাসরি আপনার ডিভাইসে হাই-কোয়ালিটি ছবি হিসেবে সংরক্ষণ করুন।
          </p>

          <div className="space-y-2 pt-2">
            {/* Download Image */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-[#0B5D3B] hover:bg-[#084A2E] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'ছবি তৈরি হচ্ছে...' : 'কার্ড ইমেজ ডাউনলোড (PNG)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp Share */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Native Share / Copy */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2.5 px-3 bg-[#F0F4F2] hover:bg-[#E2ECE6] text-[#084A2E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#D5E4DB] cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#0B5D3B]" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
