// ============================================
// js/admin.js — Dashboard Admin v2.0
// ============================================

let currentSession = null;

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  currentSession = requireAuth("admin");
  if (!currentSession) return;

  document.getElementById("sidebarName").textContent = currentSession.nama;
  document.getElementById("sidebarAvatar").textContent = currentSession.nama
    .charAt(0)
    .toUpperCase();
  document.getElementById("topbarDate").textContent =
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  showPage("dashboard");
});

// ── Navigasi ──────────────────────────────────────────────

const PAGE_TITLES = {
  dashboard: "Beranda",
  profil: "Profil Sekolah",
  periode: "Periode / Semester",
  jadwal: "Jadwal Pelajaran",
  jam: "Jam Pelajaran",
  "hari-libur": "Hari Libur",
  users: "Kelola Pengguna",
  kelas: "Kelola Kelas",
  mapel: "Kelola Mata Pelajaran",
  "rekap-jurnal": "Rekap Jurnal",
  "rekap-konfirmasi": "Rekap Konfirmasi",
  "rekap-absensi": "Rekap Absensi",
};

function showPage(page) {
  document
    .querySelectorAll('[id^="page-"]')
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(`page-${page}`).classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle(
      "active",
      el.getAttribute("onclick")?.includes(`'${page}'`),
    );
  });

  document.getElementById("topbarTitle").textContent = PAGE_TITLES[page] || "";

  const actions = {
    "hari-libur": () => {
      populateFilterTahun();
      renderHariLiburTable();
      renderInfoHariIni();
    },

    dashboard: renderDashboard,
    profil: renderProfilPage,
    periode: renderPeriodeTable,
    jadwal: () => {
      populateJadwalFilters();
      renderJadwalGrid();
    },
    jam: renderJamTable,
    users: renderUsersTable,
    siswa: () => {
      initFilterSiswa();
      renderSiswaTable();
    },
    kelas: renderKelasTable,
    mapel: renderMapelTable,
    "rekap-jurnal": () => {
      populateFilterKelas();
      renderRekapJurnal();
    },
    "rekap-konfirmasi": () => {
      populateFilterGuru();
      renderRekapKonfirmasi();
    },
    "rekap-absensi": () => {
      initFilterAbsensi();
      renderRekapAbsensi();
    },
  };
  if (actions[page]) actions[page]();
  closeSidebarMobile();
}

// ── Sidebar ───────────────────────────────────────────────

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("show");
}

function closeSidebarMobile() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}

// ── Modal ─────────────────────────────────────────────────

function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

function showFormError(elId, msg) {
  const el = document.getElementById(elId);
  el.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
  el.classList.remove("hidden");
}

function hideFormError(elId) {
  document.getElementById(elId).classList.add("hidden");
}

// ── DASHBOARD ─────────────────────────────────────────────

function renderDashboard() {
  const periode = getPeriodeAktif();
  document.getElementById("dashPeriodeLabel").textContent = periode
    ? `Periode aktif: ${periode.nama}`
    : "Belum ada periode aktif";

  const users = dbGetAll(DB_KEYS.users);
  const kelas = dbGetAll(DB_KEYS.kelas);
  const jadwal = dbGetAll(DB_KEYS.jadwal);
  const jurnal = dbGetAll(DB_KEYS.jurnal);
  const konfirmasi = dbGetAll(DB_KEYS.konfirmasi);
  const today = getTodayStr();

  const stats = [
    {
      icon: "fa-users",
      color: "admin",
      label: "Total Pengguna",
      value: users.length,
    },
    {
      icon: "fa-chalkboard",
      color: "guru",
      label: "Total Kelas",
      value: kelas.length,
    },
    {
      icon: "fa-calendar-week",
      color: "info",
      label: "Jadwal Aktif",
      value: jadwal.filter((j) => j.aktif).length,
    },
    {
      icon: "fa-user-check",
      color: "siswa",
      label: "Konfirmasi Hari Ini",
      value: konfirmasi.filter((k) => k.tanggal === today).length,
    },
    {
      icon: "fa-file-lines",
      color: "warning",
      label: "Jurnal Hari Ini",
      value: jurnal.filter((j) => j.tanggal === today).length,
    },
  ];

  document.getElementById("statsGrid").innerHTML = stats
    .map(
      (s) => `
    <div class="stat-card">
      <div class="stat-icon ${s.color}">
        <i class="fas ${s.icon}"></i>
      </div>
      <div>
        <div class="stat-number">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    </div>
  `,
    )
    .join("");

  // Konfirmasi hari ini
  const konfHariIni = konfirmasi
    .filter((k) => k.tanggal === today)
    .sort((a, b) => b.waktuKonfirmasi?.localeCompare(a.waktuKonfirmasi));

  document.getElementById("dashKonfirmasiHariIni").innerHTML =
    konfHariIni.length
      ? konfHariIni
          .map((k) => {
            const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
            const g = dbGetById(DB_KEYS.users, k.guruId);
            const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
            const m = dbGetById(DB_KEYS.mapel, j?.mapelId);
            return `
            <div style="padding:10px 0;border-bottom:1px solid var(--gray-100);
              display:flex;align-items:center;gap:10px">
              ${
                k.foto
                  ? `<img src="${k.foto}" style="width:40px;height:40px;
                    border-radius:50%;object-fit:cover;cursor:pointer;
                    border:2px solid var(--success)"
                    onclick="lihatFoto('${k.id}')" title="Lihat foto"/>`
                  : `<div style="width:40px;height:40px;border-radius:50%;
                    background:var(--gray-100);display:flex;align-items:center;
                    justify-content:center;color:var(--gray-400)">
                    <i class="fas fa-user"></i>
                   </div>`
              }
              <div style="flex:1">
                <div style="font-size:var(--text-sm);font-weight:600">
                  ${g?.nama || "—"}
                </div>
                <div style="font-size:var(--text-xs);color:var(--gray-400)">
                  ${kl?.nama || "—"} • ${m?.nama || "—"} •
                  Jam ${j?.jamKe?.join(",") || "—"}
                </div>
              </div>
              <div style="font-size:var(--text-xs);color:var(--gray-500)">
                ${k.waktuKonfirmasi || "—"}
              </div>
            </div>
          `;
          })
          .join("")
      : `<div class="empty-state">
          <i class="fas fa-user-clock"></i>
          <p>Belum ada konfirmasi hari ini</p>
         </div>`;

  // Jurnal terbaru
  const recentJurnal = [...jurnal]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  document.getElementById("dashJurnalTerbaru").innerHTML = recentJurnal.length
    ? recentJurnal
        .map((j) => {
          const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
          const m = dbGetById(DB_KEYS.mapel, j.mapelId);
          return `
            <div style="padding:8px 0;border-bottom:1px solid var(--gray-100)">
              <div style="display:flex;justify-content:space-between">
                <span style="font-size:var(--text-sm);font-weight:500">
                  ${kl?.nama || "—"} — ${m?.nama || "—"}
                </span>
                <span class="badge badge-siswa">Jam ${j.jamKe}</span>
              </div>
              <div style="font-size:var(--text-xs);color:var(--gray-400);margin-top:2px">
                ${formatTanggal(j.tanggal)} •
                ${j.materi?.substring(0, 40) || "—"}
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-state">
          <i class="fas fa-file-circle-xmark"></i>
          <p>Belum ada jurnal</p>
         </div>`;
}

// ── CRUD: PERIODE ─────────────────────────────────────────

function renderPeriodeTable() {
  const data = dbGetAll(DB_KEYS.periode).sort(
    (a, b) => new Date(b.mulai) - new Date(a.mulai),
  );

  document.getElementById("periodeTableBody").innerHTML = data.length
    ? data
        .map(
          (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${p.nama}</strong></td>
          <td>${p.mulai}</td>
          <td>${p.selesai}</td>
          <td>
            <span class="badge ${p.aktif ? "badge-success" : "badge-gray"}">
              ${p.aktif ? "✅ Aktif" : "Nonaktif"}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-outline"
                onclick="openPeriodeModal('${p.id}')">
                <i class="fas fa-pen"></i>
              </button>
              ${
                !p.aktif
                  ? `
              <button class="btn btn-sm btn-danger"
                onclick="confirmDelete('periode','${p.id}','${p.nama}')">
                <i class="fas fa-trash"></i>
              </button>`
                  : ""
              }
            </div>
          </td>
        </tr>
      `,
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada periode.
       </td></tr>`;
}

function openPeriodeModal(id = null) {
  hideFormError("periodeFormError");
  if (id) {
    const p = dbGetById(DB_KEYS.periode, id);
    document.getElementById("modalPeriodeTitle").textContent = "Edit Periode";
    document.getElementById("periodeId").value = p.id;
    document.getElementById("periodeNama").value = p.nama;
    document.getElementById("periodeMulai").value = p.mulai;
    document.getElementById("periodeSelesai").value = p.selesai;
    document.getElementById("periodeAktif").value = String(p.aktif);
  } else {
    document.getElementById("modalPeriodeTitle").textContent = "Tambah Periode";
    document.getElementById("periodeId").value = "";
    document.getElementById("periodeNama").value = "";
    document.getElementById("periodeMulai").value = "";
    document.getElementById("periodeSelesai").value = "";
    document.getElementById("periodeAktif").value = "false";
  }
  openModal("modalPeriode");
}

function savePeriode() {
  const id = document.getElementById("periodeId").value;
  const nama = document.getElementById("periodeNama").value.trim();
  const mulai = document.getElementById("periodeMulai").value;
  const selesai = document.getElementById("periodeSelesai").value;
  const aktif = document.getElementById("periodeAktif").value === "true";

  if (!nama)
    return showFormError("periodeFormError", "Nama periode wajib diisi.");
  if (!mulai)
    return showFormError("periodeFormError", "Tanggal mulai wajib diisi.");
  if (!selesai)
    return showFormError("periodeFormError", "Tanggal selesai wajib diisi.");
  if (mulai >= selesai)
    return showFormError(
      "periodeFormError",
      "Tanggal selesai harus setelah tanggal mulai.",
    );

  // Jika diaktifkan, nonaktifkan semua periode lain
  if (aktif) {
    dbGetAll(DB_KEYS.periode).forEach((p) => {
      if (p.id !== id) dbUpdate(DB_KEYS.periode, p.id, { aktif: false });
    });
  }

  if (id) {
    dbUpdate(DB_KEYS.periode, id, { nama, mulai, selesai, aktif });
  } else {
    dbInsert(DB_KEYS.periode, {
      id: generateId("per"),
      nama,
      mulai,
      selesai,
      aktif,
      createdAt: new Date().toISOString(),
    });
  }

  closeModal("modalPeriode");
  renderPeriodeTable();
  showToast("Periode berhasil disimpan!", "success");
}

// ── CRUD: JADWAL ──────────────────────────────────────────

function populateJadwalFilters() {
  const gurus = dbGetAll(DB_KEYS.users).filter((u) => u.role === "guru");
  const sel = document.getElementById("filterJadwalGuru");
  sel.innerHTML =
    `<option value="">Semua Guru</option>` +
    gurus.map((g) => `<option value="${g.id}">${g.nama}</option>`).join("");

  const kelasList = dbGetAll(DB_KEYS.kelas);
  const selKelas = document.getElementById("filterJadwalKelas");
  if (selKelas) {
    selKelas.innerHTML =
      `<option value="">Semua Kelas</option>` +
      kelasList
        .map((k) => `<option value="${k.id}">${k.nama}</option>`)
        .join("");
  }

  const periode = getPeriodeAktif();
  document.getElementById("jadwalPeriodeLabel").textContent = periode
    ? `Periode: ${periode.nama}`
    : "Belum ada periode aktif";
}

function renderJadwalGrid() {
  const hariFilter = document.getElementById("filterJadwalHari").value;
  const guruFilter = document.getElementById("filterJadwalGuru").value;
  const kelasFilter = document.getElementById("filterJadwalKelas")?.value || "";
  const viewMode = document.getElementById("jadwalViewMode")?.value || "grid";
  const periode = getPeriodeAktif();
  const container = document.getElementById("jadwalGridView");

  if (!periode) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-xmark"></i>
        <p>Belum ada periode aktif.</p>
      </div>`;
    return;
  }

  let jadwal = dbGetAll(DB_KEYS.jadwal).filter(
    (j) => j.periodeId === periode.id,
  );
  if (guruFilter) jadwal = jadwal.filter((j) => j.guruId === guruFilter);
  if (kelasFilter) jadwal = jadwal.filter((j) => j.kelasId === kelasFilter);

  if (viewMode === "list") {
    renderJadwalList(jadwal, hariFilter);
  } else {
    renderJadwalGridView(jadwal, hariFilter, guruFilter, kelasFilter);
  }
}

function renderJadwalGridView(jadwal, hariFilter, guruFilter, kelasFilter) {
  const container = document.getElementById("jadwalGridView");
  const hariList = hariFilter ? [hariFilter] : HARI_LIST;
  const jams = dbGetAll(DB_KEYS.jamPelajaran)
    .filter((j) => j.tipe === "pelajaran" && j.ke !== null)
    .sort((a, b) => a.ke - b.ke);

  // Kelompokkan jadwal per hari per jam
  const jadwalMap = {};
  jadwal.forEach((j) => {
    const minJam = Math.min(...j.jamKe);
    const key = `${j.hari}_${minJam}`;
    if (!jadwalMap[key]) jadwalMap[key] = [];
    jadwalMap[key].push(j);
  });

  // Cari jam unik yang terpakai
  const jamTerpakai = new Set();
  jadwal.forEach((j) => j.jamKe.forEach((ke) => jamTerpakai.add(ke)));
  const jamFilter = jams.filter((j) => jamTerpakai.has(j.ke));

  if (jadwal.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-xmark"></i>
        <p>Belum ada jadwal untuk filter yang dipilih.</p>
      </div>`;
    return;
  }

  // Buat tabel grid
  container.innerHTML = `
    <div class="card">
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;
          min-width:700px">
          <thead>
            <tr style="background:var(--gray-50)">
              <th style="padding:12px 16px;text-align:left;
                font-size:var(--text-xs);font-weight:600;
                color:var(--gray-500);border-bottom:2px solid var(--gray-200);
                white-space:nowrap;min-width:100px">
                JAM / HARI
              </th>
              ${hariList
                .map(
                  (hari) => `
                <th style="padding:12px 16px;text-align:center;
                  font-size:var(--text-sm);font-weight:600;
                  color:var(--gray-700);
                  border-bottom:2px solid var(--gray-200);
                  border-left:1px solid var(--gray-200);
                  min-width:160px">
                  ${hari}
                </th>
              `,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${jamFilter
              .map(
                (jam) => `
              <tr>
                <td style="padding:10px 16px;
                  background:var(--gray-50);
                  border-bottom:1px solid var(--gray-200);
                  font-size:var(--text-xs);
                  font-weight:600;white-space:nowrap">
                  <div style="color:var(--color-guru)">
                    Jam ${jam.ke}
                  </div>
                  <div style="color:var(--gray-400);
                    font-weight:400;margin-top:2px">
                    ${jam.mulai}–${jam.selesai}
                  </div>
                </td>
                ${hariList
                  .map((hari) => {
                    // Cari jadwal yang mencakup jam ini di hari ini
                    const sesi = jadwal.filter(
                      (j) => j.hari === hari && j.jamKe.includes(jam.ke),
                    );

                    if (sesi.length === 0) {
                      return `
                      <td style="padding:8px;
                        border-bottom:1px solid var(--gray-200);
                        border-left:1px solid var(--gray-200);
                        text-align:center">
                        <span style="color:var(--gray-200);
                          font-size:20px">—</span>
                      </td>`;
                    }

                    return `
                    <td style="padding:6px;
                      border-bottom:1px solid var(--gray-200);
                      border-left:1px solid var(--gray-200);
                      vertical-align:top">
                      ${sesi
                        .map((j) => {
                          const guru = dbGetById(DB_KEYS.users, j.guruId);
                          const kelas = dbGetById(DB_KEYS.kelas, j.kelasId);
                          const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
                          const isFirst = Math.min(...j.jamKe) === jam.ke;
                          if (!isFirst) return ""; // hanya tampil di jam pertama
                          return `
                          <div style="background:var(--gray-50);
                            border:1px solid var(--gray-200);
                            border-radius:var(--radius-sm);
                            padding:6px 8px;margin-bottom:4px;
                            font-size:11px;position:relative">
                            <div style="font-weight:600;
                              color:var(--gray-800);margin-bottom:2px;
                              white-space:nowrap;overflow:hidden;
                              text-overflow:ellipsis;max-width:140px"
                              title="${guru?.nama || "—"}">
                              ${guru?.nama?.split(",")[0] || "—"}
                            </div>
                            <div style="display:flex;gap:4px;
                              flex-wrap:wrap;margin-bottom:2px">
                              <span style="background:var(--color-guru);
                                color:white;padding:1px 6px;
                                border-radius:999px;font-size:10px">
                                ${kelas?.nama || "—"}
                              </span>
                              <span style="background:var(--gray-200);
                                color:var(--gray-600);padding:1px 6px;
                                border-radius:999px;font-size:10px">
                                ${mapel?.kode || "—"}
                              </span>
                            </div>
                            <div style="font-size:10px;
                              color:var(--gray-400)">
                              Jam ${j.jamKe.join(",")}
                            </div>
                            <div style="position:absolute;
                              top:4px;right:4px;
                              display:flex;gap:2px">
                              <button
                                onclick="openJadwalModal('${j.id}')"
                                style="background:none;border:none;
                                cursor:pointer;color:var(--gray-400);
                                font-size:10px;padding:2px"
                                title="Edit">
                                ✏️
                              </button>
                              <button
                                onclick="confirmDelete('jadwal','${j.id}',
                                'Jam ${j.jamKe.join(",")} ${hari}')"
                                style="background:none;border:none;
                                cursor:pointer;color:var(--gray-400);
                                font-size:10px;padding:2px"
                                title="Hapus">
                                🗑️
                              </button>
                            </div>
                          </div>
                        `;
                        })
                        .join("")}
                    </td>`;
                  })
                  .join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderJadwalList(jadwal, hariFilter) {
  const container = document.getElementById("jadwalGridView");
  const hariList = hariFilter ? [hariFilter] : HARI_LIST;

  container.innerHTML = hariList
    .map((hari) => {
      const jadwalHari = jadwal
        .filter((j) => j.hari === hari)
        .sort((a, b) => Math.min(...a.jamKe) - Math.min(...b.jamKe));

      return `
      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">
            <i class="fas fa-calendar-day"></i> ${hari}
          </span>
          <span class="badge badge-gray">
            ${jadwalHari.length} sesi
          </span>
        </div>
        <div class="card-body" style="padding:0">
          ${
            jadwalHari.length
              ? `<div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Jam</th><th>Waktu</th><th>Guru</th>
                      <th>Kelas</th><th>Mapel</th>
                      <th>Status</th><th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${jadwalHari
                      .map((j) => {
                        const g = dbGetById(DB_KEYS.users, j.guruId);
                        const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
                        const m = dbGetById(DB_KEYS.mapel, j.mapelId);
                        return `
                        <tr>
                          <td>
                            <span class="badge badge-guru">
                              Jam ${j.jamKe.join(", ")}
                            </span>
                          </td>
                          <td style="font-size:var(--text-xs);
                            white-space:nowrap">
                            ${formatRentangJam(j.jamKe)}
                          </td>
                          <td style="font-size:var(--text-sm)">
                            ${g?.nama || "—"}
                          </td>
                          <td>
                            <span class="badge badge-admin">
                              ${kl?.nama || "—"}
                            </span>
                          </td>
                          <td>${m?.nama || "—"}</td>
                          <td>
                            <span class="badge ${
                              j.aktif ? "badge-success" : "badge-gray"
                            }">
                              ${j.aktif ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td>
                            <div style="display:flex;gap:6px">
                              <button class="btn btn-sm btn-outline"
                                onclick="openJadwalModal('${j.id}')">
                                <i class="fas fa-pen"></i>
                              </button>
                              <button class="btn btn-sm btn-danger"
                                onclick="confirmDelete('jadwal',
                                '${j.id}',
                                'Jam ${j.jamKe.join(",")} ${hari}')">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
               </div>`
              : `<div style="padding:20px;text-align:center;
                color:var(--gray-400);font-size:var(--text-sm)">
                Belum ada jadwal hari ${hari}.
               </div>`
          }
        </div>
      </div>
    `;
    })
    .join("");
}

function setViewMode(mode) {
  document.getElementById("jadwalViewMode").value = mode;

  const btnGrid = document.getElementById("btnViewGrid");
  const btnList = document.getElementById("btnViewList");

  if (mode === "grid") {
    btnGrid.style.background = "var(--primary)";
    btnGrid.style.color = "white";
    btnList.style.background = "var(--gray-100)";
    btnList.style.color = "var(--gray-600)";
  } else {
    btnList.style.background = "var(--primary)";
    btnList.style.color = "white";
    btnGrid.style.background = "var(--gray-100)";
    btnGrid.style.color = "var(--gray-600)";
  }

  renderJadwalGrid();
}

function clearFilterJadwal() {
  document.getElementById("filterJadwalHari").value = "";
  document.getElementById("filterJadwalGuru").value = "";
  const kelasEl = document.getElementById("filterJadwalKelas");
  if (kelasEl) kelasEl.value = "";
  renderJadwalGrid();
}

function openJadwalModal(id = null) {
  hideFormError("jadwalFormError");

  // Isi dropdown periode
  const periodes = dbGetAll(DB_KEYS.periode);
  document.getElementById("jadwalPeriodeId").innerHTML =
    `<option value="">— Pilih Periode —</option>` +
    periodes
      .map(
        (p) =>
          `<option value="${p.id}">${p.nama}${p.aktif ? " (Aktif)" : ""}</option>`,
      )
      .join("");

  // Isi dropdown guru
  const gurus = dbGetAll(DB_KEYS.users).filter(
    (u) => u.role === "guru" && u.aktif,
  );
  document.getElementById("jadwalGuruId").innerHTML =
    `<option value="">— Pilih Guru —</option>` +
    gurus.map((g) => `<option value="${g.id}">${g.nama}</option>`).join("");

  // Isi dropdown kelas & mapel
  const kelasList = dbGetAll(DB_KEYS.kelas).filter((k) => k.aktif);
  document.getElementById("jadwalKelasId").innerHTML =
    `<option value="">— Pilih Kelas —</option>` +
    kelasList.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");

  const mapelList = dbGetAll(DB_KEYS.mapel).filter((m) => m.aktif);
  document.getElementById("jadwalMapelId").innerHTML =
    `<option value="">— Pilih Mapel —</option>` +
    mapelList.map((m) => `<option value="${m.id}">${m.nama}</option>`).join("");

  // Render checkbox jam
  renderJamCheckbox([]);

  if (id) {
    const j = dbGetById(DB_KEYS.jadwal, id);
    document.getElementById("modalJadwalTitle").textContent = "Edit Jadwal";
    document.getElementById("jadwalId").value = j.id;
    document.getElementById("jadwalPeriodeId").value = j.periodeId;
    document.getElementById("jadwalHari").value = j.hari;
    document.getElementById("jadwalGuruId").value = j.guruId;
    document.getElementById("jadwalKelasId").value = j.kelasId;
    document.getElementById("jadwalMapelId").value = j.mapelId;
    document.getElementById("jadwalAktif").value = String(j.aktif);
    renderJamCheckbox(j.jamKe);
  } else {
    document.getElementById("modalJadwalTitle").textContent = "Tambah Jadwal";
    document.getElementById("jadwalId").value = "";
    document.getElementById("jadwalPeriodeId").value =
      getPeriodeAktif()?.id || "";
    document.getElementById("jadwalHari").value = "";
    document.getElementById("jadwalGuruId").value = "";
    document.getElementById("jadwalKelasId").value = "";
    document.getElementById("jadwalMapelId").value = "";
    document.getElementById("jadwalAktif").value = "true";
  }

  openModal("modalJadwal");
}

function renderJamCheckbox(selectedJam = []) {
  const jams = dbGetAll(DB_KEYS.jamPelajaran)
    .filter((j) => j.tipe === "pelajaran")
    .sort((a, b) => a.ke - b.ke);

  document.getElementById("jamCheckboxGroup").innerHTML = jams
    .map(
      (j) => `
    <label style="display:flex;align-items:center;gap:8px;padding:8px 10px;
      border:1.5px solid ${
        selectedJam.includes(j.ke) ? "var(--primary)" : "var(--gray-200)"
      };
      border-radius:var(--radius-sm);cursor:pointer;
      background:${selectedJam.includes(j.ke) ? "#EEF2FF" : "white"};
      font-size:var(--text-sm);transition:all 0.2s">
      <input type="checkbox" value="${j.ke}"
        ${selectedJam.includes(j.ke) ? "checked" : ""}
        style="accent-color:var(--primary)"
        onchange="updateJamCheckboxStyle(this)"/>
      <span>
        <strong>Jam ${j.ke}</strong><br/>
        <span style="font-size:var(--text-xs);color:var(--gray-400)">
          ${j.mulai}–${j.selesai}
        </span>
      </span>
    </label>
  `,
    )
    .join("");
}

function updateJamCheckboxStyle(checkbox) {
  const label = checkbox.closest("label");
  if (checkbox.checked) {
    label.style.borderColor = "var(--primary)";
    label.style.background = "#EEF2FF";
  } else {
    label.style.borderColor = "var(--gray-200)";
    label.style.background = "white";
  }
}

function saveJadwal() {
  const id = document.getElementById("jadwalId").value;
  const periodeId = document.getElementById("jadwalPeriodeId").value;
  const hari = document.getElementById("jadwalHari").value;
  const guruId = document.getElementById("jadwalGuruId").value;
  const kelasId = document.getElementById("jadwalKelasId").value;
  const mapelId = document.getElementById("jadwalMapelId").value;
  const aktif = document.getElementById("jadwalAktif").value === "true";

  // Ambil jam yang dicentang
  const jamKe = [
    ...document.querySelectorAll(
      '#jamCheckboxGroup input[type="checkbox"]:checked',
    ),
  ].map((cb) => parseInt(cb.value));

  if (!periodeId)
    return showFormError("jadwalFormError", "Periode wajib dipilih.");
  if (!hari) return showFormError("jadwalFormError", "Hari wajib dipilih.");
  if (!guruId) return showFormError("jadwalFormError", "Guru wajib dipilih.");
  if (!kelasId) return showFormError("jadwalFormError", "Kelas wajib dipilih.");
  if (!mapelId) return showFormError("jadwalFormError", "Mapel wajib dipilih.");
  if (jamKe.length === 0)
    return showFormError("jadwalFormError", "Pilih minimal 1 jam pelajaran.");

  // Cek konflik jam (guru tidak bisa 2 kelas di jam yang sama)
  const semuaJadwal = dbGetAll(DB_KEYS.jadwal).filter(
    (j) =>
      j.periodeId === periodeId &&
      j.hari === hari &&
      j.guruId === guruId &&
      j.id !== id,
  );

  const konflik = semuaJadwal.find((j) =>
    j.jamKe.some((ke) => jamKe.includes(ke)),
  );

  if (konflik) {
    const kl = dbGetById(DB_KEYS.kelas, konflik.kelasId);
    return showFormError(
      "jadwalFormError",
      `Guru sudah memiliki jadwal di jam ini untuk kelas ${kl?.nama || "lain"}.`,
    );
  }

  // Cek konflik kelas (kelas tidak bisa 2 guru di jam yang sama)
  const konflikKelas = dbGetAll(DB_KEYS.jadwal).find(
    (j) =>
      j.periodeId === periodeId &&
      j.hari === hari &&
      j.kelasId === kelasId &&
      j.id !== id &&
      j.jamKe.some((ke) => jamKe.includes(ke)),
  );

  if (konflikKelas) {
    return showFormError(
      "jadwalFormError",
      "Kelas ini sudah memiliki jadwal di jam yang dipilih.",
    );
  }

  const data = { periodeId, hari, jamKe, guruId, kelasId, mapelId, aktif };

  if (id) {
    dbUpdate(DB_KEYS.jadwal, id, data);
  } else {
    dbInsert(DB_KEYS.jadwal, {
      id: generateId("jdw"),
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  closeModal("modalJadwal");
  renderJadwalGrid();
  showToast("Jadwal berhasil disimpan!", "success");
}

// ── CRUD: JAM PELAJARAN ───────────────────────────────────

function renderJamTable() {
  const jams = dbGetAll(DB_KEYS.jamPelajaran).sort((a, b) => {
    if (a.mulai < b.mulai) return -1;
    if (a.mulai > b.mulai) return 1;
    return 0;
  });

  document.getElementById("jamTableBody").innerHTML = jams.length
    ? jams
        .map((j) => {
          const durasi = hitungDurasi(j.mulai, j.selesai);
          return `
          <tr>
            <td>
              ${
                j.tipe === "pelajaran"
                  ? `<span class="badge badge-guru">Jam ${j.ke}</span>`
                  : "—"
              }
            </td>
            <td><strong>${j.mulai}</strong></td>
            <td><strong>${j.selesai}</strong></td>
            <td>${durasi} menit</td>
            <td>
              <span class="badge ${
                j.tipe === "pelajaran" ? "badge-siswa" : "badge-warning"
              }">
                ${j.tipe === "pelajaran" ? "Pelajaran" : "Istirahat"}
              </span>
            </td>
            <td>${j.label || "—"}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm btn-outline"
                  onclick="openJamModal('${j.id}')">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="confirmDelete('jam','${j.id}',
                  '${j.tipe === "pelajaran" ? "Jam ke-" + j.ke : j.label}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="7" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada data jam.
       </td></tr>`;
}

function hitungDurasi(mulai, selesai) {
  const [h1, m1] = mulai.split(":").map(Number);
  const [h2, m2] = selesai.split(":").map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

function openJamModal(id = null) {
  hideFormError("jamFormError");
  if (id) {
    const j = dbGetById(DB_KEYS.jamPelajaran, id);
    document.getElementById("modalJamTitle").textContent = "Edit Jam";
    document.getElementById("jamId").value = j.id;
    document.getElementById("jamTipe").value = j.tipe;
    document.getElementById("jamKe").value = j.ke || "";
    document.getElementById("jamLabel").value = j.label || "";
    document.getElementById("jamMulai").value = j.mulai;
    document.getElementById("jamSelesai").value = j.selesai;
  } else {
    document.getElementById("modalJamTitle").textContent = "Tambah Jam";
    document.getElementById("jamId").value = "";
    document.getElementById("jamTipe").value = "pelajaran";
    document.getElementById("jamKe").value = "";
    document.getElementById("jamLabel").value = "";
    document.getElementById("jamMulai").value = "";
    document.getElementById("jamSelesai").value = "";
  }
  toggleJamFields();
  openModal("modalJam");
}

function toggleJamFields() {
  const tipe = document.getElementById("jamTipe").value;
  document
    .getElementById("fieldJamKe")
    .classList.toggle("hidden", tipe !== "pelajaran");
  document
    .getElementById("fieldJamLabel")
    .classList.toggle("hidden", tipe !== "istirahat");
}

function saveJam() {
  const id = document.getElementById("jamId").value;
  const tipe = document.getElementById("jamTipe").value;
  const ke = parseInt(document.getElementById("jamKe").value) || null;
  const label = document.getElementById("jamLabel").value.trim();
  const mulai = document.getElementById("jamMulai").value;
  const selesai = document.getElementById("jamSelesai").value;

  if (!mulai) return showFormError("jamFormError", "Waktu mulai wajib diisi.");
  if (!selesai)
    return showFormError("jamFormError", "Waktu selesai wajib diisi.");
  if (mulai >= selesai)
    return showFormError("jamFormError", "Waktu selesai harus setelah mulai.");
  if (tipe === "pelajaran" && !ke)
    return showFormError("jamFormError", "Jam ke wajib diisi.");

  const data = {
    tipe,
    ke: tipe === "pelajaran" ? ke : null,
    label,
    mulai,
    selesai,
  };

  if (id) {
    dbUpdate(DB_KEYS.jamPelajaran, id, data);
  } else {
    dbInsert(DB_KEYS.jamPelajaran, { id: generateId("jp"), ...data });
  }

  closeModal("modalJam");
  renderJamTable();
  showToast("Jam pelajaran berhasil disimpan!", "success");
}

// ── CRUD: USER ────────────────────────────────────────────

function renderUsersTable() {
  const search = document
    .getElementById("filterUserSearch")
    .value.toLowerCase();
  const role = document.getElementById("filterUserRole").value;
  const aktif = document.getElementById("filterUserAktif").value;

  let users = dbGetAll(DB_KEYS.users);
  if (search)
    users = users.filter(
      (u) =>
        u.nama.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search),
    );
  if (role) users = users.filter((u) => u.role === role);
  if (aktif) users = users.filter((u) => String(u.aktif) === aktif);

  const kelasList = dbGetAll(DB_KEYS.kelas);

  document.getElementById("usersTableBody").innerHTML = users.length
    ? users
        .map((u, i) => {
          let info = "—";
          if (u.role === "siswa") {
            const k = kelasList.find((k) => k.id === u.kelasId);
            info = `${k?.nama || "—"} (${u.jabatan || "—"})`;
          }
          return `
          <tr>
            <td>${i + 1}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="user-avatar ${u.role}"
                  style="width:30px;height:30px;font-size:12px;flex-shrink:0">
                  ${u.nama.charAt(0)}
                </div>
                <span style="font-weight:500">${u.nama}</span>
              </div>
            </td>
            <td><code style="background:var(--gray-100);padding:2px 6px;
              border-radius:4px;font-size:12px">@${u.username}</code></td>
            <td><span class="badge badge-${u.role}">${u.role}</span></td>
            <td style="font-size:var(--text-sm);color:var(--gray-500)">${info}</td>
            <td>
              <span class="badge ${u.aktif ? "badge-success" : "badge-gray"}">
                ${u.aktif ? "Aktif" : "Nonaktif"}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm btn-outline"
                  onclick="openUserModal('${u.id}')">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="confirmDelete('user','${u.id}','${u.nama}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="7" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Tidak ada data pengguna.
       </td></tr>`;
}

function openUserModal(id = null) {
  hideFormError("userFormError");
  const kelasList = dbGetAll(DB_KEYS.kelas).filter((k) => k.aktif);
  document.getElementById("userKelas").innerHTML =
    `<option value="">— Pilih Kelas —</option>` +
    kelasList.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");

  if (id) {
    const u = dbGetById(DB_KEYS.users, id);
    document.getElementById("modalUserTitle").textContent = "Edit Pengguna";
    document.getElementById("userId").value = u.id;
    document.getElementById("userNama").value = u.nama;
    document.getElementById("userUsername").value = u.username;
    document.getElementById("userPassword").value = u.password;
    document.getElementById("userRole").value = u.role;
    document.getElementById("userAktif").value = String(u.aktif);
    if (u.kelasId) document.getElementById("userKelas").value = u.kelasId;
    if (u.jabatan) document.getElementById("userJabatan").value = u.jabatan;
  } else {
    document.getElementById("modalUserTitle").textContent = "Tambah Pengguna";
    document.getElementById("userId").value = "";
    document.getElementById("userNama").value = "";
    document.getElementById("userUsername").value = "";
    document.getElementById("userPassword").value = "";
    document.getElementById("userRole").value = "guru";
    document.getElementById("userAktif").value = "true";
  }
  toggleRoleFields();
  openModal("modalUser");
}

function toggleRoleFields() {
  const role = document.getElementById("userRole").value;
  document
    .getElementById("fieldSiswa")
    .classList.toggle("hidden", role !== "siswa");
}

function saveUser() {
  const id = document.getElementById("userId").value;
  const nama = document.getElementById("userNama").value.trim();
  const username = document.getElementById("userUsername").value.trim();
  const password = document.getElementById("userPassword").value.trim();
  const role = document.getElementById("userRole").value;
  const aktif = document.getElementById("userAktif").value === "true";
  const kelasId = document.getElementById("userKelas").value;
  const jabatan = document.getElementById("userJabatan").value;

  if (!nama) return showFormError("userFormError", "Nama wajib diisi.");
  if (!username) return showFormError("userFormError", "Username wajib diisi.");
  if (!password || password.length < 6)
    return showFormError("userFormError", "Password minimal 6 karakter.");

  const exists = dbGetAll(DB_KEYS.users).find(
    (u) => u.username === username && u.id !== id,
  );
  if (exists)
    return showFormError("userFormError", "Username sudah digunakan.");

  const data = { nama, username, password, role, aktif };
  if (role === "siswa") {
    data.kelasId = kelasId;
    data.jabatan = jabatan;
  }

  if (id) {
    dbUpdate(DB_KEYS.users, id, data);
  } else {
    dbInsert(DB_KEYS.users, {
      id: generateId("u"),
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  closeModal("modalUser");
  renderUsersTable();
  showToast("Pengguna berhasil disimpan!", "success");
}

// ── CRUD: KELAS ───────────────────────────────────────────

function renderKelasTable() {
  const kelas = dbGetAll(DB_KEYS.kelas);
  document.getElementById("kelasTableBody").innerHTML = kelas.length
    ? kelas
        .map(
          (k, i) => {
            const waliKelas = k.waliKelasId ? dbGetById(DB_KEYS.users, k.waliKelasId) : null;
            return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${k.nama}</strong></td>
          <td><span class="badge badge-gray">${k.tingkat}</span></td>
          <td>${k.jurusan}</td>
          <td>
            ${waliKelas 
              ? `<div style="font-size:var(--text-sm);color:var(--gray-700)">
                  <i class="fas fa-chalkboard-user"></i> ${waliKelas.nama}
                 </div>`
              : `<span style="color:var(--gray-400);font-size:var(--text-xs)">— Belum ada —</span>`
            }
          </td>
          <td>
            <span class="badge badge-siswa" style="font-size:13px">
              <i class="fas fa-users"></i> ${k.jumlahSiswa || 0} siswa
            </span>
          </td>
          <td>
            <span class="badge ${k.aktif ? "badge-success" : "badge-gray"}">
              ${k.aktif ? "Aktif" : "Nonaktif"}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-outline"
                onclick="openKelasModal('${k.id}')">
                <i class="fas fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-danger"
                onclick="confirmDelete('kelas','${k.id}','${k.nama}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
          }
        )
        .join("")
    : `<tr><td colspan="8" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada kelas.
       </td></tr>`;
}

function openKelasModal(id = null) {
  hideFormError("kelasFormError");
  
  // Isi dropdown wali kelas dengan guru aktif
  const guruList = dbGetAll(DB_KEYS.users).filter(u => u.role === 'guru' && u.aktif);
  const waliKelasSelect = document.getElementById("kelasWaliKelasId");
  waliKelasSelect.innerHTML = '<option value="">— Pilih Wali Kelas —</option>' +
    guruList.map(g => `<option value="${g.id}">${g.nama}</option>`).join('');
  
  if (id) {
    const k = dbGetById(DB_KEYS.kelas, id);
    document.getElementById("modalKelasTitle").textContent = "Edit Kelas";
    document.getElementById("kelasId").value = k.id;
    document.getElementById("kelasNama").value = k.nama;
    document.getElementById("kelasTingkat").value = k.tingkat;
    updateJurusanOptions();
    document.getElementById("kelasJurusan").value = k.jurusan;
    document.getElementById("kelasWaliKelasId").value = k.waliKelasId || "";
    document.getElementById("kelasJumlahSiswa").value = k.jumlahSiswa || 0;
    document.getElementById("kelasAktif").value = String(k.aktif);
  } else {
    document.getElementById("modalKelasTitle").textContent = "Tambah Kelas";
    document.getElementById("kelasId").value = "";
    document.getElementById("kelasNama").value = "";
    document.getElementById("kelasTingkat").value = "X";
    updateJurusanOptions();
    document.getElementById("kelasJurusan").value = "";
    document.getElementById("kelasWaliKelasId").value = "";
    document.getElementById("kelasJumlahSiswa").value = 0;
    document.getElementById("kelasAktif").value = "true";
  }
  openModal("modalKelas");
}

function updateJurusanOptions() {
  const tingkat = document.getElementById("kelasTingkat").value;
  const jurusanSelect = document.getElementById("kelasJurusan");
  
  if (tingkat === "X") {
    // Kelas 10: nomor 1-12
    jurusanSelect.innerHTML = '<option value="">— Pilih Nomor —</option>' +
      Array.from({ length: 12 }, (_, i) => i + 1)
        .map(n => `<option value="${n}">${n}</option>`)
        .join('');
  } else {
    // Kelas 11 & 12: huruf A-G
    jurusanSelect.innerHTML = '<option value="">— Pilih Jurusan —</option>' +
      ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        .map(h => `<option value="${h}">${h}</option>`)
        .join('');
  }
}

function saveKelas() {
  const id = document.getElementById("kelasId").value;
  const tingkat = document.getElementById("kelasTingkat").value;
  const jurusan = document.getElementById("kelasJurusan").value;
  const waliKelasId = document.getElementById("kelasWaliKelasId").value || null;
  const jumlahSiswa =
    parseInt(document.getElementById("kelasJumlahSiswa").value) || 0;
  const aktif = document.getElementById("kelasAktif").value === "true";

  if (!jurusan) return showFormError("kelasFormError", "Jurusan/Nomor kelas wajib dipilih.");
  if (jumlahSiswa < 0)
    return showFormError("kelasFormError", "Jumlah siswa tidak boleh negatif.");

  // Generate nama kelas otomatis berdasarkan tingkat dan jurusan
  const nama = `${tingkat}-${jurusan}`;

  if (id) {
    dbUpdate(DB_KEYS.kelas, id, { nama, tingkat, jurusan, waliKelasId, jumlahSiswa, aktif });
  } else {
    dbInsert(DB_KEYS.kelas, {
      id: generateId("kls"),
      nama,
      tingkat,
      jurusan,
      waliKelasId,
      jumlahSiswa,
      aktif,
    });
  }

  closeModal("modalKelas");
  renderKelasTable();
  showToast("Kelas berhasil disimpan!", "success");
}

// ── CRUD: MAPEL ───────────────────────────────────────────

function renderMapelTable() {
  const mapel = dbGetAll(DB_KEYS.mapel);
  document.getElementById("mapelTableBody").innerHTML = mapel.length
    ? mapel
        .map(
          (m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><code style="background:var(--gray-100);padding:2px 8px;
            border-radius:4px;font-size:12px">${m.kode}</code></td>
          <td><strong>${m.nama}</strong></td>
          <td>
            <span class="badge ${m.aktif ? "badge-success" : "badge-gray"}">
              ${m.aktif ? "Aktif" : "Nonaktif"}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-outline"
                onclick="openMapelModal('${m.id}')">
                <i class="fas fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-danger"
                onclick="confirmDelete('mapel','${m.id}','${m.nama}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `,
        )
        .join("")
    : `<tr><td colspan="5" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada mata pelajaran.
       </td></tr>`;
}

function openMapelModal(id = null) {
  hideFormError("mapelFormError");
  if (id) {
    const m = dbGetById(DB_KEYS.mapel, id);
    document.getElementById("modalMapelTitle").textContent =
      "Edit Mata Pelajaran";
    document.getElementById("mapelId").value = m.id;
    document.getElementById("mapelNama").value = m.nama;
    document.getElementById("mapelKode").value = m.kode;
    document.getElementById("mapelAktif").value = String(m.aktif);
  } else {
    document.getElementById("modalMapelTitle").textContent =
      "Tambah Mata Pelajaran";
    document.getElementById("mapelId").value = "";
    document.getElementById("mapelNama").value = "";
    document.getElementById("mapelKode").value = "";
    document.getElementById("mapelAktif").value = "true";
  }
  openModal("modalMapel");
}

function saveMapel() {
  const id = document.getElementById("mapelId").value;
  const nama = document.getElementById("mapelNama").value.trim();
  const kode = document.getElementById("mapelKode").value.trim().toUpperCase();
  const aktif = document.getElementById("mapelAktif").value === "true";

  if (!nama) return showFormError("mapelFormError", "Nama mapel wajib diisi.");
  if (!kode) return showFormError("mapelFormError", "Kode mapel wajib diisi.");

  if (id) {
    dbUpdate(DB_KEYS.mapel, id, { nama, kode, aktif });
  } else {
    dbInsert(DB_KEYS.mapel, { id: generateId("mp"), nama, kode, aktif });
  }

  closeModal("modalMapel");
  renderMapelTable();
  showToast("Mata pelajaran berhasil disimpan!", "success");
}

// ── LAPORAN: REKAP JURNAL ─────────────────────────────────

function populateFilterKelas() {
  const kelas = dbGetAll(DB_KEYS.kelas);
  const sel = document.getElementById("filterJurnalKelas");
  sel.innerHTML =
    `<option value="">Semua Kelas</option>` +
    kelas.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");
}

function renderRekapJurnal() {
  const dari = document.getElementById("filterJurnalDari").value;
  const sampai = document.getElementById("filterJurnalSampai").value;
  const kelasId = document.getElementById("filterJurnalKelas").value;

  let data = dbGetAll(DB_KEYS.jurnal);
  if (dari) data = data.filter((j) => j.tanggal >= dari);
  if (sampai) data = data.filter((j) => j.tanggal <= sampai);
  if (kelasId) data = data.filter((j) => j.kelasId === kelasId);
  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  document.getElementById("rekapJurnalBody").innerHTML = data.length
    ? data
        .map((j) => {
          const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
          const m = dbGetById(DB_KEYS.mapel, j.mapelId);
          const g = dbGetById(DB_KEYS.users, j.guruId);
          const u = dbGetById(DB_KEYS.users, j.userId);
          return `
          <tr>
            <td style="white-space:nowrap;font-size:var(--text-sm)">
              ${formatTanggal(j.tanggal)}
            </td>
            <td><span class="badge badge-siswa">${kl?.nama || "—"}</span></td>
            <td>Jam ${j.jamKe}</td>
            <td>${m?.nama || "—"}</td>
            <td style="font-size:var(--text-sm)">${g?.nama || "—"}</td>
            <td style="max-width:180px;font-size:var(--text-sm)">
              <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${j.materi || "—"}
              </div>
            </td>
            <td>
              <div style="font-size:var(--text-xs);display:flex;
                flex-direction:column;gap:2px">
                <span style="color:var(--success)">
                  ✓ ${j.jumlahHadir || 0} hadir
                </span>
                <span style="color:var(--danger)">
                  ✗ ${j.jumlahSakit || 0} sakit
                </span>
                <span style="color:var(--warning)">
                  ~ ${j.jumlahIzin || 0} izin
                </span>
                <span style="color:var(--gray-400)">
                  ? ${j.jumlahAlpha || 0} alpha
                </span>
              </div>
            </td>
            <td style="font-size:var(--text-xs);color:var(--gray-500)">
              ${u?.nama || "—"}
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="8" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada jurnal.
       </td></tr>`;
}

function clearFilterJurnal() {
  document.getElementById("filterJurnalDari").value = "";
  document.getElementById("filterJurnalSampai").value = "";
  document.getElementById("filterJurnalKelas").value = "";
  renderRekapJurnal();
}

// ── LAPORAN: REKAP KONFIRMASI ─────────────────────────────

function populateFilterGuru() {
  const gurus = dbGetAll(DB_KEYS.users).filter((u) => u.role === "guru");
  const sel = document.getElementById("filterKonfGuru");
  sel.innerHTML =
    `<option value="">Semua Guru</option>` +
    gurus.map((g) => `<option value="${g.id}">${g.nama}</option>`).join("");
}

function renderRekapKonfirmasi() {
  const dari = document.getElementById("filterKonfDari").value;
  const sampai = document.getElementById("filterKonfSampai").value;
  const guruId = document.getElementById("filterKonfGuru").value;

  let data = dbGetAll(DB_KEYS.konfirmasi);
  if (dari) data = data.filter((k) => k.tanggal >= dari);
  if (sampai) data = data.filter((k) => k.tanggal <= sampai);
  if (guruId) data = data.filter((k) => k.guruId === guruId);
  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  document.getElementById("rekapKonfirmasiBody").innerHTML = data.length
    ? data
        .map((k) => {
          const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
          const g = dbGetById(DB_KEYS.users, k.guruId);
          const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
          const m = dbGetById(DB_KEYS.mapel, j?.mapelId);
          return `
          <tr>
            <td style="white-space:nowrap;font-size:var(--text-sm)">
              ${formatTanggal(k.tanggal)}
            </td>
            <td>${g?.nama || "—"}</td>
            <td><span class="badge badge-guru">${kl?.nama || "—"}</span></td>
            <td>${m?.nama || "—"}</td>
            <td>Jam ${j?.jamKe?.join(", ") || "—"}</td>
            <td>
              <span class="badge badge-info">
                <i class="fas fa-clock"></i> ${k.waktuKonfirmasi || "—"}
              </span>
            </td>
<td>
  ${
    k.lokasi
      ? `<div style="font-size:var(--text-xs);max-width:150px">
        <div style="color:var(--success);font-weight:600;
          margin-bottom:2px">
          <i class="fas fa-location-dot"></i>
          ±${k.lokasi.akurasi}m
        </div>
        <div style="color:var(--gray-500);
          white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis"
          title="${k.lokasi.alamat}">
          ${k.lokasi.alamat}
        </div>
        <a href="https://maps.google.com/?q=${k.lokasi.lat},${k.lokasi.lon}"
          target="_blank"
          style="font-size:var(--text-xs);color:var(--primary)">
          <i class="fas fa-map"></i> Lihat di Maps
        </a>
       </div>`
      : `<span class="badge badge-gray">
        <i class="fas fa-location-slash"></i> Tidak ada
       </span>`
  }
</td>
            <td>
              ${
                k.foto
                  ? `<img src="${k.foto}"
                    style="width:36px;height:36px;border-radius:50%;
                    object-fit:cover;cursor:pointer;
                    border:2px solid var(--success)"
                    onclick="lihatFoto('${k.id}')"
                    title="Klik untuk memperbesar"/>`
                  : `<span class="badge badge-gray">Tidak ada</span>`
              }
            </td>
            <td>
              <span class="badge badge-success">Terkonfirmasi</span>
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="8" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada konfirmasi.
       </td></tr>`;
}

function clearFilterKonf() {
  document.getElementById("filterKonfDari").value = "";
  document.getElementById("filterKonfSampai").value = "";
  document.getElementById("filterKonfGuru").value = "";
  renderRekapKonfirmasi();
}

function lihatFoto(konfId) {
  const k = dbGetById(DB_KEYS.konfirmasi, konfId);
  const j = dbGetById(DB_KEYS.jadwal, k?.jadwalId);
  const g = dbGetById(DB_KEYS.users, k?.guruId);
  const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
  const m = dbGetById(DB_KEYS.mapel, j?.mapelId);

  document.getElementById("fotoPreview").src = k?.foto || "";
  document.getElementById("fotoInfo").innerHTML = `
    <strong>${g?.nama || "—"}</strong><br/>
    ${kl?.nama || "—"} • ${m?.nama || "—"}<br/>
    Jam ${j?.jamKe?.join(", ") || "—"} •
    ${formatTanggal(k?.tanggal)} •
    ${k?.waktuKonfirmasi || "—"}
  ${
    k?.lokasi
      ? `<br/><br/>
         <i class="fas fa-location-dot"
           style="color:var(--success)"></i>
         <strong>Lokasi:</strong>
         ${k.lokasi.alamat}<br/>
         <span style="font-size:var(--text-xs);
           color:var(--gray-400)">
           Akurasi: ±${k.lokasi.akurasi}m •
           ${k.lokasi.lat.toFixed(6)},
           ${k.lokasi.lon.toFixed(6)}
         </span><br/>
         <a href="https://maps.google.com/?q=${k.lokasi.lat},${k.lokasi.lon}"
           target="_blank" class="btn btn-sm btn-outline"
           style="margin-top:8px;display:inline-flex">
           <i class="fas fa-map"></i> Buka Google Maps
         </a>`
      : `<br/><span style="color:var(--gray-400);
          font-size:var(--text-xs)">
          Lokasi tidak tersedia
         </span>`
  }
  `;
  openModal("modalFoto");
}

// ── HAPUS ─────────────────────────────────────────────────

function confirmDelete(type, id, nama) {
  document.getElementById("confirmMessage").textContent =
    `Hapus "${nama}"? Tindakan ini tidak bisa dibatalkan.`;

  const keyMap = {
    user: DB_KEYS.users,
    kelas: DB_KEYS.kelas,
    mapel: DB_KEYS.mapel,
    jadwal: DB_KEYS.jadwal,
    periode: DB_KEYS.periode,
    jam: DB_KEYS.jamPelajaran,
    hariLibur: DB_KEYS.hariLibur,
  };

  const renderMap = {
    user: renderUsersTable,
    kelas: renderKelasTable,
    mapel: renderMapelTable,
    jadwal: renderJadwalGrid,
    periode: renderPeriodeTable,
    jam: renderJamTable,
    hariLibur: renderHariLiburTable,
  };

  document.getElementById("confirmBtn").onclick = () => {
    dbDelete(keyMap[type], id);
    closeModal("modalConfirm");
    renderMap[type]?.();
    renderDashboard();
    showToast("Data berhasil dihapus.", "info");
  };

  openModal("modalConfirm");
}

// ── PROFIL SEKOLAH ────────────────────────────────────────

function renderProfilPage() {
  const profil = getProfilSekolah();

  // Isi form
  document.getElementById("profilNama").value = profil.namaSekolah || "";
  document.getElementById("profilNpsn").value = profil.npsn || "";
  document.getElementById("profilAlamat").value = profil.alamat || "";
  document.getElementById("profilTelepon").value = profil.telepon || "";
  document.getElementById("profilEmail").value = profil.email || "";
  document.getElementById("profilWebsite").value = profil.website || "";
  document.getElementById("profilKepalaSekolah").value =
    profil.kepalaSekolah || "";

  // Tampilkan logo jika ada
  if (profil.logo) {
    setLogoPreview(profil.logo);
  } else {
    resetLogoPreview();
  }

  // Update preview kartu
  updatePreview();
}

function updatePreview() {
  const nama = document.getElementById("profilNama").value || "—";
  const npsn = document.getElementById("profilNpsn").value || "—";
  const alamat = document.getElementById("profilAlamat").value || "—";
  const telp = document.getElementById("profilTelepon").value || "—";
  const email = document.getElementById("profilEmail").value || "—";
  const kepala = document.getElementById("profilKepalaSekolah").value || "—";

  document.getElementById("previewNama").textContent = nama;
  document.getElementById("previewNpsn").textContent = `NPSN: ${npsn}`;
  document.getElementById("previewAlamat").textContent = alamat;
  document.getElementById("previewTelepon").textContent = telp;
  document.getElementById("previewEmail").textContent = email;
  document.getElementById("previewKepala").textContent = kepala;
}

function simpanProfil() {
  const nama = document.getElementById("profilNama").value.trim();
  const npsn = document.getElementById("profilNpsn").value.trim();
  const alamat = document.getElementById("profilAlamat").value.trim();
  const telepon = document.getElementById("profilTelepon").value.trim();
  const email = document.getElementById("profilEmail").value.trim();
  const website = document.getElementById("profilWebsite").value.trim();
  const kepala = document.getElementById("profilKepalaSekolah").value.trim();

  const errEl = document.getElementById("profilError");
  errEl.classList.add("hidden");

  if (!nama) {
    errEl.innerHTML =
      '<i class="fas fa-circle-exclamation"></i> Nama sekolah wajib diisi.';
    errEl.classList.remove("hidden");
    return;
  }

  // Ambil logo yang tersimpan
  const profilLama = getProfilSekolah();

  saveProfilSekolah({
    namaSekolah: nama,
    npsn,
    alamat,
    telepon,
    email,
    website,
    kepalaSekolah: kepala,
    logo: profilLama.logo || "",
  });

  showToast("Profil sekolah berhasil disimpan!", "success");
}

function resetProfilForm() {
  renderProfilPage();
  showToast("Form direset ke data tersimpan.", "info");
}

// ── Logo Upload ───────────────────────────────────────────

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi tipe
  if (!file.type.match(/^image\//)) {
    showToast("File harus berupa gambar (JPG/PNG).", "error");
    return;
  }

  // Validasi ukuran (maks 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast("Ukuran logo maksimal 2MB.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    setLogoPreview(base64);

    // Simpan logo ke profil
    const profil = getProfilSekolah();
    profil.logo = base64;
    saveProfilSekolah(profil);

    showToast("Logo berhasil diupload!", "success");
  };
  reader.readAsDataURL(file);
}

function setLogoPreview(base64) {
  // Preview besar di kartu
  const bigEl = document.getElementById("previewLogo");
  bigEl.innerHTML = `<img src="${base64}"
      style="width:100%;height:100%;object-fit:cover"/>`;

  // Preview kecil di form
  const smallEl = document.getElementById("logoPreviewKecil");
  smallEl.innerHTML = `<img src="${base64}"
      style="width:100%;height:100%;object-fit:cover"/>`;
}

function resetLogoPreview() {
  document.getElementById("previewLogo").innerHTML = "🏫";
  document.getElementById("logoPreviewKecil").innerHTML = "🏫";
}

function hapusLogo() {
  const profil = getProfilSekolah();
  profil.logo = "";
  saveProfilSekolah(profil);
  resetLogoPreview();
  document.getElementById("logoInput").value = "";
  showToast("Logo berhasil dihapus.", "info");
}

// ── UTILITAS ──────────────────────────────────────────────

function populateSelect(selectId, items, valueKey, labelKey, defaultLabel) {
  const sel = document.getElementById(selectId);
  const cur = sel.value;
  sel.innerHTML =
    `<option value="">${defaultLabel}</option>` +
    items
      .map((i) => `<option value="${i[valueKey]}">${i[labelKey]}</option>`)
      .join("");
  sel.value = cur;
}

// ── HARI LIBUR ────────────────────────────────────────────

const NAMA_HARI = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function populateFilterTahun() {
  const data = dbGetAll(DB_KEYS.hariLibur);
  const tahuns = [...new Set(data.map((l) => l.tanggal.substring(0, 4)))]
    .sort()
    .reverse();

  // Tambahkan tahun sekarang jika belum ada
  const tahunIni = String(new Date().getFullYear());
  if (!tahuns.includes(tahunIni)) tahuns.unshift(tahunIni);

  const sel = document.getElementById("filterLiburTahun");
  sel.innerHTML =
    `<option value="">Semua Tahun</option>` +
    tahuns.map((t) => `<option value="${t}">${t}</option>`).join("");

  // Default ke tahun ini
  sel.value = tahunIni;
}

function renderHariLiburTable() {
  const tahun = document.getElementById("filterLiburTahun")?.value || "";
  const tipe = document.getElementById("filterLiburTipe")?.value || "";

  let data = dbGetAll(DB_KEYS.hariLibur);
  if (tahun) data = data.filter((l) => l.tanggal.startsWith(tahun));
  if (tipe) data = data.filter((l) => l.tipe === tipe);
  data.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  document.getElementById("hariLiburTableBody").innerHTML = data.length
    ? data
        .map((l, i) => {
          const date = new Date(l.tanggal);
          const namaHr = NAMA_HARI[date.getDay()];
          const isToday = l.tanggal === getTodayStr();
          return `
            <tr style="${isToday ? "background:#FEF9C3;" : ""}">
              <td>${i + 1}</td>
              <td>
                <strong>${l.tanggal}</strong>
                ${
                  isToday
                    ? `<span class="badge badge-warning"
                      style="margin-left:6px">Hari Ini</span>`
                    : ""
                }
              </td>
              <td>${namaHr}</td>
              <td>${l.nama}</td>
              <td>
                <span class="badge ${
                  l.tipe === "nasional" ? "badge-danger" : "badge-warning"
                }">
                  ${l.tipe === "nasional" ? "🇮🇩 Nasional" : "🏫 Sekolah"}
                </span>
              </td>
              <td>
                <span class="badge ${l.aktif ? "badge-success" : "badge-gray"}">
                  ${l.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-sm btn-outline"
                    onclick="openHariLiburModal('${l.id}')">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-danger"
                    onclick="confirmDelete('hariLibur',
                    '${l.id}','${l.nama}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7"
          style="text-align:center;color:var(--gray-400);
          padding:32px">
          Belum ada data hari libur.
         </td></tr>`;
}

function renderInfoHariIni() {
  const libur = cekHariIniLibur();
  const el = document.getElementById("infoHariLiburHariIni");
  if (!el) return;

  if (libur) {
    const tipeIcon = {
      nasional: "🇮🇩",
      sekolah: "🏫",
      mingguan: "📅",
    };
    el.innerHTML = `
      <div style="background:linear-gradient(135deg,#FEF2F2,#FFF7ED);
        border:1px solid #FECACA;border-radius:var(--radius-lg);
        padding:16px 20px;display:flex;align-items:center;gap:14px">
        <div style="font-size:32px">${tipeIcon[libur.tipe] || "📅"}</div>
        <div>
          <div style="font-weight:700;color:#991B1B;font-size:var(--text-base)">
            Hari Ini Adalah Hari Libur
          </div>
          <div style="font-size:var(--text-sm);color:#B45309;margin-top:2px">
            ${libur.nama} —
            ${formatTanggal(getTodayStr())}
          </div>
          <div style="font-size:var(--text-xs);color:var(--gray-400);
            margin-top:4px">
            Guru tidak bisa konfirmasi dan siswa tidak bisa isi jurnal.
          </div>
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div style="background:#ECFDF5;border:1px solid #6EE7B7;
        border-radius:var(--radius-lg);padding:12px 16px;
        display:flex;align-items:center;gap:10px">
        <i class="fas fa-circle-check"
          style="color:var(--success);font-size:18px"></i>
        <span style="font-size:var(--text-sm);color:#065F46;
          font-weight:500">
          Hari ini bukan hari libur — kegiatan belajar mengajar normal.
        </span>
      </div>
    `;
  }
}

function openHariLiburModal(id = null) {
  document.getElementById("hariLiburError").classList.add("hidden");
  document.getElementById("hariLiburTanggalInfo").textContent = "";

  if (id) {
    const l = dbGetById(DB_KEYS.hariLibur, id);
    document.getElementById("modalHariLiburTitle").textContent =
      "Edit Hari Libur";
    document.getElementById("hariLiburId").value = l.id;
    document.getElementById("hariLiburTanggal").value = l.tanggal;
    document.getElementById("hariLiburNama").value = l.nama;
    document.getElementById("hariLiburTipe").value = l.tipe;
    document.getElementById("hariLiburAktif").value = String(l.aktif);
    cekTanggalLibur();
  } else {
    document.getElementById("modalHariLiburTitle").textContent =
      "Tambah Hari Libur";
    document.getElementById("hariLiburId").value = "";
    document.getElementById("hariLiburTanggal").value = "";
    document.getElementById("hariLiburNama").value = "";
    document.getElementById("hariLiburTipe").value = "nasional";
    document.getElementById("hariLiburAktif").value = "true";
  }

  openModal("modalHariLibur");
}

function cekTanggalLibur() {
  const tgl = document.getElementById("hariLiburTanggal").value;
  const info = document.getElementById("hariLiburTanggalInfo");
  if (!tgl) {
    info.textContent = "";
    return;
  }

  const date = new Date(tgl);
  const hari = NAMA_HARI[date.getDay()];
  info.textContent = `Hari: ${hari}`;

  // Cek jika sudah ada di database
  const existing = dbGetAll(DB_KEYS.hariLibur).find(
    (l) =>
      l.tanggal === tgl &&
      l.id !== document.getElementById("hariLiburId").value,
  );
  if (existing) {
    info.textContent += ` — ⚠️ Tanggal ini sudah ada: "${existing.nama}"`;
    info.style.color = "var(--warning)";
  } else {
    info.style.color = "var(--gray-400)";
  }
}

function saveHariLibur() {
  const id = document.getElementById("hariLiburId").value;
  const tanggal = document.getElementById("hariLiburTanggal").value;
  const nama = document.getElementById("hariLiburNama").value.trim();
  const tipe = document.getElementById("hariLiburTipe").value;
  const aktif = document.getElementById("hariLiburAktif").value === "true";
  const errEl = document.getElementById("hariLiburError");

  errEl.classList.add("hidden");

  if (!tanggal) return showFormError("hariLiburError", "Tanggal wajib diisi.");
  if (!nama)
    return showFormError("hariLiburError", "Nama hari libur wajib diisi.");

  // Cek duplikat
  const existing = dbGetAll(DB_KEYS.hariLibur).find(
    (l) => l.tanggal === tanggal && l.id !== id,
  );
  if (existing) {
    return showFormError(
      "hariLiburError",
      `Tanggal ini sudah terdaftar sebagai "${existing.nama}".`,
    );
  }

  if (id) {
    dbUpdate(DB_KEYS.hariLibur, id, { tanggal, nama, tipe, aktif });
  } else {
    dbInsert(DB_KEYS.hariLibur, {
      id: generateId("hl"),
      tanggal,
      nama,
      tipe,
      aktif,
    });
  }

  closeModal("modalHariLibur");
  populateFilterTahun();
  renderHariLiburTable();
  renderInfoHariIni();
  showToast("Hari libur berhasil disimpan!", "success");
}

function clearFilterLibur() {
  populateFilterTahun();
  document.getElementById("filterLiburTipe").value = "";
  renderHariLiburTable();
}


// ── SINKRONISASI JUMLAH SISWA ────────────────────────────

function sinkronisasiJumlahSiswa() {
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const siswaList = dbGetAll(DB_KEYS.siswa);
  
  console.log("=== SINKRONISASI JUMLAH SISWA ===");
  console.log("Total kelas:", kelasList.length);
  console.log("Total siswa:", siswaList.length);
  
  let totalUpdated = 0;
  const details = [];
  
  kelasList.forEach((kelas) => {
    // Hitung jumlah siswa aktif di kelas ini
    const siswaKelas = siswaList.filter(
      (s) => s.kelasId === kelas.id && s.aktif
    );
    const jumlahSiswa = siswaKelas.length;
    
    const before = kelas.jumlahSiswa || 0;
    
    console.log(`Kelas ${kelas.nama}:`, {
      kelasId: kelas.id,
      sebelum: before,
      sesudah: jumlahSiswa,
      siswa: siswaKelas.map(s => s.nama)
    });
    
    // Update jika berbeda
    if (kelas.jumlahSiswa !== jumlahSiswa) {
      // PERBAIKAN: Gunakan dbUpdate dengan parameter yang benar
      dbUpdate(DB_KEYS.kelas, kelas.id, { jumlahSiswa: jumlahSiswa });
      totalUpdated++;
      details.push(`${kelas.nama}: ${before} → ${jumlahSiswa}`);
    }
  });
  
  console.log("Total kelas diupdate:", totalUpdated);
  console.log("Detail:", details);
  
  // Refresh tampilan
  renderKelasTable();
  
  if (totalUpdated > 0) {
    showToast(
      `${totalUpdated} kelas berhasil disinkronkan! ${details.join(", ")}`,
      "success",
      5000
    );
  } else {
    showToast(
      "Semua data sudah sinkron!",
      "info",
      3000
    );
  }
}

// Fungsi untuk cek status sinkronisasi (untuk debugging)
function cekStatusSinkronisasi() {
  const kelasList = dbGetAll(DB_KEYS.kelas);
  const siswaList = dbGetAll(DB_KEYS.siswa);
  
  console.log("=== STATUS SINKRONISASI ===");
  
  kelasList.forEach((kelas) => {
    const siswaKelas = siswaList.filter(
      (s) => s.kelasId === kelas.id && s.aktif
    );
    const jumlahSiswaAktual = siswaKelas.length;
    const jumlahSiswaData = kelas.jumlahSiswa || 0;
    const sinkron = jumlahSiswaAktual === jumlahSiswaData;
    
    console.log(`${kelas.nama}:`, {
      kelasId: kelas.id,
      jumlahSiswaData: jumlahSiswaData,
      jumlahSiswaAktual: jumlahSiswaAktual,
      sinkron: sinkron ? "✅" : "❌",
      siswa: siswaKelas.map(s => `${s.nama} (${s.nis})`)
    });
  });
}
