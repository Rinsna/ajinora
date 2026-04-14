"use client";

import { StudentSidebar } from "@/components/student/sidebar";
import { StudentNavbar } from "@/components/student/navbar";
import { MobileSidebar } from "@/components/student/mobile-sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-[#fbfbfa] dark:bg-[#111] min-h-screen">
      <StudentSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isCollapsed ? "lg:ml-[80px]" : "lg:ml-72"
      )}>
        <StudentNavbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className={cn(
          "flex-1 relative mx-auto w-full transition-all duration-300",
          pathname === '/student/course' ? "p-0 max-w-none h-[calc(100vh-64px)] overflow-hidden" : "p-4 sm:p-8 max-w-[1600px]"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
