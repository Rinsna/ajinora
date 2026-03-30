"use client";

import { 
  Plus, 
  Search, 
  Video, 
  Calendar, 
  Clock, 
  ExternalLink, 
  UserPlus, 
  Trash2, 
  Edit2, 
  MoreHorizontal,
  ChevronRight,
  MonitorPlay,
  Loader2,
  X,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function SessionsManagement() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (e) {
      console.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, time, link }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule session");
      
      setShowModal(false);
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setLink("");
      fetchSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return activeTab === "upcoming" ? sessionDate >= today : sessionDate < today;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Live Sessions</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Schedule and manage interactive live learning sessions for your students.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 h-12 px-6 shadow-xl shadow-primary/20">
          <MonitorPlay size={20} />
          Schedule Session
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-xl w-fit border shadow-inner">
        <button 
          onClick={() => setActiveTab("upcoming")}
          className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "upcoming" ? "bg-background text-primary shadow-lg border border-primary/10" : "hover:bg-background/50 opacity-60"}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab("completed")}
          className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "completed" ? "bg-background text-primary shadow-lg border border-primary/10" : "hover:bg-background/50 opacity-60"}`}
        >
          History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 flex justify-center items-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : filteredSessions.map((session) => (
            <Card key={session.id} className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden bg-card/40 backdrop-blur-xl p-2 rounded-[2rem]">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 p-8 pt-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-primary/10 text-primary shadow-inner`}>
                    <Video size={20} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/5">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight line-clamp-1 group-hover:text-primary transition-colors uppercase leading-none">{session.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-4 h-10 text-xs font-medium leading-relaxed italic opacity-80 decoration-primary/20">{session.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pb-10">
                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-accent/40 p-4 rounded-2xl border border-border/50">
                    <Calendar size={14} className="text-primary" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-accent/40 p-4 rounded-2xl border border-border/50">
                    <Clock size={14} className="text-primary" />
                    <span>{session.time}</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-dashed border-border/50 flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                        JS
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Stream Ready</span>
                   </div>
                   <Button variant="ghost" className="w-full h-14 rounded-xl border-2 border-dashed border-primary/20 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-transparent transition-all gap-2">
                     <Link2 size={16} /> Join Conference
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && filteredSessions.length === 0 && (
            <div className="col-span-full py-40 flex flex-col items-center justify-center text-center opacity-40">
               <div className="h-24 w-24 rounded-full bg-accent/50 flex items-center justify-center mb-6">
                  <Video size={40} className="text-muted-foreground" />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tighter">Zero sessions scheduled</h3>
               <p className="text-xs font-bold uppercase tracking-widest mt-2">The system logs are clear for this period.</p>
            </div>
          )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
           <Card className="w-full max-w-xl rounded-[3rem] border-2 border-primary/20 bg-card overflow-hidden shadow-3xl">
              <CardHeader className="bg-primary p-10 text-white relative">
                 <button onClick={() => setShowModal(false)} className="absolute top-8 right-10 text-white/60 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
                 <CardTitle className="text-3xl font-black uppercase tracking-tighter">Event Scheduler</CardTitle>
                 <CardDescription className="text-white/60 font-black uppercase text-[10px] tracking-widest italic leading-none pt-2">Define cross-platform learning sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                 <form onSubmit={handleSchedule} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-2">Session Title</label>
                       <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-2xl p-5 text-lg font-bold focus:border-primary focus:outline-none transition-all" placeholder="e.g. Masterclass in Physics" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-2">Event Date</label>
                        <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-2xl p-5 text-sm font-bold focus:border-primary focus:outline-none transition-all uppercase" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-2">Start Time</label>
                        <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-2xl p-5 text-sm font-bold focus:border-primary focus:outline-none transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-2">Virtual Link (Zoom/Meet)</label>
                       <input required value={link} onChange={(e) => setLink(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-2xl p-5 text-sm font-bold focus:border-primary focus:outline-none transition-all" placeholder="https://zoom.us/j/..." />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-2">Description / Objectives</label>
                       <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-2xl p-5 text-sm font-bold focus:border-primary focus:outline-none transition-all h-24 resize-none" placeholder="Briefly describe the session outcomes..." />
                    </div>

                    {error && <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-xs font-bold uppercase tracking-tight">{error}</div>}

                    <Button type="submit" disabled={creating} className="w-full h-20 rounded-2xl font-black uppercase tracking-[0.3em] text-xs bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-95">
                       {creating ? <Loader2 className="animate-spin" size={24} /> : "Initialize Event Stream"}
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
