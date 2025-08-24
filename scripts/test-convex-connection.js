#!/usr/bin/env node

/**
 * Convex Database Connection Test Script
 * 
 * This script tests if all apps in the workspace are connected to the same Convex database.
 * Run this script from the root directory to test all apps.
 */

import { ConvexHttpClient } from "convex/browser";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: ".env.local" });

const CONVEX_URL = process.env.CONVEX_URL;
const APPS = ["web", "mcp", "docs"];

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL not found in environment variables");
  process.exit(1);
}

console.log("🔍 Testing Convex Database Connection for all apps...");
console.log(`📡 Convex URL: ${CONVEX_URL}\n`);

// Create Convex client
const convex = new ConvexHttpClient(CONVEX_URL);

async function testAppConnection(appName) {
  console.log(`🧪 Testing ${appName} app...`);
  
  try {
    // Test 1: Get database info
    const dbInfo = await convex.query("functions/testDatabaseConnection.js:getDatabaseInfo");
    console.log(`   ✅ Database info retrieved: ${dbInfo.deploymentId}`);
    
    // Test 2: Run comprehensive test
    const testResult = await convex.mutation("functions/testDatabaseConnection.js:runComprehensiveTest", {
      appName: appName,
    });
    
    if (testResult.success) {
      console.log(`   ✅ All database operations successful`);
      console.log(`   📊 Tests passed: ${Object.keys(testResult.tests).length}`);
      return {
        success: true,
        appName,
        databaseName: dbInfo.deploymentId,
        timestamp: testResult.databaseInfo.timestamp,
      };
    } else {
      console.log(`   ❌ Test failed: ${testResult.error}`);
      return {
        success: false,
        appName,
        error: testResult.error,
      };
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return {
      success: false,
      appName,
      error: error.message,
    };
  }
}

async function checkEnvironmentFiles() {
  console.log("🔍 Checking environment files...");
  
  const envFiles = APPS.map(app => `.env.local`).concat(APPS.map(app => `apps/${app}/.env.local`));
  const envConfigs = new Set();
  
  for (const envFile of envFiles) {
    try {
      const envPath = join(process.cwd(), envFile);
      const envContent = readFileSync(envPath, 'utf8');
      
      // Extract CONVEX_URL and CONVEX_DEPLOYMENT
      const convexUrlMatch = envContent.match(/CONVEX_URL=(.+)/);
      const convexDeploymentMatch = envContent.match(/CONVEX_DEPLOYMENT=(.+)/);
      
      if (convexUrlMatch && convexDeploymentMatch) {
        const config = `${convexUrlMatch[1].trim()}|${convexDeploymentMatch[1].trim()}`;
        envConfigs.add(config);
        console.log(`   ✅ ${envFile}: ${convexDeploymentMatch[1].trim()}`);
      } else {
        console.log(`   ⚠️  ${envFile}: Missing CONVEX_URL or CONVEX_DEPLOYMENT`);
      }
    } catch (error) {
      console.log(`   ❌ ${envFile}: File not found or unreadable`);
    }
  }
  
  if (envConfigs.size === 1) {
    console.log("   ✅ All environment files use the same Convex configuration");
    return true;
  } else {
    console.log(`   ❌ Found ${envConfigs.size} different Convex configurations`);
    return false;
  }
}

async function getConnectionStatus() {
  try {
    const status = await convex.query("functions/testDatabaseConnection.js:getConnectionStatus");
    console.log("\n📊 Connection Status:");
    console.log(`   Total tests: ${status.totalTests}`);
    console.log(`   Connected apps: ${status.connectedApps.join(", ")}`);
    console.log(`   Deployment ID: ${status.deploymentId}`);
    
    if (status.lastTest) {
      console.log(`   Last test: ${status.lastTest.appName} at ${new Date(status.lastTest.timestamp).toLocaleString()}`);
    }
    
    return status;
  } catch (error) {
    console.log(`   ❌ Failed to get connection status: ${error.message}`);
    return null;
  }
}

async function cleanupOldTests() {
  try {
    const result = await convex.mutation("functions/testDatabaseConnection.js:cleanupTestRecords", {
      olderThanHours: 24,
    });
    console.log(`   🧹 Cleaned up ${result.deletedCount} old test records`);
  } catch (error) {
    console.log(`   ⚠️  Cleanup failed: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Starting Convex Database Connection Test\n");
  
  // Check environment files first
  const envConsistent = await checkEnvironmentFiles();
  console.log("");
  
  if (!envConsistent) {
    console.log("❌ Environment files are not consistent. Please check your .env.local files.");
    process.exit(1);
  }
  
  // Test each app
  const results = [];
  for (const app of APPS) {
    const result = await testAppConnection(app);
    results.push(result);
    console.log("");
  }
  
  // Get overall connection status
  await getConnectionStatus();
  
  // Cleanup old tests
  console.log("\n🧹 Cleaning up old test records...");
  await cleanupOldTests();
  
  // Summary
  console.log("\n📋 Test Summary:");
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`   ✅ Successful: ${successfulTests.length}/${results.length}`);
  console.log(`   ❌ Failed: ${failedTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    const databaseNames = [...new Set(successfulTests.map(r => r.databaseName))];
    if (databaseNames.length === 1) {
      console.log(`   🎯 All successful tests use the same database: ${databaseNames[0]}`);
    } else {
      console.log(`   ⚠️  Tests are using different databases: ${databaseNames.join(", ")}`);
    }
  }
  
  if (failedTests.length > 0) {
    console.log("\n❌ Failed Tests:");
    failedTests.forEach(test => {
      console.log(`   - ${test.appName}: ${test.error}`);
    });
  }
  
  // Final result
  if (failedTests.length === 0 && successfulTests.length === results.length) {
    console.log("\n🎉 All apps are successfully connected to the same Convex database!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some apps failed to connect or are using different databases.");
    process.exit(1);
  }
}

// Run the test
main().catch(error => {
  console.error("💥 Test script failed:", error);
  process.exit(1);
});
