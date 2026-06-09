"use client";

import { useState } from "react";
import Image from "next/image";
import RSVPForm from "@/components/RSVPForm";
import SplashScreen from "@/components/SplashScreen";
import { MapPin, Calendar } from "lucide-react";

interface GuestPageClientProps {
  babyName: string;
  rawBabyName: string;
  inviteFontFamily: string;
  inviteFontSize: number;
  eventDateStr: string | null;
  isBoy: boolean;
  isGirl: boolean;
  genderColor: string;
  genderBorder: string;
  genderBgLight: string;
  genderFromBg: string;
  genderToBg: string;
  settings: any;
  giftList: any[];
  guestData: any;
  eventId: string;
}

export default function GuestPageClient(props: GuestPageClientProps) {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SplashScreen
        babyName={props.rawBabyName}
        genderColor={props.genderColor}
        fontFamily={props.inviteFontFamily}
        guestName={props.guestData.nome}
        isBoy={props.isBoy}
        isGirl={props.isGirl}
        onEnter={() => setShowSplash(false)}
      />
    );
  }

  const orbBg    = props.isBoy ? "bg-sky-200/30"   : props.isGirl ? "bg-rose-200/30"   : "bg-primary/5";
  const starText = props.isBoy ? "text-sky-300"     : props.isGirl ? "text-rose-300"    : "text-primary/30";
  const iconBg   = props.isBoy ? "bg-sky-100"       : props.isGirl ? "bg-rose-100"      : "bg-primary/10";

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${props.genderFromBg} via-white ${props.genderToBg} text-foreground flex flex-col items-center tracking-wide relative overflow-x-hidden`}
      style={{ fontFamily: "var(--font-outfit)", fontSize: "15px" }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -top-56 -right-56 w-[700px] h-[700px] rounded-full blur-[140px] opacity-50 ${orbBg}`} />
        <div className={`absolute -bottom-56 -left-56 w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 ${orbBg}`} />
      </div>

      <div className="w-full max-w-xl mx-auto relative z-10 px-5 sm:px-8">

        {/* ── HERO ── */}
        <header className="text-center pt-16 sm:pt-20 pb-14 space-y-8 animate-in fade-in slide-in-from-top duration-1000">
          {/* Top rule */}
          <div className="flex items-center justify-center gap-4">
            <span className={`block h-px flex-1 max-w-16 border-t ${props.genderBorder} opacity-50`} />
            <span className={`text-[9px] tracking-[0.5em] uppercase opacity-25 font-light`}>Convidado Especial</span>
            <span className={`block h-px flex-1 max-w-16 border-t ${props.genderBorder} opacity-50`} />
          </div>

          {/* Guest greeting */}
          <div className="space-y-1">
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 font-light">Para</p>
            <p
              className={`text-xl sm:text-2xl font-serif tracking-[0.1em] ${props.genderColor} opacity-80`}
              style={{ fontFamily: props.inviteFontFamily }}
            >
              {props.guestData.nome}
            </p>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-3">
            <span className={`block h-px w-8 border-t ${props.genderBorder} opacity-25`} />
            <span className={`text-base ${starText}`}>✦</span>
            <span className={`block h-px w-8 border-t ${props.genderBorder} opacity-25`} />
          </div>

          {/* Baby name */}
          <h1
            className={`font-serif tracking-[0.12em] uppercase leading-tight ${props.genderColor}`}
            style={{
              fontFamily: props.inviteFontFamily,
              fontSize: `clamp(2.6rem, 10vw, ${props.inviteFontSize * 2.8}px)`,
            }}
          >
            {props.babyName}
          </h1>

          {/* Stars */}
          <div className="flex items-center justify-center gap-3">
            <span className={`block h-px w-8 border-t ${props.genderBorder} opacity-25`} />
            <span className={`text-base ${starText}`}>✦</span>
            <span className={`block h-px w-8 border-t ${props.genderBorder} opacity-25`} />
          </div>

          <p className="text-[11px] sm:text-xs max-w-xs mx-auto opacity-40 leading-loose tracking-wider font-light">
            Com amor e alegria, convidamos você para celebrar este momento mágico em nossas vidas.
          </p>
        </header>

        {/* ── INVITATION IMAGE ── */}
        {props.settings.showInvitationImage && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-16">
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-xs">
              {/* Outer decorative frame */}
              <div className={`absolute -inset-5 border ${props.genderBorder} opacity-15`} />
              <div className={`absolute -inset-2.5 border ${props.genderBorder} opacity-25`} />
              {/* Photograph mat */}
              <div className="relative aspect-[3/4] w-full shadow-[0_30px_80px_-10px_rgba(0,0,0,0.18)] border-[16px] sm:border-[20px] border-white bg-white overflow-hidden group">
                <Image
                  src={props.settings.invitationUrl || "/convite.png"}
                  alt="CONVITE"
                  fill
                  className="object-contain transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </div>
              {/* Corner accents */}
              <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 border-l-2 border-t-2 ${props.genderBorder}`} />
              <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 border-r-2 border-t-2 ${props.genderBorder}`} />
              <span className={`absolute -bottom-1.5 -left-1.5 w-5 h-5 border-l-2 border-b-2 ${props.genderBorder}`} />
              <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 border-r-2 border-b-2 ${props.genderBorder}`} />
            </div>
          </section>
        )}

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-4 mb-14">
          <span className={`block h-px flex-1 border-t ${props.genderBorder} opacity-30`} />
          <span className={`text-sm ${starText} opacity-60`}>◆</span>
          <span className={`block h-px flex-1 border-t ${props.genderBorder} opacity-30`} />
        </div>

        {/* ── EVENT DETAILS ── */}
        {(props.settings.eventDate || props.settings.eventAddress) && (
          <section className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300 mb-16">
            <div className="text-center mb-10 space-y-1.5">
              <h2
                className={`text-2xl sm:text-3xl font-serif tracking-[0.2em] uppercase ${props.genderColor}`}
                style={{ fontFamily: props.inviteFontFamily }}
              >
                O Evento
              </h2>
              <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 font-light">Aguardamos sua presença</p>
            </div>

            <div className="space-y-4">
              {props.settings.eventDate && (
                <div className={`${props.genderBgLight} border ${props.genderBorder} p-6 sm:p-8 flex items-center gap-6`}>
                  <div className={`w-12 h-12 shrink-0 ${iconBg} flex items-center justify-center border ${props.genderBorder}`}>
                    <Calendar className={`h-5 w-5 ${props.genderColor} opacity-70`} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold tracking-[0.45em] uppercase opacity-35 mb-1.5">Quando</p>
                    <p className="text-sm sm:text-base leading-relaxed opacity-75 font-medium">{props.eventDateStr}</p>
                  </div>
                </div>
              )}

              {props.settings.eventAddress && (
                <div className={`${props.genderBgLight} border ${props.genderBorder} p-6 sm:p-8`}>
                  <div className="flex items-center gap-6 mb-5">
                    <div className={`w-12 h-12 shrink-0 ${iconBg} flex items-center justify-center border ${props.genderBorder}`}>
                      <MapPin className={`h-5 w-5 ${props.genderColor} opacity-70`} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.45em] uppercase opacity-35 mb-1.5">Onde</p>
                      <p className="text-sm sm:text-base leading-relaxed opacity-75 font-medium">{props.settings.eventAddress}</p>
                    </div>
                  </div>
                  {props.settings.eventMapsUrl && (
                    <a
                      href={props.settings.eventMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 w-full border border-current py-3 text-[9px] tracking-[0.4em] uppercase opacity-50 hover:opacity-80 transition-opacity"
                    >
                      <MapPin className="h-3 w-3" />
                      Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-4 mb-14">
          <span className={`block h-px flex-1 border-t ${props.genderBorder} opacity-30`} />
          <span className={`text-sm ${starText} opacity-60`}>◆</span>
          <span className={`block h-px flex-1 border-t ${props.genderBorder} opacity-30`} />
        </div>

        {/* ── RSVP ── */}
        <section className="animate-in fade-in slide-in-from-bottom duration-1000 delay-500 mb-20">
          <div className="text-center mb-10 space-y-1.5">
            <h2
              className={`text-2xl sm:text-3xl font-serif tracking-[0.2em] uppercase ${props.genderColor}`}
              style={{ fontFamily: props.inviteFontFamily }}
            >
              Confirmação
            </h2>
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 font-light">Sua presença é o maior presente</p>
          </div>

          <div className={`${props.genderBgLight} border ${props.genderBorder} p-6 sm:p-10`}>
            <RSVPForm
              guest={props.guestData}
              gifts={props.giftList}
              fontFamily={props.inviteFontFamily}
              fontSize={props.inviteFontSize}
              eventId={props.eventId}
            />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="text-center pb-14 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <span className={`block h-px w-10 border-t ${props.genderBorder} opacity-20`} />
            <span className={`text-[9px] tracking-[0.4em] uppercase opacity-15 ${starText}`}>✦ ✦ ✦</span>
            <span className={`block h-px w-10 border-t ${props.genderBorder} opacity-20`} />
          </div>
          <p
            className="text-[8px] tracking-[0.55em] uppercase opacity-15 font-serif"
            style={{ fontFamily: props.inviteFontFamily }}
          >
            CHÁ DE BEBÊ · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
