"use client";

import {
  Plus, Search, BookOpen, Trash2, Edit2, ChevronRight,
  MonitorPlay, Loader2, X, FileText, Upload, PlusCircle,
  Link2, Hash, ChevronDown, Video, ClipboardList,
  Puzzle, Dumbbell, PlayCircle, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import QuizBuilder from "./QuizBuilder";

type Course = { id: number; title: string; description: string; thumbnail: string };
type Module = { id: number; course_id: number; title: string; details: string; type: string };
type Asset  = { id: number; module_id: number; title: string; type: string; details: string };
type AssetType = "video" | "recorded" | "video_url" | "notes" | "exercise";

const ASSET_TABS: { type: AssetType; label: string; icon: React.ReactNode }[] = [
  { type: "video",     label: "Video",          icon: <Video size={13} /> },
  { type: "recorded",  label: "Recorded Class",  icon: <PlayCircle size={13} /> },
  { type: "video_url", label: "Video URL",       icon: <Link2 size={13} /> },
  { type: "notes",     label: "Notes",           icon: <FileText size={13} /> },
  { type: "exercise",  label: "Exercise",        icon: <Dumbbell size={13} /> },
];

function assetIcon(type: string) {
  switch (type) {
    case "video":     return <Video size={13} className="text-primary shrink-0" />;
    case "recorded":  return <PlayCircle size={13} className="text-purple-500 shrink-0" />;
    case "video_url": return <Link2 size={13} className="text-blue-500 shrink-0" />;
    case "notes":     return <FileText size={13} className="text-amber-500 shrink-0" />;
    case "exercise":  return <Dumbbell size={13} className="text-orange-500 shrink-0" />;
    default:          return <FileText size={13} className="text-[#a1a1a1] shrink-0" />;
  }
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

export default function CoursesManagement() {
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse]     = useState<Course | null>(null);
  const [cTitle, setCTitle]   = useState("");
  const [cDesc, setCDesc]     = useState("");
  const [cThumb, setCThumb]   = useState("");
  const [cSaving, setCsaving] = useState(false);
  const [cError, setCError]   = useState("");

  // modules
  const [modules, setModules]               = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  // module modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule]     = useState<Module | null>(null);
  const [mNum, setMNum]     = useState("");
  const [mTitle, setMTitle] = useState("");
  const [mCover, setMCover] = useState("");
  const [mSaving, setMSaving] = useState(false);

  // assets
  const [assets, setAssets]               = useState<Record<number, Asset[]>>({});
  const [loadingAssets, setLoadingAssets] = useState<Record<number, boolean>>({});

  // asset modal
  const [assetModule, setAssetModule] = useState<Module | null>(null);
  const [assetTab, setAssetTab]       = useState<AssetType>("video");
  const [aTitle, setATitle]           = useState("");
  const [aDetails, setADetails]       = useState("");
  const [aSaving, setASaving]         = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // exercise builder
  const [quizModule, setQuizModule]   = useState<Module | null>(null);
  const [quizType, setQuizType]       = useState<"exercise">("exercise");

  // ── data fetching ──────────────────────────────────────────────────────────
  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const d   = await res.json();
      if (Array.isArray(d)) setCourses(d);
    } finally { setLoading(false); }
  };

  const fetchModules = async (courseId: number) => {
    setLoadingModules(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/content`);
      const d   = await res.json();
      if (Array.isArray(d)) setModules(d);
    } finally { setLoadingModules(false); }
  };

  const fetchAssets = async (moduleId: number) => {
    setLoadingAssets(p => ({ ...p, [moduleId]: true }));
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourse!.id}/content/${moduleId}/assets`);
      const d   = await res.json();
      if (Array.isArray(d)) setAssets(p => ({ ...p, [moduleId]: d }));
    } finally { setLoadingAssets(p => ({ ...p, [moduleId]: false })); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const selectCourse = (c: Course) => {
    setSelectedCourse(c);
    setExpandedModule(null);
    setAssetModule(null);
    setQuizModule(null);
    setModules([]);
    setAssets({});
    fetchModules(c.id);
  };

  // ── course CRUD ────────────────────────────────────────────────────────────
  const openCourseModal = (c?: Course) => {
    setEditingCourse(c || null);
    setCTitle(c?.title || "");
    setCDesc(c?.description || "");
    setCThumb(c?.thumbnail || "");
    setCError("");
    setShowCourseModal(true);
  };

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCsaving(true); setCError("");
    try {
      const url    = editingCourse ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cTitle, description: cDesc, thumbnail: cThumb }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setShowCourseModal(false);
      if (editingCourse && selectedCourse?.id === editingCourse.id) {
        setSelectedCourse(p => p ? { ...p, title: cTitle, description: cDesc, thumbnail: cThumb } : p);
      }
      fetchCourses();
    } catch (err: any) { setCError(err.message); }
    finally { setCsaving(false); }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    setSelectedCourse(null); setModules([]);
    fetchCourses();
  };

  // ── module CRUD ────────────────────────────────────────────────────────────
  const openModuleModal = (mod?: Module) => {
    setEditingModule(mod || null);
    if (mod) {
      const match = mod.title.match(/^(\d+):\s*(.+)$/);
      setMNum(match ? match[1] : "");
      setMTitle(match ? match[2] : mod.title);
      setMCover(mod.details || "");
    } else {
      setMNum(String(modules.length + 1).padStart(2, "0"));
      setMTitle(""); setMCover("");
    }
    setShowModuleModal(true);
  };

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setMSaving(true);
    try {
      const url    = editingModule
        ? `/api/admin/courses/${selectedCourse.id}/content/${editingModule.id}`
        : `/api/admin/courses/${selectedCourse.id}/content`;
      const method = editingModule ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${mNum}: ${mTitle}`, details: mCover, type: "module" }),
      });
      if (res.ok) { setShowModuleModal(false); fetchModules(selectedCourse.id); }
    } finally { setMSaving(false); }
  };

  const deleteModule = async (modId: number) => {
    if (!confirm("Delete this module?")) return;
    await fetch(`/api/admin/courses/${selectedCourse!.id}/content/${modId}`, { method: "DELETE" });
    if (expandedModule === modId) setExpandedModule(null);
    fetchModules(selectedCourse!.id);
  };

  const toggleModule = (mod: Module) => {
    if (expandedModule === mod.id) {
      setExpandedModule(null);
    } else {
      setExpandedModule(mod.id);
      if (!assets[mod.id]) fetchAssets(mod.id);
      setAssetModule(null);
      setQuizModule(null);
    }
  };

  // ── asset CRUD ─────────────────────────────────────────────────────────────
  const openAssetModal = (mod: Module, type: AssetType = "video", asset?: Asset) => {
    setEditingAsset(asset || null);
    if (type === "exercise" || asset?.type === "exercise") {
      setQuizModule(mod);
      setQuizType("exercise");
      setAssetModule(null);
      return;
    }
    setAssetModule(mod);
    setAssetTab(asset?.type as AssetType || type);
    setATitle(asset?.title || "");
    setADetails(asset?.details || "");
    setQuizModule(null);
  };

  const saveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetModule || !selectedCourse) return;
    setASaving(true);
    try {
      const url = editingAsset 
        ? `/api/admin/courses/${selectedCourse.id}/content/${assetModule.id}/assets/${editingAsset.id}`
        : `/api/admin/courses/${selectedCourse.id}/content/${assetModule.id}/assets`;
      
      const method = editingAsset ? "PATCH" : "POST";

      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: aTitle, type: assetTab, details: aDetails }),
      });
      if (res.ok) {
        setATitle(""); setADetails("");
        fetchAssets(assetModule.id);
        setAssetModule(null);
        setEditingAsset(null);
      }
    } finally { setASaving(false); }
  };

  const deleteAsset = async (moduleId: number, assetId: number) => {
    if (!confirm("Remove this asset?")) return;
    await fetch(`/api/admin/courses/${selectedCourse!.id}/content/${moduleId}/assets/${assetId}`, { method: "DELETE" });
    fetchAssets(moduleId);
  };

  const handleUpload = async (file: File, setter: (u: string) => void, titleSetter?: (t: string) => void) => {
    try {
      const url = await uploadFile(file);
      setter(url);
      if (titleSetter && !aTitle) titleSetter(file.name.replace(/\.[^.]+$/, ""));
    } catch (err: any) { alert(err.message); }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 text-left animate-fly-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Curriculum</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1] mt-1 opacity-70">Design institutional courses.</p>
        </div>
        <Button onClick={() => openCourseModal()} className="flex items-center gap-2 h-12 px-6 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20">
          <PlusCircle size={16} /> New Course
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">

        {/* Course list */}
        <Card className="lg:col-span-2 border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden flex flex-col p-2">
          <CardHeader className="p-4 border-b-2 border-dashed border-[#f3f3f2] dark:border-[#252525] bg-[#f9fafb] dark:bg-[#202020] rounded-2xl mb-3 flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[10px] font-black text-[#a1a1a1] uppercase tracking-widest">Courses</CardTitle>
              <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter mt-0.5">{courses.length} total</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a1]/40" size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-2 pl-9 pr-3 text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary/20 w-36 placeholder:text-[#a1a1a1]/30"
                placeholder="Search..." />
            </div>
          </CardHeader>
          <CardContent className="p-2 flex-1 overflow-y-auto space-y-1.5 scrollbar-none">
            {loading ? (
              <div className="flex justify-center p-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase())).map(course => (
              <div key={course.id} onClick={() => selectCourse(course)}
                className={cn("flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer group transition-all",
                  selectedCourse?.id === course.id
                    ? "bg-primary/5 border-primary shadow-lg"
                    : "bg-[#f9fafb] dark:bg-[#202020] border-transparent hover:border-primary/30"
                )}>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 overflow-hidden",
                  selectedCourse?.id === course.id ? "bg-primary text-white border-primary/20" : "bg-white dark:bg-[#1a1a1a] text-[#a1a1a1] border-[#e5e7eb] dark:border-[#2e2e2e]")}>
                  {course.thumbnail && course.thumbnail.includes('/uploads/')
                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <BookOpen size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm tracking-tight truncate uppercase group-hover:text-primary transition-colors">{course.title}</p>
                  <p className="text-[9px] text-[#a1a1a1] uppercase font-bold tracking-widest opacity-50 truncate">{course.description}</p>
                </div>
                <ChevronRight size={16} className={cn("text-primary shrink-0 transition-all", selectedCourse?.id === course.id ? "opacity-100" : "opacity-0 group-hover:opacity-60")} />
              </div>
            ))}
            {!loading && courses.length === 0 && (
              <div className="py-20 text-center opacity-30">
                <BookOpen size={40} className="mx-auto mb-3 text-[#a1a1a1]" />
                <p className="text-xs font-black uppercase tracking-widest">No courses yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course detail + modules */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div key={selectedCourse.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">

                {/* Course header */}
                <Card className="border-0 shadow-xl bg-primary rounded-3xl overflow-hidden">
                  <CardHeader className="p-5 relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none"><MonitorPlay size={100} /></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4 min-w-0">
                        {selectedCourse.thumbnail && (
                          <img src={selectedCourse.thumbnail} alt="" className="h-12 w-12 rounded-xl object-cover border-2 border-white/20 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <CardTitle className="text-xl font-black tracking-tighter text-white uppercase truncate">{selectedCourse.title}</CardTitle>
                          <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest truncate mt-0.5">{selectedCourse.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-3 shrink-0">
                        <Button onClick={() => openCourseModal(selectedCourse)} variant="ghost" size="icon" className="h-9 w-9 text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20"><Edit2 size={14} /></Button>
                        <Button onClick={() => deleteCourse(selectedCourse.id)} variant="ghost" size="icon" className="h-9 w-9 text-white bg-red-500/20 hover:bg-red-500/40 rounded-xl border border-white/20"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Modules card */}
                <Card className="border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xl bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden flex flex-col p-2">
                  <CardHeader className="p-4 border-b-2 border-dashed border-[#f3f3f2] dark:border-[#252525] bg-[#f9fafb] dark:bg-[#202020] rounded-2xl mb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-[10px] font-black text-[#a1a1a1] uppercase tracking-widest">Modules</CardTitle>
                      <CardDescription className="text-sm font-black text-[#37352f] dark:text-white uppercase tracking-tighter mt-0.5">{modules.length} modules</CardDescription>
                    </div>
                    <Button onClick={() => openModuleModal()} size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white rounded-xl gap-1.5">
                      <Plus size={13} /> Add Module
                    </Button>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2 overflow-y-auto max-h-[520px] scrollbar-none">
                    {loadingModules ? (
                      <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={22} /></div>
                    ) : modules.map(mod => {
                      const match    = mod.title.match(/^(\d+):\s*(.+)$/);
                      const modNum   = match ? match[1] : "";
                      const modName  = match ? match[2] : mod.title;
                      const isOpen   = expandedModule === mod.id;
                      const modAssets = assets[mod.id] || [];
                      return (
                        <div key={mod.id} className={cn("rounded-2xl border-2 transition-all overflow-hidden", isOpen ? "border-primary shadow-lg" : "border-[#e5e7eb] dark:border-[#2e2e2e]")}>
                          {/* Module row */}
                          <div onClick={() => toggleModule(mod)} className="flex items-center gap-3 p-4 cursor-pointer group bg-[#f9fafb] dark:bg-[#202020] hover:bg-primary/5 transition-colors">
                            <div className={cn("h-10 w-10 rounded-xl border-2 overflow-hidden flex items-center justify-center shrink-0 font-black text-sm transition-all",
                              isOpen ? "bg-primary text-white border-primary" : "bg-white dark:bg-[#1a1a1a] border-[#e5e7eb] dark:border-[#2e2e2e] text-primary")}>
                              {mod.details && mod.details.includes("/uploads/")
                                ? <img src={mod.details} alt="" className="w-full h-full object-cover" />
                                : modNum ? <span>{modNum}</span> : <Hash size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm uppercase tracking-tight truncate group-hover:text-primary transition-colors">{modName}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1a1] opacity-60">{modAssets.length} items</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Edit2 onClick={e => { e.stopPropagation(); openModuleModal(mod); }} size={14} className="text-[#a1a1a1] hover:text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
                              <Trash2 onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} size={14} className="text-[#a1a1a1] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
                              <ChevronDown size={16} className={cn("text-primary transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isOpen && (
                            <div className="p-4 pt-2 space-y-3 bg-white dark:bg-[#1a1a1a]">
                              {loadingAssets[mod.id] ? (
                                <div className="py-3 flex justify-center"><Loader2 className="animate-spin text-primary" size={16} /></div>
                              ) : modAssets.length > 0 ? (
                                <div className="space-y-1.5">
                                  {modAssets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-3 bg-[#f9fafb] dark:bg-[#202020] rounded-xl border border-[#e5e7eb] dark:border-[#2e2e2e] group/a">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {assetIcon(asset.type)}
                                        <span className="text-[11px] font-black uppercase tracking-tight truncate opacity-80">{asset.title}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1a1] opacity-40 shrink-0">{asset.type}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover/a:opacity-100 transition-opacity ml-2">
                                        <Edit2 onClick={() => openAssetModal(mod, asset.type as AssetType, asset)} size={11} className="text-[#a1a1a1] hover:text-primary cursor-pointer" />
                                        <Trash2 onClick={() => deleteAsset(mod.id, asset.id)} size={11} className="text-red-400 hover:text-red-500 cursor-pointer" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1] opacity-40 text-center py-2">No content yet.</p>
                              )}

                              {/* Add content buttons */}
                              <div className="grid grid-cols-4 gap-1.5 pt-1">
                                {ASSET_TABS.map(tab => (
                                  <button key={tab.type} onClick={() => openAssetModal(mod, tab.type)}
                                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] text-[#a1a1a1] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-[9px] font-black uppercase tracking-widest">
                                    {tab.icon}
                                    <span className="leading-none">{tab.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {!loadingModules && modules.length === 0 && (
                      <div className="py-16 text-center opacity-30 cursor-pointer" onClick={() => openModuleModal()}>
                        <PlusCircle size={36} className="mx-auto mb-3 text-[#a1a1a1]" />
                        <p className="text-xs font-black uppercase tracking-widest">No modules yet. Add one.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center py-32 opacity-20">
                <div className="text-center">
                  <BookOpen size={56} className="mx-auto mb-4 text-[#a1a1a1]" />
                  <p className="text-sm font-black uppercase tracking-widest">Select a course to manage.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Module modal ── */}
      <AnimatePresence>
        {showModuleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
              <div className="bg-primary p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Module</p>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white">{editingModule ? "Edit Module" : "New Module"}</h3>
                </div>
                <button onClick={() => setShowModuleModal(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={saveModule} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Module #</label>
                    <input required value={mNum} onChange={e => setMNum(e.target.value)}
                      className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="01" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Title</label>
                    <input required value={mTitle} onChange={e => setMTitle(e.target.value)}
                      className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Introduction to..." />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Cover Image (optional)</label>
                  <div className="flex items-center gap-3">
                    {mCover && mCover.includes("/uploads/") && (
                      <img src={mCover} alt="" className="h-14 w-14 rounded-xl object-cover border-2 border-primary/20 shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <input type="file" accept="image/*" className="hidden" id="mod-cover-upload"
                        onChange={async e => {
                          const f = e.target.files?.[0];
                          if (f) { setMSaving(true); try { setMCover(await uploadFile(f)); } finally { setMSaving(false); } }
                        }} />
                      <label htmlFor="mod-cover-upload" className="flex items-center gap-2 bg-[#f9fafb] dark:bg-[#202020] border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] cursor-pointer hover:border-primary hover:text-primary transition-all w-fit">
                        <Upload size={13} /> Upload Image
                      </label>
                      <input value={mCover} onChange={e => setMCover(e.target.value)}
                        className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-2 px-3 text-[10px] font-mono text-[#a1a1a1] focus:outline-none"
                        placeholder="Or paste image URL..." />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={mSaving} className="w-full h-12 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl">
                  {mSaving ? <Loader2 className="animate-spin" size={18} /> : (editingModule ? "Save Changes" : "Create Module")}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Asset modal (video / recorded / video_url / notes) ── */}
      <AnimatePresence>
        {assetModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
              <div className="bg-primary p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Add Content</p>
                  <h3 className="text-base font-black uppercase tracking-tighter text-white truncate">{assetModule.title}</h3>
                </div>
                <button onClick={() => setAssetModule(null)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              {/* Tabs */}
              <div className={cn("flex overflow-x-auto gap-1 p-3 bg-[#f9fafb] dark:bg-[#202020] border-b border-[#e5e7eb] dark:border-[#2e2e2e] scrollbar-none", editingAsset && "opacity-50 pointer-events-none")}>
                {ASSET_TABS.filter(t => t.type !== "exercise").map(tab => (
                  <button key={tab.type} onClick={() => { setAssetTab(tab.type); setADetails(""); }}
                    className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
                      assetTab === tab.type ? "bg-primary text-white shadow-md" : "text-[#a1a1a1] hover:text-primary hover:bg-primary/5"
                    )}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <form onSubmit={saveAsset} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Title</label>
                  <input required value={aTitle} onChange={e => setATitle(e.target.value)}
                    className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Lecture 1 - Introduction" />
                </div>
                {(assetTab === "video" || assetTab === "recorded") && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Upload Video</label>
                    <input type="file" accept="video/*" className="hidden" id="asset-video-upload"
                      onChange={async e => { const f = e.target.files?.[0]; if (f) { setASaving(true); try { await handleUpload(f, setADetails, setATitle); } finally { setASaving(false); } } }} />
                    <label htmlFor="asset-video-upload" className="flex items-center gap-2 bg-[#f9fafb] dark:bg-[#202020] border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] cursor-pointer hover:border-primary hover:text-primary transition-all">
                      <Upload size={13} /> {aDetails ? "Change Video" : "Upload Video File"}
                    </label>
                    {aDetails && <p className="text-[9px] font-mono text-primary truncate px-1">{aDetails}</p>}
                  </div>
                )}
                {assetTab === "video_url" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Video URL</label>
                    <input required value={aDetails} onChange={e => setADetails(e.target.value)}
                      className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="https://youtube.com/..." />
                  </div>
                )}
                {assetTab === "notes" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Upload PDF / Notes</label>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" id="asset-notes-upload"
                      onChange={async e => { const f = e.target.files?.[0]; if (f) { setASaving(true); try { await handleUpload(f, setADetails, setATitle); } finally { setASaving(false); } } }} />
                    <label htmlFor="asset-notes-upload" className="flex items-center gap-2 bg-[#f9fafb] dark:bg-[#202020] border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] cursor-pointer hover:border-primary hover:text-primary transition-all">
                      <Upload size={13} /> {aDetails ? "Change File" : "Upload PDF / Doc"}
                    </label>
                    {aDetails && <p className="text-[9px] font-mono text-primary truncate px-1">{aDetails}</p>}
                  </div>
                )}
                <Button type="submit" disabled={aSaving} className="w-full h-12 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl">
                  {aSaving ? <Loader2 className="animate-spin" size={18} /> : (editingAsset ? "Save Modifications" : "Add Content")}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exercise builder ── */}
      <AnimatePresence>
        {quizModule && selectedCourse && (
          <QuizBuilder
            module={quizModule}
            courseId={selectedCourse.id}
            type={quizType}
            onClose={() => { setQuizModule(null); setEditingAsset(null); }}
            onSaved={() => { fetchAssets(quizModule.id); setQuizModule(null); setEditingAsset(null); }}
            editingAsset={editingAsset}
          />
        )}
      </AnimatePresence>

      {/* ── Course modal ── */}
      <AnimatePresence>
        {showCourseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
              <div className="bg-primary p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Course</p>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white">{editingCourse ? "Edit Course" : "New Course"}</h3>
                </div>
                <button onClick={() => setShowCourseModal(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={saveCourse} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Course Title</label>
                  <input required value={cTitle} onChange={e => setCTitle(e.target.value)}
                    className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Quantitative Finance 101" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Description</label>
                  <textarea value={cDesc} onChange={e => setCDesc(e.target.value)} rows={3}
                    className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Brief course overview..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Cover Image</label>
                  <div className="flex items-center gap-3">
                    {cThumb && <img src={cThumb} alt="" className="h-14 w-14 rounded-xl object-cover border-2 border-primary/20 shrink-0" />}
                    <div className="flex-1 space-y-2">
                      <input type="file" accept="image/*" className="hidden" id="course-thumb-upload"
                        onChange={async e => {
                          const f = e.target.files?.[0];
                          if (f) { setCsaving(true); try { setCThumb(await uploadFile(f)); } catch (err: any) { setCError(err.message); } finally { setCsaving(false); } }
                        }} />
                      <label htmlFor="course-thumb-upload" className="flex items-center gap-2 bg-[#f9fafb] dark:bg-[#202020] border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] cursor-pointer hover:border-primary hover:text-primary transition-all w-fit">
                        <Upload size={13} /> Upload Cover
                      </label>
                      <input value={cThumb} onChange={e => setCThumb(e.target.value)}
                        className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-2 px-3 text-[10px] font-mono text-[#a1a1a1] focus:outline-none"
                        placeholder="Or paste image URL..." />
                    </div>
                  </div>
                </div>
                {cError && <p className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 rounded-xl p-3 border border-red-500/20">{cError}</p>}
                <Button type="submit" disabled={cSaving} className="w-full h-12 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl">
                  {cSaving ? <Loader2 className="animate-spin" size={18} /> : (editingCourse ? "Save Changes" : "Create Course")}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
