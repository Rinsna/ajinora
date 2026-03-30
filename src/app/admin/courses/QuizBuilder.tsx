"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Loader2, CheckCircle2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizType = "exercise";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  points: number;
}

interface Props {
  module: { id: number; title: string };
  courseId: number;
  type: QuizType;
  onClose: () => void;
  onSaved: () => void;
  editingAsset?: any;
}

const TYPE_CONFIG = {
  exercise: { label: "Exercise", color: "bg-orange-500", icon: <Dumbbell size={18} />,      desc: "Practice tasks to reinforce learning" },
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function newQuestion(): Question {
  return { id: uid(), text: "", options: ["", "", "", ""], correct: 0, explanation: "", points: 10 };
}

export default function QuizBuilder({ module, courseId, type, onClose, onSaved, editingAsset }: Props) {
  const cfg = TYPE_CONFIG[type];
  
  // Initialize with editingAsset data if available
  const initialTitle = editingAsset?.title || "";
  let initialQuestions = [newQuestion()];
  
  if (editingAsset?.details) {
    try {
      const details = JSON.parse(editingAsset.details);
      if (details.questions && Array.isArray(details.questions)) {
        initialQuestions = details.questions.map((q: any) => ({
          id: q.id.toString() || uid(),
          text: q.question || "",
          options: q.options || ["", "", "", ""],
          correct: q.correct || 0,
          explanation: q.explanation || "",
          points: q.points || 10
        }));
      }
    } catch (e) {
      console.error("Failed to parse existing asset details", e);
    }
  }

  const [title, setTitle]         = useState(initialTitle);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [saving, setSaving]       = useState(false);
  const [step, setStep]           = useState<"build" | "preview">("build");
  const [previewQ, setPreviewQ]   = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);

  // ── question helpers ───────────────────────────────────────────────────────
  const updateQ = (id: string, patch: Partial<Question>) =>
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));

  const updateOption = (id: string, idx: number, val: string) =>
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q));

  const addQuestion = () => setQuestions(qs => [...qs, newQuestion()]);
  const removeQuestion = (id: string) => setQuestions(qs => qs.filter(q => q.id !== id));

  // ── validation ─────────────────────────────────────────────────────────────
  const isFormValid = title.trim() !== "" && questions.every(q => {
    const filledOptions = q.options.filter(o => o.trim() !== "");
    const isCorrectFilled = q.options[q.correct]?.trim() !== "";
    return q.text.trim() !== "" && filledOptions.length >= 2 && isCorrectFilled;
  });

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { alert("Please add a title."); return; }
    
    // Improved validation: each question must have text and at least 2 non-empty options.
    // Also, the correct option must be one of the non-empty ones.
    const isFilteredValid = questions.every(q => {
      const filledOptions = q.options.filter(o => o.trim() !== "");
      const isCorrectFilled = q.options[q.correct]?.trim() !== "";
      return q.text.trim() !== "" && filledOptions.length >= 2 && isCorrectFilled;
    });

    if (!isFilteredValid) {
      alert("Each question must have text, at least 2 non-empty options, and a valid correct answer selected.");
      return;
    }

    setSaving(true);
    try {
      // Clean up questions: remove empty options and adjust 'correct' index
      const cleanQuestions = questions.map((q, idx) => {
        const originalCorrectOption = q.options[q.correct];
        const cleanOptions = q.options.filter(o => o.trim() !== "");
        const newCorrectIndex = cleanOptions.indexOf(originalCorrectOption);
        
        return {
          id: idx + 1, // Use numeric ID as expected by types
          question: q.text,
          options: cleanOptions,
          correct: newCorrectIndex,
          explanation: q.explanation,
          points: q.points || 100
        };
      });

      const details = JSON.stringify({ 
        questions: cleanQuestions, 
        totalPoints: cleanQuestions.reduce((s, q) => s + q.points, 0) 
      });

      const url = editingAsset 
        ? `/api/admin/courses/${courseId}/content/${module.id}/assets/${editingAsset.id}`
        : `/api/admin/courses/${courseId}/content/${module.id}/assets`;
      
      const method = editingAsset ? "PATCH" : "POST";

      const res = await fetch(url, {
        method, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, details }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const errData = await res.json();
        alert(`Failed to save: ${errData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An unexpected network error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // ── preview logic ──────────────────────────────────────────────────────────
  const currentQ = questions[previewQ];
  const handlePreviewSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === currentQ.correct) setScore(s => s + currentQ.points);
  };
  const nextPreviewQ = () => {
    if (previewQ < questions.length - 1) {
      setPreviewQ(p => p + 1); setSelected(null); setRevealed(false);
    } else { setDone(true); }
  };
  const resetPreview = () => { setPreviewQ(0); setSelected(null); setRevealed(false); setScore(0); setDone(false); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className={cn("p-5 flex items-center justify-between shrink-0", cfg.color)}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">{cfg.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{module.title}</p>
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">{editingAsset ? "Edit" : "New"} {cfg.label} Builder</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setStep(step === "build" ? "preview" : "build"); resetPreview(); }}
              className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all">
              {step === "build" ? "Preview" : "Edit"}
            </button>
            <button onClick={onClose} className="text-white/60 hover:text-white ml-1"><X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {step === "build" ? (
            <div className="p-5 space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">{cfg.label} Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={`e.g. Module 1 ${cfg.label}`} />
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={q.id} className="bg-[#f9fafb] dark:bg-[#202020] rounded-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">{qi + 1}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Question</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#a1a1a1]">pts</span>
                          <input type="number" value={q.points} onChange={e => updateQ(q.id, { points: Number(e.target.value) })}
                            className="w-14 bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-lg py-1 px-2 text-xs font-black text-center focus:outline-none" />
                        </div>
                        {questions.length > 1 && (
                          <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>

                    <textarea value={q.text} onChange={e => updateQ(q.id, { text: e.target.value })} rows={2}
                      className="w-full bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Enter your question here..." />

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={cn("flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer",
                          q.correct === oi ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a]"
                        )} onClick={() => updateQ(q.id, { correct: oi })}>
                          <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            q.correct === oi ? "border-green-500 bg-green-500" : "border-[#d1d5db] dark:border-[#3e3e3e]")}>
                            {q.correct === oi && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <input value={opt} onChange={e => { e.stopPropagation(); updateOption(q.id, oi, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 bg-transparent text-xs font-black focus:outline-none placeholder:text-[#a1a1a1]/40"
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[#a1a1a1]">Explanation (shown after answer)</label>
                      <input value={q.explanation} onChange={e => updateQ(q.id, { explanation: e.target.value })}
                        className="w-full bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-xl py-2.5 px-4 text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Why is this the correct answer?" />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addQuestion}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[#e5e7eb] dark:border-[#2e2e2e] text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Question
              </button>
            </div>
          ) : (
            /* ── Preview mode ── */
            <div className="p-5">
              {!done ? (
                <div className="space-y-5">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">
                      <span>Question {previewQ + 1} of {questions.length}</span>
                      <span className="text-primary">{score} pts</span>
                    </div>
                    <div className="h-2 bg-[#f3f3f2] dark:bg-[#252525] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${((previewQ) / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
                    </div>
                  </div>

                  {/* Question card */}
                  <AnimatePresence mode="wait">
                    <motion.div key={previewQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="bg-[#f9fafb] dark:bg-[#202020] rounded-2xl p-5 space-y-4">
                      <p className="text-base font-black tracking-tight leading-snug">{currentQ.text || "Question text..."}</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {currentQ.options.map((opt, oi) => {
                          const isSelected = selected === oi;
                          const isCorrect  = oi === currentQ.correct;
                          let style = "border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] hover:border-primary/50";
                          if (revealed) {
                            if (isCorrect) style = "border-green-500 bg-green-50 dark:bg-green-500/10";
                            else if (isSelected) style = "border-red-400 bg-red-50 dark:bg-red-500/10";
                          } else if (isSelected) style = "border-primary bg-primary/5";
                          return (
                            <motion.button key={oi} whileTap={{ scale: 0.98 }} onClick={() => handlePreviewSelect(oi)}
                              className={cn("flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all w-full", style, !revealed && "cursor-pointer")}>
                              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all",
                                revealed && isCorrect ? "bg-green-500 text-white" :
                                revealed && isSelected ? "bg-red-400 text-white" :
                                "bg-[#f3f3f2] dark:bg-[#252525] text-[#a1a1a1]")}>
                                {String.fromCharCode(65 + oi)}
                              </div>
                              <span className="text-sm font-black">{opt || `Option ${String.fromCharCode(65 + oi)}`}</span>
                              {revealed && isCorrect && <CheckCircle2 size={16} className="text-green-500 ml-auto shrink-0" />}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {revealed && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className={cn("p-3.5 rounded-xl border-2 text-sm font-black",
                              selected === currentQ.correct
                                ? "bg-green-50 dark:bg-green-500/10 border-green-500 text-green-700 dark:text-green-400"
                                : "bg-red-50 dark:bg-red-500/10 border-red-400 text-red-700 dark:text-red-400"
                            )}>
                            <p className="text-[10px] uppercase tracking-widest mb-1">{selected === currentQ.correct ? "Correct! +" + currentQ.points + " pts" : "Incorrect"}</p>
                            {currentQ.explanation && <p className="text-xs font-bold opacity-80">{currentQ.explanation}</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>

                  {revealed && (
                    <Button onClick={nextPreviewQ} className="w-full h-12 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl">
                      {previewQ < questions.length - 1 ? "Next Question →" : "See Results"}
                    </Button>
                  )}
                </div>
              ) : (
                /* Completion screen */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-5">
                  <div className="text-6xl">🎉</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Completed!</p>
                    <p className="text-3xl font-black tracking-tighter mt-1">{score} <span className="text-[#a1a1a1] text-lg">/ {questions.reduce((s, q) => s + q.points, 0)} pts</span></p>
                    <p className="text-sm font-bold text-[#a1a1a1] mt-1">{Math.round((score / questions.reduce((s, q) => s + q.points, 0)) * 100)}% score</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={resetPreview} className="px-5 py-2.5 rounded-xl border-2 border-[#e5e7eb] dark:border-[#2e2e2e] text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                      Try Again
                    </button>
                    <button onClick={() => setStep("build")} className="px-5 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all">
                      Edit Questions
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "build" && (
          <div className="flex flex-col">
            {!isFormValid && (
              <div className="px-5 py-2">
                <p className="text-[9px] font-black uppercase tracking-tight text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                  ⚠️ Require: Title + Questions with text & 2+ options + Correct answer selection.
                </p>
              </div>
            )}
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#2e2e2e] shrink-0 flex items-center justify-between bg-[#f9fafb] dark:bg-[#202020]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">{questions.length} questions · {questions.reduce((s, q) => s + q.points, 0)} pts total</p>
              <Button onClick={handleSave} disabled={saving || !isFormValid} className="h-10 px-6 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-xl disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" size={16} /> : `Save ${cfg.label}`}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
