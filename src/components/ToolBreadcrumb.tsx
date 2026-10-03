import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export interface ToolBreadcrumbProps {
  toolName: string;
  categoryName?: string;
  categoryPath?: string;
  privacyText?: string;
  className?: string;
}

export const ToolBreadcrumb: React.FC<ToolBreadcrumbProps> = ({
  toolName,
  categoryName,
  categoryPath,
  privacyText = '১০০% ক্লায়েন্ট-সাইড • কোনো ডেটা সার্ভারে যায় না',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D5E4DB] ${className}`}
    >
      <div className="flex items-center space-x-2 flex-wrap">
        <Link
          to="/"
          className="border border-[#D5E4DB] bg-[#FFFFFF] hover:bg-[#F0F4F2] px-3 py-1.5 text-xs text-[#084A2E] flex items-center space-x-1.5 transition-colors cursor-pointer rounded-lg font-medium shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>হোমে ফিরুন</span>
        </Link>
        {categoryName && (
          <>
            <span className="text-[#D5E4DB]">/</span>
            {categoryPath ? (
              <Link
                to={categoryPath}
                className="text-xs text-[#4A5A52] hover:text-[#0B5D3B] transition-colors"
              >
                {categoryName}
              </Link>
            ) : (
              <span className="text-xs text-[#4A5A52]">{categoryName}</span>
            )}
          </>
        )}
        <span className="text-[#D5E4DB]">/</span>
        <span className="text-xs font-semibold text-[#0F1F17]">{toolName}</span>
      </div>

      {privacyText && (
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3.5 py-1.5 shadow-2xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>{privacyText}</span>
        </div>
      )}
    </div>
  );
};
