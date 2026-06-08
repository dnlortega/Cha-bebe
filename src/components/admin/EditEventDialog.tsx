"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateEventDetails } from "@/app/eventActions";

type EditableSettings = {
  babyName: string | null;
  eventDate: Date | string | null;
  eventAddress?: string | null;
};

type EditEventDialogProps = {
  ownerEmail: string;
  event: {
    id: string;
    name: string;
    settings?: EditableSettings | null;
  };
  onUpdated: (updated: {
    name: string;
    babyName: string | null;
    eventDate: string | null;
    eventAddress: string | null;
  }) => void;
};

export function EditEventDialog({ ownerEmail, event, onUpdated }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(event.name);
  const [babyName, setBabyName] = useState(event.settings?.babyName ?? "");
  const [eventDate, setEventDate] = useState(() => {
    const d = event.settings?.eventDate;
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 16);
  });
  const [eventAddress, setEventAddress] = useState(event.settings?.eventAddress ?? "");

  const handleOpen = (v: boolean) => {
    if (v) {
      setName(event.name);
      setBabyName(event.settings?.babyName ?? "");
      setEventDate(() => {
        const d = event.settings?.eventDate;
        if (!d) return "";
        return new Date(d).toISOString().slice(0, 16);
      });
      setEventAddress(event.settings?.eventAddress ?? "");
    }
    setOpen(v);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("O nome do evento é obrigatório."); return; }
    setSaving(true);
    const result = await updateEventDetails(event.id, ownerEmail, {
      name: name.trim(),
      babyName: babyName.trim() || null,
      eventDate: eventDate || null,
      eventAddress: eventAddress.trim() || null,
    });
    setSaving(false);
    if (result.success) {
      onUpdated({
        name: name.trim(),
        babyName: babyName.trim() || null,
        eventDate: eventDate || null,
        eventAddress: eventAddress.trim() || null,
      });
      toast.success("Evento atualizado.");
      setOpen(false);
    } else {
      toast.error(result.error || "Erro ao atualizar evento.");
    }
  };

  const inputClass =
    "w-full h-10 px-3 border border-stone-200 text-sm focus:outline-none focus:border-primary/40 bg-white transition-colors";
  const labelClass = "text-[9px] tracking-[0.3em] uppercase font-bold text-stone-400 block mb-1";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none h-9 w-9 p-0 flex items-center justify-center"
            title="Editar evento"
            aria-label="Editar evento"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md rounded-none border-primary/10">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-widest text-primary uppercase text-base">
            Editar Evento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className={labelClass}>Nome do Evento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Nome do Bebê</label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Ex: Maria, João..."
              className={inputClass + " placeholder:text-stone-300"}
            />
          </div>

          <div>
            <label className={labelClass}>Data do Evento</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Endereço</label>
            <input
              type="text"
              value={eventAddress}
              onChange={(e) => setEventAddress(e.target.value)}
              placeholder="Endereço do evento..."
              className={inputClass + " placeholder:text-stone-300"}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-none text-[9px] tracking-wider uppercase"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-none text-[9px] tracking-wider uppercase"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
