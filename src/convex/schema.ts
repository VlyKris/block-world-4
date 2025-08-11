import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Minecraft world data
    worlds: defineTable({
      name: v.string(),
      seed: v.number(),
      ownerId: v.id("users"),
      isPublic: v.boolean(),
      description: v.optional(v.string()),
    })
      .index("by_owner", ["ownerId"])
      .index("by_public", ["isPublic"]),

    // Block data for chunks
    chunks: defineTable({
      worldId: v.id("worlds"),
      chunkX: v.number(),
      chunkZ: v.number(),
      blocks: v.array(v.object({
        x: v.number(),
        y: v.number(),
        z: v.number(),
        type: v.string(), // grass, dirt, stone, wood, etc.
      })),
    })
      .index("by_world_and_position", ["worldId", "chunkX", "chunkZ"]),

    // Player data
    players: defineTable({
      userId: v.id("users"),
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
      inventory: v.array(v.object({
        type: v.string(),
        count: v.number(),
        slot: v.number(),
      })),
    })
      .index("by_user_and_world", ["userId", "worldId"])
      .index("by_world", ["worldId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;