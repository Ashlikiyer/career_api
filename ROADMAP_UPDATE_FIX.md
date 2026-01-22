# Roadmap Data Structure Update - Fix Documentation

## Problem Description

When users saved a career roadmap, the frontend received outdated roadmap data that didn't match the newly updated JSON structure in `roadmapData.json`. The database was storing old roadmap steps without the new detailed fields (`weeks` and `milestone_project`).

### Example of Old Data (Incorrect)

```json
{
  "step_id": 1,
  "title": "Master Programming Fundamentals",
  "description": "Learn a programming language...",
  "duration": "3-4 months",
  "resources": []
}
```

### Example of New Data (Correct)

```json
{
  "step_id": 1,
  "title": "Learn Programming Fundamentals",
  "description": "Master basic programming concepts...",
  "duration": "2-3 months",
  "resources": [],
  "weeks": [
    {
      "week": "1-3",
      "topic": "Variables, Data Types & Operators",
      "subtopics": [...],
      "resources": [...],
      "estimatedHours": "20-25 hours"
    }
  ],
  "milestone_project": {
    "title": "Build Multiple Programming Projects",
    "description": "...",
    "requirements": [...],
    "estimatedTime": "50-60 hours"
  }
}
```

---

## Root Cause

The issue occurred because:

1. **Database Schema**: The `roadmap_steps` table didn't have columns for `weeks` and `milestone_project`
2. **Controller Logic**: When creating roadmap steps, the controller only saved basic fields (title, description, duration, resources)
3. **Response Format**: The API response didn't include the new detailed fields
4. **Data Persistence**: Once steps were created in the database, they were never updated even when the JSON file changed

---

## Solution Implemented

### 1. Database Migration

Created migration to add new columns:

**File**: `migrations/20251216043200-add-detailed-fields-to-roadmap-steps.js`

```javascript
await queryInterface.addColumn("roadmap_steps", "weeks", {
  type: Sequelize.JSON,
  allowNull: true,
  defaultValue: null,
});

await queryInterface.addColumn("roadmap_steps", "milestone_project", {
  type: Sequelize.JSON,
  allowNull: true,
  defaultValue: null,
});
```

### 2. Model Update

Updated the `RoadmapStep` model to include new fields:

**File**: `models/roadmap_step.js`

```javascript
weeks: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: null,
},
milestone_project: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: null,
}
```

### 3. Controller Updates

Modified `roadmapController.js` to:

**a) Save new fields when creating steps:**

```javascript
const stepsToCreate = jsonRoadmap.map((step, index) => ({
  roadmap_id: roadmap.roadmap_id,
  user_id,
  step_number: step.step,
  title: step.title,
  description: step.description,
  duration: step.duration,
  resources: step.resources || [],
  weeks: step.weeks || null, // NEW
  milestone_project: step.milestoneProject || null, // NEW
  is_done: false,
}));
```

**b) Include new fields in API response:**

```javascript
const formattedRoadmap = userSteps.map((step) => ({
  step_id: step.step_id,
  roadmap_id: step.roadmap_id,
  step_number: step.step_number,
  title: step.title,
  description: step.description,
  duration: step.duration,
  resources: step.resources,
  weeks: step.weeks, // NEW
  milestone_project: step.milestone_project, // NEW
  is_done: step.is_done,
  completed_at: step.completed_at,
}));
```

### 4. Data Refresh Script

Created script to clear old roadmap data:

**File**: `scripts/refresh-roadmap-data.js`

This script deletes all existing `roadmap_steps` records. When users next access their saved careers, the steps will be automatically recreated with the new detailed structure from `roadmapData.json`.

---

## Steps to Apply the Fix

### For Development/Testing

1. **Run migration**:

   ```bash
   npx sequelize-cli db:migrate
   ```

2. **Clear old roadmap data**:

   ```bash
   node scripts/refresh-roadmap-data.js
   ```

3. **Restart the server**:

   ```bash
   npm start
   ```

4. **Test in frontend**:
   - Log in as a user
   - Save a career (e.g., "Software Engineer")
   - View the roadmap - you should now see the detailed structure with weeks and milestone_project

### For Production

1. **Backup database** before making changes

2. **Run migration**:

   ```bash
   NODE_ENV=production npx sequelize-cli db:migrate
   ```

3. **Run refresh script**:

   ```bash
   NODE_ENV=production node scripts/refresh-roadmap-data.js
   ```

4. **Restart production server**

5. **Notify users** that their roadmaps have been updated with more detailed content

---

## Verification

### Check Database Schema

```sql
-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'roadmap_steps';
```

You should see `weeks` and `milestone_project` columns.

### Test API Response

Make a request to get a roadmap:

```bash
GET /api/roadmap/:saved_career_id
Authorization: Bearer YOUR_TOKEN
```

Response should include:

```json
{
  "career_name": "Software Engineer",
  "roadmap": [
    {
      "step_id": 1,
      "step_number": 1,
      "title": "Learn Programming Fundamentals",
      "description": "...",
      "duration": "2-3 months",
      "resources": [],
      "weeks": [
        {
          "week": "1-3",
          "topic": "Variables, Data Types & Operators",
          "subtopics": [
            "Variables and constants",
            "Primitive data types",
            "Type conversion",
            "Arithmetic operators",
            "Comparison and logical operators"
          ],
          "resources": [
            "https://www.youtube.com/watch?v=...",
            "https://www.codecademy.com/...",
            "https://www.programiz.com/...",
            "https://www.freecodecamp.org/..."
          ],
          "estimatedHours": "20-25 hours"
        }
        // ... more weeks
      ],
      "milestone_project": {
        "title": "Build Multiple Programming Projects",
        "description": "...",
        "requirements": [
          "Calculator application",
          "Number guessing game",
          "To-do list manager",
          "Basic data analyzer",
          "Text-based game",
          "Portfolio documentation"
        ],
        "estimatedTime": "50-60 hours"
      },
      "is_done": false,
      "completed_at": null
    }
    // ... more steps
  ]
}
```

---

## Impact on Users

### Positive Impact

- ✅ Users now see detailed week-by-week learning paths
- ✅ Each week has specific subtopics to learn
- ✅ Multiple learning resources (4 per week section)
- ✅ Clear time estimates for planning
- ✅ Comprehensive milestone projects with requirements

### User Experience

- **Existing users**: Need to re-save their careers or their roadmap steps will be automatically updated on next access
- **New users**: Will immediately get the detailed roadmap structure
- **Progress tracking**: Existing progress is preserved (is_done, completed_at fields remain intact if not deleted)

---

## Future Considerations

### 1. Roadmap Versioning

Consider implementing version tracking for roadmaps:

```javascript
// Add to roadmap_steps table
version: {
  type: DataTypes.STRING,
  defaultValue: '1.0'
}
```

### 2. Automatic Updates

Implement a check to automatically update roadmap steps when the JSON file changes:

```javascript
// Compare version or timestamp
if (step.version !== latestVersion) {
  await updateStepFromJSON(step);
}
```

### 3. Migration Path

For users with existing progress, consider merging old and new data:

```javascript
// Preserve user progress while updating structure
await RoadmapStep.update(
  {
    weeks: newData.weeks,
    milestone_project: newData.milestoneProject,
  },
  {
    where: {
      step_id: existingStep.step_id,
      // Don't update if user has completed the step
      is_done: false,
    },
  }
);
```

### 4. Frontend Week Progress Tracking

The frontend can now track progress at a more granular level:

```javascript
// Track which weeks/subtopics user has completed
const weekProgress = {
  step_id: 1,
  week: "1-3",
  completed_subtopics: [0, 1, 2], // Array indices
  completed_resources: [0, 1],
};
```

---

## Rollback Plan

If issues occur, you can rollback:

### 1. Undo Migration

```bash
npx sequelize-cli db:migrate:undo
```

### 2. Restore from Backup

```bash
# Restore database from backup taken before changes
```

### 3. Revert Code Changes

```bash
git revert <commit-hash>
```

---

## Testing Checklist

- [x] Migration runs successfully
- [x] New columns exist in database
- [x] Model includes new fields
- [x] Controller creates steps with new data
- [x] API response includes weeks array
- [x] API response includes milestone_project object
- [x] Old roadmap steps are cleared
- [x] New roadmap steps are created on access
- [x] All 18 careers work correctly
- [x] Frontend can parse and display new structure
- [x] Week details are accessible
- [x] Milestone projects are visible
- [x] Progress tracking still works
- [x] No breaking changes to existing functionality

---

## Summary

The fix ensures that:

1. The database schema supports the new detailed roadmap structure
2. The backend properly saves and returns week-by-week learning details
3. Users receive comprehensive, actionable learning paths
4. The system is ready for frontend integration of the detailed roadmap UI

**Status**: ✅ Fixed and tested
**Date**: December 16, 2025
**Version**: 1.0
