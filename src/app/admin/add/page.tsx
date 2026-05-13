"use client";

import { useState } from "react";
import { addMultipleGuests } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  UserPlus, 
  Loader2, 
  ClipboardList, 
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AddGuestsPage() {
  const [newGuestsText, setNewGuestsText] = useState("");
  const [registering, setRegistering] = useState(false);

  const handleAddGuests = async () => {
    if (!newGuestsText.trim()) return;
    setRegistering(true);
    const result = await addMultipleGuests(newGuestsText);
    if (result.success) {
      toast.success(`${result.count} CONVIDADOS CADASTRADOS!`);
      setNewGuestsText("");
    } else {
      toast.error(result.error);
    }
    setRegistering(false);
  };

  return (
    <div className="max-w-6xl space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif text-primary tracking-[0.2em]">CADASTRAR</h1>
        <p className="text-[10px] opacity-50 tracking-[0.4em] font-light uppercase">ADICIONE MÚLTIPLOS CONVITES DE UMA VEZ</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
           <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">
              <div className="bg-stone-900 p-10 text-white flex justify-between items-center border-b-4 border-primary">
                 <div className="space-y-1">
                    <h2 className="text-xl font-serif tracking-[0.2em] uppercase">LISTA DE CADASTRO</h2>
                    <p className="text-[9px] opacity-50 tracking-[0.4em] uppercase font-light">INSIRA OS DADOS ABAIXO</p>
                 </div>
                 <Tooltip>
                   <TooltipTrigger asChild>
                      <button 
                        onClick={handleAddGuests} 
                        disabled={registering || !newGuestsText.trim()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-16 w-16 flex items-center justify-center rounded-none shadow-2xl transition-all disabled:opacity-50"
                      >
                        {registering ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                      </button>
                   </TooltipTrigger>
                   <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR TODOS</TooltipContent>
                 </Tooltip>
              </div>
              <CardContent className="p-0">
                <Textarea 
                  placeholder="EXEMPLO:&#10;DANIEL LOPES | INDIVIDUAL | | RN&#10;FAMILIA SILVA | FAMILIA | JOÃO, MARIA | P" 
                  className="min-h-[450px] bg-stone-50/50 border-none rounded-none focus-visible:ring-0 text-[12px] tracking-widest p-10 leading-relaxed resize-none placeholder:opacity-20"
                  value={newGuestsText}
                  onChange={(e) => setNewGuestsText(e.target.value)}
                />
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="space-y-6 bg-white p-10 border border-primary/5 shadow-lg">
              <h3 className="text-xs font-serif tracking-[0.3em] text-primary flex items-center gap-3 uppercase">
                <ClipboardList className="h-4 w-4" />
                COMO CADASTRAR
              </h3>
              <Separator className="bg-primary/10" />
              
              <div className="space-y-8">
                 <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-none bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold tracking-widest uppercase">INDIVIDUAL</p>
                       <code className="text-[9px] block bg-stone-50 p-3 border border-primary/5 tracking-widest text-primary/70">NOME | INDIVIDUAL</code>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-none bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold tracking-widest uppercase">FAMÍLIA</p>
                       <code className="text-[9px] block bg-stone-50 p-3 border border-primary/5 tracking-widest text-primary/70 leading-relaxed">
                          NOME | FAMILIA | MEMBRO 1, MEMBRO 2, MEMBRO 3
                       </code>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-none bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold tracking-widest uppercase">COM FRALDA DEFINIDA</p>
                       <code className="text-[9px] block bg-stone-50 p-3 border border-primary/5 tracking-widest text-primary/70 leading-relaxed">
                          NOME | INDIVIDUAL | | P <br/>
                          NOME | FAMILIA | MEMBROS | M
                       </code>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-primary/5 p-8 border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="h-4 w-4 text-primary opacity-40" />
                  <p className="text-[10px] font-bold tracking-widest uppercase">DICA</p>
               </div>
               <p className="text-[9px] tracking-widest leading-relaxed opacity-60 uppercase">
                  VOCÊ PODE DEIXAR O CAMPO DE FRALDA VAZIO PARA QUE O SISTEMA DISTRIBUA AUTOMATICAMENTE DEPOIS.
               </p>
           </div>
        </div>
      </div>
    </div>
  );
}
