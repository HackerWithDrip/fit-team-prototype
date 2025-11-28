# Railway Configuration Status & Fixes

## ✅ What's Already Correct:

1. **Root Directory**: `/backend` ✅ (Correctly set!)
2. **Public Domain**: `fit-team-prototype-production.up.railway.app` ✅ (Matches workflow)
3. **Source Repo**: Connected to GitHub ✅
4. **Branch**: `main` ✅

## ❌ What Needs to Be Fixed:

### Issue 1: Build Command Not Set
**Location**: Settings → Build → Custom Build Command

**Current**: Not set (using Railpack Default)
**Needed**: Set custom build command

**Action Required**:
1. Go to **Settings** → **Build** tab
2. Find **"Custom Build Command"** section
3. Click **"+ Build Command"**
4. Enter: `npm install && npm run build`
5. **Save**

### Issue 2: Start Command Not Set
**Location**: Settings → Deploy → Custom Start Command

**Current**: Not set
**Needed**: Set custom start command

**Action Required**:
1. Go to **Settings** → **Deploy** tab
2. Find **"Custom Start Command"** section
3. Click **"+ Start Command"**
4. Enter: `npm start`
5. **Save**

**Why**: Since Root Directory is `/backend`, Railway is already in that folder, so we don't need `cd backend` in the commands.

---

## 📋 Step-by-Step Configuration:

### Step 1: Set Build Command
1. In Railway Dashboard → **radiant-wonder** project
2. Click **fit-team-prototype** service
3. Go to **Settings** tab
4. Click **"Build"** in the right sidebar (or scroll to Build section)
5. Find **"Custom Build Command"**
6. Click **"+ Build Command"**
7. Enter: `npm install && npm run build`
8. **Save**

### Step 2: Set Start Command
1. Still in **Settings** tab
2. Click **"Deploy"** in the right sidebar (or scroll to Deploy section)
3. Find **"Custom Start Command"**
4. Click **"+ Start Command"**
5. Enter: `npm start`
6. **Save**

### Step 3: Verify Environment Variables
1. Go to **Variables** tab
2. Ensure these are set:
   ```
   PORT=3001 (or leave empty - Railway sets this automatically)
   NODE_ENV=production
   STRIPE_SECRET_KEY=your_key_here
   JWT_SECRET=fitteam_secret_2024
   ```

### Step 4: Redeploy
After saving:
- Railway should automatically trigger a new deployment
- OR go to **Deployments** tab and click **"Redeploy"**

---

## 🧪 Testing After Configuration:

### 1. Check Deployment Status
- Go to **Deployments** tab
- Look for latest deployment
- Should show **"Deployed"** (green) not **"Failed"** (red)

### 2. Test Backend Health
Visit: `https://fit-team-prototype-production.up.railway.app/health`

**Expected**: 
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### 3. Test Products API
Visit: `https://fit-team-prototype-production.up.railway.app/api/products`

**Expected**: JSON array with 17 products

### 4. Check Logs
- Go to **Logs** tab
- Look for:
  - ✅ "Server running on http://localhost:3001" or similar
  - ✅ "Database seeded with initial products"
  - ❌ No "npm: command not found" errors
  - ❌ No "Cannot find module" errors

---

## 🎯 Summary:

**Current Status**:
- ✅ Root Directory: Correct (`/backend`)
- ✅ Networking: Correct (URL matches)
- ❌ Build Command: **MISSING** - Needs to be set
- ❌ Start Command: **MISSING** - Needs to be set

**Action Required**:
1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `npm start`
3. Wait for redeploy
4. Test endpoints

---

## 📝 Commands to Set:

**Build Command**:
```
npm install && npm run build
```

**Start Command**:
```
npm start
```

**Note**: No `cd backend` needed because Root Directory is already set to `/backend`!

---

After setting these commands, Railway should successfully build and deploy your backend! 🚀

