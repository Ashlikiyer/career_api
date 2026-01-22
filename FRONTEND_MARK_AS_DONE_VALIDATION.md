# ✅ Mark as Done Validation - Frontend Integration Guide

## 🎯 What Changed in Backend

The "Mark as Done" button is now **protected** with validation. Users can only manually mark a step as done **AFTER** they have passed the assessment for that step.

### Backend Logic (Already Implemented)

**Endpoint**: `PUT /api/roadmaps/step/:step_id/progress`

**New Behavior**:

- ✅ **If user has passed assessment**: Allow marking as done
- ❌ **If user has NOT passed assessment**: Return 403 error

---

## 📡 API Response Changes

### ✅ Success Response (User has passed assessment)

**Request**:

```javascript
PUT /api/roadmaps/step/32/progress
Authorization: Bearer <token>
Body: { "is_done": true }
```

**Response** (200 OK):

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

---

### ❌ Error Response (User has NOT passed assessment)

**Request**:

```javascript
PUT /api/roadmaps/step/33/progress
Authorization: Bearer <token>
Body: { "is_done": true }
```

**Response** (403 Forbidden):

```json
{
  "message": "You must pass the assessment before marking this step as done",
  "assessment_required": true,
  "step_number": 3,
  "hint": "Complete the assessment for this step with a passing score (≥70%) to unlock manual marking"
}
```

---

## 🎨 Frontend Changes Required

### 1️⃣ Update "Mark as Done" Button Click Handler

**Current Code** (Needs update):

```typescript
const handleMarkAsDone = async (stepId: number, stepNumber: number) => {
  try {
    await axios.put(`/api/roadmaps/step/${stepId}/progress`, {
      is_done: true,
    });

    // Refresh roadmap data
    fetchRoadmapProgress();

    toast.success("Step marked as completed!");
  } catch (error) {
    console.error("Error marking step as done:", error);
    toast.error("Failed to mark step as done");
  }
};
```

**New Code** (With validation handling):

```typescript
const handleMarkAsDone = async (stepId: number, stepNumber: number) => {
  try {
    await axios.put(`/api/roadmaps/step/${stepId}/progress`, {
      is_done: true,
    });

    // Refresh roadmap data
    fetchRoadmapProgress();

    toast.success("Step marked as completed!");
  } catch (error) {
    // Handle 403 error - assessment not passed
    if (error.response?.status === 403) {
      const errorData = error.response.data;

      // Show user-friendly message
      toast.error(errorData.message || "Assessment required to mark as done");

      // Optional: Redirect to assessment page
      if (errorData.assessment_required) {
        navigate(`/roadmap/${savedCareerId}/assessment/${stepNumber}`);
      }
    } else {
      console.error("Error marking step as done:", error);
      toast.error("Failed to mark step as done");
    }
  }
};
```

---

### 2️⃣ Option: Disable Button Before Assessment Pass (Recommended)

Instead of showing an error after clicking, you can **disable the button** until the assessment is passed:

**Enhanced Button Logic**:

```typescript
const getMarkAsDoneButton = (step) => {
  const [hasPassed, setHasPassed] = useState(false);

  // Check if user has passed assessment for this step
  useEffect(() => {
    checkAssessmentStatus(step.step_id, step.step_number);
  }, [step]);

  const checkAssessmentStatus = async (stepId: number, stepNumber: number) => {
    try {
      // Get assessment history
      const response = await axios.get(
        `/api/roadmap-assessment/${savedCareerId}/step/${stepNumber}/history`
      );

      // Check if any attempt has passed
      const hasPassedAttempt = response.data.attempts?.some(
        (attempt) => attempt.passed === true
      );

      setHasPassed(hasPassedAttempt);
    } catch (error) {
      console.error("Error checking assessment status:", error);
      setHasPassed(false);
    }
  };

  return (
    <div className="step-action-buttons">
      {/* Show assessment button if not completed */}
      {!step.is_done && (
        <Button
          onClick={() => handleTakeAssessment(step.step_number)}
          variant="primary"
        >
          📝 Take Assessment
        </Button>
      )}

      {/* Show mark as done button - ONLY ENABLE if assessment passed */}
      <Button
        onClick={() => handleMarkAsDone(step.step_id, step.step_number)}
        disabled={!hasPassed || step.is_done}
        variant={step.is_done ? "success" : "secondary"}
        title={
          !hasPassed
            ? "Complete assessment first to unlock"
            : step.is_done
            ? "Step already completed"
            : "Mark as done after studying"
        }
      >
        {step.is_done ? "✓ Completed" : "Mark as Done"}
      </Button>
    </div>
  );
};
```

---

### 3️⃣ Show Visual Feedback Based on Assessment Status

**Visual States for Each Step**:

```typescript
interface StepStatus {
  is_done: boolean; // Step marked as complete
  has_passed_assessment: boolean; // Passed assessment
  is_locked: boolean; // Previous step not complete
}

const getStepStatusBadge = (status: StepStatus) => {
  // Priority 1: Step is complete
  if (status.is_done) {
    return <Badge variant="success">✅ Completed</Badge>;
  }

  // Priority 2: Assessment passed but not marked as done
  if (status.has_passed_assessment) {
    return (
      <Badge variant="warning">🎓 Assessment Passed - Ready to Mark Done</Badge>
    );
  }

  // Priority 3: Step is locked
  if (status.is_locked) {
    return <Badge variant="secondary">🔒 Locked</Badge>;
  }

  // Default: Available to take assessment
  return <Badge variant="info">📝 Assessment Available</Badge>;
};
```

---

### 4️⃣ Complete UI Component Example

**Full Roadmap Step Card**:

```tsx
interface RoadmapStepProps {
  step: {
    step_id: number;
    step_number: number;
    title: string;
    description: string;
    is_done: boolean;
    completed_at: string | null;
  };
  previousStepCompleted: boolean;
  savedCareerId: number;
  onUpdate: () => void;
}

const RoadmapStepCard: React.FC<RoadmapStepProps> = ({
  step,
  previousStepCompleted,
  savedCareerId,
  onUpdate,
}) => {
  const [hasPassedAssessment, setHasPassedAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check assessment status on mount
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

      const hasPassed = response.data.attempts?.some(
        (attempt: any) => attempt.passed === true
      );

      setHasPassedAssessment(hasPassed);
    } catch (error) {
      console.error("Error checking assessment:", error);
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
      onUpdate(); // Refresh parent data
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Please pass the assessment first", { duration: 4000 });

        // Redirect to assessment
        setTimeout(() => {
          handleTakeAssessment();
        }, 2000);
      } else {
        toast.error("Failed to mark step as done");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = step.step_number > 1 && !previousStepCompleted;

  return (
    <div
      className={`roadmap-step-card ${step.is_done ? "completed" : ""} ${
        isLocked ? "locked" : ""
      }`}
    >
      {/* Step Header */}
      <div className="step-header">
        <h3>
          Step {step.step_number}: {step.title}
        </h3>

        {/* Status Badge */}
        {step.is_done ? (
          <Badge variant="success">✅ Completed</Badge>
        ) : hasPassedAssessment ? (
          <Badge variant="warning">🎓 Assessment Passed</Badge>
        ) : isLocked ? (
          <Badge variant="secondary">🔒 Locked</Badge>
        ) : (
          <Badge variant="info">📝 Available</Badge>
        )}
      </div>

      {/* Step Description */}
      <p className="step-description">{step.description}</p>

      {/* Action Buttons */}
      <div className="step-actions">
        {/* Already Completed - Show completion info */}
        {step.is_done ? (
          <div className="completion-info">
            <p>
              Completed on {new Date(step.completed_at).toLocaleDateString()}
            </p>
            <Button
              variant="outline"
              onClick={() => handleMarkAsDone()} // Can unmark if needed
            >
              Unmark as Done
            </Button>
          </div>
        ) : (
          <>
            {/* Take Assessment Button */}
            <Button
              onClick={handleTakeAssessment}
              disabled={isLocked}
              variant="primary"
              className="assessment-button"
            >
              {isLocked
                ? `🔒 Complete Step ${step.step_number - 1} First`
                : "📝 Take Assessment"}
            </Button>

            {/* Mark as Done Button - Only enabled after passing */}
            <Button
              onClick={handleMarkAsDone}
              disabled={!hasPassedAssessment || isLoading}
              variant={hasPassedAssessment ? "success" : "secondary"}
              className="mark-done-button"
              title={
                !hasPassedAssessment
                  ? "Pass the assessment to unlock"
                  : "Mark as done after studying"
              }
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : hasPassedAssessment ? (
                "✓ Mark as Done"
              ) : (
                "🔒 Mark as Done (Locked)"
              )}
            </Button>
          </>
        )}
      </div>

      {/* Help Text */}
      {!step.is_done && !isLocked && (
        <p className="help-text">
          {hasPassedAssessment
            ? "✨ You passed the assessment! You can now mark this step as done after studying the material."
            : "📚 Take the assessment to validate your knowledge and unlock manual marking."}
        </p>
      )}
    </div>
  );
};
```

---

## 🎨 CSS Styling Recommendations

```css
/* Step Card States */
.roadmap-step-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.roadmap-step-card.completed {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.roadmap-step-card.locked {
  opacity: 0.6;
  background-color: #f9fafb;
}

/* Button Styles */
.mark-done-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.assessment-button:disabled {
  cursor: not-allowed;
  background-color: #e5e7eb;
}

/* Badge Styles */
.badge-success {
  background-color: #10b981;
  color: white;
}

.badge-warning {
  background-color: #f59e0b;
  color: white;
}

.badge-secondary {
  background-color: #6b7280;
  color: white;
}

.badge-info {
  background-color: #3b82f6;
  color: white;
}
```

---

## 🧪 Testing Checklist

### Scenario 1: User Has NOT Passed Assessment

1. Navigate to a step
2. Verify "Mark as Done" button is **disabled**
3. Click "Mark as Done" button (if not disabled)
4. **Expected**: 403 error with message "You must pass the assessment before marking this step as done"
5. **Expected**: Toast notification appears
6. **Expected**: Redirects to assessment page (optional)

### Scenario 2: User Has Passed Assessment

1. Complete assessment with ≥70% score
2. Return to roadmap page
3. Verify "Mark as Done" button is **enabled**
4. Verify badge shows "🎓 Assessment Passed"
5. Click "Mark as Done" button
6. **Expected**: 200 success response
7. **Expected**: Step marked as complete
8. **Expected**: Badge changes to "✅ Completed"

### Scenario 3: User Tries to Mark Locked Step

1. Navigate to Step 3 (with Step 2 not complete)
2. Verify entire card shows locked state
3. Verify "Mark as Done" button is disabled
4. Attempt to click (should do nothing)

### Scenario 4: User Already Completed Step

1. Navigate to a completed step
2. Verify shows "✅ Completed" badge
3. Verify completion date is displayed
4. Verify "Mark as Done" button either:
   - Shows "✓ Completed" (disabled)
   - Shows "Unmark as Done" (if unmarking allowed)

---

## 🔄 User Flow Diagram

```
User views Step
    ↓
Step is locked? → YES → Show "🔒 Complete Previous Step"
    ↓ NO
    ↓
User clicks "Take Assessment"
    ↓
User completes assessment
    ↓
Score ≥70%? → NO → Show retry button, "Mark as Done" stays disabled
    ↓ YES
    ↓
Step auto-marked complete by backend
    ↓
User returns to roadmap
    ↓
Sees "✅ Completed" badge
    ↓
Can also manually toggle "Mark as Done" for tracking study progress
```

---

## 📊 State Management Summary

### Step Status States

```typescript
interface StepState {
  // From database
  is_done: boolean;
  completed_at: string | null;

  // Computed
  is_locked: boolean; // Previous step not complete
  has_passed_assessment: boolean; // Passed assessment (≥70%)

  // UI States
  show_take_assessment: boolean; // !is_done && !is_locked
  enable_mark_as_done: boolean; // has_passed_assessment && !is_done
  show_completed_badge: boolean; // is_done
}
```

---

## 🎯 Key Points Summary

1. **Backend now validates** that user has passed assessment before allowing manual marking
2. **403 error returned** if user tries to mark without passing assessment
3. **Frontend should**:
   - Disable "Mark as Done" button until assessment passed
   - Show clear visual feedback about assessment status
   - Handle 403 error gracefully with user-friendly message
   - Optionally redirect to assessment page on error
4. **User flow**:
   - Take assessment → Pass (≥70%) → Step auto-marked complete
   - Can still toggle "Mark as Done" for tracking study progress
   - Cannot mark as done without passing assessment

---

## 🚀 Implementation Steps

1. ✅ **Backend Fixed** - Validation already implemented
2. ⏳ **Frontend Tasks**:
   - [ ] Update click handler with 403 error handling
   - [ ] Add assessment status check function
   - [ ] Disable button until assessment passed
   - [ ] Add visual feedback badges
   - [ ] Style disabled states
   - [ ] Test all scenarios
   - [ ] Deploy to production

---

## 📞 Questions or Issues?

If you encounter problems:

1. **Check backend logs** for assessment validation queries
2. **Check network tab** to see actual API responses
3. **Verify token** is being sent correctly
4. **Check assessment history** endpoint to confirm pass status

The backend fix is complete and running! Now implement the frontend changes using this guide. 🎉
