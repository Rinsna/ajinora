"use client";

import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Lock, 
  CheckCircle2, 
  MonitorPlay, 
  ArrowRight,
  Monitor,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import dynamic from "next/dynamic";

const ZoomMeeting = dynamic(() => import("@/components/ZoomMeeting"), { ssr: false });

const initialSessions = [
  { id: 1, title: "Next.js Fundamentals", description: "Learn the basics of Next.js App Router and Server Components.", date: "Today", time: "10:00 AM", instructor: "Dr. Sarah Johnson", status: "upcoming", meetingNumber: "1234567890", password: "ajinora_class" },
  { id: 2, title: "Mastering TypeScript", description: "Deep dive into advanced TypeScript types and patterns.", date: "Tomorrow", time: "02:00 PM", instructor: "Prof. Michael Chen", status: "upcoming", meetingNumber: "0987654321", password: "ajinora_class" },
  { id: 3, title: "React Query Pro Tips", description: "Advanced data fetching and caching with React Query.", date: "Yesterday", time: "11:30 AM", instructor: "Emma Thompson", status: "completed", meetingNumber: "1122334455", password: "ajinora_class" },
];

export default function StudentSessions() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loadingMeeting, setLoadingMeeting] = useState<number | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [signature, setSignature] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleJoin = async (session: any) => {
    setLoadingMeeting(session.id);
    setError("");
    
    try {
      const res = await fetch("/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber: session.meetingNumber, role: 0 })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate signature.");
      
      setSignature(data.signature);
      setActiveMeeting(session);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Institutional access protocol failed.");
    } finally {
      setLoadingMeeting(null);
    }
  };

  if (activeMeeting) {
    return (
      <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-1000 flex flex-col">
        <div className="h-16 bg-[#1a1a1a] border-b border-white/10 px-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                 <Video size={18} />
              </div>
              <h2 className="text-white font-black uppercase tracking-widest text-[10px] sm:text-xs">{activeMeeting.title} — Active Protocol</h2>
           </div>
           <Button 
            variant="ghost" 
            className="text-white/60 hover:text-white uppercase font-black tracking-widest text-[10px]"
            onClick={() => { setActiveMeeting(null); setSignature(""); }}
           >
             Exit Classroom
           </Button>
        </div>
        <div className="flex-1 bg-zinc-900 relative">
           <ZoomMeeting 
             meetingNumber={activeMeeting.meetingNumber}
             passWord={activeMeeting.password}
             userName="Student Account"
             userEmail="student@ajinora.edu"
             signature={signature}
             sdkKey={process.env.NEXT_PUBLIC_ZOOM_SDK_KEY || "PLEASE_ENTER_YOUR_SDK_KEY"}
             onLeave={() => { setActiveMeeting(null); setSignature(""); }}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fly-in-from-bottom duration-700 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2 sm:px-0">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase leading-none mb-2">My Live Learning</h1>
          <p className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-[#a1a1a1] mt-2 opacity-70 italic underline underline-offset-4 decoration-primary/20">Interactive sessions scheduled just for you</p>
        </div>
        <div className="flex bg-[#f3f3f2] dark:bg-[#252525] p-1.5 rounded-2xl sm:rounded-3xl border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-inner w-full md:w-auto">
           <button 
             onClick={() => setActiveTab("upcoming")}
             className={`flex-1 md:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === "upcoming" ? "bg-white dark:bg-[#1a1a1a] text-primary shadow-2xl ring-2 ring-primary/10" : "text-[#737373] dark:text-[#a1a1a1] hover:bg-white/50 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}
           >
             Upcoming
           </button>
           <button 
             onClick={() => setActiveTab("completed")}
             className={`flex-1 md:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === "completed" ? "bg-white dark:bg-[#1a1a1a] text-primary shadow-2xl ring-2 ring-primary/10" : "text-[#737373] dark:text-[#a1a1a1] hover:bg-white/50 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}
           >
             Library
           </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-6 rounded-[2rem] border border-red-500/20 flex items-center gap-4 animate-in slide-in-from-top duration-500">
           <AlertCircle size={24} />
           <p className="text-xs sm:text-sm font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {initialSessions
          .filter(s => s.status === activeTab)
          .map((session) => (
            <Card key={session.id} className="relative rounded-[2.5rem] sm:rounded-[3.5rem] border border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] shadow-sm hover:border-primary/30 hover:shadow-3xl hover:shadow-primary/10 transition-all duration-700 group overflow-hidden flex flex-col p-2">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-[2000ms] hidden sm:block">
                <Monitor size={250} />
              </div>
              
              <CardHeader className="p-8 sm:p-14 pb-0 flex flex-row items-center gap-6 sm:gap-10 bg-[#f9fafb] dark:bg-[#202020] rounded-[2.2rem] sm:rounded-[3.2rem] mb-6">
                <div className="h-14 w-14 sm:h-24 sm:w-24 rounded-2xl sm:rounded-[2.5rem] bg-primary shadow-2xl shadow-primary/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-700 transform">
                  <Video size={10} className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 sm:mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 group-hover:bg-green-500 group-hover:text-white transition-colors duration-500">Live</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ver. Protocol 1.0</span>
                  </div>
                  <CardTitle className="text-xl sm:text-3xl font-black tracking-tighter leading-none mb-2 text-[#37352f] dark:text-white uppercase truncate group-hover:text-primary transition-colors">{session.title}</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#a1a1a1] flex items-center gap-2 italic">
                    <User size={12} className="text-primary" /> {session.instructor}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 sm:p-14 pt-0 flex-1 flex flex-col justify-between space-y-10 sm:space-y-14 relative z-10">
                <p className="text-[#737373] dark:text-[#a1a1a1] text-sm sm:text-lg font-bold leading-relaxed italic border-l-4 border-dashed border-primary/20 pl-6 py-4">
                  "{session.description}"
                </p>
                
                <div className="grid grid-cols-2 gap-4 sm:gap-10">
                  <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-inner group-hover:bg-white dark:group-hover:bg-[#1a1a1a] transition-colors duration-500">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest mb-2 sm:mb-4 flex items-center gap-2"><Calendar size={14} className="text-primary/70" /> Artifact Date</p>
                    <p className="text-sm sm:text-xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase">{session.date}</p>
                  </div>
                  <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-inner group-hover:bg-white dark:group-hover:bg-[#1a1a1a] transition-colors duration-500">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest mb-2 sm:mb-4 flex items-center gap-2"><Clock size={14} className="text-primary/70" /> Stream Access</p>
                    <p className="text-sm sm:text-xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase">{session.time}</p>
                  </div>
                </div>

                <div className="pt-10 border-t-2 border-dashed border-[#f3f3f2] dark:border-[#252525] flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                  <Button 
                    onClick={() => handleJoin(session)}
                    className="w-full sm:flex-1 h-14 sm:h-18 rounded-xl sm:rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs gap-4 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-95 text-white py-6 h-auto"
                  >
                    {loadingMeeting === session.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <MonitorPlay size={20} />
                    )}
                    Join Secure Stream
                  </Button>
                  <Button variant="outline" className="w-full sm:w-24 h-14 sm:h-18 rounded-xl sm:rounded-3xl border-2 hover:bg-primary/5 hover:border-primary/20 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] group/btn transition-all flex items-center justify-center py-6 h-auto text-primary">
                    <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
        {initialSessions.filter(s => s.status === activeTab).length === 0 && (
          <div className="xl:col-span-2 flex flex-col items-center justify-center p-12 sm:p-24 rounded-[3rem] sm:rounded-[5rem] bg-[#f9fafb] dark:bg-[#202020] border-4 border-dashed border-primary/10 text-center opacity-30 h-full min-h-[500px] animate-in zoom-in-95 duration-700">
             <div className="p-10 sm:p-14 rounded-full bg-white dark:bg-[#1a1a1a] mb-10 sm:mb-14 border-2 border-primary/20 shadow-2xl"><Video size={60} className="sm:w-20 sm:h-20 text-primary" /></div>
             <h3 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-[#37352f] dark:text-white mb-6 italic">No Active Transmissions</h3>
             <p className="text-[#a1a1a1] font-black uppercase tracking-widest max-w-lg mx-auto leading-relaxed text-[10px] sm:text-xs opacity-60 italic">Your academic stream library is currently offline. Monitor the schedule for next synchronized session.</p>
             <Button className="mt-10 sm:mt-14 rounded-xl sm:rounded-3xl font-black tracking-widest uppercase py-6 px-12 h-auto text-[10px] sm:text-xs shadow-3xl shadow-primary/20">Sync Schedule</Button>
          </div>
        )}
      </div>
    </div>
  );
}
