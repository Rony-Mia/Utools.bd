import React from 'react';
import { User, Phone, Mail, MapPin, Globe, Briefcase, GraduationCap, Users } from 'lucide-react';
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

export const ModernTemplate: React.FC<TemplateProps> = ({
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
    <div className="w-full bg-white text-slate-800 font-sans leading-relaxed text-[13px] shadow-sm print:shadow-none flex flex-col md:flex-row items-stretch min-h-[1123px]">
      {/* Left Sidebar (32% width) with deep forest green background */}
      <aside className="w-full md:w-[32%] bg-[#083f2a] text-slate-100 p-6 sm:p-7 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Page 1: Full Photo & Contact */}
          {pageNumber === 1 || hasSection('header') ? (
            <>
              {/* Circular Photo */}
              <div data-cv-section="header" className="flex flex-col items-center break-inside-avoid">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-emerald-600/40 shadow-lg overflow-hidden bg-emerald-950/80 flex items-center justify-center">
                  {personalInfo.photoUrl ? (
                    <img
                      src={personalInfo.photoUrl}
                      alt={personalInfo.fullName}
                      width={128}
                      height={128}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950 text-emerald-300/70">
                      <User className="w-14 h-14 stroke-[1.5]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xs font-bold text-emerald-300 border-b border-emerald-700/60 pb-1 mb-3">
                  {t.contact}
                </h2>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {personalInfo.phone && (
                    <li className="flex items-start gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="break-all">{personalInfo.phone}</span>
                    </li>
                  )}
                  {personalInfo.email && (
                    <li className="flex items-start gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="break-all">{personalInfo.email}</span>
                    </li>
                  )}
                  {personalInfo.presentAddress && (
                    <li className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{personalInfo.presentAddress}</span>
                    </li>
                  )}
                  {personalInfo.linkedinOrWebsite && (
                    <li className="flex items-start gap-2.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="break-all">{personalInfo.linkedinOrWebsite}</span>
                    </li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            /* Page 2+ Sidebar Header - Only Page Number */
            <div className="border-b border-emerald-700/60 pb-2">
              <span className="text-[11px] font-mono text-emerald-300 block">
                {language === 'bn' ? `পৃষ্ঠা ${toBengaliNum(pageNumber)}` : `Page ${pageNumber}`} /{' '}
                {language === 'bn' ? toBengaliNum(totalPages) : totalPages}
              </span>
            </div>
          )}

          {/* Key Skills in sidebar if active on this page */}
          {hasSection('skills') && skills && skills.length > 0 && (
            <div data-cv-section="skills" className="break-inside-avoid">
              <h2 className="text-xs font-bold text-emerald-300 border-b border-emerald-700/60 pb-1 mb-3">
                {t.skills}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-900/70 text-slate-200 px-2 py-1 rounded text-[11px] font-medium border border-emerald-700/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages in sidebar if active on this page */}
          {hasSection('languages') && languages && languages.length > 0 && (
            <div data-cv-section="languages" className="break-inside-avoid">
              <h2 className="text-xs font-bold text-emerald-300 border-b border-emerald-700/60 pb-1 mb-2.5">
                {t.languages}
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {languages.map((lang, idx) => (
                  <li key={lang.id || idx} className="flex justify-between">
                    <span>{lang.name}</span>
                    <span className="text-emerald-300 text-[11px] font-mono">{lang.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Minimal watermark footer in sidebar */}
        <div className="pt-6 border-t border-emerald-800/40 text-[10px] text-emerald-400/70 font-mono">
          <span>
            {language === 'bn' ? `পৃষ্ঠা ${toBengaliNum(pageNumber)}` : `Page ${pageNumber}`} /{' '}
            {language === 'bn' ? toBengaliNum(totalPages) : totalPages}
          </span>
        </div>
      </aside>

      {/* Right Content Area (68% width) */}
      <main className="flex-1 p-6 sm:p-9 flex flex-col justify-between space-y-6">
        <div>
          {/* Header Name & Title */}
          {hasSection('header') && (
            <div data-cv-section="header" className="border-b-2 border-slate-100 pb-4 mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {personalInfo.fullName || (language === 'bn' ? 'প্রার্থীর নাম' : 'Full Name')}
              </h2>
              {personalInfo.designationOrTitle && (
                <p className="text-sm font-semibold text-emerald-700 mt-1">
                  {personalInfo.designationOrTitle}
                </p>
              )}

              {personalInfo.careerObjective && (
                <div className="mt-3 bg-emerald-50/60 border-l-3 border-emerald-600 p-3 rounded-r text-slate-700 text-xs leading-relaxed text-left">
                  {personalInfo.careerObjective}
                </div>
              )}
            </div>
          )}

          {/* Running header for page 2+ when header is not on this page */}
          {pageNumber > 1 && !hasSection('header') && (
            <div className="border-b border-slate-200 pb-2 mb-4 text-right text-[11px] font-mono text-slate-500">
              <span>
                {language === 'bn' ? `পৃষ্ঠা ${toBengaliNum(pageNumber)}` : `Page ${pageNumber}`} /{' '}
                {language === 'bn' ? toBengaliNum(totalPages) : totalPages}
              </span>
            </div>
          )}

          {/* Work Experience Timeline */}
          {hasSection('experience') && experience && experience.length > 0 && (
            <section data-cv-section="experience" className="mb-6 break-inside-avoid">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs font-bold text-slate-900">
                  {t.experience}
                </h2>
              </div>

              <div className="border-l-2 border-emerald-200 ml-2 pl-4 space-y-4 relative">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="relative break-inside-avoid">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-700 ring-4 ring-white" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h3 className="font-bold text-slate-900 text-[13px]">{exp.designation}</h3>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{exp.company}</p>
                    {exp.responsibilities && (
                      <p className="text-slate-700 mt-1.5 text-xs whitespace-pre-line leading-relaxed">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educational Qualifications Timeline */}
          {hasSection('education') && education && education.length > 0 && (
            <section data-cv-section="education" className="mb-6 break-inside-avoid">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs font-bold text-slate-900">
                  {t.education}
                </h2>
              </div>

              <div className="border-l-2 border-emerald-200 ml-2 pl-4 space-y-3.5 relative">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="relative break-inside-avoid">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-700 ring-4 ring-white" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h3 className="font-bold text-slate-900 text-[13px]">{edu.degree}</h3>
                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                        {edu.passingYear}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      {edu.institution} {edu.boardOrMajor && `• ${edu.boardOrMajor}`}
                    </p>
                    {edu.result && (
                      <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        {t.result}: {edu.result}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personal Details in 2-Column Grid (if on this page) */}
          {hasSection('personalDetails') && (
            <section data-cv-section="personalDetails" className="mb-6 break-inside-avoid">
              <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
                {t.personalDetails}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700">
                {personalInfo.fatherName && (
                  <p className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{t.fatherName}:</span>
                    <span>{personalInfo.fatherName}</span>
                  </p>
                )}
                {personalInfo.motherName && (
                  <p className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{t.motherName}:</span>
                    <span>{personalInfo.motherName}</span>
                  </p>
                )}
                {personalInfo.dateOfBirth && (
                  <p className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{t.dateOfBirth}:</span>
                    <span>{personalInfo.dateOfBirth}</span>
                  </p>
                )}
                {personalInfo.gender && (
                  <p className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{t.gender}:</span>
                    <span>{personalInfo.gender}</span>
                  </p>
                )}
                {personalInfo.maritalStatus && (
                  <p className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{t.maritalStatus}:</span>
                    <span>{personalInfo.maritalStatus}</span>
                  </p>
                )}
                {personalInfo.nationalId && (
                  <p className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{t.nationalId}:</span>
                    <span className="font-mono">{personalInfo.nationalId}</span>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* References */}
          {hasSection('references') && references && references.length > 0 && (
            <section data-cv-section="references" className="mb-4 break-inside-avoid">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs font-bold text-slate-900">
                  {t.references}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {references.map((ref, idx) => (
                  <div
                    key={ref.id || idx}
                    className="border border-slate-200 bg-slate-50/50 p-3 rounded-xs border-l-3 border-l-emerald-700 break-inside-avoid"
                  >
                    <p className="font-bold text-slate-900 text-xs">{ref.name}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {ref.designation}, {ref.organization}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1 font-mono">{ref.phone}</p>
                    {ref.email && <p className="text-slate-500 text-[11px] font-mono">{ref.email}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Signature Line */}
        {hasSection('declaration') && (
          <div
            data-cv-section="declaration"
            className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs break-inside-avoid"
          >
            <div className="text-slate-500 text-[11px]">
              <p>{language === 'bn' ? 'তারিখ: ....................' : 'Date: ....................'}</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-slate-700 mb-1"></div>
              <p className="font-semibold text-slate-800 text-[11px]">{t.signature}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
