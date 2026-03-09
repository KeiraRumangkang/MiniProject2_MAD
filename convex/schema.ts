import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),

    role: v.union(
      v.literal("mahasiswa"),
      v.literal("staff"),
      v.literal("kepala_perpustakaan")
    ),

    fakultas: v.optional(v.string()),
    createdAt: v.number(),
    isActive: v.boolean(),
  }),

  books: defineTable({
    title: v.string(),
    author: v.string(),
    category: v.string(),
    year: v.number(),
    synopsis: v.string(),
    coverUrl: v.optional(v.string()),

    status: v.union(
      v.literal("available"),
      v.literal("borrowed"),
      v.literal("reserved")
    ),

    rating: v.optional(v.number()),
    createdAt: v.number(),
  }),

  loans: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),

    status: v.union(
      v.literal("borrowed"),
      v.literal("returned"),
      v.literal("late")
    ),

    borrowDate: v.number(),
    dueDate: v.number(),
    returnDate: v.optional(v.number()),
  }),

  forum_posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),

    likes: v.number(),
    createdAt: v.number(),
  }),

  forum_comments: defineTable({
    postId: v.id("forum_posts"),
    userId: v.id("users"),
    content: v.string(),

    createdAt: v.number(),
  }),

});