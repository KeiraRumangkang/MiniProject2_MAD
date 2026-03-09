import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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