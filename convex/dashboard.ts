import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * --- QUERIES SECTION ---
 * Mengambil data dari database
 */

export const getKepalaDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const borrowings = await ctx.db.query("borrowings").collect();
    const forumPosts = await ctx.db.query("forumPosts").collect();
    const forumComments = await ctx.db.query("forumComments").collect();
    const users = await ctx.db.query("users").collect();

    const totalBooks = books.length;
    const totalBorrowings = borrowings.filter(b => b.status === "borrowed" || b.status === "late").length;
    const forumActivity = forumPosts.length + forumComments.length;
    const totalMahasiswa = users.filter((u) => u.role === "mahasiswa").length;

    const kepalaUser = users.find((u) => u.role === "kepala");

    const mostPopularBook = books.length > 0
      ? books.reduce((prev, current) => current.totalBorrowed > prev.totalBorrowed ? current : prev)
      : null;

    const leastBorrowedBook = books.length > 0
      ? books.reduce((prev, current) => current.totalBorrowed < prev.totalBorrowed ? current : prev)
      : null;

    const mostSearchedBook = books.length > 0
      ? books.reduce((prev, current) => current.totalSearch > prev.totalSearch ? current : prev)
      : null;

    return {
      totalBooks,
      totalBorrowings,
      totalMahasiswa,
      forumActivity,
      mostPopularBook,
      leastBorrowedBook,
      mostSearchedBook,
      userName: kepalaUser?.name || "Bapak/Ibu",
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

    const popularBooks = [...books].sort((a, b) => b.totalBorrowed - a.totalBorrowed).slice(0, 5);
    const topRatedBooks = [...books].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);
    const newBooks = [...books].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    const leaderboard = users.filter((u) => u.role === "mahasiswa").sort((a, b) => b.points - a.points).slice(0, 5);

    return { popularBooks, topRatedBooks, newBooks, events, leaderboard };
  },
});

export const getKepalaLaporanStats = query({
  args: {},
  handler: async (ctx) => {
    const borrowings = await ctx.db.query("borrowings").collect();
    const users = await ctx.db.query("users").collect();
    const books = await ctx.db.query("books").collect();

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const thisMonthStart = now - thirtyDays;
    const lastMonthStart = thisMonthStart - thirtyDays;

    const thisMonthBorrowings = borrowings.filter((b) => b.borrowDate >= thisMonthStart).length;
    const lastMonthBorrowings = borrowings.filter((b) => b.borrowDate >= lastMonthStart && b.borrowDate < thisMonthStart).length;
    
    let percentChange = 0;
    if (lastMonthBorrowings > 0) {
      percentChange = Math.round(((thisMonthBorrowings - lastMonthBorrowings) / lastMonthBorrowings) * 100);
    } else if (thisMonthBorrowings > 0) {
      percentChange = 100;
    }

    const currentlyBorrowed = borrowings.filter((b) => b.status === "borrowed").length;

    const lateBorrowingsRaw = borrowings.filter(
      (b) => b.status === "late" || (b.status === "borrowed" && b.dueDate < now)
    );

    const lateBorrowings = lateBorrowingsRaw.map((b) => {
      const user = users.find((u) => u._id === b.userId);
      const book = books.find((bk) => bk._id === b.bookId);
      const diffTime = Math.abs(now - b.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      return {
        _id: b._id,
        userName: user?.name || "User Tidak Diketahui",
        bookTitle: book?.title || "Buku Tidak Diketahui",
        daysLate: diffDays,
      };
    });

    lateBorrowings.sort((a, b) => b.daysLate - a.daysLate);

    return { thisMonthBorrowings, lastMonthBorrowings, percentChange, currentlyBorrowed, lateBorrowings };
  },
});

export const getKepalaAnalisisStats = query({
  args: {},
  handler: async (ctx) => {
    const searchLogs = await ctx.db.query("searchLogs").collect();
    const books = await ctx.db.query("books").collect();
    const categories = await ctx.db.query("bookCategories").collect();
    const borrowings = await ctx.db.query("borrowings").collect();

    const searchCounts: Record<string, number> = {};
    searchLogs.forEach(log => {
      const kw = log.keyword.toLowerCase();
      searchCounts[kw] = (searchCounts[kw] || 0) + 1;
    });
    const topSearches = Object.entries(searchCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const categoryCounts: Record<string, number> = {};
    borrowings.forEach(b => {
      const book = books.find(bk => bk._id === b.bookId);
      if (book) {
        categoryCounts[book.categoryId] = (categoryCounts[book.categoryId] || 0) + 1;
      }
    });
    const popularCategories = Object.entries(categoryCounts)
      .map(([catId, count]) => {
        const cat = categories.find(c => c._id === catId);
        return { categoryName: cat?.name || "Lainnya", count };
      })
      .sort((a, b) => b.count - a.count);

    const topRatedBooks = [...books]
      .filter(b => b.averageRating > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4)
      .map(b => ({ title: b.title, rating: b.averageRating, borrowed: b.totalBorrowed }));

    return { topSearches, popularCategories, topRatedBooks };
  },
});

export const getAllBooks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("books").order("desc").collect();
  },
});

export const getKepalaNotifications = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const borrowings = await ctx.db.query("borrowings").collect();
    const users = await ctx.db.query("users").collect();

    const notifications: any[] = [];
    const now = Date.now();

    books.filter((b: any) => b.stock === 0).forEach(b => {
      notifications.push({
        _id: `stock_${b._id}`,
        type: 'warning',
        title: 'Stok Buku Habis',
        message: `Buku "${b.title}" habis.`,
        time: b._creationTime, 
      });
    });

    borrowings.filter(b => b.status === "late" || (b.status === "borrowed" && b.dueDate < now)).forEach(b => {
      const user = users.find(u => u._id === b.userId);
      const book = books.find(bk => bk._id === b.bookId);
      notifications.push({
        _id: `late_${b._id}`,
        type: 'error',
        title: 'Buku Terlambat',
        message: `${user?.name || 'Mahasiswa'} terlambat mengembalikan "${book?.title || 'Buku'}".`,
        time: b.dueDate,
      });
    });

    notifications.sort((a, b) => b.time - a.time);
    return { items: notifications, count: notifications.length };
  },
});

export const getCurrentKepalaProfile = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.find(u => u.role === "kepala") || null;
  }
});

export const getAllStaff = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.role === "staff");
  },
});
// Tambahkan di bagian QUERIES di convex/dashboard.ts

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();
  },
});
/**
 * --- MUTATIONS SECTION ---
 */

export const updateProfile = mutation({
  args: { 
    userId: v.id("users"), 
    name: v.string(), 
    bio: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    const { userId, name, bio } = args;
    await ctx.db.patch(userId, { name, bio });
    return { success: true };
  },
});

export const updatePassword = mutation({
  args: { 
    userId: v.id("users"), 
    newPassword: v.string() 
  },
  handler: async (ctx, args) => {
    const { userId, newPassword } = args;
    await ctx.db.patch(userId, { password: newPassword });
    return { success: true };
  },
});

export const addStaff = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    password: v.string(),
    faculty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, username, password, faculty } = args;
    
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), username))
      .first();
      
    if (existing) throw new Error("Username sudah terdaftar");

    // Perbaikan: Menambahkan createdAt agar sesuai dengan skema database
    const staffId = await ctx.db.insert("users", {
      name,
      username,
      password,
      role: "staff",
      faculty: faculty || "Perpustakaan Utama",
      isActive: true,
      points: 0,
      bio: "Staff Perpustakaan",
      profileImage: "",
      createdAt: Date.now(), 
    });

    return staffId;
  },
});