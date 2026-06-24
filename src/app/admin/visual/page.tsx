"use client";

import { useState, useEffect, useRef } from "react";
import { getSettings, updateSettings, getUniqueFraldaSizes } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { THEMES, PANEL_DESIGNS, INVITE_DESIGNS, type PanelDesignId, type InviteDesignId } from "@/lib/themes";
import { Save, Loader2, Settings as SettingsIcon, Calendar, Lock, Layers, CheckCircle2, Mail, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";
import AdminTour, { type TourStep } from "@/components/AdminTour";

const VISUAL_TOUR: TourStep[] = [
  { selector: null,                   icon: "🎨", title: "Visual & Info",             body: "Nesta página você configura toda a aparência e as informações do evento — desde o design do convite até data, local e acesso administrativo." },
  { selector: "#tour-panel-design",   icon: "🖥️", title: "Design do Painel",          body: "Escolha o visual da interface administrativa. As opções escuras (Premium, Neon, Ocean, Rose) mudam cores de todo o painel. A mudança é imediata e salva só neste dispositivo." },
  { selector: "#tour-invite-design",  icon: "✉️", title: "Design do Convite",         body: "Define o estilo visual da página que os convidados veem ao abrir o link. Cada design tem uma estética diferente: editorial, floral, luxo, moderno ou romântico." },
  { selector: "#tour-invite-url",     icon: "🖼️", title: "URL do Convite",            body: "Cole aqui o link direto da imagem do seu convite. Use o Imgur, Google Drive (link público) ou qualquer hospedagem de imagens. A imagem aparece moldada no convite do convidado." },
  { selector: "#tour-theme",          icon: "🎨", title: "Tema Visual",               body: "Escolha a paleta de cores do sistema. O tema afeta a cor primária de botões, ícones e destaques em todo o painel administrativo." },
  { selector: "#tour-fonts",          icon: "🔤", title: "Fonte do Convite",          body: "Selecione a tipografia que aparece nos títulos da página de convite (nome do bebê, seções, etc.). O tamanho ao lado controla o quanto ela é exibida." },
  { selector: "#tour-baby",           icon: "👶", title: "Nome & Sexo do Bebê",       body: "O nome aparece em destaque no convite e na splash screen. O sexo (menino/menina) define as cores do convite — azul celeste ou rosa suave." },
  { selector: "#tour-show-image",     icon: "👁️", title: "Exibir Imagem",             body: "Controla se a imagem do convite será exibida ou não na página do convidado. Desative se preferir um convite somente com texto." },
  { selector: "#tour-event-date",     icon: "📅", title: "Data & Local",              body: "Defina a data, o endereço e o link do Google Maps do evento. Essas informações aparecem no card 'O Evento' dentro do convite de cada convidado." },
  { selector: "#tour-whatsapp",       icon: "💬", title: "Template WhatsApp",         body: "Personalize a mensagem enviada via WhatsApp para cada convidado. Use as variáveis {nome}, {data}, {endereco}, {link} e {bebe} para personalizar automaticamente." },
  { selector: "#tour-admin-access",   icon: "🔐", title: "Acesso Administrativo",     body: "Altere seu usuário e senha de acesso ao painel. Você também pode configurar o e-mail do Google para fazer login via Google. Deixe a senha em branco para não alterá-la." },
];

export default function VisualPage() {
  const [invitationUrl, setInvitationUrl] = useState("");
  const [theme, setTheme] = useState("GOLD");
  const [showInvitationImage, setShowInvitationImage] = useState(true);
  const [inviteFont, setInviteFont] = useState("Playfair Display");
  const [inviteFontSize, setInviteFontSize] = useState(18);
  const [systemFont, setSystemFont] = useState("Inter");
  const [systemFontSize, setSystemFontSize] = useState(14);
  const [babyName, setBabyName] = useState("");
  const [babyGender, setBabyGender] = useState("NONE");
  const [eventDate, setEventDate] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventMapsUrl, setEventMapsUrl] = useState("");
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [showEventDate, setShowEventDate] = useState(true);
  const [showEventAddress, setShowEventAddress] = useState(true);
  const [showGiftSection, setShowGiftSection] = useState(true);
  const [showMessageSection, setShowMessageSection] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeImages, setSizeImages] = useState<Record<string, string>>({});
  const [uniqueSizes, setUniqueSizes] = useState<string[]>([]);
  const [uploadingSize, setUploadingSize] = useState<string | null>(null);
  const [currentUploadSize, setCurrentUploadSize] = useState("");
  const sizeFileRef = useRef<HTMLInputElement>(null);

  // Panel design
  const [panelDesign, setPanelDesign] = useState<PanelDesignId>("classic");
  // Invite design
  const [inviteDesign, setInviteDesign] = useState<InviteDesignId>("editorial");

  useEffect(() => {
    fetchSettings();

    if (typeof window !== "undefined") {
const savedDesign = localStorage.getItem("admin_panel_design") as PanelDesignId || "classic";
      setPanelDesign(savedDesign);
    }
  }, []);

  const handlePanelDesignChange = (designId: PanelDesignId) => {
    setPanelDesign(designId);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_panel_design", designId);
      window.dispatchEvent(new Event("admin-design-changed"));
      const found = PANEL_DESIGNS.find(d => d.id === designId);
      toast.success(`${found?.icon ?? ""} Design ${found?.name ?? designId} ativado!`);
    }
  };


  const fetchSettings = async () => {
    const data = await getSettings();
    if (data) {
      setInvitationUrl(data.invitationUrl || "");
      setTheme(data.theme || "GOLD");
      setInviteFont(data.inviteFont || "Playfair Display");
      setInviteFontSize(data.inviteFontSize || 18);
      setSystemFont(data.systemFont || "Inter");
      setSystemFontSize(data.systemFontSize || 14);
      setShowInvitationImage(data.showInvitationImage ?? true);
      setBabyName(data.babyName || "");
      setBabyGender(data.babyGender || "NONE");
      setEventDate(data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 16) : "");
      setEventAddress(data.eventAddress || "");
      setEventMapsUrl(data.eventMapsUrl || "");
      setEnableAnimations(data.enableAnimations ?? true);
      setWhatsappTemplate(data.whatsappTemplate || "");
      setInviteDesign((data.inviteDesign as InviteDesignId) || "editorial");
      setShowEventDate((data as any).showEventDate ?? true);
      setShowEventAddress((data as any).showEventAddress ?? true);
      setShowGiftSection((data as any).showGiftSection ?? true);
      setShowMessageSection((data as any).showMessageSection ?? true);
      try {
        setSizeImages(JSON.parse((data as any).inviteImagesBySizes || "{}"));
      } catch { setSizeImages({}); }
    }
    const sizes = await getUniqueFraldaSizes();
    setUniqueSizes(sizes);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (json.url) {
        setInvitationUrl(json.url);
        toast.success("Imagem carregada! Salve as configurações para aplicar.");
      } else {
        toast.error(json.error || "Falha no upload.");
      }
    } catch {
      toast.error("Erro ao enviar imagem.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSizeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadSize) return;
    setUploadingSize(currentUploadSize);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (json.url) {
        setSizeImages(prev => ({ ...prev, [currentUploadSize]: json.url }));
        toast.success(`Imagem para tamanho ${currentUploadSize} carregada! Salve para aplicar.`);
      } else {
        toast.error(json.error || "Falha no upload.");
      }
    } catch {
      toast.error("Erro ao enviar imagem.");
    }
    setUploadingSize(null);
    if (sizeFileRef.current) sizeFileRef.current.value = "";
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const result = await updateSettings({ invitationUrl, theme, inviteFont, inviteFontSize, systemFont, systemFontSize, showInvitationImage, babyName, babyGender, eventDate, eventAddress, eventMapsUrl, enableAnimations, whatsappTemplate, inviteDesign, showEventDate, showEventAddress, showGiftSection, showMessageSection, inviteImagesBySizes: JSON.stringify(sizeImages) });
    if (result.success) {
      toast.success("CONFIGURAÇÕES SALVAS");
    } else {
      toast.error("ERRO AO SALVAR. Reinicie o terminal.");
    }
    setLoading(false);
  };



  return (
    <div className="w-full space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex justify-between items-end border-b border-primary/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-[0.2em] uppercase">Visual & Info</h1>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase font-light">Customização do Evento</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} className="h-14 w-14 rounded-none shadow-xl transition-all">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        </Button>
      </header>

      {/* Tour */}
      <AdminTour steps={VISUAL_TOUR} storageKey="tour_visual_v1" />

      {/* ========== PANEL DESIGN SELECTOR ========== */}
      <section id="tour-panel-design" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-stone-800">Design do Painel</h2>
            <p className="text-[9px] text-stone-400 tracking-widest uppercase font-medium mt-0.5">Escolha o layout da interface administrativa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PANEL_DESIGNS.map((design) => {
            const isSelected = panelDesign === design.id;
            return (
              <button
                key={design.id}
                onClick={() => handlePanelDesignChange(design.id as PanelDesignId)}
                className={`relative text-left rounded-2xl overflow-hidden transition-all duration-300 group ${
                  isSelected
                    ? "ring-2 ring-primary shadow-xl shadow-primary/10"
                    : "ring-1 ring-stone-200 hover:ring-primary/40 hover:shadow-lg"
                }`}
              >
                {/* Preview */}
                {design.id === "classic" ? (
                  <div className="h-32 bg-gradient-to-br from-stone-50 to-white flex">
                    <div className="w-12 h-full bg-white border-r border-stone-100 flex flex-col items-center gap-3 py-4">
                      <div className="w-5 h-5 rounded-full bg-stone-800" />
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-6 h-6 rounded flex items-center justify-center ${i === 0 ? "bg-primary/80" : "bg-transparent"}`}>
                          <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-white" : "bg-stone-300"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                      <div className="w-24 h-3 bg-stone-200 rounded" />
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-8 bg-white rounded-xl border border-stone-100 shadow-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (() => {
                  const PREVIEW_SCHEMES: Record<string, { bg: string; accent: string; border: string }> = {
                    premium: { bg: "linear-gradient(165deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)", accent: "#818cf8", border: "rgba(255,255,255,0.06)" },
                    neon:    { bg: "linear-gradient(165deg, #020802 0%, #061606 60%, #031003 100%)", accent: "#00dc64", border: "rgba(0,220,100,0.12)" },
                    ocean:   { bg: "linear-gradient(165deg, #071828 0%, #0d2740 55%, #071e35 100%)", accent: "#38bdf8", border: "rgba(56,189,248,0.12)" },
                    rose:    { bg: "linear-gradient(165deg, #1a0a14 0%, #2e1222 55%, #1a0a14 100%)", accent: "#f472b6", border: "rgba(244,114,182,0.12)" },
                  };
                  const ps = PREVIEW_SCHEMES[design.id] ?? PREVIEW_SCHEMES.premium;
                  return (
                    <div className="h-32 flex" style={{ background: ps.bg }}>
                      <div className="w-20 h-full border-r flex flex-col gap-2 py-3 px-2" style={{ borderColor: ps.border }}>
                        <div className="flex items-center gap-1.5 px-1">
                          <div className="w-4 h-4 rounded-md" style={{ background: `${ps.accent}33` }} />
                          <div className="w-8 h-2 rounded" style={{ background: "rgba(255,255,255,0.2)" }} />
                        </div>
                        {["#a78bfa", "#60a5fa", "#34d399", "#fbbf24"].map((_, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-1 py-1 rounded-lg" style={i === 1 ? { background: `${ps.accent}18` } : {}}>
                            <div className="w-3.5 h-3.5 rounded flex items-center justify-center" style={{ background: `${ps.accent}22` }}>
                              <div className="w-1.5 h-1.5 rounded-sm" style={{ background: i === 1 ? ps.accent : "rgba(255,255,255,0.3)" }} />
                            </div>
                            <div className="h-1.5 rounded" style={{ width: i === 1 ? 32 : 24, background: i === 1 ? `${ps.accent}99` : "rgba(255,255,255,0.15)" }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 p-3 space-y-2">
                        <div className="w-16 h-2 rounded" style={{ background: "rgba(255,255,255,0.15)" }} />
                        <div className="grid grid-cols-2 gap-1.5 mt-1">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-6 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ps.border}` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Info */}
                <div className={`p-4 flex items-start justify-between gap-3 ${design.dark ? "bg-stone-950 text-white" : "bg-white"}`}>
                  <div>
                    <p className={`text-[11px] font-black tracking-widest uppercase ${design.dark ? "text-white" : "text-stone-800"}`}>{design.name}</p>
                    <p className={`text-[9px] mt-0.5 ${design.dark ? "text-white/40" : "text-stone-400"}`}>{design.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 bg-primary text-white text-[7px] font-black tracking-widest uppercase px-2 py-1 rounded-full">
                    ATIVO
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-stone-400 tracking-wider">
          💡 A mudança de design é imediata e salva apenas neste dispositivo.
        </p>
      </section>

      <div className="border-t border-primary/5" />

      {/* ========== INVITE DESIGN SELECTOR ========== */}
      <section id="tour-invite-design" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-stone-800">Design do Convite</h2>
            <p className="text-[9px] text-stone-400 tracking-widest uppercase font-medium mt-0.5">Escolha o visual da página de convite do convidado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INVITE_DESIGNS.map((design) => {
            const isSelected = inviteDesign === design.id;
            const INVITE_PREVIEWS: Record<string, React.ReactNode> = {
              editorial: (
                <div className="h-28 bg-gradient-to-b from-sky-50 via-white to-white flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-px bg-current opacity-10" />
                  <p className="text-[6px] tracking-[0.5em] uppercase opacity-20">Para</p>
                  <p className="text-[9px] tracking-[0.3em] uppercase opacity-50 font-serif">Convidado</p>
                  <p className="text-[6px] opacity-20">✦</p>
                  <p className="text-base font-serif tracking-[0.2em] uppercase opacity-60">Sofia</p>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-px bg-current opacity-10" />
                </div>
              ),
              floral: (
                <div className="h-28 bg-white flex flex-col items-center justify-center gap-1.5 relative overflow-hidden">
                  <div className="absolute top-1 left-2 text-base opacity-30">🌸</div>
                  <div className="absolute top-1 right-2 text-base opacity-30">🌿</div>
                  <div className="absolute bottom-1 left-2 text-base opacity-30">🌷</div>
                  <div className="absolute bottom-1 right-2 text-base opacity-30">🌸</div>
                  <p className="text-[7px] tracking-[0.4em] uppercase opacity-30">Para</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase opacity-60 font-serif">Convidado</p>
                  <p className="text-[7px] opacity-30">❀</p>
                  <p className="text-base font-serif tracking-[0.15em] uppercase opacity-60">Sofia</p>
                </div>
              ),
              luxury: (
                <div className="h-28 flex flex-col items-center justify-center gap-2 relative overflow-hidden" style={{ background: "#faf8f3" }}>
                  <div className="absolute inset-3 border opacity-20" style={{ borderColor: "#b8972a" }} />
                  <div className="absolute inset-1.5 border opacity-10" style={{ borderColor: "#b8972a" }} />
                  <p className="text-[6px] tracking-[0.5em] uppercase opacity-30">Para</p>
                  <p className="text-[9px] tracking-[0.3em] uppercase opacity-50 font-serif">Convidado</p>
                  <p className="text-[7px] opacity-40" style={{ color: "#b8972a" }}>◈</p>
                  <p className="text-base font-serif tracking-[0.25em] uppercase opacity-70">Sofia</p>
                </div>
              ),
              modern: (
                <div className="h-28 bg-white flex flex-col justify-center gap-2 relative overflow-hidden px-4">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-70" />
                  <p className="text-[6px] tracking-[0.4em] uppercase opacity-25 font-black ml-4">Para</p>
                  <p className="text-[9px] uppercase opacity-50 font-bold ml-4">Convidado</p>
                  <p className="text-[22px] font-black uppercase leading-none opacity-75 ml-4">Sofia</p>
                </div>
              ),
              romantic: (
                <div className="h-28 bg-gradient-to-b from-rose-50 via-white to-rose-50/30 flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-1 opacity-30">
                    <span className="text-xs text-rose-300">♡</span>
                    <span className="block w-8 h-px bg-rose-200" />
                    <span className="text-xs text-rose-300">♡</span>
                  </div>
                  <p className="text-[7px] tracking-[0.4em] uppercase opacity-30 italic">Para</p>
                  <p className="text-[9px] tracking-[0.2em] uppercase opacity-55 font-serif italic">Convidado</p>
                  <p className="text-base font-serif tracking-[0.15em] uppercase opacity-65">Sofia</p>
                  <div className="flex items-center gap-1 opacity-20">
                    <span className="text-xs text-rose-300">♡</span>
                    <span className="text-[8px] text-rose-300">♡</span>
                    <span className="text-xs text-rose-300">♡</span>
                  </div>
                </div>
              ),
            };
            return (
              <button
                key={design.id}
                onClick={() => setInviteDesign(design.id as InviteDesignId)}
                className={`relative text-left rounded-2xl overflow-hidden transition-all duration-300 group ${
                  isSelected
                    ? "ring-2 ring-primary shadow-xl shadow-primary/10"
                    : "ring-1 ring-stone-200 hover:ring-primary/40 hover:shadow-lg"
                }`}
              >
                {/* Preview */}
                {INVITE_PREVIEWS[design.id]}

                {/* Info */}
                <div className="bg-white p-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black tracking-widest uppercase text-stone-800 flex items-center gap-1.5">
                      <span>{design.icon}</span> {design.name}
                    </p>
                    <p className="text-[9px] mt-0.5 text-stone-400 leading-snug">{design.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-[7px] font-black tracking-widest uppercase px-2 py-1 rounded-full">
                    ATIVO
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-stone-400 tracking-wider">
          💡 Salve as configurações para aplicar o design a todos os convidados.
        </p>
      </section>

      <div className="border-t border-primary/5" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl bg-white rounded-none p-8 space-y-6">
          <div className="flex items-center gap-3 text-primary"><SettingsIcon className="h-4 w-4" /><h3 className="text-xs font-bold tracking-widest uppercase">Convite & Tema</h3></div>
          <div className="space-y-4">
            <div id="tour-invite-url" className="space-y-2">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Imagem do Convite</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {invitationUrl ? (
                <div className="relative w-full aspect-[9/16] max-h-64 bg-stone-100 border border-stone-200 overflow-hidden">
                  <Image src={invitationUrl} alt="Convite" fill className="object-contain" unoptimized />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-2 right-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5 hover:bg-stone-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Trocar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-28 border-2 border-dashed border-stone-200 bg-stone-50 hover:bg-stone-100 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin text-stone-400" /> : <ImageIcon className="h-5 w-5 text-stone-300" />}
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    {uploading ? "Enviando..." : "Clique para fazer upload"}
                  </span>
                </button>
              )}
              <Input value={invitationUrl} onChange={e => setInvitationUrl(e.target.value)} className="rounded-none h-10 bg-stone-50 text-[11px]" placeholder="Ou cole uma URL externa..." />
            </div>

            {/* Convites por tamanho de fralda */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-3 border-t border-primary/5 pt-5">
                <div>
                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Convite por Tamanho de Fralda</p>
                  <p className="text-[9px] text-stone-400 mt-1">Cada convidado verá o convite do seu tamanho automaticamente.</p>
                </div>
                <input ref={sizeFileRef} type="file" accept="image/*" className="hidden" onChange={handleSizeImageUpload} />
                <div className="grid grid-cols-1 gap-4">
                  {uniqueSizes.map(size => (
                    <div key={size} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Tamanho {size}</label>
                        {sizeImages[size] && (
                          <button type="button" onClick={() => setSizeImages(p => { const n = {...p}; delete n[size]; return n; })}
                            className="text-[10px] text-red-400 hover:text-red-600 font-semibold">Remover</button>
                        )}
                      </div>
                      {sizeImages[size] ? (
                        <div className="relative bg-stone-100 border border-stone-200 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sizeImages[size]} alt={`Convite ${size}`} style={{ width: "100%", height: "auto", maxHeight: "160px", objectFit: "contain" }} />
                          <button type="button" onClick={() => { setCurrentUploadSize(size); sizeFileRef.current?.click(); }}
                            disabled={uploadingSize === size}
                            className="absolute bottom-2 right-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5 hover:bg-stone-700 transition-colors disabled:opacity-50">
                            {uploadingSize === size ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            Trocar
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => { setCurrentUploadSize(size); sizeFileRef.current?.click(); }}
                          disabled={uploadingSize === size}
                          className="w-full h-20 border-2 border-dashed border-stone-200 bg-stone-50 hover:bg-stone-100 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                          {uploadingSize === size ? <Loader2 className="h-4 w-4 animate-spin text-stone-400" /> : <Upload className="h-4 w-4 text-stone-300" />}
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            {uploadingSize === size ? "Enviando..." : `Upload convite tamanho ${size}`}
                          </span>
                        </button>
                      )}
                      <Input value={sizeImages[size] || ""} onChange={e => setSizeImages(p => ({ ...p, [size]: e.target.value }))}
                        className="rounded-none h-9 bg-stone-50 text-[11px]" placeholder="Ou cole uma URL externa..." />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div id="tour-theme" className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Tema Visual</label><Select value={theme} onValueChange={(v) => v && setTheme(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent>{THEMES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
            <div id="tour-fonts" className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Fonte do Convite</label><Select value={inviteFont} onValueChange={(v) => v && setInviteFont(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Playfair Display">Playfair Display</SelectItem><SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem><SelectItem value="Dancing Script">Dancing Script</SelectItem><SelectItem value="Great Vibes">Great Vibes</SelectItem><SelectItem value="Lora">Lora</SelectItem><SelectItem value="Cinzel">Cinzel</SelectItem></SelectContent></Select></div>
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Tamanho da Fonte (Convite)</label><Input type="number" value={inviteFontSize} onChange={e => setInviteFontSize(Number(e.target.value))} className="rounded-none h-12 bg-stone-50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Fonte do Sistema (Painel)</label><Select value={systemFont} onValueChange={(v) => v && setSystemFont(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Inter">Inter</SelectItem><SelectItem value="Outfit">Outfit</SelectItem><SelectItem value="DM Sans">DM Sans</SelectItem><SelectItem value="Plus Jakarta Sans">Plus Jakarta Sans</SelectItem></SelectContent></Select></div>
               <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Tamanho da Fonte (Painel)</label><Input type="number" value={systemFontSize} onChange={e => setSystemFontSize(Number(e.target.value))} className="rounded-none h-12 bg-stone-50" /></div>
            </div>
            <div id="tour-baby" className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Nome do Bebê</label><Input value={babyName} onChange={e => setBabyName(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="Ex: Arthur ou Helena" /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Sexo do Bebê</label><Select value={babyGender} onValueChange={(v) => v && setBabyGender(v)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">NÃO DEFINIDO</SelectItem><SelectItem value="BOY">MENINO (AZUL)</SelectItem><SelectItem value="GIRL">MENINA (ROSA)</SelectItem></SelectContent></Select></div>
            </div>
            <div id="tour-show-image" className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Exibir Imagem do Convite</label><Select value={showInvitationImage ? "SIM" : "NAO"} onValueChange={(v) => setShowInvitationImage(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">SIM</SelectItem><SelectItem value="NAO">NÃO</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Animações do Sistema</label><Select value={enableAnimations ? "SIM" : "NAO"} onValueChange={(v) => setEnableAnimations(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">LIGADAS</SelectItem><SelectItem value="NAO">DESLIGADAS</SelectItem></SelectContent></Select></div>

            {/* Visibilidade dos campos do convite */}
            <div className="col-span-2 space-y-3 border-t border-primary/5 pt-5">
              <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Campos Visíveis no Convite</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Quando (Data)</label><Select value={showEventDate ? "SIM" : "NAO"} onValueChange={(v) => setShowEventDate(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">EXIBIR</SelectItem><SelectItem value="NAO">OCULTAR</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Onde (Local)</label><Select value={showEventAddress ? "SIM" : "NAO"} onValueChange={(v) => setShowEventAddress(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">EXIBIR</SelectItem><SelectItem value="NAO">OCULTAR</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Presente</label><Select value={showGiftSection ? "SIM" : "NAO"} onValueChange={(v) => setShowGiftSection(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">EXIBIR</SelectItem><SelectItem value="NAO">OCULTAR</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Recado</label><Select value={showMessageSection ? "SIM" : "NAO"} onValueChange={(v) => setShowMessageSection(v === "SIM")}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SIM">EXIBIR</SelectItem><SelectItem value="NAO">OCULTAR</SelectItem></SelectContent></Select></div>
              </div>
            </div>
            <div id="tour-whatsapp" className="space-y-1">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Template WhatsApp</label>
              <textarea
                value={whatsappTemplate}
                onChange={e => setWhatsappTemplate(e.target.value)}
                className="w-full h-28 rounded-none bg-stone-50 border border-input px-4 py-3 text-[11px] font-mono resize-none"
                placeholder={'Use {nome}, {data}, {endereco}, {link}, {bebe}\n\nEx:\nOlá {nome}! Você foi convidado para o Chá do {bebe}!\nData: {data}\nLocal: {endereco}\nConfirme aqui: {link}'}
              />
              <p className="text-[8px] opacity-30 tracking-wider mt-1">Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{endereco}'}, {'{link}'}, {'{bebe}'}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          <Card id="tour-event-date" className="border-none shadow-2xl bg-white rounded-none p-8 space-y-6">
            <div className="flex items-center gap-3 text-primary"><Calendar className="h-4 w-4" /><h3 className="text-xs font-bold tracking-widest uppercase">Data & Local</h3></div>
            <div className="space-y-4">
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Data do Evento</label><Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-none h-12 bg-stone-50" /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Endereço Exibido</label><Input value={eventAddress} onChange={e => setEventAddress(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="Rua exemplo, 123" /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Link Google Maps</label><Input value={eventMapsUrl} onChange={e => setEventMapsUrl(e.target.value)} className="rounded-none h-12 bg-stone-50" placeholder="https://goo.gl/maps/..." /></div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
