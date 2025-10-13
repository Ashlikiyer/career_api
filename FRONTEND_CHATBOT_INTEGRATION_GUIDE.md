# IT Career Chatbot - Frontend Integration Guide

## 🤖 Overview

The IT Career Chatbot is an intelligent virtual assistant that helps users with technology and career-related questions. It provides focused, professional guidance on IT careers, skills, and industry insights while filtering out non-IT topics.

## 🚀 Quick Start

### API Base URL

```javascript
const API_BASE_URL = "http://localhost:5000"; // Development
// const API_BASE_URL = 'https://your-production-domain.com'; // Production
```

### Basic Implementation

```javascript
// Get chatbot suggestions
const suggestions = await fetch(`${API_BASE_URL}/api/chatbot/suggestions`);

// Ask a question
const response = await fetch(`${API_BASE_URL}/api/chatbot/ask`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ question: "What is a Software Engineer?" }),
});
```

## 📋 API Endpoints

### 1. Get Suggested Questions

**Endpoint:** `GET /api/chatbot/suggestions`

**Response:**

```json
{
  "suggestions": [
    "What is a Software Engineer?",
    "What skills do I need for Data Science?",
    "How to become a Web Developer?",
    "What's the salary range for UX/UI Designer?",
    "Top programming languages to learn in 2024",
    "Career path for Cybersecurity Engineer",
    "What does a DevOps Engineer do?",
    "How to get started in Machine Learning?",
    "Best practices for Software Testing",
    "Remote work opportunities in IT"
  ],
  "categories": [
    "Career Information",
    "Skills & Learning",
    "Salary & Growth",
    "Getting Started",
    "Industry Trends"
  ]
}
```

**Frontend Usage:**

```javascript
const loadSuggestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatbot/suggestions`, {
      credentials: "include",
    });
    const data = await response.json();

    // Display suggestions as clickable buttons
    displaySuggestions(data.suggestions);

    // Optionally group by categories
    displayCategories(data.categories);
  } catch (error) {
    console.error("Failed to load suggestions:", error);
    showErrorMessage("Unable to load question suggestions");
  }
};
```

### 2. Ask Chatbot Question

**Endpoint:** `POST /api/chatbot/ask`

**Request:**

```json
{
  "question": "What is a Software Engineer?"
}
```

**Response Types:**

#### A) Career Information Response

```json
{
  "response": "**Software Engineer**\n\nSoftware Engineers design, develop, and maintain software applications and systems.\n\n**Key Responsibilities:**\n• Write clean, efficient, and maintainable code\n• Design software architecture and systems\n• Debug and troubleshoot applications\n• Collaborate with cross-functional teams\n• Participate in code reviews and testing\n\n**Required Skills:**\n• Programming languages (Java, Python, C++)\n• Problem-solving\n• Software design patterns\n• Version control (Git)\n• Testing frameworks\n\n**Salary Range:** $70,000 - $150,000+ annually\n\n**Job Growth:** High demand with 22% job growth expected\n\n**Career Path:** Junior Developer → Senior Developer → Lead Engineer → Engineering Manager",
  "type": "career_info",
  "career": "Software Engineer"
}
```

#### B) AI-Generated Response

```json
{
  "response": "Based on current industry trends, the top programming languages to learn in 2024 include:\n\n1. **Python** - Excellent for beginners, data science, and AI\n2. **JavaScript** - Essential for web development\n3. **TypeScript** - Growing rapidly for large applications\n4. **Go** - Popular for backend and cloud services\n5. **Rust** - Emerging for systems programming\n\nI recommend starting with Python or JavaScript based on your career interests.",
  "type": "ai_response"
}
```

#### C) Scope Limitation Response

```json
{
  "response": "I'm an IT career assistant focused on helping with technology and career-related questions. I can help you with:\n\n• IT career information and guidance\n• Technology skills and learning paths\n• Software development questions\n• Career progression in tech\n• Programming and technical concepts\n\nPlease ask me something related to IT careers or technology!",
  "type": "scope_limitation"
}
```

## 🎨 Frontend Implementation Examples

### React Chat Component

```jsx
import React, { useState, useEffect } from "react";

const ITChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/suggestions`, {
        credentials: "include",
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const sendMessage = async (question) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      // Add bot response
      const botMessage = {
        type: "bot",
        content: data.response,
        responseType: data.type,
        career: data.career,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = {
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
        responseType: "error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h3>🤖 IT Career Assistant</h3>
        <p>Ask me anything about IT careers and technology!</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Hi! I'm your IT career assistant. I can help you with:</p>
            <ul>
              <li>Career information and guidance</li>
              <li>Technology skills and learning paths</li>
              <li>Programming and development questions</li>
              <li>Industry trends and opportunities</li>
            </ul>
            <p>Try asking one of the suggested questions below!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <div className="message-content">
              {message.type === "bot" &&
                message.responseType === "career_info" && (
                  <div className="career-info-badge">
                    💼 Career Information: {message.career}
                  </div>
                )}
              <pre className="message-text">{message.content}</pre>
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about IT careers, programming, skills..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? "⏳" : "📤"}
          </button>
        </form>
      </div>

      {messages.length === 0 && (
        <div className="suggestions">
          <h4>💡 Suggested Questions:</h4>
          <div className="suggestion-buttons">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-btn"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ITChatbot;
```

### Vanilla JavaScript Implementation

```javascript
class ITChatbot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.API_BASE_URL = "http://localhost:5000";
    this.messages = [];
    this.suggestions = [];
    this.isLoading = false;

    this.init();
  }

  async init() {
    this.render();
    await this.loadSuggestions();
    this.bindEvents();
  }

  async loadSuggestions() {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/api/chatbot/suggestions`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      this.suggestions = data.suggestions;
      this.renderSuggestions();
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  }

  async sendMessage(question) {
    if (!question.trim() || this.isLoading) return;

    this.addMessage("user", question);
    this.setLoading(true);

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      this.addMessage("bot", data.response, data.type, data.career);
    } catch (error) {
      console.error("Chatbot error:", error);
      this.addMessage(
        "bot",
        "Sorry, I encountered an error. Please try again.",
        "error"
      );
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(type, content, responseType = null, career = null) {
    const message = {
      type,
      content,
      responseType,
      career,
      timestamp: new Date(),
    };
    this.messages.push(message);
    this.renderMessages();
  }

  setLoading(loading) {
    this.isLoading = loading;
    const input = this.container.querySelector("#chat-input");
    const button = this.container.querySelector("#send-btn");

    input.disabled = loading;
    button.disabled = loading;
    button.textContent = loading ? "⏳" : "📤";
  }

  render() {
    this.container.innerHTML = `
      <div class="chatbot-wrapper">
        <div class="chat-header">
          <h3>🤖 IT Career Assistant</h3>
          <p>Ask me anything about IT careers and technology!</p>
        </div>
        <div id="chat-messages" class="chat-messages"></div>
        <div class="chat-input">
          <input type="text" id="chat-input" placeholder="Ask about IT careers, programming, skills...">
          <button id="send-btn">📤</button>
        </div>
        <div id="suggestions" class="suggestions">
          <h4>💡 Suggested Questions:</h4>
          <div id="suggestion-buttons" class="suggestion-buttons"></div>
        </div>
      </div>
    `;
  }

  renderMessages() {
    const messagesContainer = this.container.querySelector("#chat-messages");
    messagesContainer.innerHTML = this.messages
      .map(
        (message) => `
      <div class="message ${message.type}-message">
        ${
          message.responseType === "career_info"
            ? `<div class="career-info-badge">💼 Career Information: ${message.career}</div>`
            : ""
        }
        <pre class="message-text">${message.content}</pre>
        <div class="message-time">${message.timestamp.toLocaleTimeString()}</div>
      </div>
    `
      )
      .join("");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  renderSuggestions() {
    const suggestionsContainer = this.container.querySelector(
      "#suggestion-buttons"
    );
    suggestionsContainer.innerHTML = this.suggestions
      .map(
        (suggestion) =>
          `<button class="suggestion-btn" data-suggestion="${suggestion}">${suggestion}</button>`
      )
      .join("");
  }

  bindEvents() {
    const input = this.container.querySelector("#chat-input");
    const sendBtn = this.container.querySelector("#send-btn");
    const suggestionsContainer = this.container.querySelector(
      "#suggestion-buttons"
    );

    // Send message on button click
    sendBtn.addEventListener("click", () => {
      this.sendMessage(input.value);
      input.value = "";
    });

    // Send message on Enter key
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage(input.value);
        input.value = "";
      }
    });

    // Handle suggestion clicks
    suggestionsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-btn")) {
        const suggestion = e.target.dataset.suggestion;
        this.sendMessage(suggestion);
        input.value = "";
      }
    });
  }
}

// Initialize chatbot
document.addEventListener("DOMContentLoaded", () => {
  const chatbot = new ITChatbot("chatbot-container");
});
```

## 🎨 CSS Styling Examples

```css
/* Chatbot Container */
.chatbot-container {
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.2em;
}

.chat-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}

/* Messages */
.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.message {
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in;
}

.user-message {
  text-align: right;
}

.user-message .message-content {
  background: #667eea;
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  display: inline-block;
  max-width: 80%;
}

.bot-message .message-content {
  background: white;
  color: #333;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 4px;
  display: inline-block;
  max-width: 85%;
  border: 1px solid #e0e0e0;
}

.career-info-badge {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-bottom: 8px;
  display: inline-block;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7em;
  color: #888;
  margin-top: 4px;
}

/* Welcome Message */
.welcome-message {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #2196f3;
}

.welcome-message ul {
  margin: 12px 0;
  padding-left: 20px;
}

.welcome-message li {
  margin: 4px 0;
}

/* Input */
.chat-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.chat-input form {
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.chat-input input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.chat-input button {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.chat-input button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: scale(1.05);
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Suggestions */
.suggestions {
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.suggestions h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 0.9em;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.suggestion-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Animation */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .chatbot-container {
    margin: 0;
    border-radius: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .chat-messages {
    flex: 1;
    height: auto;
  }

  .suggestion-buttons {
    max-height: 120px;
    overflow-y: auto;
  }

  .suggestion-btn {
    font-size: 0.75em;
    padding: 6px 10px;
  }
}
```

## 📱 Integration Examples

### 1. Modal/Popup Integration

```javascript
// Add chatbot as a floating button that opens a modal
const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="floating-chat-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open IT Career Assistant"
      >
        🤖💬
      </button>

      {isOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <div className="chat-modal-header">
              <h3>IT Career Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                ✕
              </button>
            </div>
            <ITChatbot />
          </div>
        </div>
      )}
    </>
  );
};
```

### 2. Page Section Integration

```jsx
// Add to your career/assessment results page
const CareerResultsPage = ({ assessmentResults }) => {
  return (
    <div className="career-results-page">
      <div className="results-section">
        <h2>Your Career Matches</h2>
        <CareerResults results={assessmentResults} />
      </div>

      <div className="chatbot-section">
        <h2>Have Questions About Your Results?</h2>
        <p>
          Ask our IT career assistant for more information about these careers!
        </p>
        <ITChatbot />
      </div>
    </div>
  );
};
```

### 3. Sidebar Integration

```jsx
// Add as a sidebar for help/support
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <main className="main-content">{children}</main>

      <aside className="sidebar">
        <div className="sidebar-section">
          <h3>Career Assistant</h3>
          <ITChatbot />
        </div>
      </aside>
    </div>
  );
};
```

## 🔧 Advanced Features

### 1. Context Awareness

```javascript
// Pass user's assessment results for personalized responses
const askWithContext = async (question, userContext = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      question,
      context: {
        assessmentResults: userContext.assessmentResults,
        savedCareers: userContext.savedCareers,
        userProfile: userContext.userProfile,
      },
    }),
  });
  return response.json();
};
```

### 2. Question Categories

```javascript
// Filter suggestions by category
const SuggestionsWithCategories = ({ onQuestionSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = {
    all: "All Questions",
    career: "Career Information",
    skills: "Skills & Learning",
    salary: "Salary & Growth",
    "getting-started": "Getting Started",
    trends: "Industry Trends",
  };

  const filterSuggestions = (category) => {
    // Implement filtering logic based on question content
    // This would require categorizing suggestions on the backend
  };

  return (
    <div className="categorized-suggestions">
      <div className="category-tabs">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`category-tab ${
              selectedCategory === key ? "active" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filtered-suggestions">
        {filterSuggestions(selectedCategory).map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(suggestion)}
            className="suggestion-btn"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 3. Chat History

```javascript
// Save and restore chat history
const useChatHistory = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatbot-history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("chatbot-history", JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatbot-history");
  };

  return { messages, setMessages, clearHistory };
};
```

## 🚨 Error Handling

### Network Error Handling

```javascript
const handleChatbotRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Chatbot request failed:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to the chatbot service. Please check your internet connection."
      );
    } else if (error.message.includes("500")) {
      throw new Error(
        "The chatbot service is temporarily unavailable. Please try again later."
      );
    } else if (error.message.includes("429")) {
      throw new Error(
        "Too many requests. Please wait a moment before trying again."
      );
    } else {
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
};
```

### User Feedback

```javascript
const ChatbotWithErrorHandling = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const sendMessage = async (question) => {
    setError(null);

    try {
      const data = await handleChatbotRequest(
        `${API_BASE_URL}/api/chatbot/ask`,
        {
          method: "POST",
          body: JSON.stringify({ question }),
        }
      );

      // Handle success...
    } catch (error) {
      setError(error.message);
    }
  };

  const retry = () => {
    setIsRetrying(true);
    setError(null);
    // Retry last message
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <div className="chatbot-container">
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={retry} disabled={isRetrying}>
            {isRetrying ? "🔄 Retrying..." : "🔄 Retry"}
          </button>
        </div>
      )}

      {/* Rest of chatbot UI */}
    </div>
  );
};
```

## 🧪 Testing

### Unit Tests (Jest)

```javascript
// chatbot.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ITChatbot from "./ITChatbot";

// Mock fetch
global.fetch = jest.fn();

describe("ITChatbot", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("loads suggestions on mount", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suggestions: ["What is a Software Engineer?"],
        categories: ["Career Information"],
      }),
    });

    render(<ITChatbot />);

    await waitFor(() => {
      expect(
        screen.getByText("What is a Software Engineer?")
      ).toBeInTheDocument();
    });
  });

  test("sends message when form is submitted", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: [], categories: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: "Test response",
          type: "ai_response",
        }),
      });

    render(<ITChatbot />);

    const input = screen.getByPlaceholderText(/ask about it careers/i);
    const submitButton = screen.getByRole("button", { name: /📤/ });

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Test response")).toBeInTheDocument();
    });
  });
});
```

## 📊 Analytics Integration

```javascript
// Track chatbot usage
const trackChatbotEvent = (eventType, data = {}) => {
  // Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", "chatbot_interaction", {
      event_category: "chatbot",
      event_label: eventType,
      custom_parameter_1: data.question?.substring(0, 50),
      custom_parameter_2: data.responseType,
    });
  }

  // Custom analytics
  if (window.analytics) {
    window.analytics.track("Chatbot Interaction", {
      type: eventType,
      question: data.question,
      responseType: data.responseType,
      timestamp: new Date().toISOString(),
    });
  }
};

// Usage in component
const sendMessage = async (question) => {
  trackChatbotEvent("question_asked", { question });

  const response = await fetch(/* ... */);
  const data = await response.json();

  trackChatbotEvent("response_received", {
    question,
    responseType: data.type,
  });
};
```

## 🌟 Best Practices

1. **Performance Optimization**

   - Implement message pagination for long conversations
   - Use virtual scrolling for large message lists
   - Debounce typing indicators

2. **Accessibility**

   - Add proper ARIA labels
   - Ensure keyboard navigation
   - Support screen readers

3. **User Experience**

   - Show typing indicators
   - Auto-scroll to new messages
   - Persist chat history
   - Mobile-responsive design

4. **Security**

   - Sanitize user input
   - Validate responses
   - Rate limiting
   - CSRF protection

5. **Monitoring**
   - Track error rates
   - Monitor response times
   - Analyze popular questions
   - User satisfaction metrics

## 🚀 Production Deployment

1. **Environment Configuration**

```javascript
// config.js
const config = {
  development: {
    API_BASE_URL: "http://localhost:5000",
  },
  production: {
    API_BASE_URL: "https://your-api-domain.com",
  },
};

export default config[process.env.NODE_ENV || "development"];
```

2. **Build Optimization**

   - Code splitting for chatbot components
   - Lazy loading for modal versions
   - CDN for static assets
   - Service worker for offline support

3. **Monitoring & Logging**
   - Error tracking (Sentry, Bugsnag)
   - Performance monitoring
   - User interaction analytics
   - API response time tracking

The IT Career Chatbot is now ready for frontend integration! The backend provides robust, intelligent responses focused on IT careers, and this guide gives you everything needed for a professional implementation.
