"use client";

import { useState, useEffect } from "react";
import { getGuests } from "@/app/actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Loader2,
  RefreshCw,
  Users, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  TrendingUp, 
  Baby, 
  UserCheck,
  ClipboardList,
  ChevronRight,
  PackageCheck,
  Flame
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const total = guests.length;
  const confirmed = guests.filter(g => g.status_confirmacao === "CONFIRMED").length;
  const pending = guests.filter(g => !g.status_confirmacao || g.status_confirmacao === "PENDING").length;
  
  const adults = guests.reduce((acc, g) => g.status_confirmacao === "CONFIRMED" ? acc + (g.qtd_adultos || 0) : acc, 0);
  const children = guests.reduce((acc, g) => g.status_confirmacao === "CONFIRMED" ? acc + (g.qtd_criancas || 0) : acc, 0);

  const stats = [
    { label: "CONVITES", value: total, icon: Users, color: "text-stone-400" },
    { label: "CONFIRMADOS", value: confirmed, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "PENDENTES", value: pending, icon: Clock, color: "text-amber-500" },
    { label: "ADULTOS", value: adults, icon: UserCheck, color: "text-primary" },
    { label: "CRIANÇAS", value: children, icon: Baby, color: "text-sky-400" },
  ];

  const diaperSizes = ["RN", "P", "M", "G", "GG"];
  const diaperStats = diaperSizes.map(size => {
    const requestedBy = guests.filter(g => g.fralda_tamanho === size);
    return {
      size,
      total: requestedBy.length,
      confirmed: requestedBy.filter(g => g.status_confirmacao === "CONFIRMED").length,
      names: requestedBy.map(g => g.nome)
    };
  }).filter(stat => stat.total > 0);

  const kitChurrascoGuests = guests.filter(g => g.kit_churrasco);
  const kitChurrascoConfirmed = kitChurrascoGuests.filter(g => g.status_confirmacao === "CONFIRMED").length;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Status</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Visão Geral do Evento</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} className="hover:bg-primary/5 rounded-none h-12 w-12 transition-all">
              <RefreshCw className={`h-5 w-5 text-primary opacity-30 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-[10px] tracking-widest uppercase">Atualizar</TooltipContent>
        </Tooltip>
      </header>

      {/* Grid de Ícones e Números */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-2xl rounded-none bg-white group hover:translate-y-[-4px] transition-all duration-500 overflow-hidden">
            <div className="h-1 w-full bg-stone-50 group-hover:bg-primary transition-colors" />
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-stone-50 rounded-none group-hover:bg-stone-100 transition-colors">
                <s.icon className={`h-6 w-6 ${s.color} opacity-80`} />
              </div>
              <div className="space-y-1">
                <p className="text-[32px] font-serif text-primary leading-none">{s.value}</p>
                <p className="text-[9px] font-bold tracking-[0.2em] opacity-30 uppercase">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pt-8">
         {/* Ações Visuais */}
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 flex items-center gap-4">
               <TrendingUp className="h-4 w-4" />
               Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <Link href="/admin/add" className="group">
                  <div className="p-10 bg-stone-900 text-white flex items-center justify-between group-hover:bg-stone-800 transition-all border-l-4 border-primary shadow-xl">
                     <div className="space-y-2">
                        <p className="text-[12px] tracking-[0.3em] uppercase font-bold">Cadastrar</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-widest">Adicionar convidados em massa</p>
                     </div>
                     <div className="w-12 h-12 bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all">
                        <UserPlus className="h-5 w-5" />
                     </div>
                  </div>
               </Link>

               <Link href="/admin/final-list" className="group">
                  <div className="p-10 bg-white border border-primary/10 flex items-center justify-between group-hover:bg-stone-50 transition-all shadow-lg">
                     <div className="space-y-2">
                        <p className="text-[12px] tracking-[0.3em] uppercase font-bold text-primary">Lista Final</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-widest">Resumo para buffet e recepção</p>
                     </div>
                     <div className="w-12 h-12 bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-primary">
                        <ClipboardList className="h-5 w-5" />
                     </div>
                  </div>
               </Link>
            </div>
         </div>

         {/* Atividade Recente (Visual) */}
         <div className="lg:col-span-3 space-y-8">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 flex items-center gap-4">
               <Clock className="h-4 w-4" />
               Atividade
            </h3>
            <Card className="border-none shadow-2xl bg-white rounded-none p-10 h-full">
               <div className="space-y-8">
                  {guests.filter(g => g.status_confirmacao && g.status_confirmacao !== "PENDING").slice(0, 5).map((g, i) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className={`w-3 h-3 rounded-none ${g.status_confirmacao === 'CONFIRMED' ? 'bg-emerald-400' : 'bg-red-400'} shadow-sm`} />
                           <div>
                              <p className="text-[11px] tracking-widest uppercase font-bold text-stone-700">{g.nome}</p>
                              <p className="text-[8px] opacity-30 uppercase tracking-[0.2em]">{g.tipo}</p>
                           </div>
                        </div>
                        <Link href="/admin/guests" className="opacity-0 group-hover:opacity-100 transition-all">
                           <ChevronRight className="h-4 w-4 text-primary" />
                        </Link>
                     </div>
                  ))}
                  {guests.filter(g => g.status_confirmacao && g.status_confirmacao !== "PENDING").length === 0 && (
                     <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-stone-50 flex items-center justify-center mx-auto opacity-20">
                           <Clock className="h-8 w-8" />
                        </div>
                        <p className="text-[9px] opacity-30 tracking-[0.4em] uppercase">Nenhuma atividade recente</p>
                     </div>
                  )}
                  
                  <Separator className="bg-primary/5" />
                  
                  <Link 
                    href="/admin/guests" 
                    className={cn(
                      buttonVariants({ variant: "ghost" }), 
                      "w-full text-[9px] tracking-[0.4em] text-primary hover:bg-primary/5 uppercase font-bold py-10 rounded-none border-t border-primary/5"
                    )}
                  >
                    Ver Todos os Convites
                  </Link>
               </div>
            </Card>
         </div>
      </div>

      {/* Terminal de Presentes (Fraldas e Kit Churrasco) */}
      <div className="space-y-8 pt-8">
         <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 flex items-center gap-4">
            <PackageCheck className="h-4 w-4" />
            Terminal de Presentes Solicitados
         </h3>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Fraldas */}
            <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">
               <div className="bg-stone-900 p-8 border-b-4 border-primary text-white flex justify-between items-center">
                  <div className="space-y-1">
                     <h2 className="text-sm font-serif tracking-[0.2em] uppercase">Distribuição de Fraldas</h2>
                     <p className="text-[8px] opacity-50 tracking-[0.4em] uppercase font-light">Status por Tamanho</p>
                  </div>
                  <PackageCheck className="h-6 w-6 opacity-30" />
               </div>
               <CardContent className="p-0">
                 {diaperStats.length === 0 ? (
                   <div className="p-12 text-center text-[9px] opacity-30 uppercase tracking-[0.2em]">Nenhuma fralda solicitada</div>
                 ) : (
                   <div className="divide-y divide-primary/5">
                     {diaperStats.map((stat, idx) => (
                       <div key={idx} className="p-8 hover:bg-stone-50 transition-colors">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary font-serif text-xl border border-primary/10">
                                 {stat.size}
                               </div>
                               <div>
                                  <p className="text-[12px] font-bold text-stone-700 tracking-widest">{stat.total} SOLICITADAS</p>
                                  <p className="text-[9px] opacity-40 tracking-widest uppercase">{stat.confirmed} CONFIRMADAS</p>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-2">
                           <p className="text-[8px] opacity-30 tracking-[0.2em] uppercase font-bold">Solicitado para:</p>
                           <div className="flex flex-wrap gap-2">
                             {stat.names.map((name, nIdx) => (
                               <span key={nIdx} className="text-[9px] bg-white border border-primary/10 px-3 py-1.5 uppercase tracking-widest text-primary/70 shadow-sm">
                                 {name}
                               </span>
                             ))}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
            </Card>

            {/* Kit Churrasco */}
            <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">
               <div className="bg-stone-900 p-8 border-b-4 border-red-500 text-white flex justify-between items-center">
                  <div className="space-y-1">
                     <h2 className="text-sm font-serif tracking-[0.2em] uppercase">Kits Churrasco</h2>
                     <p className="text-[8px] opacity-50 tracking-[0.4em] uppercase font-light">Convidados com a solicitação</p>
                  </div>
                  <Flame className="h-6 w-6 opacity-30 text-red-500" />
               </div>
               <CardContent className="p-0">
                 {kitChurrascoGuests.length === 0 ? (
                   <div className="p-12 text-center text-[9px] opacity-30 uppercase tracking-[0.2em]">Nenhum kit churrasco solicitado</div>
                 ) : (
                   <div className="p-8">
                     <div className="flex items-center gap-6 mb-8 p-6 bg-red-50/50 border border-red-100">
                        <div className="w-16 h-16 bg-red-100 flex items-center justify-center text-red-600 font-serif text-2xl">
                          {kitChurrascoGuests.length}
                        </div>
                        <div>
                           <p className="text-[12px] font-bold text-stone-700 tracking-widest">KITS SOLICITADOS NO TOTAL</p>
                           <p className="text-[9px] opacity-60 text-red-500 tracking-widest uppercase">{kitChurrascoConfirmed} CONFIRMADOS ATÉ AGORA</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                       <p className="text-[9px] opacity-40 tracking-[0.3em] uppercase font-bold pb-2 border-b border-primary/5">Convidados:</p>
                       <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                         {kitChurrascoGuests.map((g, idx) => (
                           <li key={idx} className="flex justify-between items-center text-[10px] tracking-widest uppercase p-3 bg-stone-50 border border-primary/5 hover:border-primary/20 transition-colors">
                             <span className="font-bold text-stone-700">{g.nome}</span>
                             <span className={`px-2 py-1 ${g.status_confirmacao === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {g.status_confirmacao === 'CONFIRMED' ? 'CONFIRMADO' : 'PENDENTE'}
                             </span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 )}
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
