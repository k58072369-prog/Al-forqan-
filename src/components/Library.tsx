/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Search, Film, FileText, Bookmark, Bell, AlignRight, ExternalLink, Download } from "lucide-react";
import { LibraryItem, LibraryType } from "../types";

export default function Library() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<LibraryType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const res = await fetch("/api/library");
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات المكتبة:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, []);

  // Helper to extract clean YouTube ID and yield embed URL
  function getYouTubeEmbedUrl(url?: string): string {
    if (!url) return "";
    try {
      // Handle shorts, watch, embed, mobile and shared links
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^#&?]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1].trim()}`;
      }
      
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|shorts\\\/)([^#\&\?]*).*/;
      const secondMatch = url.match(regExp);
      if (secondMatch && secondMatch[2] && secondMatch[2].trim().length === 11) {
        return `https://www.youtube.com/embed/${secondMatch[2].trim()}`;
      }
    } catch (err) {
      console.error("error parsing youtube url:", err);
    }
    return "";
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" ? true : item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const categories: { id: LibraryType | "all"; label: string; icon: any }[] = [
    { id: "all", label: "الكل", icon: AlignRight },
    { id: "youtube", label: "فيديوهات تعليمية", icon: Film },
    { id: "pdf", label: "كتب ومقررات PDF", icon: FileText },
    { id: "post", label: "منشورات وتوجيهات الحفظ", icon: Bookmark },
    { id: "announcement", label: "الإعلانات والمواعيد", icon: Bell },
  ];

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-950">
          المكتبة والإنتاجات الوعظية
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
          توجيهات وكتب إرشادية وتدريبات مرئية لأبنائنا الحفظة وأولياء أمورهم لدعم ترسيخ الحفظ وتجويد الأداء التعبيري والمخارج الميسرة.
        </p>
      </div>

      {/* FILTER PANEL - CATEGORIES */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-50 shadow-xs space-y-5">
        
        {/* Search bar + filter type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="ابحث عن نصائح، مقالات، روايات، أو كتب داخل المكتبة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-right bg-gray-50 outline-none border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-2xl py-3.5 pr-11 pl-4 text-xs sm:text-sm font-sans transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-left text-xs text-gray-400 font-sans font-medium px-1">
            إجمالي المواد الموجودة: <span className="text-emerald-700 font-bold">{filteredItems.length}</span> مادة
          </div>
        </div>

        {/* Categories Tab Switchnig */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedType === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/10"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-amber-300" : "text-gray-400"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* DISPLAY MATERIALS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">لم يتم العثور على أي مواد مطابقة للتصفية الحالية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            
            // 1. YouTube type
            if (item.type === "youtube") {
              const embedUrl = getYouTubeEmbedUrl(item.url);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-xs flex flex-col h-full"
                >
                  <div className="aspect-video bg-black relative">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={item.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <span className="text-white text-xs">رابط غير صحيح للفيديو</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">درس مرئي تفاعلي</span>
                        <span className="text-[9px] text-gray-400 font-mono">{item.date}</span>
                      </div>
                      <h3 className="font-sans font-bold text-emerald-950 text-sm sm:text-base leading-relaxed">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 pt-2"
                      >
                        <span>مشاهدة على يوتيوب مباشرة</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            }

            // 2. PDF type
            if (item.type === "pdf") {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-xs flex flex-col sm:flex-row h-full"
                >
                  {/* Book cover simulator banner / actual cover image */}
                  <div className="sm:w-1/3 bg-emerald-950 shrink-0 min-h-[160px] sm:min-h-auto relative overflow-hidden flex items-center justify-center">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-800 to-emerald-950 p-6 flex flex-col justify-between items-center text-center">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:10px_10px]"></div>
                        <FileText className="w-12 h-12 text-amber-400 opacity-80" />
                        <span className="text-[9px] text-amber-200 font-semibold uppercase tracking-widest leading-none mt-2">مكتبة الفرقان العلمية</span>
                        <div className="w-full h-1 bg-amber-400/30 rounded-full mt-4"></div>
                      </div>
                    )}
                  </div>

                  {/* Book details context */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">كتاب ومذكرة PDF</span>
                        <span className="text-[9px] text-gray-400">{item.date}</span>
                      </div>
                      <h3 className="font-sans font-extrabold text-emerald-950 text-sm sm:text-base leading-relaxed">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <a
                        href={item.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>قراءة الكتاب</span>
                      </a>
                      <a
                        href={item.url || "#"}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل المادة</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Post (فوائد وتوجيهات)
            if (item.type === "post") {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-emerald-50 shadow-xs flex flex-col justify-between overflow-hidden h-full"
                >
                  {item.coverImage && (
                    <div className="h-44 overflow-hidden relative">
                      <img src={item.coverImage} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                          <span>توجيهات الحفظ والتسميع</span>
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">{item.date}</span>
                      </div>

                      <h3 className="font-sans font-black text-emerald-950 text-sm sm:text-base leading-relaxed">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-justify">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                      <span>مكتب الفرقان بكفر الباجور</span>
                      <span>توجيه مستمر</span>
                    </div>
                  </div>
                </div>
              );
            }

            // 4. Announcement type
            return (
              <div
                key={item.id}
                className="bg-amber-50/20 rounded-3xl border border-amber-100/50 shadow-xs flex flex-col justify-between overflow-hidden h-full"
              >
                {item.coverImage && (
                  <div className="h-44 overflow-hidden relative">
                    <img src={item.coverImage} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold bg-amber-100/70 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-amber-600" />
                        <span>تنويه وهام جداً</span>
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">{item.date}</span>
                    </div>

                    <h3 className="font-sans font-black text-amber-950 text-sm sm:text-base leading-relaxed">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-justify">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-amber-100/50 flex items-center justify-between text-[11px] text-amber-800/60">
                    <span>يرجى الالتزام التام بالمواعيد</span>
                    <span>تنويه الإدارة</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
