import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function KoleksiBukuKepala() {
  const router = useRouter();
  const books = useQuery(api.dashboard.getAllBooks);

  if (books === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Memuat Koleksi Buku...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Koleksi Buku</Text>
        <View style={{ width: 40 }} /> {/* Spacer biar judul di tengah */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        <Text style={styles.subtitle}>Total: {books.length} Buku Terdaftar</Text>

        {books.map((book) => (
          <View key={book._id} style={styles.bookCard}>
            <View style={styles.bookCoverPlaceholder}>
              <Ionicons name="book" size={32} color="#90CAF9" />
            </View>
            
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="swap-horizontal" size={14} color="#757575" />
                  <Text style={styles.statText}>{book.totalBorrowed} Dipinjam</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#FFB300" />
                  <Text style={styles.statText}>{book.averageRating.toFixed(1)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{book.stock > 0 ? 'Tersedia' : 'Habis'}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { marginTop: 12, color: '#2F80ED', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#FFFFFF' 
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  
  listContainer: { padding: 20 },
  subtitle: { fontSize: 14, color: '#757575', fontWeight: '600', marginBottom: 16 },

  bookCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 
  },
  bookCoverPlaceholder: { 
    width: 60, height: 80, borderRadius: 8, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 16 
  },
  bookInfo: { flex: 1, paddingRight: 10 },
  bookTitle: { fontSize: 16, fontWeight: '700', color: '#333333', marginBottom: 8 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 12, color: '#757575', marginLeft: 4, fontWeight: '500' },

  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, color: '#4CAF50', fontWeight: 'bold' }
});