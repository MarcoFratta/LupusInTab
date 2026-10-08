#!/bin/bash

echo "🚀 Setting up Capacitor for Lupus Master Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install Capacitor dependencies
echo "📦 Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/splash-screen @capacitor/status-bar @capacitor/app

# Build the project first
echo "🔨 Building Vue project..."
npm run build

# Add Android platform
echo "🤖 Adding Android platform..."
npx cap add android

# Add iOS platform (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Adding iOS platform..."
    npx cap add ios
else
    echo "⚠️  Skipping iOS platform (macOS required)"
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

# Set Android target SDK to Android 16 (API 36) and minSdkVersion 24
if [ -f "android/variables.gradle" ]; then
    echo "🔧 Setting Android target SDK to Android 16 (API 36) and minSdkVersion 24..."
    sed -i 's/minSdkVersion = [0-9]*/minSdkVersion = 24/' android/variables.gradle
    sed -i 's/compileSdkVersion = [0-9]*/compileSdkVersion = 36/' android/variables.gradle
    sed -i 's/targetSdkVersion = [0-9]*/targetSdkVersion = 36/' android/variables.gradle
fi

# Ensure app_name is set to Lupi nel Villaggio in strings.xml
if [ -f "android/app/src/main/res/values/strings.xml" ]; then
    sed -i 's/<string name="app_name">.*<\/string>/<string name="app_name">Lupi nel Villaggio<\/string>/' android/app/src/main/res/values/strings.xml
    sed -i 's/<string name="title_activity_main">.*<\/string>/<string name="title_activity_main">Lupi nel Villaggio<\/string>/' android/app/src/main/res/values/strings.xml
fi

echo "✅ Capacitor setup complete!"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: npm run cap:open:android"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "2. Open Xcode: npm run cap:open:ios"
fi
echo "3. Build and run: npm run cap:run:android"
echo ""
echo "For more information, see MOBILE_SETUP.md"


