"use client";

import { useState, useEffect } from "react";
import { getGuests } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, UserCheck, ClipboardList } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { 
  Users, 
  Copy, 
  UserCheck, 
  ClipboardList, 
  Printer, 
  Download,
  CheckCircle2,
  Baby,
  UserCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FinalListPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchGuests = async () => {
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const getConfirmedPeopleList = () => {
    const list: string[] = [];
    guests.forEach(g => {
      if (g.status_confirmacao === "CONFIRMED") {
        if (g.tipo === "FAMILIA" && g.membros_confirmados) {
          g.membros_confirmados.split(",").map((n: string) => n.trim()).forEach((n: string) => {
            if (n) list.push(`${n} (FAMÍLIA ${g.nome})`);
          });
        } else {
          list.push(g.nome);
        }
      }
    });
    return list.sort();
  };

  const copyFullGuestList = () => {
    const confirmedPeople = getConfirmedPeopleList();
    if (confirmedPeople.length === 0) {
      toast.error("NENHUM CONVIDADO CONFIRMADO AINDA.");
      return;
    }
    const text = confirmedPeople.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("LISTA DE NOMES COPIADA!");
  };

  const confirmedPeopleList = getConfirmedPeopleList();
  
  const totalAdults = guests.reduce((acc, g) => {
    if (g.status_confirmacao === "CONFIRMED") return acc + (g.qtd_adultos || 0);
    return acc;
  }, 0);

  const totalChildren = guests.reduce((acc, g) => {
    if (g.status_confirmacao === "CONFIRMED") return acc + (g.qtd_criancas || 0);
    return acc;
  }, 0);

  return (
    <div className="max-w-6xl space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em]">LISTA FINAL</h1>
          <p className="text-[10px] opacity-50 tracking-[0.4em] font-light uppercase">NOMES INDIVIDUAIS PARA RECEPÇÃO E BUFFET</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
            onClick={copyFullGuestList}
            className="rounded-none bg-stone-900 hover:bg-stone-800 text-white h-12 px-8 text-[10px] tracking-[0.2em] shadow-xl transition-all"
           >
              <Copy className="h-4 w-4 mr-3" /> COPIAR LISTA
           </Button>
           <Button 
            variant="outline"
            className="rounded-none border-primary/20 bg-white h-12 w-12 p-0 shadow-sm"
            onClick={() => window.print()}
           >
              <Printer className="h-4 w-4 text-primary" />
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Guest List */}
        <div className="lg:col-span-3">
           <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">
              <div className="bg-primary p-10 text-primary-foreground border-b-4 border-stone-900/10">
                 <div className="flex items-center gap-4 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <h2 className="text-xl font-serif tracking-[0.2em] uppercase">NOMES CONFIRMADOS</h2>
                 </div>
                 <p className="text-[9px] opacity-60 tracking-[0.4em] uppercase font-light ml-9">ORDEM ALFABÉTICA</p>
              </div>
              <CardContent className="p-0">
                 {confirmedPeopleList.length > 0 ? (
                    <div className="divide-y divide-primary/5">
                       {confirmedPeopleList.map((name, i) => (
                          <div key={i} className="flex items-center gap-8 p-8 hover:bg-stone-50/50 transition-colors group">
                             <span className="text-[10px] opacity-20 font-serif w-8 font-bold italic">{i + 1}.</span>
                             <span className="text-[11px] sm:text-[12px] tracking-[0.1em] font-medium text-stone-700 group-hover:text-primary transition-colors uppercase">{name}</span>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-32 space-y-6">
                       <ClipboardList className="h-16 w-16 mx-auto opacity-5" />
                       <p className="text-[10px] opacity-30 tracking-[0.5em] uppercase">AGUARDANDO CONFIRMAÇÕES</p>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Totals Summary */}
        <div className="lg:col-span-2 space-y-8 sticky top-24">
           <Card className="border-none shadow-xl bg-stone-900 text-white rounded-none p-10 space-y-10">
              <div className="space-y-2">
                 <h3 className="text-xs font-serif tracking-[0.3em] text-primary-foreground/50 uppercase">Resumo de presença</h3>
                 <Separator className="bg-white/10" />
              </div>

              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                          <UserCircle className="h-5 w-5 text-primary-foreground/40" />
                       </div>
                       <span className="text-[10px] tracking-widest uppercase opacity-60">Adultos</span>
                    </div>
                    <span className="text-3xl font-serif text-primary">{totalAdults}</span>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                          <Baby className="h-5 w-5 text-primary-foreground/40" />
                       </div>
                       <span className="text-[10px] tracking-widest uppercase opacity-60">Crianças</span>
                    </div>
                    <span className="text-3xl font-serif text-primary">{totalChildren}</span>
                 </div>

                 <Separator className="bg-white/10" />

                 <div className="flex flex-col items-center py-6 bg-white/5 space-y-2">
                    <p className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold">Total Geral</p>
                    <p className="text-6xl font-serif text-white">{totalAdults + totalChildren}</p>
                 </div>
              </div>
           </Card>

           <div className="p-10 bg-white border border-primary/5 shadow-lg space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">INSTRUÇÕES PARA BUFFET</h4>
              <p className="text-[9px] opacity-50 leading-relaxed uppercase tracking-widest italic">
                ESTA LISTA CONSIDERA TODOS OS NOMES INDIVIDUAIS CADASTRADOS E CONFIRMADOS, INCLUINDO CADA INTEGRANTE DE GRUPOS FAMILIARES.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
