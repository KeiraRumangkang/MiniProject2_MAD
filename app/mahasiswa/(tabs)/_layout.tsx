/**
 * ========================================
 * LAYOUT TABS MAHASISWA
 * ========================================
 * Definisi navigasi bottom tab buat role Mahasiswa.
 * 
 * Ada 6 tab:
 * 1. Home     - dashboard utama (buku populer, event, dll)
 * 2. Search   - cari buku
 * 3. Pinjaman - status peminjaman buku (aktif + riwayat)
 * 4. Forum    - diskusi sesama mahasiswa
 * 5. Leaderboard - ranking pembaca aktif
 * 6. Profile  - profil + statistik
 * 
 * Masing-masing tab nge-link ke file di folder (tabs)/ 
 * sesuai nama yang didaftarin di Tabs.Screen
 * ========================================
 */

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* tab pinjaman = liat status peminjaman buku */}
      <Tabs.Screen
        name="pinjaman"
        options={{
          title: "Pinjaman",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}