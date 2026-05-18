// ============================================
// js/siswa.js — Data Master Siswa
// ============================================

// ── Render Halaman Data Siswa ─────────────────────────────

function renderSiswaTable() {
  const search = document.getElementById("filterSiswaSearch").value.toLowerCase();
  const kelasId = document.getElementById("filterSiswaKelas").value;
  const gender = document.getElementById("filterSiswaGender").value;
  const sortBy = document.getElementById("sortSiswa")?.value || "nama";

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

  // Sort berdasarkan pilihan
  switch (sortBy) {
    case "nama":
      siswaList.sort((a, b) => a.nama.localeCompare(b.nama));
      break;
    case "nis":
      siswaList.sort((a, b) => a.nis.localeCompare(b.nis));
      break;
    case "kelas":
      siswaList.sort((a, b) => {
        const kelasA = dbGetById(DB_KEYS.kelas, a.kelasId)?.nama || "";
        const kelasB = dbGetById(DB_KEYS.kelas, b.kelasId)?.nama || "";
        return kelasA.localeCompare(kelasB);
      });
      break;
    case "gender":
      siswaList.sort((a, b) => {
        const genderA = a.gender || "";
        const genderB = b.gender || "";
        return genderA.localeCompare(genderB);
      });
      break;
    default:
      siswaList.sort((a, b) => a.nama.localeCompare(b.nama));
  }

  // Render statistik
  renderStatsSiswa(siswaList);

  // Tampilkan info wali kelas jika ada filter kelas
  const waliKelasInfo = document.getElementById("waliKelasInfo");
  if (kelasId) {
    const kelas = dbGetById(DB_KEYS.kelas, kelasId);
    const waliKelas = kelas?.waliKelasId ? dbGetById(DB_KEYS.users, kelas.waliKelasId) : null;
    
    if (waliKelas) {
      waliKelasInfo.innerHTML = `
        <div class="alert alert-info" style="margin-bottom: 16px">
          <i class="fas fa-chalkboard-user"></i>
          <span>
            <strong>Wali Kelas ${kelas.nama}:</strong> ${waliKelas.nama}
          </span>
        </div>
      `;
    } else {
      waliKelasInfo.innerHTML = `
        <div class="alert alert-warning" style="margin-bottom: 16px">
          <i class="fas fa-circle-exclamation"></i>
          <span>
            Kelas <strong>${kelas?.nama || '—'}</strong> belum memiliki wali kelas.
          </span>
        </div>
      `;
    }
  } else {
    waliKelasInfo.innerHTML = '';
  }

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
  document.getElementById("sortSiswa").value = "nama";
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

// ── Hapus Massal Siswa ────────────────────────────────────

function openHapusMassalSiswaModal() {
  // Reset form
  document.getElementById("modeHapusMassal").value = "";
  document.getElementById("kelasHapusMassal").value = "";
  document.getElementById("konfirmasiHapusMassalInput").value = "";
  document.getElementById("btnKonfirmasiHapusMassal").disabled = true;
  document.getElementById("groupPilihKelas").classList.add("hidden");
  document.getElementById("infoHapusMassal").style.display = "none";

  // Isi dropdown kelas
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const kelasSelect = document.getElementById("kelasHapusMassal");
  kelasSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
    kelasList.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");

  // Setup event listener untuk input konfirmasi
  const input = document.getElementById("konfirmasiHapusMassalInput");
  input.oninput = function() {
    const mode = document.getElementById("modeHapusMassal").value;
    const kelasId = document.getElementById("kelasHapusMassal").value;
    
    const isValid = this.value === "HAPUS MASSAL" && 
                    mode && 
                    (mode === "semua" || (mode === "kelas" && kelasId));
    
    document.getElementById("btnKonfirmasiHapusMassal").disabled = !isValid;
  };

  openModal("modalHapusMassal");
}

function updateInfoHapusMassal() {
  const mode = document.getElementById("modeHapusMassal").value;
  const kelasId = document.getElementById("kelasHapusMassal").value;

  // Show/hide kelas selector
  if (mode === "kelas") {
    document.getElementById("groupPilihKelas").classList.remove("hidden");
  } else {
    document.getElementById("groupPilihKelas").classList.add("hidden");
  }

  // Update info
  if (mode) {
    let siswaList = dbGetAll(DB_KEYS.siswa).filter(s => s.aktif);
    let infoKelas = "";

    if (mode === "kelas" && kelasId) {
      siswaList = siswaList.filter(s => s.kelasId === kelasId);
      const kelas = dbGetById(DB_KEYS.kelas, kelasId);
      infoKelas = kelas?.nama || "—";
    } else if (mode === "semua") {
      infoKelas = "SEMUA KELAS";
    }

    if ((mode === "semua") || (mode === "kelas" && kelasId)) {
      document.getElementById("infoJumlahSiswa").textContent = siswaList.length;
      document.getElementById("infoKelas").textContent = infoKelas;
      document.getElementById("infoHapusMassal").style.display = "block";
    } else {
      document.getElementById("infoHapusMassal").style.display = "none";
    }
  } else {
    document.getElementById("infoHapusMassal").style.display = "none";
  }

  // Reset konfirmasi
  document.getElementById("konfirmasiHapusMassalInput").value = "";
  document.getElementById("btnKonfirmasiHapusMassal").disabled = true;
}

function eksekusiHapusMassal() {
  const mode = document.getElementById("modeHapusMassal").value;
  const kelasId = document.getElementById("kelasHapusMassal").value;

  if (!mode) {
    showToast("Pilih mode hapus terlebih dahulu", "error");
    return;
  }

  if (mode === "kelas" && !kelasId) {
    showToast("Pilih kelas terlebih dahulu", "error");
    return;
  }

  try {
    // Ambil daftar siswa yang akan dihapus
    let siswaList = dbGetAll(DB_KEYS.siswa).filter(s => s.aktif);
    
    if (mode === "kelas") {
      siswaList = siswaList.filter(s => s.kelasId === kelasId);
    }

    if (siswaList.length === 0) {
      showToast("Tidak ada siswa yang akan dihapus", "warning");
      return;
    }

    let totalJurnalDiubah = 0;
    let totalUserDihapus = 0;
    const kelasYangTerpengaruh = new Set();

    // Proses hapus setiap siswa
    siswaList.forEach(siswa => {
      // 1. Hapus dari jurnal
      const allJurnal = dbGetAll(DB_KEYS.jurnal);
      
      allJurnal.forEach(jurnal => {
        let updated = false;
        
        if (jurnal.absensi) {
          // Hapus dari sakit, izin, alpha
          ['sakit', 'izin', 'alpha'].forEach(status => {
            if (jurnal.absensi[status] && Array.isArray(jurnal.absensi[status])) {
              const before = jurnal.absensi[status].length;
              jurnal.absensi[status] = jurnal.absensi[status].filter(
                s => s.nis !== siswa.nis && s.nama !== siswa.nama
              );
              if (jurnal.absensi[status].length !== before) {
                updated = true;
                jurnal[`jumlah${status.charAt(0).toUpperCase() + status.slice(1)}`] = 
                  jurnal.absensi[status].length;
              }
            }
          });
          
          if (updated) {
            const kelas = dbGetById(DB_KEYS.kelas, jurnal.kelasId);
            if (kelas) {
              jurnal.jumlahHadir = kelas.jumlahSiswa - 
                (jurnal.jumlahSakit + jurnal.jumlahIzin + jurnal.jumlahAlpha);
            }
            dbUpdate(DB_KEYS.jurnal, jurnal.id, jurnal);
            totalJurnalDiubah++;
          }
        }
      });

      // 2. Hapus user
      const userSiswa = dbGetAll(DB_KEYS.users).find(
        u => u.role === 'siswa' && u.username === siswa.nis
      );
      if (userSiswa) {
        dbDelete(DB_KEYS.users, userSiswa.id);
        totalUserDihapus++;
      }

      // 3. Hapus siswa
      dbDelete(DB_KEYS.siswa, siswa.id);
      kelasYangTerpengaruh.add(siswa.kelasId);
    });

    // 4. Update jumlah siswa di kelas
    kelasYangTerpengaruh.forEach(kelasId => {
      const kelas = dbGetById(DB_KEYS.kelas, kelasId);
      if (kelas) {
        const siswaAktif = dbGetAll(DB_KEYS.siswa).filter(
          s => s.kelasId === kelas.id && s.aktif
        );
        kelas.jumlahSiswa = siswaAktif.length;
        dbUpdate(DB_KEYS.kelas, kelas.id, kelas);
      }
    });

    // Tutup modal
    closeModal("modalHapusMassal");

    // Tampilkan hasil
    const infoKelas = mode === "semua" ? "SEMUA KELAS" : 
      dbGetById(DB_KEYS.kelas, kelasId)?.nama || "—";

    document.getElementById("hasilHapusContent").innerHTML = `
      <div style="text-align: center; padding: 20px">
        <div style="font-size: 64px; color: var(--success); margin-bottom: 16px">
          <i class="fas fa-circle-check"></i>
        </div>
        <h3 style="color: var(--gray-800); margin-bottom: 8px">Penghapusan Massal Selesai!</h3>
        <p style="color: var(--gray-600); margin-bottom: 20px">Berikut ringkasan penghapusan:</p>
      </div>
      <div style="background: var(--gray-50); padding: 16px; border-radius: var(--radius-md)">
        <div style="display: grid; gap: 10px; font-size: var(--text-sm)">
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-users" style="color: var(--danger)"></i> Total Siswa Dihapus:</span>
            <strong style="color: var(--danger)">${siswaList.length} siswa</strong>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-chalkboard" style="color: var(--primary)"></i> Kelas:</span>
            <strong>${infoKelas}</strong>
          </div>
          <hr style="margin: 8px 0; border-color: var(--gray-200)">
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-file-lines" style="color: var(--success)"></i> Jurnal Diupdate:</span>
            <strong style="color: var(--success)">${totalJurnalDiubah} jurnal</strong>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-user-xmark" style="color: var(--success)"></i> Akun User Dihapus:</span>
            <strong style="color: var(--success)">${totalUserDihapus} akun</strong>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-chalkboard-user" style="color: var(--success)"></i> Kelas Terpengaruh:</span>
            <strong style="color: var(--success)">${kelasYangTerpengaruh.size} kelas</strong>
          </div>
        </div>
      </div>
    `;

    openModal("modalHasilHapus");

    // Refresh tampilan
    renderSiswaTable();
    
  } catch (error) {
    console.error("Error hapus massal:", error);
    closeModal("modalHapusMassal");
    showToast("Gagal menghapus data: " + error.message, "error");
  }
}
