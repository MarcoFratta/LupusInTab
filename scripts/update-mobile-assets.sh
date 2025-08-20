#!/bin/bash

echo "🎨 Updating mobile app assets with website logo..."

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "❌ Public directory not found!"
    exit 1
fi

# Check if Android platform exists
if [ ! -d "android" ]; then
    echo "❌ Android platform not found. Run 'npm run mobile:setup' first."
    exit 1
fi

# Find the main logo file
LOGO_FILE=""
if [ -f "public/favicon.svg" ]; then
    LOGO_FILE="public/favicon.svg"
elif [ -f "public/logo.svg" ]; then
    LOGO_FILE="public/logo.svg"
elif [ -f "public/logo.png" ]; then
    LOGO_FILE="public/logo.png"
else
    echo "⚠️  No logo file found in public directory. Please add your logo as:"
    echo "   - public/favicon.svg (SVG format)"
    echo "   - public/logo.svg (SVG format)"
    echo "   - public/logo.png (PNG format)"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Found logo: $LOGO_FILE"

# Create assets directory
mkdir -p android/app/src/main/res

echo ""
echo "📱 To complete the setup, you need to:"
echo ""
echo "1. Copy your logo file to the appropriate Android resource directories:"
echo "   - App Icon: android/app/src/main/res/mipmap-*/ic_launcher.png"
echo "   - Splash Screen: android/app/src/main/res/drawable/splash.png"
echo ""
echo "2. Or use Android Studio to:"
echo "   - Right-click on android/app/src/main/res"
echo "   - Select 'New > Image Asset'"
echo "   - Choose 'Launcher Icons' or 'Splash Screen'"
echo "   - Select your logo file"
echo "   - Generate the assets"
echo ""
echo "3. Alternative: Use online tools to generate icons:"
echo "   - https://appicon.co/ (for app icons)"
echo "   - https://romannurik.github.io/AndroidAssetStudio/ (for all assets)"
echo ""
echo "4. After updating assets, rebuild:"
echo "   npm run mobile:build:android"
echo ""
echo "💡 The current Capacitor config is set to:"
echo "   - Status bar: Dark style, no overlap"
echo "   - Splash screen: 2 seconds, dark background"
echo "   - Web content: Properly positioned below status bar"
