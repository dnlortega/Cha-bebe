"use client";
import { useEffect, useState } from "react";

import { getUserEvents, createDefaultEventForUser } from "@/app/eventActions";
import { Checkbox } from "@/components/ui/checkbox";
import { setActiveEventCookie } from "@/app/eventCookieActions";
import { useAdminAuth } from "@/app/admin/layout";
import { EventsOnboarding } from "@/components/admin/EventsOnboarding";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, LogIn, Info } from "lucide-react";
import { toast } from "sonner";

export default function EventsPage() {
  const { currentUser } = useAdminAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [shareable, setShareable] = useState(false);

  const isNewUser = !loading && events.length === 0;

  useEffect(() => {
    if (currentUser) {
      loadEvents();
    }
  }, [currentUser]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const userEvents = await getUserEvents(currentUser!);
      setEvents(userEvents);
    } catch (e) {
      toast.error("Erro ao carregar eventos.");
    }
    setLoading(false);
  };

  const handleSelectEvent = async (eventId: string) => {
    await setActiveEventCookie(eventId);
    window.location.href = "/admin";
  };

  const handleCreateEvent = async () => {
    setCreating(true);
    try {
      const newEvent = await createDefaultEventForUser(currentUser!, shareable);
      toast.success("Novo evento criado! Você já pode usar o painel.");
      await handleSelectEvent(newEvent.id);
    } catch (e) {
      toast.error("Erro ao criar evento.");
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header
        className={`border-b border-primary/10 pb-6 mb-8 ${
          isNewUser ? "space-y-4" : "flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end"
        }`}
      >
        <div>
          <h1 className="text-3xl font-serif text-primary tracking-[0.2em] uppercase">
            {isNewUser ? "Configure seu evento" : "Seus Eventos"}
          </h1>
          <p className="text-[10px] opacity-50 tracking-[0.4em] uppercase mt-2">
            {isNewUser
              ? "Siga o guia abaixo para começar"
              : "Escolha o evento que deseja gerenciar"}
          </p>
        </div>

        {!isNewUser && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shareable"
                checked={shareable}
                onCheckedChange={(checked) => setShareable(checked as boolean)}
              />
              <label htmlFor="shareable" className="text-sm text-primary">
                Permitir compartilhamento
              </label>
            </div>
            <Button
              onClick={handleCreateEvent}
              disabled={creating}
              className="h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest text-[10px] uppercase shadow-lg"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CalendarPlus className="h-4 w-4 mr-2" />
              )}
              NOVO EVENTO
            </Button>
          </div>
        )}
      </header>

      {isNewUser ? (
        <>
          <div className="flex items-center gap-3 px-1">
            <Checkbox
              id="shareable-onboarding"
              checked={shareable}
              onCheckedChange={(checked) => setShareable(checked as boolean)}
            />
            <label
              htmlFor="shareable-onboarding"
              className="text-sm text-stone-600 cursor-pointer"
            >
              Permitir que outros e-mails colaborem neste evento (opcional)
            </label>
          </div>
          <EventsOnboarding
            creating={creating}
            shareable={shareable}
            onCreate={handleCreateEvent}
          />
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-primary/10 bg-primary/[0.03] shadow-none md:col-span-2 lg:col-span-3">
            <CardContent className="p-4 flex gap-3 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 leading-relaxed">
                Clique em um evento para abrir o painel. Para trocar de evento depois, volte
                aqui pelo menu do seu perfil → <span className="font-medium">Trocar Evento</span>.
              </p>
            </CardContent>
          </Card>
          {events.map((event) => (
            <Card
              key={event.id}
              className="border-none shadow-xl bg-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer overflow-hidden group"
              onClick={() => handleSelectEvent(event.id)}
            >
              <div className="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-serif tracking-widest text-primary uppercase line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-[9px] text-stone-400 tracking-[0.2em] uppercase">
                    Slug: /{event.slug}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <Badge className="bg-stone-100 text-stone-600 rounded-none text-[8px] tracking-widest uppercase border-none">
                    {event.ownerEmail === currentUser ? "Proprietário" : "Convidado"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-none hover:bg-primary/5 text-primary"
                  >
                    <LogIn className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    >
      {children}
    </span>
  );
}
