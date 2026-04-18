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
         <Loader2 className="animate-spin text-primary mb-4" size={32} />
         <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Initializing Exam Environment...</p>
      </div>
    );
  }

  // ─── START SCREEN ───
  if (view === "start") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
         <Card className="w-full max-w-2xl rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="md:grid md:grid-cols-5 h-full">
               <div className="md:col-span-2 bg-primary/5 p-8 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20"><ShieldCheck size={24} /></div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase leading-none mb-2 text-foreground">{exam?.title}</h1>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">ID: {examId}</p>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-border/50">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Clock size={12} /> Duration</span>
                        <span className="text-sm font-bold">{exam?.duration} Minutes</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><FileText size={12} /> Questions</span>
                        <span className="text-sm font-bold">{questions.length} MCQ Items</span>
                     </div>
                  </div>
               </div>

               <div className="md:col-span-3 p-8 flex flex-col justify-between bg-card">
                  <div className="space-y-6">
                     <h2 className="text-sm font-bold uppercase tracking-widest text-foreground border-b border-border/50 pb-3">Assessment Guidelines</h2>
                     <div className="space-y-4">
                        {[
                          "Auto-submission on timer expiry.",
                          "No refresh/tab switching allowed.",
                          `Negative marking (-${exam?.negative_mark || 0}) per wrong answer.`,
                          "Real-time institutional monitoring active."
                        ].map((rule, i) => (
                          <div key={i} className="flex items-start gap-3">
                             <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                             <p className="text-xs font-semibold text-muted-foreground">{rule}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  <Button 
                    onClick={() => setView("exam")}
                    className="mt-8 w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all gap-2"
                  >
                    Start Assessment
                    <ArrowRight size={14} />
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
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
         <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 mb-4">
                  <Trophy size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Assessment Completed</span>
               </div>
               <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
                 Performance Report
               </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <Card className="rounded-xl bg-card border border-border/50 p-6 flex flex-col items-center text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Score</p>
                  <h4 className="text-2xl font-bold tracking-tight text-foreground">{results.score}<span className="text-sm text-muted-foreground">/{results.total}</span></h4>
               </Card>
               <Card className="rounded-xl bg-card border border-border/50 p-6 flex flex-col items-center text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-1">Grade</p>
                  <h4 className="text-2xl font-bold tracking-tight text-green-500 uppercase">{results.grade}</h4>
               </Card>
               <Card className="rounded-xl bg-card border border-border/50 p-6 flex flex-col items-center text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Correct</p>
                  <h4 className="text-2xl font-bold tracking-tight text-foreground">{results.correct}</h4>
               </Card>
               <Card className="rounded-xl bg-card border border-border/50 p-6 flex flex-col items-center text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Incorrect</p>
                  <h4 className="text-2xl font-bold tracking-tight text-destructive">{results.wrong}</h4>
               </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button onClick={() => router.push('/student/exams')} className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs flex items-center justify-center gap-2">
                  <RotateCcw size={14} /> Return to Assessments
               </Button>
               <Button variant="outline" onClick={() => window.open(`/student/exams/${exam?.id}/report`, "_blank")} className="h-10 px-6 rounded-xl border border-border/50 font-semibold text-xs text-foreground hover:bg-accent/40 flex items-center justify-center gap-2 bg-card">
                  <Download size={14} className="text-muted-foreground" /> Download Report
               </Button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 relative isolate animate-in fade-in duration-500 min-h-[90vh] pb-20">
      
      {/* ─── STICKY TIMER BAR ─── */}
      <header className="sticky top-0 z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/90 backdrop-blur-md px-4 py-3 rounded-b-2xl border-x border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
             <ShieldCheck size={14} />
           </div>
           <div>
             <h1 className="text-sm font-bold tracking-tight uppercase text-foreground/90 truncate max-w-[200px] sm:max-w-md">{exam?.title}</h1>
             <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5"><Lock size={10} className="text-primary" /> SECURE MODE</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className={cn(
             "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold font-mono transition-all",
             timeLeft < 300 ? 'bg-destructive/10 border-destructive/20 text-destructive animate-pulse' : 'bg-background border-border/50 text-foreground'
           )}>
              <Clock size={14} />
              <span>{formatTime(timeLeft)}</span>
           </div>
           <Button variant="default" className="h-9 px-5 rounded-lg font-bold text-xs uppercase gap-2 bg-primary hover:bg-primary/90 text-white" onClick={() => setShowConfirmSubmit(true)}>
             Submit <Send size={12} />
           </Button>
        </div>
      </header>


      {/* ─── MAIN EXAM INTERFACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-2">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-2xl border border-border/50 bg-card shadow-sm">
                  <CardHeader className="p-6 border-b border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">Question {currentQuestion + 1} of {questions.length}</span>
                    </div>
                    <CardTitle className="text-base font-semibold leading-relaxed text-foreground">{questions[currentQuestion]?.question}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6">
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
                              "flex items-center gap-4 p-3.5 rounded-xl border transition-all text-left group",
                              isSelected 
                                ? 'bg-primary/5 border-primary text-foreground ring-1 ring-primary/20' 
                                : 'bg-background border-border/50 hover:border-primary/30 hover:bg-accent/50 text-foreground/80'
                            )}
                          >
                            <div className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all shrink-0", 
                              isSelected 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-accent border-border/50 text-muted-foreground group-hover:border-primary/50'
                            )}>
                              {charChar}
                            </div>
                            <span className="flex-1 text-sm font-medium leading-relaxed">{option}</span>
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
               className="h-10 px-5 rounded-xl border border-border/60 font-semibold text-xs gap-2 transition-all shadow-sm"
               onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
               disabled={currentQuestion === 0}
             >
               <ChevronLeft size={14} /> Previous
             </Button>
             
             <div className="flex gap-3">
               <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent hover:border-border/50">
                  <Flag size={14} />
               </Button>
               <Button 
                 className="h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs gap-2 transition-all hover:bg-primary/90 shadow-sm"
                 onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                 disabled={currentQuestion === questions.length - 1}
               >
                 {currentQuestion === questions.length - 1 ? "End of Exam" : "Next Question"} 
                 <ChevronRight size={14} />
               </Button>
             </div>
          </div>
        </div>

        {/* ─── SIDEBAR MATRIX ─── */}
        <div className="hidden lg:block sticky top-[90px]">
          <Card className="rounded-2xl border border-border/50 bg-card shadow-sm p-5">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Terminal size={14} className="text-primary" /> Questions
                </h3>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">{Math.round((Object.keys(selectedAnswers).length / questions.length) * 100)}%</span>
             </div>

             <div className="grid grid-cols-4 gap-2 mb-6">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(i)}
                    className={cn(
                      "h-10 w-full rounded-lg flex items-center justify-center text-xs font-semibold border transition-all duration-200",
                      currentQuestion === i 
                        ? 'bg-primary border-primary text-white' 
                        : selectedAnswers[q.id] 
                          ? 'bg-green-500/10 border-green-500/30 text-green-600' 
                          : 'bg-background border-border/50 text-muted-foreground hover:border-border'
                    )}
                  >
                    {i+1}
                  </button>
                ))}
             </div>
             
             <div className="pt-4 border-t border-border/40">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                   <span>Progress</span>
                   <span className="text-primary">{Object.keys(selectedAnswers).length} / {questions.length}</span>
                </div>
                <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-500 ease-out rounded-full" style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }} />
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* ─── CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-md bg-card rounded-2xl border border-border/50 p-8 text-center shadow-lg"
             >
                <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 mx-auto text-primary">
                   {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Confirm Submission</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  You have answered <span className="font-bold text-foreground">{Object.keys(selectedAnswers).length}</span> out of <span className="font-bold text-foreground">{questions.length}</span> questions. Do you want to submit your exam now?
                </p>
                
                <div className="flex gap-4">
                   <Button disabled={submitting} onClick={() => setShowConfirmSubmit(false)} variant="outline" className="flex-1 h-10 rounded-xl font-semibold text-xs border border-border/50 bg-background hover:bg-accent">
                      Cancel
                   </Button>
                   <Button disabled={submitting} onClick={handleSubmit} className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs">
                      {submitting ? "Processing..." : "Submit Exam"}
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Locked Blur Overlay for Timer expiry */}
      {timeLeft === 0 && !submitted && view === 'exam' && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
           <Loader2 className="animate-spin text-primary mb-6" size={40} />
           <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Time is up</h2>
           <p className="text-sm font-semibold text-muted-foreground">Auto-submitting your answers...</p>
        </div>
      )}
    </div>
  );
}
