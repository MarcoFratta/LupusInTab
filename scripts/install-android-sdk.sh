#!/bin/bash

echo "🔧 Installing Android SDK command line tools..."

# Check if we're on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ This script is designed for Linux. For other platforms, please install Android Studio."
    exit 1
fi

# Create Android SDK directory
ANDROID_HOME="$HOME/Android/Sdk"
mkdir -p "$ANDROID_HOME"

echo "📁 Android SDK will be installed to: $ANDROID_HOME"

# Download Android command line tools
echo "📥 Downloading Android command line tools..."
cd /tmp
wget -O commandlinetools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

if [ $? -ne 0 ]; then
    echo "❌ Failed to download Android command line tools"
    exit 1
fi

# Extract command line tools
echo "📦 Extracting command line tools..."
unzip -q commandlinetools.zip -d "$ANDROID_HOME"

# Create proper directory structure
mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
mv "$ANDROID_HOME/cmdline-tools/cmdline-tools"/* "$ANDROID_HOME/cmdline-tools/latest/"
rmdir "$ANDROID_HOME/cmdline-tools/cmdline-tools"

# Add to PATH
echo "🔗 Adding Android SDK to PATH..."
echo "" >> ~/.bashrc
echo "# Android SDK" >> ~/.bashrc
echo "export ANDROID_HOME=$ANDROID_HOME" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/build-tools" >> ~/.bashrc

# Source the updated bashrc
source ~/.bashrc

# Accept licenses
echo "✅ Accepting Android SDK licenses..."
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses

# Install required SDK packages
echo "📱 Installing required SDK packages..."
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" \
    "platform-tools" \
    "platforms;android-36" \
    "build-tools;36.0.0" \
    "extras;android;m2repository" \
    "extras;google;m2repository"

# Clean up
rm -f commandlinetools.zip

echo ""
echo "✅ Android SDK installation complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Restart your terminal or run: source ~/.bashrc"
echo "2. Verify installation: adb version"
echo "3. Run Capacitor setup: npm run mobile:setup"
echo "4. Build APK: ./scripts/build-local-apk.sh"
echo ""
echo "📁 SDK location: $ANDROID_HOME"
echo "🔗 Added to PATH in ~/.bashrc"

