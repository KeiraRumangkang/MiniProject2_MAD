import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';

import { api } from '../../convex/_generated/api';
import { useAuthSession } from '@/lib/auth-session';
import {
  StaffErrorState,
  StaffHeader,
  StaffLoadingState,
  cardShadow,
  softShadow,
  strongShadow,
} from '@/lib/staff-shared';

type StatusFilter = 'all' | 'active' | 'suspended';
type SortMode = 'name' | 'pointsDesc' | 'newest';

type UserForm = {
  name: string;
  username: string;
  password: string;
  faculty: string;
  points: string;
  isActive: boolean;
};

const EMPTY_FORM: UserForm = {
  name: '',
  username: '',
  password: '',
  faculty: '',
  points: '0',
  isActive: true,
};

export default function ManajemenMahasiswa() {
  const router = useRouter();
  const users = useQuery(api.users.getMahasiswaList);

  const suspendUser = useMutation(api.users.suspendUser);
  const createMahasiswa = useMutation((api as any).users.createMahasiswa);
  const updateMahasiswa = useMutation((api as any).users.updateMahasiswa);
  const deleteMahasiswa = useMutation((api as any).users.deleteMahasiswa);

  const { signOutAll } = useAuthSession();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('name');

  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];

  const activeCount = useMemo(() => safeUsers.filter((user) => user.isActive).length, [safeUsers]);
  const suspendedCount = useMemo(() => safeUsers.filter((user) => !user.isActive).length, [safeUsers]);

  const visibleUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = safeUsers.filter((user) => {
      const matchesKeyword =
        keyword.length === 0 ||
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        (user.faculty ? user.faculty.toLowerCase().includes(keyword) : false);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'suspended' && !user.isActive);

      return matchesKeyword && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortMode === 'pointsDesc') return b.points - a.points;
      if (sortMode === 'newest') return b.createdAt - a.createdAt;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [safeUsers, search, statusFilter, sortMode]);

  if (users === undefined) {
    return <StaffLoadingState message="Memuat data mahasiswa..." />;
  }

  if (!Array.isArray(users)) {
    return <StaffErrorState message="Data mahasiswa gagal dimuat. Coba refresh halaman." />;
  }

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      username: user.username,
      password: user.password || '',
      faculty: user.faculty || '',
      points: String(user.points ?? 0),
      isActive: user.isActive,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  };

  const saveUser = async () => {
    const name = form.name.trim();
    const username = form.username.trim().toLowerCase();
    const password = form.password.trim();
    const faculty = form.faculty.trim();
    const points = Number.parseInt(form.points.trim(), 10);

    if (!name || !username || !password) {
      Alert.alert('Validasi gagal', 'Nama, username, dan password wajib diisi.');
      return;
    }

    if (!Number.isFinite(points) || points < 0) {
      Alert.alert('Validasi gagal', 'Poin harus angka >= 0.');
      return;
    }

    try {
      setIsSavingForm(true);

      if (editingUser) {
        await updateMahasiswa({
          userId: editingUser._id,
          name,
          username,
          password,
          faculty,
          points,
          isActive: form.isActive,
        });
      } else {
        await createMahasiswa({
          name,
          username,
          password,
          faculty,
          points,
          isActive: form.isActive,
        });
      }

      closeModal();
    } catch (error: any) {
      Alert.alert('Gagal menyimpan user', error?.message ?? 'Terjadi kesalahan.');
    } finally {
      setIsSavingForm(false);
    }
  };

  const toggleSuspend = async (user: any) => {
    try {
      setProcessingUserId(user._id);
      await suspendUser({ userId: user._id, isActive: !user.isActive });
    } catch (error: any) {
      Alert.alert('Gagal', error?.message ?? 'Tidak bisa mengubah status user.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const removeUser = async (user: any) => {
    try {
      setProcessingUserId(user._id);
      await deleteMahasiswa({ userId: user._id });
    } catch (error: any) {
      Alert.alert('Gagal hapus user', error?.message ?? 'Terjadi kesalahan saat menghapus user.');
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StaffHeader title="Kelola Mahasiswa" subtitle={`${safeUsers.length} akun mahasiswa`} />

      <View style={styles.contentWrap}>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, styles.statPillGreen]}>
            <Ionicons name="checkmark-circle" size={14} color="#047857" />
            <Text style={styles.statPillGreenText}>{activeCount} Aktif</Text>
          </View>
          <View style={[styles.statPill, styles.statPillRed]}>
            <Ionicons name="ban" size={14} color="#B91C1C" />
            <Text style={styles.statPillRedText}>{suspendedCount} Suspended</Text>
          </View>
        </View>

        <View style={styles.controlPanel}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama, username, atau fakultas"
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'active', label: 'Aktif' },
              { key: 'suspended', label: 'Suspended' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, statusFilter === item.key && styles.chipActive]}
                onPress={() => setStatusFilter(item.key as StatusFilter)}
              >
                <Text style={[styles.chipText, statusFilter === item.key && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRowBottom}>
            {[
              { key: 'name', label: 'Nama A-Z' },
              { key: 'pointsDesc', label: 'Poin Tertinggi' },
              { key: 'newest', label: 'Terbaru' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, sortMode === item.key && styles.chipActive]}
                onPress={() => setSortMode(item.key as SortMode)}
              >
                <Text style={[styles.chipText, sortMode === item.key && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={visibleUsers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isBusy = processingUserId === item._id;
            const isActive = item.isActive;

            return (
              <View style={styles.card}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color={isActive ? '#10B981' : '#EF4444'} />
                </View>

                <View style={styles.userContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.dot, { backgroundColor: isActive ? '#10B981' : '#EF4444' }]} />
                  </View>
                  <Text style={styles.userMeta} numberOfLines={1}>@{item.username}</Text>
                  <Text style={styles.userMeta} numberOfLines={1}>
                    {item.faculty || 'Fakultas belum diisi'} · {item.points} poin
                  </Text>
                </View>

                <View style={styles.actionsCol}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)} disabled={isBusy}>
                    <Ionicons name="create-outline" size={17} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => void toggleSuspend(item)} disabled={isBusy}>
                    <Ionicons name={isActive ? 'ban' : 'checkmark-circle'} size={17} color={isActive ? '#EF4444' : '#10B981'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => void removeUser(item)} disabled={isBusy}>
                    <Ionicons name={isBusy ? 'sync' : 'trash-outline'} size={17} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
              <Text style={styles.emptySubtitle}>Tidak ada mahasiswa yang cocok dengan filter saat ini.</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await signOutAll();
          router.replace('/login');
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingUser ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Nama</Text>
              <TextInput
                style={styles.formInput}
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
                placeholder="Masukkan nama"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.formLabel}>Username</Text>
              <TextInput
                style={styles.formInput}
                value={form.username}
                onChangeText={(value) => setForm((prev) => ({ ...prev, username: value }))}
                autoCapitalize="none"
                placeholder="Masukkan username"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                style={styles.formInput}
                value={form.password}
                onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
                placeholder="Masukkan password"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.formLabel}>Fakultas</Text>
              <TextInput
                style={styles.formInput}
                value={form.faculty}
                onChangeText={(value) => setForm((prev) => ({ ...prev, faculty: value }))}
                placeholder="Masukkan fakultas"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.formLabel}>Poin</Text>
              <TextInput
                style={styles.formInput}
                value={form.points}
                onChangeText={(value) => setForm((prev) => ({ ...prev, points: value }))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Status akun</Text>
                <TouchableOpacity
                  style={[styles.statusSwitch, form.isActive ? styles.statusOn : styles.statusOff]}
                  onPress={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                >
                  <Text style={styles.statusSwitchText}>{form.isActive ? 'AKTIF' : 'SUSPENDED'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSavingForm && styles.disabledBtn]}
                onPress={() => void saveUser()}
                disabled={isSavingForm}
              >
                <Text style={styles.saveBtnText}>{isSavingForm ? 'Menyimpan...' : 'Simpan Data'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  contentWrap: { flex: 1 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  statPillGreen: { backgroundColor: '#ECFDF5' },
  statPillRed: { backgroundColor: '#FEF2F2' },
  statPillGreenText: { marginLeft: 6, color: '#047857', fontSize: 12, fontWeight: '700' },
  statPillRedText: { marginLeft: 6, color: '#B91C1C', fontSize: 12, fontWeight: '700' },

  controlPanel: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    ...softShadow,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginLeft: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    ...strongShadow,
  },

  chipsRow: { marginBottom: 8 },
  chipsRowBottom: {},
  chip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  chipText: { fontSize: 11, fontWeight: '700', color: '#6B7280', lineHeight: 14 },
  chipTextActive: { color: '#10B981' },

  listContent: { paddingHorizontal: 20, paddingBottom: 96 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    ...cardShadow,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userContent: { flex: 1, paddingRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: '800', color: '#111827', flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 3.5, marginLeft: 6 },
  userMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  actionsCol: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  emptyState: { alignItems: 'center', paddingVertical: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 10 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  logoutBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginLeft: 8 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    maxHeight: '84%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },

  formLabel: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: '#111827',
  },

  switchRow: { marginTop: 2, marginBottom: 12 },
  statusSwitch: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  statusOn: { backgroundColor: '#ECFDF5' },
  statusOff: { backgroundColor: '#FEF2F2' },
  statusSwitchText: { fontSize: 11, fontWeight: '800', color: '#111827' },

  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
    ...strongShadow,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  disabledBtn: { opacity: 0.65 },
});
