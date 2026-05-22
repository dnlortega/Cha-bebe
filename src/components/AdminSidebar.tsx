"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Users,
  UserPlus,
  ClipboardList,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Info,
  Package,
  History,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ALL_MENU_ITEMS = [
  // Existing items

  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { title: "Convites", icon: Users, href: "/admin/guests" },
  { title: "Histórico", icon: History, href: "/admin/history" },
  { title: "Cadastrar", icon: UserPlus, href: "/admin/add" },
  { title: "Lista Final", icon: ClipboardList, href: "/admin/final-list" },
  { title: "Presentes", icon: Package, href: "/admin/gifts" },
  // New access item (visible only to master admins)
  { title: "Acessos", icon: ShieldAlert, href: "/admin/access" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [allowedScreens, setAllowedScreens] = useState<string>("ALL");

  useEffect(() => {
    setAvatarUrl(localStorage.getItem("admin_avatar") || null);
    setAdminEmail(localStorage.getItem("admin_username") || null);
    setAllowedScreens(localStorage.getItem("admin_allowed_screens") || "ALL");

    const checkMaster = async () => {
      const token = localStorage.getItem("admin_session_token") || "";
      const masterEmail = "dnlortega@gmail.com";
      const savedUser = localStorage.getItem("admin_username") || "";
      if (savedUser.toLowerCase() === masterEmail.toLowerCase()) {
        setIsMaster(true);
      }
      const { isMasterAdmin } = await import("@/app/actions");
      const realMaster = await isMasterAdmin(token);
      setIsMaster(realMaster);
    };
    checkMaster();
  }, []);

  const visibleMenuItems = ALL_MENU_ITEMS.filter((item) => {
    if (item.href === "/admin/access") return isMaster;
    if (allowedScreens === "ALL") return true;
    if (item.href === "/admin") return true;
    const allowedList = allowedScreens.split(",").map((s) => s.trim());
    return allowedList.includes(item.title);
  });

  const getInitials = (email: string | null) => {
    if (!email) return "A";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_authorized");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_avatar");
    localStorage.removeItem("admin_allowed_screens");
    localStorage.removeItem("admin_session_token");
    window.location.href = "/";
  };

  const SidebarContent = ({ showLabels = false }: { showLabels?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center border-b border-primary/5 py-5", showLabels ? "px-5 gap-3" : "hidden lg:flex justify-center px-3")}>
        <div className="w-9 h-9 relative bg-stone-900 shadow-lg p-1.5 border border-white/5 flex-shrink-0">
          <Image src="/icon.png" alt="Logo" fill className="object-cover" />
        </div>
        {showLabels && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Admin</p>
            <p className="text-[8px] opacity-30 tracking-widest uppercase">Painel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 p-2 space-y-1 py-6", !showLabels && "pt-20 lg:pt-6")}>
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center py-3 transition-all duration-200 group rounded-none",
                showLabels ? "px-3 gap-3" : "justify-center px-3",
                isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-stone-500 hover:bg-stone-50 hover:text-primary"
              )}
              title={item.title}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all",
                  isActive ? "text-white" : "opacity-50 group-hover:opacity-100"
                )}
              />
              {showLabels && (
                <span className={cn("text-[10px] font-bold tracking-[0.2em] uppercase", isActive ? "text-white" : "group-hover:text-primary")}>
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Avatar + dropdown */}
      <div className="p-2 border-t border-primary/5 pb-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-2 hover:bg-stone-50 rounded-md transition-colors",
                !showLabels && "justify-center"
              )}
              title="Opções da conta"
            >
              {avatarUrl ? (
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  {isMaster && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" title="Administrador Principal" />}
                </div>
              ) : (
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary shadow-lg flex items-center justify-center ring-2 ring-primary/20">
                    <span className="text-white text-[9px] font-black tracking-wider">{getInitials(adminEmail)}</span>
                  </div>
                  {isMaster && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm" title="Administrador Principal" />}
                </div>
              )}
              {showLabels && adminEmail && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[9px] font-bold tracking-wider text-stone-700 truncate uppercase">{isMaster ? "Master" : "Operador"}</p>
                  <p className="text-[8px] text-stone-400 truncate">{adminEmail}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={showLabels ? "center" : "start"} side={showLabels ? "bottom" : "right"} className="w-56 z-[70] mb-2 ml-2 shadow-xl border-primary/10">
            <div className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-stone-400">Minha Conta</div>
            <DropdownMenuSeparator />
            {(isMaster || allowedScreens === "ALL" || allowedScreens.includes("Visual")) && (
              <DropdownMenuItem render={<Link href="/admin/visual" className="cursor-pointer w-full flex items-center gap-3 py-3" />}>
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">Visual</span>
              </DropdownMenuItem>
            )}
            {(isMaster || allowedScreens === "ALL" || allowedScreens.includes("Sobre")) && (
              <DropdownMenuItem render={<Link href="/admin/about" className="cursor-pointer w-full flex items-center gap-3 py-3" />}>
                <Info className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">Sobre</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isMaster && (
              <DropdownMenuItem render={<Link href="/admin/access" className="cursor-pointer w-full flex items-center gap-3 py-3" />}>
                <ShieldAlert className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">Acessos e Permissões</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer w-full flex items-center gap-3 py-3"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-20 h-screen bg-white border-r border-primary/8 flex-col fixed left-0 top-0 z-50 shadow-sm">
        <SidebarContent showLabels={false} />
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-primary/5 z-50 flex justify-around py-2">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn("flex flex-col items-center justify-center py-1", isActive ? "text-primary" : "text-stone-500")}
              title={item.title}
            >
                <item.icon className="h-6 w-6" />
            </Link>
          );
        })}
        {/* Logout button */}
        {/* Avatar button (logout) */}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center py-1" title="Conta">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-6 w-6 flex items-center justify-center bg-primary/80 rounded-full text-white text-xs font-bold">
              {getInitials(adminEmail)}
            </div>
          )}
        </button>
          <LogOut className="h-6 w-6" />
          <span className="text-xs mt-0.5">Sair</span>
        </button>
      </nav>
    </>
  );
}
