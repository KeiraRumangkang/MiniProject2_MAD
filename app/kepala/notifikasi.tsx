import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function NotifikasiKepala() {
  const router = useRouter();
  const notifData = useQuery(api.dashboard.getKepalaNotifications);

  if (notifData === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi Sistem</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {notifData.items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={60} color="#4CAF50" />
            <Text style={styles.emptyTitle}>Semua Aman!</Text>
            <Text style={styles.emptyDesc}>Tidak ada peringatan sistem saat ini.</Text>
          </View>
        ) : (
          notifData.items.map((notif) => (
            <View key={notif._id} style={styles.notifCard}>
              <View style={[styles.iconBox, { backgroundColor: notif.type === 'error' ? '#FFEBEE' : '#FFF8E1' }]}>
                <Ionicons 
                  name={notif.type === 'error' ? "alert-circle" : "warning"} 
                  size={24} 
                  color={notif.type === 'error' ? "#E53935" : "#FFB300"} 
                />
              </View>
              <View style={styles.notifTextWrap}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifMessage}>{notif.message}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  listContainer: { padding: 20 },
  
  notifCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  notifTextWrap: { flex: 1, justifyContent: 'center' },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#333333', marginBottom: 4 },
  notifMessage: { fontSize: 13, color: '#757575', lineHeight: 18 },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333333', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#757575', marginTop: 8 }
});