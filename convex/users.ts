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