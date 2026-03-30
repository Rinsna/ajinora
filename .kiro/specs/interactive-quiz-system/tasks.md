# Implementation Plan: Interactive Quiz System

## Overview

Replace the existing basic `QuizPlayer.tsx` with a fully-featured, gamified quiz experience. The work is broken into: types and validation, the `useQuizEngine` hook, sub-components, the enhanced `QuizPlayer` modal, and finally wiring the modal into the course page.

## Tasks

- [x] 1. Define shared types and validation utilities
  - Create `src/lib/quiz-types.ts` with `QuizQuestion`, `QuizResult`, `QuizConfig`, and `BadgeLevel` types
  - Implement `validateQuizConfig(config: unknown): QuizConfig` that throws a descriptive error for malformed data (empty questions, invalid correct index, out-of-range timerSeconds)
  - Implement `deriveBadge(correctCount: number, totalQuestions: number): BadgeLevel` as a pure function
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 1.1 Write property test for `deriveBadge`
    - **Property 5: Badge derivation is a pure function**
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**
    - Use `fast-check` to assert output is always one of the four valid `BadgeLevel` values for any `0 ≤ correctCount ≤ totalQuestions`

- [x] 2. Implement `useQuizEngine` custom hook
  - Create `src/hooks/useQuizEngine.ts`
  - Implement all state: `current`, `selected`, `answerState`, `score`, `streak`, `results`, `done`, `timeLeft`, `timerActive`, `progress`
  - Implement `submitAnswer(optionIndex)` with `answerState === 'idle'` guard, correct/wrong branching, streak increment/reset, and score calculation including `STREAK_BONUS`
  - Implement `advance()` — increments `current` or sets `done: true` on last question, resets per-question state and timer
  - Implement `jumpTo(index)` — only navigates to `index ≤ current`, ignores forward jumps
  - Implement `restart()` — resets all state to initial values
  - Implement countdown timer via `setTimeout` loop that calls `submitAnswer(-1)` on expiry when `timerEnabled` is true
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.7, 8.3, 8.4_

  - [ ]* 2.1 Write property test for completion invariant
    - **Property 1: Completion invariant**
    - **Validates: Requirements 4.2, 6.1**
    - Use `fast-check` to assert `results.length === questions.length` whenever `done === true`

  - [ ]* 2.2 Write property test for score monotonicity
    - **Property 2: Score monotonicity**
    - **Validates: Requirements 2.2, 2.3**
    - Use `fast-check` to assert `score` never decreases across any sequence of answer submissions

  - [ ]* 2.3 Write property test for streak reset on wrong answer
    - **Property 3: Streak reset on wrong answer**
    - **Validates: Requirements 2.4, 5.2**
    - Use `fast-check` to assert submitting a wrong answer always resets `streak` to 0 regardless of prior streak value

  - [ ]* 2.4 Write property test for `submitAnswer` idempotency guard
    - **Property 4: submitAnswer idempotency guard**
    - **Validates: Requirements 2.5, 8.3**
    - Use `fast-check` to assert calling `submitAnswer` a second time when `answerState !== 'idle'` leaves score, streak, results, and answerState unchanged

  - [ ]* 2.5 Write property test for `jumpTo` forward-skip guard
    - **Property 6: jumpTo forward-skip guard**
    - **Validates: Requirements 4.4, 8.4**
    - Use `fast-check` to assert `jumpTo(i)` with `i > current` leaves `current`, `answerState`, and `selected` unchanged

  - [ ]* 2.6 Write property test for restart round-trip
    - **Property 7: Restart round-trip**
    - **Validates: Requirements 6.7**
    - Use `fast-check` to assert `restart()` produces state identical to initial `useQuizEngine` state for any quiz

  - [ ]* 2.7 Write property test for score arithmetic correctness
    - **Property 8: Score arithmetic correctness**
    - **Validates: Requirements 2.2, 2.3, 5.1**
    - Use `fast-check` to assert final score equals `N * POINTS_PER_CORRECT + sum(STREAK_BONUS for each answer where newStreak ≥ STREAK_THRESHOLD)`

  - [ ]* 2.8 Write property test for timer auto-submit on expiry
    - **Property 9: Timer auto-submit on expiry**
    - **Validates: Requirements 3.2, 3.1**
    - Use `fast-check` to assert that when `timeLeft` reaches 0 while `answerState === 'idle'`, `answerState` becomes `'wrong'` and `timerActive` becomes `false`

- [x] 3. Checkpoint — Ensure all hook tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement sub-components
  - [x] 4.1 Implement `ProgressBar` component
    - Create `src/components/student/quiz/ProgressBar.tsx`
    - Animate width to `progress` percent using Framer Motion
    - Shift bar color to amber when `streak ≥ 3`
    - _Requirements: 5.4, 10.4_

  - [x] 4.2 Implement `NavigationPanel` component
    - Create `src/components/student/quiz/NavigationPanel.tsx`
    - Render one button per question; style each as answered-correct (green), answered-wrong (red), current (primary), or unanswered (neutral)
    - Call `onJump(i)` on click; forward-jump prevention is enforced by `useQuizEngine`
    - _Requirements: 4.3, 4.5_

  - [x] 4.3 Implement `QuestionCard` and `FeedbackBanner` components
    - Create `src/components/student/quiz/QuestionCard.tsx` — renders question text and MCQ option grid with correct/wrong/idle styling
    - Create `src/components/student/quiz/FeedbackBanner.tsx` — slide-up banner showing correct/wrong label, explanation, and points earned
    - Wrap `QuestionCard` in `AnimatePresence` with `key={current}` for slide-and-fade transition (exit left, enter right)
    - _Requirements: 2.7, 10.1, 10.3_

  - [x] 4.4 Implement `CompletionScreen` component
    - Create `src/components/student/quiz/CompletionScreen.tsx`
    - Render animated score ring (spring entrance), badge display, correct count, percentage, result dots, Retry and Done buttons
    - _Requirements: 6.1, 6.2, 10.2_

  - [x] 4.5 Implement `StreakBurst` component (enhanced)
    - Update `StreakBurst` inside `QuizPlayer.tsx` to accept `bonusPoints` prop and use Framer Motion spring
    - Display streak count and bonus points; only render when `streak ≥ 2`
    - _Requirements: 5.3_

- [x] 5. Rewrite `QuizPlayer` modal
  - Replace the contents of `src/components/student/QuizPlayer.tsx` with the enhanced implementation
  - Accept the full `QuizPlayerProps` interface (`title`, `questions`, `quizType`, `timerEnabled`, `timerSeconds`, `onClose`, `onComplete`)
  - Compose `ProgressBar`, `NavigationPanel`, `QuestionCard`, `FeedbackBanner`, `CompletionScreen`, and `StreakBurst` using `useQuizEngine`
  - Render full-screen modal overlay with backdrop blur; show error state card when `questions` is empty or config is invalid
  - Attach keyboard handler: digit keys 1–4 → `submitAnswer`, Enter → `advance`, Escape → `onClose`
  - Call `onComplete` with a `QuizResult` object when `done` becomes `true`
  - Display timer with pulsing red style when `timeLeft ≤ 10`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.3, 7.1, 7.2, 7.3, 8.1, 8.2, 9.5_

  - [ ]* 5.1 Write unit tests for `QuizPlayer` integration
    - Render `QuizPlayer` with mock questions; simulate full quiz flow (select → next → completion screen)
    - Verify `onComplete` receives correct `QuizResult` shape
    - Verify `onClose` fires on Escape key and close button click
    - Verify NavigationPanel dots update as questions are answered
    - _Requirements: 1.4, 6.9, 7.3_

- [x] 6. Wire `QuizPlayer` into the course page
  - In `src/app/student/course/page.tsx`, add `quizAsset` state and a `handleAssetClick` function
  - For asset types `quiz`, `puzzle`, and `exercise`: call `setQuizAsset(asset)` instead of `setActiveAsset(asset)`
  - Parse `quizAsset.details` JSON and pass `questions` to `QuizPlayer`; handle JSON parse errors by showing an inline error toast
  - Render `<QuizPlayer>` as a conditional overlay when `quizAsset` is set; pass `onClose={() => setQuizAsset(null)}`
  - _Requirements: 1.1, 8.2_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check`; unit/integration tests use React Testing Library
- No new npm dependencies are required — `framer-motion`, `lucide-react`, `tailwindcss`, and `clsx`/`tailwind-merge` are already installed
- Correct answer indices remain client-side (acceptable for learning quizzes; formal exams use the separate `/student/exams` server-validated flow)
