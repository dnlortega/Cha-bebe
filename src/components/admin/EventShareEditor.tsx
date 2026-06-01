"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Plus, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  shareEventWithEmail,
  removeEventShare,
} from "@/app/eventActions";

type ShareEntry = { id?: string; email: string };

type EventShareEditorProps = {
  ownerEmail: string;
  /** Modo criação: apenas lista local antes de criar o evento */
  mode: "create";
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  compact?: boolean;
};

type EventShareEditorManageProps = {
  ownerEmail: string;
  mode: "manage";
  eventId: string;
  shares: ShareEntry[];
  onSharesChange: (shares: ShareEntry[]) => void;
  compact?: boolean;
};

export function EventShareEditor(
  props: EventShareEditorProps | EventShareEditorManageProps
) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const addEmailToList = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Informe um e-mail válido.");
      return false;
    }
    if (email === props.ownerEmail.toLowerCase()) {
      toast.error("Use o e-mail de outra pessoa para compartilhar.");
      return false;
    }

    if (props.mode === "create") {
      if (props.emails.includes(email)) {
        toast.error("Este e-mail já foi adicionado.");
        return false;
      }
      props.onEmailsChange([...props.emails, email]);
    }
    return true;
  };

  const handleAdd = async () => {
    if (!input.trim()) return;

    if (props.mode === "create") {
      if (addEmailToList(input)) {
        setInput("");
        toast.success("E-mail adicionado à lista.");
      }
      return;
    }

    setBusy(true);
    const result = await shareEventWithEmail(
      props.eventId,
      input,
      props.ownerEmail
    );
    setBusy(false);

    if (result.success) {
      const email = input.trim().toLowerCase();
      if (!props.shares.some((s) => s.email === email)) {
        props.onSharesChange([...props.shares, { email }]);
      }
      setInput("");
      toast.success("Evento compartilhado com sucesso.");
    } else {
      toast.error(result.error || "Não foi possível compartilhar.");
    }
  };

  const handleRemove = async (email: string) => {
    if (props.mode === "create") {
      props.onEmailsChange(props.emails.filter((e) => e !== email));
      return;
    }

    setBusy(true);
    const result = await removeEventShare(
      props.eventId,
      email,
      props.ownerEmail
    );
    setBusy(false);

    if (result.success) {
      props.onSharesChange(props.shares.filter((s) => s.email !== email));
      toast.success("Compartilhamento removido.");
    } else {
      toast.error(result.error || "Não foi possível remover.");
    }
  };

  const list =
    props.mode === "create"
      ? props.emails.map((email) => ({ email }))
      : props.shares;

  const compact = props.compact ?? false;

  return (
    <div
      className={`space-y-3 ${compact ? "" : "rounded-lg border border-primary/15 bg-stone-50/50 p-4"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {!compact && (
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase">
            Compartilhar evento
          </span>
        </div>
      )}
      <p className="text-[11px] text-stone-500 leading-relaxed">
        {props.mode === "create"
          ? "Opcional: informe e-mails de quem poderá gerenciar este evento no painel (como editor)."
          : "Quem receber o acesso verá este evento em «Seus Eventos» ao entrar com o Google."}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            type="email"
            placeholder="exemplo@gmail.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            disabled={busy}
            className="pl-8 h-9 rounded-none text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={busy || !input.trim()}
          className="h-9 rounded-none shrink-0"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </>
          )}
        </Button>
      </div>
      {list.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {list.map(({ email }) => (
            <li
              key={email}
              className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 text-[11px] text-stone-700"
            >
              <span className="truncate max-w-[200px]">{email}</span>
              <button
                type="button"
                onClick={() => handleRemove(email)}
                disabled={busy}
                className="text-stone-400 hover:text-red-600 transition-colors"
                aria-label={`Remover ${email}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
