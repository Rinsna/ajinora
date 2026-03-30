# Requirements Document

## Introduction

The Interactive Quiz System is a gamified, modal-based quiz player for the Ajinora LMS. It replaces the existing basic `QuizPlayer.tsx` with a fully-featured experience including animated question cards, instant feedback, streak/points gamification, a countdown timer, question navigation, and a rich completion screen with badge awards. The system is triggered when a student clicks a quiz, puzzle, or exercise asset on the course page, and integrates with the existing `module_assets` data model and admin `QuizBuilder`.

---

## Glossary

- **QuizPlayer**: The root modal component that renders the full quiz experience for a student.
- **QuizEngine**: The `useQuizEngine` custom hook that manages all quiz state and logic.
- **QuizQuestion**: A single multiple-choice question with options, a correct answer index, and an optional explanation.
- **QuizConfig**: The JSON structure stored in `module_assets.details` that defines a quiz's questions and settings.
- **QuizResult**: The final result object produced at quiz completion, containing score, percentage, badge, and per-question results.
- **BadgeLevel**: One of four award levels derived from quiz percentage: `gold`, `silver`, `bronze`, or `none`.
- **ProgressBar**: The animated top bar showing quiz completion percentage.
- **QuestionCard**: The component displaying the current question text and MCQ option grid.
- **FeedbackBanner**: The slide-up banner shown after an answer is selected, displaying correctness and explanation.
- **NavigationPanel**: The horizontal scrollable row of numbered question buttons showing answered/unanswered/current state.
- **CompletionScreen**: The full-screen result view shown when all questions have been answered.
- **StreakBurst**: The floating toast animation shown when a student achieves a streak of 2 or more consecutive correct answers.
- **CoursePage**: The student-facing course page (`src/app/student/course/page.tsx`) that hosts the QuizPlayer modal.
- **POINTS_PER_CORRECT**: The base points awarded for a correct answer (100 points).
- **STREAK_BONUS**: The bonus points awarded when streak ≥ 2 (50 points).
- **STREAK_THRESHOLD**: The minimum streak count to trigger a bonus (2).

---

## Requirements

### Requirement 1: Quiz Modal Launch

**User Story:** As a student, I want to launch a quiz from the course page, so that I can test my knowledge on course material.

#### Acceptance Criteria

1. WHEN a student clicks a quiz, puzzle, or exercise asset on the CoursePage, THE QuizPlayer SHALL open as a full-screen modal overlay with backdrop blur.
2. WHEN the QuizPlayer modal opens, THE QuizEngine SHALL initialize with the first question active, score set to 0, streak set to 0, and the timer set to the configured duration.
3. WHEN the QuizPlayer is open, THE QuizPlayer SHALL display the quiz title, current score, a close button, the ProgressBar, the NavigationPanel, and the QuestionCard.
4. WHEN the student clicks the close button, THE QuizPlayer SHALL close the modal and invoke the `onClose` callback.

---

### Requirement 2: Answer Submission and Scoring

**User Story:** As a student, I want to select an answer and receive immediate feedback, so that I can learn whether my response was correct.

#### Acceptance Criteria

1. WHEN a student selects an answer option, THE QuizEngine SHALL evaluate correctness and set `answerState` to `'correct'` or `'wrong'`.
2. WHEN a correct answer is selected, THE QuizEngine SHALL increase `score` by `POINTS_PER_CORRECT` plus any applicable streak bonus.
3. WHEN a correct answer is selected and the current streak is 2 or more, THE QuizEngine SHALL add `STREAK_BONUS` points to the score increment.
4. WHEN a wrong answer is selected, THE QuizEngine SHALL reset `streak` to 0.
5. WHEN `answerState` is not `'idle'`, THE QuizEngine SHALL ignore any subsequent `submitAnswer` call for the same question.
6. WHEN an answer is submitted, THE QuizEngine SHALL set `timerActive` to `false`.
7. WHEN an answer is submitted, THE QuizPlayer SHALL display the FeedbackBanner showing whether the answer was correct or wrong, and the optional explanation.

---

### Requirement 3: Countdown Timer

**User Story:** As a student, I want a countdown timer per question, so that the quiz remains engaging and time-bounded.

#### Acceptance Criteria

1. WHILE `timerActive` is `true` and `answerState` is `'idle'`, THE QuizEngine SHALL decrement `timeLeft` by 1 each second.
2. WHEN `timeLeft` reaches 0, THE QuizEngine SHALL automatically call `submitAnswer(-1)`, treating the question as wrong.
3. WHEN `timeLeft` is 10 or fewer seconds, THE QuizPlayer SHALL display the timer with a pulsing red style to alert the student.
4. WHERE `timerEnabled` is `false`, THE QuizEngine SHALL not start the countdown timer.

---

### Requirement 4: Question Navigation and Advancement

**User Story:** As a student, I want to move through quiz questions and review answered ones, so that I can manage my quiz progress.

#### Acceptance Criteria

1. WHEN a student clicks the Next button after answering, THE QuizEngine SHALL advance to the next question, reset `answerState` to `'idle'`, clear `selected`, and reset the timer.
2. WHEN `advance()` is called on the last question, THE QuizEngine SHALL set `done` to `true` instead of advancing.
3. WHEN `jumpTo(i)` is called with `i` less than or equal to `current`, THE QuizEngine SHALL navigate to question `i` and reset `answerState` to `'idle'`.
4. WHEN `jumpTo(i)` is called with `i` greater than `current`, THE QuizEngine SHALL ignore the call.
5. THE NavigationPanel SHALL display one button per question, styled to reflect answered-correct, answered-wrong, current, or unanswered state.

---

### Requirement 5: Gamification — Streaks and Points

**User Story:** As a student, I want to earn points and streak bonuses for consecutive correct answers, so that I stay motivated during the quiz.

#### Acceptance Criteria

1. WHEN a student answers correctly, THE QuizEngine SHALL increment `streak` by 1.
2. WHEN a student answers incorrectly, THE QuizEngine SHALL reset `streak` to 0.
3. WHEN `streak` reaches `STREAK_THRESHOLD` or higher, THE QuizPlayer SHALL display the StreakBurst animation showing the streak count and bonus points.
4. THE ProgressBar SHALL shift color to amber when `streak` is 3 or more.
5. THE QuizPlayer SHALL display the current score in the header at all times during the quiz.

---

### Requirement 6: Completion Screen and Badge Award

**User Story:** As a student, I want to see my final score and a badge when I finish a quiz, so that I feel rewarded for my performance.

#### Acceptance Criteria

1. WHEN `done` is `true`, THE QuizPlayer SHALL display the CompletionScreen instead of the QuestionCard.
2. THE CompletionScreen SHALL display the final score, percentage correct, correct count out of total, and a result dot for each question.
3. WHEN percentage is 90 or above, THE QuizEngine SHALL derive `badge` as `'gold'`.
4. WHEN percentage is 70 or above and below 90, THE QuizEngine SHALL derive `badge` as `'silver'`.
5. WHEN percentage is 50 or above and below 70, THE QuizEngine SHALL derive `badge` as `'bronze'`.
6. WHEN percentage is below 50, THE QuizEngine SHALL derive `badge` as `'none'`.
7. WHEN the student clicks Retry, THE QuizEngine SHALL reset all state to initial values and restart the quiz from question 1.
8. WHEN the student clicks Done, THE QuizPlayer SHALL close the modal and invoke the `onClose` callback.
9. WHEN `onComplete` is provided, THE QuizPlayer SHALL invoke `onComplete` with a `QuizResult` object upon quiz completion.

---

### Requirement 7: Keyboard Shortcuts

**User Story:** As a student, I want to use keyboard shortcuts during the quiz, so that I can navigate efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN the student presses a digit key (1–4) and `answerState` is `'idle'`, THE QuizPlayer SHALL call `submitAnswer` with the corresponding zero-based option index.
2. WHEN the student presses Enter and `answerState` is not `'idle'`, THE QuizPlayer SHALL call `advance()`.
3. WHEN the student presses Escape, THE QuizPlayer SHALL close the modal and invoke `onClose`.

---

### Requirement 8: Error Handling and Edge Cases

**User Story:** As a student, I want the quiz to handle invalid or missing data gracefully, so that I never encounter a crash or broken state.

#### Acceptance Criteria

1. IF the `questions` array is empty, THEN THE QuizPlayer SHALL display an error state card with a descriptive message instead of rendering the quiz.
2. IF the `module_assets.details` JSON is malformed or missing the `questions` field, THEN THE QuizPlayer SHALL display an error state card instead of crashing.
3. IF `submitAnswer` is called while `answerState` is not `'idle'`, THEN THE QuizEngine SHALL treat the call as a no-op and preserve existing state.
4. IF `jumpTo` is called with an index greater than `current`, THEN THE QuizEngine SHALL ignore the call and preserve existing state.

---

### Requirement 9: Quiz Data Validation

**User Story:** As an admin, I want quiz data to be validated before it is presented to students, so that students never encounter a broken quiz.

#### Acceptance Criteria

1. THE QuizConfig SHALL require the `questions` field to be a non-empty array.
2. THE QuizConfig SHALL require each `QuizQuestion` to have at least 2 options.
3. THE QuizConfig SHALL require the `correct` field of each `QuizQuestion` to be a valid index within the `options` array.
4. WHERE `timerSeconds` is provided, THE QuizConfig SHALL require it to be between 10 and 300 inclusive.
5. WHERE `points` is omitted from a `QuizQuestion`, THE QuizEngine SHALL default it to 100.

---

### Requirement 10: Animation and Visual Feedback

**User Story:** As a student, I want smooth animations and clear visual feedback throughout the quiz, so that the experience feels polished and engaging.

#### Acceptance Criteria

1. WHEN advancing to the next question, THE QuizPlayer SHALL animate the QuestionCard with a slide-and-fade transition (exit left, enter right for forward direction).
2. WHEN the CompletionScreen appears, THE QuizPlayer SHALL animate the score ring with a spring entrance animation.
3. WHEN an answer is selected, THE QuizPlayer SHALL immediately highlight the selected option and the correct option with distinct color styles.
4. THE ProgressBar SHALL animate smoothly to reflect the current completion percentage as questions are answered.
