"use client";

import { 
  BookOpen, 
  MonitorPlay, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight,
  Loader2,
  Lock,
  ArrowRight,
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import QuizPlayer from "@/components/student/QuizPlayer";
import { validateQuizConfig } from "@/lib/quiz-types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentCourse() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState<any>(null);
  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [quizAsset, setQuizAsset] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleAssetClick = (asset: any) => {
    if (['quiz', 'puzzle', 'exercise'].includes(asset.type)) {
      setQuizAsset(asset);
    } else {
      setActiveAsset(asset);
      setShowViewer(true);
      if (asset.type === 'video') {
        setSidebarCollapsed(true);
      }
      if (!asset.completed) {
        handleToggleAsset(asset.id, false, false);
      }
    }
  };

  const loadNextAsset = (currentAssetId: number) => {
    if (!activeModule) return;
    const assets = activeModule.assets || [];
    const currentIndex = assets.findIndex((a: any) => a.id === currentAssetId);
    if (currentIndex !== -1 && currentIndex < assets.length - 1) {
      const nextAsset = assets[currentIndex + 1];
      setTimeout(() => {
        handleAssetClick(nextAsset);
      }, 2000);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const handleQuizComplete = async (res: any) => {
    if (!quizAsset) return;
    try {
      const response = await fetch('/api/student/exercises/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: quizAsset.id,
          score: res.score,
          totalPoints: res.totalPoints,
          correctCount: res.correctCount,
          totalQuestions: res.totalQuestions,
          percentage: res.percentage
        })
      });
      const responseData = await response.json();
      if (responseData.rank) {
        setQuizAsset((prev: any) => ({ ...prev, rank: responseData.rank }));
      }
      handleToggleAsset(quizAsset.id, false, true);
    } catch (e) {
      console.error("Exercise submission error:", e);
    }
  };

  const handleToggleAsset = async (assetId: number, isCurrentlyCompleted: boolean, triggerNext: boolean = false) => {
    try {
      const method = isCurrentlyCompleted ? "DELETE" : "POST";
      const res = await fetch("/api/student/course/complete-asset", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (res.ok) {
        const newStatus = !isCurrentlyCompleted;
        setData((prev: any) => ({
          ...prev,
          content: prev.content.map((mod: any) => ({
            ...mod,
            assets: mod.assets.map((a: any) => 
              a.id === assetId ? { ...a, completed: newStatus } : a
            )
          }))
        }));
        
        if (activeModule) {
           setActiveModule((prev: any) => ({
             ...prev,
             assets: prev.assets.map((a: any) => 
               a.id === assetId ? { ...a, completed: newStatus } : a
             )
           }));
        }

        if (activeAsset?.id === assetId) {
           setActiveAsset((prev: any) => ({ ...prev, completed: newStatus }));
        }

        if (!isCurrentlyCompleted && triggerNext) {
           loadNextAsset(assetId);
        }
      }
    } catch (e) {
      console.error("Failed to toggle asset verification");
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch("/api/student/course");
        const json = await res.json();
        if (res.ok) {
            setData(json);
            if (json.content?.length > 0) setActiveModule(json.content[0]);
        } else {
            setError(json.error);
        }
      } catch (e) {
        setError("Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
           <Lock size={28} />
        </div>
        <h2 className="text-lg font-bold text-red-500">{error}</h2>
        <p className="text-xs text-muted-foreground/60 max-w-sm">Please verify your enrollment credentials.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="h-9 px-5 rounded-xl text-xs font-semibold">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-background">

      {/* ── Left Sidebar: Module List ── */}
      <motion.div 
        initial={false}
        animate={{ width: sidebarCollapsed ? 0 : 300, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "h-full border-r border-border/50 bg-card flex flex-col relative shrink-0",
          sidebarCollapsed && "border-none"
        )}
      >
        <div className={cn(
          "flex-1 flex flex-col min-w-[300px] h-full overflow-hidden transition-opacity duration-300",
          sidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          {/* Course Title & Progress */}
          <div className="px-5 py-4 border-b border-border/50 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">Your Course</p>
            <h2 className="text-sm font-bold tracking-tight truncate">{data.course.title}</h2>
            <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[15%] transition-all duration-700" />
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1">15% complete</p>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-1">
            {data.content.map((module: any, idx: number) => {
              const isActive = activeModule?.id === module.id;
              const completedCount = module.assets?.filter((a: any) => a.completed).length || 0;
              const totalCount = module.assets?.length || 0;
              return (
                <button 
                  key={module.id} 
                  onClick={() => { setActiveModule(module); setActiveAsset(null); setShowViewer(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group",
                    isActive ? "bg-primary/5 ring-1 ring-primary/20 shadow-sm" : "hover:bg-accent/60"
                  )}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold border transition-all",
                    isActive ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border/50"
                  )}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-xs font-semibold tracking-tight truncate leading-tight",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>{module.title}</h4>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">{completedCount}/{totalCount} done</p>
                  </div>
                  {completedCount === totalCount && totalCount > 0 && (
                    <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-9 w-5 bg-card border border-border/50 flex items-center justify-center rounded-r-lg shadow-sm z-[100] transition-all duration-300",
            sidebarCollapsed ? "left-0" : "-right-2.5 border-l-0"
          )}
        >
          <ChevronRight size={13} className={cn("transition-transform duration-300 text-primary", sidebarCollapsed ? "" : "rotate-180")} />
        </button>
      </motion.div>

      {/* ── Right Content ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
        <AnimatePresence mode="wait">

          {activeAsset && showViewer ? (
            /* ── Viewer Mode ── */
            <motion.div 
               key="viewer"
               initial={{ opacity: 0, scale: 0.99 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0 }}
               className="flex-1 flex flex-col p-4 sm:p-6"
            >
               {/* Top Bar */}
               <div className="flex items-center justify-between mb-4">
                 <Button onClick={() => { setShowViewer(false); setSidebarCollapsed(false); }} variant="ghost" className="gap-1.5 font-semibold text-xs text-muted-foreground hover:text-primary px-0 h-8">
                   <ArrowLeft size={14} /> Back to Module
                 </Button>
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-medium text-muted-foreground/50">Live</span>
                 </div>
               </div>
               
               {/* Player */}
               <div className="max-w-5xl mx-auto w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-border/20">
                  {activeAsset.type === 'video' ? (
                     <div className="w-full h-full">
                       {activeAsset.details.startsWith('http') 
                         ? <iframe src={getEmbedUrl(activeAsset.details)} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen />
                         : <video src={activeAsset.details} controls className="w-full h-full object-contain" autoPlay onEnded={() => loadNextAsset(activeAsset.id)} />
                       }
                     </div>
                  ) : (
                     <iframe src={getEmbedUrl(activeAsset.details)} className="w-full h-full border-none bg-white" />
                  )}
               </div>

               {/* Meta + Action */}
               <div className="mt-4 max-w-5xl mx-auto w-full flex items-center justify-between gap-4 py-3 border-t border-border/50">
                 <div className="min-w-0">
                   <h2 className="text-base font-bold tracking-tight truncate">{activeAsset.title}</h2>
                   <p className="text-[10px] text-muted-foreground/40 mt-0.5 truncate font-mono">{activeAsset.details}</p>
                 </div>
                 <Button 
                   onClick={() => handleToggleAsset(activeAsset.id, activeAsset.completed, true)}
                   className={cn(
                     "gap-2 font-semibold text-xs h-9 px-5 rounded-xl shadow-sm shrink-0",
                     activeAsset.completed ? "bg-green-500 hover:bg-red-500 text-white" : "bg-primary hover:bg-primary/90 text-white"
                   )}
                 >
                   <CheckCircle2 size={14} />
                   {activeAsset.completed ? "Next" : "Mark Done"}
                 </Button>
               </div>
            </motion.div>

          ) : activeModule ? (
            /* ── Asset List View ── */
            <motion.div 
               key="asset-list"
               initial={{ opacity: 0, x: 8 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0 }}
               className="flex-1 p-5 sm:p-8 overflow-y-auto scrollbar-none"
            >
               <div className="max-w-3xl w-full mx-auto space-y-6 pb-12">

                 {/* Module Header */}
                 <div className="pb-5 border-b border-border/50">
                   <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">Current Module</p>
                   <h1 className="text-xl font-bold tracking-tight">{activeModule.title}</h1>
                   <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/60 font-medium">
                     <span className="flex items-center gap-1">
                       <BookOpen size={11} />
                       {activeModule.assets?.length || 0} lessons
                     </span>
                     <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                     <span className="text-green-600 font-semibold">
                       {activeModule.assets?.filter((a: any) => a.completed).length || 0} completed
                     </span>
                   </div>
                 </div>

                 {/* Lessons */}
                 <div className="space-y-2">
                   <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-1 mb-2">Lessons</p>

                   {activeModule.assets && activeModule.assets.length > 0 ? activeModule.assets.map((asset: any) => {
                     const isExercise = ['quiz', 'puzzle', 'exercise'].includes(asset.type);
                     return (
                       <div 
                         key={asset.id} 
                         onClick={() => {
                           if (isExercise) { handleAssetClick(asset); }
                           else { setActiveAsset(asset); setShowViewer(true); }
                         }}
                         className="group flex items-center gap-4 px-4 py-3.5 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer"
                       >
                         {/* Type Icon */}
                         <div className={cn(
                           "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border transition-all group-hover:scale-105",
                           asset.type === 'video' || asset.type === 'recorded'
                             ? "bg-blue-500/10 text-blue-500 border-blue-500/10"
                             : asset.type === 'exercise'
                             ? "bg-orange-500/10 text-orange-500 border-orange-500/10"
                             : asset.type === 'video_url'
                             ? "bg-purple-500/10 text-purple-500 border-purple-500/10"
                             : "bg-amber-500/10 text-amber-500 border-amber-500/10"
                         )}>
                           {asset.type === 'video' || asset.type === 'recorded' ? <MonitorPlay size={16} /> : 
                            asset.type === 'exercise' ? <HelpCircle size={16} /> : 
                            asset.type === 'video_url' ? <PlayCircle size={16} /> :
                            <FileText size={16} />}
                         </div>

                         {/* Info */}
                         <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors truncate">{asset.title}</h4>
                           <span className={cn(
                             "text-[10px] font-medium uppercase tracking-widest",
                             asset.type === 'video' || asset.type === 'recorded' ? "text-blue-400" :
                             asset.type === 'exercise' ? "text-orange-400" :
                             asset.type === 'video_url' ? "text-purple-400" : "text-amber-400"
                           )}>{asset.type}</span>
                         </div>

                         {/* Complete Toggle */}
                         <div className="shrink-0 flex items-center gap-2">
                           {asset.completed ? (
                             <div 
                               onClick={(e) => { e.stopPropagation(); handleToggleAsset(asset.id, true); }}
                               className="h-7 w-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm hover:bg-red-500 transition-colors"
                               title="Mark Incomplete"
                             >
                               <CheckCircle2 size={13} />
                             </div>
                           ) : (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleToggleAsset(asset.id, false); }}
                               className="h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/40 hover:bg-green-500 hover:text-white transition-all"
                               title="Mark Complete"
                             >
                               <CheckCircle2 size={13} />
                             </button>
                           )}
                           <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                         </div>
                       </div>
                     );
                   }) : (
                     <div className="py-12 flex flex-col items-center justify-center opacity-30 border border-dashed border-border rounded-xl">
                       <Loader2 size={24} className="text-muted-foreground mb-3 animate-spin" />
                       <p className="text-xs font-medium">No lessons in this module yet.</p>
                     </div>
                   )}
                 </div>

                 {/* Navigation */}
                 {(() => {
                   const currentIndex = data.content.findIndex((m: any) => m.id === activeModule.id);
                   const canGoBack = currentIndex > 0;
                   const canGoForward = currentIndex !== -1 && currentIndex < data.content.length - 1;
                   return (
                     <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                       <Button 
                         variant="outline" 
                         disabled={!canGoBack}
                         onClick={() => { 
                           setActiveModule(data.content[currentIndex - 1]); 
                           setActiveAsset(null); 
                           setShowViewer(false); 
                         }}
                         className="h-10 rounded-xl border border-border/50 text-xs font-semibold gap-2 group"
                       >
                         <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                         Previous
                       </Button>
                       <Button 
                         disabled={!canGoForward}
                         onClick={() => { 
                           setActiveModule(data.content[currentIndex + 1]); 
                           setActiveAsset(null); 
                           setShowViewer(false); 
                         }}
                         className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-2 shadow-sm group"
                       >
                         Next Module
                         <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                       </Button>
                     </div>
                   );
                 })()}
               </div>
            </motion.div>

          ) : (
            /* ── Empty State ── */
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
               <div className="h-14 w-14 rounded-2xl bg-card border border-border/40 shadow-sm flex items-center justify-center mb-4">
                 <PlayCircle size={24} className="text-primary" />
               </div>
               <h3 className="text-sm font-bold tracking-tight">Select a module to begin</h3>
               <p className="text-xs text-muted-foreground/50 mt-1">Choose from the sidebar on the left.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Exercise Overlay ── */}
      {quizAsset && (() => {
        try {
          const config = validateQuizConfig(JSON.parse(quizAsset.details));
          return (
            <QuizPlayer
              title={quizAsset.title}
              questions={config.questions}
              quizType={quizAsset.type}
              timerEnabled={config.timerEnabled}
              timerSeconds={config.timerSeconds}
              onClose={() => setQuizAsset(null)}
              onComplete={handleQuizComplete}
              rank={quizAsset.rank}
            />
          );
        } catch {
          return (
            <QuizPlayer
              title={quizAsset.title}
              questions={[]}
              onClose={() => setQuizAsset(null)}
            />
          );
        }
      })()}
    </div>
  );
}
