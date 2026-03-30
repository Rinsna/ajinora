"use client";

import { cn } from "@/lib/utils";

interface NavigationPanelProps {
  total: number;
  current: number;
  results: (boolean | null)[];
  onJump: (index: number) => void;
}

export default function NavigationPanel({
  total,
  current,
  results,
  onJump,
}: NavigationPanelProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none px-6 py-3 shrink-0">
      <div className="flex gap-2 min-w-max">
        {Array.from({ length: total }, (_, i) => {
          const result = results[i];
          const isCurrent = i === current;
          const isCorrect = result === true;
          const isWrong = result === false;

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`Go to question ${i + 1}`}
              className={cn(
                "h-8 w-8 rounded-xl text-[11px] font-black transition-all shrink-0 border-2",
                isCurrent && !isCorrect && !isWrong &&
                  "bg-primary/10 border-primary text-primary ring-2 ring-primary/30",
                isCurrent && isCorrect &&
                  "bg-green-500 border-green-500 text-white ring-2 ring-green-400/40",
                isCurrent && isWrong &&
                  "bg-red-500 border-red-500 text-white ring-2 ring-red-400/40",
                !isCurrent && isCorrect &&
                  "bg-green-500 border-green-500 text-white",
                !isCurrent && isWrong &&
                  "bg-red-400 border-red-400 text-white",
                (!isCurrent && (result === null || result === undefined)) &&
                  "bg-[#f0f0f0] dark:bg-[#222] border-[#e5e7eb] dark:border-[#2e2e2e] text-[#a1a1a1]"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
