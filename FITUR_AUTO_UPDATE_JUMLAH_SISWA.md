# ✨ Fitur Auto-Update Jumlah Siswa

## 📋 Ringkasan

Sistem sekarang **otomatis menghitung dan mengupdate** jumlah siswa di data master kelas ketika data siswa diimport. Fitur ini memastikan jumlah siswa di form pengisian jurnal selalu akurat dan sinkron dengan data siswa yang ada.

---

## 🎯 Manfaat

### Sebelum Fitur Ini:
❌ Admin harus **manual input** jumlah siswa di data master kelas  
❌ Rawan **tidak sinkron** antara data siswa dan jumlah siswa di kelas  
❌ Jika ada siswa baru, admin harus **update manual** jumlah siswa  
❌ Potensi **kesalahan** input jumlah siswa  

### Setelah Fitur Ini:
✅ Jumlah siswa **otomatis terhitung** dari data siswa yang diimport  
✅ **Selalu sinkron** antara data siswa dan jumlah siswa di kelas  
✅ Siswa baru diimport → jumlah siswa **otomatis terupdate**  
✅ **Tidak ada kesalahan** karena sistem yang menghitung  
✅ **Lebih efisien** dan akurat  

---

## 🔄 Cara Kerja

### 1. Import Data Siswa

```
Dashboard Admin → Rekap Absensi → Import Data Siswa
```

**Proses:**
1. Admin upload file Excel dengan data siswa
2. Sistem validasi data (NIS unik, kelas terdaftar)
3. Sistem simpan data siswa ke database
4. **Sistem otomatis hitung jumlah siswa per kelas**
5. **Sistem otomatis update field `jumlahSiswa` di data master kelas**

### 2. Pengisian Jurnal oleh Siswa

```
Dashboard Siswa → Jurnal Hari Ini → Isi Jurnal
```

**Proses:**
1. Siswa (ketua/sekretaris) klik "Isi Jurnal"
2. Sistem ambil data kelas siswa
3. **Sistem tampilkan jumlah siswa dari field `jumlahSiswa`**
4. Siswa input yang tidak hadir (Sakit, Izin, Alpha)
5. Sistem hitung otomatis yang hadir

---

## 📊 Contoh Kasus

### Kasus 1: Import Siswa Kelas X-1

**Data Import:**
```
NIS   | Nama              | Kelas
------|-------------------|-------
12001 | Ahmad Fauzi       | X-1
12002 | Siti Nurhaliza    | X-1
12003 | Budi Santoso      | X-1
12004 | Dewi Lestari      | X-1
...
12035 | Zahra Amira       | X-1
```

**Proses Otomatis:**
1. ✅ Sistem simpan 35 data siswa untuk kelas X-1
2. ✅ Sistem hitung: Kelas X-1 = 35 siswa
3. ✅ Sistem update data master kelas X-1: `jumlahSiswa = 35`

**Hasil:**
- Data master kelas X-1 sekarang memiliki `jumlahSiswa = 35`
- Ketika siswa X-1 isi jurnal, otomatis tampil "Total Siswa: 35"

### Kasus 2: Import Siswa Multiple Kelas

**Data Import:**
```
NIS   | Nama              | Kelas
------|-------------------|-------
12001 | Ahmad Fauzi       | X-1
12002 | Siti Nurhaliza    | X-1
...
12035 | Zahra Amira       | X-1    (35 siswa X-1)
13001 | Andi Pratama      | X-2
13002 | Bella Safira      | X-2
...
13032 | Yusuf Ibrahim     | X-2    (32 siswa X-2)
14001 | Citra Dewi        | XI-A
14002 | Dimas Aditya      | XI-A
...
14036 | Zaki Maulana      | XI-A   (36 siswa XI-A)
```

**Proses Otomatis:**
1. ✅ Sistem simpan semua data siswa (35 + 32 + 36 = 103 siswa)
2. ✅ Sistem hitung per kelas:
   - Kelas X-1 = 35 siswa
   - Kelas X-2 = 32 siswa
   - Kelas XI-A = 36 siswa
3. ✅ Sistem update data master kelas:
   - X-1: `jumlahSiswa = 35`
   - X-2: `jumlahSiswa = 32`
   - XI-A: `jumlahSiswa = 36`

**Hasil:**
- Semua kelas memiliki jumlah siswa yang akurat
- Form jurnal setiap kelas menampilkan jumlah siswa yang benar

### Kasus 3: Import Siswa Tambahan

**Kondisi Awal:**
- Kelas X-1 sudah ada 35 siswa
- Data master kelas X-1: `jumlahSiswa = 35`

**Import Siswa Baru:**
```
NIS   | Nama              | Kelas
------|-------------------|-------
12036 | Andi Wijaya       | X-1
12037 | Bella Putri       | X-1
12038 | Citra Ayu         | X-1
```

**Proses Otomatis:**
1. ✅ Sistem simpan 3 data siswa baru untuk kelas X-1
2. ✅ Sistem hitung ulang: Kelas X-1 = 35 + 3 = 38 siswa
3. ✅ Sistem update data master kelas X-1: `jumlahSiswa = 38`

**Hasil:**
- Data master kelas X-1 sekarang memiliki `jumlahSiswa = 38`
- Form jurnal otomatis menampilkan "Total Siswa: 38"

---

## 🔍 Detail Teknis

### Logika Perhitungan

```javascript
// Saat import siswa
if (importData.siswa && importData.siswa.length > 0) {
  // 1. Hitung jumlah siswa per kelas
  const jumlahSiswaPerKelas = {};
  
  importData.siswa
    .filter((s) => s.valid)
    .forEach((s) => {
      // Simpan data siswa
      dbInsert(DB_KEYS.siswa, {...});
      
      // Hitung per kelas
      if (!jumlahSiswaPerKelas[s.kelasId]) {
        jumlahSiswaPerKelas[s.kelasId] = 0;
      }
      jumlahSiswaPerKelas[s.kelasId]++;
    });
  
  // 2. Update jumlahSiswa di data master kelas
  Object.keys(jumlahSiswaPerKelas).forEach((kelasId) => {
    const kelas = dbGetById(DB_KEYS.kelas, kelasId);
    if (kelas) {
      // Ambil total siswa aktif di kelas
      const siswaExisting = dbGetAll(DB_KEYS.siswa).filter(
        (s) => s.kelasId === kelasId && s.aktif
      );
      
      // Update jumlah siswa
      kelas.jumlahSiswa = siswaExisting.length;
      dbUpdate(DB_KEYS.kelas, kelas);
    }
  });
}
```

### Struktur Data

**Data Siswa:**
```javascript
{
  id: "siswa_xxx",
  nis: "12001",
  nama: "Ahmad Fauzi",
  kelasId: "kls001",  // ← Link ke kelas
  aktif: true,
  createdAt: "2026-05-14T..."
}
```

**Data Master Kelas:**
```javascript
{
  id: "kls001",
  nama: "X-1",
  tingkat: "X",
  jurusan: "1",
  jumlahSiswa: 35,  // ← Auto-update dari jumlah data siswa
  aktif: true
}
```

---

## ✅ Validasi

Sistem melakukan validasi untuk memastikan akurasi:

1. **Hanya siswa aktif** yang dihitung
   ```javascript
   siswaExisting.filter(s => s.aktif)
   ```

2. **Hanya siswa valid** yang diimport
   ```javascript
   importData.siswa.filter(s => s.valid)
   ```

3. **Kelas harus terdaftar** sebelum import siswa
   - Jika kelas tidak ada, siswa tidak akan diimport
   - Validasi dilakukan saat parsing data

4. **NIS harus unik**
   - Siswa dengan NIS duplikat tidak akan diimport
   - Hanya siswa baru yang dihitung

---

## 🎓 Workflow Lengkap

### Setup Awal Sekolah

```
1. Import Data Kelas
   ↓
   Kelas X-1, X-2, XI-A, dll dibuat
   jumlahSiswa = 0 (default)

2. Import Data Siswa
   ↓
   Sistem simpan data siswa
   Sistem hitung jumlah siswa per kelas
   Sistem update jumlahSiswa di data master kelas
   ↓
   Kelas X-1: jumlahSiswa = 35
   Kelas X-2: jumlahSiswa = 32
   Kelas XI-A: jumlahSiswa = 36

3. Import Pengguna (Ketua & Sekretaris)
   ↓
   Ketua dan sekretaris bisa login

4. Siswa Isi Jurnal
   ↓
   Form jurnal otomatis tampilkan jumlah siswa
   Siswa input yang tidak hadir
   Sistem hitung otomatis yang hadir
```

### Operasional Harian

```
Guru Mengajar
   ↓
Siswa (Ketua/Sekretaris) Login
   ↓
Isi Jurnal
   ↓
Sistem tampilkan: "Total Siswa: 35"
   ↓
Input yang tidak hadir:
- Sakit: 2
- Izin: 1
- Alpha: 0
   ↓
Sistem hitung otomatis:
- Hadir: 32 (35 - 2 - 1 - 0)
   ↓
Simpan Jurnal
```

---

## 📝 Catatan Penting

### 1. Urutan Import
Pastikan import dalam urutan yang benar:
```
1. Kelas (wajib pertama)
2. Siswa (setelah kelas)
3. Pengguna (ketua/sekretaris)
```

### 2. Data Siswa Aktif
Hanya siswa dengan status `aktif: true` yang dihitung.

### 3. Update Manual (Opsional)
Admin masih bisa update manual jumlah siswa di data master kelas jika diperlukan, tapi **tidak disarankan** karena akan di-override saat import siswa berikutnya.

### 4. Sinkronisasi
Jumlah siswa akan selalu sinkron dengan data siswa yang ada di database.

---

## 🔧 Troubleshooting

### Jumlah siswa tidak terupdate

**Penyebab:**
- Import siswa gagal
- Kelas tidak ditemukan
- Siswa tidak valid (NIS duplikat, dll)

**Solusi:**
1. Cek preview import, pastikan semua siswa valid (tidak ada baris merah)
2. Pastikan kelas sudah terdaftar sebelum import siswa
3. Pastikan NIS unik untuk setiap siswa
4. Re-import data siswa

### Jumlah siswa di form jurnal salah

**Penyebab:**
- Data kelas belum terupdate
- Cache browser

**Solusi:**
1. Refresh halaman (F5)
2. Clear cache browser (Ctrl+Shift+Delete)
3. Cek data master kelas, pastikan jumlahSiswa sudah benar
4. Re-import data siswa jika perlu

### Jumlah siswa tidak sesuai dengan yang diimport

**Penyebab:**
- Ada siswa yang tidak valid (dilewati saat import)
- Ada siswa dengan status tidak aktif

**Solusi:**
1. Cek preview import, lihat berapa siswa yang valid
2. Cek data siswa di database, filter yang aktif
3. Pastikan semua siswa yang diimport valid

---

## 📊 Statistik & Monitoring

Admin bisa monitoring jumlah siswa per kelas di:

1. **Dashboard Admin → Kelola Kelas**
   - Tabel kelas menampilkan kolom "Jumlah Siswa"
   - Badge dengan icon users dan jumlah siswa

2. **Dashboard Admin → Rekap Absensi**
   - Statistik menampilkan total siswa per kelas
   - Filter per kelas untuk melihat detail

---

## 🎉 Kesimpulan

Fitur auto-update jumlah siswa memberikan:

✅ **Efisiensi** - Tidak perlu input manual  
✅ **Akurasi** - Sistem yang menghitung, tidak ada kesalahan  
✅ **Sinkronisasi** - Selalu sinkron dengan data siswa  
✅ **Kemudahan** - Satu kali import, semua terupdate  
✅ **Konsistensi** - Data konsisten di seluruh sistem  

---

**Versi:** 1.0  
**Status:** ✅ Aktif  
**Update:** 14 Mei 2026
