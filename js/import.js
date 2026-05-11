// ============================================
// js/import.js — Import Data dari Excel v2.0
// ============================================

let importData = {
  users: [],
  kelas: [],
  mapel: [],
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
  importData = { users: [], kelas: [], mapel: [] };
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
        [
          "kelas_nama: isi jika role=siswa (harus sama persis dengan nama kelas)",
        ],
        ["jabatan: isi jika role=siswa (ketua / sekretaris)"],
        ["Catatan: Guru tidak perlu mengisi kelas/mapel di sini"],
        ["Jadwal guru diatur oleh admin lewat menu Jadwal Pelajaran"],
      ],
    },
    kelas: {
      sheet: "Kelas",
      headers: ["nama", "tingkat", "jurusan", "jumlahSiswa"],
      contoh: [
        ["X IPA 1", "X", "IPA", 35],
        ["X IPS 1", "X", "IPS", 32],
        ["XI IPA 1", "XI", "IPA", 36],
      ],
      info: [
        ["PETUNJUK:"],
        ["tingkat: X / XI / XII"],
        ["jurusan: IPA / IPS / Bahasa / Umum"],
        ["jumlahSiswa: total siswa di kelas (angka, boleh 0)"],
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

      importData = { users: [], kelas: [], mapel: [] };

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
        }
      });

      const total =
        importData.users.length +
        importData.kelas.length +
        importData.mapel.length;

      if (total === 0) {
        showImportError(
          "Tidak ada data yang terbaca. Pastikan nama sheet " +
            "sesuai template (Pengguna / Kelas / Mapel).",
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

// ── Preview ───────────────────────────────────────────────

function tampilkanPreview() {
  document.getElementById("countUsers").textContent = importData.users.length;
  document.getElementById("countKelas").textContent = importData.kelas.length;
  document.getElementById("countMapel").textContent = importData.mapel.length;

  renderPreviewUsers();
  renderPreviewKelas();
  renderPreviewMapel();

  const totalDup =
    importData.users.filter((u) => u.duplikat).length +
    importData.kelas.filter((k) => k.duplikat).length +
    importData.mapel.filter((m) => m.duplikat).length;

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
    importData.mapel.filter((m) => m.valid).length;

  document.getElementById("importSuccessMsg").textContent =
    `File berhasil dibaca. ${totalValid} data siap diimport.`;

  document.getElementById("importStep1").classList.add("hidden");
  document.getElementById("importStep2").classList.remove("hidden");
  document.getElementById("btnProses").classList.add("hidden");
  document.getElementById("btnImport").classList.remove("hidden");

  // Tab default
  if (importData.users.length > 0) switchPreviewTab("users");
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

function switchPreviewTab(tab) {
  currentPreviewTab = tab;
  ["users", "kelas", "mapel"].forEach((t) => {
    const key = t.charAt(0).toUpperCase() + t.slice(1);
    document.getElementById(`preview${key}`).classList.add("hidden");
    document.getElementById(`tab${key}`).classList.remove("active-tab");
  });
  const key = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById(`preview${key}`).classList.remove("hidden");
  document.getElementById(`tab${key}`).classList.add("active-tab");
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

  closeModal("modalImport");
  renderUsersTable();
  renderKelasTable();
  renderMapelTable();
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
