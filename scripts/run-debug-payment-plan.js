/**
 * Runner script for debug-payment-plan.ts
 */

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

require('./debug-payment-plan.ts');
