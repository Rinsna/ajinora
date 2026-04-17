"use client";

import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Camera, 
  Bell, 
  History, 
  Settings, 
  Save, 
  Trash2, 
  ChevronRight,
  Monitor,
  Smartphone,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCircle,
  FileText,
  Upload,
  Plus, 
  FileCheck,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function StudentProfile() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error("Failed to fetch session");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
    fetchDocuments();
    fetchCertificates();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/student/profile/documents");
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
    } catch (e) {}
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/student/profile/certificates");
      const data = await res.json();
      if (Array.isArray(data)) setCertificates(data);
    } catch (e) {}
  };

  const handleDocUpload = async (file: File) => {
    if (!docTitle) return alert("Please specify document title protocol.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      await fetch("/api/student/profile/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: docTitle, url: uploadData.url }),
      });

      setDocTitle("");
      fetchDocuments();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id: number) => {
    if (!confirm("Decommission this identity credential?")) return;
    try {
      await fetch(`/api/student/profile/documents?id=${id}`, { method: "DELETE" });
      fetchDocuments();
    } catch (e) {}
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      alert("Please enter a new password to update.");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Update failed");
      }
      setSuccess(true);
      setPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing Profile...</p>
      </div>
    );
  }

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "ST";

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">Configure your institutional profile and security protocols.</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-lg border border-green-500/20 text-xs font-semibold animate-in zoom-in-95">
            <CheckCircle2 size={14} /> Profile Synchronized Successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="overflow-hidden border border-border bg-card shadow-sm rounded-2xl">
            <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50" />
            <CardContent className="px-6 pb-8 -mt-12 text-center relative z-10">
              <div className="inline-flex relative group mb-4">
                <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-background transform transition-transform group-hover:scale-105 duration-300">
                  {initials}
                </div>
                <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-lg bg-background border border-border shadow-md flex items-center justify-center text-primary transition-all hover:scale-110 active:scale-95">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-foreground">{user?.full_name}</h2>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1 opacity-80">{user?.role} Portal</p>
              
              <div className="grid grid-cols-1 gap-3 mt-8 text-left">
                <div className="p-3 rounded-xl bg-accent/30 border border-border flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground border border-border/50 shadow-sm">
                    <Mail size={14} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest leading-none mb-1">System ID</p>
                    <p className="text-sm font-semibold truncate text-foreground">@{user?.username}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground border border-border/50 shadow-sm">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest leading-none mb-1">Status</p>
                    <p className="text-sm font-semibold truncate text-foreground">Institutional Verified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <History size={16} className="text-primary" /> Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              {[
                { label: "Desktop Session", icon: <Monitor size={14} />, time: "Current Activity", status: "Active" },
                { label: "Mobile Sync", icon: <Smartphone size={14} />, time: "Offline", status: "Inactive" }
              ].map((ses, i) => (
                <div key={i} className={`flex items-start gap-4 p-3 rounded-xl border transition-all ${ses.status === "Active" ? "bg-primary/5 border-primary/20" : "bg-accent/20 border-border opacity-50"}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm ${ses.status === "Active" ? "bg-primary text-white" : "bg-background text-muted-foreground border border-border"}`}>
                    {ses.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-tight uppercase text-foreground">{ses.label}</p>
                    <p className="text-[10px] font-medium text-muted-foreground/80 mt-1">{ses.time}</p>
                  </div>
                  {ses.status === "Active" && <CheckCircle2 size={12} className="text-green-500 mt-1" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Form */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="p-8 sm:p-10 pb-0">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Settings size={18} />
                 </div>
                 <CardTitle className="text-xl font-bold text-foreground">Security Core</CardTitle>
               </div>
               <CardDescription className="text-sm font-medium text-muted-foreground">Manage your credentials and institutional authentication parameters.</CardDescription>
            </CardHeader>

            <CardContent className="p-8 sm:p-10 space-y-8 mt-4">
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Student Full Name</Label>
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all" size={20} />
                      <Input 
                        disabled
                        value={user?.full_name || ""}
                        className="h-14 pl-12 rounded-xl bg-accent/20 border-border focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Username</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/40 group-focus-within:text-primary transition-all">@</div>
                      <Input 
                        disabled
                        value={user?.username || ""} 
                        className="h-14 pl-12 rounded-xl bg-accent/20 border-border focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 relative">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Modify Password</Label>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] font-bold uppercase text-primary tracking-widest hover:underline flex items-center gap-1.5 transition-all outline-none">
                      {showPassword ? <><EyeOff size={14}/> Sensitive Hide</> : <><Eye size={14}/> Reveal Entry</>}
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all" size={20} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter new secure password to update" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 pr-12 rounded-xl bg-accent/20 border-border focus:ring-2 focus:ring-primary transition-all font-semibold"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-green-500 shadow-sm" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-[10px] font-medium text-muted-foreground/70 italic ml-1">Security protocols suggest updating passwords every quarter.</p>
                    <Button 
                      type="submit" 
                      disabled={updating || !password}
                      className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] gap-2 shadow-sm bg-primary hover:bg-primary/95 transition-all"
                    >
                      {updating ? <Loader2 className="animate-spin" size={12} /> : <><Save size={12} /> Update Security Core</>}
                    </Button>
                  </div>
                </div>

                {/* Identity Credentials Section */}
                <div className="pt-8 border-t border-border/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1.5 block">Identity Credentials</Label>
                      <p className="text-[10px] font-medium text-muted-foreground italic">Upload identity proofs or institutional certifications for verification.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-5 rounded-2xl bg-accent/30 border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/40 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
                           <Plus size={20} />
                        </div>
                        <div className="space-y-3 w-full max-w-[200px]">
                           <Input 
                              placeholder="Document Title..." 
                              className="h-9 text-[10px] font-bold uppercase tracking-widest text-center bg-background border-none shadow-inner"
                              value={docTitle}
                              onChange={(e) => setDocTitle(e.target.value)}
                           />
                           <Button 
                              type="button"
                              onClick={() => fileRef.current?.click()} 
                              disabled={uploading}
                              variant="outline" 
                              className="w-full h-9 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2"
                           >
                              {uploading ? <Loader2 className="animate-spin" size={12} /> : <><Upload size={12} /> Select Matrix</>}
                           </Button>
                           <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0])} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        {documents.length === 0 ? (
                           <div className="h-full flex items-center justify-center border border-border rounded-2xl border-dashed opacity-40">
                              <p className="text-[10px] font-black uppercase tracking-widest italic">Zero Credentials Pulled.</p>
                           </div>
                        ) : documents.map((doc) => (
                           <div key={doc.id} className="p-4 rounded-xl bg-background border border-border flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <FileCheck size={18} />
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-foreground leading-none">{doc.title}</p>
                                    <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${doc.status === 'pending' ? 'text-amber-500' : 'text-green-500'}`}>{doc.status}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button onClick={() => window.open(doc.url, '_blank')} variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"><Eye size={14}/></Button>
                                 <Button onClick={() => deleteDoc(doc.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14}/></Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Institutional Achievements Section */}
                <div className="pt-8 border-t border-border/50 space-y-6">
                   <div>
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 leading-none mb-1.5 block">Institutional Achievements</Label>
                      <p className="text-[10px] font-medium text-muted-foreground italic">Authenticated course completion certificates issued by the academy.</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {certificates.length === 0 ? (
                         <div className="col-span-full py-12 flex flex-col items-center justify-center border border-border rounded-2xl border-dashed opacity-40">
                            <Award className="mb-2 text-muted-foreground" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest italic text-center">Zero achievements identified in record.</p>
                         </div>
                      ) : certificates.map((cert) => (
                         <div key={cert.id} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4 group transition-all hover:bg-emerald-500/10 hover:shadow-lg">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 shrink-0">
                               <Award size={24} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                               <p className="text-xs font-black uppercase text-foreground leading-none truncate">{cert.title}</p>
                               <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2 opacity-60">Matrix Date: {new Date(cert.issued_at).toLocaleDateString()}</p>
                            </div>
                            <Button onClick={() => window.open(cert.url, '_blank')} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest shrink-0">
                               Download
                            </Button>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                   <Button 
                      type="button" 
                      onClick={() => {
                        if (!docTitle) return alert("Please specify the document title above first.");
                        fileRef.current?.click();
                      }}
                      className="h-16 w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/95 transition-all active:scale-[0.98] group"
                   >
                      {uploading ? <Loader2 className="animate-spin" size={20} /> : <><Upload size={18} className="group-hover:translate-y-[-2px] transition-transform" /> Commit Institutional Documents</>}
                   </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="rounded-2xl border-border bg-card shadow-sm p-6 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Bell size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Alert Matrix</p>
                    <p className="text-sm font-bold text-foreground transition-colors">Notification Preferences</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
             </Card>
             <Card className="rounded-2xl border-border bg-card shadow-sm p-6 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Privacy Lab</p>
                    <p className="text-sm font-bold text-foreground transition-colors">Data Cryptography</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
