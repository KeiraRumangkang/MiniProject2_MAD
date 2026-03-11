import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";

export default function Home() {
  const data = useQuery(api.dashboard.getMahasiswaHomeStats);

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { popularBooks, topRatedBooks, events, leaderboard } = data;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Hello Keira</Text>

      {/* Popular Books */}
      <Text style={styles.sectionTitle}>Buku Terpopuler</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={popularBooks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.bookCard}>
            <View style={styles.bookCover}>
              <Ionicons name="book-outline" size={40} color="#2F80ED" />
            </View>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.averageRating}</Text>
            </View>
          </View>
        )}
      />

      {/* Top Rated Books */}
      <Text style={styles.sectionTitle}>Buku Rating Tertinggi</Text>
      {topRatedBooks.map((book) => (
        <View key={book._id} style={styles.listCard}>
          <Ionicons name="ribbon-outline" size={20} color="#2F80ED" style={{ marginRight: 10 }} />
          <Text style={styles.listText}>{book.title}</Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.listText}>{book.averageRating}</Text>
        </View>
      ))}

      {/* Top Readers */}
      <Text style={styles.sectionTitle}>Pembaca Terbaik</Text>
      {leaderboard.map((user, index) => (
        <View key={user._id} style={styles.listCard}>
          <Ionicons name="person-circle-outline" size={20} color="#10B981" style={{ marginRight: 10 }} />
          <Text style={styles.listText}>
            {index + 1}. {user.name}
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.listText}>{user.points} pts</Text>
        </View>
      ))}

      {/* Upcoming Events */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      {events.map((event) => (
        <View key={event._id} style={styles.eventCard}>
          <View style={styles.eventRow}>
            <Ionicons name="calendar-outline" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
            <Text style={styles.eventTitle}>{event.title}</Text>
          </View>
          <View style={styles.eventRow}>
            <Ionicons name="location-outline" size={18} color="#757575" style={{ marginRight: 6 }} />
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", padding: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  greeting: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },

  // Book card
  bookCard: {
    width: 150,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  bookCover: {
    height: 120,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#EEF3FF",
  },
  bookTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 2 },
  bookAuthor: { fontSize: 12, color: "#666", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: "500", color: "#333" },

  // List card for top rated & readers
  listCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  listText: { fontSize: 14, fontWeight: "500", color: "#111" },

  // Event card
  eventCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  eventRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  eventTitle: { fontWeight: "bold", fontSize: 14, color: "#333" },
  eventLocation: { fontSize: 13, color: "#555" },
});