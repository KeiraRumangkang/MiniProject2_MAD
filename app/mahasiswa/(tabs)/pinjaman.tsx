/**
 * ========================================
 * HALAMAN PEMINJAMAN MAHASISWA
 * ========================================
 * Halaman ini nampilin semua data peminjaman buku milik mahasiswa.
 * 
 * Fitur utama:
 * - Tab "Sedang Dipinjam" = buku yang lagi dipinjam/menunggu/terlambat
 * - Tab "Riwayat" = buku yang udah dikembalikan/ditolak
 * - Status badge berwarna biar gampang dibedain
 * 
 * Data flow:
 * - Ambil userId dari getMahasiswaList (sementara user pertama)
 * - Query ke getBorrowingByUserEnriched buat dapetin peminjaman + info buku
 * - Data udah di-enrich di backend (judul buku, author, status efektif)
 * 
 * TODO: ganti userId pake auth session yang beneran
 * ========================================
 */

import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthSession } from "@/lib/auth-session";

// tipe buat tab switcher
type Tab = "active" | "history";

export default function Pinjaman() {

  // state tab yang lagi aktif
  const [tab, setTab] = useState<Tab>("active");

  const { activeSession } = useAuthSession();
  const userId = activeSession?.role === "mahasiswa" ? (activeSession.userId as any) : undefined;

  // ambil data peminjaman yang udah di-enrich sama judul buku
  // pake "skip" kalo userId belum ready (conditional query)
  const borrowings = useQuery(
    api.borrowings.getBorrowingByUserEnriched,
    userId ? { userId } : "skip"
  );

  // loading state
  if (!borrowings) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  /**
   * Filter data berdasarkan tab yang aktif:
   * - "active" = yang masih ongoing (dipinjam, menunggu verifikasi, terlambat)
   * - "history" = yang udah selesai (dikembalikan atau ditolak)
   */
  const filtered = borrowings.filter((b) => {
    if (tab === "active") {
      return b.effectiveStatus === "borrowed" || b.effectiveStatus === "late" || b.effectiveStatus === "requested";
    }
    return b.effectiveStatus === "returned" || b.effectiveStatus === "rejected";
  });

  /** Format tanggal ke format Indonesia yang readable */
  const formatTanggal = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /** Mapping status ke warna biar gampang dibedain secara visual */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "borrowed": return "#3B82F6";   // biru = lagi dipinjam
      case "requested": return "#F59E0B";  // kuning = nunggu verifikasi
      case "late": return "#EF4444";       // merah = terlambat
      case "returned": return "#10B981";   // hijau = udah beres
      case "rejected": return "#9E9E9E";   // abu = ditolak
      default: return "#666";
    }
  };

  /** Label status dalam bahasa Indonesia */
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "borrowed": return "Dipinjam";
      case "requested": return "Menunggu";
      case "late": return "Terlambat";
      case "returned": return "Dikembalikan";
      case "rejected": return "Ditolak";
      default: return status;
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Peminjaman Saya</Text>

      {/* 
        Tab switcher = 2 tombol (Sedang Dipinjam / Riwayat)
        Pake background abu + tombol putih buat yang aktif 
      */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "active" && styles.tabActive]}
          onPress={() => setTab("active")}
        >
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
            Sedang Dipinjam
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === "history" && styles.tabActive]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      {/* list peminjaman */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* baris atas: judul buku + badge status */}
            <View style={styles.cardHeader}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {item.bookTitle}
              </Text>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.effectiveStatus) + "20" }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(item.effectiveStatus) }]}>
                  {getStatusLabel(item.effectiveStatus)}
                </Text>
              </View>
            </View>

            {/* nama penulis buku */}
            <Text style={styles.bookAuthor}>{item.bookAuthor}</Text>

            {/* tanggal pinjam dan batas pengembalian */}
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>
                Pinjam: {formatTanggal(item.borrowDate)}
              </Text>
              <Text style={styles.dateLabel}>
                Batas: {formatTanggal(item.dueDate)}
              </Text>
            </View>

            {/* tampilin tanggal kembali kalo udah dikembaliin */}
            {item.returnDate && (
              <Text style={styles.returnDate}>
                Dikembalikan: {formatTanggal(item.returnDate)}
              </Text>
            )}

          </View>
        )}
        // tampilan kalo list kosong
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {tab === "active"
                ? "Belum ada peminjaman aktif nih"
                : "Belum ada riwayat peminjaman"}
            </Text>
          </View>
        }
      />

    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  // tab switcher row = background abu, tombol aktif putih
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 15,
    padding: 3,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },

  tabActive: {
    backgroundColor: "white",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },

  tabTextActive: {
    color: "#2F80ED",
  },

  // card peminjaman
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },

  // badge status pake warna transparan (opacity 20%)
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  bookAuthor: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dateLabel: {
    fontSize: 12,
    color: "#999",
  },

  returnDate: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 6,
    fontWeight: "500",
  },

  empty: {
    alignItems: "center",
    padding: 40,
  },

  emptyText: {
    color: "#999",
    fontSize: 14,
  },

});
