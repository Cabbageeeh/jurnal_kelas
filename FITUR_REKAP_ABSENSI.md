# Fitur Rekap Absensi Siswa

## 📋 Deskripsi
Fitur rekap absensi siswa memungkinkan admin untuk melihat dan menganalisis ketidakhadiran siswa berdasarkan data jurnal kelas yang diisi oleh siswa. Sistem akan menghitung berapa kali setiap siswa tidak hadir (sakit, izin, alpha) dalam periode satu bulan.

## ✨ Fitur Utama

### 1. Import Data Siswa
- Import data siswa per kelas dari file Excel
- Template Excel tersedia untuk download
- Validasi otomatis untuk NIS duplikat dan kelas tidak ditemukan
- Format: NIS, Nama, Kelas

### 2. Rekap Absensi Bulanan
- Filter berdasarkan bulan dan tahun
- Filter berdasarkan kelas tertentu
- Filter berdasarkan status (Sakit/Izin/Alpha)
- Menampilkan jumlah ketidakhadiran per siswa
- Sorting otomatis berdasarkan total ketidakhadiran (terbanyak dulu)

### 3. Statistik Dashboard
- Total siswa dalam periode
- Jumlah siswa hadir penuh (tidak ada ketidakhadiran)
- Jumlah siswa yang pernah tidak hadir
- Total ketidakhadiran dengan breakdown per status

### 4. Detail Absensi Siswa
- Klik tombol detail untuk melihat riwayat lengkap
- Menampilkan tanggal, mata pelajaran, jam, dan status ketidakhadiran
- Statistik per siswa (Sakit, Izin, Alpha, Total)

### 5. Export Data
- Export ke Excel (.xlsx)
- Export ke PDF
- Termasuk header profil sekolah
- Data terurut berdasarkan total ketidakhadiran

## 📁 File yang Ditambahkan/Dimodifikasi

### File Baru:
1. **js/absensi.js** - Logika rekap absensi
   - `renderRekapAbsensi()` - Render tabel rekap
   - `renderStatsAbsensi()` - Render statistik
   - `lihatDetailAbsensi()` - Modal detail per siswa
   - `exportRekapAbsensi()` - Export XLSX/PDF
   - `initFilterAbsensi()` - Inisialisasi filter

### File yang Dimodifikasi:
1. **dashboard-admin.html**
   - Menambah menu "Rekap Absensi" di sidebar
   - Menambah halaman rekap absensi dengan filter dan tabel
   - Menambah modal detail absensi siswa
   - Menambah tombol template siswa di modal import
   - Menambah tab preview siswa di modal import

2. **js/data.js**
   - Menambah key `siswa: "jk_siswa"` di DB_KEYS
   - Inisialisasi storage untuk data siswa

3. **js/import.js**
   - Menambah template download untuk siswa
   - Menambah fungsi `parseSiswa()` untuk parsing data siswa
   - Menambah fungsi `renderPreviewSiswa()` untuk preview import
   - Update fungsi `konfirmasiImport()` untuk menyimpan data siswa
   - Update counter dan tab untuk siswa

4. **js/admin.js**
   - Menambah "rekap-absensi" di PAGE_TITLES
   - Menambah action untuk halaman rekap absensi

## 🎯 Cara Penggunaan

### A. Import Data Siswa

1. **Buka Dashboard Admin** → Menu "Rekap Absensi"
2. **Klik "Import Data Siswa"**
3. **Download Template Siswa**
4. **Isi Template Excel:**
   ```
   NIS     | Nama              | Kelas
   12345   | Ahmad Fauzi       | X-1
   12346   | Siti Nurhaliza    | X-1
   12347   | Budi Santoso      | X-2
   ```
5. **Upload File Excel**
6. **Preview Data** - Sistem akan validasi:
   - NIS tidak duplikat
   - Kelas sudah terdaftar di sistem
7. **Klik "Import"** untuk menyimpan

### B. Melihat Rekap Absensi

1. **Pilih Bulan** - Contoh: Januari 2026
2. **Filter Kelas** (opsional) - Contoh: X-1
3. **Filter Status** (opsional) - Sakit/Izin/Alpha
4. **Lihat Statistik:**
   - Total siswa
   - Siswa hadir penuh
   - Siswa tidak hadir
   - Total ketidakhadiran

5. **Tabel Rekap menampilkan:**
   - Nama siswa & NIS
   - Kelas
   - Jumlah Sakit
   - Jumlah Izin
   - Jumlah Alpha
   - Total tidak hadir
   - Tombol detail

### C. Melihat Detail Siswa

1. **Klik tombol "👁️" di kolom Aksi**
2. **Modal Detail menampilkan:**
   - Info siswa (Nama, NIS, Kelas)
   - Statistik bulan tersebut
   - Riwayat ketidakhadiran lengkap:
     - Tanggal
     - Mata pelajaran
     - Jam pelajaran
     - Status (Sakit/Izin/Alpha)

### D. Export Data

1. **Pilih bulan dan filter yang diinginkan**
2. **Klik "Export XLSX"** atau **"Export PDF"**
3. **File akan terdownload** dengan nama:
   - `Rekap_Absensi_Januari_2026.xlsx`
   - `Rekap_Absensi_Januari_2026.pdf`

## 📊 Sumber Data

Rekap absensi mengambil data dari:
- **Data Siswa** - Dari import Excel (NIS, Nama, Kelas)
- **Data Jurnal** - Dari jurnal yang diisi siswa
  - Field `absensi.sakit` - Array siswa yang sakit
  - Field `absensi.izin` - Array siswa yang izin
  - Field `absensi.alpha` - Array siswa yang alpha

## 🔍 Logika Perhitungan

```javascript
// Untuk setiap siswa:
1. Ambil semua jurnal kelas siswa dalam bulan yang dipilih
2. Loop setiap jurnal:
   - Cek apakah siswa ada di array absensi.sakit → sakit++
   - Cek apakah siswa ada di array absensi.izin → izin++
   - Cek apakah siswa ada di array absensi.alpha → alpha++
3. Total = sakit + izin + alpha
4. Sort berdasarkan total (terbanyak dulu)
```

## 🎨 Tampilan

### Statistik Cards:
- **Total Siswa** - Warna biru
- **Siswa Hadir Penuh** - Warna hijau
- **Siswa Tidak Hadir** - Warna kuning
- **Total Ketidakhadiran** - Warna merah dengan breakdown

### Tabel:
- Badge kuning untuk Sakit
- Badge biru untuk Izin
- Badge merah untuk Alpha
- Total berwarna merah jika > 5, kuning jika > 3

### Modal Detail:
- Info siswa dengan background abu-abu
- Statistik dengan warna sesuai status
- Tabel riwayat lengkap dengan badge status

## ⚠️ Catatan Penting

1. **Data Siswa Harus Diimport Dulu**
   - Sebelum melihat rekap, pastikan data siswa sudah diimport
   - NIS harus unik untuk setiap siswa
   - Kelas harus sudah terdaftar di sistem

2. **Format Kelas Harus Sesuai**
   - Kelas 10: X-1, X-2, ... X-12
   - Kelas 11: XI-A, XI-B, ... XI-G
   - Kelas 12: XII-A, XII-B, ... XII-G

3. **Matching Siswa**
   - Sistem mencocokkan siswa berdasarkan NIS atau Nama
   - Pastikan nama siswa di jurnal sama dengan data siswa

4. **Periode Rekap**
   - Rekap per bulan (1 bulan penuh)
   - Tidak bisa lintas bulan
   - Default: bulan berjalan

## 🚀 Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:
- [ ] Rekap per semester
- [ ] Grafik tren ketidakhadiran
- [ ] Notifikasi otomatis jika siswa sering tidak hadir
- [ ] Export per kelas
- [ ] Perbandingan antar bulan
- [ ] Cetak surat peringatan otomatis
- [ ] Integrasi dengan sistem SMS/WhatsApp untuk notifikasi orang tua

## 📝 Contoh Template Excel Siswa

```
NIS     | nama              | kelas_nama
--------|-------------------|------------
12345   | Ahmad Fauzi       | X-1
12346   | Siti Nurhaliza    | X-1
12347   | Budi Santoso      | X-2
12348   | Dewi Lestari      | XI-A
12349   | Eko Prasetyo      | XI-A
12350   | Fitri Handayani   | XII-B
```

## 🎓 Manfaat Fitur

1. **Untuk Admin:**
   - Monitoring ketidakhadiran siswa secara real-time
   - Identifikasi siswa yang sering tidak hadir
   - Data untuk evaluasi dan tindak lanjut

2. **Untuk Guru BK:**
   - Data untuk konseling siswa
   - Identifikasi masalah kehadiran
   - Laporan untuk orang tua

3. **Untuk Kepala Sekolah:**
   - Laporan kehadiran siswa
   - Data untuk pengambilan keputusan
   - Evaluasi kedisiplinan siswa

## 📞 Support

Jika ada pertanyaan atau masalah terkait fitur ini, silakan hubungi tim pengembang atau buka issue di repository.

---

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Status:** ✅ Aktif
