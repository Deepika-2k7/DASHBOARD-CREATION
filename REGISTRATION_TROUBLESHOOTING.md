# Registration Issues - Common Causes & Solutions

## 🚨 Most Common Issues

### 1. **Duplicate Username (E11000 Error)** (Most Common)
**Error:** "Couldn't create your account" followed by "username already exists"

**Server Log:**
```
[REGISTER] Error code: 11000
[REGISTER] ERROR TYPE: Duplicate key violation
[REGISTER] Duplicate field(s): ['username']
[REGISTER] Duplicate value(s): { username: 'maya' }
```

**Solutions:**

**Option 1: Use a Different Username**
- The username 'maya' already exists in the database
- Try: 'maya2', 'maya_student', 'maya123', etc.
- Make it unique!

**Option 2: Delete the Old User**
```bash
# In MongoDB shell or Compass:
db.users.deleteOne({ username: "maya" })

# Then try signup again with same username
```

**Option 3: Clear All Users and Start Fresh**
```bash
# WARNING: This deletes ALL users!
db.users.deleteMany({})

# Restart server (indexes rebuild)
# Then try signup again
```

**Option 4: Drop and Recreate Index**
```bash
# If index is corrupted:
db.users.dropIndex("username_1")
db.users.deleteMany({})

# Restart server - index automatically rebuilds
```

---

### 2. **Missing Required Fields**
**Error:** "Missing fields" or vague error message

**Server Log:**
```
[REGISTER] ✗ Validation failed - missing required fields
[REGISTER] Missing: username=true, password=true
```

**Verification:**
- Browser console shows what was submitted:
```
[SIGNUP PAGE] Form data: {
  name: '[EMPTY]',
  username: '[EMPTY]',
  registerNumber: '[EMPTY]',
  password: '[MISSING]',
  role: '[student]'
}
```

**Required Fields:**
- ✓ `username` - Can't be empty
- ✓ `password` - Can't be empty
- ✗ `name` - Optional (uses username if empty)
- ✗ `registerNumber` - Optional
- ✗ `role` - Optional (defaults to 'student')

**Fix:**
1. Check that form inputs are properly connected to state
2. In SignupPage.tsx:
```tsx
// These must be bound correctly:
<Input value={username} onChange={(e) => setUsername(e.target.value)} />
<Input value={password} onChange={(e) => setPassword(e.target.value)} />
```

---

### 3. **Password Hashing Failed**
**Error:** "Server error" or cryptic bcrypt error

**Server Log:**
```
[REGISTER] ✗ Password hashing FAILED: {
  message: "Invalid password provided",
  passwordType: "undefined",
  passwordLength: 0
}
```

**Causes:**
- Password field is undefined/null
- Password is not a string
- Bcrypt library issue

**Fix:**
```bash
# 1. Check field is mapped correctly in form
# 2. Verify password value in frontend logs:
[SIGNUP PAGE] Form data: {
  password: '[PRESENT]'  ← Should see this
  // NOT
  password: '[MISSING]'  ← This means form didn't send it
}

# 3. If using old code, reinstall bcryptjs:
cd server
npm install bcryptjs@latest

# 4. Restart server
npm start
```

---

### 4. **Mongoose Validation Error**
**Error:** "Validation failed" with field-specific message

**Server Log:**
```
[REGISTER] Error name: ValidationError
[REGISTER] Validation failed: username: Path `username` is required.
```

**Common Causes:**
- Empty string sent for required field
- Wrong data type (e.g., number instead of string)
- Field value is `null`

**Check Schema Validation:**
```bash
# Look at User.ts model
# Required fields must be present:
username: { type: String, required: true, unique: true }
password: { type: String, required: true }
```

**Fix:**
1. Ensure frontend sends non-empty strings
2. Check for trimming:
```
const normalizedUsername = username.trim().toLowerCase();
```

---

### 5. **MongoDB Connection Not Ready**
**Error:** "Server error" or "Cannot connect to database"

**Server Log:**
```
[REGISTER] Error message: connect ECONNREFUSED 127.0.0.1:27017
```

**Verification:**
- Server startup shows:
```
[DATABASE] ✗ Connection failed
// NOT
[DATABASE] ✓ Successfully connected to MongoDB
```

**Fix:**

**If using local MongoDB:**
```bash
# 1. Start MongoDB
mongod

# 2. Verify it's running
mongo  # Should connect successfully
# OR check on port 27017
netstat -an | grep 27017
```

**If using MongoDB Atlas (cloud):**
1. Check `.env` file has correct connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/database?retryWrites=true&w=majority
```

2. Verify credentials are correct (case-sensitive!)

3. Check network access:
- Go to MongoDB Atlas → Security → Network Access
- Add your IP address if not already there
- Or add `0.0.0.0/0` for anywhere (development only!)

4. Test connection:
```bash
mongosh "mongodb+srv://username:password@cluster0.mongodb.net/database"
```

---

### 6. **CORS Blocking Registration**
**Error:** Browser shows CORS error, backend logs are empty

**Verification:**
- Browser Network tab shows request fails
- Browser console shows CORS error
- Backend logs don't show `[REGISTER] Request received`

**Server .env Missing CLIENT_URL:**
```env
CLIENT_URL=http://localhost:5173
```

**Fix:**
1. Add to `.env`:
```env
CLIENT_URL=http://localhost:5173
```

2. Restart server

3. Verify CORS logs:
```
[SERVER] CORS enabled for: http://localhost:5173
```

---

### 7. **Frontend API URL Wrong**
**Error:** No backend logs appear, network error in browser

**Verification:**
- Frontend logs show wrong URL:
```
[SIGNUP] API base URL: http://localhost:3000/api
// Should be:
[SIGNUP] API base URL: http://localhost:5000/api
```

**Fix:**
Create or update `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Then restart frontend:
```bash
cd client
npm run dev
```

---

### 8. **Server Not Running**
**Error:** "Network error" or "Can't reach server"

**Verification:**
- Browser Network tab shows 0 response from server
- Terminal shows no server running message

**Fix:**
```bash
# Start server
cd server
npm install  # If dependencies missing
npm start
# Should see:
# [SERVER] ✓ Server is running!
# [SERVER] API Base URL: http://localhost:5000/api
```

---

### 9. **Frontend Not Running**
**Error:** Can't access signup page (blank page or 404)

**Fix:**
```bash
cd client
npm install  # If dependencies missing
npm run dev
# Should see:
# Local: http://localhost:5173
```

---

### 10. **Password Length or Format Issue**
**Error:** "Couldn't create your account" with no specific message

**What May Be Happening:**
- Password might be too short (less than 1 character won't hash)
- Special characters causing issues

**Fix:**
- Try password at least 6 characters: `password123`
- Avoid very long passwords initially
- Test with simple alphanumeric: `test123`

---

## 📋 Complete Setup Verification

Run through this before signup:

```bash
# 1. Check Node.js
node --version

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Create server/.env
cat > server/.env << EOF
MONGODB_URI=mongodb://localhost:27017/dashboard
JWT_SECRET=your-super-secret-key-here
PORT=5000
CLIENT_URL=http://localhost:5173
EOF

# 4. Create client/.env (optional)
cat > client/.env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# 5. Start MongoDB
mongod

# 6. Start server (NEW terminal)
cd server
npm start
# Wait for: [DATABASE] ✓ Successfully connected to MongoDB

# 7. Start frontend (ANOTHER terminal)
cd client
npm run dev

# 8. Open http://localhost:5173
# 9. Go to signup
# 10. Create account with unique username
```

---

## 🔍 Step-by-Step Debugging

### If Signup Shows Error:

**Step 1: Check Server Terminal**
```
Look for this sequence:
[TIMESTAMP] POST /api/auth/register
[REQUEST BODY] { name: '...', username: '...', ... }
[REGISTER] Request received
[REGISTER] Field validation: ...
[REGISTER] ✓ Required fields present
[REGISTER] ✓ Username is available
[REGISTER] ✓ Password hashed successfully
[REGISTER] ✓ User saved successfully to MongoDB
[REGISTER] ✓ Registration completed successfully
```

**If you DON'T see "Request received":**
- ❌ Request not reaching server
- 🔧 Check VITE_API_URL (frontend API URL)
- 🔧 Check CORS configuration
- 🔧 Check server is actually running

**If you see "User already exists":**
- ❌ Username already taken
- 🔧 Use a different username
- 🔧 OR delete old user from MongoDB

**If "Password hashing FAILED":**
- ❌ Password wasn't sent or is invalid
- 🔧 Check form captures password correctly
- 🔧 Check password field is bound to state

**If "Error code 11000":**
- ❌ Username duplicate or other unique constraint
- 🔧 Use different username
- 🔧 Check field causing conflict in logs

**If "Error message: connect ECONNREFUSED":**
- ❌ MongoDB not running
- 🔧 Start MongoDB service
- 🔧 Check MONGODB_URI is correct

**Step 2: Check Browser Console (F12)**
```
Look for this sequence:
[SIGNUP PAGE] Form submitted
[SIGNUP PAGE] Form data: { ... }
[SIGNUP PAGE] Calling signup function...
[SIGNUP] Starting signup process
[SIGNUP] Sending POST request to /auth/register
[SIGNUP] ✓ Response received: 201
[SIGNUP] ✓ Registration completed successfully
[SIGNUP PAGE] ✓ Signup successful
```

**If you DON'T see any logs:**
- ❌ Console not open or not in correct tab
- 🔧 Press F12 and click Console tab
- 🔧 Refresh page

**If you see error status 409:**
- ❌ Username already exists
- 🔧 Try different username

**If you see error status 400:**
- ❌ Missing fields
- 🔧 Check server logs for which field

**If you see error status 500:**
- ❌ Server error
- 🔧 Check server terminal for details

**Step 3: Check Browser Network Tab**
```
1. Open DevTools (F12)
2. Click Network tab
3. Fill signup form and submit
4. Find POST request to "register"
5. Click it and check:
   - Status: Should be 201 (success)
   - Request body: Should have all fields
   - Response: Should have new user data
```

---

## 📊 Expected HTTP Responses

### Success (201 Created)
```json
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

### Duplicate Username (409 Conflict)
```json
{
  "message": "username already exists.",
  "collection": "users",
  "field": "username"
}
```

### Missing Fields (400 Bad Request)
```json
{
  "message": "Missing fields",
  "collection": "users"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "message": "Error details here",
  "collection": "users"
}
```

---

## 🎯 Quick Reference

| Problem | Check | Fix |
|---------|-------|-----|
| "Username already exists" | Server error code 11000 | Use different username |
| "Missing fields" | Server validation failed | Fill all required fields |
| "Password hashing FAILED" | Server logs show passwordType: undefined | Check form binding |
| No server logs | Network tab shows 0 requests | Check VITE_API_URL, CORS |
| "connect ECONNREFUSED" | MongoDB not running | Start mongod service |
| CORS error | Browser blocks request | Check CLIENT_URL in .env |
| Stuck on loading | No logs anywhere | Check if server running |
| Form won't submit | Frontend validation | Fill username & password |

---

## 📝 What Field Should I Use?

| Field | Purpose | Example | Required |
|-------|---------|---------|----------|
| name | Display name | "John Doe" | No (uses username) |
| username | Unique login ID | "johndoe" | **YES** |
| registerNumber | Student/staff ID | "STU001" | No |
| password | Authentication | "secret123" | **YES** |
| role | User type | "student" or "admin" | No (defaults to student) |

---

## 🚨 Emergency Fixes

### If signup completely broken:

**1. Clear Database**
```bash
# WARNING: This deletes everything!
db.users.deleteMany({})
db.users.dropIndex("username_1")

# Restart server
```

**2. Check Environment**
```bash
echo $MONGODB_URI
echo $CLIENT_URL
echo $JWT_SECRET
```

**3. Reinstall Dependencies**
```bash
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

**4. Restart Everything**
```bash
# Kill all terminals
# Start MongoDB
mongod

# Start server
cd server && npm start

# Start frontend
cd client && npm run dev
```

---

## Still Stuck?

Collect and provide:
1. **Full server logs** (from startup to registration attempt)
2. **Full browser console logs** (F12)
3. **Browser Network tab** screenshot of signup request
4. **Username/password** you're trying to use
5. **Error message** from UI toast
6. **All .env variables** (hide passwords)
7. **Node version**: `node --version`
8. **MongoDB status**: Is it running?
