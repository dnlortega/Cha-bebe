"use client";
import { useEffect, useState } from "react";

import { getUserEvents, createDefaultEventForUser } from "@/app/eventActions";
import { setActiveEventCookie } from "@/app/eventCookieActions";
import { useAdminAuth } from "@/app/admin/layout";
import { EventsOnboarding } from "@/components/admin/EventsOnboarding";
import { EventShareEditor } from "@/components/admin/EventShareEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, LogIn, Info } from "lucide-react";
import { toast } from "sonner";

type EventWithShares = {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  sharedWith?: { id: string; email: string; role: string }[];
};

export default function EventsPage() {
  const { currentUser } = useAdminAuth();
  const [events, setEvents] = useState<EventWithShares[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [shareEmails, setShareEmails] = useState<string[]>([]);

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
      setEvents(userEvents as EventWithShares[]);
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
    if (!currentUser) return;
    setCreating(true);
    try {
      const newEvent = await createDefaultEventForUser(currentUser, shareEmails);
      const shareMsg =
        shareEmails.length > 0
          ? ` Compartilhado com ${shareEmails.length} e-mail(s).`
          : "";
      toast.success(`Novo evento criado!${shareMsg}`);
      await handleSelectEvent(newEvent.id);
    } catch (e) {
      toast.error("Erro ao criar evento.");
    }
    setCreating(false);
  };

  const updateEventShares = (eventId: string, shares: { id?: string; email: string }[]) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              sharedWith: shares.map((s) => ({
                id: s.id || s.email,
                email: s.email,
                role: "EDITOR",
              })),
            }
          : ev
      )
    );
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
          <Button
            onClick={handleCreateEvent}
            disabled={creating}
            className="h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest text-[10px] uppercase shadow-lg shrink-0"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CalendarPlus className="h-4 w-4 mr-2" />
            )}
            NOVO EVENTO
          </Button>
        )}
      </header>

      {isNewUser ? (
        <>
          <EventShareEditor
            mode="create"
            ownerEmail={currentUser!}
            emails={shareEmails}
            onEmailsChange={setShareEmails}
          />
          <EventsOnboarding
            creating={creating}
            shareCount={shareEmails.length}
            onCreate={handleCreateEvent}
          />
        </>
      ) : (
        <div className="space-y-6">
          <Card className="border border-primary/20 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-serif tracking-widest text-primary uppercase">
                Criar outro evento
              </h2>
              <EventShareEditor
                mode="create"
                ownerEmail={currentUser!}
                emails={shareEmails}
                onEmailsChange={setShareEmails}
                compact
              />
              <Button
                onClick={handleCreateEvent}
                disabled={creating}
                variant="outline"
                className="rounded-none text-[10px] tracking-widest uppercase"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CalendarPlus className="h-4 w-4 mr-2" />
                )}
                Criar com estes compartilhamentos
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 bg-primary/[0.03] shadow-none">
            <CardContent className="p-4 flex gap-3 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 leading-relaxed">
                Clique em <span className="font-medium">Entrar</span> para abrir o painel. Em cada
                evento seu, use a seção de compartilhamento para adicionar ou remover e-mails de
                colaboradores.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => {
              const isOwner =
                event.ownerEmail.toLowerCase() === currentUser?.toLowerCase();
              return (
                <Card
                  key={event.id}
                  className="border-none shadow-xl bg-white overflow-hidden"
                >
                  <div className="h-2 w-full bg-primary/20" />
                  <CardContent className="p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2 min-w-0">
                        <h3 className="text-lg font-serif tracking-widest text-primary uppercase line-clamp-1">
                          {event.name}
                        </h3>
                        <p className="text-[9px] text-stone-400 tracking-[0.2em] uppercase">
                          Slug: /{event.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge className="bg-stone-100 text-stone-600 rounded-none text-[8px] tracking-widest uppercase border-none">
                          {isOwner ? "Proprietário" : "Editor convidado"}
                        </Badge>
                        <Button
                          type="button"
                          onClick={() => handleSelectEvent(event.id)}
                          className="rounded-none h-9 text-[10px] tracking-widest uppercase"
                        >
                          <LogIn className="h-4 w-4 mr-1.5" />
                          Entrar
                        </Button>
                      </div>
                    </div>

                    {isOwner && (
                      <EventShareEditor
                        mode="manage"
                        eventId={event.id}
                        ownerEmail={currentUser!}
                        shares={(event.sharedWith || []).map((s) => ({
                          id: s.id,
                          email: s.email,
                        }))}
                        onSharesChange={(shares) =>
                          updateEventShares(event.id, shares)
                        }
                      />
                    )}

                    {!isOwner && (event.sharedWith?.length ?? 0) > 0 && (
                      <p className="text-[11px] text-stone-500">
                        Você tem acesso como colaborador neste evento.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
