/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Splash from "./components/Splash";
import Header from "./components/Header";
import Home from "./components/Home";
import News from "./components/News";
import Library from "./components/Library";
import Results from "./components/Results";
import Reports from "./components/Reports";
import Admin from "./components/Admin";
import { MessageSquare, PhoneCall, Heart, Navigation, BookOpen } from "lucide-react";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "news" | "library" | "results" | "reports" | "admin">("home");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Validate session token on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      fetch("/api/admin/check-session", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          setIsAdminLoggedIn(true);
        } else {
          localStorage.removeItem("admin_token");
          setIsAdminLoggedIn(false);
        }
      })
      .catch(() => {
        setIsAdminLoggedIn(false);
      });
    }
  }, []);

  // Monitor location hashes or URL route redirects for hidden direct admin access
  useEffect(() => {
    const handleUrlRouting = () => {
      const isUrlAdmin = 
        window.location.hash === "#admin" || 
        window.location.search.includes("admin") || 
        window.location.pathname.startsWith("/admin");
      
      if (isUrlAdmin) {
        setActiveTab("admin");
      }
    };

    handleUrlRouting();
    window.addEventListener("hashchange", handleUrlRouting);
    window.addEventListener("popstate", handleUrlRouting);
    return () => {
      window.removeEventListener("hashchange", handleUrlRouting);
      window.removeEventListener("popstate", handleUrlRouting);
    };
  }, []);

  // Disable splash screen after 2.2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 relative">
      
      {/* Intricate Islamic Geometrical Pattern Overlay Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>

      {/* MASTER TOP HEADER */}
      <div className="z-40 no-print">
        <Header currentTab={activeTab} setCurrentTab={setActiveTab} isAdminLoggedIn={isAdminLoggedIn} />
      </div>

      {/* PRIMARY SECTION RASH VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === "home" && (
          <Home onNavigate={setActiveTab} />
        )}
        {activeTab === "news" && (
          <News />
        )}
        {activeTab === "library" && (
          <Library />
        )}
        {activeTab === "results" && (
          <Results />
        )}
        {activeTab === "reports" && (
          <Reports />
        )}
        {activeTab === "admin" && (
          <Admin isAdminLoggedIn={isAdminLoggedIn} setIsAdminLoggedIn={setIsAdminLoggedIn} />
        )}
      </main>

      {/* HIGH-END FOOTER WITH MOSQUE/CREATIVE METADATA */}
      <footer className="bg-emerald-950 text-white border-t border-emerald-900 py-12 px-4 relative z-10 no-print mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-right text-xs sm:text-sm font-sans">
          
          {/* Logo Brand Footer block */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-950 p-2 border-2 border-amber-400 cursor-pointer select-none shadow-lg relative overflow-hidden transition-all hover:scale-105 flex items-center justify-center"
                onDoubleClick={() => {
                  setActiveTab("admin");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title="اضغط هنا مرتين متتاليتين لتسجيل الدخول للإدارة"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-amber-400/10 to-transparent"></div>
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 relative z-10" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-black text-amber-300">مكتب الفرقان</h3>
                <p className="text-[10px] sm:text-xs text-emerald-200 font-sans">الصرح القرآني المتكامل لتحفيظ القرآن والتجويد</p>
              </div>
            </div>
            
            <p className="text-gray-400 leading-relaxed text-justify text-xs">
              مكتب الفرقان لتحفيظ القرآن الكريم بكفر الباجور يسعى لتنشئة جيل يحفظ كتاب الله تعالى، يتلوه تلاوة صحيحة مجودة، ويعمل بآياته وأحكامه ليكون لبنة صالحة في مجتمعنا.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="font-serif text-amber-400 text-sm font-bold border-r-2 border-amber-400 pr-2">أقسام تفاعلية سريعة</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 font-sans">
              <button onClick={() => setActiveTab("home")} className="text-right hover:text-amber-300 transition-colors cursor-pointer">الرئيسية والتعريف</button>
              <button onClick={() => setActiveTab("news")} className="text-right hover:text-amber-300 transition-colors cursor-pointer">آخر الأخبار</button>
              <button onClick={() => setActiveTab("library")} className="text-right hover:text-amber-300 transition-colors cursor-pointer">المكتبة والكتب</button>
              <button onClick={() => setActiveTab("results")} className="text-right hover:text-amber-300 transition-colors cursor-pointer">نتائج المسابقات</button>
              <button onClick={() => setActiveTab("reports")} className="text-right hover:text-amber-300 transition-colors cursor-pointer">تقارير أولياء الأمور</button>
              {isAdminLoggedIn && (
                <button onClick={() => setActiveTab("admin")} className="text-right hover:text-amber-300 transition-colors cursor-pointer">شؤون المعلمين</button>
              )}
            </div>
          </div>

          {/* Address and communications */}
          <div className="space-y-4">
            <h4 className="font-serif text-amber-400 text-sm font-bold border-r-2 border-amber-400 pr-2">موقعنا ووسائل التواصل</h4>
            
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <p>العنوان: المنوفية - مركز الباجور - قرية كفر الباجور - بمنزل المهندس عبدالرحمن عبدالله</p>
              <div className="flex gap-4">
                <a
                  href="https://wa.me/201127225409"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>راسلنا واتساب</span>
                </a>
                <a
                  href="https://maps.app.goo.gl/QVBftuu6YAKMHYwQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-amber-300 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-red-500" />
                  <span>موقعنا على الخريطة</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-emerald-900 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
          <div className="flex items-center gap-1 font-sans">
            <span>تم التطوير بحب وكفاءة</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
            <span>لخدمة كتاب الله العزيز بـ كفر الباجور</span>
          </div>
          
          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <p>© 2026 مكتب الفرقان لتحفيظ القرآن الكريم. جميع الحقوق محفوظة.</p>
            <div 
              id="developer-signature"
              className="text-[10px] text-amber-300 transition-all font-serif hover:text-amber-200 select-none bg-emerald-900/60 py-1.5 px-3.5 rounded-full border border-emerald-800/80 flex items-center gap-1.5 animate-pulse"
            >
              <span>تم التطوير بكل حُبّ وإتقان بواسطة</span>
              <span className="font-sans font-bold tracking-wider underline decoration-amber-400/40">أدْهم أيْمَن</span>
              <span className="text-gray-400">|</span>
              <span className="font-sans tracking-tight">Developed with Love by Adham Ayman</span>
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block"></span>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOAT WHATSAPP WIDGET */}
      <a
        href="https://wa.me/201127225409"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group cursor-pointer no-print focus:outline-none"
        title="تواصل معنا عبر واتساب"
        id="whatsapp-floater"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-32 group-hover:ml-2 transition-all duration-300 font-sans text-xs font-bold whitespace-nowrap block text-right">
          تواصل معنا واتساب
        </span>
        <PhoneCall className="w-5.5 h-5.5 text-white animate-pulse" />
      </a>

    </div>
  );
}
