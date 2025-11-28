# Railway Service Identification Guide

## 🎯 Finding Your Backend Service

From your screenshot, I can see you have multiple Railway projects:
1. **glistening-happiness** - Has fit-team-prototype service (failing)
2. **radiant-wonder** - Has fit-team-prototype service with URL: `fit-team-prototype-production.up.railway.app` ✅
3. **enchanting-curiosity** - 1 service

## ✅ Correct Service to Use

**Use the "radiant-wonder" project** - it shows the URL:
```
fit-team-prototype-production.up.railway.app
```

This matches what we have in the GitHub Actions workflow.

---

## 🔍 How to Verify Which Service is Your Backend

### Step 1: Check Each Service
1. Click on **"radiant-wonder"** project
2. Click on the **"fit-team-prototype"** service
3. Go to **Settings** → **Networking**
4. Copy the **Public Domain** URL
5. It should be: `fit-team-prototype-production.up.railway.app`

### Step 2: Test the Backend
Visit: `https://fit-team-prototype-production.up.railway.app/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

If you get this response, this is your correct backend service!

### Step 3: Test Products Endpoint
Visit: `https://fit-team-prototype-production.up.railway.app/api/products`

**Expected Response:** JSON array with 17 products

---

## 🚨 If You Have Multiple Services

If you have multiple `fit-team-prototype` services:

1. **Check which one is actually running:**
   - Go to each service
   - Check **Deployments** tab
   - Look for one that says "Deployed" (green) not "Failed" (red)

2. **Check the service URL:**
   - Settings → Networking → Public Domain
   - Use the one that matches: `fit-team-prototype-production.up.railway.app`

3. **Delete unused services:**
   - If you have duplicate services, delete the failing ones
   - Keep only the working one

---

## ✅ Current Configuration

**GitHub Actions Workflow** is configured to use:
```
https://fit-team-prototype-production.up.railway.app/api
```

**CORS** is configured to allow:
```
https://hackerwithdrip.github.io/fit-team-prototype
```

**Both should match!** ✅

---

## 🔧 If URL is Different

If your Railway service has a different URL:

1. **Update GitHub Actions Workflow:**
   - File: `.github/workflows/deploy.yml`
   - Line 34: Update the Railway URL
   - Or add it as a GitHub Secret: `VITE_API_URL`

2. **Update CORS in Backend:**
   - File: `backend/src/server.ts`
   - Add the GitHub Pages URL to the `origin` array

3. **Push and Redeploy:**
   ```bash
   git add .
   git commit -m "Update Railway URL"
   git push
   ```

---

## 📝 Quick Checklist

- [ ] Identify correct Railway service (radiant-wonder)
- [ ] Verify service is deployed (green status)
- [ ] Test `/health` endpoint
- [ ] Test `/api/products` endpoint
- [ ] Verify URL matches workflow configuration
- [ ] Check CORS allows GitHub Pages URL
- [ ] Test GitHub Pages site loads products

---

## 🎯 Next Steps

1. **Go to "radiant-wonder" project** in Railway
2. **Click on "fit-team-prototype" service**
3. **Go to Settings** → **Source/Root Directory**
4. **Set to: `backend`**
5. **Save and wait for redeploy**
6. **Test the endpoints above**

