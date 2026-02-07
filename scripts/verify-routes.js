#!/usr/bin/env node

/**
 * Verify Route Handlers Script
 * Checks that all API routes use asyncHandler properly
 * Run with: node scripts/verify-routes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying API route handlers...\n');

let totalRoutes = 0;
let routesWithAsyncHandler = 0;
let routesWithoutAsyncHandler = [];

/**
 * Recursively find all route.ts files
 */
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check if route file uses asyncHandler
 */
function checkRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);

  totalRoutes++;

  // Check for asyncHandler import
  const hasAsyncHandlerImport = content.includes("import { asyncHandler }") || 
                                  content.includes("import {asyncHandler}");

  // Check for asyncHandler usage
  const hasAsyncHandlerUsage = content.includes("= asyncHandler(");

  if (hasAsyncHandlerImport && hasAsyncHandlerUsage) {
    routesWithAsyncHandler++;
    console.log(`✅ ${relativePath}`);
    return true;
  } else {
    routesWithoutAsyncHandler.push(relativePath);
    console.log(`❌ ${relativePath} - Missing asyncHandler`);
    return false;
  }
}

// Find all route files in app/api
const apiDir = path.join(process.cwd(), 'app', 'api');
if (!fs.existsSync(apiDir)) {
  console.error('❌ app/api directory not found');
  process.exit(1);
}

const routeFiles = findRouteFiles(apiDir);

console.log(`\nFound ${routeFiles.length} route files\n`);

// Check each route file
routeFiles.forEach(checkRouteFile);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary');
console.log('='.repeat(60));
console.log(`Total routes: ${totalRoutes}`);
console.log(`✅ With asyncHandler: ${routesWithAsyncHandler}`);
console.log(`❌ Without asyncHandler: ${routesWithoutAsyncHandler.length}`);

if (routesWithoutAsyncHandler.length > 0) {
  console.log('\n⚠️  Routes missing asyncHandler:');
  routesWithoutAsyncHandler.forEach(route => {
    console.log(`   - ${route}`);
  });
  console.log('\n💡 Add asyncHandler to these routes to prevent build cache issues');
  process.exit(1);
} else {
  console.log('\n✨ All routes properly configured!');
  process.exit(0);
}
