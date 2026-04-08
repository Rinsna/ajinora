"use client";

import { 
  BookOpen, 
  MonitorPlay, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight,
  Loader2,
  Calendar,
  Lock,
  Clock,
  ArrowRight,
  Puzzle,
  HelpCircle,
  Trophy,
  ArrowLeftCircle,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      // Automatically verify on selection if not already marked (don't trigger auto-next yet)
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
      // 2s delay for institutional smooth transition
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
      // Also mark as complete in progressive tracking (trigger auto-next after exercise)
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
        
        // Update active states
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

        // Auto-load next if explicitly requested and we just marked as completed
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
        setError("Failed to synchronize with institutional archives.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-700">
        <Loader2 className="animate-spin text-primary" size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 sm:p-10 space-y-8 animate-in fly-in-from-bottom duration-700">
        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 shadow-2xl border-4 border-red-500/20 scale-110">
           <Lock size={40} className="sm:w-16 sm:h-16" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-red-500 uppercase leading-none max-w-lg">{error}</h2>
        <p className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-[#a1a1a1] max-w-md italic opacity-60">Please verify your enrollment credentials with the administrative matrix.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="h-12 sm:h-14 px-8 rounded-xl border-2 border-dashed border-primary/20 text-primary font-black uppercase tracking-widest transition-all">Retry Synchronization</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white dark:bg-[#0a0a0a]">
      {/* ── Left Sidebar: Module List ── */}
      <motion.div 
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? 0 : 380,
          opacity: sidebarCollapsed ? 1 : 1
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "h-full border-r border-[#e5e7eb] dark:border-[#2e2e2e] bg-[#fdfdfd] dark:bg-[#111] flex flex-col relative shrink-0",
          sidebarCollapsed && "border-none"
        )}
      >
        <div className={cn("flex-1 flex flex-col min-w-[380px] h-full overflow-hidden transition-opacity duration-300", sidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
          <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2e2e2e] shrink-0">
            <h1 className="text-lg font-black tracking-tighter text-[#37352f] dark:text-white uppercase truncate line-clamp-1">{data.course.title}</h1>
            <div className="mt-4 h-1.5 w-full bg-[#f3f3f2] dark:bg-[#252525] rounded-full overflow-hidden">
               <div className="h-full bg-primary rounded-full w-[15%]" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-2">
            {data.content.map((module: any, idx: number) => {
              const isActive = activeModule?.id === module.id;
              return (
                <button 
                  key={module.id} 
                  onClick={() => { setActiveModule(module); setActiveAsset(null); setShowViewer(false); }}
                  className={cn(
                    "w-full flex items-start gap-4 p-6 min-h-[110px] rounded-[2rem] transition-all text-left group",
                    isActive ? "bg-primary/5 ring-2 ring-primary/20 shadow-xl shadow-primary/5" : "hover:bg-[#f9fafb] dark:hover:bg-[#1a1a1a]"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black border transition-all",
                    isActive ? "bg-primary text-white border-primary" : "bg-white dark:bg-[#1a1a1a] text-[#a1a1a1] border-[#e5e7eb] dark:border-[#2e2e2e]"
                  )}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", isActive ? "text-primary" : "text-[#a1a1a1]")}>Module</p>
                    <h4 className={cn("text-sm font-black tracking-tight leading-tight uppercase truncate", isActive ? "text-[#37352f] dark:text-white" : "text-[#737373] dark:text-[#a1a1a1]")}>{module.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-[9px] font-bold text-[#a1a1a1] opacity-60 uppercase tracking-widest">{(module.assets?.length || 0)} ARCHIVES</p>
                       {module.assets?.some((a: any) => a.completed) && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-[#a1a1a1] opacity-30" />
                            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                              {module.assets.filter((a: any) => a.completed).length} COMPLETED
                            </p>
                          </>
                       )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-14 w-10 bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] flex items-center justify-center rounded-r-2xl shadow-3xl z-[100] transition-all duration-500",
            sidebarCollapsed ? "left-0 border-l-2" : "-right-5 border-l-0"
          )}
        >
          <ChevronRight size={24} className={cn("transition-transform duration-500 text-primary", sidebarCollapsed ? "" : "rotate-180")} />
        </button>
      </motion.div>

      {/* ── Right Content: Viewer / Asset List ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfa] dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeAsset && showViewer ? (
            /* Viewer Mode (Video/Iframe) */
            <motion.div 
               key="viewer"
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.98 }}
               className="flex-1 flex flex-col p-4 sm:p-8"
            >
               <div className="flex items-center justify-between mb-4">
                 <Button onClick={() => setShowViewer(false)} variant="ghost" className="gap-2 font-black uppercase text-[10px] tracking-widest text-[#a1a1a1] hover:text-primary px-0">
                   <ArrowLeft size={16} /> Exit Focus Mode
                 </Button>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a1a1a1] animate-pulse">Live Synchronization Active</span>
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                 </div>
               </div>
               
               <div className="flex-1 flex max-w-5xl mx-auto w-full aspect-video bg-[#000] rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden shadow-3xl border-[6px] border-white/5 relative group transition-all duration-700">
                  {activeAsset.type === 'video' ? (
                     <div className="w-full h-full">
                       {activeAsset.details.startsWith('http') 
                         ? <iframe src={getEmbedUrl(activeAsset.details)} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen />
                         : <video 
                              src={activeAsset.details} 
                              controls 
                              className="w-full h-full object-contain shadow-2xl" 
                              autoPlay 
                              onEnded={() => loadNextAsset(activeAsset.id)}
                           />
                       }
                     </div>
                  ) : (
                     <iframe src={getEmbedUrl(activeAsset.details)} className="w-full h-full border-none bg-white" />
                  )}
               </div>
                <div className="mt-6 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-[#37352f] dark:text-white mb-1">{activeAsset.title}</h2>
                    <p className="text-[9px] font-bold text-[#a1a1a1] uppercase tracking-[0.1em] opacity-60">Source Protocol: {activeAsset.details}</p>
                  </div>
                  <Button 
                    onClick={() => handleToggleAsset(activeAsset.id, activeAsset.completed, true)}
                    className={cn(
                      "gap-2 font-black uppercase tracking-widest text-[10px] sm:text-xs h-12 px-8 rounded-2xl shadow-xl transition-all",
                      activeAsset.completed 
                        ? "bg-green-500 hover:bg-red-500 text-white shadow-green-500/20" 
                        : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                    )}
                  >
                    <CheckCircle2 size={18} />
                    {activeAsset.completed ? "Next Session" : "Mark Complete"}
                  </Button>
               </div>
            </motion.div>
          ) : activeModule ? (
            /* Asset List View */
            <motion.div 
               key="asset-list"
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="flex-1 flex flex-col p-6 sm:p-12 overflow-y-auto scrollbar-none"
            >
               <div className="max-w-4xl w-full mx-auto space-y-12 pb-20">
                  {/* Module Header Area */}
                  <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-primary to-purple-800 text-white shadow-2xl overflow-hidden group">
                     <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150 pointer-events-none group-hover:rotate-0 transition-transform duration-[3000ms]">
                        {activeModule.type === 'video' ? <MonitorPlay size={200} /> : <BookOpen size={200} />}
                     </div>
                     <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-3">Academic Module</p>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-4 leading-none">{activeModule.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6">
                           <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <MonitorPlay size={12} className="text-white/60" /> 
                              {activeModule.assets?.filter((a: any) => a.completed).length || 0} / {activeModule.assets?.length || 0} Archives Verified
                           </div>
                           {activeModule.details && (
                             <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest italic truncate max-w-sm">Reference: {activeModule.details}</p>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Asset Registry (The Standard List) */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#a1a1a1]">Asset Registry</h3>
                        <div className="h-px flex-1 bg-[#e5e7eb] dark:bg-[#2e2e2e] mx-6 opacity-40 shadow-inner" />
                     </div>

                     <div className="space-y-2">
                        {activeModule.assets && activeModule.assets.length > 0 ? activeModule.assets.map((asset: any) => {
                          const isExercise = ['quiz', 'puzzle', 'exercise'].includes(asset.type);
                          return (
                            <motion.div 
                              key={asset.id} 
                              whileHover={{ x: 8, scale: 1.01 }}
                              onClick={() => {
                                if (isExercise) { handleAssetClick(asset); }
                                else { setActiveAsset(asset); setShowViewer(true); }
                              }}
                              className="group flex items-center gap-7 p-7 min-h-[120px] rounded-[2.5rem] bg-white dark:bg-[#151515] border border-[#e2e8f0] dark:border-[#2e2e2e] hover:border-primary/40 hover:shadow-2xl transition-all cursor-pointer"
                            >
                              <div className={cn(
                                "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border transition-all group-hover:scale-105",
                                asset.type === 'video' ? "bg-blue-500/5 text-blue-500 border-blue-500/10" :
                                asset.type === 'exercise' ? "bg-orange-500/5 text-orange-500 border-orange-500/10" :
                                "bg-amber-500/5 text-amber-500 border-amber-500/10"
                              )}>
                                {asset.type === 'video' ? <MonitorPlay size={24} /> : 
                                 asset.type === 'exercise' ? <HelpCircle size={24} /> : 
                                 <FileText size={24} />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border",
                                    asset.type === 'video' ? "bg-blue-500/10 text-blue-600 border-blue-500/10" :
                                    asset.type === 'exercise' ? "bg-orange-500/10 text-orange-600 border-orange-500/10" :
                                    "bg-amber-500/10 text-amber-600 border-amber-500/10"
                                  )}>
                                    {asset.type}
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-[#a1a1a1] opacity-30" />
                                  <p className="text-[9px] font-bold text-[#a1a1a1] uppercase tracking-widest opacity-60 truncate">Archive {asset.id}</p>
                                </div>
                                <h4 className="text-base sm:text-lg font-black tracking-tight uppercase text-[#37352f] dark:text-white group-hover:text-primary transition-colors truncate">{asset.title}</h4>
                              </div>

                              <div className="shrink-0 flex items-center gap-4 pr-2">
                                 <div className="hidden sm:flex flex-col items-end opacity-40">
                                    <p className="text-[9px] font-black uppercase tracking-widest">Protocol</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest truncate max-w-[100px]">{asset.details.split('/').pop() || 'Institutional'}</p>
                                 </div>
                                  {asset.completed ? (
                                   <div 
                                      onClick={(e) => { e.stopPropagation(); handleToggleAsset(asset.id, true); }}
                                      className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:bg-red-500 transition-colors"
                                      title="Remove Verification"
                                   >
                                      <CheckCircle2 size={18} />
                                   </div>
                                 ) : (
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleToggleAsset(asset.id, false); }}
                                      className="h-10 w-10 rounded-full bg-[#f9fafb] dark:bg-[#202020] flex items-center justify-center text-[#a1a1a1] hover:bg-green-500 hover:text-white transition-all shadow-inner group/btn"
                                      title="Mark as Verified"
                                   >
                                      <CheckCircle2 size={18} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                      <ArrowRight size={18} className="absolute group-hover/btn:opacity-0 transition-opacity" />
                                   </button>
                                 )}
                              </div>
                            </motion.div>
                          );
                        }) : (
                          <div className="py-20 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-[3rem] bg-white dark:bg-[#111]">
                             <Loader2 size={40} className="text-[#a1a1a1] mb-4 animate-spin" />
                             <p className="text-xs font-black uppercase tracking-widest italic">Curriculum index is being generated.</p>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Path Navigation */}
                  {(() => {
                    const currentIndex = data.content.findIndex((m: any) => m.id === activeModule.id);
                    const canGoBack = currentIndex > 0;
                    const canGoForward = currentIndex !== -1 && currentIndex < data.content.length - 1;

                    return (
                      <div className="grid grid-cols-2 gap-4 pt-8">
                        <Button 
                          variant="outline" 
                          disabled={!canGoBack}
                          onClick={() => { 
                            const prevModule = data.content[currentIndex - 1];
                            setActiveModule(prevModule); 
                            setActiveAsset(null); 
                            setShowViewer(false); 
                          }}
                          className="h-14 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-[#e5e7eb] dark:border-[#2e2e2e] text-[10px] sm:text-xs font-black uppercase tracking-widest gap-3 hover:bg-white transition-all shadow-md group border-dashed"
                        >
                          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                          Retrograde Module
                        </Button>
                        <Button 
                          disabled={!canGoForward}
                          onClick={() => { 
                            const nextModule = data.content[currentIndex + 1];
                            setActiveModule(nextModule); 
                            setActiveAsset(null); 
                            setShowViewer(false); 
                          }}
                          className="h-14 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#37352f] dark:bg-white text-white dark:text-black text-[10px] sm:text-xs font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-[1.02] transform transition-all group"
                        >
                          Advance Protocol
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    );
                  })()}
               </div>
            </motion.div>
          ) : (
            <motion.div 
               key="empty"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
               <div className="h-32 w-32 rounded-[2.5rem] bg-white dark:bg-[#1a1a1a] shadow-3xl border border-[#e5e7eb] dark:border-[#2e2e2e] flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-700">
                  <PlayCircle size={48} className="text-primary" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tighter italic text-[#37352f] dark:text-white opacity-30">Initiate Synchronization</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] mt-2 opacity-50 underline underline-offset-8 decoration-primary/20">Select an academic module from the matrix</p>
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
