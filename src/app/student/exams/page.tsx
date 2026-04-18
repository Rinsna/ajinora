"use client";

import { 
  FileEdit, 
  Clock, 
  Calendar, 
  Award, 
  History, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  AlertCircle,
  Trophy,
  Activity,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function StudentExams() {
  const [activeTab, setActiveTab] = useState("available");
  const [assignedExams, setAssignedExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/student/exams");
        if (res.ok) {
          const data = await res.json();
          setAssignedExams(data);
        }
      } catch (e) {
        console.error("Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="space-y-6 animate-in fly-in-from-bottom duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Assessments</h1>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-fit h-fit border border-border/40">
           <button 
             onClick={() => setActiveTab("available")}
             className={`flex-1 md:w-32 py-2 rounded-lg text-xs font-medium transition-all gap-2 flex items-center justify-center ${activeTab === "available" ? "bg-background text-primary shadow-md ring-1 ring-primary/20" : "text-muted-foreground hover:bg-background/50 opacity-80 hover:opacity-100"}`}
           >
             <Play size={14} fill="currentColor" /> Available
           </button>
           <button 
             onClick={() => setActiveTab("completed")}
             className={`flex-1 md:w-40 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all gap-2 flex items-center justify-center ${activeTab === "completed" ? "bg-white dark:bg-[#1a1a1a] text-primary shadow-xl ring-1 ring-primary/20" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 opacity-80 hover:opacity-100"}`}
           >
             <History size={14} /> Results
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-10">
        {!loading && assignedExams
          .filter((e: any) => activeTab === "available" ? e.status === "pending" : e.status === "completed")
          .map((exam: any) => (
            <Card key={exam.id} className="group flex flex-col overflow-hidden bg-card transition-all hover:shadow-md border border-border">
              <CardHeader className="p-5 pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <FileEdit className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {activeTab === 'available' && (
                       <div className="flex flex-col items-end gap-1.5">
                         {exam.priority === 'high' ? (
                           <span className="inline-flex items-center rounded-md bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                              High Priority
                           </span>
                         ) : (
                           <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                              Standard
                           </span>
                         )}
                         <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-0.5">
                             <Calendar className="w-3.5 h-3.5" /> {exam.deadline}
                         </div>
                       </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{exam.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">{exam.description || "No specific guidelines provided for this evaluation module."}</CardDescription>
              </CardHeader>
              
              <CardContent className="p-5 pt-0 mt-auto">
                 <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-5">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground mb-1">Duration</span>
                        <span className="text-sm font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {exam.duration} mins</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground mb-1">Questions</span>
                        <span className="text-sm font-semibold flex items-center gap-1.5"><FileEdit className="w-3.5 h-3.5 text-primary" /> {exam.questions} items</span>
                    </div>
                    {activeTab === 'completed' && (
                        <>
                          <div className="flex flex-col">
                              <span className="text-xs font-medium text-muted-foreground mb-1">Score</span>
                              <span className="text-sm font-semibold flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-primary" /> {exam.result}</span>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-xs font-medium text-muted-foreground mb-1">Rank</span>
                              <span className="text-sm font-semibold flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-primary" /> {exam.rank || 'Pending'}</span>
                          </div>
                        </>
                    )}
                 </div>
                 
                 <div>
                    {activeTab === 'available' ? (
                      <Link href={`/student/exams/${exam.id}`}>
                        <Button className="w-full text-sm shadow-sm gap-2">
                             Begin Assessment
                             <ArrowRight size={16} />
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="secondary"
                        onClick={() => window.open(`/student/exams/${exam.id}/report`, "_blank")}
                        className="w-full text-sm shadow-sm gap-2">
                           View Report <ArrowRight size={14} />
                      </Button>
                    )}
                 </div>
              </CardContent>
            </Card>
          ))}
          
        {!loading && assignedExams.filter((e: any) => activeTab === "available" ? e.status === "pending" : e.status === "completed").length === 0 && (
          <div className="md:col-span-2 2xl:col-span-3 flex flex-col items-center justify-center p-12 sm:p-24 rounded-[3rem] bg-accent/30 border-2 border-dashed border-border text-center animate-in zoom-in-95 duration-700">
             <div className="p-8 sm:p-10 rounded-full bg-background mb-8 border border-border shadow-sm">
                <ShieldCheck size={64} className="text-primary/20" />
             </div>
             <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-3">System Clear</h3>
             <p className="text-muted-foreground text-sm max-w-sm">No pending examinations are assigned to your profile at this moment.</p>
             <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 rounded-xl font-medium px-8 hover:bg-primary hover:text-white transition-all">Refresh Portal</Button>
          </div>
        )}
      </div>
    </div>
  );
}
