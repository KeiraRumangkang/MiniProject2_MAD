import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllBooks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

export const searchBooks = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("bookCategories")),
    year: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("limited"),
        v.literal("unavailable")
      )
    ),
  },
  handler: async (ctx, args) => {
    let books = await ctx.db.query("books").collect();

    if (args.search) {
      const keyword = args.search.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(keyword) ||
          book.author.toLowerCase().includes(keyword)
      );
    }

    if (args.categoryId) {
      books = books.filter((book) => book.categoryId === args.categoryId);
    }

    if (args.year) {
      books = books.filter((book) => book.year === args.year);
    }

    if (args.status) {
      books = books.filter((book) => book.status === args.status);
    }

    return books;
  },
});

export const getBookDetail = query({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_bookId", (q) => q.eq("bookId", args.bookId))
      .collect();

    return {
      book,
      reviews,
    };
  },
});

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    synopsis: v.string(),
    categoryId: v.id("bookCategories"),
    year: v.number(),
    stockTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("books", {
      title: args.title,
      author: args.author,
      synopsis: args.synopsis,
      categoryId: args.categoryId,
      year: args.year,
      coverImage: "",
      stockTotal: args.stockTotal,
      stockAvailable: args.stockTotal,
      locationCode: "",
      isbn: "",
      language: "Indonesia",
      pages: 0,
      status: args.stockTotal > 0 ? "available" : "unavailable",
      totalBorrowed: 0,
      totalFavorite: 0,
      totalSearch: 0,
      averageRating: 0,
      createdAt: now,
    });
  },
});

export const deleteBook = mutation({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.bookId);
    return { success: true };
  },
});

export const addFavorite = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const already = existing.find((f) => f.bookId === args.bookId);

    if (already) {
      return { success: false };
    }

    await ctx.db.insert("favorites", {
      userId: args.userId,
      bookId: args.bookId,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getUserFavorites = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const books = [];

    for (const fav of favorites) {
      const book = await ctx.db.get(fav.bookId);
      if (book) {
        books.push(book);
      }
    }

    return books;
  },
});