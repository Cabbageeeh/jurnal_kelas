# 📝 Fitur Form Jurnal Otomatis

## 🎯 Tujuan
Mempermudah pengisian jurnal kelas dengan sistem perhitungan kehadiran otomatis. Siswa hanya perlu memasukkan jumlah yang **tidak hadir**, sistem akan otomatis menghitung yang **hadir**.

---

## ✨ Fitur Utama

### 1. **Tampilan Total Siswa**
- Menampilkan total siswa di kelas dengan desain menarik
- Informasi jelas dan mudah dibaca
- Contoh: "35 Siswa" untuk kelas X IPA 2

### 2. **Input Otomatis**
**SEBELUM:**
```
Input Manual:
- Hadir: [input manual]
- Sakit: [input manual]
- Izin: [input manual]
- Alpha: [dihitung otomatis]
```

**SESUDAH:**
```
Input Otomatis:
- Total Siswa: 35 (ditampilkan otomatis)
- Sakit: [input]
- Izin: [input]
- Alpha: [input]
- Hadir: [dihitung otomatis] = 35 - Sakit - Izin - Alpha
```

### 3. **Ringkasan Real-time**
- Menampilkan ringkasan kehadiran secara real-time
- Update otomatis saat input berubah
- Validasi visual jika input melebihi total siswa

---

## 📊 Contoh Penggunaan

### Skenario: Kelas X IPA 2 (35 siswa)

**Kondisi Hari Ini:**
- 2 siswa sakit
- 1 siswa izin
- 0 siswa alpha

**Cara Mengisi:**
1. Buka form jurnal
2. Lihat total siswa: **35 Siswa**
3. Input yang tidak hadir:
   - Sakit: `2`
   - Izin: `1`
   - Alpha: `0`
4. Sistem otomatis hitung hadir: **32 siswa**

**Ringkasan Otomatis:**
```
✅ Hadir: 32
❌ Sakit: 2
⚠️ Izin: 1
❓ Alpha: 0
```

---

## 🔍 Validasi Otomatis

### ✅ Input Valid
```
Total Siswa: 35
Sakit: 2
Izin: 1
Alpha: 0
---
Hadir: 32 ✓ (Valid)
```

### ❌ Input Tidak Valid
```
Total Siswa: 35
Sakit: 20
Izin: 10
Alpha: 10
---
Hadir: -5 ✗ (Error!)
Background berubah merah
Pesan error: "Total tidak hadir melebihi jumlah siswa di kelas!"
```

---

## 🎨 Tampilan UI

### Info Total Siswa
```
┌─────────────────────────────────────┐
│  👥  Total Siswa di Kelas           │
│      35 Siswa                       │
└─────────────────────────────────────┘
```

### Form Input
```
Jumlah Siswa yang Tidak Hadir
(Sisanya otomatis dihitung hadir)

┌─────────┬─────────┬─────────┐
│ ❌ Sakit │ ⚠️ Izin  │ ❓ Alpha │
│   [2]   │   [1]   │   [0]   │
└─────────┴─────────┴─────────┘
```

### Ringkasan
```
┌─────────────────────────────────────┐
│ Ringkasan Kehadiran: Total: 35 siswa│
├─────────────────────────────────────┤
│ ✅ Hadir: 32                        │
│ ❌ Sakit: 2                         │
│ ⚠️ Izin: 1                          │
│ ❓ Alpha: 0                         │
└─────────────────────────────────────┘
```

---

## 💡 Keuntungan

### Untuk Siswa (Ketua/Sekretaris)
- ✅ Lebih cepat mengisi jurnal
- ✅ Tidak perlu menghitung manual
- ✅ Mengurangi kesalahan input
- ✅ Fokus pada yang tidak hadir saja

### Untuk Sistem
- ✅ Data lebih akurat
- ✅ Validasi otomatis
- ✅ Konsistensi data terjaga
- ✅ Mengurangi data error

### Untuk Guru & Admin
- ✅ Data kehadiran lebih terpercaya
- ✅ Laporan lebih akurat
- ✅ Mudah dianalisis

---

## 🔧 Teknologi

### Frontend (HTML)
- Form input responsif
- Desain modern dengan gradient
- Icon Font Awesome
- Grid layout untuk input

### JavaScript
- Real-time calculation
- Input validation
- Visual feedback
- Auto-update ringkasan

### Data Flow
```
Input (Sakit, Izin, Alpha)
    ↓
hitungKehadiran()
    ↓
Hadir = Total - Sakit - Izin - Alpha
    ↓
Update Ringkasan
    ↓
Validasi Visual
```

---

## 📱 Responsive Design

Form tetap mudah digunakan di berbagai ukuran layar:
- Desktop: Grid 3 kolom
- Tablet: Grid 3 kolom (lebih kecil)
- Mobile: Grid tetap 3 kolom dengan font lebih kecil

---

## 🚀 Cara Testing

1. Login sebagai siswa (ketua/sekretaris)
   - Username: `maya` / Password: `siswa123`
   - Kelas: X IPA 2 (35 siswa)

2. Buka menu "Jurnal Hari Ini"

3. Klik "Isi Jurnal Sekarang" pada jadwal yang guru sudah konfirmasi

4. Perhatikan:
   - Total siswa ditampilkan: **35 Siswa**
   - Input hanya: Sakit, Izin, Alpha
   - Hadir dihitung otomatis

5. Coba input:
   - Sakit: 2
   - Izin: 1
   - Alpha: 0
   - Lihat hadir otomatis: 32

6. Coba input berlebih:
   - Sakit: 20
   - Izin: 10
   - Alpha: 10
   - Lihat validasi error (background merah)

---

## 📝 Catatan Penting

1. **Total Siswa** dihitung dari database berdasarkan `kelasId` dan `role: "siswa"`
2. **Hadir** selalu dihitung: `Total - Sakit - Izin - Alpha`
3. **Validasi** mencegah total tidak hadir > total siswa
4. **Data Dummy** sudah ditambahkan 35 siswa untuk kelas X IPA 2

---

## 🎓 Best Practice

### Untuk Pengisian Jurnal:
1. Pastikan guru sudah konfirmasi kehadiran
2. Isi materi yang diajarkan dengan jelas
3. Input jumlah yang tidak hadir dengan akurat
4. Tambahkan catatan jika ada kondisi khusus
5. Cek ringkasan sebelum simpan

### Untuk Maintenance:
1. Pastikan data siswa di database selalu update
2. Siswa yang pindah/keluar harus dinonaktifkan
3. Siswa baru harus ditambahkan dengan `kelasId` yang benar
4. Filter siswa harus include `role: "siswa"` untuk akurasi

---

**Dibuat:** 11 Mei 2026  
**Versi:** 2.0  
**Status:** ✅ Production Ready
