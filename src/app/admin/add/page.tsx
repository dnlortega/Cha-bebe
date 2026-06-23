"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { addGuestsDirect, addMultipleGuests } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  UserPlus, Loader2, Trash2, Save, Users, User,
  ChevronDown, ChevronUp, X, CheckCircle2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type QueuedGuest = {
  id: string;
  nome: string;
  tipo: "INDIVIDUAL" | "FAMILIA";
  membros: string;
  fralda_tamanho: string | null;
  kit_churrasco: boolean;
};

const DIAPER_OPTIONS = [
  { value: "NONE", label: "Sem fralda" },
  { value: "RN", label: "RN – Recém Nascido" },
  { value: "P", label: "P – Pequeno" },
  { value: "M", label: "M – Médio" },
  { value: "G", label: "G – Grande" },
  { value: "GG", label: "GG – Extra Grande" },
];

export default function AddGuestsPage() {
  // Form fields
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"INDIVIDUAL" | "FAMILIA">("INDIVIDUAL");
  const [membros, setMembros] = useState("");
  const [fralda, setFralda] = useState<string>("NONE");
  const [kit, setKit] = useState(false);

  // Queue of guests to be saved
  const [queue, setQueue] = useState<QueuedGuest[]>([]);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Bulk import (advanced)
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNome("");
    setTipo("INDIVIDUAL");
    setMembros("");
    setFralda("NONE");
    setKit(false);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const handleAdd = () => {
    const trimmed = nome.trim().toUpperCase();
    if (!trimmed) { nameRef.current?.focus(); return; }

    setQueue(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nome: trimmed,
        tipo,
        membros: membros.trim(),
        fralda_tamanho: fralda === "NONE" ? null : fralda,
        kit_churrasco: kit,
      },
    ]);
    resetForm();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  const removeFromQueue = (id: string) => setQueue(prev => prev.filter(g => g.id !== id));

  const handleSaveAll = async () => {
    if (queue.length === 0) return;
    setSaving(true);
    const result = await addGuestsDirect(
      queue.map(g => ({
        nome: g.nome,
        tipo: g.tipo,
        membros: g.membros || null,
        fralda_tamanho: g.fralda_tamanho,
        kit_churrasco: g.kit_churrasco,
      }))
    );
    setSaving(false);
    if (result.success) {
      toast.success(`${result.count} CONVIDADO${result.count !== 1 ? "S" : ""} CADASTRADO${result.count !== 1 ? "S" : ""}!`);
      setQueue([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      toast.error(result.error || "Erro ao salvar.");
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) return;
    setBulkLoading(true);
    const result = await addMultipleGuests(bulkText);
    if (result.success) {
      toast.success(`${result.count} CONVIDADOS IMPORTADOS!`);
      setBulkText("");
      setShowBulk(false);
    } else {
      toast.error(result.error || "Erro na importação.");
    }
    setBulkLoading(false);
  };

  return (
    <div className="w-full max-w-3xl space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="space-y-1">
        <h1 className="text-4xl font-serif text-primary tracking-[0.2em]">CADASTRAR</h1>
        <p className="text-[10px] opacity-50 tracking-[0.4em] font-light uppercase">ADICIONAR CONVIDADOS AO EVENTO</p>
      </header>

      {/* ── FORM ─────────────────────────────── */}
      <div className="bg-white dark:bg-stone-950 border border-primary/10 dark:border-primary/20 shadow-xl">
        <div className="bg-stone-900 dark:bg-stone-800 px-8 py-6 flex items-center gap-3 border-b-4 border-primary">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-serif tracking-[0.2em] text-white uppercase">Novo Convidado</h2>
        </div>

        <div className="p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">Nome *</label>
            <Input
              ref={nameRef}
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: MARIA SILVA"
              autoFocus
              className="h-14 rounded-none bg-stone-50 dark:bg-stone-900 border-primary/15 dark:border-primary/30 text-[13px] tracking-widest uppercase dark:text-stone-200 placeholder:opacity-20 placeholder:normal-case"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">Tipo</label>
            <div className="flex">
              <button
                onClick={() => setTipo("INDIVIDUAL")}
                className={`flex-1 h-12 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase border transition-all rounded-none ${
                  tipo === "INDIVIDUAL"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white dark:bg-stone-900 text-stone-500 border-primary/15 dark:border-primary/30 hover:border-primary/40"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Individual
              </button>
              <button
                onClick={() => setTipo("FAMILIA")}
                className={`flex-1 h-12 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase border-t border-b border-r transition-all rounded-none ${
                  tipo === "FAMILIA"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white dark:bg-stone-900 text-stone-500 border-primary/15 dark:border-primary/30 hover:border-primary/40"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Família
              </button>
            </div>
          </div>

          {/* Members — only for FAMILIA */}
          {tipo === "FAMILIA" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">Membros da família</label>
              <Input
                value={membros}
                onChange={e => setMembros(e.target.value)}
                placeholder="Ex: João, Maria, Pedro"
                className="h-12 rounded-none bg-stone-50 dark:bg-stone-900 border-primary/15 dark:border-primary/30 text-[12px] tracking-widest dark:text-stone-200 placeholder:opacity-20 placeholder:normal-case"
              />
              <p className="text-[9px] opacity-40 tracking-widest">Separe os nomes por vírgula</p>
            </div>
          )}

          {/* Diaper + Kit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">Sugestão de Fralda</label>
              <Select value={fralda} onValueChange={v => setFralda(v ?? "NONE")}>
                <SelectTrigger className="h-12 rounded-none border-primary/15 dark:border-primary/30 bg-stone-50 dark:bg-stone-900 text-[10px] tracking-widest uppercase dark:text-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none text-[10px] tracking-widest">
                  {DIAPER_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">Kit Churrasco</label>
              <button
                onClick={() => setKit(v => !v)}
                className={`w-full h-12 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase border transition-all rounded-none ${
                  kit
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-stone-50 dark:bg-stone-900 text-stone-400 border-primary/15 dark:border-primary/30 hover:border-primary/40"
                }`}
              >
                {kit ? "✓ SIM" : "NÃO"}
              </button>
            </div>
          </div>

          {/* Add button */}
          <Button
            onClick={handleAdd}
            disabled={!nome.trim()}
            className="w-full h-14 rounded-none text-[11px] tracking-[0.3em] font-bold uppercase"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar à Fila
          </Button>
        </div>
      </div>

      {/* ── QUEUE ────────────────────────────── */}
      {queue.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">
              {queue.length} CONVIDADO{queue.length !== 1 ? "S" : ""} NA FILA
            </p>
            <button
              onClick={() => setQueue([])}
              className="text-[9px] tracking-widest uppercase opacity-30 hover:opacity-60 flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Limpar fila
            </button>
          </div>

          <div className="space-y-2">
            {queue.map((g, i) => (
              <div
                key={g.id}
                className="bg-white dark:bg-stone-950 border border-primary/10 dark:border-primary/20 px-6 py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-[10px] opacity-25 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-widest text-primary uppercase truncate">{g.nome}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="rounded-none text-[8px] tracking-widest px-1.5 py-0 h-4">
                        {g.tipo === "FAMILIA" ? "FAMÍLIA" : "INDIVIDUAL"}
                      </Badge>
                      {g.fralda_tamanho && (
                        <span className="text-[8px] tracking-widest uppercase opacity-50">FRALDA {g.fralda_tamanho}</span>
                      )}
                      {g.kit_churrasco && (
                        <span className="text-[8px] tracking-widest uppercase text-amber-500">KIT ✓</span>
                      )}
                      {g.membros && (
                        <span className="text-[8px] opacity-40 truncate max-w-[200px]">{g.membros}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromQueue(g.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSaveAll}
            disabled={saving}
            size="lg"
            className="w-full h-16 rounded-none text-[11px] tracking-[0.4em] font-bold uppercase shadow-lg"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
            ) : saved ? (
              <CheckCircle2 className="h-5 w-5 mr-3 text-emerald-300" />
            ) : (
              <Save className="h-5 w-5 mr-3" />
            )}
            {saving ? "SALVANDO..." : `SALVAR ${queue.length} CONVIDADO${queue.length !== 1 ? "S" : ""}`}
          </Button>
        </div>
      )}

      {/* ── BULK IMPORT (advanced) ─────────────── */}
      <div className="border border-primary/10 dark:border-primary/20">
        <button
          onClick={() => setShowBulk(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 hover:opacity-80 transition-opacity"
        >
          <span>Importação em Lote (avançado)</span>
          {showBulk ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showBulk && (
          <div className="px-6 pb-6 space-y-4 animate-in fade-in duration-200">
            <p className="text-[9px] opacity-40 tracking-widest leading-relaxed uppercase">
              Cole uma linha por convidado no formato: NOME | INDIVIDUAL | | RN | SIM
            </p>
            <Textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"MARIA SILVA | INDIVIDUAL | | P | NÃO\nFAMÍLIA COSTA | FAMILIA | JOÃO, ANA | M | SIM"}
              className="min-h-[180px] rounded-none bg-stone-50 dark:bg-stone-900 border-primary/10 text-[11px] tracking-widest font-mono resize-none placeholder:opacity-20 dark:text-stone-300"
            />
            <Button
              onClick={handleBulkImport}
              disabled={bulkLoading || !bulkText.trim()}
              variant="outline"
              className="h-12 rounded-none text-[10px] tracking-widest uppercase w-full"
            >
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Importar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
