"use client";

import { useState, useEffect } from "react";
import { getGuests } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { 
  Users, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  RefreshCw, 
  TrendingUp, 
  Baby, 
  UserCheck,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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

  // Stats calculation
  const totalInvites = guests.length;
  const confirmedGroups = guests.filter(g => g.status_confirmacao === "CONFIRMED");
  const declinedGroups = guests.filter(g => g.status_confirmacao === "DECLINED");
  const pendingGroups = guests.filter(g => !g.status_confirmacao);

  const totalAdults = guests.reduce((acc, g) => {
    if (g.status_confirmacao === "CONFIRMED") {
      return acc + (g.qtd_adultos || 0);
    }
    return acc;
  }, 0);

  const totalChildren = guests.reduce((acc, g) => {
    if (g.status_confirmacao === "CONFIRMED") {
      return acc + (g.qtd_criancas || 0);
    }
    return acc;
  }, 0);

  if (loading && guests.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em]">DASHBOARD</h1>
          <p className="text-[10px] opacity-50 tracking-[0.4em] font-light uppercase">VISÃO GERAL DO SEU EVENTO</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] opacity-40 tracking-widest uppercase">Última atualização</p>
              <p className="text-[10px] font-mono opacity-60">{new Date().toLocaleTimeString()}</p>
           </div>
           <Tooltip>
             <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={fetchData} 
                  disabled={loading}
                  className="w-12 h-12 border-primary/20 rounded-none bg-white shadow-sm hover:bg-stone-50 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
                </Button>
             </TooltipTrigger>
             <TooltipContent className="text-[10px] tracking-widest uppercase">ATUALIZAR DADOS</TooltipContent>
           </Tooltip>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="TOTAL CONVITES" 
          value={totalInvites} 
          icon={Users} 
          subtitle="Registrados"
          color="stone"
        />
        <StatCard 
          title="CONFIRMADOS" 
          value={confirmedGroups.length} 
          icon={CheckCircle2} 
          subtitle="Grupos presentes"
          color="emerald"
        />
        <StatCard 
          title="NÃO VIRÃO" 
          value={declinedGroups.length} 
          icon={Clock} 
          subtitle="Recusados"
          color="red"
        />
        <StatCard 
          title="PENDENTES" 
          value={pendingGroups.length} 
          icon={Clock} 
          subtitle="Sem resposta"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Summary */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-none overflow-hidden">
           <CardHeader className="p-8 border-b border-primary/5 bg-stone-50/50">
              <CardTitle className="text-sm font-serif tracking-[0.3em] flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                RESUMO DE PESSOAS CONFIRMADAS
              </CardTitle>
           </CardHeader>
           <CardContent className="p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 flex items-center justify-center">
                             <UserCheck className="h-6 w-6 text-primary/60" />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold opacity-30 tracking-widest uppercase">ADULTOS</p>
                             <p className="text-4xl font-serif text-primary">{totalAdults}</p>
                          </div>
                       </div>
                    </div>
                    <Separator className="bg-primary/5" />
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 flex items-center justify-center">
                             <Baby className="h-6 w-6 text-primary/60" />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold opacity-30 tracking-widest uppercase">CRIANÇAS</p>
                             <p className="text-4xl font-serif text-primary">{totalChildren}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col justify-center space-y-4 bg-stone-50 p-8 border border-primary/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                       <Users className="w-32 h-32 -rotate-12" />
                    </div>
                    <p className="text-[10px] font-bold opacity-30 tracking-widest uppercase text-center relative z-10">TOTAL DE PESSOAS</p>
                    <p className="text-7xl font-serif text-primary text-center tracking-tighter relative z-10">
                       {totalAdults + totalChildren}
                    </p>
                    <p className="text-[9px] opacity-40 text-center tracking-widest uppercase mt-2 relative z-10">PRESENÇA GARANTIDA</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none shadow-xl bg-stone-900 text-white rounded-none overflow-hidden flex flex-col justify-between">
           <CardHeader className="p-8 pb-0">
              <CardTitle className="text-sm font-serif tracking-[0.3em] opacity-80 uppercase">Ações do Sistema</CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-4">
              <QuickActionLink 
                title="GERENCIAR CONVITES" 
                href="/admin/guests" 
                icon={Users} 
              />
              <QuickActionLink 
                title="CADASTRAR EM MASSA" 
                href="/admin/add" 
                icon={UserPlus} 
              />
              <QuickActionLink 
                title="LISTA FINAL (BUFFET)" 
                href="/admin/final-list" 
                icon={ClipboardList} 
              />
           </CardContent>
           <div className="p-8 bg-white/5 border-t border-white/5">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                   <span className="opacity-40">Taxa de Resposta</span>
                   <span className="text-primary-foreground/80">{totalInvites > 0 ? Math.round(((confirmedGroups.length + declinedGroups.length) / totalInvites) * 100) : 0}%</span>
                </div>
                <div className="h-1 w-full bg-white/10 overflow-hidden">
                   <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${totalInvites > 0 ? ((confirmedGroups.length + declinedGroups.length) / totalInvites) * 100 : 0}%` }}
                   />
                </div>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtitle, color }: any) {
  const colors: any = {
    stone: "bg-stone-100 text-stone-600 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <Card className="border-none shadow-lg rounded-none overflow-hidden group hover:translate-y-[-4px] transition-all duration-500">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={`w-14 h-14 ${colors[color]} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-bold opacity-30 tracking-[0.2em] uppercase">{title}</p>
          <p className="text-3xl font-serif text-primary tracking-tight">{value}</p>
          <p className="text-[9px] opacity-40 font-light italic">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionLink({ title, href, icon: Icon }: any) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
    >
      <div className="flex items-center gap-4">
        <Icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-all" />
        <span className="text-[10px] tracking-[0.2em] font-medium uppercase">{title}</span>
      </div>
      <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1" />
    </Link>
  );
}
