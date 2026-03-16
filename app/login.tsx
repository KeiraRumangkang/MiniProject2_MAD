import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../convex/_generated/api";
import { getHomePathByRole, useAuthSession } from "@/lib/auth-session";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, sessions, setActiveRole } = useAuthSession();

  // Kita gunakan query untuk mencari user berdasarkan input username
  // Note: Dalam aplikasi produksi, sebaiknya gunakan Action/Mutation untuk login 
  // agar lebih aman, tapi untuk tahap ini kita gunakan data dari query.
  const userData = useQuery(api.users.getUserByUsername, { username: username.toLowerCase().trim() });

  const handleLogin = async () => {
    if (!username || !password || !role) {
      return Alert.alert("Error", "Mohon isi semua field dan pilih role.");
    }

    setLoading(true);

    // Simulasi loading sebentar agar UX lebih bagus
    setTimeout(async () => {
      if (!userData) {
        setLoading(false);
        return Alert.alert("Gagal", "Username tidak ditemukan.");
      }

      // 1. Validasi Role
      if (userData.role !== role) {
        setLoading(false);
        return Alert.alert("Gagal", `Akun ini bukan terdaftar sebagai ${role}.`);
      }

      // 2. Validasi Password (MEMERIKSA DATA TERBARU DI DB)
      if (userData.password !== password) {
        setLoading(false);
        return Alert.alert("Gagal", "Kata sandi salah.");
      }

      // 3. Validasi Akun Aktif
      if (userData.isActive === false) {
        setLoading(false);
        return Alert.alert("Gagal", "Akun Anda dinonaktifkan oleh admin.");
      }

      await signIn({
        userId: userData._id,
        username: userData.username,
        role: userData.role,
        name: userData.name,
      });

      setLoading(false);
      router.replace(getHomePathByRole(userData.role));
    }, 800);
  };

  const quickLoginRoles = (["mahasiswa", "staff", "kepala"] as const).filter((r) => !!sessions[r]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.roleTitle}>Pilih Role Login Sebagai:</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "mahasiswa" && styles.roleActiveMahasiswa]}
          onPress={() => setRole("mahasiswa")}
        >
          <Text style={styles.roleText}>Mahasiswa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "staff" && styles.roleActiveStaff]}
          onPress={() => setRole("staff")}
        >
          <Text style={styles.roleText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "kepala" && styles.roleActiveKepala]}
          onPress={() => setRole("kepala")}
        >
          <Text style={styles.roleText}>Kepala</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.loginButton, loading && { backgroundColor: '#A5C9F7' }]} 
        onPress={() => void handleLogin()}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginText}>Masuk Ke Sistem</Text>}
      </TouchableOpacity>

      {quickLoginRoles.length > 0 && (
        <View style={styles.quickContainer}>
          <Text style={styles.quickTitle}>Session tersimpan:</Text>
          <View style={styles.quickButtons}>
            {quickLoginRoles.map((savedRole) => (
              <TouchableOpacity
                key={savedRole}
                style={styles.quickButton}
                onPress={async () => {
                  await setActiveRole(savedRole);
                  router.replace(getHomePathByRole(savedRole));
                }}
              >
                <Text style={styles.quickText}>{savedRole.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", justifyContent: "center", padding: 25 },
  title: { fontSize: 32, fontWeight: "900", color: "#2F80ED", textAlign: "center", marginBottom: 40 },
  input: { backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#E2E8F0", fontSize: 16 },
  roleTitle: { marginTop: 10, marginBottom: 15, fontWeight: "700", color: "#475569", textAlign: 'center' },
  roleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  roleButton: { backgroundColor: "#CBD5E1", paddingVertical: 12, borderRadius: 10, width: "31%", alignItems: "center" },
  roleActiveMahasiswa: { backgroundColor: "#8B5CF6" },
  roleActiveStaff: { backgroundColor: "#10B981" },
  roleActiveKepala: { backgroundColor: "#F59E0B" },
  roleText: { color: "white", fontWeight: "bold", fontSize: 12 },
  loginButton: { backgroundColor: "#2F80ED", padding: 18, borderRadius: 12, alignItems: "center", elevation: 4, shadowColor: '#2F80ED', shadowOpacity: 0.3, shadowRadius: 8 },
  loginText: { color: "white", fontSize: 16, fontWeight: "bold" },
  quickContainer: { marginTop: 18 },
  quickTitle: { textAlign: "center", color: "#64748B", fontWeight: "600", marginBottom: 8 },
  quickButtons: { flexDirection: "row", justifyContent: "center", gap: 8 },
  quickButton: { backgroundColor: "#E2E8F0", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  quickText: { fontSize: 11, fontWeight: "800", color: "#334155" },
});