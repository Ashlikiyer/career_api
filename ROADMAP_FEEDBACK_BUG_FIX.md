# Roadmap Feedback Bug Fix - CRITICAL

## Problem

The rating popup was appearing every time a user reopened a roadmap, even after they had already submitted feedback.

## Root Causes Found

### 1. **Incorrect User ID Field in Feedback Controller** ❌

**Location:** `controllers/feedbackController.js` line 57

**Wrong Code:**

```javascript
const user_id = req.user?.user_id || null; // ❌ user_id doesn't exist in JWT
```

**Fixed Code:**

```javascript
const user_id = req.user?.id || null; // ✅ Correct field from JWT token
```

**Impact:** Feedback was being saved with `null` or wrong user_id, so the lookup query could never find it.

---

### 2. **Conditional Feedback Check in Roadmap Controller** ❌

**Location:** `controllers/roadmapController.js` line 57-58

**Wrong Code:**

```javascript
let hasSubmittedFeedback = false;
if (isCompleted) {  // ❌ Only checks if roadmap is completed
  const existingFeedback = await user_feedback.findOne({...});
  hasSubmittedFeedback = !!existingFeedback;
}
```

**Fixed Code:**

```javascript
// Check feedback regardless of completion status
const existingFeedback = await user_feedback.findOne({
  where: {
    user_id,
    roadmap_id: roadmap.roadmap_id,
    feedback_type: "roadmap",
  },
});
const hasSubmittedFeedback = !!existingFeedback;
```

**Impact:** If a user submitted feedback and then marked a step as incomplete, the backend would stop checking for feedback and always return `feedback_submitted: false`.

---

## Files Modified

### 1. `controllers/feedbackController.js`

- **Line 57:** Changed `req.user?.user_id` → `req.user?.id`
- **Line 210:** Changed `req.user?.user_id` → `req.user?.id`
- **Added:** Debug logging for feedback submission

### 2. `controllers/roadmapController.js`

- **Lines 54-64:** Removed conditional `if (isCompleted)` check before feedback lookup
- **Lines 141-151:** Same fix applied to `getRoadmapProgress` function
- **Added:** Debug logging for feedback detection

---

## JWT Token Structure (Reference)

The JWT token created in `authController.js` contains:

```javascript
{
  id: user.user_id,      // ✅ Use req.user.id
  email: user.email
}
```

**NOT:**

```javascript
{
  user_id: ...  // ❌ This doesn't exist
}
```

---

## Debug Logging Added

### Feedback Submission Log:

```
[Feedback Submission] User: 1, Type: roadmap, Roadmap ID: 10, Assessment ID: N/A
```

### Feedback Detection Log:

```
[Roadmap Feedback Check] User: 1, Roadmap: 10, Feedback Found: true
[Roadmap Progress Feedback Check] User: 1, Roadmap: 10, Feedback Found: true
```

---

## Testing Checklist

After deploying these fixes:

1. ✅ **Submit feedback for a completed roadmap**

   - Should save with correct user_id
   - Check server logs: `[Feedback Submission] User: <id>...`

2. ✅ **Reopen the same roadmap**

   - Should return `feedback_submitted: true`
   - Should return `can_submit_feedback: false`
   - Check server logs: `[Roadmap Feedback Check] ... Feedback Found: true`

3. ✅ **Rating modal should NOT appear again**

   - Frontend should respect `feedback_submitted: true`

4. ✅ **Different user on same roadmap**

   - Each user has independent feedback status
   - User A's feedback doesn't affect User B

5. ✅ **Mark step as incomplete after rating**
   - Feedback status should still be preserved
   - Modal should NOT appear (already rated)

---

## Expected Behavior Now

### Scenario 1: First Time Completing Roadmap

```json
{
  "is_completed": true,
  "feedback_submitted": false,
  "can_submit_feedback": true // ✅ Show modal
}
```

### Scenario 2: After Submitting Feedback

```json
{
  "is_completed": true,
  "feedback_submitted": true,
  "can_submit_feedback": false // ✅ Don't show modal
}
```

### Scenario 3: Incomplete Roadmap (Never Completed)

```json
{
  "is_completed": false,
  "feedback_submitted": false,
  "can_submit_feedback": false // ✅ Don't show modal
}
```

### Scenario 4: Rated, Then Marked Step Incomplete

```json
{
  "is_completed": false,
  "feedback_submitted": true, // ✅ Feedback preserved
  "can_submit_feedback": false // ✅ Don't show modal (already rated)
}
```

---

## Database Verification Query

To verify feedback is being saved correctly:

```sql
SELECT
  id,
  user_id,
  roadmap_id,
  feedback_type,
  rating,
  created_at
FROM user_feedback
WHERE feedback_type = 'roadmap'
ORDER BY created_at DESC;
```

Expected result:

- `user_id` should match the authenticated user's ID (not null)
- `roadmap_id` should match the roadmap being rated
- `feedback_type` should be 'roadmap'

---

## Summary

The bug was caused by two issues:

1. **Wrong JWT field reference** - Feedback was saved with incorrect/null user_id
2. **Conditional feedback check** - Feedback detection was skipped in certain scenarios

Both issues are now fixed. The backend will:

- ✅ Save feedback with correct user_id
- ✅ Always check for existing feedback (regardless of completion status)
- ✅ Return accurate `feedback_submitted` and `can_submit_feedback` flags
- ✅ Prevent rating modal from appearing multiple times

**Test thoroughly and verify logs to confirm the fix works!** 🎉
