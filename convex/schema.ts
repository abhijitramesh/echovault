import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    rawText: v.string(),
    source: v.union(v.literal("voice"), v.literal("text"), v.literal("mcp")),

    // Extracted by Claude
    summary: v.string(),
    people: v.array(v.string()),
    tasks: v.array(v.string()),
    topics: v.array(v.string()),
    decisions: v.array(v.string()),

    // Metadata
    createdAt: v.number(),

    // Vector search
    embedding: v.array(v.float64()),
  })
    .index("by_created", ["createdAt"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
});
