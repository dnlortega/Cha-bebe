"use client";

import { motion } from "framer-motion";

const STICKERS = [
  { icon: "❤️", color: "bg-red-400", label: "TATA" },
  { icon: "🐰", color: "bg-pink-400", label: "COOKY" },
  { icon: "🐶", color: "bg-yellow-400", label: "CHIMMY" },
  { icon: "🦙", color: "bg-white", label: "RJ" },
  { icon: "🐨", color: "bg-blue-400", label: "KOYA" },
  { icon: "🍪", color: "bg-amber-700", label: "SHOOKY" },
];

export function BT21Stickers() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {STICKERS.map((sticker, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            rotate: Math.random() * 360
          }}
          animate={{
            y: ["-10%", "110%"],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2
          }}
          className={`absolute flex items-center gap-2 p-2 rounded-full shadow-lg border-2 border-black/10 ${sticker.color} bg-opacity-90`}
        >
          <span className="text-2xl">{sticker.icon}</span>
          <span className="text-[8px] font-bold tracking-widest">{sticker.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
