# 🚨 Quick Fix: "Access blocked: Authorization Error"

## The Problem
Google is blocking your login because your OAuth app is in "Testing" mode and your email is not added to the test users list.

## ⚡ Quick Solution (5 minutes)

### Step 1: Add Yourself as a Test User
1. Go to: https://console.cloud.google.com
2. Select your project: **"Viral Prompt"** (or whatever you named it)
3. Click **"APIs & Services"** → **"OAuth consent screen"** (left sidebar)
4. Scroll down to **"Test users"** section
5. Click **"ADD USERS"**
6. Enter YOUR Gmail address (the one you're trying to sign in with)
7. Click **"SAVE"**

### Step 2: Create Web OAuth Client (if not done)
1. Go to **"Credentials"** (left sidebar)
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"**
4. Name: `Viral Prompt Web`
5. Under **"Authorized redirect URIs"**, click "ADD URI" and add:
   ```
   https://auth.expo.io/@YOUR_USERNAME/viral-prompt
   ```
   (Replace `YOUR_USERNAME` - run `npx expo whoami` to find it)
6. Click **"CREATE"**
7. **COPY THE CLIENT ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 3: Configure Environment Variables
1. Create `.env.local` file in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and replace `YOUR_WEB_CLIENT_ID`:
   ```bash
   EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   EXPO_PUBLIC_API_URL=https://dev-api-test.x1.stage.hostnmeet.com/api
   ```

### Step 4: Restart Your App
```bash
npx expo start --clear
```

### Step 5: Test
1. Open app in Expo Go
2. Click "Continue with Google"
3. Sign in with the email you added in Step 1

## ✅ Verification

Run this command to check your setup:
```bash
npm run check-oauth
```

## 🆘 Still Not Working?

### Common Issues:

**"redirect_uri_mismatch"**
- Your redirect URI in Google Console must be EXACTLY:
  ```
  https://auth.expo.io/@YOUR_EXPO_USERNAME/viral-prompt
  ```
- Run `npx expo whoami` to confirm your username
- Make sure there's no typo in the slug (should be `viral-prompt`)

**"Invalid client"**
- Double-check the client ID is copied correctly
- It should end with `.apps.googleusercontent.com`
- No spaces or quotes around it in `.env.local`

**Still getting "Access blocked"**
- Make sure OAuth consent screen is set to **"External"** type
- Verify your email is in the **Test users** list
- Wait 1-2 minutes after adding test user (Google cache)
- Try logging out of all Google accounts and back in

**"This app isn't verified"**
- This is NORMAL for testing!
- Click "Advanced" → "Go to Viral Prompt (unsafe)"
- This warning only appears for apps in testing mode

## 🎯 The Root Cause

Google OAuth has security restrictions:
- Apps in "Testing" mode → Only whitelisted users can sign in
- Apps in "Production" mode → Anyone can sign in (requires verification)

For development, use "Testing" mode and add your email to test users.

## 📚 Full Documentation

For detailed step-by-step instructions, see: **GOOGLE_OAUTH_SETUP.md**

## 🔄 Alternative: Use Guest Login

While setting up OAuth, you can test the app using Guest login:
- Click "Continue as Guest" on the auth screen
- Full app functionality available
- No Google account needed

---

**Need more help?** Check GOOGLE_OAUTH_SETUP.md or create an issue on GitHub.
