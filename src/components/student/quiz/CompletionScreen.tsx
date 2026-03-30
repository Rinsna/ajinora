"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type BadgeLevel } from "@/lib/quiz-types";

interface CompletionScreenProps {
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  results: boolean[];
  badge: BadgeLevel;
  onRetry: () => void;
  onClose: () => void;
  rank?: number;
}

const BADGE_CONFIG: Record<
  BadgeLevel,
  { emoji: string; label: string; color: string }
> = {
  gold: {
    emoji: "🏆",
    label: "Gold — Outstanding!",
    color: "text-amber-500",
  },
  silver: {
    emoji: "🥈",
    label: "Silver — Great job!",
    color: "text-slate-400",
  },
  bronze: {
    emoji: "🥉",
    label: "Bronze — Good effort!",
    color: "text-orange-400",
  },
  none: {
    emoji: "💪",
    label: "Keep practising!",
    color: "text-[#a1a1a1]",
  },
};

// SVG score ring constants
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CompletionScreen({
  score,
  totalPoints,
  correctCount,
  totalQuestions,
  results,
  badge,
  onRetry,
  onClose,
  rank,
}: CompletionScreenProps) {
  const pct =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

  const dashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  const badgeCfg = BADGE_CONFIG[badge];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 overflow-y-auto scrollbar-none"
    >
      {/* Animated score ring */}
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" className="-rotate-90">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-[#f0f0f0] dark:text-[#222]"
          />
          {/* Progress arc */}
          <motion.circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.15 }}
            className={cn(
              pct >= 90
                ? "text-amber-400"
                : pct >= 70
                ? "text-primary"
                : pct >= 50
                ? "text-blue-400"
                : "text-red-400"
            )}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tighter text-[#37352f] dark:text-white">
            {pct}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-4xl">{badgeCfg.emoji}</span>
          <span className={cn("text-sm font-black text-center whitespace-nowrap", badgeCfg.color)}>
            {badgeCfg.label}
          </span>
        </motion.div>

        {rank && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.6 }}
            className="bg-primary/10 px-6 py-3 rounded-2xl border-2 border-primary/20 shadow-xl shadow-primary/5"
          >
             <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Institutional Rank</p>
             <p className="text-2xl font-black text-primary leading-none mt-1">#{rank}</p>
          </motion.div>
        )}
      </div>

      {/* Score and count */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-1"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">
          {correctCount} / {totalQuestions} correct
        </p>
        <p className="text-sm font-black text-amber-600 dark:text-amber-400">
          {score} / {totalPoints} pts
        </p>
      </motion.div>

      {/* Result dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-2 flex-wrap justify-center max-w-xs"
      >
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 * i + 0.4, type: "spring", stiffness: 300 }}
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white",
              r ? "bg-green-500" : "bg-red-400"
            )}
          >
            {i + 1}
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 w-full max-w-xs"
      >
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex-1 h-12 font-black uppercase tracking-widest text-xs rounded-2xl gap-2 border-2"
        >
          <RotateCcw size={14} /> Retry
        </Button>
        <Button
          onClick={onClose}
          className="flex-1 h-12 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white rounded-2xl"
        >
          Done
        </Button>
      </motion.div>
    </motion.div>
  );
}
