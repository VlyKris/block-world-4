import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple terrain generation
function generateChunk(chunkX: number, chunkZ: number, seed: number) {
  const blocks = [];
  const CHUNK_SIZE = 16;
  
  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      const worldX = chunkX * CHUNK_SIZE + x;
      const worldZ = chunkZ * CHUNK_SIZE + z;
      
      // Simple height map using seed-based noise
      const height = Math.floor(
        32 + 16 * Math.sin((worldX + seed) * 0.1) * Math.cos((worldZ + seed) * 0.1)
      );
      
      // Generate terrain layers
      for (let y = 0; y <= height; y++) {
        let blockType = "stone";
        
        if (y === height && height > 30) {
          blockType = "grass";
        } else if (y > height - 3 && height > 30) {
          blockType = "dirt";
        } else if (height <= 30) {
          blockType = "sand";
        }
        
        blocks.push({ x, y, z, type: blockType });
      }
      
      // Add some trees randomly
      if (Math.random() < 0.05 && height > 30) {
        const treeHeight = 4 + Math.floor(Math.random() * 3);
        for (let y = height + 1; y <= height + treeHeight; y++) {
          blocks.push({ x, y, z, type: "wood" });
        }
        // Add leaves
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            for (let dy = 0; dy <= 2; dy++) {
              if (x + dx >= 0 && x + dx < CHUNK_SIZE && z + dz >= 0 && z + dz < CHUNK_SIZE) {
                blocks.push({ 
                  x: x + dx, 
                  y: height + treeHeight + dy, 
                  z: z + dz, 
                  type: "leaves" 
                });
              }
            }
          }
        }
      }
    }
  }
  
  return blocks;
}

export const getChunk = query({
  args: {
    worldId: v.id("worlds"),
    chunkX: v.number(),
    chunkZ: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chunks")
      .withIndex("by_world_and_position", (q) =>
        q.eq("worldId", args.worldId)
         .eq("chunkX", args.chunkX)
         .eq("chunkZ", args.chunkZ)
      )
      .unique();
  },
});

export const generateChunkMutation = mutation({
  args: {
    worldId: v.id("worlds"),
    chunkX: v.number(),
    chunkZ: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if chunk already exists
    const existingChunk = await ctx.db
      .query("chunks")
      .withIndex("by_world_and_position", (q) =>
        q.eq("worldId", args.worldId)
         .eq("chunkX", args.chunkX)
         .eq("chunkZ", args.chunkZ)
      )
      .unique();

    if (existingChunk) {
      return existingChunk;
    }

    // Generate new chunk
    const world = await ctx.db.get(args.worldId);
    if (!world) {
      throw new Error("World not found");
    }

    const blocks = generateChunk(args.chunkX, args.chunkZ, world.seed);
    
    const chunkId = await ctx.db.insert("chunks", {
      worldId: args.worldId,
      chunkX: args.chunkX,
      chunkZ: args.chunkZ,
      blocks,
    });

    return await ctx.db.get(chunkId);
  },
});

export const updateBlock = mutation({
  args: {
    worldId: v.id("worlds"),
    x: v.number(),
    y: v.number(),
    z: v.number(),
    blockType: v.union(v.string(), v.null()), // null means remove block
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chunkX = Math.floor(args.x / 16);
    const chunkZ = Math.floor(args.z / 16);
    const localX = args.x - chunkX * 16;
    const localZ = args.z - chunkZ * 16;

    const chunk = await ctx.db
      .query("chunks")
      .withIndex("by_world_and_position", (q) =>
        q.eq("worldId", args.worldId)
         .eq("chunkX", chunkX)
         .eq("chunkZ", chunkZ)
      )
      .unique();

    if (!chunk) {
      throw new Error("Chunk not found");
    }

    const blocks = [...chunk.blocks];
    const blockIndex = blocks.findIndex(
      (block) => block.x === localX && block.y === args.y && block.z === localZ
    );

    if (args.blockType === null) {
      // Remove block
      if (blockIndex !== -1) {
        blocks.splice(blockIndex, 1);
      }
    } else {
      // Add or update block
      if (blockIndex !== -1) {
        blocks[blockIndex].type = args.blockType;
      } else {
        blocks.push({
          x: localX,
          y: args.y,
          z: localZ,
          type: args.blockType,
        });
      }
    }

    await ctx.db.patch(chunk._id, { blocks });
  },
});