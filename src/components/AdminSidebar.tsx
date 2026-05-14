"use client";

import { useState } from "react";
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
  ChevronRight,
  Menu,
  X,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "DASHBOARD",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "CONVITES",
    icon: Users,
    href: "/admin/guests",
  },
  {
    title: "CADASTRAR",
    icon: UserPlus,
    href: "/admin/add",
  },
  {
    title: "LISTA FINAL",
    icon: ClipboardList,
    href: "/admin/final-list",
  },
  {
    title: "VISUAL",
    icon: Settings,
    href: "/admin/visual",
  },
  {
    title: "SOBRE",
    icon: Info,
    href: "/admin/about",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="py-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 relative bg-stone-900 shadow-xl p-2 border border-white/10">
           <Image 
              src="/icon.png" 
              alt="Logo" 
              fill 
              className="object-cover" 
           />
        </div>
      </div>

      <Separator className="bg-primary/5 mx-6 w-auto" />

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center justify-center p-4 transition-all duration-300 group rounded-none",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-primary/60 hover:bg-primary/5 hover:text-primary"
              )}
              title={item.title}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "opacity-60 group-hover:opacity-100")} />
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button 
          onClick={() => {
            sessionStorage.removeItem("admin_auth");
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center p-4 text-red-500/60 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300"
          title="SAIR"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border-primary/20 rounded-none shadow-xl"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-24 h-screen bg-white border-r border-primary/10 flex-col fixed left-0 top-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[50] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-screen w-24 bg-white z-[55] flex flex-col transition-transform duration-300 ease-in-out border-r border-primary/10",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}

