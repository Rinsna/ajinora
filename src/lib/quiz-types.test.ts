import { deriveBadge, validateQuizConfig, QuizConfig } from './quiz-types';

// ---------------------------------------------------------------------------
// deriveBadge
// ---------------------------------------------------------------------------

describe('deriveBadge', () => {
  it('returns gold for 100% (10/10)', () => {
    expect(deriveBadge(10, 10)).toBe('gold');
  });

  it('returns gold at exactly 90% (9/10)', () => {
    expect(deriveBadge(9, 10)).toBe('gold');
  });

  it('returns silver just below 90% (8/10 = 80%)', () => {
    expect(deriveBadge(8, 10)).toBe('silver');
  });

  it('returns silver at exactly 70% (7/10)', () => {
    expect(deriveBadge(7, 10)).toBe('silver');
  });

  it('returns bronze just below 70% (6/10 = 60%)', () => {
    expect(deriveBadge(6, 10)).toBe('bronze');
  });

  it('returns bronze at exactly 50% (5/10)', () => {
    expect(deriveBadge(5, 10)).toBe('bronze');
  });

  it('returns none just below 50% (4/10 = 40%)', () => {
    expect(deriveBadge(4, 10)).toBe('none');
  });

  it('returns none for 0% (0/10)', () => {
    expect(deriveBadge(0, 10)).toBe('none');
  });

  it('returns none when totalQuestions is 0 (guard)', () => {
    expect(deriveBadge(0, 0)).toBe('none');
  });

  it('is a pure function — same inputs always produce same output', () => {
    expect(deriveBadge(9, 10)).toBe(deriveBadge(9, 10));
    expect(deriveBadge(3, 10)).toBe(deriveBadge(3, 10));
  });
});

// ---------------------------------------------------------------------------
// validateQuizConfig — valid inputs
// ---------------------------------------------------------------------------

const minimalQuestion = {
  id: 1,
  question: 'What is 2 + 2?',
  options: ['3', '4'],
  correct: 1,
};

const validConfig = {
  questions: [minimalQuestion],
  totalPoints: 100,
};

describe('validateQuizConfig — valid inputs', () => {
  it('accepts a minimal valid config', () => {
    const result = validateQuizConfig(validConfig);
    expect(result.questions).toHaveLength(1);
    expect(result.totalPoints).toBe(100);
  });

  it('defaults points to 100 when omitted from a question', () => {
    const result = validateQuizConfig(validConfig);
    expect(result.questions[0].points).toBe(100);
  });

  it('preserves explicit points value', () => {
    const config = {
      questions: [{ ...minimalQuestion, points: 200 }],
      totalPoints: 200,
    };
    const result = validateQuizConfig(config);
    expect(result.questions[0].points).toBe(200);
  });

  it('accepts timerSeconds at lower boundary (10)', () => {
    const config = { ...validConfig, timerSeconds: 10 };
    const result = validateQuizConfig(config);
    expect(result.timerSeconds).toBe(10);
  });

  it('accepts timerSeconds at upper boundary (300)', () => {
    const config = { ...validConfig, timerSeconds: 300 };
    const result = validateQuizConfig(config);
    expect(result.timerSeconds).toBe(300);
  });

  it('accepts timerSeconds in the middle of the range', () => {
    const config = { ...validConfig, timerSeconds: 30 };
    const result = validateQuizConfig(config);
    expect(result.timerSeconds).toBe(30);
  });

  it('accepts a question with an optional explanation', () => {
    const config = {
      questions: [{ ...minimalQuestion, explanation: 'Because math.' }],
      totalPoints: 100,
    };
    const result = validateQuizConfig(config);
    expect(result.questions[0].explanation).toBe('Because math.');
  });

  it('accepts multiple questions', () => {
    const config = {
      questions: [
        minimalQuestion,
        { id: 2, question: 'Capital of France?', options: ['Berlin', 'Paris', 'Rome'], correct: 1 },
      ],
      totalPoints: 200,
    };
    const result = validateQuizConfig(config);
    expect(result.questions).toHaveLength(2);
  });

  it('returns a QuizConfig with the correct shape', () => {
    const result: QuizConfig = validateQuizConfig(validConfig);
    expect(Array.isArray(result.questions)).toBe(true);
    expect(typeof result.totalPoints).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// validateQuizConfig — invalid inputs
// ---------------------------------------------------------------------------

describe('validateQuizConfig — invalid inputs', () => {
  it('throws when config is null', () => {
    expect(() => validateQuizConfig(null)).toThrow();
  });

  it('throws when config is a string', () => {
    expect(() => validateQuizConfig('bad')).toThrow();
  });

  it('throws when questions is missing', () => {
    expect(() => validateQuizConfig({ totalPoints: 100 })).toThrow(/questions/i);
  });

  it('throws when questions is not an array', () => {
    expect(() => validateQuizConfig({ questions: 'not-array', totalPoints: 100 })).toThrow(/questions/i);
  });

  it('throws when questions array is empty', () => {
    expect(() => validateQuizConfig({ questions: [], totalPoints: 0 })).toThrow(/empty/i);
  });

  it('throws when a question has fewer than 2 options', () => {
    const config = {
      questions: [{ id: 1, question: 'Q?', options: ['Only one'], correct: 0 }],
      totalPoints: 100,
    };
    expect(() => validateQuizConfig(config)).toThrow(/at least 2 options/i);
  });

  it('throws when correct index is negative', () => {
    const config = {
      questions: [{ id: 1, question: 'Q?', options: ['A', 'B'], correct: -1 }],
      totalPoints: 100,
    };
    expect(() => validateQuizConfig(config)).toThrow(/out of range/i);
  });

  it('throws when correct index equals options.length (out of bounds)', () => {
    const config = {
      questions: [{ id: 1, question: 'Q?', options: ['A', 'B'], correct: 2 }],
      totalPoints: 100,
    };
    expect(() => validateQuizConfig(config)).toThrow(/out of range/i);
  });

  it('throws when timerSeconds is below 10', () => {
    const config = { ...validConfig, timerSeconds: 9 };
    expect(() => validateQuizConfig(config)).toThrow(/10 and 300/i);
  });

  it('throws when timerSeconds is above 300', () => {
    const config = { ...validConfig, timerSeconds: 301 };
    expect(() => validateQuizConfig(config)).toThrow(/10 and 300/i);
  });

  it('throws when timerSeconds is 0', () => {
    const config = { ...validConfig, timerSeconds: 0 };
    expect(() => validateQuizConfig(config)).toThrow(/10 and 300/i);
  });

  it('throws with a descriptive message mentioning the question index', () => {
    const config = {
      questions: [
        minimalQuestion,
        { id: 2, question: 'Q2?', options: ['A'], correct: 0 }, // only 1 option
      ],
      totalPoints: 200,
    };
    expect(() => validateQuizConfig(config)).toThrow(/index 1/i);
  });
});
