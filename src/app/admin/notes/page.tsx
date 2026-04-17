"use client";

import {
  Link2, MonitorPlay, FileCode, HardDrive, Globe,
  Check, XCircle, User, Clock, FileQuestion,
  Plus, Search, FileText, Trash2, Edit2,
  UploadCloud, Loader2, X, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function NotesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [category, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/admin/notes");
      const data = await res.json();
      if (Array.isArray(data)) setNotes(data);
    } catch (e) {
      console.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (e) {}
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (e) {} finally { setRequestsLoading(false); }
  };

  useEffect(() => {
    setMounted(true);
    fetchNotes();
    fetchCourses();
    fetchRequests();
  }, []);

  const handleFileUpload = async (): Promise<string> => {
    if (!file) return url;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const finalUrl = uploadMode === "file" ? await handleFileUpload() : url;
      const method = editingNoteId ? "PUT" : "POST";
      const endpoint = editingNoteId ? `/api/admin/notes/${editingNoteId}` : "/api/admin/notes";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, category, url: finalUrl, course_id: courseId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save resource");
      setShowModal(false);
      resetForm();
      fetchNotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setType("pdf");
    setCategory(""); setUrl(""); setCourseId("");
    setFile(null); setUploadMode("url");
    setEditingNoteId(null); setError("");
  };

  const handleEdit = (note: any) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setDescription(note.description || "");
    setType(note.type);
    setCategory(note.category || "");
    setUrl(note.url);
    setCourseId(note.course_id ? String(note.course_id) : "");
    setUploadMode("url");
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this resource?")) return;
    try {
      const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
      if (res.ok) fetchNotes();
    } catch (e) {}
  };

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || "Update failure.");
      }
    } catch (e) {
      alert("Institutional connection interrupted.");
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm("Decommission this request protocol?")) return;
    try {
      const res = await fetch(`/api/admin/requests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || "Decommissioning failure.");
      }
    } catch (e) {
      alert("Institutional connection interrupted.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText size={22} className="text-red-500" />;
      case "video": return <MonitorPlay size={22} className="text-purple-600" />;
      case "link": return <Link2 size={22} className="text-blue-500" />;
      default: return <FileCode size={22} className="text-primary" />;
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Resource Management</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Upload and categorize study notes, videos, and links for students.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase text-xs tracking-widest bg-primary hover:bg-primary/90 text-white rounded-2xl">
          <UploadCloud size={20} /> Upload New Resource
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-accent/20 p-4 rounded-[1.5rem] shadow-inner">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input type="text" placeholder="Search resources..." className="w-full bg-background border-none rounded-xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xl font-bold italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-white/40 dark:bg-black/20 px-6 py-4 rounded-xl border border-primary/5">
            {notes.length} Resources
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-left">
          {loading ? (
            <div className="col-span-full py-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : notes
            .filter(n => n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || n.category?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((note) => (
              <Card key={note.id} className="group border-none shadow-sm hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl p-2 rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button onClick={() => handleEdit(note)} variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/10"><Edit2 size={16} /></Button>
                  <Button onClick={() => handleDelete(note.id)} variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                </div>
                <CardHeader className="pb-4 p-8">
                  <div className="flex items-center gap-2 mb-2 flex-wrap text-left">
                    <div className="px-3 py-1.5 rounded-xl bg-primary/5 text-[9px] uppercase font-black tracking-[0.2em] text-primary border border-primary/10">
                      {note.category || 'General'}
                    </div>
                    {note.course_title && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-[9px] uppercase font-black tracking-[0.2em] text-emerald-600 border border-emerald-500/20">
                        {note.course_title}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none line-clamp-1 group-hover:text-primary transition-colors">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-8 pt-0">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30 border border-border/50 group-hover:bg-primary/5 transition-colors shadow-inner">
                    <div className="p-3 rounded-xl bg-background shadow-xl group-hover:scale-110 transition-transform duration-500 border border-border/40 text-left">
                      {getIcon(note.type)}
                    </div>
                    <div className="flex-1 overflow-hidden text-left">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Type</p>
                      <p className="text-xs font-black uppercase truncate italic text-left">{note.type}</p>
                    </div>
                  </div>
                  {note.description && <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity text-left">{note.description}</p>}
                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-border/50">
                    <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest italic">{mounted ? new Date(note.created_at).toLocaleDateString() : '...'}</span>
                    <Button onClick={() => window.open(note.url, '_blank')} variant="ghost" size="sm" className="h-10 text-[10px] font-black uppercase tracking-[0.2em] text-primary gap-2 p-0 hover:bg-transparent hover:translate-x-2 transition-transform">
                      Open <ChevronRight size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

          {!loading && notes.length === 0 && (
            <Card className="col-span-full rounded-[2.5rem] border-4 border-dashed border-primary/10 bg-primary/5 flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-primary/10 transition-all min-h-[300px]" onClick={() => setShowModal(true)}>
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-2xl"><Plus size={36} /></div>
              <h3 className="font-black text-xl uppercase tracking-tighter">No Resources Yet</h3>
              <p className="text-xs font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest italic">Click to upload your first resource.</p>
            </Card>
          )}
        </div>

        {/* Intelligence Requests Section */}
        <div className="mt-20 space-y-8 text-left">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tighter uppercase">Intelligence Requests</h2>
            <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
              {requests.filter(r => r.status === 'pending').length} Actions Required
            </div>
          </div>

          {requestsLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : requests.length === 0 ? (
            <Card className="rounded-[2.5rem] border-4 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] bg-[#f9fafb] dark:bg-[#202020] p-12 text-center opacity-30">
               <FileQuestion size={40} className="mx-auto mb-4 text-[#a1a1a1]" />
               <p className="text-xs font-black uppercase tracking-widest italic text-[#a1a1a1]">Zero pending requirement protocols.</p>
            </Card>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {requests.map((req) => (
                  <Card key={req.id} className="rounded-3xl border border-[#e5e7eb] dark:border-[#2e2e2e] bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden">
                     <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className={cn("px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-sm", 
                              req.status === 'fulfilled' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                              'bg-amber-500/10 text-amber-500 border-amber-500/20')}>
                              {req.status}
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => updateRequestStatus(req.id, 'fulfilled')} className="h-8 w-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                 <Check size={14} />
                              </button>
                              <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                 <XCircle size={14} />
                              </button>
                              <button onClick={() => deleteRequest(req.id)} className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>

                        <div className="text-left">
                           <h3 className="text-lg font-black uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors leading-tight text-left">{req.topic}</h3>
                           <p className="text-sm font-medium text-muted-foreground line-clamp-3 italic opacity-80 leading-relaxed text-left">{req.description}</p>
                        </div>

                        <div className="pt-4 border-t border-dashed border-border/40 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                 <User size={14} />
                              </div>
                              <div className="text-left">
                                 <p className="text-xs font-black uppercase text-foreground leading-none">{req.studentName}</p>
                                 <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">@{req.studentId}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight opacity-50">
                              <Clock size={12} />
                              {new Date(req.created_at).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <Card className="w-full max-w-md rounded-[2rem] border-2 border-primary/20 bg-card overflow-hidden shadow-3xl my-auto text-left">
            <CardHeader className="bg-primary px-6 py-4 text-white relative text-left">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="absolute top-4 right-6 text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <CardTitle className="text-lg font-black uppercase tracking-tighter leading-none text-left">{editingNoteId ? 'Update Resource' : 'Upload Resource'}</CardTitle>
              <CardDescription className="text-white/60 font-black uppercase text-[9px] tracking-widest pt-1 italic text-left">{editingNoteId ? 'Modify existing resource' : 'Add to library'}</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                {/* Title */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner" placeholder="Resource title" />
                </div>

                {/* Type + Category */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner appearance-none">
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Category</label>
                    <input required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner" placeholder="e.g. Frontend" />
                  </div>
                </div>

                {/* Course */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Assign to Course (optional)</label>
                  <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner appearance-none">
                    <option value="">— All Students —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground/50 ml-1 mt-0.5">Only students enrolled in the selected course will see this resource.</p>
                </div>

                {/* Upload mode toggle */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Source</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setUploadMode("url")} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${uploadMode === "url" ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-accent/30 text-muted-foreground"}`}>
                      <Globe size={14} /> URL
                    </button>
                    <button type="button" onClick={() => setUploadMode("file")} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${uploadMode === "file" ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-accent/30 text-muted-foreground"}`}>
                      <HardDrive size={14} /> From Device
                    </button>
                  </div>
                </div>

                {uploadMode === "url" ? (
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">URL</label>
                    <input required value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all shadow-inner" placeholder="https://..." />
                  </div>
                ) : (
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">File</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="w-full bg-accent/30 border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      {file ? (
                        <p className="text-sm font-bold text-primary truncate text-left">{file.name}</p>
                      ) : (
                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest text-left">Click to select file</p>
                      )}
                    </div>
                    <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-accent/30 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary focus:outline-none transition-all h-14 resize-none shadow-inner" placeholder="Brief description..." />
                </div>

                {error && <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-xs font-bold">{error}</div>}

                <Button type="submit" disabled={creating || uploading} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all">
                  {(creating || uploading) ? <Loader2 className="animate-spin" size={18} /> : (editingNoteId ? "Update Resource" : "Save Resource")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
