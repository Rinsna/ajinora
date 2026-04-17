"use client";

import { 
  Users, 
  Video, 
  FileEdit, 
  FileText, 
  History, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  LogIn,
  LogOut,
  Download,
  Terminal,
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (e) {
      console.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "session": return <Video size={20} className="text-purple-500" />;
      case "exam": return <FileEdit size={20} className="text-orange-500" />;
      case "note": return <FileText size={20} className="text-blue-500" />;
      case "auth": return <LogIn size={20} className="text-green-500" />;
      default: return <History size={20} className="text-primary" />;
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fly-in-from-bottom duration-700 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Institutional Records</h1>
          <p className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-[#a1a1a1] mt-3 opacity-70 italic underline underline-offset-4 decoration-primary/20">Real-time surveillance of student behavior and system events.</p>
        </div>
        <Button variant="outline" className="flex items-center gap-4 h-14 sm:h-16 px-6 sm:px-10 border-2 border-dashed border-primary/20 hover:bg-primary/5 rounded-[1.5rem] sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest text-primary shadow-xl shadow-primary/5 transition-all active:scale-95 py-6 h-auto">
          <Download size={20} />
          Export Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-card/40 backdrop-blur-xl border-none shadow-sm rounded-[2rem] p-2">
          <CardHeader className="pb-2 p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 leading-none">Total Event Load</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black tracking-tighter">{logs.length}</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-green-500 font-black uppercase tracking-widest">
              <TrendingUp size={14} /> Synchronized <span className="text-muted-foreground/40 font-medium ml-1">Live Feed</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-xl border-none shadow-sm rounded-[2rem] p-2">
          <CardHeader className="pb-2 p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 leading-none">Security Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black tracking-tighter uppercase text-primary">Normal</div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-primary font-black uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /> Monitoring Institutional ID's
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-xl border-none shadow-sm rounded-[2rem] p-2">
          <CardHeader className="pb-2 p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 leading-none">System Latency</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black tracking-tighter">0.2s</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest leading-none">
              High Performance Mode Active
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border-none rounded-[2.5rem] overflow-hidden shadow-sm p-4">
        <div className="p-8 border-b-2 border-dashed border-border/50 flex flex-col sm:flex-row gap-6 justify-between items-center bg-accent/20 rounded-[2rem] mb-6">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
            <input 
              type="text" 
              placeholder="Filter audit trail by student or event type..." 
              className="w-full bg-background border-none rounded-xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xl font-bold italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-xl font-black uppercase text-xs tracking-widest gap-3">
              <Calendar size={20} />
              Set Period
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex justify-center items-center py-40">
                <Loader2 className="animate-spin text-primary" size={40} />
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-accent/30 rounded-t-xl">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Institutional Activity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Entity Identifier</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Contextual Detail</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 text-right">Chronology</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {logs
                  .filter(l => l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.action?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-primary/5 transition-all group cursor-default">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl bg-background shadow-xl border border-border/50 group-hover:scale-110 transition-transform duration-500`}>
                            {getTypeIcon(log.action?.toLowerCase()?.includes('login') ? 'auth' : log.action?.toLowerCase()?.includes('session') ? 'session' : 'info')}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                              {log.action}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest italic leading-none pt-1">
                              Institutional Event
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-[11px] text-primary font-black uppercase border border-primary/20 shadow-inner">
                            {log.full_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-black tracking-tight leading-none mb-1">{log.full_name}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">@{log.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 max-w-[300px]">
                          <p className="text-xs text-muted-foreground font-bold italic tracking-tight line-clamp-1">{log.details || 'System audit completed'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="space-y-1">
                          <p className="text-sm font-black flex items-center justify-end gap-3 whitespace-nowrap">
                            <Clock size={16} className="text-primary" />
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[9px] text-muted-foreground/40 uppercase font-black tracking-widest">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {!loading && logs.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center justify-center opacity-30">
              <div className="p-8 bg-accent/50 rounded-full mb-6">
                <Terminal className="text-muted-foreground" size={48} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Zero Audit Records</h3>
              <p className="text-xs font-bold uppercase tracking-widest mt-2">The system logs are clear of all institutional events.</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t-2 border-dashed border-border/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 bg-accent/10 rounded-b-[2.5rem]">
          <p>Displaying latest institutional surveillance feed</p>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-primary text-[10px] font-black uppercase tracking-widest gap-3 p-1 hover:bg-transparent hover:underline group">
              Historical Pull
              <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
