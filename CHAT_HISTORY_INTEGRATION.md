# Chat History System - Frontend Integration Guide

## Overview

The Chat History System provides a comprehensive ChatGPT-like experience with persistent conversations, session management, and full CRUD operations. This guide covers how to integrate the backend API endpoints with your frontend.

## API Endpoints

### Authentication Required

All chat history endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Base URL

```
http://localhost:5000/api
```

---

## 📋 Session Management

### 1. Get User Sessions

**GET** `/chatbot/sessions`

Retrieves all chat sessions for the authenticated user with pagination.

**Query Parameters:**

- `limit` (optional): Number of sessions to return (max 50, default 20)
- `offset` (optional): Number of sessions to skip (default 0)

**Response:**

```json
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "session_uuid": "sess_123_1704067200000_abc123def",
      "title": "Software Development Career Path",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_active": "2024-01-01T12:30:00.000Z",
      "message_count": 5
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

Creates a new chat session for the user.

**Request Body:**

```json
{
  "title": "My New Chat Session" // Optional, auto-generated if not provided
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1704067300000_def456ghi",
    "title": "My New Chat Session",
    "created_at": "2024-01-01T00:05:00.000Z",
    "last_active": "2024-01-01T00:05:00.000Z",
    "message_count": 0
  }
}
```

### 3. Update Session Title

**PUT** `/chatbot/sessions/:session_uuid`

Updates the title of an existing session.

**Request Body:**

```json
{
  "title": "Updated Session Title"
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1704067300000_def456ghi",
    "title": "Updated Session Title",
    "created_at": "2024-01-01T00:05:00.000Z",
    "last_active": "2024-01-01T00:10:00.000Z"
  }
}
```

### 4. Delete Session

**DELETE** `/chatbot/sessions/:session_uuid`

Soft deletes a session (marks as deleted, doesn't permanently remove).

**Response:**

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

## 💬 Message Management

### 1. Get Session Messages

**GET** `/chatbot/sessions/:session_uuid/messages`

Retrieves all messages in a specific session with pagination.

**Query Parameters:**

- `limit` (optional): Number of messages to return (max 100, default 50)
- `offset` (optional): Number of messages to skip (default 0)

**Response:**

```json
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1704067300000_def456ghi",
    "title": "Software Development Chat",
    "created_at": "2024-01-01T00:05:00.000Z",
    "last_active": "2024-01-01T00:15:00.000Z"
  },
  "messages": [
    {
      "id": 1,
      "message_type": "user",
      "content": "What programming languages should I learn?",
      "response_type": null,
      "career": null,
      "created_at": "2024-01-01T00:10:00.000Z",
      "metadata": null
    },
    {
      "id": 2,
      "message_type": "bot",
      "content": "For software development, I recommend starting with...",
      "response_type": "ai_response",
      "career": "Software Developer",
      "created_at": "2024-01-01T00:10:30.000Z",
      "metadata": {
        "model": "llama-3.3-70b-versatile",
        "processing_time": 1.2
      }
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

### 2. Send Message with Session

**POST** `/chatbot/chat`

Sends a message to the chatbot and optionally associates it with a session.

**Request Body:**

```json
{
  "message": "What are the best programming languages for beginners?",
  "session_uuid": "sess_123_1704067300000_def456ghi" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "response": "For beginners, I recommend starting with Python because...",
  "response_type": "ai_response",
  "career": "Software Developer",
  "session_uuid": "sess_123_1704067300000_def456ghi",
  "metadata": {
    "model": "llama-3.3-70b-versatile",
    "processing_time": 1.5,
    "message_saved": true
  }
}
```

---

## 🔧 Frontend Implementation Examples

### React Hook for Chat History

```typescript
import { useState, useEffect } from "react";
import axios from "axios";

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

export const useChatHistory = (token: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/chatbot/sessions");
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
    setLoading(false);
  };

  const createSession = async (title?: string) => {
    try {
      const response = await api.post("/chatbot/sessions", { title });
      const newSession = response.data.session;
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      return newSession;
    } catch (error) {
      console.error("Failed to create session:", error);
      throw error;
    }
  };

  const loadSession = async (sessionUuid: string) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/chatbot/sessions/${sessionUuid}/messages`
      );
      setCurrentSession(response.data.session);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to load session:", error);
    }
    setLoading(false);
  };

  const sendMessage = async (message: string, sessionUuid?: string) => {
    try {
      const response = await api.post("/chatbot/chat", {
        message,
        session_uuid: sessionUuid || currentSession?.session_uuid,
      });

      // Add both user message and bot response to current messages
      if (currentSession) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(), // Temporary ID
            message_type: "user",
            content: message,
            created_at: new Date().toISOString(),
          },
          {
            id: Date.now() + 1, // Temporary ID
            message_type: "bot",
            content: response.data.response,
            response_type: response.data.response_type,
            career: response.data.career,
            created_at: new Date().toISOString(),
            metadata: response.data.metadata,
          },
        ]);
      }

      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const updateSessionTitle = async (sessionUuid: string, title: string) => {
    try {
      const response = await api.put(`/chatbot/sessions/${sessionUuid}`, {
        title,
      });
      setSessions((prev) =>
        prev.map((session) =>
          session.session_uuid === sessionUuid
            ? { ...session, title: response.data.session.title }
            : session
        )
      );
      if (currentSession?.session_uuid === sessionUuid) {
        setCurrentSession((prev) =>
          prev ? { ...prev, title: response.data.session.title } : null
        );
      }
    } catch (error) {
      console.error("Failed to update session title:", error);
      throw error;
    }
  };

  const deleteSession = async (sessionUuid: string) => {
    try {
      await api.delete(`/chatbot/sessions/${sessionUuid}`);
      setSessions((prev) =>
        prev.filter((session) => session.session_uuid !== sessionUuid)
      );
      if (currentSession?.session_uuid === sessionUuid) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    fetchSessions,
    createSession,
    loadSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
  };
};
```

### Chat Interface Component

```tsx
import React, { useState } from "react";
import { useChatHistory } from "./useChatHistory";

interface ChatInterfaceProps {
  token: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ token }) => {
  const {
    sessions,
    currentSession,
    messages,
    loading,
    createSession,
    loadSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
  } = useChatHistory(token);

  const [inputMessage, setInputMessage] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      let sessionUuid = currentSession?.session_uuid;

      // Create new session if none exists
      if (!sessionUuid) {
        const newSession = await createSession();
        sessionUuid = newSession.session_uuid;
      }

      await sendMessage(inputMessage, sessionUuid);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTitleEdit = async (sessionUuid: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionUuid, newTitle);
      setEditingTitle(null);
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Session Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto">
        <div className="p-4">
          <button
            onClick={() => createSession()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Chat
          </button>
        </div>

        <div className="px-2">
          {sessions.map((session) => (
            <div
              key={session.session_uuid}
              className={`group flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 ${
                currentSession?.session_uuid === session.session_uuid
                  ? "bg-gray-200"
                  : ""
              }`}
              onClick={() => loadSession(session.session_uuid)}
            >
              {editingTitle === session.session_uuid ? (
                <input
                  type="text"
                  defaultValue={session.title}
                  onBlur={(e) =>
                    handleTitleEdit(session.session_uuid, e.target.value)
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleTitleEdit(
                        session.session_uuid,
                        e.currentTarget.value
                      );
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  autoFocus
                />
              ) : (
                <>
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.message_count} messages
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(session.session_uuid);
                      }}
                      className="p-1 hover:bg-gray-300 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.session_uuid);
                      }}
                      className="p-1 hover:bg-gray-300 rounded text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.message_type === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.message_type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="text-sm">{message.content}</div>
                {message.career && (
                  <div className="text-xs mt-1 opacity-75">
                    Career: {message.career}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-gray-300 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔍 Error Handling

### Common Error Responses

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Session not found or access denied"
}
```

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created (new session)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (session doesn't exist or no access)
- `500` - Internal Server Error

---

## 📊 Database Schema

### Sessions Table

```sql
CREATE TABLE chatbot_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  session_uuid VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### Messages Table

```sql
CREATE TABLE chatbot_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
  message_type message_type_enum NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  response_type VARCHAR(50),
  career VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

---

## 🚀 Testing

Use the provided test script to verify all functionality:

```bash
# In your API directory
node test_chat_history.js
```

This will test all endpoints and provide a comprehensive report of the system's functionality.

---

## 🔒 Security Notes

1. **Authentication**: All endpoints require valid JWT tokens
2. **User Isolation**: Users can only access their own sessions and messages
3. **Soft Delete**: Sessions are marked as deleted, not permanently removed
4. **Input Validation**: All user inputs are validated and sanitized
5. **Rate Limiting**: Consider implementing rate limiting for chat endpoints in production

---

## 📈 Performance Considerations

1. **Pagination**: All list endpoints support pagination to handle large datasets
2. **Indexing**: Database indexes are created on frequently queried fields
3. **Lazy Loading**: Load session messages only when needed
4. **Caching**: Consider caching session lists for frequently active users

---

This completes the Chat History System integration. The system provides a robust, scalable solution for persistent chat conversations with full CRUD operations and user authentication.
