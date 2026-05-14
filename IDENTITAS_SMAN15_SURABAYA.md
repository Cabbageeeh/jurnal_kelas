# Identitas SMAN 15 Surabaya - Dokumentasi Perubahan

## 📋 Ringkasan Perubahan

Sistem Jurnal Kelas Digital telah diperbarui untuk menampilkan identitas **SMAN 15 Surabaya** di seluruh aplikasi, termasuk:

1. ✅ Halaman Login
2. ✅ Dashboard Admin
3. ✅ Dashboard Guru  
4. ✅ Dashboard Siswa
5. ✅ Export PDF
6. ✅ Export Excel

---

## 🎨 Perubahan Visual

### 1. Halaman Login (`index.html`)
- **Logo SMAN 15 Surabaya** ditampilkan di panel kiri
- Nama sekolah diubah menjadi "SMAN 15 Surabaya"
- Footer copyright diperbarui: "SMAN 15 Surabaya © 2025"

### 2. Dashboard (Admin, Guru, Siswa)
- **Logo SMAN 15 Surabaya** ditampilkan di header sidebar
- Nama aplikasi di sidebar: "SMAN 15 Surabaya"
- Sub-judul tetap menunjukkan role: "Panel Admin", "Portal Guru", "Portal Siswa"

### 3. Export PDF
- **Logo SMAN 15 Surabaya** ditampilkan di header dokumen PDF
- Informasi sekolah lengkap:
  - Nama: SMA Negeri 15 Surabaya
  - Alamat: Jl. Dukuh Menanggal Sel. No.103, Dukuh Menanggal, Kec. Gayungan, Surabaya, Jawa Timur 60234
  - NPSN: 20533015
  - Telepon: (031) 5678910
  - Email: info@sman15-sby.sch.id
  - Website: www.sman15-sby.sch.id

### 4. Export Excel
- Header dokumen menampilkan informasi SMAN 15 Surabaya
- Styling dengan warna tema sekolah (Indigo)
- Informasi lengkap sekolah di bagian atas spreadsheet

---

## 📁 File yang Dimodifikasi

### HTML Files
1. `index.html` - Halaman login
2. `dashboard-admin.html` - Dashboard admin
3. `dashboard-guru.html` - Dashboard guru
4. `dashboard-siswa.html` - Dashboard siswa

### JavaScript Files
1. `js/data.js` - Data profil sekolah default
2. `js/export.js` - Fungsi export PDF dan Excel

### Asset Files
- `assets/img/Logo_Sekolah_Final-SMAN 15 Surabaya.png` - Logo sekolah (sudah ada)

---

## 🔧 Detail Teknis

### Profil Sekolah Default (`js/data.js`)

```javascript
const INITIAL_PROFIL = {
  namaSekolah: "SMA Negeri 15 Surabaya",
  alamat: "Jl. Dukuh Menanggal Sel. No.103, Dukuh Menanggal, Kec. Gayungan, Surabaya, Jawa Timur 60234",
  telepon: "(031) 5678910",
  email: "info@sman15-sby.sch.id",
  website: "www.sman15-sby.sch.id",
  kepalaSekolah: "Drs. Ahmad Subarjo, M.Pd",
  npsn: "20533015",
  logo: "assets/img/Logo_Sekolah_Final-SMAN 15 Surabaya.png"
};
```

### Fungsi Helper Baru (`js/export.js`)

#### `imageToBase64(imagePath)`
Mengonversi path gambar atau URL menjadi base64 untuk digunakan di PDF/Excel.

**Parameter:**
- `imagePath` (string): Path ke file gambar atau data URL base64

**Return:**
- Promise yang resolve ke base64 string

**Fitur:**
- Otomatis deteksi jika input sudah base64
- Handle CORS dengan `crossOrigin = 'Anonymous'`
- Menambahkan background putih untuk transparansi PNG
- Error handling yang robust

#### Perubahan pada `exportPDF()`
- Menambahkan konversi logo path ke base64
- Logo ditampilkan di header dengan border putih
- Kompresi logo untuk ukuran file optimal
- Resolusi tinggi (6x) dengan kualitas 90%

#### Perubahan pada `exportXLSX()`
- Mengubah default nama sekolah menjadi "SMAN 15 Surabaya"
- Header Excel menampilkan informasi lengkap sekolah
- Styling konsisten dengan tema aplikasi

---

## 🎯 Cara Mengubah Profil Sekolah

Admin dapat mengubah profil sekolah melalui dashboard:

1. Login sebagai **Admin**
2. Buka menu **"Profil Sekolah"**
3. Edit informasi sekolah:
   - Nama Sekolah
   - NPSN
   - Alamat
   - Telepon
   - Email
   - Website
   - Nama Kepala Sekolah
   - **Upload Logo Baru** (opsional)
4. Klik **"Simpan Profil"**

Perubahan akan langsung terlihat di:
- Semua dashboard
- Export PDF
- Export Excel

---

## 📸 Logo Sekolah

### Lokasi File
```
assets/img/Logo_Sekolah_Final-SMAN 15 Surabaya.png
```

### Spesifikasi Logo
- **Format:** PNG (dengan transparansi)
- **Ukuran Rekomendasi:** 512x512 px (rasio 1:1)
- **Ukuran File:** Maksimal 2MB
- **Background:** Transparan atau putih

### Penggunaan Logo
- **Sidebar Dashboard:** 40x40 px dengan padding 4px dan background putih
- **PDF Export:** 24x24 mm dengan border putih
- **Login Page:** Ukuran responsif dalam circle container

---

## 🎨 Tema Warna

Aplikasi menggunakan skema warna yang konsisten:

- **Primary (Indigo):** `#4F46E5` - Untuk admin dan elemen utama
- **Guru (Cyan):** `#0891B2` - Untuk portal guru
- **Siswa (Green):** `#059669` - Untuk portal siswa
- **Background Header PDF:** `#EEF2FF` (Light Indigo)

---

## ✅ Testing Checklist

- [x] Logo muncul di halaman login
- [x] Logo muncul di sidebar admin
- [x] Logo muncul di sidebar guru
- [x] Logo muncul di sidebar siswa
- [x] Logo muncul di PDF export
- [x] Informasi sekolah lengkap di PDF
- [x] Informasi sekolah lengkap di Excel
- [x] Nama sekolah konsisten di semua halaman
- [x] Copyright footer diperbarui

---

## 🔄 Kompatibilitas

### Browser Support
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Export Format
- ✅ PDF: jsPDF 2.5.1+
- ✅ Excel: SheetJS (xlsx) 0.18.5+

---

## 📝 Catatan Penting

1. **Logo Path vs Base64:**
   - Sistem mendukung logo sebagai path file (`assets/img/...`) atau base64
   - Untuk export PDF, logo otomatis dikonversi ke base64
   - Kompresi otomatis untuk ukuran file optimal

2. **Profil Sekolah:**
   - Data profil disimpan di `localStorage` dengan key `profil_sekolah`
   - Jika belum ada, sistem menggunakan `INITIAL_PROFIL` dari `data.js`
   - Admin dapat mengubah profil kapan saja melalui dashboard

3. **Performance:**
   - Logo dikompresi saat export PDF untuk mengurangi ukuran file
   - Kualitas tetap tinggi (90%) untuk ketajaman maksimal
   - Background putih otomatis ditambahkan untuk transparansi PNG

---

## 🚀 Update Selanjutnya (Opsional)

Beberapa enhancement yang bisa ditambahkan:

1. **Watermark:** Tambahkan watermark logo di setiap halaman PDF
2. **QR Code:** Generate QR code untuk verifikasi dokumen
3. **Digital Signature:** Tanda tangan digital kepala sekolah
4. **Custom Theme:** Pilihan warna tema sesuai identitas sekolah
5. **Multi-language:** Dukungan bahasa Inggris untuk dokumen

---

## 📞 Support

Jika ada pertanyaan atau masalah terkait identitas sekolah:

1. Periksa file `INITIAL_PROFIL` di `js/data.js`
2. Pastikan logo ada di folder `assets/img/`
3. Clear browser cache jika perubahan tidak terlihat
4. Periksa console browser untuk error

---

**Terakhir Diperbarui:** 14 Mei 2026  
**Versi:** 2.0  
**Status:** ✅ Selesai
