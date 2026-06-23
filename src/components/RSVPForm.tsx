"use client";

import { useState } from "react";
import { updateRSVP } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Check, Heart, MessageSquare, Baby, Gift, X, ChevronDown } from "lucide-react";
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
  showGiftSection?: boolean;
  showMessageSection?: boolean;
}

export default function RSVPForm({
  guest, gifts, fontFamily, eventId,
  showGiftSection = true,
  showMessageSection = true,
}: RSVPFormProps) {
  const [status, setStatus] = useState<string>(guest.status_confirmacao || "CONFIRMED");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    guest.membros_confirmados
      ? guest.membros_confirmados.split(",").map((s: string) => s.trim())
      : []
  );
  const [mensagem, setMensagem] = useState("");
  const [giftSearch, setGiftSearch] = useState<string>("");
  const [selectedGiftId, setSelectedGiftId] = useState<string>("");
  const [showGiftSuggestions, setShowGiftSuggestions] = useState(false);
  const [giftExpanded, setGiftExpanded] = useState(false);
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
    setShowGiftSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Família precisa selecionar pelo menos um membro
    if (guest.tipo === "FAMILIA" && familyMembers.length > 0 && status === "CONFIRMED" && selectedMembers.length === 0) {
      toast.error("Selecione pelo menos um membro da família que vai comparecer.");
      return;
    }

    setIsPending(true);
    const confirmadosString = guest.tipo === "FAMILIA" ? selectedMembers.join(", ") : "";
    const customGiftName = !selectedGiftId && giftSearch.trim() ? giftSearch.trim() : undefined;
    const result = await updateRSVP(guest.slug, status, confirmadosString, mensagem, selectedGiftId || undefined, eventId, customGiftName);
    if (result.success) {
      if (status === "CONFIRMED") confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      toast.success("RESPOSTA ENVIADA!");
      setSubmitted(true);
    }
    setIsPending(false);
  };

  // ── Thank-you screen ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center space-y-6 animate-in zoom-in duration-700 py-10">
        <div className="w-20 h-20 bg-primary/5 border border-primary/10 mx-auto flex items-center justify-center">
          <Heart className="h-9 w-9 text-primary/50" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-serif tracking-[0.15em] text-primary" style={{ fontFamily }}>
            Obrigado
          </h2>
          <p className="text-xs tracking-wider opacity-40 uppercase">Resposta Registrada</p>
        </div>
        <p className="text-sm leading-loose px-4 opacity-60 max-w-xs mx-auto">
          {status === "CONFIRMED"
            ? "Ficamos muito felizes em saber que você virá! Nos vemos em breve."
            : "Sentiremos sua falta, mas agradecemos por nos avisar."}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs tracking-wider uppercase opacity-40 hover:opacity-70 underline underline-offset-4 transition-all cursor-pointer"
        >
          Alterar resposta
        </button>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────
  const isFamilyWithMembers = guest.tipo === "FAMILIA" && familyMembers.length > 0;
  const membersValidation = isFamilyWithMembers && status === "CONFIRMED" && selectedMembers.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Confirm / Decline ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wider uppercase opacity-50 mb-3">Você vai poder vir?</p>

        <button
          type="button"
          onClick={() => setStatus("CONFIRMED")}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-5 border text-left transition-all duration-200 cursor-pointer",
            status === "CONFIRMED"
              ? "bg-primary/5 border-primary/40 shadow-sm"
              : "border-current/10 hover:border-current/20 bg-white/40"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
            status === "CONFIRMED" ? "border-primary bg-primary" : "border-current/25"
          )}>
            {status === "CONFIRMED" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">Sim, estarei presente</p>
            <p className="text-xs opacity-40 mt-0.5">Confirmar presença</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatus("DECLINED")}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-5 border text-left transition-all duration-200 cursor-pointer",
            status === "DECLINED"
              ? "bg-red-50/80 border-red-300"
              : "border-current/10 hover:border-current/20 bg-white/40"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
            status === "DECLINED" ? "border-red-400 bg-red-400" : "border-current/25"
          )}>
            {status === "DECLINED" && <X className="w-3 h-3 text-white" />}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">Não poderei ir</p>
            <p className="text-xs opacity-40 mt-0.5">Informar ausência</p>
          </div>
        </button>
      </div>

      {/* ── Confirmed extra fields ── */}
      {status === "CONFIRMED" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">

          {/* Family members — obrigatório */}
          {isFamilyWithMembers && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider uppercase opacity-50">Quem virá? *</p>
                {membersValidation && (
                  <p className="text-xs text-red-500 font-medium">Selecione ao menos 1</p>
                )}
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
                        "flex items-center gap-2 px-4 py-2.5 border text-sm tracking-wide transition-all duration-200 cursor-pointer",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-current/15 bg-white/40 hover:border-current/30 opacity-70 hover:opacity-100"
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                      {m}
                    </button>
                  );
                })}
              </div>
              {membersValidation && (
                <p className="text-xs text-red-500/70 bg-red-50 border border-red-100 px-3 py-2">
                  Por favor, selecione quem da família irá comparecer ao evento.
                </p>
              )}
            </div>
          )}

          {/* Diaper / Kit suggestion */}
          {(guest.fralda_tamanho || guest.kit_churrasco) && (
            <div className="bg-primary text-primary-foreground p-6 text-center space-y-4">
              <p className="text-xs font-bold tracking-wider uppercase opacity-60 flex items-center justify-center gap-2">
                <Baby className="h-3.5 w-3.5" /> Sugestão de Presente
              </p>
              {guest.fralda_tamanho && (
                <div className="space-y-1">
                  <p className="text-xs tracking-wider uppercase opacity-50">Fralda Tamanho</p>
                  <p className="text-6xl font-serif leading-none">{guest.fralda_tamanho}</p>
                </div>
              )}
              {guest.kit_churrasco && (
                <div className="pt-3 border-t border-white/15">
                  <p className="text-sm tracking-wider uppercase opacity-70">Kit Churrasco</p>
                </div>
              )}
            </div>
          )}

          {/* Gift — collapsible, condicionado pelo settings */}
          {showGiftSection && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setGiftExpanded(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 border border-current/10 bg-white/40 hover:border-current/20 transition-colors text-left"
              >
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-50">
                  <Gift className="h-3.5 w-3.5" /> Indicar Presente
                </span>
                <ChevronDown className={cn("h-4 w-4 opacity-30 transition-transform", giftExpanded && "rotate-180")} />
              </button>

              {giftExpanded && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="relative">
                    <input
                      type="text"
                      value={giftSearch}
                      onChange={(e) => { setGiftSearch(e.target.value); setSelectedGiftId(""); setShowGiftSuggestions(true); }}
                      onFocus={() => setShowGiftSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowGiftSuggestions(false), 150)}
                      placeholder="Escreva ou escolha da lista..."
                      className="w-full h-12 px-4 pr-9 border border-current/10 bg-white/40 text-sm placeholder:opacity-30 focus:outline-none focus:border-current/30 transition-colors"
                    />
                    {selectedGiftId && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                    )}
                  </div>
                  {showGiftSuggestions && filteredGifts.length > 0 && (
                    <div className="border border-current/10 border-t-0 bg-white shadow-lg max-h-44 overflow-y-auto">
                      {filteredGifts.map((g: any) => (
                        <button
                          key={g.id}
                          type="button"
                          onMouseDown={() => handleGiftSelect(g)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors border-b border-current/5 last:border-0 cursor-pointer"
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {giftSearch.trim() && (
                    <p className="text-xs opacity-35 mt-1 text-center">
                      {selectedGiftId ? "da lista de presentes" : "presente personalizado"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message — condicionado pelo settings */}
          {showMessageSection && (
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider uppercase opacity-50 flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Deixe um recado (opcional)
              </label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Sua mensagem para os pais..."
                className="rounded-none bg-white/40 border-current/10 text-sm min-h-22 placeholder:opacity-30 leading-relaxed focus:border-current/25 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-5 text-sm font-semibold tracking-[0.2em] uppercase bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 transition-all duration-300 cursor-pointer"
      >
        {isPending ? "Enviando..." : status === "CONFIRMED" ? "✓ Confirmar Presença" : "Enviar Resposta"}
      </button>
    </form>
  );
}
