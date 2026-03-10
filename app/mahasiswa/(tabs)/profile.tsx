import { useQuery } from "convex/react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";

export default function Profile() {

  // sementara pakai user pertama dari database
  const users = useQuery(api.users.getMahasiswaList);

  if (!users) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const user = users[0];

  return (
    <ScrollView style={styles.container}>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.name}>
          {user.name}
        </Text>

        <Text style={styles.faculty}>
          {user.faculty}
        </Text>

        <Text style={styles.points}>
          ⭐ {user.points} Points
        </Text>

      </View>

      {/* BADGES */}
      <Text style={styles.sectionTitle}>
        🎖️ Badges
      </Text>

      <View style={styles.badgeContainer}>

        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>📚</Text>
          <Text style={styles.badgeText}>
            Book Explorer
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🔥</Text>
          <Text style={styles.badgeText}>
            Active Reader
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>💬</Text>
          <Text style={styles.badgeText}>
            Forum Contributor
          </Text>
        </View>

      </View>

      {/* STATS */}
      <Text style={styles.sectionTitle}>
        📊 Activity
      </Text>

      <View style={styles.statsCard}>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>
            Books Borrowed
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>
            Reviews
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {user.points}
          </Text>
          <Text style={styles.statLabel}>
            Points
          </Text>
        </View>

      </View>

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

  profileCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarText: {
    fontSize: 35,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  faculty: {
    color: "#666",
    marginTop: 4,
  },

  points: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#2F80ED",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  badgeContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },

  badge: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  badgeIcon: {
    fontSize: 24,
  },

  badgeText: {
    fontSize: 11,
    marginTop: 5,
  },

  statsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  stat: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#555",
  },

});