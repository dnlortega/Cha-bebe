"use client";

import { useState, useEffect } from "react";
import { getGuests, getRecentMessages } from "@/app/actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Loader2, RefreshCw, Users, CheckCircle2, Clock, UserPlus, TrendingUp, Baby, UserCheck, ClipboardList, ChevronRight, PackageCheck, Flame, XCircle, ArrowUpRight, MessageSquareQuote
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

function CircularProgress({ value, max, size = 120, strokeWidth = 8, color = "var(--primary)" }: { value: number; max: number; size?: number; strokeWidth?: number; color?: string; }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]"><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-stone-100" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
    </svg>
  );
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [gData, mData] = await Promise.all([getGuests(), getRecentMessages()]);
    setGuests(gData);
    setMessages(mData);
    setLoading(false);
  };

  const total = guests.length;
  const confirmed = guests.filter(g => g.status_confirmacao === "CONFIRMED").length;
  const pending = guests.filter(g => !g.status_confirmacao).length;
  const declined = guests.filter(g => g.status_confirmacao === "DECLINED").length;
  const adults = guests.reduce((acc, g) => g.status_confirmacao === "CONFIRMED" ? acc + (g.qtd_adultos || 0) : acc, 0);
  const children = guests.reduce((acc, g) => g.status_confirmacao === "CONFIRMED" ? acc + (g.qtd_criancas || 0) : acc, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-6">
        <div className="space-y-1"><h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Status</h1><p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Visão Geral do Evento</p></div>
        <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} className="border border-primary/5 h-11 w-11"><RefreshCw className={loading ? "animate-spin h-4 w-4" : "h-4 w-4"} /></Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-stone-900 text-white rounded-none p-10 flex flex-col items-center justify-center text-center gap-6 shadow-2xl">
          <div className="relative"><CircularProgress value={confirmed} max={total} size={130} strokeWidth={10} /><div className="absolute inset-0 flex items-center justify-center"><p className="text-4xl font-serif">{total > 0 ? Math.round((confirmed/total)*100) : 0}%</p></div></div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-50">Taxa de Confirmação</p>
        </Card>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "CONFIRMADOS", value: confirmed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "PENDENTES", value: pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "RECUSADOS", value: declined, icon: XCircle, color: "text-red-400", bg: "bg-red-50" },
            { label: "ADULTOS", value: adults, icon: UserCheck, color: "text-primary", bg: "bg-primary/5" },
            { label: "CRIANÇAS", value: children, icon: Baby, color: "text-sky-400", bg: "bg-sky-50" },
            { label: "TOTAL", value: total, icon: Users, color: "text-stone-400", bg: "bg-stone-50" }
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-lg rounded-none bg-white p-6 flex flex-col gap-3 group hover:translate-y-[-2px] transition-all"><div className={`p-3 ${s.bg} rounded-none w-fit`}><s.icon className={`h-4 w-4 ${s.color}`} /></div><div><p className="text-3xl font-serif text-primary leading-none">{s.value}</p><p className="text-[8px] font-bold tracking-[0.2em] opacity-30 uppercase mt-1">{s.label}</p></div></Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Mural de Recados */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 flex items-center gap-3"><MessageSquareQuote className="h-4 w-4" /> Mural de Recados</h3>
          <div className="grid grid-cols-1 gap-4">
            {messages.length === 0 ? <p className="text-[9px] opacity-20 tracking-widest uppercase py-10 text-center bg-white border border-primary/5">Nenhum recado ainda</p> : messages.map((m, i) => (
              <Card key={i} className="border-none shadow-xl bg-white rounded-none p-6 space-y-3">
                <p className="text-[11px] tracking-widest font-bold text-primary uppercase">{m.nome}</p>
                <p className="text-[11px] opacity-70 leading-relaxed italic normal-case">"{m.mensagem}"</p>
                <p className="text-[8px] opacity-30 uppercase text-right">{new Date(m.data_resposta).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Atividade Recente & Ações */}
        <section className="space-y-10">
          <div className="space-y-4">
             <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 flex items-center gap-3"><TrendingUp className="h-4 w-4" /> Ações Rápidas</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/admin/add" className="p-6 bg-stone-900 text-white flex items-center justify-between shadow-lg hover:bg-stone-800 transition-all border-l-4 border-primary"><span className="text-[10px] font-bold tracking-widest uppercase">Cadastrar</span><UserPlus className="h-5 w-5" /></Link>
                <Link href="/admin/gifts" className="p-6 bg-white border border-primary/10 flex items-center justify-between shadow-sm hover:bg-stone-50 transition-all"><span className="text-[10px] font-bold tracking-widest uppercase text-stone-700">Presentes</span><PackageCheck className="h-5 w-5 text-primary" /></Link>
             </div>
          </div>
          <div className="space-y-6">
             <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 flex items-center gap-3"><PackageCheck className="h-4 w-4" /> Presentes / Fraldas</h3>
             <Card className="bg-white border border-primary/5 p-8 shadow-xl">
                <div className="space-y-4">
                   <p className="text-[10px] opacity-40 uppercase tracking-widest leading-relaxed">Acompanhe a distribuição de fraldas e presentes reservados na lista de convidados.</p>
                   <Link href="/admin/guests" className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 hover:gap-4 transition-all">Ver Detalhes <ChevronRight className="h-3 w-3" /></Link>
                </div>
             </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
