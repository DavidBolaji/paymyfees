/**
 * Runner for check-loan-status.ts
 */

const { execSync } = require('child_process');

console.log('Running check-loan-status.ts script...');

try {
  execSync('npx ts-node -r tsconfig-paths/register scripts/check-loan-status.ts', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('Script completed successfully');
} catch (error) {
  console.error('Script failed:', error.message);
  process.exit(1);
}
