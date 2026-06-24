"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useDarkMode } from "@/components/DarkModeProvider";
import {
  Users,
  UserPlus,
  ClipboardList,
  Settings,
  LayoutDashboard,
  LogOut,
  Info,
  Package,
  History,
  ShieldAlert,
  CalendarPlus,
  Moon,
  Sun,
  UserCog,
  Zap,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_COLLABORATOR_SCREEN_TITLES } from "@/lib/eventAccess";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ALL_MENU_ITEMS = [
  { title: "Eventos", icon: CalendarPlus, href: "/admin/events", requiresEvent: false, hideLabel: false, color: "#a78bfa" },
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin", requiresEvent: true, hideLabel: false, color: "#60a5fa" },
  { title: "Convites", icon: Users, href: "/admin/guests", requiresEvent: true, hideLabel: false, color: "#34d399" },
  { title: "Histórico", icon: History, href: "/admin/history", requiresEvent: true, hideLabel: false, color: "#fbbf24" },
  { title: "Cadastrar", icon: UserPlus, href: "/admin/add", requiresEvent: true, hideLabel: false, color: "#f472b6" },
  { title: "Lista Final", icon: ClipboardList, href: "/admin/final-list", requiresEvent: true, hideLabel: false, color: "#38bdf8" },
  { title: "Presentes", icon: Package, href: "/admin/gifts", requiresEvent: true, hideLabel: false, color: "#fb923c" },
  { title: "Acessos", icon: ShieldAlert, href: "/admin/access", requiresEvent: true, hideLabel: false, color: "#f87171" },
  { title: "Usuários", icon: UserCog, href: "/admin/users", requiresEvent: false, hideLabel: false, color: "#c084fc", masterOnly: true },
];

type DarkScheme = {
  sidebarBg: string;
  border: string;
  shadow: string;
  accent: string;
  navLabel: string;
  itemText: string;
  itemHover: string;
  dropdownBg: string;
  dropdownBorder: string;
};

const DARK_SCHEMES: Record<string, DarkScheme> = {
  premium: {
    sidebarBg: "linear-gradient(165deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
    border: "rgba(255,255,255,0.06)", shadow: "4px 0 40px rgba(0,0,0,0.5)",
    accent: "#818cf8", navLabel: "rgba(255,255,255,0.2)", itemText: "rgba(255,255,255,0.5)",
    itemHover: "rgba(255,255,255,0.05)", dropdownBg: "#1a1a2e", dropdownBorder: "rgba(255,255,255,0.08)",
  },
  neon: {
    sidebarBg: "linear-gradient(165deg, #020802 0%, #061606 60%, #031003 100%)",
    border: "rgba(0,220,100,0.1)", shadow: "4px 0 40px rgba(0,80,30,0.3)",
    accent: "#00dc64", navLabel: "rgba(0,220,100,0.35)", itemText: "rgba(255,255,255,0.45)",
    itemHover: "rgba(0,220,100,0.06)", dropdownBg: "#020802", dropdownBorder: "rgba(0,220,100,0.12)",
  },
  ocean: {
    sidebarBg: "linear-gradient(165deg, #071828 0%, #0d2740 55%, #071e35 100%)",
    border: "rgba(56,189,248,0.1)", shadow: "4px 0 40px rgba(0,80,150,0.3)",
    accent: "#38bdf8", navLabel: "rgba(56,189,248,0.35)", itemText: "rgba(255,255,255,0.45)",
    itemHover: "rgba(56,189,248,0.06)", dropdownBg: "#071828", dropdownBorder: "rgba(56,189,248,0.12)",
  },
  rose: {
    sidebarBg: "linear-gradient(165deg, #1a0a14 0%, #2e1222 55%, #1a0a14 100%)",
    border: "rgba(244,114,182,0.1)", shadow: "4px 0 40px rgba(150,30,80,0.25)",
    accent: "#f472b6", navLabel: "rgba(244,114,182,0.35)", itemText: "rgba(255,255,255,0.45)",
    itemHover: "rgba(244,114,182,0.06)", dropdownBg: "#1a0a14", dropdownBorder: "rgba(244,114,182,0.12)",
  },
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [allowedScreens, setAllowedScreens] = useState<string>("ALL");
  const [isEventCollaborator, setIsEventCollaborator] = useState(false);
  const [hasActiveEvent, setHasActiveEvent] = useState(false);
  const [panelDesign, setPanelDesign] = useState("classic");

  useEffect(() => {
    setAvatarUrl(localStorage.getItem("admin_avatar") || null);
    setAdminEmail(localStorage.getItem("admin_username") || null);
    setAllowedScreens(localStorage.getItem("admin_allowed_screens") || "ALL");
    setIsEventCollaborator(localStorage.getItem("event_collaborator") === "true");

    const design = localStorage.getItem("admin_panel_design") || "classic";
    setPanelDesign(design);

    const checkEvent = async () => {
      const { validateActiveEventAccess } = await import("@/app/eventCookieActions");
      const user = localStorage.getItem("admin_username") || "";
      const active = await validateActiveEventAccess(user);
      setHasActiveEvent(active);
    };
    checkEvent();

    const checkMaster = async () => {
      const token = localStorage.getItem("admin_session_token") || "";
      const savedUser = localStorage.getItem("admin_username") || "";
      const masterEmail = "dnlortega@gmail.com";
      if (savedUser.toLowerCase() === masterEmail.toLowerCase()) {
        setIsMaster(true);
      }
      const { isMasterAdmin } = await import("@/app/actions");
      const realMaster = await isMasterAdmin(token);
      setIsMaster(realMaster);
    };
    checkMaster();
  }, [pathname]);

  // Apply panel class to body based on active design
  useEffect(() => {
    const allClasses = ["panel-premium", "panel-neon", "panel-ocean", "panel-rose"];
    allClasses.forEach(c => document.body.classList.remove(c));
    if (panelDesign !== "classic") {
      document.body.classList.add(`panel-${panelDesign}`);
    }
    return () => allClasses.forEach(c => document.body.classList.remove(c));
  }, [panelDesign]);

  // Listen for design changes from visual settings page
  useEffect(() => {
    const handler = () => {
      const design = localStorage.getItem("admin_panel_design") || "classic";
      setPanelDesign(design);
    };
    window.addEventListener("admin-design-changed", handler);
    return () => window.removeEventListener("admin-design-changed", handler);
  }, []);

  const visibleMenuItems = ALL_MENU_ITEMS.filter((item) => {
    if ((item as any).masterOnly) return isMaster;
    if (item.href === "/admin/access") return isMaster && hasActiveEvent;
    if (item.requiresEvent && !hasActiveEvent) return false;
    if (item.href === "/admin/events") return true;
    if (isEventCollaborator) {
      return (EVENT_COLLABORATOR_SCREEN_TITLES as readonly string[]).includes(item.title);
    }
    if (allowedScreens === "ALL") return true;
    if (item.href === "/admin") return hasActiveEvent;
    const allowedList = allowedScreens.split(",").map((s) => s.trim());
    return allowedList.includes(item.title);
  });

  const getInitials = (email: string | null) => {
    if (!email) return "A";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  };

  const handleLogout = async () => {
    const { clearActiveEventCookie } = await import("@/app/eventCookieActions");
    await clearActiveEventCookie();
    sessionStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_authorized");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_avatar");
    localStorage.removeItem("admin_allowed_screens");
    localStorage.removeItem("event_collaborator");
    localStorage.removeItem("admin_session_token");
    window.location.href = "/";
  };

  const isDark = panelDesign !== "classic";
  const scheme = DARK_SCHEMES[panelDesign] ?? DARK_SCHEMES.premium;

  if (isDark) {
    return <DarkSidebar
      scheme={scheme}
      pathname={pathname}
      visibleMenuItems={visibleMenuItems}
      avatarUrl={avatarUrl}
      adminEmail={adminEmail}
      isMaster={isMaster}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      getInitials={getInitials}
      handleLogout={handleLogout}
      allowedScreens={allowedScreens}
    />;
  }

  return <ClassicSidebar
    pathname={pathname}
    visibleMenuItems={visibleMenuItems}
    avatarUrl={avatarUrl}
    adminEmail={adminEmail}
    isMaster={isMaster}
    isDarkMode={isDarkMode}
    toggleDarkMode={toggleDarkMode}
    getInitials={getInitials}
    handleLogout={handleLogout}
    allowedScreens={allowedScreens}
  />;
}

// ============================================================
// CLASSIC SIDEBAR — expanded: labels + colored icons
// ============================================================

function ClassicSidebar({ pathname, visibleMenuItems, avatarUrl, adminEmail, isMaster, isDarkMode, toggleDarkMode, getInitials, handleLogout, allowedScreens }: any) {
  return (
    <>
      {/* Desktop sidebar — 220px, always expanded */}
      <aside className="hidden lg:flex w-[220px] h-screen bg-white dark:bg-stone-950 border-r border-stone-100 dark:border-stone-800 flex-col fixed left-0 top-0 z-50 shadow-sm admin-sidebar">
        {/* Account button */}
        <div className="border-b border-stone-100 dark:border-stone-800 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-lg transition-colors" title="Opções da conta">
                {avatarUrl && avatarUrl !== "null" ? (
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => {}} />
                    </div>
                    {isMaster && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm" title="Master" />}
                  </div>
                ) : (
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary shadow flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-white text-xs font-black">{getInitials(adminEmail)}</span>
                    </div>
                    {isMaster && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm" />}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-200 truncate">{isMaster ? "Master Admin" : "Operador"}</p>
                  <p className="text-[10px] text-stone-400 truncate">{adminEmail}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom" className="w-56 z-[70] shadow-xl border-stone-100">
              <div className="px-3 py-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Minha Conta</span>
                {adminEmail && <p className="text-xs text-stone-600 truncate font-medium mt-0.5">{adminEmail}</p>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/admin/events" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3" />}>
                <CalendarPlus className="h-4 w-4" style={{ color: "#a78bfa" }} />
                <span className="text-xs font-semibold text-stone-700">Trocar Evento</span>
              </DropdownMenuItem>
              {(isMaster || allowedScreens === "ALL" || allowedScreens.includes("Visual")) && (
                <DropdownMenuItem render={<Link href="/admin/visual" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3" />}>
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-stone-700">Visual & Config</span>
                </DropdownMenuItem>
              )}
              {(isMaster || allowedScreens === "ALL" || allowedScreens.includes("Sobre")) && (
                <DropdownMenuItem render={<Link href="/admin/about" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3" />}>
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-stone-700">Sobre</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-3 py-2.5 px-3" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                <span className="text-xs font-semibold text-stone-700">{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isMaster && (
                <DropdownMenuItem render={<Link href="/admin/access" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3" />}>
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-stone-700">Acessos e Permissões</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center gap-3 py-2.5 px-3" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-semibold">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 pt-4 space-y-0.5 overflow-y-hidden">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-stone-400 dark:text-stone-600 px-3 pb-3">Navegação</p>
          {visibleMenuItems.map((item: any) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "hover:bg-stone-50 dark:hover:bg-stone-900"
                )}
                title={item.title}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isActive ? "bg-white/20" : "bg-stone-50 dark:bg-stone-900 group-hover:scale-105"
                )}>
                  <item.icon
                    className="h-4 w-4"
                    style={{ color: isActive ? "white" : item.color }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-semibold tracking-wide",
                  isActive ? "text-white" : "text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="border-t border-stone-100 dark:border-stone-800 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 group transition-colors"
            title="Sair"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
              <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-red-400 group-hover:text-red-600 transition-colors">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — icons + tiny labels */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 z-50 flex justify-around py-2 px-1">
        {visibleMenuItems.slice(0, 6).map((item: any) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-1 gap-0.5 min-w-0"
              title={item.title}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" style={{ color: isActive ? "var(--primary)" : item.color, opacity: isActive ? 1 : 0.6 }} />
              <span className="text-[9px] font-semibold" style={{ color: isActive ? "var(--primary)" : "#78716c" }}>
                {item.title.slice(0, 7)}
              </span>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center py-1 gap-0.5" title="Sair">
          {avatarUrl && avatarUrl !== "null" ? (
            <img src={avatarUrl} alt="Avatar" className="h-6 w-6 rounded-full object-cover opacity-70" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-6 w-6 flex items-center justify-center bg-primary/80 rounded-full text-white text-xs font-bold">
              {getInitials(adminEmail)}
            </div>
          )}
          <span className="text-[9px] font-semibold text-stone-400">Conta</span>
        </button>
      </nav>
    </>
  );
}

// ============================================================
// DARK SIDEBAR (Premium / Neon / Ocean / Rose)
// ============================================================

function DarkSidebar({ scheme, pathname, visibleMenuItems, avatarUrl, adminEmail, isMaster, isDarkMode, toggleDarkMode, getInitials, handleLogout, allowedScreens }: any) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Sync collapse state with body class so CSS can adjust content padding
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("panel-collapsed");
    } else {
      document.body.classList.remove("panel-collapsed");
    }
    return () => document.body.classList.remove("panel-collapsed");
  }, [isCollapsed]);

  const sidebarWidth = isCollapsed ? "w-20" : "w-[280px]";

  return (
    <>
      {/* Desktop Dark Sidebar */}
      <aside
        className={cn(
          "admin-sidebar hidden lg:flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
          sidebarWidth
        )}
        style={{
          background: scheme.sidebarBg,
          borderRight: `1px solid ${scheme.border}`,
          boxShadow: scheme.shadow,
        }}
      >
        {/* Logo / Brand */}
        <div className={cn(
          "flex items-center border-b transition-all duration-300",
          isCollapsed ? "justify-center px-3 py-5" : "px-5 py-5 gap-3",
          "border-white/5"
        )}>
          <div className="relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white/10 shadow-xl">
            <Image src="/icon.png" alt="Logo" fill className="object-cover" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-[11px] font-black tracking-[0.2em] text-white uppercase truncate">Chá de Bebê</p>
              <p className="text-[8px] text-white/30 tracking-[0.3em] uppercase font-medium">Painel Admin</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(c => !c)}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/10",
              isCollapsed ? "mt-0" : ""
            )}
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
          </button>
        </div>

        {/* Avatar Section */}
        <div className={cn(
          "border-b border-white/5 transition-all duration-300",
          isCollapsed ? "px-3 py-4 flex justify-center" : "px-4 py-4"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group",
                  isCollapsed ? "justify-center" : "",
                  "hover:bg-white/5"
                )}
              >
                <div className="relative flex-shrink-0">
                  {avatarUrl && avatarUrl !== "null" ? (
                    <div className={cn(
                      "rounded-full overflow-hidden shadow-xl ring-2",
                      isCollapsed ? "w-9 h-9 ring-white/20" : "w-10 h-10 ring-white/15"
                    )}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => {}} />
                    </div>
                  ) : (
                    <div className={cn(
                      "rounded-full flex items-center justify-center shadow-xl ring-2",
                      isCollapsed ? "w-9 h-9 ring-white/20" : "w-10 h-10 ring-white/15",
                    )} style={{ background: "linear-gradient(135deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 70%, #fff) 100%)" }}>
                      <span className="text-white text-[11px] font-black">{getInitials(adminEmail)}</span>
                    </div>
                  )}
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f0f0f] shadow-sm" />
                  {isMaster && !isCollapsed && (
                    <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1 text-left animate-in fade-in slide-in-from-left-2 duration-300">
                    <p className="text-[11px] font-bold text-white truncate">
                      {isMaster ? "Master Admin" : "Operador"}
                    </p>
                    <p className="text-[8px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{adminEmail || "—"}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              sideOffset={8}
              className="w-60 z-[70] shadow-2xl rounded-xl border-white/10"
              style={{ background: scheme.dropdownBg, borderColor: scheme.dropdownBorder }}
            >
              <div className="px-3 py-3">
                <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Minha Conta</span>
                {adminEmail && <p className="text-[11px] text-white/80 truncate font-medium mt-0.5">{adminEmail}</p>}
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem render={<Link href="/admin/events" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3 rounded-lg" />}
                className="focus:bg-white/5 mx-1 rounded-lg"
              >
                <CalendarPlus className="h-4 w-4 text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Trocar Evento</span>
              </DropdownMenuItem>
              {(isMaster || allowedScreens === "ALL" || allowedScreens.includes("Visual")) && (
                <DropdownMenuItem render={<Link href="/admin/visual" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3 rounded-lg" />}
                  className="focus:bg-white/5 mx-1 rounded-lg"
                >
                  <Settings className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Visual & Config</span>
                </DropdownMenuItem>
              )}
              {(isMaster || allowedScreens === "ALL" || allowedScreens.includes("Sobre")) && (
                <DropdownMenuItem render={<Link href="/admin/about" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3 rounded-lg" />}
                  className="focus:bg-white/5 mx-1 rounded-lg"
                >
                  <Info className="h-4 w-4 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Sobre</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="cursor-pointer focus:bg-white/5 mx-1 rounded-lg py-2.5 px-3" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                  {isDarkMode ? "Modo Claro" : "Modo Escuro"}
                </span>
              </DropdownMenuItem>
              {isMaster && (
                <>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem render={<Link href="/admin/access" className="cursor-pointer w-full flex items-center gap-3 py-2.5 px-3 rounded-lg" />}
                    className="focus:bg-white/5 mx-1 rounded-lg"
                  >
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Acessos e Permissões</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer mx-1 rounded-lg py-2.5 px-3 mb-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-hidden">
          {!isCollapsed && (
            <p className="text-[8px] font-black tracking-[0.4em] uppercase px-3 pb-2 animate-in fade-in duration-300"
              style={{ color: scheme.navLabel }}>
              Navegação
            </p>
          )}
          {visibleMenuItems.map((item: any) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "flex items-center gap-3 transition-all duration-200 group relative",
                  isCollapsed ? "justify-center px-3 py-3 rounded-xl" : "px-3 py-2.5 rounded-xl",
                  isActive
                    ? "text-white"
                    : ""
                )}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}11 100%)`,
                  border: `1px solid ${item.color}33`,
                } : hoveredItem === item.href ? { background: scheme.itemHover } : {}}
                title={isCollapsed ? item.title : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                    style={{ background: item.color }}
                  />
                )}

                {/* Icon with colored background when active */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  isActive ? "shadow-lg" : "group-hover:scale-110"
                )} style={isActive ? { background: `${item.color}22`, boxShadow: `0 4px 12px ${item.color}33` } : {}}>
                  <item.icon
                    className="h-4 w-4 flex-shrink-0 transition-all"
                    style={{ color: isActive ? item.color : (hoveredItem === item.href ? item.color : scheme.itemText) }}
                  />
                </div>

                {!isCollapsed && (
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase transition-all duration-200 animate-in fade-in slide-in-from-left-1 duration-300"
                    style={{ color: isActive ? "#fff" : scheme.itemText }}
                  >
                    {item.title}
                  </span>
                )}

                {/* Active dot for collapsed mode */}
                {isActive && isCollapsed && (
                  <span
                    className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: item.color }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-white/5 p-3 transition-all duration-300",
          isCollapsed ? "flex justify-center" : "flex items-center gap-2"
        )}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-red-500/10 group w-full"
            title="Sair"
          >
            <LogOut className="h-4 w-4 text-red-400/60 group-hover:text-red-400 transition-colors flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-400/50 group-hover:text-red-400 transition-colors animate-in fade-in duration-300">
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav (premium version) */}
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex justify-around items-center py-2 px-2"
        style={{
          background: scheme.sidebarBg,
          borderTop: `1px solid ${scheme.border}`,
          boxShadow: scheme.shadow
        }}
      >
        {visibleMenuItems.slice(0, 5).map((item: any) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-1 gap-0.5 relative"
              title={item.title}
            >
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: item.color }} />
              )}
              <item.icon
                className="h-5 w-5 transition-all"
                style={{ color: isActive ? item.color : scheme.itemText }}
              />
              <span className="text-[7px] font-bold tracking-wider" style={{ color: isActive ? item.color : scheme.itemText }}>
                {item.title.slice(0, 6)}
              </span>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center py-1 gap-0.5" title="Conta">
          {avatarUrl && avatarUrl !== "null" ? (
            <img src={avatarUrl} alt="Avatar" className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-5 w-5 flex items-center justify-center rounded-full text-white text-[8px] font-black"
              style={{ background: "var(--primary)" }}>
              {getInitials(adminEmail)}
            </div>
          )}
          <span className="text-[7px] font-bold tracking-wider" style={{ color: scheme.itemText }}>Sair</span>
        </button>
      </nav>
    </>
  );
}
