# 🚀 Roadmap Assessment System - Frontend Integration Guide

## 📌 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Frontend Integration Steps](#frontend-integration-steps)
5. [Request/Response Examples](#requestresponse-examples)
6. [Sequential Validation Flow](#sequential-validation-flow)
7. [State Management Guidelines](#state-management-guidelines)
8. [UI/UX Recommendations](#uiux-recommendations)
9. [Error Handling](#error-handling)
10. [Testing Guide](#testing-guide)
11. [Mark as Done Validation (NEW)](#-mark-as-done-validation-new)

---

## 📖 Overview

### What Was Built

A **complete assessment system** for validating roadmap step completion with:

- ✅ **AI-Generated Questions** - Assessments auto-generated using Groq AI
- ✅ **Sequential Validation** - Users must complete steps in order
- ✅ **Assessment-Only Completion** - Steps only marked complete after passing assessment
- ✅ **Unlimited Retries** - Users can retry failed assessments
- ✅ **Progress Tracking** - View overall roadmap progress and attempt history
- ✅ **Completely Separate** - Independent from career recommendation assessment
- ✅ **Mark as Done Validation** - Manual marking requires passing assessment (NEW)

### Key Principles

1. **No Manual Completion** - Users cannot manually mark steps as complete
2. **Sequential Locking** - Step N requires Step N-1 completion
3. **Auto-Completion** - Passing assessment (≥70%) automatically marks step complete
4. **On-Demand Generation** - Questions generated first time requested (~5 seconds)
5. **Cached Forever** - Generated assessments stored in database

---

## 🏗️ System Architecture

### Database Tables

#### roadmap_assessments

Stores assessment questions for each roadmap step.

```sql
assessment_id       INT PRIMARY KEY
roadmap_id          INT (FK → career_roadmaps)
step_number         INT (1-10)
title               VARCHAR(255)
description         TEXT
questions           JSON (array of 10 questions)
passing_score       INT (default: 70)
time_limit_minutes  INT (default: 30)
is_active           BOOLEAN (default: true)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### user_roadmap_assessment_results

Stores user attempts and results.

```sql
result_id              INT PRIMARY KEY
user_id                INT (FK → users)
roadmap_assessment_id  INT (FK → roadmap_assessments)
score                  DECIMAL(5,2)
pass_fail_status       ENUM('pass', 'fail', 'in_progress')
attempt_count          INT
answers                JSON (user's submitted answers)
time_taken_seconds     INT
started_at             TIMESTAMP
completed_at           TIMESTAMP
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

### Question Format

Each assessment has exactly **10 multiple-choice questions** in this format:

```json
{
  "question_id": 1,
  "question": "What is the purpose of NumPy arrays in data science?",
  "options": [
    "To create web applications",
    "To perform efficient numerical computations",
    "To manage databases",
    "To create user interfaces"
  ],
  "correct_answer": 1,
  "explanation": "NumPy arrays are optimized for fast numerical operations..."
}
```

**Important**:

- `correct_answer` is **0-based index** (0, 1, 2, or 3)
- `options` is always an array of exactly 4 strings
- `explanation` is shown after submission

---

## 📡 API Endpoints Reference

### Base URL

```
http://localhost:5000/api/roadmap-assessment
```

### Authentication

All endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

---

### 1️⃣ Get Roadmap Progress

**Endpoint**: `GET /api/roadmap-assessment/:saved_career_id/progress`

**Purpose**: Get overall progress for a user's saved career with assessment status for all steps.

**Path Parameters**:

- `saved_career_id` (integer) - ID of user's saved career

**Response** (200 OK):

```json
{
  "career_name": "Data Scientist",
  "total_steps": 10,
  "completed_steps": 2,
  "progress_percentage": "20.0",
  "steps": [
    {
      "step_number": 1,
      "title": "Learn Programming and Statistics",
      "is_completed": true,
      "completed_at": "2025-12-28T10:00:00Z",
      "has_assessment": true,
      "assessment_passed": true,
      "is_locked": false
    },
    {
      "step_number": 2,
      "title": "Master Data Manipulation and SQL",
      "is_completed": true,
      "completed_at": "2025-12-28T12:00:00Z",
      "has_assessment": true,
      "assessment_passed": true,
      "is_locked": false
    },
    {
      "step_number": 3,
      "title": "Learn Machine Learning Basics",
      "is_completed": false,
      "completed_at": null,
      "has_assessment": true,
      "assessment_passed": false,
      "is_locked": false
    },
    {
      "step_number": 4,
      "title": "Master Data Visualization",
      "is_completed": false,
      "completed_at": null,
      "has_assessment": true,
      "assessment_passed": false,
      "is_locked": true
    }
  ]
}
```

**Frontend Usage**:

- Display progress bar: `completed_steps / total_steps`
- Show lock icon on steps where `is_locked: true`
- Disable "Take Assessment" button on locked steps
- Show completed badge on steps where `is_completed: true`

---

### 2️⃣ Get Step Assessment

**Endpoint**: `GET /api/roadmap-assessment/:saved_career_id/step/:step_number`

**Purpose**: Get assessment questions for a specific step. Auto-generates using AI if not exists.

**Path Parameters**:

- `saved_career_id` (integer) - ID of user's saved career
- `step_number` (integer) - Step number (1-10)

**Response** (200 OK):

```json
{
  "assessment_id": 123,
  "title": "Learn Machine Learning Basics Assessment",
  "description": "Test your understanding of: Understand fundamental ML algorithms...",
  "questions": [
    {
      "question_id": 1,
      "question": "What is the primary purpose of train-test split in machine learning?",
      "options": [
        "To make training faster",
        "To evaluate model performance on unseen data",
        "To reduce dataset size",
        "To clean the data"
      ],
      "correct_answer": 1,
      "explanation": "Train-test split separates data into training and testing sets..."
    },
    {
      "question_id": 2,
      "question": "Which algorithm is best for binary classification?",
      "options": [
        "Linear Regression",
        "Logistic Regression",
        "K-Means Clustering",
        "PCA"
      ],
      "correct_answer": 1,
      "explanation": "Logistic Regression is designed for binary classification problems."
    }
    // ... 8 more questions (total 10)
  ],
  "passing_score": 70,
  "time_limit_minutes": 30,
  "step_number": 3,
  "total_questions": 10,
  "has_passed": false,
  "attempt_count": 0,
  "best_score": null,
  "can_retake": true
}
```

**Response** (403 Forbidden - Step Locked):

```json
{
  "message": "Step 2 must be completed before accessing step 3 assessment",
  "locked": true,
  "required_step": 2
}
```

**Response** (404 Not Found):

```json
{
  "message": "Saved career not found or unauthorized"
}
```

**Frontend Usage**:

- First request may take ~5 seconds (AI generation)
- Store questions in state
- Hide `correct_answer` from user during assessment
- Display timer using `time_limit_minutes`
- Show attempt info: `attempt_count`, `best_score`

---

### 3️⃣ Submit Assessment

**Endpoint**: `POST /api/roadmap-assessment/:saved_career_id/step/:step_number/submit`

**Purpose**: Submit assessment answers and get results. Auto-completes step if passed.

**Path Parameters**:

- `saved_career_id` (integer) - ID of user's saved career
- `step_number` (integer) - Step number (1-10)

**Request Body**:

```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option": 1
    },
    {
      "question_id": 2,
      "selected_option": 2
    },
    {
      "question_id": 3,
      "selected_option": 0
    }
    // ... all 10 questions
  ],
  "time_taken_seconds": 1234
}
```

**Important**:

- `selected_option` is **0-based index** matching the option array
- Must include answers for **all 10 questions**
- `time_taken_seconds` is optional but recommended

**Response** (200 OK - Passed):

```json
{
  "result_id": 456,
  "score": 80.0,
  "passing_score": 70,
  "passed": true,
  "correct_answers": 8,
  "total_questions": 10,
  "attempt_number": 1,
  "step_completed": true,
  "message": "Congratulations! You passed with 80.0%. Step 3 is now complete.",
  "detailed_results": [
    {
      "question_id": 1,
      "question": "What is the primary purpose of train-test split?",
      "your_answer": 1,
      "correct_answer": 1,
      "is_correct": true,
      "explanation": "Train-test split separates data into training and testing sets..."
    },
    {
      "question_id": 2,
      "question": "Which algorithm is best for binary classification?",
      "your_answer": 2,
      "correct_answer": 1,
      "is_correct": false,
      "explanation": "Logistic Regression is designed for binary classification problems."
    }
    // ... all 10 questions with results
  ]
}
```

**Response** (200 OK - Failed):

```json
{
  "result_id": 457,
  "score": 60.0,
  "passing_score": 70,
  "passed": false,
  "correct_answers": 6,
  "total_questions": 10,
  "attempt_number": 2,
  "step_completed": false,
  "message": "You scored 60.0%. You need 70% to pass. Review the material and try again!",
  "detailed_results": [
    // ... same format as above
  ]
}
```

**Response** (400 Bad Request):

```json
{
  "message": "Invalid submission. All 10 questions must be answered."
}
```

**Frontend Usage**:

- Show results immediately after submission
- Display correct/incorrect for each question
- Show explanations for all answers
- If passed: Show success message + unlock next step
- If failed: Show retry button + review incorrect answers

---

### 4️⃣ Get Assessment History

**Endpoint**: `GET /api/roadmap-assessment/:saved_career_id/step/:step_number/history`

**Purpose**: View all previous attempts for a specific step.

**Path Parameters**:

- `saved_career_id` (integer) - ID of user's saved career
- `step_number` (integer) - Step number (1-10)

**Response** (200 OK):

```json
{
  "step_number": 3,
  "assessment_title": "Learn Machine Learning Basics Assessment",
  "total_attempts": 3,
  "has_passed": true,
  "passing_score": 70,
  "best_score": 85.0,
  "attempts": [
    {
      "result_id": 789,
      "score": 85.0,
      "status": "pass",
      "attempt_number": 3,
      "time_taken_seconds": 1200,
      "completed_at": "2025-12-28T15:00:00Z"
    },
    {
      "result_id": 788,
      "score": 60.0,
      "status": "fail",
      "attempt_number": 2,
      "time_taken_seconds": 1800,
      "completed_at": "2025-12-28T14:00:00Z"
    },
    {
      "result_id": 787,
      "score": 55.0,
      "status": "fail",
      "attempt_number": 1,
      "time_taken_seconds": 2100,
      "completed_at": "2025-12-28T13:00:00Z"
    }
  ]
}
```

**Frontend Usage**:

- Display attempt history in table or list
- Show score progression
- Highlight best attempt
- Show time taken for each attempt
- Allow viewing detailed results (fetch from backend if needed)

---

## 🎯 Frontend Integration Steps

### Step 1: Create Assessment State Management

```typescript
// types/assessment.ts
interface Question {
  question_id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Assessment {
  assessment_id: number;
  title: string;
  description: string;
  questions: Question[];
  passing_score: number;
  time_limit_minutes: number;
  step_number: number;
  total_questions: number;
  has_passed: boolean;
  attempt_count: number;
  best_score: number | null;
  can_retake: boolean;
}

interface AssessmentAnswer {
  question_id: number;
  selected_option: number;
}

interface AssessmentResult {
  result_id: number;
  score: number;
  passing_score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  attempt_number: number;
  step_completed: boolean;
  message: string;
  detailed_results: DetailedResult[];
}

interface DetailedResult {
  question_id: number;
  question: string;
  your_answer: number;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

interface StepProgress {
  step_number: number;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  has_assessment: boolean;
  assessment_passed: boolean;
  is_locked: boolean;
}

interface RoadmapProgress {
  career_name: string;
  total_steps: number;
  completed_steps: number;
  progress_percentage: string;
  steps: StepProgress[];
}
```

---

### Step 2: Create API Service Functions

```typescript
// services/assessmentService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/roadmap-assessment";

// Get auth token from your auth state/context
const getAuthToken = (): string => {
  // Replace with your actual token retrieval
  return localStorage.getItem("token") || "";
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. Get roadmap progress
export const getRoadmapProgress = async (
  savedCareerId: number
): Promise<RoadmapProgress> => {
  const response = await axiosInstance.get(`/${savedCareerId}/progress`);
  return response.data;
};

// 2. Get step assessment
export const getStepAssessment = async (
  savedCareerId: number,
  stepNumber: number
): Promise<Assessment> => {
  const response = await axiosInstance.get(
    `/${savedCareerId}/step/${stepNumber}`
  );
  return response.data;
};

// 3. Submit assessment
export const submitAssessment = async (
  savedCareerId: number,
  stepNumber: number,
  answers: AssessmentAnswer[],
  timeTakenSeconds: number
): Promise<AssessmentResult> => {
  const response = await axiosInstance.post(
    `/${savedCareerId}/step/${stepNumber}/submit`,
    {
      answers,
      time_taken_seconds: timeTakenSeconds,
    }
  );
  return response.data;
};

// 4. Get assessment history
export const getAssessmentHistory = async (
  savedCareerId: number,
  stepNumber: number
): Promise<any> => {
  const response = await axiosInstance.get(
    `/${savedCareerId}/step/${stepNumber}/history`
  );
  return response.data;
};
```

---

### Step 3: Create Roadmap Progress Component

```tsx
// components/RoadmapProgress.tsx
import React, { useEffect, useState } from "react";
import { getRoadmapProgress } from "../services/assessmentService";
import { RoadmapProgress as RoadmapProgressType } from "../types/assessment";

interface Props {
  savedCareerId: number;
  onStepClick: (stepNumber: number, isLocked: boolean) => void;
}

export const RoadmapProgress: React.FC<Props> = ({
  savedCareerId,
  onStepClick,
}) => {
  const [progress, setProgress] = useState<RoadmapProgressType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [savedCareerId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await getRoadmapProgress(savedCareerId);
      setProgress(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading progress...</div>;
  if (!progress) return <div>No progress data</div>;

  return (
    <div className="roadmap-progress">
      <h2>{progress.career_name} Roadmap</h2>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-stats">
          <span>
            {progress.completed_steps} / {progress.total_steps} Steps Completed
          </span>
          <span>{progress.progress_percentage}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Step List */}
      <div className="step-list">
        {progress.steps.map((step) => (
          <div
            key={step.step_number}
            className={`step-card ${step.is_completed ? "completed" : ""} ${
              step.is_locked ? "locked" : ""
            }`}
            onClick={() => onStepClick(step.step_number, step.is_locked)}
          >
            <div className="step-number">Step {step.step_number}</div>
            <div className="step-title">{step.title}</div>

            {/* Status Badges */}
            {step.is_locked && (
              <div className="badge locked">
                🔒 Locked - Complete Step {step.step_number - 1} first
              </div>
            )}
            {step.is_completed && step.assessment_passed && (
              <div className="badge completed">
                ✅ Completed - Assessment Passed
              </div>
            )}
            {!step.is_completed && !step.is_locked && (
              <button className="btn-take-assessment">Take Assessment</button>
            )}

            {step.completed_at && (
              <div className="completion-date">
                Completed: {new Date(step.completed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### Step 4: Create Assessment Taking Component

```tsx
// components/AssessmentTaker.tsx
import React, { useEffect, useState } from "react";
import {
  getStepAssessment,
  submitAssessment,
} from "../services/assessmentService";
import { Assessment, AssessmentAnswer } from "../types/assessment";

interface Props {
  savedCareerId: number;
  stepNumber: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const AssessmentTaker: React.FC<Props> = ({
  savedCareerId,
  stepNumber,
  onComplete,
  onCancel,
}) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetchAssessment();
  }, [savedCareerId, stepNumber]);

  // Timer countdown
  useEffect(() => {
    if (!assessment) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = assessment.time_limit_minutes * 60 - elapsed;

      if (remaining <= 0) {
        handleAutoSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, startTime]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStepAssessment(savedCareerId, stepNumber);
      setAssessment(data);
      setStartTime(Date.now());
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load assessment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setAnswers(new Map(answers.set(questionId, optionIndex)));
  };

  const handleSubmit = async () => {
    if (answers.size !== assessment?.total_questions) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const answerArray: AssessmentAnswer[] = Array.from(answers.entries()).map(
      ([question_id, selected_option]) => ({
        question_id,
        selected_option,
      })
    );

    try {
      const result = await submitAssessment(
        savedCareerId,
        stepNumber,
        answerArray,
        timeTaken
      );

      // Show results page
      alert(result.message);
      onComplete();
    } catch (err) {
      setError("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time is up! Submitting your answers...");
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="assessment-loading">
        <p>Loading assessment...</p>
        <p className="note">First time may take ~5 seconds (AI generation)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-error">
        <h3>Unable to Load Assessment</h3>
        <p>{error}</p>
        <button onClick={onCancel}>Go Back</button>
      </div>
    );
  }

  if (!assessment) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="assessment-taker">
      {/* Header */}
      <div className="assessment-header">
        <h2>{assessment.title}</h2>
        <p>{assessment.description}</p>

        <div className="assessment-info">
          <span>Questions: {assessment.total_questions}</span>
          <span>Passing Score: {assessment.passing_score}%</span>
          <span>
            Time Remaining:{" "}
            {timeRemaining ? formatTime(timeRemaining) : "--:--"}
          </span>
        </div>

        {assessment.attempt_count > 0 && (
          <div className="previous-attempts">
            <p>Previous Attempts: {assessment.attempt_count}</p>
            {assessment.best_score && (
              <p>Best Score: {assessment.best_score}%</p>
            )}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="questions-container">
        {assessment.questions.map((question, index) => (
          <div key={question.question_id} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span
                className={`answer-status ${
                  answers.has(question.question_id) ? "answered" : "unanswered"
                }`}
              >
                {answers.has(question.question_id) ? "✓" : "○"}
              </span>
            </div>

            <h3 className="question-text">{question.question}</h3>

            <div className="options">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`option ${
                    answers.get(question.question_id) === optionIndex
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.question_id}`}
                    value={optionIndex}
                    checked={answers.get(question.question_id) === optionIndex}
                    onChange={() =>
                      handleAnswerSelect(question.question_id, optionIndex)
                    }
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="assessment-footer">
        <div className="progress-indicator">
          {answers.size} / {assessment.total_questions} answered
        </div>

        <div className="actions">
          <button onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || answers.size !== assessment.total_questions}
            className="btn-primary"
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### Step 5: Create Results Display Component

```tsx
// components/AssessmentResults.tsx
import React from "react";
import { AssessmentResult } from "../types/assessment";

interface Props {
  result: AssessmentResult;
  onRetry: () => void;
  onContinue: () => void;
}

export const AssessmentResults: React.FC<Props> = ({
  result,
  onRetry,
  onContinue,
}) => {
  return (
    <div className="assessment-results">
      {/* Header */}
      <div className={`results-header ${result.passed ? "passed" : "failed"}`}>
        <div className="score-circle">
          <span className="score-value">{result.score}%</span>
          <span className="score-label">Your Score</span>
        </div>

        <h2>{result.passed ? "🎉 Congratulations!" : "📚 Keep Learning!"}</h2>
        <p className="message">{result.message}</p>

        <div className="score-breakdown">
          <div className="stat">
            <span className="stat-value">{result.correct_answers}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {result.total_questions - result.correct_answers}
            </span>
            <span className="stat-label">Incorrect</span>
          </div>
          <div className="stat">
            <span className="stat-value">{result.attempt_number}</span>
            <span className="stat-label">Attempt</span>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="detailed-results">
        <h3>Review Your Answers</h3>

        {result.detailed_results.map((detail, index) => (
          <div
            key={detail.question_id}
            className={`result-card ${
              detail.is_correct ? "correct" : "incorrect"
            }`}
          >
            <div className="result-header">
              <span className="question-number">Question {index + 1}</span>
              <span
                className={`result-badge ${
                  detail.is_correct ? "correct" : "incorrect"
                }`}
              >
                {detail.is_correct ? "✓ Correct" : "✗ Incorrect"}
              </span>
            </div>

            <p className="question-text">{detail.question}</p>

            <div className="answer-comparison">
              <div className="your-answer">
                <strong>Your Answer:</strong>{" "}
                <span className={detail.is_correct ? "correct" : "incorrect"}>
                  {String.fromCharCode(65 + detail.your_answer)}
                </span>
              </div>

              {!detail.is_correct && (
                <div className="correct-answer">
                  <strong>Correct Answer:</strong>{" "}
                  <span className="correct">
                    {String.fromCharCode(65 + detail.correct_answer)}
                  </span>
                </div>
              )}
            </div>

            <div className="explanation">
              <strong>Explanation:</strong>
              <p>{detail.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="results-actions">
        {result.passed ? (
          <>
            {result.step_completed && (
              <div className="completion-notice">
                ✅ Step marked as complete! You can now proceed to the next
                step.
              </div>
            )}
            <button onClick={onContinue} className="btn-primary">
              Continue to Next Step
            </button>
          </>
        ) : (
          <>
            <div className="retry-notice">
              Review the material and try again. You need {result.passing_score}%
              to pass.
            </div>
            <button onClick={onRetry} className="btn-primary">
              Retry Assessment
            </button>
          </>
        )}
      </div>
    </div>
  );
};
```

---

## 🔄 Sequential Validation Flow

### How Step Locking Works

```
Step 1 [UNLOCKED] → Always accessible
  ↓ User takes assessment
  ↓ Passes (≥70%)
  ↓ Step 1 marked as complete
  ↓
Step 2 [UNLOCKED] → Now accessible
  ↓ User takes assessment
  ↓ Fails (<70%)
  ↓ Step 2 remains incomplete
  ↓
Step 3 [LOCKED] → Cannot access until Step 2 is passed
  ↓ Show lock icon
  ↓ Disable "Take Assessment" button
  ↓ Display message: "Complete Step 2 first"
```

### Frontend Implementation

```typescript
// Check if step is accessible
const canAccessStep = (
  stepNumber: number,
  progress: RoadmapProgress
): boolean => {
  if (stepNumber === 1) return true; // Step 1 always accessible

  const step = progress.steps.find((s) => s.step_number === stepNumber);
  return !step?.is_locked;
};

// Get lock message
const getLockMessage = (stepNumber: number): string => {
  return `Complete Step ${stepNumber - 1} before accessing this step`;
};

// Handle step click
const handleStepClick = (stepNumber: number, isLocked: boolean) => {
  if (isLocked) {
    alert(`This step is locked. Complete Step ${stepNumber - 1} first.`);
    return;
  }

  // Navigate to assessment
  navigateToAssessment(stepNumber);
};
```

---

## 🎨 UI/UX Recommendations

### Step Cards States

1. **Locked Step** 🔒

   - Gray out the card
   - Show lock icon
   - Display "Complete Step N first" message
   - Disable all interaction

2. **Available Step** 📝

   - Full color
   - Show "Take Assessment" button
   - Highlight on hover
   - Display attempt count if any

3. **Completed Step** ✅

   - Green checkmark or badge
   - Show completion date
   - Display final score
   - Option to view results

4. **In Progress** ⏳
   - Yellow highlight
   - Show "Continue Assessment" button
   - Display time remaining

### Progress Indicators

```tsx
// Progress Bar Component
<div className="progress-bar">
  <div className="bar" style={{ width: `${percentage}%` }}>
    <span>
      {completedSteps} / {totalSteps}
    </span>
  </div>
</div>;

// Step Status Icons
{
  step.is_locked && <LockIcon />;
}
{
  step.is_completed && <CheckIcon />;
}
{
  step.in_progress && <ClockIcon />;
}
```

### Loading States

1. **Fetching Assessment** (~5 seconds for AI generation)

   ```
   ⏳ Loading assessment...
   This may take a few seconds for first-time generation
   ```

2. **Submitting Answers**

   ```
   📝 Submitting your answers...
   ```

3. **Checking Progress**
   ```
   🔄 Loading progress...
   ```

### Success/Failure Messages

**Passed (≥70%)**:

```
🎉 Congratulations!
You scored 85%! Step 3 is now complete.
You can proceed to Step 4.
```

**Failed (<70%)**:

```
📚 Keep Learning!
You scored 65%. You need 70% to pass.
Review the material and try again!
```

**Locked Step**:

```
🔒 This step is locked
Complete Step 2 before accessing Step 3
```

---

## ⚠️ Error Handling

### Common Errors and Solutions

#### 1. 403 Forbidden (Step Locked)

```json
{
  "message": "Step 2 must be completed before accessing step 3 assessment",
  "locked": true,
  "required_step": 2
}
```

**Frontend Action**:

- Show lock icon on step
- Display message with required step
- Redirect to roadmap overview
- Highlight the step that needs completion

#### 2. 404 Not Found

```json
{
  "message": "Saved career not found or unauthorized"
}
```

**Frontend Action**:

- Check if user is authenticated
- Verify saved_career_id is valid
- Redirect to career selection page

#### 3. 400 Bad Request (Incomplete Submission)

```json
{
  "message": "Invalid submission. All 10 questions must be answered."
}
```

**Frontend Action**:

- Validate all questions answered before submit
- Show validation message
- Highlight unanswered questions
- Prevent submission until complete

#### 4. 500 Server Error (AI Generation Failed)

```json
{
  "message": "Failed to generate assessment. Please try again later.",
  "error": "AI service temporarily unavailable"
}
```

**Frontend Action**:

- Show retry button
- Display friendly error message
- Log error for debugging
- Offer alternative: "Try again in a few moments"

### Error Handling Component

```tsx
// components/ErrorBoundary.tsx
const handleAssessmentError = (error: any) => {
  if (error.response?.status === 403) {
    // Step locked
    const data = error.response.data;
    return {
      type: "locked",
      message: data.message,
      requiredStep: data.required_step,
    };
  } else if (error.response?.status === 404) {
    // Not found
    return {
      type: "not_found",
      message: "Assessment or career not found",
    };
  } else if (error.response?.status === 400) {
    // Invalid request
    return {
      type: "validation",
      message: error.response.data.message,
    };
  } else {
    // Server error
    return {
      type: "server_error",
      message: "Something went wrong. Please try again.",
    };
  }
};
```

---

## 🧪 Testing Guide

### Manual Testing Steps

#### 1. Test Progress Display

```
1. Login to application
2. Navigate to roadmap page
3. Verify progress bar shows correct percentage
4. Check that steps 2-10 are locked initially
5. Verify Step 1 shows "Take Assessment" button
```

#### 2. Test Assessment Loading

```
1. Click "Take Assessment" on Step 1
2. Wait ~5 seconds (first time AI generation)
3. Verify 10 questions load
4. Check that timer starts counting down
5. Verify all questions have 4 options
```

#### 3. Test Assessment Submission (Pass)

```
1. Answer all 10 questions
2. Ensure at least 7 correct (70%)
3. Click "Submit Assessment"
4. Verify success message appears
5. Check Step 1 marked as complete
6. Verify Step 2 is now unlocked
7. Confirm progress bar updated
```

#### 4. Test Assessment Submission (Fail)

```
1. Answer questions (less than 70% correct)
2. Submit assessment
3. Verify failure message appears
4. Check step remains incomplete
5. Verify "Retry" button appears
6. Confirm Step 2 still locked
```

#### 5. Test Sequential Locking

```
1. With Step 1 incomplete, try to access Step 3
2. Verify 403 error or lock message
3. Complete Step 1
4. Verify Step 2 unlocked
5. Try to access Step 3 (should still be locked)
6. Complete Step 2
7. Verify Step 3 now unlocked
```

#### 6. Test Retry Functionality

```
1. Fail an assessment
2. Click "Retry"
3. Verify questions reload (may be same or different)
4. Answer differently
5. Submit
6. Verify attempt count increased
7. Check best score displayed
```

#### 7. Test Assessment History

```
1. Complete multiple attempts
2. View history
3. Verify all attempts listed
4. Check scores displayed correctly
5. Verify best score highlighted
6. Check time taken for each attempt
```

### API Testing with Postman/Thunder Client

#### 1. Get Progress

```http
GET http://localhost:5000/api/roadmap-assessment/1/progress
Authorization: Bearer <your_token>
```

#### 2. Get Assessment

```http
GET http://localhost:5000/api/roadmap-assessment/1/step/1
Authorization: Bearer <your_token>
```

#### 3. Submit Assessment

```http
POST http://localhost:5000/api/roadmap-assessment/1/step/1/submit
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "answers": [
    {"question_id": 1, "selected_option": 1},
    {"question_id": 2, "selected_option": 2},
    {"question_id": 3, "selected_option": 0},
    {"question_id": 4, "selected_option": 3},
    {"question_id": 5, "selected_option": 1},
    {"question_id": 6, "selected_option": 2},
    {"question_id": 7, "selected_option": 0},
    {"question_id": 8, "selected_option": 1},
    {"question_id": 9, "selected_option": 2},
    {"question_id": 10, "selected_option": 1}
  ],
  "time_taken_seconds": 1200
}
```

#### 4. Get History

```http
GET http://localhost:5000/api/roadmap-assessment/1/step/1/history
Authorization: Bearer <your_token>
```

---

## 📋 Integration Checklist

### Backend Verification

- [✅] Server running on port 5000
- [✅] Migrations applied (roadmap_assessments, user_roadmap_assessment_results)
- [✅] Groq API key configured in .env
- [✅] Routes registered (/api/roadmap-assessment)
- [✅] All 4 endpoints tested manually

### Frontend Implementation

- [ ] Install axios or fetch wrapper
- [ ] Create TypeScript types/interfaces
- [ ] Implement API service functions
- [ ] Create RoadmapProgress component
- [ ] Create AssessmentTaker component
- [ ] Create AssessmentResults component
- [ ] Add routing for assessment pages
- [ ] Implement state management (Context/Redux)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Style components with CSS
- [ ] Test sequential validation
- [ ] Test retry functionality
- [ ] Test progress tracking

### Testing

- [ ] Manual testing of all flows
- [ ] API endpoint testing
- [ ] Error scenario testing
- [ ] Mobile responsiveness
- [ ] Timer functionality
- [ ] Score calculation accuracy

---

## 🚀 Quick Start

### 1. Backend Setup (Already Done)

```bash
# Server is running
# Database tables created
# Groq AI configured
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install axios

# Copy provided TypeScript interfaces
# Copy provided service functions
# Copy provided React components
# Add routing and state management
```

### 3. Test Flow

```
1. User logs in
2. Views roadmap progress
3. Clicks "Take Assessment" on Step 1
4. Waits ~5 seconds (AI generates questions)
5. Answers all 10 questions
6. Submits assessment
7. Views results
8. If passed: Step 1 marked complete, Step 2 unlocked
9. If failed: Can retry immediately
10. Proceeds to next step when ready
```

---

## 📊 Data Flow Diagram

```
USER                    FRONTEND                  BACKEND                   AI (Groq)
  |                         |                        |                         |
  |-- Click "Take Test" --> |                        |                         |
  |                         |-- GET /step/1 -------> |                         |
  |                         |                        |-- Check DB              |
  |                         |                        |-- Not Found             |
  |                         |                        |-- Generate Request ---> |
  |                         |                        |                         |-- Generate 10 Questions
  |                         |                        | <-- Return Questions ---|
  |                         |                        |-- Save to DB            |
  |                         | <-- Return Assessment -|                         |
  |                         |                        |                         |
  |<-- Display Questions ---|                        |                         |
  |                         |                        |                         |
  |-- Submit Answers -----> |                        |                         |
  |                         |-- POST /submit ------> |                         |
  |                         |                        |-- Calculate Score       |
  |                         |                        |-- Check if Pass         |
  |                         |                        |-- Mark Step Complete    |
  |                         |                        |-- Unlock Next Step      |
  |                         | <-- Return Results ----|                         |
  |<-- Display Results -----|                        |                         |
  |                         |                        |                         |
```

---

## 🎯 Key Points for AI Integration

1. **Authentication**: All requests need `Authorization: Bearer <token>` header

2. **Answer Format**: Use 0-based index for `selected_option` (0, 1, 2, or 3)

3. **All Questions Required**: Must submit all 10 answers, no partial submissions

4. **Sequential Validation**: Check `is_locked` before allowing assessment access

5. **AI Generation**: First request may take ~5 seconds, show loading indicator

6. **Score Calculation**: Backend calculates score, frontend just displays

7. **Auto-Completion**: Backend automatically marks step complete if passed (≥70%)

8. **Retry Logic**: Users can retry unlimited times, track `attempt_count`

9. **Timer**: Frontend manages timer, backend stores `time_taken_seconds`

10. **Progress Updates**: Refresh progress after completing any assessment

---

## � Mark as Done Validation (NEW)

### ⚠️ Important Backend Change

**The "Mark as Done" button now requires assessment validation!**

Users can **ONLY** manually mark a step as done **AFTER** passing the assessment for that step.

### API Endpoint: Mark Step as Done

**Endpoint**: `PUT /api/roadmaps/step/:step_id/progress`

**Request**:

```json
{
  "is_done": true
}
```

**Success Response** (200 OK) - User has passed assessment:

```json
{
  "message": "Step marked as completed",
  "step": {
    "step_id": 32,
    "step_number": 2,
    "title": "Learn Web Server and HTTP Basics",
    "is_done": true,
    "completed_at": "2025-12-28T04:36:47.944Z"
  }
}
```

**Error Response** (403 Forbidden) - User has NOT passed assessment:

```json
{
  "message": "You must pass the assessment before marking this step as done",
  "assessment_required": true,
  "step_number": 2,
  "hint": "Complete the assessment for this step with a passing score (≥70%) to unlock manual marking"
}
```

### Frontend Implementation

#### 1. Update Mark as Done Handler

```typescript
const handleMarkAsDone = async (stepId: number, stepNumber: number) => {
  try {
    await axios.put(`/api/roadmaps/step/${stepId}/progress`, {
      is_done: true,
    });

    toast.success("Step marked as completed!");
    refreshRoadmapData(); // Refresh your roadmap state
  } catch (error) {
    if (error.response?.status === 403) {
      // Assessment not passed yet
      toast.error(
        "Please pass the assessment before marking this step as done",
        { duration: 4000 }
      );

      // Optional: Redirect to assessment page
      navigate(`/roadmap/${savedCareerId}/assessment/${stepNumber}`);
    } else {
      toast.error("Failed to mark step as done");
    }
  }
};
```

#### 2. Check Assessment Status Before Enabling Button

```typescript
const [hasPassedAssessment, setHasPassedAssessment] = useState(false);

// Check if user has passed assessment for this step
useEffect(() => {
  checkAssessmentStatus();
}, [stepNumber]);

const checkAssessmentStatus = async () => {
  try {
    const response = await axios.get(
      `/api/roadmap-assessment/${savedCareerId}/step/${stepNumber}/history`
    );

    // Check if any attempt has passed
    const hasPassed = response.data.attempts?.some(
      (attempt) => attempt.passed === true
    );

    setHasPassedAssessment(hasPassed);
  } catch (error) {
    console.error("Error checking assessment status:", error);
    setHasPassedAssessment(false);
  }
};
```

#### 3. Conditional Button Rendering

```tsx
<Button
  onClick={() => handleMarkAsDone(step.step_id, step.step_number)}
  disabled={!hasPassedAssessment || step.is_done}
  variant={hasPassedAssessment ? "success" : "secondary"}
  title={
    !hasPassedAssessment
      ? "Pass the assessment to unlock"
      : step.is_done
      ? "Step already completed"
      : "Mark as done after studying"
  }
>
  {step.is_done
    ? "✓ Completed"
    : hasPassedAssessment
    ? "Mark as Done"
    : "🔒 Mark as Done"}
</Button>
```

#### 4. Visual Feedback with Badges

```tsx
const getStepStatusBadge = (step: Step, hasPassedAssessment: boolean) => {
  if (step.is_done) {
    return <Badge variant="success">✅ Completed</Badge>;
  }

  if (hasPassedAssessment) {
    return (
      <Badge variant="warning">🎓 Assessment Passed - Can Mark Done</Badge>
    );
  }

  return <Badge variant="info">📝 Take Assessment First</Badge>;
};
```

### Validation Rules Summary

| User Action  | Assessment Status | Result                             |
| ------------ | ----------------- | ---------------------------------- |
| Mark as Done | ❌ Not taken      | 403 Error - "Must pass assessment" |
| Mark as Done | ❌ Failed (< 70%) | 403 Error - "Must pass assessment" |
| Mark as Done | ✅ Passed (≥ 70%) | ✅ Success - Step marked done      |
| Unmark Done  | Any status        | ✅ Success - Step unmarked         |

### User Flow

1. **User views step** → Button shows "🔒 Mark as Done" (disabled)
2. **User takes assessment** → Completes 10 questions
3. **User scores ≥70%** → Step auto-marked complete + Button enabled
4. **User can manually toggle** → For tracking study progress
5. **User tries to mark without passing** → 403 error + Redirect to assessment

### Complete Example Component

```tsx
const RoadmapStep: React.FC<{ step: Step; savedCareerId: number }> = ({
  step,
  savedCareerId,
}) => {
  const [hasPassedAssessment, setHasPassedAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!step.is_done) {
      checkAssessmentStatus();
    }
  }, [step.step_id]);

  const checkAssessmentStatus = async () => {
    try {
      const response = await axios.get(
        `/api/roadmap-assessment/${savedCareerId}/step/${step.step_number}/history`
      );
      const hasPassed = response.data.attempts?.some((a) => a.passed === true);
      setHasPassedAssessment(hasPassed);
    } catch (error) {
      setHasPassedAssessment(false);
    }
  };

  const handleTakeAssessment = () => {
    navigate(`/roadmap/${savedCareerId}/assessment/${step.step_number}`);
  };

  const handleMarkAsDone = async () => {
    setIsLoading(true);
    try {
      await axios.put(`/api/roadmaps/step/${step.step_id}/progress`, {
        is_done: true,
      });
      toast.success("Step marked as completed!");
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Please pass the assessment first");
        setTimeout(() => handleTakeAssessment(), 2000);
      } else {
        toast.error("Failed to mark step as done");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="roadmap-step">
      <h3>
        Step {step.step_number}: {step.title}
      </h3>

      {/* Status Badge */}
      {step.is_done ? (
        <Badge variant="success">✅ Completed</Badge>
      ) : hasPassedAssessment ? (
        <Badge variant="warning">🎓 Assessment Passed</Badge>
      ) : (
        <Badge variant="info">📝 Assessment Required</Badge>
      )}

      {/* Action Buttons */}
      <div className="button-group">
        <Button onClick={handleTakeAssessment} variant="primary">
          📝 Take Assessment
        </Button>

        <Button
          onClick={handleMarkAsDone}
          disabled={!hasPassedAssessment || isLoading}
          variant={hasPassedAssessment ? "success" : "secondary"}
        >
          {isLoading
            ? "Saving..."
            : step.is_done
            ? "✓ Completed"
            : "Mark as Done"}
        </Button>
      </div>

      {/* Help Text */}
      {!step.is_done && !hasPassedAssessment && (
        <p className="help-text">
          📚 Pass the assessment to unlock manual marking
        </p>
      )}
    </div>
  );
};
```

---

## 📞 Support & Questions

If you encounter issues:

1. **Check Console**: Look for `[Assessment Gen]` logs in backend
2. **Verify Token**: Ensure JWT token is valid and not expired
3. **Check Network**: Use browser DevTools to inspect requests/responses
4. **Database**: Verify migrations applied correctly
5. **Groq API**: Check `.env` has valid `GROQ_API_KEY`
6. **403 Errors**: Verify user has passed assessment before marking done

**Backend API**: `http://localhost:5000/api/roadmap-assessment`  
**Documentation**: See `ROADMAP_ASSESSMENT_API.md`  
**AI Details**: See `AI_ASSESSMENT_IMPLEMENTATION.md`  
**Mark as Done Details**: See `FRONTEND_MARK_AS_DONE_VALIDATION.md`

---

**Version**: 2.1 (With Mark as Done Validation)  
**Date**: December 28, 2025  
**Status**: ✅ Production Ready  
**Backend**: Running and tested  
**Frontend**: Ready for integration

---

**This documentation is designed for AI-assisted frontend integration. Copy the code examples directly and adapt to your specific framework (React, Vue, Angular, etc.).**
