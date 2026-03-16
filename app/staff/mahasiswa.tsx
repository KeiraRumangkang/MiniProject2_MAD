import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { api } from '../../convex/_generated/api';
import { StaffErrorState, StaffHeader, StaffLoadingState, cardShadow, softShadow } from './_shared';
import { useAuthSession } from '@/lib/auth-session';

export default function ManajemenMahasiswa() {
  const router = useRouter();
  const users = useQuery(api.users.getMahasiswaList);
  const suspendUser = useMutation(api.users.suspendUser);
  const { signOut } = useAuthSession();
  const [search, setSearch] = useState('');

  if (users === undefined) {
    return <StaffLoadingState message="Memuat data mahasiswa..." />;
  }

  if (!Array.isArray(users)) {
    return (
      <StaffErrorState message="Data mahasiswa gagal dimuat. Coba refresh halaman." />
    );
  }

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(keyword) ||
      user.username.toLowerCase().includes(keyword) ||
      (user.faculty && user.faculty.toLowerCase().includes(keyword))
    );
  });

  const activeCount = users.filter((u) => u.isActive).length;
  const suspendedCount = users.filter((u) => !u.isActive).length;

  const handleToggleSuspend = (userId: string, isActive: boolean, name: string) => {
    const action = isActive ? 'Suspend' : 'Aktifkan';
    Alert.alert(
      `${action} Akun`,
      `${action} akun "${name}"?${isActive ? '\n\nMahasiswa ini tidak akan bisa login.' : '\n\nMahasiswa ini akan bisa login kembali.'}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: action,
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await suspendUser({ userId: userId as any, isActive: !isActive });
              Alert.alert('Berhasil', `Akun ${name} berhasil di-${action.toLowerCase()}`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Gagal mengubah status');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: item.isActive ? '#ECFDF5' : '#FEF2F2' }]}>
          <Ionicons name="person" size={22} color={item.isActive ? '#10B981' : '#EF4444'} />
        </View>
      </View>
      <View style={styles.cardCenter}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }]} />
        </View>
        <Text style={styles.userUsername}>@{item.username}</Text>
        {item.faculty && <Text style={styles.userFaculty} numberOfLines={1}>{item.faculty}</Text>}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.metaText}>{item.points} pts</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={[styles.statusBadgeText, { color: item.isActive ? '#10B981' : '#EF4444' }]}>
              {item.isActive ? 'Aktif' : 'Suspended'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: item.isActive ? '#FEF2F2' : '#ECFDF5' }]}
          onPress={() => handleToggleSuspend(item._id, item.isActive, item.name)}
        >
          <Ionicons name={item.isActive ? 'ban' : 'checkmark-circle'} size={18} color={item.isActive ? '#EF4444' : '#10B981'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <StaffHeader
        title="Kelola Mahasiswa"
        subtitle={`${users.length} total mahasiswa`}
      />

      {/* SUMMARY BADGES */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryBadge, { backgroundColor: '#ECFDF5' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={[styles.summaryText, { color: '#10B981' }]}>{activeCount} Aktif</Text>
        </View>
        <View style={[styles.summaryBadge, { backgroundColor: '#FEF2F2' }]}>
          <Ionicons name="ban" size={16} color="#EF4444" />
          <Text style={[styles.summaryText, { color: '#EF4444' }]}>{suspendedCount} Suspended</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9E9E9E" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari nama, username, atau fakultas..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#BDBDBD"
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>Tidak Ditemukan</Text>
            <Text style={styles.emptySubtitle}>Tidak ada mahasiswa yang sesuai pencarian</Text>
          </View>
        }
      />

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert(
            'Logout',
            'Apakah Anda yakin ingin logout?',
            [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                  await signOut('staff');
                  router.replace('/login');
                },
              },
            ]
          );
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 10 },
  summaryText: { fontSize: 13, fontWeight: '700', marginLeft: 6 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, height: 48, marginBottom: 16, ...softShadow },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', ...cardShadow },
  cardLeft: { marginRight: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardCenter: { flex: 1, paddingRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6 },
  userUsername: { fontSize: 13, color: '#9E9E9E', marginTop: 1 },
  userFaculty: { fontSize: 12, color: '#757575', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  metaText: { fontSize: 12, color: '#757575', fontWeight: '500', marginLeft: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  cardRight: { alignItems: 'center' },
  toggleBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#757575', marginTop: 4, textAlign: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 12, marginTop: 20, marginHorizontal: 20 },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});