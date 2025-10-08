# Session Testing Guide

## Step 1: Test Basic Session Functionality

Before testing the assessment, let's verify sessions are working at all.

### Test Session Persistence

1. **Make a POST request to test session counter:**

   ```
   POST https://your-domain.com/debug/session-test
   Headers: Content-Type: application/json
   Body: {}
   ```

   Expected Response: `{ "counter": 1, "sessionID": "...", ... }`

2. **Make the SAME request again (important: use same browser/cookies):**
   Expected Response: `{ "counter": 2, "sessionID": "...", ... }`

3. **If counter doesn't increment, sessions aren't working**

### Test Session Debug Info

```
GET https://your-domain.com/debug/session
```

## Step 2: Check Your EC2 Server Logs

After deploying the changes, your server console will show detailed logs like:

```
Session Debug: {
  url: '/api/assessment/current',
  sessionID: 'xyz123',
  hasSession: true,
  assessment_id: 1
}

=== ASSESSMENT SESSION VALIDATION ===
Session ID: xyz123
Has Session: true
Session Assessment ID: 1
Request Assessment ID: 1
=====================================
```

## What to Look For

### ✅ Sessions Working (Good):

- Same `sessionID` across requests
- `Has Session: true`
- Session data persists between calls
- Counter test increments

### ❌ Sessions Not Working (Problem):

- Different `sessionID` on each request
- `Has Session: false`
- Session data doesn't persist
- Counter resets to 1

## If Sessions Aren't Working

The issue is with session storage in your EC2 environment. Possible solutions:

1. **Check if your app is behind a load balancer** (sessions might be going to different servers)
2. **Restart your Node.js process** on EC2
3. **Consider using Redis for session storage** in production

Let me know what the session test results show and I can provide more specific fixes!
