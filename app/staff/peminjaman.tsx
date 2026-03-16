import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { useAuthSession } from '@/lib/auth-session';
import { StaffErrorState, StaffHeader, StaffLoadingState, cardShadow, softShadow } from '@/lib/staff-shared';

type TabType = 'requested' | 'borrowed' | 'late';
type ActionType = 'approve' | 'reject' | 'return';

export default function PeminjamanStaff() {
  const borrowings = useQuery(api.borrowings.getAllBorrowings);
  const verifyBorrowing = useMutation(api.borrowings.verifyBorrowing);
  const rejectBorrowing = useMutation(api.borrowings.rejectBorrowing);
  const returnBook = useMutation(api.borrowings.returnBook);

  const { activeSession, getSessionForRole } = useAuthSession();
  const activeStaffSession = activeSession?.role === 'staff' ? activeSession : null;
  const storedStaffSession = getSessionForRole('staff');
  const staffId = activeStaffSession?.userId ?? storedStaffSession?.userId ?? null;

  const [activeTab, setActiveTab] = useState<TabType>('requested');
  const [search, setSearch] = useState('');
  const [busyAction, setBusyAction] = useState<{ borrowingId: string; type: ActionType } | null>(null);

  const safeBorrowings = Array.isArray(borrowings) ? borrowings : [];

  const counters = useMemo(() => {
    return {
      requested: safeBorrowings.filter((item) => item.effectiveStatus === 'requested').length,
      borrowed: safeBorrowings.filter((item) => item.effectiveStatus === 'borrowed').length,
      late: safeBorrowings.filter((item) => item.effectiveStatus === 'late').length,
    };
  }, [safeBorrowings]);

  const visibleBorrowings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return safeBorrowings.filter((item) => {
      const matchesTab = item.effectiveStatus === activeTab;
      const matchesKeyword =
        keyword.length === 0 ||
        item.userName.toLowerCase().includes(keyword) ||
        item.bookTitle.toLowerCase().includes(keyword);

      return matchesTab && matchesKeyword;
    });
  }, [activeTab, safeBorrowings, search]);

  if (borrowings === undefined) {
    return <StaffLoadingState message="Memuat data peminjaman..." />;
  }

  if (!Array.isArray(borrowings)) {
    return <StaffErrorState message="Data peminjaman gagal dimuat. Coba refresh halaman." />;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const runAction = async (borrowingId: string, type: ActionType) => {
    if (!staffId) {
      Alert.alert('Akun staff tidak ditemukan', 'Silakan login ulang sebagai staff.');
      return;
    }

    try {
      setBusyAction({ borrowingId, type });

      if (type === 'approve') {
        await verifyBorrowing({ borrowingId: borrowingId as any, staffId: staffId as any });
      } else if (type === 'reject') {
        await rejectBorrowing({ borrowingId: borrowingId as any, staffId: staffId as any });
      } else {
        await returnBook({ borrowingId: borrowingId as any, staffId: staffId as any });
      }

      Alert.alert('Berhasil', 'Perubahan status peminjaman berhasil disimpan.');
    } catch (error: any) {
      Alert.alert('Aksi gagal', error?.message ?? 'Terjadi kesalahan.');
    } finally {
      setBusyAction(null);
    }
  };

  const isBusy = (borrowingId: string, type?: ActionType) => {
    if (!busyAction) return false;
    if (type) return busyAction.borrowingId === borrowingId && busyAction.type === type;
    return busyAction.borrowingId === borrowingId;
  };

  return (
    <View style={styles.container}>
      <StaffHeader title="Manajemen Peminjaman" subtitle={`${safeBorrowings.length} total transaksi`} />

      <View style={styles.bodySection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9E9E9E" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Cari mahasiswa atau judul buku"
            placeholderTextColor="#BDBDBD"
          />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'requested' && styles.tabButtonActive]}
            onPress={() => setActiveTab('requested')}
          >
            <Ionicons name="time-outline" size={16} color={activeTab === 'requested' ? '#10B981' : '#9E9E9E'} />
            <Text style={[styles.tabLabel, activeTab === 'requested' && styles.tabLabelActive]}>Permintaan</Text>
            {counters.requested > 0 && <Text style={styles.tabCount}>{counters.requested}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'borrowed' && styles.tabButtonActive]}
            onPress={() => setActiveTab('borrowed')}
          >
            <Ionicons name="book-outline" size={16} color={activeTab === 'borrowed' ? '#10B981' : '#9E9E9E'} />
            <Text style={[styles.tabLabel, activeTab === 'borrowed' && styles.tabLabelActive]}>Dipinjam</Text>
            {counters.borrowed > 0 && <Text style={styles.tabCount}>{counters.borrowed}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'late' && styles.tabButtonActive]}
            onPress={() => setActiveTab('late')}
          >
            <Ionicons name="warning-outline" size={16} color={activeTab === 'late' ? '#10B981' : '#9E9E9E'} />
            <Text style={[styles.tabLabel, activeTab === 'late' && styles.tabLabelActive]}>Terlambat</Text>
            {counters.late > 0 && <Text style={styles.tabCount}>{counters.late}</Text>}
          </TouchableOpacity>
        </View>

        <FlatList
          data={visibleBorrowings}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.identityBlock}>
                  <Text style={styles.userName} numberOfLines={1}>{item.userName}</Text>
                  <Text style={styles.bookTitle} numberOfLines={1}>{item.bookTitle}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: activeTab === 'late' ? '#FEE2E2' : '#DBEAFE' }]}>
                  <Text style={[styles.statusBadgeText, { color: activeTab === 'late' ? '#DC2626' : '#1D4ED8' }]}>
                    {item.effectiveStatus.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Pinjam: {formatDate(item.borrowDate)}</Text>
                <Text style={styles.metaText}>Jatuh tempo: {formatDate(item.dueDate)}</Text>
              </View>

              {item.daysLate > 0 && (
                <View style={styles.lateInfoRow}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.lateInfoText}>Terlambat {item.daysLate} hari</Text>
                </View>
              )}

              {isBusy(item._id) && (
                <View style={styles.processingRow}>
                  <Ionicons name="sync" size={12} color="#1D4ED8" />
                  <Text style={styles.processingText}>Memproses aksi...</Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                {activeTab === 'requested' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn, isBusy(item._id) && styles.disabledBtn]}
                      onPress={() => {
                        void runAction(item._id, 'approve');
                      }}
                      disabled={isBusy(item._id) || !staffId}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.actionText}>Setujui</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn, isBusy(item._id) && styles.disabledBtn]}
                      onPress={() => {
                        void runAction(item._id, 'reject');
                      }}
                      disabled={isBusy(item._id) || !staffId}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                      <Text style={styles.actionText}>Tolak</Text>
                    </TouchableOpacity>
                  </>
                )}

                {(activeTab === 'borrowed' || activeTab === 'late') && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.returnBtn, isBusy(item._id) && styles.disabledBtn]}
                    onPress={() => {
                      void runAction(item._id, 'return');
                    }}
                    disabled={isBusy(item._id) || !staffId}
                  >
                    <Ionicons name="return-down-back" size={16} color="#FFFFFF" />
                    <Text style={styles.actionText}>Konfirmasi Kembali</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
              <Text style={styles.emptyTitle}>Tidak ada data</Text>
              <Text style={styles.emptySubtitle}>
                {search.trim()
                  ? 'Tidak ada hasil yang cocok dengan pencarian.'
                  : 'Tidak ada transaksi untuk tab yang dipilih.'}
              </Text>
            </View>
          }
        />
      </View>

      {!staffId && (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle" size={16} color="#92400E" />
          <Text style={styles.warningText}>Akun staff belum valid. Tombol aksi dinonaktifkan.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  bodySection: { flex: 1, paddingHorizontal: 20 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 46,
    ...softShadow,
  },
  searchInput: { flex: 1, color: '#111827', fontSize: 14 },

  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  tabLabel: {
    marginLeft: 5,
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  tabLabelActive: { color: '#10B981' },
  tabCount: {
    marginLeft: 5,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    fontSize: 10,
    overflow: 'hidden',
    fontWeight: '700',
  },

  listContent: { paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  identityBlock: { flex: 1, paddingRight: 8 },
  userName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  bookTitle: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  metaRow: { marginTop: 8 },
  metaText: { fontSize: 12, color: '#6B7280', marginBottom: 2 },

  lateInfoRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lateInfoText: {
    marginLeft: 6,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  processingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  processingText: {
    marginLeft: 4,
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },

  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  returnBtn: { backgroundColor: '#2563EB' },
  actionText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  disabledBtn: { opacity: 0.65 },

  emptyState: { paddingVertical: 70, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: '700', color: '#1F2937' },
  emptySubtitle: { marginTop: 5, fontSize: 13, color: '#6B7280', textAlign: 'center' },

  warningBanner: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 8,
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
