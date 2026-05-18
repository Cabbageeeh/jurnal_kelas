# Changelog - Fitur Wali Kelas

## Versi 1.1 - Penambahan Wali Kelas di Rekap Absensi
**Tanggal:** 18 Mei 2026

### ✨ Fitur Baru

#### Rekap Absensi
- ✅ Menampilkan info wali kelas di halaman rekap absensi ketika filter kelas dipilih
- ✅ Alert informatif (biru jika ada wali kelas, kuning jika belum ada)
- ✅ Wali kelas ditampilkan di **header/filter** pada export XLSX & PDF
- ✅ Wali kelas **hanya muncul** untuk export per-kelas (bukan "Semua Kelas")
- ✅ Tidak ada kolom tambahan di tabel export (tetap portrait)

### 📝 File yang Dimodifikasi

#### 1. js/absensi.js
```javascript
// Fungsi yang diupdate:
- renderRekapAbsensi()
  → Menambahkan logika untuk menampilkan info wali kelas
  → Menambahkan elemen waliKelasInfoAbsensi

- exportRekapAbsensi()
  → Menambahkan wali kelas pada filter/header (bukan kolom)
  → Logika: if (kelasId) { ambil wali kelas dan tambahkan ke filter }
  → Orientasi PDF tetap portrait
```

#### 2. dashboard-admin.html
```html
<!-- Penambahan elemen -->
<div id="waliKelasInfoAbsensi"></div>
<!-- Ditempatkan sebelum tabel rekap absensi -->
```

### 📊 Format Export

#### Header/Filter
Untuk export **per-kelas**, wali kelas muncul di header:
```
Periode: Januari 2026 | Kelas: X-1 | Wali Kelas: Budi Santoso, S.Pd
```

#### XLSX
```
Header: Periode: Januari 2026 | Kelas: X-1 | Wali Kelas: Budi Santoso, S.Pd

| No | NIS | Nama Siswa | Gender | Kelas | Sakit | Izin | Alpha | Total |
|----|-----|------------|--------|-------|-------|------|-------|-------|
```

#### PDF
- Orientasi: **Portrait** (tidak ada kolom tambahan)
- Filter menampilkan wali kelas (jika export per-kelas)
- Kolom tabel sama seperti sebelumnya

---

## Versi 1.0 - Implementasi Awal Fitur Wali Kelas
**Tanggal:** 18 Mei 2026

### ✨ Fitur Baru

#### Data Master Kelas
- ✅ Dropdown untuk memilih wali kelas dari daftar guru aktif
- ✅ Kolom "Wali Kelas" di tabel data kelas
- ✅ Field waliKelasId di database (nullable)

#### Data Master Siswa
- ✅ Info wali kelas muncul ketika filter kelas dipilih
- ✅ Alert informatif (biru/kuning)

### 📝 File yang Dimodifikasi

#### 1. js/admin.js
```javascript
// Fungsi yang diupdate:
- renderKelasTable()
  → Menambahkan kolom wali kelas
  → Menampilkan nama guru atau "Belum ada"

- openKelasModal()
  → Populate dropdown wali kelas dari guru aktif
  → Set value waliKelasId saat edit

- saveKelas()
  → Menyimpan field waliKelasId
```

#### 2. js/siswa.js
```javascript
// Fungsi yang diupdate:
- renderSiswaTable()
  → Menambahkan logika info wali kelas
  → Menampilkan alert berdasarkan kondisi
```

#### 3. dashboard-admin.html
```html
<!-- Modal Kelas -->
<div class="form-group">
  <label>Wali Kelas</label>
  <select id="kelasWaliKelasId">...</select>
</div>

<!-- Tabel Kelas -->
<th>Wali Kelas</th> <!-- Kolom baru -->

<!-- Page Siswa -->
<div id="waliKelasInfo"></div>
```

### 🗄️ Struktur Database

```javascript
// DB_KEYS.kelas
{
  id: "kls001",
  nama: "X-1",
  tingkat: "X",
  jurusan: "1",
  waliKelasId: "u002",  // ← Field baru (nullable)
  jumlahSiswa: 35,
  aktif: true
}
```

---

## 📋 Ringkasan Perubahan

### Total File yang Dimodifikasi: 4
1. ✅ js/admin.js
2. ✅ js/siswa.js
3. ✅ js/absensi.js
4. ✅ dashboard-admin.html

### Total Fungsi yang Diupdate: 6
1. ✅ renderKelasTable()
2. ✅ openKelasModal()
3. ✅ saveKelas()
4. ✅ renderSiswaTable()
5. ✅ renderRekapAbsensi()
6. ✅ exportRekapAbsensi()

### Fitur yang Ditambahkan: 7
1. ✅ Dropdown wali kelas di form kelas
2. ✅ Kolom wali kelas di tabel kelas
3. ✅ Info wali kelas di data siswa
4. ✅ Info wali kelas di rekap absensi
5. ✅ Kolom wali kelas di export XLSX
6. ✅ Kolom wali kelas di export PDF
7. ✅ Alert informatif untuk status wali kelas

---

## 🎯 Cara Testing

### 1. Test Data Master Kelas
```
1. Buka Data Master > Kelas
2. Klik "Tambah Kelas"
3. Pilih wali kelas dari dropdown
4. Simpan dan verifikasi nama wali kelas muncul di tabel
```

### 2. Test Data Siswa
```
1. Buka Data Master > Data Siswa
2. Pilih kelas tertentu dari filter
3. Verifikasi alert wali kelas muncul di atas tabel
```

### 3. Test Rekap Absensi
```
1. Buka Laporan > Rekap Absensi
2. Pilih bulan dan kelas tertentu (bukan "Semua Kelas")
3. Verifikasi alert wali kelas muncul
4. Export ke XLSX → Cek header/filter ada "Wali Kelas: ..."
5. Export ke PDF → Cek header/filter ada "Wali Kelas: ..."
6. Export "Semua Kelas" → Verifikasi tidak ada info wali kelas di header
```

---

## 🐛 Known Issues
Tidak ada issue yang diketahui saat ini.

---

## 📚 Dokumentasi
Dokumentasi lengkap tersedia di: `FITUR_WALI_KELAS.md`
