# Deployment Guide for AWS EC2

## Environment Variables Required for Production

Create a `.env` file in your EC2 instance with the following variables:

```bash
# Database Configuration
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=careerapp
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DIALECT=postgres

# Server Configuration
PORT=5000
NODE_ENV=production

# Session Configuration (IMPORTANT: Use a strong secret)
SESSION_SECRET=your-very-secure-session-secret-at-least-32-characters-long

# Frontend URL for CORS (CRITICAL)
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Redis for session storage (recommended for production)
# REDIS_URL=redis://localhost:6379
```

## Key Changes Made to Fix Assessment Issues

### 1. Fixed Type Comparison Issue

- The main issue was comparing integer `req.session.assessment_id` with string `assessment_id` from request
- Added proper type conversion using `parseInt()` for both values

### 2. Improved Session Configuration

- Added production-specific session settings
- Set `secure: true` for HTTPS in production
- Added `sameSite: 'none'` for cross-origin requests
- Extended session duration and added rolling sessions

### 3. Enhanced CORS Configuration

- Dynamic origin handling based on environment
- Support for multiple frontend URLs
- Better error logging for blocked origins

### 4. Added Robust Validation Middleware

- Created `assessmentValidation.js` middleware
- Centralized session validation logic
- Better error messages with error codes

### 5. Improved Error Handling and Logging

- Added comprehensive console logging
- Better error messages for debugging
- Assessment status endpoint for frontend checks

## Deployment Steps

1. **Upload your code to EC2**
2. **Install Node.js and npm**
3. **Install dependencies**: `npm install`
4. **Set up environment variables** (create `.env` file)
5. **Set up your database** (PostgreSQL recommended)
6. **Run database migrations**: `npm run migrate` (if you have migrations setup)
7. **Start the server**: `npm start` or use PM2 for production

## Using PM2 for Production (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start your app with PM2
pm2 start server.js --name "careerapp-api"

# Set PM2 to restart on server reboot
pm2 startup
pm2 save
```

## Frontend Integration Notes

Your frontend should:

1. Handle the new error code `INVALID_ASSESSMENT_SESSION`
2. Use the new `/api/assessment/status` endpoint to check assessment state
3. Properly handle CORS with credentials enabled
4. Set the correct backend URL in production

## Troubleshooting

1. **Still getting "Invalid Assessment ID"?**

   - Check that `NODE_ENV=production` is set
   - Verify `FRONTEND_URL` matches your frontend domain exactly
   - Check server logs for session validation errors

2. **CORS Issues?**

   - Ensure `FRONTEND_URL` environment variable is set correctly
   - Check that your frontend is sending cookies/credentials
   - Verify the origin in server logs

3. **Sessions not persisting?**
   - Consider using Redis for session storage in production
   - Check that cookies are being set properly in browser dev tools

## Session Storage Upgrade (Optional but Recommended)

For production, consider using Redis for session storage:

```bash
npm install connect-redis redis
```

Then update your session configuration in `server.js`.
