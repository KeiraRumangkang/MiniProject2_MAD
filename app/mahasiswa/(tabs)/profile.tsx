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
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);

  // --- DATA USER (Bisa diganti dengan useQuery) ---
  const user = {
    name: "Keira Rumangkang",
    role: "Mahasiswa",
    email: "keira@example.com",
    totalBorrowed: 3,
    activeBorrowed: 2,
    joinDate: new Date(2022, 8, 1) // contoh tanggal bergabung
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => router.replace("/login") }
    ]);
  };

  // Avatar dinamis
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2F80ED&color=fff&size=200`;

  // --- REUSABLE MENU ITEM ---
  const renderMenuItem = (
    icon: keyof typeof Ionicons.glyphMap, 
    title: string, 
    color: string = "#424242", 
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      disabled={!!rightElement && !onPress}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuTitle, color === "#FF3B30" && { color: "#FF3B30" }]}>{title}</Text>
      {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>

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
        {/* HEADER */}
        <View style={styles.headerBackground}>
          <Text style={styles.headerText}>Profil Saya</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.totalBorrowed}</Text>
              <Text style={styles.statLabel}>Total Dipinjam</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.activeBorrowed}</Text>
              <Text style={styles.statLabel}>Buku Aktif</Text>
            </View>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menuSection}>

          {/* Informasi Akun */}
          <Text style={styles.sectionTitle}>Informasi Akun</Text>
          <View style={styles.menuCard}>
            {renderMenuItem("person-outline", "Nama", "#2F80ED", undefined, <Text style={styles.value}>{user.name}</Text>)}
            <View style={styles.divider} />
            {renderMenuItem("school-outline", "Role", "#10B981", undefined, <Text style={styles.value}>{user.role}</Text>)}
            <View style={styles.divider} />
            {renderMenuItem("mail-outline", "Email", "#F59E0B", undefined, <Text style={styles.value}>{user.email}</Text>)}
          </View>

          {/* Pengaturan Notifikasi */}
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          <View style={styles.menuCard}>
            {renderMenuItem("notifications-outline", "Notifikasi App", "#FF9800", undefined, 
              <Switch 
                value={isNotifEnabled} 
                onValueChange={setIsNotifEnabled}
                trackColor={{ false: "#D1D1D1", true: "#2F80ED" }}
              />
            )}
          </View>

          {/* Logout */}
          <View style={[styles.menuCard, { marginBottom: 40 }]}>
            {renderMenuItem("log-out-outline", "Logout", "#FF3B30", handleLogout)}
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  headerBackground: {
    backgroundColor: '#2F80ED',
    height: 140,
    paddingHorizontal: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },

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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 30,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#FFFFFF', marginBottom: 12, backgroundColor: '#EAF3FF' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  userRole: { fontSize: 14, color: '#757575', fontWeight: '500', marginBottom: 16 },

  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', borderTopWidth: 1, borderTopColor: '#F0F2F5', paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333333' },
  statLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: '#F0F2F5' },

  menuSection: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9E9E9E', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },

  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 8, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  menuIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#424242' },
  divider: { height: 1, backgroundColor: '#F0F2F5', marginLeft: 66, marginRight: 16 },
  value: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' }
});