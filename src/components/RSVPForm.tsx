"use client";

import { useState } from "react";
import { updateRSVP } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Users, User, Heart, MessageSquare, Baby, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface RSVPFormProps {
  guest: {
    nome: string;
    slug: string;
    status_confirmacao: string | null;
    tipo: string | null;
    membros: string | null;
    membros_confirmados: string | null;
    fralda_tamanho: string | null;
    kit_churrasco: boolean | null;
  };
  gifts: any[];
  fontFamily?: string;
  fontSize?: number;
  eventId: string;
}

export default function RSVPForm({ guest, gifts, fontFamily, eventId }: RSVPFormProps) {
  const [status, setStatus] = useState<string>(guest.status_confirmacao || "CONFIRMED");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    guest.membros_confirmados
      ? guest.membros_confirmados.split(",").map((s: string) => s.trim())
      : []
  );
  const [mensagem, setMensagem] = useState("");
  const [selectedGift, setSelectedGift] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(!!guest.status_confirmacao);

  const familyMembers = guest.membros ? guest.membros.split(",").map((s: string) => s.trim()) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const confirmadosString = guest.tipo === "FAMILIA" ? selectedMembers.join(", ") : "";
    const finalStatus =
      guest.tipo === "FAMILIA" && selectedMembers.length === 0 && status === "CONFIRMED"
        ? "DECLINED"
        : status;
    const result = await updateRSVP(guest.slug, finalStatus, confirmadosString, mensagem, selectedGift, eventId);
    if (result.success) {
      if (finalStatus === "CONFIRMED") confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success("RESPOSTA ENVIADA!");
      setSubmitted(true);
    }
    setIsPending(false);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-8 animate-in zoom-in duration-700 py-8">
        <div className="w-16 h-16 bg-primary/5 rounded-full mx-auto flex items-center justify-center">
          <Heart className="h-8 w-8 text-primary/60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif tracking-[0.2em] text-primary" style={{ fontFamily }}>
            OBRIGADO
          </h2>
          <p className="text-[9px] tracking-[0.4em] opacity-40 uppercase">RESPOSTA REGISTRADA</p>
        </div>
        <p className="text-sm leading-relaxed px-4 opacity-60">
          {status === "CONFIRMED"
            ? "Ficamos muito felizes em saber que você virá! Nos vemos em breve."
            : "Sentiremos sua falta, mas agradecemos por nos avisar."}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[9px] tracking-[0.3em] uppercase opacity-50 underline underline-offset-4 hover:opacity-100 transition-all cursor-pointer"
        >
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status */}
      <div className="grid grid-cols-1 gap-2.5">
        <button
          type="button"
          onClick={() => setStatus("CONFIRMED")}
          className={cn(
            "flex items-center gap-4 px-5 py-4 border text-left transition-all cursor-pointer",
            status === "CONFIRMED"
              ? "bg-primary/5 border-primary/30"
              : "border-primary/10 hover:border-primary/20 bg-white/40"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              status === "CONFIRMED" ? "border-primary bg-primary" : "border-primary/20"
            )}
          >
            {status === "CONFIRMED" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[10px] tracking-widest uppercase font-medium">Sim, estarei presente</span>
        </button>
        <button
          type="button"
          onClick={() => setStatus("DECLINED")}
          className={cn(
            "flex items-center gap-4 px-5 py-4 border text-left transition-all cursor-pointer",
            status === "DECLINED"
              ? "bg-red-50/50 border-red-200"
              : "border-primary/10 hover:border-primary/20 bg-white/40"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              status === "DECLINED" ? "border-red-400 bg-red-400" : "border-primary/20"
            )}
          >
            {status === "DECLINED" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[10px] tracking-widest uppercase font-medium">Não poderei ir</span>
        </button>
      </div>

      {status === "CONFIRMED" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Family Members */}
          {guest.tipo === "FAMILIA" && familyMembers.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.3em] uppercase opacity-40 text-center font-bold">
                Quem virá?
              </p>
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((m: string) => {
                  const selected = selectedMembers.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setSelectedMembers((prev) =>
                          prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                        )
                      }
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 border text-[9px] tracking-widest uppercase transition-all cursor-pointer",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-primary/10 bg-white/40 hover:border-primary/30"
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Gifts */}
          {gifts.filter((g) => !g.isReserved).length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.3em] uppercase opacity-40 text-center font-bold flex items-center justify-center gap-2">
                <Gift className="h-3 w-3" /> Escolha um Presente
              </p>
              <Select value={selectedGift} onValueChange={(v) => v && setSelectedGift(v)}>
                <SelectTrigger className="rounded-none h-12 border-primary/10 bg-white/40 text-[10px] tracking-widest uppercase">
                  <SelectValue placeholder="LISTA DE PRESENTES">
                    {selectedGift ? gifts.find((g) => g.id === selectedGift)?.name : "LISTA DE PRESENTES"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-none text-[10px] tracking-widest uppercase">
                  {gifts
                    .filter((g) => !g.isReserved)
                    .map((g: any) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Diaper Suggestion / Kit */}
          {(guest.fralda_tamanho || guest.kit_churrasco) && (
            <div className="bg-primary text-primary-foreground p-6 text-center space-y-3">
              <p className="text-[8px] font-bold tracking-[0.3em] uppercase opacity-50 flex items-center justify-center gap-2">
                <Baby className="h-3 w-3" /> Sugestão de Presente
              </p>
              {guest.fralda_tamanho && (
                <div className="space-y-0.5">
                  <p className="text-[8px] tracking-[0.2em] uppercase opacity-60">Fralda Tamanho</p>
                  <p className="text-5xl font-serif leading-none tracking-tight">{guest.fralda_tamanho}</p>
                </div>
              )}
              {guest.kit_churrasco && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[9px] tracking-widest uppercase">Kit Churrasco</p>
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <p className="text-[9px] tracking-[0.3em] uppercase opacity-40 text-center font-bold flex items-center justify-center gap-2">
              <MessageSquare className="h-3 w-3" /> Deixe um recado
            </p>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Sua mensagem para os pais..."
              className="rounded-none bg-white/40 border-primary/10 text-xs tracking-wider min-h-[90px] placeholder:text-primary/20 leading-relaxed"
              rows={3}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 text-[9px] tracking-[0.35em] uppercase bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer"
      >
        {isPending ? "PROCESSANDO..." : "Confirmar Presença"}
      </button>
    </form>
  );
}
