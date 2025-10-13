# IT Career Chatbot Integration Guide

## Overview

The IT Career Chatbot is a specialized virtual assistant that helps users with IT industry and career-related questions. It uses the Groq AI API to provide intelligent responses while maintaining strict focus on technology and career topics.

## Features

### 🎯 **Focused Scope**

- **ONLY** responds to IT and technology-related questions
- Filters out non-IT questions (e.g., cooking, sports, general knowledge)
- Provides polite redirection when users ask off-topic questions

### 💼 **Career Information**

- Detailed information about 16+ IT careers
- Job responsibilities and requirements
- Salary ranges and growth projections
- Career progression pathways
- Skills needed for each role

### 🤖 **AI-Powered Responses**

- Uses Groq LLaMA 3.3 70B model
- Context-aware responses
- Professional and helpful tone
- Focused on career guidance and technical advice

## API Endpoints

### 1. Ask Chatbot Question

```http
POST /api/chatbot/ask
Content-Type: application/json

{
  "question": "What is a Software Engineer?"
}
```

**Response Types:**

**Career Information Response:**

```json
{
  "response": "**Software Engineer**\n\nSoftware Engineers design, develop, and maintain software applications and systems...",
  "type": "career_info",
  "career": "Software Engineer"
}
```

**AI Generated Response:**

```json
{
  "response": "Based on current industry trends, the top IT careers in 2024 include...",
  "type": "ai_response"
}
```

**Scope Limitation Response:**

```json
{
  "response": "I'm an IT career assistant focused on helping with technology and career-related questions...",
  "type": "scope_limitation"
}
```

### 2. Get Question Suggestions

```http
GET /api/chatbot/suggestions
```

**Response:**

```json
{
  "suggestions": [
    "What is a Software Engineer?",
    "What skills do I need for Data Science?",
    "How to become a Web Developer?",
    "What's the salary range for UX/UI Designer?",
    "Top programming languages to learn in 2024"
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

## Supported Career Information

The chatbot has detailed information about these IT careers:

1. **Software Engineer** - Design and develop software applications
2. **Data Scientist** - Analyze data to make business decisions
3. **Web Developer** - Build and maintain websites
4. **UX/UI Designer** - Create user-friendly interfaces
5. **QA Tester** - Ensure software quality
6. **Cybersecurity Engineer** - Protect from digital threats
7. **Mobile App Developer** - Create mobile applications
8. **Backend Developer** - Server-side development
9. **Frontend Developer** - Client-side development
10. **Machine Learning Engineer** - Build AI/ML systems
11. **Database Administrator** - Manage database systems
12. **Systems Administrator** - Maintain IT infrastructure
13. **Computer Systems Analyst** - Analyze and improve systems
14. **Game Developer** - Create video games
15. **DevOps Engineer** - Bridge development and operations
16. **Business Intelligence Analyst** - Transform data into insights

## IT Keywords Filtering

The chatbot recognizes these categories of IT-related terms:

### Career Terms

- career, job, salary, skills, requirements, developer, engineer, programmer, analyst, designer, tester, administrator, architect, manager

### Technology Terms

- programming, coding, software, web, mobile, database, cloud, ai, ml, javascript, python, java, react, node, sql, aws, azure, docker

### IT Concepts

- technology, computer, system, network, security, data, algorithm, framework, api, frontend, backend, fullstack, devops, cybersecurity

### Learning Terms

- learn, study, course, certification, degree, bootcamp, tutorial, roadmap, path, guide, resources, books, practice

### Industry Terms

- it, tech, startup, company, remote, freelance, interview, resume, portfolio, github, project, experience, internship

## Frontend Integration Examples

### Basic Chat Interface

```javascript
// Send question to chatbot
const askChatbot = async (question) => {
  try {
    const response = await fetch("/api/chatbot/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (data.type === "scope_limitation") {
      // Handle off-topic question
      displayLimitationMessage(data.response);
    } else if (data.type === "career_info") {
      // Handle career-specific information
      displayCareerInfo(data.response, data.career);
    } else {
      // Handle AI-generated response
      displayAIResponse(data.response);
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    displayError("Failed to get response from chatbot");
  }
};
```

### Load Suggested Questions

```javascript
// Get suggested questions for better UX
const loadSuggestions = async () => {
  try {
    const response = await fetch("/api/chatbot/suggestions", {
      credentials: "include",
    });
    const data = await response.json();

    displaySuggestions(data.suggestions, data.categories);
  } catch (error) {
    console.error("Failed to load suggestions:", error);
  }
};
```

### React Component Example

```jsx
import React, { useState, useEffect } from "react";

const ITChatbot = () => {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch("/api/chatbot/suggestions", {
        credentials: "include",
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const askQuestion = async (questionText) => {
    if (!questionText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: questionText }),
      });

      const data = await response.json();

      setResponses((prev) => [
        ...prev,
        {
          question: questionText,
          response: data.response,
          type: data.type,
          career: data.career,
          timestamp: new Date(),
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error("Chatbot error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-history">
        {responses.map((item, index) => (
          <div key={index} className="chat-item">
            <div className="user-question">{item.question}</div>
            <div className={`bot-response ${item.type}`}>
              <pre>{item.response}</pre>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && askQuestion(question)}
          placeholder="Ask me about IT careers..."
          disabled={loading}
        />
        <button onClick={() => askQuestion(question)} disabled={loading}>
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      <div className="suggestions">
        <h4>Suggested Questions:</h4>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => askQuestion(suggestion)}
            className="suggestion-btn"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ITChatbot;
```

## Response Formatting

### Career Information Format

When the chatbot detects a specific career question, it provides structured information:

- Career title and description
- Key responsibilities (bulleted list)
- Required skills (bulleted list)
- Salary range
- Job growth outlook
- Career progression path

### AI Response Format

For general IT questions, the AI provides:

- Comprehensive, contextual answers
- Professional tone
- Actionable advice
- Resource recommendations when appropriate

### Scope Limitation Format

For non-IT questions:

- Polite explanation of chatbot's focus
- List of supported topic areas
- Encouragement to ask IT-related questions

## Best Practices

### 1. User Experience

- Show typing indicators during API calls
- Implement message history/chat log
- Provide quick suggestion buttons
- Handle errors gracefully

### 2. Performance

- Cache suggestions to reduce API calls
- Implement debouncing for rapid questions
- Show loading states appropriately

### 3. Error Handling

- Network connectivity issues
- API rate limiting
- Invalid responses
- Timeout scenarios

### 4. Integration Tips

- Use the chatbot alongside your career assessment results
- Link career information to your roadmap system
- Cross-reference with saved careers feature
- Integrate with user profiles for personalized responses

## Testing the Chatbot

### Test IT-Related Questions:

✅ "What is a Software Engineer?"
✅ "How to become a Data Scientist?"
✅ "Top programming languages in 2024"
✅ "Salary range for UX Designer"
✅ "Skills needed for cybersecurity"

### Test Non-IT Questions:

❌ "How to cook pasta?"
❌ "Best restaurants in New York"
❌ "Weather forecast"
❌ "Sports news"
❌ "Movie recommendations"

### Expected Responses:

- IT questions: Detailed, helpful responses
- Non-IT questions: Polite redirection message
- Career-specific questions: Structured career information
- General tech questions: AI-powered contextual responses

## Security & Configuration

### Environment Variables

```env
# Already configured in your Groq setup
GROQ_API_KEY=your_groq_api_key_here
```

### Rate Limiting Considerations

- The chatbot uses the same Groq API as your career suggestions
- Consider implementing rate limiting per user/session if needed
- Monitor API usage for cost management

## Future Enhancements

### Potential Features:

1. **User Context**: Remember user's assessment results for personalized advice
2. **Learning Progress**: Track user's learning goals and provide updates
3. **Resource Recommendations**: Suggest courses, books, tutorials
4. **Skill Gap Analysis**: Compare user skills with career requirements
5. **Industry News**: Provide latest IT industry updates
6. **Interview Prep**: Help users prepare for specific IT role interviews

This chatbot provides a solid foundation for IT career guidance while maintaining focus and providing valuable, actionable information to your users.
