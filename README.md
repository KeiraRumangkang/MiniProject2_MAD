# MiniProject2 MAD

Aplikasi perpustakaan berbasis Expo Router (frontend) + Convex (backend).

Repository ini memiliki 3 area utama aplikasi:
- Mahasiswa
- Staff
- Kepala Perpustakaan

Jika fokus pengembangan kamu hanya Staff, kerjakan file di folder app/staff.

## Tech Stack

- Expo SDK 54
- React Native + Expo Router
- Convex untuk database, query, dan mutation backend

## Struktur Penting

- app/_layout.tsx: layout root dan inisialisasi Convex client
- app/login.tsx: halaman login
- app/staff: seluruh halaman Staff
- convex: fungsi backend (query/mutation/action)

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- Akun Convex (untuk menjalankan backend dev)

## Instalasi

1. Masuk ke folder project:

   cd '/Users/gmeruntu_/David/JOKI 1/perpusmadev/MiniProject2_MAD'

2. Install dependency:

   npm install

## Menjalankan Backend dan Frontend Secara Terpisah

Penting: backend harus jalan dulu sebelum frontend agar EXPO_PUBLIC_CONVEX_URL valid.

### Terminal 1 - Backend Convex

1. Masuk ke root project:

   cd '/Users/gmeruntu_/David/JOKI 1/perpusmadev/MiniProject2_MAD'

2. Jalankan backend:

   npx convex dev

3. Jika diminta login, selesaikan proses login Convex di browser.

4. Tunggu sampai muncul pesan:

   Convex functions ready!

5. Pastikan file .env.local berisi EXPO_PUBLIC_CONVEX_URL.

Contoh isi .env.local:

EXPO_PUBLIC_CONVEX_URL=https://nama-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:nama-deployment
EXPO_PUBLIC_CONVEX_SITE_URL=https://nama-deployment.convex.site

### Terminal 2 - Frontend Expo

1. Masuk ke root project:

   cd '/Users/gmeruntu_/David/JOKI 1/perpusmadev/MiniProject2_MAD'

2. Jalankan frontend web:

   npm run web

3. Buka browser:

   http://localhost:8081

Untuk Android:

   npm run android

## Script yang Dipakai

- npm run start: jalankan Expo dev server umum
- npm run web: jalankan frontend web
- npm run android: jalankan frontend Android
- npm run ios: jalankan frontend iOS
- npm run lint: lint project

## Fokus Pengembangan Staff

Gunakan area berikut:
- app/staff/index.tsx
- app/staff/manajemen-buku.tsx
- app/staff/peminjaman.tsx
- app/staff/mahasiswa.tsx
- app/staff/forum.tsx
- app/staff/_layout.tsx

Disarankan tidak mengubah area mahasiswa/kepala jika scope tugas hanya Staff.

## Troubleshooting

1) Error: No address provided to ConvexReactClient

Penyebab:
- Backend Convex belum berjalan
- .env.local belum ada atau EXPO_PUBLIC_CONVEX_URL kosong

Solusi:
- Jalankan npx convex dev
- Pastikan .env.local berisi EXPO_PUBLIC_CONVEX_URL
- Restart frontend npm run web

2) Error: Could not find public function for 'dashboard:getUserByUsername'

Penyebab:
- Fungsi backend belum tersinkron ke deployment dev

Solusi:
- Jalankan npx convex dev dari root project
- Tunggu Convex functions ready
- Refresh aplikasi

3) Frontend tidak terbuka di web

Solusi cek cepat:
- Pastikan npm run web sedang aktif
- Cek port 8081 aktif:

  lsof -nP -iTCP:8081 -sTCP:LISTEN

## Catatan Operasional

- Jalankan backend dan frontend di terminal terpisah.
- Jangan tutup terminal backend saat frontend dipakai.
- Jika ganti deployment Convex, update .env.local lalu restart frontend.
