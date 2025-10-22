# Roadmap Feedback Integration - Backend Guide

## Overview

The backend now supports feedback collection for completed career roadmaps, extending the existing assessment feedback system. Users can submit feedback (1-5 star rating + optional text) after completing all steps in a roadmap.

## Database Changes

### Extended `user_feedback` Table

Added two new fields to support roadmap feedback:

```sql
- roadmap_id: INTEGER (nullable, foreign key to roadmaps.roadmap_id)
- feedback_type: ENUM ('assessment', 'roadmap') - default: 'assessment'
```

**Backward Compatibility**: Existing assessment feedback records automatically have `feedback_type = 'assessment'`.

## API Endpoints

### Submit Feedback (Extended)

```
POST /api/feedback
Content-Type: application/json

// For roadmap feedback:
{
  "rating": 5,
  "feedback_text": "Great roadmap experience!",
  "roadmap_id": 1,
  "feedback_type": "roadmap"
}

// For assessment feedback (existing):
{
  "rating": 4,
  "feedback_text": "Good assessment",
  "assessment_id": 1,
  "feedback_type": "assessment"  // optional, defaults to "assessment"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": 3,
    "feedback_type": "roadmap",
    "rating": 5,
    "feedback_text": "Great roadmap experience!",
    "created_at": "2025-10-22T12:00:00.000Z"
  }
}
```

### Get Roadmap with Completion Status

```
GET /api/roadmaps/:saved_career_id
Authorization: Bearer <token>
```

**New Response Fields:**

```json
{
  "career_name": "Software Engineer",
  "roadmap_id": 1,
  "roadmap": [...],
  "total_steps": 10,
  "completed_steps": 10,
  "is_completed": true,           // NEW: All steps completed
  "feedback_submitted": false,    // NEW: User already submitted feedback
  "can_submit_feedback": true     // NEW: Eligible for feedback prompt
}
```

### Get Roadmap Progress

```
GET /api/roadmaps/:saved_career_id/progress
Authorization: Bearer <token>
```

**New Response Fields:**

```json
{
  "career_name": "Software Engineer",
  "roadmap_id": 1,
  "total_steps": 10,
  "completed_steps": 10,
  "progress_percentage": 100,
  "is_completed": true,           // NEW
  "feedback_submitted": false,    // NEW
  "can_submit_feedback": true,    // NEW
  "steps": [...]
}
```

### Get Feedback Analytics (Extended)

```
GET /api/feedback/analytics
```

**Enhanced Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFeedback": 5,
      "assessmentFeedback": 3, // NEW
      "roadmapFeedback": 2, // NEW
      "averageRating": "4.20",
      "assessmentAverage": "4.00", // NEW
      "roadmapAverage": "4.50" // NEW
    },
    "ratingDistribution": {
      "overall": { "1": 0, "2": 0, "3": 1, "4": 2, "5": 2 },
      "assessment": { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 }, // NEW
      "roadmap": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 } // NEW
    },
    "recentFeedback": [
      {
        "id": 3,
        "feedback_type": "roadmap", // NEW
        "rating": 5,
        "feedback_text": "Great roadmap!",
        "created_at": "2025-10-22T12:00:00.000Z",
        "reference_name": "Software Engineer" // Career name for roadmaps
      }
    ]
  }
}
```

## Frontend Integration Guide

### 1. Detect Roadmap Completion

When fetching roadmap data, check the new completion flags:

```javascript
const roadmapData = await fetch(`/api/roadmaps/${savedCareerId}`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// Check if user can submit feedback
if (roadmapData.can_submit_feedback) {
  showFeedbackPrompt(roadmapData.roadmap_id, roadmapData.career_name);
}
```

### 2. Submit Roadmap Feedback

Use the same feedback modal/component but specify roadmap context:

```javascript
async function submitRoadmapFeedback(roadmapId, rating, feedbackText) {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      rating,
      feedback_text: feedbackText,
      roadmap_id: roadmapId,
      feedback_type: "roadmap",
    }),
  });

  const result = await response.json();
  if (result.success) {
    // Update UI to show feedback submitted
    updateRoadmapStatus(roadmapId, "feedback_submitted");
  }
}
```

### 3. Display Mixed Feedback on Homepage

The analytics endpoint now returns both assessment and roadmap feedback:

```javascript
const analytics = await fetch("/api/feedback/analytics").then((r) => r.json());

// Display feedback with type indicators
analytics.data.recentFeedback.forEach((feedback) => {
  const typeLabel =
    feedback.feedback_type === "roadmap"
      ? `Roadmap: ${feedback.reference_name}`
      : `Assessment: ${feedback.reference_name}`;

  displayFeedbackItem(feedback, typeLabel);
});
```

## Completion Detection Logic

### Automatic Detection

- Backend checks if `all roadmap steps have is_done = true`
- Returns `is_completed: true` when all steps are finished
- Prevents duplicate feedback with `feedback_submitted` flag

### Feedback Eligibility

- `can_submit_feedback = is_completed && !feedback_submitted`
- Only show feedback prompt when user hasn't submitted yet
- One feedback per completed roadmap per user

## Data Flow

1. **User completes all roadmap steps** → `is_completed: true`
2. **Frontend detects completion** → Shows feedback prompt
3. **User submits feedback** → `feedback_type: 'roadmap'`
4. **Backend stores feedback** → Links to specific roadmap
5. **Homepage displays** → Shows both assessment and roadmap feedback

## Error Handling

**Validation Errors:**

- `roadmap_id required for roadmap feedback`
- `assessment_id required for assessment feedback`
- `Invalid feedback type`

**Duplicate Prevention:**

- Users cannot submit multiple feedback for same roadmap
- Backend checks existing feedback before allowing submission

## Migration Notes

- Existing feedback records automatically classified as `assessment` type
- New roadmap feedback stored with `roadmap` type
- All existing API endpoints remain backward compatible
- Homepage analytics now include roadmap feedback counts and ratings

## Testing Checklist

- ✅ Submit roadmap feedback after completion
- ✅ Prevent duplicate feedback submission
- ✅ Display completion status in roadmap responses
- ✅ Show mixed feedback types on homepage
- ✅ Analytics separate assessment vs roadmap metrics
- ✅ Existing assessment feedback still works</content>
  <parameter name="filePath">c:\codes\career_api\ROADMAP_FEEDBACK_FRONTEND_INTEGRATION.md
