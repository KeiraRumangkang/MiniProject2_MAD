import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export default function KeamananHalaman() {
  const router = useRouter();
  const user = useQuery(api.dashboard.getCurrentKepalaProfile);
  const updatePassword = useMutation(api.dashboard.updatePassword);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleUpdate = async () => {
    // 1. Validasi Input Kosong
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "Semua kolom harus diisi.");
    }

    // 2. Validasi Password Lama (Cek ke data user dari DB)
    if (oldPassword !== user?.password) {
      return Alert.alert("Error", "Kata sandi lama salah.");
    }

    // 3. Validasi Password Baru & Konfirmasi
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Konfirmasi kata sandi tidak cocok.");
    }

    // 4. Minimal Karakter
    if (newPassword.length < 6) {
      return Alert.alert("Error", "Kata sandi baru minimal 6 karakter.");
    }

    setLoading(true);
    try {
      await updatePassword({ 
        userId: user!._id, 
        newPassword: newPassword 
      });
      
      Alert.alert("Berhasil", "Kata sandi Anda telah diperbarui. Silakan gunakan kata sandi baru untuk login berikutnya.");
      router.back();
    } catch {
      Alert.alert("Gagal", "Terjadi kesalahan sistem. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <ActivityIndicator style={{ flex: 1 }} color="#2F80ED" />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keamanan Akun</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={40} color="#2F80ED" />
          <Text style={styles.infoText}>
            Pastikan kata sandi Anda kuat dan sulit ditebak oleh orang lain.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Kata Sandi Lama</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={oldPassword} 
              onChangeText={setOldPassword} 
              placeholder="Masukkan kata sandi saat ini"
              secureTextEntry={secureText}
            />
          </View>

          <Text style={styles.label}>Kata Sandi Baru</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={newPassword} 
              onChangeText={setNewPassword} 
              placeholder="Minimal 6 karakter"
              secureTextEntry={secureText}
            />
          </View>

          <Text style={styles.label}>Konfirmasi Kata Sandi Baru</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              placeholder="Ulangi kata sandi baru"
              secureTextEntry={secureText}
            />
          </View>

          <TouchableOpacity 
            style={styles.toggleBtn} 
            onPress={() => setSecureText(!secureText)}
          >
            <Ionicons name={secureText ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
            <Text style={styles.toggleText}>{secureText ? "Lihat Sandi" : "Sembunyikan Sandi"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveBtn, loading && { backgroundColor: '#BDBDBD' }]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Perbarui Kata Sandi</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 20 },
  infoBox: { 
    backgroundColor: '#EFF6FF', 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  infoText: { 
    textAlign: 'center', 
    color: '#1E40AF', 
    fontSize: 14, 
    marginTop: 10, 
    lineHeight: 20,
    fontWeight: '500' 
  },
  form: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginLeft: 4 },
  inputContainer: { marginBottom: 20 },
  input: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15,
    color: '#1E293B' 
  },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, marginLeft: 4 },
  toggleText: { marginLeft: 8, fontSize: 13, color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2F80ED', padding: 16, borderRadius: 14, alignItems: 'center', shadowColor: '#2F80ED', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});