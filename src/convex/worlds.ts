import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createWorld = mutation({
  args: {
    name: v.string(),
    seed: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const worldId = await ctx.db.insert("worlds", {
      name: args.name,
      seed: args.seed ?? Math.floor(Math.random() * 1000000),
      ownerId: userId,
      isPublic: args.isPublic ?? false,
      description: args.description,
    });

    // Initialize player data for this world
    await ctx.db.insert("players", {
      userId,
      worldId,
      position: { x: 0, y: 64, z: 0 },
      rotation: { x: 0, y: 0 },
      inventory: [
        { type: "grass", count: 64, slot: 0 },
        { type: "dirt", count: 64, slot: 1 },
        { type: "stone", count: 64, slot: 2 },
        { type: "wood", count: 64, slot: 3 },
      ],
    });

    return worldId;
  },
});

export const getMyWorlds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("worlds")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const getPublicWorlds = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("worlds")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .take(20);
  },
});

export const getWorld = query({
  args: { worldId: v.id("worlds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.worldId);
  },
});
