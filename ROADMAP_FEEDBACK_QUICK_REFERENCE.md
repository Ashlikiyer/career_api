# Roadmap Feedback - Frontend Quick Reference

## New API Response Fields

### Roadmap Data (`GET /api/roadmaps/:saved_career_id`)

```json
{
  "is_completed": true, // All steps done
  "feedback_submitted": false, // User already submitted
  "can_submit_feedback": true // Show feedback prompt
}
```

### Roadmap Progress (`GET /api/roadmaps/:saved_career_id/progress`)

```json
{
  "is_completed": true,
  "feedback_submitted": false,
  "can_submit_feedback": true
}
```

## Submit Roadmap Feedback

```javascript
POST /api/feedback
{
  "rating": 5,
  "feedback_text": "Great roadmap!",
  "roadmap_id": 1,
  "feedback_type": "roadmap"
}
```

## Analytics Response Structure

```json
{
  "summary": {
    "assessmentFeedback": 3,
    "roadmapFeedback": 2,
    "assessmentAverage": "4.00",
    "roadmapAverage": "4.50"
  },
  "ratingDistribution": {
    "assessment": { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 },
    "roadmap": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 }
  },
  "recentFeedback": [
    {
      "feedback_type": "roadmap",
      "reference_name": "Software Engineer"
    }
  ]
}
```

## Integration Steps

1. **Check completion status** when loading roadmaps
2. **Show feedback prompt** if `can_submit_feedback: true`
3. **Submit with roadmap context** using `roadmap_id` and `feedback_type: "roadmap"`
4. **Update UI** after submission to hide prompt
5. **Display mixed feedback** on homepage with type labels

## Key Points

- Same feedback modal/component for both assessment and roadmap
- One feedback per completed roadmap per user
- Backward compatible with existing assessment feedback
- Analytics now include separate counts for each type</content>
  <parameter name="filePath">c:\codes\career_api\ROADMAP_FEEDBACK_QUICK_REFERENCE.md
