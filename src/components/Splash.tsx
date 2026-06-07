/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation to finish before calling parent complete
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="splash-screen"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-radial from-emerald-950 via-emerald-900 to-black text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="text-center px-4 max-w-md">
            {/* Spinning Golden Logo Halo */}
            <motion.div
              className="relative mx-auto mb-8 w-32 h-32 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Outer Golden Glow */}
              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse"></div>
              
              {/* Spinning Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-3 border-dashed border-amber-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />

              {/* Inner Circle / Logo File */}
              <motion.div
                className="w-24 h-24 rounded-full bg-emerald-900 border border-amber-500/50 flex items-center justify-center overflow-hidden shadow-2xl p-2"
                initial={{ rotate: -15 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 1.2 }}
              >
                <img
                  src="/src/assets/logo.png"
                  alt="مكتب الفرقان"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to simple icon if image fails
                    e.currentTarget.style.display = "none";
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Office Name with Amiri Serif Typography */}
            <motion.h1
              className="font-serif text-3xl md:text-4xl text-amber-400 font-bold leading-relaxed mb-3 drop-shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              مكتب الفرقان
            </motion.h1>

            <motion.p
              className="text-emerald-100 font-sans tracking-wide text-sm md:text-base font-light mb-6 opacity-90"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              لتحفيظ القرآن الكريم بكفر الباجور
            </motion.p>

            {/* Subtle Line separator */}
            <motion.div
              className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            />

            {/* Soft Islamic quote in Amiri serif */}
            <motion.p
              className="text-amber-200/80 font-serif italic text-base leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              "مَاهِرُ الْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ"
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
