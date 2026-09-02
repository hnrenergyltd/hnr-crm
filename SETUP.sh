#!/bin/bash

# HNR CRM Setup Script
# This script clones your GitHub repository and sets up the CRM project

echo "=========================================="
echo "HNR Energy Solutions CRM Setup"
echo "=========================================="
echo ""

# Get repository URL
REPO_URL="https://github.com/ecommercewithhassan123-rgb/HNR-CRM-.git"
REPO_DIR="HNR-CRM"

echo "📦 Cloning repository..."
git clone "$REPO_URL" "$REPO_DIR"

if [ ! -d "$REPO_DIR" ]; then
    echo "❌ Error: Failed to clone repository"
    exit 1
fi

cd "$REPO_DIR"

echo "📂 Setting up project structure..."

# Copy all files
echo "📋 Copying project files..."

# Create directories
mkdir -p frontend/{public,src/{pages,components}}
mkdir -p backend

# Copy frontend files
cp -r ../frontend/* frontend/ 2>/dev/null || true
cp -r ../src/* frontend/src/ 2>/dev/null || true

# Copy backend files
cp -r ../backend/* backend/ 2>/dev/null || true

# Copy root files
cp ../package.json . 2>/dev/null || true
cp ../.gitignore . 2>/dev/null || true

echo ""
echo "✅ Project structure ready"
echo ""
echo "📦 Installing dependencies..."
echo "(This may take a few minutes...)"
echo ""

npm run install-all

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "To start the CRM, run:"
    echo ""
    echo "   npm start"
    echo ""
    echo "Then open in your browser:"
    echo ""
    echo "   http://localhost:3000"
    echo ""
    echo "Demo Credentials:"
    echo "   Email: admin@hnrenergy.co.uk"
    echo "   Password: admin123"
    echo ""
    echo "=========================================="
else
    echo ""
    echo "❌ Failed to install dependencies"
    echo "Please run: npm run install-all"
    exit 1
fi
