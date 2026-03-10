import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function KepalaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Kita matikan header bawaan, karena kita bikin custom di halaman
        tabBarActiveTintColor: '#2F80ED', // Warna biru saat aktif
        tabBarInactiveTintColor: '#9E9E9E', // Warna abu-abu saat tidak aktif
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
        }}
      />
      
      {/* Halaman di bawah ini belum kita buat file-nya, tapi kita siapkan slot-nya */}
      <Tabs.Screen
        name="laporan"
        options={{
          title: 'LAPORAN',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analisis"
        options={{
          title: 'ANALISIS',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'PROFIL',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />

      {/* 🔴 HALAMAN SUB (DISEMBUNYIKAN DARI NAVBAR BAWAH) */}
      <Tabs.Screen
        name="notifikasi"
        options={{
          href: null, // Mencegah muncul di tab bawah
        }}
      />
      <Tabs.Screen
        name="koleksi-buku"
        options={{
          href: null, // Mencegah muncul di tab bawah
        }}
      />
      <Tabs.Screen
        name="manajemen-staff"
        options={{
          href: null, // Mencegah muncul di tab bawah
        }}
      />
      <Tabs.Screen
        name="edit-profil"
        options={{
          href: null, // Mencegah muncul di tab bawah
        }}
      />
      <Tabs.Screen
        name="keamanan"
        options={{
          href: null, // Mencegah muncul di tab bawah
        }}
      />
    </Tabs>
  );
}