import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';
import { useAuthSession } from '@/lib/auth-session';

export default function ProfilKepala() {
  const router = useRouter();
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const { signOutAll } = useAuthSession();
  
  // Ambil data asli dari database Convex
  const userProfile = useQuery(api.dashboard.getCurrentKepalaProfile);

  if (userProfile === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  const namaUser = userProfile?.name || "Kepala Perpustakaan";
  const joinYear = userProfile 
    ? new Date(userProfile._creationTime).getFullYear() 
    : new Date().getFullYear();

  // Avatar dinamis berdasarkan nama dari database
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(namaUser)}&background=2F80ED&color=fff&size=200`;

  // --- HANDLERS ---
  const handleLogout = async () => {
    await signOutAll();
    router.replace('/login');
  };

  const handleEditProfile = () => {
    // Kita arahkan ke halaman edit profil yang akan kita buat
    router.push('/kepala/edit-profil');
  };

  const handleSecurity = () => {
    // Kita arahkan ke halaman ganti password yang akan kita buat
    router.push('/kepala/keamanan');
  };

  const handleStaffManagement = () => {
    router.push('/kepala/manajemen-staff');
  };

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
        
        {/* HEADER BACKGROUND */}
        <View style={styles.headerBackground}>
          <Text style={styles.headerText}>Profil Saya</Text>
        </View>

        {/* PROFILE INFO CARD */}
        <View style={styles.profileCard}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.userName}>{namaUser}</Text>
          <Text style={styles.userRole}>Kepala Perpustakaan</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Aktif</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{joinYear}</Text>
              <Text style={styles.statLabel}>Bergabung</Text>
            </View>
          </View>
        </View>

        {/* MENU OPTIONS - DISESUAIKAN DENGAN DATABASE */}
        <View style={styles.menuSection}>
          
          {/* SECTION 1: ADMINISTRASI */}
          <Text style={styles.sectionTitle}>Administrasi</Text>
          <View style={styles.menuCard}>
            {renderMenuItem("people-outline", "Manajemen Staff", "#2F80ED", handleStaffManagement)}
          </View>

          {/* SECTION 2: PENGATURAN AKUN (BERHUBUNGAN DENGAN DATABASE) */}
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>
          <View style={styles.menuCard}>
            {renderMenuItem("person-outline", "Edit Profil", "#2F80ED", handleEditProfile)}
            <View style={styles.divider} />
            {renderMenuItem("lock-closed-outline", "Keamanan & Kata Sandi", "#4CAF50", handleSecurity)}
            <View style={styles.divider} />
            {renderMenuItem("notifications-outline", "Notifikasi App", "#FF9800", undefined, 
              <Switch 
                value={isNotifEnabled} 
                onValueChange={setIsNotifEnabled}
                trackColor={{ false: "#D1D1D1", true: "#2F80ED" }}
              />
            )}
          </View>

          {/* LOGOUT BUTTON */}
          <View style={[styles.menuCard, { marginTop: 10, marginBottom: 40 }]}>
            {renderMenuItem("log-out-outline", "Keluar Akun", "#FF3B30", handleLogout)}
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
    height: 160,
    paddingHorizontal: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#FFFFFF', marginBottom: 12, backgroundColor: '#EAF3FF' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  userRole: { fontSize: 14, color: '#757575', fontWeight: '500', marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', borderTopWidth: 1, borderTopColor: '#F0F2F5', paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333333' },
  statLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: '#F0F2F5' },
  menuSection: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9E9E9E', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 8, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  menuIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#424242' },
  divider: { height: 1, backgroundColor: '#F0F2F5', marginLeft: 66, marginRight: 16 },
});