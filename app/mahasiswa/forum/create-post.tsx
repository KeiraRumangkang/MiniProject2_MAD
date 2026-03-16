import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";
import { useAuthSession } from "@/lib/auth-session";

export default function CreatePost() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("review_buku");
  const { activeSession } = useAuthSession();

  const createPost = useMutation(api.forum.createForumPost);

  const handlePost = async () => {

    if (!title || !content) {
      alert("Judul dan isi harus diisi");
      return;
    }

    if (!activeSession || activeSession.role !== "mahasiswa") {
      alert("Session mahasiswa tidak ditemukan. Silakan login ulang.");
      router.replace("/login");
      return;
    }

    try {

      await createPost({
        userId: activeSession.userId as any,
        title: title,
        content: content,
        category: category,
      });

      alert("Post berhasil dibuat!");

      router.back();

    } catch {

      alert("Gagal membuat post");

    }

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Buat Post Forum</Text>

      <Text style={styles.label}>Judul</Text>

      <TextInput
        style={styles.input}
        placeholder="Masukkan judul post"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Kategori</Text>

      <View style={styles.categoryContainer}>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setCategory("review_buku")}
        >
          <Text>Review Buku</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setCategory("rekomendasi_buku")}
        >
          <Text>Rekomendasi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setCategory("tanya_buku")}
        >
          <Text>Tanya Buku</Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.label}>Isi Post</Text>

      <TextInput
        style={styles.textArea}
        placeholder="Tulis isi diskusi..."
        multiline
        numberOfLines={5}
        value={content}
        onChangeText={setContent}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handlePost}
      >
        <Text style={styles.buttonText}>Kirim Post</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  textArea: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 120,
    textAlignVertical: "top",
  },

  categoryContainer: {
    flexDirection: "row",
    gap: 10,
  },

  categoryButton: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
  },

  button: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

});