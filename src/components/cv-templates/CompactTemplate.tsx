import React from 'react';
import { User, Phone, Mail, MapPin, Globe, GraduationCap, Briefcase, Sparkles, BookOpen } from 'lucide-react';
import { CvData, CvLanguage, CvSectionId } from '../../types.ts';
import { CV_LABELS } from '../../data/cvDefaults.ts';

interface TemplateProps {
  data: CvData;
  language: CvLanguage;
  sections?: CvSectionId[];
  pageNumber?: number;
  totalPages?: number;
}

const toBengaliNum = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bnDigits[parseInt(d, 10)] || d).join('');
};

export const CompactTemplate: React.FC<TemplateProps> = ({
  data,
  language,
  sections,
  pageNumber = 1,
  totalPages = 1,
}) => {
  const t = CV_LABELS[language] || CV_LABELS.bn;
  const { personalInfo, education, experience, skills, languages, references } = data;

  const hasSection = (id: CvSectionId) => !sections || sections.includes(id);

  return (
    <div className="w-full bg-white text-slate-800 font-sans leading-normal text-xs shadow-sm print:shadow-none min-h-[1123px] flex flex-col justify-between">
      <div>

        {/* Strong Top Header Band on Page 1 */}
        {hasSection('header') && (
          <header
            data-cv-section="header"
            className="bg-[#1e293b] text-white p-5 sm:p-6 border-b-4 border-emerald-600 break-inside-avoid"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {personalInfo.fullName || (language === 'bn' ? 'প্রার্থীর নাম' : 'Full Name')}
                </h2>

                {personalInfo.designationOrTitle && (
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {personalInfo.designationOrTitle}
                  </p>
                )}

                {/* Compact Contact Strip in Header */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-[11px] text-slate-300">
                  {personalInfo.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{personalInfo.phone}</span>
                    </span>
                  )}
                  {personalInfo.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{personalInfo.email}</span>
                    </span>
                  )}
                  {personalInfo.presentAddress && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{personalInfo.presentAddress}</span>
                    </span>
                  )}
                  {personalInfo.linkedinOrWebsite && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{personalInfo.linkedinOrWebsite}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Photo in Header Band with Silhouette Fallback */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded border-2 border-white/80 shadow-md bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                {personalInfo.photoUrl ? (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.fullName}
                    width={96}
                    height={112}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                    <User className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[9px] mt-1 text-slate-400">
                      {language === 'bn' ? 'ছবি' : 'Photo'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* 2-Column Compact Body Layout */}
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Left Column (35% width, light tinted background) */}
          <div className="w-full sm:w-[36%] bg-slate-50/80 border-r border-slate-200 p-4 sm:p-5 space-y-4 shrink-0">
            {/* Education in Left Column */}
            {hasSection('education') && education && education.length > 0 && (
              <div data-cv-section="education" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.education}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="bg-white p-2 rounded border border-slate-200/80 shadow-2xs break-inside-avoid"
                    >
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-900 text-xs">{edu.degree}</h3>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                          {edu.passingYear}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-0.5">{edu.institution}</p>
                      {edu.boardOrMajor && (
                        <p className="text-[10px] text-slate-500">{edu.boardOrMajor}</p>
                      )}
                      {edu.result && (
                        <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                          {t.result}: {edu.result}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills in Left Column */}
            {hasSection('skills') && skills && skills.length > 0 && (
              <div data-cv-section="skills" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.skills}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages in Left Column */}
            {hasSection('languages') && languages && languages.length > 0 && (
              <div data-cv-section="languages" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.languages}
                  </h2>
                </div>
                <div className="space-y-1">
                  {languages.map((lang, idx) => (
                    <div
                      key={lang.id || idx}
                      className="flex justify-between text-[11px] bg-white p-1.5 rounded border border-slate-200/60"
                    >
                      <span className="font-semibold text-slate-800">{lang.name}</span>
                      <span className="text-slate-500 font-medium">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Details in Left Column */}
            {hasSection('personalDetails') && (
              <div data-cv-section="personalDetails" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2">
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.personalDetails}
                  </h2>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  {personalInfo.fatherName && (
                    <p className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="font-medium text-slate-900">{t.fatherName}:</span>
                      <span>{personalInfo.fatherName}</span>
                    </p>
                  )}
                  {personalInfo.motherName && (
                    <p className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="font-medium text-slate-900">{t.motherName}:</span>
                      <span>{personalInfo.motherName}</span>
                    </p>
                  )}
                  {personalInfo.dateOfBirth && (
                    <p className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="font-medium text-slate-900">{t.dateOfBirth}:</span>
                      <span>{personalInfo.dateOfBirth}</span>
                    </p>
                  )}
                  {personalInfo.gender && (
                    <p className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="font-medium text-slate-900">{t.gender}:</span>
                      <span>{personalInfo.gender}</span>
                    </p>
                  )}
                  {personalInfo.maritalStatus && (
                    <p className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="font-medium text-slate-900">{t.maritalStatus}:</span>
                      <span>{personalInfo.maritalStatus}</span>
                    </p>
                  )}
                  {personalInfo.nationalId && (
                    <p className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="font-medium text-slate-900">{t.nationalId}:</span>
                      <span className="font-mono text-[10px]">{personalInfo.nationalId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (65% width) */}
          <div className="w-full sm:w-[64%] p-4 sm:p-6 space-y-4">
            {/* Career Objective */}
            {hasSection('objective') && personalInfo.careerObjective && (
              <div data-cv-section="objective" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.careerObjective}
                  </h2>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed text-left">
                  {personalInfo.careerObjective}
                </p>
              </div>
            )}

            {/* Work Experience in Right Column */}
            {hasSection('experience') && experience && experience.length > 0 && (
              <div data-cv-section="experience" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.experience}
                  </h2>
                </div>

                <div className="space-y-3">
                  {experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="border-l-2 border-emerald-600 pl-3 py-0.5 break-inside-avoid"
                    >
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-900 text-xs">{exp.designation}</h3>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-800">{exp.company}</p>
                      {exp.responsibilities && (
                        <p className="text-slate-600 text-xs mt-1 whitespace-pre-line leading-relaxed">
                          {exp.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permanent Address */}
            {hasSection('personalDetails') && personalInfo.permanentAddress && (
              <div className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.permanentAddress}
                  </h2>
                </div>
                <p className="text-xs text-slate-700">{personalInfo.permanentAddress}</p>
              </div>
            )}

            {/* References */}
            {hasSection('references') && references && references.length > 0 && (
              <div data-cv-section="references" className="break-inside-avoid">
                <div className="flex items-center gap-1.5 border-b border-slate-300 pb-1 mb-2">
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <h2 className="text-[11px] font-bold text-slate-900">
                    {t.references}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {references.map((ref, idx) => (
                    <div
                      key={ref.id || idx}
                      className="bg-slate-50 p-2 rounded border border-slate-200 break-inside-avoid"
                    >
                      <p className="font-bold text-slate-900 text-xs">{ref.name}</p>
                      <p className="text-slate-600 text-[10px]">
                        {ref.designation}, {ref.organization}
                      </p>
                      <p className="text-slate-500 text-[10px] font-mono mt-0.5">{ref.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Declaration & Signature */}
      {hasSection('declaration') && (
        <footer
          data-cv-section="declaration"
          className="mt-8 p-4 sm:p-5 border-t border-slate-200 bg-white flex justify-between items-end text-xs break-inside-avoid"
        >
          <div className="text-slate-500 text-[11px]">
            <p>{language === 'bn' ? 'তারিখ: ....................' : 'Date: ....................'}</p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-slate-700 mb-1"></div>
            <p className="font-semibold text-slate-800 text-[11px]">{t.signature}</p>
          </div>
        </footer>
      )}
    </div>
  );
};
