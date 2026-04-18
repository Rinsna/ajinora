"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Shield, Bell, Monitor, Save, Loader2, Globe, Lock, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSettings } from "@/components/settings-provider";

export default function AdminSettings() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [saving, setSaving] = useState(false);

  // Local state
  const [formData, setFormData] = useState({
    brand_name: "",
    tagline: "",
    hero_title: "",
    hero_description: "",
    logo_url: "",
    two_factor_auth: false,
    ip_restriction: false,
    session_heartbeat: true,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFormData({
        brand_name: settings?.brand_name || "",
        tagline: settings?.tagline || "",
        hero_title: settings?.hero_title || "",
        hero_description: settings?.hero_description || "",
        logo_url: settings?.logo_url || "",
        two_factor_auth: settings?.two_factor_auth || false,
        ip_restriction: settings?.ip_restriction || false,
        session_heartbeat: settings?.session_heartbeat ?? true,
      });
    }
  }, [isLoading, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof formData] }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, logo_url: result.url }));
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        updateSettings(formData);
      } else {
        alert("Failed to update settings");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
     return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fly-in-up text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold uppercase tracking-widest text-xs shadow-md flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
          Save Changes
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
              <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter">Institutional Branding & Visuals</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-6 pb-6 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
                <div className="space-y-3 flex-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Institutional Logo</label>
                   <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative group">
                          {formData.logo_url ? (
                             <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                             <ImageIcon size={24} className="text-[#a1a1a1]" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload size={16} className="text-white" />
                          </div>
                          <input type="file" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                         <div className="relative w-fit">
                            <input type="file" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <Button type="button" variant="outline" className="w-full justify-center rounded-xl bg-white dark:bg-[#252525]" disabled={uploadingLogo}>
                               {uploadingLogo ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                               Upload New Identity Mark
                            </Button>
                         </div>
                         <p className="text-[9px] text-[#a1a1a1] uppercase font-bold tracking-widest">Recommended: 500x500px, PNG or SVG. Max 5MB.</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Platform Name</label>
                  <input name="brand_name" value={formData.brand_name} onChange={handleChange} className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-[#37352f] dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Institutional Tagline</label>
                  <input name="tagline" value={formData.tagline} onChange={handleChange} className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-[#37352f] dark:text-white" />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-[#e5e7eb] dark:border-[#2e2e2e]">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Landing Page Copywriting</h4>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Hero Title</label>
                   <input name="hero_title" value={formData.hero_title} onChange={handleChange} className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-[#37352f] dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Hero Description</label>
                  <textarea name="hero_description" value={formData.hero_description} onChange={handleChange} rows={3} className="w-full bg-[#f9fafb] dark:bg-[#252525] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-[#37352f] dark:text-white resize-none" />
                </div>
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
                { key: "two_factor_auth", label: "Two-Factor matrix authentication", desc: "Require secondary verification for administrative access." },
                { key: "ip_restriction", label: "Institutional IP restriction", desc: "Limit access to verified network clusters." },
                { key: "session_heartbeat", label: "Session heartbeat monitoring", desc: "Automatically terminate inactive identity sessions." }
              ].map((opt, i) => {
                const isEnabled = formData[opt.key as keyof typeof formData] as boolean;
                return (
                <div key={i} onClick={() => handleToggle(opt.key)} className="flex items-center justify-between p-4 rounded-2xl bg-[#f9fafb] dark:bg-[#252525] border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-[#37352f] dark:text-white group-hover:text-primary transition-colors">{opt.label}</p>
                    <p className="text-[9px] font-medium text-[#a1a1a1] mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`h-6 w-11 rounded-full relative transition-colors ${isEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              )})}
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
