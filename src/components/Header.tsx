/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Menu, X, BookOpen, Award, FileText, Home, Newspaper, ShieldAlert } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
}

export default function Header({ currentTab, setCurrentTab, isAdminLoggedIn }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "home", label: "الرئيسية", icon: Home },
    { id: "results", label: "نتائج المسابقات", icon: Award },
    { id: "reports", label: "تقارير ولي الأمر", icon: FileText },
    { id: "library", label: "المكتبة والإنتاجات", icon: BookOpen },
    { id: "news", label: "أخبار المكتب", icon: Newspaper },
    ...(isAdminLoggedIn ? [{ id: "admin", label: "لوحة التحكم", icon: ShieldAlert }] : []),
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo and Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick("home")}>
            <div className="w-12 h-12 rounded-full border border-amber-400 bg-emerald-50 flex items-center justify-center overflow-hidden p-1 shadow-sm">
              <img
                src="/src/assets/logo.png"
                alt="الفرقان"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="flex flex-col select-none">
              <h1 className="font-serif text-xl font-extrabold text-emerald-800 leading-tight">
                مكتب الفرقان
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-600 font-semibold tracking-wider font-sans">
                لتحفيظ القرآن الكريم بكفر الباجور
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                    isActive
                      ? "text-emerald-950 bg-emerald-50 border-b-2 border-emerald-600 font-semibold"
                      : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Hamburguer toggle button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              aria-label="القائمة الرئيسية"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-2 pt-3 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`m-nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "text-emerald-900 bg-emerald-50/80 font-bold border-r-4 border-emerald-600"
                      : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/40"
                  }`}
                >
                  <IconComp className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
