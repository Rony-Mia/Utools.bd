import React from 'react';
import { User } from 'lucide-react';
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

export const GovtStandardTemplate: React.FC<TemplateProps> = ({
  data,
  language,
  sections,
  pageNumber = 1,
  totalPages = 1,
}) => {
  const t = CV_LABELS[language] || CV_LABELS.bn;
  const { personalInfo, education, experience, skills, languages, references } = data;

  const isBn = language === 'bn';
  const getSerial = (n: number) => (isBn ? `${toBengaliNum(n)}.` : `${n}.`);
  const hasSection = (id: CvSectionId) => !sections || sections.includes(id);

  // Check if any table row is visible on this page
  const showPersonalRows = hasSection('header') || hasSection('personalDetails');
  const showEduRow = hasSection('education');
  const showExpRow = hasSection('experience');
  const showSkillsLangRow = hasSection('skills') || hasSection('languages');
  const showRefRow = hasSection('references') && references && references.length > 0;
  const hasAnyTableRow = showPersonalRows || showEduRow || showExpRow || showSkillsLangRow || showRefRow;

  return (
    <div className="w-full bg-white text-slate-900 font-serif leading-relaxed text-xs sm:text-[13px] p-6 sm:p-10 shadow-sm print:shadow-none print:p-6">
      <div>

        {/* Official Centered Header & Top-Right Photo Box */}
        {hasSection('header') && (
          <div data-cv-section="header" className="relative mb-6 pb-4 border-b border-slate-300 break-inside-avoid">
            {/* Passport Photo Box */}
            <div className="sm:absolute sm:right-0 sm:top-0 w-24 h-28 sm:w-28 sm:h-32 border border-slate-400 bg-slate-50 flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-2xs mx-auto sm:mx-0 mb-4 sm:mb-0">
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
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-1 text-center bg-slate-100">
                  <User className="w-10 h-10 stroke-[1.5]" />
                  <span className="text-[9px] mt-1 font-sans text-slate-500 font-medium">
                    {isBn ? 'পাসপোর্ট সাইজ ছবি' : 'Passport Photo'}
                  </span>
                </div>
              )}
            </div>

            {/* Centered Heading */}
            <div className="text-center sm:pr-32">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 inline-block border-b-2 border-slate-800 pb-1">
                {t.curriculumVitae}
              </h2>
              <p className="text-[11px] text-slate-600 mt-1 font-sans italic">
                {isBn
                  ? '(বাংলাদেশ সরকারি ও আধা-সরকারি চাকরির সার্কুলার ফরম্যাট অনুযায়ী)'
                  : '(Standard Government Bio-data Format for Bangladesh)'}
              </p>
            </div>
          </div>
        )}

        {/* Official Numbered Table */}
        {hasAnyTableRow && (
          <table className="w-full border-collapse border border-slate-300 mb-6 text-xs sm:text-[13px]">
            <tbody>
              {/* Personal rows 1-11 */}
              {showPersonalRows && (
                <>
                  {/* 1. Name */}
                  <tr>
                    <td className="w-12 sm:w-14 border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(1)}
                    </td>
                    <td className="w-40 sm:w-48 border border-slate-300 px-3 py-1.5 font-bold bg-slate-50/70 text-slate-900">
                      {t.name}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold text-slate-900">
                      {personalInfo.fullName}
                    </td>
                  </tr>

                  {/* 2. Father's Name */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(2)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.fatherName}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.fatherName || '-'}
                    </td>
                  </tr>

                  {/* 3. Mother's Name */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(3)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.motherName}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.motherName || '-'}
                    </td>
                  </tr>

                  {/* 4. Date of Birth */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(4)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.dateOfBirth}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.dateOfBirth || '-'}
                    </td>
                  </tr>

                  {/* 5. Gender & Marital Status */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(5)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.gender} ও {t.maritalStatus}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.gender || '-'} | {personalInfo.maritalStatus || '-'}
                    </td>
                  </tr>

                  {/* 6. Nationality & Religion */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(6)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.nationality} ও {t.religion}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.nationality || '-'} | {personalInfo.religion || '-'}
                    </td>
                  </tr>

                  {/* 7. National ID */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(7)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.nationalId}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-mono text-slate-900">
                      {personalInfo.nationalId || '-'}
                    </td>
                  </tr>

                  {/* 8. Blood Group */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(8)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.bloodGroup}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold text-slate-900">
                      {personalInfo.bloodGroup || '-'}
                    </td>
                  </tr>

                  {/* 9. Present Address */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(9)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.presentAddress}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.presentAddress || '-'}
                    </td>
                  </tr>

                  {/* 10. Permanent Address */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(10)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.permanentAddress}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.permanentAddress || '-'}
                    </td>
                  </tr>

                  {/* 11. Contact */}
                  <tr>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                      {getSerial(11)}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                      {t.phone} ও {t.email}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                      {personalInfo.phone || '-'} {personalInfo.email && ` | ${personalInfo.email}`}
                    </td>
                  </tr>
                </>
              )}

              {/* 12. Education */}
              {showEduRow && (
                <tr data-cv-section="education">
                  <td className="border border-slate-300 px-2.5 py-2 text-center font-bold bg-slate-50 text-slate-700 align-top">
                    {getSerial(12)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50/70 text-slate-900 align-top">
                    {t.education}
                  </td>
                  <td className="border border-slate-300 p-0">
                    <table className="w-full border-collapse text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                          <th className="p-1.5 text-left border-r border-slate-300">{t.degree}</th>
                          <th className="p-1.5 text-left border-r border-slate-300">{t.institution}</th>
                          <th className="p-1.5 text-left border-r border-slate-300">{t.board}</th>
                          <th className="p-1.5 text-center border-r border-slate-300 w-16">{t.passingYear}</th>
                          <th className="p-1.5 text-center w-20">{t.result}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {education && education.length > 0 ? (
                          education.map((edu, idx) => (
                            <tr
                              key={edu.id || idx}
                              className="border-b border-slate-200 last:border-b-0 break-inside-avoid"
                            >
                              <td className="p-1.5 border-r border-slate-300 font-semibold">{edu.degree}</td>
                              <td className="p-1.5 border-r border-slate-300">{edu.institution}</td>
                              <td className="p-1.5 border-r border-slate-300">{edu.boardOrMajor || '-'}</td>
                              <td className="p-1.5 border-r border-slate-300 text-center">{edu.passingYear}</td>
                              <td className="p-1.5 text-center font-semibold">{edu.result}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-2 text-center text-slate-400">
                              -
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* 13. Experience */}
              {showExpRow && (
                <tr data-cv-section="experience">
                  <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700 align-top">
                    {getSerial(13)}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900 align-top">
                    {t.experience}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                    {experience && experience.length > 0 ? (
                      <div className="space-y-2">
                        {experience.map((exp, idx) => (
                          <div
                            key={exp.id || idx}
                            className="border-b border-slate-200 pb-1.5 last:border-b-0 last:pb-0 break-inside-avoid"
                          >
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-900">{exp.designation}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{exp.duration}</span>
                            </div>
                            <p className="text-slate-700 text-[11px]">{exp.company}</p>
                            {exp.responsibilities && (
                              <p className="text-slate-600 text-[11px] mt-0.5 whitespace-pre-line">
                                {exp.responsibilities}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>{isBn ? 'প্রযোজ্য নয়' : 'N/A'}</span>
                    )}
                  </td>
                </tr>
              )}

              {/* 14. Skills & Languages */}
              {showSkillsLangRow && (
                <tr data-cv-section="skills">
                  <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700">
                    {getSerial(14)}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900">
                    {t.skills} ও {t.languages}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                    <div className="space-y-1">
                      {skills && skills.length > 0 && (
                        <p>
                          <strong className="font-semibold text-slate-900">{t.skills}:</strong> {skills.join(', ')}
                        </p>
                      )}
                      {languages && languages.length > 0 && (
                        <p>
                          <strong className="font-semibold text-slate-900">{t.languages}:</strong>{' '}
                          {languages.map(l => `${l.name} (${l.proficiency})`).join(', ')}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* 15. References */}
              {showRefRow && (
                <tr data-cv-section="references">
                  <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold bg-slate-50 text-slate-700 align-top">
                    {getSerial(15)}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 font-semibold bg-slate-50/70 text-slate-900 align-top">
                    {t.references}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {references.map((ref, idx) => (
                        <div key={ref.id || idx} className="text-xs">
                          <p className="font-bold text-slate-900">{ref.name}</p>
                          <p className="text-slate-600 text-[11px]">
                            {ref.designation}, {ref.organization}
                          </p>
                          <p className="text-slate-500 text-[11px] font-mono">{ref.phone}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Official Declaration (অঙ্গীকারনামা) */}
        {hasSection('declaration') && (
          <div
            data-cv-section="declaration"
            className="mb-6 border border-slate-300 bg-slate-50/50 p-3 text-justify text-xs text-slate-800 leading-relaxed break-inside-avoid"
          >
            <p>
              {isBn
                ? 'অঙ্গীকারনামা: আমি এই মর্মে দৃঢ় অঙ্গীকার করছি যে, উপরে বর্ণিত যাবতীয় তথ্যাবলি সম্পূর্ণ সত্য ও নির্ভুল। ভবিষ্যতে কোনো তথ্য ভুল বা অসত্য প্রমাণিত হলে কর্তৃপক্ষ আমার আবেদনপত্র বা নিয়োগ বাতিল করার সম্পূর্ণ অধিকার সংরক্ষণ করিবেন।'
                : 'Declaration: I hereby declare that the information provided above is true, complete and accurate to the best of my knowledge and belief. If any information is proven to be false or incorrect, the authority reserves the right to reject my application or terminate my appointment.'}
            </p>
          </div>
        )}
      </div>

      {/* Date & Signature Row */}
      {hasSection('declaration') && (
        <div className="mt-8 pt-6 flex justify-between items-end text-xs font-serif break-inside-avoid">
          <div>
            <p>{isBn ? 'স্থান: ..............................' : 'Place: ..............................'}</p>
            <p className="mt-1">{isBn ? 'তারিখ: ..............................' : 'Date: ..............................'}</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-slate-800 mb-1.5"></div>
            <p className="font-bold text-slate-900">{t.signature}</p>
          </div>
        </div>
      )}
    </div>
  );
};
