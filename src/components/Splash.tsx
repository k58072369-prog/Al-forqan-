/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
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
              className="relative mx-auto mb-8 w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Outer Golden Glow */}
              <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-2xl animate-pulse"></div>
              
              {/* Spinning Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />

              {/* Inner Circle / Gold Book */}
              <motion.div
                className="w-30 h-30 sm:w-36 sm:h-36 rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-2xl p-2 relative"
                initial={{ rotate: -15, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: "backOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/15 to-transparent pointer-events-none"></div>
                <BookOpen className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 relative z-10 filter drop-shadow-md" />
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
