"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Clock, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Lock,
  Flag,
  RotateCcw,
  Activity,
  Trophy,
  XCircle,
  FileText,
  BrainCircuit,
  PieChart,
  Medal,
  Terminal,
  ArrowRight,
  Loader2,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ExamSession({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const [view, setView] = useState<"loading" | "start" | "exam" | "result">("loading");
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Result Metrics
  const [results, setResults] = useState<{
    score: number;
    total: number;
    correct?: number;
    wrong?: number;
    grade?: string;
    negativeDeduction?: number;
  } | null>(null);

  // Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/student/exams/${examId}`);
        const data = await res.json();
        if (res.ok) {
          setExam(data.exam);
          setQuestions(data.questions);
          setTimeLeft(data.exam.duration * 60);
          setView("start");
        } else {
          router.push("/student/exams");
        }
      } catch (e) {
        console.error("Exam load failed");
      }
    };
    fetchExam();
  }, [examId, router]);

  // Timer logic
  useEffect(() => {
    if (view === "exam" && timeLeft > 0 && !submitted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (view === "exam" && timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted, view]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex: number) => {
    const optionChar = String.fromCharCode(65 + optionIndex); // A, B, C, D
    const questionId = questions[currentQuestion].id;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionChar }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults({
          score: data.score,
          total: data.total,
          correct: data.correct,
          wrong: data.wrong,
          grade: calculateGrade(data.score, data.total)
        });
        setView("result");
        setSubmitted(true);
      }
    } catch (e) {
      console.error("Submission failed");
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const calculateGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  if (view === "loading") {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center">
         <Loader2 className="animate-spin text-primary mb-6" size={48} />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Initializing Secure Exam...</p>
      </div>
    );
  }

  // ─── START SCREEN ───
  if (view === "start") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in duration-700">
         <Card className="w-full max-w-4xl rounded-[4rem] border-none bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative isolate border-2 border-primary/5">
            <div className="absolute top-0 right-0 p-20 transform rotate-12 opacity-5 pointer-events-none text-primary"><Activity size={400} /></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 h-full">
               <div className="md:col-span-2 bg-primary p-12 text-white flex flex-col justify-between">
                  <div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-10"><ShieldCheck size={28} /></div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-4 italic underline underline-offset-8 decoration-white/20">{exam?.title}</h1>
                    <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-8 italic">SECURE SESSION ID: {examId}</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <Clock size={20} className="text-white/40" />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Duration</p>
                           <p className="text-lg font-black tracking-tight uppercase">{exam?.duration} Minutes</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <FileText size={20} className="text-white/40" />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Item Count</p>
                           <p className="text-lg font-black tracking-tight uppercase">{questions.length} MCQ Items</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="md:col-span-3 p-12 sm:p-16 flex flex-col justify-between bg-white/40 dark:bg-black/20">
                  <div className="space-y-8">
                     <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground decoration-primary/40 underline underline-offset-8">Pre-Assessment Briefing</h2>
                     <div className="space-y-6">
                        {[
                          "Auto-submission on timer expiry.",
                          "No refresh/tab switching allowed.",
                          `Negative marking (-${exam?.negative_mark || 0}) per wrong answer.`,
                          "Real-time institutional monitoring active."
                        ].map((rule, i) => (
                          <div key={i} className="flex items-center gap-4 group">
                             <div className="h-8 w-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><CheckCircle2 size={16} /></div>
                             <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic group-hover:text-foreground transition-colors">{rule}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  <Button 
                    onClick={() => setView("exam")}
                    className="mt-12 w-full h-20 rounded-3xl bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-primary/30 group transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
                  >
                    Authorize Session Start
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                  </Button>
               </div>
            </div>
         </Card>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (view === "result" && results) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-1000">
         <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
               <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 mb-6">
                  <Trophy size={16} />
                  <span className="text-xs font-semibold">Exam Synchronized Successfully</span>
               </div>
               <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
                 Performance <br /> <span className="text-primary">Report.</span>
               </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
               <Card className="rounded-2xl sm:rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Core Score</p>
                  <h4 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{results.score}<span className="text-lg text-muted-foreground font-medium">/{results.total}</span></h4>
               </Card>
               <Card className="rounded-2xl sm:rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group hover:border-green-500/20 transition-all">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 text-green-500">Mastery Grade</p>
                  <h4 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-500 uppercase">{results.grade}</h4>
               </Card>
               <Card className="rounded-2xl sm:rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group hover:border-green-500/20 transition-all">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Correct</p>
                  <h4 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-500">{results.correct}</h4>
               </Card>
               <Card className="rounded-2xl sm:rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group hover:border-red-500/20 transition-all">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Wrong</p>
                  <h4 className="text-3xl sm:text-4xl font-bold tracking-tight text-red-500">{results.wrong}</h4>
               </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8">
               <Button onClick={() => router.push('/student/exams')} className="h-14 flex-1 rounded-2xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-3">
                  <RotateCcw size={16} /> Re-enter Exam Hub
               </Button>
               <Button variant="outline" onClick={() => window.open(`/student/exams/${exam?.id}/report`, "_blank")} className="h-14 flex-1 rounded-2xl border-2 border-border border-dashed font-semibold text-sm text-foreground hover:bg-accent/40 hover:border-primary/40 transition-all flex items-center justify-center gap-3 bg-transparent hover:text-primary group">
                  <Download size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> Download Official Report
               </Button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 relative isolate animate-in fade-in duration-1000 min-h-screen pb-20">
      
      {/* ─── STICKY TIMER BAR ─── */}
      <header className="sticky top-0 z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/80 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-3 rounded-b-3xl sm:rounded-b-[2rem] border-x border-b border-primary/10 shadow-md">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 sm:h-10 sm:w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
             <Lock size={16} />
           </div>
           <div>
             <h1 className="text-sm sm:text-base font-bold tracking-tight uppercase leading-none mb-0.5 text-foreground/90 truncate max-w-[200px] sm:max-w-xs">{exam?.title}</h1>
             <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5"><ShieldCheck size={10} className="text-primary" /> Active • S_ID: {examId}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className={cn(
             "relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all duration-500 shadow-inner overflow-hidden",
             timeLeft < 300 ? 'bg-red-500/10 border-red-500/40 text-red-500 animate-pulse' : 'bg-accent/40 border-primary/20 text-foreground'
           )}>
              <Clock size={14} className={cn(timeLeft < 300 ? "animate-spin-slow" : "opacity-50")} />
              <span className="text-lg sm:text-xl font-bold font-mono tracking-wider">{formatTime(timeLeft)}</span>
           </div>
           <Button variant="destructive" className="h-[38px] sm:h-10 px-5 sm:px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm shadow-destructive/20 hover:scale-[1.02] active:scale-95" onClick={() => setShowConfirmSubmit(true)}>
             Submit <Send size={12} />
           </Button>
        </div>
      </header>


      {/* ─── MAIN EXAM INTERFACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 px-2 items-start">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-sm border-2 border-primary/5 isolate overflow-hidden relative">
                <div className="absolute top-0 left-0 p-32 opacity-[0.03] pointer-events-none text-primary"><FileText size={300} /></div>
                
                <CardHeader className="p-5 sm:p-6 pb-2 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Exam Frame {currentQuestion + 1}</span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">{questions[currentQuestion]?.question}</CardTitle>
                </CardHeader>
                
                <CardContent className="p-5 sm:p-6 pt-0 relative z-10">
                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentQuestion]?.options.map((option: string, idx: number) => {
                      const charChar = String.fromCharCode(65 + idx);
                      const questionId = questions[currentQuestion].id;
                      const isSelected = selectedAnswers[questionId] === charChar;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className={cn(
                            "flex items-center gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all text-left group shadow-sm ring-offset-1 ring-offset-background",
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary/20 scale-[1.005]' 
                              : 'bg-accent/30 border-transparent hover:border-primary/30 hover:bg-primary/5 text-foreground/80'
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0", 
                            isSelected 
                              ? 'bg-white text-primary border-white' 
                              : 'bg-background border-border text-muted-foreground group-hover:border-primary group-hover:text-primary shadow-inner'
                          )}>
                            {charChar}
                          </div>
                          <span className={cn("flex-1 text-sm font-medium leading-normal", isSelected ? "text-white" : "text-foreground/90")}>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
          </div>
          
          <div className="flex justify-between items-center py-2">
             <Button 
               variant="outline" 
               className="h-12 px-6 rounded-xl border border-primary/20 font-bold uppercase tracking-widest text-[10px] gap-2 transition-all enabled:hover:bg-primary/5 disabled:opacity-20 shadow-sm"
               onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
               disabled={currentQuestion === 0}
             >
               <ChevronLeft size={16} strokeWidth={2.5} /> Previous Frame
             </Button>
             
             <div className="flex gap-3">
               <Button variant="ghost" className="h-12 w-12 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm p-0">
                  <Flag size={16} />
               </Button>
               <Button 
                 className="h-12 px-6 rounded-xl bg-primary shadow-md shadow-primary/30 text-white font-bold uppercase tracking-widest text-[10px] gap-2 transition-all hover:scale-105 active:scale-95 group"
                 onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                 disabled={currentQuestion === questions.length - 1}
               >
                 {currentQuestion === questions.length - 1 ? "End of Matrix" : "Commit & Next"} 
                 <ChevronRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
               </Button>
             </div>
          </div>
        </div>

        {/* ─── SIDEBAR MATRIX ─── */}
        <div className="hidden lg:flex flex-col gap-8 sticky top-[120px]">
          <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-xl p-8 flex flex-col h-fit max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
                  <Terminal size={16} className="text-primary" /> Core Matrix
                </h3>
                <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">{Math.round((Object.keys(selectedAnswers).length / questions.length) * 100)}%</span>
             </div>

             <div className="grid grid-cols-4 gap-3">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(i)}
                    className={cn(
                      "h-14 w-full rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 transform active:scale-90 shadow-sm",
                      currentQuestion === i 
                        ? 'bg-primary border-primary text-white shadow-primary/30 scale-110' 
                        : selectedAnswers[q.id] 
                          ? 'bg-green-500/10 border-green-500/40 text-green-500' 
                          : 'bg-accent/40 border-transparent text-muted-foreground/60 hover:border-primary/40'
                    )}
                  >
                    0{i+1}
                  </button>
                ))}
             </div>
             
             <div className="mt-12 pt-10 border-t border-dashed border-border/60">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
                   <span>Session Progress</span>
                   <span className="text-primary">{Object.keys(selectedAnswers).length} / {questions.length} Items</span>
                </div>
                <div className="h-4 w-full bg-accent/40 rounded-full overflow-hidden shadow-inner p-1">
                   <div className="h-full bg-primary shadow-2xl transition-all duration-700 ease-in-out rounded-full" style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }} />
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* ─── CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 40 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 40 }}
               className="w-full max-w-lg bg-card rounded-[3.5rem] border-2 border-primary/20 p-12 text-center shadow-[0_0_100px_-20px_rgba(var(--primary),0.4)] relative isolate"
             >
                <div className="absolute top-0 right-0 p-12 text-primary opacity-[0.03] pointer-events-none -mr-10 -mt-10"><Medal size={200} /></div>
                
                <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-10 mx-auto text-primary shadow-inner">
                   {submitting ? <Loader2 className="animate-spin" size={40} /> : <Send size={40} className="animate-pulse" />}
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Confirm Commit</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-12 italic leading-relaxed">
                  You have completed <span className="text-primary">{Object.keys(selectedAnswers).length}</span> out of <span className="text-primary">{questions.length}</span> evaluation items. Initializing submission?
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                   <Button disabled={submitting} onClick={() => setShowConfirmSubmit(false)} variant="outline" className="h-16 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-border bg-accent/20 hover:bg-accent transition-all">
                      Continue Exam
                   </Button>
                   <Button disabled={submitting} onClick={handleSubmit} className="h-16 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 transition-all transform hover:scale-105">
                      {submitting ? "Processing..." : "Confirm Submission"}
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Locked Blur Overlay for Timer expiry */}
      {timeLeft === 0 && !submitted && view === 'exam' && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center">
           <Loader2 className="animate-spin text-primary mb-10" size={60} />
           <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Session Timed Out</h2>
           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground italic mb-10 border-b-2 border-primary/20 pb-4">Auto-compiling performance metrics...</p>
        </div>
      )}
    </div>
  );
}
