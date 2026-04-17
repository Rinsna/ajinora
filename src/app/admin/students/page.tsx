"use client";

import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserPlus, 
  ShieldCheck, 
  Mail,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  X,
  BookOpen,
  BarChart2,
  Trophy,
  ArrowLeft,
  FileText,
  Check,
  XCircle,
  Award,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Create Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Edit State
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eFullName, setEFullName] = useState("");
  const [eUsername, setEUsername] = useState("");
  const [eCourseId, setECourseId] = useState("");
  const [updating, setUpdating] = useState(false);

  const [showPerformance, setShowPerformance] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<any>(null);
  const [performanceResults, setPerformanceResults] = useState<any[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // Documents & Certificates State
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDocStudent, setSelectedDocStudent] = useState<any>(null);
  const [studentDocs, setStudentDocs] = useState<any[]>([]);
  const [studentCerts, setStudentCerts] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'docs' | 'certs'>('docs');
  const [certTitle, setCertTitle] = useState("");
  const [issuing, setIssuing] = useState(false);
  const certRef = useRef<HTMLInputElement>(null);

  // Unified Audit States
  const [showAudit, setShowAudit] = useState(false);
  const [selectedAuditStudent, setSelectedAuditStudent] = useState<any>(null);
  const [auditTab, setAuditTab] = useState<'profile' | 'locker' | 'academic'>('profile');
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
    } catch (e) {
      console.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (e) {
      console.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      setError("Please select an institutional academic path.");
      return;
    }
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, password, courseId: parseInt(courseId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");
      
      // Success
      setShowModal(false);
      setFullName("");
      setUsername("");
      setPassword("");
      setCourseId("");
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to terminate this student's institutional access? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchStudents();
      }
    } catch (e) {
      console.error("Identity termination failed");
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setEFullName(student.name);
    setEUsername(student.username);
    setECourseId(student.course_id?.toString() || "");
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdating(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName: eFullName, 
          username: eUsername, 
          courseId: eCourseId ? parseInt(eCourseId) : null 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      
      setShowEditModal(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const syncStudentArchives = async (studentId: number) => {
    try {
      const [docsRes, certsRes, perfRes] = await Promise.all([
        fetch(`/api/admin/students/${studentId}/documents`),
        fetch(`/api/admin/students/${studentId}/certificates`),
        fetch(`/api/admin/students/${studentId}/results`)
      ]);
      const [docs, certs, perf] = await Promise.all([
        docsRes.json(),
        certsRes.json(),
        perfRes.json()
      ]);
      if (Array.isArray(docs)) setStudentDocs(docs);
      if (Array.isArray(certs)) setStudentCerts(certs);
      if (Array.isArray(perf)) setPerformanceResults(perf);
    } catch (e) {
      console.error("Sync Error:", e);
    }
  };

  const openDocumentsModal = async (student: any) => {
    setSelectedDocStudent(student);
    setShowDocuments(true);
    setDocsLoading(true);
    setActiveTab('docs');
    await syncStudentArchives(student.id);
    setDocsLoading(false);
  };

  const openPerformanceModal = async (student: any) => {
    setSelectedPerformance(student);
    setShowPerformance(true);
    setPerformanceLoading(true);
    await syncStudentArchives(student.id);
    setPerformanceLoading(false);
  };

  const openAuditModal = async (student: any) => {
    setSelectedAuditStudent(student);
    setShowAudit(true);
    setAuditLoading(true);
    setAuditTab('profile');
    
    // Cross-compatibility sync
    setSelectedDocStudent(student);
    setSelectedPerformance(student);

    await syncStudentArchives(student.id);
    setAuditLoading(false);
  };

  const updateDocStatus = async (docId: number, status: string) => {
    try {
      const studentId = selectedAuditStudent?.id || selectedDocStudent?.id;
      const res = await fetch(`/api/admin/students/${studentId}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId, status }),
      });
      if (res.ok) {
        await syncStudentArchives(studentId);
      }
    } catch (e) {}
  };

  const handleCertUpload = async (file: File) => {
    if (!certTitle) return alert("Select certificate protocol designation.");
    const studentId = selectedAuditStudent?.id || selectedDocStudent?.id;
    setIssuing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error);

      await fetch(`/api/admin/students/${studentId}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: certTitle, url: upData.url }),
      });

      setCertTitle("");
      await syncStudentArchives(studentId);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIssuing(false);
    }
  };

  const revokeCert = async (id: number) => {
    if (!confirm("Revoke this institutional certificate?")) return;
    const studentId = selectedAuditStudent?.id || selectedDocStudent?.id;
    try {
      await fetch(`/api/admin/students/${studentId}/certificates?id=${id}`, { method: "DELETE" });
      await syncStudentArchives(studentId);
    } catch (e) {}
  };

  return (
    <div className="space-y-8 sm:space-y-10 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Student Registry</h1>
          <p className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-[#a1a1a1] mt-2 opacity-70 italic underline underline-offset-4 decoration-primary/20">Manage credentials and enrollments.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-3 h-12 sm:h-14 px-6 sm:px-8 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] sm:text-xs bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95">
          <UserPlus size={18} /> Enroll Student
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl p-2 sm:p-4">
        <div className="p-4 sm:p-8 border-b-2 border-dashed border-[#f3f3f2] dark:border-[#252525] flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-center bg-[#f9fafb] dark:bg-[#202020] rounded-2xl sm:rounded-[2.5rem] mb-4 sm:mb-6">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#a1a1a1]/40" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, ID..." 
              className="w-full bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl py-3.5 sm:py-5 pl-12 sm:pl-16 pr-6 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-xl font-black tracking-tight text-xs sm:text-sm placeholder:text-[#a1a1a1]/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
             <select
               value={filterCourse}
               onChange={(e) => setFilterCourse(e.target.value)}
               className="bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl py-3.5 sm:py-5 px-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 focus:outline-none shadow-sm appearance-none"
             >
               <option value="">All Courses</option>
               {courses.map(c => (
                 <option key={c.id} value={c.id}>{c.title}</option>
               ))}
             </select>
             <div className="flex-1 lg:flex-none text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] bg-white dark:bg-[#1a1a1a] px-4 sm:px-6 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm text-center">
                Total Students: {students.length}
             </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px] sm:min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20 sm:py-40">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] dark:border-[#2e2e2e] bg-[#f3f3f2] dark:bg-[#252525]">
                  <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black text-[#a1a1a1] uppercase tracking-widest">Student</th>
                  <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black text-[#a1a1a1] uppercase tracking-widest">Username</th>
                  <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black text-[#a1a1a1] uppercase tracking-widest">Course</th>
                  <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black text-[#a1a1a1] uppercase tracking-widest">Date Joined</th>
                  <th className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black text-[#a1a1a1] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-[#e5e7eb] dark:divide-[#2e2e2e]"
              >
                {students
                  .filter(s => (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.username?.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toString().includes(searchTerm)) && (!filterCourse || String(s.course_id) === String(filterCourse)))
                  .map((student) => (
                    <motion.tr 
                      key={student.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-primary/5 transition-all group"
                    >
                      <td className="px-6 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black uppercase text-sm sm:text-base transform group-hover:scale-110 transition-transform duration-500">
                            {student.name?.[0] || 'U'}
                          </div>
                          <div 
                            onClick={() => openAuditModal(student)}
                            className="cursor-pointer group/name"
                          >
                            <p className="text-xs sm:text-sm font-black tracking-tight leading-none text-[#37352f] dark:text-white group-hover/name:text-primary transition-colors underline-offset-4 decoration-primary/30 group-hover/name:underline">{student.name}</p>
                            <p className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest pt-1 opacity-60">Verified Student</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-black italic text-[#a1a1a1] tracking-tight">@{student.username}</td>
                      <td className="px-6 sm:px-8 py-4 sm:py-6">
                        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 shadow-sm">
                           <BookOpen size={12} className="mr-2" />
                           {student.course_title || 'Unassigned Course'}
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-xs text-[#a1a1a1] font-bold uppercase tracking-tight opacity-50">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button onClick={() => openDocumentsModal(student)} variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-emerald-500 hover:bg-emerald-500/10 rounded-xl">
                             <FileText size={16} />
                           </Button>
                           <Button onClick={() => openPerformanceModal(student)} variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-amber-500 hover:bg-amber-500/10 rounded-xl">
                             <BarChart2 size={16} />
                           </Button>
                           <Button onClick={() => openEditModal(student)} variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-primary hover:bg-primary/10 rounded-xl">
                             <Edit2 size={16} />
                           </Button>
                           <Button onClick={() => handleDelete(student.id)} variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-destructive hover:bg-destructive/10 rounded-xl">
                             <Trash2 size={16} />
                           </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </motion.tbody>
            </table>
          )}
          
          {!loading && students.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-[#f9fafb] dark:bg-[#202020] rounded-[3rem] sm:rounded-[5rem] border-4 border-dashed border-primary/10 opacity-30 h-full min-h-[400px] text-center">
                  <UserPlus className="text-primary w-10 h-10 sm:w-16 sm:h-16 mb-6" />
                  <h3 className="text-xl font-black uppercase tracking-tighter text-[#37352f] dark:text-white">No Students Found</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-[#a1a1a1] mt-2">Enroll a student to populate the registry.</p>
               </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
           <Card className="w-full max-w-xl rounded-[2.5rem] sm:rounded-[3.5rem] border-2 border-primary/20 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-3xl">
              <CardHeader className="bg-primary p-8 sm:p-12 text-white relative">
                 <button onClick={() => setShowModal(false)} className="absolute top-6 sm:top-8 right-8 sm:right-10 text-white/60 hover:text-white transition-colors">
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                 </button>
                 <CardTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Enroll Student</CardTitle>
                 <CardDescription className="text-white/70 text-[10px] sm:text-xs font-black uppercase tracking-widest pt-2">Generate student credentials</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                 <form onSubmit={handleCreate} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Full Name</label>
                       <input 
                         required
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                         className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm sm:text-base font-black tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-inner placeholder:text-[#a1a1a1]/30"
                         placeholder="e.g. Jonathan Archer"
                       />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Email ID</label>
                         <input 
                           required
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm font-black tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-inner placeholder:text-[#a1a1a1]/30"
                           placeholder="student@email.com"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Password</label>
                         <input 
                           required
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm font-black tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-inner placeholder:text-[#a1a1a1]/30"
                           placeholder="Secret protocol"
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Course</label>
                       <select 
                         required
                         value={courseId}
                         onChange={(e) => setCourseId(e.target.value)}
                         className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm font-black tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-inner appearance-none uppercase"
                       >
                          <option value="">Select Course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                       </select>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <Button type="submit" disabled={creating} className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-95 py-6">
                       {creating ? <Loader2 className="animate-spin" size={24} /> : "Finalize Enrollment"}
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

      {/* Unified Student Audit Modal */}
      {showAudit && selectedAuditStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
           <Card className="w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] sm:rounded-[3.5rem] border-2 border-primary/20 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-3xl flex flex-col">
              <CardHeader className="bg-primary p-8 sm:p-12 text-white relative shrink-0">
                 <button onClick={() => setShowAudit(false)} className="absolute top-6 sm:top-8 right-8 sm:right-10 text-white/60 hover:text-white transition-colors">
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                 </button>
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-black uppercase shadow-2xl">
                       {selectedAuditStudent.name?.[0] || 'U'}
                    </div>
                    <div>
                       <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">{selectedAuditStudent.name}</CardTitle>
                       <CardDescription className="text-white/70 text-[10px] sm:text-xs font-black uppercase tracking-widest pt-2 flex items-center gap-3">
                          <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10 text-[9px]">ID: {selectedAuditStudent.id.toString().padStart(6, '0')}</span>
                          <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10 text-[9px]">{selectedAuditStudent.course_title}</span>
                       </CardDescription>
                    </div>
                 </div>
                 
                 {/* Audit Tabs */}
                 <div className="flex items-center gap-2 mt-8 sm:mt-10 overflow-x-auto no-scrollbar">
                    {[
                       { id: 'profile', label: 'Overview', icon: <ShieldCheck size={14} /> },
                       { id: 'locker', label: 'Locker', icon: <FileText size={14} /> },
                       { id: 'academic', label: 'Academic', icon: <BarChart2 size={14} /> }
                    ].map(tab => (
                       <button
                         key={tab.id}
                         onClick={() => setAuditTab(tab.id as any)}
                         className={cn(
                           "flex items-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                           auditTab === tab.id 
                             ? "bg-white text-primary shadow-xl" 
                             : "text-white/60 hover:bg-white/10"
                         )}
                       >
                          {tab.icon}
                          {tab.label}
                       </button>
                    ))}
                 </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto bg-[#f9fafb] dark:bg-[#151515]">
                 {auditLoading ? (
                    <div className="h-full flex items-center justify-center p-20">
                       <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                 ) : (
                    <div className="p-6 sm:p-10">
                       {/* Profile & Credentials Tab */}
                       {auditTab === 'profile' && (
                          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm">
                                   <p className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest mb-4">Access Credentials</p>
                                   <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-[#a1a1a1]">Username</span>
                                         <span className="text-xs font-black uppercase text-primary tracking-tight">@{selectedAuditStudent.username}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-[#a1a1a1]">Security Status</span>
                                         <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Bcrypt Secured</span>
                                      </div>
                                      <div className="pt-4 border-t border-[#e5e7eb] dark:border-[#2e2e2e] flex justify-center">
                                         <Button onClick={() => { setShowAudit(false); openEditModal(selectedAuditStudent); }} variant="outline" className="w-full rounded-2xl h-12 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 transition-all">
                                            Reset Access Keys
                                         </Button>
                                      </div>
                                   </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm">
                                   <p className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest mb-4">Institutional Timeline</p>
                                   <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-[#a1a1a1]">Enrollment Date</span>
                                         <span className="text-xs font-black uppercase text-foreground">{new Date(selectedAuditStudent.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-[#a1a1a1]">Verified By</span>
                                         <span className="text-[9px] font-black uppercase text-amber-500">System Admin</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-[#a1a1a1]">Account Role</span>
                                         <span className="text-[9px] font-black uppercase text-primary">Student Registry</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="p-8 rounded-3xl bg-primary/5 border-2 border-primary/10 relative overflow-hidden group">
                                <div className="relative z-10">
                                   <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2">Institutional Bio</p>
                                   <p className="text-sm font-bold text-[#37352f] dark:text-white/80 leading-relaxed italic">
                                      "Student {selectedAuditStudent.name} is currently enrolled in the {selectedAuditStudent.course_title} academic path at Ajinora. This profile contains all historical academic data and institutional certifications."
                                   </p>
                                </div>
                                <Award className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/5 group-hover:rotate-12 transition-transform duration-700" />
                             </div>
                          </div>
                       )}

                       {/* Locker Tab - Docs & Certs */}
                       {auditTab === 'locker' && (
                          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                             {/* Documents Section */}
                             <div>
                                <h3 className="text-xs font-black uppercase text-[#a1a1a1] tracking-[0.2em] mb-6 flex items-center gap-3">
                                   Identity Records
                                   <div className="flex-1 h-[1px] bg-[#e5e7eb] dark:bg-[#2e2e2e]" />
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {studentDocs.length === 0 ? (
                                      <div className="col-span-full py-12 flex flex-col items-center justify-center border-4 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-3xl opacity-40">
                                         <p className="text-[10px] font-black uppercase tracking-widest italic">Zero documents filed in records.</p>
                                      </div>
                                   ) : studentDocs.map((doc) => (
                                      <div key={doc.id} className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] flex items-center justify-between group shadow-sm">
                                         <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                               <FileText size={18} />
                                            </div>
                                            <div>
                                               <p className="font-black text-[11px] uppercase text-[#37352f] dark:text-white leading-none">{doc.title}</p>
                                               <p className={cn(
                                                  "text-[8px] font-bold uppercase tracking-widest mt-1.5",
                                                  doc.status === 'pending' ? 'text-amber-500' : 
                                                  doc.status === 'verified' ? 'text-emerald-500' : 'text-red-500'
                                               )}>{doc.status}</p>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-1.5">
                                            <Button onClick={() => window.open(doc.url, '_blank')} variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"><BookOpen size={14}/></Button>
                                            {doc.status === 'pending' && (
                                               <>
                                                  <Button onClick={() => updateDocStatus(doc.id, 'verified')} variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><Check size={14}/></Button>
                                                  <Button onClick={() => updateDocStatus(doc.id, 'rejected')} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"><XCircle size={14}/></Button>
                                               </>
                                            )}
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>

                             {/* Certificates Section */}
                             <div>
                                <h3 className="text-xs font-black uppercase text-[#a1a1a1] tracking-[0.2em] mb-6 flex items-center gap-3">
                                   Achievements Matrix
                                   <div className="flex-1 h-[1px] bg-[#e5e7eb] dark:bg-[#2e2e2e]" />
                                </h3>
                                <div className="space-y-4">
                                   <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-3xl bg-emerald-500/5 border-2 border-emerald-500/20">
                                      <input 
                                         value={certTitle}
                                         onChange={(e) => setCertTitle(e.target.value)}
                                         placeholder="CERTIFICATE DESIGNATION..."
                                         className="flex-1 bg-white dark:bg-black border border-emerald-500/20 rounded-xl px-5 h-12 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                      />
                                      <Button 
                                         onClick={() => certRef.current?.click()}
                                         disabled={issuing}
                                         className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20 gap-2 shrink-0"
                                      >
                                         {issuing ? <Loader2 className="animate-spin" size={14} /> : <><Upload size={14} /> Issue New Medal</>}
                                      </Button>
                                      <input ref={certRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleCertUpload(e.target.files[0])} />
                                   </div>

                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {studentCerts.length === 0 ? (
                                         <div className="col-span-full py-8 flex items-center justify-center opacity-40">
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">Zero awards issued.</p>
                                         </div>
                                      ) : studentCerts.map((cert) => (
                                         <div key={cert.id} className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] flex items-center justify-between group shadow-sm">
                                            <div className="flex items-center gap-3">
                                               <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                                  <Award size={18} />
                                               </div>
                                               <div>
                                                  <p className="font-black text-[11px] uppercase text-[#37352f] dark:text-white leading-none">{cert.title}</p>
                                                  <p className="text-[8px] font-bold text-[#a1a1a1] uppercase mt-1.5 opacity-60">Matrix Date: {new Date(cert.issued_at).toLocaleDateString()}</p>
                                               </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                               <Button onClick={() => window.open(cert.url, '_blank')} variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><BookOpen size={14}/></Button>
                                               <Button onClick={() => revokeCert(cert.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></Button>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}

                       {/* Academic Performance Tab */}
                       {auditTab === 'academic' && (
                          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-center">
                                   <p className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest mb-2">Efficiency Rating</p>
                                   <h4 className="text-3xl font-black text-amber-500 tracking-tighter">
                                      {performanceResults.length > 0 
                                         ? Math.round(performanceResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / performanceResults.length) 
                                         : 0}%
                                   </h4>
                                </div>
                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-center">
                                   <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest mb-2">Exams Completed</p>
                                   <h4 className="text-3xl font-black text-primary tracking-tighter">{performanceResults.length}</h4>
                                </div>
                                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                   <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest mb-2">Global Rank</p>
                                   <h4 className="text-3xl font-black text-emerald-500 tracking-tighter">A+</h4>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-[#a1a1a1] tracking-[0.2em] mb-4 flex items-center gap-3">
                                   Performance Matrix
                                   <div className="flex-1 h-[1px] bg-[#e5e7eb] dark:bg-[#2e2e2e]" />
                                </h3>
                                {performanceResults.length === 0 ? (
                                   <div className="py-20 flex flex-col items-center justify-center border-4 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] rounded-[3rem] opacity-30">
                                      <BarChart2 className="w-16 h-16 text-primary mb-6" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Zero academic traces detected.</p>
                                   </div>
                                ) : (
                                   <div className="grid grid-cols-1 gap-4">
                                      {performanceResults.map((result, idx) => (
                                         <div key={idx} className="p-6 rounded-[2rem] bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-xl transition-all group">
                                            <div className="flex items-center gap-5">
                                               <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                                                  <Trophy size={28} />
                                               </div>
                                               <div>
                                                  <p className="text-base font-black tracking-tighter text-[#37352f] dark:text-white uppercase leading-none">{result.exam_title || 'Institutional Module'}</p>
                                                  <p className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest mt-2">{new Date(result.completed_at).toLocaleDateString()}</p>
                                               </div>
                                            </div>
                                            <div className="flex items-center gap-8 w-full sm:w-auto border-t sm:border-t-0 border-[#e5e7eb] dark:border-[#2e2e2e] pt-4 sm:pt-0">
                                               <div className="text-right flex-1 sm:flex-none">
                                                  <p className="text-[9px] font-black uppercase text-[#a1a1a1] tracking-widest mb-1">Score Delta</p>
                                                  <p className="text-xl font-black text-primary tracking-tighter">{result.score}/{result.total}</p>
                                               </div>
                                               <div className="h-10 w-[1px] bg-[#e5e7eb] dark:bg-[#2e2e2e] hidden sm:block" />
                                               <div className="text-right flex-1 sm:flex-none">
                                                  <p className="text-[9px] font-black uppercase text-[#a1a1a1] tracking-widest mb-1">Efficiency</p>
                                                  <p className="text-xl font-black text-emerald-500 tracking-tighter">{result.percentage}%</p>
                                               </div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                )}
                             </div>
                          </div>
                       )}
                    </div>
                 )}
              </CardContent>
              <div className="p-6 sm:p-10 border-t border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] shrink-0">
                 <Button onClick={() => setShowAudit(false)} className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-2xl h-14 sm:h-16 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                    Dismiss Student Audit Matrix
                 </Button>
              </div>
           </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
           <Card className="w-full max-w-xl rounded-[2.5rem] sm:rounded-[3.5rem] border-2 border-primary/20 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-3xl">
              <CardHeader className="bg-[#1a1a1a] dark:bg-black p-8 sm:p-12 text-white relative">
                 <button onClick={() => setShowEditModal(false)} className="absolute top-6 sm:top-8 right-8 sm:right-10 text-white/60 hover:text-white transition-colors">
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                 </button>
                 <CardTitle className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">Modify Student</CardTitle>
                 <CardDescription className="text-white/70 text-[10px] sm:text-xs font-black uppercase tracking-widest pt-2">Update student parameters</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                 <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Full Name</label>
                       <input 
                         required
                         value={eFullName}
                         onChange={(e) => setEFullName(e.target.value)}
                         className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm sm:text-base font-black tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Username</label>
                       <input 
                         required
                         value={eUsername}
                         onChange={(e) => setEUsername(e.target.value)}
                         className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:outline-none transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-[#a1a1a1] tracking-widest ml-2">Active Course Assignment</label>
                       <select 
                         required
                         value={eCourseId}
                         onChange={(e) => setECourseId(e.target.value)}
                         className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm font-black appearance-none uppercase"
                       >
                          <option value="">No Path Assigned</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                       </select>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <Button type="submit" disabled={updating} className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs bg-primary hover:bg-primary/90 text-white shadow-xl py-6">
                       {updating ? <Loader2 className="animate-spin" size={24} /> : "Record Modifications"}
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

      {/* ── Documents & Certificates Audit Modal ── */}
      {showDocuments && selectedDocStudent && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
           <Card className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-[2.5rem] shadow-3xl border-none overflow-hidden animate-in zoom-in-95 leading-none">
              <CardHeader className="p-8 pb-0 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                          <ShieldCheck size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Institutional Locker Audit</p>
                          <h2 className="text-xl font-black text-[#37352f] dark:text-white uppercase leading-none">{selectedDocStudent.name}</h2>
                       </div>
                    </div>
                    <Button onClick={() => setShowDocuments(false)} variant="ghost" className="h-10 w-10 p-0 rounded-full text-[#a1a1a1] hover:text-red-500">
                       <X size={20} />
                    </Button>
                 </div>

                 {/* TAB NAVIGATION */}
                 <div className="flex gap-8 border-b-2 border-transparent">
                    <button 
                      onClick={() => setActiveTab('docs')}
                      className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'docs' ? "text-primary" : "text-[#a1a1a1] opacity-60 hover:opacity-100"
                      )}
                    >
                      Identity Proofs
                      {activeTab === 'docs' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />}
                    </button>
                    <button 
                      onClick={() => setActiveTab('certs')}
                      className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'certs' ? "text-emerald-500" : "text-[#a1a1a1] opacity-60 hover:opacity-100"
                      )}
                    >
                      Issued Certificates
                      {activeTab === 'certs' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full animate-in fade-in slide-in-from-bottom-1" />}
                    </button>
                 </div>
              </CardHeader>

              <CardContent className="p-8">
                 {docsLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
                 ) : activeTab === 'docs' ? (
                    /* IDENTITY PROOFS TAB */
                    studentDocs.length === 0 ? (
                       <div className="py-20 text-center opacity-40">
                          <FileText className="mx-auto mb-4 text-[#a1a1a1]" size={40} />
                          <p className="text-[10px] font-black uppercase tracking-widest italic text-[#a1a1a1]">Zero identity artifacts pulled.</p>
                       </div>
                    ) : (
                       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                          {studentDocs.map((doc) => (
                             <div key={doc.id} className="p-5 rounded-2xl bg-[#f9fafb] dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-xl bg-white dark:bg-black flex items-center justify-center text-primary shadow-sm border border-border/50 transition-transform group-hover:scale-110">
                                      <FileText size={20} />
                                   </div>
                                   <div>
                                      <p className="font-black text-sm uppercase text-[#37352f] dark:text-white leading-none">{doc.title}</p>
                                      <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${doc.status === 'verified' ? 'text-green-500' : doc.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                         {doc.status}
                                      </p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Button onClick={() => window.open(doc.url, '_blank')} variant="outline" size="sm" className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border-[#e5e7eb]">View</Button>
                                   <Button onClick={() => updateDocStatus(doc.id, 'verified')} disabled={doc.status === 'verified'} variant="ghost" size="icon" className="h-9 w-9 text-green-500 hover:bg-green-500/10 rounded-lg"><Check size={16}/></Button>
                                   <Button onClick={() => updateDocStatus(doc.id, 'rejected')} disabled={doc.status === 'rejected'} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-500/10 rounded-lg"><XCircle size={16}/></Button>
                                </div>
                             </div>
                          ))}
                       </div>
                    )
                 ) : (
                    /* ISSUED CERTIFICATES TAB */
                    <div className="space-y-6">
                       {/* ISSUANCE CONTROL */}
                       <div className="p-6 rounded-3xl bg-emerald-500/5 border-2 border-emerald-500/20 shadow-inner space-y-4">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest leading-none">Issuance Protocol</p>
                          <div className="flex flex-col sm:flex-row gap-3">
                             <input 
                               value={certTitle}
                               onChange={(e) => setCertTitle(e.target.value)}
                               placeholder="CERTIFICATE DESIGNATION..."
                               className="flex-1 bg-white dark:bg-black border border-emerald-500/20 rounded-xl px-5 h-12 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                             />
                             <Button 
                               onClick={() => certRef.current?.click()}
                               disabled={issuing}
                               className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20 gap-2 shrink-0"
                             >
                                {issuing ? <Loader2 className="animate-spin" size={14} /> : <><Upload size={14} /> Upload Matrix</>}
                             </Button>
                             <input ref={certRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleCertUpload(e.target.files[0])} />
                          </div>
                       </div>

                       <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                          {studentCerts.length === 0 ? (
                             <div className="py-12 text-center opacity-40">
                                <Award className="mx-auto mb-4 text-[#a1a1a1]" size={40} />
                                <p className="text-[10px] font-black uppercase tracking-widest italic text-[#a1a1a1]">Zero institutional certificates issued.</p>
                             </div>
                          ) : studentCerts.map((cert) => (
                             <div key={cert.id} className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] flex items-center justify-between group shadow-sm">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                      <Award size={20} />
                                   </div>
                                   <div>
                                      <p className="font-black text-sm uppercase text-[#37352f] dark:text-white leading-none">{cert.title}</p>
                                      <p className="text-[9px] font-bold text-[#a1a1a1] uppercase mt-2 opacity-60">Matrix Date: {new Date(cert.issued_at).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Button onClick={() => window.open(cert.url, '_blank')} variant="ghost" size="icon" className="h-9 w-9 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><BookOpen size={16}/></Button>
                                   <Button onClick={() => revokeCert(cert.id)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></Button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      )}

      {/* ── Performance Matrix Modal ── */}
      {showPerformance && selectedPerformance && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
           <Card className="w-full max-w-4xl bg-white dark:bg-[#111] rounded-[2.5rem] sm:rounded-[4rem] shadow-3xl border-none overflow-hidden animate-in zoom-in-95 duration-500">
              <CardHeader className="p-8 sm:p-14 pb-0 bg-gradient-to-br from-amber-500/10 to-transparent border-b-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e]">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                       <div className="h-16 w-16 rounded-[1.5rem] bg-amber-500 shadow-2xl flex items-center justify-center text-white rotate-6 hover:rotate-0 transition-transform duration-500">
                          <BarChart2 size={32} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em] mb-1">Academic Performance Matrix</p>
                          <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-[#37352f] dark:text-white uppercase leading-none">{selectedPerformance.name}</h2>
                       </div>
                    </div>
                    <Button onClick={() => setShowPerformance(false)} variant="ghost" className="h-14 w-14 rounded-full bg-[#f9fafb] dark:bg-[#202020] text-[#a1a1a1] hover:text-red-500 transition-colors">
                       <ArrowLeft size={24} />
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-8 sm:p-14">
                 {performanceLoading ? (
                   <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="animate-spin text-amber-500" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Synchronizing records...</p>
                   </div>
                 ) : performanceResults.length === 0 ? (
                    <div className="py-20 text-center space-y-6 bg-[#f9fafb] dark:bg-[#202020] rounded-[3rem] border-4 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] opacity-40">
                       <Trophy className="mx-auto text-[#a1a1a1]/30" size={64} />
                       <p className="text-xs font-black uppercase tracking-widest text-[#a1a1a1] italic">No exercise protocols identified for this instance.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 gap-6">
                       {/* Performance Stats */}
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                          {[
                            { label: 'Protocols Logged', value: performanceResults.length, color: 'text-primary' },
                            { label: 'Matrix Mean', value: `${Math.round(performanceResults.reduce((acc, curr) => acc + curr.percentage, 0) / performanceResults.length)}%`, color: 'text-green-500' },
                            { label: 'Accumulated Pts', value: performanceResults.reduce((acc, curr) => acc + curr.score, 0), color: 'text-amber-500' },
                            { label: 'Efficiency', value: `${Math.round(performanceResults.reduce((acc, curr) => acc + (curr.correct_count || 0), 0) / performanceResults.reduce((acc, curr) => acc + (curr.total_questions || 1), 0) * 100)}%`, color: 'text-blue-500' }
                          ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-[1.5rem] bg-[#f9fafb] dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-inner text-center">
                               <p className="text-[8px] font-black uppercase text-[#a1a1a1] tracking-widest mb-1">{stat.label}</p>
                               <p className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                            </div>
                          ))}
                       </div>

                       {/* Detailed Registry */}
                       <div className="bg-[#fdfdfd] dark:bg-[#151515] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-[2rem] overflow-hidden shadow-xl overflow-x-auto">
                          <table className="w-full text-left min-w-[600px]">
                             <thead>
                                <tr className="bg-[#f3f3f2] dark:bg-[#252525] border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
                                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Assessment Title</th>
                                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Integrity</th>
                                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Final Score</th>
                                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Date Protocol</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2e2e2e]">
                                {performanceResults.map((res: any, i: number) => (
                                   <tr key={i} className="hover:bg-amber-500/5 transition-all group">
                                      <td className="px-8 py-5">
                                         <p className="font-black text-sm text-[#37352f] dark:text-white uppercase leading-none">{res.assetTitle}</p>
                                         <p className="text-[10px] text-[#a1a1a1] pt-1 uppercase font-bold tracking-widest opacity-60">Archive ID: {res.asset_id}</p>
                                      </td>
                                      <td className="px-8 py-5">
                                         <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]",
                                            res.percentage >= 80 ? "bg-green-500/10 text-green-500" :
                                            res.percentage >= 50 ? "bg-amber-500/10 text-amber-500" :
                                            "bg-red-500/10 text-red-500"
                                         )}>
                                            {res.correct_count} / {res.total_questions} Valid
                                         </span>
                                      </td>
                                      <td className="px-8 py-5">
                                         <p className="text-xl font-black text-[#37352f] dark:text-white leading-none">{res.percentage}%</p>
                                         <div className="mt-2 h-1.5 w-24 bg-[#f3f3f2] dark:bg-[#252525] rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500" style={{ width: `${res.percentage}%` }} />
                                         </div>
                                      </td>
                                      <td className="px-8 py-5 text-[10px] font-bold text-[#a1a1a1] uppercase">
                                         {new Date(res.created_at).toLocaleString()}
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
