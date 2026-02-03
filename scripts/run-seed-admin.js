/**
 * Run Disbursement Script
 * 
 * This script runs the TypeScript disbursement script using ts-node
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running run-seed-admin.ts script...');
  
  // Execute the TypeScript script using ts-node
  execSync('npx ts-node -r tsconfig-paths/register scripts/seed-admin-user.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('Script completed successfully');
} catch (error) {
  console.error('Error running script:', error.message);
  process.exit(1);
}