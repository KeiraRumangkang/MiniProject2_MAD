import { query } from "./_generated/server";

export const getKepalaDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const borrowings = await ctx.db.query("borrowings").collect();
    const forumPosts = await ctx.db.query("forumPosts").collect();
    const forumComments = await ctx.db.query("forumComments").collect();
    const searchLogs = await ctx.db.query("searchLogs").collect();
    const users = await ctx.db.query("users").collect();

    const totalBooks = books.length;
    const totalBorrowings = borrowings.length;
    const forumActivity = forumPosts.length + forumComments.length;
    const totalMahasiswa = users.filter((u) => u.role === "mahasiswa").length;

    const mostPopularBook =
      books.length > 0
        ? books.reduce((prev, current) =>
            current.totalBorrowed > prev.totalBorrowed ? current : prev
          )
        : null;

    const leastBorrowedBook =
      books.length > 0
        ? books.reduce((prev, current) =>
            current.totalBorrowed < prev.totalBorrowed ? current : prev
          )
        : null;

    const mostSearchedBook =
      books.length > 0
        ? books.reduce((prev, current) =>
            current.totalSearch > prev.totalSearch ? current : prev
          )
        : null;

    return {
      totalBooks,
      totalBorrowings,
      totalMahasiswa,
      forumActivity,
      mostPopularBook,
      leastBorrowedBook,
      mostSearchedBook,
    };
  },
});

export const getStaffDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const borrowings = await ctx.db.query("borrowings").collect();

    const borrowedBooks = borrowings.filter((b) => b.status === "borrowed").length;
    const lateBooks = borrowings.filter((b) => b.status === "late").length;

    return {
      totalBooks: books.length,
      borrowedBooks,
      lateBooks,
      todayActivity: borrowings.length,
    };
  },
});

export const getMahasiswaHomeStats = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const events = await ctx.db.query("events").collect();
    const users = await ctx.db.query("users").collect();

    const popularBooks = [...books]
      .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
      .slice(0, 5);

    const topRatedBooks = [...books]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    const newBooks = [...books]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    const leaderboard = users
      .filter((u) => u.role === "mahasiswa")
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    return {
      popularBooks,
      topRatedBooks,
      newBooks,
      events,
      leaderboard,
    };
  },
});