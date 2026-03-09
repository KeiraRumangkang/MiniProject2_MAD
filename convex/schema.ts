import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("mahasiswa"),
      v.literal("staff"),
      v.literal("kepala")
    ),
    faculty: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    points: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  bookCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  books: defineTable({
    title: v.string(),
    author: v.string(),
    synopsis: v.string(),
    categoryId: v.id("bookCategories"),
    year: v.number(),
    coverImage: v.optional(v.string()),
    stockTotal: v.number(),
    stockAvailable: v.number(),
    locationCode: v.optional(v.string()),
    isbn: v.optional(v.string()),
    language: v.optional(v.string()),
    pages: v.optional(v.number()),
    status: v.union(
      v.literal("available"),
      v.literal("limited"),
      v.literal("unavailable")
    ),
    totalBorrowed: v.number(),
    totalFavorite: v.number(),
    totalSearch: v.number(),
    averageRating: v.number(),
    createdAt: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_title", ["title"])
    .index("by_status", ["status"]),

  borrowings: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    borrowDate: v.number(),
    dueDate: v.number(),
    returnDate: v.optional(v.number()),
    extendedCount: v.number(),
    fineAmount: v.number(),
    status: v.union(
      v.literal("requested"),
      v.literal("borrowed"),
      v.literal("returned"),
      v.literal("late"),
      v.literal("rejected")
    ),
    verifiedByStaffId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_bookId", ["bookId"])
    .index("by_status", ["status"]),

  reservations: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    status: v.union(
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    queueNumber: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_bookId", ["bookId"]),

  favorites: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_bookId", ["bookId"]),

  reviews: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    rating: v.number(),
    reviewText: v.string(),
    createdAt: v.number(),
  })
    .index("by_bookId", ["bookId"])
    .index("by_userId", ["userId"]),

  forumPosts: defineTable({
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
    imageUrl: v.optional(v.string()),
    isPinned: v.boolean(),
    isDeleted: v.boolean(),
    likeCount: v.number(),
    commentCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_category", ["category"])
    .index("by_relatedBookId", ["relatedBookId"]),

  forumComments: defineTable({
    postId: v.id("forumPosts"),
    userId: v.id("users"),
    parentCommentId: v.optional(v.id("forumComments")),
    content: v.string(),
    upvoteCount: v.number(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"])
    .index("by_parentCommentId", ["parentCommentId"]),

  forumLikes: defineTable({
    postId: v.id("forumPosts"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"]),

  searchLogs: defineTable({
    userId: v.optional(v.id("users")),
    keyword: v.string(),
    resultCount: v.number(),
    clickedBookId: v.optional(v.id("books")),
    createdAt: v.number(),
  })
    .index("by_keyword", ["keyword"])
    .index("by_clickedBookId", ["clickedBookId"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    eventDate: v.number(),
    location: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_eventDate", ["eventDate"]),

  readingChallenges: defineTable({
    title: v.string(),
    description: v.string(),
    targetBooks: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    rewardPoints: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  challengeParticipants: defineTable({
    challengeId: v.id("readingChallenges"),
    userId: v.id("users"),
    progressBooks: v.number(),
    isCompleted: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_challengeId", ["challengeId"])
    .index("by_userId", ["userId"]),

  badges: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_badgeId", ["badgeId"]),

  quotes: defineTable({
    text: v.string(),
    sourceBook: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("due_date"),
      v.literal("reservation"),
      v.literal("event"),
      v.literal("challenge"),
      v.literal("forum")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isRead", ["isRead"]),
});