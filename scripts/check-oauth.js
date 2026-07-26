#!/usr/bin/env node
/**
 * Google OAuth Setup Checker
 * Validates your Google OAuth configuration
 */

console.log('\n🔍 Checking Google OAuth Configuration...\n');
console.log('='.repeat(60));

// Check environment variables
const requiredEnvVars = [
  'EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
];

const optionalEnvVars = [
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
  'EXPO_PUBLIC_API_URL',
];

let hasErrors = false;
let hasWarnings = false;

console.log('\n📋 Required Configuration:');
console.log('-'.repeat(60));

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('YOUR_')) {
    console.log(`❌ ${varName}: NOT SET or using placeholder`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  }
});

console.log('\n📋 Optional Configuration:');
console.log('-'.repeat(60));

optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('YOUR_')) {
    console.log(`⚠️  ${varName}: Not set (needed for production builds)`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Check if .env.local exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env.local');

console.log('\n📄 Configuration Files:');
console.log('-'.repeat(60));

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file NOT FOUND');
  console.log('   Create it by copying .env.local.example:');
  console.log('   cp .env.local.example .env.local');
  hasErrors = true;
} else {
  console.log('✅ .env.local file exists');
  
  // Check content
  const content = fs.readFileSync(envPath, 'utf-8');
  if (content.includes('YOUR_WEB_CLIENT_ID') || content.includes('YOUR_CLIENT_ID')) {
    console.log('⚠️  .env.local contains placeholder values');
    console.log('   Replace YOUR_WEB_CLIENT_ID with actual client ID from Google Cloud Console');
    hasWarnings = true;
  }
}

// Check app.json
const appJsonPath = path.join(process.cwd(), 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
  console.log('\n📱 App Configuration:');
  console.log('-'.repeat(60));
  console.log(`✅ App name: ${appJson.expo.name}`);
  console.log(`✅ Slug: ${appJson.expo.slug}`);
  console.log(`✅ Android package: ${appJson.expo.android?.package || 'Not set'}`);
  console.log(`✅ iOS bundle: ${appJson.expo.ios?.bundleIdentifier || 'Not set'}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));

if (hasErrors) {
  console.log('\n❌ CONFIGURATION INCOMPLETE');
  console.log('\n📖 Next steps:');
  console.log('   1. Create .env.local from .env.local.example');
  console.log('   2. Follow GOOGLE_OAUTH_SETUP.md step-by-step');
  console.log('   3. Get Web Client ID from Google Cloud Console');
  console.log('   4. Replace placeholders in .env.local');
  console.log('   5. Run: npx expo start --clear');
  console.log('\n💡 For now, you can use Guest login to test the app\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  CONFIGURATION PARTIAL');
  console.log('   Basic setup complete, but production builds will need additional credentials');
  console.log('   Google OAuth should work for development in Expo Go\n');
  process.exit(0);
} else {
  console.log('\n✅ CONFIGURATION COMPLETE');
  console.log('   All required credentials are set!');
  console.log('   You can now use Google OAuth in your app\n');
  process.exit(0);
}
