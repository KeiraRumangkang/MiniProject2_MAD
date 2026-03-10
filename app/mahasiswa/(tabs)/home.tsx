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

      <Text style={styles.greeting}>
        Hello Mahasiswa 👋
      </Text>

      {/* Popular Books */}
      <Text style={styles.sectionTitle}>
        Buku Terpopuler
      </Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={popularBooks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (

          <View style={styles.bookCard}>

            <View style={styles.bookCover}>
              <Text style={styles.coverText}>📚</Text>
            </View>

            <Text style={styles.bookTitle}>
              {item.title}
            </Text>

            <Text style={styles.bookAuthor}>
              {item.author}
            </Text>

            <Text style={styles.rating}>
              ⭐ {item.averageRating}
            </Text>

          </View>

        )}
      />

      {/* Top Rated */}
      <Text style={styles.sectionTitle}>
        Buku Rating Tertinggi
      </Text>

      {topRatedBooks.map((book) => (

        <View key={book._id} style={styles.listCard}>

          <Text style={styles.bookTitle}>
            {book.title}
          </Text>

          <Text>
            ⭐ {book.averageRating}
          </Text>

        </View>

      ))}

      <Text style={styles.sectionTitle}>
        Pembaca Terbaik
      </Text>

      {leaderboard.map((user, index) => (

        <View key={user._id} style={styles.listCard}>

          <Text>
            {index + 1}. {user.name}
          </Text>

          <Text>
            {user.points} pts
          </Text>

        </View>

      ))}

      {/* Events */}
      <Text style={styles.sectionTitle}>
        📅 Upcoming Events
      </Text>

      {events.map((event) => (

        <View key={event._id} style={styles.eventCard}>

          <Text style={styles.eventTitle}>
            {event.title}
          </Text>

          <Text>
            {event.location}
          </Text>

        </View>

      ))}

    </ScrollView>
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

  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  bookCard: {
    width: 150,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 14,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  bookCover: {
    height: 140,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  coverText: {
    fontSize: 40,
  },

  bookTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },

  bookAuthor: {
    fontSize: 12,
    color: "#666",
  },

  rating: {
    marginTop: 5,
    fontSize: 12,
  },

  listCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  eventCard: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  eventTitle: {
    fontWeight: "bold",
  },

});