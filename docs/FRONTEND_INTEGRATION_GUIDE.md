# 🚀 Chat History System - Backend Integration Guide

## Overview

This document covers the new Chat History System implemented in your Career App backend. The system provides persistent conversation storage, session management, and a ChatGPT-like experience for the IT Career Chatbot.

---

## 🔄 What Changed

### Database Schema Updates

**New Tables Added:**

- `chatbot_sessions` - Stores user chat sessions
- `chatbot_messages` - Stores individual messages within sessions

### API Endpoints Added

- **Session Management**: Create, list, update, delete chat sessions
- **Message History**: Retrieve conversation history with pagination
- **Enhanced Chatbot**: Original chatbot now supports session integration

### Authentication Integration

- JWT authentication required for all chat history endpoints
- User isolation - each user only sees their own sessions/messages
- Optional authentication for basic chatbot functionality

---

## 📋 API Endpoints Reference

### Base Configuration

```javascript
const API_BASE_URL = "http://localhost:5000/api";
const authHeaders = {
  Authorization: `Bearer ${yourJWTToken}`,
  "Content-Type": "application/json",
};
```

---

## 💬 Enhanced Chatbot Endpoint

### Send Message with Optional Session

**POST** `/chatbot/chat`

**⚡ Key Changes:**

- Now accepts `message` parameter (your frontend already uses this)
- Optional `session_uuid` parameter for chat history
- Automatically saves conversations to database when session provided
- Backward compatible with existing frontend code

**Request:**

```javascript
{
  "message": "What programming languages should I learn?",
  "session_uuid": "sess_123_1729728000000_abc123" // Optional
}
```

**Response:**

```javascript
{
  "success": true,
  "response": "For software development, I recommend starting with Python...",
  "response_type": "ai_response", // or "career_info"
  "career": "Software Developer", // If career-specific response
  "session_uuid": "sess_123_1729728000000_abc123", // If session provided
  "metadata": {
    "model": "llama-3.3-70b-versatile",
    "processing_time": 1.8,
    "message_saved": true // Indicates if conversation was saved
  }
}
```

---

## 🗂️ Session Management Endpoints

### 1. List User Sessions

**GET** `/chatbot/sessions?limit=20&offset=0`
**Auth Required:** ✅

```javascript
// Example Response
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "session_uuid": "sess_123_1729728000000_abc123",
      "title": "Software Development Career Path",
      "created_at": "2024-10-13T10:00:00.000Z",
      "last_active": "2024-10-13T12:30:00.000Z",
      "message_count": 8
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### 2. Create New Session

**POST** `/chatbot/sessions`
**Auth Required:** ✅

```javascript
// Request
{
  "title": "My New Chat Session" // Optional - auto-generated if not provided
}

// Response
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1729728100000_def456",
    "title": "My New Chat Session",
    "created_at": "2024-10-13T10:01:40.000Z",
    "last_active": "2024-10-13T10:01:40.000Z",
    "message_count": 0
  }
}
```

### 3. Get Session Messages

**GET** `/chatbot/sessions/{session_uuid}/messages?limit=50&offset=0`
**Auth Required:** ✅

```javascript
// Example Response
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1729728100000_def456",
    "title": "Software Development Chat",
    "created_at": "2024-10-13T10:01:40.000Z",
    "last_active": "2024-10-13T10:15:00.000Z"
  },
  "messages": [
    {
      "id": 1,
      "message_type": "user",
      "content": "What skills do I need for software development?",
      "response_type": null,
      "career": null,
      "created_at": "2024-10-13T10:02:00.000Z",
      "metadata": null
    },
    {
      "id": 2,
      "message_type": "bot",
      "content": "For software development, you'll need...",
      "response_type": "ai_response",
      "career": "Software Developer",
      "created_at": "2024-10-13T10:02:15.000Z",
      "metadata": {
        "model": "llama-3.3-70b-versatile",
        "processing_time": 1.8
      }
    }
  ],
  "pagination": {
    "total": 6,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

### 4. Update Session Title

**PUT** `/chatbot/sessions/{session_uuid}`
**Auth Required:** ✅

```javascript
// Request
{
  "title": "Advanced JavaScript Concepts"
}

// Response
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1729728100000_def456",
    "title": "Advanced JavaScript Concepts",
    "created_at": "2024-10-13T10:01:40.000Z",
    "last_active": "2024-10-13T10:15:00.000Z"
  }
}
```

### 5. Delete Session

**DELETE** `/chatbot/sessions/{session_uuid}`
**Auth Required:** ✅

```javascript
// Response
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

## 🛠️ Frontend Integration Examples

### Basic Service Class

```typescript
// services/chatHistoryService.ts
export class ChatHistoryService {
  private baseUrl = "http://localhost:5000/api";

  constructor(private getAuthToken: () => string) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.getAuthToken()}`,
      "Content-Type": "application/json",
    };
  }

  // Send message (existing chatbot functionality enhanced)
  async sendMessage(message: string, sessionUuid?: string) {
    const response = await fetch(`${this.baseUrl}/chatbot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        session_uuid: sessionUuid,
      }),
    });
    return response.json();
  }

  // Get user sessions
  async getSessions(limit = 20, offset = 0) {
    const response = await fetch(
      `${this.baseUrl}/chatbot/sessions?limit=${limit}&offset=${offset}`,
      { headers: this.headers }
    );
    return response.json();
  }

  // Create new session
  async createSession(title?: string) {
    const response = await fetch(`${this.baseUrl}/chatbot/sessions`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ title }),
    });
    return response.json();
  }

  // Get session messages
  async getSessionMessages(sessionUuid: string, limit = 50, offset = 0) {
    const response = await fetch(
      `${this.baseUrl}/chatbot/sessions/${sessionUuid}/messages?limit=${limit}&offset=${offset}`,
      { headers: this.headers }
    );
    return response.json();
  }

  // Update session title
  async updateSessionTitle(sessionUuid: string, title: string) {
    const response = await fetch(
      `${this.baseUrl}/chatbot/sessions/${sessionUuid}`,
      {
        method: "PUT",
        headers: this.headers,
        body: JSON.stringify({ title }),
      }
    );
    return response.json();
  }

  // Delete session
  async deleteSession(sessionUuid: string) {
    const response = await fetch(
      `${this.baseUrl}/chatbot/sessions/${sessionUuid}`,
      {
        method: "DELETE",
        headers: this.headers,
      }
    );
    return response.json();
  }
}
```

### React Hook Example

```tsx
// hooks/useChatHistory.ts
import { useState, useEffect } from "react";
import { ChatHistoryService } from "../services/chatHistoryService";

interface Session {
  id: number;
  session_uuid: string;
  title: string;
  created_at: string;
  last_active: string;
  message_count: number;
}

interface Message {
  id: number;
  message_type: "user" | "bot";
  content: string;
  response_type?: string;
  career?: string;
  created_at: string;
  metadata?: any;
}

export const useChatHistory = (getAuthToken: () => string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const service = new ChatHistoryService(getAuthToken);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await service.getSessions();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (title?: string) => {
    try {
      const data = await service.createSession(title);
      if (data.success) {
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSession(data.session);
        setMessages([]);
        return data.session;
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const loadSessionMessages = async (sessionUuid: string) => {
    try {
      setLoading(true);
      const data = await service.getSessionMessages(sessionUuid);
      if (data.success) {
        setCurrentSession(data.session);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load session messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      // Create session if none exists
      let sessionUuid = currentSession?.session_uuid;
      if (!sessionUuid) {
        const newSession = await createNewSession();
        sessionUuid = newSession?.session_uuid;
      }

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now(),
        message_type: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to backend
      const data = await service.sendMessage(message, sessionUuid);

      if (data.success) {
        // Add bot response
        const botMessage: Message = {
          id: Date.now() + 1,
          message_type: "bot",
          content:
            typeof data.response === "string"
              ? data.response
              : JSON.stringify(data.response),
          response_type: data.response_type,
          career: data.career,
          created_at: new Date().toISOString(),
          metadata: data.metadata,
        };
        setMessages((prev) => [...prev, botMessage]);

        // Reload sessions to update message count and last_active
        loadSessions();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    loadSessions,
    createNewSession,
    loadSessionMessages,
    sendMessage,
    updateSessionTitle: service.updateSessionTitle.bind(service),
    deleteSession: service.deleteSession.bind(service),
  };
};
```

---

## 🔧 Migration Steps for Existing Frontend

### Step 1: Update Existing Chatbot Component

Your existing chatbot should work **without any changes** because:

- ✅ Endpoint `/api/chatbot/chat` now exists (was 404 before)
- ✅ Accepts `message` parameter (matches your frontend)
- ✅ Returns same response format
- ✅ No breaking changes

### Step 2: Add Session Management (Optional)

If you want to add chat history features:

```tsx
// Add to your existing chatbot component
const {
  sessions,
  currentSession,
  messages,
  sendMessage,
  createNewSession,
  loadSessionMessages,
} = useChatHistory(() => localStorage.getItem("authToken"));

// Replace your existing sendMessage function with the hook's sendMessage
// It handles session creation and message persistence automatically
```

### Step 3: Add Session Sidebar (Optional)

```tsx
// Session list component
<div className="sessions-sidebar">
  <button onClick={() => createNewSession()}>New Chat</button>
  {sessions.map((session) => (
    <div
      key={session.session_uuid}
      onClick={() => loadSessionMessages(session.session_uuid)}
      className={
        currentSession?.session_uuid === session.session_uuid ? "active" : ""
      }
    >
      <div className="session-title">{session.title}</div>
      <div className="session-info">{session.message_count} messages</div>
    </div>
  ))}
</div>
```

---

## 🔍 Error Handling

### Common Error Responses

```javascript
// Authentication required (for history endpoints)
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}

// Session not found
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Session not found or access denied"
}

// Validation error
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Message content is required"
}
```

### Error Handling Pattern

```typescript
const handleApiCall = async (apiCall: () => Promise<any>) => {
  try {
    const response = await apiCall();
    if (!response.success) {
      throw new Error(response.message || "API call failed");
    }
    return response;
  } catch (error) {
    console.error("API Error:", error);
    // Handle specific errors
    if (error.message?.includes("UNAUTHORIZED")) {
      // Redirect to login or refresh token
      window.location.href = "/login";
    }
    throw error;
  }
};
```

---

## 🎯 Implementation Strategy

### Phase 1: Basic Integration (Immediate)

1. ✅ **No changes needed** - existing chatbot should work now
2. Test that 404 error is resolved
3. Verify chatbot responses are working

### Phase 2: Add Session Management (Optional)

1. Add session listing sidebar
2. Implement session creation
3. Add session switching functionality

### Phase 3: Enhanced Features (Future)

1. Session title editing
2. Session deletion
3. Message search
4. Export conversations

---

## 🚦 Testing Checklist

### Basic Functionality

- [ ] Existing chatbot works without 404 error
- [ ] Messages send and receive responses
- [ ] No breaking changes in existing functionality

### Session Features (If Implemented)

- [ ] User can create new chat sessions
- [ ] Sessions list loads correctly
- [ ] Can switch between sessions
- [ ] Messages persist in sessions
- [ ] Session titles can be updated
- [ ] Sessions can be deleted

### Authentication

- [ ] History endpoints require valid JWT token
- [ ] Users only see their own sessions
- [ ] Basic chatbot works without authentication

---

## 📞 Support & Next Steps

### Current Status

- ✅ **Server is running** on port 5000
- ✅ **All endpoints are active** and tested
- ✅ **Database tables created** and working
- ✅ **Your existing frontend should work immediately**

### Immediate Action

**Test your existing chatbot now** - the 404 error should be resolved!

### Optional Enhancements

Use the provided React hooks and service classes to add ChatGPT-like session management to your application.

---

The Chat History System is **production-ready** and fully integrated with your existing authentication system. Your chatbot will work immediately, and you can add session features at your own pace! 🚀
