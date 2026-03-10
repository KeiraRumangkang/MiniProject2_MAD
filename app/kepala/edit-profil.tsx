import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export default function EditProfil() {
  const router = useRouter();
  const user = useQuery(api.dashboard.getCurrentKepalaProfile);
  const updateProfile = useMutation(api.dashboard.updateProfile);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  // Efek untuk mengisi data awal saat user dimuat
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Nama tidak boleh kosong");
    if (!user?._id) return Alert.alert("Error", "ID Pengguna tidak ditemukan.");
    
    setLoading(true);
    try {
      await updateProfile({ 
        userId: user._id, 
        name: name.trim(), 
        bio: bio.trim() 
      });
      Alert.alert("Berhasil", "Profil Anda telah diperbarui.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan ke database.");
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#2F80ED" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Masukkan nama" 
        />

        <Text style={styles.label}>Bio / Jabatan</Text>
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          value={bio} 
          onChangeText={setBio} 
          placeholder="Tulis bio singkat" 
          multiline 
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Simpan Perubahan</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 16, color: '#1A1A1A' },
  btn: { backgroundColor: '#2F80ED', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});