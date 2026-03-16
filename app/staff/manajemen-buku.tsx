import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  StaffErrorState,
  StaffHeader,
  StaffLoadingState,
  cardShadow,
  softShadow,
  strongShadow,
} from './_shared';

export default function ManajemenBuku() {
  const books = useQuery(api.books.getAllBooks);
  const categories = useQuery(api.books.getBookCategories);
  const addBook = useMutation(api.books.addBook);
  const updateBook = useMutation(api.books.updateBook);
  const deleteBook = useMutation(api.books.deleteBook);

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'limited' | 'unavailable'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'mostBorrowed' | 'stockAsc'>('newest');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');

  if (books === undefined || categories === undefined) {
    return <StaffLoadingState message="Memuat data buku..." />;
  }

  if (!Array.isArray(books) || !Array.isArray(categories)) {
    return <StaffErrorState message="Data buku gagal dimuat. Coba refresh halaman." />;
  }

  const filteredBooks = books
    .filter((book) => {
      const keyword = search.toLowerCase();
      const matchesKeyword =
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword);
      const matchesCategory = selectedCategory === 'all' || book.categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
      return matchesKeyword && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'mostBorrowed') return b.totalBorrowed - a.totalBorrowed;
      if (sortBy === 'stockAsc') return a.stockAvailable - b.stockAvailable;
      return b.createdAt - a.createdAt;
    });

  const resetForm = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormSynopsis('');
    setFormYear('');
    setFormStock('');
    setFormCategoryId('');
    setEditingBook(null);
  };

  const openAddModal = () => {
    resetForm();
    if (categories.length > 0) {
      setFormCategoryId(categories[0]._id);
    }
    setModalVisible(true);
  };

  const openEditModal = (book: any) => {
    setEditingBook(book);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormSynopsis(book.synopsis);
    setFormYear(book.year.toString());
    setFormStock(book.stockTotal.toString());
    setFormCategoryId(book.categoryId);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formTitle || !formAuthor || !formSynopsis || !formYear || !formStock || !formCategoryId) {
      return Alert.alert('Error', 'Mohon isi semua field');
    }

    const parsedYear = parseInt(formYear, 10);
    const parsedStock = parseInt(formStock, 10);

    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedStock) || parsedStock < 0) {
      return Alert.alert('Error', 'Tahun dan stok harus berupa angka valid.');
    }

    try {
      setIsSaving(true);
      if (editingBook) {
        await updateBook({
          bookId: editingBook._id,
          title: formTitle,
          author: formAuthor,
          synopsis: formSynopsis,
          categoryId: formCategoryId as any,
          year: parsedYear,
          stockTotal: parsedStock,
        });
        Alert.alert('Berhasil', 'Buku berhasil diperbarui');
      } else {
        await addBook({
          title: formTitle,
          author: formAuthor,
          synopsis: formSynopsis,
          categoryId: formCategoryId as any,
          year: parsedYear,
          stockTotal: parsedStock,
        });
        Alert.alert('Berhasil', 'Buku berhasil ditambahkan');
      }
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menyimpan buku');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (bookId: any) => {
    Alert.alert(
      'Hapus Buku',
      'Apakah Anda yakin ingin menghapus buku ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(bookId);
              await deleteBook({ bookId });
              Alert.alert('Berhasil', 'Buku berhasil dihapus');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Gagal menghapus buku');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'limited': return '#F59E0B';
      case 'unavailable': return '#EF4444';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Tersedia';
      case 'limited': return 'Terbatas';
      case 'unavailable': return 'Habis';
      default: return status;
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c._id === catId);
    return cat?.name || 'Lainnya';
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <StaffHeader
        title="Manajemen Buku"
        subtitle={`${books.length} buku dalam koleksi`}
      />

      <View style={styles.bodySection}>
        {/* SEARCH + ADD */}
        <View style={styles.actionRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9E9E9E" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Cari judul atau penulis..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#BDBDBD"
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>Semua Kategori</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.filterChip, selectedCategory === cat._id && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat._id)}
            >
              <Text style={[styles.filterChipText, selectedCategory === cat._id && styles.filterChipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'Semua Status' },
              { key: 'available', label: 'Tersedia' },
              { key: 'limited', label: 'Terbatas' },
              { key: 'unavailable', label: 'Habis' },
            ].map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[styles.sortChip, selectedStatus === status.key && styles.sortChipActive]}
                onPress={() => setSelectedStatus(status.key as any)}
              >
                <Text style={[styles.sortChipText, selectedStatus === status.key && styles.sortChipTextActive]}>{status.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'newest', label: 'Terbaru' },
              { key: 'title', label: 'A-Z' },
              { key: 'mostBorrowed', label: 'Terpopuler' },
              { key: 'stockAsc', label: 'Stok Minim' },
            ].map((sortOption) => (
              <TouchableOpacity
                key={sortOption.key}
                style={[styles.sortChip, sortBy === sortOption.key && styles.sortChipActive]}
                onPress={() => setSortBy(sortOption.key as any)}
              >
                <Text style={[styles.sortChipText, sortBy === sortOption.key && styles.sortChipTextActive]}>{sortOption.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BOOK LIST */}
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              <View style={styles.bookCover}>
                <Ionicons name="book" size={28} color="#10B981" />
              </View>

              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                <View style={styles.bookMeta}>
                  <Text style={styles.metaText}>{getCategoryName(item.categoryId)}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{item.year}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>Stok: {item.stockAvailable}/{item.stockTotal}</Text>
                </View>
              </View>

              <View style={styles.bookActions}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)} disabled={deletingId === item._id}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>Tidak ada buku ditemukan</Text>
            </View>
          }
        />
      </View>

      {/* ADD/EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}
                </Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Judul Buku</Text>
              <TextInput style={styles.formInput} value={formTitle} onChangeText={setFormTitle} placeholder="Masukkan judul..." placeholderTextColor="#BDBDBD" />

              <Text style={styles.formLabel}>Penulis</Text>
              <TextInput style={styles.formInput} value={formAuthor} onChangeText={setFormAuthor} placeholder="Masukkan penulis..." placeholderTextColor="#BDBDBD" />

              <Text style={styles.formLabel}>Sinopsis</Text>
              <TextInput style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]} value={formSynopsis} onChangeText={setFormSynopsis} placeholder="Masukkan sinopsis..." placeholderTextColor="#BDBDBD" multiline />

              <Text style={styles.formLabel}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryChip,
                      formCategoryId === cat._id && styles.categoryChipActive,
                    ]}
                    onPress={() => setFormCategoryId(cat._id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formCategoryId === cat._id && styles.categoryChipTextActive,
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formLabel}>Tahun</Text>
                  <TextInput style={styles.formInput} value={formYear} onChangeText={setFormYear} placeholder="2024" placeholderTextColor="#BDBDBD" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formLabel}>Stok Total</Text>
                  <TextInput style={styles.formInput} value={formStock} onChangeText={setFormStock} placeholder="5" placeholderTextColor="#BDBDBD" keyboardType="numeric" />
                </View>
              </View>

              <TouchableOpacity style={[styles.saveButton, isSaving && styles.disabledSaveButton]} onPress={handleSave} disabled={isSaving}>
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Menyimpan...' : editingBook ? 'Simpan Perubahan' : 'Tambah Buku'}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  bodySection: { flex: 1, paddingHorizontal: 20 },

  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  filterRow: { marginBottom: 10 },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  filterChipText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#10B981' },
  sortRow: { gap: 8, marginBottom: 14 },
  sortChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  sortChipActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  sortChipText: { fontSize: 11, color: '#6B7280', fontWeight: '700' },
  sortChipTextActive: { color: '#10B981' },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 48,
    ...softShadow,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  addButton: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
    ...strongShadow,
  },

  bookCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    ...cardShadow,
  },
  bookCover: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  bookInfo: { flex: 1, paddingRight: 8 },
  bookTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  bookAuthor: { fontSize: 13, color: '#757575', marginBottom: 4 },
  bookMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: '#9E9E9E', fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB', marginHorizontal: 6 },

  bookActions: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actionButtons: { flexDirection: 'row' },
  editBtn: { padding: 6, marginRight: 4 },
  deleteBtn: { padding: 6 },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 20, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },

  formLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  formInput: {
    backgroundColor: '#F5F7FA', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  rowInputs: { flexDirection: 'row' },

  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F5F7FA', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoryChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  categoryChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  categoryChipTextActive: { color: '#FFFFFF' },

  saveButton: {
    backgroundColor: '#10B981', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
    ...strongShadow,
  },
  disabledSaveButton: { opacity: 0.75 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
