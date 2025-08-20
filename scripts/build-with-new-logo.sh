#!/bin/bash

echo "🎨 Building Lupus Master with your website logo..."

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
echo "🤖 Building debug APK with new logo..."
cd android
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK built successfully with your website logo!"
    echo "📱 Debug APK location: app/build/outputs/apk/debug/app-debug.apk"

    # Copy APK to project root for easy access
    cp app/build/outputs/apk/debug/app-debug.apk ../lupus-master-new-logo.apk
    echo "📁 Copied to: lupus-master-new-logo.apk"

    # Show APK size
    APK_SIZE=$(du -h ../lupus-master-new-logo.apk | cut -f1)
    echo "📏 APK size: $APK_SIZE"
else
    echo "❌ APK build failed!"
    exit 1
fi

cd ..

echo ""
echo "🎯 New logo features:"
echo "✅ App icon: Your constellation logo on home screen"
echo "✅ Splash screen: Your logo with 'Lupus Master' text"
echo "✅ Dark theme: Matches your app's color scheme"
echo ""
echo "📱 Next steps:"
echo "1. Install APK: adb install lupus-master-new-logo.apk"
echo "2. Check home screen - should see your constellation logo!"
echo "3. Launch app - should see splash screen with your logo"
echo ""
echo "💡 The logo is now exactly the same as your website!"
