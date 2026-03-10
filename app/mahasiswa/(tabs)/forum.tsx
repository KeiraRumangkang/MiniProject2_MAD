import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";

export default function Forum() {

  const posts = useQuery(api.forum.getForumPosts);

  const likePost = useMutation(api.forum.likePost);

  const handleLike = async (postId: string) => {

    try {

      await likePost({
        postId: postId,
        userId: "dummy_user_id",
      });

    } catch (error) {

      console.log("Sudah like");

    }

  };

  if (!posts) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Forum Diskusi</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/mahasiswa/forum/create-post")}
      >
        <Text style={styles.createText}>+ Buat Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.postTitle}>
              {item.title}
            </Text>

            <Text style={styles.category}>
              Kategori: {item.category}
            </Text>

            <Text style={styles.content}>
              {item.content}
            </Text>

            <View style={styles.row}>

              <Text>
                💬 {item.commentCount}
              </Text>

              <TouchableOpacity
                onPress={() => handleLike(item._id)}
              >
                <Text>
                  ❤️ {item.likeCount}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        )}
      />

    </View>
  );
}

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
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
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