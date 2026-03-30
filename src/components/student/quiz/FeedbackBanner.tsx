"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackBannerProps {
  answerState: "correct" | "wrong";
  explanation?: string;
  pointsEarned: number;
}

export default function FeedbackBanner({
  answerState,
  explanation,
  pointsEarned,
}: FeedbackBannerProps) {
  const isCorrect = answerState === "correct";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "rounded-2xl p-4 border-2 flex items-start gap-3",
        isCorrect
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/30"
      )}
    >
      {isCorrect ? (
        <CheckCircle2
          size={20}
          className="text-green-500 shrink-0 mt-0.5"
        />
      ) : (
        <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "font-black text-sm",
              isCorrect
                ? "text-green-700 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </p>
          {isCorrect && pointsEarned > 0 && (
            <span className="text-xs font-black text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg shrink-0">
              +{pointsEarned} pts
            </span>
          )}
        </div>
        {explanation && (
          <p className="text-xs text-[#737373] dark:text-[#a1a1a1] mt-1 leading-relaxed">
            {explanation}
          </p>
        )}
      </div>
    </motion.div>
  );
}
