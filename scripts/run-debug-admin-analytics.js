/**
 * Runner script for debug-admin-analytics.ts
 * Compiles TypeScript and executes the script
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Compiling and running debug-admin-analytics script...\n');
  
  // Run with tsx for TypeScript execution
  execSync('npx tsx scripts/debug-admin-analytics.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
} catch (error) {
  console.error('Error running script:', error.message);
  process.exit(1);
}
