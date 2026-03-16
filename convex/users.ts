/**
 * ========================================
 * USERS API — MANAJEMEN PENGGUNA
 * ========================================
 * Ngurus semua operasi terkait data user.
 * 
 * Queries:
 * - getUserByUsername     → cari user berdasarkan username (buat login)
 * - getMahasiswaList      → ambil semua user role mahasiswa (buat staff & profil)
 * - getMahasiswaProfile   → ambil profil lengkap + statistik (buat halaman profil)
 * 
 * Mutations:
 * - suspendUser → ubah status aktif/suspend user (buat staff moderasi)
 * 
 * Note: tabel users punya 3 role: mahasiswa, staff, kepala
 * ========================================
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// cari user berdasarkan username (dipake pas login)
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

// ambil semua mahasiswa (dipake di halaman staff + sementara buat profil)
export const getMahasiswaList = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "mahasiswa"))
      .collect();
  },
});

// ambil data profil + statistik buat halaman profil mahasiswa
export const getMahasiswaProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User tidak ditemukan");

    // hitung total peminjaman
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // hitung total review yang pernah ditulis
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // ambil badge yang udah diraih
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // ambil detail tiap badge
    const badges = [];
    for (const ub of userBadges) {
      const badge = await ctx.db.get(ub.badgeId);
      if (badge) badges.push(badge);
    }

    return {
      user,
      totalBorrowed: borrowings.length,
      totalReviews: reviews.length,
      totalBadges: badges.length,
      badges,
    };
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
    });

    return { success: true };
  },
});

export const createMahasiswa = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    password: v.string(),
    faculty: v.optional(v.string()),
    points: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const username = args.username.trim().toLowerCase();
    const password = args.password.trim();
    const faculty = args.faculty?.trim() || "";

    if (!name || !username || !password) {
      throw new Error("Nama, username, dan password wajib diisi");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (existing) {
      throw new Error("Username sudah digunakan");
    }

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      name,
      username,
      password,
      role: "mahasiswa",
      faculty,
      profileImage: "",
      bio: "",
      points: args.points ?? 0,
      isActive: args.isActive ?? true,
      createdAt: now,
    });

    return { success: true, userId };
  },
});

export const updateMahasiswa = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    username: v.string(),
    password: v.optional(v.string()),
    faculty: v.optional(v.string()),
    points: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User tidak ditemukan");
    if (user.role !== "mahasiswa") throw new Error("Hanya user mahasiswa yang dapat diubah");

    const name = args.name.trim();
    const username = args.username.trim().toLowerCase();
    const faculty = args.faculty?.trim() || "";

    if (!name || !username) {
      throw new Error("Nama dan username wajib diisi");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (existing && existing._id !== args.userId) {
      throw new Error("Username sudah digunakan");
    }

    const patch: any = {
      name,
      username,
      faculty,
    };

    if (args.password !== undefined) {
      const nextPassword = args.password.trim();
      if (!nextPassword) throw new Error("Password tidak boleh kosong");
      patch.password = nextPassword;
    }

    if (args.points !== undefined) patch.points = args.points;
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.userId, patch);

    return { success: true };
  },
});

export const deleteMahasiswa = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User tidak ditemukan");
    if (user.role !== "mahasiswa") throw new Error("Hanya user mahasiswa yang dapat dihapus");

    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (borrowings.length > 0) {
      throw new Error("User tidak dapat dihapus karena punya riwayat peminjaman");
    }

    const forumPosts = await ctx.db
      .query("forumPosts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    if (forumPosts.length > 0) {
      throw new Error("User tidak dapat dihapus karena punya riwayat post forum");
    }

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    if (reviews.length > 0) {
      throw new Error("User tidak dapat dihapus karena punya riwayat review");
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of favorites) {
      await ctx.db.delete(item._id);
    }

    const forumComments = await ctx.db
      .query("forumComments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of forumComments) {
      await ctx.db.delete(item._id);
    }

    const forumLikes = await ctx.db
      .query("forumLikes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of forumLikes) {
      await ctx.db.delete(item._id);
    }

    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of userBadges) {
      await ctx.db.delete(item._id);
    }

    const challengeParticipants = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of challengeParticipants) {
      await ctx.db.delete(item._id);
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of notifications) {
      await ctx.db.delete(item._id);
    }

    const searchLogs = await ctx.db.query("searchLogs").collect();
    for (const item of searchLogs) {
      if (item.userId === args.userId) {
        await ctx.db.delete(item._id);
      }
    }

    await ctx.db.delete(args.userId);

    return { success: true };
  },
});