"use client";

import { useState } from "react";
import { updateRSVP } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Separator } from "@/components/ui/separator";

import { Check, X, Users as UsersIcon, User as UserIcon, Heart, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RSVPFormProps {
  guest: {
    nome: string;
    slug: string;
    status_confirmacao: string | null;
    tipo: string;
    membros: string | null;
    membros_confirmados: string | null;
    fralda_tamanho?: string | null;
    kit_churrasco?: boolean;
  };
}

export default function RSVPForm({ guest }: RSVPFormProps) {
  const [status, setStatus] = useState<string>(guest.status_confirmacao || "CONFIRMED");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    guest.membros_confirmados ? guest.membros_confirmados.split(",").map(s => s.trim()) : []
  );
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(!!guest.status_confirmacao);

  const familyMembers = guest.membros ? guest.membros.split(",").map(s => s.trim()) : [];

  const handleToggleMember = (member: string, isPresent: boolean) => {
    setSelectedMembers(prev => 
      isPresent 
        ? (prev.includes(member) ? prev : [...prev, member]) 
        : prev.filter(m => m !== member)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const confirmadosString = guest.tipo === "FAMILIA" ? selectedMembers.join(", ") : "";
    const finalStatus = (guest.tipo === "FAMILIA" && selectedMembers.length === 0 && status === "CONFIRMED") ? "DECLINED" : status;

    const result = await updateRSVP(guest.slug, finalStatus, confirmadosString);

    if (result.success) {
      if (finalStatus === "CONFIRMED") {
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [primaryColor, "#FFFFFF", "#FACC15"],
        });
      }
      toast.success("RESPOSTA ENVIADA COM SUCESSO!");
      setSubmitted(true);
    } else {
      toast.error(result.error);
    }
    setIsPending(false);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center space-y-6 pt-12">
          <div className="w-16 h-16 bg-primary/5 rounded-full mx-auto flex items-center justify-center mb-2">
            <Heart className="h-8 w-8 text-primary/40 fill-primary/10" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-serif tracking-[0.2em] text-primary uppercase">OBRIGADO</CardTitle>
            <p className="text-[10px] opacity-40 tracking-[0.3em] uppercase">RESPOSTA REGISTRADA</p>
          </div>
          <Separator className="w-12 mx-auto bg-primary/20" />
          <CardDescription className="text-xs sm:text-sm tracking-widest leading-relaxed uppercase pt-4 px-4">
            {status === "CONFIRMED" 
              ? `FICAMOS MUITO FELIZES EM SABER QUE VOCÊ VIRÁ! NOS VEMOS EM BREVE.` 
              : `SENTIREMOS SUA FALTA, MAS AGRADECEMOS POR NOS AVISAR.`}
          </CardDescription>

          {status === "CONFIRMED" && (guest.fralda_tamanho || guest.kit_churrasco) && (
            <div className="pt-10 animate-in fade-in zoom-in duration-1000 delay-300">
               <div className="relative group max-w-[280px] mx-auto">
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-primary/40" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-primary/40" />
                  
                  <div className="bg-primary text-primary-foreground p-8 space-y-4 shadow-2xl transition-transform duration-500">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center gap-2 opacity-50">
                           <PackageCheck className="h-3 w-3" />
                           <p className="text-[9px] font-bold tracking-[0.4em] uppercase">Lembrete do Presente</p>
                        </div>
                        <div className="text-center space-y-4">
                           {guest.fralda_tamanho && (
                             <div>
                               <p className="text-[10px] tracking-[0.3em] opacity-40 uppercase mb-1">Fralda</p>
                               <h2 className="text-4xl font-serif text-primary-foreground tracking-tighter leading-none">{guest.fralda_tamanho}</h2>
                             </div>
                           )}
                           {guest.kit_churrasco && (
                             <div className="pt-2 border-t border-primary-foreground/10">
                               <p className="text-[10px] tracking-[0.3em] opacity-40 uppercase mb-1">E também</p>
                               <h2 className="text-lg font-serif text-primary-foreground tracking-widest leading-none uppercase">KIT CHURRASCO</h2>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <Button 
            variant="outline" 
            onClick={() => setSubmitted(false)} 
            className="text-[9px] tracking-[0.3em] opacity-60 hover:opacity-100 uppercase border-primary/20 rounded-none h-10 px-8"
          >
            ALTERAR RESPOSTA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="space-y-6 text-center">
        <div className="w-14 h-14 bg-primary/5 rounded-full mx-auto flex items-center justify-center mb-2">
          {guest.tipo === "FAMILIA" ? <UsersIcon className="h-6 w-6 text-primary/40" /> : <UserIcon className="h-6 w-6 text-primary/40" />}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-serif tracking-[0.2em] text-primary uppercase">CONFIRMAÇÃO</CardTitle>
          <p className="text-[9px] opacity-40 tracking-[0.3em] uppercase">PRESENÇA NO EVENTO</p>
        </div>
        <Separator className="w-12 mx-auto bg-primary/20" />
        <CardDescription className="text-xs tracking-[0.2em] opacity-80 uppercase leading-relaxed pt-2">
          OLÁ, <span className="font-bold text-primary">{guest.nome}</span>! <br/>
          {guest.tipo === "FAMILIA" ? "CONVITE PARA TODA A FAMÍLIA" : "ESTE É UM CONVITE INDIVIDUAL"}
        </CardDescription>

        {(guest.fralda_tamanho || guest.kit_churrasco) && (
          <div className="pt-10 animate-in fade-in zoom-in duration-1000 delay-500">
             <div className="relative group">
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-primary/40" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-primary/40" />
                
                <div className="bg-primary text-primary-foreground p-10 space-y-6 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                   <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex items-center gap-3 opacity-50">
                         <div className="h-[1px] w-8 bg-primary-foreground/30" />
                         <PackageCheck className="h-4 w-4" />
                         <p className="text-[10px] font-bold tracking-[0.4em] uppercase">Presente</p>
                         <div className="h-[1px] w-8 bg-primary-foreground/30" />
                      </div>
                      
                      <div className="text-center space-y-6">
                         {guest.fralda_tamanho && (
                           <div className="space-y-1">
                              <p className="text-[11px] tracking-[0.3em] opacity-40 uppercase">Fralda Tamanho</p>
                              <h2 className="text-8xl font-serif text-primary-foreground tracking-tighter leading-none py-2">{guest.fralda_tamanho}</h2>
                           </div>
                         )}

                         {guest.kit_churrasco && (
                           <div className="space-y-2 pt-4 border-t border-primary-foreground/10">
                              <p className="text-[11px] tracking-[0.3em] opacity-40 uppercase">E traga um</p>
                              <h2 className="text-2xl font-serif text-primary-foreground tracking-[0.2em] leading-none py-2 uppercase">KIT CHURRASCO</h2>
                           </div>
                         )}
                      </div>
                      
                      <p className="text-[9px] tracking-[0.2em] opacity-30 uppercase font-light">Sua presença é o nosso maior presente</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-8 pb-12 px-6 sm:px-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-8">
            <RadioGroup value={status} onValueChange={setStatus} className="grid grid-cols-1 gap-4">
              <div 
                className={cn(
                  "flex items-center space-x-4 p-5 cursor-pointer transition-all duration-300 border",
                  status === "CONFIRMED" ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white/50 border-primary/5 hover:border-primary/10"
                )}
                onClick={() => setStatus("CONFIRMED")}
              >
                <RadioGroupItem value="CONFIRMED" id="confirmed" className="border-primary" />
                <Label htmlFor="confirmed" className="text-[11px] tracking-[0.2em] cursor-pointer flex-1 uppercase">SIM, ESTAREMOS PRESENTES</Label>
              </div>
              
              <div 
                className={cn(
                  "flex items-center space-x-4 p-5 cursor-pointer transition-all duration-300 border",
                  status === "DECLINED" ? "bg-red-50/50 border-red-200" : "bg-white/50 border-primary/5 hover:border-primary/10"
                )}
                onClick={() => setStatus("DECLINED")}
              >
                <RadioGroupItem value="DECLINED" id="declined" className="border-primary" />
                <Label htmlFor="declined" className="text-[11px] tracking-[0.2em] cursor-pointer flex-1 uppercase">NÃO PODEREMOS IR</Label>
              </div>
            </RadioGroup>
          </div>

          {status === "CONFIRMED" && guest.tipo === "FAMILIA" && familyMembers.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-500">
              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-primary/10" />
                <Label className="text-[9px] tracking-[0.3em] opacity-40 uppercase font-bold">INTEGRANTES DA FAMÍLIA</Label>
                <Separator className="flex-1 bg-primary/10" />
              </div>
              
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div key={member} className="p-5 bg-white/40 border border-primary/5 space-y-4">
                    <p className="text-[11px] tracking-widest font-bold uppercase text-primary/80">{member}</p>
                    
                    <div className="flex gap-3">
                       <button
                         type="button"
                         onClick={() => handleToggleMember(member, true)}
                         className={cn(
                           "flex-1 flex items-center justify-center gap-2 py-3 text-[9px] tracking-widest uppercase transition-all duration-300",
                           selectedMembers.includes(member) 
                             ? "bg-primary text-white shadow-md" 
                             : "bg-stone-50 text-primary/40 border border-primary/10 hover:bg-stone-100"
                         )}
                       >
                         <Check className="h-3 w-3" /> PRESENTE
                       </button>
                       <button
                         type="button"
                         onClick={() => handleToggleMember(member, false)}
                         className={cn(
                           "flex-1 flex items-center justify-center gap-2 py-3 text-[9px] tracking-widest uppercase transition-all duration-300",
                           !selectedMembers.includes(member) 
                             ? "bg-stone-800 text-white shadow-md" 
                             : "bg-stone-50 text-primary/40 border border-primary/10 hover:bg-stone-100"
                         )}
                       >
                         <X className="h-3 w-3" /> AUSENTE
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-xs tracking-[0.4em] font-light shadow-xl shadow-primary/20 rounded-none transition-all" 
              disabled={isPending}
            >
              {isPending ? "PROCESSANDO..." : "ENVIAR RESPOSTA"}
            </Button>
            <p className="text-[8px] opacity-30 text-center mt-6 tracking-[0.2em] uppercase italic">
              Sua resposta pode ser alterada a qualquer momento.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
