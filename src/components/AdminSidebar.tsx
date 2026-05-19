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
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Convites",
    icon: Users,
    href: "/admin/guests",
  },
  {
    title: "Histórico",
    icon: History,
    href: "/admin/history",
  },
  {
    title: "Cadastrar",
    icon: UserPlus,
    href: "/admin/add",
  },
  {
    title: "Lista Final",
    icon: ClipboardList,
    href: "/admin/final-list",
  },
  {
    title: "Presentes",
    icon: Package,
    href: "/admin/gifts",
  },
  {
    title: "Acessos",
    icon: ShieldAlert,
    href: "/admin/access",
  },
  {
    title: "Visual",
    icon: Settings,
    href: "/admin/visual",
  },
  {
    title: "Sobre",
    icon: Info,
    href: "/admin/about",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    const checkMaster = async () => {
      const token = localStorage.getItem("admin_session_token") || "";
      const masterEmail = "dnlortega@gmail.com";
      
      // Fast local storage-based check for instant client render
      const savedUser = localStorage.getItem("admin_username") || "";
      if (savedUser.toLowerCase() === masterEmail.toLowerCase()) {
        setIsMaster(true);
      }
      
      // Strict server-side verification double check
      const { isMasterAdmin } = await import("@/app/actions");
      const realMaster = await isMasterAdmin(token);
      setIsMaster(realMaster);
    };
    checkMaster();
  }, []);

  const visibleMenuItems = menuItems.filter(item => {
    if (item.href === "/admin/access") {
      return isMaster;
    }
    return true;
  });

  // Icon-only on desktop; labeled in mobile drawer
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
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center py-3 transition-all duration-200 group rounded-none",
                showLabels ? "px-3 gap-3" : "justify-center px-3",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-stone-500 hover:bg-stone-50 hover:text-primary"
              )}
              title={item.title}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-all",
                isActive ? "text-white" : "opacity-50 group-hover:opacity-100"
              )} />
              {showLabels && (
                <span className={cn(
                  "text-[10px] font-bold tracking-[0.2em] uppercase",
                  isActive ? "text-white" : "group-hover:text-primary"
                )}>
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-primary/5 pb-5">
        <button
          onClick={() => { 
            sessionStorage.removeItem("admin_auth"); 
            localStorage.removeItem("admin_authorized"); 
            localStorage.removeItem("admin_username"); 
            window.location.href = "/"; 
          }}
          className={cn(
            "w-full flex items-center py-3 px-3 text-red-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 rounded-none",
            showLabels ? "gap-3" : "justify-center"
          )}
          title="Sair"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {showLabels && <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border-primary/20 rounded-none shadow-xl h-10 w-10"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar — icon only */}
      <aside className="hidden lg:flex w-20 h-screen bg-white border-r border-primary/8 flex-col fixed left-0 top-0 z-50 shadow-sm">
        <SidebarContent showLabels={false} />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar — icons only */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-screen w-20 bg-white z-[55] flex flex-col transition-transform duration-300 ease-in-out border-r border-primary/10 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent showLabels={false} />
      </aside>
    </>
  );
}
