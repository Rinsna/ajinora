"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuizEngine } from "@/hooks/useQuizEngine";
import { type QuizQuestion, type QuizResult, type BadgeLevel, deriveBadge } from "@/lib/quiz-types";
import ProgressBar from "@/components/student/quiz/ProgressBar";
import NavigationPanel from "@/components/student/quiz/NavigationPanel";
import QuestionCard from "@/components/student/quiz/QuestionCard";
import FeedbackBanner from "@/components/student/quiz/FeedbackBanner";
import CompletionScreen from "@/components/student/quiz/CompletionScreen";
import StreakBurst from "@/components/student/quiz/StreakBurst";

const STREAK_BONUS = 50;

export interface QuizPlayerProps {
  title: string;
  questions: QuizQuestion[];
  quizType?: "quiz" | "puzzle" | "exercise";
  timerEnabled?: boolean;
  timerSeconds?: number;
  onClose: () => void;
  onComplete?: (result: QuizResult) => void;
  rank?: number;
}

export default function QuizPlayer({
  title,
  questions,
  timerEnabled = false,
  timerSeconds = 30,
  onClose,
  onComplete,
  rank,
}: QuizPlayerProps) {
  const engine = useQuizEngine(questions, { timerEnabled, timerSeconds });

  const {
    current,
    question,
    selected,
    answerState,
    score,
    streak,
    results,
    done,
    progress,
    timeLeft,
    submitAnswer,
    advance,
    jumpTo,
    restart,
  } = engine;

  // Build navigation results: answered questions have true/false, unanswered have null
  const navResults: (boolean | null)[] = Array.from(
    { length: questions.length },
    (_, i) => (i < results.length ? results[i] : null)
  );

  // Compute points earned for the current answer
  const pointsEarned =
    answerState === "correct"
      ? 100 + (streak >= 2 ? STREAK_BONUS : 0)
      : 0;

  // Call onComplete when done becomes true
  useEffect(() => {
    if (!done || !onComplete) return;

    const correctCount = results.filter(Boolean).length;
    const totalQuestions = questions.length;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 100), 0);
    const percentage = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;
    const badge: BadgeLevel = deriveBadge(correctCount, totalQuestions);

    const result: QuizResult = {
      score,
      totalPoints,
      correctCount,
      totalQuestions,
      percentage,
      badge,
      results,
    };

    onComplete(result);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (answerState === "idle") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < (question?.options?.length ?? 0)) {
          submitAnswer(idx);
        }
      }
      if (e.key === "Enter" && answerState !== "idle") {
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answerState, question, submitAnswer, advance, onClose]);

  // Error state: empty or invalid questions
  if (!questions || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center gap-5 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <div>
            <p className="font-black text-lg text-[#37352f] dark:text-white">No questions found</p>
            <p className="text-sm text-[#737373] dark:text-[#a1a1a1] mt-1">
              This quiz has no questions yet. Please check back later.
            </p>
          </div>
          <Button
            onClick={onClose}
            className="h-12 px-8 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl"
          >
            Close
          </Button>
        </motion.div>
      </div>
    );
  }

  const correctCount = results.filter(Boolean).length;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 100), 0);
  const badge: BadgeLevel = deriveBadge(correctCount, questions.length);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      {/* Streak burst overlay */}
      <AnimatePresence>
        {streak >= 2 && answerState !== "idle" && (
          <StreakBurst streak={streak} bonusPoints={STREAK_BONUS} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-5xl bg-white dark:bg-[#111] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[98vh]"
      >
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Trophy size={18} className="text-white/70" />
            <span className="text-white font-black text-sm uppercase tracking-widest truncate max-w-[200px]">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Star size={14} className="text-amber-300" />
              <span className="text-white font-black text-sm">{score}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close quiz"
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {done ? (
          <CompletionScreen
            score={score}
            totalPoints={totalPoints}
            correctCount={correctCount}
            totalQuestions={questions.length}
            results={results}
            badge={badge}
            onRetry={restart}
            onClose={onClose}
            rank={rank}
          />
        ) : (
          <>
            {/* Progress bar */}
            <ProgressBar
              progress={progress}
              streak={streak}
              questionIndex={current}
              totalQuestions={questions.length}
            />

            {/* Navigation panel */}
            <NavigationPanel
              total={questions.length}
              current={current}
              results={navResults}
              onJump={jumpTo}
            />

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 scrollbar-none">
              {/* Timer row */}
              {timerEnabled && (
                <div className="flex justify-end">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black transition-colors",
                      timeLeft <= 10
                        ? "bg-red-500/10 text-red-500 animate-pulse"
                        : "bg-[#f9fafb] dark:bg-[#222] text-[#a1a1a1]"
                    )}
                  >
                    <Clock size={14} />
                    {timeLeft}s
                  </div>
                </div>
              )}

              {/* Question card */}
              <QuestionCard
                question={question}
                selected={selected}
                answerState={answerState}
                onSelect={submitAnswer}
              />

              {/* Feedback banner */}
              <AnimatePresence>
                {answerState !== "idle" && (
                  <FeedbackBanner
                    answerState={answerState}
                    explanation={question.explanation}
                    pointsEarned={pointsEarned}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Next button */}
            <AnimatePresence>
              {answerState !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="p-5 border-t border-[#e5e7eb] dark:border-[#2e2e2e] shrink-0"
                >
                  <Button
                    onClick={advance}
                    className="w-full h-12 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl gap-2"
                  >
                    {current + 1 >= questions.length ? "See Results" : "Next →"}
                    <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
}
