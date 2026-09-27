import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Loader2,
  FileText,
  Trash2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { formatBytesBengali } from '../../lib/pdfUtils.ts';
import { toBanglaNum } from '../../utils/bnDigits.ts';

export interface SelectedPdfPreview {
  name: string;
  pageCount?: number;
  sizeBytes: number;
}

export interface PdfFileDropzoneProps {
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: SelectedPdfPreview[];
  onRemoveFile?: (index: number) => void;
  onClearAll?: () => void;
  isLoading?: boolean;
  loadingText?: string;
  errorMessage?: string | null;
  title?: string;
  subtitle?: string;
}

export const PdfFileDropzone: React.FC<PdfFileDropzoneProps> = ({
  multiple = false,
  onFilesSelected,
  selectedFiles = [],
  onRemoveFile,
  onClearAll,
  isLoading = false,
  loadingText = 'ফাইল লোড ও পেজ বিশ্লেষণ হচ্ছে...',
  errorMessage = null,
  title = multiple
    ? 'পিডিএফ ফাইল নির্বাচন করুন বা এখানে টেনে এনে ছেড়ে দিন'
    : 'পিডিএফ ফাইল নির্বাচন করুন বা এখানে ড্রপ করুন',
  subtitle = multiple
    ? 'একসাথে একাধিক .pdf ফাইল নির্বাচন করতে পারেন'
    : 'শুধুমাত্র .pdf ফাইল সমর্থিত • ১০০% ক্লায়েন্ট-সাইড ও নিরাপদ',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed p-6 sm:p-9 text-center transition-all cursor-pointer select-none  rounded-2xl ${
          isDraggingOver
            ? 'border-[#0B5D3B] bg-[#0B5D3B]/5 scale-[0.995]'
            : 'border-[#D5E4DB] hover:border-[#0B5D3B] bg-[#F0F4F2]/30 hover:bg-[#F0F4F2]/60'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-13 h-13 mx-auto bg-[#F0F4F2] border border-[#D5E4DB] flex items-center justify-center text-[#0B5D3B] rounded-lg">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#0B5D3B]" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
              {isLoading ? loadingText : title}
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5A52]">{subtitle}</p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px] font-medium text-[#084A2E]">
            <span className="bg-[#FFFFFF] border border-[#D5E4DB] px-2.5 py-1">
              ✓ কোনো আপলোড নেই
            </span>
            <span className="bg-[#FFFFFF] border border-[#D5E4DB] px-2.5 py-1">
              ✓ ব্রাউজারে দ্রুত প্রসেসিং
            </span>
            <span className="bg-[#FFFFFF] border border-[#D5E4DB] px-2.5 py-1">
              ✓ ১০০% সুরক্ষিত ও ফ্রি
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-800 flex items-start space-x-3 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-red-900">ফাইল প্রক্রিয়াকরণে সতর্কতা:</div>
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Selected File(s) Summary Display */}
      {selectedFiles.length > 0 && (
        <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-4 space-y-3 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5E4DB] pb-2 text-xs">
            <span className="font-bold text-[#084A2E] font-serif">
              নির্বাচিত ফাইল ({toBanglaNum(selectedFiles.length)}টি)
            </span>
            <div className="flex items-center space-x-2">
              {multiple && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 text-[#084A2E] font-medium flex items-center space-x-1 cursor-pointer rounded-lg"
                >
                  <Plus className="w-3 h-3 text-[#0B5D3B]" />
                  <span>আরও ফাইল যোগ করুন</span>
                </button>
              )}
              {onClearAll && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                  }}
                  className="px-2.5 py-1 border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 font-medium flex items-center space-x-1 cursor-pointer rounded-lg"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                  <span>মুছে ফেলুন</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between gap-3 p-2.5 border border-[#D5E4DB] bg-[#F0F4F2]/30 text-xs rounded-lg"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center shrink-0 border border-[#0B5D3B]/20 rounded-lg">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#0F1F17] truncate">{file.name}</div>
                    <div className="text-[11px] text-[#4A5A52] font-mono flex items-center space-x-2 mt-0.5">
                      {file.pageCount !== undefined && (
                        <>
                          <span className="text-[#0B5D3B] font-semibold">
                            {toBanglaNum(file.pageCount)}টি পেজ
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatBytesBengali(file.sizeBytes)}</span>
                    </div>
                  </div>
                </div>

                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    title="বাদ দিন"
                    className="p-1 text-[#c8342a] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
