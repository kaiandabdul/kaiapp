import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  connectionTests: defineTable({
    appName: v.string(),
    timestamp: v.number(),
    testData: v.optional(v.string()),
    createdAt: v.string(),
    testType: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"]),
});
