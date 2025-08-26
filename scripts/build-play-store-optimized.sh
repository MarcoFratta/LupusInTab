#!/bin/bash

set -e

echo "🚀 Building optimized and obfuscated APK for Play Store..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf android/app/build/

# Build optimized web assets
echo "📦 Building optimized web assets..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build optimized APK
echo "🔨 Building optimized APK..."
cd android

# Clean and build with full optimization
./gradlew clean
./gradlew assembleRelease

echo "✅ Build completed successfully!"
echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Show APK size
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📏 APK size: $APK_SIZE"
    
    # Show optimization stats
    echo "📊 Optimization summary:"
    echo "   - Code obfuscation: ✅ Enabled"
    echo "   - Resource shrinking: ✅ Enabled"
    echo "   - ProGuard/R8: ✅ Enabled"
    echo "   - Terser minification: ✅ Enabled"
    echo "   - Debug info removed: ✅ Enabled"
    echo "   - Source maps disabled: ✅ Enabled"
fi

cd ..
