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
        onEnter={() => setShowSplash(false)}
      />
    );
  }

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${props.genderFromBg} ${props.genderToBg} text-foreground flex flex-col items-center px-4 sm:px-8 py-8 sm:py-16 tracking-wide relative overflow-x-hidden`}
      style={{ fontFamily: 'var(--font-outfit)', fontSize: '15px' }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 ${props.isBoy ? "bg-sky-200/40" : props.isGirl ? "bg-rose-200/40" : "bg-primary/5"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 ${props.isBoy ? "bg-sky-200/40" : props.isGirl ? "bg-rose-200/40" : "bg-primary/5"}`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-[0.03] bg-black" />
      </div>

      <div className="w-full max-w-6xl relative z-10 space-y-10 sm:space-y-16">
        <header className="text-center space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-4">
            <span className={`block h-px w-12 sm:w-20 ${props.genderBorder} border-t`} />
            <span className="text-[9px] tracking-[0.4em] uppercase opacity-40">Convidado Especial</span>
            <span className={`block h-px w-12 sm:w-20 ${props.genderBorder} border-t`} />
          </div>
          <h1
            className={`text-4xl sm:text-5xl md:text-7xl font-serif tracking-[0.15em] uppercase leading-tight ${props.genderColor}`}
            style={{ fontFamily: props.inviteFontFamily, fontSize: `${props.inviteFontSize * 2}px` }}
          >
            {props.babyName}
          </h1>
          <p className="text-xs sm:text-sm max-w-lg mx-auto opacity-50 leading-relaxed px-4">
            Com imensa alegria, convidamos você para celebrar este momento tão especial em nossas vidas.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            {props.settings.showInvitationImage && (
              <div className="relative group">
                <div className={`absolute -inset-3 sm:-inset-4 border ${props.genderBorder} opacity-60 scale-[0.97] group-hover:scale-100 transition-all duration-700 pointer-events-none`} />
                <div className="absolute -inset-1 sm:-inset-1.5 bg-white/80 backdrop-blur-sm scale-[1.02] group-hover:scale-100 transition-all duration-700 pointer-events-none" />
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto shadow-2xl border-[12px] sm:border-[16px] border-white bg-white overflow-hidden">
                  <Image src={props.settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain transition-all duration-1000 group-hover:scale-105" priority />
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <span className="block h-px flex-1 max-w-20 opacity-20 bg-current" />
              <span className="text-lg opacity-30">✦</span>
              <span className="block h-px flex-1 max-w-20 opacity-20 bg-current" />
            </div>

            {(props.settings.eventDate || props.settings.eventAddress) && (
              <div className={`${props.genderBgLight} backdrop-blur-sm border ${props.genderBorder} p-8 sm:p-10 space-y-8`}>
                <div className="space-y-1 text-center">
                  <h2 className="text-xl sm:text-2xl font-serif tracking-[0.2em] uppercase" style={{ fontFamily: props.inviteFontFamily }}>
                    <span className={props.genderColor}>Detalhes</span>
                  </h2>
                  <p className="text-[9px] opacity-30 tracking-[0.4em] uppercase">INFORMAÇÕES DO EVENTO</p>
                </div>
                <div className="space-y-6">
                  {props.settings.eventDate && (
                    <div className="flex items-start gap-5">
                      <div className={`w-10 h-10 rounded-full ${props.isBoy ? "bg-sky-100" : props.isGirl ? "bg-rose-100" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                        <Calendar className={`h-4 w-4 ${props.genderColor}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest mb-1 uppercase opacity-60">Quando</p>
                        <p className="text-sm leading-relaxed opacity-70">{props.eventDateStr}</p>
                      </div>
                    </div>
                  )}
                  {props.settings.eventAddress && (
                    <div className="flex items-start gap-5">
                      <div className={`w-10 h-10 rounded-full ${props.isBoy ? "bg-sky-100" : props.isGirl ? "bg-rose-100" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                        <MapPin className={`h-4 w-4 ${props.genderColor}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest mb-1 uppercase opacity-60">Onde</p>
                        <p className="text-sm leading-relaxed opacity-70 mb-4">{props.settings.eventAddress}</p>
                        {props.settings.eventMapsUrl && (
                          <a href={props.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-stone-900 text-white text-[10px] tracking-widest px-5 py-2.5 hover:bg-stone-800 transition-all uppercase">
                            VER NO MAPA
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="animate-in fade-in slide-in-from-right duration-1000 delay-300 w-full max-w-md mx-auto lg:sticky lg:top-12">
            <div className={`${props.genderBgLight} backdrop-blur-sm border ${props.genderBorder} p-6 sm:p-8`}>
              <div className="text-center space-y-2 mb-6">
                <p className="text-[10px] tracking-[0.3em] uppercase opacity-40">Sua Confirmação</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="block h-px w-8 opacity-20 bg-current" />
                  <span className="text-sm opacity-30">✦</span>
                  <span className="block h-px w-8 opacity-20 bg-current" />
                </div>
              </div>
              <RSVPForm
                guest={props.guestData}
                gifts={props.giftList}
                fontFamily={props.inviteFontFamily}
                fontSize={props.inviteFontSize}
                eventId={props.eventId}
              />
            </div>
          </div>
        </div>

        <footer className="text-center space-y-4 pb-4">
          <div className="flex items-center justify-center gap-3">
            <span className="block h-px w-8 opacity-10 bg-current" />
            <span className="text-[8px] tracking-[0.3em] uppercase opacity-20">✦ ✦ ✦</span>
            <span className="block h-px w-8 opacity-10 bg-current" />
          </div>
          <p className="text-[9px] tracking-[0.6em] uppercase opacity-20 font-serif" style={{ fontFamily: props.inviteFontFamily }}>
            CHÁ DE BEBÊ • {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
