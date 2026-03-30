"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  FileEdit, 
  FileText, 
  History, 
  LogOut,
  Settings,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/admin" },
  { name: "Courses", icon: BookOpen, path: "/admin/courses" },
  { name: "Students", icon: Users, path: "/admin/students" },
  { name: "Sessions", icon: Video, path: "/admin/sessions" },
  { name: "Assessments", icon: FileEdit, path: "/admin/exams" },
  { name: "Resources", icon: FileText, path: "/admin/notes" },
  { name: "Audit Logs", icon: History, path: "/admin/logs" },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout error");
    }
  };

  return (
    <div className="w-72 h-screen sticky top-0 bg-[#f7f6f3] dark:bg-[#1a1a1a] border-r border-[#e5e7eb] dark:border-[#2e2e2e] text-[#37352f] dark:text-white flex-col z-50 transition-all shadow-sm hidden lg:flex">
      <div className="p-8 pb-10">
        <Link href="/admin" className="flex items-center gap-4 group">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 ring-4 ring-primary/5 group-hover:scale-105 transition-transform">
             <GraduationCap size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight leading-none">Ajinora</span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1 opacity-70">Admin Hub</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-none pt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path}
              href={item.path}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-[#737373] dark:text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#2e2e2e] hover:text-[#37352f] dark:hover:text-white"
              )}
            >
              <item.icon className={cn("shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} size={20} />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
              {isActive && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white shadow-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-2 border-t border-[#e5e7eb] dark:border-[#2e2e2e] bg-muted/30">
        <Link 
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#737373] dark:text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#2e2e2e] transition-all group"
        >
          <Settings size={18} className="group-hover:rotate-45 transition-transform" />
          <span className="text-sm font-bold">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
