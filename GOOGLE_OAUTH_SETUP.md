# Google OAuth Setup Guide

## 🚨 Fix "Access blocked: Authorization Error" 

If you're seeing **"Access blocked: Authorization Error"**, follow these steps:

### Step 1: Configure OAuth Consent Screen (REQUIRED)

1. Go to **Google Cloud Console** → https://console.cloud.google.com
2. Select your project (or create one: "Viral Prompt")
3. Go to **"APIs & Services"** → **"OAuth consent screen"** (left sidebar)
4. Choose **"External"** user type → Click **"Create"**
5. Fill in the required fields:
   - **App name**: `Viral Prompt`
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - **App logo**: (optional)
6. Click **"Save and Continue"**
7. **Scopes**: Click "Add or Remove Scopes"
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
   - Add: `openid`
   - Click **"Update"** → **"Save and Continue"**
8. **Test users**: Click **"Add Users"**
   - Add YOUR Gmail address (the one you're testing with)
   - Add any other test users' emails
   - Click **"Save and Continue"**
9. Click **"Back to Dashboard"**

### Step 2: Enable Required APIs

1. Go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs:
   - **Google+ API** (or People API)
   - **Google Identity Toolkit API**
3. Click **"Enable"** for each

### Step 3: Create OAuth 2.0 Credentials
### Step 3: Create OAuth 2.0 Credentials

#### For Expo / Development:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Name it: `Viral Prompt - Expo Web`
5. **Authorized JavaScript origins**: Leave blank or add http://localhost:19006
6. **Authorized redirect URIs**:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/viral-prompt
   http://localhost:19006
   ```
   (Replace `YOUR_EXPO_USERNAME` with your actual Expo account username)
7. Click **"Create"**
8. **SAVE THE CLIENT ID** - you'll need this

#### For Android (Optional - for production):

1. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"** → **"Android"**
2. **Package name**: `com.anonymous.viralPrompt` (or from app.json)
3. **SHA-1 fingerprint**: 
   - For debug: Run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - Copy the SHA1 value
4. Click **"Create"**
5. **SAVE THE CLIENT ID**

#### For iOS (Optional - for production):

1. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"** → **"iOS"**
2. **Bundle ID**: From your app.json (e.g., `com.anonymous.viralPrompt`)
3. Click **"Create"**
4. **SAVE THE CLIENT ID**

### Step 4: Update Your Environment Variables

Create or update `.env.local` in your project root:

```bash
# Google OAuth - Use the Web Client ID for Expo
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com

# Optional: For production builds
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com

# API URL
EXPO_PUBLIC_API_URL=https://dev-api-test.x1.stage.hostnmeet.com/api
```

**IMPORTANT**: Replace `YOUR_WEB_CLIENT_ID` with the actual client ID from Step 3

### Step 5: Restart Your App

```bash
# Clear cache and restart
npx expo start --clear

# Or with tunnel (if on physical device)
npx expo start --tunnel --clear
```

### Step 6: Test Login

1. Open your app in Expo Go
2. Click "Continue with Google"
3. You should see the Google sign-in screen
4. **Sign in with the email you added in Step 1 (Test users)**

## ✅ Verification Checklist

- [ ] OAuth consent screen configured with "External" type
- [ ] Your test email added to "Test users" list
- [ ] Scopes added: openid, userinfo.email, userinfo.profile
- [ ] Google+ API or People API enabled
- [ ] OAuth 2.0 Web Client ID created
- [ ] Redirect URI matches Expo format: `https://auth.expo.io/@USERNAME/viral-prompt`
- [ ] Client ID copied to `.env.local` file
- [ ] App restarted with `--clear` flag
- [ ] Testing with email that's in "Test users" list

## 🔧 Troubleshooting

### "Access blocked: Authorization Error"
**Main causes & fixes:**
1. ✅ **Add your email to Test Users** (Step 1.8)
2. ✅ Make sure OAuth consent screen is configured as "External"
3. ✅ Verify scopes are added (openid, email, profile)
4. ✅ Test with the EXACT email added to test users list

### "redirect_uri_mismatch" error
- Go back to your Web OAuth client in Google Cloud Console
- Add to Authorized redirect URIs:
  ```
  https://auth.expo.io/@YOUR_EXPO_USERNAME/viral-prompt
  ```
- Replace `YOUR_EXPO_USERNAME` with your Expo account username
- You can find it by running: `npx expo whoami`

### "Invalid client" error
- Double-check the client ID in `.env.local` matches exactly with Google Cloud Console
- Make sure there are no extra spaces or quotes
- Client ID should end with `.apps.googleusercontent.com`

### App is in "Testing" mode - Limited users
This is NORMAL for development! To add more test users:
1. Go to OAuth consent screen
2. Click "Test users" → "Add Users"
3. Add email addresses who need access
4. They can now sign in

### Moving to Production (when ready)
1. Go to OAuth consent screen
2. Click "Publish App"
3. Submit for verification (required if asking for sensitive scopes)
4. Once approved, anyone can sign in

### Still not working?
1. Check Google Cloud Console → APIs & Services → Enabled APIs
   - Make sure "Google+ API" or "People API" is enabled
2. Try creating a NEW OAuth client ID
3. Clear Expo cache: `npx expo start --clear`
4. Clear browser/app cache
5. Try a different test user email

## 📝 Quick Copy-Paste Commands

```bash
# Check your Expo username
npx expo whoami

# Clear Expo cache and restart
npx expo start --clear

# Get Android SHA1 fingerprint (if needed)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## 🎯 Common Mistakes to Avoid

1. ❌ Not adding your email to "Test users" list
2. ❌ Using wrong redirect URI format for Expo
3. ❌ Forgetting to enable required APIs
4. ❌ Not configuring OAuth consent screen first
5. ❌ Testing with email not in test users list

## 📱 For Production Builds

When building standalone apps (EAS Build or expo build):

### Android Production:
```bash
# Generate production keystore signature
keytool -list -v -keystore path/to/production.keystore

# Create new OAuth client with production SHA1
```

### iOS Production:
```bash
# Use your production Bundle ID
# Create new OAuth client with that Bundle ID
```

### Update environment variables for production builds

---

**Need help?** Check the [Expo Google Auth docs](https://docs.expo.dev/guides/google-authentication/) or open an issue.
