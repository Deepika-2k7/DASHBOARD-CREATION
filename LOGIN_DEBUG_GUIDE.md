# Login Authentication Debug Guide

## What Was Added

Comprehensive console logging has been added throughout the authentication flow to help identify exactly where the login process fails. The logs are organized by context with `[TAG]` prefixes for easy filtering.

---

## 📋 Server-Side Logs (Backend)

### Server Startup

When the server starts, you should see:

```
[SERVER] Starting server initialization...
[SERVER] Port: 5000
[SERVER] Client URL: http://localhost:5173
[SERVER] MongoDB URI configured: ✓ YES
[SERVER] CORS enabled for: http://localhost:5173
[SERVER] Registering routes...
[SERVER] ✓ Auth routes registered
...
[DATABASE] Connecting to MongoDB...
[DATABASE] URI: mongodb+srv://... (truncated for security)
[DATABASE] ✓ Successfully connected to MongoDB
[DATABASE] Connection state: 1
[DATABASE] Database name: your_database_name
[SERVER] ✓ Server is running!
[SERVER] API Base URL: http://localhost:5000/api
[SERVER] Health check: http://localhost:5000/api/health
[SERVER] Login endpoint: POST http://localhost:5000/api/auth/login
```

**What to check:**
- ✓ Is database state `1` (connected)?
- ✓ Is the correct database name showing?
- ✓ Is MongoDB URI configured?

### Login Request

When you attempt to log in, you should see detailed logs:

```
[TIMESTAMP] POST /api/auth/login
[REQUEST BODY] { username: "maya", password: "[REDACTED]" }
[LOGIN] Request received
[LOGIN] Request body keys: ['username', 'password']
[LOGIN] Received username: [maya]
[LOGIN] Received password: [PRESENT]
[LOGIN] Validation failed - missing credentials
```

OR (if validation passes):

```
[LOGIN] Request received
[LOGIN] Request body keys: ['username', 'password']
[LOGIN] Received username: [maya]
[LOGIN] Received password: [PRESENT]
[LOGIN] Normalized username: maya
[LOGIN] Querying database for user...
[LOGIN] User found, ID: 65f8a3c1b2d4e5f6g7h8i9j0
[LOGIN] Stored password hash exists: true
[LOGIN] Comparing passwords with bcrypt...
[LOGIN] Password comparison result: true
[LOGIN] Authentication successful, building payload...
[LOGIN] Response payload prepared, sending: { userId: '65f8a3c1b2d4e5f6g7h8i9j0', username: 'maya', role: 'student' }
```

---

## 🔍 What to Look For - Error Scenarios

### Scenario 1: Request Body Is Empty
```
[LOGIN] Request body keys: []
[LOGIN] Validation failed - missing credentials
```
**Fix:** Check frontend is sending data correctly. Look for CORS issues or content-type headers.

### Scenario 2: Username Received But Not Password
```
[LOGIN] Received username: [maya]
[LOGIN] Received password: [MISSING]
```
**Fix:** The form is not capturing the password field. Check frontend LoginPage.tsx.

### Scenario 3: User Not Found
```
[LOGIN] Normalized username: maya
[LOGIN] Querying database for user...
[LOGIN] User not found in database: maya
```
**Fix:** 
- Add the user to the database via signup
- Check spelling matches exactly
- Verify database has users collection with correct data

### Scenario 4: Password Mismatch
```
[LOGIN] User found, ID: 65f8a3c1b2d4e5f6g7h8i9j0
[LOGIN] Stored password hash exists: true
[LOGIN] Comparing passwords with bcrypt...
[LOGIN] Password comparison result: false
```
**Fix:** 
- The stored password hash is corrupted, OR
- The demo password you're using is incorrect
- Try: username=`ava`, password=`password123`

### Scenario 5: Bcrypt Exception
```
[LOGIN] EXCEPTION CAUGHT: {
  message: "Invalid salt version",
  stack: "..."
}
```
**Fix:** The password hash in the database is corrupted. Reset the user or re-hash password.

### Scenario 6: Database Connection Failed
```
[DATABASE] Connecting to MongoDB...
[DATABASE] URI: mongodb+srv://...
[ERROR] message: "connect ECONNREFUSED 127.0.0.1:27017"
```
**Fix:** 
- Verify MongoDB is running
- Check MONGODB_URI environment variable is set correctly
- Check network connectivity to MongoDB Atlas (if using cloud)

---

## 💻 Client-Side Logs (Frontend)

### Login Page Form Submission

```
[LOGIN PAGE] Form submitted
[LOGIN PAGE] Username: maya
[LOGIN PAGE] Password: [PRESENT]
[LOGIN PAGE] Calling login function...
```

### Authentication Context

```
[LOGIN] Starting login process for user: maya
[LOGIN] API base URL: http://localhost:5000/api
[LOGIN] Sending POST request to /auth/login
[LOGIN] ✓ Response received: 200
[LOGIN] Response data keys: ['token', 'user']
[LOGIN] Token received: ✓ YES
[LOGIN] User data: { id: '...', name: 'Maya', username: 'maya', role: 'student' }
[LOGIN] ✓ Session stored successfully
```

### Frontend Errors

```
[LOGIN] ✗ Login failed
[LOGIN] Error status: 401
[LOGIN] Error message: Incorrect username or password.
[LOGIN] Full error: AxiosError { ... }
```

---

## 🛠️ Quick Troubleshooting Checklist

### Step 1: Check Backend Logs
- [ ] Server started successfully with database connected?
- [ ] POST request reaching `/api/auth/login`?
- [ ] Username and password being received?

### Step 2: Check Frontend Logs
- [ ] Form submitted with correct data?
- [ ] API base URL is `http://localhost:5000/api`?
- [ ] Response status is `200`?

### Step 3: Verify Configuration
- [ ] `.env` file has `MONGODB_URI`?
- [ ] `.env` file has `CLIENT_URL=http://localhost:5173`?
- [ ] Backend running on port `5000`?
- [ ] Frontend running on port `5173`?

### Step 4: Test Database Directly
```bash
# In MongoDB shell or Compass, run:
db.users.find({ username: "maya" })

# Check password field is not empty
```

### Step 5: Check CORS
If frontend logs show request but backend logs are missing, CORS is blocked:
- [ ] Browser console shows CORS error?
- [ ] Client URL in `process.env.CLIENT_URL` matches frontend origin?
- [ ] Backend using correct CORS origin?

---

## 🚀 Testing With Demo Users

The system includes demo users for testing:

| Username | Password | Role |
|----------|----------|------|
| ava | password123 | student |
| liam | password123 | student |
| maya | password123 | student |
| noah | password123 | student |

If these don't exist, run the seed script:
```bash
cd server
npm run seed
```

---

## 📊 Log Format Guide

### Log Prefixes
- `[SERVER]` - Server startup and configuration
- `[DATABASE]` - MongoDB connection
- `[REQUEST BODY]` - Incoming HTTP request body
- `[LOGIN]` - Login endpoint processing
- `[LOGIN PAGE]` - Frontend LoginPage component
- `[ERROR]` - Critical errors
- `[ERROR HANDLER]` - Unhandled exceptions

### Status Indicators
- `✓` - Success
- `✗` - Failure
- `[PRESENT]` - Data field exists
- `[MISSING]` - Data field is absent
- `[REDACTED]` - Sensitive information hidden

---

## 🔐 Important Security Notes

- Passwords are never logged in plain text (redacted as `[REDACTED]`)
- Only the first 20 and last 10 characters of MongoDB URI are shown
- Full error traces shown in development (remove in production)
- Consider removing these logs in production or make them conditional

---

## Next Steps

1. **Restart both servers** with the updated code
2. **Open developer console** in browser (F12)
3. **Attempt login** with demo credentials
4. **Check ALL three log outputs:**
   - Terminal where server runs (Node backend logs)
   - Browser console (Frontend logs)
   - Browser Network tab (to see actual HTTP requests/responses)
5. **Match logs** to scenarios above to identify exact failure point
