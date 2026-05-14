# Contoh Template Import Excel

## Template Kelas

### Sheet: Kelas

| nama   | tingkat | jurusan | jumlahSiswa |
|--------|---------|---------|-------------|
| X-1    | X       | 1       | 35          |
| X-2    | X       | 2       | 32          |
| X-3    | X       | 3       | 30          |
| X-4    | X       | 4       | 33          |
| X-5    | X       | 5       | 31          |
| X-6    | X       | 6       | 34          |
| X-7    | X       | 7       | 32          |
| X-8    | X       | 8       | 35          |
| X-9    | X       | 9       | 30          |
| X-10   | X       | 10      | 33          |
| X-11   | X       | 11      | 31          |
| X-12   | X       | 12      | 34          |
| XI-A   | XI      | A       | 36          |
| XI-B   | XI      | B       | 34          |
| XI-C   | XI      | C       | 35          |
| XI-D   | XI      | D       | 33          |
| XI-E   | XI      | E       | 32          |
| XI-F   | XI      | F       | 34          |
| XI-G   | XI      | G       | 31          |
| XII-A  | XII     | A       | 33          |
| XII-B  | XII     | B       | 35          |
| XII-C  | XII     | C       | 32          |
| XII-D  | XII     | D       | 34          |
| XII-E  | XII     | E       | 31          |
| XII-F  | XII     | F       | 33          |
| XII-G  | XII     | G       | 30          |

### Sheet: Petunjuk

**PETUNJUK PENGISIAN:**

**FORMAT KELAS:**
- Kelas 10 (X): X-1, X-2, X-3, ... X-12
- Kelas 11 (XI): XI-A, XI-B, XI-C, ... XI-G
- Kelas 12 (XII): XII-A, XII-B, XII-C, ... XII-G

**KOLOM:**
- **nama**: Nama kelas (format: {Tingkat}-{Jurusan/Nomor})
- **tingkat**: X / XI / XII
- **jurusan**: Untuk kelas X isi nomor 1-12, untuk XI & XII isi huruf A-G
- **jumlahSiswa**: Total siswa di kelas (angka, boleh 0)

**CONTOH:**
- Kelas 10 nomor 5: nama=X-5, tingkat=X, jurusan=5
- Kelas 11 jurusan C: nama=XI-C, tingkat=XI, jurusan=C
- Kelas 12 jurusan F: nama=XII-F, tingkat=XII, jurusan=F

---

## Template Pengguna (Users)

### Sheet: Pengguna

| nama                | username | password  | role  | kelas_nama | jabatan     |
|---------------------|----------|-----------|-------|------------|-------------|
| Budi Santoso S.Pd   | budi2    | guru123   | guru  |            |             |
| Siti Rahayu S.Pd    | siti2    | guru123   | guru  |            |             |
| Ahmad Fauzi M.Pd    | ahmad2   | guru123   | guru  |            |             |
| Ani Wulandari       | ani      | siswa123  | siswa | X-1        | ketua       |
| Dodi Pratama        | dodi     | siswa123  | siswa | X-1        | sekretaris  |
| Rina Sari           | rina2    | siswa123  | siswa | X-2        | ketua       |
| Budi Setiawan       | budi3    | siswa123  | siswa | X-2        | sekretaris  |
| Maya Putri          | maya     | siswa123  | siswa | XI-A       | ketua       |
| Fajar Nugroho       | fajar    | siswa123  | siswa | XI-A       | sekretaris  |
| Dewi Lestari        | dewi2    | siswa123  | siswa | XI-B       |             |
| Andi Wijaya         | andi     | siswa123  | siswa | XII-A      | ketua       |
| Sari Indah          | sari     | siswa123  | siswa | XII-A      | sekretaris  |

### Sheet: Petunjuk

**PETUNJUK:**
- **role**: admin / guru / siswa
- **kelas_nama**: isi jika role=siswa (harus sama persis dengan nama kelas)
- **jabatan**: isi jika role=siswa (ketua / sekretaris)

**Catatan:**
- Guru tidak perlu mengisi kelas/mapel di sini
- Jadwal guru diatur oleh admin lewat menu Jadwal Pelajaran
- Format kelas_nama harus sesuai dengan format baru: X-1, XI-A, XII-B, dll

---

## Template Mata Pelajaran

### Sheet: Mapel

| kode | nama              |
|------|-------------------|
| MTK  | Matematika        |
| BIND | Bahasa Indonesia  |
| BING | Bahasa Inggris    |
| FIS  | Fisika            |
| KIM  | Kimia             |
| BIO  | Biologi           |
| SEJ  | Sejarah           |
| GEO  | Geografi          |
| EKO  | Ekonomi           |
| SOS  | Sosiologi         |
| PJOK | Pendidikan Jasmani|
| SEN  | Seni Budaya       |
| PKN  | PKn               |

### Sheet: Petunjuk

**PETUNJUK:**
- **kode**: singkatan mapel huruf kapital (maks 6 karakter)
- **nama**: nama lengkap mata pelajaran

---

## Cara Download Template dari Sistem

1. Login sebagai Admin
2. Buka menu yang sesuai:
   - **Kelola Kelas** untuk template kelas
   - **Kelola Pengguna** untuk template users
   - **Kelola Mata Pelajaran** untuk template mapel
3. Klik tombol **Import Data**
4. Klik **Download Template {Nama}**
5. File Excel akan terdownload otomatis dengan format yang benar

## Tips Import

1. **Jangan ubah nama kolom** di baris pertama (header)
2. **Hapus baris contoh** sebelum mengisi data Anda sendiri
3. **Pastikan format sesuai** dengan petunjuk di sheet "Petunjuk"
4. **Cek duplikat** - sistem akan menandai data duplikat dengan warna merah saat preview
5. **Import bertahap**:
   - Import Mata Pelajaran dulu
   - Kemudian Kelas
   - Terakhir Pengguna (karena siswa memerlukan data kelas)

## Troubleshooting

### Data tidak terbaca
- Pastikan nama sheet sesuai: "Pengguna", "Kelas", atau "Mapel"
- Pastikan file format .xlsx atau .xls
- Pastikan tidak ada kolom yang kosong di header

### Data ditandai duplikat
- Username sudah ada di sistem (untuk users)
- Nama kelas sudah ada (untuk kelas)
- Kode mapel sudah ada (untuk mapel)
- Data duplikat akan dilewati saat import

### Kelas tidak ditemukan (untuk siswa)
- Pastikan nama kelas di kolom "kelas_nama" sama persis dengan nama kelas yang ada
- Format harus: X-1, XI-A, XII-B (bukan X IPA 1 atau format lama)
- Import kelas terlebih dahulu sebelum import siswa
