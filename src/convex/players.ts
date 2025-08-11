import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPlayerData = query({
  args: { worldId: v.id("worlds") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("players")
      .withIndex("by_user_and_world", (q) =>
        q.eq("userId", userId).eq("worldId", args.worldId)
      )
      .unique();
  },
});

export const updatePlayerPosition = mutation({
  args: {
    worldId: v.id("worlds"),
    position: v.object({
      x: v.number(),
      y: v.number(),
      z: v.number(),
    }),
    rotation: v.object({
      x: v.number(),
      y: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const player = await ctx.db
      .query("players")
      .withIndex("by_user_and_world", (q) =>
        q.eq("userId", userId).eq("worldId", args.worldId)
      )
      .unique();

    if (!player) {
      throw new Error("Player not found");
    }

    await ctx.db.patch(player._id, {
      position: args.position,
      rotation: args.rotation,
    });
  },
});

export const updateInventory = mutation({
  args: {
    worldId: v.id("worlds"),
    inventory: v.array(v.object({
      type: v.string(),
      count: v.number(),
      slot: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const player = await ctx.db
      .query("players")
      .withIndex("by_user_and_world", (q) =>
        q.eq("userId", userId).eq("worldId", args.worldId)
      )
      .unique();

    if (!player) {
      throw new Error("Player not found");
    }

    await ctx.db.patch(player._id, {
      inventory: args.inventory,
    });
  },
});
