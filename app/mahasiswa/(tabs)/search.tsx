import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";

export default function Search() {

  const [search, setSearch] = useState("");

  const books = useQuery(
    api.books.searchBooks,
    search ? { search } : "skip"
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Cari Buku
      </Text>

      <TextInput
        placeholder="Cari judul atau author..."
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      {search.length === 0 && (
        <Text style={styles.info}>
          Ketik judul atau nama author
        </Text>
      )}

      {search.length > 0 && !books && (
        <Text style={styles.info}>
          Loading...
        </Text>
      )}

      {books && books.length === 0 && (
        <Text style={styles.info}>
          Buku tidak ditemukan
        </Text>
      )}

      {books && books.length > 0 && (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (

            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push(`/mahasiswa/book/${item._id}`)
              }
            >

              <View style={styles.cover}>
                <Text>📘</Text>
              </View>

              <View style={styles.bookInfo}>

                <Text style={styles.bookTitle}>
                  {item.title}
                </Text>

                <Text style={styles.author}>
                  {item.author}
                </Text>

                <Text style={styles.status}>
                  Status: {item.status}
                </Text>

              </View>

            </TouchableOpacity>

          )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  searchInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  cover: {
    width: 50,
    height: 70,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  bookInfo: {
    flex: 1,
  },

  bookTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },

  author: {
    color: "#555",
    marginTop: 2,
  },

  status: {
    marginTop: 5,
    fontSize: 12,
  },

  info: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },

});