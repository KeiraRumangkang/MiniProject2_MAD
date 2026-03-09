import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


// validator role agar sama dengan schema
const roleValidator = v.union(
  v.literal("mahasiswa"),
  v.literal("staff"),
  v.literal("kepala_perpustakaan")
);


// =====================
// USER
// =====================

export const registerUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: args.role,
      createdAt: Date.now(),
      isActive: true,
    });
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});


// =====================
// BOOKS
// =====================

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    category: v.string(),
    year: v.number(),
    synopsis: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", {
      title: args.title,
      author: args.author,
      category: args.category,
      year: args.year,
      synopsis: args.synopsis,
      status: "available",
      createdAt: Date.now(),
    });
  },
});

export const getBooks = query({
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

export const getBookById = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


// =====================
// LOANS
// =====================

export const borrowBook = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {

    await ctx.db.insert("loans", {
      userId: args.userId,
      bookId: args.bookId,
      status: "borrowed",
      borrowDate: Date.now(),
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.patch(args.bookId, {
      status: "borrowed",
    });
  },
});

export const returnBook = mutation({
  args: {
    loanId: v.id("loans"),
  },
  handler: async (ctx, args) => {

    const loan = await ctx.db.get(args.loanId);

    if (!loan) return;

    await ctx.db.patch(args.loanId, {
      status: "returned",
      returnDate: Date.now(),
    });

    await ctx.db.patch(loan.bookId, {
      status: "available",
    });
  },
});

export const getUserLoans = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loans")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});


// =====================
// FORUM
// =====================

export const createPost = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("forum_posts", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      category: args.category,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

export const getPosts = query({
  handler: async (ctx) => {
    return await ctx.db.query("forum_posts").collect();
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("forum_posts"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("forum_comments", {
      postId: args.postId,
      userId: args.userId,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getComments = query({
  args: {
    postId: v.id("forum_posts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forum_comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .collect();
  },
});