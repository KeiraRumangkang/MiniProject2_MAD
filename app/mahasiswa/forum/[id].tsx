/**
 * ========================================
 * HALAMAN DETAIL THREAD FORUM
 * ========================================
 * Halaman ini nampilin detail lengkap dari sebuah post forum.
 * 
 * Fitur utama:
 * - Tampilin isi post lengkap (judul, konten, author, waktu, kategori)
 * - List semua komentar dari user lain
 * - Input komentar baru di bagian bawah (kayak chat)
 * 
 * Data flow:
 * - Ambil id post dari URL params (expo-router dynamic route)
 * - Query ke `getForumPostDetail` buat dapetin post + komentar + nama user
 * - Mutation `addForumComment` buat kirim komentar baru
 * 
 * TODO: ganti "dummy_user_id" pake auth session yang beneran
 * ========================================
 */

import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../../convex/_generated/api";

export default function ForumDetail() {

  // ambil id post dari parameter url (format: /forum/[id])
  const { id } = useLocalSearchParams();

  // query data post lengkap + komentar dari backend
  const data = useQuery(
    api.forum.getForumPostDetail,
    id ? { postId: id as any } : "skip" // skip kalo id belum ready
  );

  // mutation buat kirim komentar baru
  const addComment = useMutation(api.forum.addForumComment);

  // state buat simpang input komentar user
  const [komentar, setKomentar] = useState("");

  // loading state selagi data di-fetch
  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // destructure data yang udah di-fetch
  const { post, authorName, comments } = data;

  /**
   * Handler buat kirim komentar baru
   * - Validasi: nimbole kosong
   * - Kirim ke backend pake mutation addForumComment
   * - Reset input setelah berhasil
   */
  const handleKirimKomentar = async () => {
    if (!komentar.trim()) return;

    try {
      await addComment({
        postId: post._id,
        userId: "dummy_user_id" as any, // TODO: ganti pake auth session
        content: komentar.trim(),
      });
      setKomentar(""); // reset input setelah berhasil kirim
    } catch (error) {
      console.log("Gagal kirim komentar:", error);
    }
  };

  /**
   * Format timestamp jadi waktu relatif yang enak dibaca
   * Contoh: "5 menit lalu", "2 jam lalu", "3 hari lalu"
   * Kalo udah lebih dari 7 hari, tampilin tanggal lengkap
   */
  const formatWaktu = (timestamp: number) => {
    const date = new Date(timestamp);
    const sekarang = new Date();
    const selisih = sekarang.getTime() - date.getTime();
    const menit = Math.floor(selisih / (1000 * 60));
    const jam = Math.floor(selisih / (1000 * 60 * 60));
    const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));

    if (menit < 1) return "Baru saja";
    if (menit < 60) return `${menit} menit lalu`;
    if (jam < 24) return `${jam} jam lalu`;
    if (hari < 7) return `${hari} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Mapping kategori forum ke label yang lebih readable + emoji
   * Biar user tau konteks diskusinya tentang apa
   */
  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      review_buku: "📖 Review Buku",
      rekomendasi_buku: "💡 Rekomendasi",
      tanya_buku: "❓ Tanya Buku",
      diskusi_pengetahuan: "🧠 Diskusi",
      buku_skripsi: "🎓 Buku Skripsi",
    };
    return map[cat] || cat;
  };

  return (
    <View style={styles.container}>

      {/* 
        Pake FlatList dengan ListHeaderComponent biar post + komentar 
        bisa di-scroll bareng dalam satu list (performa lebih bagus) 
      */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        // bagian atas: isi post lengkap
        ListHeaderComponent={
          <View style={styles.postSection}>

            {/* label kategori post */}
            <Text style={styles.category}>
              {getCategoryLabel(post.category)}
            </Text>

            {/* judul post */}
            <Text style={styles.postTitle}>
              {post.title}
            </Text>

            {/* info author + waktu posting */}
            <Text style={styles.postAuthor}>
              Oleh {authorName} · {formatWaktu(post.createdAt)}
            </Text>

            {/* konten / isi post */}
            <Text style={styles.postContent}>
              {post.content}
            </Text>

            {/* statistik like dan komentar */}
            <View style={styles.statsRow}>
              <Text style={styles.statText}>❤️ {post.likeCount}</Text>
              <Text style={styles.statText}>💬 {post.commentCount}</Text>
            </View>

            {/* garis pemisah antara post dan komentar */}
            <View style={styles.divider} />

            <Text style={styles.komentarHeader}>
              Komentar ({comments.length})
            </Text>

          </View>
        }
        // render tiap komentar
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{item.userName}</Text>
            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentTime}>{formatWaktu(item.createdAt)}</Text>
          </View>
        )}
        // tampilan kalo belum ada komentar sama sekali
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Belum ada komentar. Jadi yang pertama komentar yuk!
            </Text>
          </View>
        }
      />

      {/* 
        Input komentar di bagian paling bawah layar
        Posisinya fixed di bawah, nd ikut scroll 
      */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Tulis komentar..."
          value={komentar}
          onChangeText={setKomentar}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleKirimKomentar}>
          <Text style={styles.sendText}>Kirim</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({

  // container utama, full screen
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  // buat loading state di tengah layar
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // section isi post (background putih, padding cukup buat readability)
  postSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 10,
  },

  category: {
    fontSize: 13,
    color: "#2F80ED",
    fontWeight: "600",
    marginBottom: 8,
  },

  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  postAuthor: {
    fontSize: 13,
    color: "#999",
    marginBottom: 15,
  },

  postContent: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 15,
  },

  statText: {
    fontSize: 14,
    color: "#666",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },

  komentarHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  // card komentar individual
  commentCard: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 10,
  },

  commentAuthor: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },

  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },

  commentTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },

  empty: {
    padding: 30,
    alignItems: "center",
  },

  emptyText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },

  // input komentar di bawah (fixed position)
  inputRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    maxHeight: 100, // batasin tinggi biar ga kegedean
    marginRight: 8,
  },

  sendButton: {
    backgroundColor: "#2F80ED",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  sendText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },

});
