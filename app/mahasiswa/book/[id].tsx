import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../../convex/_generated/api";

export default function BookDetail() {

  const { id } = useLocalSearchParams();

  const data = useQuery(
    api.books.getBookDetail,
    id ? { bookId: id } : "skip"
  );

  const borrowBook = useMutation(api.borrowings.borrowBook);

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { book, reviews } = data;

  const handleBorrow = () => {

  Alert.alert(
    "Konfirmasi Peminjaman",
    "Apakah Anda ingin meminjam buku ini?\n\nKetentuan:\n1. Lama peminjaman 7 hari\n2. Keterlambatan dikenakan denda\n3. Buku harus dijaga dengan baik",
    [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Pinjam",
        onPress: async () => {

          try {

            await borrowBook({
              userId: "dummy_user_id",
              bookId: book._id,
            });

            Alert.alert("Berhasil", "Permintaan peminjaman dikirim ke staff");

          } catch {

            Alert.alert("Error", "Gagal meminjam buku");

          }

        },
      },
    ]
  );

};

  

  return (

    <View style={styles.container}>

      {/* COVER */}
      <View style={styles.cover}>
        <Text style={styles.coverIcon}>📘</Text>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>
        {book.title}
      </Text>

      <Text style={styles.author}>
        {book.author}
      </Text>

      <Text style={styles.rating}>
        ⭐ {book.averageRating}
      </Text>

      {/* STATUS */}
      <Text style={styles.status}>
        Status: {book.status}
      </Text>

      {/* SYNOPSIS */}
      <Text style={styles.section}>
        Synopsis
      </Text>

      <Text style={styles.synopsis}>
        {book.synopsis}
      </Text>

      {/* BORROW BUTTON */}
      <TouchableOpacity
        style={styles.borrowButton}
        onPress={handleBorrow}
      >
        <Text style={styles.borrowText}>
          Pinjam Buku
        </Text>
      </TouchableOpacity>

      {/* REVIEWS */}
      <Text style={styles.section}>
        Reviews
      </Text>

      {reviews.map((review) => (

        <View key={review._id} style={styles.reviewCard}>

          <Text>
            ⭐ {review.rating}
          </Text>

          <Text>
            {review.reviewText}
          </Text>

        </View>

      ))}

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cover: {
    height: 200,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  coverIcon: {
    fontSize: 60,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  author: {
    color: "#555",
    marginBottom: 5,
  },

  rating: {
    marginBottom: 10,
  },

  status: {
    marginBottom: 20,
    fontWeight: "bold",
  },

  section: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },

  synopsis: {
    color: "#555",
  },

  borrowButton: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  borrowText: {
    color: "white",
    fontWeight: "bold",
  },

  reviewCard: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

});