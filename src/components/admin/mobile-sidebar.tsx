"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Video, 
  FileEdit, 
  FileText, 
  LogOut,
  Settings,
  GraduationCap,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Global Pulse", icon: LayoutDashboard, path: "/admin" },
  { name: "Student Registry", icon: Users, path: "/admin/students" },
  { name: "Program Forge", icon: BookOpen, path: "/admin/courses" },
  { name: "Telepresence", icon: Video, path: "/admin/sessions" },
  { name: "Exam Engine", icon: FileEdit, path: "/admin/exams" },
  { name: "Asset Vault", icon: FileText, path: "/admin/notes" },
];

export function MobileAdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-[#f7f6f3] dark:bg-[#1a1a1a] shadow-2xl z-[101] flex flex-col pt-10"
          >
            <div className="flex items-center justify-between px-8 mb-10">
              <Link href="/admin" className="flex items-center gap-4 group" onClick={onClose}>
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 ring-4 ring-primary/5">
                   <GraduationCap size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight leading-none text-[#37352f] dark:text-white">Ajinora</span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1 opacity-70">Admin Hub</span>
                </div>
              </Link>
              <button 
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#a1a1a1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <motion.nav 
              variants={{
                show: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.2 }
                }
              }}
              initial="hidden"
              animate="show"
              className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-none pt-4"
            >
              {menuItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
                return (
                  <motion.div
                    key={item.path}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                  >
                    <Link 
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        "group relative flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "text-[#737373] dark:text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#2e2e2e] hover:text-[#37352f] dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn("shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} size={20} />
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <div className="p-6 border-t border-[#e5e7eb] dark:border-[#2e2e2e] bg-muted/30 pb-10">
               <Link 
                href="/admin/settings"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#737373] dark:text-[#a1a1a1] hover:bg-[#ebeaea] dark:hover:bg-[#2e2e2e] transition-all group mb-2"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
