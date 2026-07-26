# Quick Setup for Expo Go Testing

You have **com.viralprompt.app** already configured in Firebase.

## What You Already Have ✅

From your `google-services.json`:
- **Project ID**: viral-prompt-757c0
- **Package name**: com.viralprompt.app
- **Android Client ID**: 611551877054-r7vamr6dmt75eb2d6nah7j1dfphkq3fd.apps.googleusercontent.com

## What You Need for Expo Go 🚀

Create `.env.local` in project root:

```bash
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=611551877054-r7vamr6dmt75eb2d6nah7j1dfphkq3fd.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=611551877054-r7vamr6dmt75eb2d6nah7j1dfphkq3fd.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=https://dev-api-test.x1.stage.hostnmeet.com/api
```

**The client ID above is from your google-services.json (android oauth_client > client_id)**

## Setup Steps

### 1. Create `.env.local`:
```bash
cat > .env.local << 'EOF'
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=611551877054-r7vamr6dmt75eb2d6nah7j1dfphkq3fd.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=611551877054-r7vamr6dmt75eb2d6nah7j1dfphkq3fd.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=https://dev-api-test.x1.stage.hostnmeet.com/api
EOF
```

### 2. Ensure your email is added as test user:
1. Go to: https://console.cloud.google.com
2. Select project: **viral-prompt-757c0**
3. **APIs & Services** → **OAuth consent screen**
4. Scroll to **Test users** section
5. Click **ADD USERS**
6. Add your Gmail address
7. Click **SAVE**

### 3. Start Expo:
```bash
npx expo start --clear
```

### 4. Test in Expo Go:
- Scan QR code on your phone
- Tap "Continue with Google"
- Sign in with your test user email

## ✅ Verification

Run this to check your setup:
```bash
npm run check-oauth
```

## That's It! 🎉

You have everything needed to test Google OAuth in Expo Go.

The Android SHA1 and EAS/Java stuff is only needed when building standalone APK/AAB files for Play Store.

For development: Use Expo Go + Web Client ID ✓
