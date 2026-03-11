/**
 * ========================================
 * HALAMAN LEADERBOARD PEMBACA AKTIF
 * ========================================
 * Nampilin ranking mahasiswa berdasarkan poin yang dikumpulkan.
 * 
 * Fitur utama:
 * - Ranking dari yang poinnya paling tinggi
 * - Medali emoji buat top 3 
 * - Border kuning buat 3 besar biar keliatan spesial
 * 
 * Data flow:
 * - Ambil data leaderboard dari getMahasiswaHomeStats
 * - Data udah di-sort berdasarkan poin di backend
 * - Tampilin top 5 pembaca paling aktif
 * ========================================
 */

import { FlatList, StyleSheet, Text, View } from "react-native";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Leaderboard() {

  // ambil data home stats (includes leaderboard)
  const data = useQuery(api.dashboard.getMahasiswaHomeStats);

  // loading state
  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // leaderboard udah di-sort dari backend berdasarkan poin tertinggi
  const { leaderboard } = data;

  /** Emoji medali buat 3 besar, sisanya pake nomor biasa */
  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Pembaca paling aktif di perpustakaan</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          /* card ranking, 3 besar dapet style khusus (border kuning) */
          <View style={[styles.card, index < 3 && styles.topCard]}>

            {/* posisi ranking / medali */}
            <Text style={styles.rank}>{getMedal(index)}</Text>

            {/* info mahasiswa */}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.faculty}>{item.faculty || "Mahasiswa"}</Text>
            </View>

            {/* total poin */}
            <View style={styles.pointContainer}>
              <Text style={styles.points}>{item.points}</Text>
              <Text style={styles.pointLabel}>pts</Text>
            </View>

          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Belum ada data pembaca aktif
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
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 15,
  },

  // card ranking tiap mahasiswa
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  // border kuning khusus buat 3 besar biar keliatan spesial
  topCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },

  rank: {
    fontSize: 20,
    width: 40,
    textAlign: "center",
  },

  info: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  faculty: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },

  pointContainer: {
    alignItems: "center",
  },

  points: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F80ED",
  },

  pointLabel: {
    fontSize: 11,
    color: "#999",
  },

  empty: {
    padding: 40,
    alignItems: "center",
  },

  emptyText: {
    color: "#999",
    fontSize: 14,
  },

});
