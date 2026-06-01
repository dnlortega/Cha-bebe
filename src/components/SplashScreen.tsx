"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface SplashScreenProps {
  babyName: string;
  genderColor: string;
  fontFamily?: string;
  guestName: string;
  onEnter: () => void;
}

export default function SplashScreen({ babyName, genderColor, fontFamily, guestName, onEnter }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setShow(false);
    setTimeout(onEnter, 800);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-white via-stone-50 to-white"
        >
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-primary/10" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-primary/10" />
          </div>

          <div className="relative z-10 text-center space-y-10 px-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center"
            >
              <Heart className="h-7 w-7 text-primary/40" />
            </motion.div>

            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-[9px] tracking-[0.4em] uppercase opacity-30"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Você foi convidado para
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className={`text-4xl sm:text-5xl md:text-6xl font-serif tracking-[0.15em] uppercase leading-tight ${genderColor}`}
                style={{ fontFamily }}
              >
                {babyName}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-sm opacity-40"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {guestName}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: started ? 1 : 0, y: started ? 0 : 20 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={handleEnter}
                className="px-12 py-4 bg-stone-900 text-white text-[10px] tracking-[0.4em] uppercase hover:bg-stone-800 transition-all shadow-2xl"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Abrir Convite
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: started ? 0.2 : 0 }}
              transition={{ delay: 0.3 }}
              className="text-[8px] tracking-[0.3em] uppercase animate-pulse"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              ✦ ✦ ✦
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}