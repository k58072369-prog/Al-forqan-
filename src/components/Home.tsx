/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BookOpen, Award, FileText, PhoneCall, MapPin, Calendar, ArrowUpLeft, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { News, LibraryItem } from "../types";

interface HomeProps {
  onNavigate: (tabId: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [news, setNews] = useState<News[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [websiteContent, setWebsiteContent] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [newsRes, libRes, contentRes] = await Promise.all([
          fetch("/api/news"),
          fetch("/api/library"),
          fetch("/api/website-content")
        ]);
        if (newsRes.ok && libRes.ok) {
          const newsData = await newsRes.json();
          const libData = await libRes.json();
          setNews(newsData.slice(0, 3)); // show top 3
          setLibrary(libData.slice(0, 3)); // show top 3
        }
        if (contentRes && contentRes.ok) {
          setWebsiteContent(await contentRes.json());
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الصفحة الرئيسية:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div id="home-dashboard" className="space-y-16 py-8">
      
      {/* 1. HERO HEADER BANNER - Classical Arabic with Emerald/Gold Theme */}
      <section className="relative overflow-hidden rounded-3xl bg-radial from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-2xl py-12 md:py-20 px-6 md:px-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-28 h-28 sm:w-36 sm:h-36 bg-emerald-950/40 backdrop-blur-md rounded-full border-2 border-amber-400 mx-auto flex items-center justify-center p-3 sm:p-4 mb-4 shadow-xl relative"
          >
            <div className="absolute inset-0 rounded-full border border-dashed border-amber-300/30 animate-spin" style={{ animationDuration: '40s' }}></div>
            <img src="/src/assets/logo.png" alt="مكتب الفرقان" className="w-full h-full object-contain relative z-10 filter drop-shadow-md" />
          </motion.div>

          {websiteContent.announcement && (
            <div id="announcement-ticker" className="w-full max-w-2xl mx-auto bg-amber-400 text-emerald-950 text-xs font-sans font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 animate-pulse mb-6 border border-amber-300">
              <span className="bg-emerald-900 text-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] select-none border border-emerald-800">تنويه عاجل</span>
              <span>{websiteContent.announcement}</span>
            </div>
          )}

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-serif text-3xl md:text-5xl font-extrabold text-amber-300 tracking-wide drop-shadow-md leading-relaxed"
          >
            {websiteContent.home_title || "مكتب الفرقان لتحفيظ القرآن الكريم"}
          </motion.h2>

          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-sans text-lg md:text-2xl font-medium text-emerald-100/90"
          >
            {websiteContent.home_subtitle || "بكفر الباجور - منوفية"}
          </motion.h3>

          <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed text-emerald-50/80 font-light font-sans">
            صرح قرآني مبارك يقوم على غرس حب كتاب الله عز وجل في قلوب الناشئة، وبناء جيل قرآني فريد يلتزم بتعاليم الدين السمحة ومحاسن الأخلاق تلاوةً وحفظاً وتقديراً.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate("results")}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold px-6 py-3 rounded-2xl shadow-lg shadow-amber-900/20 active:scale-95 transition-all text-sm sm:text-base"
            >
              <Award className="w-5 h-5" />
              <span>نتائج المسابقات</span>
              <ChevronLeft className="w-4 h-4 ml-[-4px]" />
            </button>
            <button
              onClick={() => onNavigate("reports")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3 rounded-2xl active:scale-95 transition-all text-sm sm:text-base"
            >
              <FileText className="w-5 h-5 text-amber-400" />
              <span>تقارير الطلاب</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. DEFINITION & TEACHER / ABOUT SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Definition and Vision block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-xs space-y-6">
            <h3 className="font-serif text-2xl font-bold text-emerald-900 flex items-center gap-2.5">
              <span className="w-1.5 h-7 bg-amber-500 rounded-full"></span>
              رؤيتنا ورسالتنا بالقرية المباركة
            </h3>
            
            <p className="text-gray-600 leading-relaxed text-justify text-sm md:text-base font-sans">
              {websiteContent.about_text || "انطلق مكتب الفرقان بكفر الباجور ليكون منارة مضيئة للعلم الشرعي وحفظ القرآن بالقرية وما جاورها من ربوع محافظة المنوفية. نحن نؤمن بأن تحفيظ كتاب الله لابد أن يلازمه استقامة في السلوك، وتحلٍ بالأدب، وربط لولي الأمر بحلقات التعليم لتكون المتابعة متكاملة متوازية."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-50">
                <h4 className="font-bold text-emerald-800 text-sm md:text-base mb-1.5">الإتقان والتجويد الميسر</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  الحرص التام على تصحيح المخارج وأحكام المدود والغنن والتدريب الممنهج على المتشابهات لتفادي التفلت.
                </p>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-50">
                <h4 className="font-bold text-emerald-800 text-sm md:text-base mb-1.5">تكريم مادي ومعنوي دوري</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  تحفيز باهر للطلاب من خلال الدروع ومصاحف الحفظ الملونة وشهادات التفوق والجوائز النقدية التي تفرح قلوبهم.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Action Cards Grid (WhatsApp & Maps Location) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Interactive WhatsApp Card */}
            <motion.a
              href="https://wa.me/201127225409"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex flex-col justify-between p-6 bg-emerald-50/60 border border-emerald-100 rounded-3xl hover:bg-emerald-800 hover:text-white transition-all cursor-pointer shadow-xs"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="p-3 bg-emerald-600/10 text-emerald-600 group-hover:bg-white/20 group-hover:text-white rounded-2xl transition-all">
                  <PhoneCall className="w-6 h-6" />
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-amber-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  راسلنا مباشر
                </span>
              </div>
              <div>
                <h4 className="font-sans text-lg font-bold group-hover:text-amber-300 transition-colors">اتصال واتساب تفاعلي</h4>
                <p className="text-xs text-gray-500 group-hover:text-emerald-100/90 mt-1 transition-colors leading-relaxed">
                  تواصل معنا للاستفسار، حجز الحلقات، تسجيل الأطفال ومتابعة غياباتهم اليومية مباشرة.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 group-hover:text-amber-200 mt-4 font-bold transition-all">
                  <span>فتح تطبيق الواتساب</span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.a>

            {/* Interactive Location Card */}
            <motion.a
              href="https://maps.app.goo.gl/QVBftuu6YAKMHYwQ8"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex flex-col justify-between p-6 bg-amber-50/40 border border-amber-100/60 rounded-3xl hover:bg-emerald-900 hover:text-white transition-all cursor-pointer shadow-xs"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="p-3 bg-amber-600/10 text-amber-700 group-hover:bg-white/20 group-hover:text-amber-200 rounded-2xl transition-all">
                  <MapPin className="w-6 h-6" />
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 group-hover:bg-emerald-800 group-hover:text-amber-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  موقع الحلقات
                </span>
              </div>
              <div>
                <h4 className="font-sans text-lg font-bold group-hover:text-amber-300 transition-colors">موقعنا على الخريطة</h4>
                <p className="text-xs text-gray-500 group-hover:text-emerald-100/90 mt-1 transition-colors leading-relaxed">
                  زورونا في مقر مكتب الفرقان المجهز بالكامل بكفر الباجور - المنوفية واستمعوا للحلقات مباشرة.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-700 group-hover:text-amber-200 mt-4 font-bold transition-all">
                  <span>تصفح الموقع على الخرائط</span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.a>

          </div>
        </div>

        {/* Sheikh Profile card */}
        <div id="sheikh-card" className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs flex flex-col items-center justify-between space-y-6">
          <div className="space-y-4 text-center w-full">
            <h4 className="font-serif text-lg font-bold text-emerald-950 border-b border-gray-100 pb-3">إدارة وإشراف المكتب</h4>
            
            {/* Visual presentation of generated sheikh picture with border */}
            <div className="relative w-44 h-44 rounded-2xl border-4 border-amber-400 bg-emerald-50 overflow-hidden mx-auto shadow-md">
              <img
                src="/src/assets/sheikh.jpg"
                alt="الشيخ سامح رشاد"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            
            <div className="space-y-1">
              <h5 className="font-sans text-base font-extrabold text-emerald-900">فضيلة الشيخ سامح رشاد</h5>
              <p className="text-xs text-amber-600 font-bold">المشرف العام ومعلم القراءات بالمقر</p>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed font-sans px-2">
              حاصل على إجازات متعددة في رواية حفص عن عاصم، كرس جهوده لخدمة القرآن الكريم وتحفيظ وتوجيه أجيال الناشئة بكفر الباجور بأسلوب تربوي مبسط مفعم بالأبوة والتشجيع المتبادل لجميع فئات الأطفال والمتقدمين.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 font-mono">
              "مَـنْ سَلَـكَ طَرِيقًـا يَلْتَمِسُ فِيهِ عِلْمًـا سَهَّـلَ اللهُ لَـهُ بِـهِ طَرِيقًـا إِلَى الْجَنَّـةِ"
            </span>
          </div>
        </div>

      </section>

      {/* 3. LATEST NEWS PREVIEWS */}
      <section className="space-y-6">
        <div className="flex justify-between items-center bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            متابعة أخبار مكتب الفرقان
          </h3>
          <button
            onClick={() => onNavigate("news")}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-950 transition-colors"
          >
            عرض جميع الأخبار
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">لا يوجد أخبار منشورة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              >
                {/* News Image / Pattern */}
                <div className="h-44 bg-emerald-950/5 relative flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-b from-emerald-800 to-emerald-950 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-full border border-amber-400/30 flex items-center justify-center mb-2">
                        <img src="/src/assets/logo.png" alt="" className="w-6 h-6 object-contain opacity-50" />
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold tracking-wider">الفرقان للأخبار</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 text-[10px] bg-white/90 backdrop-blur-xs text-emerald-900 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    <span>{item.date}</span>
                  </span>
                </div>
                
                {/* News details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-emerald-950 text-sm md:text-base line-clamp-2 leading-relaxed">
                      {item.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                  <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 group-hover:text-amber-600">
                    <span>قراءة الخبر وتفاصيله</span>
                    <ArrowUpLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. LATEST LIBRARY PREVIEWS */}
      <section className="space-y-6">
        <div className="flex justify-between items-center bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            جديد المكتبة والإنتاجات الوعظية
          </h3>
          <button
            onClick={() => onNavigate("library")}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-950 transition-colors"
          >
            تصفح كامل المكتبة
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        ) : library.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">المكتبة خالية من المواد حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {library.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-emerald-50 hover:border-emerald-100 hover:shadow-xs transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.type === "youtube" ? "bg-red-50 text-red-600" :
                      item.type === "pdf" ? "bg-orange-50 text-orange-600" :
                      item.type === "post" ? "bg-emerald-50 text-emerald-600" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {item.type === "youtube" ? "تسجيل مرئي" :
                       item.type === "pdf" ? "كتاب PDF متاح" :
                       item.type === "post" ? "منشور وفوائد" :
                       "تنويه وإعلان"}
                    </span>
                    <span className="text-[9px] text-gray-400">{item.date}</span>
                  </div>
                  
                  <h4 className="font-bold text-emerald-950 text-sm md:text-base leading-relaxed line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate("library")}
                  className="w-full text-center py-2 bg-emerald-50 hover:bg-emerald-100/75 text-emerald-800 text-xs font-bold rounded-xl transition-all"
                >
                  تصفح المادة في المكتبة
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEWS OVERLAY MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col">
            {/* Header image / Banner in modal */}
            <div className="h-56 sm:h-64 bg-emerald-950/20 relative flex items-center justify-center overflow-hidden shrink-0">
              {selectedNews.image ? (
                <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-linear-to-b from-emerald-800 to-emerald-950 flex flex-col items-center justify-center p-4">
                  <img src="/src/assets/logo.png" alt="" className="w-16 h-16 object-contain opacity-40 mb-3" />
                  <span className="text-xs text-amber-400 font-bold tracking-widest">أخبار مكتب الفرقان الرسمي</span>
                </div>
              )}
            </div>

            {/* Contents info */}
            <div className="p-6 sm:p-8 space-y-4 flex-1">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>نُشر في: {selectedNews.date}</span>
              </span>
              
              <h3 className="font-serif text-xl sm:text-2xl font-black text-emerald-900 leading-normal">
                {selectedNews.title}
              </h3>
              
              <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify whitespace-pre-line font-sans pt-2">
                {selectedNews.content}
              </p>
            </div>

            {/* Footer action button */}
            <div className="p-5 bg-emerald-50/50 border-t border-emerald-50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                إغلاق نافذة الخبر
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
