"use client";

import {
  Video, Calendar, Clock, User, MonitorPlay,
  ArrowRight, Loader2, AlertCircle, ExternalLink, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ZoomMeeting = dynamic(() => import("@/components/ZoomMeeting"), { ssr: false });
const JitsiMeeting = dynamic(() => import("@/components/JitsiMeeting"), { ssr: false });

export default function StudentSessions() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeeting, setLoadingMeeting] = useState<number | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [activeIframe, setActiveIframe] = useState<string | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/student/sessions");
        const data = await res.json();
        if (Array.isArray(data)) setSessions(data);
      } catch (e) {
        console.error("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const isZoomLink = (link: string) => link?.toLowerCase().includes("zoom") || link?.match(/^\d{9,11}$/);

  const handleJoin = async (session: any) => {
    const link = session.link || "";

    // Open in new window instead of embedding for better reliability
    if (!isZoomLink(link)) {
      window.open(link, "_blank");
      return;
    }

    // Extract meeting number from Zoom link
    const meetingNumber = link.match(/\/j\/(\d+)/)?.[1] || link.match(/\d{9,11}/)?.[0] || link;
    setLoadingMeeting(session.id);
    setError("");

    try {
      const res = await fetch("/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber, role: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate signature.");
      setSignature(data.signature);
      // For Zoom, we can also offer to open in a new window if the SDK fails, 
      // but for now let's try to keep the SDK and add a fallback or just open in new window if user preferred.
      // Given the user said "i am ok with it open new window", let's prioritize that for all.
      
      const zoomUrl = `https://zoom.us/wc/${meetingNumber}/join?prefer=1&pwd=${session.password || ""}`;
      window.open(zoomUrl, "_blank");
      setActiveMeeting(null); // Ensure we don't trigger the inline view
    } catch (err: any) {
      setError(err.message || "Failed to join session.");
    } finally {
      setLoadingMeeting(null);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeTab === "upcoming" ? sessionDate >= today : sessionDate < today;
  });

  // Inline meeting views removed in favor of new window opening for reliability


  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none mb-2">Live Sessions</h1>
          <p className="text-sm text-muted-foreground font-medium">Join your scheduled live classes</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-2xl border shadow-inner w-full md:w-fit">
          <button onClick={() => setActiveTab("upcoming")}
            className={`flex-1 md:px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "upcoming" ? "bg-background text-primary shadow-lg" : "text-muted-foreground opacity-60"}`}>
            Upcoming
          </button>
          <button onClick={() => setActiveTab("completed")}
            className={`flex-1 md:px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "completed" ? "bg-background text-primary shadow-lg" : "text-muted-foreground opacity-60"}`}>
            Past
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-40 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-20 rounded-[3rem] bg-accent/20 border-4 border-dashed border-primary/10 text-center opacity-40 min-h-[400px]">
            <Video size={60} className="text-primary mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter">No sessions scheduled</h3>
            <p className="text-xs font-bold uppercase tracking-widest mt-2 text-muted-foreground">Check back later for upcoming classes.</p>
          </div>
        ) : filteredSessions.map((session) => {
          const isZoom = isZoomLink(session.link || "");
          return (
            <Card key={session.id} className="rounded-[2rem] border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group overflow-hidden flex flex-col p-2">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Video size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${isZoom ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                      {isZoom ? "Zoom" : "External"}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">{session.title}</CardTitle>
                {session.description && (
                  <CardDescription className="mt-2 text-sm leading-relaxed">{session.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/30 border border-border/50">
                    <Calendar size={14} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/30 border border-border/50">
                    <Clock size={14} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest">{session.time}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleJoin(session)}
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                >
                  {loadingMeeting === session.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : isZoom ? (
                    <><MonitorPlay size={16} /> Join Zoom Class</>
                  ) : (
                    <><ExternalLink size={16} /> Open Meeting Link</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
