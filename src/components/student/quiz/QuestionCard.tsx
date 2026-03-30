"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type QuizQuestion } from "@/lib/quiz-types";

interface QuestionCardProps {
  question: QuizQuestion;
  selected: number | null;
  answerState: "idle" | "correct" | "wrong";
  onSelect: (index: number) => void;
}

const LETTER_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({
  question,
  selected,
  answerState,
  onSelect,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 40, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -40, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Question text card */}
        <div className="bg-[#f9fafb] dark:bg-[#1a1a1a] rounded-2xl p-8 sm:p-12 border-2 border-[#e5e7eb] dark:border-[#2e2e2e]">
          <p className="text-xl sm:text-3xl font-black tracking-tighter text-[#37352f] dark:text-white leading-tight">
            {question.question}
          </p>
        </div>

        {/* MCQ options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === question.correct;
            const isIdle = answerState === "idle";

            let optionStyle =
              "bg-[#f9fafb] dark:bg-[#1a1a1a] border-[#e5e7eb] dark:border-[#2e2e2e] hover:border-primary/50 hover:bg-primary/5";

            if (!isIdle) {
              if (isCorrectAnswer) {
                optionStyle =
                  "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
              } else if (isSelected) {
                optionStyle =
                  "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400";
              } else {
                optionStyle =
                  "bg-[#f9fafb] dark:bg-[#1a1a1a] border-[#e5e7eb] dark:border-[#2e2e2e] opacity-40";
              }
            }

            let badgeStyle =
              "border-[#e5e7eb] dark:border-[#2e2e2e] text-[#a1a1a1]";
            if (!isIdle && isCorrectAnswer) {
              badgeStyle = "bg-green-500 border-green-500 text-white";
            } else if (!isIdle && isSelected && !isCorrectAnswer) {
              badgeStyle = "bg-red-500 border-red-500 text-white";
            }

            return (
              <motion.button
                key={i}
                whileTap={isIdle ? { scale: 0.97 } : {}}
                onClick={() => isIdle && onSelect(i)}
                disabled={!isIdle}
                className={cn(
                  "w-full text-left p-6 sm:p-8 rounded-[2rem] border-2 font-black text-base sm:text-lg transition-all flex items-center gap-5",
                  isIdle ? "cursor-pointer" : "cursor-default pointer-events-none",
                  optionStyle
                )}
              >
                <span
                  className={cn(
                    "h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center text-sm sm:text-base font-black shrink-0 border-2 transition-all",
                    badgeStyle
                  )}
                >
                  {LETTER_LABELS[i] ?? String(i + 1)}
                </span>
                <span className="flex-1 leading-tight">{opt}</span>
                {!isIdle && isCorrectAnswer && (
                  <CheckCircle2
                    size={16}
                    className="ml-auto text-green-500 shrink-0"
                  />
                )}
                {!isIdle && isSelected && !isCorrectAnswer && (
                  <XCircle
                    size={16}
                    className="ml-auto text-red-500 shrink-0"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
