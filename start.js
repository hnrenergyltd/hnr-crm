#!/usr/bin/env node
/**
 * Railway Startup Script
 * Simple, direct server startup - no npm spawning, no cd commands
 * This file is in the root and directly requires backend/server.js
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 [START.JS] Starting H&R Energy CRM Backend...');

// Absolute path to backend server
const serverFile = path.join(__dirname, 'backend', 'server.js');

console.log(`📂 Backend server path: ${serverFile}`);
console.log(`✅ Server file exists: ${fs.existsSync(serverFile)}`);

// Check if node_modules exists in backend
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
console.log(`📦 Backend node_modules exists: ${fs.existsSync(backendNodeModules)}`);

// If node_modules don't exist, install them
if (!fs.existsSync(backendNodeModules)) {
  console.log('📥 Installing backend dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('cd backend && npm install', { stdio: 'inherit' });
    console.log('✅ Backend dependencies installed');
  } catch (err) {
    console.error('❌ Failed to install backend dependencies:', err.message);
    process.exit(1);
  }
}

// Load and run the server
console.log('🎯 Loading server module...');
try {
  require(serverFile);
  console.log('✅ Server module loaded and running');
} catch (err) {
  console.error('❌ Failed to load server:', err.message);
  console.error(err.stack);
  process.exit(1);
}
