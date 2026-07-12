# Complete Debug Log Flow Reference

## Successful Registration Flow (Full Log Sequence)

### Server Startup
```
[SERVER] Starting server initialization...
[SERVER] Port: 5000
[SERVER] Client URL: http://localhost:5173
[SERVER] MongoDB URI configured: ✓ YES
[SERVER] CORS enabled for: http://localhost:5173
[SERVER] Registering routes...
[SERVER] ✓ Auth routes registered
[DATABASE] Connecting to MongoDB...
[DATABASE] ✓ Successfully connected to MongoDB
[DATABASE] Connection state: 1
[DATABASE] Database name: dashboard
[SERVER] ✓ Server is running!
```

### Frontend - Form Submission
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

### Frontend - API Call
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
```

### Backend - Request Reception
```
[2026-04-20T10:30:45.123Z] POST /api/auth/register
[REQUEST BODY] {
  name: "John Doe",
  username: "johndoe",
  registerNumber: "STU001",
  password: "[REDACTED]",
  role: "student"
}
```

### Backend - Field Validation
```
[REGISTER] Request received
[REGISTER] Request body keys: ['name', 'username', 'registerNumber', 'password', 'role']
[REGISTER] Field validation:
[REGISTER]   - name: [John Doe]
[REGISTER]   - username: [johndoe]
[REGISTER]   - registerNumber: [STU001]
[REGISTER]   - password: [PRESENT]
[REGISTER]   - role: [student]
[REGISTER] ✓ Required fields present
```

### Backend - Username Check
```
[REGISTER] Normalized username: johndoe
[REGISTER] Checking for existing user...
[REGISTER] ✓ Username is available
```

### Backend - Password Hashing
```
[REGISTER] Starting password hashing with bcrypt...
[REGISTER] Password length: 10
[REGISTER] ✓ Password hashed successfully
[REGISTER] Hash length: 60
[REGISTER] Hash starts with: $2a$10$
```

### Backend - Database Save
```
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

### Backend - Response
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "User created successfully",
  "collection": "users",
  "user": {
    "id": "65f8a3c1b2d4e5f6g7h8i9j0",
    "name": "John Doe",
    "username": "johndoe",
    "registerNumber": "STU001",
    "role": "student"
  }
}
```

### Frontend - Response Received
```
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

---

## Error Scenario: Duplicate Username

### Server Logs (E11000 Error)
```
[2026-04-20T10:35:20.456Z] POST /api/auth/register
[REQUEST BODY] {
  name: "Jane Doe",
  username: "johndoe",  ← SAME USERNAME
  registerNumber: "STU002",
  password: "[REDACTED]",
  role: "student"
}
[REGISTER] Request received
[REGISTER] Field validation:
[REGISTER]   - username: [johndoe]
[REGISTER]   - password: [PRESENT]
[REGISTER] ✓ Required fields present
[REGISTER] Normalized username: johndoe
[REGISTER] Checking for existing user...
[REGISTER] ✗ User already exists: johndoe
```

⚠️ **STOPS HERE** - Can't proceed, returns 400

OR if using newer MongoDB (might skip earlier check):

```
[REGISTER] ✓ Username is available
[REGISTER] Starting password hashing with bcrypt...
[REGISTER] ✓ Password hashed successfully
[REGISTER] User document created, attempting save to database...
[REGISTER] ✗ Database save FAILED:
[REGISTER] Error code: 11000
[REGISTER] Error name: MongoError
[REGISTER] Error message: E11000 duplicate key error collection: dashboard.users index: username_1 dup key: { username: "johndoe" }
[REGISTER] ERROR TYPE: Duplicate key violation
[REGISTER] Duplicate field(s): ['username']
[REGISTER] Duplicate value(s): { username: 'johndoe' }
```

### Backend Response
```
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "message": "username already exists.",
  "collection": "users",
  "field": "username"
}
```

### Frontend Console
```
[SIGNUP] Sending POST request to /auth/register
[SIGNUP] ✗ Signup failed
[SIGNUP] Error status: 409
[SIGNUP] Error message: username already exists.
[SIGNUP] Error field: username
[SIGNUP PAGE] ✗ Signup failed
[SIGNUP PAGE] Error status: 409
[SIGNUP PAGE] Error message: username already exists.
```

---

## Error Scenario: Missing Password

### Frontend Form
```
[SIGNUP PAGE] Form submitted
[SIGNUP PAGE] Form data: {
  name: '[John Doe]',
  username: '[johndoe]',
  registerNumber: '[STU001]',
  password: '[MISSING]',  ← EMPTY
  role: '[student]'
}
```

### Server Logs
```
[REGISTER] Request received
[REGISTER] Request body keys: ['name', 'username', 'registerNumber', 'role']
[REGISTER] Field validation:
[REGISTER]   - name: [John Doe]
[REGISTER]   - username: [johndoe]
[REGISTER]   - password: [MISSING]
[REGISTER] ✗ Validation failed - missing required fields
[REGISTER] Missing: username=false, password=true
```

### Backend Response
```
HTTP/1.1 400 Bad Request

{
  "message": "Missing fields",
  "collection": "users"
}
```

---

## Error Scenario: MongoDB Not Connected

### Server Startup
```
[SERVER] Starting server initialization...
[SERVER] MongoDB URI configured: ✓ YES
[DATABASE] Connecting to MongoDB...
[DATABASE] URI: mongodb://localhost:27017/...
[ERROR] message: "connect ECONNREFUSED 127.0.0.1:27017"
[ERROR] Stack: MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
[SERVER] ✗ Failed to start server
```

⚠️ **SERVER NEVER STARTS** - Can't attempt signup

### Fix
```bash
# Start MongoDB
mongod

# Or restart server after MongoDB is ready
cd server
npm start

# Should now see:
[DATABASE] ✓ Successfully connected to MongoDB
```

---

## Error Scenario: Password Hashing Fails

### Server Logs
```
[REGISTER] Request received
[REGISTER] Field validation:
[REGISTER]   - password: [PRESENT]
[REGISTER] ✓ Required fields present
[REGISTER] Starting password hashing with bcrypt...
[REGISTER] Password length: 10
[REGISTER] ✗ Password hashing FAILED: {
[REGISTER]   message: "Invalid password provided",
[REGISTER]   passwordType: "undefined",
[REGISTER]   passwordLength: 0
}
[REGISTER] ✗✗✗ REGISTRATION FAILED ✗✗✗
[REGISTER] Exception type: Error
[REGISTER] Error message: Password hashing failed: Invalid password provided
```

### Backend Response
```
HTTP/1.1 500 Internal Server Error

{
  "message": "Password hashing failed: Invalid password provided",
  "collection": "users"
}
```

### Cause Check
- Password value is `undefined`
- Frontend not sending password
- Bcrypt library corrupt/missing

### Fix
```bash
# Reinstall bcryptjs
cd server
npm uninstall bcryptjs
npm install bcryptjs@latest
npm start
```

---

## Error Scenario: MongoDB Connection Issue During Registration

### Server Running (but DB disconnects)
```
[REGISTER] Request received
[REGISTER] ✓ Required fields present
[REGISTER] Checking for existing user...
[REGISTER] ✗ Database save FAILED:
[REGISTER] Error message: connect ECONNREFUSED 127.0.0.1:27017
```

### Backend Response
```
HTTP/1.1 500 Internal Server Error

{
  "message": "connect ECONNREFUSED 127.0.0.1:27017",
  "collection": "users"
}
```

### Cause Check
```bash
# Check if MongoDB is still running
ps aux | grep mongod

# Or try to connect
mongo
# If this fails, MongoDB isn't running
```

### Fix
```bash
# Restart MongoDB
mongod

# And optionally restart server
cd server
npm start
```

---

## Error Scenario: CORS Blocked

### Browser Console
```
⚠️  Cross-Origin Request Blocked: The Cross-Origin Request to 
'http://localhost:5000/api/auth/register' (redirected from 
'http://localhost:5173/') has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the 
requested resource.
```

### Frontend Logs
```
[SIGNUP PAGE] Form submitted
[SIGNUP PAGE] Calling signup function...
[SIGNUP] Starting signup process
[SIGNUP] API base URL: http://localhost:5000/api
[SIGNUP] Sending POST request to /auth/register
[SIGNUP] ✗ Signup failed
[SIGNUP] Full error: AxiosError { NetworkError: Network request failed }
```

### Backend Logs
```
⚠️ NO LOGS APPEAR ⚠️
# Because the request never reaches the backend!
```

### Cause
- `.env` doesn't have `CLIENT_URL=http://localhost:5173`
- OR backend not configured for CORS
- OR wrong origin value

### Fix
```bash
# Check server/.env
cat server/.env
# Should show:
# CLIENT_URL=http://localhost:5173

# If missing, add it:
echo "CLIENT_URL=http://localhost:5173" >> server/.env

# Restart server
cd server
npm start

# Should now see:
[SERVER] CORS enabled for: http://localhost:5173
```

---

## Quick Diagnosis Decision Tree

```
Try signup → Error?
│
├─ Browser shows CORS error?
│  └─ FIX: Add CLIENT_URL to server/.env
│
├─ No server logs at all?
│  ├─ Server not running?
│  │  └─ cd server && npm start
│  ├─ Wrong API URL?
│  │  └─ Check VITE_API_URL in client/.env
│  └─ CORS blocked?
│     └─ Check CLIENT_URL setup
│
├─ Server shows "Missing fields"?
│  ├─ Check form binding (value/onChange)
│  └─ Frontend logs show [MISSING]?
│     └─ Form not capturing input
│
├─ Server shows "User already exists"?
│  ├─ Use different username
│  └─ OR delete user from MongoDB
│
├─ Server shows E11000 error (code 11000)?
│  ├─ Duplicate username
│  └─ Use different username
│
├─ Server shows "Password hashing FAILED"?
│  ├─ Reinstall bcryptjs: npm install bcryptjs@latest
│  └─ Check password is being sent
│
├─ Server shows "connect ECONNREFUSED"?
│  ├─ MongoDB not running
│  └─ Start: mongod
│
└─ Response status 201 + User data?
   └─ ✓ SUCCESS! Account created
```

---

## Monitoring the Registration Process

### Required Viewing Panes

**1. Server Terminal (`cd server && npm start`)**
- Watch for `[REGISTER]` logs
- Look for error codes
- Verify database connection

**2. Browser Console (F12 → Console)**
- Watch for `[SIGNUP PAGE]` and `[SIGNUP]` logs
- Check for CORS errors
- Verify request sent successfully

**3. Browser Network Tab (F12 → Network)**
- Find POST `/api/auth/register` request
- Check Status code (201=success, 400/409=error, 500=server error)
- Inspect Response for error details

**4. MongoDB Shell**
```bash
# Verify user was created
db.users.find({ username: "johndoe" })

# Check MongoDB is responding
db.adminCommand({ ping: 1 })
```

---

## Success Checklist

After seeing `✓ Registration completed successfully`:

- [ ] Server shows: `[REGISTER] ✓ User saved successfully to MongoDB`
- [ ] Frontend shows: `[SIGNUP PAGE] ✓ Signup successful`
- [ ] Browser shows: Success toast message
- [ ] User redirected to login page
- [ ] Can verify user in MongoDB: `db.users.findOne({ username: "..." })`
- [ ] Password starts with `$2a$10$` (bcrypt hash)
- [ ] User ID (_id) is valid ObjectId

