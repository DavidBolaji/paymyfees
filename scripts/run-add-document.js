/**
 * Run Add Documents Script
 * 
 * This script runs the TypeScript document migration script using ts-node
 * 
 * Usage: node scripts/run-add-documents.js
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🚀 Running add-documents.ts script...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Execute the TypeScript script using ts-node
  execSync('npx ts-node -r tsconfig-paths/register scripts/add-documents.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Script completed successfully');
  
} catch (error) {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ Error running script:', error.message);
  process.exit(1);
}