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
    <div className="space-y-6 animate-in fly-in-from-bottom duration-700 text-left">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Audit Logs</h1>
        </div>
        <Button variant="outline" className="flex items-center gap-2 h-10 px-5 border border-dashed border-primary/30 rounded-xl font-semibold uppercase text-xs tracking-widest text-primary hover:bg-primary/5 transition-all active:scale-95">
          <Download size={15} />
          Export
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border/40 bg-card shadow-sm p-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">Total Events</p>
            <h4 className="text-xl font-bold tracking-tight leading-none">{logs.length}</h4>
          </div>
        </Card>
        <Card className="rounded-2xl border border-border/40 bg-card shadow-sm p-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">Security Status</p>
            <h4 className="text-xl font-bold tracking-tight leading-none text-green-500">Normal</h4>
          </div>
        </Card>
        <Card className="rounded-2xl border border-border/40 bg-card shadow-sm p-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">System Latency</p>
            <h4 className="text-xl font-bold tracking-tight leading-none">0.2s</h4>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-border/50">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
            <input
              type="text"
              placeholder="Filter by student or event type..."
              className="w-full bg-accent/30 border border-border/40 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-muted-foreground/50 placeholder:text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="h-9 px-4 rounded-lg font-semibold uppercase text-xs tracking-widest gap-2">
              <Calendar size={14} />
              Set Period
            </Button>
            <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/5 rounded-lg border border-primary/10 whitespace-nowrap">
              Live Feed
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary" size={36} />
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-1.5 px-3 pb-3">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  <th className="px-5 py-2.5 text-left">Activity</th>
                  <th className="px-5 py-2.5 text-left">User</th>
                  <th className="px-5 py-2.5 text-left">Detail</th>
                  <th className="px-5 py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .filter(l => l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.action?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((log) => (
                    <tr key={log.id} className="group bg-accent/20 hover:bg-primary/5 transition-all duration-200 rounded-xl cursor-default">
                      <td className="px-5 py-3.5 rounded-l-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-background border border-border/50 group-hover:bg-primary/5 transition-all duration-200 shrink-0">
                            {getTypeIcon(log.action?.toLowerCase()?.includes('login') ? 'auth' : log.action?.toLowerCase()?.includes('session') ? 'session' : 'info')}
                          </div>
                          <div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">
                              {log.action}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                              System Event
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold uppercase border border-primary/20 shrink-0">
                            {log.full_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none mb-0.5">{log.full_name}</p>
                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">@{log.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[260px]">
                        <p className="text-xs text-muted-foreground italic line-clamp-1">{log.details || 'System audit completed'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right rounded-r-xl">
                        <p className="text-sm font-medium flex items-center justify-end gap-2 whitespace-nowrap">
                          <Clock size={13} className="text-primary" />
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest text-right">
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {!loading && logs.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center opacity-30">
              <Terminal className="text-muted-foreground mb-4" size={40} />
              <h3 className="text-lg font-bold uppercase tracking-tight">No Audit Records</h3>
              <p className="text-xs font-medium uppercase tracking-widest mt-1">The system logs are clear of all events.</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Showing latest feed</p>
          <Button variant="ghost" className="text-primary text-[10px] font-semibold uppercase tracking-widest gap-2 p-1 hover:bg-transparent hover:underline group h-auto">
            View All
            <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
