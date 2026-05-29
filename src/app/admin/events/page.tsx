"use client";

import { useEffect, useState } from "react";
import { getUserEvents, createDefaultEventForUser } from "@/app/eventActions";
import { setActiveEventCookie } from "@/app/eventCookieActions";
import { useAdminAuth } from "@/app/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function EventsPage() {
  const { currentUser } = useAdminAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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
      const newEvent = await createDefaultEventForUser(currentUser!);
      toast.success("Novo evento criado!");
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
      <header className="border-b border-primary/10 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-primary tracking-[0.2em] uppercase">Seus Eventos</h1>
          <p className="text-[10px] opacity-50 tracking-[0.4em] uppercase mt-2">Escolha o evento que deseja gerenciar</p>
        </div>
        <Button onClick={handleCreateEvent} disabled={creating} className="h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest text-[10px] uppercase shadow-lg">
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarPlus className="h-4 w-4 mr-2" />}
          NOVO EVENTO
        </Button>
      </header>

      {events.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-transparent shadow-none">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CalendarPlus className="h-8 w-8 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif tracking-widest text-primary uppercase">Nenhum Evento Encontrado</h3>
              <p className="text-xs text-stone-500 max-w-md">Você ainda não possui eventos. Crie um novo evento para começar a gerenciar sua lista de convidados e presentes.</p>
            </div>
            <Button onClick={handleCreateEvent} disabled={creating} className="mt-4 rounded-none h-12 px-8">
              {creating ? "CRIANDO..." : "CRIAR MEU PRIMEIRO EVENTO"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Card key={event.id} className="border-none shadow-xl bg-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer overflow-hidden group" onClick={() => handleSelectEvent(event.id)}>
              <div className="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-serif tracking-widest text-primary uppercase line-clamp-1">{event.name}</h3>
                  <p className="text-[9px] text-stone-400 tracking-[0.2em] uppercase">Slug: /{event.slug}</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <Badge className="bg-stone-100 text-stone-600 rounded-none text-[8px] tracking-widest uppercase border-none">
                    {event.ownerEmail === currentUser ? "Proprietário" : "Convidado"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-primary/5 text-primary">
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

// Dummy badge since I don't import it at top
function Badge({ children, className }: any) {
  return <span className={`inline-flex items-center px-2 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>;
}
