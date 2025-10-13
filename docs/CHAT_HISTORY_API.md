# Chat History System API Documentation

## Overview

The Chat History System provides persistent conversation storage and management for the IT Career Chatbot. Users can create, manage, and retrieve their chat sessions with full CRUD operations.

## Base Configuration

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token required for all endpoints
- **Content-Type**: `application/json`

---

## 🔐 Authentication

All chat history endpoints require JWT authentication. Include the token in the request header:

```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

---

## 📋 Session Management Endpoints

### 1. Get User Sessions

**GET** `/chatbot/sessions`

Retrieves paginated list of user's chat sessions, ordered by last activity.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of sessions (max 50) |
| `offset` | integer | 0 | Number of sessions to skip |

**Example Request:**

```javascript
fetch("/api/chatbot/sessions?limit=10&offset=0", {
  headers: { Authorization: "Bearer your-token" },
});
```

**Success Response (200):**

```json
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "session_uuid": "sess_123_1729728000000_abc123def",
      "title": "Software Development Career",
      "created_at": "2024-10-13T10:00:00.000Z",
      "last_active": "2024-10-13T12:30:00.000Z",
      "message_count": 8
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

### 2. Create New Session

**POST** `/chatbot/sessions`

Creates a new chat session for the authenticated user.

**Request Body:**

```json
{
  "title": "My Career Discussion" // Optional
}
```

**Example Request:**

```javascript
fetch("/api/chatbot/sessions", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "UX Design Career Path",
  }),
});
```

**Success Response (201):**

```json
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1729728100000_def456ghi",
    "title": "UX Design Career Path",
    "created_at": "2024-10-13T10:01:40.000Z",
    "last_active": "2024-10-13T10:01:40.000Z",
    "message_count": 0
  }
}
```

### 3. Update Session Title

**PUT** `/chatbot/sessions/:session_uuid`

Updates the title of an existing session.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `session_uuid` | string | Session UUID to update |

**Request Body:**

```json
{
  "title": "Updated Session Title"
}
```

**Example Request:**

```javascript
fetch("/api/chatbot/sessions/sess_123_1729728100000_def456ghi", {
  method: "PUT",
  headers: {
    Authorization: "Bearer your-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Advanced UX Design Strategies",
  }),
});
```

**Success Response (200):**

```json
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1729728100000_def456ghi",
    "title": "Advanced UX Design Strategies",
    "created_at": "2024-10-13T10:01:40.000Z",
    "last_active": "2024-10-13T10:15:00.000Z"
  }
}
```

### 4. Delete Session

**DELETE** `/chatbot/sessions/:session_uuid`

Soft deletes a session (marks as deleted, preserves data).

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `session_uuid` | string | Session UUID to delete |

**Example Request:**

```javascript
fetch("/api/chatbot/sessions/sess_123_1729728100000_def456ghi", {
  method: "DELETE",
  headers: { Authorization: "Bearer your-token" },
});
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

## 💬 Message Management Endpoints

### 1. Get Session Messages

**GET** `/chatbot/sessions/:session_uuid/messages`

Retrieves all messages in a specific session with pagination.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `session_uuid` | string | Session UUID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of messages (max 100) |
| `offset` | integer | 0 | Number of messages to skip |

**Example Request:**

```javascript
fetch(
  "/api/chatbot/sessions/sess_123_1729728100000_def456ghi/messages?limit=20",
  {
    headers: { Authorization: "Bearer your-token" },
  }
);
```

**Success Response (200):**

```json
{
  "success": true,
  "session": {
    "id": 2,
    "session_uuid": "sess_123_1729728100000_def456ghi",
    "title": "UX Design Career Path",
    "created_at": "2024-10-13T10:01:40.000Z",
    "last_active": "2024-10-13T10:15:00.000Z"
  },
  "messages": [
    {
      "id": 1,
      "message_type": "user",
      "content": "What skills do I need for UX design?",
      "response_type": null,
      "career": null,
      "created_at": "2024-10-13T10:02:00.000Z",
      "metadata": null
    },
    {
      "id": 2,
      "message_type": "bot",
      "content": "For UX design, you'll need a combination of technical and soft skills...",
      "response_type": "ai_response",
      "career": "UX Designer",
      "created_at": "2024-10-13T10:02:15.000Z",
      "metadata": {
        "model": "llama-3.3-70b-versatile",
        "processing_time": 1.8,
        "tokens_used": 245
      }
    }
  ],
  "pagination": {
    "total": 6,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

### 2. Send Message (Enhanced Chatbot)

**POST** `/chatbot/chat`

Sends a message to the chatbot with optional session association. If no session is provided, a new one is created automatically.

**Request Body:**

```json
{
  "message": "What programming languages are best for web development?",
  "session_uuid": "sess_123_1729728100000_def456ghi" // Optional
}
```

**Example Request:**

```javascript
fetch("/api/chatbot/chat", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "How do I transition from graphic design to UX design?",
    session_uuid: "sess_123_1729728100000_def456ghi",
  }),
});
```

**Success Response (200):**

```json
{
  "success": true,
  "response": "Transitioning from graphic design to UX design is a natural progression. Here are the key steps you should consider...",
  "response_type": "ai_response",
  "career": "UX Designer",
  "session_uuid": "sess_123_1729728100000_def456ghi",
  "metadata": {
    "model": "llama-3.3-70b-versatile",
    "processing_time": 2.1,
    "tokens_used": 312,
    "message_saved": true
  }
}
```

**Career Info Response:**

```json
{
  "success": true,
  "response": {
    "career_name": "UX Designer",
    "description": "User Experience (UX) Designers focus on creating intuitive...",
    "average_salary": "$75,000 - $120,000",
    "skills_required": [
      "User Research",
      "Wireframing",
      "Prototyping",
      "Design Tools"
    ],
    "education_requirements": "Bachelor's degree preferred, portfolio essential",
    "job_outlook": "Strong growth expected (8-13% annually)"
  },
  "response_type": "career_info",
  "career": "UX Designer",
  "session_uuid": "sess_123_1729728100000_def456ghi",
  "metadata": {
    "data_source": "career_mapping",
    "message_saved": true
  }
}
```

---

## 🔄 Message Types and Response Types

### Message Types

- `user` - Messages sent by the user
- `bot` - Responses from the AI chatbot

### Response Types

- `career_info` - Structured career information from database
- `ai_response` - AI-generated conversational response
- `null` - For user messages (no response type)

### Career Categories Supported

The system supports all IT-related careers including:

- Software Development
- Web Development
- Data Science & Analytics
- Cybersecurity
- DevOps & Cloud Computing
- **UI/UX Design** ✨
- **Graphic Design** ✨
- Mobile App Development
- Database Administration
- Network Administration
- And more...

---

## 🔧 Frontend Integration Examples

### React Hook Implementation

```typescript
// hooks/useChatHistory.ts
import { useState, useEffect } from "react";

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

export const useChatHistory = (apiUrl: string, token: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load all user sessions
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiCall("/chatbot/sessions");
      setSessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chat session
  const createSession = async (title?: string) => {
    try {
      const data = await apiCall("/chatbot/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
      });

      const newSession = data.session;
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      throw err;
    }
  };

  // Load specific session with messages
  const loadSession = async (sessionUuid: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiCall(`/chatbot/sessions/${sessionUuid}/messages`);
      setCurrentSession(data.session);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to chatbot
  const sendMessage = async (message: string) => {
    try {
      setError(null);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now(),
        message_type: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to backend
      const data = await apiCall("/chatbot/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          session_uuid: currentSession?.session_uuid,
        }),
      });

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

      // Update current session UUID if new session was created
      if (data.session_uuid && !currentSession) {
        // Reload sessions to get the new one
        loadSessions();
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      throw err;
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionUuid: string, title: string) => {
    try {
      const data = await apiCall(`/chatbot/sessions/${sessionUuid}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      });

      // Update sessions list
      setSessions((prev) =>
        prev.map((session) =>
          session.session_uuid === sessionUuid
            ? { ...session, title: data.session.title }
            : session
        )
      );

      // Update current session if it's the one being edited
      if (currentSession?.session_uuid === sessionUuid) {
        setCurrentSession((prev) =>
          prev ? { ...prev, title: data.session.title } : null
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update title");
      throw err;
    }
  };

  // Delete session
  const deleteSession = async (sessionUuid: string) => {
    try {
      await apiCall(`/chatbot/sessions/${sessionUuid}`, {
        method: "DELETE",
      });

      // Remove from sessions list
      setSessions((prev) =>
        prev.filter((session) => session.session_uuid !== sessionUuid)
      );

      // Clear current session if it was deleted
      if (currentSession?.session_uuid === sessionUuid) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
      throw err;
    }
  };

  // Load sessions on mount
  useEffect(() => {
    if (token) {
      loadSessions();
    }
  }, [token]);

  return {
    // State
    sessions,
    currentSession,
    messages,
    isLoading,
    error,

    // Actions
    loadSessions,
    createSession,
    loadSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
  };
};
```

### Basic Chat Component

```tsx
// components/ChatInterface.tsx
import React, { useState } from "react";
import { useChatHistory } from "../hooks/useChatHistory";

interface ChatInterfaceProps {
  token: string;
  apiUrl?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  token,
  apiUrl = "http://localhost:5000/api",
}) => {
  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    error,
    createSession,
    loadSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
  } = useChatHistory(apiUrl, token);

  const [inputMessage, setInputMessage] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    try {
      // Create session if none exists
      if (!currentSession) {
        await createSession();
      }

      await sendMessage(inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTitleEdit = async (sessionUuid: string) => {
    if (!newTitle.trim()) return;

    try {
      await updateSessionTitle(sessionUuid, newTitle);
      setEditingTitle(null);
      setNewTitle("");
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const formatMessage = (message: any) => {
    if (typeof message.content === "string") {
      return message.content;
    }

    // Handle career_info response type
    if (message.response_type === "career_info") {
      const careerInfo = JSON.parse(message.content);
      return `**${careerInfo.career_name}**\n\n${
        careerInfo.description
      }\n\n**Salary:** ${
        careerInfo.average_salary
      }\n**Skills:** ${careerInfo.skills_required.join(", ")}`;
    }

    return JSON.stringify(message.content);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Sessions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => createSession()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          {error && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {sessions.map((session) => (
            <div
              key={session.session_uuid}
              className={`group p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                currentSession?.session_uuid === session.session_uuid
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => loadSession(session.session_uuid)}
            >
              {editingTitle === session.session_uuid ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => handleTitleEdit(session.session_uuid)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleTitleEdit(session.session_uuid);
                    }
                    if (e.key === "Escape") {
                      setEditingTitle(null);
                      setNewTitle("");
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.message_count} messages •{" "}
                      {new Date(session.last_active).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(session.session_uuid);
                        setNewTitle(session.title);
                      }}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                      title="Edit title"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this chat session?")) {
                          deleteSession(session.session_uuid);
                        }
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700"
                      title="Delete session"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="p-3 text-center text-gray-500 text-sm">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {currentSession ? currentSession.title : "IT Career Assistant"}
          </h1>
          <p className="text-sm text-gray-500">
            Ask me anything about IT careers, programming, design, and
            technology!
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession && messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-2">👋 Start a conversation!</p>
              <p className="text-sm">
                Ask about IT careers, programming languages, design skills, or
                career transitions.
              </p>
            </div>
          )}

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
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.message_type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {formatMessage(message)}
                </div>

                {message.career && (
                  <div className="text-xs mt-2 opacity-75">
                    💼 Career: {message.career}
                  </div>
                )}

                {message.metadata?.processing_time && (
                  <div className="text-xs mt-1 opacity-50">
                    ⚡ {message.metadata.processing_time}s
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about IT careers, programming, design, or anything tech-related..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "⏳" : "➤"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
```

---

## 🚨 Error Handling

### Common Error Responses

**Authentication Error (401):**

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**Session Not Found (404):**

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Session not found or access denied"
}
```

**Validation Error (400):**

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Message content is required"
}
```

### Error Handling Best Practices

```javascript
// Robust error handling example
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = "/login";
  } else if (error.response?.status === 404) {
    // Session not found, refresh session list
    loadSessions();
  } else {
    // Show user-friendly error message
    setError(error.response?.data?.message || "Something went wrong");
  }
};
```

---

## 🔒 Security & Performance Notes

### Security

- ✅ JWT authentication required for all endpoints
- ✅ User isolation - users only access their own data
- ✅ Input validation and sanitization
- ✅ Soft delete preserves data integrity

### Performance

- ✅ Pagination on all list endpoints
- ✅ Database indexing on frequently queried fields
- ✅ Efficient SQL queries with proper joins
- ✅ Background message persistence

### Rate Limiting Recommendations

- Implement rate limiting: 100 requests per minute per user
- Message length limits: 2000 characters per message
- Session limits: 100 active sessions per user

---

## 🧪 Testing Your Integration

Use the provided test script to verify the API:

```bash
# In your backend directory
node test_chat_history.js
```

The test script will validate all endpoints and provide a comprehensive report.

---

This documentation provides everything you need to integrate the Chat History System into your frontend. The system is fully functional and ready for production use! 🚀
