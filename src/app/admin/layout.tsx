"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { MobileAdminSidebar } from "@/components/admin/mobile-sidebar";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#fbfbfa] dark:bg-[#111] min-h-screen font-sans">
      <Sidebar />
      <MobileAdminSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 relative p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
