"use client";

import { useState, useEffect, useRef } from "react";
import { getGuests } from "@/app/actions";
import { getActiveEventSlug } from "@/app/eventActions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RefreshCw, Users, CheckCircle2, Clock, UserPlus, TrendingUp, Baby, UserCheck,
  ChevronRight, PackageCheck, XCircle, Stars, ArrowUpRight
} from "lucide-react";
import AdminTour, { type TourStep } from "@/components/AdminTour";

const DASHBOARD_TOUR: TourStep[] = [
  { selector: null,                icon: "📊", title: "Dashboard — Status",       body: "Esta é a tela principal. Aqui você acompanha em tempo real quantos convidados confirmaram, quantos estão pendentes e todos os detalhes do seu evento." },
  { selector: "#tour-dash-rate",   icon: "🎯", title: "Taxa de Confirmação",      body: "O anel circular mostra o percentual de convidados que já confirmaram presença. Ele atualiza automaticamente a cada 15 segundos." },
  { selector: "#tour-dash-cards",  icon: "📋", title: "Cards de Status",          body: "Cada card exibe um número importante: confirmados, pendentes, recusados, adultos e crianças confirmados. Clique em qualquer card para ver a lista detalhada." },
  { selector: "#tour-dash-sync",   icon: "🔄", title: "Sincronizar",              body: "Use este botão para forçar uma atualização imediata dos dados. Normalmente a tela já atualiza sozinha a cada 15 segundos." },
];

function CircularProgress({ value, max, size = 120, strokeWidth = 8, color = "var(--primary)" }: { value: number; max: number; size?: number; strokeWidth?: number; color?: string; }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;
  return (
    <svg width={size} height={size} className="rotate-[-90deg] drop-shadow-md">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-stone-200/50" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </svg>
  );
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [eventSlug, setEventSlug] = useState<string>("evento-principal");

  const guestsRef = useRef<any[]>([]);
  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  const handleCategoryClick = (label: string) => {
    setSelectedCategory(prev => prev === label ? null : label);
  };

  const expandPeople = (filter: (g: any) => boolean, memberField: string) => {
    const list: { id: string; nome: string; tipo: string; grupo?: string; status_confirmacao?: string | null }[] = [];
    guests.filter(filter).forEach(g => {
      if (g.tipo === "FAMILIA" && g[memberField]) {
        g[memberField].split(",").map((n: string) => n.trim()).filter(Boolean).forEach((n: string, i: number) => {
          list.push({ id: `${g.id}_${i}`, nome: n, tipo: "FAMILIA", grupo: g.nome, status_confirmacao: g.status_confirmacao });
        });
      } else {
        list.push({ id: g.id, nome: g.nome, tipo: g.tipo || "INDIVIDUAL", status_confirmacao: g.status_confirmacao });
      }
    });
    return list;
  };

  const getFilteredGuests = (): any[] => {
    if (!selectedCategory) return [];
    switch (selectedCategory) {
      case "CONFIRMADOS":
        return expandPeople(g => g.status_confirmacao === "CONFIRMED", "membros_confirmados");
      case "PENDENTES":
        return expandPeople(g => !g.status_confirmacao, "membros");
      case "RECUSADOS":
        return expandPeople(g => g.status_confirmacao === "DECLINED", "membros");
      case "ADULTOS":
        return guests.filter(g => g.status_confirmacao === "CONFIRMED" && g.qtd_adultos > 0);
      case "CRIANÇAS":
        return guests.filter(g => g.status_confirmacao === "CONFIRMED" && g.qtd_criancas > 0);
      case "TOTAL":
        return expandPeople(() => true, "membros");
      default:
        return [];
    }
  };

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    const [gData, slug] = await Promise.all([getGuests(), getActiveEventSlug()]);
    
    setEventSlug(slug);
    const currentGuests = guestsRef.current;
    if (currentGuests.length > 0) {
      gData.forEach(newGuest => {
        const oldGuest = currentGuests.find(g => g.id === newGuest.id);
        const wasConfirmed = oldGuest?.status_confirmacao === "CONFIRMED";
        const isNowConfirmed = newGuest.status_confirmacao === "CONFIRMED";
        
        if (isNowConfirmed && !wasConfirmed) {
          const audio = new Audio("/audio/confirm.wav");
          audio.volume = 0.55;
          audio.play().catch(() => {});

          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([150, 80, 150]);
          }

          toast.success(`🎉 ${newGuest.nome} confirmou presença!`, {
            description: newGuest.mensagem ? `"${newGuest.mensagem}"` : "Presença confirmada no evento.",
            duration: 8000,
            action: {
              label: "Ver Detalhes",
              onClick: () => setSelectedCategory("CONFIRMADOS")
            }
          });

          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`🍼 Chá da Louise`, {
                body: `${newGuest.nome} confirmou presença!`,
                icon: "/icon.png"
              });
            } catch (e) {}
          }
        }
      });
    }

    setGuests(gData);
    if (!isSilent) setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio("/audio/2869-120.wav");
      audio.volume = 0;
      audio.play()
        .then(() => {
          window.removeEventListener("touchstart", unlockAudio);
          window.removeEventListener("click", unlockAudio);
        })
        .catch(() => {});
    };

    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  const countPeople = (g: any, field: string) => {
    if (g.tipo === "FAMILIA" && g[field]) {
      return g[field].split(",").filter((s: string) => s.trim()).length;
    }
    return 1;
  };

  const totalPeople = guests.reduce((acc, g) => acc + countPeople(g, "membros"), 0);
  const confirmed = guests.reduce((acc, g) =>
    g.status_confirmacao === "CONFIRMED" ? acc + countPeople(g, "membros_confirmados") : acc, 0
  );
  const pending = guests.reduce((acc, g) =>
    !g.status_confirmacao ? acc + countPeople(g, "membros") : acc, 0
  );
  const declined = guests.reduce((acc, g) =>
    g.status_confirmacao === "DECLINED" ? acc + countPeople(g, "membros") : acc, 0
  );
  const adults = guests.reduce((acc, g) => g.status_confirmacao === "CONFIRMED" ? acc + (g.qtd_adultos || 0) : acc, 0);
  const children = guests.reduce((acc, g) => g.status_confirmacao === "CONFIRMED" ? acc + (g.qtd_criancas || 0) : acc, 0);
  const totalInvites = guests.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-12 pb-20 relative">
      <AdminTour steps={DASHBOARD_TOUR} storageKey="tour_dashboard_v1" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-primary/10 pb-8 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
             <h1 className="text-4xl md:text-5xl font-serif text-stone-800 tracking-tight">Status</h1>
          </div>

        </div>
        <Button
          id="tour-dash-sync"
          variant="outline"
          onClick={() => fetchData()}
          disabled={loading}
          className="border border-primary/20 dark:border-primary/30 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:bg-primary dark:hover:bg-primary hover:text-white transition-all shadow-sm rounded-xl h-11 px-6 group"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2 text-primary dark:text-primary group-hover:text-white transition-colors", loading && "animate-spin")} />
          <span className="text-[10px] tracking-widest uppercase font-bold">Sincronizar</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 relative z-10">
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Card id="tour-dash-rate" className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-8 shadow-2xl border border-stone-700 relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-800 to-transparent opacity-10 mix-blend-overlay" />
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <CircularProgress value={confirmed} max={totalPeople} size={160} strokeWidth={12} color="var(--primary)" />
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <p className="text-5xl font-serif text-white tracking-tighter">{totalPeople > 0 ? Math.round((confirmed/totalPeople)*100) : 0}<span className="text-2xl text-primary">%</span></p>
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
               <p className="text-[10px] text-stone-400 font-bold tracking-[0.4em] uppercase">Taxa de Confirmação</p>
               <p className="text-xs text-stone-500 font-light">{confirmed} de {totalPeople} pessoas</p>
            </div>
          </Card>
        </motion.div>

        <div id="tour-dash-cards" className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {[
            { label: "CONFIRMADOS", value: confirmed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "PENDENTES", value: pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
            { label: "RECUSADOS", value: declined, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            { label: "ADULTOS", value: adults, icon: UserCheck, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
            { label: "CRIANÇAS", value: children, icon: Baby, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
            { label: "TOTAL", value: totalPeople, icon: Users, color: "text-stone-500", bg: "bg-stone-500/10", border: "border-stone-500/20" }
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="h-full">
              <Card 
                onClick={() => handleCategoryClick(s.label)}
                className={cn(
                  "h-full border shadow-sm hover:shadow-xl rounded-3xl bg-white/70 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between gap-6 group transition-all duration-300 cursor-pointer select-none relative overflow-hidden",
                  selectedCategory === s.label ? `ring-2 ring-offset-2 ${s.border.replace('border-', 'ring-').replace('/20', '')}` : s.border
                )}
              >
                <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500", s.bg)} />
                <div className={cn(`p-3.5 rounded-2xl w-fit transition-transform group-hover:scale-110 duration-300`, s.bg)}>
                  <s.icon className={cn(`h-6 w-6`, s.color)} />
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-serif text-stone-800 leading-none">{s.value}</p>
                  <p className={cn("text-[9px] font-bold tracking-[0.2em] uppercase mt-3", s.color)}>{s.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detalhes da Categoria Selecionada */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-primary/20 p-8 md:p-10 shadow-2xl rounded-3xl space-y-8 mt-6">
              <div className="flex justify-between items-center border-b border-primary/10 pb-6">
                <h3 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-primary flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Lista: {selectedCategory} ({getFilteredGuests().length})
                </h3>
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:text-red-500 flex items-center gap-2 transition-colors bg-stone-100 hover:bg-red-50 px-4 py-2 rounded-xl"
                >
                  <XCircle className="h-4 w-4" /> <span className="hidden sm:inline">Fechar</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {getFilteredGuests().map((guest: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="bg-white border border-stone-200/60 p-5 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all flex flex-col gap-2 group"
                  >
                    <span className="text-xs font-bold tracking-wider text-stone-800 uppercase truncate group-hover:text-primary transition-colors">
                      {guest.nome}
                    </span>
                    
                    {selectedCategory === "CONFIRMADOS" && (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit uppercase tracking-widest font-bold">
                        {guest.grupo ? `Família ${guest.grupo}` : "Individual"}
                      </span>
                    )}
                    {selectedCategory === "PENDENTES" && (
                      <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit uppercase tracking-widest font-bold">
                        Aguardando
                      </span>
                    )}
                    {selectedCategory === "RECUSADOS" && (
                      <span className="text-[9px] text-red-600 bg-red-50 px-2 py-1 rounded-md w-fit uppercase tracking-widest font-bold">
                        Recusou
                      </span>
                    )}
                    {selectedCategory === "ADULTOS" && (
                      <span className="text-[9px] text-primary bg-primary/10 px-2 py-1 rounded-md w-fit uppercase tracking-widest font-bold">
                        {guest.qtd_adultos} {guest.qtd_adultos === 1 ? "Adulto" : "Adultos"}
                      </span>
                    )}
                    {selectedCategory === "CRIANÇAS" && (
                      <span className="text-[9px] text-sky-600 bg-sky-50 px-2 py-1 rounded-md w-fit uppercase tracking-widest font-bold">
                        {guest.qtd_criancas} {guest.qtd_criancas === 1 ? "Criança" : "Crianças"}
                      </span>
                    )}
                    {selectedCategory === "TOTAL" && (
                      <span className={cn(
                        "text-[9px] px-2 py-1 rounded-md w-fit uppercase tracking-widest font-bold",
                        guest.status_confirmacao === "CONFIRMED" ? "text-emerald-600 bg-emerald-50" : 
                        guest.status_confirmacao === "DECLINED" ? "text-red-600 bg-red-50" : 
                        "text-stone-500 bg-stone-100"
                      )}>
                        {guest.status_confirmacao === "CONFIRMED" ? "Confirmado" : guest.status_confirmacao === "DECLINED" ? "Recusado" : "Pendente"}
                      </span>
                    )}
                  </motion.div>
                ))}
                
                {getFilteredGuests().length === 0 && (
                  <div className="col-span-full py-16 text-center text-xs tracking-widest uppercase text-stone-400 font-medium">
                    Nenhum convidado nessa categoria
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="space-y-10 lg:col-span-7 xl:col-span-8">
          <motion.section variants={itemVariants} className="space-y-6">
             <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-primary/60 flex items-center gap-3 ml-2">
               <TrendingUp className="h-4 w-4" /> Ações Rápidas
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/admin/add" className="group p-6 bg-stone-900 text-white rounded-2xl flex items-center justify-between shadow-xl hover:shadow-2xl hover:bg-stone-800 transition-all overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-full w-2 bg-primary group-hover:w-full transition-all duration-500 opacity-20" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase relative z-10">Novo Convidado</span>
                  <UserPlus className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
                </Link>
                <Link href="/admin/gifts" className="group p-6 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-700 group-hover:text-primary transition-colors">Gerir Presentes</span>
                  <PackageCheck className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </Link>
                <Link href={`/${eventSlug}/mural`} target="_blank" className="group p-6 bg-primary text-primary-foreground rounded-2xl flex items-center justify-between shadow-xl hover:shadow-primary/30 hover:bg-primary/90 transition-all relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase relative z-10 flex items-center gap-2">Mural Live <ArrowUpRight className="w-3 h-3 opacity-70" /></span>
                  <Stars className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform" />
                </Link>
             </div>
          </motion.section>
        </div>

        <div className="space-y-10 lg:col-span-5 xl:col-span-4">
          <motion.section variants={itemVariants} className="space-y-6">
             <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-primary/60 flex items-center gap-3 ml-2">
               <PackageCheck className="h-4 w-4" /> Monitoramento
             </h3>
             <Card className="bg-gradient-to-br from-white to-stone-50/50 border border-stone-200 p-8 shadow-md rounded-[2rem] group hover:border-primary/30 transition-colors h-full flex flex-col justify-center">
                <div className="space-y-6">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <PackageCheck className="h-6 w-6 text-primary" />
                   </div>
                   <p className="text-xs text-stone-500 uppercase tracking-widest leading-relaxed">
                     Acompanhe em tempo real a distribuição de fraldas e presentes reservados na lista.
                   </p>
                   <Link href="/admin/guests" className="inline-flex items-center gap-2 bg-stone-900 text-white text-[10px] font-bold tracking-[0.3em] uppercase px-6 py-3 rounded-xl hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all group-hover:gap-4">
                     Ver Relatório <ChevronRight className="h-4 w-4" />
                   </Link>
                </div>
             </Card>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
