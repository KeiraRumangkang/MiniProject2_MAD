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

  profileCard: {
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