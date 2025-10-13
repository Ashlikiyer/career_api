# IT Career Chatbot - Quick Integration Reference

## 📋 Quick Setup Checklist

- [ ] Set up API base URL configuration
- [ ] Implement the two API endpoints
- [ ] Handle three response types (career_info, ai_response, scope_limitation)
- [ ] Add error handling and loading states
- [ ] Style the chat interface
- [ ] Test with sample questions

## 🔗 API Endpoints

### Get Suggestions

```
GET /api/chatbot/suggestions
```

### Ask Question

```
POST /api/chatbot/ask
Body: { "question": "Your question here" }
```

## 📱 Response Types

| Type               | Description            | Use Case                        |
| ------------------ | ---------------------- | ------------------------------- |
| `career_info`      | Structured career data | Display with special formatting |
| `ai_response`      | AI-generated answer    | Show as regular response        |
| `scope_limitation` | Off-topic redirect     | Display with helpful suggestion |

## 🎨 Minimal React Implementation

```jsx
const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { type: "user", text: message }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
      });
      const data = await res.json();

      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.response,
          responseType: data.type,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {chat.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            <pre>{msg.text}</pre>
          </div>
        ))}
        {loading && <div className="typing">Bot is typing...</div>}
      </div>
      <div className="input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about IT careers..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

## 🧪 Test Questions

### ✅ IT Questions (Should Work)

- "What is a Software Engineer?"
- "How to become a Data Scientist?"
- "Top programming languages to learn"
- "Cybersecurity engineer salary"
- "Skills needed for web development"

### ❌ Non-IT Questions (Should Redirect)

- "How to cook pasta?"
- "Weather forecast"
- "Movie recommendations"
- "Sports news"

## 🚨 Error Handling Template

```javascript
const handleError = (error) => {
  if (error.message.includes("fetch")) {
    return "Connection error. Check your internet.";
  } else if (error.message.includes("500")) {
    return "Service temporarily unavailable.";
  } else {
    return "Something went wrong. Please try again.";
  }
};
```

## 🎯 Integration Options

1. **Modal/Popup** - Floating chat button
2. **Sidebar** - Persistent help panel
3. **Page Section** - Part of career results page
4. **Full Page** - Dedicated chat interface

## 📊 Success Metrics

Monitor these to ensure good performance:

- Response time < 3 seconds
- Error rate < 5%
- User engagement (messages per session)
- Question success rate (non-redirected responses)

## 🔧 Environment Setup

```javascript
// Development
const API_URL = "http://localhost:5000";

// Production
const API_URL = "https://your-production-domain.com";
```

---

For complete implementation details, see `FRONTEND_CHATBOT_INTEGRATION_GUIDE.md`
