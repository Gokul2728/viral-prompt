# Google OAuth Setup Guide

## Quick Setup for Development

1. **Go to Google Cloud Console**: https://console.cloud.google.com

2. **Create a Project** (if you don't have one):
   - Click "Select a Project" → "New Project"
   - Name: "Viral Prompt"
   - Click "Create"

3. **Enable Google+ API**:
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" in left sidebar
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Android" app for first client
   
5. **For Expo Go Development (Android)**:
   - Get your SHA1 fingerprint: `eas credentials show --platform android` (if using EAS)
   - Or run: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - Add that fingerprint to Google Cloud
   - Package name: `com.anonymous.viralPrompt` (or your app's package name)
   - Download the credentials JSON → copy the client ID

6. **For iOS**:
   - Click "Create Credentials" again → "OAuth 2.0 Client ID" → "iOS"
   - Bundle ID: `com.yourcompany.viralPrompt`
   - Download credentials
   - Copy the client ID

7. **For Web**:
   - Click "Create Credentials" → "OAuth 2.0 Client ID" → "Web application"
   - Authorized JavaScript origins: `http://localhost:3000`, `http://localhost:8100`
   - Authorized redirect URIs: `http://localhost:3000/callback`
   - Copy the client ID

8. **Create `.env.local` file** in project root:
```bash
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=https://dev-api-test.x1.stage.hostnmeet.com/api
```

9. **Test in Expo Go**:
```bash
npx expo start --tunnel
```
Then scan the QR code with your phone's Expo Go app.

## Troubleshooting

### "Access blocked: Authorization Error"
- Check that client IDs in `.env.local` are correct
- Verify package name matches your app's package name
- Ensure SHA1 fingerprint is correct (for Android)
- Check Google Cloud API is enabled

### "Invalid client" error
- Delete the OAuth credentials and create new ones
- Ensure redirect URIs are exactly correct

### For Production (App Store/Play Store)
- Generate production signing keys for Android/iOS
- Create new OAuth credentials for production in Google Cloud
- Update package names and bundle IDs
- Set new environment variables in CI/CD or EAS Build
