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

// ─────────────────────────────────────────────
// DESIGN 1 — EDITORIAL (minimalista, linhas finas)
// ─────────────────────────────────────────────
function DesignEditorial(p: GuestPageClientProps) {
  const orb    = p.isBoy ? "bg-sky-200/30"  : p.isGirl ? "bg-rose-200/30"  : "bg-primary/5";
  const star   = p.isBoy ? "text-sky-300"   : p.isGirl ? "text-rose-300"   : "text-primary/30";
  const iconBg = p.isBoy ? "bg-sky-100"     : p.isGirl ? "bg-rose-100"     : "bg-primary/10";
  return (
    <main className={`min-h-screen bg-gradient-to-b ${p.genderFromBg} via-white ${p.genderToBg} flex flex-col items-center relative overflow-x-hidden`} style={{ fontFamily: "var(--font-outfit)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -top-56 -right-56 w-[700px] h-[700px] rounded-full blur-[140px] opacity-50 ${orb}`} />
        <div className={`absolute -bottom-56 -left-56 w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 ${orb}`} />
      </div>
      <div className="w-full max-w-xl mx-auto relative z-10 px-5 sm:px-8">
        {/* Hero */}
        <header className="text-center pt-16 sm:pt-20 pb-14 space-y-7 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-4">
            <span className={`block h-px flex-1 max-w-16 border-t ${p.genderBorder} opacity-50`} />
            <span className="text-[8px] tracking-[0.5em] uppercase opacity-25">Convidado Especial</span>
            <span className={`block h-px flex-1 max-w-16 border-t ${p.genderBorder} opacity-50`} />
          </div>
          <div><p className="text-[8px] tracking-[0.45em] uppercase opacity-25">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.1em] ${p.genderColor} opacity-80`} style={{ fontFamily: p.inviteFontFamily }}>{p.guestData.nome}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className={`block h-px w-8 border-t ${p.genderBorder} opacity-25`} /><span className={`text-base ${star}`}>✦</span><span className={`block h-px w-8 border-t ${p.genderBorder} opacity-25`} />
          </div>
          <h1 className={`font-serif tracking-[0.12em] uppercase leading-tight ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily, fontSize: `clamp(2.6rem,10vw,${p.inviteFontSize * 2.8}px)` }}>{p.babyName}</h1>
          <div className="flex items-center justify-center gap-3">
            <span className={`block h-px w-8 border-t ${p.genderBorder} opacity-25`} /><span className={`text-base ${star}`}>✦</span><span className={`block h-px w-8 border-t ${p.genderBorder} opacity-25`} />
          </div>
          <p className="text-[11px] max-w-xs mx-auto opacity-40 leading-loose tracking-wider font-light">Com amor e alegria, convidamos você para celebrar este momento mágico.</p>
        </header>

        {/* Image */}
        {p.settings.showInvitationImage && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-16">
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-xs">
              <div className={`absolute -inset-5 border ${p.genderBorder} opacity-15`} />
              <div className={`absolute -inset-2.5 border ${p.genderBorder} opacity-25`} />
              <div className="relative aspect-[3/4] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.18)] border-[18px] border-white bg-white overflow-hidden group">
                <Image src={p.settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain transition-transform duration-1000 group-hover:scale-105" priority />
              </div>
              <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 border-l-2 border-t-2 ${p.genderBorder}`} />
              <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 border-r-2 border-t-2 ${p.genderBorder}`} />
              <span className={`absolute -bottom-1.5 -left-1.5 w-5 h-5 border-l-2 border-b-2 ${p.genderBorder}`} />
              <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 border-r-2 border-b-2 ${p.genderBorder}`} />
            </div>
          </section>
        )}

        {/* Divider */}
        <Divider genderBorder={p.genderBorder} star={star} char="◆" />

        {/* Details */}
        {(p.settings.eventDate || p.settings.eventAddress) && (
          <section className="mb-16">
            <SectionTitle genderColor={p.genderColor} inviteFontFamily={p.inviteFontFamily} title="O Evento" sub="Aguardamos sua presença" />
            <div className="space-y-4">
              {p.settings.eventDate && (
                <div className={`${p.genderBgLight} border ${p.genderBorder} p-6 flex items-center gap-6`}>
                  <div className={`w-12 h-12 shrink-0 ${iconBg} flex items-center justify-center border ${p.genderBorder}`}><Calendar className={`h-5 w-5 ${p.genderColor} opacity-70`} /></div>
                  <div><p className="text-[8px] font-bold tracking-[0.45em] uppercase opacity-35 mb-1.5">Quando</p><p className="text-sm leading-relaxed opacity-75 font-medium">{p.eventDateStr}</p></div>
                </div>
              )}
              {p.settings.eventAddress && (
                <div className={`${p.genderBgLight} border ${p.genderBorder} p-6`}>
                  <div className="flex items-center gap-6 mb-5">
                    <div className={`w-12 h-12 shrink-0 ${iconBg} flex items-center justify-center border ${p.genderBorder}`}><MapPin className={`h-5 w-5 ${p.genderColor} opacity-70`} /></div>
                    <div><p className="text-[8px] font-bold tracking-[0.45em] uppercase opacity-35 mb-1.5">Onde</p><p className="text-sm leading-relaxed opacity-75 font-medium">{p.settings.eventAddress}</p></div>
                  </div>
                  {p.settings.eventMapsUrl && <MapLink href={p.settings.eventMapsUrl} genderBorder={p.genderBorder} />}
                </div>
              )}
            </div>
          </section>
        )}

        <Divider genderBorder={p.genderBorder} star={star} char="◆" />

        {/* RSVP */}
        <section className="mb-20">
          <SectionTitle genderColor={p.genderColor} inviteFontFamily={p.inviteFontFamily} title="Confirmação" sub="Sua presença é o maior presente" />
          <div className={`${p.genderBgLight} border ${p.genderBorder} p-6 sm:p-10`}>
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} />
          </div>
        </section>

        <Footer genderBorder={p.genderBorder} star={star} inviteFontFamily={p.inviteFontFamily} />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 2 — FLORAL (botânico, suave, arredondado)
// ─────────────────────────────────────────────
function DesignFloral(p: GuestPageClientProps) {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden" style={{ fontFamily: "var(--font-outfit)" }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[130px] opacity-25 bg-emerald-100" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[130px] opacity-20 bg-rose-100" />
      </div>
      <div className="w-full max-w-xl mx-auto relative z-10 px-5 sm:px-8">

        {/* Hero */}
        <header className="text-center pt-16 sm:pt-20 pb-14 space-y-7 animate-in fade-in slide-in-from-top duration-1000">
          <div className="text-3xl leading-none">🌸</div>
          <div><p className="text-[8px] tracking-[0.45em] uppercase opacity-25">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.1em] ${p.genderColor} opacity-80`} style={{ fontFamily: p.inviteFontFamily }}>{p.guestData.nome}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="block h-px w-10 border-t border-emerald-300 opacity-40" />
            <span className="text-lg">❀</span>
            <span className="block h-px w-10 border-t border-emerald-300 opacity-40" />
          </div>
          <h1 className={`font-serif tracking-[0.1em] uppercase leading-tight ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily, fontSize: `clamp(2.6rem,10vw,${p.inviteFontSize * 2.8}px)` }}>{p.babyName}</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="block h-px w-10 border-t border-emerald-300 opacity-40" />
            <span className="text-lg">❀</span>
            <span className="block h-px w-10 border-t border-emerald-300 opacity-40" />
          </div>
          <p className="text-[11px] max-w-xs mx-auto opacity-40 leading-loose tracking-wider font-light">Com alegria florescente, convidamos você para este momento especial 🌿</p>
        </header>

        {/* Image */}
        {p.settings.showInvitationImage && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-16 flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-xs">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-emerald-50 opacity-60" />
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.14)] border-[14px] border-white">
                <Image src={p.settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain" priority />
              </div>
              <div className="absolute -top-3 -left-3 text-xl opacity-60">🌸</div>
              <div className="absolute -top-3 -right-3 text-xl opacity-60">🌿</div>
              <div className="absolute -bottom-3 -left-3 text-xl opacity-60">🌷</div>
              <div className="absolute -bottom-3 -right-3 text-xl opacity-60">🌸</div>
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-14">
          <span className="block h-px flex-1 border-t border-emerald-200 opacity-50" />
          <span className="text-base opacity-60">🌸</span>
          <span className="block h-px flex-1 border-t border-emerald-200 opacity-50" />
        </div>

        {/* Details */}
        {(p.settings.eventDate || p.settings.eventAddress) && (
          <section className="mb-16">
            <div className="text-center mb-8"><p className="text-2xl mb-1">🌿</p>
              <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>O Evento</h2>
              <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 mt-1">Aguardamos sua presença</p>
            </div>
            <div className="space-y-4">
              {p.settings.eventDate && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center border border-emerald-200 shadow-sm"><Calendar className={`h-5 w-5 ${p.genderColor} opacity-70`} /></div>
                  <div><p className="text-[8px] font-bold tracking-[0.45em] uppercase opacity-35 mb-1.5">Quando</p><p className="text-sm leading-relaxed opacity-75 font-medium">{p.eventDateStr}</p></div>
                </div>
              )}
              {p.settings.eventAddress && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center border border-rose-200 shadow-sm"><MapPin className={`h-5 w-5 ${p.genderColor} opacity-70`} /></div>
                    <div><p className="text-[8px] font-bold tracking-[0.45em] uppercase opacity-35 mb-1.5">Onde</p><p className="text-sm leading-relaxed opacity-75 font-medium">{p.settings.eventAddress}</p></div>
                  </div>
                  {p.settings.eventMapsUrl && (
                    <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full border border-emerald-200 rounded-xl py-2.5 text-[9px] tracking-[0.4em] uppercase opacity-50 hover:opacity-80 transition-opacity bg-white/60">
                      <MapPin className="h-3 w-3" /> Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex items-center gap-3 mb-14">
          <span className="block h-px flex-1 border-t border-emerald-200 opacity-50" />
          <span className="text-base opacity-60">🌷</span>
          <span className="block h-px flex-1 border-t border-emerald-200 opacity-50" />
        </div>

        {/* RSVP */}
        <section className="mb-20">
          <div className="text-center mb-8"><p className="text-2xl mb-1">🌸</p>
            <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>Confirmação</h2>
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 mt-1">Sua presença é o maior presente</p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 sm:p-10">
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} />
          </div>
        </section>

        <div className="text-center pb-14 space-y-2">
          <p className="text-xl">🌸 🌿 🌷</p>
          <p className="text-[8px] tracking-[0.55em] uppercase opacity-20" style={{ fontFamily: p.inviteFontFamily }}>CHÁ DE BEBÊ · {new Date().getFullYear()}</p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 3 — LUXURY (creme, dourado, mat duplo)
// ─────────────────────────────────────────────
function DesignLuxury(p: GuestPageClientProps) {
  const gold = "#b8972a";
  const goldBorder = `1px solid ${gold}44`;
  const goldBorderStrong = `1.5px solid ${gold}80`;

  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-x-hidden" style={{ fontFamily: "var(--font-outfit)", background: "#faf8f3" }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, #b8972a 40px, #b8972a 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #b8972a 40px, #b8972a 41px)" }} />
      </div>
      <div className="w-full max-w-xl mx-auto relative z-10 px-5 sm:px-8">

        {/* Hero */}
        <header className="text-center pt-16 sm:pt-20 pb-14 space-y-8 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-4">
            <span className="block flex-1 h-px max-w-20" style={{ background: `linear-gradient(to right, transparent, ${gold}60)` }} />
            <span className="text-[8px] tracking-[0.55em] uppercase opacity-40 font-light">Convite Exclusivo</span>
            <span className="block flex-1 h-px max-w-20" style={{ background: `linear-gradient(to left, transparent, ${gold}60)` }} />
          </div>
          <div className="space-y-1">
            <p className="text-[8px] tracking-[0.5em] uppercase opacity-30">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.12em] ${p.genderColor} opacity-80`} style={{ fontFamily: p.inviteFontFamily }}>{p.guestData.nome}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="block w-16 h-px" style={{ background: `${gold}60` }} />
            <span style={{ color: gold }} className="text-lg">◈</span>
            <span className="block w-16 h-px" style={{ background: `${gold}60` }} />
          </div>
          <h1 className={`font-serif tracking-[0.18em] uppercase leading-tight ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily, fontSize: `clamp(2.8rem,11vw,${p.inviteFontSize * 3}px)` }}>{p.babyName}</h1>
          <div className="flex items-center justify-center gap-4">
            <span className="block w-16 h-px" style={{ background: `${gold}60` }} />
            <span style={{ color: gold }} className="text-lg">◈</span>
            <span className="block w-16 h-px" style={{ background: `${gold}60` }} />
          </div>
          <p className="text-[11px] max-w-xs mx-auto opacity-35 leading-loose tracking-widest font-light">Com honra e alegria, convidamos você para este momento singular.</p>
        </header>

        {/* Image */}
        {p.settings.showInvitationImage && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-16 flex justify-center">
            <div className="relative w-full max-w-[260px] sm:max-w-[300px]">
              <div className="absolute -inset-6" style={{ border: goldBorderStrong }} />
              <div className="absolute -inset-3" style={{ border: goldBorder }} />
              <div className="relative aspect-[3/4] overflow-hidden shadow-[0_40px_100px_-15px_rgba(0,0,0,0.22)] border-[22px] border-[#faf8f3] bg-[#faf8f3]">
                <Image src={p.settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain" priority />
              </div>
              <span className="absolute -top-1 -left-1 w-6 h-6" style={{ borderLeft: `2px solid ${gold}`, borderTop: `2px solid ${gold}` }} />
              <span className="absolute -top-1 -right-1 w-6 h-6" style={{ borderRight: `2px solid ${gold}`, borderTop: `2px solid ${gold}` }} />
              <span className="absolute -bottom-1 -left-1 w-6 h-6" style={{ borderLeft: `2px solid ${gold}`, borderBottom: `2px solid ${gold}` }} />
              <span className="absolute -bottom-1 -right-1 w-6 h-6" style={{ borderRight: `2px solid ${gold}`, borderBottom: `2px solid ${gold}` }} />
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-14">
          <span className="block flex-1 h-px" style={{ background: `${gold}40` }} />
          <span style={{ color: gold }} className="text-base">✦</span>
          <span className="block flex-1 h-px" style={{ background: `${gold}40` }} />
        </div>

        {/* Details */}
        {(p.settings.eventDate || p.settings.eventAddress) && (
          <section className="mb-16">
            <div className="text-center mb-10 space-y-2">
              <h2 className={`text-2xl sm:text-3xl font-serif tracking-[0.25em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>O Evento</h2>
              <p className="text-[8px] tracking-[0.5em] uppercase opacity-25">Aguardamos sua presença</p>
            </div>
            <div className="space-y-4">
              {p.settings.eventDate && (
                <div className="p-7 flex items-center gap-6" style={{ background: "#f5f0e8", border: goldBorder }}>
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center" style={{ border: goldBorderStrong }}>
                    <Calendar className={`h-5 w-5 ${p.genderColor} opacity-60`} />
                  </div>
                  <div><p className="text-[8px] font-bold tracking-[0.5em] uppercase opacity-35 mb-1.5">Quando</p><p className="text-sm leading-relaxed opacity-75 font-medium">{p.eventDateStr}</p></div>
                </div>
              )}
              {p.settings.eventAddress && (
                <div className="p-7" style={{ background: "#f5f0e8", border: goldBorder }}>
                  <div className="flex items-center gap-6 mb-5">
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center" style={{ border: goldBorderStrong }}><MapPin className={`h-5 w-5 ${p.genderColor} opacity-60`} /></div>
                    <div><p className="text-[8px] font-bold tracking-[0.5em] uppercase opacity-35 mb-1.5">Onde</p><p className="text-sm leading-relaxed opacity-75 font-medium">{p.settings.eventAddress}</p></div>
                  </div>
                  {p.settings.eventMapsUrl && (
                    <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 text-[9px] tracking-[0.4em] uppercase opacity-50 hover:opacity-80 transition-opacity" style={{ border: goldBorderStrong }}>
                      <MapPin className="h-3 w-3" /> Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex items-center gap-3 mb-14">
          <span className="block flex-1 h-px" style={{ background: `${gold}40` }} />
          <span style={{ color: gold }} className="text-base">◈</span>
          <span className="block flex-1 h-px" style={{ background: `${gold}40` }} />
        </div>

        {/* RSVP */}
        <section className="mb-20">
          <div className="text-center mb-10 space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-serif tracking-[0.25em] uppercase ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>Confirmação</h2>
            <p className="text-[8px] tracking-[0.5em] uppercase opacity-25">Sua presença é o maior presente</p>
          </div>
          <div className="p-6 sm:p-10" style={{ background: "#f5f0e8", border: goldBorder }}>
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} />
          </div>
        </section>

        <div className="text-center pb-14 space-y-3">
          <div className="flex items-center justify-center gap-4">
            <span className="block w-8 h-px" style={{ background: `${gold}40` }} />
            <span style={{ color: gold }} className="text-[10px] tracking-[0.4em] uppercase opacity-40">✦ ✦ ✦</span>
            <span className="block w-8 h-px" style={{ background: `${gold}40` }} />
          </div>
          <p className="text-[8px] tracking-[0.55em] uppercase opacity-20" style={{ fontFamily: p.inviteFontFamily }}>CHÁ DE BEBÊ · {new Date().getFullYear()}</p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 4 — MODERNO (geométrico, alto contraste)
// ─────────────────────────────────────────────
function DesignModern(p: GuestPageClientProps) {
  const accentBar = p.isBoy ? "bg-sky-500" : p.isGirl ? "bg-rose-500" : "bg-primary";
  return (
    <main className="min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden" style={{ fontFamily: "var(--font-outfit)" }}>
      <div className="w-full max-w-xl mx-auto relative z-10 px-5 sm:px-8">

        {/* Hero — left aligned, bold */}
        <header className="pt-16 sm:pt-20 pb-14 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center gap-4">
            <div className={`w-1 h-10 ${accentBar}`} />
            <p className="text-[9px] tracking-[0.5em] uppercase opacity-40 font-bold">Convite Pessoal</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.4em] uppercase opacity-30 mb-2">Para</p>
            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${p.genderColor}`}>{p.guestData.nome}</p>
          </div>
          <div className="w-full h-px bg-stone-900 opacity-8" />
          <h1 className="font-black tracking-[-0.02em] uppercase leading-none text-stone-900" style={{ fontSize: `clamp(2.6rem,12vw,${p.inviteFontSize * 3}px)` }}>{p.babyName}</h1>
          <p className="text-sm max-w-xs opacity-35 leading-relaxed font-light">Com alegria, convidamos você para celebrar este momento especial.</p>
        </header>

        {/* Image — no frame, clean shadow */}
        {p.settings.showInvitationImage && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-16">
            <div className="relative w-full max-w-[280px]">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${accentBar} rounded-r-sm`} />
              <div className="ml-6 relative aspect-[3/4] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)] border border-stone-200">
                <Image src={p.settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain" priority />
              </div>
            </div>
          </section>
        )}

        {/* Bold rule */}
        <div className="w-full h-0.5 bg-stone-900 mb-14 opacity-8" />

        {/* Details — left accent bars */}
        {(p.settings.eventDate || p.settings.eventAddress) && (
          <section className="mb-16">
            <p className="text-[10px] tracking-[0.5em] uppercase font-black opacity-30 mb-8">Informações do Evento</p>
            <div className="space-y-6">
              {p.settings.eventDate && (
                <div className="flex gap-5">
                  <div className={`w-1 shrink-0 ${accentBar} rounded-full`} />
                  <div>
                    <p className="text-[8px] font-black tracking-[0.4em] uppercase opacity-30 mb-1.5">Quando</p>
                    <p className="text-base font-semibold leading-relaxed text-stone-800">{p.eventDateStr}</p>
                  </div>
                </div>
              )}
              {p.settings.eventAddress && (
                <div className="flex gap-5">
                  <div className={`w-1 shrink-0 ${accentBar} rounded-full`} />
                  <div className="flex-1">
                    <p className="text-[8px] font-black tracking-[0.4em] uppercase opacity-30 mb-1.5">Onde</p>
                    <p className="text-base font-semibold leading-relaxed text-stone-800 mb-3">{p.settings.eventAddress}</p>
                    {p.settings.eventMapsUrl && (
                      <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase font-black ${p.genderColor} hover:opacity-70 transition-opacity`}>
                        <MapPin className="h-3 w-3" /> Ver no Mapa →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="w-full h-0.5 bg-stone-900 mb-14 opacity-8" />

        {/* RSVP */}
        <section className="mb-20">
          <p className="text-[10px] tracking-[0.5em] uppercase font-black opacity-30 mb-8">Confirmação de Presença</p>
          <div className="border-l-4 border-stone-900 pl-6 py-2">
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} />
          </div>
        </section>

        <div className="pb-14">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rotate-45 ${accentBar} opacity-60`} />
            <p className="text-[8px] tracking-[0.5em] uppercase opacity-20 font-bold">CHÁ DE BEBÊ · {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// DESIGN 5 — ROMÂNTICO (gradiente suave, corações, polaroid)
// ─────────────────────────────────────────────
function DesignRomantic(p: GuestPageClientProps) {
  const cardBg    = p.isBoy ? "bg-sky-50/70 border-sky-100"   : p.isGirl ? "bg-rose-50/70 border-rose-100"   : "bg-primary/5 border-primary/10";
  const heartClr  = p.isBoy ? "text-sky-400"                  : p.isGirl ? "text-rose-400"                   : "text-primary/40";
  return (
    <main className={`min-h-screen bg-gradient-to-b ${p.genderFromBg} via-white ${p.genderToBg} flex flex-col items-center relative overflow-x-hidden`} style={{ fontFamily: "var(--font-outfit)" }}>
      <div className="pointer-events-none fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${p.isBoy ? "from-sky-50/30" : p.isGirl ? "from-rose-50/30" : "from-primary/5"} to-transparent`} />
      </div>
      <div className="w-full max-w-xl mx-auto relative z-10 px-5 sm:px-8">

        {/* Hero */}
        <header className="text-center pt-16 sm:pt-20 pb-14 space-y-7 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-center gap-3">
            <span className={`block h-px w-10 ${p.genderBorder} border-t opacity-30`} />
            <span className={`text-lg ${heartClr}`}>♡</span>
            <span className="text-[8px] tracking-[0.45em] uppercase opacity-25 italic">com amor</span>
            <span className={`text-lg ${heartClr}`}>♡</span>
            <span className={`block h-px w-10 ${p.genderBorder} border-t opacity-30`} />
          </div>
          <div>
            <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 italic">Para</p>
            <p className={`text-xl sm:text-2xl font-serif tracking-[0.08em] italic ${p.genderColor} opacity-80`} style={{ fontFamily: p.inviteFontFamily }}>{p.guestData.nome}</p>
          </div>
          <h1 className={`font-serif tracking-[0.1em] uppercase leading-tight ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily, fontSize: `clamp(2.6rem,10vw,${p.inviteFontSize * 2.8}px)` }}>{p.babyName}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-lg ${heartClr} opacity-60`}>♡</span>
            <span className={`text-lg ${heartClr} opacity-40`}>♡</span>
            <span className={`text-lg ${heartClr} opacity-20`}>♡</span>
          </div>
          <p className="text-[11px] max-w-xs mx-auto opacity-40 leading-loose italic">Com todo nosso amor, aguardamos a sua presença neste momento tão especial.</p>
        </header>

        {/* Image — polaroid style com leve inclinação */}
        {p.settings.showInvitationImage && (
          <section className="animate-in fade-in duration-1000 delay-200 mb-16 flex justify-center">
            <div className="relative" style={{ transform: "rotate(-1.5deg)" }}>
              <div className="relative aspect-[3/4] w-[240px] sm:w-[270px] overflow-hidden shadow-[0_25px_60px_-5px_rgba(0,0,0,0.2)] border-[14px] border-b-[42px] border-white bg-white">
                <Image src={p.settings.invitationUrl || "/convite.png"} alt="CONVITE" fill className="object-contain" priority />
              </div>
              <p className={`text-center text-[9px] tracking-wider italic opacity-40 mt-1 ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>com amor ♡</p>
            </div>
          </section>
        )}

        {/* Divider hearts */}
        <div className="flex items-center justify-center gap-2 mb-14 opacity-30">
          <span className={`text-base ${heartClr}`}>♡</span>
          <span className={`block h-px w-12 ${p.genderBorder} border-t`} />
          <span className={`text-sm ${heartClr}`}>✿</span>
          <span className={`block h-px w-12 ${p.genderBorder} border-t`} />
          <span className={`text-base ${heartClr}`}>♡</span>
        </div>

        {/* Details */}
        {(p.settings.eventDate || p.settings.eventAddress) && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase italic ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>O Nosso Evento</h2>
              <p className="text-[8px] tracking-[0.4em] uppercase opacity-25 italic mt-1">te esperamos ♡</p>
            </div>
            <div className="space-y-4">
              {p.settings.eventDate && (
                <div className={`${cardBg} border rounded-2xl p-6 flex items-center gap-5`}>
                  <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${p.isBoy ? "bg-sky-100" : p.isGirl ? "bg-rose-100" : "bg-primary/10"}`}>
                    <Calendar className={`h-5 w-5 ${p.genderColor} opacity-60`} />
                  </div>
                  <div><p className="text-[8px] italic tracking-wider uppercase opacity-30 mb-1">Quando</p><p className="text-sm leading-relaxed opacity-70 font-medium">{p.eventDateStr}</p></div>
                </div>
              )}
              {p.settings.eventAddress && (
                <div className={`${cardBg} border rounded-2xl p-6`}>
                  <div className="flex items-center gap-5 mb-4">
                    <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${p.isBoy ? "bg-sky-100" : p.isGirl ? "bg-rose-100" : "bg-primary/10"}`}>
                      <MapPin className={`h-5 w-5 ${p.genderColor} opacity-60`} />
                    </div>
                    <div><p className="text-[8px] italic tracking-wider uppercase opacity-30 mb-1">Onde</p><p className="text-sm leading-relaxed opacity-70 font-medium">{p.settings.eventAddress}</p></div>
                  </div>
                  {p.settings.eventMapsUrl && (
                    <a href={p.settings.eventMapsUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 w-full border ${p.genderBorder} rounded-xl py-2.5 text-[9px] tracking-[0.35em] uppercase opacity-45 hover:opacity-75 transition-opacity`}>
                      <MapPin className="h-3 w-3" /> Ver no Mapa
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Hearts divider */}
        <div className="flex items-center justify-center gap-2 mb-14 opacity-30">
          <span className={`text-base ${heartClr}`}>♡</span>
          <span className={`block h-px w-12 ${p.genderBorder} border-t`} />
          <span className={`text-sm ${heartClr}`}>✿</span>
          <span className={`block h-px w-12 ${p.genderBorder} border-t`} />
          <span className={`text-base ${heartClr}`}>♡</span>
        </div>

        {/* RSVP */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-serif tracking-[0.2em] uppercase italic ${p.genderColor}`} style={{ fontFamily: p.inviteFontFamily }}>Confirmação</h2>
            <p className="text-[8px] tracking-[0.4em] uppercase opacity-25 italic mt-1">você vai poder vir? ♡</p>
          </div>
          <div className={`${cardBg} border rounded-3xl p-6 sm:p-10`}>
            <RSVPForm guest={p.guestData} gifts={p.giftList} fontFamily={p.inviteFontFamily} fontSize={p.inviteFontSize} eventId={p.eventId} />
          </div>
        </section>

        <div className="text-center pb-14 space-y-2">
          <div className="flex items-center justify-center gap-2 opacity-20">
            <span className={`text-base ${heartClr}`}>♡</span>
            <span className={`text-sm ${heartClr}`}>♡</span>
            <span className={`text-base ${heartClr}`}>♡</span>
          </div>
          <p className="text-[8px] tracking-[0.5em] uppercase opacity-15 italic" style={{ fontFamily: p.inviteFontFamily }}>CHÁ DE BEBÊ · {new Date().getFullYear()}</p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Shared micro-components
// ─────────────────────────────────────────────
function Divider({ genderBorder, star, char }: { genderBorder: string; star: string; char: string }) {
  return (
    <div className="flex items-center gap-4 mb-14">
      <span className={`block h-px flex-1 border-t ${genderBorder} opacity-30`} />
      <span className={`text-sm ${star} opacity-60`}>{char}</span>
      <span className={`block h-px flex-1 border-t ${genderBorder} opacity-30`} />
    </div>
  );
}

function SectionTitle({ genderColor, inviteFontFamily, title, sub }: { genderColor: string; inviteFontFamily: string; title: string; sub: string }) {
  return (
    <div className="text-center mb-10 space-y-1.5">
      <h2 className={`text-2xl sm:text-3xl font-serif tracking-[0.2em] uppercase ${genderColor}`} style={{ fontFamily: inviteFontFamily }}>{title}</h2>
      <p className="text-[8px] tracking-[0.45em] uppercase opacity-25 font-light">{sub}</p>
    </div>
  );
}

function MapLink({ href, genderBorder }: { href: string; genderBorder: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 w-full border ${genderBorder} py-3 text-[9px] tracking-[0.4em] uppercase opacity-45 hover:opacity-80 transition-opacity`}>
      <MapPin className="h-3 w-3" /> Ver no Mapa
    </a>
  );
}

function Footer({ genderBorder, star, inviteFontFamily }: { genderBorder: string; star: string; inviteFontFamily: string }) {
  return (
    <footer className="text-center pb-14 space-y-3">
      <div className="flex items-center justify-center gap-4">
        <span className={`block h-px w-10 border-t ${genderBorder} opacity-20`} />
        <span className={`text-[9px] tracking-[0.4em] uppercase opacity-15 ${star}`}>✦ ✦ ✦</span>
        <span className={`block h-px w-10 border-t ${genderBorder} opacity-20`} />
      </div>
      <p className="text-[8px] tracking-[0.55em] uppercase opacity-15 font-serif" style={{ fontFamily: inviteFontFamily }}>CHÁ DE BEBÊ · {new Date().getFullYear()}</p>
    </footer>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT — router entre designs
// ─────────────────────────────────────────────
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
    case "floral":    return <DesignFloral    {...props} />;
    case "luxury":    return <DesignLuxury    {...props} />;
    case "modern":    return <DesignModern    {...props} />;
    case "romantic":  return <DesignRomantic  {...props} />;
    default:          return <DesignEditorial {...props} />;
  }
}
