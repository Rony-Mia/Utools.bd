import React from 'react';
import { User, Phone, Mail, MapPin, Globe } from 'lucide-react';
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

export const ClassicTemplate: React.FC<TemplateProps> = ({
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
    <div className="w-full bg-white text-slate-800 p-8 sm:p-11 font-serif leading-relaxed text-[13px] shadow-sm print:shadow-none print:p-8">
      <div>

        {/* Top Header: Candidate Name, Title, Contact Info & Formal Photo */}
        {hasSection('header') && (
          <div
            data-cv-section="header"
            className="flex items-start justify-between border-b-2 border-slate-800 pb-5 mb-6 break-inside-avoid"
          >
            <div className="flex-1 pr-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {personalInfo.fullName || (language === 'bn' ? 'প্রার্থীর নাম' : 'Full Name')}
              </h2>

              {personalInfo.designationOrTitle && (
                <p className="text-sm font-sans font-semibold text-emerald-800 mt-1">
                  {personalInfo.designationOrTitle}
                </p>
              )}

              {/* Clean contact strip with subtle icons */}
              <div className="font-sans text-xs text-slate-600 mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {personalInfo.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{personalInfo.phone}</span>
                  </span>
                )}
                {personalInfo.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{personalInfo.email}</span>
                  </span>
                )}
                {personalInfo.presentAddress && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{personalInfo.presentAddress}</span>
                  </span>
                )}
                {personalInfo.linkedinOrWebsite && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{personalInfo.linkedinOrWebsite}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Photo Frame */}
            <div className="w-24 h-28 sm:w-28 sm:h-32 border border-slate-300 shadow-xs bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
              {personalInfo.photoUrl ? (
                <img
                  src={personalInfo.photoUrl}
                  alt={personalInfo.fullName}
                  width={112}
                  height={128}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <User className="w-10 h-10 stroke-[1.5]" />
                  <span className="text-[9px] font-sans mt-1 text-slate-500 font-medium">
                    {language === 'bn' ? 'ছবি' : 'Photo'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Objective */}
        {hasSection('objective') && personalInfo.careerObjective && (
          <section data-cv-section="objective" className="mb-5 break-inside-avoid">
            <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
              {t.careerObjective}
            </h2>
            <p className="text-left text-slate-700 text-xs sm:text-[13px] leading-relaxed">
              {personalInfo.careerObjective}
            </p>
          </section>
        )}

        {/* Educational Qualifications */}
        {hasSection('education') && education && education.length > 0 && (
          <section data-cv-section="education" className="mb-5 break-inside-avoid">
            <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              {t.education}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 font-sans text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-semibold break-inside-avoid">
                    <th className="border border-slate-300 px-3 py-2 text-left">{t.degree}</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">{t.institution}</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">{t.board}</th>
                    <th className="border border-slate-300 px-3 py-2 text-center w-20">{t.passingYear}</th>
                    <th className="border border-slate-300 px-3 py-2 text-center w-24">{t.result}</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((edu, idx) => (
                    <tr
                      key={edu.id || idx}
                      className={`break-inside-avoid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">
                        {edu.degree || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                        {edu.institution || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-700">
                        {edu.boardOrMajor || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-800">
                        {edu.passingYear || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-semibold text-slate-900">
                        {edu.result || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Work Experience */}
        {hasSection('experience') && experience && experience.length > 0 && (
          <section data-cv-section="experience" className="mb-5 break-inside-avoid">
            <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
              {t.experience}
            </h2>
            <div className="space-y-3 font-sans">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="text-xs break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-[13px]">{exp.designation}</h3>
                    <span className="text-slate-500 font-medium text-[11px]">{exp.duration}</span>
                  </div>
                  <p className="text-emerald-800 font-semibold text-xs mt-0.5">{exp.company}</p>
                  {exp.responsibilities && (
                    <p className="text-slate-700 mt-1 whitespace-pre-line leading-relaxed text-xs">
                      {exp.responsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {hasSection('skills') && skills && skills.length > 0 && (
          <section data-cv-section="skills" className="mb-5 break-inside-avoid">
            <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
              {t.skills}
            </h2>
            <div className="flex flex-wrap gap-2 font-sans text-xs">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-slate-50 text-slate-800 px-2.5 py-1 border border-slate-200 font-medium break-inside-avoid"
                >
                  • {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Personal Details in Formal 2-Column Grid */}
        {hasSection('personalDetails') && (
          <section data-cv-section="personalDetails" className="mb-5 break-inside-avoid">
            <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              {t.personalDetails}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 font-sans text-xs text-slate-700">
              {personalInfo.fatherName && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.fatherName}:</span>
                  <span>{personalInfo.fatherName}</span>
                </p>
              )}
              {personalInfo.motherName && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.motherName}:</span>
                  <span>{personalInfo.motherName}</span>
                </p>
              )}
              {personalInfo.dateOfBirth && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.dateOfBirth}:</span>
                  <span>{personalInfo.dateOfBirth}</span>
                </p>
              )}
              {personalInfo.gender && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.gender}:</span>
                  <span>{personalInfo.gender}</span>
                </p>
              )}
              {personalInfo.maritalStatus && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.maritalStatus}:</span>
                  <span>{personalInfo.maritalStatus}</span>
                </p>
              )}
              {personalInfo.nationality && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.nationality}:</span>
                  <span>{personalInfo.nationality}</span>
                </p>
              )}
              {personalInfo.religion && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.religion}:</span>
                  <span>{personalInfo.religion}</span>
                </p>
              )}
              {personalInfo.bloodGroup && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.bloodGroup}:</span>
                  <span>{personalInfo.bloodGroup}</span>
                </p>
              )}
              {personalInfo.nationalId && (
                <p className="flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900">{t.nationalId}:</span>
                  <span className="font-mono">{personalInfo.nationalId}</span>
                </p>
              )}
              {personalInfo.permanentAddress && (
                <p className="sm:col-span-2 flex justify-between border-b border-slate-100 pb-0.5 break-inside-avoid">
                  <span className="font-medium text-slate-900 shrink-0 mr-4">{t.permanentAddress}:</span>
                  <span className="text-right">{personalInfo.permanentAddress}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Languages & References */}
        {(hasSection('languages') || hasSection('references')) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 break-inside-avoid">
            {hasSection('languages') && languages && languages.length > 0 && (
              <div data-cv-section="languages" className="break-inside-avoid">
                <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  {t.languages}
                </h2>
                <div className="space-y-1 font-sans text-xs">
                  {languages.map((lang, idx) => (
                    <div key={lang.id || idx} className="flex justify-between break-inside-avoid">
                      <span className="font-semibold text-slate-800">{lang.name}</span>
                      <span className="text-slate-600">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasSection('references') && references && references.length > 0 && (
              <div data-cv-section="references" className="break-inside-avoid">
                <h2 className="text-xs font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  {t.references}
                </h2>
                <div className="space-y-2 font-sans text-xs">
                  {references.map((ref, idx) => (
                    <div key={ref.id || idx} className="border-l-2 border-slate-800 pl-2.5 break-inside-avoid">
                      <p className="font-bold text-slate-900">{ref.name}</p>
                      <p className="text-slate-600 text-[11px]">
                        {ref.designation}, {ref.organization}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {ref.phone} {ref.email && `• ${ref.email}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formal Signature and Date Section */}
      {hasSection('declaration') && (
        <div
          data-cv-section="declaration"
          className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end font-sans text-xs break-inside-avoid"
        >
          <div className="text-slate-500">
            <p>{language === 'bn' ? 'তারিখ: ....................' : 'Date: ....................'}</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-slate-700 mb-1.5"></div>
            <p className="font-semibold text-slate-900">{t.signature}</p>
          </div>
        </div>
      )}
    </div>
  );
};
