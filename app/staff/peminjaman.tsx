import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

type TabType = 'requested' | 'borrowed' | 'late';

export default function PeminjamanStaff() {
  const borrowings = useQuery(api.borrowings.getAllBorrowings);
  const verifyBorrowing = useMutation(api.borrowings.verifyBorrowing);
  const returnBook = useMutation(api.borrowings.returnBook);
  const rejectBorrowing = useMutation(api.borrowings.rejectBorrowing);

  const [activeTab, setActiveTab] = useState<TabType>('requested');

  if (borrowings === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Memuat Data Peminjaman...</Text>
      </View>
    );
  }

  // Dummy staff ID — in production this should come from auth session
  const dummyStaffId = "staff_placeholder";

  const filteredBorrowings = borrowings.filter((b) => {
    if (activeTab === 'requested') return b.effectiveStatus === 'requested';
    if (activeTab === 'borrowed') return b.effectiveStatus === 'borrowed';
    if (activeTab === 'late') return b.effectiveStatus === 'late';
    return false;
  });

  const tabs: { key: TabType; label: string; icon: string; count: number }[] = [
    {
      key: 'requested',
      label: 'Permintaan',
      icon: 'time',
      count: borrowings.filter((b) => b.effectiveStatus === 'requested').length,
    },
    {
      key: 'borrowed',
      label: 'Aktif',
      icon: 'book',
      count: borrowings.filter((b) => b.effectiveStatus === 'borrowed').length,
    },
    {
      key: 'late',
      label: 'Terlambat',
      icon: 'warning',
      count: borrowings.filter((b) => b.effectiveStatus === 'late').length,
    },
  ];

  const handleApprove = (borrowingId: string) => {
    Alert.alert(
      'Setujui Peminjaman',
      'Apakah Anda yakin ingin menyetujui peminjaman ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Setujui',
          onPress: async () => {
            try {
              await verifyBorrowing({
                borrowingId: borrowingId as any,
                staffId: dummyStaffId as any,
              });
              Alert.alert('Berhasil', 'Peminjaman disetujui');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Gagal menyetujui');
            }
          },
        },
      ]
    );
  };

  const handleReject = (borrowingId: string) => {
    Alert.alert(
      'Tolak Peminjaman',
      'Apakah Anda yakin ingin menolak permintaan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tolak',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectBorrowing({
                borrowingId: borrowingId as any,
                staffId: dummyStaffId as any,
              });
              Alert.alert('Berhasil', 'Peminjaman ditolak');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Gagal menolak');
            }
          },
        },
      ]
    );
  };

  const handleReturn = (borrowingId: string) => {
    Alert.alert(
      'Verifikasi Pengembalian',
      'Apakah buku sudah dikembalikan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Konfirmasi',
          onPress: async () => {
            try {
              await returnBook({
                borrowingId: borrowingId as any,
                staffId: dummyStaffId as any,
              });
              Alert.alert('Berhasil', 'Pengembalian berhasil diverifikasi');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Gagal memverifikasi');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[
          styles.cardIcon,
          {
            backgroundColor: activeTab === 'late' ? '#FEF2F2'
              : activeTab === 'requested' ? '#FFF7ED'
              : '#EFF6FF',
          },
        ]}>
          <Ionicons
            name={activeTab === 'late' ? 'alert-circle' : activeTab === 'requested' ? 'hourglass' : 'book'}
            size={22}
            color={activeTab === 'late' ? '#EF4444' : activeTab === 'requested' ? '#F59E0B' : '#3B82F6'}
          />
        </View>
      </View>

      <View style={styles.cardCenter}>
        <Text style={styles.cardUser} numberOfLines={1}>{item.userName}</Text>
        <Text style={styles.cardBook} numberOfLines={1}>{item.bookTitle}</Text>
        <View style={styles.cardDates}>
          <Text style={styles.dateText}>Pinjam: {formatDate(item.borrowDate)}</Text>
          <Text style={styles.dateText}>Batas: {formatDate(item.dueDate)}</Text>
        </View>
        {item.daysLate > 0 && (
          <View style={styles.lateBadge}>
            <Text style={styles.lateBadgeText}>Terlambat {item.daysLate} Hari</Text>
          </View>
        )}
      </View>

      <View style={styles.cardRight}>
        {activeTab === 'requested' && (
          <>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item._id)}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item._id)}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
        {(activeTab === 'borrowed' || activeTab === 'late') && (
          <TouchableOpacity style={styles.returnBtn} onPress={() => handleReturn(item._id)}>
            <Ionicons name="return-down-back" size={16} color="#FFFFFF" />
            <Text style={styles.returnBtnText}>Kembali</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Manajemen Peminjaman</Text>
        <Text style={styles.headerSubtitle}>{borrowings.length} total transaksi</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#10B981' : '#9E9E9E'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={filteredBorrowings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
            <Text style={styles.emptyTitle}>Tidak Ada Data</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'requested' ? 'Tidak ada permintaan peminjaman baru' :
               activeTab === 'borrowed' ? 'Tidak ada buku yang sedang dipinjam' :
               'Tidak ada peminjaman yang terlambat'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  loadingText: { marginTop: 12, color: '#10B981', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  headerSection: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 14, color: '#757575', marginTop: 4 },

  tabContainer: {
    flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16,
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14,
    padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10,
  },
  tabActive: { backgroundColor: '#ECFDF5' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#9E9E9E', marginLeft: 4 },
  tabTextActive: { color: '#10B981' },
  tabBadge: { backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
  tabBadgeActive: { backgroundColor: '#10B981' },
  tabBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#757575' },
  tabBadgeTextActive: { color: '#FFFFFF' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  cardLeft: { marginRight: 12 },
  cardIcon: {
    width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  cardCenter: { flex: 1, paddingRight: 8 },
  cardUser: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  cardBook: { fontSize: 13, color: '#757575', marginBottom: 4 },
  cardDates: { flexDirection: 'row', flexWrap: 'wrap' },
  dateText: { fontSize: 11, color: '#9E9E9E', marginRight: 12 },

  lateBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4, alignSelf: 'flex-start' },
  lateBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#EF4444' },

  cardRight: { alignItems: 'center' },
  approveBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  rejectBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
  },
  returnBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#3B82F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  returnBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#757575', marginTop: 4, textAlign: 'center' },
});
