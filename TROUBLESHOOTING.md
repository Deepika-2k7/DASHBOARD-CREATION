# Authentication Issues - Common Causes & Solutions

## 🚨 Most Common Issues

### 1. **MongoDB Not Connected** (Most Likely)
**Error:** "Server error" or "User not found" (empty database)

**Verification:**
- Server logs show: `[DATABASE] ✓ Successfully connected to MongoDB`?
- Connection state is `1`?

**Solutions:**
```bash
# Check environment variable
echo $MONGODB_URI

# If empty, add to .env file:
MONGODB_URI=mongodb://localhost:27017/dashboard

# Or if using MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/dashboard?retryWrites=true&w=majority
```

**Restart server after updating .env**

---

### 2. **Missing Demo Users**
**Error:** "Incorrect username or password" even with correct credentials

**Verification:**
- Check server logs for: `[LOGIN] User not found in database`

**Solution:**
```bash
cd server
npm run seed
```

This creates demo users: `ava`, `liam`, `maya`, `noah` (all with password `password123`)

---

### 3. **Frontend API URL Mismatch**
**Error:** No backend logs appear when attempting login

**The Issue:**
- Frontend sending requests to wrong port/URL
- CORS blocking requests

**Verification:**
- Check frontend console logs for API base URL
- Should be: `http://localhost:5000/api`

**Fix:**
```env
# In client/.env (create if missing)
VITE_API_URL=http://localhost:5000/api
```

**Restart frontend after updating**

---

### 4. **CORS Not Configured**
**Error:** Browser shows CORS error, backend logs are empty

**Verification:**
- Browser Network tab shows request fails
- Browser console shows CORS error

**Check:**
```bash
# Server should have CLIENT_URL set
echo $CLIENT_URL

# Should match frontend origin:
# http://localhost:5173
```

**Update .env:**
```env
CLIENT_URL=http://localhost:5173
```

---

### 5. **Password Hash Corrupted**
**Error:** "Password comparison result: false" even with correct password

**Verification:**
- Server logs show user found
- Password comparison fails
- Stored password hash exists

**Solution:**
- Delete the corrupted user: `db.users.deleteOne({ username: "maya" })`
- Recreate via signup with new user
- OR run seed script to recreate demo users

---

### 6. **Server Not Running or Wrong Port**
**Error:** Frontend shows "Network Error" or connection refused

**Verification:**
- Terminal shows `[SERVER] ✓ Server is running!`?
- Is it on port 5000?

**Solution:**
```bash
cd server

# Install dependencies if needed
npm install

# Start server
npm start
# or
node src/index.ts
```

---

### 7. **Frontend Not Running**
**Error:** Can't access login page (frontend not loading)

**Solution:**
```bash
cd client
npm install
npm run dev
# Should see: Local: http://localhost:5173
```

---

## 📋 Complete Setup Verification

Run through this before debugging:

```bash
# 1. Check Node.js is installed
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

# 4. Create client/.env (optional but recommended)
cat > client/.env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# 5. Start MongoDB
mongod

# 6. In NEW terminal, start server
cd server
npm start

# 7. In ANOTHER terminal, start frontend
cd client
npm run dev

# 8. Open http://localhost:5173 in browser
# 9. Try login with demo user: maya / password123
```

---

## 🔎 Step-by-Step Debugging Process

### If Login Shows Error:

**Step 1: Check Server Terminal**
```
Look for these lines in order:
[LOGIN] Request received
[LOGIN] Received username: [maya]
[LOGIN] Received password: [PRESENT]
[LOGIN] User found, ID: ...
[LOGIN] Password comparison result: true
```

**If you DON'T see "Request received":**
- ❌ Request not reaching server
- 🔧 Check frontend API URL (VITE_API_URL)
- 🔧 Check CORS configuration
- 🔧 Check server is actually running

**If you see "User not found":**
- ❌ User doesn't exist in database
- 🔧 Run `npm run seed` to create demo users
- 🔧 Or check username spelling

**If "Password comparison result: false":**
- ❌ Wrong password or corrupted hash
- 🔧 Try password `password123` with demo users
- 🔧 Delete user and recreate

**Step 2: Check Browser Console**
```
Look for these in order:
[LOGIN PAGE] Form submitted
[LOGIN PAGE] Calling login function...
[LOGIN] Starting login process for user: maya
[LOGIN] ✓ Response received: 200
[LOGIN] ✓ Session stored successfully
```

**If you DON'T see any logs:**
- ❌ Browser console not open or different tab
- 🔧 Press F12 and select Console tab
- 🔧 Refresh page (Ctrl+R)

**If you see error status 401 or 500:**
- Check server logs (Step 1) for the actual error

**Step 3: Check Browser Network Tab**
```
1. Open DevTools (F12)
2. Click Network tab
3. Click login button
4. Find POST request to "login"
5. Click it and check:
   - Status: Should be 200 (success)
   - Request body: Should have username & password
   - Response: Should have token & user data
```

---

## 🧪 Minimal Test Script

If everything fails, test backend directly:

```bash
# 1. Test server is responding
curl http://localhost:5000/api/health

# 2. Test login endpoint (replace with actual user)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"maya","password":"password123"}'
```

---

## 📝 Logs You Should See

### Successful Login Flow

**Server Terminal:**
```
[TIMESTAMP] POST /api/auth/login
[REQUEST BODY] { username: "maya", password: "[REDACTED]" }
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
[LOGIN] Response payload prepared, sending: { userId: '...', username: 'maya', role: 'student' }
```

**Browser Console:**
```
[LOGIN PAGE] Form submitted
[LOGIN PAGE] Username: maya
[LOGIN PAGE] Password: [PRESENT]
[LOGIN PAGE] Calling login function...
[LOGIN] Starting login process for user: maya
[LOGIN] API base URL: http://localhost:5000/api
[LOGIN] Sending POST request to /auth/login
[LOGIN] ✓ Response received: 200
[LOGIN] Response data keys: ['token', 'user']
[LOGIN] Token received: ✓ YES
[LOGIN] User data: { id: '...', name: 'Maya', username: 'maya', role: 'student' }
[LOGIN] ✓ Session stored successfully
[LOGIN PAGE] ✓ Login successful
```

---

## ❓ Still Not Working?

### Collect Debug Information

Before asking for help, collect:

1. **Full server startup logs** (from `[SERVER]` first message to ready)
2. **Full login attempt logs** (entire request/response flow)
3. **Full browser console logs** (F12 → Console)
4. **Browser Network tab** (show the login POST request)
5. **MongoDB status** - confirmed connected?
6. **All .env variables** (password/URI hidden is OK)
7. **Node version**: `node --version`
8. **MongoDB version**: `mongod --version`

### Save logs to file:
```bash
# Linux/Mac
npm start 2>&1 | tee server.log

# Windows PowerShell
npm start 2>&1 | tee-object -filepath server.log
```

---

## 🎯 Quick Reference

| Problem | Check | Fix |
|---------|-------|-----|
| "User not found" | Server: `[LOGIN] User not found in database` | Run seed script or signup |
| "Incorrect password" | Server: `[LOGIN] Password comparison result: false` | Check password, recreate user |
| No server logs | Browser Network tab shows 0 requests | Check VITE_API_URL, check CORS |
| "Server error" | Server shows exception | Check MongoDB connected |
| Stuck on loading | No logs at all | Check if server running, check ports |
| CORS error | Browser Network tab shows 0 requests | Check CLIENT_URL in .env |

---
