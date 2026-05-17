# Contoh Template Import Data Siswa

## ⚠️ PENTING: Data Siswa vs Pengguna Siswa

### 📊 Data Siswa (Template Ini)
- **Tujuan:** Rekap absensi saja
- **Tidak bisa login** ke sistem
- **Untuk:** Semua siswa di sekolah
- **Kolom:** NIS, Nama, Kelas
- **✨ Bonus:** Otomatis update jumlah siswa di data master kelas

### 🔐 Pengguna Siswa (Template Berbeda)
- **Tujuan:** Login ke sistem web
- **Bisa login** dengan username & password
- **Untuk:** Ketua & Sekretaris kelas saja
- **Kolom:** Nama, Username, Password, Role, Kelas, Jabatan
- **Import via:** Template Pengguna (bukan template ini)

---

## ✨ Fitur Auto-Update Jumlah Siswa

Ketika Anda import data siswa menggunakan template ini:

1. ✅ **Sistem otomatis menghitung** jumlah siswa per kelas
2. ✅ **Sistem otomatis update** field `jumlahSiswa` di data master kelas
3. ✅ **Form jurnal otomatis menampilkan** jumlah siswa yang akurat
4. ✅ **Tidak perlu input manual** jumlah siswa lagi

**Contoh:**
```
Import 35 siswa untuk kelas X-1
  ↓
Sistem otomatis: Kelas X-1 → jumlahSiswa = 35
  ↓
Siswa isi jurnal → Tampil: "Total Siswa di Kelas: 35 Siswa"
  ↓
Input yang tidak hadir → Sistem hitung otomatis yang hadir
```

**Manfaat:**
- ✅ Lebih efisien (tidak perlu input manual)
- ✅ Lebih akurat (sistem yang menghitung)
- ✅ Selalu sinkron dengan data siswa
- ✅ Form jurnal selalu menampilkan jumlah yang benar

---

## 📋 Format Template Excel

Template untuk import data siswa memiliki 4 kolom wajib:

| Kolom | Deskripsi | Contoh | Wajib |
|-------|-----------|--------|-------|
| **nis** | Nomor Induk Siswa (unik) | 12345 | ✅ Ya |
| **nama** | Nama lengkap siswa | Ahmad Fauzi | ✅ Ya |
| **gender** | Jenis kelamin (L/P) | L | ✅ Ya |
| **kelas_nama** | Nama kelas (harus sama dengan data kelas) | X-1 | ✅ Ya |

### 📝 Format Gender
- **L** = Laki-laki
- **P** = Perempuan
- Bisa juga menggunakan: `Laki-laki`, `Perempuan`, `LAKI-LAKI`, `PEREMPUAN`
- Sistem akan otomatis convert ke L/P

## 📝 Contoh Data

### Sheet: Siswa

```
nis     | nama                  | gender | kelas_nama
--------|----------------------|--------|------------
12345   | Ahmad Fauzi          | L      | X-1
12346   | Siti Nurhaliza       | P      | X-1
12347   | Budi Santoso         | L      | X-1
12348   | Dewi Lestari         | P      | X-1
12349   | Eko Prasetyo         | L      | X-1
12350   | Fitri Handayani      | P      | X-2
12351   | Gilang Ramadhan      | L      | X-2
12352   | Hana Pertiwi         | P      | X-2
12353   | Indra Gunawan        | L      | X-2
12354   | Joko Widodo          | L      | X-2
12355   | Kartika Sari         | P      | XI-A
12356   | Lukman Hakim         | L      | XI-A
12357   | Maya Angelina        | P      | XI-A
12358   | Nanda Pratama        | L      | XI-A
12359   | Olivia Putri         | P      | XI-A
12360   | Putra Mahendra       | L      | XI-B
12361   | Qori Amalia          | P      | XI-B
12362   | Rudi Hartono         | L      | XI-B
12363   | Sari Wulandari       | P      | XI-B
12364   | Tono Sugiarto        | L      | XI-B
12365   | Umar Bakri           | L      | XII-A
12366   | Vina Melinda         | P      | XII-A
12367   | Wawan Setiawan       | L      | XII-A
12368   | Xena Warrior         | P      | XII-A
12369   | Yudi Latif           | L      | XII-A
12370   | Zahra Amira          | P      | XII-B
```

## ✅ Validasi Data

Sistem akan melakukan validasi otomatis:

### 1. NIS Unik
- ❌ **Error:** NIS sudah terdaftar
- ✅ **Valid:** NIS belum ada di database

### 2. Gender Valid
- ❌ **Error:** Gender kosong atau tidak valid
- ✅ **Valid:** L (Laki-laki) atau P (Perempuan)
- ✅ **Valid:** Laki-laki, Perempuan (akan diconvert ke L/P)

### 3. Kelas Terdaftar
- ❌ **Error:** Kelas "X-13" tidak ditemukan
- ✅ **Valid:** Kelas "X-1" sudah terdaftar

### 4. Data Lengkap
- ❌ **Error:** NIS, Nama, Gender, atau Kelas kosong
- ✅ **Valid:** Semua kolom terisi

## 🎯 Contoh Kasus

### ✅ Data Valid
```
12345 | Ahmad Fauzi | L | X-1
```
- NIS unik
- Nama terisi
- Gender valid (L)
- Kelas X-1 sudah terdaftar
- **Status:** OK - Siap diimport

### ❌ Data Duplikat
```
12345 | Ahmad Fauzi | L | X-1
12345 | Budi Santoso | L | X-2
```
- NIS 12345 muncul 2 kali
- **Status:** Duplikat - Baris kedua akan dilewati

### ❌ Gender Tidak Valid
```
12346 | Siti Nurhaliza | X | X-1
```
- Gender "X" tidak valid (harus L atau P)
- **Status:** Error - Tidak akan diimport
- **Solusi:** Ubah gender menjadi L atau P

### ❌ Kelas Tidak Ditemukan
```
12347 | Budi Santoso | L | X-13
```
- Kelas X-13 tidak ada di sistem
- **Status:** Error - Tidak akan diimport
- **Solusi:** Tambahkan kelas X-13 dulu atau ubah ke kelas yang ada

## 📊 Format Kelas yang Valid

### Kelas 10 (X)
```
X-1, X-2, X-3, X-4, X-5, X-6, X-7, X-8, X-9, X-10, X-11, X-12
```

### Kelas 11 (XI)
```
XI-A, XI-B, XI-C, XI-D, XI-E, XI-F, XI-G
```

### Kelas 12 (XII)
```
XII-A, XII-B, XII-C, XII-D, XII-E, XII-F, XII-G
```

## 🔧 Tips Import

1. **Pastikan Kelas Sudah Ada**
   - Import kelas terlebih dahulu
   - Atau tambah kelas manual sebelum import siswa

2. **Gunakan NIS yang Benar**
   - NIS harus unik untuk setiap siswa
   - Gunakan format angka yang konsisten
   - Contoh: 12345, 12346, 12347 (5 digit)

3. **Nama Kelas Harus Persis Sama**
   - Huruf besar/kecil harus sama
   - Tidak ada spasi tambahan
   - Format: `X-1` bukan `x-1` atau `X - 1`

4. **Cek Preview Sebelum Import**
   - Sistem akan menampilkan preview
   - Baris merah = error/duplikat
   - Baris putih = valid
   - Hanya baris valid yang akan diimport

5. **Import Bertahap**
   - Jika data banyak, import per kelas
   - Lebih mudah untuk cek dan perbaiki error

## 📥 Cara Download Template

1. Buka Dashboard Admin
2. Klik menu "Rekap Absensi"
3. Klik tombol "Import Data Siswa"
4. Klik "Template Siswa"
5. File Excel akan terdownload
6. Isi data sesuai format
7. Upload kembali

## 🎓 Contoh Per Kelas

### Kelas X-1 (35 siswa)
```
12001 | Siswa 1 X-1  | L | X-1
12002 | Siswa 2 X-1  | P | X-1
12003 | Siswa 3 X-1  | L | X-1
...
12035 | Siswa 35 X-1 | P | X-1
```

### Kelas XI-A (36 siswa)
```
11001 | Siswa 1 XI-A  | L | XI-A
11002 | Siswa 2 XI-A  | P | XI-A
11003 | Siswa 3 XI-A  | L | XI-A
...
11036 | Siswa 36 XI-A | P | XI-A
```

### Kelas XII-B (33 siswa)
```
10001 | Siswa 1 XII-B  | L | XII-B
10002 | Siswa 2 XII-B  | P | XII-B
10003 | Siswa 3 XII-B  | L | XII-B
...
10033 | Siswa 33 XII-B | P | XII-B
```

## ⚠️ Kesalahan Umum

### 1. Format NIS Salah
```
❌ NIS-12345  (ada prefix)
❌ 12345.0    (format desimal)
✅ 12345      (angka biasa)
```

### 2. Nama Kelas Salah
```
❌ X 1        (ada spasi)
❌ x-1        (huruf kecil)
❌ X-01       (ada leading zero)
✅ X-1        (format benar)
```

### 3. Data Kosong
```
❌ 12345 |           | L | X-1  (nama kosong)
❌       | Ahmad     | L | X-1  (NIS kosong)
❌ 12345 | Ahmad     |   | X-1  (gender kosong)
❌ 12345 | Ahmad     | L |      (kelas kosong)
✅ 12345 | Ahmad     | L | X-1  (semua terisi)
```

### 4. Format Gender Salah
```
❌ 12345 | Ahmad     | M      | X-1  (gunakan L bukan M)
❌ 12345 | Ahmad     | Male   | X-1  (gunakan L atau Laki-laki)
❌ 12345 | Siti      | F      | X-1  (gunakan P bukan F)
❌ 12345 | Siti      | Female | X-1  (gunakan P atau Perempuan)
✅ 12345 | Ahmad     | L      | X-1  (format benar)
✅ 12345 | Ahmad     | Laki-laki | X-1  (format benar, akan diconvert ke L)
✅ 12345 | Siti      | P      | X-1  (format benar)
✅ 12345 | Siti      | Perempuan | X-1  (format benar, akan diconvert ke P)
```

## 📞 Bantuan

Jika mengalami kesulitan:
1. Cek format template yang didownload
2. Pastikan tidak mengubah nama kolom
3. Cek preview sebelum import
4. Perbaiki baris yang error
5. Import ulang

---

**Catatan:** Template ini mengikuti format baru sistem kelas (X-1, XI-A, XII-B)
