"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  babyName: string;
  genderColor: string;
  fontFamily?: string;
  guestName: string;
  isBoy?: boolean;
  isGirl?: boolean;
  onEnter: () => void;
}

export default function SplashScreen({ babyName, genderColor, fontFamily, guestName, isBoy, isGirl, onEnter }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 900);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setShow(false);
    setTimeout(onEnter, 700);
  };

  const bgFrom = isBoy ? "from-sky-100" : isGirl ? "from-rose-100" : "from-stone-100";
  const bgVia  = isBoy ? "via-sky-50"  : isGirl ? "via-rose-50"  : "via-stone-50";
  const bgTo   = "to-white";
  const borderColor = isBoy ? "border-sky-200" : isGirl ? "border-rose-200" : "border-primary/25";
  const orbColor    = isBoy ? "bg-sky-200"      : isGirl ? "bg-rose-200"     : "bg-primary/20";
  const starColor   = isBoy ? "text-sky-300"    : isGirl ? "text-rose-300"   : "text-primary/30";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b ${bgFrom} ${bgVia} ${bgTo} overflow-hidden`}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className={`absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 ${orbColor}`} />
            <div className={`absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 ${orbColor}`} />
          </div>

          {/* Corner ornaments */}
          <div className={`absolute top-6 left-6 sm:top-10 sm:left-10 w-8 h-8 sm:w-12 sm:h-12 border-l-[1.5px] border-t-[1.5px] ${borderColor} opacity-50`} />
          <div className={`absolute top-6 right-6 sm:top-10 sm:right-10 w-8 h-8 sm:w-12 sm:h-12 border-r-[1.5px] border-t-[1.5px] ${borderColor} opacity-50`} />
          <div className={`absolute bottom-6 left-6 sm:bottom-10 sm:left-10 w-8 h-8 sm:w-12 sm:h-12 border-l-[1.5px] border-b-[1.5px] ${borderColor} opacity-50`} />
          <div className={`absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-8 h-8 sm:w-12 sm:h-12 border-r-[1.5px] border-b-[1.5px] ${borderColor} opacity-50`} />

          <div className="relative z-10 text-center px-8 max-w-sm w-full space-y-10">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-3"
            >
              <span className={`block h-px w-10 border-t ${borderColor} opacity-60`} />
              <span className="tracking-[0.55em] uppercase opacity-30 font-light" style={{ fontSize: "15px" }}>Convite Pessoal</span>
              <span className={`block h-px w-10 border-t ${borderColor} opacity-60`} />
            </motion.div>

            {/* Guest name */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.65 }}
              className="space-y-1.5"
            >
              <p className="tracking-[0.45em] uppercase opacity-25 font-light" style={{ fontSize: "15px" }}>Para</p>
              <p
                className={`text-2xl sm:text-3xl font-serif tracking-[0.08em] ${genderColor} opacity-85 break-words`}
                style={{ fontFamily }}
              >
                {guestName}
              </p>
            </motion.div>

            {/* Baby name — hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.75, type: "spring", stiffness: 110, damping: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-3">
                <span className={`block h-px w-10 border-t ${borderColor} opacity-30`} />
                <span className={`text-sm ${starColor}`}>✦</span>
                <span className={`block h-px w-10 border-t ${borderColor} opacity-30`} />
              </div>
              <h1
                className={`font-serif tracking-[0.15em] uppercase leading-tight ${genderColor} break-words`}
                style={{ fontFamily, fontSize: "clamp(1.9rem, 9vw, 3.5rem)" }}
              >
                Chá da {babyName}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className={`block h-px w-10 border-t ${borderColor} opacity-30`} />
                <span className={`text-sm ${starColor}`}>✦</span>
                <span className={`block h-px w-10 border-t ${borderColor} opacity-30`} />
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: started ? 1 : 0, y: started ? 0 : 16 }}
              transition={{ duration: 0.55 }}
            >
              <button
                onClick={handleEnter}
                className="group relative overflow-hidden px-14 py-4 bg-stone-900 text-white text-[9px] tracking-[0.5em] uppercase hover:bg-stone-800 transition-all duration-300 shadow-2xl cursor-pointer"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <span className="relative z-10">Abrir Convite</span>
                <span className="absolute inset-x-0 bottom-0 h-px bg-white/20 group-hover:h-full transition-all duration-500 origin-bottom" />
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: started ? 1 : 0 }}
              transition={{ delay: 0.4 }}
              className={`text-[11px] tracking-[0.5em] ${starColor} animate-pulse`}
            >
              ✦ ✦ ✦
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
