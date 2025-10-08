# Career App API - Postman Testing Documentation

## Base URL

- **Local Development**: `http://localhost:5000`
- **Production**: `https://your-ec2-domain.com` (replace with your actual domain)

## Important Notes

- All endpoints require proper headers
- Authentication endpoints use JWT tokens
- Assessment endpoints use sessions (cookies must be enabled)
- Always include `Content-Type: application/json` for POST/PUT requests

---

## 1. Authentication Endpoints

### 1.1 User Registration

**Endpoint**: `POST /api/users/register`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Expected Response (201 Created)**:

```json
{
  "message": "User registered",
  "userId": 1
}
```

**Error Response (400 Bad Request)**:

```json
{
  "error": "Email already exists or invalid data"
}
```

### 1.2 User Login

**Endpoint**: `POST /api/users/login`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK)**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized)**:

```json
{
  "error": "Invalid credentials"
}
```

---

## 2. Profile Management

### 2.1 Get User Profile

**Endpoint**: `GET /api/profiles`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (200 OK)**:

```json
{
  "profile_id": 1,
  "user_id": 1,
  "full_name": "John Doe",
  "age": 25,
  "education_level": "Bachelor's",
  "interests": "Technology, Design",
  "created_at": "2025-10-02T10:00:00.000Z",
  "updated_at": "2025-10-02T10:00:00.000Z"
}
```

### 2.2 Update User Profile

**Endpoint**: `PUT /api/profiles`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:

```json
{
  "full_name": "John Doe Updated",
  "age": 26,
  "education_level": "Master's",
  "interests": "Technology, Design, AI"
}
```

**Expected Response (200 OK)**:

```json
{
  "message": "Profile updated successfully",
  "profile": {
    "profile_id": 1,
    "user_id": 1,
    "full_name": "John Doe Updated",
    "age": 26,
    "education_level": "Master's",
    "interests": "Technology, Design, AI"
  }
}
```

---

## 3. Assessment Flow (MAIN FEATURE)

⚠️ **Important**: For assessment endpoints, you must enable "Send cookies" in Postman settings or the session won't work properly.

### 3.1 Start Assessment

**Endpoint**: `GET /api/assessment/start`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (200 OK)**:

```json
{
  "question_id": 1,
  "question_text": "What activity are you most passionate about?",
  "options_answer": "Solving computing problems,Creating visual designs,Analyzing data patterns,Ensuring software quality",
  "career_category": "default",
  "assessment_id": 1
}
```

**Notes**:

- This creates a new assessment and returns the first question
- Save the `assessment_id` for subsequent requests
- Postman will automatically handle the session cookie

### 3.2 Check Assessment Status

**Endpoint**: `GET /api/assessment/status`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (200 OK)**:

```json
{
  "hasActiveAssessment": true,
  "assessment_id": 1,
  "currentCareer": "Software Developer",
  "currentConfidence": 75,
  "message": "Active assessment found"
}
```

### 3.3 Submit Answer

**Endpoint**: `POST /api/assessment/answer`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:

```json
{
  "assessment_id": 1,
  "question_id": 1,
  "selected_option": "Solving computing problems"
}
```

**Expected Response (200 OK)**:

```json
{
  "career": "Software Developer",
  "confidence": 25,
  "feedbackMessage": "Starting assessment! You're at 25% confidence for Software Developer.",
  "nextQuestionId": 2
}
```

**Assessment Completion Response (201 Created)**:

```json
{
  "message": "Assessment completed",
  "career_suggestion": "Software Developer",
  "score": 85,
  "feedbackMessage": "Assessment completed! We suggest Software Developer with 85% confidence.",
  "saveOption": true,
  "restartOption": true
}
```

### 3.4 Get Next Question

**Endpoint**: `GET /api/assessment/next`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Query Parameters**:

```
currentQuestionId: 1
assessment_id: 1
```

**Full URL Example**:

```
GET /api/assessment/next?currentQuestionId=1&assessment_id=1
```

**Expected Response (200 OK)**:

```json
{
  "question_id": 2,
  "question_text": "Which programming concept excites you the most?",
  "options_answer": "Algorithm optimization,User interface design,Database management,System architecture",
  "career_category": "software_development",
  "assessment_id": 1
}
```

### 3.5 Restart Assessment

**Endpoint**: `POST /api/assessment/restart`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (200 OK)**:

```json
{
  "message": "Assessment restarted",
  "nextQuestionId": 1,
  "assessment_id": 2
}
```

---

## 4. Saved Careers Management

### 4.1 Save Career

**Endpoint**: `POST /api/saved-careers`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:

```json
{
  "career_name": "Software Developer",
  "assessment_score": 85
}
```

**Expected Response (201 Created)**:

```json
{
  "message": "Career saved successfully",
  "savedCareer": {
    "saved_career_id": 1,
    "user_id": 1,
    "career_name": "Software Developer",
    "assessment_score": 85
  }
}
```

### 4.2 Get Saved Careers

**Endpoint**: `GET /api/saved-careers`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (200 OK)**:

```json
[
  {
    "saved_career_id": 1,
    "user_id": 1,
    "career_name": "Software Developer",
    "assessment_score": 85,
    "saved_at": "2025-10-02T10:00:00.000Z"
  },
  {
    "saved_career_id": 2,
    "user_id": 1,
    "career_name": "Data Scientist",
    "assessment_score": 78,
    "saved_at": "2025-10-02T11:00:00.000Z"
  }
]
```

### 4.3 Delete Saved Career

**Endpoint**: `DELETE /api/saved-careers/{saved_career_id}`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**URL Example**: `DELETE /api/saved-careers/1`

**Expected Response (200 OK)**:

```json
{
  "message": "Saved career deleted successfully"
}
```

---

## 5. Roadmap Management

### 5.1 Get Career Roadmap

**Endpoint**: `GET /api/roadmaps/{saved_career_id}`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**URL Example**: `GET /api/roadmaps/1`

**Expected Response (200 OK)**:

```json
{
  "roadmap": [
    {
      "roadmap_id": 1,
      "step_title": "Learn Programming Basics",
      "step_description": "Start with fundamental programming concepts",
      "step_order": 1,
      "is_completed": false
    },
    {
      "roadmap_id": 2,
      "step_title": "Choose a Programming Language",
      "step_description": "Pick JavaScript, Python, or Java as your first language",
      "step_order": 2,
      "is_completed": false
    }
  ]
}
```

### 5.2 Delete Roadmap Step

**Endpoint**: `DELETE /api/roadmaps/{roadmap_id}`

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**URL Example**: `DELETE /api/roadmaps/1`

**Expected Response (200 OK)**:

```json
{
  "message": "Roadmap step deleted successfully"
}
```

---

## 6. Health Check

### 6.1 Server Health Check

**Endpoint**: `GET /health`

**No Headers Required**

**Expected Response (200 OK)**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T10:00:00.000Z",
  "environment": "development",
  "session": "active"
}
```

---

## Testing Flow Recommendations

### Complete Assessment Flow Test:

1. **Register a new user** → `POST /api/users/register`
2. **Login to get JWT token** → `POST /api/users/login`
3. **Start assessment** → `GET /api/assessment/start`
4. **Submit first answer** → `POST /api/assessment/answer`
5. **Get next question** → `GET /api/assessment/next`
6. **Continue submitting answers** until assessment completes
7. **Save the suggested career** → `POST /api/saved-careers`
8. **Get roadmap for saved career** → `GET /api/roadmaps/{id}`

### Error Testing:

- Try accessing protected endpoints without JWT token
- Try submitting answers with wrong assessment_id
- Try accessing assessment endpoints without starting an assessment first

## Common Error Responses

**401 Unauthorized** (Missing/Invalid JWT):

```json
{
  "error": "Access denied. No token provided."
}
```

**400 Bad Request** (Invalid Assessment Session):

```json
{
  "error": "Invalid assessment session. Please start a new assessment.",
  "code": "INVALID_ASSESSMENT_SESSION"
}
```

**404 Not Found**:

```json
{
  "message": "No more questions available"
}
```

**500 Internal Server Error**:

```json
{
  "error": "Failed to start assessment",
  "details": "Detailed error message"
}
```
