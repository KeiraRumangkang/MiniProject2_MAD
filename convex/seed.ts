import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      return { message: "Database sudah terisi." };
    }

    // Categories
    const catPemrograman = await ctx.db.insert("bookCategories", {
      name: "Pemrograman",
      description: "Buku tentang coding dan software development",
      createdAt: now,
    });

    const catJaringan = await ctx.db.insert("bookCategories", {
      name: "Jaringan Komputer",
      description: "Buku tentang jaringan, internet, dan keamanan",
      createdAt: now,
    });

    const catBasisData = await ctx.db.insert("bookCategories", {
      name: "Basis Data",
      description: "Buku tentang database dan data management",
      createdAt: now,
    });

    const catAI = await ctx.db.insert("bookCategories", {
      name: "Kecerdasan Buatan",
      description: "Buku tentang AI, machine learning, dan data science",
      createdAt: now,
    });

    const catSkripsi = await ctx.db.insert("bookCategories", {
      name: "Referensi Skripsi TI",
      description: "Buku pendukung penelitian mahasiswa informatika",
      createdAt: now,
    });

    // Users
    const mahasiswa1 = await ctx.db.insert("users", {
      name: "Alya Putri",
      username: "alya",
      password: "123456",
      role: "mahasiswa",
      faculty: "Informatika",
      profileImage: "",
      bio: "Mahasiswa informatika yang suka UI/UX",
      points: 120,
      isActive: true,
      createdAt: now,
    });

    const mahasiswa2 = await ctx.db.insert("users", {
      name: "Raka Pratama",
      username: "raka",
      password: "123456",
      role: "mahasiswa",
      faculty: "Informatika",
      profileImage: "",
      bio: "Suka backend dan database",
      points: 180,
      isActive: true,
      createdAt: now,
    });

    const mahasiswa3 = await ctx.db.insert("users", {
      name: "Nadya Salsabila",
      username: "nadya",
      password: "123456",
      role: "mahasiswa",
      faculty: "Sistem Informasi",
      profileImage: "",
      bio: "Tertarik AI dan data science",
      points: 95,
      isActive: true,
      createdAt: now,
    });

    const staff1 = await ctx.db.insert("users", {
      name: "Budi Santoso",
      username: "budi_staff",
      password: "123456",
      role: "staff",
      faculty: "Perpustakaan",
      profileImage: "",
      bio: "Staff perpustakaan",
      points: 0,
      isActive: true,
      createdAt: now,
    });

    const kepala1 = await ctx.db.insert("users", {
      name: "Dr. Rina Kurnia",
      username: "kepala_lib",
      password: "123456",
      role: "kepala",
      faculty: "Perpustakaan",
      profileImage: "",
      bio: "Kepala perpustakaan kampus",
      points: 0,
      isActive: true,
      createdAt: now,
    });

    // Books
    const book1 = await ctx.db.insert("books", {
      title: "Clean Code",
      author: "Robert C. Martin",
      synopsis: "Panduan menulis kode yang rapi, mudah dibaca, dan mudah dirawat.",
      categoryId: catPemrograman,
      year: 2008,
      coverImage: "",
      stockTotal: 5,
      stockAvailable: 3,
      locationCode: "A1-01",
      isbn: "9780132350884",
      language: "English",
      pages: 464,
      status: "available",
      totalBorrowed: 14,
      totalFavorite: 8,
      totalSearch: 20,
      averageRating: 4.8,
      createdAt: now,
    });

    const book2 = await ctx.db.insert("books", {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      synopsis: "Buku algoritma lengkap untuk mahasiswa informatika.",
      categoryId: catPemrograman,
      year: 2009,
      coverImage: "",
      stockTotal: 4,
      stockAvailable: 2,
      locationCode: "A1-02",
      isbn: "9780262033848",
      language: "English",
      pages: 1312,
      status: "limited",
      totalBorrowed: 18,
      totalFavorite: 7,
      totalSearch: 25,
      averageRating: 4.7,
      createdAt: now,
    });

    const book3 = await ctx.db.insert("books", {
      title: "Database System Concepts",
      author: "Abraham Silberschatz",
      synopsis: "Dasar-dasar sistem basis data dan implementasinya.",
      categoryId: catBasisData,
      year: 2019,
      coverImage: "",
      stockTotal: 6,
      stockAvailable: 5,
      locationCode: "B1-01",
      isbn: "9780078022159",
      language: "English",
      pages: 1376,
      status: "available",
      totalBorrowed: 11,
      totalFavorite: 6,
      totalSearch: 17,
      averageRating: 4.6,
      createdAt: now,
    });

    const book4 = await ctx.db.insert("books", {
      title: "Computer Networking: A Top-Down Approach",
      author: "James F. Kurose",
      synopsis: "Buku populer untuk memahami jaringan komputer dari aplikasi sampai fisik.",
      categoryId: catJaringan,
      year: 2016,
      coverImage: "",
      stockTotal: 5,
      stockAvailable: 1,
      locationCode: "C1-03",
      isbn: "9780133594140",
      language: "English",
      pages: 864,
      status: "limited",
      totalBorrowed: 16,
      totalFavorite: 5,
      totalSearch: 19,
      averageRating: 4.7,
      createdAt: now,
    });

    const book5 = await ctx.db.insert("books", {
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell",
      synopsis: "Referensi utama untuk kecerdasan buatan.",
      categoryId: catAI,
      year: 2020,
      coverImage: "",
      stockTotal: 3,
      stockAvailable: 1,
      locationCode: "D1-01",
      isbn: "9780134610993",
      language: "English",
      pages: 1152,
      status: "limited",
      totalBorrowed: 10,
      totalFavorite: 9,
      totalSearch: 23,
      averageRating: 4.9,
      createdAt: now,
    });

    const book6 = await ctx.db.insert("books", {
      title: "Deep Learning with Python",
      author: "Francois Chollet",
      synopsis: "Panduan deep learning berbasis Python untuk mahasiswa dan praktisi.",
      categoryId: catAI,
      year: 2021,
      coverImage: "",
      stockTotal: 4,
      stockAvailable: 4,
      locationCode: "D1-02",
      isbn: "9781617296864",
      language: "English",
      pages: 504,
      status: "available",
      totalBorrowed: 7,
      totalFavorite: 4,
      totalSearch: 15,
      averageRating: 4.5,
      createdAt: now,
    });

    const book7 = await ctx.db.insert("books", {
      title: "Rekayasa Perangkat Lunak",
      author: "Roger S. Pressman",
      synopsis: "Buku wajib untuk memahami software engineering.",
      categoryId: catPemrograman,
      year: 2015,
      coverImage: "",
      stockTotal: 5,
      stockAvailable: 2,
      locationCode: "A1-05",
      isbn: "9780073375977",
      language: "Indonesia",
      pages: 912,
      status: "limited",
      totalBorrowed: 13,
      totalFavorite: 6,
      totalSearch: 18,
      averageRating: 4.6,
      createdAt: now,
    });

    const book8 = await ctx.db.insert("books", {
      title: "Metodologi Penelitian Informatika",
      author: "Suyanto",
      synopsis: "Panduan penelitian dan penulisan skripsi bidang informatika.",
      categoryId: catSkripsi,
      year: 2022,
      coverImage: "",
      stockTotal: 7,
      stockAvailable: 6,
      locationCode: "E1-01",
      isbn: "9786020000001",
      language: "Indonesia",
      pages: 300,
      status: "available",
      totalBorrowed: 6,
      totalFavorite: 3,
      totalSearch: 14,
      averageRating: 4.3,
      createdAt: now,
    });

    // Favorites
    await ctx.db.insert("favorites", {
      userId: mahasiswa1,
      bookId: book1,
      createdAt: now,
    });

    await ctx.db.insert("favorites", {
      userId: mahasiswa1,
      bookId: book5,
      createdAt: now,
    });

    await ctx.db.insert("favorites", {
      userId: mahasiswa2,
      bookId: book3,
      createdAt: now,
    });

    // Reviews
    await ctx.db.insert("reviews", {
      userId: mahasiswa1,
      bookId: book1,
      rating: 5,
      reviewText: "Sangat bagus untuk belajar clean coding.",
      createdAt: now,
    });

    await ctx.db.insert("reviews", {
      userId: mahasiswa2,
      bookId: book3,
      rating: 4,
      reviewText: "Penjelasan database lengkap dan cocok untuk kuliah basis data.",
      createdAt: now,
    });

    await ctx.db.insert("reviews", {
      userId: mahasiswa3,
      bookId: book5,
      rating: 5,
      reviewText: "Referensi AI terbaik untuk pemula sampai menengah.",
      createdAt: now,
    });

    // Borrowings
    await ctx.db.insert("borrowings", {
      userId: mahasiswa1,
      bookId: book1,
      borrowDate: now - 1000 * 60 * 60 * 24 * 12,
      dueDate: now - 1000 * 60 * 60 * 24 * 5,
      returnDate: now - 1000 * 60 * 60 * 24 * 6,
      extendedCount: 0,
      fineAmount: 0,
      status: "returned",
      verifiedByStaffId: staff1,
      notes: "",
      createdAt: now,
    });

    await ctx.db.insert("borrowings", {
      userId: mahasiswa2,
      bookId: book4,
      borrowDate: now - 1000 * 60 * 60 * 24 * 4,
      dueDate: now + 1000 * 60 * 60 * 24 * 3,
      returnDate: undefined,
      extendedCount: 1,
      fineAmount: 0,
      status: "borrowed",
      verifiedByStaffId: staff1,
      notes: "Perpanjangan 1 kali",
      createdAt: now,
    });

    await ctx.db.insert("borrowings", {
      userId: mahasiswa3,
      bookId: book5,
      borrowDate: now - 1000 * 60 * 60 * 24 * 10,
      dueDate: now - 1000 * 60 * 60 * 24 * 2,
      returnDate: undefined,
      extendedCount: 0,
      fineAmount: 10000,
      status: "late",
      verifiedByStaffId: staff1,
      notes: "Terlambat 2 hari",
      createdAt: now,
    });

    // Reservations
    await ctx.db.insert("reservations", {
      userId: mahasiswa1,
      bookId: book2,
      status: "waiting",
      queueNumber: 1,
      createdAt: now,
    });

    // Forum posts
    const post1 = await ctx.db.insert("forumPosts", {
      userId: mahasiswa1,
      category: "review_buku",
      title: "Review Clean Code untuk mahasiswa informatika",
      content: "Menurutku buku ini wajib dibaca kalau ingin coding lebih rapi.",
      relatedBookId: book1,
      imageUrl: "",
      isPinned: false,
      isDeleted: false,
      likeCount: 3,
      commentCount: 2,
      createdAt: now,
    });

    const post2 = await ctx.db.insert("forumPosts", {
      userId: mahasiswa2,
      category: "buku_skripsi",
      title: "Rekomendasi buku untuk skripsi AI dong",
      content: "Aku lagi cari referensi AI yang cocok untuk topik klasifikasi citra.",
      relatedBookId: book5,
      imageUrl: "",
      isPinned: true,
      isDeleted: false,
      likeCount: 5,
      commentCount: 1,
      createdAt: now,
    });

    // Forum comments
    const comment1 = await ctx.db.insert("forumComments", {
      postId: post1,
      userId: mahasiswa2,
      parentCommentId: undefined,
      content: "Setuju, terutama bagian naming dan function design.",
      upvoteCount: 2,
      isDeleted: false,
      createdAt: now,
    });

    await ctx.db.insert("forumComments", {
      postId: post1,
      userId: mahasiswa3,
      parentCommentId: comment1,
      content: "Aku juga pakai buku ini buat belajar refactor code.",
      upvoteCount: 1,
      isDeleted: false,
      createdAt: now,
    });

    await ctx.db.insert("forumComments", {
      postId: post2,
      userId: mahasiswa1,
      parentCommentId: undefined,
      content: "Coba baca Artificial Intelligence: A Modern Approach.",
      upvoteCount: 3,
      isDeleted: false,
      createdAt: now,
    });

    // Forum likes
    await ctx.db.insert("forumLikes", {
      postId: post1,
      userId: mahasiswa2,
      createdAt: now,
    });

    await ctx.db.insert("forumLikes", {
      postId: post1,
      userId: mahasiswa3,
      createdAt: now,
    });

    await ctx.db.insert("forumLikes", {
      postId: post2,
      userId: mahasiswa1,
      createdAt: now,
    });

    // Search logs
    await ctx.db.insert("searchLogs", {
      userId: mahasiswa1,
      keyword: "clean code",
      resultCount: 1,
      clickedBookId: book1,
      createdAt: now,
    });

    await ctx.db.insert("searchLogs", {
      userId: mahasiswa2,
      keyword: "database",
      resultCount: 1,
      clickedBookId: book3,
      createdAt: now,
    });

    await ctx.db.insert("searchLogs", {
      userId: mahasiswa3,
      keyword: "artificial intelligence",
      resultCount: 1,
      clickedBookId: book5,
      createdAt: now,
    });

    await ctx.db.insert("searchLogs", {
      userId: mahasiswa1,
      keyword: "skripsi informatika",
      resultCount: 1,
      clickedBookId: book8,
      createdAt: now,
    });

    // Events
    await ctx.db.insert("events", {
      title: "Workshop Dasar Machine Learning",
      description: "Pelatihan dasar machine learning untuk mahasiswa informatika.",
      eventDate: now + 1000 * 60 * 60 * 24 * 7,
      location: "Ruang Seminar Perpustakaan",
      createdBy: staff1,
      createdAt: now,
    });

    await ctx.db.insert("events", {
      title: "Bedah Buku Clean Code",
      description: "Diskusi buku Clean Code bersama komunitas coding kampus.",
      eventDate: now + 1000 * 60 * 60 * 24 * 14,
      location: "Aula Perpustakaan",
      createdBy: staff1,
      createdAt: now,
    });

    // Challenge
    const challenge1 = await ctx.db.insert("readingChallenges", {
      title: "Baca 3 Buku Informatika Bulan Ini",
      description: "Selesaikan membaca 3 buku bidang informatika bulan ini.",
      targetBooks: 3,
      startDate: now,
      endDate: now + 1000 * 60 * 60 * 24 * 30,
      rewardPoints: 100,
      isActive: true,
      createdAt: now,
    });

    await ctx.db.insert("challengeParticipants", {
      challengeId: challenge1,
      userId: mahasiswa1,
      progressBooks: 1,
      isCompleted: false,
      joinedAt: now,
    });

    await ctx.db.insert("challengeParticipants", {
      challengeId: challenge1,
      userId: mahasiswa2,
      progressBooks: 2,
      isCompleted: false,
      joinedAt: now,
    });

    // Badges
    const badge1 = await ctx.db.insert("badges", {
      name: "Book Explorer",
      description: "Menyelesaikan 10 buku",
      icon: "📚",
      createdAt: now,
    });

    const badge2 = await ctx.db.insert("badges", {
      name: "Active Reader",
      description: "Aktif meminjam buku setiap bulan",
      icon: "🔥",
      createdAt: now,
    });

    const badge3 = await ctx.db.insert("badges", {
      name: "Forum Contributor",
      description: "Aktif berdiskusi di forum",
      icon: "💬",
      createdAt: now,
    });

    await ctx.db.insert("userBadges", {
      userId: mahasiswa2,
      badgeId: badge1,
      earnedAt: now,
    });

    await ctx.db.insert("userBadges", {
      userId: mahasiswa1,
      badgeId: badge3,
      earnedAt: now,
    });

    await ctx.db.insert("userBadges", {
      userId: mahasiswa3,
      badgeId: badge2,
      earnedAt: now,
    });

    // Quotes
    await ctx.db.insert("quotes", {
      text: "Programs must be written for people to read.",
      sourceBook: "Clean Code",
      author: "Robert C. Martin",
      createdAt: now,
    });

    await ctx.db.insert("quotes", {
      text: "Artificial intelligence is the new electricity.",
      sourceBook: "AI related quote",
      author: "Andrew Ng",
      createdAt: now,
    });

    // Notifications
    await ctx.db.insert("notifications", {
      userId: mahasiswa3,
      title: "Peminjaman Terlambat",
      message: "Buku Artificial Intelligence: A Modern Approach sudah melewati jatuh tempo.",
      type: "due_date",
      isRead: false,
      createdAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: mahasiswa1,
      title: "Reservasi Diproses",
      message: "Reservasi buku Introduction to Algorithms sedang dalam antrean.",
      type: "reservation",
      isRead: false,
      createdAt: now,
    });

    return { message: "Seed database lengkap berhasil." };
  },
});