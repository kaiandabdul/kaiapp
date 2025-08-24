import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Test table schema for connection verification
export const testConnection = mutation({
  args: {
    appName: v.string(),
    timestamp: v.number(),
    testData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a test record to verify write access
    const testRecord = await ctx.db.insert("connectionTests", {
      appName: args.appName,
      timestamp: args.timestamp,
      testData: args.testData || "Connection test from " + args.appName,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      recordId: testRecord,
      message: `Successfully connected from ${args.appName}`,
      timestamp: args.timestamp,
    };
  },
});

// Query to verify read access and get connection status
export const getConnectionStatus = query({
  args: {
    appName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all connection test records
    const tests = await ctx.db
      .query("connectionTests")
      .order("desc")
      .take(100);

    // Get unique apps that have connected
    const connectedApps = [...new Set(tests.map(test => test.appName))];
    
    // Get the most recent test for the specified app
    const appSpecificTest = args.appName 
      ? tests.find(test => test.appName === args.appName)
      : null;

    return {
      success: true,
      totalTests: tests.length,
      connectedApps,
      lastTest: tests[0] || null,
      appSpecificTest,
      deploymentId: process.env.CONVEX_DEPLOYMENT || "unknown", // This will be the same for all apps if they're connected to the same DB
    };
  },
});

// Clean up old test records
export const cleanupTestRecords = mutation({
  args: {
    olderThanHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.olderThanHours || 24;
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    const oldTests = await ctx.db
      .query("connectionTests")
      .filter(q => q.lt(q.field("timestamp"), cutoffTime))
      .collect();

    // Delete old test records
    for (const test of oldTests) {
      await ctx.db.delete(test._id);
    }

    return {
      success: true,
      deletedCount: oldTests.length,
      message: `Cleaned up ${oldTests.length} test records older than ${hours} hours`,
    };
  },
});

// Comprehensive test function that tests all aspects
export const runComprehensiveTest = mutation({
  args: {
    appName: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const testData = `Comprehensive test from ${args.appName} at ${new Date().toISOString()}`;

    try {
      // Test 1: Write operation
      const writeResult = await ctx.db.insert("connectionTests", {
        appName: args.appName,
        timestamp,
        testData,
        createdAt: new Date().toISOString(),
        testType: "comprehensive",
      });

      // Test 2: Read operation
      const readResult = await ctx.db.get(writeResult);

      // Test 3: Query operation
      const queryResult = await ctx.db
        .query("connectionTests")
        .filter(q => q.eq(q.field("appName"), args.appName))
        .order("desc")
        .take(5);

      // Test 4: Count operation
      const countResult = await ctx.db
        .query("connectionTests")
        .filter(q => q.eq(q.field("appName"), args.appName))
        .collect();

      return {
        success: true,
        tests: {
          write: { success: true, recordId: writeResult },
          read: { success: true, data: readResult },
          query: { success: true, count: queryResult.length },
          count: { success: true, total: countResult.length },
        },
        databaseInfo: {
          deploymentId: process.env.CONVEX_DEPLOYMENT || "unknown",
          timestamp,
          appName: args.appName,
        },
        message: "All database operations successful",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp,
        appName: args.appName,
      };
    }
  },
});

// Get database info for verification
export const getDatabaseInfo = query({
  args: {},
  handler: async (ctx) => {
    return {
      deploymentId: process.env.CONVEX_DEPLOYMENT || "unknown",
      timestamp: Date.now(),
      message: "Database connection verified",
    };
  },
});
