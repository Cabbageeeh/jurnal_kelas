// ============================================
// js/kepsek.js — Dashboard Kepala Sekolah (Monitoring & Export)
// Akses: Dashboard Overview, Rekap Jurnal, Rekap Konfirmasi, Rekap Absensi, Export
// ============================================

let currentSession = null;

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  currentSession = requireAuth("kepsek");
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
  dashboard: "Dashboard",
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
    dashboard: renderDashboard,
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

// ── DASHBOARD OVERVIEW ────────────────────────────────────

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
    { icon: "fa-users", color: "admin", label: "Total Pengguna", value: users.length },
    { icon: "fa-chalkboard", color: "guru", label: "Total Kelas", value: kelas.length },
    { icon: "fa-calendar-week", color: "info", label: "Jadwal Aktif", value: jadwal.filter((j) => j.aktif).length },
    { icon: "fa-user-check", color: "siswa", label: "Konfirmasi Hari Ini", value: konfirmasi.filter((k) => k.tanggal === today).length },
    { icon: "fa-file-lines", color: "warning", label: "Jurnal Hari Ini", value: jurnal.filter((j) => j.tanggal === today).length },
    { icon: "fa-triangle-exclamation", color: "danger", label: "Tanpa Konfirmasi Guru", value: jurnal.filter((j) => j.tanpaKonfirmasiGuru).length },
  ];

  document.getElementById("statsGrid").innerHTML = stats
    .map((s) => `
      <div class="stat-card">
        <div class="stat-icon ${s.color}"><i class="fas ${s.icon}"></i></div>
        <div><div class="stat-number">${s.value}</div><div class="stat-label">${s.label}</div></div>
      </div>
    `).join("");

  // Konfirmasi hari ini
  const konfHariIni = konfirmasi
    .filter((k) => k.tanggal === today)
    .sort((a, b) => b.waktuKonfirmasi?.localeCompare(a.waktuKonfirmasi));

  document.getElementById("dashKonfirmasiHariIni").innerHTML = konfHariIni.length
    ? konfHariIni.map((k) => {
        const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
        const g = dbGetById(DB_KEYS.users, k.guruId);
        const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
        const m = dbGetById(DB_KEYS.mapel, j?.mapelId);
        return `
          <div style="padding:10px 0;border-bottom:1px solid var(--gray-100);display:flex;align-items:center;gap:10px">
            ${k.foto
              ? `<img src="${k.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--success)" />`
              : `<div style="width:40px;height:40px;border-radius:50%;background:var(--gray-100);display:flex;align-items:center;justify-content:center;color:var(--gray-400)"><i class="fas fa-user"></i></div>`
            }
            <div style="flex:1">
              <div style="font-size:var(--text-sm);font-weight:600">${g?.nama || "—"}</div>
              <div style="font-size:var(--text-xs);color:var(--gray-400)">${kl?.nama || "—"} • ${m?.nama || "—"}</div>
            </div>
            <div style="font-size:var(--text-xs);color:var(--gray-500)">${k.waktuKonfirmasi || "—"}</div>
          </div>`;
      }).join("")
    : `<div class="empty-state"><i class="fas fa-user-clock"></i><p>Belum ada konfirmasi hari ini</p></div>`;

  // Jurnal terbaru
  const recentJurnal = [...jurnal].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  document.getElementById("dashJurnalTerbaru").innerHTML = recentJurnal.length
    ? recentJurnal.map((j) => {
        const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
        const m = dbGetById(DB_KEYS.mapel, j.mapelId);
        const badgeTanpaGuru = j.tanpaKonfirmasiGuru
          ? `<span style="display:inline-block;margin-left:6px;padding:1px 6px;background:#FEF3C7;color:#92400E;border-radius:3px;font-size:9px;font-weight:600"><i class="fas fa-triangle-exclamation" style="font-size:8px"></i> Tanpa Guru</span>` : "";
        return `
          <div style="padding:8px 0;border-bottom:1px solid var(--gray-100)">
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:var(--text-sm);font-weight:500">${kl?.nama || "—"} — ${m?.nama || "—"} ${badgeTanpaGuru}</span>
              <span class="badge badge-siswa">Jam ${j.jamKe}</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--gray-400);margin-top:2px">${formatTanggal(j.tanggal)} • ${j.materi?.substring(0, 40) || "—"}</div>
          </div>`;
      }).join("")
    : `<div class="empty-state"><i class="fas fa-file-circle-xmark"></i><p>Belum ada jurnal</p></div>`;

  // Status Guru Hari Ini
  renderStatusGuruMonitoring(today);
}

function renderStatusGuruMonitoring(today) {
  const guruList = dbGetAll(DB_KEYS.users).filter((u) => u.role === "guru");
  const semuaKonfirmasi = dbGetAll(DB_KEYS.konfirmasi).filter((k) => k.tanggal === today);
  const semuaStatus = getStatusGuruPerTanggal(today);

  let countHadir = 0, countDinasLuar = 0, countIzin = 0, countBelum = 0;

  const rows = guruList.map((guru) => {
    const statusEntry = semuaStatus.find((s) => s.guruId === guru.id);
    const status = statusEntry ? statusEntry.status : null;
    const konfirmasiGuru = semuaKonfirmasi.filter((k) => k.guruId === guru.id);

    if (status === "dinas_luar") countDinasLuar++;
    else if (status === "izin") countIzin++;
    else if (konfirmasiGuru.length > 0) countHadir++;
    else countBelum++;

    let badge = "";
    if (status === "dinas_luar") {
      badge = `<span class="badge badge-info"><i class="fas fa-plane"></i> Dinas Luar</span>`;
    } else if (status === "izin") {
      badge = `<span class="badge badge-danger"><i class="fas fa-calendar-xmark"></i> Izin</span>`;
    } else if (konfirmasiGuru.length > 0) {
      badge = `<span class="badge badge-success"><i class="fas fa-check"></i> Hadir</span>`;
    } else {
      badge = `<span class="badge badge-warning"><i class="fas fa-clock"></i> Belum</span>`;
    }

    return `<div style="padding:8px 12px;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;align-items:center">
      <div>
        <span style="font-size:var(--text-sm);font-weight:500">${guru.nama}</span>
        ${statusEntry?.keterangan ? `<span style="font-size:var(--text-xs);color:var(--gray-400);margin-left:6px">(${statusEntry.keterangan})</span>` : ""}
      </div>
      ${badge}
    </div>`;
  });

  document.getElementById("dashStatusGuru").innerHTML = `
    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <div style="background:#d1fae5;padding:8px 16px;border-radius:8px;font-size:13px"><strong>${countHadir}</strong> Hadir</div>
      <div style="background:#dbeafe;padding:8px 16px;border-radius:8px;font-size:13px"><strong>${countDinasLuar}</strong> Dinas Luar</div>
      <div style="background:#fee2e2;padding:8px 16px;border-radius:8px;font-size:13px"><strong>${countIzin}</strong> Izin</div>
      <div style="background:#fef3c7;padding:8px 16px;border-radius:8px;font-size:13px"><strong>${countBelum}</strong> Belum Konfirmasi</div>
    </div>
    ${rows.join("")}`;
}

// ── REKAP JURNAL (Read-Only) ─────────────────────────────

function populateFilterKelas() {
  const kelas = dbGetAll(DB_KEYS.kelas);
  const sel = document.getElementById("filterJurnalKelas");
  sel.innerHTML = `<option value="">Semua Kelas</option>` + kelas.map((k) => `<option value="${k.id}">${k.nama}</option>`).join("");
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
    ? data.map((j) => {
        const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
        const m = dbGetById(DB_KEYS.mapel, j.mapelId);
        const g = dbGetById(DB_KEYS.users, j.guruId);
        const u = dbGetById(DB_KEYS.users, j.userId);
        return `
          <tr>
            <td style="white-space:nowrap;font-size:var(--text-sm)">${formatTanggal(j.tanggal)}</td>
            <td><span class="badge badge-siswa">${kl?.nama || "—"}</span></td>
            <td>Jam ${j.jamKe}</td>
            <td>${m?.nama || "—"}</td>
            <td style="font-size:var(--text-sm)">${g?.nama || "—"}</td>
            <td style="max-width:180px;font-size:var(--text-sm)"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.materi || "—"}</div></td>
            <td><div style="font-size:var(--text-xs);display:flex;flex-direction:column;gap:2px">
              <span style="color:var(--success)">✓ ${j.jumlahHadir || 0}</span>
              <span style="color:var(--danger)">✗ ${j.jumlahSakit || 0}</span>
              <span style="color:var(--warning)">~ ${j.jumlahIzin || 0}</span>
              <span style="color:var(--gray-400)">? ${j.jumlahAlpha || 0}</span>
            </div></td>
            <td style="font-size:var(--text-xs);color:var(--gray-500)">${u?.nama || "—"}</td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="8" style="text-align:center;color:var(--gray-400);padding:32px">Belum ada jurnal.</td></tr>`;
}

function clearFilterJurnal() {
  document.getElementById("filterJurnalDari").value = "";
  document.getElementById("filterJurnalSampai").value = "";
  document.getElementById("filterJurnalKelas").value = "";
  renderRekapJurnal();
}

// ── REKAP KONFIRMASI (Read-Only) ─────────────────────────

function populateFilterGuru() {
  const gurus = dbGetAll(DB_KEYS.users).filter((u) => u.role === "guru");
  const sel = document.getElementById("filterKonfGuru");
  sel.innerHTML = `<option value="">Semua Guru</option>` + gurus.map((g) => `<option value="${g.id}">${g.nama}</option>`).join("");
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
    ? data.map((k) => {
        const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
        const g = dbGetById(DB_KEYS.users, k.guruId);
        const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
        const m = dbGetById(DB_KEYS.mapel, j?.mapelId);
        return `
          <tr>
            <td style="white-space:nowrap;font-size:var(--text-sm)">${formatTanggal(k.tanggal)}</td>
            <td>${g?.nama || "—"}</td>
            <td><span class="badge badge-guru">${kl?.nama || "—"}</span></td>
            <td>${m?.nama || "—"}</td>
            <td>Jam ${j?.jamKe?.join(", ") || "—"}</td>
            <td><span class="badge badge-info"><i class="fas fa-clock"></i> ${k.waktuKonfirmasi || "—"}</span></td>
            <td>${k.lokasi ? `<div style="font-size:var(--text-xs);max-width:150px"><div style="color:var(--success);font-weight:600"><i class="fas fa-location-dot"></i> ±${k.lokasi.akurasi}m</div><div style="color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k.lokasi.alamat}</div></div>` : `<span class="badge badge-gray">Tidak ada</span>`}</td>
            <td>${k.foto ? `<img src="${k.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--success)" onclick="lihatFoto('${k.id}')" />` : `<span class="badge badge-gray">Tidak ada</span>`}</td>
            <td><span class="badge badge-success">Terkonfirmasi</span></td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="9" style="text-align:center;color:var(--gray-400);padding:32px">Belum ada konfirmasi.</td></tr>`;
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
    <div><strong>${g?.nama || "—"}</strong></div>
    <div>${kl?.nama || "—"} • ${m?.nama || "—"} • ${formatTanggal(k?.tanggal || "")}</div>
  `;
  openModal("modalFoto");
}

// ── UTILITAS ──────────────────────────────────────────────

function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
