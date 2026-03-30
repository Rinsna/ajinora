"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;       // 0–100
  streak: number;         // drives color shift (normal → amber at streak ≥3)
  questionIndex: number;
  totalQuestions: number;
}

export default function ProgressBar({
  progress,
  streak,
  questionIndex,
  totalQuestions,
}: ProgressBarProps) {
  const isAmber = streak >= 3;

  return (
    <div className="w-full space-y-1 px-0">
      {/* Label row */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Bar track */}
      <div className="h-2 bg-[#f0f0f0] dark:bg-[#222]">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors duration-500",
            isAmber
              ? "bg-amber-400"
              : "bg-primary"
          )}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
