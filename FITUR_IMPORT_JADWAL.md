# 📅 Fitur Import Jadwal - Dokumentasi

## ✅ Status: SELESAI

Fitur import jadwal telah berhasil ditambahkan ke sistem Jurnal Kelas Digital.

---

## 🎯 Fitur Baru

### **Import Jadwal dari Excel**
Sekarang Anda bisa import jadwal pelajaran secara massal menggunakan file Excel, tidak perlu input satu per satu lagi!

---

## 📋 Cara Menggunakan

### **1. Download Template Jadwal**

1. Login sebagai **Admin** (`admin` / `admin123`)
2. Buka menu **Jadwal Pelajaran**
3. Klik tombol **Import Data** (jika ada) atau gunakan menu **Kelola Kelas** → **Import Data**
4. Pilih **Download Template Jadwal**
5. File Excel akan ter-download dengan nama `template_jadwal.xlsx`

### **2. Isi Template Excel**

Buka file Excel yang sudah di-download, akan ada 2 sheet:

#### **Sheet "Jadwal"**

| hari   | jam_ke | guru_nama            | kelas_nama | mapel_kode |
|--------|--------|----------------------|------------|------------|
| Senin  | 1,2    | Budi Santoso, S.Pd   | X-1        | MTK        |
| Senin  | 3      | Siti Rahayu, S.Pd    | X-1        | BIND       |
| Senin  | 4,5    | Ahmad Fauzi, M.Pd    | XI-A       | FIS        |
| Selasa | 1,2    | Budi Santoso, S.Pd   | X-2        | MTK        |
| Selasa | 6,7    | Dewi Lestari, S.Pd   | XII-A      | BIO        |

**Kolom:**
- **hari**: Senin / Selasa / Rabu / Kamis / Jumat / Sabtu
- **jam_ke**: Nomor jam pelajaran (bisa lebih dari 1, pisahkan dengan koma)
  - Contoh: `1` atau `1,2` atau `1,2,3`
- **guru_nama**: Nama lengkap guru (harus **sama persis** dengan data guru)
- **kelas_nama**: Nama kelas dengan format baru (X-1, XI-A, XII-B)
- **mapel_kode**: Kode mata pelajaran (harus sama dengan data mapel)

#### **Sheet "Petunjuk"**

Berisi petunjuk lengkap pengisian template.

---

## ⚠️ Catatan Penting

### **Sebelum Import Jadwal:**

1. **Import data lain terlebih dahulu:**
   - ✅ Import **Mata Pelajaran** (Mapel) dulu
   - ✅ Import **Kelas** dulu
   - ✅ Import **Guru** (Users dengan role guru) dulu

2. **Pastikan ada Periode Aktif:**
   - Buka menu **Periode / Semester**
   - Pastikan ada periode yang statusnya **Aktif**
   - Jadwal akan otomatis terikat ke periode aktif

### **Validasi Otomatis:**

Sistem akan otomatis validasi:
- ✅ Nama guru harus ada di database
- ✅ Nama kelas harus ada di database
- ✅ Kode mapel harus ada di database
- ✅ Hari harus valid (Senin-Sabtu)
- ✅ Jam pelajaran harus valid
- ✅ Tidak boleh konflik (guru tidak bisa 2 kelas di jam yang sama)
- ✅ Tidak boleh konflik (kelas tidak bisa 2 guru di jam yang sama)

### **Data yang Tidak Valid:**

- Akan ditandai dengan **baris merah** di preview
- Akan ada badge **Error** atau **Duplikat**
- Tidak akan diimport ke sistem
- Hanya data yang valid yang akan diimport

---

## 📝 Contoh Pengisian

### **Contoh 1: Jadwal Sederhana**
```
Senin, 1,2, Budi Santoso S.Pd, X-1, MTK
```
- Hari Senin
- Jam 1-2 (2 jam pelajaran)
- Pak Budi mengajar Matematika
- Di kelas X-1

### **Contoh 2: Jadwal 3 Jam**
```
Rabu, 4,5,6, Siti Rahayu S.Pd, XI-A, BIND
```
- Hari Rabu
- Jam 4-5-6 (3 jam pelajaran)
- Bu Siti mengajar Bahasa Indonesia
- Di kelas XI-A

### **Contoh 3: Jadwal 1 Jam**
```
Kamis, 7, Ahmad Fauzi M.Pd, XII-B, KIM
```
- Hari Kamis
- Jam 7 (1 jam pelajaran)
- Pak Ahmad mengajar Kimia
- Di kelas XII-B

---

## 🚀 Langkah Import

### **1. Persiapan**
```
✅ Sudah ada data Guru
✅ Sudah ada data Kelas (format baru: X-1, XI-A, XII-B)
✅ Sudah ada data Mapel
✅ Sudah ada Periode Aktif
```

### **2. Download & Isi Template**
1. Download template jadwal
2. Isi sesuai format
3. Simpan file Excel

### **3. Upload & Preview**
1. Klik **Import Data**
2. Upload file Excel
3. Klik **Proses File**
4. Sistem akan menampilkan preview:
   - ✅ Data valid (baris putih)
   - ❌ Data error (baris merah)

### **4. Import**
1. Review preview data
2. Klik **Import Data**
3. Hanya data valid yang akan diimport
4. Selesai!

---

## 🔍 Troubleshooting

### **❌ Guru tidak ditemukan**
**Penyebab:** Nama guru di Excel tidak sama persis dengan nama di database

**Solusi:**
- Cek nama guru di menu **Kelola Pengguna**
- Pastikan nama di Excel **sama persis** (termasuk spasi, titik, koma)
- Contoh: `Budi Santoso, S.Pd` bukan `Budi Santoso S.Pd` (perhatikan koma)

### **❌ Kelas tidak ditemukan**
**Penyebab:** Nama kelas di Excel tidak sama dengan nama di database

**Solusi:**
- Cek nama kelas di menu **Kelola Kelas**
- Pastikan menggunakan format baru: `X-1`, `XI-A`, `XII-B`
- Bukan format lama: `X IPA 1`, `XI IPA 1`

### **❌ Mapel tidak ditemukan**
**Penyebab:** Kode mapel di Excel tidak ada di database

**Solusi:**
- Cek kode mapel di menu **Kelola Mata Pelajaran**
- Gunakan kode yang sudah ada (MTK, FIS, KIM, dll)
- Atau import mapel dulu sebelum import jadwal

### **❌ Konflik jadwal**
**Penyebab:** Guru sudah ada jadwal di jam yang sama

**Solusi:**
- Cek jadwal yang sudah ada
- Ubah jam pelajaran di Excel
- Atau hapus jadwal lama yang konflik

### **❌ Tidak ada periode aktif**
**Penyebab:** Belum ada periode/semester yang aktif

**Solusi:**
- Buka menu **Periode / Semester**
- Tambah periode baru atau aktifkan periode yang ada
- Set status menjadi **Aktif**

---

## 📊 Format Data

### **Hari (Valid)**
```
Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
```

### **Jam Pelajaran**
```
1 jam:    1
2 jam:    1,2
3 jam:    1,2,3
4 jam:    4,5,6,7
```

### **Nama Guru**
```
✅ Benar: Budi Santoso, S.Pd
❌ Salah: Budi Santoso S.Pd (tanpa koma)
❌ Salah: budi santoso, s.pd (huruf kecil)
```

### **Nama Kelas (Format Baru)**
```
✅ Benar: X-1, X-2, XI-A, XII-B
❌ Salah: X IPA 1, XI IPA 1 (format lama)
```

### **Kode Mapel**
```
✅ Benar: MTK, FIS, KIM, BIO
❌ Salah: Matematika, Fisika (gunakan kode, bukan nama)
```

---

## 💡 Tips

1. **Import Bertahap:**
   - Import Mapel → Kelas → Guru → Jadwal
   - Jangan langsung import jadwal tanpa data pendukung

2. **Cek Preview:**
   - Selalu cek preview sebelum import
   - Perbaiki data yang error di Excel
   - Upload ulang dan proses lagi

3. **Backup Data:**
   - Export jadwal lama sebelum import baru
   - Atau catat jadwal lama sebagai backup

4. **Test dengan Data Kecil:**
   - Coba import 5-10 jadwal dulu
   - Jika berhasil, baru import semua

5. **Format Konsisten:**
   - Gunakan format yang sama untuk semua data
   - Jangan campur format lama dan baru

---

## 📁 File yang Dimodifikasi

### **js/import.js**
- ✅ Ditambahkan template jadwal
- ✅ Ditambahkan fungsi `parseJadwal()`
- ✅ Ditambahkan fungsi `renderPreviewJadwal()`
- ✅ Update fungsi `konfirmasiImport()` untuk save jadwal
- ✅ Update variabel `importData` untuk include jadwal

---

## ✨ Keuntungan Fitur Ini

### **Sebelum (Manual):**
- ❌ Input jadwal satu per satu
- ❌ Butuh waktu lama untuk 1 minggu jadwal
- ❌ Rawan salah input
- ❌ Sulit untuk update massal

### **Sesudah (Import Excel):**
- ✅ Import puluhan jadwal sekaligus
- ✅ Cepat dan efisien
- ✅ Validasi otomatis
- ✅ Preview sebelum import
- ✅ Mudah update massal (edit Excel, import ulang)

---

## 🎓 Contoh Kasus Penggunaan

### **Kasus 1: Jadwal Baru Semester**
1. Download template jadwal
2. Isi jadwal untuk 1 minggu (Senin-Sabtu)
3. Upload dan import
4. Selesai! Jadwal 1 minggu langsung masuk

### **Kasus 2: Update Jadwal**
1. Export jadwal lama (jika perlu backup)
2. Edit jadwal di Excel
3. Import ulang
4. Jadwal ter-update

### **Kasus 3: Jadwal Multiple Guru**
1. Buat jadwal untuk semua guru di 1 file Excel
2. Import sekaligus
3. Sistem otomatis validasi konflik
4. Hanya jadwal valid yang masuk

---

## 📞 Support

Jika ada masalah:
1. Cek dokumentasi ini
2. Cek preview import untuk error message
3. Pastikan format data sesuai
4. Pastikan data pendukung (guru, kelas, mapel) sudah ada

---

**Selamat menggunakan fitur import jadwal!** 🎉

Dengan fitur ini, setup jadwal semester baru jadi jauh lebih cepat dan mudah!
