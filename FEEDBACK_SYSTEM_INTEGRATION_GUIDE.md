# User Feedback Rating System - Frontend Integration Guide

## Overview

This document provides complete integration instructions for the new user feedback rating system that allows users to rate their assessment experience from 1-5 stars after completing career assessments.

## Backend Implementation Summary

- ✅ Database table `user_feedback` created with rating, feedback text, and associations
- ✅ API endpoints implemented and tested
- ✅ Proper validation and error handling
- ✅ Anonymous and authenticated user support

## API Endpoints

### 1. Submit User Feedback

**Endpoint:** `POST /api/feedback`
**Authentication:** Optional (supports anonymous feedback)
**Description:** Allows users to submit ratings and optional text feedback

#### Request Format:

```json
{
  "rating": 5,
  "feedback_text": "Great assessment experience!",
  "assessment_id": 123
}
```

#### Field Details:

- `rating` (required): Integer between 1-5 stars
- `feedback_text` (optional): String - User's written feedback
- `assessment_id` (optional): Integer - Links feedback to specific assessment

#### Success Response (201):

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": 15,
    "rating": 5,
    "feedback_text": "Great assessment experience!",
    "created_at": "2025-10-21T13:25:30.000Z"
  }
}
```

#### Error Response (400):

```json
{
  "success": false,
  "message": "Rating is required"
}
```

### 2. Get Feedback Analytics (Admin)

**Endpoint:** `GET /api/feedback/analytics`
**Authentication:** None (can be restricted later)
**Description:** Provides aggregated feedback statistics for admin dashboard

#### Optional Query Parameters:

- `timeRange`: "7d", "30d", "90d", or "all" (default: "30d")

#### Success Response (200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFeedback": 25,
      "averageRating": "4.32",
      "timeRange": "30d"
    },
    "ratingDistribution": {
      "1": 1,
      "2": 2,
      "3": 4,
      "4": 8,
      "5": 10
    },
    "recentFeedback": [
      {
        "id": 15,
        "rating": 5,
        "feedback_text": "Great assessment experience!",
        "created_at": "2025-10-21T13:25:30.000Z",
        "user_email": "Anonymous",
        "assessment_name": "General Feedback"
      }
    ]
  }
}
```

### 3. Get User's Feedback History

**Endpoint:** `GET /api/feedback/user`
**Authentication:** Required (JWT token)
**Description:** Returns authenticated user's feedback history

#### Success Response (200):

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "rating": 5,
      "feedback_text": "Great assessment experience!",
      "created_at": "2025-10-21T13:25:30.000Z",
      "assessment_name": "General Feedback"
    }
  ]
}
```

## Frontend Integration Instructions

### 1. Post-Assessment Feedback Component

Create a feedback modal/component that appears after users complete their assessment:

```jsx
// FeedbackModal.jsx
import { useState } from "react";

const FeedbackModal = ({ assessmentId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          feedback_text: feedbackText.trim() || null,
          assessment_id: assessmentId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <h3>Rate Your Assessment Experience</h3>

        {/* Star Rating Component */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`star ${rating >= star ? "active" : ""}`}
              onClick={() => setRating(star)}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Optional Feedback Text */}
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Tell us about your experience (optional)"
          maxLength={500}
        />

        {/* Action Buttons */}
        <div className="modal-actions">
          <button onClick={onClose} disabled={isSubmitting}>
            Skip
          </button>
          <button
            onClick={submitFeedback}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 2. CSS for Feedback Components

```css
/* Feedback Modal Styles */
.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.feedback-modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  justify-content: center;
}

.star {
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star.active,
.star:hover {
  opacity: 1;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.modal-actions button:first-child {
  background: #f3f4f6;
  color: #374151;
}

.modal-actions button:last-child {
  background: #3b82f6;
  color: white;
}

.modal-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3. Integration in Assessment Results Page

```jsx
// AssessmentResults.jsx
import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

const AssessmentResults = ({ assessmentData }) => {
  const [showFeedback, setShowFeedback] = useState(true); // Auto-show after assessment

  const handleFeedbackSuccess = () => {
    // Optional: Show thank you message or trigger analytics update
    console.log("Feedback submitted successfully!");
  };

  return (
    <div className="assessment-results">
      {/* Your existing results content */}
      <h1>Your Career Assessment Results</h1>
      {/* Career suggestions, etc. */}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          assessmentId={assessmentData.assessment_id}
          onClose={() => setShowFeedback(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
};
```

### 4. Admin Analytics Dashboard Component

```jsx
// AdminAnalytics.jsx
import { useState, useEffect } from "react";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/feedback/analytics?timeRange=${timeRange}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>Failed to load analytics</div>;

  return (
    <div className="admin-analytics">
      <h2>User Feedback Analytics</h2>

      {/* Time Range Selector */}
      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
        <option value="all">All Time</option>
      </select>

      {/* Summary Stats */}
      <div className="analytics-summary">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p>{analytics.summary.totalFeedback}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>⭐ {analytics.summary.averageRating}/5.0</p>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        {Object.entries(analytics.ratingDistribution).map(([rating, count]) => (
          <div key={rating} className="rating-bar">
            <span>{rating} ⭐</span>
            <div className="bar">
              <div
                className="bar-fill"
                style={{
                  width: `${(count / analytics.summary.totalFeedback) * 100}%`,
                }}
              />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>

      {/* Recent Feedback */}
      <div className="recent-feedback">
        <h3>Recent Feedback</h3>
        {analytics.recentFeedback.map((feedback) => (
          <div key={feedback.id} className="feedback-item">
            <div className="feedback-header">
              <span>⭐ {feedback.rating}/5</span>
              <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
            </div>
            {feedback.feedback_text && (
              <p className="feedback-text">{feedback.feedback_text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Implementation Workflow

### Step 1: Add Feedback to Assessment Flow

1. Import and add `FeedbackModal` to your assessment results page
2. Show modal automatically after assessment completion
3. Pass the `assessment_id` from your assessment data

### Step 2: Test Feedback Submission

1. Complete an assessment
2. Rate the experience (1-5 stars)
3. Optionally add text feedback
4. Verify submission in browser network tab

### Step 3: Add Analytics Dashboard (Optional)

1. Create admin route/page
2. Add `AdminAnalytics` component
3. Style according to your design system

### Step 4: Styling Integration

1. Adapt the provided CSS to match your design system
2. Consider using your existing modal/button components
3. Ensure mobile responsiveness

## Database Schema Reference

```sql
-- user_feedback table structure
CREATE TABLE user_feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),  -- Optional, allows anonymous
  assessment_id INTEGER REFERENCES assessments(assessment_id),  -- Optional
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Checklist

- [ ] Feedback modal appears after assessment
- [ ] Star rating selection works
- [ ] Text feedback is optional
- [ ] Submission shows success/error messages
- [ ] Analytics page loads data
- [ ] Rating distribution displays correctly
- [ ] Mobile responsiveness works

## Benefits for User Experience

1. **User Insights:** Understand assessment experience quality
2. **Continuous Improvement:** Identify pain points and successes
3. **User Engagement:** Shows you value user opinions
4. **Data-Driven Decisions:** Make improvements based on real feedback
5. **Quality Assurance:** Monitor assessment effectiveness

## Notes

- Feedback submission works for both authenticated and anonymous users
- All fields except `rating` are optional for maximum user convenience
- Analytics endpoint provides ready-to-use data for charts and dashboards
- System is designed to be non-intrusive while gathering valuable insights

This implementation gives you immediate access to user satisfaction data and enables continuous improvement of your career assessment platform.
