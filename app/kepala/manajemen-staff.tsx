import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export default function ManajemenStaff() {
  const router = useRouter();
  const allStaff = useQuery(api.dashboard.getAllStaff);
  const addStaffMutation = useMutation(api.dashboard.addStaff);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStaff = async () => {
    const trimmedName = newName.trim();
    const trimmedUser = newUsername.toLowerCase().trim();

    if (!trimmedName || !trimmedUser || !newPassword) {
      return Alert.alert("Error", "Mohon isi semua data staff.");
    }

    setLoading(true);
    try {
      await addStaffMutation({
        name: trimmedName,
        username: trimmedUser,
        password: newPassword,
        faculty: "Staf Perpustakaan"
      });
      
      Alert.alert("Berhasil", `Staff ${trimmedName} telah berhasil didaftarkan.`);
      
      // Tutup modal dan reset form
      setModalVisible(false);
      setNewName(''); 
      setNewUsername(''); 
      setNewPassword('');
    } catch (error: any) {
      // Menangkap error dari Convex (seperti 'Username sudah terdaftar')
      Alert.alert("Gagal", error.message || "Gagal menambah staff.");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffDetail = (item: any) => {
    Alert.alert(
      "Laporan Kinerja Staff",
      `Nama: ${item.name}\nUsername: @${item.username}\nStatus: ${item.isActive ? 'Aktif' : 'Nonaktif'}\n\nLaporan: Staff ini aktif mengelola sirkulasi buku.`
    );
  };

  if (allStaff === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Manajemen Staff</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allStaff}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Total Staff: {allStaff.length}</Text>
            <Text style={styles.infoDesc}>Klik staff untuk melihat detail kinerja.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=EAF3FF&color=2F80ED&bold=true`;
          
          return (
            <TouchableOpacity style={styles.staffCard} onPress={() => handleStaffDetail(item)}>
              <Image source={{ uri: avatarUrl }} style={styles.staffImage} />
              <View style={styles.staffMainInfo}>
                <Text style={styles.staffNameText}>{item.name}</Text>
                <Text style={styles.staffSubText}>@{item.username}</Text>
              </View>
              <View style={styles.statusSection}>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#4CAF50' : '#FF3B30' }]} />
                <Text style={[styles.statusLabel, { color: item.isActive ? '#4CAF50' : '#FF3B30' }]}>
                  {item.isActive ? 'Aktif' : 'Nonaktif'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Staff Baru</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ padding: 20 }}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Nama Staff" />

              <Text style={styles.label}>Username</Text>
              <TextInput style={styles.input} value={newUsername} onChangeText={setNewUsername} placeholder="username" autoCapitalize="none" />

              <Text style={styles.label}>Kata Sandi</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Minimal 6 Karakter" secureTextEntry />

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddStaff} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Daftarkan Staff</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  iconBtn: { padding: 4 },
  addBtn: { backgroundColor: '#2F80ED', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  infoBox: { marginBottom: 24, backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#2F80ED' },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  infoDesc: { fontSize: 13, color: '#60A5FA' },
  staffCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
  staffImage: { width: 50, height: 50, borderRadius: 15, marginRight: 14 },
  staffMainInfo: { flex: 1 },
  staffNameText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  staffSubText: { fontSize: 12, color: '#94A3B8' },
  statusSection: { alignItems: 'flex-end' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  statusLabel: { fontSize: 11, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, marginBottom: 20 },
  saveBtn: { backgroundColor: '#2F80ED', padding: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800' }
});