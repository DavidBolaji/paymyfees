#!/usr/bin/env node

/**
 * Clear Next.js cache script
 * Safely removes .next directory and other cache files
 * Run with: node scripts/clear-cache.js or pnpm dev:clean
 */

const fs = require('fs');
const path = require('path');

const dirsToRemove = [
  '.next',
  'node_modules/.cache',
  '.turbo'
];

const filesToRemove = [
  'tsconfig.tsbuildinfo'
];

console.log('🧹 Clearing Next.js cache...\n');

// Remove directories
dirsToRemove.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${dir}:`, error.message);
    }
  } else {
    console.log(`⏭️  Skipped: ${dir} (doesn't exist)`);
  }
});

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${file}:`, error.message);
    }
  } else {
    console.log(`⏭️  Skipped: ${file} (doesn't exist)`);
  }
});

console.log('\n✨ Cache cleared successfully!');
console.log('💡 Run "pnpm dev" to restart your development server.\n');
