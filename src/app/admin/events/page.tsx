"use client";

import { useEffect, useMemo, useState } from "react";
import { getUserEvents, createDefaultEventForUser } from "@/app/eventActions";
import { setActiveEventCookie } from "@/app/eventCookieActions";
import { useAdminAuth } from "@/app/admin/layout";
import { EventsOnboarding } from "@/components/admin/EventsOnboarding";
import { EventsList, type EventListItem } from "@/components/admin/EventsList";
import { ShareEventDialog } from "@/components/admin/ShareEventDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, Plus } from "lucide-react";
import { toast } from "sonner";

export default function EventsPage() {
  const { currentUser } = useAdminAuth();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isNewUser = !loading && events.length === 0;

  const { ownedEvents, sharedEvents } = useMemo(() => {
    const user = currentUser?.toLowerCase() ?? "";
    const owned: EventListItem[] = [];
    const shared: EventListItem[] = [];
    for (const ev of events) {
      if (ev.ownerEmail.toLowerCase() === user) owned.push(ev);
      else shared.push(ev);
    }
    return { ownedEvents: owned, sharedEvents: shared };
  }, [events, currentUser]);

  useEffect(() => {
    if (currentUser) loadEvents();
  }, [currentUser]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const userEvents = await getUserEvents(currentUser!);
      setEvents(userEvents as EventListItem[]);
    } catch {
      toast.error("Erro ao carregar eventos.");
    }
    setLoading(false);
  };

  const handleSelectEvent = async (eventId: string) => {
    await setActiveEventCookie(eventId);
    window.location.href = "/admin";
  };

  const handleCreateEvent = async () => {
    if (!currentUser) return;
    setCreating(true);
    try {
      const newEvent = await createDefaultEventForUser(currentUser, shareEmails);
      toast.success(
        shareEmails.length > 0
          ? `Evento criado e compartilhado com ${shareEmails.length} usuário(s).`
          : "Evento criado com sucesso!"
      );
      await handleSelectEvent(newEvent.id);
    } catch {
      toast.error("Erro ao criar evento.");
    }
    setCreating(false);
  };

  const handleSharesUpdated = (
    eventId: string,
    shares: { id: string; email: string }[]
  ) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              sharedWith: shares.map((s) => ({
                id: s.id,
                email: s.email,
                role: "EDITOR",
              })),
            }
          : ev
      )
    );
  };

  const addShareEmailForCreate = (email: string) => {
    const normalized = email.toLowerCase();
    if (shareEmails.includes(normalized)) return;
    setShareEmails((prev) => [...prev, normalized]);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="border-b border-primary/10 pb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className="text-3xl font-serif text-primary tracking-[0.2em] uppercase">
            {isNewUser ? "Meus eventos" : "Eventos"}
          </h1>
          <p className="text-[10px] opacity-50 tracking-[0.4em] uppercase mt-2">
            {isNewUser
              ? "Crie seu primeiro chá de bebê para começar"
              : `${events.length} evento(s) vinculado(s) à sua conta`}
          </p>
        </div>
        {!isNewUser && (
          <Button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            variant="outline"
            className="rounded-none h-11 text-[10px] tracking-widest uppercase"
          >
            <Plus className={`h-4 w-4 mr-2 transition-transform ${showCreateForm ? "rotate-45" : ""}`} />
            {showCreateForm ? "Fechar" : "Novo evento"}
          </Button>
        )}
      </header>

      {isNewUser ? (
        <div className="space-y-8">
          <Card className="border border-primary/15 bg-stone-50/30">
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Você ainda não tem eventos. Crie o primeiro e, se quiser, compartilhe com
                alguém que já tenha entrado no painel com Google.
              </p>
              {shareEmails.length > 0 && (
                <p className="text-[11px] text-primary">
                  Compartilhar ao criar: {shareEmails.join(", ")}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <ShareEventDialog
                  ownerEmail={currentUser!}
                  onPickForCreate={addShareEmailForCreate}
                  alreadySharedEmails={shareEmails}
                />
                <Button
                  onClick={handleCreateEvent}
                  disabled={creating}
                  className="rounded-none h-9 text-[10px] tracking-widest uppercase"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CalendarPlus className="h-4 w-4 mr-2" />
                  )}
                  Criar meu primeiro evento
                </Button>
              </div>
            </CardContent>
          </Card>
          <EventsOnboarding
            creating={creating}
            shareCount={shareEmails.length}
            onCreate={handleCreateEvent}
          />
        </div>
      ) : (
        <div className="space-y-10">
          {showCreateForm && (
            <Card className="border border-primary/20 shadow-sm animate-in fade-in duration-300">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-sm font-serif tracking-widest text-primary uppercase">
                  Novo evento
                </h2>
                {shareEmails.length > 0 && (
                  <p className="text-[11px] text-stone-500">
                    Colaboradores: {shareEmails.join(", ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <ShareEventDialog
                    ownerEmail={currentUser!}
                    onPickForCreate={addShareEmailForCreate}
                    alreadySharedEmails={shareEmails}
                  />
                  <Button
                    onClick={handleCreateEvent}
                    disabled={creating}
                    className="rounded-none h-9 text-[10px] tracking-widest uppercase"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CalendarPlus className="h-4 w-4 mr-2" />
                    )}
                    Criar evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <EventsList
            title="Eventos que você criou"
            description="Compartilhar inclui Status, Convites, Histórico, Cadastrar, Lista Final e Presentes deste evento."
            events={ownedEvents}
            currentUser={currentUser!}
            variant="owned"
            onEnter={handleSelectEvent}
            onSharesUpdated={handleSharesUpdated}
          />

          <EventsList
            title="Compartilhados com você"
            description="Ao entrar, você gerencia Status, Convites, Histórico, Cadastrar, Lista Final e Presentes só deste evento."
            events={sharedEvents}
            currentUser={currentUser!}
            variant="shared"
            onEnter={handleSelectEvent}
            onSharesUpdated={handleSharesUpdated}
          />

          {ownedEvents.length === 0 && sharedEvents.length > 0 && (
            <p className="text-xs text-stone-500 text-center py-4">
              Você só participa como convidado. Para criar um evento próprio, use «Novo
              evento» acima.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
