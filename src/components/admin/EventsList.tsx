"use client";

import { Gift, Users, LogIn, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareEventDialog } from "@/components/admin/ShareEventDialog";
import { removeEventShare, removeEvent } from "@/app/eventActions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export type EventListItem = {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  createdAt?: string | Date;
  sharedWith?: { id: string; email: string; role: string }[];
  settings?: { babyName: string | null; eventDate: Date | string | null } | null;
  _count?: { guests: number; gifts: number };
};

type EventsListProps = {
  title: string;
  description?: string;
  events: EventListItem[];
  currentUser: string;
  variant: "owned" | "shared";
  onEnter: (eventId: string) => void;
  onSharesUpdated: (eventId: string, shares: { id: string; email: string }[]) => void;
  onDelete?: (eventId: string) => void;
};

export function EventsList({
  title,
  description,
  events,
  currentUser,
  variant,
  onEnter,
  onSharesUpdated,
  onDelete,
}: EventsListProps) {
  if (events.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-serif tracking-[0.2em] text-primary uppercase">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-stone-500 mt-1">{description}</p>
        )}
      </div>

      <div className="border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100 text-[9px] font-bold tracking-[0.3em] uppercase text-stone-400">
          <span>Evento</span>
          <span className="text-center w-28">Resumo</span>
          <span className="text-right w-52">Ações</span>
        </div>

        <ul className="divide-y divide-stone-100">
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              currentUser={currentUser}
              variant={variant}
              onEnter={onEnter}
              onSharesUpdated={onSharesUpdated}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function EventRow({
  event,
  currentUser,
  variant,
  onEnter,
  onSharesUpdated,
  onDelete,
}: {
  event: EventListItem;
  currentUser: string;
  variant: "owned" | "shared";
  onEnter: (eventId: string) => void;
  onSharesUpdated: (eventId: string, shares: { id: string; email: string }[]) => void;
  onDelete?: (eventId: string) => void;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isOwner = variant === "owned";
  const shares = event.sharedWith || [];

  const handleRemoveShare = async (email: string) => {
    setRemoving(email);
    const result = await removeEventShare(event.id, email, currentUser);
    setRemoving(null);
    if (result.success) {
      onSharesUpdated(
        event.id,
        shares.filter((s) => s.email !== email)
      );
      toast.success("Acesso removido.");
    } else {
      toast.error(result.error || "Erro ao remover.");
    }
  };

  const handleShared = (email: string) => {
    if (shares.some((s) => s.email.toLowerCase() === email.toLowerCase())) return;
    onSharesUpdated(event.id, [...shares, { id: email, email, role: "EDITOR" }]);
  };

  const handleDeleteEvent = async () => {
    const confirmed = window.confirm(
      `Confirma excluir o evento "${event.name}"? Esta ação removerá todo o evento e não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const result = await removeEvent(event.id, currentUser);
    setDeleting(false);

    if (result.success) {
      toast.success("Evento excluído com sucesso.");
      onDelete?.(event.id);
    } else {
      toast.error(result.error || "Erro ao excluir evento.");
    }
  };

  const babyName = event.settings?.babyName;
  const guestCount = event._count?.guests ?? 0;
  const giftCount = event._count?.gifts ?? 0;

  return (
    <li className="p-5 sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4 sm:items-center space-y-4 sm:space-y-0">
      <div className="space-y-1 min-w-0">
        <h3 className="text-base font-serif tracking-widest text-primary uppercase truncate">
          {event.name}
        </h3>
        <p className="text-[10px] text-stone-400 tracking-wider">
          /{event.slug}
          {babyName && babyName !== "O Bebê" && (
            <span className="text-stone-500"> · {babyName}</span>
          )}
        </p>
        {isOwner && shares.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {shares.map((s) => (
              <span
                key={s.email}
                className="inline-flex items-center gap-1 bg-primary/5 border border-primary/10 px-2 py-0.5 text-[10px] text-stone-600"
              >
                {s.email}
                <button
                  type="button"
                  disabled={removing === s.email}
                  onClick={() => handleRemoveShare(s.email)}
                  className="text-stone-400 hover:text-red-600"
                  aria-label={`Remover ${s.email}`}
                >
                  {removing === s.email ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex sm:flex-col gap-3 sm:gap-1 sm:w-28 sm:items-center text-[10px] text-stone-500">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {guestCount} convidados
        </span>
        <span className="inline-flex items-center gap-1">
          <Gift className="h-3 w-3" />
          {giftCount} presentes
        </span>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end sm:w-52">
        {isOwner && (
          <>
            <ShareEventDialog
              ownerEmail={currentUser}
              eventId={event.id}
              eventName={event.name}
              onShared={handleShared}
              alreadySharedEmails={shares.map((s) => s.email)}
            />
            <Button
              type="button"
              onClick={handleDeleteEvent}
              disabled={deleting}
              variant="destructive"
              className="rounded-none h-9 text-[10px] tracking-widest uppercase"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Excluir
            </Button>
          </>
        )}
        <Button
          type="button"
          onClick={() => onEnter(event.id)}
          className="rounded-none h-9 text-[10px] tracking-widest uppercase"
        >
          <LogIn className="h-4 w-4 mr-1.5" />
          Entrar
        </Button>
      </div>
    </li>
  );
}
