import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import RSVPForm from "@/components/RSVPForm";
import { getSettings } from "@/app/actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuestPage({ params }: PageProps) {
  const { slug } = await params;
  const settings = await getSettings();

  const guest = await prisma.guest.findUnique({
    where: { slug },
  });

  if (!guest) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-12 uppercase tracking-widest transition-colors duration-1000">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
        {/* Invitation Side */}
        <div className="relative group animate-in fade-in slide-in-from-left duration-1000 fill-mode-both hidden lg:block">
          <div className="absolute -inset-4 border border-primary opacity-20 scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
          <div className="relative aspect-[4/5] w-full shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border-[16px] border-white overflow-hidden bg-white">
            <Image
              src={settings.invitationUrl || "/convite.png"}
              alt="CONVITE"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Mobile Invitation (Smaller) */}
        <div className="lg:hidden w-full flex justify-center mb-8 animate-in fade-in slide-in-from-top duration-1000">
          <div className="relative aspect-[4/5] w-48 shadow-2xl border-8 border-white overflow-hidden bg-white">
             <Image
              src={settings.invitationUrl || "/convite.png"}
              alt="CONVITE"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Form Side */}
        <div className="animate-in fade-in slide-in-from-right duration-1000 delay-300 fill-mode-both w-full max-w-md mx-auto">
          <div className="text-foreground/80">
            <RSVPForm guest={{
              nome: guest.nome,
              slug: guest.slug,
              status_confirmacao: guest.status_confirmacao,
              tipo: guest.tipo,
              membros: guest.membros,
              membros_confirmados: guest.membros_confirmados
            }} />
          </div>
        </div>
      </div>
      
      {/* Subtle branding */}
      <footer className="mt-12 sm:mt-20 opacity-30 hover:opacity-100 transition-opacity duration-500 text-center">
        <p className="text-[8px] sm:text-[9px] tracking-[0.6em] font-serif uppercase text-primary">
          CHÁ DE BEBÊ • {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
