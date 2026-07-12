# Signup Registration Debug Guide

## What Was Added

Comprehensive console logging has been added throughout the registration/signup flow to help identify exactly where the account creation fails. The logs are organized by context with `[TAG]` prefixes for easy filtering.

---

## 📋 Server-Side Logs (Backend)

### Registration Request

When you attempt to sign up, you should see detailed logs:

```
[TIMESTAMP] POST /api/auth/register
[REQUEST BODY] {
  name: "John Doe",
  username: "johndoe",
  registerNumber: "STU001",
  password: "[REDACTED]",
  role: "student"
}
[REGISTER] Request received
[REGISTER] Request body keys: ['name', 'username', 'registerNumber', 'password', 'role']
[REGISTER] Field validation:
[REGISTER]   - name: [John Doe]
[REGISTER]   - username: [johndoe]
[REGISTER]   - registerNumber: [STU001]
[REGISTER]   - password: [PRESENT]
[REGISTER]   - role: [student]
[REGISTER] ✓ Required fields present
[REGISTER] Normalized username: johndoe
[REGISTER] Checking for existing user...
[REGISTER] ✓ Username is available
[REGISTER] Starting password hashing with bcrypt...
[REGISTER] Password length: 10
[REGISTER] ✓ Password hashed successfully
[REGISTER] Hash length: 60
[REGISTER] Hash starts with: $2a$10$
[REGISTER] Creating new User document...
[REGISTER] User document created, attempting save to database...
[REGISTER] Saving user with fields: {
  name: 'John Doe',
  username: 'johndoe',
  registerNumber: 'STU001',
  password: '[HASHED]',
  role: 'student'
}
[REGISTER] ✓ User saved successfully to MongoDB
[REGISTER] New user ID: 65f8a3c1b2d4e5f6g7h8i9j0
[REGISTER] Saved user data: {
  id: '65f8a3c1b2d4e5f6g7h8i9j0',
  username: 'johndoe',
  role: 'student'
}
[REGISTER] ✓ Registration completed successfully
```

---

## 🔍 What to Look For - Error Scenarios

### Scenario 1: Missing Required Field
```
[REGISTER] Field validation:
[REGISTER]   - name: [John Doe]
[REGISTER]   - username: [MISSING]
[REGISTER]   - registerNumber: [EMPTY/OPTIONAL]
[REGISTER]   - password: [MISSING]
[REGISTER] ✗ Validation failed - missing required fields
[REGISTER] Missing: username=true, password=true
```
**Fix:** The form is not sending `username` and/or `password`. Check that input fields are properly bound to state.

### Scenario 2: Username Already Exists (Duplicate Key Error)
```
[REGISTER] ✓ Required fields present
[REGISTER] Normalized username: johndoe
[REGISTER] Checking for existing user...
[REGISTER] ✓ Username is available
[REGISTER] Starting password hashing with bcrypt...
[REGISTER] ✓ Password hashed successfully
[REGISTER] User document created, attempting save to database...
[REGISTER] ✗ Database save FAILED:
[REGISTER] Error code: 11000
[REGISTER] Error name: MongoError
[REGISTER] Error message: E11000 duplicate key error
[REGISTER] ERROR TYPE: Duplicate key violation
[REGISTER] Duplicate field(s): ['username']
[REGISTER] Duplicate value(s): { username: 'johndoe' }
```
**Fix:** 
- The username already exists in the database
- Choose a different username
- If this is a typo, delete the old user from MongoDB first

### Scenario 3: Password Hashing Failed (Bcrypt Error)
```
[REGISTER] ✓ Required fields present
[REGISTER] Starting password hashing with bcrypt...
[REGISTER] Password length: 10
[REGISTER] ✗ Password hashing FAILED: {
  message: "Invalid password provided",
  error: {...},
  passwordType: "undefined",
  passwordLength: 0
}
```
**Fix:**
- Password is `undefined` or not a string
- Check frontend form is capturing password correctly
- Verify password is being sent in request body

### Scenario 4: Database Validation Error (Mongoose Schema)
```
[REGISTER] ✗ Database save FAILED:
[REGISTER] Error name: ValidationError
[REGISTER] Error message: User validation failed
[REGISTER] Response: Mongoose validation error
[REGISTER] Validation failed: username: Path `username` is required.
```
**Fix:**
- A required field is missing or invalid
- Check all required fields are being sent
- Verify field data types match schema

### Scenario 5: MongoDB Connection Failed
```
[REGISTER] ✗ Database save FAILED:
[REGISTER] Error message: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:**
- MongoDB is not running
- Network connection to MongoDB is down
- MONGODB_URI environment variable is incorrect or points to wrong host

### Scenario 6: User Document Created But No ID Returned
```
[REGISTER] ✓ User saved successfully to MongoDB
[REGISTER] ✗ User saved but no _id returned
```
**Fix:** This is a critical error - MongoDB saved successfully but didn't return the document. Rarely happens; likely due to MongoDB driver issue.

---

## 💻 Client-Side Logs (Frontend)

### Signup Form Submission

```
[SIGNUP PAGE] Form submitted
[SIGNUP PAGE] Form data: {
  name: '[John Doe]',
  username: '[johndoe]',
  registerNumber: '[STU001]',
  password: '[PRESENT]',
  role: '[student]'
}
[SIGNUP PAGE] Calling signup function...
```

### Authentication Context - Signup

```
[SIGNUP] Starting signup process
[SIGNUP] Input data: {
  name: '[John Doe]',
  username: '[johndoe]',
  registerNumber: '[STU001]',
  password: '[PRESENT]',
  role: '[student]'
}
[SIGNUP] API base URL: http://localhost:5000/api
[SIGNUP] Sending POST request to /auth/register
[SIGNUP] ✓ Response received: 201
[SIGNUP] Response data keys: ['message', 'collection', 'user']
[SIGNUP] User created: {
  id: '65f8a3c1b2d4e5f6g7h8i9j0',
  name: 'John Doe',
  username: 'johndoe',
  registerNumber: 'STU001',
  role: 'student'
}
[SIGNUP] ✓ Registration completed successfully
[SIGNUP PAGE] ✓ Signup successful
```

### Frontend Errors

```
[SIGNUP] ✗ Signup failed
[SIGNUP] Error status: 409
[SIGNUP] Error message: username already exists.
[SIGNUP] Error field: username
[SIGNUP] Full error: AxiosError { ... }
[SIGNUP PAGE] ✗ Signup failed: AxiosError
[SIGNUP PAGE] Error status: 409
[SIGNUP PAGE] Error message: username already exists.
```

---

## 🛠️ Quick Troubleshooting Checklist

### Step 1: Check Backend Logs
- [ ] Server started successfully with database connected?
- [ ] POST request reaching `/api/auth/register`?
- [ ] All required fields (username, password) being received?
- [ ] Password hashing successful?
- [ ] Database save successful?

### Step 2: Check Frontend Logs
- [ ] Form submitted with all data?
- [ ] API base URL is `http://localhost:5000/api`?
- [ ] Response status is `201` (created)?

### Step 3: Specific Error Handling
- [ ] Error code 11000? Username already exists
- [ ] Error code undefined/null? Check backend logs for validation error
- [ ] Password hash starts with `$2a$10$`? (Bcrypt format)
- [ ] User ID (_id) returned from MongoDB?

### Step 4: Verify Configuration
- [ ] `.env` file has `MONGODB_URI`?
- [ ] `.env` file has `CLIENT_URL=http://localhost:5173`?
- [ ] Backend running on port `5000`?
- [ ] Frontend running on port `5173`?
- [ ] MongoDB running and accessible?

### Step 5: Check CORS
If frontend logs show request but backend logs are missing:
- [ ] Browser console shows CORS error?
- [ ] Client URL in `process.env.CLIENT_URL` matches frontend origin?
- [ ] Backend using correct CORS origin?

---

## 📋 Field Requirements

Based on the User schema, here's what's required:

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| username | ✓ YES | String | Unique, lowercased, trimmed |
| password | ✓ YES | String | Hashed with bcrypt, at least 6 chars recommended |
| name | ✗ NO | String | Defaults to username if empty |
| registerNumber | ✗ NO | String | Optional, used for student identification |
| role | ✗ NO | String | Defaults to "student", can be "admin" |

**Validation Output:**
```
[REGISTER] Field validation:
[REGISTER]   - name: [EMPTY] → will default to username
[REGISTER]   - username: [REQUIRED] → must be provided
[REGISTER]   - registerNumber: [EMPTY/OPTIONAL] → can be omitted
[REGISTER]   - password: [REQUIRED] → must be provided
[REGISTER]   - role: [OPTIONAL] → defaults to 'student'
```

---

## 🔐 Password Hash Details

### How to recognize a valid bcrypt hash:

```
$2a$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d
```

Pattern: `$2a$ROUNDS$SALT+HASH`

**What logs show:**
```
[REGISTER] Hash length: 60    ← Always 60 characters for bcrypt
[REGISTER] Hash starts with: $2a$10$    ← Standard bcrypt prefix
```

**If you see:**
- Hash length: 0 → Password wasn't hashed
- Hash starts with: undefined/null → Hashing failed
- Hash length: variable → Not a bcrypt hash

---

## 📊 Log Format Guide

### Log Prefixes
- `[REGISTER]` - Registration endpoint processing
- `[SIGNUP]` - Authentication context signup function
- `[SIGNUP PAGE]` - Frontend SignupPage component
- `[REQUEST BODY]` - Incoming HTTP request body
- `[TIMESTAMP]` - HTTP method and route
- `[ERROR]` - Error details with context

### Status Indicators
- `✓` - Success
- `✗` - Failure
- `✗✗✗` - Critical failure
- `[PRESENT]` - Data field exists
- `[MISSING]` - Data field is absent
- `[EMPTY]` - Field is empty string or falsy
- `[REDACTED]` - Sensitive information hidden

---

## 🚀 Testing Registration

### Test Case 1: Happy Path
```
Username: testuser1
Password: password123
Name: Test User
Register Number: STU101
Role: student
```

Expected logs:
- All fields validated ✓
- Username available ✓
- Password hashed ✓
- User saved ✓
- Response status: 201

### Test Case 2: Duplicate Username
```
Username: (use an existing username)
Password: password123
```

Expected logs:
- Finds existing user
- Error code 11000
- Response status: 409

### Test Case 3: Missing Password
```
Username: testuser2
Password: (leave empty)
```

Expected logs:
- Validation fails - missing password
- Response status: 400

---

## 🔎 Common Error Codes

| Code | Meaning | What to Check |
|------|---------|---------------|
| 201 | Created | Success! Account created |
| 400 | Bad Request | Missing required fields |
| 409 | Conflict | Username already exists (E11000) |
| 500 | Server Error | Check backend logs for details |
| Network Error | Can't reach server | Check server running, CORS, API URL |
| CORS Error | Browser blocked request | Check CLIENT_URL and origin |

---

## 🎯 MongoDB Index Issue Tips

If you keep getting "E11000 duplicate key" even after deleting users:

```bash
# 1. Drop the index
db.users.dropIndex("username_1")

# 2. Clear all users (careful!)
db.users.deleteMany({})

# 3. Restart server (index rebuilds automatically)
# Then try signup again
```

---

## Next Steps

1. **Restart both servers** with the updated code
2. **Open developer console** in browser (F12)
3. **Fill signup form** and submit
4. **Check ALL three log outputs:**
   - Terminal where server runs (Node backend logs)
   - Browser console (Frontend logs)
   - Browser Network tab (to see actual HTTP requests/responses)
5. **Match logs** to scenarios above to identify exact failure point

---

## Need More Help?

Collect and provide:
1. Full server logs (from request to response)
2. Full browser console logs
3. Browser Network tab screenshot
4. Username/password you're trying to use
5. Any error messages from the UI toast notification
