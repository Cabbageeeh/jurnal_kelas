# 🎓 Jurnal Kelas Digital - Format Kelas SMAN 15 Surabaya

## 📌 Update Terbaru: Format Kelas Baru

Sistem telah diperbarui untuk menggunakan format kelas sesuai dengan SMAN 15 Surabaya.

---

## 🆕 Format Kelas

### Kelas 10 (X)
```
X-1, X-2, X-3, X-4, X-5, X-6, X-7, X-8, X-9, X-10, X-11, X-12
```
- Total: **12 kelas**
- Tidak ada penjurusan

### Kelas 11 (XI)
```
XI-A, XI-B, XI-C, XI-D, XI-E, XI-F, XI-G
```
- Total: **7 kelas**
- Penjurusan dengan huruf A-G

### Kelas 12 (XII)
```
XII-A, XII-B, XII-C, XII-D, XII-E, XII-F, XII-G
```
- Total: **7 kelas**
- Penjurusan dengan huruf A-G

---

## 🚀 Quick Start

### 1. Login
- **Admin**: username `admin`, password `admin123`
- **Guru**: username `budi`, password `guru123`
- **Siswa**: username `rina`, password `siswa123`

### 2. Reset Database (Jika Perlu)
Jika ada data lama dengan format kelas lama:
```javascript
// Buka browser console (F12)
resetDB()
// Refresh halaman
```

### 3. Tambah Kelas Baru
1. Login sebagai Admin
2. Menu **Kelola Kelas** → **Tambah Kelas**
3. Pilih **Tingkat** (X/XI/XII)
4. Pilih **Jurusan/Nomor**:
   - Kelas X: pilih 1-12
   - Kelas XI/XII: pilih A-G
5. Isi jumlah siswa
6. Simpan

Nama kelas akan otomatis dibuat: `{Tingkat}-{Jurusan}`

### 4. Import Data Massal
1. Menu **Kelola Kelas** → **Import Data**
2. Download template Excel
3. Isi sesuai format
4. Upload dan proses

---

## 📚 Dokumentasi Lengkap

### 1. [RINGKASAN_PERUBAHAN.md](./RINGKASAN_PERUBAHAN.md)
**Ringkasan eksekutif** dari semua perubahan:
- Status perubahan
- File yang dimodifikasi
- Checklist fitur
- Cara testing
- Troubleshooting

### 2. [PERUBAHAN_FORMAT_KELAS.md](./PERUBAHAN_FORMAT_KELAS.md)
**Detail teknis** perubahan:
- Perubahan per file
- Fungsi yang dimodifikasi
- Cara menggunakan fitur baru
- Catatan penting
- Rollback procedure

### 3. [CONTOH_TEMPLATE_IMPORT.md](./CONTOH_TEMPLATE_IMPORT.md)
**Panduan import data**:
- Contoh template lengkap (31 kelas)
- Format Excel yang benar
- Tips import
- Troubleshooting import

---

## 🎯 Fitur Utama

### ✅ Form Input Kelas
- Dropdown tingkat dan jurusan dinamis
- Nama kelas auto-generate
- Validasi input
- User-friendly interface

### ✅ Import/Export Data
- Template Excel dengan format baru
- Preview data sebelum import
- Export PDF dan XLSX
- Petunjuk pengisian jelas

### ✅ Integrasi Penuh
- Jadwal pelajaran
- Jurnal kelas
- Konfirmasi guru
- Dashboard admin
- Rekap dan laporan

---

## 📋 Contoh Penggunaan

### Menambah Kelas X-5
1. Tingkat: **X**
2. Jurusan: **5**
3. Jumlah Siswa: **35**
4. Status: **Aktif**
5. Hasil: Kelas **X-5** dengan 35 siswa

### Menambah Kelas XI-C
1. Tingkat: **XI**
2. Jurusan: **C**
3. Jumlah Siswa: **34**
4. Status: **Aktif**
5. Hasil: Kelas **XI-C** dengan 34 siswa

### Import 12 Kelas X Sekaligus
1. Download template kelas
2. Isi data:
   ```
   X-1, X, 1, 35
   X-2, X, 2, 32
   X-3, X, 3, 30
   ... (sampai X-12)
   ```
3. Upload dan import
4. Semua kelas X langsung masuk sistem

---

## 🔧 Troubleshooting

### ❌ Dropdown jurusan tidak muncul
**Solusi:**
- Clear cache browser (Ctrl+Shift+Delete)
- Refresh halaman (F5)
- Cek console untuk error (F12)

### ❌ Data lama masih muncul
**Solusi:**
```javascript
// Console browser (F12)
resetDB()
// Refresh halaman
```

### ❌ Import gagal
**Solusi:**
- Pastikan nama sheet: "Kelas", "Pengguna", atau "Mapel"
- Jangan ubah nama kolom header
- Cek format data sesuai template
- File maksimal 5MB

### ❌ Nama kelas tidak sesuai
**Solusi:**
- Pastikan pilih tingkat dan jurusan dengan benar
- Sistem auto-generate: `{Tingkat}-{Jurusan}`
- Tidak perlu input nama manual

---

## 📊 Struktur Database

### Tabel Kelas
```javascript
{
  id: "kls001",
  nama: "X-1",        // Auto-generate
  tingkat: "X",       // X, XI, XII
  jurusan: "1",       // X: 1-12, XI/XII: A-G
  jumlahSiswa: 35,
  aktif: true
}
```

### Contoh Data
```javascript
// Kelas 10
{ nama: "X-1", tingkat: "X", jurusan: "1" }
{ nama: "X-12", tingkat: "X", jurusan: "12" }

// Kelas 11
{ nama: "XI-A", tingkat: "XI", jurusan: "A" }
{ nama: "XI-G", tingkat: "XI", jurusan: "G" }

// Kelas 12
{ nama: "XII-A", tingkat: "XII", jurusan: "A" }
{ nama: "XII-G", tingkat: "XII", jurusan: "G" }
```

---

## 🎨 Screenshot Fitur

### Form Tambah Kelas
```
┌─────────────────────────────────┐
│  Tambah Kelas                   │
├─────────────────────────────────┤
│  Tingkat: [X ▼]                 │
│  Jurusan: [1-12 ▼]              │
│  Jumlah Siswa: [35]             │
│  Status: [Aktif ▼]              │
│                                 │
│  Hint: Kelas X: 1-12            │
│        Kelas XI & XII: A-G      │
│                                 │
│  [Batal]  [Simpan]              │
└─────────────────────────────────┘
```

### Dropdown Dinamis
```
Tingkat: X          Tingkat: XI
Jurusan:            Jurusan:
  1                   A
  2                   B
  3                   C
  ...                 ...
  12                  G
```

---

## 📞 Support & Bantuan

### Dokumentasi
- 📄 [RINGKASAN_PERUBAHAN.md](./RINGKASAN_PERUBAHAN.md) - Overview lengkap
- 📄 [PERUBAHAN_FORMAT_KELAS.md](./PERUBAHAN_FORMAT_KELAS.md) - Detail teknis
- 📄 [CONTOH_TEMPLATE_IMPORT.md](./CONTOH_TEMPLATE_IMPORT.md) - Panduan import

### Debug
1. Buka browser console (F12)
2. Cek error di tab Console
3. Cek localStorage di tab Application
4. Jalankan `resetDB()` jika perlu

### Reset Sistem
```javascript
// Reset semua data
resetDB()

// Reset hanya data transaksi (jurnal, konfirmasi)
resetDataTransaksi()
```

---

## ✨ Changelog

### Version 2.1 (14 Mei 2026)
- ✅ Format kelas baru: X-1 sampai X-12, XI-A sampai XI-G, XII-A sampai XII-G
- ✅ Form input kelas dengan dropdown dinamis
- ✅ Auto-generate nama kelas
- ✅ Template import/export diperbarui
- ✅ Dokumentasi lengkap
- ✅ Integrasi penuh dengan semua fitur

### Version 2.0 (Sebelumnya)
- Sistem periode & jadwal permanen
- Form jurnal otomatis
- Export PDF optimized
- Hari libur management

---

## 🎉 Kesimpulan

Sistem Jurnal Kelas Digital telah berhasil diperbarui dengan format kelas SMAN 15 Surabaya:

✅ **Kelas 10**: X-1 sampai X-12 (12 kelas)  
✅ **Kelas 11**: XI-A sampai XI-G (7 kelas)  
✅ **Kelas 12**: XII-A sampai XII-G (7 kelas)

Semua fitur terintegrasi dan siap digunakan! 🚀

---

**Dibuat dengan ❤️ untuk SMAN 15 Surabaya**
