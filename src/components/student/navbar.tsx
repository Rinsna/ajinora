"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Search, Command, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const pathMap: Record<string, string> = {
  "/student/course": "Curriculum",
  "/student/sessions": "Live Sessions",
  "/student/exams": "My Assessments",
  "/student/notes": "Resource Library",
  "/student/profile": "Account Settings",
  "/student": "Overview",
};

export function StudentNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (e) {
        console.error("Session fetch failed");
      }
    };
    fetchSession();
  }, []);

  if (!mounted) return null;

  const currentPath = pathMap[pathname] || pathMap[`/student/${pathname.split('/')[2]}`] || "Dashboard";

  return (
    <header className="h-14 border-b border-[#e5e7eb] dark:border-[#2e2e2e] bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-8 w-8 text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#252525]"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>
        <div className="flex items-center text-[11px] font-medium text-[#737373] dark:text-[#a1a1a1]">
          <span className="hidden sm:inline">Student</span>
          <ChevronRight size={12} className="mx-1.5 opacity-40 hidden sm:inline" />
          <span className="text-[#37352f] dark:text-white font-semibold">{currentPath}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#f3f3f2] dark:bg-[#252525] rounded-md border border-[#e5e7eb] dark:border-[#2e2e2e] group cursor-text transition-all hover:bg-[#ebeaea] dark:hover:bg-[#2e2e2e] w-64 mr-4">
           <Search size={14} className="text-[#a1a1a1]" />
           <span className="text-xs text-[#a1a1a1] flex-1">Search assets...</span>
           <div className="flex items-center gap-0.5 px-1 py-0.5 rounded border border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1c1c1c] text-[9px] font-bold text-[#a1a1a1]">
             <Command size={10} /> K
           </div>
        </div>

        <div className="flex items-center gap-1 bg-[#f3f3f2] dark:bg-[#252525] p-1 rounded-md border border-[#e5e7eb] dark:border-[#2e2e2e]">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 rounded-sm transition-all ${theme === 'light' ? 'bg-white shadow-sm text-primary' : 'text-[#a1a1a1] hover:text-[#37352f] dark:hover:text-white'}`}
            onClick={() => setTheme("light")}
          >
            <Sun size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 rounded-sm transition-all ${theme === 'dark' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm text-primary' : 'text-[#a1a1a1] hover:text-[#37352f] dark:hover:text-white'}`}
            onClick={() => setTheme("dark")}
          >
            <Moon size={14} />
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#252525] relative">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-white dark:ring-[#1a1a1a]"></span>
        </Button>

        <div className="flex items-center gap-3 pl-3 ml-2 border-l border-[#e5e7eb] dark:border-[#2e2e2e]">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-bold text-[#37352f] dark:text-white leading-none mb-1">{user?.full_name || "Guest Learner"}</p>
            <p className="text-[9px] text-[#a1a1a1] leading-none uppercase tracking-tighter">Student</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[10px] cursor-pointer hover:scale-105 transition-transform">
            {user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "AL"}
          </div>
        </div>
      </div>
    </header>
  );
}
