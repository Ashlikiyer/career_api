# Roadmap Assessment System - API Documentation

## 🎯 Overview

Complete assessment system for validating roadmap step completion. **Completely separate** from the career recommendation assessment.

### 🤖 AI-Powered Assessment Generation

**NEW**: Assessments are now **automatically generated using Groq AI** based on roadmap content from `roadmapData.json`. No manual question creation needed!

- ✅ **On-Demand**: Questions generated when first requested
- ✅ **Cached**: Stored in database for instant future access
- ✅ **Contextual**: Based on actual step topics and resources
- ✅ **Scalable**: Works for all 18 careers × 10 steps = 180+ roadmaps

---

## 🔑 Key Features

✅ **Sequential Validation** - Steps must be completed in order  
✅ **Assessment-Based Completion** - No manual step completion  
✅ **Attempt Tracking** - Track retries and best scores  
✅ **Automatic Step Marking** - Pass = step auto-completed  
✅ **Answer Storage** - Review attempts and analytics  
✅ **AI Generation** - Questions auto-generated using Groq ⭐ NEW

---

## 📋 API Endpoints

### Base URL

```
/api/roadmap-assessment
```

All endpoints require authentication via JWT token.

---

## 1️⃣ Get Roadmap Progress

**GET** `/api/roadmap-assessment/:saved_career_id/progress`

Get overall progress with assessment status for all steps.

### Response

```json
{
  "career_name": "Software Engineer",
  "total_steps": 10,
  "completed_steps": 2,
  "progress_percentage": "20.0",
  "steps": [
    {
      "step_number": 1,
      "title": "Master Programming Fundamentals",
      "is_completed": true,
      "completed_at": "2025-12-28T10:00:00Z",
      "has_assessment": true,
      "assessment_passed": true,
      "is_locked": false
    },
    {
      "step_number": 2,
      "title": "Learn Data Structures",
      "is_completed": true,
      "completed_at": "2025-12-28T12:00:00Z",
      "has_assessment": true,
      "assessment_passed": true,
      "is_locked": false
    },
    {
      "step_number": 3,
      "title": "Master Databases",
      "is_completed": false,
      "completed_at": null,
      "has_assessment": true,
      "assessment_passed": false,
      "is_locked": false
    },
    {
      "step_number": 4,
      "title": "Web Development",
      "is_completed": false,
      "completed_at": null,
      "has_assessment": true,
      "assessment_passed": false,
      "is_locked": true
    }
  ]
}
```

---

## 2️⃣ Get Step Assessment

**GET** `/api/roadmap-assessment/:saved_career_id/step/:step_number`

Get assessment questions for a specific step.

### Path Parameters

- `saved_career_id` - User's saved career ID
- `step_number` - Step number (1-10)

### Validation Rules

- Previous step must be completed (unless step 1)
- Returns locked message if prerequisite not met

### Response (Success)

```json
{
  "assessment_id": 1,
  "title": "Programming Fundamentals Assessment",
  "description": "Test your understanding of programming basics...",
  "questions": [
    {
      "question_id": 1,
      "question": "What is the output of x = 5; y = 2; print(x ** y)?",
      "options": ["10", "7", "25", "32"],
      "correct_answer": 2,
      "explanation": "The ** operator performs exponentiation. 5^2 = 25"
    }
    // ... more questions
  ],
  "passing_score": 70,
  "time_limit_minutes": 30,
  "step_number": 1,
  "total_questions": 10,
  "has_passed": false,
  "attempt_count": 0,
  "best_score": null,
  "can_retake": true
}
```

### Response (Locked)

```json
{
  "message": "Step 1 must be completed before accessing step 2 assessment",
  "locked": true,
  "required_step": 1
}
```

---

## 3️⃣ Submit Assessment

**POST** `/api/roadmap-assessment/:saved_career_id/step/:step_number/submit`

Submit answers and get results. **Automatically marks step as complete if passed.**

### Request Body

```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option": 2
    },
    {
      "question_id": 2,
      "selected_option": 3
    }
    // ... all questions
  ],
  "time_taken_seconds": 1234
}
```

### Response (Pass)

```json
{
  "result_id": 123,
  "score": 80.0,
  "passing_score": 70,
  "passed": true,
  "correct_answers": 8,
  "total_questions": 10,
  "attempt_number": 1,
  "step_completed": true,
  "message": "Congratulations! You passed with 80.0%. Step 1 is now complete."
}
```

### Response (Fail)

```json
{
  "result_id": 124,
  "score": 60.0,
  "passing_score": 70,
  "passed": false,
  "correct_answers": 6,
  "total_questions": 10,
  "attempt_number": 2,
  "step_completed": false,
  "message": "You scored 60.0%. You need 70% to pass. Try again!"
}
```

---

## 4️⃣ Get Assessment History

**GET** `/api/roadmap-assessment/:saved_career_id/step/:step_number/history`

View all attempts for a specific step.

### Response

```json
{
  "step_number": 1,
  "assessment_title": "Programming Fundamentals Assessment",
  "total_attempts": 3,
  "has_passed": true,
  "passing_score": 70,
  "best_score": 85.0,
  "attempts": [
    {
      "result_id": 125,
      "score": 85.0,
      "status": "pass",
      "attempt_number": 3,
      "time_taken_seconds": 1200,
      "completed_at": "2025-12-28T15:00:00Z"
    },
    {
      "result_id": 124,
      "score": 60.0,
      "status": "fail",
      "attempt_number": 2,
      "time_taken_seconds": 1800,
      "completed_at": "2025-12-28T14:00:00Z"
    },
    {
      "result_id": 123,
      "score": 55.0,
      "status": "fail",
      "attempt_number": 1,
      "time_taken_seconds": 2100,
      "completed_at": "2025-12-28T13:00:00Z"
    }
  ]
}
```

---

## 🔒 Sequential Validation Logic

### How It Works:

1. **Step 1**: Always accessible (no prerequisites)
2. **Step 2**: Accessible only after Step 1 is completed (assessment passed)
3. **Step 3**: Accessible only after Step 2 is completed
4. **... and so on**

### Validation Flow:

```
User clicks "Take Assessment" on Step N
    ↓
Check: Is Step N-1 completed? (is_done = true)
    ↓
No → Return 403 Forbidden with lock message
Yes → Return assessment questions
    ↓
User submits answers
    ↓
Calculate score
    ↓
Score ≥ 70% → Mark step N as complete (is_done = true)
Score < 70% → Allow retry (increment attempt_count)
```

---

## 📊 Database Tables

### roadmap_assessments

```sql
assessment_id       INT (PK, Auto)
roadmap_id          INT (FK → career_roadmaps)
step_number         INT (1-10)
title               VARCHAR(255)
description         TEXT
questions           JSON
passing_score       INT (Default: 70)
time_limit_minutes  INT (Nullable)
is_active           BOOLEAN (Default: true)
created_at          TIMESTAMP
updated_at          TIMESTAMP

UNIQUE (roadmap_id, step_number)
```

### user_roadmap_assessment_results

```sql
result_id              INT (PK, Auto)
user_id                INT (FK → users)
roadmap_assessment_id  INT (FK → roadmap_assessments)
score                  DECIMAL(5,2)
pass_fail_status       ENUM('pass', 'fail', 'in_progress')
attempt_count          INT
answers                JSON
time_taken_seconds     INT
started_at             TIMESTAMP
completed_at           TIMESTAMP
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

---

## 🎓 Question Format

### Question Object Structure

```json
{
  "question_id": 1,
  "question": "What is the output of x = 5; y = 2; print(x ** y)?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 2, // Index of correct option (0-based)
  "explanation": "Explanation of why this is correct"
}
```

### Answer Submission Format

```json
{
  "question_id": 1,
  "selected_option": 2 // Index of selected option
}
```

---

## 🚀 Frontend Integration

### 1. Display Step Lock Status

```typescript
// Check if step is locked before showing "Take Assessment" button
const stepData = progressResponse.steps.find(
  (s) => s.step_number === currentStep
);

if (stepData.is_locked) {
  return <LockedMessage requiredStep={currentStep - 1} />;
}

if (stepData.is_completed && stepData.assessment_passed) {
  return <CompletedBadge />;
}

return <TakeAssessmentButton />;
```

### 2. Fetch Assessment

```typescript
const fetchAssessment = async (savedCareerId: number, stepNumber: number) => {
  try {
    const response = await fetch(
      `/api/roadmap-assessment/${savedCareerId}/step/${stepNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 403) {
      // Step is locked
      const data = await response.json();
      showLockedMessage(data.required_step);
      return;
    }

    const assessment = await response.json();
    renderQuestions(assessment.questions);
  } catch (error) {
    console.error("Error fetching assessment:", error);
  }
};
```

### 3. Submit Assessment

```typescript
const submitAssessment = async (answers: Answer[]) => {
  const response = await fetch(
    `/api/roadmap-assessment/${savedCareerId}/step/${stepNumber}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        answers,
        time_taken_seconds: elapsedTime,
      }),
    }
  );

  const result = await response.json();

  if (result.passed) {
    showSuccessMessage(result.message);
    // Refresh roadmap to show step as complete
    refreshRoadmap();
  } else {
    showRetryMessage(result.message);
    // Allow retry
  }
};
```

---

## 🎯 Testing Guide

### 1. Run Migrations

```bash
npx sequelize-cli db:migrate
```

### 2. Seed Sample Assessments

```bash
npx sequelize-cli db:seed --seed 20251228000003-seed-roadmap-assessments.js
```

### 3. Test Flow

```
1. Login → Get token
2. GET /api/roadmap-assessment/1/progress → Check initial state
3. GET /api/roadmap-assessment/1/step/1 → Get Step 1 assessment
4. POST /api/roadmap-assessment/1/step/1/submit → Submit answers
5. GET /api/roadmap-assessment/1/progress → Verify step 1 completed
6. GET /api/roadmap-assessment/1/step/2 → Now accessible
7. GET /api/roadmap-assessment/1/step/3 → Still locked (403)
```

---

## ⚠️ Important Notes

1. **Completely Independent**: This system is separate from career recommendation assessment
2. **No Manual Completion**: Users cannot mark steps complete manually
3. **Sequential Required**: Cannot skip steps
4. **Retry Allowed**: Users can retake failed assessments
5. **Answer Storage**: All attempts stored for analytics
6. **Passing Score**: Default 70%, configurable per assessment

---

## 🔄 Comparison: Career vs Roadmap Assessment

| Feature           | Career Assessment                  | Roadmap Assessment                |
| ----------------- | ---------------------------------- | --------------------------------- |
| **Purpose**       | Recommend suitable career          | Validate roadmap progress         |
| **When Taken**    | Before career selection            | After career selection            |
| **Frequency**     | Once per user                      | Multiple (per step)               |
| **Linked To**     | User profile                       | Specific roadmap step             |
| **Completion**    | Suggests career paths              | Marks step as complete            |
| **Table**         | `assessments`                      | `roadmap_assessments`             |
| **Results Table** | `initial_results`, `final_results` | `user_roadmap_assessment_results` |
| **Sequential**    | No                                 | Yes (must complete in order)      |
| **Generation**    | Manual                             | AI-Powered (Groq) ⭐ NEW          |

---

## 🤖 Admin Endpoint: Pre-Generate Assessments

**POST** `/api/roadmap-assessment/admin/generate`

Pre-generate all assessments for a specific career using AI. Useful for popular careers to avoid on-demand generation delays.

### Request Body

```json
{
  "career_name": "Data Scientist"
}
```

### Response

```json
{
  "message": "Assessment generation completed",
  "career_name": "Data Scientist",
  "roadmap_id": 1,
  "total_steps": 10,
  "results": {
    "success": 10,
    "skipped": 0,
    "failed": 0,
    "details": {
      "success": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "skipped": [],
      "failed": []
    }
  }
}
```

### Available Careers

- Software Engineer
- Data Scientist
- Web Developer
- UX/UI Designer
- Mobile App Developer
- Cybersecurity Engineer
- Machine Learning Engineer
- Database Administrator
- Systems Administrator
- Computer Systems Analyst
- Game Developer
- DevOps Engineer
- Business Intelligence Analyst
- QA Tester
- Backend Developer
- Frontend Developer
- Cloud Architect
- Network Engineer

### Notes

- Takes ~1-2 minutes per career (10 steps × ~5 seconds each)
- Uses Groq AI with `llama-3.3-70b-versatile` model
- Questions generated based on roadmapData.json content
- Stored in database for all future users
- Skips steps that already have assessments

---

## 📞 Support

For questions or issues:

- Check error messages in API responses
- Verify authentication token is valid
- Ensure previous steps are completed
- Check database migrations are applied
- See **AI_ASSESSMENT_IMPLEMENTATION.md** for AI generation details

---

**Status**: ✅ Ready for production with AI generation  
**Version**: 2.0 (AI-Powered) ⭐  
**Last Updated**: December 28, 2025
