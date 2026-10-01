import React, { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { ToolSeoHead } from '../components/ToolSeoHead.tsx';
import {
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Info,
  HelpCircle,
  BookOpen,
  Sparkles,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import {
  SscSubject,
  SscGrade,
  SSC_GRADE_OPTIONS,
  SSC_GRADE_MAP,
  marksToSscGrade,
  calculateSscGpa,
  UniversityCourse,
  UniversityGrade,
  UNIVERSITY_GRADE_OPTIONS,
  UNIVERSITY_GRADE_MAP,
  UniversitySemester,
  calculateCourseCgpa,
  calculateSemesterCgpa,
  toBanglaNum,
} from '../gpaCalculator.ts';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { RelatedTools } from '../components/RelatedTools.tsx';
import { CmsDynamicContent } from '../components/CmsDynamicContent.tsx';
import pageContent from '../../content/pages/gpa-calculator.json';

// Default starter subjects for SSC/HSC (Science standard template)
const DEFAULT_SSC_SUBJECTS: SscSubject[] = [
  { id: 'sub-1', name: 'বাংলা', marks: 82, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'sub-2', name: 'ইংরেজি', marks: 75, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'sub-3', name: 'গণিত', marks: 88, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'sub-4', name: 'পদার্থবিজ্ঞান', marks: 78, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'sub-5', name: 'রসায়ন', marks: 84, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'sub-6', name: 'জীববিজ্ঞান', marks: 81, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'sub-7', name: 'উচ্চতর গণিত (৪র্থ বিষয়)', marks: 85, grade: 'A+', point: 5.0, isFourthSubject: true },
];

const DEFAULT_COMMERCE_SUBJECTS: SscSubject[] = [
  { id: 'c-1', name: 'বাংলা', marks: 76, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'c-2', name: 'ইংরেজি', marks: 72, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'c-3', name: 'হিসাববিজ্ঞান', marks: 85, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'c-4', name: 'ব্যবসায় উদ্যোগ', marks: 80, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'c-5', name: 'ফিন্যান্স ও ব্যাংকিং', marks: 78, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'c-6', name: 'সাধারণ বিজ্ঞান', marks: 74, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'c-7', name: 'কৃষি শিক্ষা (৪র্থ বিষয়)', marks: 86, grade: 'A+', point: 5.0, isFourthSubject: true },
];

const DEFAULT_HUMANITIES_SUBJECTS: SscSubject[] = [
  { id: 'h-1', name: 'বাংলা', marks: 78, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'h-2', name: 'ইংরেজি', marks: 71, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'h-3', name: 'ইতিহাস ও বিশ্বসভ্যতা', marks: 80, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'h-4', name: 'ভূগোল ও পরিবেশ', marks: 75, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'h-5', name: 'পৌরনীতি ও নাগরিকতা', marks: 82, grade: 'A+', point: 5.0, isFourthSubject: false },
  { id: 'h-6', name: 'অর্থনীতি', marks: 74, grade: 'A', point: 4.0, isFourthSubject: false },
  { id: 'h-7', name: 'কৃষি শিক্ষা (৪র্থ বিষয়)', marks: 84, grade: 'A+', point: 5.0, isFourthSubject: true },
];

const DEFAULT_UNIVERSITY_COURSES: UniversityCourse[] = [
  { id: 'course-1', name: 'কোর্স ১ (যেমন: প্রোগ্রামিং ফান্ডামেন্টালস)', credits: 3.0, grade: 'A+', gradePoint: 4.0 },
  { id: 'course-2', name: 'কোর্স ২ (যেমন: ডিসক্রিট ম্যাথ)', credits: 3.0, grade: 'A', gradePoint: 3.75 },
  { id: 'course-3', name: 'কোর্স ৩ (যেমন: ডাটা স্ট্রাকচার)', credits: 3.0, grade: 'A-', gradePoint: 3.5 },
  { id: 'course-4', name: 'কোর্স ৪ (যেমন: ইলেকট্রিক্যাল সার্কিট)', credits: 3.0, grade: 'B+', gradePoint: 3.25 },
  { id: 'course-5', name: 'কোর্স ৫ (ল্যাব)', credits: 1.5, grade: 'A+', gradePoint: 4.0 },
  { id: 'course-6', name: 'কোর্স ৬ (ইংরেজি যোগাযোগ)', credits: 2.0, grade: 'A', gradePoint: 3.75 },
];

const DEFAULT_UNIVERSITY_SEMESTERS: UniversitySemester[] = [
  { id: 'sem-1', name: '১ম সেমিস্টার', gpa: 3.75, credits: 18.0 },
  { id: 'sem-2', name: '২য় সেমিস্টার', gpa: 3.65, credits: 19.5 },
  { id: 'sem-3', name: '৩য় সেমিস্টার', gpa: 3.8, credits: 18.0 },
  { id: 'sem-4', name: '৪র্থ সেমিস্টার', gpa: 3.7, credits: 18.0 },
];

export const GpaCalculatorPage: React.FC = () => {
  // Top System Switcher: 'ssc' (5.00 scale) vs 'university' (4.00 scale)
  const [activeTab, setActiveTab] = useState<'ssc' | 'university'>('ssc');

  // University Sub-mode: 'courses' (single semester) vs 'semesters' (cumulative overall)
  const [uniMode, setUniMode] = useState<'courses' | 'semesters'>('courses');

  // SSC State
  const [sscSubjects, setSscSubjects] = useState<SscSubject[]>(DEFAULT_SSC_SUBJECTS);

  // University Courses State
  const [uniCourses, setUniCourses] = useState<UniversityCourse[]>(DEFAULT_UNIVERSITY_COURSES);

  // University Semesters State
  const [uniSemesters, setUniSemesters] = useState<UniversitySemester[]>(DEFAULT_UNIVERSITY_SEMESTERS);

  // Copy to clipboard
  const { copied, copy } = useCopyToClipboard();

  // Calculations
  const sscResult = calculateSscGpa(sscSubjects);
  const uniCourseResult = calculateCourseCgpa(uniCourses);
  const uniSemesterResult = calculateSemesterCgpa(uniSemesters);

  // Unique ID generator fallback
  const uniquePrefix = useId();
  const getNextId = () => `${uniquePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // ----------------------------------------------------
  // SSC Handlers
  // ----------------------------------------------------
  const handleAddSscSubject = () => {
    const newSubject: SscSubject = {
      id: getNextId(),
      name: `বিষয় ${toBanglaNum(sscSubjects.length + 1)}`,
      marks: '',
      grade: 'A',
      point: 4.0,
      isFourthSubject: false,
    };
    setSscSubjects([...sscSubjects, newSubject]);
  };

  const handleRemoveSscSubject = (id: string) => {
    if (sscSubjects.length <= 1) return;
    setSscSubjects(sscSubjects.filter((s) => s.id !== id));
  };

  const handleUpdateSscSubjectName = (id: string, name: string) => {
    setSscSubjects(sscSubjects.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleUpdateSscMarks = (id: string, marksRaw: string) => {
    if (marksRaw === '') {
      setSscSubjects(
        sscSubjects.map((s) => (s.id === id ? { ...s, marks: '', grade: 'F', point: 0 } : s))
      );
      return;
    }
    const val = parseFloat(marksRaw);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(100, val));
    const { grade, point } = marksToSscGrade(clamped);
    setSscSubjects(
      sscSubjects.map((s) => (s.id === id ? { ...s, marks: clamped, grade, point } : s))
    );
  };

  const handleUpdateSscGrade = (id: string, grade: SscGrade) => {
    const point = SSC_GRADE_MAP[grade];
    setSscSubjects(
      sscSubjects.map((s) => (s.id === id ? { ...s, grade, point, marks: '' } : s))
    );
  };

  const handleToggleFourthSubject = (id: string) => {
    // Only one subject can be 4th subject at a time
    setSscSubjects(
      sscSubjects.map((s) => {
        if (s.id === id) {
          const willBeFourth = !s.isFourthSubject;
          return { ...s, isFourthSubject: willBeFourth };
        }
        return { ...s, isFourthSubject: false };
      })
    );
  };

  const handleLoadSscPreset = (preset: 'science' | 'commerce' | 'humanities' | 'empty') => {
    if (preset === 'science') setSscSubjects(DEFAULT_SSC_SUBJECTS);
    else if (preset === 'commerce') setSscSubjects(DEFAULT_COMMERCE_SUBJECTS);
    else if (preset === 'humanities') setSscSubjects(DEFAULT_HUMANITIES_SUBJECTS);
    else {
      setSscSubjects([
        { id: getNextId(), name: 'বিষয় ১', marks: '', grade: 'A+', point: 5.0, isFourthSubject: false },
        { id: getNextId(), name: 'বিষয় ২', marks: '', grade: 'A', point: 4.0, isFourthSubject: false },
        { id: getNextId(), name: '৪র্থ বিষয়', marks: '', grade: 'A', point: 4.0, isFourthSubject: true },
      ]);
    }
  };

  // ----------------------------------------------------
  // University Courses Handlers
  // ----------------------------------------------------
  const handleAddUniCourse = () => {
    const newCourse: UniversityCourse = {
      id: getNextId(),
      name: `কোর্স ${toBanglaNum(uniCourses.length + 1)}`,
      credits: 3.0,
      grade: 'A',
      gradePoint: 3.75,
    };
    setUniCourses([...uniCourses, newCourse]);
  };

  const handleRemoveUniCourse = (id: string) => {
    if (uniCourses.length <= 1) return;
    setUniCourses(uniCourses.filter((c) => c.id !== id));
  };

  const handleUpdateUniCourseName = (id: string, name: string) => {
    setUniCourses(uniCourses.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleUpdateUniCourseCredits = (id: string, creditsRaw: string) => {
    if (creditsRaw === '') {
      setUniCourses(uniCourses.map((c) => (c.id === id ? { ...c, credits: '' } : c)));
      return;
    }
    const val = parseFloat(creditsRaw);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(20, val));
    setUniCourses(uniCourses.map((c) => (c.id === id ? { ...c, credits: clamped } : c)));
  };

  const handleUpdateUniCourseGrade = (id: string, grade: UniversityGrade) => {
    const gradePoint = UNIVERSITY_GRADE_MAP[grade];
    setUniCourses(uniCourses.map((c) => (c.id === id ? { ...c, grade, gradePoint } : c)));
  };

  // ----------------------------------------------------
  // University Semesters Handlers
  // ----------------------------------------------------
  const handleAddUniSemester = () => {
    const newSem: UniversitySemester = {
      id: getNextId(),
      name: `${toBanglaNum(uniSemesters.length + 1)}ম সেমিস্টার`,
      gpa: 3.5,
      credits: 18.0,
    };
    setUniSemesters([...uniSemesters, newSem]);
  };

  const handleRemoveUniSemester = (id: string) => {
    if (uniSemesters.length <= 1) return;
    setUniSemesters(uniSemesters.filter((s) => s.id !== id));
  };

  const handleUpdateUniSemesterName = (id: string, name: string) => {
    setUniSemesters(uniSemesters.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleUpdateUniSemesterGpa = (id: string, gpaRaw: string) => {
    if (gpaRaw === '') {
      setUniSemesters(uniSemesters.map((s) => (s.id === id ? { ...s, gpa: '' } : s)));
      return;
    }
    const val = parseFloat(gpaRaw);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(4.0, val));
    setUniSemesters(uniSemesters.map((s) => (s.id === id ? { ...s, gpa: clamped } : s)));
  };

  const handleUpdateUniSemesterCredits = (id: string, creditsRaw: string) => {
    if (creditsRaw === '') {
      setUniSemesters(uniSemesters.map((s) => (s.id === id ? { ...s, credits: '' } : s)));
      return;
    }
    const val = parseFloat(creditsRaw);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(50, val));
    setUniSemesters(uniSemesters.map((s) => (s.id === id ? { ...s, credits: clamped } : s)));
  };

  // ----------------------------------------------------
  // Copy Result Text
  // ----------------------------------------------------
  const handleCopyResult = () => {
    let textToCopy = '';
    if (activeTab === 'ssc') {
      textToCopy = `আমার এসএসসি/এইচএসসি ফলাফল:
চূড়ান্ত GPA: ${sscResult.finalGpa.toFixed(2)} (গ্রেড: ${sscResult.letterGrade})
স্ট্যাটাস: ${sscResult.isPassed ? 'উত্তীর্ণ (Passed)' : 'অকৃতকার্য (Failed)'}
বাধ্যতামূলক বিষয়: ${sscResult.mandatoryCount}টি (পয়েন্ট: ${sscResult.totalPoints - sscResult.fourthSubjectBonus})
৪র্থ বিষয়ের বোনাস পয়েন্ট: +${sscResult.fourthSubjectBonus.toFixed(2)}
৪র্থ বিষয় ছাড়া GPA: ${sscResult.gpaWithoutFourth.toFixed(2)}
হিসাব করেছেন: Utools.bd (https://utools.bd/gpa-calculator)`;
    } else if (uniMode === 'courses') {
      textToCopy = `আমার বিশ্ববিদ্যালয়ের সেমিস্টার সিজিপিএ:
সেমিস্টার SGPA/CGPA: ${uniCourseResult.cgpa.toFixed(2)} (স্কেল: ৪.০০)
মোট ক্রেডিট আওয়ার: ${uniCourseResult.totalCredits.toFixed(1)}
অর্জিত ক্রেডিট: ${uniCourseResult.earnedCredits.toFixed(1)}
হিসাব করেছেন: Utools.bd (https://utools.bd/gpa-calculator)`;
    } else {
      textToCopy = `আমার বিশ্ববিদ্যালয়ের সামগ্রিক কিউমুলেটিভ সিজিপিএ:
সর্বমোট CGPA: ${uniSemesterResult.overallCgpa.toFixed(2)} (স্কেল: ৪.০০)
মোট সেমিস্টার সংখ্যা: ${uniSemesters.length}টি
সর্বমোট ক্রেডিট আওয়ার: ${uniSemesterResult.totalCredits.toFixed(1)}
হিসাব করেছেন: Utools.bd (https://utools.bd/gpa-calculator)`;
    }
    void copy(textToCopy);
  };

  // FAQ Schema for SEO Rich Snippets
  const faqs = pageContent?.faqs || [];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolSeoHead
        title={pageContent.metaTitle}
        description={pageContent.metaDescription}
        canonicalUrl="https://utools.bd/gpa-calculator"
        toolName="জিপিএ ও সিজিপিএ ক্যালকুলেটর"
        categoryName="ক্যালকুলেটর"
        faqs={pageContent.faqs || []}
      />

      {/* Top Breadcrumb & Privacy Guarantee */}
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

        {/* 100% Client-Side Privacy Badge */}
        <div className="flex items-center space-x-2 text-xs font-medium text-[#084A2E] bg-[#FFFFFF] border border-[#D5E4DB] px-3 py-1.5 shadow-xs rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
          <span>১০০% ক্লায়েন্ট-সাইড ব্রাউজার ক্যালকুলেটর (কোনো তথ্য সার্ভারে যায় না)</span>
        </div>
      </div>

      {/* Page Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#084A2E] font-serif tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-sm text-[#34443B] max-w-3xl leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Top Main Tab Switcher: SSC/HSC vs University */}
      <div className="flex flex-wrap gap-2 border-b border-[#D5E4DB] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('ssc')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer border ${
            activeTab === 'ssc'
              ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E] shadow-xs'
              : 'bg-[#FFFFFF] text-[#34443B] border-[#D5E4DB] hover:bg-[#F0F4F2]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>১. এসএসসি / এইচএসসি জিপিএ (৫.০০ স্কেল)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('university')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer border ${
            activeTab === 'university'
              ? 'bg-[#084A2E] text-[#FFFFFF] border-[#084A2E] shadow-xs'
              : 'bg-[#FFFFFF] text-[#34443B] border-[#D5E4DB] hover:bg-[#F0F4F2]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>২. বিশ্ববিদ্যালয় সিজিপিএ (৪.০০ স্কেল)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SSC / HSC / CLASS-BASED GPA (5.00 SCALE)         */}
      {/* ======================================================== */}
      {activeTab === 'ssc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Subjects Input Form (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Presets and Controls Card */}
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-4 shadow-xs rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5E4DB]">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#0B5D3B]" />
                  <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider">
                    বিষয় ও গ্রেড তালিকা (৫.০০ স্কেল)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[#4A5A52] mr-1">কুইক প্রিসেট:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSscPreset('science')}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2 py-1 text-[#084A2E] cursor-pointer rounded-lg"
                  >
                    বিজ্ঞান
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSscPreset('commerce')}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2 py-1 text-[#084A2E] cursor-pointer rounded-lg"
                  >
                    ব্যবসায়
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSscPreset('humanities')}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2 py-1 text-[#084A2E] cursor-pointer rounded-lg"
                  >
                    মানবিক
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSscPreset('empty')}
                    className="border border-[#D5E4DB] bg-[#F0F4F2] hover:bg-[#D5E4DB]/50 px-2 py-1 text-[#4A5A52] flex items-center space-x-1 cursor-pointer rounded-lg"
                    title="নতুন করে ফাঁকা তালিকা"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>রিসেট</span>
                  </button>
                </div>
              </div>

              {/* Table / List of Subjects */}
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-[#4A5A52] uppercase tracking-wider px-2">
                  <div className="col-span-5">বিষয়ের নাম</div>
                  <div className="col-span-2 text-center">নম্বর (০-১০০)</div>
                  <div className="col-span-3 text-center">গ্রেড (পয়েন্ট)</div>
                  <div className="col-span-2 text-right">৪র্থ বিষয় / মুছুন</div>
                </div>

                {sscSubjects.map((sub, index) => {
                  return (
                    <div
                      key={sub.id}
                      className={`p-3 border transition-colors ${
                        sub.isFourthSubject
                          ? 'bg-[#0B5D3B]/5 border-[#0B5D3B]/40'
                          : sub.grade === 'F'
                          ? 'bg-red-50/50 border-red-200'
                          : 'bg-[#FFFFFF] border-[#D5E4DB]'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        {/* Subject Name */}
                        <div className="sm:col-span-5 flex items-center space-x-2">
                          <span className="text-xs font-mono text-[#4A5A52] w-5 shrink-0">
                            {toBanglaNum(index + 1)}.
                          </span>
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleUpdateSscSubjectName(sub.id, e.target.value)}
                            placeholder="বিষয়ের নাম লিখুন"
                            className="w-full px-2.5 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                          />
                        </div>

                        {/* Marks Input (Optional) */}
                        <div className="sm:col-span-2">
                          <label className="sm:hidden block text-[11px] text-[#4A5A52] mb-1">
                            প্রাপ্ত নম্বর:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sub.marks}
                            onChange={(e) => handleUpdateSscMarks(sub.id, e.target.value)}
                            placeholder="যেমন: ৮৫"
                            className="w-full text-center px-2 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-mono rounded-lg"
                          />
                        </div>

                        {/* Grade Dropdown */}
                        <div className="sm:col-span-3">
                          <label className="sm:hidden block text-[11px] text-[#4A5A52] mb-1">
                            লেটার গ্রেড:
                          </label>
                          <select
                            value={sub.grade}
                            onChange={(e) => handleUpdateSscGrade(sub.id, e.target.value as SscGrade)}
                            className="w-full px-2 py-1.5 text-xs bg-[#FFFFFF] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-semibold text-[#084A2E] rounded-lg"
                          >
                            {SSC_GRADE_OPTIONS.map((opt) => (
                              <option key={opt.grade} value={opt.grade}>
                                {opt.grade} ({opt.point.toFixed(2)}) [{opt.markRange}]
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 4th Subject Toggle & Delete */}
                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-end space-x-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#D5E4DB]/60">
                          <button
                            type="button"
                            onClick={() => handleToggleFourthSubject(sub.id)}
                            className={`text-[11px] px-2 py-1 border transition-colors cursor-pointer ${
                              sub.isFourthSubject
                                ? 'bg-[#0B5D3B] text-white border-[#0B5D3B] font-bold'
                                : 'bg-[#F0F4F2] text-[#4A5A52] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
                            }`}
                            title="৪র্থ বিষয় হিসেবে নির্ধারণ করুন"
                          >
                            {sub.isFourthSubject ? '৪র্থ বিষয়' : 'সাধারণ'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSscSubject(sub.id)}
                            disabled={sscSubjects.length <= 1}
                            className={`p-1.5 border transition-colors cursor-pointer ${
                              sscSubjects.length <= 1
                                ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                : 'text-[#c8342a] border-[#D5E4DB] hover:bg-red-50'
                            }`}
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Small inline note for 4th subject */}
                      {sub.isFourthSubject && (
                        <div className="mt-2 pt-1.5 border-t border-[#0B5D3B]/20 text-[11px] text-[#0B5D3B] flex items-center justify-between">
                          <span>
                            ★ এটি ৪র্থ বিষয়: গ্রেড {sub.grade} ({sub.point.toFixed(2)}) এর মধ্যে ২.০০ এর বেশি{' '}
                            <strong>+{Math.max(0, sub.point - 2.0).toFixed(2)}</strong> পয়েন্ট মূল যোগফলে যুক্ত হবে।
                          </span>
                          {sub.point <= 2.0 && (
                            <span className="text-amber-700 font-medium">
                              (২.০০ বা কম হওয়ায় বোনাস নেই)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Subject Button */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddSscSubject}
                  className="inline-flex items-center space-x-1.5 border border-[#0B5D3B] bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 text-[#084A2E] px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ নতুন বিষয় যোগ করুন</span>
                </button>

                <span className="text-xs text-[#4A5A52]">
                  মোট বিষয়: {toBanglaNum(sscSubjects.length)}টি (বাধ্যতামূলক{' '}
                  {toBanglaNum(sscResult.mandatoryCount)}টি
                  {sscSubjects.some((s) => s.isFourthSubject) ? ' + ১টি ৪র্থ বিষয়' : ''})
                </span>
              </div>
            </div>

            {/* Quick 5.00 Scale Grade Reference Table */}
            <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 text-xs space-y-2 rounded-2xl">
              <span className="font-bold text-[#084A2E] font-serif flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-[#0B5D3B]" />
                <span>বাংলাদেশ শিক্ষা বোর্ড গ্রেডিং স্কেল নির্দেশিকা:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 text-center text-[11px]">
                {SSC_GRADE_OPTIONS.map((g) => (
                  <div key={g.grade} className="p-1.5 bg-[#F0F4F2]/50 border border-[#D5E4DB] rounded-lg">
                    <div className="font-bold text-[#084A2E] text-xs">{g.grade}</div>
                    <div className="font-mono text-[#0B5D3B] font-semibold">{g.point.toFixed(2)}</div>
                    <div className="text-[10px] text-[#4A5A52]">{g.markRange}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Result Card (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] border-2 border-[#0B5D3B] p-6 space-y-5 shadow-sm sticky top-6 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#0B5D3B]" />
                  <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider">
                    চূড়ান্ত ফলাফল (SSC/HSC GPA)
                  </span>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 font-bold border ${
                    sscResult.isPassed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  {sscResult.isPassed ? 'উত্তীর্ণ (PASSED)' : 'অকৃতকার্য (FAILED)'}
                </span>
              </div>

              {/* Big Prominent GPA Display */}
              <div className="text-center py-4 bg-[#F0F4F2]/50 border border-[#D5E4DB] space-y-2 rounded-lg">
                <div className="text-xs uppercase tracking-widest text-[#4A5A52] font-semibold">
                  সর্বমোট জিপিএ (GPA)
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold text-[#084A2E] font-serif tracking-tight">
                  {sscResult.finalGpa.toFixed(2)}
                </div>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  <span className="text-sm font-semibold text-[#34443B]">লেটার গ্রেড:</span>
                  <span className="px-3 py-0.5 text-base font-extrabold bg-[#084A2E] text-[#FFFFFF] font-mono shadow-xs">
                    {sscResult.letterGrade}
                  </span>
                  <span className="text-xs text-[#4A5A52] font-mono">(আউট অব ৫.০০)</span>
                </div>
              </div>

              {/* Failed Mandatory Subject Alert if applicable */}
              {sscResult.hasFailedMandatory && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 space-y-1 rounded-2xl">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>বাধ্যতামূলক বিষয়ে অনুত্তীর্ণ!</span>
                  </div>
                  <p>
                    শিক্ষা বোর্ডের নিয়ম অনুযায়ী, যেকোনো আবশ্যিক বিষয়ে F গ্রেড (০.০০) পেলে সামগ্রিক
                    ফলাফল অকৃতকার্য বা ফেল হিসেবে গণ্য হয়। অনুত্তীর্ণ বিষয়:{' '}
                    <strong>{sscResult.failedSubjects.join(', ')}</strong>
                  </p>
                </div>
              )}

              {/* Stats Breakdown */}
              <div className="space-y-2.5 text-xs text-[#34443B] border-t border-[#D5E4DB] pt-4">
                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">বাধ্যতামূলক বিষয় সংখ্যা:</span>
                  <span className="font-bold text-[#0F1F17]">
                    {toBanglaNum(sscResult.mandatoryCount)}টি
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">বাধ্যতামূলক বিষয়ের মোট পয়েন্ট:</span>
                  <span className="font-mono font-semibold text-[#0F1F17]">
                    {(sscResult.totalPoints - sscResult.fourthSubjectBonus).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">৪র্থ বিষয়ের অতিরিক্ত বোনাস:</span>
                  <span className="font-mono font-bold text-[#0B5D3B]">
                    +{sscResult.fourthSubjectBonus.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                  <span className="text-[#4A5A52]">সর্বমোট সমন্বিত পয়েন্ট:</span>
                  <span className="font-mono font-bold text-[#084A2E]">
                    {sscResult.totalPoints.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#4A5A52]">৪র্থ বিষয় ছাড়া মূল জিপিএ:</span>
                  <span className="font-mono text-[#34443B]">
                    {sscResult.gpaWithoutFourth.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyResult}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ফলাফল কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: UNIVERSITY CGPA (4.00 SCALE, CREDIT HOUR BASED)   */}
      {/* ======================================================== */}
      {activeTab === 'university' && (
        <div className="space-y-6">
          {/* Sub-mode switcher: Course-wise vs Multi-Semester */}
          <div className="flex items-center space-x-3 bg-[#FFFFFF] border border-[#D5E4DB] p-2 rounded-lg">
            <span className="text-xs font-bold text-[#084A2E] font-serif pl-2">হিসাবের ধরন:</span>
            <button
              type="button"
              onClick={() => setUniMode('courses')}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                uniMode === 'courses'
                  ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                  : 'bg-[#F0F4F2] text-[#34443B] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
              }`}
            >
              কোর্স-ভিত্তিক হিসাব (এক সেমিস্টার GPA)
            </button>
            <button
              type="button"
              onClick={() => setUniMode('semesters')}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                uniMode === 'semesters'
                  ? 'bg-[#0B5D3B] text-white border-[#0B5D3B]'
                  : 'bg-[#F0F4F2] text-[#34443B] border-[#D5E4DB] hover:bg-[#D5E4DB]/50'
              }`}
            >
              সেমিস্টার-ভিত্তিক হিসাব (সামগ্রিক কিউমুলেটিভ CGPA)
            </button>
          </div>

          {/* Sub-mode A: Course-wise Single Semester CGPA */}
          {uniMode === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Courses Input List (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-4 shadow-xs rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                    <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                      <Calculator className="w-4 h-4 text-[#0B5D3B]" />
                      <span>কোর্স তালিকা (ক্রেডিট আওয়ার ও গ্রেড)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUniCourses(DEFAULT_UNIVERSITY_COURSES)}
                      className="text-xs text-[#084A2E] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ডিফল্ট রিলোড</span>
                    </button>
                  </div>

                  {/* Header Row */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-[#4A5A52] uppercase tracking-wider px-2">
                    <div className="col-span-5">কোর্সের নাম বা কোড</div>
                    <div className="col-span-3 text-center">ক্রেডিট আওয়ার</div>
                    <div className="col-span-3 text-center">প্রাপ্ত গ্রেড</div>
                    <div className="col-span-1 text-right">মুছুন</div>
                  </div>

                  {/* Course rows */}
                  <div className="space-y-3">
                    {uniCourses.map((course, idx) => (
                      <div
                        key={course.id}
                        className={`p-3 border transition-colors ${
                          course.grade === 'F'
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-[#FFFFFF] border-[#D5E4DB]'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          <div className="sm:col-span-5 flex items-center space-x-2">
                            <span className="text-xs font-mono text-[#4A5A52] w-5 shrink-0">
                              {toBanglaNum(idx + 1)}.
                            </span>
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => handleUpdateUniCourseName(course.id, e.target.value)}
                              placeholder="কোর্সের নাম"
                              className="w-full px-2.5 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="sm:hidden block text-[11px] text-[#4A5A52] mb-1">
                              ক্রেডিট আওয়ার:
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="12"
                              value={course.credits}
                              onChange={(e) => handleUpdateUniCourseCredits(course.id, e.target.value)}
                              placeholder="যেমন: ৩.০"
                              className="w-full text-center px-2 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-mono rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="sm:hidden block text-[11px] text-[#4A5A52] mb-1">
                              লেটার গ্রেড:
                            </label>
                            <select
                              value={course.grade}
                              onChange={(e) =>
                                handleUpdateUniCourseGrade(course.id, e.target.value as UniversityGrade)
                              }
                              className="w-full px-2 py-1.5 text-xs bg-[#FFFFFF] border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-semibold text-[#084A2E] rounded-lg"
                            >
                              {UNIVERSITY_GRADE_OPTIONS.map((opt) => (
                                <option key={opt.grade} value={opt.grade}>
                                  {opt.grade} ({opt.point.toFixed(2)}) [{opt.marksPercent}]
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveUniCourse(course.id)}
                              disabled={uniCourses.length <= 1}
                              className={`p-1.5 border transition-colors cursor-pointer ${
                                uniCourses.length <= 1
                                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                  : 'text-[#c8342a] border-[#D5E4DB] hover:bg-red-50'
                              }`}
                              title="কোর্স মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline calculation preview */}
                        <div className="mt-2 pt-1.5 border-t border-[#D5E4DB]/60 text-[11px] text-[#4A5A52] flex justify-between">
                          <span>
                            গ্রেড পয়েন্ট: <strong>{course.gradePoint.toFixed(2)}</strong>
                          </span>
                          <span className="font-mono text-[#084A2E]">
                            পয়েন্ট × ক্রেডিট ={' '}
                            <strong>
                              {(
                                (typeof course.credits === 'number' ? course.credits : 0) *
                                course.gradePoint
                              ).toFixed(2)}
                            </strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add course button */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleAddUniCourse}
                      className="inline-flex items-center space-x-1.5 border border-[#0B5D3B] bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 text-[#084A2E] px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ নতুন কোর্স যোগ করুন</span>
                    </button>

                    <span className="text-xs text-[#4A5A52]">
                      মোট কোর্স: {toBanglaNum(uniCourses.length)}টি
                    </span>
                  </div>
                </div>

                {/* UGC Grading Scale Reference */}
                <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-4 text-xs space-y-2 rounded-2xl">
                  <span className="font-bold text-[#084A2E] font-serif flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-[#0B5D3B]" />
                    <span>ইউজিসি (UGC) প্রমিত গ্রেডিং স্কেল নির্দেশিকা:</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-[11px]">
                    {UNIVERSITY_GRADE_OPTIONS.map((g) => (
                      <div key={g.grade} className="p-1.5 bg-[#F0F4F2]/50 border border-[#D5E4DB] rounded-lg">
                        <div className="font-bold text-[#084A2E] text-xs">{g.grade}</div>
                        <div className="font-mono text-[#0B5D3B] font-semibold">{g.point.toFixed(2)}</div>
                        <div className="text-[10px] text-[#4A5A52]">{g.marksPercent}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#4A5A52] italic pt-1">
                    * নোট: কিছু প্রাইভেট বা স্বায়ত্তশাসিত বিশ্ববিদ্যালয়ের নিজস্ব সামান্য ভিন্ন গ্রেডিং স্কেল থাকতে পারে।
                  </p>
                </div>
              </div>

              {/* Result Card for Courses (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#FFFFFF] border-2 border-[#0B5D3B] p-6 space-y-5 shadow-sm sticky top-6 rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#0B5D3B]" />
                      <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider">
                        সেমিস্টার সিজিপিএ (Semester CGPA)
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#4A5A52]">স্কেল: ৪.০০</span>
                  </div>

                  {/* Big Number */}
                  <div className="text-center py-4 bg-[#F0F4F2]/50 border border-[#D5E4DB] space-y-2 rounded-lg">
                    <div className="text-xs uppercase tracking-widest text-[#4A5A52] font-semibold">
                      প্রাপ্ত সিজিপিএ (CGPA / SGPA)
                    </div>
                    <div className="text-5xl sm:text-6xl font-extrabold text-[#084A2E] font-serif tracking-tight">
                      {uniCourseResult.cgpa.toFixed(2)}
                    </div>
                    <div className="text-xs text-[#4A5A52] font-mono">
                      (মোট ৪.০০ স্কেলের মধ্যে)
                    </div>
                  </div>

                  {/* Warning if any F grade */}
                  {uniCourseResult.hasFailCourse && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1 rounded-2xl">
                      <div className="font-bold flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>অনুত্তীর্ণ কোর্স রয়েছে (F Grade)</span>
                      </div>
                      <p>
                        যেকোনো কোর্সে F গ্রেড পেলে সেই কোর্সের ক্রেডিট অর্জন হয় না এবং রিটেক/ইম্প্রুভমেন্ট দিতে হয়।
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2.5 text-xs text-[#34443B] border-t border-[#D5E4DB] pt-4">
                    <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                      <span className="text-[#4A5A52]">মোট ক্রেডিট আওয়ার (Attempted):</span>
                      <span className="font-mono font-bold text-[#0F1F17]">
                        {uniCourseResult.totalCredits.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                      <span className="text-[#4A5A52]">অর্জিত ক্রেডিট (Earned Credits):</span>
                      <span className="font-mono font-bold text-[#0B5D3B]">
                        {uniCourseResult.earnedCredits.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#4A5A52]">মোট কোয়ালিটি পয়েন্ট (Σ Credit × GP):</span>
                      <span className="font-mono font-bold text-[#084A2E]">
                        {uniCourseResult.totalWeightedPoints.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'ফলাফল কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-mode B: Multi-Semester Overall Cumulative CGPA */}
          {uniMode === 'semesters' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Semester List (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#FFFFFF] border border-[#D5E4DB] p-5 space-y-4 shadow-xs rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                    <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider flex items-center space-x-1.5">
                      <Calculator className="w-4 h-4 text-[#0B5D3B]" />
                      <span>সেমিস্টার তালিকা (GPA ও ক্রেডিট আওয়ার)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUniSemesters(DEFAULT_UNIVERSITY_SEMESTERS)}
                      className="text-xs text-[#084A2E] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ডিফল্ট রিলোড</span>
                    </button>
                  </div>

                  {/* Header Row */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-[#4A5A52] uppercase tracking-wider px-2">
                    <div className="col-span-5">সেমিস্টারের নাম</div>
                    <div className="col-span-3 text-center">সেমিস্টার GPA (৪.০০ স্কেল)</div>
                    <div className="col-span-3 text-center">মোট ক্রেডিট আওয়ার</div>
                    <div className="col-span-1 text-right">মুছুন</div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-3">
                    {uniSemesters.map((sem, idx) => (
                      <div
                        key={sem.id}
                        className="p-3 border bg-[#FFFFFF] border-[#D5E4DB] transition-colors rounded-2xl"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          <div className="sm:col-span-5 flex items-center space-x-2">
                            <span className="text-xs font-mono text-[#4A5A52] w-5 shrink-0">
                              {toBanglaNum(idx + 1)}.
                            </span>
                            <input
                              type="text"
                              value={sem.name}
                              onChange={(e) => handleUpdateUniSemesterName(sem.id, e.target.value)}
                              placeholder="সেমিস্টারের নাম"
                              className="w-full px-2.5 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="sm:hidden block text-[11px] text-[#4A5A52] mb-1">
                              সেমিস্টার GPA:
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="4.0"
                              value={sem.gpa}
                              onChange={(e) => handleUpdateUniSemesterGpa(sem.id, e.target.value)}
                              placeholder="যেমন: ৩.৭৫"
                              className="w-full text-center px-2 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-mono font-semibold text-[#084A2E] rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="sm:hidden block text-[11px] text-[#4A5A52] mb-1">
                              মোট ক্রেডিট:
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="40"
                              value={sem.credits}
                              onChange={(e) => handleUpdateUniSemesterCredits(sem.id, e.target.value)}
                              placeholder="যেমন: ১৮.০"
                              className="w-full text-center px-2 py-1.5 text-xs bg-[#F0F4F2]/30 border border-[#D5E4DB] focus:border-[#0B5D3B] focus:outline-hidden font-mono rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveUniSemester(sem.id)}
                              disabled={uniSemesters.length <= 1}
                              className={`p-1.5 border transition-colors cursor-pointer ${
                                uniSemesters.length <= 1
                                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                  : 'text-[#c8342a] border-[#D5E4DB] hover:bg-red-50'
                              }`}
                              title="সেমিস্টার মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Weighted Points note */}
                        <div className="mt-2 pt-1.5 border-t border-[#D5E4DB]/60 text-[11px] text-[#4A5A52] flex justify-between">
                          <span>
                            GPA {typeof sem.gpa === 'number' ? sem.gpa.toFixed(2) : '০.০০'} ×{' '}
                            {typeof sem.credits === 'number' ? sem.credits.toFixed(1) : '০'} ক্রেডিট
                          </span>
                          <span className="font-mono text-[#084A2E]">
                            পয়েন্ট ={' '}
                            <strong>
                              {(
                                (typeof sem.gpa === 'number' ? sem.gpa : 0) *
                                (typeof sem.credits === 'number' ? sem.credits : 0)
                              ).toFixed(2)}
                            </strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add semester button */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleAddUniSemester}
                      className="inline-flex items-center space-x-1.5 border border-[#0B5D3B] bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 text-[#084A2E] px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ নতুন সেমিস্টার যোগ করুন</span>
                    </button>

                    <span className="text-xs text-[#4A5A52]">
                      মোট সেমিস্টার: {toBanglaNum(uniSemesters.length)}টি
                    </span>
                  </div>
                </div>

                <div className="border border-[#D5E4DB] bg-[#FFFFFF] p-4 text-xs space-y-1.5 rounded-2xl">
                  <div className="font-semibold text-[#084A2E] flex items-center space-x-1.5 font-serif">
                    <Info className="w-4 h-4 text-[#0B5D3B]" />
                    <span>সামগ্রিক সিজিপিএ (Cumulative CGPA) গণনার নিয়ম:</span>
                  </div>
                  <p className="text-[#34443B] leading-relaxed">
                    সরাসরি সেমিস্টার জিপিএ-গুলোর সাধারণ গড় করলে ফলাফল নির্ভুল হয় না, কারণ প্রতিটি সেমিস্টারের
                    মোট ক্রেডিট সমান থাকে না। এখানে প্রতিটি সেমিস্টারের ক্রেডিট দ্বারা গুণ করে ওয়েটেড গড়
                    (Weighted Cumulative Average) প্রদান করা হয়।
                  </p>
                </div>
              </div>

              {/* Cumulative Result Card (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#FFFFFF] border-2 border-[#0B5D3B] p-6 space-y-5 shadow-sm sticky top-6 rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D5E4DB]">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#0B5D3B]" />
                      <span className="text-xs font-bold text-[#084A2E] font-serif uppercase tracking-wider">
                        সামগ্রিক সিজিপিএ (Cumulative CGPA)
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#4A5A52]">স্কেল: ৪.০০</span>
                  </div>

                  {/* Big Number */}
                  <div className="text-center py-4 bg-[#F0F4F2]/50 border border-[#D5E4DB] space-y-2 rounded-lg">
                    <div className="text-xs uppercase tracking-widest text-[#4A5A52] font-semibold">
                      সর্বমোট কিউমুলেটিভ সিজিপিএ
                    </div>
                    <div className="text-5xl sm:text-6xl font-extrabold text-[#084A2E] font-serif tracking-tight">
                      {uniSemesterResult.overallCgpa.toFixed(2)}
                    </div>
                    <div className="text-xs text-[#4A5A52] font-mono">
                      (৪.০০ স্কেলের মধ্যে সর্বমোট গড়)
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 text-xs text-[#34443B] border-t border-[#D5E4DB] pt-4">
                    <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                      <span className="text-[#4A5A52]">মোট সেমিস্টার সংখ্যা:</span>
                      <span className="font-bold text-[#0F1F17]">
                        {toBanglaNum(uniSemesters.length)}টি
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#D5E4DB]/60">
                      <span className="text-[#4A5A52]">সর্বমোট সম্পন্ন ক্রেডিট:</span>
                      <span className="font-mono font-bold text-[#0B5D3B]">
                        {uniSemesterResult.totalCredits.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#4A5A52]">মোট কোয়ালিটি পয়েন্ট:</span>
                      <span className="font-mono font-bold text-[#084A2E]">
                        {uniSemesterResult.totalWeightedPoints.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#084A2E] hover:bg-[#0B5D3B] text-[#FFFFFF] font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'ফলাফল কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic CMS Sections (FAQs, Features, Steps, Guidelines, Markdown, etc.) */}
      <CmsDynamicContent content={pageContent} />

      {/* Cross-Linking Section ("আরও দরকারি টুলস") */}
      <RelatedTools currentToolId="gpa-calculator" />
    </div>
  );
};
