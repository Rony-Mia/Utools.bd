import React from 'react';
import {
  ArrowLeftRight,
  Calculator,
  Calendar,
  Coins,
  Crop,
  FileText,
  Grid,
  GraduationCap,
  Images,
  Keyboard,
  LandPlot,
  Layers,
  QrCode,
  RotateCw,
  Scale,
  Scissors,
  Smartphone,
  Stamp,
  Trash2,
} from 'lucide-react';

export type ToolIconComponent = React.ComponentType<{ className?: string }>;

/** One icon per tool id (all 16 tools). */
const ICONS: Record<string, ToolIconComponent> = {
  'bijoy-converter': ArrowLeftRight,
  'typing-test': Keyboard,
  'photo-resizer': Crop,
  'bulk-photo-resizer': Images,
  'heic-converter': Smartphone,
  'image-merger': Grid,
  'qr-generator': QrCode,
  'age-calculator': Calculator,
  'amount-in-words': Coins,
  'bangla-date-converter': Calendar,
  'gpa-calculator': GraduationCap,
  'land-converter': LandPlot,
  'gold-weight-converter': Scale,
  'cv-builder': FileText,
  'pdf-merger': Layers,
  'pdf-split': Scissors,
  'pdf-delete-pages': Trash2,
  'pdf-rotate': RotateCw,
  'pdf-watermark-page-number': Stamp,
};

export function getToolIcon(toolId: string): ToolIconComponent {
  return ICONS[toolId] ?? FileText;
}

/** Look up by route (e.g. "/pdf-merger") — used by the navbar, which is keyed by path. */
export function getToolIconByLink(link: string): ToolIconComponent {
  const id = link.replace(/^\//, '');
  const alias: Record<string, string> = { converter: 'bijoy-converter' };
  return getToolIcon(alias[id] ?? id);
}
