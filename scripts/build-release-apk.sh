#!/bin/bash

echo "🚀 Building release APK for distribution..."

# Check if Capacitor is set up
if [ ! -d "android" ]; then
    echo "❌ Android platform not found. Run 'npm run mobile:setup' first."
    exit 1
fi

# Check if keystore exists
if [ ! -f "android/app/release-key.keystore" ]; then
    echo "⚠️  No keystore found. Creating debug keystore for testing..."
    echo "💡 For production, create a proper keystore and update android/app/build.gradle"
fi

# Build Vue project
echo "📦 Building Vue project..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build release APK
echo "🤖 Building release APK..."
cd android
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Release APK built successfully!"
    echo "📱 Release APK location: app/build/outputs/apk/release/app-release.apk"
    
    # Copy APK to project root for easy access
    cp app/build/outputs/apk/release/app-release.apk ../lupus-master-release.apk
    echo "📁 Copied to: lupus-master-release.apk"
    
    # Show APK size
    APK_SIZE=$(du -h ../lupus-master-release.apk | cut -f1)
    echo "📏 APK size: $APK_SIZE"
    
    # Build AAB for Play Store
    echo "🏪 Building App Bundle for Play Store..."
    ./gradlew bundleRelease
    
    if [ $? -eq 0 ]; then
        cp app/build/outputs/bundle/release/app-release.aab ../lupus-master-release.aab
        echo "📦 App Bundle: lupus-master-release.aab"
    fi
else
    echo "❌ Release APK build failed!"
    exit 1
fi

cd ..

echo ""
echo "🎯 Build completed successfully!"
echo "📱 Debug APK: lupus-master-debug.apk"
echo "🚀 Release APK: lupus-master-release.apk"
echo "🏪 App Bundle: lupus-master-release.aab"
echo ""
echo "💡 For Play Store: Upload lupus-master-release.aab"
echo "💡 For direct distribution: Use lupus-master-release.apk"
