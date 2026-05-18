"use client";

import { useState, useEffect, useCallback } from "react";
import { getRecentMessages, getSettings } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Stars, Baby, MessageSquareQuote, Settings2, Clock } from "lucide-react";

export default function MuralLivePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // Default 30s
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = useCallback(async () => {
    const [msgData, settsData] = await Promise.all([getRecentMessages(), getSettings()]);
    setMessages(msgData.filter(m => m.mensagem && m.mensagem.length > 2));
    setSettings(settsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const isBoy = settings?.babyGender === "BOY";
  const isGirl = settings?.babyGender === "GIRL";
  const babyName = settings?.babyName || "Bebê";
  const prefix = isGirl ? "da" : isBoy ? "do" : "do";

  return (
    <main className={`min-h-screen transition-colors duration-1000 overflow-hidden relative flex flex-col items-center p-10 sm:p-20 ${
      isBoy ? "bg-sky-50 text-sky-900" : isGirl ? "bg-rose-50 text-rose-900" : "bg-stone-50 text-stone-900"
    }`}>
      {/* Efeitos de Fundo Flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              y: "110vh", 
              x: `${Math.random() * 100}vw`,
              rotate: 0 
            }}
            animate={{ 
              opacity: [0, 0.2, 0.2, 0], 
              y: "-10vh",
              rotate: 360 
            }}
            transition={{ 
              duration: 15 + Math.random() * 20, 
              repeat: Infinity, 
              delay: Math.random() * 20,
              ease: "linear" 
            }}
            className="absolute"
          >
            {i % 2 === 0 ? (
              <Heart className={`w-8 h-8 ${isBoy ? "text-sky-300" : isGirl ? "text-rose-300" : "text-primary/20"} fill-current`} />
            ) : (
              <Stars className={`w-6 h-6 ${isBoy ? "text-sky-300" : isGirl ? "text-rose-300" : "text-primary/20"}`} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] ${isBoy ? "bg-sky-200/30" : isGirl ? "bg-rose-200/30" : "bg-primary/5"}`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] ${isBoy ? "bg-sky-200/30" : isGirl ? "bg-rose-200/30" : "bg-primary/5"}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] ${isBoy ? "text-sky-500" : isGirl ? "text-rose-500" : "text-primary"}`}>
           <Baby className="w-[80vh] h-[80vh]" />
        </div>
      </div>

      <header className="relative z-10 text-center space-y-4 mb-20">
        <div className={`flex items-center justify-center gap-4 opacity-40 ${isBoy ? "text-sky-600" : isGirl ? "text-rose-600" : "text-primary"}`}>
           <Stars className="w-6 h-6 animate-pulse" />
           <p className="text-[12px] tracking-[0.8em] uppercase font-light">Recados de Carinho</p>
           <Stars className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className={`text-6xl sm:text-8xl font-serif tracking-[0.2em] uppercase transition-colors ${isBoy ? "text-sky-800" : isGirl ? "text-rose-800" : "text-primary"}`}>
          Mural {prefix} {babyName}
        </h1>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <p className="text-[12px] tracking-[0.5em] opacity-30 uppercase animate-pulse">Carregando mensagens...</p>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-7xl flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {messages.map((m, i) => (
                <motion.div
                  key={m.id || m.nome + i}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ 
                    duration: 0.8, 
                    type: "spring",
                    stiffness: 50
                  }}
                  className="bg-white p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-primary/5 relative group"
                >
                  <div className={`absolute -top-4 -right-4 p-3 shadow-lg ${isBoy ? "bg-sky-500" : isGirl ? "bg-rose-500" : "bg-primary"} text-white`}>
                     <Heart className="w-5 h-5 fill-white" />
                  </div>
                  
                  <div className="space-y-6">
                    <p className={`text-2xl sm:text-3xl font-serif leading-relaxed italic normal-case ${isBoy ? "text-sky-950" : isGirl ? "text-rose-950" : "text-stone-800"}`}>
                      "{m.mensagem}"
                    </p>
                    <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
                      <div>
                        <p className={`text-[12px] font-bold tracking-[0.3em] uppercase ${isBoy ? "text-sky-600" : isGirl ? "text-rose-600" : "text-primary"}`}>{m.nome}</p>
                        <p className="text-[9px] opacity-30 tracking-widest uppercase mt-1">Convidado Confirmado</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {messages.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-64 opacity-20 space-y-4 ${isBoy ? "text-sky-500" : isGirl ? "text-rose-500" : "text-primary"}`}>
               <MessageSquareQuote className="w-12 h-12" />
               <p className="text-[12px] tracking-[0.5em] uppercase">Aguardando as primeiras mensagens...</p>
            </div>
          )}
        </div>
      )}

      {/* Controle de Intervalo Minimalista */}
      <div className="fixed bottom-10 right-10 z-50 flex items-center gap-4">
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/80 backdrop-blur-md p-2 shadow-2xl border border-primary/10 flex gap-2"
            >
              {[
                { label: "10s", val: 10000 },
                { label: "30s", val: 30000 },
                { label: "1m", val: 60000 },
                { label: "5m", val: 300000 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => { setRefreshInterval(opt.val); setShowSettings(false); }}
                  className={`px-4 py-2 text-[10px] tracking-widest font-bold uppercase transition-all ${
                    refreshInterval === opt.val ? (isBoy ? "bg-sky-500 text-white" : isGirl ? "bg-rose-500 text-white" : "bg-primary text-white") : "hover:bg-primary/5 opacity-40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-4 shadow-2xl transition-all hover:scale-110 ${isBoy ? "bg-sky-500" : isGirl ? "bg-rose-500" : "bg-primary"} text-white rounded-full`}
        >
          <Clock className="w-5 h-5" />
        </button>
      </div>

      <footer className={`relative z-10 mt-20 opacity-20 ${isBoy ? "text-sky-800" : isGirl ? "text-rose-800" : "text-stone-900"}`}>
         <p className="text-[10px] tracking-[0.6em] uppercase">Deixe seu recado ao confirmar sua presença</p>
      </footer>
    </main>
  );
}

