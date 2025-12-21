# Complete Deployment Guide - Battle of Codes

This guide will walk you through deploying your Battle of Codes application step-by-step.

## Overview

You will deploy 3 separate services:
1. **Next.js Frontend** → Vercel
2. **Socket.io Server** → Render
3. **C# Executor Service** → Render

---

## Step 1: Prepare Your Database (Neon)

### 1.1 Your Database is Already Connected
- You already have Neon connected to your project
- Keep your `DATABASE_URL` handy - you'll need it

### 1.2 Run Database Scripts
1. In v0, go to the **Scripts** section
2. Run these scripts **in order**:
   - `scripts/01-create-tables.sql`
   - `scripts/02-seed-challenges.sql`
   - `scripts/03-seed-badges.sql`
3. Wait for each script to complete before running the next one

---

## Step 2: Deploy Socket.io Server to Render

### 2.1 Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `battleofcodes`)
3. Make it **Public** or **Private** (your choice)
4. **DO NOT** initialize with README
5. Click "Create repository"

### 2.2 Push Your Code to GitHub
1. In v0, click the **3 dots** in the top right of your code
2. Select **"Push to GitHub"**
3. Connect your GitHub account if needed
4. Select the repository you just created
5. Click **"Push"**

### 2.3 Deploy Socket.io Server on Render
1. Go to https://render.com
2. Sign up or log in (use your GitHub account)
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect GitHub"** and authorize Render
5. Select your repository (`battleofcodes`)
6. Configure the service:

   **Name:** `battleofcodes-socket`
   
   **Region:** Choose closest to your users
   
   **Branch:** `main`
   
   **Root Directory:** `socket-server`
   
   **Runtime:** `Node`
   
   **Build Command:**
   ```
   npm install && npm run build
   ```
   
   **Start Command:**
   ```
   npm start
   ```
   
   **Instance Type:** `Free` (or paid for better performance)

7. Click **"Advanced"** and add Environment Variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | Your Neon database URL (from Vercel Vars) |
   | `FRONTEND_URL` | `https://YOUR-APP.vercel.app` (we'll update this later) |

8. Click **"Create Web Service"**
9. Wait 5-10 minutes for deployment to complete
10. Copy your service URL (e.g., `https://battleofcodes-socket.onrender.com`)
11. **Save this URL** - you'll need it for Vercel

---

## Step 3: Deploy C# Executor to Render

### 3.1 Create C# Executor Service on Render
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Select your same repository (`battleofcodes`)
3. Configure the service:

   **Name:** `battleofcodes-csharp`
   
   **Region:** Same as your Socket server
   
   **Branch:** `main`
   
   **Root Directory:** `csharp-executor`
   
   **Runtime:** `Docker`
   
   **Instance Type:** `Free` (or paid for faster execution)

4. Click **"Advanced"** and add Environment Variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | Your Neon database URL |

5. Click **"Create Web Service"**
6. Wait 10-15 minutes (Docker build takes longer)
7. Copy your service URL (e.g., `https://battleofcodes-csharp.onrender.com`)
8. **Save this URL** - you'll need it for Vercel

---

## Step 4: Deploy Next.js App to Vercel

### 4.1 Deploy from v0
1. In v0, click **"Publish"** button (top right)
2. Select **"Deploy to Vercel"**
3. Choose your Vercel account
4. Name your project (e.g., `battleofcodes`)
5. Click **"Deploy"**

### 4.2 Add Environment Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Click on your project (`battleofcodes`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   | Key | Value | Where to Use |
   |-----|-------|--------------|
   | `DATABASE_URL` | Your Neon database URL | Production, Preview, Development |
   | `JWT_SECRET` | Any random 32+ character string (e.g., `your-super-secret-jwt-key-min-32-chars-long`) | Production, Preview, Development |
   | `NEXT_PUBLIC_SOCKET_URL` | Your Socket.io URL from Step 2 (e.g., `https://battleofcodes-socket.onrender.com`) | Production, Preview, Development |
   | `NEXT_PUBLIC_CSHARP_EXECUTOR_URL` | Your C# Executor URL from Step 3 (e.g., `https://battleofcodes-csharp.onrender.com`) | Production, Preview, Development |

   **How to generate JWT_SECRET:**
   - Go to https://randomkeygen.com/
   - Copy any "CodeIgniter Encryption Key" (256-bit)
   - Or use: `openssl rand -base64 32` in terminal

5. Click **"Save"** for each variable

### 4.3 Redeploy Your App
1. In Vercel dashboard, go to **Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes
5. Your app is now live!

---

## Step 5: Update Socket Server with Correct Frontend URL

### 5.1 Get Your Vercel URL
1. In Vercel dashboard, copy your deployment URL
2. Example: `https://battleofcodes.vercel.app`

### 5.2 Update Render Socket Server
1. Go to https://render.com/dashboard
2. Click on `battleofcodes-socket` service
3. Go to **Environment** tab
4. Find `FRONTEND_URL` variable
5. Update it with your Vercel URL: `https://battleofcodes.vercel.app`
6. Click **"Save Changes"**
7. Render will automatically redeploy (wait 2-3 minutes)

---

## Step 6: Test Your Deployment

### 6.1 Test Registration
1. Go to your Vercel URL: `https://YOUR-APP.vercel.app`
2. Click **"Register"**
3. Create a new account
4. You should be redirected to the dashboard

### 6.2 Test Room Creation
1. Click **"Create Room"**
2. Set players: `2`, rounds: `3`
3. Click **"Create Room"**
4. You should see a 6-digit room code

### 6.3 Test Real-Time Features
1. Open your app in a **new incognito window**
2. Register a second account
3. Join the room with the code
4. In the first window, you should see the second player appear
5. Both players click **"Ready"**
6. Click **"Start Game"**

### 6.4 Test Code Execution
1. In the game, write a simple C# solution:
   ```csharp
   public class Solution {
       public int Solve(int a, int b) {
           return a + b;
       }
   }
   ```
2. Click **"Submit Code"**
3. You should see test results appear

---

## Common Issues & Solutions

### Issue 1: "Socket connection failed"
**Cause:** Socket server not running or wrong URL
**Solution:**
1. Check Render dashboard - is `battleofcodes-socket` running?
2. Check Vercel env var `NEXT_PUBLIC_SOCKET_URL` is correct
3. Redeploy Vercel if you changed the variable

### Issue 2: "Code execution timeout"
**Cause:** C# executor not running or too slow
**Solution:**
1. Check Render dashboard - is `battleofcodes-csharp` running?
2. On free tier, first execution can be slow (cold start)
3. Wait 30-60 seconds and try again
4. Consider upgrading to paid Render instance

### Issue 3: "Database connection error"
**Cause:** Wrong DATABASE_URL or database not set up
**Solution:**
1. Verify `DATABASE_URL` is the same in all three services
2. Make sure you ran all SQL scripts in order
3. Check Neon dashboard - is database active?

### Issue 4: "CORS error in browser console"
**Cause:** FRONTEND_URL not set correctly in Socket server
**Solution:**
1. Go to Render → `battleofcodes-socket` → Environment
2. Update `FRONTEND_URL` to exact Vercel URL (no trailing slash)
3. Save and wait for redeploy

### Issue 5: "JWT token invalid"
**Cause:** JWT_SECRET not set or changed after creating accounts
**Solution:**
1. Set JWT_SECRET in Vercel environment variables
2. Must be 32+ characters
3. Redeploy Vercel
4. Register a new account

---

## Environment Variables Quick Reference

### Vercel (Next.js App)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
NEXT_PUBLIC_SOCKET_URL=https://battleofcodes-socket.onrender.com
NEXT_PUBLIC_CSHARP_EXECUTOR_URL=https://battleofcodes-csharp.onrender.com
```

### Render Socket Server
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
FRONTEND_URL=https://battleofcodes.vercel.app
```

### Render C# Executor
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
```

---

## Performance Tips

### 1. Upgrade Render Instances
- **Free tier:** Services sleep after 15 min inactivity
- **Starter ($7/mo per service):** Always on, faster
- Upgrade Socket server first for better real-time performance

### 2. Keep Services Awake (Free Tier)
- Use https://uptimerobot.com
- Create monitors for your Render URLs
- Ping every 5 minutes to prevent sleep

### 3. Database Optimization
- Neon free tier is usually sufficient
- If slow, upgrade to paid plan with more compute

### 4. Use Vercel Analytics
- Enable in Vercel dashboard
- Monitor page load times
- See user activity

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Service → Logs
2. Check Vercel logs: Dashboard → Project → Logs
3. Check browser console (F12) for errors
4. Verify all environment variables are set correctly

---

## Success Checklist

- [ ] Database scripts ran successfully
- [ ] Socket.io server deployed to Render
- [ ] C# executor deployed to Render
- [ ] Next.js app deployed to Vercel
- [ ] All environment variables set correctly
- [ ] Frontend URL updated in Socket server
- [ ] Registration works
- [ ] Room creation works
- [ ] Real-time updates work (second player appears)
- [ ] Game starts when all ready
- [ ] Code submission works

Once all checkboxes are checked, your app is fully deployed! 🎉
