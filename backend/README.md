# Panduan Setup Backend EDUVIX.ID

### Persiapan Lingkungan
1. **Laragon (Wajib)**: Aplikasi ini berfungsi sebagai server database.
   - Download: [https://laragon.org/download/](https://laragon.org/download/)
   - Setelah install, buka Laragon dan klik tombol **"Start All"**.
2. **Node.js**: Pastikan sudah terinstall di komputer.

### Langkah Membuat Database (Setelah Install Laragon)
1. Di Laragon, klik tombol **Database** (akan membuka HeidiSQL).
2. Klik **New** -> Beri nama sesi "Lokal" -> **Open** (tanpa password).
3. Klik kanan di list sebelah kiri -> **Create new** -> **Database** -> Beri nama `eduvix`.
4. Klik database `eduvix` tersebut, lalu buka tab **Query**.
5. Copy seluruh isi file `database.sql` di folder ini dan Paste ke tab Query.
6. Tekan tombol **F9** untuk menjalankan.

### Cara Menjalankan Server
1. Buka CMD/Terminal di folder `backend`.
2. Ketik `npm install` (tunggu sampai selesai).
3. Ketik `npm start`.
4. Jika muncul "✅ MySQL terhubung!", selamat, backend kamu sudah aktif!

### Troubleshooting
- Jika muncul error "Execution Policy" di PowerShell, gunakan **Command Prompt (CMD)** biasa.