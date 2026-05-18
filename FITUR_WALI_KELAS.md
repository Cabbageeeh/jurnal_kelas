# Fitur Wali Kelas

## Deskripsi
Fitur ini menambahkan kemampuan untuk mengelola wali kelas pada data master kelas dan menampilkan informasi wali kelas di halaman data siswa serta rekap absensi.

## Fitur yang Ditambahkan

### 1. Data Master Kelas
- **Dropdown Wali Kelas**: Menambahkan dropdown untuk memilih wali kelas dari daftar guru aktif
- **Kolom Wali Kelas**: Menampilkan nama wali kelas di tabel data kelas
- **Opsional**: Wali kelas bersifat opsional, kelas dapat dibuat tanpa wali kelas

### 2. Data Master Siswa
- **Info Wali Kelas**: Menampilkan informasi wali kelas ketika memilih filter kelas tertentu
- **Alert Informatif**: 
  - Jika kelas memiliki wali kelas, ditampilkan alert biru dengan nama wali kelas
  - Jika kelas belum memiliki wali kelas, ditampilkan alert kuning sebagai peringatan

### 3. Rekap Absensi
- **Info Wali Kelas**: Menampilkan informasi wali kelas ketika memilih filter kelas tertentu
- **Alert Informatif**: Sama seperti di data siswa
- **Export PDF & XLSX**: Wali kelas ditampilkan di **header/filter** (bukan sebagai kolom)
  - Hanya muncul jika export **per-kelas** (bukan "Semua Kelas")
  - Format: `Periode: ... | Kelas: ... | Wali Kelas: ...`
  - Orientasi PDF: Portrait (tidak perlu landscape karena tidak ada kolom tambahan)

## Cara Penggunaan

### Menambah/Edit Wali Kelas pada Kelas

1. Buka menu **Data Master > Kelas**
2. Klik tombol **Tambah Kelas** atau **Edit** pada kelas yang sudah ada
3. Pada form modal, pilih **Wali Kelas** dari dropdown
   - Dropdown berisi daftar guru yang aktif
   - Pilihan "— Pilih Wali Kelas —" untuk tidak memilih wali kelas
4. Lengkapi data lainnya (Tingkat, Jurusan, Jumlah Siswa, Status)
5. Klik **Simpan**

### Melihat Wali Kelas di Data Siswa

1. Buka menu **Data Master > Data Siswa**
2. Pada bagian filter, pilih **Kelas** tertentu dari dropdown
3. Informasi wali kelas akan muncul di atas tabel siswa:
   - **Alert Biru**: Menampilkan nama wali kelas jika sudah diset
   - **Alert Kuning**: Peringatan jika kelas belum memiliki wali kelas
4. Untuk melihat semua siswa tanpa info wali kelas, pilih "Semua Kelas" pada filter

### Melihat Wali Kelas di Rekap Absensi

1. Buka menu **Laporan > Rekap Absensi**
2. Pilih **Bulan** dan **Kelas** tertentu dari filter
3. Informasi wali kelas akan muncul di atas tabel rekap:
   - **Alert Biru**: Menampilkan nama wali kelas jika sudah diset
   - **Alert Kuning**: Peringatan jika kelas belum memiliki wali kelas

### Export Rekap Absensi dengan Wali Kelas

1. Buka menu **Laporan > Rekap Absensi**
2. Pilih **Bulan** dan **Kelas tertentu** (bukan "Semua Kelas")
3. Klik tombol **Export PDF** atau **Export XLSX**
4. File yang didownload akan menampilkan **Wali Kelas di header**:
   - Format: `Periode: Januari 2026 | Kelas: X-1 | Wali Kelas: Budi Santoso, S.Pd`
   - Jika tidak ada wali kelas, info wali kelas tidak ditampilkan
   - Jika export "Semua Kelas", info wali kelas tidak ditampilkan

## Struktur Data

### Tabel Kelas (DB_KEYS.kelas)
```javascript
{
  id: "kls001",
  nama: "X-1",
  tingkat: "X",
  jurusan: "1",
  waliKelasId: "u002",  // ID guru yang menjadi wali kelas (nullable)
  jumlahSiswa: 35,
  aktif: true
}
```

### Relasi Data
- `waliKelasId` merujuk ke `id` pada tabel users dengan `role: "guru"`
- Jika `waliKelasId` bernilai `null` atau `""`, berarti kelas belum memiliki wali kelas

## File yang Dimodifikasi

### 1. JavaScript Files

**js/admin.js**
- `renderKelasTable()`: Menambahkan kolom wali kelas di tabel
- `openKelasModal()`: Menambahkan dropdown wali kelas dari daftar guru aktif
- `saveKelas()`: Menyimpan data waliKelasId ke database

**js/siswa.js**
- `renderSiswaTable()`: Menambahkan logika untuk menampilkan info wali kelas berdasarkan filter kelas

**js/absensi.js**
- `renderRekapAbsensi()`: Menambahkan logika untuk menampilkan info wali kelas berdasarkan filter kelas
- `exportRekapAbsensi()`: Menambahkan kolom wali kelas pada data export (PDF & XLSX)

### 2. HTML Files

**dashboard-admin.html**
- Modal Kelas: Menambahkan form group untuk dropdown wali kelas
- Tabel Kelas: Menambahkan kolom header "Wali Kelas" (total 8 kolom)
- Page Siswa: Menambahkan div `waliKelasInfo` untuk menampilkan info wali kelas
- Page Rekap Absensi: Menambahkan div `waliKelasInfoAbsensi` untuk menampilkan info wali kelas

## Format Export

### Header/Filter Export
Untuk export **per-kelas**, wali kelas ditampilkan di bagian header/filter:

```
Periode: Januari 2026 | Kelas: X-1 | Wali Kelas: Budi Santoso, S.Pd
```

**Catatan:**
- Wali kelas **hanya muncul** jika export untuk kelas tertentu (bukan "Semua Kelas")
- Jika kelas tidak memiliki wali kelas, info wali kelas tidak ditampilkan di header

### XLSX (Excel)
```
Header: Periode: Januari 2026 | Kelas: X-1 | Wali Kelas: Budi Santoso, S.Pd

| No | NIS | Nama Siswa | Gender | Kelas | Sakit | Izin | Alpha | Total |
|----|-----|------------|--------|-------|-------|------|-------|-------|
| 1  | ... | ...        | ...    | X-1   | 2     | 1    | 0     | 3     |
```

### PDF
- Orientasi: **Portrait** (tidak ada kolom tambahan)
- Header: Informasi sekolah lengkap dengan logo
- Filter: Menampilkan periode, kelas, dan wali kelas (jika ada)
- Kolom: Sama seperti sebelumnya (tanpa kolom wali kelas)

## Catatan Penting

- Wali kelas hanya bisa dipilih dari guru yang statusnya **aktif**
- Satu guru dapat menjadi wali kelas untuk beberapa kelas
- Jika guru dinonaktifkan, wali kelas tetap tersimpan tetapi tidak akan muncul di dropdown saat edit
- Info wali kelas hanya muncul ketika filter kelas dipilih (tidak muncul untuk "Semua Kelas")
- Fitur ini tidak mempengaruhi data siswa atau absensi yang sudah ada
- Export PDF menggunakan orientasi **portrait** (tidak ada kolom tambahan)
- Wali kelas di export hanya muncul di **header/filter**, bukan sebagai kolom tabel
- Export "Semua Kelas" tidak menampilkan info wali kelas di header

## Pengembangan Selanjutnya (Opsional)

1. Menambahkan validasi agar satu guru tidak menjadi wali kelas lebih dari X kelas
2. Menampilkan daftar kelas yang diampu wali kelas di profil guru
3. Menambahkan notifikasi ke wali kelas untuk aktivitas kelas tertentu
4. Export data siswa per kelas dengan info wali kelas
5. Dashboard khusus wali kelas untuk monitoring kelas yang diampu
6. Laporan khusus wali kelas (absensi, jurnal, dll)

