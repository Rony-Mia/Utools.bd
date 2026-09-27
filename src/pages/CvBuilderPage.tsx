import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Printer,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  Languages,
  Users,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  Loader2,
  ExternalLink,
  Scissors,
  Layers,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CvData, CvLanguage, CvSectionId } from '../types.ts';
import { SAMPLE_CV_DATA_BN, EMPTY_CV_DATA } from '../data/cvDefaults.ts';
import { ClassicTemplate } from '../components/cv-templates/ClassicTemplate.tsx';
import { ModernTemplate } from '../components/cv-templates/ModernTemplate.tsx';
import { CompactTemplate } from '../components/cv-templates/CompactTemplate.tsx';
import { GovtStandardTemplate } from '../components/cv-templates/GovtStandardTemplate.tsx';
import { CreativeTemplate } from '../components/cv-templates/CreativeTemplate.tsx';
import { EducationItemEditor } from '../components/cv/EducationItemEditor.tsx';
import { RelatedTools } from '../components/RelatedTools.tsx';
import pageContent from '../../content/pages/cv-builder.json';

type TemplateId = 'classic' | 'modern' | 'compact' | 'govt' | 'creative';

interface TemplateOption {
  id: TemplateId;
  name: string;
  nameEn: string;
  desc: string;
  tag: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'classic',
    name: 'ক্লাসিক (সরকারি জব)',
    nameEn: 'Classic Format',
    desc: 'প্রথাগত ফরমাল ফরম্যাট, ছবি কোণে',
    tag: 'জনপ্রিয়',
  },
  {
    id: 'modern',
    name: 'মডার্ন (২ কলাম)',
    nameEn: 'Modern 2-Column',
    desc: 'বেসরকারি ও কর্পোরেট পদের জন্য',
    tag: 'কর্পোরেট',
  },
  {
    id: 'compact',
    name: 'কমপ্যাক্ট (১ পাতা)',
    nameEn: 'Compact Single Page',
    desc: 'ফ্রেশারদের জন্য এক পাতায় সাজানো',
    tag: 'ফ্রেশার',
  },
  {
    id: 'govt',
    name: 'সরকারি জীবনবৃত্তান্ত',
    nameEn: 'Govt Standard Bio-Data',
    desc: '১, ২, ৩ ক্রমিক নং ছক ফরম্যাট',
    tag: 'সরকারি আবেদন',
  },
  {
    id: 'creative',
    name: 'ক্রিয়েটিভ ডিজাইন',
    nameEn: 'Creative Accent',
    desc: 'কালার হেডার ও স্টাইলিশ ফন্ট',
    tag: 'প্রাইভেট/আইটি',
  },
];

// True A4 pixel dimensions at standard 96 DPI: 210mm x 297mm
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
// Usable content height per A4 page before splitting to next sheet
const A4_USABLE_PAGE_HEIGHT = 1010;

const ALL_SECTIONS: CvSectionId[] = [
  'header',
  'objective',
  'education',
  'experience',
  'skills',
  'personalDetails',
  'languages',
  'references',
  'declaration',
];

const SECTION_METADATA: Record<
  CvSectionId,
  { labelBn: string; labelEn: string; defaultHeight: number }
> = {
  header: { labelBn: 'নাম, ছবি ও যোগাযোগ', labelEn: 'Header & Contact', defaultHeight: 220 },
  objective: { labelBn: 'ক্যারিয়ার উদ্দেশ্য', labelEn: 'Career Objective', defaultHeight: 100 },
  education: { labelBn: 'শিক্ষাগত যোগ্যতা', labelEn: 'Education', defaultHeight: 180 },
  experience: { labelBn: 'কর্ম অভিজ্ঞতা', labelEn: 'Work Experience', defaultHeight: 220 },
  skills: { labelBn: 'দক্ষতা ও পারদর্শিতা', labelEn: 'Skills', defaultHeight: 90 },
  personalDetails: { labelBn: 'ব্যক্তিগত তথ্যাবলি (বায়োডাটা)', labelEn: 'Personal Details', defaultHeight: 180 },
  languages: { labelBn: 'ভাষাগত দক্ষতা', labelEn: 'Languages', defaultHeight: 70 },
  references: { labelBn: 'রেফারেন্স / সুপারিশকারী', labelEn: 'References', defaultHeight: 110 },
  declaration: { labelBn: 'প্রার্থীর স্বাক্ষর ও তারিখ', labelEn: 'Signature & Date', defaultHeight: 110 },
};

function toBanglaNum(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

const LOCAL_STORAGE_KEY = 'utools_cv_builder_data_v1';
const LOCAL_STORAGE_LANG_KEY = 'utools_cv_builder_lang_v1';
const LOCAL_STORAGE_TEMPLATE_KEY = 'utools_cv_builder_template_v1';
const LOCAL_STORAGE_BREAKS_KEY = 'utools_cv_builder_breaks_v1';

export const CvBuilderPage: React.FC = () => {
  const [cvData, setCvData] = useState<CvData>(SAMPLE_CV_DATA_BN);
  const [language, setLanguage] = useState<CvLanguage>('bn');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [activeFormTab, setActiveFormTab] = useState<
    'personal' | 'education' | 'experience' | 'skills' | 'references' | 'pageBreak'
  >('personal');
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Auto and Manual Page Break States
  const [autoPageBreakEnabled, setAutoPageBreakEnabled] = useState<boolean>(true);
  const [manualPageBreaks, setManualPageBreaks] = useState<Record<string, boolean>>({});
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});
  const [currentPreviewPage, setCurrentPreviewPage] = useState<number>(0);

  // A4 Preview Sizing & Multi-page Pagination references
  const previewDeskRef = useRef<HTMLDivElement | null>(null);
  const cvPrintAreaRef = useRef<HTMLDivElement | null>(null);
  const measureBoxRef = useRef<HTMLDivElement | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved state on mount (Client-side only)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        setCvData(JSON.parse(savedData));
      }
      const savedLang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
      if (savedLang === 'bn' || savedLang === 'en') {
        setLanguage(savedLang);
      }
      const savedTpl = localStorage.getItem(LOCAL_STORAGE_TEMPLATE_KEY);
      if (savedTpl && TEMPLATES.some((t) => t.id === savedTpl)) {
        setSelectedTemplate(savedTpl as TemplateId);
      }
      const savedBreaks = localStorage.getItem(LOCAL_STORAGE_BREAKS_KEY);
      if (savedBreaks) {
        setManualPageBreaks(JSON.parse(savedBreaks));
      }
    } catch {
      // ignore localStorage parse error
    }
  }, []);

  // Auto-save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, language);
      localStorage.setItem(LOCAL_STORAGE_TEMPLATE_KEY, selectedTemplate);
      localStorage.setItem(LOCAL_STORAGE_BREAKS_KEY, JSON.stringify(manualPageBreaks));
      setIsSaved(true);
      const timer = setTimeout(() => setIsSaved(false), 2000);
      return () => clearTimeout(timer);
    } catch {
      // ignore quota error
    }
  }, [cvData, language, selectedTemplate, manualPageBreaks]);

  // Responsive desk scale measurement
  const updateDimensions = useCallback(() => {
    if (previewDeskRef.current) {
      const computed = window.getComputedStyle(previewDeskRef.current);
      const paddingLeft = parseFloat(computed.paddingLeft) || 0;
      const paddingRight = parseFloat(computed.paddingRight) || 0;
      const availableWidth = previewDeskRef.current.clientWidth - paddingLeft - paddingRight;

      if (availableWidth > 0) {
        const factor = Math.min(1, availableWidth / A4_WIDTH_PX);
        setScaleFactor(factor);
      }
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    const deskEl = previewDeskRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      if (deskEl) resizeObserver.observe(deskEl);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions, selectedTemplate, language, mobileView]);

  // Measure actual DOM heights from hidden measurement container
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!measureBoxRef.current) return;
      const nodes = measureBoxRef.current.querySelectorAll<HTMLElement>('[data-cv-section]');
      const nextHeights: Record<string, number> = {};
      nodes.forEach((n) => {
        const sec = n.getAttribute('data-cv-section');
        if (sec) {
          nextHeights[sec] = n.offsetHeight;
        }
      });
      if (Object.keys(nextHeights).length > 0) {
        setMeasuredHeights(nextHeights);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [cvData, selectedTemplate, language]);

  // Toggle manual page break for a given section
  const toggleManualPageBreak = (sectionId: CvSectionId) => {
    setManualPageBreaks((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      const isNowForced = next[sectionId];
      setToastMessage(
        isNowForced
          ? `"${SECTION_METADATA[sectionId]?.labelBn || sectionId}" সেকশনটি নতুন পাতায় স্থানান্তরিত হয়েছে।`
          : `"${SECTION_METADATA[sectionId]?.labelBn || sectionId}" সেকশনটি পূর্বের নিয়মে ফিরে এসেছে।`
      );
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  // Determine which sections exist in current cvData
  const activeSections: CvSectionId[] = ALL_SECTIONS.filter((sec) => {
    if (sec === 'header') return true;
    if (sec === 'objective') return Boolean(cvData.personalInfo.careerObjective);
    if (sec === 'education') return cvData.education.length > 0;
    if (sec === 'experience') return cvData.experience.length > 0;
    if (sec === 'skills') return cvData.skills.length > 0;
    if (sec === 'personalDetails') return true;
    if (sec === 'languages') return cvData.languages.length > 0;
    if (sec === 'references') return cvData.references.length > 0;
    if (sec === 'declaration') return true;
    return true;
  });

  // Calculate pages: Group sections into A4 sheets
  const pages: CvSectionId[][] = React.useMemo(() => {
    const result: CvSectionId[][] = [[]];
    let currentHeight = 0;

    for (const sec of activeSections) {
      // Estimate dynamic height fallback if DOM height is not yet available
      let estimatedH = measuredHeights[sec] || SECTION_METADATA[sec]?.defaultHeight || 150;
      if (!measuredHeights[sec]) {
        if (sec === 'objective' && cvData.personalInfo.careerObjective) {
          estimatedH = 80 + Math.ceil(cvData.personalInfo.careerObjective.length / 65) * 16;
        } else if (sec === 'education') {
          estimatedH = 65 + cvData.education.length * 42;
        } else if (sec === 'experience') {
          estimatedH =
            55 +
            cvData.experience.reduce(
              (acc, exp) => acc + 65 + Math.ceil((exp.responsibilities?.length || 0) / 60) * 16,
              0
            );
        } else if (sec === 'skills') {
          estimatedH = 55 + Math.ceil(cvData.skills.length / 4) * 28;
        } else if (sec === 'languages') {
          estimatedH = 45 + cvData.languages.length * 26;
        } else if (sec === 'references') {
          estimatedH = 60 + Math.ceil(cvData.references.length / 2) * 55;
        }
      }

      const isManualBreak = manualPageBreaks[sec] === true;
      const currentPage = result[result.length - 1];

      // If this is NOT the first section on Page 1, check if we should break
      const shouldBreak =
        currentPage.length > 0 &&
        (isManualBreak || (autoPageBreakEnabled && currentHeight + estimatedH > A4_USABLE_PAGE_HEIGHT));

      if (shouldBreak) {
        result.push([sec]);
        currentHeight = estimatedH;
      } else {
        currentPage.push(sec);
        currentHeight += estimatedH;
      }
    }

    return result;
  }, [activeSections, measuredHeights, manualPageBreaks, autoPageBreakEnabled, cvData]);

  const totalPages = pages.length;
  const safePageIndex = Math.min(currentPreviewPage, Math.max(0, totalPages - 1));

  // Handlers for Personal Info
  const updatePersonalInfo = (field: keyof CvData['personalInfo'], value: string) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  // Image Upload with Client-Side Canvas Resizer
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updatePersonalInfo('photoUrl', dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    updatePersonalInfo('photoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Education items dynamic management
  const addEducation = () => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          degree: '',
          institution: '',
          passingYear: '',
          result: '',
          boardOrMajor: '',
        },
      ],
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof CvData['education'][0],
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // Experience items dynamic management
  const addExperience = () => {
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          designation: '',
          company: '',
          duration: '',
          responsibilities: '',
        },
      ],
    }));
  };

  const updateExperience = (
    id: string,
    field: keyof CvData['experience'][0],
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  // Skills management
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!cvData.skills.includes(trimmed)) {
      setCvData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
    }
    setNewSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Languages management
  const addLanguage = () => {
    setCvData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          id: `lang-${Date.now()}`,
          name: '',
          proficiency: '',
        },
      ],
    }));
  };

  const updateLanguage = (
    id: string,
    field: keyof CvData['languages'][0],
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeLanguage = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.filter((item) => item.id !== id),
    }));
  };

  // References management
  const addReference = () => {
    setCvData((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        {
          id: `ref-${Date.now()}`,
          name: '',
          designation: '',
          organization: '',
          phone: '',
          email: '',
        },
      ],
    }));
  };

  const updateReference = (
    id: string,
    field: keyof CvData['references'][0],
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      references: prev.references.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeReference = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      references: prev.references.filter((item) => item.id !== id),
    }));
  };

  // Sample data & reset handlers
  const handleLoadSample = () => {
    setCvData(SAMPLE_CV_DATA_BN);
    setManualPageBreaks({});
    setToastMessage('নমুনা ডেটা সফলভাবে লোড করা হয়েছে');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenResetModal = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = () => {
    setCvData(EMPTY_CV_DATA);
    setManualPageBreaks({});
    setNewSkillInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(EMPTY_CV_DATA));
      localStorage.setItem(LOCAL_STORAGE_BREAKS_KEY, JSON.stringify({}));
    } catch {
      // ignore
    }
    setIsResetModalOpen(false);
    setActiveFormTab('personal');
    setToastMessage('ফর্মের সকল তথ্য সফলভাবে মুছে ফেলা হয়েছে');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Print Action - Opens the real browser print preview / printer dialog
  const handlePrint = () => {
    if (isPrinting || isGeneratingPdf) return;

    // Switch to preview view on mobile
    if (mobileView === 'form') {
      setMobileView('preview');
    }

    setIsPrinting(true);
    setToastMessage('প্রিন্ট ডায়ালগ প্রস্তুত হচ্ছে...');

    try {
      const exportContainer = document.getElementById('cv-clean-export-container');
      const printArea = document.getElementById('cv-print-area');
      const contentToPrint = exportContainer?.innerHTML || printArea?.innerHTML;

      if (!contentToPrint) {
        window.print();
        setIsPrinting(false);
        return;
      }

      // Create an isolated hidden iframe to print cleanly without UI components
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        setIsPrinting(false);
        return;
      }

      // Grab existing stylesheets & inline styles
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((el) => el.outerHTML)
        .join('\n');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${cvData.personalInfo.fullName || 'Curriculum_Vitae'} - Print</title>
            <meta charset="utf-8" />
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif;
              }
              .page-screen-badge {
                display: none !important;
              }
              .cv-clean-export-page, .cv-physical-page {
                width: 210mm !important;
                min-height: 297mm !important;
                height: 297mm !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                page-break-after: always !important;
                break-after: page !important;
              }
              .cv-clean-export-page:last-child, .cv-physical-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
            </style>
          </head>
          <body>
            ${contentToPrint}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setIsPrinting(false);
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 500);
    } catch (err) {
      console.warn('Iframe print error, falling back to window.print', err);
      window.print();
      setIsPrinting(false);
    }
  };

  // Direct A4 PDF download using html2canvas-pro and jspdf from clean staging container
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf || isPrinting) return;

    if (mobileView === 'form') {
      setMobileView('preview');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const exportContainer = document.getElementById('cv-clean-export-container');
    const exportPages = exportContainer?.querySelectorAll<HTMLElement>('.cv-clean-export-page');

    if (!exportContainer || !exportPages || exportPages.length === 0) {
      setToastMessage('সিভি প্রিভিউ পাওয়া যায়নি। দয়া করে আবার চেষ্টা করুন।');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsGeneratingPdf(true);
    setToastMessage(`A4 PDF তৈরি হচ্ছে (${exportPages.length} পৃষ্ঠা)... অনুগ্রহ করে অপেক্ষা করুন`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvasModule: any = await import('html2canvas-pro');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const { jsPDF } = await import('jspdf');

      const rawName = cvData.personalInfo.fullName?.trim() || 'Curriculum_Vitae';
      const safeName = rawName.replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_');
      const filename = `CV_${safeName}.pdf`;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      // Position clean export container temporarily at top-left behind page to avoid html2canvas negative offset clipping
      exportContainer.style.left = '0px';
      exportContainer.style.top = '0px';
      exportContainer.style.opacity = '1';
      exportContainer.style.zIndex = '-9999';

      try {
        for (let i = 0; i < exportPages.length; i++) {
          const pageEl = exportPages[i];

          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            windowWidth: A4_WIDTH_PX,
            windowHeight: A4_HEIGHT_PX,
          });

          const pageImgData = canvas.toDataURL('image/jpeg', 0.98);

          if (i > 0) {
            pdf.addPage([pdfWidth, pdfHeight], 'portrait');
          }

          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }

        pdf.save(filename);
        setToastMessage(`A4 PDF ডাউনলোড সম্পন্ন হয়েছে (${exportPages.length} পৃষ্ঠা)`);
        setTimeout(() => setToastMessage(null), 3500);
      } finally {
        // Return export container to hidden staging
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0px';
        exportContainer.style.opacity = '0';
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setToastMessage('PDF তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Render chosen template for a specific page with assigned sections
  const renderTemplateForPage = (
    sections: CvSectionId[],
    pageNumber: number,
    totalPagesCount: number
  ) => {
    switch (selectedTemplate) {
      case 'modern':
        return (
          <ModernTemplate
            data={cvData}
            language={language}
            sections={sections}
            pageNumber={pageNumber}
            totalPages={totalPagesCount}
          />
        );
      case 'compact':
        return (
          <CompactTemplate
            data={cvData}
            language={language}
            sections={sections}
            pageNumber={pageNumber}
            totalPages={totalPagesCount}
          />
        );
      case 'govt':
        return (
          <GovtStandardTemplate
            data={cvData}
            language={language}
            sections={sections}
            pageNumber={pageNumber}
            totalPages={totalPagesCount}
          />
        );
      case 'creative':
        return (
          <CreativeTemplate
            data={cvData}
            language={language}
            sections={sections}
            pageNumber={pageNumber}
            totalPages={totalPagesCount}
          />
        );
      case 'classic':
      default:
        return (
          <ClassicTemplate
            data={cvData}
            language={language}
            sections={sections}
            pageNumber={pageNumber}
            totalPages={totalPagesCount}
          />
        );
    }
  };

  const faqs = pageContent.faqs || [];

  return (
    <>
      <Helmet>
        <title>{pageContent.metaTitle}</title>
        <meta name="description" content={pageContent.metaDescription} />
        <link rel="canonical" href="https://utools.bd/cv-builder" />
        <meta property="og:title" content={pageContent.metaTitle} />
        <meta property="og:description" content={pageContent.metaDescription} />
        <meta property="og:url" content="https://utools.bd/cv-builder" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://utools.bd/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageContent.metaTitle} />
        <meta name="twitter:description" content={pageContent.metaDescription} />
        <meta name="twitter:image" content="https://utools.bd/og-image.png" />
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      </Helmet>

      {/* Hidden container for accurate DOM section measurement */}
      <div
        ref={measureBoxRef}
        id="cv-measure-box"
        className="absolute left-[-9999px] top-[-9999px] pointer-events-none opacity-0"
        style={{ width: `${A4_WIDTH_PX}px` }}
        aria-hidden="true"
      >
        {renderTemplateForPage(ALL_SECTIONS, 1, 1)}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Header: Title, Actions & Language toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[#D5E4DB] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#0B5D3B] text-white">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#084A2E]">
                সিভি ও জীবনবৃত্তান্ত মেকার
              </h1>
              <span className="text-[11px] px-2 py-0.5 bg-[#E6F4EC] text-[#084A2E] font-semibold border border-[#D5E4DB]">
                CV Builder
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5A52] mt-1">
              বাংলাদেশি সরকারি ও কর্পোরেট চাকরির উপযোগী প্রফেশনাল সিভি তৈরি করুন। ওয়ার্ডের মতো স্বয়ংক্রিয় পেজ ফ্লো ও মাল্টি-পেজ প্রিভিউ সহ।
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <div className="flex items-center border border-[#D5E4DB] bg-[#FFFFFF] p-0.5 text-xs font-medium rounded-lg">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  language === 'bn'
                    ? 'bg-[#0B5D3B] text-[#FFFFFF] font-semibold'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#0B5D3B] text-[#FFFFFF] font-semibold'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                English
              </button>
            </div>

            {/* Load Sample Data */}
            <button
              type="button"
              onClick={handleLoadSample}
              title="নমুনা ডেটা দিয়ে ফর্ম পূরণ করুন"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs font-medium text-[#084A2E] hover:bg-[#E6F4EC] transition-colors cursor-pointer rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>নমুনা ডেটা</span>
            </button>

            {/* Reset Form */}
            <button
              type="button"
              onClick={handleOpenResetModal}
              title="ফর্মের সকল তথ্য মুছে ফেলুন"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs font-medium text-[#c8342a] hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            {/* PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isPrinting}
              title="সরাসরি A4 PDF ফাইল ডাউনলোড করুন"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B5D3B] text-[#FFFFFF] text-xs sm:text-sm font-semibold hover:bg-[#084A2E] transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>

            {/* Print Button - triggers browser print dialog */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || isGeneratingPdf}
              title="প্রিন্ট প্রিভিউ ও প্রিন্টার ডায়ালগ খুলুন"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#0B5D3B] bg-[#FFFFFF] text-xs sm:text-sm font-semibold text-[#0B5D3B] hover:bg-[#e8f5e9] transition-colors cursor-pointer disabled:opacity-60 rounded-lg"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0B5D3B]" />
              ) : (
                <Printer className="w-4 h-4 text-[#0B5D3B]" />
              )}
              <span>{isPrinting ? 'প্রিন্ট হচ্ছে...' : 'প্রিন্ট'}</span>
            </button>

            {/* Open in New Tab */}
            <a
              href="/cv-builder"
              target="_blank"
              rel="noopener noreferrer"
              title="ব্রাউজারে নতুন ট্যাবে খুলুন"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 border border-[#D5E4DB] bg-[#FFFFFF] text-xs text-[#4A5A52] hover:text-[#084A2E] hover:bg-[#F0F4F2] transition-colors rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>নতুন ট্যাব</span>
            </a>
          </div>
        </div>

        {/* Template Selector Thumbnails */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#084A2E]">
              টেমপ্লেট নির্বাচন করুন ({TEMPLATES.length} টি স্টাইল):
            </span>
            {isSaved && (
              <span className="text-xs text-[#0B5D3B] flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>অটো-সেভ হয়েছে</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3 text-left border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#0B5D3B] bg-[#FFFFFF] ring-2 ring-[#0B5D3B]/20 shadow-xs'
                      : 'border-[#D5E4DB] bg-[#F8FAF9] hover:border-[#0B5D3B]/50 hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-xs ${
                        isSelected
                          ? 'bg-[#0B5D3B] text-white'
                          : 'bg-[#E6F4EC] text-[#084A2E]'
                      }`}
                    >
                      {tpl.tag}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#0B5D3B]" />
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-[#084A2E] leading-tight">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] text-[#4A5A52] mt-1 line-clamp-2">
                    {tpl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View Switcher (Form / Preview) */}
        <div className="flex lg:hidden mb-4 border border-[#D5E4DB] bg-[#FFFFFF] p-1 text-xs font-semibold rounded-lg">
          <button
            type="button"
            onClick={() => setMobileView('form')}
            className={`flex-1 py-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileView === 'form'
                ? 'bg-[#0B5D3B] text-white'
                : 'text-[#4A5A52] hover:text-[#084A2E]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>ফর্ম এডিটর</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileView === 'preview'
                ? 'bg-[#0B5D3B] text-white'
                : 'text-[#4A5A52] hover:text-[#084A2E]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>A4 প্রিভিউ ({language === 'bn' ? toBanglaNum(totalPages) : totalPages} পাতা)</span>
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor (5 cols on large screen) */}
          <div
            className={`lg:col-span-5 ${
              mobileView === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Form Navigation Tabs */}
            <div className="flex flex-wrap border-b border-[#D5E4DB] bg-[#F0F4F2] text-xs">
              <button
                type="button"
                onClick={() => setActiveFormTab('personal')}
                className={`px-3 py-2.5 font-semibold flex items-center gap-1.5 border-r border-[#D5E4DB] transition-colors cursor-pointer ${
                  activeFormTab === 'personal'
                    ? 'bg-[#FFFFFF] text-[#0B5D3B] border-b-2 border-b-[#0B5D3B] -mb-px'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ব্যক্তিগত তথ্য</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('education')}
                className={`px-3 py-2.5 font-semibold flex items-center gap-1.5 border-r border-[#D5E4DB] transition-colors cursor-pointer ${
                  activeFormTab === 'education'
                    ? 'bg-[#FFFFFF] text-[#0B5D3B] border-b-2 border-b-[#0B5D3B] -mb-px'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>শিক্ষা ({cvData.education.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('experience')}
                className={`px-3 py-2.5 font-semibold flex items-center gap-1.5 border-r border-[#D5E4DB] transition-colors cursor-pointer ${
                  activeFormTab === 'experience'
                    ? 'bg-[#FFFFFF] text-[#0B5D3B] border-b-2 border-b-[#0B5D3B] -mb-px'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>অভিজ্ঞতা ({cvData.experience.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('skills')}
                className={`px-3 py-2.5 font-semibold flex items-center gap-1.5 border-r border-[#D5E4DB] transition-colors cursor-pointer ${
                  activeFormTab === 'skills'
                    ? 'bg-[#FFFFFF] text-[#0B5D3B] border-b-2 border-b-[#0B5D3B] -mb-px'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>দক্ষতা ও ভাষা</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('references')}
                className={`px-3 py-2.5 font-semibold flex items-center gap-1.5 border-r border-[#D5E4DB] transition-colors cursor-pointer ${
                  activeFormTab === 'references'
                    ? 'bg-[#FFFFFF] text-[#0B5D3B] border-b-2 border-b-[#0B5D3B] -mb-px'
                    : 'text-[#4A5A52] hover:text-[#084A2E]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>রেফারেন্স</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('pageBreak')}
                className={`px-3 py-2.5 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeFormTab === 'pageBreak'
                    ? 'bg-[#FFFFFF] text-[#c8342a] border-b-2 border-b-[#c8342a] -mb-px'
                    : 'text-[#c8342a] hover:bg-[#fae8e7]'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>পেজ ব্রেক ({totalPages} পাতা)</span>
              </button>
            </div>

            {/* Form Fields Container */}
            <div className="p-4 sm:p-5 border-x border-b border-[#D5E4DB] bg-[#FFFFFF] space-y-4">
              {/* TAB 1: Personal Info */}
              {activeFormTab === 'personal' && (
                <div className="space-y-4 text-xs">
                  {/* Photo Upload Box */}
                  <div className="p-3 bg-[#F8FAF9] border border-[#D5E4DB] flex flex-col sm:flex-row items-center gap-4 rounded-2xl">
                    <div className="w-20 h-24 sm:w-22 sm:h-26 border-2 border-dashed border-[#0B5D3B]/40 bg-white flex items-center justify-center shrink-0 overflow-hidden relative rounded-lg">
                      {cvData.personalInfo.photoUrl ? (
                        <img
                          src={cvData.personalInfo.photoUrl}
                          alt="Uploaded"
                          width={88}
                          height={104}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-1 text-[#4A5A52]">
                          <User className="w-8 h-8 mx-auto stroke-[1.2] text-[#0B5D3B]" />
                          <span className="text-[10px] block mt-0.5">ছবি নেই</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div>
                        <span className="font-bold text-[#084A2E] block">
                          পাসপোর্ট সাইজ ছবি আপলোড করুন
                        </span>
                        <span className="text-[11px] text-[#4A5A52]">
                          JPG, PNG ফর্ম্যাট (স্বয়ংক্রিয় রিসাইজ ও অপ্টিমাইজড হবে)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="px-3 py-1.5 bg-[#0B5D3B] text-white text-xs font-semibold hover:bg-[#084A2E] transition-colors cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>ছবি নির্বাচন করুন</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {cvData.personalInfo.photoUrl && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="px-2.5 py-1.5 border border-[#D5E4DB] text-red-700 bg-white hover:bg-red-50 text-xs font-medium cursor-pointer rounded-lg"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        পূর্ণ নাম (Full Name): <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        placeholder="যেমন: মো. আশরাফুল ইসলাম"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        বর্তমান পদবি / হেডলাইন (Title / Designation):
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.designationOrTitle || ''}
                        onChange={(e) => updatePersonalInfo('designationOrTitle', e.target.value)}
                        placeholder="যেমন: অফিস এক্সিকিউটিভ / কম্পিউটার অপারেটর"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        মোবাইল নম্বর: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="০১৭১২-৩৪৫৬৭৮"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        ইমেইল এড্রেস:
                      </label>
                      <input
                        type="email"
                        value={cvData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        পিতার নাম:
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.fatherName || ''}
                        onChange={(e) => updatePersonalInfo('fatherName', e.target.value)}
                        placeholder="পিতার নাম"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        মাতার নাম:
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.motherName || ''}
                        onChange={(e) => updatePersonalInfo('motherName', e.target.value)}
                        placeholder="মাতার নাম"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        জন্ম তারিখ (YYYY-MM-DD):
                      </label>
                      <input
                        type="date"
                        value={cvData.personalInfo.dateOfBirth || ''}
                        onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        লিঙ্গ:
                      </label>
                      <select
                        value={cvData.personalInfo.gender || 'পুরুষ'}
                        onChange={(e) => updatePersonalInfo('gender', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      >
                        <option value="পুরুষ">পুরুষ</option>
                        <option value="মহিলা">মহিলা</option>
                        <option value="অন্যান্য">অন্যান্য</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        বৈবাহিক অবস্থা:
                      </label>
                      <select
                        value={cvData.personalInfo.maritalStatus || 'অবিবাহিত'}
                        onChange={(e) => updatePersonalInfo('maritalStatus', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      >
                        <option value="অবিবাহিত">অবিবাহিত</option>
                        <option value="বিবাহিত">বিবাহিত</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        ধর্ম:
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.religion || ''}
                        onChange={(e) => updatePersonalInfo('religion', e.target.value)}
                        placeholder="ইসলাম / হিন্দু / অন্যান্য"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        রক্তের গ্রুপ:
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.bloodGroup || ''}
                        onChange={(e) => updatePersonalInfo('bloodGroup', e.target.value)}
                        placeholder="যেমন: A+, B+, O+, AB+"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        জাতীয় পরিচয়পত্র নং (NID):
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.nationalId || ''}
                        onChange={(e) => updatePersonalInfo('nationalId', e.target.value)}
                        placeholder="১০ বা ১৭ ডিজিট NID"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        বর্তমান ঠিকানা:
                      </label>
                      <textarea
                        rows={2}
                        value={cvData.personalInfo.presentAddress || ''}
                        onChange={(e) => updatePersonalInfo('presentAddress', e.target.value)}
                        placeholder="বাসা নং, রোড নং, এলাকা, থানা, জেলা"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        স্থায়ী ঠিকানা:
                      </label>
                      <textarea
                        rows={2}
                        value={cvData.personalInfo.permanentAddress || ''}
                        onChange={(e) => updatePersonalInfo('permanentAddress', e.target.value)}
                        placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#084A2E] mb-1">
                        ক্যারিয়ার উদ্দেশ্য / সারসংক্ষেপ (Objective / Summary):
                      </label>
                      <textarea
                        rows={3}
                        value={cvData.personalInfo.careerObjective || ''}
                        onChange={(e) => updatePersonalInfo('careerObjective', e.target.value)}
                        placeholder="আপনার কর্মজীবনের লক্ষ্য ও সারসংক্ষেপ লিখুন..."
                        className="w-full px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Education Dynamic List */}
              {activeFormTab === 'education' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#084A2E]">
                      শিক্ষাগত যোগ্যতার বিবরণী ({cvData.education.length} টি)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleManualPageBreak('education')}
                        className={`px-2 py-1 text-xs border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          manualPageBreaks['education']
                            ? 'bg-[#c8342a] text-white border-[#c8342a]'
                            : 'bg-white text-[#c8342a] border-[#c8342a]/40 hover:bg-[#fae8e7]'
                        }`}
                        title="এই সেকশনটি থেকে নতুন পেজে শুরু করুন"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>{manualPageBreaks['education'] ? 'নতুন পেজে শুরু (সক্রিয়)' : 'পেজ ব্রেক'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={addEducation}
                        className="px-2.5 py-1 bg-[#0B5D3B] text-white text-xs font-medium flex items-center gap-1 hover:bg-[#084A2E] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ডিগ্রি যোগ করুন</span>
                      </button>
                    </div>
                  </div>

                  {cvData.education.length === 0 ? (
                    <div className="p-4 text-center text-[#4A5A52] border border-dashed border-[#D5E4DB] bg-[#F8FAF9] rounded-2xl">
                      কোনো শিক্ষাগত যোগ্যতা যোগ করা হয়নি। উপরের বোতাম চেপে ডিগ্রি যোগ করুন।
                    </div>
                  ) : (
                    cvData.education.map((edu, idx) => (
                      <EducationItemEditor
                        key={edu.id}
                        edu={edu}
                        idx={idx}
                        onUpdate={(field, value) => updateEducation(edu.id, field, value)}
                        onRemove={() => removeEducation(edu.id)}
                      />
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Experience Dynamic List */}
              {activeFormTab === 'experience' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#084A2E]">
                      কর্ম অভিজ্ঞতার বিবরণী ({cvData.experience.length} টি)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleManualPageBreak('experience')}
                        className={`px-2 py-1 text-xs border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          manualPageBreaks['experience']
                            ? 'bg-[#c8342a] text-white border-[#c8342a]'
                            : 'bg-white text-[#c8342a] border-[#c8342a]/40 hover:bg-[#fae8e7]'
                        }`}
                        title="এই সেকশনটি থেকে নতুন পেজে শুরু করুন"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>{manualPageBreaks['experience'] ? 'নতুন পেজে শুরু (সক্রিয়)' : 'পেজ ব্রেক'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={addExperience}
                        className="px-2.5 py-1 bg-[#0B5D3B] text-white text-xs font-medium flex items-center gap-1 hover:bg-[#084A2E] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>অভিজ্ঞতা যোগ করুন</span>
                      </button>
                    </div>
                  </div>

                  {cvData.experience.length === 0 && (
                    <div className="p-4 text-center text-[#4A5A52] border border-dashed border-[#D5E4DB] bg-[#F8FAF9] rounded-2xl">
                      কোনো কর্ম অভিজ্ঞতা যোগ করা হয়নি (ফ্রেশার হলে এটি খালি রাখতে পারেন)।
                    </div>
                  )}

                  {cvData.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-[#F8FAF9] border border-[#D5E4DB] space-y-2.5 rounded-2xl"
                    >
                      <div className="flex justify-between items-center border-b border-[#E6F4EC] pb-1.5">
                        <span className="font-bold text-[#084A2E]">
                          #{idx + 1}. {exp.designation || 'পদবি লিখুন'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-[#c8342a] hover:text-red-800 p-1 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[#4A5A52] mb-0.5">পদবি (Designation):</label>
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) => updateExperience(exp.id, 'designation', e.target.value)}
                            placeholder="যেমন: সিনিয়র এক্সিকিউটিভ"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-[#4A5A52] mb-0.5">প্রতিষ্ঠান (Company):</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="যেমন: এবিসি লিমিটেড, ঢাকা"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[#4A5A52] mb-0.5">সময়কাল (Duration):</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                            placeholder="যেমন: ২০২১ - বর্তমান অথবা জানুয়ারি ২০২০ - মার্চ ২০২২"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[#4A5A52] mb-0.5">দায়িত্বসমূহ (Responsibilities):</label>
                          <textarea
                            rows={2}
                            value={exp.responsibilities || ''}
                            onChange={(e) => updateExperience(exp.id, 'responsibilities', e.target.value)}
                            placeholder="প্রধান দায়িত্ব ও অর্জনসমূহ বুলেট আকারে লিখুন..."
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: Skills & Languages */}
              {activeFormTab === 'skills' && (
                <div className="space-y-5 text-xs">
                  {/* Skills Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#084A2E]">
                        দক্ষতা ও পারদর্শিতা (Skills)
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleManualPageBreak('skills')}
                        className={`px-2 py-0.5 text-xs border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          manualPageBreaks['skills']
                            ? 'bg-[#c8342a] text-white border-[#c8342a]'
                            : 'bg-white text-[#c8342a] border-[#c8342a]/40 hover:bg-[#fae8e7]'
                        }`}
                        title="এই সেকশনটি থেকে নতুন পেজে শুরু করুন"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>{manualPageBreaks['skills'] ? 'নতুন পেজে (সক্রিয়)' : 'পেজ ব্রেক'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder="যেমন: MS Office / Graphic Design / Python"
                        className="flex-1 px-3 py-1.5 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0B5D3B] text-white font-medium hover:bg-[#084A2E] transition-colors cursor-pointer"
                      >
                        + যোগ করুন
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.length === 0 && (
                        <span className="text-[#4A5A52] italic">কোনো দক্ষতা যোগ করা হয়নি।</span>
                      )}
                      {cvData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-[#F8FAF9] text-[#084A2E] px-2.5 py-1 border border-[#D5E4DB] font-medium"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-[#c8342a] hover:text-red-800 p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages Section */}
                  <div className="pt-4 border-t border-[#D5E4DB]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#084A2E]">
                        ভাষাগত দক্ষতা (Languages)
                      </span>
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="text-xs text-[#0B5D3B] font-bold hover:underline cursor-pointer"
                      >
                        + ভাষা যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-2">
                      {cvData.languages.length === 0 && (
                        <div className="p-3 text-center text-[#4A5A52] border border-dashed border-[#D5E4DB] bg-[#F8FAF9] rounded-2xl">
                          <p>কোনো ভাষা যোগ করা হয়নি।</p>
                          <button
                            type="button"
                            onClick={addLanguage}
                            className="mt-1 text-xs text-[#0B5D3B] font-bold hover:underline cursor-pointer"
                          >
                            + ভাষা যোগ করুন
                          </button>
                        </div>
                      )}
                      {cvData.languages.map((lang) => (
                        <div
                          key={lang.id}
                          className="flex gap-2 items-center bg-[#F8FAF9] p-2 border border-[#D5E4DB] rounded-lg"
                        >
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                            placeholder="ভাষার নাম (বাংলা/ইংরেজি)"
                            className="w-1/2 px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                          <input
                            type="text"
                            value={lang.proficiency}
                            onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                            placeholder="দক্ষতার মাত্রা (সাবলীল/মাতৃভাষা)"
                            className="flex-1 px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeLanguage(lang.id)}
                            className="text-[#c8342a] hover:text-red-800 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: References */}
              {activeFormTab === 'references' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#084A2E]">
                      রেফারেন্স ও প্রত্যয়নকারী ({cvData.references.length} টি)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleManualPageBreak('references')}
                        className={`px-2 py-1 text-xs border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          manualPageBreaks['references']
                            ? 'bg-[#c8342a] text-white border-[#c8342a]'
                            : 'bg-white text-[#c8342a] border-[#c8342a]/40 hover:bg-[#fae8e7]'
                        }`}
                        title="রেফারেন্স সেকশনটি নতুন পেজে শুরু করুন"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>{manualPageBreaks['references'] ? 'নতুন পেজে (সক্রিয়)' : 'পেজ ব্রেক'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={addReference}
                        className="px-2.5 py-1 bg-[#0B5D3B] text-white text-xs font-medium flex items-center gap-1 hover:bg-[#084A2E] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>রেফারেন্স যোগ করুন</span>
                      </button>
                    </div>
                  </div>

                  {cvData.references.length === 0 && (
                    <div className="p-4 text-center text-[#4A5A52] border border-dashed border-[#D5E4DB] bg-[#F8FAF9] rounded-2xl">
                      কোনো রেফারেন্স যোগ করা হয়নি (প্রয়োজন না হলে এটি খালি রাখতে পারেন)।
                    </div>
                  )}

                  {cvData.references.map((ref, idx) => (
                    <div
                      key={ref.id}
                      className="p-3 bg-[#F8FAF9] border border-[#D5E4DB] space-y-2.5 rounded-2xl"
                    >
                      <div className="flex justify-between items-center border-b border-[#E6F4EC] pb-1.5">
                        <span className="font-bold text-[#084A2E]">
                          #{idx + 1}. {ref.name || 'নতুন রেফারেন্স'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeReference(ref.id)}
                          className="text-[#c8342a] hover:text-red-800 p-1 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[#4A5A52] mb-0.5">নাম:</label>
                          <input
                            type="text"
                            value={ref.name}
                            onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                            placeholder="রেফারেন্স ব্যক্তির নাম"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-[#4A5A52] mb-0.5">পদবি:</label>
                          <input
                            type="text"
                            value={ref.designation}
                            onChange={(e) => updateReference(ref.id, 'designation', e.target.value)}
                            placeholder="যেমন: অধ্যাপক / ম্যানেজার"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-[#4A5A52] mb-0.5">প্রতিষ্ঠান:</label>
                          <input
                            type="text"
                            value={ref.organization}
                            onChange={(e) => updateReference(ref.id, 'organization', e.target.value)}
                            placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-[#4A5A52] mb-0.5">মোবাইল:</label>
                          <input
                            type="text"
                            value={ref.phone}
                            onChange={(e) => updateReference(ref.id, 'phone', e.target.value)}
                            placeholder="০১৭১১-০০০০০০"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[#4A5A52] mb-0.5">ইমেইল:</label>
                          <input
                            type="email"
                            value={ref.email}
                            onChange={(e) => updateReference(ref.id, 'email', e.target.value)}
                            placeholder="person@example.com"
                            className="w-full px-2.5 py-1 bg-white border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: Page Break Settings (Word-like Pagination) */}
              {activeFormTab === 'pageBreak' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0B5D3B]"></span>
                      <span className="font-bold text-[#084A2E] text-sm">
                        ওয়ার্ড-স্টাইল অটো ও ম্যানুয়াল পেজ ব্রেক
                      </span>
                    </div>
                    <p className="text-[#166534] text-[11px] leading-relaxed">
                      MS Word-এর মতো লেখার পরিমাণের উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে পরের পৃষ্ঠায় চলে যায়। আপনি চাইলে যে কোনো সেকশনকে জোরপূর্বক নতুন পাতায় পাঠাতে পারবেন।
                    </p>
                  </div>

                  {/* Auto Flow Switch */}
                  <div className="flex items-center justify-between p-3 bg-[#F8FAF9] border border-[#D5E4DB] rounded-2xl">
                    <div>
                      <span className="font-bold text-[#084A2E] block">
                        স্বয়ংক্রিয় পেজ ব্রেক (Auto Page Flow)
                      </span>
                      <span className="text-[11px] text-[#4A5A52]">
                        পাতা ভর্তি হয়ে গেলে বাকি অংশ স্বয়ংক্রিয়ভাবে পরবর্তী পাতায় যাবে
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPageBreakEnabled}
                        onChange={(e) => setAutoPageBreakEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B5D3B]"></div>
                    </label>
                  </div>

                  {/* Section by Section Page Break Manager */}
                  <div className="space-y-2">
                    <span className="font-bold text-[#084A2E] block">
                      সেকশন অনুযায়ী পেজ বিন্যাস (Section Locations):
                    </span>

                    <div className="space-y-1.5 border border-[#D5E4DB] divide-y divide-[#E6F4EC] bg-white rounded-lg">
                      {activeSections.map((sec) => {
                        // Find which page this section is currently on
                        const pageNum = pages.findIndex((p) => p.includes(sec)) + 1;
                        const isForced = manualPageBreaks[sec] === true;
                        const meta = SECTION_METADATA[sec];

                        return (
                          <div
                            key={sec}
                            className="p-2.5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">
                                {meta?.labelBn || sec}
                              </span>
                              <span className="text-[10px] text-[#4A5A52] block">
                                বর্তমান অবস্থান: পাতা {toBanglaNum(pageNum || 1)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleManualPageBreak(sec)}
                              className={`px-2.5 py-1 text-xs border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                                isForced
                                  ? 'bg-[#c8342a] text-white border-[#c8342a]'
                                  : 'bg-[#FFFFFF] text-[#084A2E] border-[#D5E4DB] hover:bg-[#E6F4EC]'
                              }`}
                            >
                              <Scissors className="w-3 h-3" />
                              <span>{isForced ? 'নতুন পেজে শুরু (সক্রিয়)' : 'নতুন পেজে পাঠান'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live A4 Physical Multi-Page Preview (7 cols on large screen) */}
          <div
            className={`lg:col-span-7 ${
              mobileView === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Live Preview Bar */}
            <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#F0F4F2] border border-[#D5E4DB] mb-2 text-xs gap-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0B5D3B]"></span>
                <span className="font-bold text-[#084A2E]">লাইভ A4 প্রিভিউ</span>
                <span className="text-[#4A5A52]">
                  ({language === 'bn' ? 'বাংলা সংস্করণ' : 'English Edition'})
                </span>
                <span className="text-[10px] text-[#0B5D3B] font-semibold bg-[#e8f5e9] px-2 py-0.5 rounded border border-[#c8e6c9]">
                  {totalPages > 1
                    ? `${language === 'bn' ? `পৃষ্ঠা ${toBanglaNum(safePageIndex + 1)} / ${toBanglaNum(totalPages)}` : `Page ${safePageIndex + 1} of ${totalPages}`}`
                    : '১ পৃষ্ঠা (সম্পূর্ণ)'}
                </span>
                <span className="text-[11px] font-mono text-[#4A5A52] bg-[#E6F4EC] px-1.5 py-0.5">
                  {Math.round(scaleFactor * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf || isPrinting}
                  title="সরাসরি A4 PDF ডাউনলোড করুন"
                  className="px-2.5 py-1 bg-[#0B5D3B] text-white hover:bg-[#084A2E] transition-colors font-medium flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>PDF ডাউনলোড</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting || isGeneratingPdf}
                  title="প্রিন্টার ডায়ালগ খুলুন"
                  className="px-2.5 py-1 border border-[#0B5D3B] bg-[#FFFFFF] text-[#0B5D3B] hover:bg-[#e8f5e9] transition-colors font-medium flex items-center gap-1 cursor-pointer disabled:opacity-60 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>প্রিন্ট</span>
                </button>
              </div>
            </div>

            {/* Top Page Navigation Bar (Direct page buttons and Next/Prev) */}
            {totalPages > 1 && (
              <div className="bg-[#F8FAF9] border border-[#D5E4DB] px-3 py-2 mb-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#084A2E] mr-1">
                    {language === 'bn' ? 'পাতা নির্বাচন:' : 'Page:'}
                  </span>
                  {pages.map((_, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setCurrentPreviewPage(pIdx)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        safePageIndex === pIdx
                          ? 'bg-[#0B5D3B] text-white border-[#0B5D3B] shadow-xs'
                          : 'bg-white text-[#084A2E] border-[#9DB0A5] hover:bg-[#E6F4EC]'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>
                        {language === 'bn'
                          ? `পৃষ্ঠা ${toBanglaNum(pIdx + 1)}`
                          : `Page ${pIdx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePageIndex === 0}
                    onClick={() => setCurrentPreviewPage((prev) => Math.max(0, prev - 1))}
                    className="px-2.5 py-1 bg-white border border-[#9DB0A5] text-xs font-semibold text-[#084A2E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E6F4EC] transition-colors flex items-center gap-1 cursor-pointer rounded-lg"
                    title="পূর্ববর্তী পাতা দেখুন"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পূর্ববর্তী পাতা' : 'Previous'}</span>
                  </button>

                  <span className="text-xs font-mono font-bold text-[#084A2E] px-2.5 py-0.5 bg-[#E6F4EC] rounded-xs">
                    {toBanglaNum(safePageIndex + 1)} / {toBanglaNum(totalPages)}
                  </span>

                  <button
                    type="button"
                    disabled={safePageIndex >= totalPages - 1}
                    onClick={() => setCurrentPreviewPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    className="px-2.5 py-1 bg-[#0B5D3B] text-white border border-[#0B5D3B] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#084A2E] transition-colors flex items-center gap-1 cursor-pointer shadow-xs rounded-lg"
                    title="পরবর্তী পাতা দেখুন"
                  >
                    <span>{language === 'bn' ? 'পরবর্তী পাতা' : 'Next'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* A4 Single-Page Desk Container (Displaying ONE active sheet at a time) */}
            <div
              ref={previewDeskRef}
              className="bg-[#dcd6c5] p-3 sm:p-6 border border-[#D5E4DB] flex flex-col items-center overflow-x-auto min-h-[600px] rounded-2xl"
            >
              {/* Outer Scaled Wrapper */}
              <div
                style={{
                  width: `${Math.round(A4_WIDTH_PX * scaleFactor)}px`,
                  transform: `scale(${scaleFactor})`,
                  transformOrigin: 'top center',
                  marginBottom: `-${Math.round((1 - scaleFactor) * (A4_HEIGHT_PX + 40))}px`,
                  transition: 'width 0.1s ease-out',
                }}
              >
                {/* Physical A4 Sheet Container */}
                <div id="cv-print-area" ref={cvPrintAreaRef} className="flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    {/* Page Top Badge on Screen Desk */}
                    <div className="page-screen-badge w-[794px] flex items-center justify-between px-4 py-1.5 bg-[#F0F4F2] border-t border-x border-[#9DB0A5] text-xs font-serif text-[#084A2E] select-none">
                      <div className="flex items-center gap-2 font-bold">
                        <Layers className="w-3.5 h-3.5 text-[#0B5D3B]" />
                        <span>
                          {language === 'bn'
                            ? `A4 শিট — পৃষ্ঠা ${toBanglaNum(safePageIndex + 1)} / ${toBanglaNum(totalPages)}`
                            : `A4 Sheet — Page ${safePageIndex + 1} of ${totalPages}`}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#4A5A52]">
                        A4 Standard (210 × 297 mm)
                      </span>
                    </div>

                    {/* Physical A4 White Paper Container */}
                    <div
                      data-page-index={safePageIndex}
                      className="cv-physical-page bg-white shadow-2xl border border-[#9DB0A5] relative overflow-hidden rounded-lg"
                      style={{
                        width: `${A4_WIDTH_PX}px`,
                        minHeight: `${A4_HEIGHT_PX}px`,
                        height: `${A4_HEIGHT_PX}px`,
                      }}
                    >
                      {/* Template content for this specific page slice */}
                      {renderTemplateForPage(
                        pages[safePageIndex] || [],
                        safePageIndex + 1,
                        totalPages
                      )}

                      {/* Footer on Paper - ONLY Page Number */}
                      <div className="page-screen-badge absolute bottom-2 right-8 text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-1 select-none pointer-events-none">
                        <span>
                          {language === 'bn'
                            ? `পৃষ্ঠা ${toBanglaNum(safePageIndex + 1)} / ${toBanglaNum(totalPages)}`
                            : `Page ${safePageIndex + 1} of ${totalPages}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Word-style Bottom Navigation Bar below the physical sheet */}
              {totalPages > 1 && (
                <div className="page-screen-badge mt-6 flex items-center justify-between gap-3 bg-[#F0F4F2] border border-[#9DB0A5] px-4 py-2.5 shadow-sm max-w-md w-full select-none rounded-lg">
                  <button
                    type="button"
                    disabled={safePageIndex === 0}
                    onClick={() => setCurrentPreviewPage((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 bg-white border border-[#9DB0A5] text-xs font-semibold text-[#084A2E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E6F4EC] transition-colors flex items-center gap-1 cursor-pointer rounded-lg"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পূর্ববর্তী পাতা' : 'Previous'}</span>
                  </button>

                  <div className="flex items-center gap-2 font-serif text-xs font-bold text-[#084A2E]">
                    <span>
                      {language === 'bn'
                        ? `পৃষ্ঠা ${toBanglaNum(safePageIndex + 1)} / ${toBanglaNum(totalPages)}`
                        : `Page ${safePageIndex + 1} of ${totalPages}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={safePageIndex >= totalPages - 1}
                    onClick={() => setCurrentPreviewPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    className="px-3 py-1.5 bg-[#0B5D3B] text-white border border-[#0B5D3B] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#084A2E] transition-colors flex items-center gap-1 cursor-pointer shadow-xs rounded-lg"
                  >
                    <span>{language === 'bn' ? 'পরবর্তী পাতা' : 'Next'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Clean un-scaled hidden print & export container (Contains ALL pages) */}
            <div
              id="cv-clean-export-container"
              style={{
                position: 'fixed',
                top: 0,
                left: '-9999px',
                width: `${A4_WIDTH_PX}px`,
                zIndex: -9999,
                pointerEvents: 'none',
                opacity: 0,
                backgroundColor: '#ffffff',
              }}
              aria-hidden="true"
            >
              {pages.map((pageSections, pageIdx) => {
                const pageNumber = pageIdx + 1;
                return (
                  <div
                    key={`export-page-${pageIdx}`}
                    className="cv-clean-export-page bg-white relative overflow-hidden"
                    style={{
                      width: `${A4_WIDTH_PX}px`,
                      minHeight: `${A4_HEIGHT_PX}px`,
                      height: `${A4_HEIGHT_PX}px`,
                    }}
                  >
                    {renderTemplateForPage(pageSections, pageNumber, totalPages)}
                    {/* Clean Footer with ONLY page number */}
                    <div className="absolute bottom-2 right-8 text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-1">
                      <span>
                        {language === 'bn'
                          ? `পৃষ্ঠা ${toBanglaNum(pageNumber)} / ${toBanglaNum(totalPages)}`
                          : `Page ${pageNumber} of ${totalPages}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Tips Box below preview desk */}
            <div className="mt-4 p-3 bg-[#F8FAF9] border border-[#D5E4DB] text-xs text-[#4A5A52] flex items-start gap-2 rounded-2xl">
              <HelpCircle className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#084A2E] font-semibold">
                  ওয়ার্ড স্টাইল পেজ ব্রেক সম্পর্কিত তথ্য:
                </strong>
                <p className="mt-0.5 leading-relaxed">
                  MS Word-এ যেমন তথ্য বেশি হলে স্বয়ংক্রিয়ভাবে ২য় পৃষ্ঠায় চলে যায়, এখানেও সেভাবেই তৈরি। কোনো নির্দিষ্ট সেকশন (যেমন কর্ম অভিজ্ঞতা বা রেফারেন্স) নতুন পাতায় শুরু করতে চাইলে &ldquo;পেজ ব্রেক&rdquo; ট্যাবে গিয়ে বা সেকশনের পেজ ব্রেক বোতামে ক্লিক করুন।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Guide Section */}
        <section className="mt-8 bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-4 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Info className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
              কীভাবে একটি ভালো জীবনবৃত্তান্ত লিখবেন?
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-[#0F1F17] leading-relaxed">
            <p className="text-[#34443B]">
              সঠিক টেমপ্লেট বাছাই দিয়েই শুরু করুন — সরকারি চাকরির আবেদনের জন্য <strong>"সরকারি জীবনবৃত্তান্ত"</strong> বা <strong>"ক্লাসিক"</strong> টেমপ্লেট, বেসরকারি কর্পোরেট বা আইটি প্রতিষ্ঠানের জন্য <strong>"মডার্ন"</strong> বা <strong>"ক্রিয়েটিভ"</strong>, আর অভিজ্ঞতা কম থাকলে (fresher) <strong>"কমপ্যাক্ট"</strong> টেমপ্লেট বেছে নিন — এতে অল্প অভিজ্ঞতাতেও পাতা ফাঁকা মনে হবে না।
            </p>
            <p className="text-[#34443B]">
              <strong>"ক্যারিয়ারের উদ্দেশ্য"</strong> সংক্ষিপ্ত (২-৩ বাক্যে) রাখুন — কোন পদে আবেদন করছেন এবং আপনার প্রধান দক্ষতা কী, সেটা স্পষ্টভাবে উল্লেখ করুন। প্রতিটা প্রতিষ্ঠানের জন্য একই সিভি না পাঠিয়ে, চাকরির বিবরণ অনুযায়ী সামান্য পরিবর্তন করে নেওয়া ভালো।
            </p>
            <p className="text-[#34443B]">
              সাধারণ ভুলগুলো এড়িয়ে চলুন: বানান ভুল, পুরনো/অস্পষ্ট ছবি, ভুল বা অসম্পূর্ণ মোবাইল নম্বর/ইমেইল, এবং প্রয়োজনের চেয়ে বেশি লম্বা সিভি (fresher-দের জন্য ১ পাতাই যথেষ্ট)।
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-6 bg-[#FFFFFF] border border-[#D5E4DB] p-5 sm:p-6 space-y-5 rounded-2xl">
          <div className="flex items-center space-x-2 border-b border-[#D5E4DB] pb-3">
            <Info className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="text-base sm:text-lg font-bold text-[#084A2E] font-serif">
              {pageContent.faqHeading || 'প্রায়শই জিজ্ঞাসিত প্রশ্ন (FAQ)'}
            </h2>
          </div>
          <div className="space-y-5 text-xs sm:text-sm text-[#0F1F17] leading-relaxed">
            {faqs.map((f, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="font-bold text-[#084A2E]">{f.question}</h3>
                <p className="text-[#34443B]">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
        <RelatedTools currentToolId="cv-builder" />
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-[#D5E4DB] shadow-xl max-w-md w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center gap-3 text-[#c8342a]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">সিভির তথ্য রিসেট নিশ্চিতকরণ</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5A52] leading-relaxed">
              আপনি কি নিশ্চিত যে ফরমের সকল তথ্য মুছে ফেলতে চান? এটি করলে বর্তমান সকল তথ্য স্থায়ীভাবে মুছে যাবে এবং ফাঁকা ফর্ম চালু হবে।
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 border border-[#D5E4DB] text-xs font-semibold text-[#084A2E] hover:bg-[#E6F4EC] transition-colors cursor-pointer rounded-lg"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-[#c8342a] text-white text-xs font-semibold hover:bg-red-800 transition-colors cursor-pointer"
              >
                হ্যাঁ, সকল তথ্য মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#084A2E] text-white px-4 py-2.5 shadow-lg border border-[#0B5D3B] text-xs font-medium flex items-center gap-2 animate-bounce-short rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
