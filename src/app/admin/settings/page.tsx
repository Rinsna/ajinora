"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Shield, Bell, Monitor, Save, Loader2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fly-in-up text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase leading-none">Global Configurations</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1] mt-2 opacity-70">Manage institutional parameters and protocols.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Synchronize Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden">
            <CardHeader className="bg-[#f9fafb] dark:bg-[#202020] border-b border-[#e5e7eb] dark:border-[#2e2e2e] p-8">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Globe size={18} />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Platform Identity</CardTitle>
              </div>
              <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter">Institutional Branding & Matrix</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Academy Designation</label>
                  <input className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" defaultValue="AJINORA L.M.S" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Institutional URL</label>
                  <input className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" defaultValue="ajinora.academy" />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Platform Tagline</label>
                  <input className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" defaultValue="The Next Horizon of Digital Mastery." />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden">
            <CardHeader className="bg-[#f9fafb] dark:bg-[#202020] border-b border-[#e5e7eb] dark:border-[#2e2e2e] p-8">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Shield size={18} />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Access Controls</CardTitle>
              </div>
              <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter">Identity & Security Protocols</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {[
                { label: "Two-Factor matrix authentication", desc: "Require secondary verification for administrative access.", enabled: true },
                { label: "Institutional IP restriction", desc: "Limit access to verified network clusters.", enabled: false },
                { label: "Session heartbeat monitoring", desc: "Automatically terminate inactive identity sessions.", enabled: true }
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f9fafb] dark:bg-[#252525] border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-[#37352f] dark:text-white group-hover:text-primary transition-colors">{opt.label}</p>
                    <p className="text-[9px] font-medium text-[#a1a1a1] mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`h-6 w-11 rounded-full relative transition-colors ${opt.enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${opt.enabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden">
            <CardHeader className="p-6 border-b border-dashed border-slate-100 dark:border-[#2e2e2e]">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {[
                 { label: "Archive Storage", val: "42.8 GB / 100 GB", progress: 42 },
                 { label: "Identity Nodes", val: "1,248 Active", progress: 85 },
                 { label: "System Uptime", val: "99.98% Guaranteed", progress: 99 }
               ].map((m, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-[#a1a1a1]">{m.label}</span>
                       <span className="text-primary">{m.val}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${m.progress}%` }} className="h-full bg-primary" />
                    </div>
                 </div>
               ))}
            </CardContent>
           </Card>

           <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-[#37352f] dark:bg-[#111] rounded-3xl overflow-hidden p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-primary mx-auto mb-6 shadow-inner ring-1 ring-white/10">
                 <Lock size={28} />
              </div>
              <h3 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Matrix Lockdown</h3>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-6">Instantly terminate all active institutional sessions.</p>
              <Button variant="destructive" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20">Initite Zero-Protocol</Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
