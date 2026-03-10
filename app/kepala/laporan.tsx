import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function LaporanKepala() {
  const stats = useQuery(api.dashboard.getKepalaLaporanStats);

  if (stats === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Menyiapkan Laporan...</Text>
      </View>
    );
  }

  const isPositiveTrend = stats.percentChange >= 0;

  // 1. Fungsi Aksi saat list keterlambatan ditekan
  const handleLatePress = (item: any) => {
    Alert.alert(
      "Tindakan Keterlambatan",
      `Mahasiswa: ${item.userName}\nBuku: ${item.bookTitle}\nStatus: Terlambat ${item.daysLate} Hari`,
      [
        {
          text: "Kirim Peringatan WA",
          onPress: () => Alert.alert("Terkirim", `Pesan peringatan otomatis telah dikirim ke WhatsApp ${item.userName}.`),
          style: "default"
        },
        {
          text: "Blokir Peminjaman",
          onPress: () => Alert.alert("Berhasil", "Mahasiswa ini sementara tidak bisa meminjam buku hingga buku dikembalikan."),
          style: "destructive"
        },
        {
          text: "Batal",
          style: "cancel"
        }
      ]
    );
  };

  // 2. Fungsi Download Laporan
  const handleDownload = () => {
    Alert.alert(
      "Unduh Laporan", 
      "Seluruh data laporan operasional sedang dikonversi ke PDF. Silakan cek folder download Anda dalam beberapa saat."
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* BAGIAN ATAS (BIRU - SEAMLESS) */}
        <View style={styles.blueHeaderSection}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Laporan & Analitik</Text>
            <TouchableOpacity style={styles.exportBtn} onPress={handleDownload}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* CARD REKAP BULANAN */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Peminjaman 30 Hari Terakhir</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValue}>{stats.thisMonthBorrowings}</Text>
              
              <View style={[styles.trendBadge, { backgroundColor: isPositiveTrend ? '#E8F5E9' : '#FFEBEE' }]}>
                <Ionicons 
                  name={isPositiveTrend ? "trending-up" : "trending-down"} 
                  size={14} 
                  color={isPositiveTrend ? "#4CAF50" : "#E53935"} 
                />
                <Text style={[styles.trendText, { color: isPositiveTrend ? "#4CAF50" : "#E53935" }]}>
                  {isPositiveTrend ? '+' : ''}{stats.percentChange}%
                </Text>
              </View>
            </View>
            <Text style={styles.summaryCompare}>vs {stats.lastMonthBorrowings} peminjaman di bulan sebelumnya</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.activeBorrowRow}>
              <View style={styles.activeIconBg}>
                <Ionicons name="book" size={16} color="#2F80ED" />
              </View>
              <Text style={styles.activeBorrowText}>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>{stats.currentlyBorrowed} Buku</Text> sedang berada di tangan peminjam saat ini.
              </Text>
            </View>
          </View>
        </View>

        {/* BAGIAN BAWAH (PUTIH - MENUMPUK) */}
        <View style={styles.whiteBodySection}>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚨 Daftar Keterlambatan</Text>
            <Text style={styles.sectionSubtitle}>{stats.lateBorrowings.length} Kasus</Text>
          </View>

          {/* LIST KETERLAMBATAN */}
          <View style={styles.listContainer}>
            {stats.lateBorrowings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
                <Text style={styles.emptyStateText}>Luar Biasa!</Text>
                <Text style={styles.emptyStateSub}>Tidak ada peminjaman yang terlambat saat ini.</Text>
              </View>
            ) : (
              stats.lateBorrowings.map((item, index) => (
                <View key={item._id}>
                  {/* Komponen yang bisa ditekan */}
                  <TouchableOpacity 
                    style={styles.lateItem} 
                    onPress={() => handleLatePress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lateIconBg}>
                      <Ionicons name="time" size={24} color="#E53935" />
                    </View>
                    <View style={styles.lateTextWrap}>
                      <Text style={styles.lateUserName} numberOfLines={1}>{item.userName}</Text>
                      <Text style={styles.lateBookTitle} numberOfLines={1}>{item.bookTitle}</Text>
                    </View>
                    <View style={styles.lateBadge}>
                      <Text style={styles.lateBadgeText}>Telat {item.daysLate} Hari</Text>
                    </View>
                  </TouchableOpacity>
                  {index < stats.lateBorrowings.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))
            )}
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

  /* BLUE HEADER SECTION */
  blueHeaderSection: {
    backgroundColor: '#2F80ED',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 70, 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  exportBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  /* SUMMARY CARD */
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  summaryTitle: { fontSize: 13, color: '#757575', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  summaryValue: { fontSize: 42, fontWeight: '900', color: '#333333', marginRight: 12, letterSpacing: -1 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  trendText: { fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  summaryCompare: { fontSize: 13, color: '#9E9E9E', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#F0F2F5', marginBottom: 16 },
  activeBorrowRow: { flexDirection: 'row', alignItems: 'center' },
  activeIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EAF3FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activeBorrowText: { flex: 1, fontSize: 13, color: '#757575', lineHeight: 20 },

  /* WHITE BODY SECTION */
  whiteBodySection: {
    backgroundColor: '#F5F7FA',
    marginTop: -30, 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#333333' },
  sectionSubtitle: { fontSize: 14, fontWeight: '600', color: '#E53935' },

  /* LIST CONTAINER */
  listContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  lateItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  lateIconBg: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  lateTextWrap: { flex: 1, paddingRight: 10 },
  lateUserName: { fontSize: 15, fontWeight: '700', color: '#333333', marginBottom: 3 },
  lateBookTitle: { fontSize: 13, color: '#757575', fontWeight: '500' },
  lateBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  lateBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#E53935' },
  rowDivider: { height: 1, backgroundColor: '#F0F2F5', marginLeft: 62 },

  /* EMPTY STATE */
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyStateText: { fontSize: 18, fontWeight: 'bold', color: '#333333', marginTop: 12, marginBottom: 4 },
  emptyStateSub: { fontSize: 13, color: '#757575', textAlign: 'center' },
});