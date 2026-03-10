import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function AnalisisKepala() {
  const stats = useQuery(api.dashboard.getKepalaAnalisisStats);

  if (stats === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Menganalisis Data Koleksi...</Text>
      </View>
    );
  }

  // Cari nilai maksimal untuk progress bar
  const maxSearch = Math.max(...stats.topSearches.map(s => s.count), 1);
  const maxCategory = Math.max(...stats.popularCategories.map(c => c.count), 1);

  // Ambil kategori nomor 1 untuk rekomendasi
  const topCat = stats.popularCategories[0]?.categoryName || "Umum";

  const handleTrendPress = (keyword: string) => {
    Alert.alert(
      "Insight Pencarian",
      `Banyak mahasiswa mencari "${keyword}". \n\nSaran: Pastikan ketersediaan buku dengan sub-topik terkait di rak utama.`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        
        {/* HEADER */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Analisis Koleksi</Text>
          <Text style={styles.headerSubtitle}>Data interaksi mahasiswa 30 hari terakhir</Text>
        </View>

        <View style={styles.contentSection}>
          
          {/* 1. KARTU REKOMENDASI STRATEGIS (SINKRON DENGAN DB) */}
          <View style={[styles.card, { backgroundColor: '#2F80ED' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="bulb" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>Rekomendasi Strategis</Text>
            </View>
            <Text style={[styles.cardDesc, { color: 'rgba(255,255,255,0.9)', marginBottom: 0 }]}>
              Kategori <Text style={{ fontWeight: 'bold', color: '#FFF' }}>{topCat}</Text> adalah yang paling diminati. Disarankan untuk menambah alokasi anggaran pengadaan buku pada kategori ini bulan depan.
            </Text>
          </View>

          {/* 2. TREN PENCARIAN (INTERAKTIF) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBg}><Ionicons name="search" size={20} color="#2F80ED" /></View>
              <Text style={styles.cardTitle}>Top Tren Pencarian</Text>
            </View>
            <Text style={styles.cardDesc}>Klik pada tren untuk melihat saran tindakan.</Text>
            
            {stats.topSearches.map((item, index) => {
              const barWidth = `${(item.count / maxSearch) * 100}%`;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.barItem} 
                  onPress={() => handleTrendPress(item.keyword)}
                >
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>"{item.keyword}"</Text>
                    <View style={styles.row}>
                      <Text style={styles.barValue}>{item.count}x</Text>
                      {item.count > maxSearch * 0.8 && (
                        <View style={styles.hotBadge}><Text style={styles.hotText}>HOT</Text></View>
                      )}
                    </View>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: barWidth, backgroundColor: '#2F80ED' }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. DISTRIBUSI PEMINJAMAN */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="pie-chart" size={20} color="#8E24AA" />
              </View>
              <Text style={styles.cardTitle}>Distribusi Peminjaman</Text>
            </View>
            <Text style={styles.cardDesc}>Perbandingan minat baca antar kategori buku.</Text>

            {stats.popularCategories.map((item, index) => {
              const barWidth = `${(item.count / maxCategory) * 100}%`;
              return (
                <View key={index} style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>{item.categoryName}</Text>
                    <Text style={styles.barValue}>{item.count} Pinjam</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: barWidth, backgroundColor: '#8E24AA' }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* 4. BUKU RATING TERTINGGI */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="star" size={20} color="#FFB300" />
              </View>
              <Text style={styles.cardTitle}>Kualitas Koleksi (Rating)</Text>
            </View>
            
            {stats.topRatedBooks.map((item, index) => (
              <View key={index} style={styles.ratingRow}>
                <View style={styles.ratingInfo}>
                  <Text style={styles.ratingTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.ratingSub}>{item.borrowed} peminjam memberikan ulasan</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FFB300" />
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { marginTop: 12, color: '#2F80ED', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  row: { flexDirection: 'row', alignItems: 'center' },
  
  headerSection: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  
  contentSection: { paddingHorizontal: 20 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EAF3FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333333' },
  cardDesc: { fontSize: 13, color: '#9E9E9E', marginBottom: 20, lineHeight: 20 },
  
  barItem: { marginBottom: 16 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  barLabel: { fontSize: 14, fontWeight: '600', color: '#424242', flex: 1 },
  barValue: { fontSize: 13, fontWeight: '700', color: '#757575' },
  barTrack: { height: 8, backgroundColor: '#F0F2F5', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  hotBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 },
  hotText: { color: '#E53935', fontSize: 10, fontWeight: 'bold' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  ratingInfo: { flex: 1, paddingRight: 10 },
  ratingTitle: { fontSize: 15, fontWeight: '600', color: '#333333', marginBottom: 4 },
  ratingSub: { fontSize: 12, color: '#9E9E9E' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  ratingText: { marginLeft: 4, fontSize: 14, fontWeight: 'bold', color: '#FFB300' }
});