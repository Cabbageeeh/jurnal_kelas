// ============================================
// js/siswa.js — Dashboard Siswa v2.0
// Jurnal terhubung dengan konfirmasi guru
// ============================================

let currentSession = null;
let dataKelas = null;

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  currentSession = requireAuth("siswa");
  if (!currentSession) return;

  dataKelas = dbGetById(DB_KEYS.kelas, currentSession.kelasId);

  // Sidebar info
  document.getElementById("sidebarName").textContent = currentSession.nama;
  document.getElementById("sidebarAvatar").textContent = currentSession.nama
    .charAt(0)
    .toUpperCase();
  document.getElementById("sidebarJabatan").textContent =
    currentSession.jabatan === "ketua" ? "👑 Ketua" : "📝 Sekretaris";
  document.getElementById("sidebarKelas").textContent = dataKelas?.nama || "—";

  // Greeting
  document.getElementById("siswaGreeting").textContent =
    `Halo, ${currentSession.nama} 👋`;
  document.getElementById("siswaSubtitle").textContent =
    `${dataKelas?.nama || "—"} — ${
      currentSession.jabatan === "ketua" ? "Ketua Kelas" : "Sekretaris"
    }`;

  // Badge jabatan topbar
  document.getElementById("topbarJabatan").innerHTML =
    `<i class="fas fa-graduation-cap"></i>&nbsp; ${
      currentSession.jabatan === "ketua" ? "👑 Ketua" : "📝 Sekretaris"
    }`;

  // Tanggal
  document.getElementById("topbarDate").textContent =
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  showPage("beranda");
});

// ── Navigasi ──────────────────────────────────────────────

const PAGE_TITLES_SISWA = {
  beranda: "Beranda",
  "jurnal-hari-ini": "Jurnal Hari Ini",
  riwayat: "Riwayat Jurnal",
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

  document.getElementById("topbarTitle").textContent =
    PAGE_TITLES_SISWA[page] || "";

  const actions = {
    beranda: renderBeranda,
    "jurnal-hari-ini": renderJurnalHariIni,
    riwayat: renderRiwayat,
  };
  if (actions[page]) actions[page]();
  updateBadgeSidebar();
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
  document.getElementById(elId)?.classList.add("hidden");
}

// ── Helper Data ───────────────────────────────────────────

/** Ambil jadwal kelas hari ini */
function getJadwalKelasSaya() {
  return getJadwalHariIniKelas(currentSession.kelasId);
}

/** Ambil jurnal kelas saya */
function getJurnalKelasSaya() {
  return dbGetAll(DB_KEYS.jurnal).filter(
    (j) => j.kelasId === currentSession.kelasId,
  );
}

/**
 * Cek apakah guru sudah konfirmasi untuk jadwal ini hari ini
 */
function guruSudahKonfirmasi(jadwalId) {
  return getKonfirmasiHariIni(jadwalId) !== null;
}

/**
 * Ambil jurnal untuk jadwal tertentu hari ini
 */
function getJurnalUntukJadwal(jadwalId) {
  const today = getTodayStr();
  return (
    dbGetAll(DB_KEYS.jurnal).find(
      (j) =>
        j.kelasId === currentSession.kelasId &&
        j.jadwalId === jadwalId &&
        j.tanggal === today,
    ) || null
  );
}

// ── PAGE: BERANDA ─────────────────────────────────────────

// ── Notifikasi ────────────────────────────────────────────

function getNotifikasi() {
  const jadwal = getJadwalKelasSaya();

  // Filter: guru sudah konfirmasi TAPI jurnal belum diisi
  const belumDiisi = jadwal.filter(
    (j) => guruSudahKonfirmasi(j.id) && !getJurnalUntukJadwal(j.id),
  );

  return belumDiisi;
}

function renderNotifikasi() {
  const belumDiisi = getNotifikasi();
  const container = document.getElementById("notifikasiContainer");
  if (!container) return;

  if (belumDiisi.length === 0) {
    container.innerHTML = "";
    return;
  }

  const items = belumDiisi
    .map((j) => {
      const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
      const guru = dbGetById(DB_KEYS.users, j.guruId);
      const rentang = formatRentangJam(j.jamKe);
      return `
      <div style="display:flex;justify-content:space-between;
        align-items:center;padding:8px 0;
        border-bottom:1px solid rgba(255,255,255,0.15);
        flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-weight:600">
            ${mapel?.nama || "—"}
          </span>
          <span style="font-size:var(--text-xs);opacity:0.85;
            margin-left:8px">
            Jam ${j.jamKe.join(",")} • ${rentang}
          </span>
          <div style="font-size:var(--text-xs);opacity:0.75;
            margin-top:2px">
            ${guru?.nama || "—"} sudah konfirmasi kehadiran
          </div>
        </div>
        <button class="btn btn-sm"
          style="background:white;color:#92400E;font-weight:600;
          flex-shrink:0"
          onclick="showPage('jurnal-hari-ini')">
          <i class="fas fa-file-pen"></i> Isi Sekarang
        </button>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `
    <div style="background:linear-gradient(135deg,#F59E0B,#D97706);
      border-radius:var(--radius-lg);padding:16px 20px;
      margin-bottom:24px;color:white;
      box-shadow:0 4px 12px rgba(245,158,11,0.3)">

      <!-- Header notif -->
      <div style="display:flex;align-items:center;gap:10px;
        margin-bottom:${belumDiisi.length > 0 ? "12px" : "0"}">
        <div style="width:36px;height:36px;border-radius:50%;
          background:rgba(255,255,255,0.25);display:flex;
          align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0">
          🔔
        </div>
        <div>
          <div style="font-weight:700;font-size:var(--text-base)">
            ${belumDiisi.length} Jurnal Belum Diisi!
          </div>
          <div style="font-size:var(--text-xs);opacity:0.85">
            Guru sudah konfirmasi kehadiran — segera isi jurnal
          </div>
        </div>
        <button onclick="tutupNotifikasi()"
          style="margin-left:auto;background:rgba(255,255,255,0.2);
          border:none;color:white;width:28px;height:28px;
          border-radius:50%;cursor:pointer;font-size:14px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <!-- List sesi belum diisi -->
      ${items}

    </div>
  `;
}

function updateBadgeSidebar() {
  const jumlah = getNotifikasi().length;

  // Cari tombol menu Jurnal Hari Ini di sidebar
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((btn) => {
    // Hapus badge lama dulu
    const oldBadge = btn.querySelector(".notif-badge");
    if (oldBadge) oldBadge.remove();

    // Tambah badge baru jika ada notifikasi
    if (
      jumlah > 0 &&
      btn.getAttribute("onclick")?.includes("jurnal-hari-ini")
    ) {
      const badge = document.createElement("span");
      badge.className = "notif-badge";
      badge.textContent = jumlah;
      badge.style.cssText = `
        background: #EF4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 999px;
        margin-left: auto;
        min-width: 18px;
        text-align: center;
        animation: pulse-badge 1.5s infinite;
      `;
      btn.style.justifyContent = "flex-start";
      btn.appendChild(badge);
    }
  });
}

function tutupNotifikasi() {
  const container = document.getElementById("notifikasiContainer");
  if (container) container.innerHTML = "";
}

function renderBeranda() {
  const today = getTodayStr();
  const libur = cekHariIniLibur();
  const semuaJurnal = getJurnalKelasSaya();
  const jadwalHariIni = libur ? [] : getJadwalKelasSaya();
  const konfirmasi = dbGetAll(DB_KEYS.konfirmasi).filter(
    (k) => k.tanggal === today,
  );

  renderNotifikasi();
  updateBadgeSidebar();

  // Stats
  const jurnalHariIni = semuaJurnal.filter((j) => j.tanggal === today);
  const guruKonfirmasi = jadwalHariIni.filter((j) =>
    guruSudahKonfirmasi(j.id),
  ).length;

  const stats = [
    {
      icon: "fa-chalkboard",
      color: "guru",
      label: "Kelas",
      value: dataKelas?.nama || "—",
      small: true,
    },
    {
      icon: "fa-calendar-day",
      color: "siswa",
      label: "Jadwal Hari Ini",
      value: jadwalHariIni.length,
    },
    {
      icon: "fa-user-check",
      color: "info",
      label: "Guru Konfirmasi",
      value: guruKonfirmasi,
    },
    {
      icon: "fa-file-pen",
      color: "warning",
      label: "Jurnal Terisi",
      value: jurnalHariIni.length,
    },
  ];

  document.getElementById("siswaStatsGrid").innerHTML = stats
    .map(
      (s) => `
      <div class="stat-card">
        <div class="stat-icon ${s.color}">
          <i class="fas ${s.icon}"></i>
        </div>
        <div>
          <div class="stat-number" style="font-size:${
            s.small ? "var(--text-xl)" : "var(--text-3xl)"
          }">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      </div>
    `,
    )
    .join("");

  // Jadwal kelas hari ini
  const elJadwal = document.getElementById("dashJadwalKelas");
  if (jadwalHariIni.length === 0) {
    elJadwal.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-xmark"></i>
        <p>Tidak ada jadwal pelajaran hari ini.</p>
      </div>`;
  } else {
    elJadwal.innerHTML = jadwalHariIni
      .map((j) => {
        const guru = dbGetById(DB_KEYS.users, j.guruId);
        const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
        const konf = guruSudahKonfirmasi(j.id);
        const jurnal = getJurnalUntukJadwal(j.id);
        return `
        <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
          <div style="display:flex;justify-content:space-between;
            align-items:center;flex-wrap:wrap;gap:6px">
            <div>
              <span class="badge badge-siswa" style="margin-bottom:4px">
                Jam ${j.jamKe.join(",")}
              </span>
              <div style="font-size:var(--text-sm);font-weight:600">
                ${mapel?.nama || "—"}
              </div>
              <div style="font-size:var(--text-xs);color:var(--gray-400)">
                ${guru?.nama || "—"} •
                ${formatRentangJam(j.jamKe)}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;
              align-items:flex-end;gap:4px">
              <span class="badge ${konf ? "badge-success" : "badge-warning"}">
                ${
                  konf
                    ? '<i class="fas fa-circle-check"></i> Guru Hadir'
                    : '<i class="fas fa-clock"></i> Menunggu Guru'
                }
              </span>
              <span class="badge ${jurnal ? "badge-siswa" : "badge-gray"}">
                ${
                  jurnal
                    ? '<i class="fas fa-file-pen"></i> Terisi'
                    : '<i class="fas fa-file"></i> Belum Diisi'
                }
              </span>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Jurnal hari ini
  const elJurnal = document.getElementById("dashJurnalHariIni");
  if (jurnalHariIni.length === 0) {
    elJurnal.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-circle-xmark"></i>
        <p>Belum ada jurnal hari ini.</p>
        <button class="btn btn-sm btn-siswa mt-3"
          onclick="showPage('jurnal-hari-ini')">
          <i class="fas fa-plus"></i> Isi Jurnal
        </button>
      </div>`;
  } else {
    elJurnal.innerHTML = jurnalHariIni
      .sort((a, b) => a.jamKe - b.jamKe)
      .map((j) => {
        const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
        const guru = dbGetById(DB_KEYS.users, j.guruId);
        return `
          <div style="padding:10px 0;
            border-bottom:1px solid var(--gray-100)">
            <div style="display:flex;justify-content:space-between;
              align-items:center">
              <div>
                <span class="badge badge-siswa">Jam ${j.jamKe}</span>
                <span style="font-size:var(--text-sm);font-weight:600;
                  margin-left:8px">
                  ${mapel?.nama || "—"}
                </span>
              </div>
              <span class="badge badge-success">✅ Terisi</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--gray-400);
              margin-top:4px">
              ${guru?.nama || "—"} •
              ${j.materi?.substring(0, 40) || "—"}
            </div>
          </div>
        `;
      })
      .join("");
  }
}

// ── PAGE: JURNAL HARI INI ─────────────────────────────────

function renderJurnalHariIni() {
  // ── CEK HARI LIBUR ───────────────────────────────────
  const libur = cekHariIniLibur();
  if (libur) {
    document.getElementById("jurnalHariIniSubtitle").textContent =
      "Hari ini adalah hari libur";
    document.getElementById("infoKelas").classList.add("hidden");
    document.getElementById("jurnalSesiContainer").innerHTML =
      renderBannerLiburSiswa(libur);
    return;
  }
  document.getElementById("infoKelas").classList.remove("hidden");
  const hariIni = getHariIni();
  const jadwal = getJadwalKelasSaya();
  const container = document.getElementById("jurnalSesiContainer");

  document.getElementById("jurnalHariIniSubtitle").textContent =
    `${hariIni}, ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} — ${jadwal.length} sesi pelajaran`;

  // Info kelas
  document.getElementById("infoKelasText").innerHTML =
    `Jurnal untuk kelas <strong>${dataKelas?.nama || "—"}</strong>.
     Jurnal hanya bisa diisi setelah guru mengkonfirmasi kehadiran.`;

  if (jadwal.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-calendar-xmark"></i>
            <p>Tidak ada jadwal pelajaran hari ${hariIni}.</p>
          </div>
        </div>
      </div>`;
    return;
  }

  // Render kartu per sesi
  container.innerHTML = jadwal.map((j) => renderKartuSesi(j)).join("");
}

function renderKartuSesi(j) {
  const guru = dbGetById(DB_KEYS.users, j.guruId);
  const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
  const konf = guruSudahKonfirmasi(j.id);
  const konfData = getKonfirmasiHariIni(j.id);
  const jurnal = getJurnalUntukJadwal(j.id);
  const rentang = formatRentangJam(j.jamKe);

  return `
    <div class="card mb-4" style="border-left:4px solid ${
      jurnal
        ? "var(--success)"
        : konf
          ? "var(--color-siswa)"
          : "var(--gray-300)"
    }">
      <div class="card-body" style="padding:24px">

        <!-- Header sesi -->
        <div style="display:flex;justify-content:space-between;
          align-items:flex-start;flex-wrap:wrap;gap:12px;
          margin-bottom:16px">
          <div>
            <div style="display:flex;align-items:center;
              gap:8px;flex-wrap:wrap;margin-bottom:6px">
              <span class="badge badge-siswa" style="font-size:13px">
                Jam ${j.jamKe.join(" & ")}
              </span>
              <span style="font-size:var(--text-xl);font-weight:700;
                color:var(--gray-800)">
                ${mapel?.nama || "—"}
              </span>
            </div>
            <div style="font-size:var(--text-sm);color:var(--gray-500)">
              <i class="fas fa-chalkboard-user"></i>
              ${guru?.nama || "—"} &nbsp;•&nbsp;
              <i class="fas fa-clock"></i> ${rentang}
            </div>
          </div>

          <!-- Status badges -->
          <div style="display:flex;flex-direction:column;
            align-items:flex-end;gap:6px">
            <span class="badge ${konf ? "badge-success" : "badge-warning"}">
              ${
                konf
                  ? `<i class="fas fa-circle-check"></i>
                   Guru Hadir — ${konfData?.waktuKonfirmasi || ""}`
                  : `<i class="fas fa-clock"></i> Menunggu Guru`
              }
            </span>
            <span class="badge ${jurnal ? "badge-siswa" : "badge-gray"}">
              ${
                jurnal
                  ? `<i class="fas fa-file-pen"></i> Jurnal Terisi`
                  : `<i class="fas fa-file"></i> Jurnal Belum Diisi`
              }
            </span>
          </div>
        </div>

        <!-- Konten berdasarkan status -->
        ${
          !konf
            ? `<!-- Guru belum konfirmasi -->
             <div style="background:#FEF3C7;border:1px solid #FCD34D;
               border-radius:var(--radius-md);padding:16px;
               text-align:center">
               <i class="fas fa-lock" style="font-size:24px;
                 color:#92400E;margin-bottom:8px;display:block"></i>
               <p style="font-size:var(--text-sm);color:#92400E;
                 font-weight:500;margin-bottom:4px">
                 Jurnal Terkunci
               </p>
               <p style="font-size:var(--text-xs);color:#B45309">
                 Menunggu ${guru?.nama || "guru"} mengkonfirmasi
                 kehadiran terlebih dahulu.
               </p>
             </div>`
            : jurnal
              ? `<!-- Jurnal sudah diisi -->
               <div style="background:#ECFDF5;border-radius:var(--radius-md);
                 padding:16px;margin-bottom:12px">
                 <div style="display:flex;justify-content:space-between;
                   align-items:flex-start;flex-wrap:wrap;gap:8px">
                   <div style="flex:1">
                     <div style="font-size:var(--text-xs);
                       color:var(--gray-400);margin-bottom:4px">
                       MATERI
                     </div>
                     <div style="font-size:var(--text-sm);
                       font-weight:500;color:var(--gray-800)">
                       ${jurnal.materi || "—"}
                     </div>
                     ${
                       jurnal.keterangan
                         ? `<div style="font-size:var(--text-xs);
                           color:var(--gray-500);margin-top:6px">
                           📝 ${jurnal.keterangan}
                          </div>`
                         : ""
                     }
                   </div>
                   <div style="text-align:right;flex-shrink:0">
                     <div style="font-size:var(--text-xs);
                       color:var(--gray-400);margin-bottom:4px">
                       KEHADIRAN
                     </div>
                     <div style="font-size:var(--text-xs);
                       display:flex;gap:8px;flex-wrap:wrap;
                       justify-content:flex-end">
                       <span style="color:var(--success)">
                         ✓ ${jurnal.jumlahHadir} hadir
                       </span>
                       <span style="color:var(--danger)">
                         ✗ ${jurnal.jumlahSakit || 0} sakit
                       </span>
                       <span style="color:var(--warning)">
                         ~ ${jurnal.jumlahIzin || 0} izin
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
               <div style="display:flex;gap:8px">
                 <button class="btn btn-sm btn-outline"
                   onclick="editJurnal('${jurnal.id}','${j.id}')">
                   <i class="fas fa-pen"></i> Edit
                 </button>
               </div>`
              : `<!-- Jurnal belum diisi, guru sudah konfirmasi -->
               <div style="text-align:center;padding:8px 0">
                 <p style="font-size:var(--text-sm);color:var(--gray-500);
                   margin-bottom:16px">
                   Guru sudah hadir! Silakan isi jurnal untuk sesi ini.
                 </p>
                 <button class="btn btn-siswa"
                   onclick="isiJurnal('${j.id}')">
                   <i class="fas fa-file-pen"></i>
                   Isi Jurnal Sekarang
                 </button>
               </div>`
        }
      </div>
    </div>
  `;
}

// ── MODAL: ISI / EDIT JURNAL ──────────────────────────────

function isiJurnal(jadwalId) {
  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalId);
  const guru = dbGetById(DB_KEYS.users, jadwal?.guruId);
  const mapel = dbGetById(DB_KEYS.mapel, jadwal?.mapelId);

  // Cek guru sudah konfirmasi
  if (!guruSudahKonfirmasi(jadwalId)) {
    showToast(
      "Guru belum mengkonfirmasi kehadiran. Jurnal belum bisa diisi.",
      "warning",
      4000,
    );
    return;
  }

  hideFormError("jurnalFormError");

  document.getElementById("modalJurnalTitle").textContent = "Isi Jurnal";
  document.getElementById("jurnalId").value = "";
  document.getElementById("jurnalJadwalId").value = jadwalId;
  document.getElementById("jurnalJamKe").value = jadwal?.jamKe?.join(",") || "";

  // Info sesi
  document.getElementById("jurnalSesiInfo").innerHTML = `
    <i class="fas fa-circle-info"></i>
    <div>
      <strong>${mapel?.nama || "—"}</strong> —
      ${dataKelas?.nama || "—"}<br/>
      <span style="font-size:var(--text-xs)">
        Jam ${jadwal?.jamKe?.join(", ")} •
        ${formatRentangJam(jadwal?.jamKe || [])} •
        ${guru?.nama || "—"}
      </span>
    </div>
  `;

  // Reset form
  document.getElementById("formJurnalMateri").value = "";
  document.getElementById("formJurnalHadir").value = 0;
  document.getElementById("formJurnalSakit").value = 0;
  document.getElementById("formJurnalIzin").value = 0;
  document.getElementById("formJurnalKeterangan").value = "";
  hitungKehadiran();

  openModal("modalJurnal");
}

function editJurnal(jurnalId, jadwalId) {
  const jurnal = dbGetById(DB_KEYS.jurnal, jurnalId);
  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalId);
  const guru = dbGetById(DB_KEYS.users, jadwal?.guruId);
  const mapel = dbGetById(DB_KEYS.mapel, jadwal?.mapelId);

  hideFormError("jurnalFormError");

  document.getElementById("modalJurnalTitle").textContent = "Edit Jurnal";
  document.getElementById("jurnalId").value = jurnalId;
  document.getElementById("jurnalJadwalId").value = jadwalId;
  document.getElementById("jurnalJamKe").value = jadwal?.jamKe?.join(",") || "";

  // Info sesi
  document.getElementById("jurnalSesiInfo").innerHTML = `
    <i class="fas fa-circle-info"></i>
    <div>
      <strong>${mapel?.nama || "—"}</strong> —
      ${dataKelas?.nama || "—"}<br/>
      <span style="font-size:var(--text-xs)">
        Jam ${jadwal?.jamKe?.join(", ")} •
        ${formatRentangJam(jadwal?.jamKe || [])} •
        ${guru?.nama || "—"}
      </span>
    </div>
  `;

  // Isi form dengan data jurnal
  document.getElementById("formJurnalMateri").value = jurnal?.materi || "";
  document.getElementById("formJurnalHadir").value = jurnal?.jumlahHadir || 0;
  document.getElementById("formJurnalSakit").value = jurnal?.jumlahSakit || 0;
  document.getElementById("formJurnalIzin").value = jurnal?.jumlahIzin || 0;
  document.getElementById("formJurnalKeterangan").value =
    jurnal?.keterangan || "";
  hitungKehadiran();

  openModal("modalJurnal");
}

function simpanJurnal() {
  const id = document.getElementById("jurnalId").value;
  const jadwalId = document.getElementById("jurnalJadwalId").value;
  const materi = document.getElementById("formJurnalMateri").value.trim();
  const hadir = parseInt(document.getElementById("formJurnalHadir").value) || 0;
  const sakit = parseInt(document.getElementById("formJurnalSakit").value) || 0;
  const izin = parseInt(document.getElementById("formJurnalIzin").value) || 0;
  const keterangan = document
    .getElementById("formJurnalKeterangan")
    .value.trim();

  // Validasi
  if (!materi) return showFormError("jurnalFormError", "Materi wajib diisi.");
  if (hadir < 0 || sakit < 0 || izin < 0)
    return showFormError(
      "jurnalFormError",
      "Jumlah kehadiran tidak boleh negatif.",
    );

  // Cek konfirmasi guru masih valid
  if (!guruSudahKonfirmasi(jadwalId)) {
    return showFormError(
      "jurnalFormError",
      "Konfirmasi guru tidak ditemukan. Jurnal tidak bisa disimpan.",
    );
  }

  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalId);
  const alpha = Math.max(
    0,
    dbGetAll(DB_KEYS.users).filter((u) => u.kelasId === currentSession.kelasId)
      .length -
      hadir -
      sakit -
      izin,
  );

  const data = {
    kelasId: currentSession.kelasId,
    jadwalId,
    userId: currentSession.id,
    guruId: jadwal?.guruId || "",
    mapelId: jadwal?.mapelId || "",
    tanggal: getTodayStr(),
    jamKe: Math.min(...(jadwal?.jamKe || [0])),
    materi,
    jumlahHadir: hadir,
    jumlahSakit: sakit,
    jumlahIzin: izin,
    jumlahAlpha: alpha,
    keterangan,
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    dbUpdate(DB_KEYS.jurnal, id, data);
    showToast("Jurnal berhasil diperbarui!", "success");
  } else {
    dbInsert(DB_KEYS.jurnal, {
      id: generateId("jrn"),
      ...data,
      createdAt: new Date().toISOString(),
    });
    showToast("Jurnal berhasil disimpan! ✅", "success", 4000);
  }

  closeModal("modalJurnal");
  renderJurnalHariIni();
  renderBeranda();
}

// ── Hapus Jurnal ──────────────────────────────────────────

function hapusJurnal(jurnalId) {
  const j = dbGetById(DB_KEYS.jurnal, jurnalId);
  const mapel = dbGetById(DB_KEYS.mapel, j?.mapelId);

  document.getElementById("hapusMessage").textContent =
    `Hapus jurnal "${mapel?.nama || "—"}" Jam ke-${j?.jamKe}?
     Tindakan ini tidak bisa dibatalkan.`;

  document.getElementById("hapusBtn").onclick = () => {
    dbDelete(DB_KEYS.jurnal, jurnalId);
    closeModal("modalHapus");
    renderJurnalHariIni();
    renderBeranda();
    showToast("Jurnal berhasil dihapus.", "info");
  };

  openModal("modalHapus");
}

// ── Hitung Kehadiran ──────────────────────────────────────

function hitungKehadiran() {
  const hadir = parseInt(document.getElementById("formJurnalHadir").value) || 0;
  const sakit = parseInt(document.getElementById("formJurnalSakit").value) || 0;
  const izin = parseInt(document.getElementById("formJurnalIzin").value) || 0;

  const totalSiswa = dbGetAll(DB_KEYS.users).filter(
    (u) => u.kelasId === currentSession?.kelasId,
  ).length;

  const alpha = Math.max(0, totalSiswa - hadir - sakit - izin);

  document.getElementById("ringkasHadir").textContent = hadir;
  document.getElementById("ringkasTotal").textContent = sakit + izin;
  document.getElementById("ringkasAlpha").textContent = alpha;
}

// ── Banner Hari Libur ─────────────────────────────────────

function renderBannerLiburSiswa(libur) {
  const tipeIcon = {
    nasional: "🇮🇩",
    sekolah: "🏫",
    mingguan: "📅",
  };

  return `
    <div class="card">
      <div class="card-body"
        style="text-align:center;padding:48px 24px">
        <div style="font-size:64px;margin-bottom:16px">
          ${tipeIcon[libur.tipe] || "📅"}
        </div>
        <h2 style="font-size:var(--text-2xl);font-weight:700;
          color:var(--gray-800);margin-bottom:8px">
          Hari Libur
        </h2>
        <p style="font-size:var(--text-lg);font-weight:600;
          color:var(--color-siswa);margin-bottom:8px">
          ${libur.nama}
        </p>
        <p style="font-size:var(--text-sm);color:var(--gray-500)">
          ${formatTanggal(getTodayStr())}
        </p>
        <div style="margin-top:24px;padding:16px;
          background:var(--gray-50);border-radius:var(--radius-md);
          font-size:var(--text-sm);color:var(--gray-500)">
          <i class="fas fa-info-circle"></i>
          Tidak ada kegiatan belajar mengajar hari ini.
          Pengisian jurnal tidak tersedia.
        </div>
      </div>
    </div>
  `;
}

// ── PAGE: RIWAYAT ─────────────────────────────────────────

function renderRiwayat() {
  const dari = document.getElementById("riwayatDari").value;
  const sampai = document.getElementById("riwayatSampai").value;
  const jams = dbGetAll(DB_KEYS.jamPelajaran);

  let data = getJurnalKelasSaya();
  if (dari) data = data.filter((j) => j.tanggal >= dari);
  if (sampai) data = data.filter((j) => j.tanggal <= sampai);

  data.sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal) || a.jamKe - b.jamKe,
  );

  document.getElementById("riwayatTableBody").innerHTML = data.length
    ? data
        .map((j) => {
          const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
          const guru = dbGetById(DB_KEYS.users, j.guruId);
          const diisi = dbGetById(DB_KEYS.users, j.userId);
          const jam = jams.find(
            (jp) => jp.ke === j.jamKe && jp.tipe === "pelajaran",
          );
          return `
          <tr>
            <td style="white-space:nowrap;font-size:var(--text-sm)">
              ${formatTanggal(j.tanggal)}
            </td>
            <td>
              <span class="badge badge-siswa">Jam ${j.jamKe}</span>
            </td>
            <td style="font-size:var(--text-xs);white-space:nowrap">
              ${jam ? `${jam.mulai}–${jam.selesai}` : "—"}
            </td>
            <td><strong>${mapel?.nama || "—"}</strong></td>
            <td style="font-size:var(--text-sm)">${guru?.nama || "—"}</td>
            <td style="max-width:160px">
              <div style="white-space:nowrap;overflow:hidden;
                text-overflow:ellipsis;font-size:var(--text-sm)">
                ${j.materi || "—"}
              </div>
            </td>
            <td>
              <div style="font-size:var(--text-xs);white-space:nowrap">
                <span style="color:var(--success)">
                  ✓ ${j.jumlahHadir}
                </span> &nbsp;
                <span style="color:var(--danger)">
                  ✗ ${j.jumlahSakit || 0}
                </span> &nbsp;
                <span style="color:var(--warning)">
                  ~ ${j.jumlahIzin || 0}
                </span>
              </div>
            </td>
            <td style="font-size:var(--text-xs);color:var(--gray-500)">
              ${diisi?.nama || "—"}
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="8" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada riwayat jurnal.
      </td></tr>`;
}

function clearRiwayatFilter() {
  document.getElementById("riwayatDari").value = "";
  document.getElementById("riwayatSampai").value = "";
  renderRiwayat();
}
