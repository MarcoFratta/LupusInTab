#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

// Update package.json version if it doesn't match
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.version !== version) {
  packageJson.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json version updated');
}

// Create a version info file for the build
const versionInfo = {
  version,
  versionCode,
  buildDate: new Date().toISOString(),
  notes: notes || 'No release notes provided'
};

const versionInfoPath = path.join(__dirname, '..', 'public', 'version.json');
fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
console.log('✅ Version info file created');

console.log(`🎉 Android version successfully updated to ${version} (${versionCode})`);
console.log('📝 Remember to commit these changes before building!');
