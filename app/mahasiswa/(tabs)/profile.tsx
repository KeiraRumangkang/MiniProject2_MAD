import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../../../convex/_generated/api';
import { useAuthSession } from '@/lib/auth-session';

export default function Profile() {
  const { activeSession, signOut } = useAuthSession();
  const router = useRouter();
  const userId = activeSession?.role === 'mahasiswa' ? (activeSession.userId as any) : undefined;

  const profileData = useQuery(
    api.users.getMahasiswaProfile,
    userId ? { userId } : 'skip'
  );

  if (profileData === undefined) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyTitle}>Profil tidak ditemukan</Text>
        <Text style={styles.emptyDescription}>
          Data mahasiswa belum tersedia untuk ditampilkan.
        </Text>
      </View>
    );
  }

  const { user, totalBorrowed, totalReviews, badges } = profileData;
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.faculty}>{user.faculty}</Text>
        <View style={styles.pointsPill}>
          <Ionicons name="star" size={16} color="#1D4ED8" />
          <Text style={styles.pointsText}>{user.points} poin</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistik</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalBorrowed}</Text>
            <Text style={styles.statLabel}>Buku dipinjam</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalReviews}</Text>
            <Text style={styles.statLabel}>Review</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>Total poin</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badge</Text>
        <View style={styles.badgesWrap}>
          {badges.length > 0 ? (
            badges.map((badge) => (
              <View key={badge._id} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{badge.icon || '🏅'}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyBadgeCard}>
              <Text style={styles.emptyBadgeText}>
                Belum ada badge. Mulai pinjam buku untuk membuka pencapaian.
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert('Logout', 'Keluar dari akun mahasiswa?', [
            { text: 'Batal', style: 'cancel' },
            {
              text: 'Keluar',
              style: 'destructive',
              onPress: async () => {
                await signOut('mahasiswa');
                router.replace('/login');
              },
            },
          ])
        }
      >
        <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#475569',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  faculty: {
    marginTop: 6,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  pointsPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyBadgeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  emptyBadgeText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 22,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});