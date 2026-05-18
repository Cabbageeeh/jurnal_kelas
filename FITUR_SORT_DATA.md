# Fitur Sort Data Siswa dan Rekap Absensi

## Deskripsi
Fitur ini menambahkan kemampuan untuk mengurutkan (sort) data pada tampilan **Data Master Siswa** dan **Rekap Absensi** berdasarkan berbagai kriteria.

## Fitur yang Ditambahkan

### 1. Data Master Siswa
Dropdown "Urutkan" dengan pilihan:
- **Nama (A-Z)** - Default, mengurutkan berdasarkan nama siswa secara alfabetis
- **NIS** - Mengurutkan berdasarkan Nomor Induk Siswa
- **Kelas** - Mengurutkan berdasarkan nama kelas (X-1, X-2, XI-A, dll)
- **Gender** - Mengurutkan berdasarkan jenis kelamin (L/P)

### 2. Rekap Absensi
Dropdown "Urutkan" dengan pilihan:
- **Total (Terbanyak)** - Default, mengurutkan berdasarkan total ketidakhadiran (terbanyak ke tersedikit)
- **Nama (A-Z)** - Mengurutkan berdasarkan nama siswa secara alfabetis
- **NIS** - Mengurutkan berdasarkan Nomor Induk Siswa
- **Kelas** - Mengurutkan berdasarkan nama kelas
- **Sakit (Terbanyak)** - Mengurutkan berdasarkan jumlah sakit (terbanyak ke tersedikit)
- **Izin (Terbanyak)** - Mengurutkan berdasarkan jumlah izin (terbanyak ke tersedikit)
- **Alpha (Terbanyak)** - Mengurutkan berdasarkan jumlah alpha (terbanyak ke tersedikit)

## Cara Penggunaan

### Data Master Siswa

1. Buka menu **Data Master > Data Siswa**
2. Pada bagian filter, pilih kriteria sort dari dropdown **"Urutkan"**
3. Data siswa akan otomatis diurutkan sesuai pilihan
4. Kombinasikan dengan filter lain (Cari, Kelas, Gender) untuk hasil yang lebih spesifik
5. Klik tombol **Reset** untuk mengembalikan ke pengaturan default

**Contoh Penggunaan:**
- Ingin melihat siswa berdasarkan kelas → Pilih "Kelas"
- Ingin mencari siswa berdasarkan NIS → Pilih "NIS"
- Ingin melihat siswa laki-laki terlebih dahulu → Pilih "Gender"

### Rekap Absensi

1. Buka menu **Laporan > Rekap Absensi**
2. Pilih **Bulan** terlebih dahulu
3. Pada bagian filter, pilih kriteria sort dari dropdown **"Urutkan"**
4. Data rekap akan otomatis diurutkan sesuai pilihan
5. Kombinasikan dengan filter lain (Kelas, Status) untuk analisis yang lebih detail
6. Klik tombol **Reset** untuk mengembalikan ke pengaturan default

**Contoh Penggunaan:**
- Ingin melihat siswa dengan ketidakhadiran terbanyak → Pilih "Total (Terbanyak)" (default)
- Ingin melihat siswa yang paling sering sakit → Pilih "Sakit (Terbanyak)"
- Ingin melihat siswa yang paling sering alpha → Pilih "Alpha (Terbanyak)"
- Ingin melihat data berdasarkan nama → Pilih "Nama (A-Z)"

## Implementasi Teknis

### File yang Dimodifikasi

#### 1. js/siswa.js
```javascript
// Fungsi yang diupdate:
- renderSiswaTable()
  → Menambahkan parameter sortBy dari dropdown
  → Implementasi switch case untuk berbagai kriteria sort
  → Sort options: nama, nis, kelas, gender

- clearFilterSiswa()
  → Reset dropdown sort ke "nama" (default)
```

#### 2. js/absensi.js
```javascript
// Fungsi yang diupdate:
- renderRekapAbsensi()
  → Menambahkan parameter sortBy dari dropdown
  → Implementasi switch case untuk berbagai kriteria sort
  → Sort options: total, nama, nis, kelas, sakit, izin, alpha

- clearFilterAbsensi()
  → Reset dropdown sort ke "total" (default)
```

#### 3. dashboard-admin.html
```html
<!-- Data Siswa: Menambahkan dropdown sort -->
<div>
  <label class="form-label">Urutkan</label>
  <select class="form-control" id="sortSiswa" onchange="renderSiswaTable()">
    <option value="nama">Nama (A-Z)</option>
    <option value="nis">NIS</option>
    <option value="kelas">Kelas</option>
    <option value="gender">Gender</option>
  </select>
</div>

<!-- Rekap Absensi: Menambahkan dropdown sort -->
<div>
  <label class="form-label">Urutkan</label>
  <select class="form-control" id="sortAbsensi" onchange="renderRekapAbsensi()">
    <option value="total">Total (Terbanyak)</option>
    <option value="nama">Nama (A-Z)</option>
    <option value="nis">NIS</option>
    <option value="kelas">Kelas</option>
    <option value="sakit">Sakit (Terbanyak)</option>
    <option value="izin">Izin (Terbanyak)</option>
    <option value="alpha">Alpha (Terbanyak)</option>
  </select>
</div>
```

## Logika Sort

### Data Siswa

```javascript
switch (sortBy) {
  case "nama":
    siswaList.sort((a, b) => a.nama.localeCompare(b.nama));
    break;
  case "nis":
    siswaList.sort((a, b) => a.nis.localeCompare(b.nis));
    break;
  case "kelas":
    siswaList.sort((a, b) => {
      const kelasA = dbGetById(DB_KEYS.kelas, a.kelasId)?.nama || "";
      const kelasB = dbGetById(DB_KEYS.kelas, b.kelasId)?.nama || "";
      return kelasA.localeCompare(kelasB);
    });
    break;
  case "gender":
    siswaList.sort((a, b) => {
      const genderA = a.gender || "";
      const genderB = b.gender || "";
      return genderA.localeCompare(genderB);
    });
    break;
}
```

### Rekap Absensi

```javascript
switch (sortBy) {
  case "nama":
    filteredData.sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));
    break;
  case "nis":
    filteredData.sort((a, b) => a.siswa.nis.localeCompare(b.siswa.nis));
    break;
  case "kelas":
    filteredData.sort((a, b) => {
      const kelasA = a.kelas?.nama || "";
      const kelasB = b.kelas?.nama || "";
      return kelasA.localeCompare(kelasB);
    });
    break;
  case "total":
    filteredData.sort((a, b) => b.total - a.total); // Descending
    break;
  case "sakit":
    filteredData.sort((a, b) => b.sakit - a.sakit); // Descending
    break;
  case "izin":
    filteredData.sort((a, b) => b.izin - a.izin); // Descending
    break;
  case "alpha":
    filteredData.sort((a, b) => b.alpha - a.alpha); // Descending
    break;
}
```

## Keuntungan Fitur

1. ✅ **Fleksibilitas**: Pengguna dapat mengurutkan data sesuai kebutuhan
2. ✅ **Analisis Lebih Mudah**: Memudahkan identifikasi pola (siswa dengan absensi terbanyak, dll)
3. ✅ **Kombinasi Filter**: Dapat dikombinasikan dengan filter lain untuk hasil yang lebih spesifik
4. ✅ **User Friendly**: Dropdown yang intuitif dan mudah digunakan
5. ✅ **Real-time**: Sorting langsung diterapkan saat memilih opsi
6. ✅ **Konsisten**: Implementasi yang sama di kedua halaman

## Use Case

### Data Siswa
- **Guru/Admin** ingin melihat daftar siswa berdasarkan kelas untuk keperluan administrasi
- **Admin** ingin mencari siswa berdasarkan NIS yang terurut
- **Wali Kelas** ingin melihat siswa laki-laki dan perempuan secara terpisah

### Rekap Absensi
- **Wali Kelas** ingin mengidentifikasi siswa dengan ketidakhadiran terbanyak untuk tindak lanjut
- **BK** ingin melihat siswa yang sering sakit untuk konseling kesehatan
- **Admin** ingin melihat siswa yang sering alpha untuk peringatan
- **Guru** ingin melihat data absensi berdasarkan nama untuk laporan

## Catatan Penting

- Sort dilakukan setelah filter diterapkan
- Default sort untuk Data Siswa: **Nama (A-Z)**
- Default sort untuk Rekap Absensi: **Total (Terbanyak)**
- Sort tidak mempengaruhi data di database, hanya tampilan
- Tombol Reset akan mengembalikan sort ke default
- Sort bekerja dengan data yang sudah difilter

## Testing Checklist

- [x] Sort Data Siswa berdasarkan Nama
- [x] Sort Data Siswa berdasarkan NIS
- [x] Sort Data Siswa berdasarkan Kelas
- [x] Sort Data Siswa berdasarkan Gender
- [x] Sort Rekap Absensi berdasarkan Total
- [x] Sort Rekap Absensi berdasarkan Nama
- [x] Sort Rekap Absensi berdasarkan NIS
- [x] Sort Rekap Absensi berdasarkan Kelas
- [x] Sort Rekap Absensi berdasarkan Sakit
- [x] Sort Rekap Absensi berdasarkan Izin
- [x] Sort Rekap Absensi berdasarkan Alpha
- [x] Kombinasi sort dengan filter lain
- [x] Reset filter mengembalikan sort ke default
- [x] Tidak ada error diagnostik

## Pengembangan Selanjutnya (Opsional)

1. Menambahkan sort ascending/descending toggle
2. Menambahkan sort berdasarkan tanggal dibuat
3. Menambahkan sort berdasarkan status aktif/nonaktif
4. Menyimpan preferensi sort user di localStorage
5. Menambahkan indikator visual untuk kolom yang sedang di-sort
6. Menambahkan sort multi-level (sort by kelas, then by nama)
