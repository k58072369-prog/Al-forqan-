/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, FileText, Printer, Check, Star, TrendingUp, HelpCircle, Phone, Calendar, UserCheck, Inbox, FileCheck } from "lucide-react";
import { ParentReport } from "../types";

export default function Reports() {
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<ParentReport[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setError("يرجى إدخال كود الطالب أولاً");
      return;
    }
    setLoading(true);
    setError("");
    setReports([]);
    setSearched(false);

    try {
      const res = await fetch(`/api/reports?studentCode=${encodeURIComponent(studentCode.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length === 0) {
          setError("لم يتم العثور على تقارير منهجية لهذا الكود. يمكنك مراجعة لوحة التحكم للأكواد النشطة (مثل: 1001، 1002).");
        }
      } else {
        setError("فشل فحص قاعدة البيانات، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      setError("حدث خطأ في الشبكة أثناء جلب تقارير الطالب.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render stars rating
  const renderStars = (rating: number) => {
    const stars = [];
    const maxStars = 5;
    const scaledRating = Math.min(Math.max((rating / 10) * maxStars, 0), maxStars); // scale up 10 rating to 5 scale
    
    for (let i = 1; i <= maxStars; i++) {
      if (i <= Math.round(scaledRating)) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />);
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-200 shrink-0" />);
      }
    }
    return <div className="flex gap-0.5 justify-end">{stars}</div>;
  };

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-300">
      
      {/* HEADER OVERVIEW */}
      <div className="text-center space-y-3 max-w-2xl mx-auto no-print">
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-950">
          تقارير المتابعة الدورية للطلاب
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
          منصة إشراك أولياء الأمور لتتبع معدلات التزام الأبناء، ونطاق حفظهم وتلاوتهم، ونقاط قوتهم وثغراتهم التربوية شهراً بشهر بالتفصيل الموثق.
        </p>
      </div>

      {/* SEARCH FORM PANEL */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-emerald-50 shadow-xs no-print">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-right text-xs sm:text-sm font-bold text-emerald-900 font-sans">
              اكتب كود الطالب التابع لك هنا:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="مثال: اكتب الكود 1001"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full text-right bg-gray-50 border outline-none border-gray-200 focus:border-emerald-500 focus:bg-white rounded-2xl py-3.5 pr-11 pl-4 text-xs sm:text-sm font-bold transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-right leading-relaxed">
              * التزاماً بالخصوصية وحماية البيانات، كل طالب مشفر بكود رقمي خاص يسلم لولي أمره فقط. (جرب كود "1001" للمعاينة)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-300 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? "جاري البحث واستخلاص التقرير لولي الأمر..." : "جلب التقرير الشهري الكامل والمصادق عليه"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4.5 bg-amber-500/10 rounded-2xl text-amber-900 border border-amber-300/30 text-xs sm:text-sm flex items-start gap-2 text-right">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">{error}</p>
          </div>
        )}
      </div>

      {/* DETAILED SCORECARDS RESULTS */}
      {searched && reports.length > 0 && (
        <div className="space-y-12 max-w-4xl mx-auto">
          
          {/* Action button bar */}
          <div className="flex justify-end gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md cursor-pointer transition-colors"
            >
              <Printer className="w-4.5 h-4.5 text-amber-300" />
              <span>طباعة كارت المتابعة الشهري PDF</span>
            </button>
          </div>

          {reports.map((rep, index) => (
            <div
              key={rep.id || index}
              className="bg-white rounded-3xl border-2 border-emerald-900/10 shadow-xl overflow-hidden p-6 sm:p-10 relative print:shadow-none print:border-0"
              id="printable-report"
            >
              <div className="absolute inset-4 pointer-events-none rounded-2xl border border-emerald-600/5"></div>

              {/* Top Title Banner */}
              <div className="border-b-2 border-emerald-900/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border border-amber-400 bg-emerald-950 flex items-center justify-center p-1.5 shadow-xs shrink-0">
                    <FileText className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="font-serif text-lg sm:text-2xl font-black text-emerald-900 inline-flex items-center gap-1">
                      <span>تقرير المتابعة والتحصيل التربوي الدائم</span>
                    </h1>
                    <p className="text-[10px] sm:text-xs text-amber-600 font-extrabold font-sans mt-0.5 text-right md:text-right">
                      مكتب الفرقان لتحفيظ القرآن الكريم بكفر الباجور - كارت يوليو 2026
                    </p>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <span className="font-sans text-xs bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl">
                     تقرير شهر: {rep.month}
                  </span>
                </div>
              </div>

              {/* 1. BASIC STU METADATA DATA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-emerald-50/20 p-5 rounded-2xl border border-emerald-500/5 mb-8">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold block">اسم الطالب</span>
                  <div className="font-sans font-black text-gray-800 text-sm">{rep.studentName}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold block">كود الطالب المشفر</span>
                  <div className="font-mono font-bold text-emerald-900 text-sm">{rep.studentCode}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold block">ولي الأمر المسؤول</span>
                  <div className="font-sans text-gray-600 text-sm font-semibold">{rep.parentName || "غير محدد"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold block">هاتف المتابعة</span>
                  <div className="font-mono text-gray-600 text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{rep.parentPhone || "غير مسجل"}</span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-emerald-100/50 pt-3 md:col-span-1">
                  <span className="text-[10px] text-gray-400 font-bold block">شيخ الحلقة</span>
                  <div className="font-sans text-emerald-900 text-xs font-extrabold">{rep.teacherName || "غير مسجل"}</div>
                </div>
                <div className="space-y-1 border-t border-emerald-100/50 pt-3 md:col-span-1">
                  <span className="text-[10px] text-gray-400 font-bold block">حلقة الطالب الرسمية</span>
                  <div className="font-sans text-emerald-900 text-xs font-extrabold">{rep.groupName || "غير مسجل"}</div>
                </div>
                <div className="space-y-1 border-t border-emerald-100/50 pt-3 md:col-span-2">
                  <span className="text-[10px] text-gray-400 font-bold block">حالة التحسن التراكمي</span>
                  <div className="font-sans text-emerald-800 text-xs font-bold inline-flex items-center gap-1 font-mono">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تحسن بمقدار +{rep.improvementRate}% مقارنة بالشهر السابق</span>
                  </div>
                </div>
              </div>

              {/* CORE METRICS BENTO MATRIX */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* A. ATTENDANCE & DISCIPLINE BLOCK */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-serif text-base font-bold text-emerald-900 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>الحضور والانضباط السلوكي</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold">إجمالي الحصص</div>
                      <div className="text-sm font-black text-gray-800 font-mono">{rep.numClasses} حصة</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-[9px] text-emerald-800 font-bold">عدد مرات الحضور</div>
                      <div className="text-sm font-black text-emerald-900 font-mono">{rep.numPresent}</div>
                    </div>
                    <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                      <div className="text-[9px] text-red-800 font-bold font-sans">عدد مرات الغياب</div>
                      <div className="text-sm font-black text-red-900 font-mono">{rep.numAbsent}</div>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-[9px] text-amber-800 font-bold font-sans">مرات التأخر التراكمي</div>
                      <div className="text-sm font-black text-amber-900 font-mono">{rep.numLate}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-500 font-sans">نسبة الالتزام والانتظام:</span>
                    <span className={`font-black px-2.5 py-1 rounded-lg font-mono ${
                      rep.attendanceRate >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    }`}>
                      {rep.attendanceRate}%
                    </span>
                  </div>
                </div>

                {/* B. MEMORIZATION progress */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-serif text-base font-bold text-emerald-900 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>معدل تحصيل الحفظ الجديد</span>
                  </h3>

                  <div className="space-y-3.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">نطاق بداية الحفظ الشهري:</span>
                      <span className="font-semibold text-emerald-950 text-right font-sans">{rep.memorizationStart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">نطاق نهاية الحفظ الشهري:</span>
                      <span className="font-semibold text-emerald-950 text-right font-sans">{rep.memorizationEnd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">جملة كمية الحفظ الفعلي:</span>
                      <span className="font-bold text-emerald-950 font-sans bg-emerald-50 pr-2 pl-2 rounded-sm">{rep.newMemorizationAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center">
                    <div className="p-2 bg-white rounded-lg border border-gray-50">
                      <span className="text-[9px] text-gray-400 block font-sans">عدد الصفحات</span>
                      <span className="text-xs font-black text-emerald-900 font-mono">{rep.numPages} صفحة</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-50">
                      <span className="text-[9px] text-gray-400 block font-sans">إجمالي الأجزاء</span>
                      <span className="text-xs font-black text-emerald-900 font-mono">{rep.numParts} جزء</span>
                    </div>
                  </div>
                </div>

                {/* C. REVIEW progress */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="font-serif text-base font-bold text-emerald-900 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>معدل ومستوى المراجعة الدائمة</span>
                  </h3>

                  <div className="space-y-3 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">بدأ المراجعة من:</span>
                      <span className="font-semibold text-emerald-950 text-right font-sans">{rep.reviewStart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500 font-sans">بلغت المراجعة نهايتها لـ:</span>
                      <span className="font-semibold text-emerald-950 text-right font-sans">{rep.reviewEnd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500 font-sans">مقدار المراجعة التراكمي:</span>
                      <span className="font-bold text-emerald-950 font-sans bg-amber-500/10 px-2 py-0.5 rounded-sm">{rep.reviewAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500 font-sans">تقييم مستوى الإتقان العام:</span>
                      <span className="font-sans font-bold text-amber-700 badge">{rep.reviewMastery}</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Evaluative ratings column - Left (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* DETAIL MATRIX EVALUATION */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-base font-bold text-emerald-900 flex items-center gap-1">
                      <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                      درجات وتقييم المحصل الفني والسلوكي للطالب
                    </h3>
                    
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Rating item */}
                        <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs sm:text-sm">
                          <span className="font-bold text-emerald-950 font-sans">تقييم الحفظ الجديد ومخارج المئات</span>
                          <div className="space-y-1">
                            <span className="font-bold text-emerald-800 font-mono block text-right">{rep.memorizationRating} / 10</span>
                            {renderStars(rep.memorizationRating)}
                          </div>
                        </div>

                        {/* Rating item */}
                        <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs sm:text-sm">
                          <span className="font-bold text-emerald-950 font-sans">تقييم مراجعة الماضي والسرعة</span>
                          <div className="space-y-1">
                            <span className="font-bold text-emerald-800 font-mono block text-right">{rep.reviewRating} / 10</span>
                            {renderStars(rep.reviewRating)}
                          </div>
                        </div>

                        {/* Rating item */}
                        <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs sm:text-sm">
                          <span className="font-bold text-emerald-950 font-sans">تقييم الأدب والأخلاق الحميدة</span>
                          <div className="space-y-1">
                            <span className="font-bold text-emerald-800 font-mono block text-right">{rep.behaviorRating} / 10</span>
                            {renderStars(rep.behaviorRating)}
                          </div>
                        </div>

                        {/* Rating item */}
                        <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs sm:text-sm">
                          <span className="font-bold text-emerald-950 font-sans">درجة الانضباط والانتباه للحلقة</span>
                          <div className="space-y-1">
                            <span className="font-bold text-emerald-800 font-mono block text-right">{rep.disciplineRating} / 10</span>
                            {renderStars(rep.disciplineRating)}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* DOUBLE MATRIX OF MOM ANALYSIS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl text-xs space-y-1.5 text-right font-sans">
                      <h4 className="font-black text-emerald-800 border-b border-emerald-100 pb-1 mb-2">أبرز جوانب القوة والتميز</h4>
                      <p className="text-gray-600 leading-relaxed text-justify">{rep.strengths}</p>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-200 rounded-2xl text-xs space-y-1.5 text-right font-sans">
                      <h4 className="font-black text-amber-800 border-b border-amber-200/50 pb-1 mb-2">مواطن وجوانب بحاجة لمتابعة ودعم</h4>
                      <p className="text-gray-600 leading-relaxed text-justify">{rep.followupNeeds}</p>
                    </div>
                  </div>

                  {/* SUMMARY PARAGRAPH DETAILED */}
                  <div className="space-y-2">
                    <h4 className="font-serif text-[13px] sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5 font-sans">
                      <Inbox className="w-4 h-4 text-emerald-700 inline" />
                      <span>الخلاصة والبيان النهائي لتقييم الشهر المتكامل:</span>
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-justify bg-gray-50/40 p-4 border border-gray-100 rounded-2xl font-sans whitespace-pre-line">
                      {rep.detailedSummary}
                    </p>
                  </div>
                </div>

                {/* Teacher logs and Parent actions - Right (1/3) */}
                <div className="space-y-6">
                  {/* METRIC CARD */}
                  <div className="bg-emerald-800 text-white p-5 rounded-3xl text-center space-y-3.5 shadow-sm">
                    <span className="text-[10px] text-emerald-200 font-black tracking-wider uppercase block">متوسط تقييمات الطالب الشاملة</span>
                    <div className="font-serif text-3xl font-black text-amber-300 font-mono">
                      {rep.avgRating} / 10
                    </div>

                    <div className="h-0.5 bg-emerald-700"></div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-emerald-200 block">أعلى تقييم منفرد</span>
                        <span className="font-bold font-mono text-white text-sm">{rep.highestRating}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-200 block">أقل تقييم منفرد</span>
                        <span className="font-bold font-mono text-white text-sm">{rep.lowestRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* TEACHER INSTRUCTIONS */}
                  <div className="bg-white p-5 border border-emerald-50 rounded-2xl text-xs space-y-3 text-right font-sans">
                    <h4 className="font-extrabold text-emerald-950 border-b border-gray-100 pb-1.5 flex items-center gap-1">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span>توجيهات وملاحظات معلم الحلقة</span>
                    </h4>
                    <p className="text-gray-500 leading-relaxed text-justify">{rep.teacherNotes}</p>
                  </div>

                  {/* PARENT INSTRUCTIONS */}
                  <div className="bg-radial from-amber-50 to-amber-100/40 p-5 border border-amber-200 rounded-2xl text-xs space-y-3 text-right font-sans">
                    <h4 className="font-extrabold text-amber-900 border-b border-amber-300 pb-1.5 flex items-center gap-1">
                      <Check className="w-4 h-4 text-amber-700" />
                      <span>مطلوب تفعيل وتوجيه ولي الأمر بالمنزل</span>
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-justify italic">{rep.parentRecommendations}</p>
                  </div>
                </div>

              </div>

              {/* Scorecard signature footer */}
              <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-sans gap-4">
                <span>المشرف الفني الكفء: فضيلة الشيخ سامح رشاد</span>
                <span>* مكتب الفرقان لتحفيظ القرآن الكريم بالمنوفية</span>
                <span>تاريخ طباعة الكارت: {new Date().toLocaleDateString("ar-EG")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
