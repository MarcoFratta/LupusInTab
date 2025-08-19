#!/bin/bash

echo "🔨 Building local APK for testing..."

# Check if Capacitor is set up
if [ ! -d "android" ]; then
    echo "❌ Android platform not found. Run 'npm run mobile:setup' first."
    exit 1
fi

# Build Vue project
echo "📦 Building Vue project..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build debug APK
echo "🤖 Building debug APK..."
cd android
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 Debug APK location: app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy APK to project root for easy access
    cp app/build/outputs/apk/debug/app-debug.apk ../lupus-master-debug.apk
    echo "📁 Copied to: lupus-master-debug.apk"
    
    # Show APK size
    APK_SIZE=$(du -h ../lupus-master-debug.apk | cut -f1)
    echo "📏 APK size: $APK_SIZE"
else
    echo "❌ APK build failed!"
    exit 1
fi

cd ..

echo ""
echo "🎯 Next steps:"
echo "1. Install APK on your device: adb install lupus-master-debug.apk"
echo "2. Or transfer APK to your device and install manually"
echo "3. Test the app functionality"
echo ""
echo "💡 To build release APK: ./scripts/build-release-apk.sh"
