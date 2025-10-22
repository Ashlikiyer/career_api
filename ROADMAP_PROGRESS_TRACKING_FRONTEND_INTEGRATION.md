# Roadmap Progress Tracking - Backend Integration Guide

## Overview

This document describes the new roadmap progress tracking functionality added to the career API backend. The system now supports user-specific progress tracking for career roadmaps with persistent storage in the database.

## Background

The backend was updated to move roadmap data from a hybrid JSON/database approach to a proper relational database structure. This enables individual users to track their progress through career roadmap steps with persistent, user-specific completion status.

## New Database Tables

### `roadmaps` Table

Stores general information about each career roadmap:

```sql
- roadmap_id: INTEGER (Primary Key, Auto-increment)
- career_name: STRING (Unique constraint)
- description: TEXT
- total_steps: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### `roadmap_steps` Table

Stores user-specific roadmap steps with progress tracking:

```sql
- step_id: INTEGER (Primary Key, Auto-increment)
- roadmap_id: INTEGER (Foreign Key to roadmaps.roadmap_id)
- user_id: INTEGER (Foreign Key to users.user_id)
- step_number: INTEGER
- title: STRING
- description: TEXT
- duration: STRING
- resources: JSON (Array of resource links)
- is_done: BOOLEAN (Progress tracking - see below)
- completed_at: TIMESTAMP (NULL when not completed)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Unique Constraint**: `(roadmap_id, user_id, step_number)` - Ensures each user has exactly one record per roadmap step.

## Progress Tracking with `is_done` Field

The `is_done` boolean field in the `roadmap_steps` table tracks completion status:

- **`true`**: Step is completed
- **`false`**: Step is not completed (default value)

When a step is marked as completed:

- `is_done` is set to `true`
- `completed_at` is set to the current timestamp
- `updated_at` is updated

When a step is marked as incomplete:

- `is_done` is set to `false`
- `completed_at` is set to `NULL`
- `updated_at` is updated

## API Endpoints

### Get Roadmap with Progress

```
GET /api/roadmaps/:saved_career_id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "career_name": "UX/UI Designer",
  "roadmap_id": 9,
  "roadmap": [
    {
      "step_id": 1,
      "roadmap_id": 9,
      "step_number": 1,
      "title": "Design Fundamentals",
      "description": "Learn color theory, typography...",
      "duration": "1-2 months",
      "resources": ["https://...", "https://..."],
      "is_done": false,
      "completed_at": null
    }
  ],
  "total_steps": 10,
  "completed_steps": 0
}
```

### Get Progress Summary

```
GET /api/roadmaps/:saved_career_id/progress
Authorization: Bearer <token>
```

**Response:**

```json
{
  "career_name": "UX/UI Designer",
  "roadmap_id": 9,
  "total_steps": 10,
  "completed_steps": 2,
  "progress_percentage": 20,
  "steps": [
    {
      "step_id": 1,
      "step_number": 1,
      "title": "Design Fundamentals",
      "is_done": true,
      "completed_at": "2025-10-22T11:43:56.706Z"
    }
  ]
}
```

### Update Step Progress

```
PUT /api/roadmaps/step/:step_id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_done": true
}
```

**Response:**

```json
{
  "message": "Step marked as completed",
  "step": {
    "step_id": 1,
    "step_number": 1,
    "title": "Design Fundamentals",
    "is_done": true,
    "completed_at": "2025-10-22T11:43:56.706Z"
  }
}
```

### Delete Roadmap Step

```
DELETE /api/roadmaps/step/:step_id
Authorization: Bearer <token>
```

## Frontend Integration Guide

### User Flow

1. **User saves a career** → Redirected to dashboard
2. **User views saved career** → Can see associated roadmap
3. **User tracks progress** → Mark steps as "done" to maintain visual progress record

### Implementation Steps

#### 1. Display Roadmap

- Call `GET /api/roadmaps/:saved_career_id` when user views a saved career
- Display steps with completion status
- Show progress indicators (completed/total steps)

#### 2. Progress Tracking UI

- Add checkboxes or buttons for each step
- Show visual indicators for completed steps (checkmarks, different styling)
- Display progress percentage

#### 3. Update Progress

- When user marks step as done/not done:

  ```javascript
  // Mark step as completed
  fetch(`/api/roadmaps/step/${stepId}/progress`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_done: true }),
  });

  // Mark step as incomplete
  fetch(`/api/roadmaps/step/${stepId}/progress`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_done: false }),
  });
  ```

#### 4. Progress Summary

- Call `GET /api/roadmaps/:saved_career_id/progress` for dashboard/progress views
- Display overall completion percentage
- Show progress bars or completion indicators

### Data Handling

#### Step Creation

- Roadmap steps are automatically created for each user when they first access a roadmap
- Steps are populated from the reference JSON file
- Each user gets their own copy of steps for progress tracking

#### Progress Persistence

- Progress is stored per user per step
- Changes persist across sessions
- Multiple users can have different progress on the same career roadmap

## Reference Files

The original `careerdata/roadmapData.json` file is maintained as a reference and support file. It contains the master roadmap data used to populate user-specific steps.

## Migration Notes

- All existing career roadmaps (18 careers) have been migrated to the database
- User progress is tracked individually - no existing progress was migrated
- The system maintains backward compatibility with existing saved careers

## Error Handling

API endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Invalid request data
- `401`: Unauthorized
- `403`: Forbidden (wrong user)
- `404`: Roadmap/step not found
- `500`: Server error

Error responses include descriptive messages for debugging.
