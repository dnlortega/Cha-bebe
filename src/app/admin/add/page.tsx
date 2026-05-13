"use client";

import { useState } from "react";
import { addMultipleGuests } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif text-primary tracking-[0.2em]">CADASTRAR</h1>
        <p className="text-[10px] opacity-50 tracking-[0.3em] font-light">ADICIONE MÚLTIPLOS CONVITES DE UMA VEZ</p>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-none max-w-2xl overflow-hidden">
        <div className="bg-primary p-6 sm:p-12 text-primary-foreground flex flex-col sm:flex-row justify-between items-center gap-6">
           <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-serif tracking-widest uppercase">LISTA DE CADASTRO</h2>
              <p className="text-[9px] opacity-70 tracking-widest font-light">UM POR LINHA | NOME | TIPO | INTEGRANTES</p>
           </div>
           <Tooltip>
             <TooltipTrigger asChild>
                <button 
                  onClick={handleAddGuests} 
                  disabled={registering || !newGuestsText.trim()}
                  className="bg-white text-primary hover:bg-stone-100 h-14 w-14 flex items-center justify-center rounded-none shadow-xl transition-all disabled:opacity-50"
                >
                  {registering ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                </button>
             </TooltipTrigger>
             <TooltipContent className="text-[10px] tracking-widest uppercase">SALVAR LISTA</TooltipContent>
           </Tooltip>
        </div>
        <CardContent className="p-6 sm:p-12 space-y-8">
          <div className="space-y-4">
            <Textarea 
              placeholder="EXEMPLO:&#10;DANIEL LOPES | INDIVIDUAL&#10;FAMILIA SILVA | FAMILIA | JOÃO, MARIA, PEDRO" 
              className="min-h-[300px] sm:min-h-[350px] bg-stone-50 border-primary/10 rounded-none focus-visible:ring-primary/20 text-[11px] tracking-widest p-4 sm:p-6 leading-relaxed"
              value={newGuestsText}
              onChange={(e) => setNewGuestsText(e.target.value)}
            />
          </div>
          <div className="p-4 sm:p-6 bg-stone-50 border border-primary/5">
             <h4 className="text-[10px] font-bold tracking-widest mb-4">FORMATO ACEITO:</h4>
             <ul className="text-[9px] space-y-2 opacity-60 tracking-widest uppercase list-disc pl-4">
                <li>NOME | INDIVIDUAL</li>
                <li>NOME | FAMILIA | MEMBRO 1, MEMBRO 2, MEMBRO 3</li>
             </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
