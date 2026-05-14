# Perubahan Format Kelas

## Ringkasan Perubahan

Sistem kelas telah diubah dari format penjurusan IPA/IPS/Bahasa menjadi format yang sesuai dengan sistem sekolah SMAN 15 Surabaya:

### Format Lama:
- Kelas 10: X IPA 1, X IPS 1, dll
- Kelas 11: XI IPA 1, XI IPS 1, dll
- Kelas 12: XII IPA 1, XII IPS 1, dll

### Format Baru:
- **Kelas 10**: X-1, X-2, X-3, ... X-12 (tanpa penjurusan)
- **Kelas 11**: XI-A, XI-B, XI-C, XI-D, XI-E, XI-F, XI-G
- **Kelas 12**: XII-A, XII-B, XII-C, XII-D, XII-E, XII-F, XII-G

## File yang Diubah

### 1. `js/data.js`
- **INITIAL_KELAS**: Data awal kelas diubah ke format baru
  - `kls001`: X-1 (sebelumnya X IPA 1)
  - `kls002`: X-2 (sebelumnya X IPA 2)
  - `kls003`: X-3 (sebelumnya X IPS 1)
  - `kls004`: XI-A (sebelumnya XI IPA 1)
  - `kls005`: XI-B (sebelumnya XI IPS 1)
  - `kls006`: XII-A (sebelumnya XII IPA 1)

- **INITIAL_USERS**: Nama siswa contoh diubah dari "Siswa X IPA 2" menjadi "Siswa X-2"

### 2. `dashboard-admin.html`
- **Modal Form Kelas**: 
  - Input nama kelas diubah menjadi hidden field (nama di-generate otomatis)
  - Dropdown jurusan sekarang dinamis berdasarkan tingkat:
    - Kelas X: menampilkan nomor 1-12
    - Kelas XI & XII: menampilkan huruf A-G
  - Ditambahkan event `onchange="updateJurusanOptions()"` pada dropdown tingkat
  - Ditambahkan hint text: "Kelas X: 1-12 | Kelas XI & XII: A-G"

### 3. `js/admin.js`
- **Fungsi `openKelasModal()`**: 
  - Memanggil `updateJurusanOptions()` saat modal dibuka
  - Mengatur nilai default jurusan menjadi kosong
  
- **Fungsi `updateJurusanOptions()` (BARU)**:
  - Mengubah opsi dropdown jurusan secara dinamis
  - Kelas X: generate nomor 1-12
  - Kelas XI & XII: generate huruf A-G

- **Fungsi `saveKelas()`**:
  - Nama kelas sekarang di-generate otomatis: `${tingkat}-${jurusan}`
  - Validasi diubah dari "Nama kelas wajib diisi" menjadi "Jurusan/Nomor kelas wajib dipilih"
  - Input nama manual dihapus

### 4. `js/import.js`
- **Template Download Kelas**:
  - Contoh data diubah ke format baru (X-1, X-2, XI-A, XII-A, dll)
  - Petunjuk pengisian diperjelas dengan format baru:
    - Kelas X: jurusan diisi nomor 1-12
    - Kelas XI & XII: jurusan diisi huruf A-G
  - Ditambahkan lebih banyak contoh (7 contoh vs 3 sebelumnya)
  
- **Template Download Users**:
  - Contoh kelas_nama diubah dari "X IPA 1" menjadi "X-1", "XI-A", "XII-B"
  - Ditambahkan lebih banyak contoh siswa dengan berbagai kelas

### 5. `js/export.js`
- Tidak ada perubahan kode diperlukan
- Export PDF dan XLSX akan otomatis menggunakan nama kelas baru dari database
- Format export tetap sama, hanya data yang berubah

## Cara Menggunakan

### Menambah Kelas Baru (Manual):

1. Login sebagai Admin (username: `admin`, password: `admin123`)
2. Buka menu **Kelola Kelas**
3. Klik tombol **+ Tambah Kelas**
4. Pilih **Tingkat**:
   - X (Kelas 10)
   - XI (Kelas 11)
   - XII (Kelas 12)
5. Pilih **Jurusan/Nomor**:
   - Jika tingkat X: pilih nomor 1-12
   - Jika tingkat XI atau XII: pilih huruf A-G
6. Isi **Jumlah Siswa**
7. Pilih **Status** (Aktif/Nonaktif)
8. Klik **Simpan**

Nama kelas akan otomatis dibuat dengan format: `{Tingkat}-{Jurusan/Nomor}`

### Contoh:
- Tingkat: X, Nomor: 5 → Nama kelas: **X-5**
- Tingkat: XI, Jurusan: C → Nama kelas: **XI-C**
- Tingkat: XII, Jurusan: F → Nama kelas: **XII-F**

### Import Data Kelas dari Excel:

1. Login sebagai Admin
2. Buka menu **Kelola Kelas**
3. Klik tombol **Import Data**
4. Download template Excel dengan klik **Download Template Kelas**
5. Isi template sesuai format:
   - **nama**: Format {Tingkat}-{Jurusan/Nomor} (contoh: X-1, XI-A, XII-B)
   - **tingkat**: X / XI / XII
   - **jurusan**: 
     - Untuk kelas X: isi nomor 1-12
     - Untuk kelas XI & XII: isi huruf A-G
   - **jumlahSiswa**: Total siswa (angka)
6. Upload file Excel yang sudah diisi
7. Klik **Proses File**
8. Review data yang akan diimport
9. Klik **Import Data**

### Export Data:

Export PDF dan XLSX akan otomatis menggunakan format kelas baru. Tidak ada perubahan cara export, hanya data yang ditampilkan menggunakan format baru (X-1, XI-A, dll).

## Catatan Penting

1. **Data Lama**: Jika Anda sudah memiliki data kelas dengan format lama di localStorage, Anda perlu:
   - Hapus localStorage browser (F12 → Application → Local Storage → Clear)
   - Atau jalankan `resetDB()` di console browser
   - Refresh halaman untuk load data baru

2. **Kompatibilitas**: Semua fitur lain (jadwal, jurnal, konfirmasi, dll) tetap berfungsi normal dengan format kelas baru

3. **Fleksibilitas**: Sistem masih menyimpan field `jurusan` di database, sehingga mudah untuk dikembangkan lebih lanjut jika diperlukan

## Testing

Untuk menguji perubahan:

1. Buka `index.html` di browser
2. Login sebagai admin
3. Buka menu "Kelola Kelas"
4. Coba tambah kelas baru dengan berbagai kombinasi tingkat dan jurusan
5. Verifikasi nama kelas ter-generate dengan benar
6. Cek apakah kelas baru muncul di dropdown saat membuat jadwal

## Rollback

Jika ingin kembali ke format lama, restore file-file berikut dari git history:
- `js/data.js`
- `js/admin.js`
- `dashboard-admin.html`
