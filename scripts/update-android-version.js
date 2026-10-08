#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = process.argv[2];
const notes = process.argv[3];

if (!version) {
  console.error('❌ Version argument is required');
  process.exit(1);
}

console.log(`🚀 Updating Android version to ${version}`);

// Parse version (e.g., "1.9.1" -> versionCode: 191, versionName: "1.9.1")
const versionParts = version.split('.');
const versionCode = parseInt(versionParts[0]) * 100 + parseInt(versionParts[1]) * 10 + parseInt(versionParts[2] || 0);

console.log(`📱 Version Code: ${versionCode}`);
console.log(`🏷️  Version Name: ${version}`);

// Update Android build.gradle
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

// Check if the file exists
if (!fs.existsSync(buildGradlePath)) {
  console.error(`❌ build.gradle not found at: ${buildGradlePath}`);
  console.error('Make sure to run "npx cap add android" and "npx cap sync android" first');
  process.exit(1);
}

let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

// Update versionCode
buildGradleContent = buildGradleContent.replace(
  /versionCode\s+\d+/,
  `versionCode ${versionCode}`
);

// Update versionName
buildGradleContent = buildGradleContent.replace(
  /versionName\s+"[^"]*"/,
  `versionName "${version}"`
);

fs.writeFileSync(buildGradlePath, buildGradleContent);
console.log('✅ Android build.gradle updated');

// Update Android variables.gradle to target Android 16 (API 36)
const variablesGradlePath = path.join(__dirname, '..', 'android', 'variables.gradle');
if (fs.existsSync(variablesGradlePath)) {
  let variablesContent = fs.readFileSync(variablesGradlePath, 'utf8');
  variablesContent = variablesContent.replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 36');
  variablesContent = variablesContent.replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36');
  fs.writeFileSync(variablesGradlePath, variablesContent);
  console.log('✅ Android variables.gradle updated (compileSdkVersion = 36, targetSdkVersion = 36)');
}

// Update package.json version if it doesn't match
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.version !== version) {
  packageJson.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json version updated');
}

// Create or update version info file for the build
const versionInfoPath = path.join(__dirname, '..', 'public', 'version.json');
let existingVersionData = {};
if (fs.existsSync(versionInfoPath)) {
  try {
    existingVersionData = JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
  } catch (e) {}
}

const versionInfo = {
  ...existingVersionData,
  version,
  versionCode,
  buildDate: new Date().toISOString(),
  notes: notes || existingVersionData.changelog || 'No release notes provided'
};

fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2) + '\n');
console.log('✅ Version info file updated');

console.log(`🎉 Android version successfully updated to ${version} (${versionCode})`);
console.log('📝 Remember to commit these changes before building!');
