"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Video, FileEdit, History, Plus, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp, MonitorPlay, FileText, LayoutDashboard, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="text-primary" size={48} />
        </motion.div>
      </div>
    );
  }

  const stats = [
    { title: "Total Students", value: data?.studentCount || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+2.4%" },
    { title: "Live Sessions", value: data?.sessionCount || 0, icon: Video, color: "text-indigo-600", bg: "bg-indigo-50", trend: "Active" },
    { title: "Assessments", value: data?.examCount || 0, icon: FileEdit, color: "text-amber-600", bg: "bg-amber-50", trend: "Scheduled" },
    { title: "Content Assets", value: data?.noteCount || 0, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Deployed" },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Dashboard</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/admin/students" className="flex-1 sm:flex-none">
            <Button className="w-full h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <Plus size={15} /> Enroll
            </Button>
          </Link>
          <Link href="/admin/courses" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full h-10 px-5 rounded-xl border border-border/50 text-xs font-semibold uppercase tracking-widest">
              Programs
            </Button>
          </Link>
        </div>
      </div>

      <motion.div 
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="rounded-2xl border border-border/40 bg-card shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 group cursor-default">
              <div className={`h-11 w-11 rounded-xl ${stat.bg} dark:bg-primary/10 ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">{stat.title}</p>
                <h4 className="text-xl font-bold tracking-tight leading-none">{stat.value}</h4>
                <div className={`flex items-center gap-1 mt-1 text-[9px] font-semibold uppercase tracking-widest ${stat.color}`}>
                  <ArrowUpRight size={10} /> {stat.trend}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden h-full">
            <CardHeader className="px-5 py-4 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Engagement Activity</CardTitle>
                <CardDescription className="text-xs text-muted-foreground/60">Analytical view of interactions.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex text-xs text-primary font-semibold gap-1 p-0 px-2 h-8 rounded-md hover:bg-primary/5">
                 View Report <ExternalLink size={12} />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
               <div className="w-full flex flex-col items-center">
                  <div className="w-full h-32 sm:h-48 flex items-end gap-1.5 sm:gap-2 justify-between px-2 pt-6 sm:pt-10">
                     {[30, 60, 45, 80, 55, 90, 40, 75, 65, 85, 50, 95].map((h, i) => (
                       <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="flex-1 min-w-[3px] sm:min-w-[8px] bg-primary/5 dark:bg-primary/10 rounded-t-md sm:rounded-t-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 relative group cursor-pointer border-x border-transparent hover:border-primary/20 shadow-inner"
                       >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#37352f] text-white text-[8px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                             {h}% Engagement
                          </div>
                       </motion.div>
                     ))}
                  </div>
                  <div className="w-full grid grid-cols-12 mt-4 text-[8px] sm:text-[10px] font-black uppercase text-[#a1a1a1] tracking-[0.2em] px-2 opacity-50">
                     <span className="col-span-4">Start</span>
                     <span className="col-span-4 text-center">Mid</span>
                     <span className="col-span-4 text-right">End</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-2xl border border-border/40 bg-card shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="px-5 py-4 border-b border-border/50">
              <CardTitle className="text-base font-semibold">Live Logs</CardTitle>
              <CardDescription className="text-xs text-muted-foreground/60">Real-time event monitoring.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-none divide-y divide-[#f3f4f6] dark:divide-[#252525]">
                {data?.recentLogs?.length > 0 ? data.recentLogs.map((log: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    key={log.id} 
                    className="flex gap-4 items-start p-4 hover:bg-[#f9fafb] dark:hover:bg-[#202020] transition-colors cursor-default"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/10">
                      {log.full_name?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#37352f] dark:text-white font-medium leading-tight">
                        <span className="text-primary font-bold">{log.full_name}</span> {log.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-[#a1a1a1]"/>
                        <span className="text-[10px] text-[#a1a1a1] font-medium">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-20 opacity-30 italic font-bold">Waiting for system activity...</div>
                )}
              </div>
              <div className="p-4 border-t border-[#f3f4f6] dark:border-[#252525]">
                <Link href="/admin/logs" className="block">
                  <Button variant="outline" className="w-full h-9 rounded-lg text-xs font-semibold hover:bg-white dark:hover:bg-[#1a1a1a] shadow-sm transition-all active:scale-95">
                    View Audit Trail
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
