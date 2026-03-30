"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, User, Search, Command, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  return (
    <header className="h-16 border-b border-[#e5e7eb] dark:border-[#2e2e2e] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-9 w-9 text-[#737373] hover:bg-[#f3f4f6] dark:hover:bg-[#252525] rounded-lg"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>
        <div className="relative max-w-sm w-full group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a1] group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-[#f3f4f6] dark:bg-[#252525] border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] border-[#e5e7eb] dark:border-[#2e2e2e] focus:border-primary/30 rounded-lg py-2 pl-10 pr-10 text-sm focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-[#a1a1a1]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-[#a1a1a1] bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] px-1.5 py-0.5 rounded shadow-sm pointer-events-none">
             <Command size={10} /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-[#f3f4f6] dark:bg-[#252525] p-1 rounded-lg border border-[#e5e7eb] dark:border-[#2e2e2e]">
          <Button 
            variant="ghost" 
            size="sm" 
            className={theme === "light" ? "bg-white shadow-sm text-primary" : "text-[#a1a1a1] hover:text-[#37352f] dark:hover:text-white"}
            onClick={() => setTheme("light")}
          >
            <Sun size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={theme === "dark" ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-primary" : "text-[#a1a1a1] hover:text-[#37352f] dark:hover:text-white"}
            onClick={() => setTheme("dark")}
          >
            <Moon size={14} />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-[#737373] hover:bg-[#f3f4f6] dark:hover:bg-[#252525] rounded-lg">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-[#1a1a1a]"></span>
        </Button>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#252525] p-1 rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
            {user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || <User size={16} />}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[#37352f] dark:text-white leading-none mb-1">{user?.full_name || "Admin"}</p>
            <p className="text-[10px] text-[#a1a1a1] leading-none uppercase tracking-tighter">{user?.role || "Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
