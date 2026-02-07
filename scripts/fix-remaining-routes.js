#!/usr/bin/env node

/**
 * Fix Remaining Routes Script
 * Automatically adds asyncHandler to routes that are missing it
 * Run with: node scripts/fix-remaining-routes.js
 */

const fs = require('fs');
const path = require('path');

const routesToFix = [
  'app/api/admin/schools/[schoolId]/approve/route.ts',
  'app/api/admin/schools/[schoolId]/reject/route.ts',
  'app/api/admin/schools/[schoolId]/route.ts',
  'app/api/admin/schools/[schoolId]/verification-logs/route.ts',
  'app/api/admin/schools/[schoolId]/verification-message/route.ts',
  'app/api/admin/support/[ticketId]/respond/route.ts',
  'app/api/admin/support/[ticketId]/route.ts',
  'app/api/admin/support/[ticketId]/status/route.ts',
  'app/api/early-access/route.ts',
  'app/api/schools/[schoolId]/disbursements/route.ts',
  'app/api/schools/[schoolId]/profile/route.ts',
  'app/api/schools/[schoolId]/set-primary/route.ts',
  'app/api/schools/[schoolId]/verification-requests/route.ts',
  'app/api/wallet/verify-payment/[reference]/route.ts',
  'app/api/wallet/webhook/route.ts'
];

console.log('🔧 Fixing remaining routes...\n');

let fixed = 0;
let skipped = 0;

routesToFix.forEach(routePath => {
  const filePath = path.join(process.cwd(), routePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipped: ${routePath} (doesn't exist)`);
    skipped++;
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has asyncHandler
  if (content.includes('asyncHandler')) {
    console.log(`✅ Already fixed: ${routePath}`);
    return;
  }

  // Add asyncHandler import if not present
  if (!content.includes("import { asyncHandler }")) {
    // Find the errorHandler import and replace it
    if (content.includes("import { errorHandler }")) {
      content = content.replace(
        "import { errorHandler }",
        "import { asyncHandler }"
      );
    } else {
      // Add new import after other imports
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + 
                "import { asyncHandler } from '@/src/middleware/errorHandler';\n" +
                content.slice(endOfLine + 1);
    }
  }

  // Add lenientRateLimiter import if not present
  if (!content.includes("lenientRateLimiter") && !content.includes("strictRateLimiter")) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLine = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLine + 1) + 
              "import { lenientRateLimiter } from '@/src/middleware/rateLimiter';\n" +
              content.slice(endOfLine + 1);
  }

  // Convert async function to asyncHandler
  // Pattern: export async function METHOD(req: Request, ...
  content = content.replace(
    /export async function (GET|POST|PUT|PATCH|DELETE)\(/g,
    'export const $1 = asyncHandler(async ('
  );

  // Add closing parenthesis for asyncHandler
  // Find the last closing brace of the function
  const functionMatches = content.match(/export const (GET|POST|PUT|PATCH|DELETE) = asyncHandler\(async \(/g);
  if (functionMatches) {
    functionMatches.forEach(() => {
      // Find the last } before the next export or end of file
      const lastBraceIndex = content.lastIndexOf('}');
      if (lastBraceIndex !== -1) {
        // Check if it's already wrapped
        if (content[lastBraceIndex + 1] !== ')') {
          content = content.slice(0, lastBraceIndex + 1) + ')' + content.slice(lastBraceIndex + 1);
        }
      }
    });
  }

  // Remove try-catch blocks since asyncHandler handles errors
  content = content.replace(/try \{\s*/g, '');
  content = content.replace(/\} catch \(error\) \{[\s\S]*?return errorHandler\(error\);[\s\S]*?\}/g, '');

  // Add lenientRateLimiter call at the beginning of handler if not present
  if (!content.includes('await lenientRateLimiter') && !content.includes('await strictRateLimiter')) {
    content = content.replace(
      /(export const (?:GET|POST|PUT|PATCH|DELETE) = asyncHandler\(async \([^)]*\)[^{]*\{)/,
      '$1\n  await lenientRateLimiter(req);\n'
    );
  }

  // Fix context parameter to be optional
  content = content.replace(
    /\{ params \}: \{ params: Promise/g,
    'context?: { params: Promise'
  );
  
  // Fix params access
  content = content.replace(
    /const \{ ([^}]+) \} = await params;/g,
    'const { $1 } = await context!.params;'
  );

  // Write the fixed content
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${routePath}`);
  fixed++;
});

console.log('\n' + '='.repeat(60));
console.log('📊 Summary');
console.log('='.repeat(60));
console.log(`✅ Fixed: ${fixed}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log('\n✨ Done! Run "pnpm verify-routes" to check all routes.\n');
