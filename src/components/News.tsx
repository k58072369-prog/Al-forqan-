/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Calendar, User, ArrowRight, BookOpen, Clock } from "lucide-react";
import { News } from "../types";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        } else {
          setError("فشل استدعاء كشف الأخبار المئوية.");
        }
      } catch (err) {
        setError("خطأ اتصال في شبكة الخادم المحلي.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-300">
      
      {/* SECTION HEADER */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-950">
          آخر أخبار وفعاليات مكتب الفرقان
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
          تابع تغطية الحفلات الدورية، وتصفيات المسابقات المحلية بكفر الباجور، وقوائم تكريم الطلبة الأوائل بالحلقات الرسمية مباشرة.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-xs sm:text-sm font-bold animate-pulse font-sans">جاري تحميل آخر الأخبار من مكتب الفرقان...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-amber-50 rounded-2xl max-w-md mx-auto border border-amber-100 p-4">
          <p className="text-amber-800 text-xs sm:text-sm font-sans font-bold">{error}</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl max-w-lg mx-auto">
          <p className="text-gray-400 text-xs sm:text-sm">لا يوجد أخبار أو منشورات حالياً في كفر الباجور.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="bg-white rounded-3xl border border-emerald-50/50 shadow-xs overflow-hidden flex flex-col hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer group"
              id={`news-card-${item.id}`}
            >
              {/* News representative banner image */}
              <div className="h-44 sm:h-48 bg-emerald-950 overflow-hidden relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-950/80 p-6 flex flex-col justify-between text-right">
                    <span className="text-[10px] sm:text-xs text-amber-300 font-bold border border-amber-400/20 px-2 py-0.5 rounded-full inline-block self-start font-sans">
                      تغطية رسمية
                    </span>
                    <h3 className="font-serif text-white font-bold text-sm sm:text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                )}
                
                {/* Visual Glass filter accent on date */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] text-amber-300 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Text content summary */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {item.image && (
                    <h3 className="font-serif text-emerald-950 font-bold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                  )}
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 text-justify font-sans">
                    {item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] sm:text-xs text-gray-500 font-sans">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>مكتب الفرقان</span>
                  </div>
                  <div className="text-emerald-800 font-black flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span>اقرأ الخبر كاملاً</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          ARTICLE DETAIL MODAL VIEWER (FULL NEWS PAGE VIEW)
         --------------------------------------------------------------------------- */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header with escape control */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-[10px] sm:text-xs text-amber-600 font-extrabold flex items-center gap-1 font-sans">
                <Clock className="w-3.5 h-3.5" />
                <span>تاريخ الخبر: {selectedArticle.date}</span>
              </span>
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 px-3 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                إغلاق والرجوع
              </button>
            </div>

            {/* Banner/Layout photo */}
            {selectedArticle.image && (
              <div className="h-56 sm:h-64 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                <img
                  src={selectedArticle.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Words */}
            <div className="space-y-4">
              <h1 className="font-serif text-xl sm:text-2xl font-black text-emerald-950 leading-snug">
                {selectedArticle.title}
              </h1>

              <div className="h-0.5 bg-emerald-500/10 w-24"></div>

              {/* Full context markup using whitespace prelines */}
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-justify font-sans whitespace-pre-line">
                {selectedArticle.content}
              </p>
            </div>

            {/* Footer with branding */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-sans">
              <span>الجهة الناشرة: إدارة العلاقات العامة بكفر الباجور</span>
              <span>* جميع حقوق النشر والتغطية محفوظة لمكتب الفرقان 2026 ©</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
