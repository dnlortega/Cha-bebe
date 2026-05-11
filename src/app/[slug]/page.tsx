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

  // Theme mapping with sophisticated palettes and explicit text colors
  const themeStyles: Record<string, string> = {
    GOLD: "bg-stone-50 text-stone-900 selection:bg-amber-200",
    BLUE: "bg-sky-50 text-sky-950 selection:bg-sky-200",
    PINK: "bg-rose-50 text-rose-950 selection:bg-rose-200",
    DARK: "bg-[#020617] text-slate-50 selection:bg-slate-700",
    SAGE: "bg-[#f1f3f0] text-[#2d3a2e] selection:bg-[#d4ddd3]",
    WHITE: "bg-white text-zinc-900 selection:bg-zinc-200",
    BT21: "bg-[#FFF7ED] text-[#431407] selection:bg-orange-200", // BT21 Pop Theme
  };

  const primaryColors: Record<string, string> = {
    GOLD: "text-primary border-primary",
    BLUE: "text-sky-700 border-sky-700",
    PINK: "text-rose-700 border-rose-700",
    DARK: "text-slate-200 border-slate-200",
    SAGE: "text-[#4a5d4b] border-[#4a5d4b]",
    WHITE: "text-black border-black",
    BT21: "text-[#F59E0B] border-[#F59E0B]", // Yellow/Orange for BT21
  };

  // Explicit label colors for the RSVP form to fix visibility issues
  const labelColors: Record<string, string> = {
    GOLD: "text-stone-600",
    BLUE: "text-sky-800",
    PINK: "text-rose-800",
    DARK: "text-slate-300",
    SAGE: "text-[#4a5d4b]",
    WHITE: "text-zinc-600",
    BT21: "text-[#7C2D12]",
  };

  const currentTheme = settings.theme || "GOLD";

  return (
    <main className={`min-h-screen ${themeStyles[currentTheme]} flex flex-col items-center justify-center p-4 sm:p-12 uppercase tracking-widest transition-all duration-1000`}>
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
        {/* Invitation Side */}
        <div className="relative group animate-in fade-in slide-in-from-left duration-1000 fill-mode-both hidden lg:block">
          <div className={`absolute -inset-4 border ${primaryColors[currentTheme]} opacity-20 scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none`} />
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
          <div className={labelColors[currentTheme]}>
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
        <p className={`text-[8px] sm:text-[9px] tracking-[0.6em] font-serif uppercase ${primaryColors[currentTheme]}`}>
          CHÁ DE BEBÊ • {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
