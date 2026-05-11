"use client";

import { useState } from "react";
import { updateRSVP } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Separator } from "@/components/ui/separator";

interface RSVPFormProps {
  guest: {
    nome: string;
    slug: string;
    status_confirmacao: string | null;
    tipo: string;
    membros: string | null;
    membros_confirmados: string | null;
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

  const handleToggleMember = (member: string) => {
    setSelectedMembers(prev => 
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const confirmadosString = guest.tipo === "FAMILIA" ? selectedMembers.join(", ") : "";
    
    // Se for individual, status é o que manda. Se for familia e ninguém selecionado, mas status for "CONFIRMED", é um erro de UX, mas vamos tratar.
    const finalStatus = (guest.tipo === "FAMILIA" && selectedMembers.length === 0 && status === "CONFIRMED") ? "DECLINED" : status;

    const result = await updateRSVP(guest.slug, finalStatus, confirmadosString);

    if (result.success) {
      if (finalStatus === "CONFIRMED") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#B8860B", "#D4AF37", "#FFFFFF"],
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
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-serif tracking-[0.2em] text-primary uppercase">OBRIGADO</CardTitle>
          <Separator className="w-12 mx-auto bg-primary/30" />
          <CardDescription className="text-sm tracking-widest leading-relaxed uppercase">
            {status === "CONFIRMED" 
              ? `FICAMOS MUITO FELIZES EM SABER QUE VOCÊ VIRÁ!` 
              : `SENTIREMOS SUA FALTA, MAS AGRADECEMOS POR NOS AVISAR.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <Button variant="link" onClick={() => setSubmitted(false)} className="text-xs tracking-[0.3em] opacity-50 hover:opacity-100 uppercase">
            ALTERAR RESPOSTA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="space-y-4">
        <CardTitle className="text-3xl font-serif tracking-[0.2em] text-center text-primary uppercase">CONFIRMAÇÃO</CardTitle>
        <Separator className="w-12 mx-auto bg-primary/30" />
        <CardDescription className="text-center text-xs tracking-[0.2em] opacity-70 uppercase">
          OLÁ, {guest.nome}! <br/>
          {guest.tipo === "FAMILIA" ? "CONVITE FAMILIAR" : "CONVITE INDIVIDUAL"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <RadioGroup value={status} onValueChange={setStatus} className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <RadioGroupItem value="CONFIRMED" id="confirmed" className="border-current" />
                <Label htmlFor="confirmed" className="text-xs tracking-[0.3em] cursor-pointer group-hover:opacity-80 transition-opacity uppercase text-inherit">SIM, EU IREI</Label>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <RadioGroupItem value="DECLINED" id="declined" className="border-current" />
                <Label htmlFor="declined" className="text-xs tracking-[0.3em] cursor-pointer group-hover:opacity-80 transition-opacity uppercase text-inherit">INFELIZMENTE NÃO PODEREI IR</Label>
              </div>
            </RadioGroup>
          </div>

          {status === "CONFIRMED" && guest.tipo === "FAMILIA" && familyMembers.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-500">
              <Label className="text-[10px] tracking-[0.2em] opacity-60 uppercase">QUEM ESTARÁ PRESENTE?</Label>
              <div className="grid grid-cols-1 gap-4">
                {familyMembers.map((member) => (
                  <div key={member} className="flex items-center space-x-3 p-4 bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-colors">
                    <Checkbox 
                      id={member} 
                      checked={selectedMembers.includes(member)}
                      onCheckedChange={() => handleToggleMember(member)}
                      className="border-primary"
                    />
                    <Label htmlFor={member} className="text-xs tracking-widest cursor-pointer flex-1 uppercase">
                      {member}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-xs tracking-[0.4em] font-light shadow-lg rounded-none uppercase" disabled={isPending}>
            {isPending ? "ENVIANDO..." : "CONFIRMAR"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
