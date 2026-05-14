# 📊 Rekap Absensi Siswa - Quick Guide

## ⚠️ PENTING: Perbedaan Data Siswa

### 👥 Data Siswa untuk Rekap Absensi
- **Tujuan:** Hanya untuk pencatatan absensi
- **Tidak bisa login** ke sistem
- **Import via:** Template Excel (NIS, Nama, Kelas)
- **Jumlah:** Semua siswa di sekolah
- **✨ Bonus:** Otomatis update jumlah siswa di data master kelas

### 🔐 Data Siswa untuk Login (Pengguna)
- **Tujuan:** Akses ke sistem web
- **Bisa login** dengan username & password
- **Hanya:** Ketua & Sekretaris kelas
- **Import via:** Template Pengguna (role=siswa, jabatan=ketua/sekretaris)

---

## ✨ Fitur Auto-Update Jumlah Siswa

Ketika Anda import data siswa:
1. ✅ Sistem otomatis **menghitung jumlah siswa per kelas**
2. ✅ Sistem otomatis **update field `jumlahSiswa`** di data master kelas
3. ✅ Form pengisian jurnal **otomatis menampilkan jumlah siswa** yang akurat
4. ✅ **Tidak perlu input manual** jumlah siswa di data master kelas

**Contoh:**
- Import 35 siswa untuk kelas X-1
- Sistem otomatis update: Kelas X-1 → `jumlahSiswa = 35`
- Siswa isi jurnal → Tampil: "Total Siswa: 35"

---

## 🚀 Quick Start

### 1️⃣ Import Data Siswa (Wajib Pertama Kali)

```
Dashboard Admin → Rekap Absensi → Import Data Siswa
```

1. Download template Excel
2. Isi data siswa:
   - **NIS**: Nomor Induk Siswa (unik)
   - **Nama**: Nama lengkap siswa
   - **Kelas**: X-1, XI-A, XII-B (harus sesuai data kelas)
3. Upload file
4. Cek preview (baris merah = error)
5. Klik Import

**Catatan:** Data ini hanya untuk rekap absensi, tidak bisa login ke sistem.

### 2️⃣ Lihat Rekap Absensi

```
Dashboard Admin → Rekap Absensi
```

1. **Pilih Bulan** (wajib)
2. **Filter Kelas** (opsional)
3. **Filter Status** (opsional): Sakit/Izin/Alpha
4. Lihat statistik dan tabel

### 3️⃣ Export Data

```
Klik: Export XLSX atau Export PDF
```

File akan terdownload dengan nama:
- `Rekap_Absensi_Januari_2026.xlsx`
- `Rekap_Absensi_Januari_2026.pdf`

---

## 📋 Format Template Siswa

| NIS | Nama | Kelas |
|-----|------|-------|
| 12345 | Ahmad Fauzi | X-1 |
| 12346 | Siti Nurhaliza | X-1 |
| 12347 | Budi Santoso | X-2 |

**Format Kelas:**
- Kelas 10: `X-1`, `X-2`, ... `X-12`
- Kelas 11: `XI-A`, `XI-B`, ... `XI-G`
- Kelas 12: `XII-A`, `XII-B`, ... `XII-G`

---

## 📊 Statistik yang Ditampilkan

1. **Total Siswa** - Jumlah siswa dalam periode
2. **Siswa Hadir Penuh** - Tidak ada ketidakhadiran
3. **Siswa Tidak Hadir** - Minimal 1x tidak hadir
4. **Total Ketidakhadiran** - Breakdown: Sakit, Izin, Alpha

---

## 🔍 Tabel Rekap

| No | Nama Siswa | Kelas | Sakit | Izin | Alpha | Total | Aksi |
|----|------------|-------|-------|------|-------|-------|------|
| 1 | Ahmad Fauzi | X-1 | 2x | 1x | 0 | 3x | 👁️ |

**Warna:**
- 🟡 Sakit (kuning)
- 🔵 Izin (biru)
- 🔴 Alpha (merah)
- Total > 5: Merah
- Total > 3: Kuning

---

## 👁️ Detail Absensi Siswa

Klik tombol **👁️** untuk melihat:
- Info siswa (Nama, NIS, Kelas)
- Statistik bulan tersebut
- **Riwayat lengkap:**
  - Tanggal tidak hadir
  - Mata pelajaran
  - Jam pelajaran
  - Status (Sakit/Izin/Alpha)

---

## ✅ Validasi Import

### ✅ Data Valid
```
12345 | Ahmad Fauzi | X-1
```
- NIS unik ✓
- Nama terisi ✓
- Kelas terdaftar ✓

### ❌ Data Error
```
12345 | Ahmad Fauzi | X-13  ← Kelas tidak ada
12345 | Budi Santoso | X-2   ← NIS duplikat
      | Siti | X-1           ← NIS kosong
```

---

## 🎯 Tips

1. **Import kelas dulu** sebelum import siswa
2. **NIS harus unik** untuk setiap siswa
3. **Nama kelas harus persis sama** (huruf besar/kecil)
4. **Cek preview** sebelum import
5. **Import bertahap** jika data banyak

---

## ⚠️ Troubleshooting

### ❓ Rekap tidak muncul
- ✅ Pastikan sudah pilih bulan
- ✅ Pastikan data siswa sudah diimport
- ✅ Pastikan ada jurnal di bulan tersebut

### ❓ Siswa tidak muncul di rekap
- ✅ Cek apakah siswa sudah diimport
- ✅ Cek apakah kelas siswa sesuai
- ✅ Cek apakah siswa aktif

### ❓ Jumlah ketidakhadiran salah
- ✅ Cek matching NIS/Nama di jurnal
- ✅ Pastikan format absensi di jurnal benar

---

## 📁 File Dokumentasi

- **FITUR_REKAP_ABSENSI.md** - Dokumentasi lengkap
- **CONTOH_TEMPLATE_SISWA.md** - Panduan template
- **SUMMARY_FITUR_REKAP_ABSENSI.txt** - Ringkasan
- **README_REKAP_ABSENSI.md** - Quick guide (file ini)

---

## 🎓 Contoh Kasus Penggunaan

### Kasus 1: Monitoring Siswa Bermasalah
```
1. Pilih bulan: Januari 2026
2. Lihat tabel rekap
3. Siswa dengan total > 5 akan berwarna merah
4. Klik detail untuk lihat riwayat
5. Tindak lanjut: konseling/panggil orang tua
```

### Kasus 2: Laporan Bulanan
```
1. Pilih bulan: Januari 2026
2. Pilih kelas: X-1
3. Export PDF
4. Cetak untuk arsip/laporan
```

### Kasus 3: Analisis Per Status
```
1. Pilih bulan: Januari 2026
2. Filter status: Alpha
3. Lihat siswa yang sering alpha
4. Tindak lanjut sesuai kebijakan sekolah
```

---

## 📞 Bantuan

Jika ada pertanyaan:
1. Baca dokumentasi lengkap: `FITUR_REKAP_ABSENSI.md`
2. Lihat contoh template: `CONTOH_TEMPLATE_SISWA.md`
3. Hubungi tim pengembang

---

**Versi:** 1.0  
**Status:** ✅ Aktif  
**Update:** Mei 2026
