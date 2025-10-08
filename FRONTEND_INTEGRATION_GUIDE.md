# Backend Integration Guide for Frontend Developers

## Overview

This document outlines the restructured backend API and the changes needed for frontend integration. The main focus is on fixing the assessment flow that was causing "Invalid assessment ID" errors in production.

---

## 🚨 Critical Changes Made

### 1. Session Management Changes

- **Sessions now require cookies to be enabled**
- **Frontend must send credentials with every request**
- **Assessment state is stored in server sessions, not just tokens**

### 2. New Error Handling

- **New error codes** for better error handling
- **Enhanced validation** with specific error messages
- **Assessment session validation** is now more strict

### 3. CORS Configuration

- **Dynamic CORS** based on environment variables
- **Requires `FRONTEND_URL` environment variable** in production

---

## 🔧 Frontend Configuration Requirements

### Axios/Fetch Configuration

**CRITICAL**: All requests must include credentials for sessions to work:

```javascript
// For Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: true, // REQUIRED for sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// For Fetch
fetch(url, {
  method: "POST",
  credentials: "include", // REQUIRED for sessions
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

### Environment Variables Needed

```javascript
// .env file in frontend
REACT_APP_API_URL=https://your-backend-domain.com
# or for local development
REACT_APP_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints & Usage

### Authentication Flow

```javascript
// 1. Register User
const register = async (email, password) => {
  try {
    const response = await api.post("/api/users/register", {
      email,
      password,
    });
    return response.data; // { message: "User registered", userId: 1 }
  } catch (error) {
    throw error.response.data; // { error: "Email already exists..." }
  }
};

// 2. Login User
const login = async (email, password) => {
  try {
    const response = await api.post("/api/users/login", {
      email,
      password,
    });

    // Store token for authenticated requests
    const { token } = response.data;
    localStorage.setItem("token", token);

    // Set default authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### Assessment Flow (MAIN CHANGES)

#### 1. Start Assessment

```javascript
const startAssessment = async () => {
  try {
    const response = await api.get("/api/assessment/start");
    const { assessment_id, question_id, question_text, options_answer } =
      response.data;

    // Store assessment_id in state or context
    setCurrentAssessment({
      assessment_id,
      current_question_id: question_id,
      question_text,
      options: options_answer.split(","),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to start assessment:", error);
    throw error.response?.data || error;
  }
};
```

#### 2. Submit Answer (Updated Logic)

```javascript
const submitAnswer = async (assessmentId, questionId, selectedOption) => {
  try {
    const response = await api.post("/api/assessment/answer", {
      assessment_id: assessmentId, // Must match session
      question_id: questionId,
      selected_option: selectedOption,
    });

    // Handle different response types
    if (response.data.saveOption) {
      // Assessment completed
      return {
        completed: true,
        career_suggestion: response.data.career_suggestion,
        score: response.data.score,
        feedbackMessage: response.data.feedbackMessage,
      };
    } else {
      // Continue assessment
      return {
        completed: false,
        career: response.data.career,
        confidence: response.data.confidence,
        feedbackMessage: response.data.feedbackMessage,
        nextQuestionId: response.data.nextQuestionId,
      };
    }
  } catch (error) {
    // Handle specific error codes
    if (error.response?.data?.code === "INVALID_ASSESSMENT_SESSION") {
      // Redirect to start new assessment
      throw new Error(
        "Assessment session expired. Please start a new assessment."
      );
    }
    throw error.response?.data || error;
  }
};
```

#### 3. Get Next Question

```javascript
const getNextQuestion = async (currentQuestionId, assessmentId) => {
  try {
    const response = await api.get("/api/assessment/next", {
      params: {
        currentQuestionId,
        assessment_id: assessmentId,
      },
    });

    return {
      question_id: response.data.question_id,
      question_text: response.data.question_text,
      options: response.data.options_answer.split(","),
      assessment_id: response.data.assessment_id,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      // No more questions
      return null;
    }
    throw error.response?.data || error;
  }
};
```

#### 4. Check Assessment Status (NEW)

```javascript
const checkAssessmentStatus = async () => {
  try {
    const response = await api.get("/api/assessment/status");
    return response.data;
    /*
    Response format:
    {
      hasActiveAssessment: true/false,
      assessment_id: 1,
      currentCareer: "Software Developer",
      currentConfidence: 75,
      message: "Active assessment found"
    }
    */
  } catch (error) {
    return { hasActiveAssessment: false };
  }
};
```

#### 5. Restart Assessment

```javascript
const restartAssessment = async () => {
  try {
    const response = await api.post("/api/assessment/restart");
    return response.data; // { message, nextQuestionId: 1, assessment_id }
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## 🔄 Updated Assessment Component Logic

```javascript
import React, { useState, useEffect } from "react";

const AssessmentComponent = () => {
  const [assessmentState, setAssessmentState] = useState({
    isActive: false,
    assessment_id: null,
    currentQuestion: null,
    currentQuestionId: 1,
    career: null,
    confidence: 0,
    isCompleted: false,
  });

  // Check for existing assessment on component mount
  useEffect(() => {
    checkExistingAssessment();
  }, []);

  const checkExistingAssessment = async () => {
    try {
      const status = await checkAssessmentStatus();
      if (status.hasActiveAssessment) {
        setAssessmentState((prev) => ({
          ...prev,
          isActive: true,
          assessment_id: status.assessment_id,
          career: status.currentCareer,
          confidence: status.currentConfidence,
        }));
        // You might want to get the current question here
      }
    } catch (error) {
      console.error("Error checking assessment status:", error);
    }
  };

  const handleStartAssessment = async () => {
    try {
      const result = await startAssessment();
      setAssessmentState({
        isActive: true,
        assessment_id: result.assessment_id,
        currentQuestion: {
          id: result.question_id,
          text: result.question_text,
          options: result.options_answer.split(","),
        },
        currentQuestionId: result.question_id,
        career: null,
        confidence: 0,
        isCompleted: false,
      });
    } catch (error) {
      alert("Failed to start assessment: " + error.message);
    }
  };

  const handleSubmitAnswer = async (selectedOption) => {
    try {
      const result = await submitAnswer(
        assessmentState.assessment_id,
        assessmentState.currentQuestionId,
        selectedOption
      );

      if (result.completed) {
        // Assessment finished
        setAssessmentState((prev) => ({
          ...prev,
          isCompleted: true,
          career: result.career_suggestion,
          confidence: result.score,
        }));
      } else {
        // Get next question
        const nextQuestion = await getNextQuestion(
          assessmentState.currentQuestionId,
          assessmentState.assessment_id
        );

        if (nextQuestion) {
          setAssessmentState((prev) => ({
            ...prev,
            currentQuestion: {
              id: nextQuestion.question_id,
              text: nextQuestion.question_text,
              options: nextQuestion.options,
            },
            currentQuestionId: nextQuestion.question_id,
            career: result.career,
            confidence: result.confidence,
          }));
        }
      }
    } catch (error) {
      if (error.message.includes("session expired")) {
        // Handle session expiry
        setAssessmentState({
          isActive: false,
          assessment_id: null,
          currentQuestion: null,
          currentQuestionId: 1,
          career: null,
          confidence: 0,
          isCompleted: false,
        });
        alert(
          "Your assessment session has expired. Please start a new assessment."
        );
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  const handleRestartAssessment = async () => {
    try {
      await restartAssessment();
      handleStartAssessment(); // Start fresh
    } catch (error) {
      alert("Failed to restart assessment: " + error.message);
    }
  };

  // Rest of your component JSX...
};
```

---

## 🛠️ Error Handling Guide

### Common Error Codes and How to Handle Them:

```javascript
const handleApiError = (error) => {
  const errorData = error.response?.data;

  switch (errorData?.code) {
    case "INVALID_ASSESSMENT_SESSION":
      // Clear local assessment state and redirect to start
      setAssessmentState(initialState);
      showMessage("Assessment session expired. Please start a new assessment.");
      break;

    default:
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        redirectToLogin();
      } else if (error.response?.status === 404) {
        showMessage("Resource not found");
      } else {
        showMessage(errorData?.error || "An unexpected error occurred");
      }
  }
};
```

---

## 🚀 Profile Management Integration

```javascript
// Get user profile
const getProfile = async () => {
  try {
    const response = await api.get("/api/profiles");
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No profile exists yet
    }
    throw error.response?.data || error;
  }
};

// Update profile
const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/api/profiles", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## 💾 Saved Careers Integration

```javascript
// Save a career after assessment completion
const saveCareer = async (careerName, assessmentScore) => {
  try {
    const response = await api.post("/api/saved-careers", {
      career_name: careerName,
      assessment_score: assessmentScore,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all saved careers
const getSavedCareers = async () => {
  try {
    const response = await api.get("/api/saved-careers");
    return response.data; // Array of saved careers
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a saved career
const deleteSavedCareer = async (savedCareerId) => {
  try {
    const response = await api.delete(`/api/saved-careers/${savedCareerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## 🗺️ Roadmap Integration

```javascript
// Get roadmap for a saved career
const getRoadmap = async (savedCareerId) => {
  try {
    const response = await api.get(`/api/roadmaps/${savedCareerId}`);
    return response.data.roadmap; // Array of roadmap steps
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a roadmap step
const deleteRoadmapStep = async (roadmapId) => {
  try {
    const response = await api.delete(`/api/roadmaps/${roadmapId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## ⚡ Key Integration Points

### 1. Authentication Setup

```javascript
// Set up interceptors for automatic token handling
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 2. Session Management

```javascript
// Check session health before critical operations
const ensureValidSession = async () => {
  try {
    const response = await api.get("/health");
    return response.data.session === "active";
  } catch (error) {
    return false;
  }
};
```

---

## 🔍 Testing Integration

### Test the complete flow:

1. **Register/Login** → Verify token storage
2. **Start Assessment** → Check session cookie is set
3. **Submit Answers** → Verify session persistence
4. **Complete Assessment** → Test career saving
5. **View Roadmap** → Verify data retrieval

### Debug Common Issues:

- **"Invalid assessment ID"** → Check `withCredentials: true` is set
- **CORS errors** → Verify `FRONTEND_URL` environment variable
- **Session not persisting** → Check cookies are enabled in browser
- **401 errors** → Verify JWT token is being sent in headers

---

## 📋 Migration Checklist

- [ ] Update API client configuration with `withCredentials: true`
- [ ] Add environment variable for backend URL
- [ ] Update error handling for new error codes
- [ ] Implement assessment status checking
- [ ] Test session persistence across page refreshes
- [ ] Update assessment flow to handle session validation
- [ ] Test complete user journey from registration to roadmap viewing
- [ ] Verify production deployment with correct CORS settings
