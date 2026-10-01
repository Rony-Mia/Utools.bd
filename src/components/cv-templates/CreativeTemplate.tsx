import React from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Languages as LanguagesIcon,
  Users,
  CheckCircle2,
} from 'lucide-react';
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

export const CreativeTemplate: React.FC<TemplateProps> = ({
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
    <div className="w-full bg-white text-slate-800 font-sans leading-relaxed text-[13px] shadow-sm print:shadow-none min-h-[1123px] flex flex-col justify-between">
      <div>

        {/* Creative Angled Color-Blocked Header Band */}
        {hasSection('header') && (
          <>
            <header
              data-cv-section="header"
              className="relative bg-[#0f172a] text-white p-6 sm:p-8 overflow-hidden break-inside-avoid"
            >
              <div
                className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/20 via-amber-500/5 to-transparent pointer-events-none transform skew-x-12 translate-x-12"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold mb-2">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Curriculum Vitae</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {personalInfo.fullName || (language === 'bn' ? 'প্রার্থীর নাম' : 'Full Name')}
                  </h2>

                  {personalInfo.designationOrTitle && (
                    <p className="text-xs sm:text-sm font-semibold text-amber-400 mt-1">
                      {personalInfo.designationOrTitle}
                    </p>
                  )}

                  {/* Contact Pills */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 mt-3.5 text-xs text-slate-300">
                    {personalInfo.phone && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{personalInfo.phone}</span>
                      </span>
                    )}
                    {personalInfo.email && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{personalInfo.email}</span>
                      </span>
                    )}
                    {personalInfo.presentAddress && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{personalInfo.presentAddress}</span>
                      </span>
                    )}
                    {personalInfo.linkedinOrWebsite && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{personalInfo.linkedinOrWebsite}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Circular Photo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-amber-400/80 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
                  {personalInfo.photoUrl ? (
                    <img
                      src={personalInfo.photoUrl}
                      alt={personalInfo.fullName}
                      width={112}
                      height={112}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-amber-300/80">
                      <User className="w-12 h-12 stroke-[1.5]" />
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Vibrant Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
          </>
        )}

        {/* Main 2-Column Creative Body */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
          {/* Left Column (~34% width): Skills, Languages, Personal Details */}
          <div className="w-full sm:w-[34%] space-y-6 shrink-0">
            {/* Skills */}
            {hasSection('skills') && skills && skills.length > 0 && (
              <section data-cv-section="skills" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-3">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.skills}
                  </h2>
                </div>

                <div className="space-y-2">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{skill}</span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {hasSection('languages') && languages && languages.length > 0 && (
              <section data-cv-section="languages" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-3">
                  <LanguagesIcon className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.languages}
                  </h2>
                </div>

                <div className="space-y-1.5 text-xs">
                  {languages.map((lang, idx) => (
                    <div
                      key={lang.id || idx}
                      className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/80"
                    >
                      <span className="font-semibold text-slate-800">{lang.name}</span>
                      <span className="text-[11px] font-mono text-amber-800 font-medium">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Personal Details */}
            {hasSection('personalDetails') && (
              <section data-cv-section="personalDetails" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-3">
                  <User className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.personalDetails}
                  </h2>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  {personalInfo.fatherName && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.fatherName}:</span>
                      <span>{personalInfo.fatherName}</span>
                    </div>
                  )}
                  {personalInfo.motherName && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.motherName}:</span>
                      <span>{personalInfo.motherName}</span>
                    </div>
                  )}
                  {personalInfo.dateOfBirth && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.dateOfBirth}:</span>
                      <span>{personalInfo.dateOfBirth}</span>
                    </div>
                  )}
                  {personalInfo.gender && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.gender}:</span>
                      <span>{personalInfo.gender}</span>
                    </div>
                  )}
                  {personalInfo.maritalStatus && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.maritalStatus}:</span>
                      <span>{personalInfo.maritalStatus}</span>
                    </div>
                  )}
                  {personalInfo.nationalId && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.nationalId}:</span>
                      <span className="font-mono text-[11px]">{personalInfo.nationalId}</span>
                    </div>
                  )}
                  {personalInfo.bloodGroup && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{t.bloodGroup}:</span>
                      <span className="font-bold text-rose-600">{personalInfo.bloodGroup}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (~66% width): Objective, Experience, Education, References */}
          <div className="w-full sm:w-[66%] space-y-6">
            {/* Career Objective */}
            {hasSection('objective') && personalInfo.careerObjective && (
              <section data-cv-section="objective" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.careerObjective}
                  </h2>
                </div>

                <div className="bg-amber-50/50 border-l-4 border-amber-500 p-3.5 rounded-r-lg">
                  <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed text-left">
                    {personalInfo.careerObjective}
                  </p>
                </div>
              </section>
            )}

            {/* Work Experience */}
            {hasSection('experience') && experience && experience.length > 0 && (
              <section data-cv-section="experience" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-4">
                  <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.experience}
                  </h2>
                </div>

                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="border-l-2 border-amber-400 pl-4 py-0.5 break-inside-avoid relative"
                    >
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500" />
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h3 className="font-bold text-slate-900 text-sm">{exp.designation}</h3>
                        <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded w-fit">
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

            {/* Educational Qualifications */}
            {hasSection('education') && education && education.length > 0 && (
              <section data-cv-section="education" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-4">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.education}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 break-inside-avoid"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{edu.degree}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">{edu.institution}</p>
                        {edu.boardOrMajor && (
                          <p className="text-[11px] text-slate-500">{edu.boardOrMajor}</p>
                        )}
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {edu.passingYear}
                        </span>
                        {edu.result && (
                          <p className="text-xs font-bold text-amber-700 mt-1">
                            {t.result}: {edu.result}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* References */}
            {hasSection('references') && references && references.length > 0 && (
              <section data-cv-section="references" className="break-inside-avoid">
                <div className="flex items-center gap-2 border-b-2 border-amber-500 pb-1.5 mb-3">
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900">
                    {t.references}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {references.map((ref, idx) => (
                    <div
                      key={ref.id || idx}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 break-inside-avoid"
                    >
                      <p className="font-bold text-slate-900 text-xs">{ref.name}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {ref.designation}, {ref.organization}
                      </p>
                      <p className="text-slate-500 text-[11px] font-mono mt-1">{ref.phone}</p>
                      {ref.email && <p className="text-slate-500 text-[11px] font-mono">{ref.email}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Signature & Date Footer */}
      {hasSection('declaration') && (
        <footer
          data-cv-section="declaration"
          className="mt-8 p-6 sm:p-8 border-t border-slate-200 flex justify-between items-end text-xs break-inside-avoid"
        >
          <div className="text-slate-500 text-[11px]">
            <p>{language === 'bn' ? 'তারিখ: ....................' : 'Date: ....................'}</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-slate-800 mb-1.5"></div>
            <p className="font-bold text-slate-800 text-[11px]">{t.signature}</p>
          </div>
        </footer>
      )}
    </div>
  );
};
