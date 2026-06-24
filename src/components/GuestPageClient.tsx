"use client";

import { useState } from "react";
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

// ─── Shared wrapper: single-column, edge-safe ───────────────────────
const WRAP = "w-full max-w-xl mx-auto relative z-10 px-4 sm:px-8";

// ─── Safe-area bottom ───────────────────────────────────────────────
const SAFE_PB: React.CSSProperties = {
  paddingBottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
};

// ─── Seleciona imagem do convite pelo tamanho de fralda ─────────────
function getInviteImage(settings: any, fralda_tamanho?: string | null): string {
  let map: Record<string, string> = {};
  try {
    if (settings.inviteImagesBySizes) map = JSON.parse(settings.inviteImagesBySizes);
  } catch {}

  if (fralda_tamanho && map[fralda_tamanho]) return map[fralda_tamanho];
  return "";
}

// ─────────────────────────────────────────────
// DESIGN 1 — EDITORIAL
// ─────────────────────────────────────────────
function DesignEditorial(p: GuestPageClientProps) {
  const orb    = p.isBoy ? "bg-sky-200/30"  : p.isGirl ? "bg-rose-200/30"  : "bg-primary/5";
  const star   = p.isBoy ? "text-sky-300"   : p.isGirl ? "text-rose-300"   : "text-primary/30";
  const iconBg = p.isBoy ? "bg-sky-100"     : p.isGirl ? "bg-rose-100"     : "bg-primary/10";

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${p.genderFromBg} via-white ${p.genderToBg} flex flex-col items-center relative overflow-x-hidden`}
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50 ${orb}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40 ${orb}`} />
      </div>

      <div className={WRAP}>
        {/* Hero */}
        {p.settings.showInviteHeader !== false && (
        <header className="text-center pt-14 sm:pt-20 pb-12 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-3">
            <span className={`block h-px flex-1 max-w-[4rem] border-t ${p.genderBorder} opacity-40`} />
            <span className="text-[8px] tracking-[0.5em] uppercase opacity-25">Convidado Especial</span>
            <span className={`block h-px flex-1 max-w-[4rem] border-t ${p.genderBorder} opacity-40`} />
          </div>

          <div>
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 mb-1">Para</p>
            <p
              className={`text-xl sm:text-2xl font-serif tracking-[0.1em] ${p.genderColor} opacity-80 break-words`}
              style={{ fontFamily: p.inviteFontFamily }}
            >
              {p.guestData.nome}
            </p>
          </div>

          <OrnamStar genderBorder={p.genderBorder} star={star} />

          <h1
            className={`font-serif tracking-[0.12em] uppercase leading-tight ${p.genderColor} break-words`}
            style={{ fontFamily: p.inviteFontFamily, fontSize: "clamp(2rem,9vw,3.5rem)" }}
          >
            {p.babyName}
          </h1>

          <OrnamStar genderBorder={p.genderBorder} star={star} />

          <p className="text-[11px] max-w-[18rem] mx-auto opacity-40 leading-loose tracking-wider font-light">
            Com amor e alegria, convidamos você para celebrar este momento mágico.
          </p>
        </header>
        )}

        {/* Image */}
        {p.settings.showInvitationImage && getInviteImage(p.settings, p.guestData.fralda_tamanho) && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-14 flex justify-center">
            <div className="relative w-full">
              <div className={`absolute -inset-5 border ${p.genderBorder} opacity-10 pointer-events-none`} />
              <div className={`absolute -inset-2.5 border ${p.genderBorder} opacity-20 pointer-events-none`} />
              <div className="shadow-[0_24px_60px_-8px_rgba(0,0,0,0.16)] border-[10px] sm:border-[14px] border-white bg-white overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getInviteImage(p.settings, p.guestData.fralda_tamanho)}
                  alt="Convite"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  className="transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <Corner pos="tl" genderBorder={p.genderBorder} />
              <Corner pos="tr" genderBorder={p.genderBorder} />
              <Corner pos="bl" genderBorder={p.genderBorder} />
              <Corner pos="br" genderBorder={p.genderBorder} />
            </div>
          </section>
        )}

        <Divider genderBorder={p.genderBorder} star={star} char="◆" />

        {/* Details */}
        {((p.settings.showEventDate !== false && p.settings.eventDate) || (p.settings.showEventAddress !== false && p.settings.eventAddress)) && (
          <section className="mb-14">
            <SectionTitle genderColor={p.genderColor} f={p.inviteFontFamily} title="O Evento" sub="Aguardamos sua presença" />
            <div className="space-y-3">
              {p.settings.showEventDate !== false && p.settings.eventDate && (
                <div className={`${p.genderBgLight} border ${p.genderBorder} p-5 flex items-center gap-4`}>
                  <div className={`w-11 h-11 shrink-0 ${iconBg} flex items-center justify-center border ${p.genderBorder}`}>
                    <Calendar className={`h-4 w-4 ${p.genderColor} opacity-70`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wider uppercase opacity-40 mb-1">Quando</p>
                    <p className="text-sm leading-relaxed opacity-75 font-medium break-words">{p.eventDateStr}</p>
                  </div>
                </div>
              )}
              {p.settings.showEventAddress !== false && p.settings.eventAddress && (
                <div className={`${p.genderBgLight} border ${p.genderBorder} p-5`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-11 h-11 shrink-0 ${iconBg} flex items-center justify-center border ${p.genderBorder} mt-0.5`}>
                      <MapPin className={`h-4 w-4 ${p.genderColor} opacity-70`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-wider uppercase opacity-40 mb-1">Onde</p>
                      <p className="text-sm leading-relaxed opacity-75 font-medium break-words">{p.settings.eventAddress}</p>
                    </div>
                  </div>
                  {p.settings.eventMapsUrl && <MapLink href={p.settings.eventMapsUrl} genderBorder={p.genderBorder} />}
                </div>
              )}
            </div>
          </section>
        )}

        <Divider genderBorder={p.genderBorder} star={star} char="◆" />

        {/* RSVP */}
        <section className="mb-4">
          <SectionTitle genderColor={p.genderColor} f={p.inviteFontFamily} title="Confirmação" sub="Sua presença é o maior presente" />
          <div className={`${p.genderBgLight} border ${p.genderBorder} p-5 sm:p-8`}>
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} showGiftSection={p.settings.showGiftSection !== false} showMessageSection={p.settings.showMessageSection !== false} />
          </div>
        </section>

        <footer className="text-center space-y-3" style={SAFE_PB}>
          <div className="flex items-center justify-center gap-4">
            <span className={`block h-px w-8 border-t ${p.genderBorder} opacity-20`} />
            <span className={`text-[9px] tracking-[0.4em] uppercase opacity-15 ${star}`}>✦ ✦ ✦</span>
            <span className={`block h-px w-8 border-t ${p.genderBorder} opacity-20`} />
          </div>
          <p className="text-[8px] tracking-[0.55em] uppercase opacity-15" style={{ fontFamily: p.inviteFontFamily }}>
            CHÁ DE BEBÊ · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 2 — FLORAL
// ─────────────────────────────────────────────
function DesignFloral(p: GuestPageClientProps) {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden" style={{ fontFamily: "var(--font-outfit)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-emerald-100" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 bg-rose-100" />
      </div>

      <div className={WRAP}>
        {/* Hero */}
        {p.settings.showInviteHeader !== false && (
        <header className="text-center pt-14 sm:pt-20 pb-12 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <p className="text-3xl leading-none">🌸</p>
          <div>
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 mb-1">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.1em] ${p.genderColor} opacity-80 break-words`} style={{ fontFamily: p.inviteFontFamily }}>
              {p.guestData.nome}
            </p>
          </div>
          <FloralDivider char="❀" />
          <h1 className={`font-serif tracking-[0.1em] uppercase leading-tight ${p.genderColor} break-words`} style={{ fontFamily: p.inviteFontFamily, fontSize: "clamp(2rem,9vw,3.5rem)" }}>
            {p.babyName}
          </h1>
          <FloralDivider char="❀" />
          <p className="text-[11px] max-w-[18rem] mx-auto opacity-40 leading-loose tracking-wider font-light">
            Com alegria florescente, convidamos você para este momento especial 🌿
          </p>
        </header>
        )}

        {/* Image */}
        {p.settings.showInvitationImage && getInviteImage(p.settings, p.guestData.fralda_tamanho) && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-14 flex justify-center">
            <div className="relative w-full">
              <div className="absolute -inset-3 rounded-[2rem] bg-emerald-50 opacity-60" />
              <div className="rounded-2xl overflow-hidden shadow-[0_16px_50px_-8px_rgba(0,0,0,0.12)] border-[10px] sm:border-[12px] border-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getInviteImage(p.settings, p.guestData.fralda_tamanho)} alt="Convite" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
              <span className="absolute -top-2.5 -left-2.5 text-lg opacity-60 pointer-events-none">🌸</span>
              <span className="absolute -top-2.5 -right-2.5 text-lg opacity-60 pointer-events-none">🌿</span>
              <span className="absolute -bottom-2.5 -left-2.5 text-lg opacity-60 pointer-events-none">🌷</span>
              <span className="absolute -bottom-2.5 -right-2.5 text-lg opacity-60 pointer-events-none">🌸</span>
            </div>
          </section>
        )}

        <FloralDivider char="🌸" extraClass="mb-12" />

        {/* Details */}
        {((p.settings.showEventDate !== false && p.settings.eventDate) || (p.settings.showEventAddress !== false && p.settings.eventAddress)) && (
          <section className="mb-14">
            <div className="text-center mb-8">
              <p className="text-2xl mb-1">🌿</p>
              <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>O Evento</h2>
              <p className="text-xs tracking-wider uppercase opacity-30 mt-1">Aguardamos sua presença</p>
            </div>
            <div className="space-y-3">
              {p.settings.showEventDate !== false && p.settings.eventDate && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 shrink-0 bg-white rounded-full flex items-center justify-center border border-emerald-200 shadow-sm">
                    <Calendar className={`h-4 w-4 ${p.genderColor} opacity-70`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wider uppercase opacity-40 mb-1">Quando</p>
                    <p className="text-sm leading-relaxed opacity-75 font-medium break-words">{p.eventDateStr}</p>
                  </div>
                </div>
              )}
              {p.settings.showEventAddress !== false && p.settings.eventAddress && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 shrink-0 bg-white rounded-full flex items-center justify-center border border-rose-200 shadow-sm mt-0.5">
                      <MapPin className={`h-4 w-4 ${p.genderColor} opacity-70`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-wider uppercase opacity-40 mb-1">Onde</p>
                      <p className="text-sm leading-relaxed opacity-75 font-medium break-words">{p.settings.eventAddress}</p>
                    </div>
                  </div>
                  {p.settings.eventMapsUrl && (
                    <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full border border-emerald-200 rounded-xl py-3 text-xs tracking-wider uppercase opacity-50 hover:opacity-80 active:opacity-90 transition-opacity bg-white/60">
                      <MapPin className="h-3 w-3 shrink-0" /> Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <FloralDivider char="🌷" extraClass="mb-12" />

        {/* RSVP */}
        <section className="mb-4">
          <div className="text-center mb-8">
            <p className="text-2xl mb-1">🌸</p>
            <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>Confirmação</h2>
            <p className="text-xs tracking-wider uppercase opacity-30 mt-1">Sua presença é o maior presente</p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-5 sm:p-8">
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} showGiftSection={p.settings.showGiftSection !== false} showMessageSection={p.settings.showMessageSection !== false} />
          </div>
        </section>

        <footer className="text-center space-y-2" style={SAFE_PB}>
          <p className="text-xl">🌸 🌿 🌷</p>
          <p className="text-[8px] tracking-[0.55em] uppercase opacity-20" style={{ fontFamily: p.inviteFontFamily }}>
            CHÁ DE BEBÊ · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 3 — LUXURY
// ─────────────────────────────────────────────
function DesignLuxury(p: GuestPageClientProps) {
  const gold = "#b8972a";
  const gb   = `1px solid ${gold}44`;
  const gbS  = `1.5px solid ${gold}80`;

  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-x-hidden" style={{ fontFamily: "var(--font-outfit)", background: "#faf8f3" }}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.012]" aria-hidden
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 40px,#b8972a 40px,#b8972a 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#b8972a 40px,#b8972a 41px)" }} />

      <div className={WRAP}>
        {/* Hero */}
        {p.settings.showInviteHeader !== false && (
        <header className="text-center pt-14 sm:pt-20 pb-12 space-y-7 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-3">
            <span className="block flex-1 h-px max-w-[5rem]" style={{ background: `linear-gradient(to right,transparent,${gold}55)` }} />
            <span className="text-[8px] tracking-[0.55em] uppercase opacity-35 font-light">Convite Exclusivo</span>
            <span className="block flex-1 h-px max-w-[5rem]" style={{ background: `linear-gradient(to left,transparent,${gold}55)` }} />
          </div>
          <div>
            <p className="text-[8px] tracking-[0.5em] uppercase opacity-30 mb-1">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.12em] ${p.genderColor} opacity-80 break-words`} style={{ fontFamily: p.inviteFontFamily }}>
              {p.guestData.nome}
            </p>
          </div>
          <GoldDivider gold={gold} char="◈" />
          <h1 className={`font-serif tracking-[0.18em] uppercase leading-tight ${p.genderColor} break-words`} style={{ fontFamily: p.inviteFontFamily, fontSize: "clamp(2rem,10vw,3.8rem)" }}>
            {p.babyName}
          </h1>
          <GoldDivider gold={gold} char="◈" />
          <p className="text-[11px] max-w-[18rem] mx-auto opacity-35 leading-loose tracking-widest font-light">
            Com honra e alegria, convidamos você para este momento singular.
          </p>
        </header>
        )}

        {/* Image — double mat */}
        {p.settings.showInvitationImage && getInviteImage(p.settings, p.guestData.fralda_tamanho) && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-14 flex justify-center">
            <div className="relative w-full">
              {/* outer decorative borders — hidden on very small screens to avoid overflow */}
              <div className="absolute -inset-4 hidden xs:block" style={{ border: gbS }} />
              <div className="absolute -inset-2" style={{ border: gb }} />
              <div className="overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.20)] border-[12px] sm:border-[16px]" style={{ borderColor: "#faf8f3", background: "#faf8f3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getInviteImage(p.settings, p.guestData.fralda_tamanho)} alt="Convite" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
              <span className="absolute -top-0.5 -left-0.5 w-5 h-5" style={{ borderLeft: `2px solid ${gold}`, borderTop: `2px solid ${gold}` }} />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5" style={{ borderRight: `2px solid ${gold}`, borderTop: `2px solid ${gold}` }} />
              <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5" style={{ borderLeft: `2px solid ${gold}`, borderBottom: `2px solid ${gold}` }} />
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5" style={{ borderRight: `2px solid ${gold}`, borderBottom: `2px solid ${gold}` }} />
            </div>
          </section>
        )}

        <GoldDivider gold={gold} char="✦" extraClass="mb-12" />

        {/* Details */}
        {((p.settings.showEventDate !== false && p.settings.eventDate) || (p.settings.showEventAddress !== false && p.settings.eventAddress)) && (
          <section className="mb-14">
            <div className="text-center mb-8 space-y-1.5">
              <h2 className={`text-2xl sm:text-3xl font-serif tracking-[0.25em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>O Evento</h2>
              <p className="text-[8px] tracking-[0.5em] uppercase opacity-25">Aguardamos sua presença</p>
            </div>
            <div className="space-y-3">
              {p.settings.showEventDate !== false && p.settings.eventDate && (
                <div className="p-5 sm:p-6 flex items-center gap-4" style={{ background: "#f0ebe0", border: gb }}>
                  <div className="w-11 h-11 shrink-0 flex items-center justify-center" style={{ border: gbS }}>
                    <Calendar className={`h-4 w-4 ${p.genderColor} opacity-60`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wider uppercase opacity-40 mb-1">Quando</p>
                    <p className="text-sm leading-relaxed opacity-75 font-medium break-words">{p.eventDateStr}</p>
                  </div>
                </div>
              )}
              {p.settings.showEventAddress !== false && p.settings.eventAddress && (
                <div className="p-5 sm:p-6" style={{ background: "#f0ebe0", border: gb }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 shrink-0 flex items-center justify-center mt-0.5" style={{ border: gbS }}>
                      <MapPin className={`h-4 w-4 ${p.genderColor} opacity-60`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold tracking-[0.5em] uppercase opacity-35 mb-1">Onde</p>
                      <p className="text-sm leading-relaxed opacity-75 font-medium break-words">{p.settings.eventAddress}</p>
                    </div>
                  </div>
                  {p.settings.eventMapsUrl && (
                    <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 text-[9px] tracking-[0.4em] uppercase opacity-50 hover:opacity-80 active:opacity-90 transition-opacity"
                      style={{ border: gbS }}>
                      <MapPin className="h-3 w-3 shrink-0" /> Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <GoldDivider gold={gold} char="◈" extraClass="mb-12" />

        {/* RSVP */}
        <section className="mb-4">
          <div className="text-center mb-8 space-y-1.5">
            <h2 className={`text-2xl sm:text-3xl font-serif tracking-[0.25em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>Confirmação</h2>
            <p className="text-[8px] tracking-[0.5em] uppercase opacity-25">Sua presença é o maior presente</p>
          </div>
          <div className="p-5 sm:p-8" style={{ background: "#f0ebe0", border: gb }}>
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} showGiftSection={p.settings.showGiftSection !== false} showMessageSection={p.settings.showMessageSection !== false} />
          </div>
        </section>

        <footer className="text-center space-y-2" style={SAFE_PB}>
          <GoldDivider gold={gold} char="✦ ✦ ✦" />
          <p className="text-[8px] tracking-[0.55em] uppercase opacity-20" style={{ fontFamily: p.inviteFontFamily }}>
            CHÁ DE BEBÊ · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 4 — MODERNO
// ─────────────────────────────────────────────
function DesignModern(p: GuestPageClientProps) {
  const accentBar = p.isBoy ? "bg-sky-500" : p.isGirl ? "bg-rose-500" : "bg-primary";
  const accentTxt = p.isBoy ? "text-sky-500" : p.isGirl ? "text-rose-500" : "text-primary";

  return (
    <main className="min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden" style={{ fontFamily: "var(--font-outfit)" }}>
      <div className={WRAP}>
        {/* Hero */}
        {p.settings.showInviteHeader !== false && (
        <header className="pt-14 sm:pt-20 pb-12 space-y-5 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-10 shrink-0 ${accentBar}`} />
            <p className="text-[22px] tracking-[0.5em] uppercase opacity-40 font-bold">Convite Pessoal</p>
          </div>
          <div>
            <p className="text-[22px] tracking-[0.4em] uppercase opacity-30 mb-2">Para</p>
            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${p.genderColor} break-words`}>{p.guestData.nome}</p>
          </div>
          <div className="w-full h-px bg-stone-900 opacity-[0.08]" />
          <h1
            className="font-black tracking-[-0.02em] uppercase leading-none text-stone-900 break-words"
            style={{ fontSize: "clamp(2rem,11vw,3.8rem)" }}
          >
            {p.babyName}
          </h1>
          <p className="text-sm max-w-[18rem] opacity-35 leading-relaxed font-light">
            Com alegria, convidamos você para celebrar este momento especial.
          </p>
        </header>
        )}

        {/* Image */}
        {p.settings.showInvitationImage && getInviteImage(p.settings, p.guestData.fralda_tamanho) && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-14">
            <div className="relative w-full">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentBar} rounded-r-sm`} />
              <div className="ml-5 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.07)] border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getInviteImage(p.settings, p.guestData.fralda_tamanho)} alt="Convite" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            </div>
          </section>
        )}

        <div className="w-full h-0.5 bg-stone-900 mb-12 opacity-[0.08]" />

        {/* Details */}
        {((p.settings.showEventDate !== false && p.settings.eventDate) || (p.settings.showEventAddress !== false && p.settings.eventAddress)) && (
          <section className="mb-14">
            <p className="text-[10px] tracking-[0.5em] uppercase font-black opacity-30 mb-7">Informações do Evento</p>
            <div className="space-y-6">
              {p.settings.showEventDate !== false && p.settings.eventDate && (
                <div className="flex gap-4">
                  <div className={`w-1 shrink-0 ${accentBar} rounded-full`} />
                  <div className="min-w-0">
                    <p className="text-xs font-black tracking-wider uppercase opacity-40 mb-1">Quando</p>
                    <p className="text-base font-semibold leading-relaxed text-stone-800 break-words">{p.eventDateStr}</p>
                  </div>
                </div>
              )}
              {p.settings.showEventAddress !== false && p.settings.eventAddress && (
                <div className="flex gap-4">
                  <div className={`w-1 shrink-0 ${accentBar} rounded-full`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black tracking-wider uppercase opacity-40 mb-1">Onde</p>
                    <p className="text-base font-semibold leading-relaxed text-stone-800 mb-3 break-words">{p.settings.eventAddress}</p>
                    {p.settings.eventMapsUrl && (
                      <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase font-black ${accentTxt} hover:opacity-70 active:opacity-50 transition-opacity`}>
                        <MapPin className="h-3 w-3 shrink-0" /> Ver no Mapa →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="w-full h-0.5 bg-stone-900 mb-12 opacity-[0.08]" />

        {/* RSVP */}
        <section className="mb-4">
          <p className="text-[10px] tracking-[0.5em] uppercase font-black opacity-30 mb-7">Confirmação de Presença</p>
          <div className="border-l-4 border-stone-900/10 pl-5 py-1">
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} showGiftSection={p.settings.showGiftSection !== false} showMessageSection={p.settings.showMessageSection !== false} />
          </div>
        </section>

        <footer className="space-y-1" style={SAFE_PB}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rotate-45 shrink-0 ${accentBar} opacity-60`} />
            <p className="text-[8px] tracking-[0.5em] uppercase opacity-20 font-bold">CHÁ DE BEBÊ · {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 5 — ROMÂNTICO
// ─────────────────────────────────────────────
function DesignRomantic(p: GuestPageClientProps) {
  const cardBg   = p.isBoy ? "bg-sky-50/70 border-sky-100"  : p.isGirl ? "bg-rose-50/70 border-rose-100"  : "bg-primary/5 border-primary/10";
  const heartClr = p.isBoy ? "text-sky-400"                 : p.isGirl ? "text-rose-400"                  : "text-primary/40";
  const iconBg   = p.isBoy ? "bg-sky-100"                   : p.isGirl ? "bg-rose-100"                    : "bg-primary/10";

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${p.genderFromBg} via-white ${p.genderToBg} flex flex-col items-center relative overflow-x-hidden`}
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className={`absolute inset-0 bg-gradient-to-br ${p.isBoy ? "from-sky-50/25" : p.isGirl ? "from-rose-50/25" : "from-primary/5"} to-transparent`} />
      </div>

      <div className={WRAP}>
        {/* Hero */}
        {p.settings.showInviteHeader !== false && (
        <header className="text-center pt-14 sm:pt-20 pb-12 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-2">
            <span className={`block h-px w-8 ${p.genderBorder} border-t opacity-30`} />
            <span className={`text-base ${heartClr}`}>♡</span>
            <span className="text-[8px] tracking-[0.45em] uppercase opacity-25 italic">com amor</span>
            <span className={`text-base ${heartClr}`}>♡</span>
            <span className={`block h-px w-8 ${p.genderBorder} border-t opacity-30`} />
          </div>
          <div>
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 italic mb-1">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.08em] italic ${p.genderColor} opacity-80 break-words`} style={{ fontFamily: p.inviteFontFamily }}>
              {p.guestData.nome}
            </p>
          </div>
          <h1 className={`font-serif tracking-[0.1em] uppercase leading-tight ${p.genderColor} break-words`} style={{ fontFamily: p.inviteFontFamily, fontSize: "clamp(2rem,9vw,3.5rem)" }}>
            {p.babyName}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-lg ${heartClr} opacity-60`}>♡</span>
            <span className={`text-base ${heartClr} opacity-35`}>♡</span>
            <span className={`text-sm ${heartClr} opacity-20`}>♡</span>
          </div>
          <p className="text-[11px] max-w-[18rem] mx-auto opacity-40 leading-loose italic">
            Com todo nosso amor, aguardamos a sua presença neste momento tão especial.
          </p>
        </header>
        )}

        {/* Image — polaroid */}
        {p.settings.showInvitationImage && getInviteImage(p.settings, p.guestData.fralda_tamanho) && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-14 flex justify-center overflow-hidden">
            <div style={{ transform: "rotate(-1.5deg)", transformOrigin: "center top" }}>
              <div
                className="overflow-hidden shadow-[0_20px_50px_-5px_rgba(0,0,0,0.18)] bg-white w-full"
                style={{ borderWidth: "10px 10px 32px 10px", borderStyle: "solid", borderColor: "white" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getInviteImage(p.settings, p.guestData.fralda_tamanho)} alt="Convite" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
              <p className={`text-center text-[9px] tracking-wider italic opacity-40 mt-1 ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>
                com amor ♡
              </p>
            </div>
          </section>
        )}

        {/* Hearts divider */}
        <HeartDivider genderBorder={p.genderBorder} heartClr={heartClr} />

        {/* Details */}
        {((p.settings.showEventDate !== false && p.settings.eventDate) || (p.settings.showEventAddress !== false && p.settings.eventAddress)) && (
          <section className="mb-14">
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase italic ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>O Nosso Evento</h2>
              <p className="text-[8px] tracking-[0.4em] uppercase opacity-25 italic mt-1">te esperamos ♡</p>
            </div>
            <div className="space-y-3">
              {p.settings.showEventDate !== false && p.settings.eventDate && (
                <div className={`${cardBg} border rounded-2xl p-5 flex items-center gap-4`}>
                  <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${iconBg}`}>
                    <Calendar className={`h-4 w-4 ${p.genderColor} opacity-60`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs italic tracking-wider uppercase opacity-40 mb-1">Quando</p>
                    <p className="text-sm leading-relaxed opacity-70 font-medium break-words">{p.eventDateStr}</p>
                  </div>
                </div>
              )}
              {p.settings.showEventAddress !== false && p.settings.eventAddress && (
                <div className={`${cardBg} border rounded-2xl p-5`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${iconBg} mt-0.5`}>
                      <MapPin className={`h-4 w-4 ${p.genderColor} opacity-60`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs italic tracking-wider uppercase opacity-40 mb-1">Onde</p>
                      <p className="text-sm leading-relaxed opacity-70 font-medium break-words">{p.settings.eventAddress}</p>
                    </div>
                  </div>
                  {p.settings.eventMapsUrl && (
                    <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full border ${p.genderBorder} rounded-xl py-3 text-[9px] tracking-[0.35em] uppercase opacity-45 hover:opacity-75 active:opacity-90 transition-opacity`}>
                      <MapPin className="h-3 w-3 shrink-0" /> Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <HeartDivider genderBorder={p.genderBorder} heartClr={heartClr} />

        {/* RSVP */}
        <section className="mb-4">
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase italic ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>Confirmação</h2>
            <p className="text-[8px] tracking-[0.4em] uppercase opacity-25 italic mt-1">você vai poder vir? ♡</p>
          </div>
          <div className={`${cardBg} border rounded-3xl p-5 sm:p-8`}>
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} showGiftSection={p.settings.showGiftSection !== false} showMessageSection={p.settings.showMessageSection !== false} />
          </div>
        </section>

        <footer className="text-center space-y-2" style={SAFE_PB}>
          <div className="flex items-center justify-center gap-2 opacity-20">
            <span className={`text-base ${heartClr}`}>♡</span>
            <span className={`text-sm ${heartClr}`}>♡</span>
            <span className={`text-base ${heartClr}`}>♡</span>
          </div>
          <p className="text-[8px] tracking-[0.5em] uppercase opacity-15 italic" style={{ fontFamily: p.inviteFontFamily }}>
            CHÁ DE BEBÊ · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─── Micro-components ────────────────────────────────────────────────

function OrnamStar({ genderBorder, star }: { genderBorder: string; star: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`block h-px w-6 border-t ${genderBorder} opacity-25`} />
      <span className={`text-sm ${star}`}>✦</span>
      <span className={`block h-px w-6 border-t ${genderBorder} opacity-25`} />
    </div>
  );
}

function Corner({ pos, genderBorder }: { pos: "tl" | "tr" | "bl" | "br"; genderBorder: string }) {
  const cls = {
    tl: "-top-1 -left-1 border-l-2 border-t-2",
    tr: "-top-1 -right-1 border-r-2 border-t-2",
    bl: "-bottom-1 -left-1 border-l-2 border-b-2",
    br: "-bottom-1 -right-1 border-r-2 border-b-2",
  }[pos];
  return <span className={`absolute w-4 h-4 ${cls} ${genderBorder} pointer-events-none`} />;
}

function Divider({ genderBorder, star, char }: { genderBorder: string; star: string; char: string }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span className={`block h-px flex-1 border-t ${genderBorder} opacity-25`} />
      <span className={`text-sm ${star} opacity-55`}>{char}</span>
      <span className={`block h-px flex-1 border-t ${genderBorder} opacity-25`} />
    </div>
  );
}

function SectionTitle({ genderColor, f, title, sub }: { genderColor: string; f: string; title: string; sub: string }) {
  return (
    <div className="text-center mb-8 space-y-1">
      <h2 className={`text-2xl sm:text-3xl font-serif tracking-[0.2em] uppercase ${genderColor}`} style={{ fontFamily: f }}>{title}</h2>
      <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 font-light">{sub}</p>
    </div>
  );
}

function MapLink({ href, genderBorder }: { href: string; genderBorder: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 w-full border ${genderBorder} py-3 text-[9px] tracking-[0.4em] uppercase opacity-45 hover:opacity-80 active:opacity-90 transition-opacity`}>
      <MapPin className="h-3 w-3 shrink-0" /> Ver no Mapa
    </a>
  );
}

function FloralDivider({ char, extraClass = "mb-12" }: { char: string; extraClass?: string }) {
  return (
    <div className={`flex items-center gap-3 ${extraClass}`}>
      <span className="block h-px flex-1 border-t border-emerald-200 opacity-50" />
      <span className="text-base opacity-55">{char}</span>
      <span className="block h-px flex-1 border-t border-emerald-200 opacity-50" />
    </div>
  );
}

function GoldDivider({ gold, char, extraClass = "" }: { gold: string; char: string; extraClass?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${extraClass}`}>
      <span className="block flex-1 h-px max-w-[3rem]" style={{ background: `${gold}45` }} />
      <span style={{ color: gold }} className="text-base opacity-70">{char}</span>
      <span className="block flex-1 h-px max-w-[3rem]" style={{ background: `${gold}45` }} />
    </div>
  );
}

function HeartDivider({ genderBorder, heartClr }: { genderBorder: string; heartClr: string }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12 opacity-25">
      <span className={`text-base ${heartClr}`}>♡</span>
      <span className={`block h-px w-10 ${genderBorder} border-t`} />
      <span className={`text-sm ${heartClr}`}>✿</span>
      <span className={`block h-px w-10 ${genderBorder} border-t`} />
      <span className={`text-base ${heartClr}`}>♡</span>
    </div>
  );
}

// ─── Main router ─────────────────────────────────────────────────────
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

  const design = (props.settings.inviteDesign as string) || "editorial";

  switch (design) {
    case "floral":   return <DesignFloral   {...props} />;
    case "luxury":   return <DesignLuxury   {...props} />;
    case "modern":   return <DesignModern   {...props} />;
    case "romantic": return <DesignRomantic {...props} />;
    default:         return <DesignEditorial {...props} />;
  }
}
