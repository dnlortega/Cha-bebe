"use client";

import { useState } from "react";
import { updateRSVP } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Users, User, Heart, PackageCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface RSVPFormProps {
  guest: any;
  gifts: any[];
  fontFamily?: string;
  fontSize?: number;
}

export default function RSVPForm({ guest, gifts, fontFamily, fontSize }: RSVPFormProps) {
  const [status, setStatus] = useState<string>(guest.status_confirmacao || "CONFIRMED");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(guest.membros_confirmados ? guest.membros_confirmados.split(",").map((s: string) => s.trim()) : []);
  const [mensagem, setMensagem] = useState("");
  const [selectedGift, setSelectedGift] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(!!guest.status_confirmacao);

  const familyMembers = guest.membros ? guest.membros.split(",").map((s: string) => s.trim()) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const confirmadosString = guest.tipo === "FAMILIA" ? selectedMembers.join(", ") : "";
    const finalStatus = (guest.tipo === "FAMILIA" && selectedMembers.length === 0 && status === "CONFIRMED") ? "DECLINED" : status;
    const result = await updateRSVP(guest.slug, finalStatus, confirmadosString, mensagem, selectedGift);
    if (result.success) {
      if (finalStatus === "CONFIRMED") confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success("RESPOSTA ENVIADA!");
      setSubmitted(true);
    }
    setIsPending(false);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent text-center space-y-8 animate-in zoom-in duration-700">
        <div className="w-16 h-16 bg-primary/5 rounded-full mx-auto flex items-center justify-center mb-4"><Heart className="h-8 w-8 text-primary fill-primary/10" /></div>
        <div className="space-y-2"><CardTitle className="text-3xl font-serif text-primary tracking-[0.2em]" style={{ fontFamily }}>OBRIGADO</CardTitle><p className="text-[10px] opacity-40 tracking-[0.4em]" style={{ fontFamily: 'var(--font-outfit)' }}>RESPOSTA REGISTRADA</p></div>
        <CardDescription className="text-sm tracking-widest px-6" style={{ fontFamily: 'var(--font-outfit)' }}>{status === "CONFIRMED" ? "Ficamos muito felizes em saber que você virá! Nos vemos em breve." : "Sentiremos sua falta, mas agradecemos por nos avisar."}</CardDescription>
        <Button variant="outline" onClick={() => setSubmitted(false)} className="text-[9px] tracking-[0.3em] opacity-60 rounded-none h-12 px-8" style={{ fontFamily: 'var(--font-outfit)' }}>ALTERAR RESPOSTA</Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="space-y-6 text-center">
        <div className="w-14 h-14 bg-primary/5 rounded-full mx-auto flex items-center justify-center mb-2">{guest.tipo === "FAMILIA" ? <Users className="h-6 w-6 text-primary/40" /> : <User className="h-6 w-6 text-primary/40" />}</div>
        <div className="space-y-2"><CardTitle className="text-3xl font-serif tracking-[0.2em] text-primary uppercase" style={{ fontFamily }}>Confirmação</CardTitle><p className="text-[9px] opacity-40 tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>Olá, {guest.nome}!</p></div>
        <Separator className="w-12 mx-auto bg-primary/20" />
      </CardHeader>

      <CardContent className="pt-4 pb-12 px-6 sm:px-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          <RadioGroup value={status} onValueChange={setStatus} className="grid grid-cols-1 gap-3">
            <div className={cn("flex items-center space-x-4 p-3 cursor-pointer border transition-all", status === "CONFIRMED" ? "bg-primary/5 border-primary/20" : "bg-white/50 border-primary/5")} onClick={() => setStatus("CONFIRMED")}>
              <RadioGroupItem value="CONFIRMED" id="confirmed" /><Label htmlFor="confirmed" className="text-[10px] tracking-widest cursor-pointer flex-1">Sim, estarei presente</Label>
            </div>
            <div className={cn("flex items-center space-x-4 p-3 cursor-pointer border transition-all", status === "DECLINED" ? "bg-red-50/50 border-red-200" : "bg-white/50 border-primary/5")} onClick={() => setStatus("DECLINED")}>
              <RadioGroupItem value="DECLINED" id="declined" /><Label htmlFor="declined" className="text-[10px] tracking-widest cursor-pointer flex-1">Não poderei ir</Label>
            </div>
          </RadioGroup>

          {status === "CONFIRMED" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Membros Família */}
               {guest.tipo === "FAMILIA" && familyMembers.length > 0 && (
                 <div className="space-y-4">
                   <Label className="text-[9px] tracking-[0.3em] opacity-40 uppercase font-bold text-center block">Quem virá?</Label>
                   <div className="space-y-2">
                     {familyMembers.map((m: string) => (
                       <div key={m} className="flex gap-2">
                         <Button type="button" onClick={() => setSelectedMembers((prev: string[]) => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} variant={selectedMembers.includes(m) ? "default" : "outline"} className="flex-1 rounded-none text-[9px] tracking-widest uppercase h-12">{selectedMembers.includes(m) ? <Check className="mr-2 h-3 w-3" /> : null} {m}</Button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Presentes Disponíveis */}
               {gifts.filter(g => !g.isReserved).length > 0 && (
                  <div className="space-y-4">
                     <Label className="text-[9px] tracking-[0.3em] opacity-40 uppercase font-bold text-center block">Escolha um Presente</Label>
                     <Select value={selectedGift} onValueChange={(v) => v && setSelectedGift(v)}>
                        <SelectTrigger className="rounded-none h-14 border-primary/10 bg-white/50 text-[10px] tracking-widest uppercase">
                           <SelectValue placeholder="LISTA DE PRESENTES">
                              {selectedGift ? gifts.find(g => g.id === selectedGift)?.name : "LISTA DE PRESENTES"}
                           </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-none text-[10px] tracking-widest uppercase">
                           {gifts.filter(g => !g.isReserved).map((g: any) => (
                             <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               )}

               {/* Sugestão de Fralda / Kit */}
               {(guest.fralda_tamanho || guest.kit_churrasco) && (
                  <div className="bg-primary text-primary-foreground p-8 space-y-4 shadow-xl text-center">
                     <p className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">Sugestão de Presente</p>
                     {guest.fralda_tamanho && <div className="space-y-1"><p className="text-[9px] opacity-40 uppercase">Fralda Tamanho</p><h2 className="text-6xl font-serif tracking-tighter leading-none">{guest.fralda_tamanho}</h2></div>}
                     {guest.kit_churrasco && <div className="pt-2 border-t border-white/10"><p className="text-[10px] tracking-widest uppercase">Kit Churrasco</p></div>}
                  </div>
               )}

               {/* Mensagem */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2 opacity-40"><MessageSquare className="h-3 w-3" /><Label className="text-[9px] tracking-[0.3em] uppercase font-bold">Deixe um recado para os pais</Label></div>
                  <Textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Sua mensagem aqui..." className="rounded-none bg-white/50 border-primary/5 text-[11px] tracking-widest min-h-[100px]" />
               </div>
            </div>
          )}

          <Button type="submit" className="w-full h-16 text-[10px] tracking-[0.4em] rounded-none shadow-2xl" disabled={isPending}>{isPending ? "PROCESSANDO..." : "ENVIAR RESPOSTA"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
