/**
 * ========================================
 * FORUM API — DISKUSI MAHASISWA
 * ========================================
 * Ngurus semua operasi forum diskusi perpustakaan.
 * 
 * Queries:
 * - getForumPosts       → ambil semua post
 * - getForumPostDetail  → ambil detail post + komentar + nama user (buat detail thread)
 * 
 * Mutations (Mahasiswa):
 * - createForumPost   → bikin post baru
 * - addForumComment   → tambah komentar di post
 * - likePost          → like post (dicek duplikat)
 * 
 * Mutations (Staff Moderasi):
 * - deleteForumPost   → soft-delete post (isDeleted = true)
 * - pinForumPost      → toggle pin post (isPinned)
 * 
 * Kategori post: review_buku, rekomendasi_buku, tanya_buku, 
 *                diskusi_pengetahuan, buku_skripsi
 * ========================================
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ambil semua post forum (tanpa filter, filtering dilakukan di frontend)
export const getForumPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forumPosts").collect();
  },
});

// ambil detail post + semua komentar buat halaman detail thread
export const getForumPostDetail = query({
  args: {
    postId: v.id("forumPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post tidak ditemukan");

    // ambil nama si pembuat post
    const author = await ctx.db.get(post.userId);

    // ambil semua komentar di post ini
    const comments = await ctx.db
      .query("forumComments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    // gabungin nama user ke tiap komentar
    const enrichedComments = [];
    for (const c of comments) {
      const user = await ctx.db.get(c.userId);
      enrichedComments.push({
        ...c,
        userName: user?.name || "Anonim",
      });
    }

    // urutkan komentar dari yang paling lama (biar kayak chat)
    enrichedComments.sort((a, b) => a.createdAt - b.createdAt);

    return {
      post,
      authorName: author?.name || "Anonim",
      comments: enrichedComments,
    };
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

// ==================== STAFF MODERATION APIS ====================

export const deleteForumPost = mutation({
  args: {
    postId: v.id("forumPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post tidak ditemukan");

    await ctx.db.patch(args.postId, {
      isDeleted: true,
    });

    return { success: true };
  },
});

export const pinForumPost = mutation({
  args: {
    postId: v.id("forumPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post tidak ditemukan");

    await ctx.db.patch(args.postId, {
      isPinned: !post.isPinned,
    });

    return { success: true, isPinned: !post.isPinned };
  },
});

export const updateForumPost = mutation({
  args: {
    postId: v.id("forumPosts"),
    category: v.union(
      v.literal("review_buku"),
      v.literal("rekomendasi_buku"),
      v.literal("tanya_buku"),
      v.literal("diskusi_pengetahuan"),
      v.literal("buku_skripsi")
    ),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post tidak ditemukan");
    if (post.isDeleted) throw new Error("Post sudah dihapus");

    const title = args.title.trim();
    const content = args.content.trim();

    if (!title || !content) {
      throw new Error("Judul dan isi post wajib diisi");
    }

    await ctx.db.patch(args.postId, {
      category: args.category,
      title,
      content,
    });

    return { success: true };
  },
});