#!/bin/bash

# Plug Chat Release Script
# This script creates releases for different platforms

set -e

VERSION=${1:-"1.0.0"}
echo "Creating release for version: $VERSION"

# Create release directory
mkdir -p releases

# 1. Source Code Release
echo "📦 Creating source code archive..."
git archive --format=tar.gz --prefix=plug-chat-$VERSION/ HEAD > releases/plug-chat-$VERSION-source.tar.gz

# 2. Web Application Release (Built)
echo "🌐 Building web application..."
npm ci
npm run build
tar -czf releases/plug-chat-$VERSION-web.tar.gz \
  .next/ \
  public/ \
  package.json \
  package-lock.json \
  next.config.ts \
  README.md \
  LICENSE.md \
  .env.example

# 3. Docker Image
echo "🐳 Building Docker image..."
docker build -t plug-chat:$VERSION .
docker save plug-chat:$VERSION | gzip > releases/plug-chat-$VERSION-docker.tar.gz

# 4. Electron Desktop Apps (if electron is set up)
if [ -f "electron/main.js" ]; then
  echo "🖥️  Building desktop applications..."
  
  # Install electron dependencies
  npm install electron electron-builder concurrently wait-on --save-dev
  
  # Build for macOS
  echo "Building for macOS..."
  npm run dist:mac
  
  # Build for Linux
  echo "Building for Linux..."
  npm run dist:linux
  
  # Move builds to releases
  cp dist/*.dmg releases/ 2>/dev/null || true
  cp dist/*.zip releases/ 2>/dev/null || true
  cp dist/*.AppImage releases/ 2>/dev/null || true
  cp dist/*.deb releases/ 2>/dev/null || true
  cp dist/*.tar.gz releases/ 2>/dev/null || true
fi

echo "✅ Release created successfully!"
echo "📁 Files available in ./releases/"
ls -la releases/

echo ""
echo "🚀 Release artifacts:"
echo "- Source code: plug-chat-$VERSION-source.tar.gz"
echo "- Web app: plug-chat-$VERSION-web.tar.gz" 
echo "- Docker: plug-chat-$VERSION-docker.tar.gz"
if [ -f "electron/main.js" ]; then
  echo "- macOS app: .dmg and .zip files"
  echo "- Linux app: .AppImage and .deb files"
fi

echo ""
echo "📋 Next steps:"
echo "1. Create a new release on GitHub"
echo "2. Upload the release artifacts"
echo "3. Tag the release as v$VERSION"
echo "4. Write release notes"
