# Frontend Integration Guide - Updated Roadmap Structure

## 🎯 Overview

The backend now returns **detailed week-by-week roadmap data** with comprehensive learning paths. This guide shows you exactly how to integrate the new structure in your frontend.

---

## 📊 What Changed

### Before (Old Structure)

```json
{
  "step_id": 1,
  "step_number": 1,
  "title": "Master Programming Fundamentals",
  "description": "Learn a programming language...",
  "duration": "3-4 months",
  "resources": [],
  "is_done": false
}
```

### After (New Structure) ✅

```json
{
  "step_id": 1,
  "step_number": 1,
  "title": "Learn Programming Fundamentals",
  "description": "Master basic programming concepts...",
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
        "https://www.youtube.com/watch?v=zOjov-2OZ0E",
        "https://www.codecademy.com/learn/learn-python-3",
        "https://www.programiz.com/python-programming",
        "https://www.freecodecamp.org/learn/scientific-computing-with-python/"
      ],
      "estimatedHours": "20-25 hours"
    }
    // ... more weeks
  ],
  "milestone_project": {
    "title": "Build Multiple Programming Projects",
    "description": "Create a collection of small to medium programs...",
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
```

---

## 🔌 API Endpoint (No Changes)

```
GET /api/roadmap/:saved_career_id
Authorization: Bearer <token>
```

**Response Structure:**

```typescript
interface RoadmapResponse {
  career_name: string;
  roadmap_id: number;
  roadmap: Step[];
  total_steps: number;
  completed_steps: number;
  is_completed: boolean;
  feedback_submitted: boolean;
  can_submit_feedback: boolean;
}
```

---

## 📦 New TypeScript Interfaces

### Step Interface (Updated)

```typescript
interface Step {
  step_id: number;
  roadmap_id: number;
  step_number: number;
  title: string;
  description: string;
  duration: string;
  resources: string[];
  weeks: Week[] | null; // NEW
  milestone_project: MilestoneProject | null; // NEW
  is_done: boolean;
  completed_at: string | null;
}
```

### Week Interface (New)

```typescript
interface Week {
  week: string; // e.g., "1-3", "4-6"
  topic: string; // Main topic for this period
  subtopics: string[]; // 4-5 specific learning points
  resources: string[]; // 4 learning resource URLs
  estimatedHours: string; // e.g., "20-25 hours"
}
```

### MilestoneProject Interface (New)

```typescript
interface MilestoneProject {
  title: string;
  description: string;
  requirements: string[]; // 4-6 project requirements
  estimatedTime: string; // e.g., "50-60 hours"
}
```

---

## 🎨 Frontend Implementation Examples

### 1. Fetching Roadmap (No Change)

```typescript
const fetchRoadmap = async (savedCareerId: number) => {
  try {
    const response = await axios.get(`/api/roadmap/${savedCareerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    throw error;
  }
};
```

### 2. Displaying Step with Week Breakdown

```tsx
interface StepCardProps {
  step: Step;
  onToggleComplete: (stepId: number) => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, onToggleComplete }) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  return (
    <div className="step-card">
      {/* Step Header */}
      <div className="step-header">
        <h2>
          Step {step.step_number}: {step.title}
        </h2>
        <span className="duration">{step.duration}</span>
      </div>

      {/* Step Description */}
      <p className="description">{step.description}</p>

      {/* Weekly Breakdown */}
      {step.weeks && step.weeks.length > 0 && (
        <div className="weeks-section">
          <h3>📅 Week-by-Week Learning Path</h3>
          {step.weeks.map((week, index) => (
            <WeekCard
              key={index}
              week={week}
              weekIndex={index}
              isExpanded={expandedWeek === index}
              onToggle={() =>
                setExpandedWeek(expandedWeek === index ? null : index)
              }
            />
          ))}
        </div>
      )}

      {/* Milestone Project */}
      {step.milestone_project && (
        <MilestoneProjectCard project={step.milestone_project} />
      )}

      {/* Completion Toggle */}
      <button
        className={`complete-btn ${step.is_done ? "completed" : ""}`}
        onClick={() => onToggleComplete(step.step_id)}
      >
        {step.is_done ? "✓ Completed" : "Mark as Complete"}
      </button>
    </div>
  );
};
```

### 3. Week Card Component

```tsx
interface WeekCardProps {
  week: Week;
  weekIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const WeekCard: React.FC<WeekCardProps> = ({
  week,
  weekIndex,
  isExpanded,
  onToggle,
}) => {
  return (
    <div className={`week-card ${isExpanded ? "expanded" : ""}`}>
      {/* Week Header */}
      <div className="week-header" onClick={onToggle}>
        <div className="week-info">
          <span className="week-number">Week {week.week}</span>
          <h4 className="week-topic">{week.topic}</h4>
        </div>
        <div className="week-meta">
          <span className="hours">⏱️ {week.estimatedHours}</span>
          <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {/* Week Content (Expandable) */}
      {isExpanded && (
        <div className="week-content">
          {/* Subtopics */}
          <div className="subtopics">
            <h5>What You'll Learn:</h5>
            <ul>
              {week.subtopics.map((subtopic, idx) => (
                <li key={idx}>
                  <input type="checkbox" id={`subtopic-${weekIndex}-${idx}`} />
                  <label htmlFor={`subtopic-${weekIndex}-${idx}`}>
                    {subtopic}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Resources */}
          <div className="resources">
            <h5>📚 Learning Resources:</h5>
            <div className="resource-links">
              {week.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  <span className="resource-icon">
                    {getResourceIcon(resource)}
                  </span>
                  <span className="resource-text">
                    {getResourceLabel(resource, idx)}
                  </span>
                  <span className="external-icon">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getResourceIcon = (url: string): string => {
  if (url.includes("youtube.com")) return "🎥";
  if (url.includes("coursera.org")) return "🎓";
  if (url.includes("freecodecamp.org")) return "💻";
  if (url.includes("github.com")) return "🐙";
  return "📄";
};

const getResourceLabel = (url: string, index: number): string => {
  if (url.includes("youtube.com")) return "Video Tutorial";
  if (url.includes("coursera.org")) return "Online Course";
  if (url.includes("freecodecamp.org")) return "Interactive Practice";
  return `Resource ${index + 1}`;
};
```

### 4. Milestone Project Card

```tsx
interface MilestoneProjectCardProps {
  project: MilestoneProject;
}

const MilestoneProjectCard: React.FC<MilestoneProjectCardProps> = ({
  project,
}) => {
  const [checkedRequirements, setCheckedRequirements] = useState<Set<number>>(
    new Set()
  );

  const toggleRequirement = (index: number) => {
    const newChecked = new Set(checkedRequirements);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedRequirements(newChecked);
  };

  const progress =
    (checkedRequirements.size / project.requirements.length) * 100;

  return (
    <div className="milestone-project">
      <div className="milestone-header">
        <h3>🎯 Milestone Project</h3>
        <span className="time-estimate">⏱️ {project.estimatedTime}</span>
      </div>

      <h4 className="project-title">{project.title}</h4>
      <p className="project-description">{project.description}</p>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <span className="progress-text">
          {checkedRequirements.size} of {project.requirements.length} completed
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="requirements">
        <h5>Project Requirements:</h5>
        <ul className="requirements-list">
          {project.requirements.map((req, idx) => (
            <li
              key={idx}
              className={checkedRequirements.has(idx) ? "checked" : ""}
            >
              <input
                type="checkbox"
                id={`req-${idx}`}
                checked={checkedRequirements.has(idx)}
                onChange={() => toggleRequirement(idx)}
              />
              <label htmlFor={`req-${idx}`}>{req}</label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### 5. Progress Calculation with Weeks

```typescript
// Calculate total progress including week-level tracking
const calculateDetailedProgress = (roadmap: Step[]) => {
  let totalWeeks = 0;
  let completedWeeks = 0;
  let totalHours = 0;

  roadmap.forEach((step) => {
    if (step.weeks) {
      totalWeeks += step.weeks.length;

      // Count as completed if step is done
      if (step.is_done) {
        completedWeeks += step.weeks.length;
      }

      // Calculate total hours
      step.weeks.forEach((week) => {
        const hours = parseEstimatedHours(week.estimatedHours);
        totalHours += hours;
      });
    }

    // Add milestone project hours
    if (step.milestone_project) {
      const projectHours = parseEstimatedHours(
        step.milestone_project.estimatedTime
      );
      totalHours += projectHours;
    }
  });

  return {
    totalSteps: roadmap.length,
    completedSteps: roadmap.filter((s) => s.is_done).length,
    totalWeeks,
    completedWeeks,
    totalHours,
    percentComplete: (completedWeeks / totalWeeks) * 100,
  };
};

// Helper to parse hour estimates
const parseEstimatedHours = (timeStr: string): number => {
  const matches = timeStr.match(/\d+/g);
  if (!matches) return 0;

  // Return average if range (e.g., "20-25 hours" -> 22.5)
  const numbers = matches.map(Number);
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};
```

### 6. Roadmap Overview with Timeline

```tsx
const RoadmapOverview: React.FC<{ roadmap: Step[] }> = ({ roadmap }) => {
  const progress = calculateDetailedProgress(roadmap);

  return (
    <div className="roadmap-overview">
      {/* Stats Summary */}
      <div className="stats-grid">
        <StatCard icon="📊" label="Total Steps" value={progress.totalSteps} />
        <StatCard icon="✓" label="Completed" value={progress.completedSteps} />
        <StatCard icon="📅" label="Total Weeks" value={progress.totalWeeks} />
        <StatCard
          icon="⏱️"
          label="Estimated Hours"
          value={Math.round(progress.totalHours)}
        />
      </div>

      {/* Overall Progress */}
      <div className="overall-progress">
        <h3>Your Progress</h3>
        <div className="progress-bar-large">
          <div
            className="progress-fill"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
        <p>{Math.round(progress.percentComplete)}% Complete</p>
      </div>

      {/* Steps Timeline */}
      <div className="steps-timeline">
        {roadmap.map((step, idx) => (
          <TimelineStep
            key={step.step_id}
            step={step}
            isLast={idx === roadmap.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

const TimelineStep: React.FC<{
  step: Step;
  isLast: boolean;
}> = ({ step, isLast }) => (
  <div className="timeline-step">
    <div className={`timeline-marker ${step.is_done ? "completed" : ""}`}>
      {step.is_done ? "✓" : step.step_number}
    </div>
    {!isLast && <div className="timeline-line" />}
    <div className="timeline-content">
      <h4>{step.title}</h4>
      <p>{step.duration}</p>
      {step.weeks && <small>{step.weeks.length} weeks of content</small>}
    </div>
  </div>
);
```

---

## 🎨 Sample CSS Styling

```css
/* Week Card Styling */
.week-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.week-card.expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: #f8f9fa;
  transition: background 0.2s;
}

.week-header:hover {
  background: #e9ecef;
}

.week-number {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
}

.week-topic {
  margin: 4px 0 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.week-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hours {
  font-size: 14px;
  color: #6c757d;
}

/* Week Content */
.week-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.subtopics ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.subtopics li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.subtopics input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.subtopics label {
  cursor: pointer;
  font-size: 14px;
}

/* Resources */
.resource-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.resource-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  text-decoration: none;
  color: #212529;
  transition: all 0.2s;
}

.resource-link:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.resource-icon {
  font-size: 20px;
}

.external-icon {
  margin-left: auto;
  color: #6c757d;
  font-size: 12px;
}

/* Milestone Project */
.milestone-project {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  margin-top: 24px;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.project-title {
  font-size: 20px;
  margin: 8px 0;
}

.progress-bar {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin: 16px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.requirements-list {
  list-style: none;
  padding: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
}

.requirements-list li.checked {
  opacity: 0.6;
  text-decoration: line-through;
}
```

---

## 📱 Mobile Responsive Design

```css
@media (max-width: 768px) {
  .week-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .week-meta {
    width: 100%;
    justify-content: space-between;
  }

  .resource-link {
    font-size: 14px;
  }

  .milestone-project {
    padding: 16px;
  }
}
```

---

## 🔄 State Management Example (Redux/Zustand)

```typescript
// Store slice for roadmap
interface RoadmapState {
  currentRoadmap: Step[] | null;
  loading: boolean;
  error: string | null;
  weekProgress: Record<string, Set<number>>; // stepId -> completed subtopic indices
}

const useRoadmapStore = create<RoadmapState>((set) => ({
  currentRoadmap: null,
  loading: false,
  error: null,
  weekProgress: {},

  fetchRoadmap: async (savedCareerId: number) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchRoadmap(savedCareerId);
      set({ currentRoadmap: data.roadmap, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  toggleSubtopic: (
    stepId: number,
    weekIndex: number,
    subtopicIndex: number
  ) => {
    set((state) => {
      const key = `${stepId}-${weekIndex}`;
      const current = state.weekProgress[key] || new Set();

      if (current.has(subtopicIndex)) {
        current.delete(subtopicIndex);
      } else {
        current.add(subtopicIndex);
      }

      return {
        weekProgress: {
          ...state.weekProgress,
          [key]: new Set(current),
        },
      };
    });
  },
}));
```

---

## ✅ Testing Checklist

### Backend Testing

- [ ] Fetch roadmap for saved career
- [ ] Verify `weeks` array is present and populated
- [ ] Verify `milestone_project` object is present
- [ ] Check all 18 careers return correct structure
- [ ] Test with authenticated user
- [ ] Verify progress tracking still works

### Frontend Testing

- [ ] Display step with week breakdown
- [ ] Expand/collapse week cards
- [ ] Show subtopics with checkboxes
- [ ] Display learning resources with links
- [ ] Show milestone project card
- [ ] Track requirement completion
- [ ] Calculate progress correctly
- [ ] Responsive design works on mobile
- [ ] Accessibility (keyboard navigation, screen readers)

---

## 🚀 Migration Path for Existing Users

If you have existing users with saved roadmaps:

1. **Automatic Update**: When users access their roadmap, if it doesn't have the new fields, the backend will recreate it from the JSON file with the updated structure.

2. **Progress Preservation**: User progress (`is_done`, `completed_at`) is preserved even when steps are refreshed.

3. **Optional**: Show a "Roadmap Updated" banner:

```tsx
{
  showUpdateBanner && (
    <div className="update-banner">
      <span>
        🎉 Your roadmap has been updated with detailed week-by-week content!
      </span>
      <button onClick={() => setShowUpdateBanner(false)}>Got it</button>
    </div>
  );
}
```

---

## 📚 Additional Features to Consider

### 1. Week-Level Progress Tracking

Store which weeks/subtopics users have completed:

```typescript
interface WeekProgress {
  step_id: number;
  week_index: number;
  completed_subtopics: number[];
  completed_at: string | null;
}
```

### 2. Resource Bookmarking

Allow users to bookmark helpful resources:

```typescript
const bookmarkResource = async (resourceUrl: string) => {
  await api.post("/api/bookmarks", { url: resourceUrl });
};
```

### 3. Note Taking

Let users add notes per week:

```typescript
interface WeekNote {
  step_id: number;
  week_index: number;
  note: string;
  created_at: string;
}
```

### 4. Time Tracking

Track actual time spent vs. estimated:

```typescript
interface TimeTracking {
  step_id: number;
  week_index: number;
  actual_hours: number;
  estimated_hours: number;
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: weeks or milestone_project is null

**Solution**: Check if the roadmap was created before the update. Delete and re-save the career.

```typescript
if (!step.weeks || step.weeks.length === 0) {
  // Show fallback UI or prompt to refresh
  return <div>Please refresh your roadmap to see detailed content.</div>;
}
```

### Issue 2: Resources not opening

**Solution**: Ensure proper URL validation and target="\_blank"

```typescript
const openResource = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};
```

### Issue 3: Performance with large roadmaps

**Solution**: Use virtualization or pagination

```typescript
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={weeks.length} itemSize={80}>
  {({ index, style }) => <WeekCard week={weeks[index]} style={style} />}
</FixedSizeList>;
```

---

## 📖 Summary

### Key Points

1. ✅ API endpoint unchanged - just returns more data
2. ✅ New `weeks` array provides week-by-week breakdown
3. ✅ New `milestone_project` object for capstone projects
4. ✅ Backward compatible - old code will still work (just missing new features)
5. ✅ Mobile-responsive design patterns provided
6. ✅ Progress tracking enhanced with week-level granularity

### Next Steps

1. Update TypeScript interfaces
2. Implement week card components
3. Add milestone project display
4. Enhance progress calculations
5. Test with real data
6. Deploy frontend updates

---

**Last Updated**: December 16, 2025  
**API Version**: v1.0  
**Compatible Backend**: career_api with detailed roadmap structure
