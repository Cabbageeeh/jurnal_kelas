// ============================================
// js/import.js — Import Data dari Excel v3.0
// Tambah: Import Jadwal
// ============================================

let importData = {
  users: [],
  kelas: [],
  mapel: [],
  jadwal: [], // ← TAMBAH
};

let currentPreviewTab = "users";

// ── Buka Modal ────────────────────────────────────────────

function openImportModal(type = "users") {
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
  importData = { users: [], kelas: [], mapel: [], jadwal: [] };
}

// ── Download Template ─────────────────────────────────────

function downloadTemplate(type) {
  const wb = XLSX.utils.book_new();

  const templates = {
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
        ["Ani Wulandari", "ani", "siswa123", "siswa", "X IPA 1", "ketua"],
        ["Dodi Pratama", "dodi", "siswa123", "siswa", "X IPA 1", "sekretaris"],
      ],
      info: [
        ["PETUNJUK:"],
        ["role: admin / guru / siswa"],
        ["kelas_nama: isi jika role=siswa"],
        ["jabatan: ketua / sekretaris (jika role=siswa)"],
      ],
    },
    kelas: {
      sheet: "Kelas",
      headers: ["nama", "tingkat", "jurusan"],
      contoh: [
        ["X IPA 1", "X", "IPA"],
        ["X IPS 1", "X", "IPS"],
        ["XI IPA 1", "XI", "IPA"],
      ],
      info: [
        ["PETUNJUK:"],
        ["tingkat: X / XI / XII"],
        ["jurusan: IPA / IPS / Bahasa / Umum"],
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
        ["kode: singkatan mapel huruf kapital"],
        ["nama: nama lengkap mata pelajaran"],
      ],
    },
    jadwal: {
      sheet: "Jadwal",
      headers: ["guru_username", "hari", "jam_ke", "kelas_nama", "mapel_kode"],
      contoh: [
        ["budi", "Senin", "1,2", "X IPA 1", "MTK"],
        ["budi", "Senin", "6,7", "XI IPA 1", "FIS"],
        ["siti", "Selasa", "3,4", "X IPS 1", "BIND"],
        ["ahmad", "Rabu", "1,2,3", "XII IPA 1", "KIM"],
        ["dewi", "Kamis", "1,2", "X IPA 1", "BIO"],
      ],
      info: [
        ["PETUNJUK PENGISIAN JADWAL:"],
        ["guru_username: username guru di sistem"],
        ["hari: Senin/Selasa/Rabu/Kamis/Jumat/Sabtu"],
        ["jam_ke: nomor jam dipisah koma, cth: 1,2 atau 3,4,5"],
        ["kelas_nama: nama kelas persis seperti di sistem"],
        ["mapel_kode: kode mapel persis seperti di sistem"],
        [""],
        ["PENTING:"],
        ["- Satu baris = satu sesi mengajar"],
        ["- Guru tidak boleh double jam di hari yang sama"],
        ["- Kelas tidak boleh double guru di jam yang sama"],
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
  showToast("Template berhasil didownload!", "success");
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

      importData = { users: [], kelas: [], mapel: [], jadwal: [] };

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const name = sheetName.toLowerCase();

        if (name.includes("pengguna") || name.includes("user")) {
          importData.users = parseUsers(rows);
        } else if (name.includes("kelas")) {
          importData.kelas = parseKelas(rows);
        } else if (name.includes("mapel") || name.includes("mata")) {
          importData.mapel = parseMapel(rows);
        } else if (name.includes("jadwal")) {
          importData.jadwal = parseJadwal(rows);
        }
      });

      const total =
        importData.users.length +
        importData.kelas.length +
        importData.mapel.length +
        importData.jadwal.length;

      if (total === 0) {
        showImportError(
          "Tidak ada data terbaca. Pastikan nama sheet sesuai " +
            "(Pengguna / Kelas / Mapel / Jadwal).",
        );
        return;
      }

      tampilkanPreview();
    } catch (err) {
      showImportError("Gagal membaca file.");
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
        kelasNama: kelas?.nama || (r.kelas_nama ? `⚠️ ${r.kelas_nama}` : "—"),
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
  const userList = dbGetAll(DB_KEYS.users);
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const mapelList = dbGetAll(DB_KEYS.mapel);
  const periode = getPeriodeAktif();
  const hariValid = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Kumpulkan jadwal yang sudah ada untuk cek tabrakan
  const jadwalExisting = dbGetAll(DB_KEYS.jadwal).filter(
    (j) => j.periodeId === periode?.id,
  );

  // Kumpulkan jadwal baru dari file untuk cek tabrakan antar baris
  const jadwalBaru = [];

  return rows
    .filter(
      (r) =>
        r.guru_username && r.hari && r.jam_ke && r.kelas_nama && r.mapel_kode,
    )
    .map((r, idx) => {
      const username = String(r.guru_username).trim().toLowerCase();
      const hari = String(r.hari).trim();
      const jamKeStr = String(r.jam_ke).trim();
      const kelasNama = String(r.kelas_nama).trim();
      const mapelKode = String(r.mapel_kode).trim().toUpperCase();

      // Cari referensi
      const guru = userList.find(
        (u) => u.username.toLowerCase() === username && u.role === "guru",
      );
      const kelas = kelasList.find(
        (k) => k.nama.toLowerCase() === kelasNama.toLowerCase(),
      );
      const mapel = mapelList.find(
        (m) => m.kode.toLowerCase() === mapelKode.toLowerCase(),
      );

      // Parse jam ke array angka
      const jamKe = jamKeStr
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));

      // ── Validasi ─────────────────────────────────────

      // 1. Cek referensi
      if (!guru) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: "—",
          kelasValid: !!kelas,
          mapelValid: !!mapel,
          status: "error",
          pesan: `❌ Guru "${username}" tidak ditemukan`,
        };
      }
      if (!kelas) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          kelasValid: false,
          mapelValid: !!mapel,
          status: "error",
          pesan: `❌ Kelas "${kelasNama}" tidak ditemukan`,
        };
      }
      if (!mapel) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          kelasValid: true,
          mapelValid: false,
          status: "error",
          pesan: `❌ Mapel "${mapelKode}" tidak ditemukan`,
        };
      }
      if (!hariValid.includes(hari)) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "error",
          pesan: `❌ Hari "${hari}" tidak valid`,
        };
      }
      if (jamKe.length === 0) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "error",
          pesan: `❌ Format jam tidak valid`,
        };
      }

      // 2. Cek tabrakan dengan jadwal EXISTING
      const tabrakanGuru = jadwalExisting.find(
        (j) =>
          j.guruId === guru.id &&
          j.hari === hari &&
          j.jamKe.some((ke) => jamKe.includes(ke)),
      );
      if (tabrakanGuru) {
        const k = dbGetById(DB_KEYS.kelas, tabrakanGuru.kelasId);
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "warning",
          pesan: `⚠️ Guru sudah ada jadwal di jam ini (${k?.nama})`,
        };
      }

      const tabrakanKelas = jadwalExisting.find(
        (j) =>
          j.kelasId === kelas.id &&
          j.hari === hari &&
          j.jamKe.some((ke) => jamKe.includes(ke)),
      );
      if (tabrakanKelas) {
        const g = dbGetById(DB_KEYS.users, tabrakanKelas.guruId);
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "warning",
          pesan: `⚠️ Kelas sudah ada guru lain di jam ini (${g?.nama})`,
        };
      }

      // 3. Cek tabrakan dengan data BARU dari file yang sama
      const tabrakanGuruBaru = jadwalBaru.find(
        (j) =>
          j.guruId === guru.id &&
          j.hari === hari &&
          j.jamKe.some((ke) => jamKe.includes(ke)),
      );
      if (tabrakanGuruBaru) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "warning",
          pesan: `⚠️ Tabrakan dengan baris lain di file ini`,
        };
      }

      const tabrakanKelasBaru = jadwalBaru.find(
        (j) =>
          j.kelasId === kelas.id &&
          j.hari === hari &&
          j.jamKe.some((ke) => jamKe.includes(ke)),
      );
      if (tabrakanKelasBaru) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "warning",
          pesan: `⚠️ Kelas tabrakan dengan baris lain di file ini`,
        };
      }

      // 4. Cek duplikat persis
      const duplikat = jadwalExisting.find(
        (j) =>
          j.guruId === guru.id &&
          j.kelasId === kelas.id &&
          j.mapelId === mapel.id &&
          j.hari === hari &&
          JSON.stringify(j.jamKe.sort()) === JSON.stringify([...jamKe].sort()),
      );
      if (duplikat) {
        return {
          row: idx + 1,
          username,
          hari,
          jamKeStr,
          kelasNama,
          mapelKode,
          guruNama: guru.nama,
          status: "duplikat",
          pesan: `🔵 Jadwal ini sudah ada di sistem`,
        };
      }

      // ✅ Valid — tambah ke jadwalBaru untuk cek baris berikutnya
      jadwalBaru.push({
        guruId: guru.id,
        kelasId: kelas.id,
        mapelId: mapel.id,
        hari,
        jamKe,
      });

      return {
        row: idx + 1,
        username,
        hari,
        jamKeStr,
        kelasNama,
        mapelKode,
        guruNama: guru.nama,
        kelasNama: kelas.nama,
        mapelNama: mapel.nama,
        guruId: guru.id,
        kelasId: kelas.id,
        mapelId: mapel.id,
        jamKe,
        status: "ok",
        pesan: "✅ OK",
      };
    });
}

// ── Preview ───────────────────────────────────────────────

function tampilkanPreview() {
  document.getElementById("countUsers").textContent = importData.users.length;
  document.getElementById("countKelas").textContent = importData.kelas.length;
  document.getElementById("countMapel").textContent = importData.mapel.length;
  document.getElementById("countJadwal").textContent = importData.jadwal.length;

  renderPreviewUsers();
  renderPreviewKelas();
  renderPreviewMapel();
  renderPreviewJadwal();

  // Hitung warning & error
  const totalDup =
    importData.users.filter((u) => u.duplikat).length +
    importData.kelas.filter((k) => k.duplikat).length +
    importData.mapel.filter((m) => m.duplikat).length +
    importData.jadwal.filter((j) => j.status === "duplikat").length;

  const totalError = importData.jadwal.filter(
    (j) => j.status === "error" || j.status === "warning",
  ).length;

  const warnEl = document.getElementById("importWarning");
  if (totalDup > 0 || totalError > 0) {
    warnEl.classList.remove("hidden");
    document.getElementById("importWarningMsg").textContent =
      `${totalDup} duplikat dan ${totalError} data bermasalah ` +
      `akan dilewati saat import.`;
  } else {
    warnEl.classList.add("hidden");
  }

  const totalValid =
    importData.users.filter((u) => u.valid).length +
    importData.kelas.filter((k) => k.valid).length +
    importData.mapel.filter((m) => m.valid).length +
    importData.jadwal.filter((j) => j.status === "ok").length;

  document.getElementById("importSuccessMsg").textContent =
    `File berhasil dibaca. ${totalValid} data siap diimport.`;

  document.getElementById("importStep1").classList.add("hidden");
  document.getElementById("importStep2").classList.remove("hidden");
  document.getElementById("btnProses").classList.add("hidden");
  document.getElementById("btnImport").classList.remove("hidden");

  // Default tab ke yang punya data
  if (importData.jadwal.length > 0) switchPreviewTab("jadwal");
  else if (importData.users.length > 0) switchPreviewTab("users");
  else if (importData.kelas.length > 0) switchPreviewTab("kelas");
  else switchPreviewTab("mapel");
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
                    : '<span class="badge badge-warning">Cek</span>'
              }
            </td>
          </tr>
        `,
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;
          color:var(--gray-400);padding:24px">
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
    : `<tr><td colspan="5" style="text-align:center;
          color:var(--gray-400);padding:24px">
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
    : `<tr><td colspan="4" style="text-align:center;
          color:var(--gray-400);padding:24px">
          Tidak ada data mapel.
         </td></tr>`;
}

function renderPreviewJadwal() {
  const statusStyle = {
    ok: "",
    error: "background:#FEF2F2;color:#991B1B",
    warning: "background:#FEF9C3;color:#92400E",
    duplikat: "background:#EFF6FF;color:#1E40AF",
  };

  const statusBadge = {
    ok: '<span class="badge badge-success">✅ OK</span>',
    error: '<span class="badge badge-danger">❌ Error</span>',
    warning: '<span class="badge badge-warning">⚠️ Tabrakan</span>',
    duplikat: '<span class="badge badge-primary">🔵 Duplikat</span>',
  };

  document.getElementById("previewJadwalBody").innerHTML = importData.jadwal
    .length
    ? importData.jadwal
        .map(
          (j, i) => `
          <tr style="${statusStyle[j.status] || ""}">
            <td>${i + 1}</td>
            <td style="font-size:var(--text-xs)">
              ${j.guruNama || j.username}
            </td>
            <td>${j.hari}</td>
            <td>
              <span class="badge badge-guru">
                Jam ${j.jamKeStr}
              </span>
            </td>
            <td>${j.kelasNama}</td>
            <td>${j.mapelNama || j.mapelKode}</td>
            <td>
              ${statusBadge[j.status] || ""}
              <div style="font-size:10px;color:inherit;margin-top:2px">
                ${j.pesan || ""}
              </div>
            </td>
          </tr>
        `,
        )
        .join("")
    : `<tr><td colspan="7" style="text-align:center;
          color:var(--gray-400);padding:24px">
          Tidak ada data jadwal.
         </td></tr>`;
}

function switchPreviewTab(tab) {
  currentPreviewTab = tab;
  ["users", "kelas", "mapel", "jadwal"].forEach((t) => {
    const key = t.charAt(0).toUpperCase() + t.slice(1);
    document.getElementById(`preview${key}`)?.classList.add("hidden");
    document.getElementById(`tab${key}`)?.classList.remove("active-tab");
  });
  const key = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById(`preview${key}`)?.classList.remove("hidden");
  document.getElementById(`tab${key}`)?.classList.add("active-tab");
}

// ── Simpan Import ─────────────────────────────────────────

function konfirmasiImport() {
  let total = 0;
  const periode = getPeriodeAktif();

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

  // Import jadwal — hanya yang status 'ok'
  if (periode) {
    importData.jadwal
      .filter((j) => j.status === "ok")
      .forEach((j) => {
        dbInsert(DB_KEYS.jadwal, {
          id: generateId("jdw"),
          periodeId: periode.id,
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

  closeModal("modalImport");
  renderUsersTable();
  renderKelasTable();
  renderMapelTable();
  renderJadwalGrid();
  renderDashboard();

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
