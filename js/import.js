// ============================================
// js/import.js — Import Data dari Excel v2.0
// ============================================

let importData = {
  users: [],
  kelas: [],
  mapel: [],
  jadwal: [],
  siswa: [],
};

let currentPreviewTab = "users";

// ── Buka Modal ────────────────────────────────────────────

let currentImportType = "users";

function openImportModal(type = "users") {
  currentImportType = type;
  resetImportModal();
  openModal("modalImport");
}

function resetImportModal() {
  document.getElementById("importStep1").classList.remove("hidden");
  document.getElementById("importStep2").classList.add("hidden");
  document.getElementById("btnProses").classList.remove("hidden");
  document.getElementById("btnImport").classList.add("hidden");
  clearFile();
  hideImportError();
  importData = { users: [], kelas: [], mapel: [], jadwal: [], siswa: [] };
}

// ── Download Template ─────────────────────────────────────

function downloadTemplate(type) {
  const wb = XLSX.utils.book_new();

  const templates = {    

    siswa: {
      sheet: "Siswa",
      headers: [
        "nis",
        "nama",
        "gender",
        "kelas_nama",
      ],
      contoh: [
        ["12345", "Ahmad Fauzi", "L", "X-1"],
        ["12346", "Siti Nurhaliza", "P", "X-1"],
        ["12347", "Budi Santoso", "L", "X-2"],
        ["12348", "Dewi Lestari", "P", "XI-A"],
        ["12349", "Eko Prasetyo", "L", "XI-A"],
        ["12350", "Fitri Handayani", "P", "XII-B"],
      ],
      info: [
        ["PETUNJUK IMPORT DATA SISWA:"],
        [""],
        ["⚠️ PENTING - PERBEDAAN DATA SISWA:"],
        [""],
        ["1. DATA SISWA (Template ini):"],
        ["   • Tujuan: Rekap absensi saja"],
        ["   • TIDAK BISA LOGIN ke sistem"],
        ["   • Untuk: Semua siswa di sekolah"],
        ["   • Kolom: NIS, Nama, Gender, Kelas"],
        [""],
        ["2. PENGGUNA SISWA (Template Pengguna):"],
        ["   • Tujuan: Login ke sistem web"],
        ["   • BISA LOGIN dengan username & password"],
        ["   • Untuk: Ketua & Sekretaris kelas saja"],
        ["   • Kolom: Nama, Username, Password, Role, Kelas, Jabatan"],
        [""],
        ["KOLOM TEMPLATE INI:"],
        ["• nis: Nomor Induk Siswa (unik, tidak boleh duplikat)"],
        ["• nama: Nama lengkap siswa"],
        ["• gender: Jenis kelamin (L = Laki-laki, P = Perempuan)"],
        ["• kelas_nama: Nama kelas (harus sama persis dengan data kelas yang ada)"],
        [""],
        ["FORMAT GENDER:"],
        ["• L = Laki-laki"],
        ["• P = Perempuan"],
        ["• Bisa juga: Laki-laki, Perempuan, LAKI-LAKI, PEREMPUAN"],
        ["• Sistem akan otomatis convert ke L/P"],
        [""],
        ["CATATAN PENTING:"],
        ["• Data siswa ini HANYA untuk rekap absensi"],
        ["• Siswa ini TIDAK BISA login ke sistem"],
        ["• Untuk ketua/sekretaris yang perlu login, gunakan Template Pengguna"],
        ["• Pastikan kelas sudah ada di sistem sebelum import"],
        ["• NIS harus unik untuk setiap siswa"],
        ["• Gender wajib diisi (L atau P)"],
        ["• Format kelas: X-1, XI-A, XII-B (sesuai format baru)"],
        [""],
        ["✨ FITUR OTOMATIS:"],
        ["• Jumlah siswa di data master kelas akan otomatis terupdate"],
        ["• Ketika siswa (ketua/sekretaris) isi jurnal, jumlah siswa otomatis terisi"],
        ["• Tidak perlu input manual jumlah siswa di data master kelas"],
        [""],
        ["CONTOH:"],
        ["• Siswa laki-laki kelas 10: nis=12345, nama=Ahmad Fauzi, gender=L, kelas_nama=X-1"],
        ["• Siswa perempuan kelas 11: nis=12346, nama=Siti Nurhaliza, gender=P, kelas_nama=XI-A"],
      ],
    },

    users: {
      sheet: "Pengguna",
      headers: [
        "nama",
        "username",
        "password",
        "role",
        "kelas_nama",
        "jabatan",
      ],
      contoh: [
        ["Budi Santoso S.Pd", "budi2", "guru123", "guru", "", ""],
        ["Ani Wulandari", "ani", "siswa123", "siswa", "X-1", "ketua"],
        ["Dodi Pratama", "dodi", "siswa123", "siswa", "X-1", "sekretaris"],
        ["Siti Rahmawati", "siti2", "siswa123", "siswa", "XI-A", ""],
        ["Ahmad Fauzi", "ahmad2", "siswa123", "siswa", "XII-B", "ketua"],
      ],
      info: [
        ["PETUNJUK IMPORT PENGGUNA:"],
        [""],
        ["ROLE YANG BISA LOGIN:"],
        ["• admin: Akses penuh ke semua fitur"],
        ["• guru: Mengelola jurnal dan absensi kelas yang diajar"],
        ["• siswa: Melihat jurnal dan absensi kelas (HANYA KETUA & SEKRETARIS)"],
        [""],
        ["⚠️ PENTING - SISWA YANG BISA LOGIN:"],
        ["• HANYA Ketua & Sekretaris kelas yang perlu akun login"],
        ["• Siswa lainnya TIDAK PERLU akun login"],
        ["• Siswa lainnya diimport via Template Siswa (untuk rekap absensi)"],
        [""],
        ["KOLOM:"],
        ["• nama: Nama lengkap pengguna"],
        ["• username: Username untuk login (unik)"],
        ["• password: Password untuk login"],
        ["• role: admin / guru / siswa"],
        ["• kelas_nama: Isi jika role=siswa (harus sama persis dengan nama kelas)"],
        ["• jabatan: Isi jika role=siswa (ketua / sekretaris)"],
        [""],
        ["CATATAN:"],
        ["• Guru tidak perlu mengisi kelas/mapel di sini"],
        ["• Jadwal guru diatur oleh admin lewat menu Jadwal Pelajaran"],
        ["• Untuk siswa biasa (bukan ketua/sekretaris), gunakan Template Siswa"],
      ],
    },
    kelas: {
      sheet: "Kelas",
      headers: ["nama", "tingkat", "jurusan", "jumlahSiswa"],
      contoh: [
        ["X-1", "X", "1", 35],
        ["X-2", "X", "2", 32],
        ["X-12", "X", "12", 30],
        ["XI-A", "XI", "A", 36],
        ["XI-B", "XI", "B", 34],
        ["XII-A", "XII", "A", 33],
        ["XII-G", "XII", "G", 31],
      ],
      info: [
        ["PETUNJUK PENGISIAN:"],
        [""],
        ["FORMAT KELAS:"],
        ["• Kelas 10 (X): X-1, X-2, X-3, ... X-12"],
        ["• Kelas 11 (XI): XI-A, XI-B, XI-C, ... XI-G"],
        ["• Kelas 12 (XII): XII-A, XII-B, XII-C, ... XII-G"],
        [""],
        ["KOLOM:"],
        ["• nama: Nama kelas (format: {Tingkat}-{Jurusan/Nomor})"],
        ["• tingkat: X / XI / XII"],
        ["• jurusan: Untuk kelas X isi nomor 1-12, untuk XI & XII isi huruf A-G"],
        ["• jumlahSiswa: Total siswa di kelas (angka, boleh 0)"],
        [""],
        ["CONTOH:"],
        ["• Kelas 10 nomor 5: nama=X-5, tingkat=X, jurusan=5"],
        ["• Kelas 11 jurusan C: nama=XI-C, tingkat=XI, jurusan=C"],
        ["• Kelas 12 jurusan F: nama=XII-F, tingkat=XII, jurusan=F"],
      ],
    },
    mapel: {
      sheet: "Mapel",
      headers: ["kode", "nama"],
      contoh: [
        ["MTK", "Matematika"],
        ["FIS", "Fisika"],
        ["KIM", "Kimia"],
      ],
      info: [
        ["PETUNJUK:"],
        ["kode: singkatan mapel huruf kapital (maks 6 karakter)"],
        ["nama: nama lengkap mata pelajaran"],
      ],
    },
    jadwal: {
      sheet: "Jadwal",
      headers: ["hari", "jam_ke", "guru_nama", "kelas_nama", "mapel_kode"],
      contoh: [
        ["Senin", "1,2", "Budi Santoso, S.Pd", "X-1", "MTK"],
        ["Senin", "3", "Siti Rahayu, S.Pd", "X-1", "BIND"],
        ["Senin", "4,5", "Ahmad Fauzi, M.Pd", "XI-A", "FIS"],
        ["Selasa", "1,2", "Budi Santoso, S.Pd", "X-2", "MTK"],
        ["Selasa", "6,7", "Dewi Lestari, S.Pd", "XII-A", "BIO"],
        ["Rabu", "1", "Siti Rahayu, S.Pd", "XI-B", "BIND"],
        ["Kamis", "3,4,5", "Ahmad Fauzi, M.Pd", "XII-B", "KIM"],
      ],
      info: [
        ["PETUNJUK PENGISIAN JADWAL:"],
        [""],
        ["KOLOM:"],
        ["• hari: Senin / Selasa / Rabu / Kamis / Jumat / Sabtu"],
        ["• jam_ke: Nomor jam pelajaran (bisa lebih dari 1, pisahkan dengan koma)"],
        ["  Contoh: 1 atau 1,2 atau 1,2,3"],
        ["• guru_nama: Nama lengkap guru (harus sama persis dengan data guru)"],
        ["• kelas_nama: Nama kelas (format baru: X-1, XI-A, XII-B)"],
        ["• mapel_kode: Kode mata pelajaran (harus sama dengan data mapel)"],
        [""],
        ["CONTOH:"],
        ["• Senin jam 1-2, Pak Budi mengajar MTK di X-1"],
        ["  Senin, 1,2, Budi Santoso S.Pd, X-1, MTK"],
        [""],
        ["• Rabu jam 4-5-6, Bu Siti mengajar BIND di XI-A"],
        ["  Rabu, 4,5,6, Siti Rahayu S.Pd, XI-A, BIND"],
        [""],
        ["CATATAN PENTING:"],
        ["• Pastikan guru, kelas, dan mapel sudah ada di sistem"],
        ["• Import guru, kelas, mapel terlebih dahulu sebelum import jadwal"],
        ["• Satu guru tidak bisa mengajar 2 kelas di jam yang sama"],
        ["• Satu kelas tidak bisa diajar 2 guru di jam yang sama"],
        ["• Jadwal akan otomatis terikat ke periode aktif saat ini"],
      ],
    },
  };

  const t = templates[type];
  if (!t) return;

  const ws = XLSX.utils.aoa_to_sheet([t.headers, ...t.contoh]);
  ws["!cols"] = t.headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, t.sheet);

  const wsInfo = XLSX.utils.aoa_to_sheet(t.info);
  XLSX.utils.book_append_sheet(wb, wsInfo, "Petunjuk");

  XLSX.writeFile(wb, `template_${type}.xlsx`);
  showToast(`Template berhasil didownload!`, "success");
}

// ── File Upload ───────────────────────────────────────────

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) loadFile(file);
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById("dropZone").classList.remove("drag-over");
  const file = event.dataTransfer.files[0];
  if (file) loadFile(file);
}

function handleDragOver(event) {
  event.preventDefault();
  document.getElementById("dropZone").classList.add("drag-over");
}

function handleDragLeave() {
  document.getElementById("dropZone").classList.remove("drag-over");
}

function loadFile(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    showImportError("File harus berformat .xlsx atau .xls");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showImportError("Ukuran file maksimal 5MB");
    return;
  }

  hideImportError();
  document.getElementById("fileInfo").classList.remove("hidden");
  document.getElementById("fileName").textContent = file.name;
  document.getElementById("fileSize").textContent =
    (file.size / 1024).toFixed(1) + " KB";
  window._selectedFile = file;
}

function clearFile() {
  const fi = document.getElementById("fileInput");
  if (fi) fi.value = "";
  const fileInfo = document.getElementById("fileInfo");
  if (fileInfo) fileInfo.classList.add("hidden");
  window._selectedFile = null;
  hideImportError();
}

// ── Proses File ───────────────────────────────────────────

function prosesFile() {
  if (!window._selectedFile) {
    showImportError("Pilih file Excel terlebih dahulu.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: "array" });

      importData = { users: [], kelas: [], mapel: [], jadwal: [], siswa: [] };

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const name = sheetName.toLowerCase();

        if (name.includes("siswa")) {
          importData.siswa = parseSiswa(rows);
        } else if (name.includes("pengguna") || name.includes("user")) {
          importData.users = parseUsers(rows);
        } else if (name.includes("kelas")) {
          importData.kelas = parseKelas(rows);
        } else if (name.includes("mapel") || name.includes("mata")) {
          importData.mapel = parseMapel(rows);
        } else if (name.includes("jadwal") || name.includes("schedule")) {
          importData.jadwal = parseJadwal(rows);
        }
      });

      const total =
        importData.users.length +
        importData.kelas.length +
        importData.mapel.length +
        importData.jadwal.length +
        importData.siswa.length;

      if (total === 0) {
        showImportError(
          "Tidak ada data yang terbaca. Pastikan nama sheet " +
            "sesuai template (Pengguna / Kelas / Mapel / Jadwal).",
        );
        return;
      }

      tampilkanPreview();
    } catch (err) {
      showImportError("Gagal membaca file. Pastikan format benar.");
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(window._selectedFile);
}

// ── Parser ────────────────────────────────────────────────

function parseUsers(rows) {
  const kelasList = dbGetAll(DB_KEYS.kelas);
  return rows
    .filter((r) => r.nama && r.username && r.password && r.role)
    .map((r) => {
      const role = String(r.role).toLowerCase().trim();
      const kelas = kelasList.find(
        (k) =>
          k.nama.toLowerCase() === String(r.kelas_nama || "").toLowerCase(),
      );
      const exists = dbGetAll(DB_KEYS.users).find(
        (u) => u.username === String(r.username).trim(),
      );

      return {
        nama: String(r.nama).trim(),
        username: String(r.username).trim(),
        password: String(r.password).trim(),
        role,
        kelasId: kelas?.id || "",
        kelasNama:
          kelas?.nama ||
          (r.kelas_nama ? `⚠️ ${r.kelas_nama} tidak ditemukan` : "—"),
        jabatan: String(r.jabatan || "")
          .toLowerCase()
          .trim(),
        duplikat: !!exists,
        valid: !exists && ["admin", "guru", "siswa"].includes(role),
      };
    });
}

function parseKelas(rows) {
  return rows
    .filter((r) => r.nama && r.tingkat && r.jurusan)
    .map((r) => {
      const nama = String(r.nama).trim();
      const exists = dbGetAll(DB_KEYS.kelas).find(
        (k) => k.nama.toLowerCase() === nama.toLowerCase(),
      );
      return {
        nama,
        tingkat: String(r.tingkat).trim(),
        jurusan: String(r.jurusan).trim(),
        jumlahSiswa: parseInt(r.jumlahSiswa) || 0,
        duplikat: !!exists,
        valid: !exists,
      };
    });
}

function parseMapel(rows) {
  return rows
    .filter((r) => r.kode && r.nama)
    .map((r) => {
      const kode = String(r.kode).trim().toUpperCase();
      const exists = dbGetAll(DB_KEYS.mapel).find(
        (m) => m.kode.toLowerCase() === kode.toLowerCase(),
      );
      return {
        kode,
        nama: String(r.nama).trim(),
        duplikat: !!exists,
        valid: !exists,
      };
    });
}

function parseJadwal(rows) {
  const guruList = dbGetAll(DB_KEYS.users).filter((u) => u.role === "guru");
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const mapelList = dbGetAll(DB_KEYS.mapel);
  const periodeAktif = dbGetAll(DB_KEYS.periode).find((p) => p.aktif);

  return rows
    .filter((r) => r.hari && r.jam_ke && r.guru_nama && r.kelas_nama && r.mapel_kode)
    .map((r) => {
      const hari = String(r.hari).trim();
      const jamKeStr = String(r.jam_ke).trim();
      const jamKe = jamKeStr.split(',').map(j => parseInt(j.trim())).filter(j => !isNaN(j));
      
      // Cari guru berdasarkan nama
      const guru = guruList.find(
        (g) => g.nama.toLowerCase() === String(r.guru_nama).trim().toLowerCase()
      );
      
      // Cari kelas berdasarkan nama
      const kelas = kelasList.find(
        (k) => k.nama.toLowerCase() === String(r.kelas_nama).trim().toLowerCase()
      );
      
      // Cari mapel berdasarkan kode
      const mapel = mapelList.find(
        (m) => m.kode.toLowerCase() === String(r.mapel_kode).trim().toUpperCase().toLowerCase()
      );

      // Validasi
      let errors = [];
      if (!periodeAktif) errors.push("Tidak ada periode aktif");
      if (!["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].includes(hari)) {
        errors.push("Hari tidak valid");
      }
      if (jamKe.length === 0) errors.push("Jam tidak valid");
      if (!guru) errors.push(`Guru "${r.guru_nama}" tidak ditemukan`);
      if (!kelas) errors.push(`Kelas "${r.kelas_nama}" tidak ditemukan`);
      if (!mapel) errors.push(`Mapel "${r.mapel_kode}" tidak ditemukan`);

      // Cek konflik jadwal
      const konflik = dbGetAll(DB_KEYS.jadwal).find(
        (j) =>
          j.periodeId === periodeAktif?.id &&
          j.hari === hari &&
          j.guruId === guru?.id &&
          j.jamKe.some((ke) => jamKe.includes(ke))
      );

      return {
        hari,
        jamKe,
        jamKeStr: jamKe.join(', '),
        guruId: guru?.id || "",
        guruNama: guru?.nama || `⚠️ ${r.guru_nama}`,
        kelasId: kelas?.id || "",
        kelasNama: kelas?.nama || `⚠️ ${r.kelas_nama}`,
        mapelId: mapel?.id || "",
        mapelKode: mapel?.kode || `⚠️ ${r.mapel_kode}`,
        periodeId: periodeAktif?.id || "",
        errors: errors.length > 0 ? errors.join(", ") : null,
        duplikat: !!konflik,
        valid: errors.length === 0 && !konflik && periodeAktif && guru && kelas && mapel,
      };
    });
}

function parseSiswa(rows) {
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const siswaList = dbGetAll(DB_KEYS.siswa);
  
  return rows
    .filter((r) => r.nis && r.nama && r.kelas_nama)
    .map((r) => {
      const nis = String(r.nis).trim();
      const nama = String(r.nama).trim();
      
      // Parse gender (L/P atau Laki-laki/Perempuan)
      let gender = "";
      if (r.gender) {
        const g = String(r.gender).trim().toUpperCase();
        if (g === "L" || g.startsWith("LAKI")) {
          gender = "L";
        } else if (g === "P" || g.startsWith("PEREM")) {
          gender = "P";
        }
      }
      
      // Cari kelas berdasarkan nama
      const kelas = kelasList.find(
        (k) => k.nama.toLowerCase() === String(r.kelas_nama).trim().toLowerCase()
      );
      
      // Cek duplikat NIS
      const exists = siswaList.find((s) => s.nis === nis);
      
      let errors = [];
      if (!kelas) errors.push(`Kelas "${r.kelas_nama}" tidak ditemukan`);
      if (exists) errors.push("NIS sudah terdaftar");
      if (!gender) errors.push("Gender tidak valid (gunakan L/P)");
      
      return {
        nis,
        nama,
        gender,
        kelasId: kelas?.id || "",
        kelasNama: kelas?.nama || `⚠️ ${r.kelas_nama}`,
        errors: errors.length > 0 ? errors.join(", ") : null,
        duplikat: !!exists,
        valid: errors.length === 0 && !exists && kelas && gender,
      };
    });
}

// ── Preview ───────────────────────────────────────────────

function tampilkanPreview() {
  document.getElementById("countUsers").textContent = importData.users.length;
  document.getElementById("countKelas").textContent = importData.kelas.length;
  document.getElementById("countMapel").textContent = importData.mapel.length;
  
  // Update counter jadwal dan siswa jika ada
  const countJadwal = document.getElementById("countJadwal");
  if (countJadwal) {
    countJadwal.textContent = importData.jadwal ? importData.jadwal.length : 0;
  }
  
  const countSiswa = document.getElementById("countSiswa");
  if (countSiswa) {
    countSiswa.textContent = importData.siswa ? importData.siswa.length : 0;
  }

  renderPreviewUsers();
  renderPreviewKelas();
  renderPreviewMapel();
  
  // Render preview jadwal jika ada
  if (importData.jadwal && importData.jadwal.length > 0) {
    renderPreviewJadwal();
  }
  
  // Render preview siswa jika ada
  if (importData.siswa && importData.siswa.length > 0) {
    renderPreviewSiswa();
  }

  const totalDup =
    importData.users.filter((u) => u.duplikat).length +
    importData.kelas.filter((k) => k.duplikat).length +
    importData.mapel.filter((m) => m.duplikat).length +
    (importData.jadwal ? importData.jadwal.filter((j) => j.duplikat).length : 0) +
    (importData.siswa ? importData.siswa.filter((s) => s.duplikat).length : 0);

  const warnEl = document.getElementById("importWarning");
  if (totalDup > 0) {
    warnEl.classList.remove("hidden");
    document.getElementById("importWarningMsg").textContent =
      `${totalDup} data duplikat (baris merah) akan dilewati saat import.`;
  } else {
    warnEl.classList.add("hidden");
  }

  const totalValid =
    importData.users.filter((u) => u.valid).length +
    importData.kelas.filter((k) => k.valid).length +
    importData.mapel.filter((m) => m.valid).length +
    (importData.jadwal ? importData.jadwal.filter((j) => j.valid).length : 0) +
    (importData.siswa ? importData.siswa.filter((s) => s.valid).length : 0);

  document.getElementById("importSuccessMsg").textContent =
    `File berhasil dibaca. ${totalValid} data siap diimport.`;

  document.getElementById("importStep1").classList.add("hidden");
  document.getElementById("importStep2").classList.remove("hidden");
  document.getElementById("btnProses").classList.add("hidden");
  document.getElementById("btnImport").classList.remove("hidden");

  // Tab default
  if (importData.users.length > 0) switchPreviewTab("users");
  else if (importData.kelas.length > 0) switchPreviewTab("kelas");
  else if (importData.mapel.length > 0) switchPreviewTab("mapel");
  else if (importData.jadwal && importData.jadwal.length > 0) switchPreviewTab("jadwal");
  else if (importData.siswa && importData.siswa.length > 0) switchPreviewTab("siswa");
}

function renderPreviewUsers() {
  document.getElementById("previewUsersBody").innerHTML = importData.users
    .length
    ? importData.users
        .map(
          (u, i) => `
          <tr style="${!u.valid ? "background:#FEF2F2;color:#991B1B" : ""}">
            <td>${i + 1}</td>
            <td>${u.nama}</td>
            <td><code>${u.username}</code></td>
            <td>
              <span class="badge badge-${u.role}">${u.role}</span>
            </td>
            <td style="font-size:var(--text-xs)">
              ${
                u.role === "siswa"
                  ? `${u.kelasNama} (${u.jabatan || "—"})`
                  : "—"
              }
            </td>
            <td>
              ${
                u.duplikat
                  ? '<span class="badge badge-danger">Duplikat</span>'
                  : u.valid
                    ? '<span class="badge badge-success">OK</span>'
                    : '<span class="badge badge-warning">Cek Data</span>'
              }
            </td>
          </tr>
        `,
        )
        .join("")
    : `<tr><td colspan="6"
          style="text-align:center;color:var(--gray-400);padding:24px">
          Tidak ada data pengguna.
         </td></tr>`;
}

function renderPreviewKelas() {
  document.getElementById("previewKelasBody").innerHTML = importData.kelas
    .length
    ? importData.kelas
        .map(
          (k, i) => `
          <tr style="${!k.valid ? "background:#FEF2F2;color:#991B1B" : ""}">
            <td>${i + 1}</td>
            <td><strong>${k.nama}</strong></td>
            <td>${k.tingkat}</td>
            <td>${k.jurusan}</td>
            <td>
              <span class="badge badge-siswa">
                <i class="fas fa-users"></i> ${k.jumlahSiswa || 0} siswa
              </span>
            </td>
            <td>
              ${
                k.duplikat
                  ? '<span class="badge badge-danger">Duplikat</span>'
                  : '<span class="badge badge-success">OK</span>'
              }
            </td>
          </tr>
        `,
        )
        .join("")
    : `<tr><td colspan="6"
          style="text-align:center;color:var(--gray-400);padding:24px">
          Tidak ada data kelas.
         </td></tr>`;
}

function renderPreviewMapel() {
  document.getElementById("previewMapelBody").innerHTML = importData.mapel
    .length
    ? importData.mapel
        .map(
          (m, i) => `
          <tr style="${!m.valid ? "background:#FEF2F2;color:#991B1B" : ""}">
            <td>${i + 1}</td>
            <td><code>${m.kode}</code></td>
            <td>${m.nama}</td>
            <td>
              ${
                m.duplikat
                  ? '<span class="badge badge-danger">Duplikat</span>'
                  : '<span class="badge badge-success">OK</span>'
              }
            </td>
          </tr>
        `,
        )
        .join("")
    : `<tr><td colspan="4"
          style="text-align:center;color:var(--gray-400);padding:24px">
          Tidak ada data mapel.
         </td></tr>`;
}

function renderPreviewJadwal() {
  if (!importData.jadwal || importData.jadwal.length === 0) return;
  
  const previewHTML = importData.jadwal
    .map(
      (j, i) => `
      <tr style="${!j.valid ? "background:#FEF2F2;color:#991B1B" : ""}">
        <td>${i + 1}</td>
        <td>${j.hari}</td>
        <td><span class="badge badge-guru">Jam ${j.jamKeStr}</span></td>
        <td style="font-size:var(--text-sm)">${j.guruNama}</td>
        <td><span class="badge badge-admin">${j.kelasNama}</span></td>
        <td><code>${j.mapelKode}</code></td>
        <td>
          ${
            j.errors
              ? `<span class="badge badge-danger" title="${j.errors}">Error</span>`
              : j.duplikat
                ? '<span class="badge badge-danger">Duplikat</span>'
                : '<span class="badge badge-success">OK</span>'
          }
        </td>
      </tr>
    `,
    )
    .join("");

  // Cek apakah elemen preview jadwal sudah ada
  let previewJadwalBody = document.getElementById("previewJadwalBody");
  if (!previewJadwalBody) {
    // Buat elemen preview jadwal jika belum ada
    const previewMapel = document.getElementById("previewMapel");
    if (previewMapel) {
      const previewJadwal = document.createElement("div");
      previewJadwal.id = "previewJadwal";
      previewJadwal.className = "hidden";
      previewJadwal.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Hari</th>
                <th>Jam</th>
                <th>Guru</th>
                <th>Kelas</th>
                <th>Mapel</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="previewJadwalBody"></tbody>
          </table>
        </div>
      `;
      previewMapel.parentNode.insertBefore(previewJadwal, previewMapel.nextSibling);
      previewJadwalBody = document.getElementById("previewJadwalBody");
    }
  }

  if (previewJadwalBody) {
    previewJadwalBody.innerHTML = previewHTML || `
      <tr><td colspan="7"
          style="text-align:center;color:var(--gray-400);padding:24px">
          Tidak ada data jadwal.
         </td></tr>`;
  }
}

function renderPreviewSiswa() {
  if (!importData.siswa || importData.siswa.length === 0) return;
  
  const previewHTML = importData.siswa
    .map(
      (s, i) => `
      <tr style="${!s.valid ? "background:#FEF2F2;color:#991B1B" : ""}">
        <td>${i + 1}</td>
        <td><code>${s.nis}</code></td>
        <td>${s.nama}</td>
        <td>
          ${
            s.gender === "L"
              ? '<span class="badge" style="background:#DBEAFE;color:#1E40AF"><i class="fas fa-mars"></i> Laki-laki</span>'
              : s.gender === "P"
                ? '<span class="badge" style="background:#FCE7F3;color:#BE185D"><i class="fas fa-venus"></i> Perempuan</span>'
                : '<span class="badge badge-danger">—</span>'
          }
        </td>
        <td><span class="badge badge-admin">${s.kelasNama}</span></td>
        <td>
          ${
            s.errors
              ? `<span class="badge badge-danger" title="${s.errors}">Error</span>`
              : s.duplikat
                ? '<span class="badge badge-danger">Duplikat</span>'
                : '<span class="badge badge-success">OK</span>'
          }
        </td>
      </tr>
    `,
    )
    .join("");

  // Cek apakah elemen preview siswa sudah ada
  let previewSiswaBody = document.getElementById("previewSiswaBody");
  if (!previewSiswaBody) {
    // Buat elemen preview siswa jika belum ada
    const previewMapel = document.getElementById("previewMapel");
    if (previewMapel) {
      const previewSiswa = document.createElement("div");
      previewSiswa.id = "previewSiswa";
      previewSiswa.className = "hidden";
      previewSiswa.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Gender</th>
                <th>Kelas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="previewSiswaBody"></tbody>
          </table>
        </div>
      `;
      previewMapel.parentNode.insertBefore(previewSiswa, previewMapel.nextSibling);
      previewSiswaBody = document.getElementById("previewSiswaBody");
    }
  }

  if (previewSiswaBody) {
    previewSiswaBody.innerHTML = previewHTML || `
      <tr><td colspan="5"
          style="text-align:center;color:var(--gray-400);padding:24px">
          Tidak ada data siswa.
         </td></tr>`;
  }
}

function switchPreviewTab(tab) {
  currentPreviewTab = tab;
  ["users", "kelas", "mapel", "jadwal", "siswa"].forEach((t) => {
    const key = t.charAt(0).toUpperCase() + t.slice(1);
    const previewEl = document.getElementById(`preview${key}`);
    const tabEl = document.getElementById(`tab${key}`);
    if (previewEl) previewEl.classList.add("hidden");
    if (tabEl) tabEl.classList.remove("active-tab");
  });
  const key = tab.charAt(0).toUpperCase() + tab.slice(1);
  const previewEl = document.getElementById(`preview${key}`);
  const tabEl = document.getElementById(`tab${key}`);
  if (previewEl) previewEl.classList.remove("hidden");
  if (tabEl) tabEl.classList.add("active-tab");
}

// ── Simpan Import ─────────────────────────────────────────

function konfirmasiImport() {
  let total = 0;

  // Import mapel dulu
  importData.mapel
    .filter((m) => m.valid)
    .forEach((m) => {
      dbInsert(DB_KEYS.mapel, {
        id: generateId("mp"),
        nama: m.nama,
        kode: m.kode,
        aktif: true,
      });
      total++;
    });

  // Import kelas
  importData.kelas
    .filter((k) => k.valid)
    .forEach((k) => {
      dbInsert(DB_KEYS.kelas, {
        id: generateId("kls"),
        nama: k.nama,
        tingkat: k.tingkat,
        jurusan: k.jurusan,
        jumlahSiswa: k.jumlahSiswa || 0,
        aktif: true,
      });
      total++;
    });

  // Refresh list setelah insert
  const kelasList = dbGetAll(DB_KEYS.kelas);

  // Import users
  importData.users
    .filter((u) => u.valid)
    .forEach((u) => {
      const kelas = kelasList.find(
        (k) => k.nama.toLowerCase() === u.kelasNama?.toLowerCase(),
      );

      const userData = {
        id: generateId("u"),
        nama: u.nama,
        username: u.username,
        password: u.password,
        role: u.role,
        aktif: true,
        createdAt: new Date().toISOString(),
      };

      if (u.role === "siswa") {
        userData.kelasId = u.kelasId || kelas?.id || "";
        userData.jabatan = u.jabatan;
      }

      dbInsert(DB_KEYS.users, userData);
      total++;
    });

  // Import jadwal
  if (importData.jadwal && importData.jadwal.length > 0) {
    importData.jadwal
      .filter((j) => j.valid)
      .forEach((j) => {
        dbInsert(DB_KEYS.jadwal, {
          id: generateId("jdw"),
          periodeId: j.periodeId,
          hari: j.hari,
          jamKe: j.jamKe,
          guruId: j.guruId,
          kelasId: j.kelasId,
          mapelId: j.mapelId,
          aktif: true,
          createdAt: new Date().toISOString(),
        });
        total++;
      });
  }

  // Import siswa
  if (importData.siswa && importData.siswa.length > 0) {
    // Hitung jumlah siswa per kelas
    const jumlahSiswaPerKelas = {};
    
    importData.siswa
      .filter((s) => s.valid)
      .forEach((s) => {
        // Insert data siswa
        dbInsert(DB_KEYS.siswa, {
          id: generateId("siswa"),
          nis: s.nis,
          nama: s.nama,
          gender: s.gender,
          kelasId: s.kelasId,
          aktif: true,
          createdAt: new Date().toISOString(),
        });
        total++;
        
        // Hitung jumlah siswa per kelas
        if (!jumlahSiswaPerKelas[s.kelasId]) {
          jumlahSiswaPerKelas[s.kelasId] = 0;
        }
        jumlahSiswaPerKelas[s.kelasId]++;
      });
    
    // Update jumlahSiswa di data master kelas
    Object.keys(jumlahSiswaPerKelas).forEach((kelasId) => {
      const kelas = dbGetById(DB_KEYS.kelas, kelasId);
      if (kelas) {
        // Ambil jumlah siswa yang sudah ada + yang baru diimport
        const siswaExisting = dbGetAll(DB_KEYS.siswa).filter(
          (s) => s.kelasId === kelasId && s.aktif
        );
        
        // PERBAIKAN: Gunakan dbUpdate dengan parameter yang benar
        dbUpdate(DB_KEYS.kelas, kelasId, { jumlahSiswa: siswaExisting.length });
      }
    });
  }

  closeModal("modalImport");
  
  // Refresh tables
  renderUsersTable();
  renderKelasTable();
  renderMapelTable();
  if (typeof renderJadwalGrid === 'function') {
    renderJadwalGrid();
  }
  if (typeof renderSiswaTable === 'function') {
    renderSiswaTable();
  }
  renderDashboard();

  // Auto navigate ke halaman yang relevan setelah import
  if (currentImportType === 'siswa' && typeof showPage === 'function') {
    setTimeout(() => {
      showPage('siswa');
    }, 500);
  } else if (currentImportType === 'users' && typeof showPage === 'function') {
    setTimeout(() => {
      showPage('users');
    }, 500);
  } else if (currentImportType === 'kelas' && typeof showPage === 'function') {
    setTimeout(() => {
      showPage('kelas');
    }, 500);
  } else if (currentImportType === 'jadwal' && typeof showPage === 'function') {
    setTimeout(() => {
      showPage('jadwal');
    }, 500);
  }

  showToast(`${total} data berhasil diimport!`, "success", 4000);
}

// ── Error Helpers ─────────────────────────────────────────

function showImportError(msg) {
  const el = document.getElementById("importError");
  if (!el) return;
  document.getElementById("importErrorMsg").textContent = msg;
  el.classList.remove("hidden");
}

function hideImportError() {
  const el = document.getElementById("importError");
  if (el) el.classList.add("hidden");
}
