import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getForumPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forumPosts").collect();
  },
});

export const createForumPost = mutation({
  args: {
    userId: v.id("users"),
    category: v.union(
      v.literal("review_buku"),
      v.literal("rekomendasi_buku"),
      v.literal("tanya_buku"),
      v.literal("diskusi_pengetahuan"),
      v.literal("buku_skripsi")
    ),
    title: v.string(),
    content: v.string(),
    relatedBookId: v.optional(v.id("books")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("forumPosts", {
      userId: args.userId,
      category: args.category,
      title: args.title,
      content: args.content,
      relatedBookId: args.relatedBookId,
      imageUrl: "",
      isPinned: false,
      isDeleted: false,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
    });
  },
});

export const addForumComment = mutation({
  args: {
    postId: v.id("forumPosts"),
    userId: v.id("users"),
    content: v.string(),
    parentCommentId: v.optional(v.id("forumComments")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("forumComments", {
      postId: args.postId,
      userId: args.userId,
      parentCommentId: args.parentCommentId,
      content: args.content,
      upvoteCount: 0,
      isDeleted: false,
      createdAt: now,
    });

    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: post.commentCount + 1,
      });
    }

    return { success: true };
  },
});

export const likePost = mutation({
  args: {
    postId: v.id("forumPosts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("forumLikes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const alreadyLiked = existing.find((item) => item.postId === args.postId);
    if (alreadyLiked) {
      return { success: false, message: "Sudah like" };
    }

    await ctx.db.insert("forumLikes", {
      postId: args.postId,
      userId: args.userId,
      createdAt: Date.now(),
    });

    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });
    }

    return { success: true };
  },
});