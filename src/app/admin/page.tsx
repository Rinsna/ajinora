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
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase leading-none">Institutional Pulse</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/admin/students" className="flex-1 sm:flex-none">
            <Button className="w-full h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95">
              <Plus size={16} /> Enroll
            </Button>
          </Link>
          <Link href="/admin/courses" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full h-11 px-6 rounded-xl border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] shadow-sm text-xs font-bold uppercase tracking-widest text-[#37352f] dark:text-white">
              Programs
            </Button>
          </Link>
        </div>
      </div>

      <motion.div 
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm bg-white dark:bg-[#1a1a1a] hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-[9px] font-black text-[#a1a1a1] uppercase tracking-[0.2em] opacity-60">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${stat.bg} dark:bg-primary/10 ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <stat.icon size={14} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black tracking-tighter text-[#37352f] dark:text-white leading-none mb-1">{stat.value}</div>
                <div className="flex items-center gap-2">
                   <div className={`flex items-center text-[8px] font-black uppercase tracking-tighter ${stat.color} bg-white dark:bg-[#252525] border border-current/10 px-1 py-0.5 rounded shadow-sm`}>
                      <ArrowUpRight size={8} className="mr-0.5" /> {stat.trend}
                   </div>
                   <span className="text-[8px] text-[#a1a1a1] font-bold uppercase tracking-tight opacity-40">Matrix Sync</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden h-full">
            <CardHeader className="p-6 sm:p-8 border-b border-[#f3f4f6] dark:border-[#252525] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-[#37352f] dark:text-white">Engagement Activity</CardTitle>
                <CardDescription className="text-xs text-[#a1a1a1] font-medium uppercase tracking-wider">Analytical view of interactions.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex text-xs text-primary font-bold gap-1 p-0 px-2 h-8 rounded-md hover:bg-primary/5">
                 View Report <ExternalLink size={12} />
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
               <div className="w-full flex flex-col items-center">
                  <div className="w-full h-32 sm:h-48 flex items-end gap-1.5 sm:gap-2 justify-between px-2 pt-6 sm:pt-10">
                     {[30, 60, 45, 80, 55, 90, 40, 75, 65, 85, 50, 95].map((h, i) => (
                       <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="flex-1 bg-primary/5 dark:bg-primary/10 rounded-t-md sm:rounded-t-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 relative group cursor-pointer border-x border-transparent hover:border-primary/20 shadow-inner"
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
          <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm bg-white dark:bg-[#1a1a1a] rounded-xl h-full flex flex-col overflow-hidden">
            <CardHeader className="p-6 border-b border-[#f3f4f6] dark:border-[#252525]">
              <CardTitle className="text-lg font-bold text-[#37352f] dark:text-white">Live Logs</CardTitle>
              <CardDescription className="text-xs text-[#a1a1a1]">Real-time system event monitoring.</CardDescription>
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
