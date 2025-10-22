# Roadmap Feedback Integration Guide

## Overview

The backend now supports collecting feedback for completed career roadmaps. This extends the existing feedback system to include roadmap-specific feedback alongside assessment feedback.

## New API Response Fields

### Roadmap Endpoints

The following endpoints now include completion and feedback status:

#### `GET /api/roadmaps/:saved_career_id`

```json
{
  "career_name": "Software Engineer",
  "roadmap_id": 1,
  "roadmap": [...],
  "total_steps": 10,
  "completed_steps": 10,
  "is_completed": true,           // NEW: All steps completed
  "feedback_submitted": false,    // NEW: User already submitted feedback
  "can_submit_feedback": true     // NEW: Show feedback prompt
}
```

#### `GET /api/roadmaps/:saved_career_id/progress`

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

## Submitting Roadmap Feedback

Use the existing feedback endpoint with new parameters:

#### `POST /api/feedback`

```json
{
  "rating": 5,
  "feedback_text": "Great roadmap experience!",
  "roadmap_id": 1,
  "feedback_type": "roadmap"
}
```

**Required fields for roadmap feedback:**

- `roadmap_id`: The ID of the completed roadmap
- `feedback_type`: Must be `"roadmap"`
- `rating`: 1-5 star rating
- `feedback_text`: Optional feedback text

## Enhanced Analytics

#### `GET /api/feedback/analytics`

The analytics response now includes separate metrics for roadmap and assessment feedback:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFeedback": 5,
      "assessmentFeedback": 3, // Assessment feedback count
      "roadmapFeedback": 2, // Roadmap feedback count
      "averageRating": "4.20",
      "assessmentAverage": "4.00", // Assessment average rating
      "roadmapAverage": "4.50" // Roadmap average rating
    },
    "ratingDistribution": {
      "overall": { "1": 0, "2": 0, "3": 1, "4": 2, "5": 2 },
      "assessment": { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 },
      "roadmap": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 }
    },
    "recentFeedback": [
      {
        "id": 3,
        "feedback_type": "roadmap", // "assessment" or "roadmap"
        "rating": 5,
        "feedback_text": "Great roadmap!",
        "created_at": "2025-10-22T12:00:00.000Z",
        "reference_name": "Software Engineer" // Career name for roadmaps
      }
    ]
  }
}
```

## Integration Steps

### 1. Detect Roadmap Completion

When fetching roadmap data, check the new completion flags:

```javascript
const roadmapData = await fetch(`/api/roadmaps/${savedCareerId}`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// Show feedback prompt if eligible
if (roadmapData.can_submit_feedback) {
  showFeedbackPrompt(roadmapData.roadmap_id, roadmapData.career_name);
}
```

### 2. Submit Roadmap Feedback

Use your existing feedback modal/component with roadmap context:

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
    // Update UI to reflect feedback submitted
    updateRoadmapStatus(roadmapId, "feedback_submitted");
  }
}
```

### 3. Display Mixed Feedback Types

Update your homepage to show both assessment and roadmap feedback:

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

## Key Behavior Changes

- **Completion Detection**: Backend automatically detects when all roadmap steps are completed
- **One Feedback Per Roadmap**: Users can submit only one feedback per completed roadmap
- **Type Distinction**: Feedback is categorized as either "assessment" or "roadmap"
- **Backward Compatibility**: Existing assessment feedback functionality unchanged

## Error Handling

The API will return validation errors for:

- Missing `roadmap_id` when `feedback_type` is "roadmap"
- Attempting to submit duplicate feedback for the same roadmap
- Invalid `feedback_type` values

## Migration Notes

- Existing feedback records are automatically classified as "assessment" type
- All existing API endpoints remain backward compatible
- Homepage analytics now include roadmap feedback metrics</content>
  <parameter name="filePath">c:\codes\career_api\ROADMAP_FEEDBACK_INTEGRATION.md
