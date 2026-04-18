"use client";

import {
  Video, Calendar, Clock, MonitorPlay,
  Loader2, X, Link2, Trash2, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ZoomMeeting = dynamic(() => import("@/components/ZoomMeeting"), { ssr: false });
const JitsiMeeting = dynamic(() => import("@/components/JitsiMeeting"), { ssr: false });

export default function SessionsManagement() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [courseId, setCourseId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [activeIframe, setActiveIframe] = useState<any>(null);
  const [signature, setSignature] = useState<string>("");
  const [loadingMeeting, setLoadingMeeting] = useState<number | null>(null);

  const isZoomLink = (link: string) => link?.toLowerCase().includes("zoom") || link?.match(/^\d{9,11}$/);

  const handleJoin = async (session: any) => {
    const link = session.link || "";

    if (!isZoomLink(link)) {
      window.open(link, "_blank");
      return;
    }

    const meetingNumber = link.match(/\/j\/(\d+)/)?.[1] || link.match(/\d{9,11}/)?.[0] || link;
    setLoadingMeeting(session.id);
    
    try {
      const res = await fetch("/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber, role: 1 }), // Admin role is 1
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate signature.");
      setSignature(data.signature);
      const zoomUrl = `https://zoom.us/wc/${meetingNumber}/start?prefer=1&pwd=${session.password || ""}`;
      window.open(zoomUrl, "_blank");
      setActiveMeeting(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to join session as Host.");
    } finally {
      setLoadingMeeting(null);
    }
  };

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
    fetch("/api/admin/courses").then(r => r.json()).then(d => { if (Array.isArray(d)) setCourses(d); });
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, time, link, course_id: courseId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule session");
      setShowModal(false);
      setTitle(""); setDescription(""); setDate(""); setTime(""); setLink(""); setCourseId("");
      fetchSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this session?")) return;
    try {
      await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchSessions();
    } catch (e) {}
  };

  const filteredSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeTab === "upcoming" ? sessionDate >= today : sessionDate < today;
  });

  // Inline meeting views removed in favor of new window opening for reliability


  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight uppercase">Live Sessions</h1>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 h-10 px-5 rounded-xl font-semibold uppercase text-xs tracking-widest shadow-md">
          <MonitorPlay size={16} /> Schedule Session
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl w-fit border shadow-inner">
        {["upcoming", "completed"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-background text-primary shadow-md border border-primary/10" : "hover:bg-background/50 opacity-60"}`}>
            {tab === "upcoming" ? "Upcoming" : "History"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : filteredSessions.map((session) => (
          <Card key={session.id} className="rounded-2xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Video size={18} />
                </div>
                <Button onClick={() => handleDelete(session.id)} variant="ghost" size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </Button>
              </div>
              <CardTitle className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{session.title}</CardTitle>
              {session.course_title && (
                <div className="flex items-center gap-1.5 mt-1">
                  <BookOpen size={11} className="text-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-600">{session.course_title}</span>
                </div>
              )}
              <CardDescription className="line-clamp-2 mt-1 text-xs leading-relaxed opacity-70">{session.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="grid grid-cols-2 gap-2 my-1">
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground bg-accent/40 p-2.5 rounded-xl border border-border/50">
                  <Calendar size={12} className="text-primary" />
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground bg-accent/40 p-2.5 rounded-xl border border-border/50">
                  <Clock size={12} className="text-primary" />
                  <span>{session.time}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <Button onClick={() => handleJoin(session)} variant="ghost" disabled={loadingMeeting === session.id}
                  className="w-full h-9 rounded-xl border border-dashed border-primary/20 text-xs font-semibold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-transparent transition-all gap-2">
                  {loadingMeeting === session.id ? <Loader2 className="animate-spin" size={14} /> : <><Link2 size={14} /> {isZoomLink(session.link) ? "Host Zoom Class" : "Open External Link"}</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredSessions.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-30">
            <Video size={36} className="text-muted-foreground mb-3" />
            <h3 className="text-lg font-bold uppercase tracking-tight">No sessions scheduled</h3>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <Card className="w-full max-w-lg rounded-[2rem] border-2 border-primary/20 bg-card overflow-hidden shadow-3xl my-4">
            <CardHeader className="bg-primary px-8 py-5 text-white relative">
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-7 text-white/60 hover:text-white transition-colors">
                <X size={22} />
              </button>
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Schedule Session</CardTitle>
              <CardDescription className="text-white/60 font-black uppercase text-[10px] tracking-widest pt-1 italic">Create a live class for your students</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSchedule} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Session Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                    placeholder="e.g. React Hooks Deep Dive" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Assign to Course</label>
                  <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all appearance-none">
                    <option value="">— All Students —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground/50 ml-1">Only students enrolled in this course will see the session.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Date</label>
                    <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Time</label>
                    <input required type="time" value={time} onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Meeting Link (Optional — auto-generated if empty)</label>
                  <input value={link} onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                    placeholder="Leave blank to auto-generate a Jitsi link" />
                  <p className="text-[10px] text-muted-foreground/50 ml-1">Paste a Zoom/Meet link, or leave blank for auto-generated room.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all h-16 resize-none"
                    placeholder="Session objectives..." />
                </div>

                {error && <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-xs font-bold">{error}</div>}

                <Button type="submit" disabled={creating}
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all">
                  {creating ? <Loader2 className="animate-spin" size={18} /> : "Schedule Session"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
