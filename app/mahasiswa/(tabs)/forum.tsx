/**
 * ========================================
 * HALAMAN LIST FORUM DISKUSI
 * ========================================
 * Nampilin semua post forum yang ada di perpustakaan.
 * 
 * Fitur utama:
 * - List semua post (yang belum dihapus)
 * - Like post langsung dari list
 * - Klik card buat buka detail thread (navigasi ke forum/[id])
 * - Tombol buat bikin post baru
 * 
 * Data flow:
 * - Query getForumPosts buat ambil semua post
 * - Filter post yang isDeleted = true (soft deleted sama staff)
 * - Navigasi ke /mahasiswa/forum/[id] pas card diklik
 * 
 * TODO: ganti "dummy_user_id" pake auth session beneran
 * ========================================
 */

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";

export default function Forum() {

  // ambil semua post forum dari database
  const posts = useQuery(api.forum.getForumPosts);

  // mutation buat like post
  const likePost = useMutation(api.forum.likePost);

  /**
   * Handler like post
   * Backend udah handle duplikat (1 user cuma bisa like 1x per post)
   */
  const handleLike = async (postId: string) => {
    try {
      await likePost({
        postId: postId as any,
        userId: "dummy_user_id" as any, // TODO: ganti pake auth session
      });
    } catch (error) {
      console.log("Sudah like");
    }
  };

  // loading state
  if (!posts) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // filter post yang udah di-soft-delete sama staff moderator
  const visiblePosts = posts.filter((p) => !p.isDeleted);

  /**
   * Format timestamp jadi waktu relatif yang singkat
   * Contoh: "5m lalu", "2j lalu", "3h lalu"
   */
  const formatWaktu = (timestamp: number) => {
    const selisih = Date.now() - timestamp;
    const menit = Math.floor(selisih / (1000 * 60));
    const jam = Math.floor(selisih / (1000 * 60 * 60));
    const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));

    if (menit < 1) return "Baru saja";
    if (menit < 60) return `${menit}m lalu`;
    if (jam < 24) return `${jam}j lalu`;
    return `${hari}h lalu`;
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Forum Diskusi</Text>

      {/* tombol bikin post baru */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/mahasiswa/forum/create-post")}
      >
        <Text style={styles.createText}>+ Buat Post</Text>
      </TouchableOpacity>

      {/* list post forum */}
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          /* 
            card post bisa diklik buat buka detail thread
            navigasi ke halaman forum/[id].tsx 
          */
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/mahasiswa/forum/${item._id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.postTitle}>{item.title}</Text>

            <Text style={styles.category}>
              Kategori: {item.category}
            </Text>

            {/* preview konten, maks 2 baris */}
            <Text style={styles.content} numberOfLines={2}>
              {item.content}
            </Text>

            {/* baris bawah: waktu posting + stats */}
            <View style={styles.row}>
              <Text style={styles.time}>{formatWaktu(item.createdAt)}</Text>

              <View style={styles.statsRow}>
                <Text style={styles.statText}>💬 {item.commentCount}</Text>

                <TouchableOpacity onPress={() => handleLike(item._id)}>
                  <Text style={styles.statText}>❤️ {item.likeCount}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  // card post forum
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  category: {
    marginTop: 5,
    color: "#666",
  },

  content: {
    marginTop: 10,
    lineHeight: 20,
    color: "#444",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  time: {
    fontSize: 12,
    color: "#999",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  statText: {
    fontSize: 14,
  },

  createButton: {
    backgroundColor: "#2F80ED",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },

  createText: {
    color: "white",
    fontWeight: "bold",
  },

});