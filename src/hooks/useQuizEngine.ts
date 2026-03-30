'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type QuizQuestion } from '@/lib/quiz-types';

// Constants
const POINTS_PER_CORRECT = 100;
const STREAK_BONUS = 50;
const STREAK_THRESHOLD = 2;

export interface QuizEngineState {
  current: number;
  question: QuizQuestion;
  selected: number | null;
  answerState: 'idle' | 'correct' | 'wrong';
  score: number;
  streak: number;
  results: boolean[];
  done: boolean;
  progress: number; // 0–100
  timeLeft: number;
  timerActive: boolean;
}

export interface QuizEngineActions {
  submitAnswer: (optionIndex: number) => void;
  advance: () => void;
  jumpTo: (index: number) => void;
  restart: () => void;
}

export function useQuizEngine(
  questions: QuizQuestion[],
  options?: { timerEnabled?: boolean; timerSeconds?: number }
): QuizEngineState & QuizEngineActions {
  const timerEnabled = options?.timerEnabled ?? false;
  const timerSeconds = options?.timerSeconds ?? 30;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [timerActive, setTimerActive] = useState(timerEnabled);

  // Refs to avoid stale closures in the timer callback
  const answerStateRef = useRef(answerState);
  const doneRef = useRef(done);
  const timerActiveRef = useRef(timerActive);
  const timeLeftRef = useRef(timeLeft);

  answerStateRef.current = answerState;
  doneRef.current = done;
  timerActiveRef.current = timerActive;
  timeLeftRef.current = timeLeft;

  // submitAnswer ref so the timer can call the latest version
  const submitAnswerRef = useRef<(optionIndex: number) => void>(() => {});

  const submitAnswer = useCallback(
    (optionIndex: number) => {
      // Guard: no-op if not idle
      if (answerStateRef.current !== 'idle') return;

      const isCorrect =
        optionIndex !== -1 && optionIndex === questions[current]?.correct;

      setSelected(optionIndex);
      setTimerActive(false);
      setAnswerState(isCorrect ? 'correct' : 'wrong');
      setResults((prev) => [...prev, isCorrect]);

      if (isCorrect) {
        // Read current streak from ref to compute bonus synchronously
        const newStreak = streak + 1;
        const bonus = newStreak >= STREAK_THRESHOLD ? STREAK_BONUS : 0;
        setScore((s) => s + POINTS_PER_CORRECT + bonus);
        setStreak(newStreak);
      } else {
        setStreak(0);
      }
    },
    [current, questions, streak]
  );

  // Keep submitAnswerRef in sync
  submitAnswerRef.current = submitAnswer;

  const advance = useCallback(() => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswerState('idle');
      setTimeLeft(timerSeconds);
      setTimerActive(timerEnabled);
    }
  }, [current, questions.length, timerEnabled, timerSeconds]);

  const jumpTo = useCallback(
    (index: number) => {
      // Guard: ignore forward jumps
      if (index > current) return;
      setCurrent(index);
      setSelected(null);
      setAnswerState('idle');
    },
    [current]
  );

  const restart = useCallback(() => {
    setCurrent(0);
    setSelected(null);
    setAnswerState('idle');
    setScore(0);
    setStreak(0);
    setResults([]);
    setDone(false);
    setTimeLeft(timerSeconds);
    setTimerActive(timerEnabled);
  }, [timerEnabled, timerSeconds]);

  // Countdown timer via setTimeout loop
  useEffect(() => {
    if (!timerEnabled || !timerActive || done) return;

    const tick = () => {
      if (!timerActiveRef.current || doneRef.current) return;

      const next = timeLeftRef.current - 1;
      if (next <= 0) {
        setTimeLeft(0);
        submitAnswerRef.current(-1);
      } else {
        setTimeLeft(next);
        timeoutId = setTimeout(tick, 1000);
      }
    };

    let timeoutId = setTimeout(tick, 1000);
    return () => clearTimeout(timeoutId);
  }, [timerEnabled, timerActive, done, current]); // re-run when question changes or timer reactivates

  const progress = questions.length > 0 ? (current / questions.length) * 100 : 0;

  // Fallback question for empty array edge case
  const question = questions[current] ?? questions[0];

  return {
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
    timerActive,
    submitAnswer,
    advance,
    jumpTo,
    restart,
  };
}
