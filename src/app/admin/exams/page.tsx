"use client";

import { 
  Plus, 
  Search, 
  FileEdit, 
  Clock, 
  Calendar, 
  Trash2, 
  FilePlus, 
  Loader2, 
  X, 
  Target,
  Upload,
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertCircle,
  Settings,
  ShieldCheck,
  Eye,
  Award,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function ExamsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [targetCourse, setTargetCourse] = useState("");
  const [negativeMark, setNegativeMark] = useState("0");
  const [courses, setCourses] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [uploadedQuestions, setUploadedQuestions] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/exams");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setExams(data);
      }
    } catch (e) {
      console.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
      }
    } catch (e) {
      console.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchExams(); 
    fetchCourses();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Get raw rows to auto-detect the header row
        const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Find the row that contains "QUESTION" — handles title/subtitle rows at top
        let headerRowIndex = -1;
        for (let i = 0; i < rawRows.length; i++) {
          if (rawRows[i].some((cell: any) => String(cell).trim().toUpperCase() === "QUESTION")) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error("Could not find a 'QUESTION' column header. Please check your Excel file format.");
        }

        // Build headers from the detected header row
        const headers: string[] = rawRows[headerRowIndex].map((h: any) => String(h).trim());

        // Get data rows below the header, filter out blank rows
        const dataRows = rawRows.slice(headerRowIndex + 1).filter(
          row => row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== "")
        );

        if (dataRows.length === 0) throw new Error("Excel file has no question data rows.");

        // Validate required columns exist
        const required = ["QUESTION", "OPTION A", "OPTION B", "OPTION C", "OPTION D", "ANSWER"];
        const missing = required.filter(h => !headers.includes(h));
        if (missing.length > 0) {
          throw new Error(`Missing mandatory columns: ${missing.join(", ")}`);
        }

        // Convert each data row to an object keyed by header
        const data = dataRows.map(row => {
          const obj: any = {};
          headers.forEach((header, idx) => {
            obj[header] = row[idx] ?? "";
          });
          return obj;
        });

        setUploadedQuestions(data);
      } catch (err: any) {
        setError(err.message);
        setUploadedQuestions([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedQuestions.length === 0) {
      setError("Please upload an exam Excel file first.");
      return;
    }
    
    setCreating(true);
    setError("");

    try {
      // Map Excel format to API format
      const mappedQuestions = uploadedQuestions.map(q => ({
        question: q["QUESTION"],
        options: [q["OPTION A"], q["OPTION B"], q["OPTION C"], q["OPTION D"]].filter(Boolean),
        correctAnswer: q["ANSWER"]
      }));

      const payload = {
        title,
        description,
        duration: parseInt(duration),
        startDate,
        startTime,
        courseId: parseInt(targetCourse),
        negativeMark: parseFloat(negativeMark),
        questions: mappedQuestions
      };

      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to launch examination system.");

      setShowModal(false);
      resetForm();
      fetchExams(); // Refresh from DB
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDuration("");
    setStartDate("");
    setStartTime("");
    setTargetCourse("");
    setNegativeMark("0");
    setUploadedQuestions([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirm decommissioning of this assessment module?")) return;
    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" });
      if (res.ok) fetchExams();
    } catch (e) {
      console.error("Delete failed");
    }
  };

  const openResultsModal = async (exam: any) => {
    setSelectedExam(exam);
    setShowResults(true);
    setResultsLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}/results`);
      if (res.ok) {
        const data = await res.json();
        setExamResults(data);
      }
    } catch (e) {
      console.error("Failed to fetch results");
    } finally {
      setResultsLoading(false);
    }
  };
  
  const downloadTemplate = () => {
    const wsData = [
      ["QUESTION", "OPTION A", "OPTION B", "OPTION C", "OPTION D", "ANSWER"],
      ["Sample Question: What is 2+2?", "3", "4", "5", "6", "B"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Template");
    XLSX.writeFile(wb, "Ajinora_Exam_Template.xlsx");
  };

  return (
    <div className="space-y-10 animate-in fly-in-from-bottom duration-700 bg-background min-h-screen">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Exam Management</h1>

        </div>
        
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             onClick={() => setShowInstructions(true)}
             className="h-14 sm:h-16 px-6 sm:px-8 border-2 border-dashed border-primary/20 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs text-primary hover:bg-primary/5 transition-all group shadow-sm"
           >
             <Info size={18} className="group-hover:scale-110 transition-transform" /> Instruction
           </Button>
           <Button 
             onClick={() => setShowModal(true)} 
             className="h-14 sm:h-16 px-8 sm:px-10 bg-primary hover:bg-primary/95 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-[0_5px_20px_-5px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
           >
             <Plus size={20} strokeWidth={3} /> Create Exam
           </Button>
        </div>
      </div>

      {/* ─── Stats / Filter Overview ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Target, label: "Active Exams", value: exams.length, color: "text-primary bg-primary/10" },
          { icon: PieChart, label: "Participation Rate", value: "94.2%", color: "text-blue-500 bg-blue-500/10" },
          { icon: Award, label: "Avg. Proficiency", value: "78/100", color: "text-green-500 bg-green-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-sm p-6 flex items-center gap-6">
             <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center", stat.color)}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{stat.label}</p>
                <h4 className="text-2xl font-black tracking-tight leading-none">{stat.value}</h4>
             </div>
          </Card>
        ))}
      </div>

      {/* ─── Main Content Table ─── */}
      <Card className="rounded-[3rem] border-none bg-card/30 backdrop-blur-lg shadow-xl p-2 sm:p-4 overflow-hidden border border-border/40">
        <div className="p-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50 mb-4 bg-accent/20 rounded-[2.5rem]">
           <div className="relative w-full max-w-xl group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="Filter through assessment archives..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-background border-none rounded-2xl py-5 pl-14 pr-8 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all shadow-inner placeholder:text-muted-foreground/40 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
             />
           </div>
           
           <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-2 rounded-2xl border border-border/40 shrink-0">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all"><Settings size={20} /></Button>
              <div className="h-8 w-px bg-border/60 mx-1" />
              <div className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 rounded-xl border border-primary/10">
                 Database Synchronized
              </div>
           </div>
        </div>

        <div className="overflow-x-auto p-4 custom-scrollbar">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                <th className="px-8 py-3 text-left">Internal Exam / Title</th>
                <th className="px-8 py-3 text-left">Exam Date</th>
                <th className="px-8 py-3 text-center">Duration</th>
                <th className="px-8 py-3 text-center">Metrics</th>
                <th className="px-8 py-3 text-right pr-12 text-primary/60">Operations</th>
              </tr>
            </thead>
            <tbody>
              {exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map((exam) => (
                <tr key={exam.id} className="group bg-white/40 dark:bg-white/5 hover:bg-primary/5 transition-all duration-300 rounded-[2rem] shadow-sm hover:shadow-lg border border-transparent hover:border-primary/10 overflow-hidden relative isolate">
                  <td className="px-8 py-6 rounded-l-[2rem]">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
                          <FileSpreadsheet size={20} />
                       </div>
                       <div>
                          <p className="font-black text-sm uppercase tracking-tight text-foreground">{exam.title}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">MCQ Dynamic Session</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Calendar size={14} className="text-primary/60" />
                       <span className="text-xs font-bold text-muted-foreground italic">{new Date(exam.start_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/30 rounded-full border border-border/40">
                       <Clock size={12} className="text-muted-foreground/60" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{exam.duration}m</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-xs font-black uppercase tracking-tighter text-foreground">{exam.questionsCount} Questions</span>
                       {exam.negative_mark > 0 && <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 rounded-md">-{exam.negative_mark} Negative</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right rounded-r-[2rem] pr-8">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => openResultsModal(exam)} variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all gap-2">
                           <Eye size={12} /> View Results
                        </Button>
                        <Button onClick={() => handleDelete(exam.id)} variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-destructive hover:text-white transition-all">
                           <Trash2 size={16} />
                        </Button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {exams.length === 0 && !loading && (
            <div className="py-24 text-center opacity-20">
               <FilePlus size={80} className="mx-auto mb-6 text-muted-foreground/40" />
               <p className="text-xl font-black uppercase tracking-tighter italic">Zero exams initialized.</p>
            </div>
          )}
        </div>
      </Card>

      {/* ─── CREATE MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-in fade-in duration-300 overflow-y-auto">
           <Card className="w-full max-w-xl rounded-[2rem] border-2 border-primary/20 bg-card overflow-hidden shadow-3xl relative animate-in zoom-in-95 duration-500 scrollbar-none my-4 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                className="absolute top-10 right-10 z-10 h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>

              <div className="bg-primary px-8 py-5 text-white overflow-hidden relative isolate">
                 {/* Decorative background blurs */}
                 <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                 <div className="absolute bottom-0 left-0 h-20 w-20 bg-white/5 rounded-full blur-[20px] -ml-5 -mb-5 pointer-events-none" />
                 
                 <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">Deploy Center</p>
                    <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">New Examination</h2>
                 </div>
              </div>

              <CardContent className="p-6 space-y-4">
                 <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Exam Title</label>
                          <div className="relative group">
                            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-accent/20 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary/40 focus:outline-none transition-all shadow-inner" placeholder="e.g. Master's Finance - Mock 1" />
                          </div>
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Exam Date</label>
                          <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-accent/20 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary/40 focus:outline-none transition-all shadow-inner uppercase tracking-widest" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Duration (Minutes)</label>
                          <input required type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-accent/20 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary/40 focus:outline-none transition-all shadow-inner" placeholder="60" />
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1 text-red-500/80">Negative Mark / Wrong</label>
                          <input type="number" step="0.25" value={negativeMark} onChange={(e) => setNegativeMark(e.target.value)} className="w-full bg-red-500/5 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-red-500/40 focus:outline-none transition-all shadow-inner text-red-500" placeholder="0.25" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Target Course</label>
                          <div className="relative">
                            <select required value={targetCourse} onChange={(e) => setTargetCourse(e.target.value)} className="w-full bg-accent/20 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary/40 focus:outline-none transition-all shadow-inner appearance-none">
                              <option value="" disabled>Select Course</option>
                              {courses.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </div>
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Start Time</label>
                          <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-accent/20 border-2 border-transparent rounded-xl p-3 text-sm font-bold focus:border-primary/40 focus:outline-none transition-all shadow-inner" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">Upload Questions (Excel .xlsx)</label>
                       <div 
                         className={cn(
                           "relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer",
                           uploadedQuestions.length > 0 
                             ? "bg-green-500/5 border-green-500/40" 
                             : "bg-accent/20 border-border hover:border-primary/40 hover:bg-primary/5"
                         )}
                         onClick={() => fileInputRef.current?.click()}
                       >
                         <input type="file" ref={fileInputRef} accept=".xlsx" className="hidden" onChange={handleFileUpload} />
                         {uploadedQuestions.length > 0 ? (
                           <div className="flex items-center justify-center gap-3">
                              <ShieldCheck size={20} className="text-green-500" />
                              <div className="text-left">
                                 <p className="text-xs font-black uppercase tracking-tight text-green-600">Validated</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60">{uploadedQuestions.length} Questions Parsed</p>
                              </div>
                           </div>
                         ) : (
                           <div className="flex items-center justify-center gap-3">
                              <Upload size={18} className="text-primary" />
                              <p className="text-xs font-black uppercase tracking-tight text-foreground">Click to Upload .xlsx</p>
                           </div>
                         )}
                       </div>
                       
                       {error && (
                         <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-2">
                           <AlertCircle size={14} className="text-red-500 shrink-0" />
                           <p className="text-[10px] font-black uppercase tracking-tight text-red-600">{error}</p>
                         </div>
                       )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={creating || (uploadedQuestions.length === 0)} 
                      className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/20 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
                    >
                       {creating ? <Loader2 className="animate-spin" size={18} /> : <><Target size={16} /> Launch Exam</>}
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

      {/* ─── INSTRUCTION MODAL ─── */}
      {showInstructions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <Card className="w-full max-w-4xl rounded-[4rem] border-none bg-card overflow-hidden shadow-3xl animate-in slide-in-from-bottom-10 duration-700">
              <div className="p-16 space-y-12 overflow-y-auto max-h-[85vh] scrollbar-none">
                 <div className="flex justify-between items-start border-b border-border/50 pb-10">
                    <div>
                       <div className="flex items-center gap-2 mb-3 bg-primary/10 w-fit px-4 py-1 rounded-full border border-primary/20">
                          <Info size={12} className="text-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Data Schema Definition</span>
                       </div>
                       <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight">Excel Upload Process</h3>
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mt-4 leading-relaxed italic opacity-80 underline underline-offset-8 decoration-primary/20">Follow this strict schema for successful engine integration.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Button 
                          onClick={downloadTemplate}
                          className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                           <FileSpreadsheet size={16} /> Download Template
                        </Button>
                        <button onClick={() => setShowInstructions(false)} className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-muted-foreground hover:rotate-90 transition-all hover:bg-primary hover:text-white group">
                           <X size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                     </div>
                 </div>

                 <div className="space-y-10">
                    <div className="grid grid-cols-1 gap-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary underline underline-offset-4 decoration-primary/30">Mandatory Column Headers (Exact Spacing):</h4>
                       <div className="p-1 rounded-[2.5rem] bg-accent/20 border-2 border-border/40 shadow-inner overflow-hidden">
                          <table className="w-full border-separate border-spacing-0">
                             <thead className="bg-primary/5">
                                <tr>
                                   <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-border/50">QUESTION</th>
                                   <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-border/50">OPTION A</th>
                                   <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-border/50">OPTION B</th>
                                   <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-border/50">OPTION C</th>
                                   <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-border/50">OPTION D</th>
                                   <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest text-primary">ANSWER</th>
                                </tr>
                             </thead>
                             <tbody className="bg-white/40 dark:bg-black/20">
                                <tr>
                                   <td className="px-6 py-6 text-[11px] font-bold text-muted-foreground border-r border-border/50 italic opacity-60">Sample Question Text...</td>
                                   <td className="px-6 py-6 text-[11px] font-bold text-muted-foreground border-r border-border/50">Alpha Choice</td>
                                   <td className="px-6 py-6 text-[11px] font-bold text-muted-foreground border-r border-border/50">Beta Choice</td>
                                   <td className="px-6 py-6 text-[11px] font-bold text-muted-foreground border-r border-border/50">Gamma Choice</td>
                                   <td className="px-6 py-6 text-[11px] font-bold text-muted-foreground border-r border-border/50">Delta Choice</td>
                                   <td className="px-6 py-6 text-[11px] font-black text-primary uppercase text-center bg-primary/5">A</td>
                                </tr>
                             </tbody>
                          </table>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card className="p-8 rounded-[2.5rem] bg-primary/5 border-none space-y-4">
                          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg"><Info size={20} /></div>
                          <h5 className="text-xs font-black uppercase tracking-widest">Logic: Correct Answer</h5>
                          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic opacity-80 uppercase">The <span className="text-primary underline decoration-2 underline-offset-4">ANSWER</span> column must exclusively contain a single uppercase character: <span className="px-2 py-0.5 bg-primary text-white rounded-md mx-1">A</span> <span className="px-2 py-0.5 bg-primary text-white rounded-md mx-1">B</span> <span className="px-2 py-0.5 bg-primary text-white rounded-md mx-1">C</span> or <span className="px-2 py-0.5 bg-primary text-white rounded-md mx-1">D</span>. Any numeric or complex strings will cause engine failure.</p>
                       </Card>

                       <Card className="p-8 rounded-[2.5rem] bg-orange-500/5 border-none space-y-4">
                          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg"><ShieldCheck size={20} /></div>
                          <h5 className="text-xs font-black uppercase tracking-widest">Logic: Negative Marks</h5>
                          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic opacity-80 uppercase">Negative marking is applied globally to all questions in the exam during auto-evaluation. Ensure the value provided (e.g., <span className="text-orange-600 underline">0.25</span>) aligns with your institutional policy.</p>
                       </Card>
                    </div>

                    <Button onClick={() => setShowInstructions(false)} className="w-full h-20 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] bg-primary hover:bg-primary/95 text-white transition-all shadow-xl shadow-primary/20">
                       Acknowledge Exam Guidelines
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* ─── RESULTS MODAL ─── */}
      {showResults && selectedExam && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <Card className="w-full max-w-4xl rounded-[3rem] border-none bg-card overflow-hidden shadow-3xl animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
              <div className="bg-primary p-8 sm:p-10 text-white flex items-center justify-between shrink-0">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-2">Examination Output</p>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">{selectedExam.title}</h2>
                 </div>
                 <button onClick={() => setShowResults(false)} className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                 {resultsLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                       <Loader2 className="animate-spin text-primary" size={40} />
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aggregating records...</p>
                    </div>
                 ) : examResults.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                       <PieChart size={60} className="mx-auto mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No participation records yet.</p>
                    </div>
                 ) : (
                    <table className="w-full border-separate border-spacing-y-3">
                       <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                             <th className="px-6 py-2 text-left">Student</th>
                             <th className="px-6 py-2 text-center">Score Matrix</th>
                             <th className="px-6 py-2 text-center">Efficiency</th>
                             <th className="px-6 py-2 text-right">Completion Date</th>
                          </tr>
                       </thead>
                       <tbody>
                          {examResults.map((res: any) => (
                             <tr key={res.id} className="bg-accent/20 rounded-2xl border border-border/40">
                                <td className="px-6 py-5 rounded-l-2xl">
                                   <div className="text-left">
                                      <p className="font-black text-sm uppercase tracking-tight">{res.full_name}</p>
                                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">@{res.username}</p>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
                                      <span className="text-xs font-black text-primary">{res.score} / {res.total}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs font-black">{Math.round((res.score / res.total) * 100)}%</span>
                                      <div className="h-1 w-16 bg-border rounded-full overflow-hidden">
                                         <div className="h-full bg-primary" style={{ width: `${(res.score / res.total) * 100}%` }} />
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-right rounded-r-2xl pr-8">
                                   <span className="text-[10px] font-bold text-muted-foreground italic">{new Date(res.completed_at).toLocaleString()}</span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 )}
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
