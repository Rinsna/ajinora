"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Video, 
  FileEdit, 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  MonitorPlay,
  Award,
  BookOpen,
  Loader2,
  Calendar,
  Sparkles,
  Play,
  Plus,
  PlayCircle,
  ArrowLeftCircle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { formatTimeTo12h } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/student/data");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Dashboard data fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const upcomingSessions = data?.upcomingSessions || [];
  const upcomingExams = data?.upcomingExams || [];
  const recentNotes = data?.recentNotes || [];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <motion.div 
        variants={item}
        className={`relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 group shadow-2xl ${data?.user?.course_thumbnail ? '' : 'bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] dark:from-[#1e1e1e] dark:to-[#111] border border-[#e2e8f0] dark:border-[#2e2e2e]'}`}
      >
        {data?.user?.course_thumbnail && (
          <div className="absolute inset-0 z-0">
             <img src={data.user.course_thumbnail} alt="" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-[2000ms] will-change-transform" />
             <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-purple-900/60 to-black/90" />
          </div>
        )}
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 transform rotate-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none z-0">
          <BookOpen size={240} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/20 shadow-xl will-change-transform">
               <Sparkles size={14} className="text-primary animate-pulse" />
               <span className={`text-[10px] font-black uppercase tracking-widest ${data?.user?.course_thumbnail ? 'text-white/90' : 'text-[#a1a1a1]'}`}>
                 {data?.user?.course_title || 'Academic Portal'}
               </span>
            </div>
            <h1 className={`text-4xl sm:text-6xl font-black tracking-tighter mb-4 leading-tight ${data?.user?.course_thumbnail ? 'text-white' : 'text-[#37352f] dark:text-white'}`}>
              Welcome back, <span className={data?.user?.course_thumbnail ? 'text-white' : 'text-primary'}>{data?.user?.full_name?.split(' ')[0] || 'Learner'}</span>
            </h1>
            <p className={`text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-lg ${data?.user?.course_thumbnail ? 'text-white/80' : 'text-[#64748b] dark:text-slate-400'}`}>
              {data?.user?.course_description || "Your academic journey continues. Access your latest protocols and track your institutional progress below."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/student/course">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/40 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3">
                  <PlayCircle size={18} /> Resume Matrix
                </Button>
              </Link>
              <Link href="/student/sessions">
                <Button variant="outline" className={`border-2 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-sm transition-all ${data?.user?.course_thumbnail ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm' : 'bg-white dark:bg-[#1a1a1a] border-[#e2e8f0] dark:border-[#2e2e2e] text-[#37352f] dark:text-white hover:bg-slate-50 dark:hover:bg-[#252525]'}`}>
                  Sync Intervals
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4">
             {[
               { icon: CheckCircle2, label: "Archives Verified", val: "12/24", color: "text-green-500", bg: "bg-green-500/10" },
               { icon: TrendingUp, label: "Performance Metric", val: "94%", color: "text-blue-500", bg: "bg-blue-500/10" },
               { icon: Clock, label: "Session Attendance", val: "98%", color: "text-purple-500", bg: "bg-purple-500/10" },
               { icon: Award, label: "Matrix Rank", val: "#03", color: "text-amber-500", bg: "bg-amber-500/10" }
             ].map((stat, i) => (
               <div key={i} className="p-6 rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-lg will-change-transform">
                  <div className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-inner`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{stat.val}</p>
               </div>
             ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-[#e2e8f0] dark:border-[#2e2e2e] shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden h-full">
            <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-[#252525] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-[#37352f] dark:text-white uppercase">Live Sessions</CardTitle>
                <CardDescription className="text-xs font-bold text-[#a1a1a1] uppercase tracking-widest mt-1">Scheduled Interactions</CardDescription>
              </div>
              <Link href="/student/sessions">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary gap-2 hover:bg-primary/5 rounded-xl px-4">
                  Full Schedule <ArrowRight size={14} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session: any) => (
                <motion.div 
                   whileHover={{ y: -2 }}
                   key={session.id} 
                   className="flex items-center gap-6 p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-[#202020] border border-[#e2e8f0] dark:border-[#2e2e2e] group/session cursor-pointer transition-all hover:bg-white will-change-transform"
                >
                  <div className="h-16 w-16 rounded-2xl bg-white dark:bg-[#1a1a1a] flex items-center justify-center text-primary shadow-sm border border-[#e2e8f0] dark:border-[#2e2e2e] group-hover/session:shadow-lg transition-all duration-300">
                    <MonitorPlay size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base text-[#37352f] dark:text-white mb-1.5 truncate tracking-tight uppercase">{session.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-black text-[#a1a1a1] uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-black/20 animate-pulse"><Calendar size={12} /> {new Date(session.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {formatTimeTo12h(session.time)}</span>
                    </div>
                  </div>
                  <Link href="/student/sessions" className="block shrink-0">
                    <Button size="sm" className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">Enter Room</Button>
                  </Link>
                </motion.div>
              )) : (
                <div className="py-20 text-center text-[#a1a1a1] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No protocols scheduled for today.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border border-[#e2e8f0] dark:border-[#2e2e2e] shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden flex flex-col h-full relative">
            <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-[#252525]">
              <CardTitle className="text-xl font-black tracking-tight text-[#37352f] dark:text-white uppercase">Assessments</CardTitle>
              <CardDescription className="text-xs font-bold text-[#a1a1a1] uppercase tracking-widest mt-1">Pending Evaluations</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {upcomingExams.length > 0 ? upcomingExams.map((exam: any) => (
                  <motion.div 
                     whileHover={{ x: 6 }}
                     key={exam.id} 
                     className="flex items-start gap-4 group/exam cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
                      <Award size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm text-[#37352f] dark:text-white mb-0.5 mt-0.5 truncate uppercase tracking-tight">{exam.title}</h4>
                      <p className="text-[9px] text-[#a1a1a1] font-black uppercase tracking-widest">{new Date(exam.start_date || exam.created_at).toLocaleDateString()} • {exam.duration} MINUTES</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-20 text-[#a1a1a1] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Clear for assessments.</div>
                )}
              </div>
              <Link href="/student/exams" className="block w-full">
                <Button variant="outline" className="w-full rounded-2xl border-[#e2e8f0] dark:border-[#2e2e2e] font-black uppercase tracking-widest text-[10px] h-14 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-sm">
                  Launch Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase">Source Files</h2>
              <p className="text-[10px] font-black text-[#a1a1a1] uppercase tracking-[0.2em] mt-1 opacity-60">Verified Institutional Archives</p>
           </div>
           <Link href="/student/notes">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] hover:text-primary gap-2 hover:bg-primary/5 rounded-xl px-4 h-10 border border-slate-200 dark:border-[#2e2e2e]">
                Archive Library <ArrowRight size={14} />
              </Button>
           </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentNotes.length > 0 ? recentNotes.map((res: any) => (
            <motion.div 
               whileHover={{ y: -6, scale: 1.02 }}
               key={res.id}
            >
              <Card className="rounded-[2rem] border border-[#e2e8f0] dark:border-[#2e2e2e] shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-[#1a1a1a] transition-all duration-500 overflow-hidden group p-6 text-center h-full flex flex-col items-center">
                <div className="h-20 w-20 rounded-2xl bg-slate-50 dark:bg-[#202020] border border-slate-100 dark:border-[#2e2e2e] flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                  {res.type === 'pdf' ? <FileText size={32} className="group-hover:text-white transition-colors text-red-500" /> : <MonitorPlay size={32} className="group-hover:text-white transition-colors text-indigo-500" />}
                </div>
                <div className="flex-1">
                  <h5 className="font-black text-sm text-[#37352f] dark:text-white mb-1.5 tracking-tight uppercase line-clamp-1">{res.title}</h5>
                  <p className="text-[9px] font-black text-[#a1a1a1] uppercase tracking-[0.2em] mb-6">{res.category || 'Institutional Asset'}</p>
                </div>
                <Button variant="ghost" className="w-full bg-slate-50 dark:bg-[#202020] rounded-xl font-black text-[9px] uppercase tracking-widest h-12 group-hover:bg-primary group-hover:text-white transition-all border border-slate-100 dark:border-[#2e2e2e] flex items-center gap-2">
                   <Download size={14} /> Pull Archive
                </Button>
              </Card>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-[#a1a1a1] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Archives are currently pending.</div>
          )}
          
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-[#2e2e2e] flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-slate-50/30 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-primary/40 transition-all duration-500 group min-h-[260px] shadow-sm hover:shadow-2xl hover:shadow-primary/10"
          >
             <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 shadow-inner group-hover:scale-110 transition-transform">
                <Plus size={24} />
             </div>
             <p className="text-[10px] font-black text-[#37352f] dark:text-white uppercase tracking-[0.3em] leading-relaxed">Expand<br />Library</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
