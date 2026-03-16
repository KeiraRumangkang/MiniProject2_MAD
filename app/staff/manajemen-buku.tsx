import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import {
  StaffErrorState,
  StaffHeader,
  StaffLoadingState,
  cardShadow,
  softShadow,
  strongShadow,
} from '@/lib/staff-shared';

type StatusFilter = 'all' | 'available' | 'limited' | 'unavailable';
type SortMode = 'newest' | 'title' | 'mostBorrowed' | 'stockAsc';

type BookForm = {
  title: string;
  author: string;
  synopsis: string;
  year: string;
  stockTotal: string;
  categoryId: string;
};

const EMPTY_BOOK_FORM: BookForm = {
  title: '',
  author: '',
  synopsis: '',
  year: '',
  stockTotal: '',
  categoryId: '',
};

export default function ManajemenBuku() {
  const books = useQuery(api.books.getAllBooks);
  const categories = useQuery(api.books.getBookCategories);

  const addBook = useMutation(api.books.addBook);
  const updateBook = useMutation(api.books.updateBook);
  const deleteBook = useMutation(api.books.deleteBook);
  const addBookCategory = useMutation(api.books.addBookCategory);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState<BookForm>(EMPTY_BOOK_FORM);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const [isSavingBook, setIsSavingBook] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

  const safeBooks = Array.isArray(books) ? books : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    safeCategories.forEach((category) => map.set(category._id, category.name));
    return map;
  }, [safeCategories]);

  const visibleBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = safeBooks.filter((book) => {
      const matchesKeyword =
        keyword.length === 0 ||
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || book.categoryId === categoryFilter;

      return matchesKeyword && matchesStatus && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortMode === 'title') return a.title.localeCompare(b.title);
      if (sortMode === 'mostBorrowed') return b.totalBorrowed - a.totalBorrowed;
      if (sortMode === 'stockAsc') return a.stockAvailable - b.stockAvailable;
      return b.createdAt - a.createdAt;
    });

    return filtered;
  }, [safeBooks, search, statusFilter, categoryFilter, sortMode]);

  if (books === undefined || categories === undefined) {
    return <StaffLoadingState message="Memuat manajemen buku..." />;
  }

  if (!Array.isArray(books) || !Array.isArray(categories)) {
    return <StaffErrorState message="Data buku/kategori gagal dimuat. Coba refresh halaman." />;
  }

  const resetBookForm = () => {
    setBookForm({ ...EMPTY_BOOK_FORM, categoryId: categories[0]?._id ?? '' });
    setEditingBook(null);
  };

  const openAddBookModal = () => {
    if (categories.length === 0) {
      Alert.alert('Kategori kosong', 'Tambahkan minimal 1 kategori sebelum menambah buku.');
      return;
    }
    resetBookForm();
    setBookModalVisible(true);
  };

  const openEditBookModal = (book: any) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      synopsis: book.synopsis,
      year: String(book.year),
      stockTotal: String(book.stockTotal),
      categoryId: book.categoryId,
    });
    setBookModalVisible(true);
  };

  const closeBookModal = () => {
    setBookModalVisible(false);
    resetBookForm();
  };

  const saveBook = async () => {
    const title = bookForm.title.trim();
    const author = bookForm.author.trim();
    const synopsis = bookForm.synopsis.trim();
    const year = Number.parseInt(bookForm.year.trim(), 10);
    const stockTotal = Number.parseInt(bookForm.stockTotal.trim(), 10);

    if (!title || !author || !synopsis || !bookForm.categoryId) {
      Alert.alert('Validasi gagal', 'Semua field wajib diisi.');
      return;
    }

    if (!Number.isFinite(year) || year < 1000 || year > 9999) {
      Alert.alert('Validasi gagal', 'Tahun harus 4 digit angka.');
      return;
    }

    if (!Number.isFinite(stockTotal) || stockTotal < 0) {
      Alert.alert('Validasi gagal', 'Stok total harus angka >= 0.');
      return;
    }

    try {
      setIsSavingBook(true);

      if (editingBook) {
        await updateBook({
          bookId: editingBook._id,
          title,
          author,
          synopsis,
          categoryId: bookForm.categoryId as any,
          year,
          stockTotal,
        });
      } else {
        await addBook({
          title,
          author,
          synopsis,
          categoryId: bookForm.categoryId as any,
          year,
          stockTotal,
        });
      }

      closeBookModal();
    } catch (error: any) {
      Alert.alert('Gagal menyimpan buku', error?.message ?? 'Terjadi kesalahan.');
    } finally {
      setIsSavingBook(false);
    }
  };

  const removeBook = async (book: any) => {
    try {
      setDeletingBookId(book._id);
      await deleteBook({ bookId: book._id });
    } catch (error: any) {
      Alert.alert('Gagal menghapus buku', error?.message ?? 'Terjadi kesalahan.');
    } finally {
      setDeletingBookId(null);
    }
  };

  const saveCategory = async () => {
    const name = newCategoryName.trim();
    const description = newCategoryDescription.trim();

    if (!name) {
      Alert.alert('Validasi gagal', 'Nama kategori wajib diisi.');
      return;
    }

    try {
      setIsSavingCategory(true);
      await addBookCategory({ name, description });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setCategoryModalVisible(false);
    } catch (error: any) {
      Alert.alert('Gagal menambah kategori', error?.message ?? 'Terjadi kesalahan.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'available') return '#10B981';
    if (status === 'limited') return '#F59E0B';
    if (status === 'unavailable') return '#EF4444';
    return '#9E9E9E';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'available') return 'Tersedia';
    if (status === 'limited') return 'Terbatas';
    if (status === 'unavailable') return 'Habis';
    return status;
  };

  return (
    <View style={styles.container}>
      <StaffHeader title="Manajemen Buku" subtitle={`${safeBooks.length} buku dalam koleksi`} />

      <View style={styles.contentWrap}>
        <View style={styles.controlPanel}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari judul atau penulis"
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={openAddBookModal}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton} onPress={() => setCategoryModalVisible(true)}>
              <Ionicons name="pricetag-outline" size={18} color="#10B981" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            <TouchableOpacity
              style={[styles.chip, categoryFilter === 'all' && styles.chipActive]}
              onPress={() => setCategoryFilter('all')}
            >
              <Text style={[styles.chipText, categoryFilter === 'all' && styles.chipTextActive]}>Semua Kategori</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={[styles.chip, categoryFilter === category._id && styles.chipActive]}
                onPress={() => setCategoryFilter(category._id)}
              >
                <Text style={[styles.chipText, categoryFilter === category._id && styles.chipTextActive]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {[
              { key: 'all', label: 'Semua Status' },
              { key: 'available', label: 'Tersedia' },
              { key: 'limited', label: 'Terbatas' },
              { key: 'unavailable', label: 'Habis' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, statusFilter === item.key && styles.chipActive]}
                onPress={() => setStatusFilter(item.key as StatusFilter)}
              >
                <Text style={[styles.chipText, statusFilter === item.key && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRowBottom}>
            {[
              { key: 'newest', label: 'Terbaru' },
              { key: 'title', label: 'A-Z' },
              { key: 'mostBorrowed', label: 'Terpopuler' },
              { key: 'stockAsc', label: 'Stok Minim' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, sortMode === item.key && styles.chipActive]}
                onPress={() => setSortMode(item.key as SortMode)}
              >
                <Text style={[styles.chipText, sortMode === item.key && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={visibleBooks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              <View style={styles.bookCover}>
                <Ionicons name="book" size={24} color="#10B981" />
              </View>

              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                <Text style={styles.bookMeta} numberOfLines={2}>
                  {categoryMap.get(item.categoryId) ?? 'Tanpa kategori'} · {item.year} · Stok {item.stockAvailable}/{item.stockTotal}
                </Text>
              </View>

              <View style={styles.bookActions}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}22` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                </View>
                <View style={styles.iconRow}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditBookModal(item)}>
                    <Ionicons name="create-outline" size={18} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => void removeBook(item)} disabled={deletingBookId === item._id}>
                    <Ionicons name={deletingBookId === item._id ? 'sync' : 'trash-outline'} size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>Tidak ada buku yang cocok dengan filter saat ini.</Text>
            </View>
          }
        />
      </View>

      <Modal visible={bookModalVisible} animationType="slide" transparent onRequestClose={closeBookModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingBook ? 'Edit Buku' : 'Tambah Buku'}</Text>
                <TouchableOpacity onPress={closeBookModal}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Judul</Text>
              <TextInput style={styles.formInput} value={bookForm.title} onChangeText={(v) => setBookForm((p) => ({ ...p, title: v }))} placeholder="Masukkan judul buku" placeholderTextColor="#9CA3AF" />

              <Text style={styles.formLabel}>Penulis</Text>
              <TextInput style={styles.formInput} value={bookForm.author} onChangeText={(v) => setBookForm((p) => ({ ...p, author: v }))} placeholder="Masukkan penulis" placeholderTextColor="#9CA3AF" />

              <Text style={styles.formLabel}>Sinopsis</Text>
              <TextInput style={[styles.formInput, styles.formTextArea]} multiline value={bookForm.synopsis} onChangeText={(v) => setBookForm((p) => ({ ...p, synopsis: v }))} placeholder="Masukkan sinopsis" placeholderTextColor="#9CA3AF" />

              <Text style={styles.formLabel}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[styles.categoryChip, bookForm.categoryId === category._id && styles.categoryChipActive]}
                    onPress={() => setBookForm((p) => ({ ...p, categoryId: category._id }))}
                  >
                    <Text style={[styles.categoryChipText, bookForm.categoryId === category._id && styles.categoryChipTextActive]}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.doubleInputRow}>
                <View style={styles.doubleInputItem}>
                  <Text style={styles.formLabel}>Tahun</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={bookForm.year} onChangeText={(v) => setBookForm((p) => ({ ...p, year: v }))} placeholder="2025" placeholderTextColor="#9CA3AF" />
                </View>
                <View style={styles.doubleInputItem}>
                  <Text style={styles.formLabel}>Stok Total</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={bookForm.stockTotal} onChangeText={(v) => setBookForm((p) => ({ ...p, stockTotal: v }))} placeholder="10" placeholderTextColor="#9CA3AF" />
                </View>
              </View>

              <TouchableOpacity style={[styles.saveBtn, isSavingBook && styles.btnDisabled]} onPress={() => void saveBook()} disabled={isSavingBook}>
                <Text style={styles.saveBtnText}>{isSavingBook ? 'Menyimpan...' : 'Simpan Buku'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={categoryModalVisible} animationType="fade" transparent onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.categoryModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Kategori</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Nama Kategori</Text>
            <TextInput style={styles.formInput} value={newCategoryName} onChangeText={setNewCategoryName} placeholder="Contoh: Sejarah" placeholderTextColor="#9CA3AF" />

            <Text style={styles.formLabel}>Deskripsi (opsional)</Text>
            <TextInput style={[styles.formInput, styles.formTextAreaShort]} multiline value={newCategoryDescription} onChangeText={setNewCategoryDescription} placeholder="Keterangan kategori" placeholderTextColor="#9CA3AF" />

            <TouchableOpacity style={[styles.saveBtn, isSavingCategory && styles.btnDisabled]} onPress={() => void saveCategory()} disabled={isSavingCategory}>
              <Text style={styles.saveBtnText}>{isSavingCategory ? 'Menyimpan...' : 'Simpan Kategori'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  contentWrap: { flex: 1 },

  controlPanel: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    ...softShadow,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    marginLeft: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    ...strongShadow,
  },
  categoryButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },

  chipsRow: { marginBottom: 8 },
  chipsRowBottom: {},
  chip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipActive: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#6B7280', lineHeight: 14 },
  chipTextActive: { color: '#10B981' },

  listContent: { paddingHorizontal: 20, paddingBottom: 96 },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...cardShadow,
  },
  bookCover: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookInfo: { flex: 1, paddingRight: 8 },
  bookTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  bookAuthor: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  bookMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  bookActions: { alignItems: 'flex-end' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  iconRow: { flexDirection: 'row' },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    backgroundColor: '#F8FAFC',
  },

  emptyState: { alignItems: 'center', paddingVertical: 56 },
  emptyText: { marginTop: 8, color: '#9CA3AF', fontSize: 14, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 20 },
  categoryModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },

  formLabel: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#111827',
    marginBottom: 12,
  },
  formTextArea: { minHeight: 96, textAlignVertical: 'top' },
  formTextAreaShort: { minHeight: 72, textAlignVertical: 'top' },

  categoryChip: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 17,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  categoryChipTextActive: { color: '#FFFFFF' },

  doubleInputRow: { flexDirection: 'row', gap: 10 },
  doubleInputItem: { flex: 1 },

  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    ...strongShadow,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.7 },
});
