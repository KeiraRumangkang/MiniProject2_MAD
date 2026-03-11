/**
 * ========================================
 * HALAMAN PROFIL MAHASISWA
 * ========================================
 * Nampilin data profil mahasiswa yang lagi login.
 * 
 * Fitur utama:
 * - Info profil (nama, fakultas, poin)
 * - Badges yang udah diraih (dinamis dari database)
 * - Statistik aktivitas (total peminjaman, review, poin)
 * 
 * Data flow:
 * - Ambil userId dari getMahasiswaList (sementara user pertama)
 * - Query ke getMahasiswaProfile buat dapetin stats + badges
 * - Semua data REAL dari database, bukan hardcoded
 * 
 * TODO: nanti ganti userId pake auth session yang benar
 * ========================================
 */

import { useQuery } from "convex/react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";

export default function Profile() {

  // sementara pakai user pertama dari database, nanti ganti pake auth session
  const users = useQuery(api.users.getMahasiswaList);
  const userId = users?.[0]?._id;

  // ambil data profil + statistik dari backend (bukan hardcoded!)
  const profileData = useQuery(
    api.users.getMahasiswaProfile,
    userId ? { userId } : "skip"
  );

  // loading state
  if (!profileData) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // destructure data profil
  const { user, totalBorrowed, totalReviews, badges } = profileData;

  return (
    <ScrollView style={styles.container}>

      {/* PROFILE CARD - info utama user */}
      <View style={styles.profileCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.faculty}>{user.faculty}</Text>
        <Text style={styles.points}>⭐ {user.points} Points</Text>

      </View>

      {/* 
        BADGES - diambil dari tabel userBadges + badges di database
        Kalo belum punya badge, tampilin pesan motivasi 
      */}
      <Text style={styles.sectionTitle}>🎖️ Badges</Text>

      <View style={styles.badgeContainer}>
        {badges.length > 0 ? (
          badges.map((badge) => (
            <View key={badge._id} style={styles.badge}>
              <Text style={styles.badgeIcon}>{badge.icon || "🏅"}</Text>
              <Text style={styles.badgeText}>{badge.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noBadge}>Belum punya badge nih, ayo pinjam buku!</Text>
        )}
      </View>

      {/* 
        STATISTIK AKTIVITAS - data real dari database
        Sebelumnya hardcoded "12" dan "5", sekarang ngambil dari query 
      */}
      <Text style={styles.sectionTitle}>📊 Aktivitas</Text>

      <View style={styles.statsCard}>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalBorrowed}</Text>
          <Text style={styles.statLabel}>Buku Dipinjam</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalReviews}</Text>
          <Text style={styles.statLabel}>Review</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user.points}</Text>
          <Text style={styles.statLabel}>Poin</Text>
        </View>

      </View>

    </ScrollView>
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

  // card profil utama (centered, shadow buat depth)
  profileCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarText: {
    fontSize: 35,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  faculty: {
    color: "#666",
    marginTop: 4,
  },

  points: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#2F80ED",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  // container badge pake flexWrap biar otomatis pindah baris
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
  },

  badge: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  badgeIcon: {
    fontSize: 24,
  },

  badgeText: {
    fontSize: 11,
    marginTop: 5,
  },

  noBadge: {
    color: "#999",
    fontSize: 14,
  },

  // card statistik (3 kolom sejajar)
  statsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 30,
  },

  stat: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#555",
  },

});