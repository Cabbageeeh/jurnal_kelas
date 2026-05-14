# Fitur Dropdown Absensi Siswa

## 📋 Deskripsi
Fitur ini menambahkan dropdown untuk memilih siswa yang tidak hadir (sakit, izin, alpha) pada form isi jurnal. Data siswa yang dipilih akan otomatis tersinkronisasi dengan rekap absensi.

## ✨ Fitur Utama

### 1. **Dropdown Pemilihan Siswa**
- Dropdown untuk memilih siswa sakit
- Dropdown untuk memilih siswa izin  
- Dropdown untuk memilih siswa alpha
- Dropdown menampilkan nama dan NIS siswa
- Siswa yang sudah dipilih tidak bisa dipilih lagi di kategori lain

### 2. **List Siswa Terpilih**
- Menampilkan daftar siswa yang tidak hadir per kategori
- Tombol hapus untuk menghapus siswa dari list
- Counter otomatis menghitung jumlah siswa per kategori
- Validasi duplikasi siswa antar kategori

### 3. **Sinkronisasi dengan Rekap Absensi**
- Data siswa yang tidak hadir disimpan dengan detail (ID, NIS, Nama)
- Rekap absensi otomatis membaca data dari jurnal
- Menampilkan riwayat ketidakhadiran per siswa
- Filter berdasarkan bulan, kelas, dan status

## 🔧 Cara Penggunaan

### Untuk Siswa (Ketua/Sekretaris Kelas)

1. **Buka Form Isi Jurnal**
   - Masuk ke menu "Jurnal Hari Ini"
   - Klik tombol "Isi Jurnal Sekarang" pada sesi yang guru sudah konfirmasi

2. **Pilih Siswa yang Tidak Hadir**
   - **Sakit**: Pilih siswa dari dropdown "Siswa Sakit" → Klik tombol "+" merah
   - **Izin**: Pilih siswa dari dropdown "Siswa Izin" → Klik tombol "+" kuning
   - **Alpha**: Pilih siswa dari dropdown "Siswa Alpha" → Klik tombol "+" abu-abu

3. **Kelola List Siswa**
   - Siswa yang dipilih akan muncul di list di bawah dropdown
   - Untuk menghapus siswa dari list, klik tombol "×" merah di sebelah nama
   - Jumlah siswa hadir akan otomatis dihitung

4. **Simpan Jurnal**
   - Isi materi pelajaran
   - Tambahkan keterangan jika perlu
   - Klik "Simpan Jurnal"

### Untuk Admin

1. **Lihat Rekap Absensi**
   - Masuk ke menu "Rekap Absensi"
   - Pilih bulan untuk melihat rekap
   - Filter berdasarkan kelas atau status (sakit/izin/alpha)

2. **Lihat Detail Siswa**
   - Klik tombol "👁" pada baris siswa
   - Melihat riwayat ketidakhadiran per siswa
   - Menampilkan tanggal, mata pelajaran, dan status

3. **Export Data**
   - Export ke Excel (.xlsx)
   - Export ke PDF
   - Data mencakup semua siswa dengan rincian ketidakhadiran

## 📊 Struktur Data

### Data Jurnal (dengan Absensi)
```javascript
{
  id: "jrn_xxx",
  kelasId: "kls001",
  jadwalId: "jdw001",
  tanggal: "2026-05-14",
  materi: "Materi pelajaran",
  jumlahHadir: 23,
  jumlahSakit: 1,
  jumlahIzin: 1,
  jumlahAlpha: 0,
  absensi: {
    sakit: [
      { id: "siswa001", nis: "12345", nama: "Ahmad" }
    ],
    izin: [
      { id: "siswa002", nis: "12346", nama: "Budi" }
    ],
    alpha: []
  }
}
```

### Data Siswa
```javascript
{
  id: "siswa001",
  nis: "12345",
  nama: "Ahmad Fauzi",
  kelasId: "kls001",
  aktif: true
}
```

## 🎨 Tampilan UI

### Form Isi Jurnal
- Dropdown dengan placeholder "-- Pilih Siswa Sakit --"
- Tombol "+" berwarna sesuai kategori (merah/kuning/abu-abu)
- List siswa dengan background abu-abu terang
- Tombol hapus (×) merah di setiap item
- Ringkasan kehadiran otomatis update

### Rekap Absensi
- Tabel dengan kolom: No, Nama, Kelas, Sakit, Izin, Alpha, Total, Aksi
- Badge berwarna untuk setiap status
- Statistik di atas tabel (Total Siswa, Hadir Penuh, Tidak Hadir, Total Ketidakhadiran)
- Filter bulan, kelas, dan status

## 🔄 Alur Kerja

```
1. Guru konfirmasi kehadiran
   ↓
2. Siswa (ketua/sekretaris) buka form isi jurnal
   ↓
3. Pilih siswa yang tidak hadir dari dropdown
   ↓
4. Siswa terpilih masuk ke list
   ↓
5. Simpan jurnal dengan data absensi detail
   ↓
6. Data tersinkronisasi ke rekap absensi
   ↓
7. Admin/Guru bisa lihat rekap per siswa
```

## ⚠️ Validasi

1. **Duplikasi**: Siswa tidak bisa dipilih di lebih dari satu kategori
2. **Total Siswa**: Total tidak hadir tidak boleh melebihi jumlah siswa di kelas
3. **Materi Wajib**: Materi pelajaran harus diisi
4. **Konfirmasi Guru**: Jurnal hanya bisa diisi setelah guru konfirmasi

## 📝 Catatan Penting

- Data siswa harus sudah diimport terlebih dahulu melalui menu "Kelola Siswa"
- Jumlah siswa di kelas harus sudah tersinkronisasi
- Dropdown hanya menampilkan siswa aktif di kelas tersebut
- Data absensi tersimpan permanen dan bisa dilihat di rekap absensi

## 🚀 Keuntungan Fitur Ini

1. **Akurat**: Data siswa yang tidak hadir tercatat dengan detail
2. **Mudah**: Interface dropdown lebih user-friendly
3. **Terintegrasi**: Otomatis tersinkronisasi dengan rekap absensi
4. **Transparan**: Admin bisa tracking ketidakhadiran per siswa
5. **Laporan**: Data bisa diexport untuk keperluan administrasi

## 🔍 Troubleshooting

### Dropdown Kosong
- Pastikan data siswa sudah diimport
- Cek apakah siswa sudah diassign ke kelas yang benar
- Pastikan siswa dalam status aktif

### Data Tidak Muncul di Rekap
- Pastikan jurnal sudah disimpan dengan benar
- Cek filter bulan dan kelas di rekap absensi
- Refresh halaman jika perlu

### Siswa Tidak Bisa Dipilih
- Cek apakah siswa sudah dipilih di kategori lain
- Pastikan siswa masih aktif
- Cek apakah siswa masih terdaftar di kelas tersebut

## 📅 Update Log

**Versi 1.0 - 14 Mei 2026**
- ✅ Implementasi dropdown pemilihan siswa
- ✅ Sinkronisasi dengan rekap absensi
- ✅ Validasi duplikasi siswa
- ✅ UI/UX yang user-friendly
- ✅ Export data ke Excel dan PDF
