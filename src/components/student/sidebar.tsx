"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  FileEdit, 
  FileText, 
  User, 
  LogOut,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentMenuItems = [
  { name: "My Dashboard", icon: LayoutDashboard, path: "/student" },
  { name: "My Course", icon: BookOpen, path: "/student/course" },
  { name: "Live Sessions", icon: Video, path: "/student/sessions" },
  { name: "My Exams", icon: FileEdit, path: "/student/exams" },
  { name: "My Notes", icon: FileText, path: "/student/notes" },
  { name: "My Profile", icon: User, path: "/student/profile" },
];

interface StudentSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function StudentSidebar({ isCollapsed, onToggle }: StudentSidebarProps) {
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
    <div className={cn(
      "h-screen fixed left-0 top-0 bg-[#f7f6f3] dark:bg-[#1a1a1a] border-r border-[#e5e7eb] dark:border-[#2e2e2e] text-[#37352f] dark:text-white flex flex-col z-50 transition-all duration-300 shadow-sm hidden lg:flex",
      isCollapsed ? "w-[80px]" : "w-72"
    )}>
      <div className={cn("p-8", isCollapsed ? "px-4" : "p-8 pb-10")}>
        <div 
          onClick={onToggle}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 ring-4 ring-primary/5 group-hover:scale-105 transition-transform">
             <GraduationCap size={22} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xl font-black tracking-tight leading-none">Ajinora</span>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1 opacity-70">Learner Portal</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-none pt-4">
        {studentMenuItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/student" && pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path}
              href={item.path}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-[#737373] dark:text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#2e2e2e] hover:text-[#37352f] dark:hover:text-white",
                isCollapsed && "justify-center px-0 h-12 w-12 mx-auto"
              )}
            >
              <item.icon className={cn("shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} size={20} />
              {!isCollapsed && (
                <span className="font-bold text-sm tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.name}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white shadow-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-6 border-t border-[#e5e7eb] dark:border-[#2e2e2e] bg-muted/30", isCollapsed && "p-4")}>
        <button 
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all font-bold",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
