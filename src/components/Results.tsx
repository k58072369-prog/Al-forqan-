/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Award, Printer, Medal, Star, Calendar, FileCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { CompetitionResult } from "../types";

export default function Results() {
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setError("يرجى إدخال كود الطالب أولاً");
      return;
    }
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);

    try {
      const res = await fetch(`/api/results?studentCode=${encodeURIComponent(studentCode.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.length === 0) {
          setError("لم يتم العثور على نتائج مسابقات لهذا الكود. تصفح الأكواد النموذجية في لوحة التحكم (مثل: 1001، 1002).");
        }
      } else {
        setError("فشل فحص قاعدة البيانات، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      setError("حدث خطأ في الشبكة أثناء جلب بيانات الطالب.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <div className="text-center space-y-3 max-w-2xl mx-auto no-print">
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-950">
          منصة نتائج المسابقات القرآنية
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
          أدخل كودك الخاص للاطلاع الشامل على درجاتك وتصنيفك في مسابقات مكتب الفرقان وتحميل شهادة التفوق والجوائز المستحقة بالتفصيل.
        </p>
      </div>

      {/* SEARCH CARD FORM */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-emerald-50 shadow-xs no-print">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-right text-xs sm:text-sm font-bold text-emerald-900 font-sans">
              اكتب كود الطالب التابع لك:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل الكود مكوّن من أرقام (مثال: 1001)"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full text-right bg-gray-50 border outline-none border-gray-200 focus:border-emerald-500 focus:bg-white rounded-2xl py-3.5 pr-11 pl-4 text-xs sm:text-sm font-bold transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider text-right">
              * الكود مخصص لكل منتسب لتأمين الخصوصية (تثبيت كود تجريبي "1001" أو "1002" يمنحك معاينة جيدة)
            </p>
          </div>

          <button
            type="submit"
            id="search-btn"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-300 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? "جاري البحث واسترداد البيانات..." : "عرض الدرجات والتقرير الشامل تفصيليّاً"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4.5 bg-amber-500/10 rounded-2xl text-amber-900 border border-amber-300/30 text-xs sm:text-sm flex items-start gap-2 text-right">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">{error}</p>
          </div>
        )}
      </div>

      {/* RENDER SCORECARDS */}
      {searched && results.length > 0 && (
        <div className="space-y-12 max-w-4xl mx-auto">
          
          {/* Print button on top */}
          <div className="flex justify-end gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md cursor-pointer transition-colors"
            >
              <Printer className="w-4.5 h-4.5 text-amber-300" />
              <span>طباعة وتصدير النتيجة لملف PDF</span>
            </button>
          </div>

          {results.map((res, index) => (
            <div
              key={res.id || index}
              className="bg-white rounded-3xl border-3 border-emerald-900/10 shadow-xl overflow-hidden p-6 sm:p-10 relative print:shadow-none print:border-0"
              id="printable-scorecard"
            >
              {/* Classical Islamic Golden Background borders (Only on printing or styled card) */}
              <div className="absolute inset-4 pointer-events-none rounded-2xl border border-amber-400/20"></div>

              {/* Scorecard Header Block */}
              <div className="border-b-2 border-emerald-900/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-emerald-50 flex items-center justify-center p-1.5 shadow-xs shrink-0">
                    <img src="/src/assets/logo.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-right md:text-right">
                    <h1 className="font-serif text-xl sm:text-2xl font-black text-emerald-900 leading-normal">
                      شهادة تفوق ونتائج الاختبار المسابقي
                    </h1>
                    <p className="text-xs text-amber-600 font-bold tracking-wider">
                      مكتب الفرقان لتحفيظ القرآن الكريم بكفر الباجور
                    </p>
                  </div>
                </div>

                <div className="text-center md:text-left text-xs bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-2">
                  <div className="font-semibold text-emerald-900">المشرف العام م. كفر الباجور</div>
                  <div className="text-[11px] font-sans text-gray-500 font-bold mt-0.5">فضيلة الشيخ سامح رشاد</div>
                </div>
              </div>

              {/* 1. STUDENT BLOCK METADATA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-emerald-50/40 p-4 sm:p-6 rounded-2xl border border-emerald-50/50 mb-8">
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold">اسم الطالب الكريم</span>
                  <div className="font-sans font-black text-emerald-950 text-sm sm:text-base">{res.studentName}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold">كود الطالب المُعتمَد</span>
                  <div className="font-mono font-bold text-emerald-900 text-sm sm:text-base">{res.studentCode}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold">اسم المسابقة الكبرى</span>
                  <div className="font-sans font-extrabold text-emerald-950 text-sm sm:text-base">{res.competitionName}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold">تاريخ تصفيات الاختبار</span>
                  <div className="font-mono font-bold text-emerald-900 text-sm sm:text-base flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 inline" />
                    <span>{res.competitionDate}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Area - 2/3 - Exams list and comparison charts */}
                <div className="lg:col-span-2 space-y-8">
                  {/* EXAMS DETAILS TABLE */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-lg font-bold text-emerald-900 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                      تفاصيل نتائج درجات كشف الاختبارات الجزئية
                    </h3>
                    
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm scrollbar-thin">
                      <table className="w-full text-right border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-emerald-900 text-white font-sans text-xs sm:text-sm font-bold">
                            <th className="p-3.5">تاريخ الاختبار</th>
                            <th className="p-3.5">مقدار التسميع وعرض الآيات</th>
                            <th className="p-3.5">حالة المراجعة</th>
                            <th className="p-3.5 text-center">الدرجة</th>
                            <th className="p-3.5 text-center">التقدير الفني</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-sans text-xs sm:text-sm text-gray-700">
                          {res.exams.map((exam, i) => (
                            <tr key={i} className="hover:bg-emerald-50/20">
                              <td className="p-3.5 font-mono font-bold text-gray-500">{exam.date}</td>
                              <td className="p-3.5 font-semibold text-emerald-950">{exam.memorization}</td>
                              <td className="p-3.5">{exam.review}</td>
                              <td className="p-3.5 text-center font-bold text-emerald-800">{exam.grade} %</td>
                              <td className="p-3.5 text-center">
                                <span className={`font-bold px-2.5 py-1 rounded-lg ${
                                  exam.rating.includes("امتياز") || exam.rating.includes("ممتاز") 
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-50 text-gray-600"
                                }`}>
                                  {exam.rating}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* COMPETITIVE GRAPHIC COMPARISON BLOCK */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-emerald-900 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                      تحليلات الأداء والمقارنة بالمتوسط العام للمستوى
                    </h3>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 font-sans text-xs sm:text-sm">
                      {/* Bar 1 - Student score vs Level Average */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span className="font-bold text-emerald-950">نسبة الطالب الفعلية: {res.percentage}%</span>
                          <span>متوسط درجات الطلاب بالمستوى: {res.levelAverageScore}%</span>
                        </div>
                        <div className="h-3.5 bg-gray-200 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-emerald-600 rounded-full absolute right-0"
                            style={{ width: `${res.percentage}%` }}
                          ></div>
                          <div
                            className="h-full border-l-2 border-dashed border-amber-600 absolute"
                            style={{ right: `${res.levelAverageScore}%`, top: 0, bottom: 0 }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed text-right mt-1 font-sans">
                          * يمثل الخط المتقطع متوسط جميع الحفظة المشاركين بفرع المسابقة. الطالب تفوق بمقدار{" "}
                          <span className="text-emerald-700 font-bold font-mono">+{res.scoreDiff}%</span> عن الآخرين.
                        </p>
                      </div>

                      {/* Rank comparison overview */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-white rounded-xl border border-gray-100">
                          <div className="text-[10px] text-gray-400 font-bold">ترتيب الطالب بفرعه التخصصي</div>
                          <div className="text-base font-black text-emerald-800 mt-0.5">المرتبة {res.levelRank}</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-gray-100">
                          <div className="text-[10px] text-gray-400 font-bold">الترتيب الشامل العام بالقرية</div>
                          <div className="text-base font-black text-emerald-800 mt-0.5">المرتبة {res.overallRank}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. JURY NOTES BLOCK */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-emerald-900 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                      مرئيات وملاحظات لجنة التحكيم للامتحان
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                      <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-50">
                        <h4 className="font-bold text-emerald-900 border-b border-emerald-100 pb-1.5 mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          نقاط القوة والإتقان
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-justify">{res.strengths}</p>
                      </div>

                      <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 border-b border-amber-200 pb-1.5 mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          تنبيهات وأخطاء مكررة
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-justify">{res.repeatedErrors}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                          توصيات العمل والخطط
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-justify">{res.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Area - 1/3 - Final Score indicators / Golden honor decree */}
                <div className="space-y-8 flex flex-col justify-between">
                  {/* METRIC SUMMARIES */}
                  <div className="bg-emerald-950 text-white rounded-3xl p-6 relative overflow-hidden self-stretch shadow-lg">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                    <div className="relative z-10 text-center space-y-4">
                      
                      <div className="inline-flex p-3 bg-white/10 rounded-2xl border border-white/10">
                        <Medal className="w-8 h-8 text-amber-400" />
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase">المعدل النهائي الكلي</span>
                        <div className="font-serif text-4xl sm:text-5xl font-black text-amber-300 tracking-wide font-mono">
                          {res.percentage}%
                        </div>
                        <p className="text-[11px] text-emerald-200 font-sans mt-0.5">
                          المجموع التراكمي: {res.totalScore} درجة
                        </p>
                      </div>

                      <div className="h-px bg-white/10 w-28 mx-auto"></div>

                      <div className="space-y-2 pt-2 text-right text-xs">
                        <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-1.5">
                          <span className="font-semibold text-emerald-300">التأهل للتصعيد:</span>
                          <span className="font-black text-emerald-100">{res.qualified ? "مستحق ومتأهل" : "لم يتأهل"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-1.5">
                          <span className="font-semibold text-emerald-300">الشهادة التقديرية:</span>
                          <span className="font-black text-emerald-100">{res.certificate ? "ممنوحة ومختومة" : "غير معتمدة"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-1.5">
                          <span className="font-semibold text-emerald-300">الترسيم والتكريم السنوي:</span>
                          <span className="font-black text-emerald-100">{res.honor ? "مستحق للتكريم الصدر" : "مشاركة"}</span>
                        </div>
                      </div>

                      <div className="bg-amber-400/20 text-amber-300 font-bold p-2.5 rounded-xl text-[11px] font-sans">
                        المركز المحقق: {res.rankAchieved}
                      </div>

                    </div>
                  </div>

                  {/* 5. GORGEOUS GOLDEN HONOR DECREE Frame with Arabic stamp */}
                  {res.honorDecision && (
                    <div className="bg-radial from-amber-50 to-gold-50 border-3 border-amber-400 p-6 rounded-3xl text-center space-y-4 relative shadow-md">
                      {/* Classical Ribbon Decor */}
                      <div className="absolute top-[-10px] left-[-10px] w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-xs font-black shadow-xs text-emerald-950">
                        <Star className="w-4 h-4 fill-emerald-950" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] sm:text-xs text-amber-700 font-extrabold tracking-wider uppercase block font-sans">
                          قرارات لجنة التكريم العليا
                        </span>
                        <h4 className="font-serif text-lg font-black text-amber-900">وزارة تشجيع الحصاد</h4>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed text-justify px-1">
                        بموجب قرار الإشراف الفني المعتمد وتحقيق معدل تميز باهر، يعلن مكتب الفرقان أحقية الطالب الكريم بـ:
                        <span className="text-emerald-950 font-extrabold bg-emerald-500/15 px-1.5 py-0.5 rounded-sm block text-center mt-2 font-sans border border-emerald-500/10">
                          {res.honorType}
                        </span>
                      </p>

                      <div className="pt-2 border-t border-amber-300 text-[10px] text-gray-500 font-serif leading-relaxed text-right md:text-center">
                        <span className="font-bold text-amber-900 block font-sans">سبب التكريم الفرعي:</span>
                         {res.honorReason}
                      </div>

                      {/* Stamp Seal simulator */}
                      <div className="absolute bottom-3 left-3 w-12 h-12 rounded-full border-2 border-dashed border-emerald-800/20 flex flex-col items-center justify-center text-[8px] text-emerald-800/40 uppercase tracking-tighter transform -rotate-12 select-none">
                        <span>مكتب الفرقان</span>
                        <span className="font-bold">معتمد 2026</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dignified Footer of certificate block */}
              <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-sans gap-4">
                <span>توقيع لجنة التحكيم: الشيخ سامح رشاد وعصبة المحفظين</span>
                <span>* شهادة معتمدة رقمياً وتخضع لبنود كفر الباجور للقرآن</span>
                <span>تاريخ تسليم الشهادة: {res.competitionDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
