"use client";

import { useState, useEffect } from "react";
import { getGuests } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, Copy, UserCheck, ClipboardList, Printer, Download, CheckCircle2, Baby, UserCircle, Gift, Package
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FinalListPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchGuests = async () => {
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  };

  const confirmedGuests = guests.filter(g => g.status_confirmacao === "CONFIRMED");

  const getConfirmedPeopleList = () => {
    const list: string[] = [];
    confirmedGuests.forEach(g => {
      if (g.tipo === "FAMILIA" && g.membros_confirmados) {
        g.membros_confirmados.split(",").map((n: string) => n.trim()).forEach((n: string) => {
          if (n) list.push(`${n} (FAMÍLIA ${g.nome})`);
        });
      } else {
        list.push(g.nome);
      }
    });
    return list.sort();
  };

  const copyFullGuestList = () => {
    const list = getConfirmedPeopleList();
    if (list.length === 0) return toast.error("SEM CONFIRMAÇÕES.");
    navigator.clipboard.writeText(list.join("\n"));
    toast.success("LISTA COPIADA!");
  };

  const confirmedPeopleList = getConfirmedPeopleList();
  const totalAdults = confirmedGuests.reduce((acc, g) => acc + (g.qtd_adultos || 0), 0);
  const totalChildren = confirmedGuests.reduce((acc, g) => acc + (g.qtd_criancas || 0), 0);

  const giftsReserved = confirmedGuests.filter(g => g.gift?.name).map(g => ({ guest: g.nome, gift: g.gift.name }));
  const diapersList = confirmedGuests.filter(g => g.fralda_tamanho).map(g => ({ guest: g.nome, size: g.fralda_tamanho }));

  return (
    <div className="max-w-7xl space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Checklist Final</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Relatório para o dia do evento</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={copyFullGuestList} variant="outline" className="rounded-none h-12 px-6 tracking-widest text-[10px] uppercase"><Copy className="mr-2 h-4 w-4" /> COPIAR NOMES</Button>
          <Button onClick={() => window.print()} className="rounded-none h-12 px-6 tracking-widest text-[10px] uppercase shadow-lg"><Printer className="mr-2 h-4 w-4" /> IMPRIMIR</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Nomes Confirmed */}
        <div className="lg:col-span-7">
           <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">
              <div className="bg-stone-900 p-8 text-white border-b-4 border-primary">
                 <h2 className="text-sm font-serif tracking-[0.2em] uppercase">NOMES PARA RECEPÇÃO</h2>
                 <p className="text-[9px] opacity-40 tracking-[0.4em] uppercase font-light mt-1">Total: {confirmedPeopleList.length} pessoas</p>
              </div>
              <CardContent className="p-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-primary/5">
                    {confirmedPeopleList.map((name, i) => (
                      <div key={i} className="p-4 flex gap-3 items-center group hover:bg-stone-50 transition-colors">
                        <span className="text-[9px] opacity-20 font-bold w-6">{i + 1}.</span>
                        <span className="text-[11px] tracking-widest uppercase text-stone-700 font-medium group-hover:text-primary">{name}</span>
                      </div>
                    ))}
                 </div>
                 {confirmedPeopleList.length === 0 && <div className="p-20 text-center opacity-20 uppercase text-[10px] tracking-widest">Nenhuma confirmação</div>}
              </CardContent>
           </Card>
        </div>

        {/* Resumo & Presentes */}
        <div className="lg:col-span-5 space-y-8">
           <Card className="border-none shadow-xl bg-stone-50 rounded-none p-8 space-y-6 border border-primary/5">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary border-b border-primary/10 pb-4">Contagem Buffet</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-6 shadow-sm text-center space-y-1"><p className="text-[9px] opacity-40 uppercase">Adultos</p><p className="text-3xl font-serif text-primary">{totalAdults}</p></div>
                 <div className="bg-white p-6 shadow-sm text-center space-y-1"><p className="text-[9px] opacity-40 uppercase">Crianças</p><p className="text-3xl font-serif text-primary">{totalChildren}</p></div>
                 <div className="col-span-2 bg-stone-900 text-white p-4 text-center"><p className="text-[11px] tracking-[0.4em] uppercase">Total Geral: {totalAdults + totalChildren}</p></div>
              </div>
           </Card>

           <Card className="border-none shadow-xl bg-white rounded-none p-8 space-y-6">
              <div className="flex items-center gap-2"><Gift className="h-4 w-4 text-primary opacity-40" /><h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Presentes Reservados</h3></div>
              <div className="space-y-2">
                 {giftsReserved.map((r, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] tracking-widest p-3 bg-stone-50 border border-primary/5 uppercase">
                       <span className="font-bold opacity-70">{r.guest}</span>
                       <span className="text-primary font-bold">{r.gift}</span>
                    </div>
                 ))}
                 {giftsReserved.length === 0 && <p className="text-[9px] opacity-20 py-4 text-center">Nenhum presente na lista ainda</p>}
              </div>
           </Card>

           <Card className="border-none shadow-xl bg-white rounded-none p-8 space-y-6">
              <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary opacity-40" /><h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Fraldas Confirmadas</h3></div>
              <div className="space-y-2">
                 {diapersList.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] tracking-widest p-3 bg-stone-50 border border-primary/5 uppercase">
                       <span className="font-bold opacity-70">{d.guest}</span>
                       <span className="bg-primary text-white px-2 py-0.5 font-bold">{d.size}</span>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
