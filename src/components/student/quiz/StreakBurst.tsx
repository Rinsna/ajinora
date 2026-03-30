"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakBurstProps {
  streak: number;
  bonusPoints: number;
}

export default function StreakBurst({ streak, bonusPoints }: StreakBurstProps) {
  if (streak < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="fixed top-24 right-6 z-[200] flex items-center gap-2 bg-amber-400 text-white px-4 py-2 rounded-2xl shadow-2xl shadow-amber-400/40 font-black text-sm uppercase tracking-widest"
      >
        <span className="animate-bounce">🔥</span>
        {streak} streak! +{bonusPoints} pts bonus
      </motion.div>
    </AnimatePresence>
  );
}
