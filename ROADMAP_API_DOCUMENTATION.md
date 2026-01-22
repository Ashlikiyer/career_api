# Career Roadmap API - Frontend Integration Documentation

## Overview

This document provides comprehensive details about the updated career roadmap data structure for frontend integration. All 18 IT career roadmaps now include detailed week-by-week learning paths with specific topics, subtopics, resources, time estimates, and milestone projects.

## Table of Contents

1. [API Endpoint](#api-endpoint)
2. [Data Structure](#data-structure)
3. [Career List](#career-list)
4. [JSON Structure Details](#json-structure-details)
5. [Frontend Integration Examples](#frontend-integration-examples)
6. [UI/UX Recommendations](#uiux-recommendations)

---

## API Endpoint

### Get Career Roadmap

```
GET /api/roadmap/:careerName
```

**Parameters:**

- `careerName` (string, required): The career name (URL encoded)

**Response:**

```json
{
  "career": "Software Engineer",
  "roadmap": [
    {
      "step": 1,
      "title": "Learn Programming Fundamentals",
      "description": "Master basic programming concepts...",
      "duration": "2-3 months",
      "weeks": [...],
      "milestoneProject": {...}
    }
  ]
}
```

---

## Data Structure

### Step Object Structure

Each career has **10 steps**, and each step contains:

```typescript
interface Step {
  step: number; // Step number (1-10)
  title: string; // Step title
  description: string; // Brief description
  duration: string; // Overall duration (e.g., "2-3 months")
  weeks: Week[]; // Detailed weekly breakdown
  milestoneProject: MilestoneProject; // Final project for the step
}
```

### Week Object Structure

Each step contains **2-4 week sections** with detailed learning content:

```typescript
interface Week {
  week: string; // Week range (e.g., "1-3", "4-6")
  topic: string; // Main topic for this period
  subtopics: string[]; // Array of 4-5 specific subtopics
  resources: string[]; // Array of 4 learning resource URLs
  estimatedHours: string; // Time estimate (e.g., "20-25 hours")
}
```

### Milestone Project Structure

Each step ends with a comprehensive project:

```typescript
interface MilestoneProject {
  title: string; // Project title
  description: string; // Project overview
  requirements: string[]; // Array of 4-6 specific requirements
  estimatedTime: string; // Total project time (e.g., "50-60 hours")
}
```

---

## Career List

All 18 available careers (use these exact names for API calls):

1. **Software Engineer** - 10 steps, ~140 weeks total
2. **Graphic Designer** - 10 steps, ~130 weeks total
3. **Data Scientist** - 10 steps, ~140 weeks total
4. **Software Tester/QA** - 10 steps, ~130 weeks total
5. **Web Developer** - 10 steps, ~130 weeks total
6. **Frontend Developer** - 10 steps, ~130 weeks total
7. **Backend Developer** - 10 steps, ~140 weeks total
8. **Mobile App Developer** - 10 steps, ~130 weeks total
9. **UX/UI Designer** - 10 steps, ~110 weeks total
10. **Machine Learning Engineer** - 10 steps, ~140 weeks total
11. **Database Administrator** - 10 steps, ~130 weeks total
12. **Systems Administrator** - 10 steps, ~140 weeks total
13. **Computer Systems Analyst** - 10 steps, ~140 weeks total
14. **Game Developer** - 10 steps, ~140 weeks total
15. **DevOps Engineer** - 10 steps, ~140 weeks total
16. **Business Intelligence Analyst** - 10 steps, ~130 weeks total
17. **QA Tester** - 10 steps, ~130 weeks total
18. **Cybersecurity Engineer** - 10 steps, ~150 weeks total

---

## JSON Structure Details

### Complete Example: One Step

```json
{
  "step": 1,
  "title": "Learn Programming Fundamentals",
  "description": "Master basic programming concepts including variables, data types, control structures, functions, and problem-solving.",
  "duration": "2-3 months",
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
    },
    {
      "week": "4-6",
      "topic": "Control Structures",
      "subtopics": [
        "If/else statements",
        "Switch/case statements",
        "For loops",
        "While loops",
        "Break and continue"
      ],
      "resources": [
        "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "https://www.w3schools.com/python/python_conditions.asp",
        "https://realpython.com/python-conditional-statements/",
        "https://www.freecodecamp.org/news/python-loops/"
      ],
      "estimatedHours": "20-25 hours"
    },
    {
      "week": "7-10",
      "topic": "Functions & Problem Solving",
      "subtopics": [
        "Function definition",
        "Parameters and arguments",
        "Return values",
        "Scope",
        "Algorithm design"
      ],
      "resources": [
        "https://www.youtube.com/watch?v=9Os0o3wzS_I",
        "https://www.programiz.com/python-programming/function",
        "https://realpython.com/defining-your-own-python-function/",
        "https://www.freecodecamp.org/news/python-functions/"
      ],
      "estimatedHours": "25-30 hours"
    }
  ],
  "milestoneProject": {
    "title": "Build Multiple Programming Projects",
    "description": "Create a collection of small to medium programs demonstrating mastery of programming fundamentals.",
    "requirements": [
      "Calculator application",
      "Number guessing game",
      "To-do list manager",
      "Basic data analyzer",
      "Text-based game",
      "Portfolio documentation"
    ],
    "estimatedTime": "50-60 hours"
  }
}
```

---

## Frontend Integration Examples

### Example 1: Fetching Career Roadmap

```javascript
// Fetch roadmap data
async function fetchCareerRoadmap(careerName) {
  try {
    const response = await fetch(
      `/api/roadmap/${encodeURIComponent(careerName)}`
    );
    const data = await response.json();
    return data.roadmap;
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return null;
  }
}

// Usage
const roadmap = await fetchCareerRoadmap("Software Engineer");
```

### Example 2: Displaying Step Information

```jsx
// React Component Example
function StepCard({ step }) {
  return (
    <div className="step-card">
      <h2>
        Step {step.step}: {step.title}
      </h2>
      <p className="description">{step.description}</p>
      <p className="duration">Duration: {step.duration}</p>

      <div className="weeks-section">
        <h3>Weekly Breakdown</h3>
        {step.weeks.map((week, index) => (
          <WeekSection key={index} week={week} />
        ))}
      </div>

      <div className="milestone-section">
        <h3>Milestone Project: {step.milestoneProject.title}</h3>
        <p>{step.milestoneProject.description}</p>
        <ul>
          {step.milestoneProject.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
        <p className="time-estimate">
          Time: {step.milestoneProject.estimatedTime}
        </p>
      </div>
    </div>
  );
}
```

### Example 3: Displaying Weekly Content

```jsx
// React Component for Week Details
function WeekSection({ week }) {
  return (
    <div className="week-section">
      <div className="week-header">
        <span className="week-number">Week {week.week}</span>
        <span className="hours">{week.estimatedHours}</span>
      </div>

      <h4 className="week-topic">{week.topic}</h4>

      <div className="subtopics">
        <h5>What You'll Learn:</h5>
        <ul>
          {week.subtopics.map((subtopic, index) => (
            <li key={index}>{subtopic}</li>
          ))}
        </ul>
      </div>

      <div className="resources">
        <h5>Learning Resources:</h5>
        <ul>
          {week.resources.map((resource, index) => (
            <li key={index}>
              <a href={resource} target="_blank" rel="noopener noreferrer">
                Resource {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Example 4: Progress Tracking

```javascript
// Calculate total weeks and hours for a career
function calculateCareerStats(roadmap) {
  let totalWeeks = 0;
  let totalHours = 0;

  roadmap.forEach((step) => {
    step.weeks.forEach((week) => {
      // Parse week range (e.g., "1-3" = 3 weeks, "4-6" = 3 weeks)
      const [start, end] = week.week.split("-").map(Number);
      totalWeeks += end - start + 1;

      // Parse hours (e.g., "20-25 hours" -> average 22.5)
      const hours = week.estimatedHours.match(/\d+/g);
      if (hours) {
        const avgHours =
          hours.reduce((sum, h) => sum + parseInt(h), 0) / hours.length;
        totalHours += avgHours;
      }
    });

    // Add milestone project hours
    const projectHours = step.milestoneProject.estimatedTime.match(/\d+/g);
    if (projectHours) {
      const avgProjectHours =
        projectHours.reduce((sum, h) => sum + parseInt(h), 0) /
        projectHours.length;
      totalHours += avgProjectHours;
    }
  });

  return {
    totalWeeks,
    totalHours,
    estimatedMonths: Math.ceil(totalWeeks / 4),
    estimatedYears: (totalWeeks / 52).toFixed(1),
  };
}
```

### Example 5: Resource Link Parsing

```javascript
// Extract resource metadata from URLs
function parseResource(url) {
  if (url.includes("youtube.com")) {
    return { platform: "YouTube", type: "video", icon: "🎥" };
  } else if (url.includes("coursera.org")) {
    return { platform: "Coursera", type: "course", icon: "📚" };
  } else if (url.includes("freecodecamp.org")) {
    return { platform: "freeCodeCamp", type: "tutorial", icon: "💻" };
  } else if (url.includes("github.com")) {
    return { platform: "GitHub", type: "repository", icon: "🐙" };
  } else {
    return { platform: "Web", type: "article", icon: "📄" };
  }
}
```

---

## UI/UX Recommendations

### 1. **Roadmap Overview Page**

Display all 10 steps in a visual roadmap:

```
┌─────────────┐
│   Step 1    │ ─┐
│ Fundamentals│  │
└─────────────┘  │
       ↓         │ Timeline
┌─────────────┐  │ with duration
│   Step 2    │  │
│ Intermediate│  │
└─────────────┘ ─┘
       ↓
     [...]
```

### 2. **Step Detail Page**

Show expandable/collapsible sections:

- **Header**: Step number, title, duration
- **Description**: Brief overview
- **Weekly Breakdown**: Accordion with week sections
- **Resources**: Clickable links with platform icons
- **Milestone Project**: Highlighted section with requirements checklist
- **Progress Tracker**: Checkboxes for completed weeks

### 3. **Week Cards**

Each week section should display:

```
┌──────────────────────────────────┐
│ Week 1-3        20-25 hours     │
│ ─────────────────────────────── │
│ Variables, Data Types & Operators│
│                                  │
│ ✓ Variables and constants        │
│ ✓ Primitive data types           │
│ ✓ Type conversion                │
│ ✓ Arithmetic operators           │
│ ✓ Comparison operators           │
│                                  │
│ 📚 Resources (4)                 │
│ 🎥 YouTube Tutorial              │
│ 💻 Interactive Course            │
│ 📄 Documentation                 │
│ 💡 Practice Problems             │
└──────────────────────────────────┘
```

### 4. **Milestone Project Card**

Highlight the capstone project:

```
┌──────────────────────────────────┐
│ 🎯 MILESTONE PROJECT             │
│ ================================ │
│ Build Multiple Programming       │
│ Projects                         │
│                                  │
│ Requirements:                    │
│ ☐ Calculator application         │
│ ☐ Number guessing game           │
│ ☐ To-do list manager             │
│ ☐ Basic data analyzer            │
│ ☐ Text-based game                │
│ ☐ Portfolio documentation        │
│                                  │
│ ⏱️ Estimated: 50-60 hours        │
└──────────────────────────────────┘
```

### 5. **Progress Tracking Features**

- **Checkboxes**: Mark completed weeks and subtopics
- **Progress Bar**: Visual representation of completion
- **Time Tracker**: Log actual hours spent
- **Notes Section**: Personal notes for each week
- **Certificate**: Generate upon completing all steps

### 6. **Resource Management**

- **Bookmark Resources**: Save favorite learning materials
- **Rating System**: Rate resource helpfulness
- **Alternative Resources**: Allow users to suggest alternatives
- **Offline Access**: Download resources for offline learning

### 7. **Mobile Responsiveness**

- Collapsible sections for easier navigation
- Swipeable step cards
- Bottom navigation for step switching
- Quick action buttons (mark complete, bookmark)

---

## Data Validation

### Validating Roadmap Data

```javascript
function validateStep(step) {
  const errors = [];

  // Check required fields
  if (!step.step || !step.title || !step.description || !step.duration) {
    errors.push("Missing required fields");
  }

  // Check weeks array
  if (!Array.isArray(step.weeks) || step.weeks.length === 0) {
    errors.push("Weeks array is invalid or empty");
  }

  // Validate each week
  step.weeks.forEach((week, index) => {
    if (!week.week || !week.topic) {
      errors.push(`Week ${index + 1} missing required fields`);
    }
    if (!Array.isArray(week.subtopics) || week.subtopics.length < 4) {
      errors.push(`Week ${index + 1} needs at least 4 subtopics`);
    }
    if (!Array.isArray(week.resources) || week.resources.length !== 4) {
      errors.push(`Week ${index + 1} needs exactly 4 resources`);
    }
  });

  // Validate milestone project
  if (!step.milestoneProject || !step.milestoneProject.title) {
    errors.push("Missing milestone project");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## Sample API Responses

### Success Response

```json
{
  "career": "Software Engineer",
  "roadmap": [
    // Array of 10 step objects
  ]
}
```

### Error Response

```json
{
  "error": "Career not found",
  "message": "The specified career does not exist in our database",
  "availableCareers": [
    "Software Engineer",
    "Data Scientist"
    // ... other careers
  ]
}
```

---

## Performance Considerations

### 1. **Lazy Loading**

Load steps on-demand rather than all at once:

```javascript
async function loadStep(careerName, stepNumber) {
  const roadmap = await fetchCareerRoadmap(careerName);
  return roadmap[stepNumber - 1];
}
```

### 2. **Caching**

Cache roadmap data to reduce API calls:

```javascript
const roadmapCache = new Map();

async function getCachedRoadmap(careerName) {
  if (roadmapCache.has(careerName)) {
    return roadmapCache.get(careerName);
  }

  const roadmap = await fetchCareerRoadmap(careerName);
  roadmapCache.set(careerName, roadmap);
  return roadmap;
}
```

### 3. **Pagination**

For mobile devices, load weeks progressively:

```javascript
function getWeeksPage(weeks, page = 1, perPage = 3) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    weeks: weeks.slice(start, end),
    hasMore: end < weeks.length,
    totalPages: Math.ceil(weeks.length / perPage),
  };
}
```

---

## Common Integration Patterns

### Pattern 1: Career Selection

```javascript
// User selects a career
const selectedCareer = "Software Engineer";
const roadmap = await fetchCareerRoadmap(selectedCareer);

// Display roadmap overview
displayRoadmapOverview(roadmap);

// Track user progress
const progress = loadUserProgress(userId, selectedCareer);
highlightCompletedSteps(progress);
```

### Pattern 2: Step Navigation

```javascript
// Navigate between steps
function navigateToStep(roadmap, currentStep, direction) {
  let nextStep = currentStep + direction;

  if (nextStep < 1) nextStep = 1;
  if (nextStep > roadmap.length) nextStep = roadmap.length;

  return roadmap[nextStep - 1];
}

// Usage
const nextStep = navigateToStep(roadmap, currentStep, 1); // Next
const prevStep = navigateToStep(roadmap, currentStep, -1); // Previous
```

### Pattern 3: Progress Persistence

```javascript
// Save user progress
function saveProgress(
  userId,
  careerName,
  stepNumber,
  weekCompleted,
  subtopicIndex
) {
  const progress = {
    userId,
    careerName,
    stepNumber,
    weekCompleted,
    subtopicIndex,
    timestamp: new Date().toISOString(),
  };

  // Save to localStorage or backend
  localStorage.setItem(
    `progress_${userId}_${careerName}`,
    JSON.stringify(progress)
  );
}

// Load user progress
function loadProgress(userId, careerName) {
  const key = `progress_${userId}_${careerName}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}
```

---

## Additional Features to Consider

### 1. **Learning Path Customization**

Allow users to:

- Reorder steps based on prior knowledge
- Skip prerequisites they already know
- Add custom resources
- Adjust time estimates based on their pace

### 2. **Gamification**

- **Badges**: Award badges for completing steps
- **Streaks**: Track consecutive days of learning
- **Leaderboard**: Compare progress with peers
- **Points**: Earn points for completed weeks and projects

### 3. **Community Features**

- **Discussion Forums**: Per-step discussion threads
- **Peer Reviews**: Get feedback on milestone projects
- **Study Groups**: Find learning partners
- **Mentor Matching**: Connect with experienced professionals

### 4. **Analytics Dashboard**

Track and display:

- Time spent per step
- Completion rates
- Most challenging topics
- Preferred learning resources
- Estimated completion date

---

## Testing Checklist

- [ ] API endpoint returns correct data structure
- [ ] All 18 careers are accessible
- [ ] Each career has exactly 10 steps
- [ ] Each step has 2-4 week sections
- [ ] Each week has 4-5 subtopics
- [ ] Each week has exactly 4 resources
- [ ] All URLs are valid and accessible
- [ ] Milestone projects have all required fields
- [ ] Time estimates are properly formatted
- [ ] JSON structure validates correctly
- [ ] Error handling works for invalid careers
- [ ] Progress tracking persists correctly
- [ ] Mobile responsive layout works
- [ ] Resource links open correctly
- [ ] Navigation between steps works smoothly

---

## Support and Maintenance

### Updating Roadmap Content

When updating roadmap data:

1. Maintain consistent structure across all careers
2. Ensure 4-5 subtopics per week section
3. Provide 4 diverse learning resources
4. Include realistic time estimates
5. Validate JSON structure before deployment

### Common Issues

- **Invalid Career Names**: Use exact names from the career list
- **Missing Resources**: Ensure all resource URLs are valid
- **Inconsistent Time Estimates**: Follow the format "X-Y hours"
- **Empty Weeks Array**: Each step must have weeks defined

---

## Version History

**Version 1.0** (Current)

- Complete detailed roadmaps for all 18 IT careers
- Week-by-week learning structure
- 4-5 subtopics per week section
- 4 learning resources per section
- Comprehensive milestone projects
- Time estimates for all content

---

## Contact and Support

For questions about roadmap integration or data structure:

- Review this documentation thoroughly
- Check the example code snippets
- Validate your data against the provided schemas
- Test with multiple career paths

**Data File Location**: `careerdata/roadmapData.json`

**Total Content**:

- 18 careers
- 180 steps (10 per career)
- ~450-500 week sections
- ~2,000+ subtopics
- ~1,800+ learning resources
- 180 milestone projects

---

**Last Updated**: December 16, 2025
**Documentation Version**: 1.0
**API Version**: Compatible with career_api v1.x
