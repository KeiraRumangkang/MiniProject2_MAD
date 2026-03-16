# MiniProject2 MAD

Aplikasi perpustakaan berbasis Expo Router (frontend) + Convex (backend).

Repository ini memiliki 3 area utama aplikasi:
- Mahasiswa
- Staff
- Kepala Perpustakaan

## Tech Stack

- Expo SDK 54
- React Native + Expo Router
- Convex untuk database, query, dan mutation backend

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- Akun Convex (untuk menjalankan backend dev)

## Instalasi

1. Masuk ke folder project:

   cd '/perpusmadev/MiniProject2_MAD'

2. Install dependency:

   npm install

## Menjalankan Backend dan Frontend Secara Terpisah

Penting: backend harus jalan dulu sebelum frontend agar EXPO_PUBLIC_CONVEX_URL valid.

### Terminal 1 - Backend Convex

1. Masuk ke root project:

   cd '/perpusmadev/MiniProject2_MAD'

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

   cd '/perpusmadev/MiniProject2_MAD'

2. Jalankan frontend web:

   npm run web

3. Buka browser:

   http://localhost:[port]

Untuk Android:

   npm run android

## Catatan Operasional

- Jalankan backend dan frontend di terminal terpisah.
- Jangan tutup terminal backend saat frontend dipakai.
- Jika ganti deployment Convex, update .env.local lalu restart frontend.
