# 👥 Struktur Pengguna Sistem Jurnal Kelas

## 📊 Ringkasan

Sistem ini memiliki **2 jenis data** yang berbeda:

1. **Pengguna (Users)** - Bisa login ke sistem web
2. **Data Siswa** - Hanya untuk rekap absensi, tidak bisa login

---

## 🔐 PENGGUNA YANG BISA LOGIN

### 1. Admin
- **Akses:** Penuh ke semua fitur
- **Jumlah:** Biasanya 1-2 orang
- **Fungsi:**
  - Mengelola pengguna (guru, siswa)
  - Mengelola data master (kelas, mapel, periode)
  - Mengelola jadwal pelajaran
  - Melihat semua jurnal dan rekap absensi
  - Import/export data

### 2. Guru
- **Akses:** Mengelola jurnal dan absensi kelas yang diajar
- **Jumlah:** Sesuai jumlah guru di sekolah
- **Fungsi:**
  - Membuat jurnal mengajar
  - Mencatat absensi siswa
  - Melihat jadwal mengajar
  - Export jurnal kelas yang diajar

### 3. Siswa (Ketua & Sekretaris Kelas)
- **Akses:** Melihat jurnal dan absensi kelas sendiri
- **Jumlah:** 2 orang per kelas (ketua + sekretaris)
- **Fungsi:**
  - Melihat jurnal kelas
  - Melihat absensi kelas
  - Melihat jadwal kelas
  - Export jurnal kelas sendiri

**⚠️ PENTING:** Hanya ketua dan sekretaris kelas yang perlu akun login!

---

## 📊 DATA SISWA (TIDAK BISA LOGIN)

### Data Siswa untuk Rekap Absensi
- **Akses:** Tidak bisa login
- **Jumlah:** Semua siswa di sekolah
- **Fungsi:**
  - Tercatat dalam rekap absensi
  - Muncul di statistik ketidakhadiran
  - Bisa dilihat detail absensinya oleh admin/guru

**⚠️ PENTING:** Data siswa ini hanya untuk pencatatan absensi, tidak bisa login ke sistem!

---

## 📋 Perbandingan

| Aspek | Pengguna Siswa | Data Siswa |
|-------|----------------|------------|
| **Bisa Login** | ✅ Ya | ❌ Tidak |
| **Username & Password** | ✅ Ada | ❌ Tidak ada |
| **Jumlah** | 2 per kelas | Semua siswa |
| **Jabatan** | Ketua/Sekretaris | Semua siswa |
| **Import Via** | Template Pengguna | Template Siswa |
| **Kolom** | Nama, Username, Password, Role, Kelas, Jabatan | NIS, Nama, Kelas |
| **Fungsi** | Akses sistem web | Rekap absensi |

---

## 🎯 Contoh Kasus: Kelas X-1

### Kelas X-1 memiliki 35 siswa:

#### 👤 Pengguna yang Bisa Login (2 orang)
```
1. Ahmad Fauzi (Ketua)
   - Username: ahmad_x1
   - Password: siswa123
   - Role: siswa
   - Kelas: X-1
   - Jabatan: ketua
   - Bisa login: ✅ Ya

2. Siti Nurhaliza (Sekretaris)
   - Username: siti_x1
   - Password: siswa123
   - Role: siswa
   - Kelas: X-1
   - Jabatan: sekretaris
   - Bisa login: ✅ Ya
```

#### 📊 Data Siswa untuk Rekap Absensi (35 orang)
```
1. Ahmad Fauzi (NIS: 12001) - X-1
2. Siti Nurhaliza (NIS: 12002) - X-1
3. Budi Santoso (NIS: 12003) - X-1
4. Dewi Lestari (NIS: 12004) - X-1
5. Eko Prasetyo (NIS: 12005) - X-1
...
35. Zahra Amira (NIS: 12035) - X-1

Semua siswa ini:
- Bisa login: ❌ Tidak
- Tercatat di rekap absensi: ✅ Ya
```

**Catatan:** Ahmad dan Siti muncul di kedua data (sebagai pengguna dan data siswa)

---

## 📥 Cara Import

### Import Pengguna (Admin, Guru, Ketua/Sekretaris)

**Template:** `template_users.xlsx`

**Lokasi:** Dashboard Admin → Pengguna → Import Data

**Kolom:**
- nama
- username
- password
- role (admin/guru/siswa)
- kelas_nama (untuk siswa)
- jabatan (ketua/sekretaris untuk siswa)

**Contoh:**
```
Nama              | Username  | Password  | Role  | Kelas | Jabatan
------------------|-----------|-----------|-------|-------|----------
Admin Sekolah     | admin     | admin123  | admin |       |
Budi Santoso S.Pd | budi      | guru123   | guru  |       |
Ahmad Fauzi       | ahmad_x1  | siswa123  | siswa | X-1   | ketua
Siti Nurhaliza    | siti_x1   | siswa123  | siswa | X-1   | sekretaris
```

### Import Data Siswa (Semua Siswa)

**Template:** `template_siswa.xlsx`

**Lokasi:** Dashboard Admin → Rekap Absensi → Import Data Siswa

**Kolom:**
- nis
- nama
- kelas_nama

**Contoh:**
```
NIS   | Nama              | Kelas
------|-------------------|-------
12001 | Ahmad Fauzi       | X-1
12002 | Siti Nurhaliza    | X-1
12003 | Budi Santoso      | X-1
12004 | Dewi Lestari      | X-1
12005 | Eko Prasetyo      | X-1
...
12035 | Zahra Amira       | X-1
```

---

## ✅ Checklist Setup Awal

### 1. Setup Data Master
- [ ] Import/tambah data kelas
- [ ] Import/tambah data mata pelajaran
- [ ] Buat periode semester aktif

### 2. Setup Pengguna
- [ ] Buat akun admin
- [ ] Import/tambah akun guru
- [ ] Import/tambah akun ketua & sekretaris kelas

### 3. Setup Data Siswa
- [ ] Import data semua siswa (untuk rekap absensi)

### 4. Setup Jadwal
- [ ] Import/tambah jadwal pelajaran

### 5. Mulai Operasional
- [ ] Guru mulai isi jurnal
- [ ] Guru catat absensi siswa
- [ ] Admin monitoring rekap absensi

---

## ❓ FAQ

### Q: Apakah semua siswa perlu akun login?
**A:** Tidak! Hanya ketua dan sekretaris kelas yang perlu akun login. Siswa lainnya cukup diimport sebagai data siswa untuk rekap absensi.

### Q: Bagaimana jika ketua/sekretaris berganti?
**A:** 
1. Edit akun pengguna lama, ubah jabatan menjadi kosong atau nonaktifkan
2. Buat akun pengguna baru untuk ketua/sekretaris yang baru

### Q: Apakah ketua/sekretaris perlu diimport 2 kali?
**A:** Ya, mereka muncul di:
1. Template Pengguna (untuk login)
2. Template Siswa (untuk rekap absensi)

### Q: Bagaimana cara guru mencatat absensi siswa?
**A:** 
1. Guru login ke sistem
2. Buat jurnal mengajar
3. Pilih siswa yang tidak hadir (sakit/izin/alpha)
4. Sistem akan mencatat absensi berdasarkan NIS/nama siswa

### Q: Siapa yang bisa melihat rekap absensi?
**A:** 
- Admin: Semua kelas
- Guru: Kelas yang diajar
- Siswa (ketua/sekretaris): Kelas sendiri

---

## 🎓 Best Practices

### 1. Penamaan Username
```
✅ Baik:
- admin_sekolah
- budi_guru
- ahmad_x1 (nama_kelas)
- siti_x1

❌ Hindari:
- admin123 (tidak deskriptif)
- user1 (tidak jelas)
- a (terlalu pendek)
```

### 2. Password Default
```
Gunakan password default yang mudah diingat:
- Admin: admin123
- Guru: guru123
- Siswa: siswa123

⚠️ Instruksikan pengguna untuk mengganti password setelah login pertama
```

### 3. Jabatan Siswa
```
✅ Format yang benar:
- ketua
- sekretaris

❌ Format yang salah:
- Ketua (huruf kapital)
- KETUA (semua kapital)
- ketua kelas (ada spasi)
```

### 4. Import Bertahap
```
Urutan import yang disarankan:
1. Kelas
2. Mata Pelajaran
3. Periode
4. Pengguna (Admin, Guru, Ketua/Sekretaris)
5. Data Siswa
6. Jadwal Pelajaran
```

---

## 📞 Bantuan

Jika ada pertanyaan tentang struktur pengguna:
1. Baca dokumentasi ini dengan teliti
2. Lihat contoh template yang sudah disediakan
3. Cek preview sebelum import
4. Hubungi tim pengembang jika masih bingung

---

**Versi:** 1.0  
**Status:** ✅ Aktif  
**Update:** Mei 2026
