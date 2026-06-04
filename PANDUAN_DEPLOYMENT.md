# 🚀 Panduan Deployment Gratis — EDUVIX.ID

Panduan ini berisi langkah-langkah praktis untuk mempublikasikan website **EDUVIX.ID** Anda ke internet secara **100% gratis** menggunakan teknologi cloud modern:
1. **Database:** Supabase (PostgreSQL gratis)
2. **Backend Server:** Render (Node.js web service gratis)
3. **Frontend Web:** Vercel atau Netlify (Static HTML hosting gratis)

---

## 🛠️ Langkah 1: Persiapan Repositori (GitHub)
Sebelum melakukan deployment, seluruh kode proyek Anda harus di-upload ke GitHub.
1. Buat akun di [GitHub](https://github.com/) jika belum punya.
2. Buat repositori baru bernama `web-edukasi` (boleh private atau public).
3. Upload seluruh isi folder `WEB-EDUKASI` Anda ke repositori tersebut menggunakan Git.

---

## 💾 Langkah 2: Setup Database Gratis di Supabase
Supabase akan menjadi pengganti database lokal Anda.
1. Masuk ke [Supabase](https://supabase.com/) dan buat proyek baru.
2. Masukkan nama proyek (misal: `eduvix-db`) dan tentukan password database yang kuat. Simpan password ini!
3. Pilih wilayah server terdekat (misal: **Singapore**).
4. Setelah proyek selesai dibuat, pergi ke menu **Project Settings** (ikon gerigi) -> **Database**.
5. Cari bagian **Connection String**, pilih tab **URI**, lalu salin URL koneksi tersebut.
   * *Contoh bentuk URI:* `postgresql://postgres.[username]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   * *Catatan:* Ganti `[password]` dengan password database yang Anda buat tadi.

---

## 🚀 Langkah 3: Setup Backend Gratis di Render
Render akan menjalankan server Node.js (`server.js`) Anda.
1. Masuk ke [Render](https://render.com/) menggunakan akun GitHub Anda.
2. Klik tombol **New +** dan pilih **Web Service**.
3. Hubungkan ke repositori GitHub `web-edukasi` Anda.
4. Isi konfigurasi berikut:
   * **Name:** `eduvix-backend`
   * **Root Directory:** `backend` (Sangat penting karena server.js ada di folder backend)
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** Pilih **Free**
5. Klik menu **Environment** (di menu sebelah kiri) lalu tambahkan variabel berikut:
   * `DATABASE_URL` = *[URI PostgreSQL dari Supabase yang sudah disalin di Langkah 2]*
   * `JWT_SECRET` = *[Buat string acak panjang bebas untuk keamanan token]*
   * `NODE_ENV` = `production`
6. Klik **Save Changes**. Tunggu beberapa menit hingga status berubah menjadi **Live**. Salin URL Backend yang diberikan oleh Render (misal: `https://eduvix-backend.onrender.com`).

---

## 🌐 Langkah 4: Hubungkan Frontend ke Backend Baru
Sekarang kita perlu memberi tahu frontend di mana letak backend barunya.
1. Buka file [frontend/api.js](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/code/ya%20anu/WEB-EDUKASI/frontend/api.js).
2. Di baris ke-8, ganti nilai `PRODUCTION_BACKEND_URL` dengan URL Backend Render Anda:
   ```javascript
   const PRODUCTION_BACKEND_URL = 'https://eduvix-backend.onrender.com'; // Ganti dengan URL Anda
   ```
3. Commit dan push kembali perubahan file ini ke GitHub Anda.

---

## 🎨 Langkah 5: Setup Frontend Gratis di Vercel
Vercel akan meng-host tampilan web (HTML, CSS, JS) Anda agar bisa diakses oleh pengguna.
1. Masuk ke [Vercel](https://vercel.com/) menggunakan akun GitHub Anda.
2. Klik **Add New** -> **Project**.
3. Pilih repositori GitHub `web-edukasi` Anda.
4. Isi konfigurasi berikut:
   * **Framework Preset:** Pilih `Other`
   * **Root Directory:** Klik edit dan pilih folder `frontend` (karena semua file HTML/CSS/JS ada di folder frontend).
5. Klik **Deploy** dan tunggu prosesnya selesai.
6. Website Anda kini sudah online secara gratis! 🎉
