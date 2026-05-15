import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import RSVPForm from "@/components/RSVPForm";
import { getSettings, getGifts } from "@/app/actions";
import { MapPin, Calendar, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuestPage({ params }: PageProps) {
  const { slug } = await params;
  const settings = await getSettings();
  const gifts = await getGifts();

  const guest = await prisma.guest.findUnique({
    where: { slug },
  });

  if (!guest) notFound();

  const FONT_VAR_MAP: Record<string, string> = {
    "Playfair Display": "var(--font-playfair)",
    "Cormorant Garamond": "var(--font-cormorant)",
    "Dancing Script": "var(--font-dancing)",
    "Great Vibes": "var(--font-great-vibes)",
    "Lora": "var(--font-lora)",
    "Cinzel": "var(--font-cinzel)",
  };

  const inviteFontFamily = FONT_VAR_MAP[settings.inviteFont || "Playfair Display"] || "var(--font-playfair)";
  const inviteFontSize = settings.inviteFontSize || 18;

  const eventDateStr = settings.eventDate ? new Date(settings.eventDate).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-12 uppercase tracking-widest transition-colors duration-1000 relative overflow-x-hidden" style={{ fontFamily: inviteFontFamily, fontSize: `${inviteFontSize}px` }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start relative z-10 py-10">
        {/* Info Side */}
        <div className="space-y-12 animate-in fade-in slide-in-from-left duration-1000">
           {/* Invitation Image */}
           <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 border border-primary/10 scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
              <div className="relative aspect-[4/5] w-full shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] border-[16px] border-white bg-white overflow-hidden">
                <Image src={settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain transition-all duration-1000 group-hover:scale-105" priority />
              </div>
           </div>

           {/* Mobile Invitation */}
           <div className="lg:hidden flex justify-center">
              <div className="relative aspect-[4/5] w-48 shadow-2xl border-8 border-white bg-white overflow-hidden">
                <Image src={settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain" priority />
              </div>
           </div>

           {/* Event Details */}
           {(settings.eventDate || settings.eventAddress) && (
              <div className="bg-white/50 backdrop-blur-sm border border-primary/5 p-8 sm:p-12 space-y-10 shadow-xl">
                 <div className="space-y-1"><h2 className="text-2xl font-serif text-primary tracking-[0.2em]">Detalhes</h2><p className="text-[10px] opacity-30 tracking-[0.4em]">INFORMAÇÕES DO EVENTO</p></div>
                 <div className="space-y-8">
                    {settings.eventDate && (
                       <div className="flex items-start gap-4"><Calendar className="h-5 w-5 text-primary opacity-40 shrink-0" /><div><p className="text-[11px] font-bold tracking-widest text-primary mb-1 uppercase">Quando</p><p className="text-[10px] opacity-60 leading-relaxed uppercase">{eventDateStr}</p></div></div>
                    )}
                    {settings.eventAddress && (
                       <div className="flex items-start gap-4"><MapPin className="h-5 w-5 text-primary opacity-40 shrink-0" /><div><p className="text-[11px] font-bold tracking-widest text-primary mb-1 uppercase">Onde</p><p className="text-[10px] opacity-60 leading-relaxed uppercase mb-4">{settings.eventAddress}</p>
                       {settings.eventMapsUrl && (
                          <a href={settings.eventMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-stone-900 text-white text-[9px] px-4 py-2 hover:bg-stone-800 transition-all tracking-widest">VER NO MAPA</a>
                       )}
                       </div></div>
                    )}
                 </div>
              </div>
           )}
        </div>

        {/* Form Side */}
        <div className="animate-in fade-in slide-in-from-right duration-1000 delay-300 w-full max-w-md mx-auto sticky top-12">
          <RSVPForm 
            guest={{
              nome: guest.nome, slug: guest.slug, status_confirmacao: guest.status_confirmacao, tipo: guest.tipo, membros: guest.membros,
              membros_confirmados: guest.membros_confirmados, fralda_tamanho: guest.fralda_tamanho, kit_churrasco: guest.kit_churrasco
            }}
            gifts={gifts}
            fontFamily={inviteFontFamily}
            fontSize={inviteFontSize}
          />
        </div>
      </div>

      <footer className="mt-12 sm:mt-20 opacity-20 text-center relative z-10"><p className="text-[9px] tracking-[0.6em] font-serif uppercase text-primary">CHÁ DE BEBÊ • {new Date().getFullYear()}</p></footer>
    </main>
  );
}
