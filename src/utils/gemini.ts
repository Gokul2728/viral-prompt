/**
 * Gemini Deep Link Utility
 * Opens the native Google Gemini app on the device instead of web browser.
 * Falls back to App Store / Play Store if Gemini is not installed.
 */

import { Platform, Linking, Alert } from 'react-native';

const GEMINI_PACKAGE = 'com.google.android.apps.bard';
const GEMINI_IOS_URL_SCHEME = 'googlegemini://';
const GEMINI_PLAYSTORE = `market://details?id=${GEMINI_PACKAGE}`;
const GEMINI_APPSTORE = 'https://apps.apple.com/app/google-gemini/id6477141328';

/**
 * Opens the Google Gemini app with a pre-filled prompt.
 * - Android: Uses intent:// deep link to target the Gemini app package directly
 * - iOS: Uses googlegemini:// URL scheme, falls back to App Store
 * - If app not installed, prompts user to install it
 */
export const openGeminiWithPrompt = async (promptText: string): Promise<void> => {
  const encodedPrompt = encodeURIComponent(promptText);

  if (Platform.OS === 'android') {
    await openGeminiAndroid(encodedPrompt);
  } else if (Platform.OS === 'ios') {
    await openGeminiIOS(encodedPrompt);
  } else {
    // Web / other platform fallback
    await Linking.openURL(`https://gemini.google.com/app?text=${encodedPrompt}`);
  }
};

/**
 * Android: Open Gemini via intent:// URL targeting the app package
 */
const openGeminiAndroid = async (encodedPrompt: string): Promise<void> => {
  // Intent URL format that directly targets the Gemini app
  const intentUrl = `intent://new#Intent;scheme=googlegemini;package=${GEMINI_PACKAGE};S.text=${encodedPrompt};end`;

  try {
    const supported = await Linking.canOpenURL(intentUrl);
    if (supported) {
      await Linking.openURL(intentUrl);
      return;
    }
  } catch {
    // Intent URL not supported, try direct
  }

  // Fallback: Try opening via https (Android App Links will redirect to app if installed)
  try {
    await Linking.openURL(`https://gemini.google.com/app?text=${encodedPrompt}`);
  } catch {
    // App not installed - prompt to install
    promptInstallGemini();
  }
};

/**
 * iOS: Open Gemini via custom URL scheme
 */
const openGeminiIOS = async (encodedPrompt: string): Promise<void> => {
  const geminiUrl = `${GEMINI_IOS_URL_SCHEME}prompt?text=${encodedPrompt}`;

  try {
    const canOpen = await Linking.canOpenURL(geminiUrl);
    if (canOpen) {
      await Linking.openURL(geminiUrl);
      return;
    }
  } catch {
    // URL scheme not available
  }

  // Fallback: Try universal link
  try {
    await Linking.openURL(`https://gemini.google.com/app?text=${encodedPrompt}`);
  } catch {
    promptInstallGemini();
  }
};

/**
 * Prompt user to install the Gemini app
 */
const promptInstallGemini = (): void => {
  const storeUrl = Platform.select({
    android: GEMINI_PLAYSTORE,
    ios: GEMINI_APPSTORE,
    default: 'https://gemini.google.com',
  })!;

  Alert.alert(
    'Google Gemini Required',
    'Install the Google Gemini app to generate AI content with this prompt.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Install Gemini',
        onPress: () => Linking.openURL(storeUrl),
      },
    ],
  );
};

/**
 * Copy prompt to clipboard and then open Gemini app (without pre-fill)
 * This is a fallback if deep linking with text doesn't work
 */
export const openGeminiApp = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      const intentUrl = `intent://#Intent;scheme=googlegemini;package=${GEMINI_PACKAGE};end`;
      await Linking.openURL(intentUrl);
    } catch {
      try {
        await Linking.openURL('https://gemini.google.com');
      } catch {
        promptInstallGemini();
      }
    }
  } else {
    try {
      const canOpen = await Linking.canOpenURL(GEMINI_IOS_URL_SCHEME);
      if (canOpen) {
        await Linking.openURL(GEMINI_IOS_URL_SCHEME);
      } else {
        await Linking.openURL('https://gemini.google.com');
      }
    } catch {
      promptInstallGemini();
    }
  }
};

export default openGeminiWithPrompt;
