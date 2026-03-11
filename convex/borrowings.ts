/**
 * ========================================
 * BORROWINGS API — PEMINJAMAN BUKU
 * ========================================
 * File ini ngurus semua operasi terkait peminjaman buku.
 * 
 * Queries:
 * - getBorrowingByUser        → ambil peminjaman per mahasiswa (raw)
 * - getBorrowingByUserEnriched → ambil peminjaman + info buku (buat UI mahasiswa)
 * - getLateBorrowings         → ambil yang terlambat (buat dashboard)
 * - getAllBorrowings           → ambil semua + info user/buku (buat UI staff)
 * 
 * Mutations:
 * - borrowBook       → mahasiswa pinjam buku (status: requested)
 * - verifyBorrowing  → staff setujui peminjaman (status: borrowed, stok berkurang)
 * - returnBook       → staff verifikasi pengembalian (status: returned, stok nambah)
 * - rejectBorrowing  → staff tolak peminjaman (status: rejected)
 * 
 * Status flow peminjaman:
 * requested → [verifyBorrowing] → borrowed → [returnBook] → returned
 * requested → [rejectBorrowing] → rejected
 * borrowed (lewat deadline) → late
 * ========================================
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// mahasiswa pinjam buku — status awal "requested" (belum diverifikasi staff)
export const borrowBook = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dueDate = now + 1000 * 60 * 60 * 24 * 7;

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Buku tidak ditemukan");
    if (book.stockAvailable <= 0) throw new Error("Stok buku habis");

    await ctx.db.insert("borrowings", {
      userId: args.userId,
      bookId: args.bookId,
      borrowDate: now,
      dueDate,
      returnDate: undefined,
      extendedCount: 0,
      fineAmount: 0,
      status: "requested",
      verifiedByStaffId: undefined,
      notes: "",
      createdAt: now,
    });

    return { success: true };
  },
});

export const verifyBorrowing = mutation({
  args: {
    borrowingId: v.id("borrowings"),
    staffId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Data peminjaman tidak ditemukan");

    const book = await ctx.db.get(borrowing.bookId);
    if (!book) throw new Error("Buku tidak ditemukan");
    if (book.stockAvailable <= 0) throw new Error("Stok habis");

    await ctx.db.patch(args.borrowingId, {
      status: "borrowed",
      verifiedByStaffId: args.staffId,
    });

    await ctx.db.patch(borrowing.bookId, {
      stockAvailable: book.stockAvailable - 1,
      totalBorrowed: book.totalBorrowed + 1,
      status:
        book.stockAvailable - 1 <= 0
          ? "unavailable"
          : book.stockAvailable - 1 <= 2
          ? "limited"
          : "available",
    });

    return { success: true };
  },
});

export const returnBook = mutation({
  args: {
    borrowingId: v.id("borrowings"),
    staffId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Peminjaman tidak ditemukan");

    const book = await ctx.db.get(borrowing.bookId);
    if (!book) throw new Error("Buku tidak ditemukan");

    await ctx.db.patch(args.borrowingId, {
      status: "returned",
      returnDate: now,
      verifiedByStaffId: args.staffId,
    });

    const newAvailable = book.stockAvailable + 1;

    await ctx.db.patch(borrowing.bookId, {
      stockAvailable: newAvailable,
      status: newAvailable <= 2 ? "limited" : "available",
    });

    return { success: true };
  },
});

export const getBorrowingByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("borrowings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getLateBorrowings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("borrowings")
      .withIndex("by_status", (q) => q.eq("status", "late"))
      .collect();
  },
});

// ==================== MAHASISWA API ====================

// ambil semua peminjaman mahasiswa, lengkap sama judul buku
export const getBorrowingByUserEnriched = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const now = Date.now();

    // gabungin data buku ke tiap peminjaman
    const enriched = [];
    for (const b of borrowings) {
      const book = await ctx.db.get(b.bookId);
      const isOverdue = b.status === "borrowed" && b.dueDate < now;

      enriched.push({
        ...b,
        bookTitle: book?.title || "Buku tidak ditemukan",
        bookAuthor: book?.author || "-",
        effectiveStatus: isOverdue ? "late" : b.status,
      });
    }

    // urutkan dari yang paling baru
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ==================== STAFF APIS ====================

export const getAllBorrowings = query({
  args: {},
  handler: async (ctx) => {
    const borrowings = await ctx.db.query("borrowings").collect();
    const users = await ctx.db.query("users").collect();
    const books = await ctx.db.query("books").collect();
    const now = Date.now();

    return borrowings.map((b) => {
      const user = users.find((u) => u._id === b.userId);
      const book = books.find((bk) => bk._id === b.bookId);
      const isOverdue = b.status === "borrowed" && b.dueDate < now;
      const daysLate = isOverdue
        ? Math.ceil((now - b.dueDate) / (1000 * 60 * 60 * 24))
        : b.status === "late"
        ? Math.ceil((now - b.dueDate) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...b,
        userName: user?.name || "Unknown",
        bookTitle: book?.title || "Unknown",
        daysLate,
        effectiveStatus: isOverdue ? "late" : b.status,
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const rejectBorrowing = mutation({
  args: {
    borrowingId: v.id("borrowings"),
    staffId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Peminjaman tidak ditemukan");

    await ctx.db.patch(args.borrowingId, {
      status: "rejected",
      verifiedByStaffId: args.staffId,
      notes: args.notes || "Ditolak oleh staff",
    });

    return { success: true };
  },
});