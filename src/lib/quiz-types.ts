// Quiz system shared types and validation utilities

export type BadgeLevel = 'gold' | 'silver' | 'bronze' | 'none';

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: number; // index of correct option
  explanation?: string;
  points?: number; // per-question points (default 100)
};

export type QuizResult = {
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  badge: BadgeLevel;
  results: boolean[];
  timeTaken?: number; // seconds
};

export type QuizConfig = {
  questions: QuizQuestion[];
  totalPoints: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
};

/**
 * Validates and parses an unknown value as a QuizConfig.
 * Throws a descriptive error for any malformed data.
 *
 * Rules:
 * - questions must be a non-empty array
 * - each question must have >= 2 options
 * - correct must be a valid index within options
 * - timerSeconds (if provided) must be between 10 and 300 inclusive
 * - points defaults to 100 if omitted
 */
export function validateQuizConfig(config: unknown): QuizConfig {
  if (typeof config !== 'object' || config === null) {
    throw new Error('QuizConfig must be a non-null object');
  }

  const raw = config as Record<string, unknown>;

  // Validate questions field
  if (!Array.isArray(raw.questions)) {
    throw new Error('QuizConfig.questions must be an array');
  }

  if (raw.questions.length === 0) {
    throw new Error('QuizConfig.questions must not be empty');
  }

  const questions: QuizQuestion[] = raw.questions.map((q: unknown, i: number) => {
    if (typeof q !== 'object' || q === null) {
      throw new Error(`Question at index ${i} must be a non-null object`);
    }

    const qRaw = q as Record<string, unknown>;

    if (typeof qRaw.id !== 'number') {
      throw new Error(`Question at index ${i} must have a numeric id`);
    }

    if (typeof qRaw.question !== 'string' || qRaw.question.trim() === '') {
      throw new Error(`Question at index ${i} must have a non-empty question string`);
    }

    if (!Array.isArray(qRaw.options)) {
      throw new Error(`Question at index ${i} must have an options array`);
    }

    if (qRaw.options.length < 2) {
      throw new Error(`Question at index ${i} must have at least 2 options`);
    }

    if (typeof qRaw.correct !== 'number') {
      throw new Error(`Question at index ${i} must have a numeric correct index`);
    }

    if (qRaw.correct < 0 || qRaw.correct >= qRaw.options.length) {
      throw new Error(
        `Question at index ${i} has correct index ${qRaw.correct} which is out of range for ${qRaw.options.length} options`
      );
    }

    const points =
      qRaw.points === undefined || qRaw.points === null
        ? 100
        : qRaw.points;

    if (typeof points !== 'number' || points < 0) {
      throw new Error(`Question at index ${i} has invalid points value`);
    }

    return {
      id: qRaw.id as number,
      question: qRaw.question as string,
      options: qRaw.options as string[],
      correct: qRaw.correct as number,
      ...(qRaw.explanation !== undefined && { explanation: qRaw.explanation as string }),
      points,
    };
  });

  // Validate timerSeconds if provided
  if (raw.timerSeconds !== undefined && raw.timerSeconds !== null) {
    if (typeof raw.timerSeconds !== 'number') {
      throw new Error('QuizConfig.timerSeconds must be a number');
    }
    if (raw.timerSeconds < 10 || raw.timerSeconds > 300) {
      throw new Error(
        `QuizConfig.timerSeconds must be between 10 and 300 inclusive, got ${raw.timerSeconds}`
      );
    }
  }

  const totalPoints =
    typeof raw.totalPoints === 'number'
      ? raw.totalPoints
      : questions.reduce((sum, q) => sum + (q.points ?? 100), 0);

  return {
    questions,
    totalPoints,
    ...(raw.timerEnabled !== undefined && { timerEnabled: Boolean(raw.timerEnabled) }),
    ...(raw.timerSeconds !== undefined &&
      raw.timerSeconds !== null && { timerSeconds: raw.timerSeconds as number }),
  };
}

/**
 * Derives a BadgeLevel from a quiz result.
 * Pure function — same inputs always produce the same output.
 *
 * ≥ 90% → 'gold'
 * ≥ 70% → 'silver'
 * ≥ 50% → 'bronze'
 * <  50% → 'none'
 */
export function deriveBadge(correctCount: number, totalQuestions: number): BadgeLevel {
  if (totalQuestions <= 0) return 'none';

  const pct = (correctCount / totalQuestions) * 100;

  if (pct >= 90) return 'gold';
  if (pct >= 70) return 'silver';
  if (pct >= 50) return 'bronze';
  return 'none';
}
