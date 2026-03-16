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

import { api } from '../../convex/_generated/api';
import { useAuthSession } from '@/lib/auth-session';
import { StaffErrorState, StaffHeader, StaffLoadingState, cardShadow, softShadow, strongShadow } from '@/lib/staff-shared';

type FilterType = 'all' | 'pinned';
type ForumCategory = 'review_buku' | 'rekomendasi_buku' | 'tanya_buku' | 'diskusi_pengetahuan' | 'buku_skripsi';

type BusyAction = {
  postId: string;
  type: 'pin' | 'delete' | 'update';
};

const CATEGORY_OPTIONS: Array<{ key: ForumCategory; label: string }> = [
  { key: 'review_buku', label: 'Review' },
  { key: 'rekomendasi_buku', label: 'Rekomendasi' },
  { key: 'tanya_buku', label: 'Tanya' },
  { key: 'diskusi_pengetahuan', label: 'Diskusi' },
  { key: 'buku_skripsi', label: 'Skripsi' },
];

export default function ForumModerasi() {
  const posts = useQuery(api.forum.getForumPosts);
  const createPost = useMutation(api.forum.createForumPost);
  const updatePost = useMutation((api as any).forum.updateForumPost);
  const deletePost = useMutation(api.forum.deleteForumPost);
  const pinPost = useMutation(api.forum.pinForumPost);

  const { activeSession, getSessionForRole } = useAuthSession();
  const staffId =
    (activeSession?.role === 'staff' ? activeSession.userId : null) ??
    getSessionForRole('staff')?.userId ??
    null;

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<ForumCategory>('review_buku');
  const [isSavingForm, setIsSavingForm] = useState(false);

  const safePosts = Array.isArray(posts) ? posts : [];

  const activePosts = useMemo(() => safePosts.filter((post) => !post.isDeleted), [safePosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = activePosts.filter((post) => {
      const filterMatch = filter === 'all' || post.isPinned;
      const searchMatch =
        keyword.length === 0 ||
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword);
      return filterMatch && searchMatch;
    });

    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [activePosts, filter, search]);

  if (posts === undefined) {
    return <StaffLoadingState message="Memuat forum moderasi..." />;
  }

  if (!Array.isArray(posts)) {
    return <StaffErrorState message="Data forum gagal dimuat. Coba refresh halaman." />;
  }

  const pinnedCount = activePosts.filter((post) => post.isPinned).length;

  const isBusy = (postId: string) => busyAction?.postId === postId;

  const getCategoryLabel = (category: string) => {
    return CATEGORY_OPTIONS.find((item) => item.key === category)?.label ?? category;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      review_buku: '#8B5CF6',
      rekomendasi_buku: '#10B981',
      tanya_buku: '#F59E0B',
      diskusi_pengetahuan: '#3B82F6',
      buku_skripsi: '#EC4899',
    };
    return colorMap[category] ?? '#9CA3AF';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('review_buku');
    setModalVisible(true);
  };

  const openEditModal = (post: any) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormCategory(post.category);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPost(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('review_buku');
  };

  const savePost = async () => {
    const title = formTitle.trim();
    const content = formContent.trim();

    if (!title || !content) {
      Alert.alert('Validasi gagal', 'Judul dan isi post wajib diisi.');
      return;
    }

    if (!staffId) {
      Alert.alert('Akun staff tidak ditemukan', 'Silakan login ulang sebagai staff.');
      return;
    }

    try {
      setIsSavingForm(true);

      if (editingPost) {
        await updatePost({
          postId: editingPost._id,
          category: formCategory,
          title,
          content,
        });
      } else {
        await createPost({
          userId: staffId as any,
          category: formCategory,
          title,
          content,
        });
      }

      closeModal();
    } catch (error: any) {
      Alert.alert('Gagal menyimpan', error?.message ?? 'Terjadi kesalahan saat menyimpan post.');
    } finally {
      setIsSavingForm(false);
    }
  };

  const togglePin = async (postId: string) => {
    try {
      setBusyAction({ postId, type: 'pin' });
      await pinPost({ postId: postId as any });
    } catch (error: any) {
      Alert.alert('Gagal', error?.message ?? 'Tidak bisa mengubah status pin.');
    } finally {
      setBusyAction(null);
    }
  };

  const removePost = async (postId: string) => {
    try {
      setBusyAction({ postId, type: 'delete' });
      await deletePost({ postId: postId as any });
    } catch (error: any) {
      Alert.alert('Gagal', error?.message ?? 'Tidak bisa menghapus post.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <View style={styles.container}>
      <StaffHeader title="Moderasi Forum" subtitle={`${activePosts.length} post aktif`} />

      <View style={styles.bodySection}>
        <View style={styles.topRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9E9E9E" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Cari judul atau isi post"
              placeholderTextColor="#BDBDBD"
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
              Semua ({activePosts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'pinned' && styles.filterChipActive]}
            onPress={() => setFilter('pinned')}
          >
            <Ionicons name="pin" size={14} color={filter === 'pinned' ? '#10B981' : '#9E9E9E'} />
            <Text style={[styles.filterChipText, filter === 'pinned' && styles.filterChipTextActive, { marginLeft: 4 }]}>
              Pinned ({pinnedCount})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Ionicons name="pin" size={12} color="#F59E0B" />
                  <Text style={styles.pinnedText}>Pinned</Text>
                </View>
              )}

              <View style={styles.cardTop}>
                <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(item.category)}22` }]}>
                  <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              </View>

              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.content} numberOfLines={3}>{item.content}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={14} color="#EF4444" />
                  <Text style={styles.statText}>{item.likeCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="chatbubble" size={14} color="#3B82F6" />
                  <Text style={styles.statText}>{item.commentCount}</Text>
                </View>
              </View>

              {isBusy(item._id) && (
                <View style={styles.processingPill}>
                  <Ionicons name="sync" size={12} color="#1D4ED8" />
                  <Text style={styles.processingText}>Memproses...</Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn, isBusy(item._id) && styles.disabledBtn]}
                  onPress={() => openEditModal(item)}
                  disabled={isBusy(item._id)}
                >
                  <Ionicons name="create-outline" size={16} color="#2563EB" />
                  <Text style={[styles.actionText, { color: '#2563EB' }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.pinBtn, isBusy(item._id) && styles.disabledBtn]}
                  onPress={() => void togglePin(item._id)}
                  disabled={isBusy(item._id)}
                >
                  <Ionicons name={item.isPinned ? 'pin-outline' : 'pin'} size={16} color="#F59E0B" />
                  <Text style={[styles.actionText, { color: '#F59E0B' }]}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn, isBusy(item._id) && styles.disabledBtn]}
                  onPress={() => void removePost(item._id)}
                  disabled={isBusy(item._id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>Tidak ada post</Text>
              <Text style={styles.emptySubtitle}>
                {search.trim().length > 0
                  ? 'Tidak ada post yang cocok dengan pencarian.'
                  : filter === 'pinned'
                  ? 'Belum ada post yang dipin.'
                  : 'Belum ada diskusi aktif.'}
              </Text>
            </View>
          }
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingPost ? 'Edit Post' : 'Buat Post'}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {CATEGORY_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.categoryChip, formCategory === item.key && styles.categoryChipActive]}
                    onPress={() => setFormCategory(item.key)}
                  >
                    <Text style={[styles.categoryChipText, formCategory === item.key && styles.categoryChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Judul</Text>
              <TextInput
                style={styles.formInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="Masukkan judul post"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.formLabel}>Isi</Text>
              <TextInput
                style={[styles.formInput, styles.formArea]}
                multiline
                value={formContent}
                onChangeText={setFormContent}
                placeholder="Masukkan isi post"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[styles.saveBtn, isSavingForm && styles.disabledBtn]}
                onPress={() => void savePost()}
                disabled={isSavingForm}
              >
                <Text style={styles.saveBtnText}>{isSavingForm ? 'Menyimpan...' : 'Simpan Post'}</Text>
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
  bodySection: { flex: 1, paddingHorizontal: 20 },

  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    ...softShadow,
  },
  searchInput: { flex: 1, color: '#111827', fontSize: 14 },
  addBtn: {
    width: 46,
    height: 46,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    ...strongShadow,
  },

  filterRow: { flexDirection: 'row', marginBottom: 12 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 17,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#6B7280', lineHeight: 14 },
  filterChipTextActive: { color: '#10B981' },

  listContent: { paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...cardShadow,
  },
  pinnedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  pinnedText: { marginLeft: 4, color: '#F59E0B', fontSize: 11, fontWeight: '700' },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 11, color: '#9CA3AF' },

  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  content: { fontSize: 13, color: '#4B5563', lineHeight: 19, marginBottom: 10 },

  statsRow: { flexDirection: 'row', marginBottom: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  statText: { marginLeft: 4, color: '#6B7280', fontSize: 12, fontWeight: '600' },

  processingPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  processingText: { marginLeft: 4, color: '#1D4ED8', fontSize: 11, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F2F5', paddingTop: 10, gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  editBtn: { backgroundColor: '#EFF6FF' },
  pinBtn: { backgroundColor: '#FFF7ED' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  actionText: { marginLeft: 5, fontSize: 12, fontWeight: '700' },
  disabledBtn: { opacity: 0.65 },

  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: '700', color: '#1F2937' },
  emptySubtitle: { marginTop: 5, fontSize: 13, color: '#6B7280', textAlign: 'center' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    maxHeight: '82%',
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
  formArea: { minHeight: 96, textAlignVertical: 'top' },

  categoryChip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  categoryChipText: { fontSize: 12, color: '#4B5563', fontWeight: '700' },
  categoryChipTextActive: { color: '#FFFFFF' },

  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    ...strongShadow,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
