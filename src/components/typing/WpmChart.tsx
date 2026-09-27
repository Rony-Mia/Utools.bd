import React, { useState, useId } from 'react';
import { WpmSample } from '../../utils/typingTest.ts';

interface WpmChartProps {
  timeline: WpmSample[];
  height?: number;
}

export const WpmChart: React.FC<WpmChartProps> = ({ timeline, height = 180 }) => {
  const chartId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-[#4A5A52] bg-[#F8FAF9] rounded-2xl border border-[#D5E4DB]">
        পর্যাপ্ত ডেটা পাওয়া যায়নি
      </div>
    );
  }

  // Find max WPM to scale Y axis (at least 40 as minimum upper bound for pleasant aspect ratio)
  const maxWpm = Math.max(40, ...timeline.map((s) => Math.max(s.wpm, s.rawWpm)));
  const yTicks = [0, Math.round(maxWpm * 0.33), Math.round(maxWpm * 0.66), maxWpm];

  const totalPoints = timeline.length;
  const paddingX = 40;
  const paddingY = 24;
  const viewBoxWidth = 600;
  const viewBoxHeight = height;

  const chartWidth = viewBoxWidth - paddingX * 2;
  const chartHeight = viewBoxHeight - paddingY * 2;

  // Coordinate mapping functions
  const getX = (index: number) => {
    if (totalPoints <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (totalPoints - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxWpm));
    return paddingY + chartHeight - (clamped / maxWpm) * chartHeight;
  };

  // Build SVG path strings
  const netWpmPoints = timeline.map((s, idx) => `${getX(idx)},${getY(s.wpm)}`).join(' ');
  const rawWpmPoints = timeline.map((s, idx) => `${getX(idx)},${getY(s.rawWpm)}`).join(' ');

  // Gradient area path for Net WPM
  const firstPoint = `${getX(0)},${getY(timeline[0].wpm)}`;
  const lastPoint = `${getX(totalPoints - 1)},${getY(timeline[totalPoints - 1].wpm)}`;
  const areaPath = `M ${firstPoint} L ${timeline
    .map((s, idx) => `${getX(idx)},${getY(s.wpm)}`)
    .join(' L ')} L ${getX(totalPoints - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`;

  const hoveredSample = hoveredIndex !== null ? timeline[hoveredIndex] : null;

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#D5E4DB] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header with Legend & Hover Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#0F1F17]">টাইপিং স্পিড ট্রেন্ড (WPM)</span>
          <div className="flex items-center gap-3 text-[11px] text-[#4A5A52]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#0B5D3B] rounded-full inline-block" />
              <span>Net WPM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded-full inline-block" />
              <span>Raw WPM</span>
            </span>
          </div>
        </div>

        {/* Hover info tooltip box */}
        {hoveredSample ? (
          <div className="text-[11px] font-mono text-[#0B5D3B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-lg border border-[#0B5D3B]/20">
            সেকেন্ড {hoveredSample.second}s • Net: <strong>{hoveredSample.wpm}</strong> • Raw: <strong>{hoveredSample.rawWpm}</strong> • নির্ভুলতা: <strong>{hoveredSample.accuracy}%</strong>
          </div>
        ) : (
          <span className="text-[10px] text-[#4A5A52]">
            বিন্দুগুলোর উপর মাউস বা টাচ করুন
          </span>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B5D3B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0B5D3B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines and Y-axis labels */}
          {yTicks.map((tickVal, idx) => {
            const yPos = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={viewBoxWidth - paddingX}
                  y2={yPos}
                  stroke="#E2ECE6"
                  strokeDasharray={idx === 0 ? undefined : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  fill="#71877B"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Area under Net WPM line */}
          <path d={areaPath} fill={`url(#grad-${chartId})`} />

          {/* Raw WPM line (Amber) */}
          <polyline
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            points={rawWpmPoints}
          />

          {/* Net WPM line (Utools Green) */}
          <polyline
            fill="none"
            stroke="#0B5D3B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={netWpmPoints}
          />

          {/* Interactive Data Points */}
          {timeline.map((sample, idx) => {
            const cx = getX(idx);
            const cy = getY(sample.wpm);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(idx)}
                className="cursor-pointer"
              >
                {/* Larger transparent hit area for mobile touch */}
                <circle cx={cx} cy={cy} r="10" fill="transparent" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? '5' : '3'}
                  fill={isHovered ? '#084A2E' : '#FFFFFF'}
                  stroke="#0B5D3B"
                  strokeWidth={isHovered ? '2.5' : '2'}
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
