"use client";

import { useState } from "react";
import { updateRSVP } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Check, Heart, MessageSquare, Baby, Gift, X } from "lucide-react";
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
  const [giftSearch, setGiftSearch] = useState<string>("");
  const [selectedGiftId, setSelectedGiftId] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(!!guest.status_confirmacao);

  const familyMembers = guest.membros ? guest.membros.split(",").map((s: string) => s.trim()) : [];
  const availableGifts = gifts.filter((g) => !g.isReserved);
  const filteredGifts = giftSearch.trim()
    ? availableGifts.filter((g) => g.name.toLowerCase().includes(giftSearch.toLowerCase()))
    : availableGifts;

  const handleGiftSelect = (gift: any) => {
    setGiftSearch(gift.name);
    setSelectedGiftId(gift.id);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const confirmadosString = guest.tipo === "FAMILIA" ? selectedMembers.join(", ") : "";
    const finalStatus =
      guest.tipo === "FAMILIA" && selectedMembers.length === 0 && status === "CONFIRMED"
        ? "DECLINED"
        : status;
    const customGiftName = !selectedGiftId && giftSearch.trim() ? giftSearch.trim() : undefined;
    const result = await updateRSVP(guest.slug, finalStatus, confirmadosString, mensagem, selectedGiftId || undefined, eventId, customGiftName);
    if (result.success) {
      if (finalStatus === "CONFIRMED") confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      toast.success("RESPOSTA ENVIADA!");
      setSubmitted(true);
    }
    setIsPending(false);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-8 animate-in zoom-in duration-700 py-10">
        <div className="w-20 h-20 bg-primary/5 border border-primary/10 mx-auto flex items-center justify-center">
          <Heart className="h-9 w-9 text-primary/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-serif tracking-[0.2em] text-primary" style={{ fontFamily }}>
            Obrigado
          </h2>
          <p className="text-[8px] tracking-[0.5em] opacity-30 uppercase">Resposta Registrada</p>
        </div>
        <p className="text-sm leading-loose px-4 opacity-50 max-w-xs mx-auto">
          {status === "CONFIRMED"
            ? "Ficamos muito felizes em saber que você virá! Nos vemos em breve."
            : "Sentiremos sua falta, mas agradecemos por nos avisar."}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[8px] tracking-[0.35em] uppercase opacity-35 hover:opacity-70 underline underline-offset-4 transition-all cursor-pointer"
        >
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Confirm / Decline ── */}
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => setStatus("CONFIRMED")}
          className={cn(
            "relative flex items-center gap-5 px-6 py-5 border text-left transition-all duration-200 cursor-pointer group",
            status === "CONFIRMED"
              ? "bg-primary/5 border-primary/30"
              : "border-current/10 hover:border-current/20 bg-white/40"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
              status === "CONFIRMED" ? "border-primary bg-primary" : "border-current/20"
            )}
          >
            {status === "CONFIRMED" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase font-semibold">Sim, estarei presente</p>
            <p className="text-[8px] opacity-35 tracking-wider mt-0.5">Confirmar presença</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatus("DECLINED")}
          className={cn(
            "relative flex items-center gap-5 px-6 py-5 border text-left transition-all duration-200 cursor-pointer",
            status === "DECLINED"
              ? "bg-red-50/60 border-red-200"
              : "border-current/10 hover:border-current/20 bg-white/40"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
              status === "DECLINED" ? "border-red-400 bg-red-400" : "border-current/20"
            )}
          >
            {status === "DECLINED" && <X className="w-2.5 h-2.5 text-white" />}
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase font-semibold">Não poderei ir</p>
            <p className="text-[8px] opacity-35 tracking-wider mt-0.5">Informar ausência</p>
          </div>
        </button>
      </div>

      {/* ── Confirmed fields ── */}
      {status === "CONFIRMED" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-400">

          {/* Family members */}
          {guest.tipo === "FAMILIA" && familyMembers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="block h-px flex-1 opacity-10 bg-current" />
                <p className="text-[8px] tracking-[0.4em] uppercase opacity-35 font-bold">Quem virá?</p>
                <span className="block h-px flex-1 opacity-10 bg-current" />
              </div>
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
                        "flex items-center gap-2 px-5 py-2.5 border text-[9px] tracking-widest uppercase transition-all duration-200 cursor-pointer",
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-current/10 bg-white/40 hover:border-current/25 opacity-60 hover:opacity-90"
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

          {/* Gift */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="block h-px flex-1 opacity-10 bg-current" />
              <p className="text-[8px] tracking-[0.4em] uppercase opacity-35 font-bold flex items-center gap-2">
                <Gift className="h-3 w-3" /> Presente
              </p>
              <span className="block h-px flex-1 opacity-10 bg-current" />
            </div>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={giftSearch}
                  onChange={(e) => { setGiftSearch(e.target.value); setSelectedGiftId(""); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="ESCREVA O PRESENTE..."
                  className="w-full h-12 px-4 pr-9 border border-current/10 bg-white/40 text-[10px] tracking-widest uppercase placeholder:opacity-20 focus:outline-none focus:border-current/30 transition-colors"
                />
                {selectedGiftId && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/50" />
                )}
              </div>
              {showSuggestions && filteredGifts.length > 0 && (
                <div className="absolute z-10 w-full border border-current/10 border-t-0 bg-white shadow-lg max-h-44 overflow-y-auto">
                  {filteredGifts.map((g: any) => (
                    <button
                      key={g.id}
                      type="button"
                      onMouseDown={() => handleGiftSelect(g)}
                      className="w-full text-left px-4 py-3 text-[9px] tracking-widest uppercase hover:bg-primary/5 transition-colors border-b border-current/5 last:border-0 cursor-pointer"
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
              {giftSearch.trim() && (
                <p className="text-[7px] tracking-[0.3em] uppercase opacity-30 mt-1.5 text-center">
                  {selectedGiftId ? "da lista de presentes" : "presente personalizado"}
                </p>
              )}
            </div>
          </div>

          {/* Diaper / Kit suggestion */}
          {(guest.fralda_tamanho || guest.kit_churrasco) && (
            <div className="bg-primary text-primary-foreground p-6 sm:p-8 text-center space-y-4">
              <p className="text-[7px] font-bold tracking-[0.4em] uppercase opacity-50 flex items-center justify-center gap-2">
                <Baby className="h-3 w-3" /> Sugestão de Presente
              </p>
              {guest.fralda_tamanho && (
                <div className="space-y-0.5">
                  <p className="text-[7px] tracking-[0.3em] uppercase opacity-50">Fralda Tamanho</p>
                  <p className="text-6xl font-serif leading-none tracking-tight">{guest.fralda_tamanho}</p>
                </div>
              )}
              {guest.kit_churrasco && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[9px] tracking-widest uppercase opacity-70">Kit Churrasco</p>
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="block h-px flex-1 opacity-10 bg-current" />
              <p className="text-[8px] tracking-[0.4em] uppercase opacity-35 font-bold flex items-center gap-2">
                <MessageSquare className="h-3 w-3" /> Recado
              </p>
              <span className="block h-px flex-1 opacity-10 bg-current" />
            </div>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Sua mensagem para os pais..."
              className="rounded-none bg-white/40 border-current/10 text-[11px] tracking-wider min-h-[88px] placeholder:opacity-20 leading-relaxed focus:border-current/25 resize-none"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="group relative w-full overflow-hidden py-4 text-[9px] tracking-[0.45em] uppercase bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-all duration-300 cursor-pointer"
      >
        <span className="relative z-10">
          {isPending ? "Processando..." : "Confirmar Presença"}
        </span>
      </button>
    </form>
  );
}
