#!/bin/bash

echo "🐳 Building APK using Docker (no local Android SDK required)..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "💡 Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build Vue project first
echo "📦 Building Vue project..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Create Dockerfile for building
echo "🐳 Creating Docker build environment..."
cat > Dockerfile.android << 'EOF'
FROM openjdk:17-jdk

# Install required packages
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Download and install Android SDK
RUN mkdir -p $ANDROID_HOME/cmdline-tools/latest && \
    cd /tmp && \
    wget -O commandlinetools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" && \
    unzip -q commandlinetools.zip -d $ANDROID_HOME && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools/* $ANDROID_HOME/cmdline-tools/latest/ && \
    rm -rf $ANDROID_HOME/cmdline-tools/cmdline-tools && \
    rm commandlinetools.zip

# Accept licenses and install required packages
RUN yes | sdkmanager --licenses && \
    sdkmanager \
        "platform-tools" \
        "platforms;android-34" \
        "build-tools;34.0.0" \
        "extras;android;m2repository" \
        "extras;google;m2repository"

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build APK
RUN cd android && ./gradlew assembleDebug

# Copy APK to output directory
RUN mkdir -p /output && \
    cp app/build/outputs/apk/debug/app-debug.apk /output/lupus-master-debug.apk && \
    cp app/build/outputs/apk/release/app-release.apk /output/lupus-master-release.apk 2>/dev/null || true

# Output directory
VOLUME ["/output"]
EOF

# Build Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.android -t lupus-master-builder .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    rm -f Dockerfile.android
    exit 1
fi

# Run Docker container to build APK
echo "🚀 Building APK in Docker container..."
docker run --rm -v "$(pwd):/output" lupus-master-builder

# Check if APK was created
if [ -f "lupus-master-debug.apk" ]; then
    echo "✅ APK built successfully!"
    echo "📱 Debug APK: lupus-master-debug.apk"
    
    # Show APK size
    APK_SIZE=$(du -h lupus-master-debug.apk | cut -f1)
    echo "📏 APK size: $APK_SIZE"
    
    # Clean up Docker image
    echo "🧹 Cleaning up Docker image..."
    docker rmi lupus-master-builder
else
    echo "❌ APK build failed!"
    docker rmi lupus-master-builder
    rm -f Dockerfile.android
    exit 1
fi

# Clean up
rm -f Dockerfile.android

echo ""
echo "🎯 APK build complete!"
echo "📱 Install on device: adb install lupus-master-debug.apk"
echo "💡 Or transfer APK to your device and install manually"

