import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useRouter } from 'expo-router';

export default function KepalaDashboard() {
  const stats = useQuery(api.dashboard.getKepalaDashboardStats);
  const notifData = useQuery(api.dashboard.getKepalaNotifications); // Ambil data notifikasi
  const router = useRouter(); 

  if (stats === undefined || notifData === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Menyiapkan Dashboard...</Text>
      </View>
    );
  }

  // Fallback nama jika di database tidak ada field userName
  const namaUser = stats.userName || 'Bapak/Ibu';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* BAGIAN ATAS (BIRU) */}
        <View style={styles.blueHeaderSection}>
          
          {/* Top Bar: Sapaan & Notifikasi */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Halo, {namaUser}! 👋</Text>
              <Text style={styles.dateText}>Overview Perpustakaan</Text>
            </View>
            
            {/* Tombol Notifikasi Dinamis */}
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => router.push('/kepala/notifikasi')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {/* Titik merah HANYA muncul jika ada notifikasi belum dibaca */}
              {notifData.hasUnread && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>

          {/* MAIN STATS */}
          <View style={styles.mainStatContainer}>
            <Text style={styles.mainStatLabel}>Total Koleksi Buku</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 }}>
              <Text style={styles.mainStatValue}>{stats.totalBooks}</Text>
              <Text style={styles.mainStatSuffix}> Buku</Text>
            </View>
          </View>

          {/* SUB STATS ROW */}
          <View style={styles.glassStatsRow}>
            <View style={styles.glassStatItem}>
              <View style={[styles.glassIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.glassStatValue}>{stats.totalBorrowings}</Text>
                <Text style={styles.glassStatLabel}>Dipinjam</Text>
              </View>
            </View>

            <View style={styles.glassDivider} />

            <View style={styles.glassStatItem}>
              <View style={[styles.glassIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.glassStatValue}>{stats.forumActivity}</Text>
                <Text style={styles.glassStatLabel}>Diskusi</Text>
              </View>
            </View>
          </View>

        </View>

        {/* BAGIAN BAWAH (PUTIH) */}
        <View style={styles.whiteBodySection}>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Insight Buku</Text>
            {/* Arahkan tombol Detail ke halaman koleksi-buku */}
            <TouchableOpacity onPress={() => router.push('/kepala/koleksi-buku')}>
              <Text style={styles.seeAllText}>Detail</Text>
            </TouchableOpacity>
          </View>

          {/* LIST MENYATU */}
          <View style={styles.seamlessListContainer}>
            
            {/* Populer */}
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="flame" size={22} color="#FB8C00" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightTitle} numberOfLines={1}>{stats.mostPopularBook?.title || 'Belum ada data'}</Text>
                <Text style={styles.insightSub}>Paling Populer</Text>
              </View>
              <Text style={[styles.statusText, { color: '#FB8C00' }]}>HOT</Text>
            </View>
            <View style={styles.rowDivider} />

            {/* Jarang Dipinjam */}
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="trending-down" size={22} color="#E53935" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightTitle} numberOfLines={1}>{stats.leastBorrowedBook?.title || 'Belum ada data'}</Text>
                <Text style={styles.insightSub}>Jarang Dipinjam</Text>
              </View>
              <Text style={[styles.statusText, { color: '#E53935' }]}>LOW</Text>
            </View>
            <View style={styles.rowDivider} />

            {/* Paling Dicari */}
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="search" size={22} color="#4CAF50" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightTitle} numberOfLines={1}>{stats.mostSearchedBook?.title || 'Belum ada data'}</Text>
                <Text style={styles.insightSub}>Sering Dicari</Text>
              </View>
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>HIGH</Text>
            </View>

          </View>

          <View style={{ height: 60 }} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { marginTop: 12, color: '#2F80ED', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  blueHeaderSection: { backgroundColor: '#2F80ED', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 70 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  greetingText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  dateText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  
  // Titik merah notifikasi
  notificationDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252' },

  mainStatContainer: { marginBottom: 30 },
  mainStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  mainStatValue: { color: '#FFFFFF', fontSize: 48, fontWeight: '900', letterSpacing: -1, lineHeight: 52 },
  mainStatSuffix: { color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: '600', marginBottom: 6 },

  glassStatsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 16, alignItems: 'center' },
  glassStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  glassIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  glassStatValue: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  glassStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  glassDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  whiteBodySection: { backgroundColor: '#F5F7FA', marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, flex: 1, paddingHorizontal: 24, paddingTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#333333' },
  seeAllText: { fontSize: 14, fontWeight: '700', color: '#2F80ED', marginBottom: 2 },

  seamlessListContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  insightRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  insightIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  insightTextWrap: { flex: 1, paddingRight: 10 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: '#333333', marginBottom: 3 },
  insightSub: { fontSize: 12, color: '#757575', fontWeight: '500' },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  rowDivider: { height: 1, backgroundColor: '#F0F2F5', marginLeft: 62 }, 
});