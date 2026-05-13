"use client";

import { useState, useEffect } from "react";
import { getGuests } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminDashboard() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const confirmedGroups = guests.filter(g => g.status_confirmacao === "CONFIRMED");
  
  const totalPeople = guests.reduce((acc, g) => {
    if (g.status_confirmacao === "CONFIRMED") {
      if (g.tipo === "FAMILIA" && g.membros_confirmados) {
        return acc + g.membros_confirmados.split(",").filter((n: string) => n.trim().length > 0).length;
      }
      return acc + 1;
    }
    return acc;
  }, 0);

  const stats = {
    total: guests.length,
    confirmedGroups: confirmedGroups.length,
    totalPeople: totalPeople,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-center sm:text-left">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-primary tracking-[0.2em]">DASHBOARD</h1>
          <p className="text-[10px] opacity-50 tracking-[0.3em] font-light">RESUMO GERAL DO EVENTO</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={fetchData} className="w-12 h-10 border-primary/20 rounded-none bg-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR</TooltipContent>
        </Tooltip>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="rounded-none border-none shadow-sm bg-white p-6 sm:p-8 space-y-2">
          <p className="text-[10px] opacity-40 font-bold tracking-[0.2em] uppercase">TOTAL DE CONVITES</p>
          <p className="text-3xl sm:text-4xl font-serif text-primary">{stats.total}</p>
        </Card>
        <Card className="rounded-none border-none shadow-sm bg-white p-6 sm:p-8 space-y-2">
          <p className="text-[10px] text-green-600/60 font-bold tracking-[0.2em] uppercase">GRUPOS CONFIRMADOS</p>
          <p className="text-3xl sm:text-4xl font-serif text-primary">{stats.confirmedGroups}</p>
        </Card>
        <Card className="rounded-none border-none shadow-sm bg-white p-6 sm:p-8 space-y-2 sm:col-span-2 md:col-span-1">
          <p className="text-[10px] text-blue-600/60 font-bold tracking-[0.2em] uppercase">PESSOAS CONFIRMADAS</p>
          <p className="text-3xl sm:text-4xl font-serif text-primary">{stats.totalPeople}</p>
        </Card>
      </div>

      <div className="space-y-4 bg-white p-6 sm:p-8 border border-primary/5 shadow-sm">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">PROGRESSO DE CONFIRMAÇÕES</p>
          <p className="text-[10px] font-bold tracking-[0.2em] opacity-40">{Math.round((stats.confirmedGroups / (stats.total || 1)) * 100)}%</p>
        </div>
        <div className="h-3 w-full bg-primary/5 rounded-none overflow-hidden border border-primary/5">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out" 
            style={{ width: `${(stats.confirmedGroups / (stats.total || 1)) * 100}%` }}
          />
        </div>
        <p className="text-[9px] opacity-40 tracking-widest uppercase text-center mt-4 italic">
          PORCENTAGEM DE GRUPOS QUE JÁ RESPONDERAM AO CONVITE.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="rounded-none border-none shadow-sm bg-stone-900 p-6 sm:p-8 text-white space-y-6">
            <h3 className="text-lg font-serif tracking-widest uppercase">AÇÕES RÁPIDAS</h3>
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => window.location.href = "/admin/add"}
                className="p-4 border border-white/10 hover:bg-white/5 text-[9px] tracking-widest uppercase transition-all"
               >
                  CADASTRAR NOVO
               </button>
               <button 
                onClick={() => window.location.href = "/admin/guests"}
                className="p-4 border border-white/10 hover:bg-white/5 text-[9px] tracking-widest uppercase transition-all"
               >
                  VER TODOS
               </button>
            </div>
         </Card>

         <Card className="rounded-none border-none shadow-sm bg-primary p-6 sm:p-8 text-white flex flex-col justify-center space-y-2">
            <p className="text-[10px] opacity-70 tracking-widest uppercase">MÉDIA DE PESSOAS POR GRUPO</p>
            <p className="text-3xl sm:text-4xl font-serif">
               {stats.confirmedGroups > 0 ? (stats.totalPeople / stats.confirmedGroups).toFixed(1) : "0.0"}
            </p>
         </Card>
      </div>
    </div>
  );
}
