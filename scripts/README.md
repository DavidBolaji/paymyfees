# Scripts Directory

Utility scripts for development and maintenance tasks.

## Available Scripts

### clear-cache.js
Clears Next.js build cache and related temporary files.

**Usage:**
```bash
node scripts/clear-cache.js
# or
npm run clear-cache
```

**What it clears:**
- `.next/` - Next.js build output
- `node_modules/.cache/` - Package manager cache
- `.turbo/` - Turbo cache (if using Turborepo)
- `tsconfig.tsbuildinfo` - TypeScript incremental build info

**When to use:**
- After encountering persistent API errors
- When switching between branches with different dependencies
- After updating Next.js or major dependencies
- When build output seems corrupted

### Database Scripts

#### add-documents.ts
Adds document records to the database.

**Usage:**
```bash
node scripts/run-add-document.js
```

#### create-disbursement.ts
Creates loan disbursement records.

**Usage:**
```bash
node scripts/run-disbursement.js
```

#### create-installments.ts
Generates installment schedules for loans.

**Usage:**
```bash
node scripts/run-installments.js
```

#### create-wallets-for-users.ts
Creates wallet records for existing users.

**Usage:**
```bash
node scripts/run-wallet-for-users.js
```

#### create-wallets-for-existing-users.ts
Creates wallets for all users who don't have one yet. This is the recommended script to use.

**Usage:**
```bash
npm run create:wallets
# or
node scripts/run-create-wallets-for-existing-users.js
```

**What it does:**
- Finds all users without wallets
- Creates a wallet for each user
- Provides detailed progress and summary
- Safe to run multiple times (idempotent)

**When to use:**
- After updating registration to create wallets for all users
- When you discover users without wallets
- After importing users from another system

## Adding New Scripts

When creating new scripts:

1. **TypeScript scripts**: Place in `scripts/` with `.ts` extension
2. **JavaScript runners**: Create corresponding `.js` file with `run-` prefix
3. **Add to package.json**: Add npm script for easy access
4. **Document here**: Update this README with usage instructions

### Template for new script:

```typescript
// scripts/my-script.ts
import { prisma } from '@/src/database/prisma';

async function main() {
  try {
    // Your script logic here
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

```javascript
// scripts/run-my-script.js
const { execSync } = require('child_process');

try {
  execSync('ts-node --compiler-options {"module":"CommonJS"} scripts/my-script.ts', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Failed to run script:', error.message);
  process.exit(1);
}
```

## Best Practices

1. **Always disconnect Prisma**: Use `finally` block to disconnect
2. **Handle errors**: Catch and log errors appropriately
3. **Use transactions**: For multi-step database operations
4. **Add logging**: Help with debugging and monitoring
5. **Validate input**: Check for required environment variables
6. **Exit codes**: Use `process.exit(1)` for failures
7. **Idempotent**: Scripts should be safe to run multiple times

## Common Issues

### "Cannot find module"
**Solution**: Ensure dependencies are installed:
```bash
npm install
# or
pnpm install
```

### "Database connection failed"
**Solution**: Check your `.env` file has correct `DATABASE_URL`

### "Permission denied"
**Solution**: Make script executable:
```bash
chmod +x scripts/my-script.js
```

### TypeScript compilation errors
**Solution**: Run type check first:
```bash
npm run type-check
```
