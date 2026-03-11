import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const { width } = Dimensions.get('window');

export default function StaffDashboard() {
  const stats = useQuery(api.dashboard.getStaffDashboardStats);

  if (stats === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Menyiapkan Dashboard...</Text>
      </View>
    );
  }

  const statCards = [
    {
      label: 'Total Buku',
      value: stats.totalBooks,
      icon: 'library' as const,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      label: 'Sedang Dipinjam',
      value: stats.borrowedBooks,
      icon: 'book' as const,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      label: 'Terlambat',
      value: stats.lateBooks,
      icon: 'warning' as const,
      color: '#EF4444',
      bgColor: '#FEF2F2',
    },
    {
      label: 'Total Aktivitas',
      value: stats.todayActivity,
      icon: 'pulse' as const,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* GREEN HEADER */}
        <View style={styles.headerSection}>
          <Text style={styles.greetingText}>Staff Dashboard 👋</Text>
          <Text style={styles.subtitleText}>Kelola operasional perpustakaan</Text>
        </View>

        {/* STAT CARDS */}
        <View style={styles.bodySection}>
          <View style={styles.cardsGrid}>
            {statCards.map((card, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.iconContainer, { backgroundColor: card.bgColor }]}>
                  <Ionicons name={card.icon} size={24} color={card.color} />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

          {/* QUICK INFO */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={22} color="#10B981" />
              <Text style={styles.infoTitle}>Panduan Cepat</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Tab <Text style={styles.bold}>Buku</Text> — Tambah, edit, atau hapus koleksi buku</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Tab <Text style={styles.bold}>Pinjaman</Text> — Verifikasi peminjaman dan pengembalian</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Tab <Text style={styles.bold}>Forum</Text> — Moderasi diskusi mahasiswa</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Tab <Text style={styles.bold}>Pengguna</Text> — Kelola akun mahasiswa</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { marginTop: 12, color: '#10B981', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  headerSection: {
    backgroundColor: '#10B981',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 70,
  },
  greetingText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitleText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },

  bodySection: {
    backgroundColor: '#F5F7FA',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statValue: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#757575', fontWeight: '500' },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginLeft: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginTop: 7, marginRight: 12 },
  infoText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  bold: { fontWeight: '700', color: '#333' },
});
