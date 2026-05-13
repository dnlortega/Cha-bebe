"use client";

import { useState, useEffect } from "react";
import { getGuests } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, UserCheck, ClipboardList } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function FinalListPage() {
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchGuests = async () => {
    const data = await getGuests();
    setGuests(data);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif text-primary tracking-[0.2em]">LISTA FINAL</h1>
        <p className="text-[10px] opacity-50 tracking-[0.3em] font-light">NOMES INDIVIDUAIS CONFIRMADOS</p>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-none max-w-2xl overflow-hidden">
        <div className="bg-stone-900 p-6 sm:p-12 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
           <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-serif tracking-widest flex items-center justify-center sm:justify-start gap-3">
                 <UserCheck className="h-5 w-5 text-green-400" />
                 PRESENÇA
              </h2>
              <p className="text-[8px] sm:text-[9px] opacity-60 tracking-widest font-light uppercase">TOTAL DE {confirmedPeopleList.length} PESSOAS</p>
           </div>
           
           <Tooltip>
             <TooltipTrigger asChild>
                <button 
                  onClick={copyFullGuestList} 
                  className="border border-white/20 text-white hover:bg-white/10 rounded-none h-12 w-12 flex items-center justify-center transition-all"
                >
                   <Copy className="h-4 w-4" />
                </button>
             </TooltipTrigger>
             <TooltipContent className="text-[10px] tracking-widest uppercase">COPIAR NOMES</TooltipContent>
           </Tooltip>
        </div>
        <CardContent className="p-6 sm:p-12">
           {confirmedPeopleList.length > 0 ? (
              <div className="space-y-1">
                 {confirmedPeopleList.map((name, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-primary/5 last:border-0 group">
                       <span className="text-[10px] opacity-20 font-serif w-6">{i + 1}.</span>
                       <span className="text-[10px] sm:text-[11px] tracking-[0.1em] font-medium group-hover:text-primary transition-colors">{name}</span>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="text-center py-20 space-y-4">
                 <ClipboardList className="h-12 w-12 mx-auto opacity-10" />
                 <p className="text-[10px] opacity-30 tracking-[0.3em]">AINDA NÃO HÁ CONFIRMAÇÕES</p>
              </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
