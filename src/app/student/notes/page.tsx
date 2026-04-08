"use client";

import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  ExternalLink, 
  BookOpen, 
  MonitorPlay, 
  FileCode, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight,
  Bookmark,
  X,
  Loader2,
  CheckCircle,
  FileQuestion
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function StudentNotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/student/notes");
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (e) {
        console.error("Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    try {
      const res = await fetch("/api/student/notes/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, description: requestDescription }),
      });
      if (res.ok) {
        setRequestSuccess(true);
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestSuccess(false);
          setTopic("");
          setRequestDescription("");
        }, 2000);
      }
    } catch (e) {
      console.error("Request failed");
    } finally {
      setRequesting(false);
    }
  };

  const uniqueCategories = Array.from(new Set(notes.map((n) => n.category))).filter(Boolean);
  const categories = ["All", ...uniqueCategories];

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText size={24} className="text-red-500" />;
      case "video": return <MonitorPlay size={24} className="text-purple-500" />;
      case "link": return <ExternalLink size={24} className="text-blue-500" />;
      default: return <FileCode size={24} className="text-primary" />;
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-in slide-in-from-right duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10 px-2 sm:px-0">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4 bg-primary/10 w-fit px-3 py-1.5 rounded-xl border border-primary/20">
             <BookOpen size={16} className="text-primary" />
             <span className="text-xs font-semibold text-primary leading-none">Resource Library v2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-none mb-3">Study Center</h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">Access curated learning materials and institutional intelligence.</p>
        </div>
        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={20} />
          <input 
            type="text" 
            placeholder="Search by topic, subject..." 
            className="w-full bg-accent/30 border border-border focus:border-primary/40 rounded-xl py-3 pl-12 pr-4 focus:ring-0 focus:outline-none transition-all shadow-sm text-sm font-medium placeholder:text-muted-foreground/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-accent/40 p-1.5 rounded-2xl w-full sm:w-fit border border-border shadow-sm">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${activeCategory === cat ? "bg-white dark:bg-[#1a1a1a] text-primary shadow-sm ring-1 ring-primary/20 scale-105" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 opacity-80 hover:opacity-100"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-10 mt-8 sm:mt-12">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center text-muted-foreground animate-pulse">Loading resources...</div>
        ) : notes
          .filter(n => (activeCategory === "All" || n.category === activeCategory) && ((n.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (n.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())))
          .map((note) => (
             <Card key={note.id} className="group relative rounded-[2rem] border border-border bg-card shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col pt-2">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform rotate-12 hidden sm:block text-primary">
                 <Bookmark size={150} />
               </div>
               
               <CardHeader className="p-6 pb-2 relative z-10">
                  <div className="flex justify-between items-center mb-4">
                     <div className="px-3 py-1.5 rounded-lg bg-accent/50 text-xs font-medium text-muted-foreground border border-border">
                        {note.category}
                     </div>
                     <div className="flex items-center gap-1.5 text-primary">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-semibold">{note.rating}</span>
                     </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold leading-snug mb-1 group-hover:text-primary transition-colors text-foreground line-clamp-2 min-h-[3.5rem]">{note.title}</CardTitle>
               </CardHeader>
               
               <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30 border border-transparent group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-background shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-primary/10">
                      {getIcon(note.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider mb-1">Resource Type</p>
                      <p className="text-sm font-semibold truncate capitalize text-foreground">{note.type} • {note.size || note.duration}</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2 h-10 leading-relaxed">{note.description}</p>
                  
                  <div className="pt-2 border-t border-border flex flex-col gap-4">
                    <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                       <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(note.created_at || note.date).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1.5"><TrendingUp size={12} /> Popular</span>
                    </div>
                    <Button onClick={() => window.open(note.url, "_blank")} variant="ghost" className="w-full h-12 rounded-xl font-semibold text-xs gap-2 bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white hover:border-transparent transition-all group/dl py-3">
                      {note.type === 'link' ? 'Access External Link' : 'Secure Download'}
                      <ChevronRight size={16} className="group-hover/dl:translate-x-1 transition-transform" />
                    </Button>
                  </div>
               </CardContent>
            </Card>
          ))}
          
          <Card onClick={() => setShowRequestModal(true)} className="rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-accent/20 group cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 min-h-[300px]">
             <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary/10">
                <Plus size={32} />
             </div>
             <h3 className="font-semibold text-xl mb-3 text-foreground">Request Material</h3>
             <p className="text-sm font-medium text-muted-foreground max-w-[200px] leading-relaxed">Need help with a specific topic? Send a request to your instructor.</p>
          </Card>
      </div>

      {/* Request Material Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="w-full max-w-lg rounded-[2.5rem] border-none bg-card shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-primary p-8 text-white relative">
                 <button onClick={() => setShowRequestModal(false)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
                 <div className="flex items-center gap-3 mb-2">
                    <FileQuestion size={24} className="text-white/80" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Institutional Request</p>
                 </div>
                 <h2 className="text-2xl font-bold uppercase tracking-tight">Request Learning Material</h2>
              </div>
              
              <CardContent className="p-8">
                 {requestSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
                       <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                          <CheckCircle size={48} />
                       </div>
                       <h3 className="text-xl font-bold">Request Deployed</h3>
                       <p className="text-sm text-muted-foreground font-medium">Your request has been synchronised with the faculty. You will be notified once the material is archived.</p>
                    </div>
                 ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Topic Title</label>
                          <input 
                            required
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-accent/20 border border-border focus:border-primary/40 rounded-xl p-4 text-sm font-semibold focus:outline-none transition-all"
                            placeholder="e.g. Advanced Calculus Modules"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Detail Description</label>
                          <textarea 
                            required
                            rows={4}
                            value={requestDescription}
                            onChange={(e) => setRequestDescription(e.target.value)}
                            className="w-full bg-accent/20 border border-border focus:border-primary/40 rounded-xl p-4 text-sm font-semibold focus:outline-none transition-all resize-none"
                            placeholder="Describe what specific resources or topics you need help with..."
                          />
                       </div>
                       <Button 
                         type="submit" 
                         disabled={requesting}
                         className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-xs bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
                       >
                          {requesting ? <Loader2 className="animate-spin" size={20} /> : "Submit Request Protocol"}
                       </Button>
                    </form>
                 )}
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
