import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { StaffErrorState, StaffHeader, StaffLoadingState, cardShadow } from './_shared';

type FilterType = 'all' | 'pinned';

export default function ForumModerasi() {
  const posts = useQuery(api.forum.getForumPosts);
  const deletePost = useMutation(api.forum.deleteForumPost);
  const pinPost = useMutation(api.forum.pinForumPost);

  const [filter, setFilter] = useState<FilterType>('all');

  if (posts === undefined) {
    return <StaffLoadingState message="Memuat forum moderasi..." />;
  }

  if (!Array.isArray(posts)) {
    return <StaffErrorState message="Data forum gagal dimuat. Coba refresh halaman." />;
  }

  // Filter out deleted posts, then apply tab filter
  const visiblePosts = posts.filter((p) => !p.isDeleted);
  const filteredPosts = filter === 'pinned'
    ? visiblePosts.filter((p) => p.isPinned)
    : visiblePosts;

  const handleDelete = (postId: string, title: string) => {
    Alert.alert(
      'Hapus Post',
      `Hapus post "${title}"? Post akan disembunyikan dari mahasiswa.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost({ postId: postId as any });
              Alert.alert('Berhasil', 'Post berhasil dihapus');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Gagal menghapus');
            }
          },
        },
      ]
    );
  };

  const handlePin = async (postId: string) => {
    try {
      const result = await pinPost({ postId: postId as any });
      Alert.alert(
        'Berhasil',
        result.isPinned ? 'Post di-pin ke atas' : 'Pin post dibuka'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengubah pin');
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      review_buku: '📖 Review',
      rekomendasi_buku: '💡 Rekomendasi',
      tanya_buku: '❓ Tanya',
      diskusi_pengetahuan: '🧠 Diskusi',
      buku_skripsi: '🎓 Skripsi',
    };
    return map[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      review_buku: '#8B5CF6',
      rekomendasi_buku: '#10B981',
      tanya_buku: '#F59E0B',
      diskusi_pengetahuan: '#3B82F6',
      buku_skripsi: '#EC4899',
    };
    return map[cat] || '#9E9E9E';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* PIN INDICATOR */}
      {item.isPinned && (
        <View style={styles.pinnedBanner}>
          <Ionicons name="pin" size={12} color="#F59E0B" />
          <Text style={styles.pinnedText}>Pinned</Text>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {getCategoryLabel(item.category)}
          </Text>
        </View>
        <Text style={styles.dateLabel}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* CONTENT */}
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>

      {/* STATS */}
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

      {/* ACTIONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.pinBtn]}
          onPress={() => handlePin(item._id)}
        >
          <Ionicons name={item.isPinned ? 'pin-outline' : 'pin'} size={16} color="#F59E0B" />
          <Text style={[styles.actionBtnText, { color: '#F59E0B' }]}>
            {item.isPinned ? 'Unpin' : 'Pin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtnAction]}
          onPress={() => handleDelete(item._id, item.title)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <StaffHeader
        title="Moderasi Forum"
        subtitle={`${visiblePosts.length} post aktif`}
      />

      {/* FILTER */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Semua ({visiblePosts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'pinned' && styles.filterBtnActive]}
          onPress={() => setFilter('pinned')}
        >
          <Ionicons name="pin" size={14} color={filter === 'pinned' ? '#10B981' : '#9E9E9E'} />
          <Text style={[styles.filterText, filter === 'pinned' && styles.filterTextActive, { marginLeft: 4 }]}>
            Pinned ({visiblePosts.filter(p => p.isPinned).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>Tidak Ada Post</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'pinned' ? 'Belum ada post yang di-pin' : 'Belum ada diskusi di forum'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  filterContainer: {
    flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFFFFF', marginRight: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#9E9E9E' },
  filterTextActive: { color: '#10B981' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  pinnedBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10,
  },
  pinnedText: { fontSize: 11, fontWeight: '700', color: '#F59E0B', marginLeft: 4 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  dateLabel: { fontSize: 11, color: '#9E9E9E' },

  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  cardContent: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },

  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 13, color: '#757575', fontWeight: '600', marginLeft: 4 },

  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F2F5', paddingTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 10,
  },
  pinBtn: { backgroundColor: '#FFF7ED' },
  deleteBtnAction: { backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#757575', marginTop: 4, textAlign: 'center' },
});
