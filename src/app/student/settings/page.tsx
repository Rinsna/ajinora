"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Shield, Bell, Monitor, Save, Loader2, Globe, Laptop, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

export default function StudentSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fly-in-up text-left max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase leading-none">Experience Protocols</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1] mt-2 opacity-70">Customize your institutional interface and identity.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Commit Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-[#f9fafb] dark:bg-[#202020] border-b border-[#e5e7eb] dark:border-[#2e2e2e] p-8">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Laptop size={18} />
              <CardTitle className="text-[10px] font-black uppercase tracking-widest">Interface Matrix</CardTitle>
            </div>
            <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter">UI & Environment Synchronization</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Platform Theme</label>
               <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col items-center gap-2">
                     <div className="h-10 w-full bg-white rounded-lg border border-slate-200" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Matrix</span>
                  </button>
                  <button className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-col items-center gap-2 opacity-50 grayscale transition-all hover:grayscale-0">
                     <div className="h-10 w-full bg-slate-900 rounded-lg border border-slate-700" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Legacy Dark</span>
                  </button>
               </div>
             </div>
             {[
               { label: "High-fidelity motion protocols", enabled: true },
               { label: "Immersive video auto-focus", enabled: true },
               { label: "Compact curriculum indexing", enabled: false }
             ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f9fafb] dark:bg-[#252525] border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
                  <p className="text-[11px] font-black uppercase tracking-tight text-[#37352f] dark:text-white group-hover:text-primary transition-colors">{opt.label}</p>
                  <div className={`h-6 w-11 rounded-full relative transition-colors ${opt.enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${opt.enabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-[#f9fafb] dark:bg-[#202020] border-b border-[#e5e7eb] dark:border-[#2e2e2e] p-8">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Fingerprint size={18} />
              <CardTitle className="text-[10px] font-black uppercase tracking-widest">Privacy Protocol</CardTitle>
            </div>
            <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter">Identity Protection & Sync</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
             {[
               { label: "Hide institutional profile matrix", enabled: false },
               { label: "Anonymous metric broadcasting", enabled: true },
               { label: "Public achievement verification", enabled: true }
             ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f9fafb] dark:bg-[#252525] border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
                  <p className="text-[11px] font-black uppercase tracking-tight text-[#37352f] dark:text-white group-hover:text-primary transition-colors">{opt.label}</p>
                  <div className={`h-6 w-11 rounded-full relative transition-colors ${opt.enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${opt.enabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
              <div className="pt-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] mb-2 px-2">Institutional Clearance</p>
                 <div className="p-4 rounded-2xl border-2 border-dashed border-red-500/20 bg-red-500/5 text-center">
                    <p className="text-[11px] font-black text-red-500 uppercase tracking-tight">Request Account Termination</p>
                    <p className="text-[9px] text-[#a1a1a1] mt-1 italic">This requires administrative overrides.</p>
                 </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
