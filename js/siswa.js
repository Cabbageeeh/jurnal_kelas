// ============================================
// js/siswa.js — Data Master Siswa
// ============================================

// ── Render Halaman Data Siswa ─────────────────────────────

function renderSiswaTable() {
  const search = document.getElementById("filterSiswaSearch").value.toLowerCase();
  const kelasId = document.getElementById("filterSiswaKelas").value;
  const gender = document.getElementById("filterSiswaGender").value;

  let siswaList = dbGetAll(DB_KEYS.siswa);

  // Filter
  if (search) {
    siswaList = siswaList.filter(
      (s) =>
        s.nama.toLowerCase().includes(search) ||
        s.nis.toLowerCase().includes(search)
    );
  }
  if (kelasId) {
    siswaList = siswaList.filter((s) => s.kelasId === kelasId);
  }
  if (gender) {
    siswaList = siswaList.filter((s) => s.gender === gender);
  }

  // Sort by nama
  siswaList.sort((a, b) => a.nama.localeCompare(b.nama));

  // Render statistik
  renderStatsSiswa(siswaList);

  // Render tabel
  const tbody = document.getElementById("siswaTableBody");

  if (siswaList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:32px;color:var(--gray-400)">
          <i class="fas fa-user-graduate" style="font-size:48px;margin-bottom:12px;opacity:0.5"></i>
          <p>Tidak ada data siswa</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = siswaList
    .map(
      (s, i) => {
        const kelas = dbGetById(DB_KEYS.kelas, s.kelasId);
        const genderBadge =
          s.gender === "L"
            ? '<span class="badge" style="background:#DBEAFE;color:#1E40AF"><i class="fas fa-mars"></i> Laki-laki</span>'
            : s.gender === "P"
              ? '<span class="badge" style="background:#FCE7F3;color:#BE185D"><i class="fas fa-venus"></i> Perempuan</span>'
              : '<span class="badge badge-danger">—</span>';

        return `
        <tr>
          <td>${i + 1}</td>
          <td><code>${s.nis}</code></td>
          <td>
            <div style="font-weight:600;color:var(--gray-800)">${s.nama}</div>
          </td>
          <td>${genderBadge}</td>
          <td><span class="badge badge-admin">${kelas?.nama || "—"}</span></td>
          <td>
            ${
              s.aktif
                ? '<span class="badge badge-success">Aktif</span>'
                : '<span class="badge badge-danger">Nonaktif</span>'
            }
          </td>
          <td>
            <button 
              class="btn btn-sm btn-outline" 
              onclick="editSiswa('${s.id}')"
              title="Edit">
              <i class="fas fa-pen"></i>
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              onclick="hapusSiswa('${s.id}')"
              title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
      }
    )
    .join("");
}

function renderStatsSiswa(siswaList) {
  const totalSiswa = siswaList.length;
  const siswaAktif = siswaList.filter((s) => s.aktif).length;
  const siswaLaki = siswaList.filter((s) => s.gender === "L").length;
  const siswaPerempuan = siswaList.filter((s) => s.gender === "P").length;

  document.getElementById("statsSiswa").innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#EEF2FF;color:#4F46E5">
        <i class="fas fa-user-graduate"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Total Siswa</div>
        <div class="stat-value">${totalSiswa}</div>
        <div class="stat-desc">${siswaAktif} aktif</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#DBEAFE;color:#1E40AF">
        <i class="fas fa-mars"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Laki-laki</div>
        <div class="stat-value">${siswaLaki}</div>
        <div class="stat-desc">${((siswaLaki / totalSiswa) * 100 || 0).toFixed(1)}%</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#FCE7F3;color:#BE185D">
        <i class="fas fa-venus"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Perempuan</div>
        <div class="stat-value">${siswaPerempuan}</div>
        <div class="stat-desc">${((siswaPerempuan / totalSiswa) * 100 || 0).toFixed(1)}%</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#FEF3C7;color:#D97706">
        <i class="fas fa-chalkboard"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Kelas</div>
        <div class="stat-value">${new Set(siswaList.map((s) => s.kelasId)).size}</div>
        <div class="stat-desc">Kelas berbeda</div>
      </div>
    </div>
  `;
}

// ── Init Filter ───────────────────────────────────────────

function initFilterSiswa() {
  // Isi dropdown kelas
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const kelasSelect = document.getElementById("filterSiswaKelas");
  kelasSelect.innerHTML =
    '<option value="">Semua Kelas</option>' +
    kelasList.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");
}

function clearFilterSiswa() {
  document.getElementById("filterSiswaSearch").value = "";
  document.getElementById("filterSiswaKelas").value = "";
  document.getElementById("filterSiswaGender").value = "";
  renderSiswaTable();
}

// ── Modal Tambah/Edit Siswa ───────────────────────────────

function openSiswaModal() {
  document.getElementById("siswaId").value = "";
  document.getElementById("siswaNis").value = "";
  document.getElementById("siswaNama").value = "";
  document.getElementById("siswaGender").value = "";
  document.getElementById("siswaKelasId").value = "";
  document.getElementById("siswaAktif").value = "true";
  document.getElementById("modalSiswaTitle").textContent = "Tambah Siswa";
  document.getElementById("siswaFormError").classList.add("hidden");

  // Isi dropdown kelas
  const kelasList = dbGetAll(DB_KEYS.kelas);
  document.getElementById("siswaKelasId").innerHTML =
    '<option value="">— Pilih Kelas —</option>' +
    kelasList.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");

  openModal("modalSiswa");
}

function editSiswa(id) {
  const siswa = dbGetById(DB_KEYS.siswa, id);
  if (!siswa) {
    showToast("Data siswa tidak ditemukan", "error");
    return;
  }

  document.getElementById("siswaId").value = siswa.id;
  document.getElementById("siswaNis").value = siswa.nis;
  document.getElementById("siswaNama").value = siswa.nama;
  document.getElementById("siswaGender").value = siswa.gender || "";
  document.getElementById("siswaKelasId").value = siswa.kelasId;
  document.getElementById("siswaAktif").value = siswa.aktif ? "true" : "false";
  document.getElementById("modalSiswaTitle").textContent = "Edit Siswa";
  document.getElementById("siswaFormError").classList.add("hidden");

  // Isi dropdown kelas
  const kelasList = dbGetAll(DB_KEYS.kelas);
  document.getElementById("siswaKelasId").innerHTML =
    '<option value="">— Pilih Kelas —</option>' +
    kelasList.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");

  openModal("modalSiswa");
}

function saveSiswa() {
  const id = document.getElementById("siswaId").value;
  const nis = document.getElementById("siswaNis").value.trim();
  const nama = document.getElementById("siswaNama").value.trim();
  const gender = document.getElementById("siswaGender").value;
  const kelasId = document.getElementById("siswaKelasId").value;
  const aktif = document.getElementById("siswaAktif").value === "true";

  // Validasi
  if (!nis || !nama || !gender || !kelasId) {
    document.getElementById("siswaFormError").textContent =
      "Semua field wajib diisi!";
    document.getElementById("siswaFormError").classList.remove("hidden");
    return;
  }

  // Cek duplikat NIS
  const existingSiswa = dbGetAll(DB_KEYS.siswa).find(
    (s) => s.nis === nis && s.id !== id
  );
  if (existingSiswa) {
    document.getElementById("siswaFormError").textContent =
      "NIS sudah terdaftar!";
    document.getElementById("siswaFormError").classList.remove("hidden");
    return;
  }

  const data = {
    nis,
    nama,
    gender,
    kelasId,
    aktif,
  };

  if (id) {
    // Update
    dbUpdate(DB_KEYS.siswa, id, data);
    showToast("Data siswa berhasil diupdate!", "success");
  } else {
    // Insert
    data.id = generateId("siswa");
    data.createdAt = new Date().toISOString();
    dbInsert(DB_KEYS.siswa, data);
    showToast("Data siswa berhasil ditambahkan!", "success");
  }

  // Update jumlah siswa di kelas
  updateJumlahSiswaKelas(kelasId);

  closeModal("modalSiswa");
  renderSiswaTable();
}

function hapusSiswa(id) {
  const siswa = dbGetById(DB_KEYS.siswa, id);
  if (!siswa) {
    showToast("Data siswa tidak ditemukan", "error");
    return;
  }

  const kelas = dbGetById(DB_KEYS.kelas, siswa.kelasId);

  if (
    !confirm(
      `Hapus data siswa?\n\n` +
        `Nama: ${siswa.nama}\n` +
        `NIS: ${siswa.nis}\n` +
        `Kelas: ${kelas?.nama || "—"}\n\n` +
        `Data absensi siswa di jurnal juga akan dihapus!`
    )
  ) {
    return;
  }

  // Hapus dari jurnal
  const allJurnal = dbGetAll(DB_KEYS.jurnal);
  allJurnal.forEach((jurnal) => {
    if (jurnal.absensi) {
      ["sakit", "izin", "alpha"].forEach((status) => {
        if (jurnal.absensi[status] && Array.isArray(jurnal.absensi[status])) {
          jurnal.absensi[status] = jurnal.absensi[status].filter(
            (s) => s.nis !== siswa.nis && s.nama !== siswa.nama
          );
          jurnal[`jumlah${status.charAt(0).toUpperCase() + status.slice(1)}`] =
            jurnal.absensi[status].length;
        }
      });
      dbUpdate(DB_KEYS.jurnal, jurnal.id, jurnal);
    }
  });

  // Hapus user siswa jika ada
  const userSiswa = dbGetAll(DB_KEYS.users).find(
    (u) => u.role === "siswa" && u.username === siswa.nis
  );
  if (userSiswa) {
    dbDelete(DB_KEYS.users, userSiswa.id);
  }

  // Hapus siswa
  dbDelete(DB_KEYS.siswa, id);

  // Update jumlah siswa di kelas
  updateJumlahSiswaKelas(siswa.kelasId);

  showToast("Data siswa berhasil dihapus!", "success");
  renderSiswaTable();
}

// ── Helper ────────────────────────────────────────────────

function updateJumlahSiswaKelas(kelasId) {
  const kelas = dbGetById(DB_KEYS.kelas, kelasId);
  if (kelas) {
    const siswaAktif = dbGetAll(DB_KEYS.siswa).filter(
      (s) => s.kelasId === kelasId && s.aktif
    );
    kelas.jumlahSiswa = siswaAktif.length;
    dbUpdate(DB_KEYS.kelas, kelasId, kelas);
  }
}
