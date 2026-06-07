// ============================================
// js/tu.js — Dashboard Petugas TU (Read-Only)
// Hanya akses: Rekap Jurnal, Rekap Konfirmasi, Rekap Absensi, Export
// ============================================

let currentSession = null;

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  currentSession = requireAuth("tu");
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

  showPage("rekap-jurnal");
});

// ── Navigasi ──────────────────────────────────────────────

const PAGE_TITLES = {
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

// ── REKAP JURNAL (Read-Only) ─────────────────────────────

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
            <td style="white-space:nowrap;font-size:var(--text-sm)">${formatTanggal(j.tanggal)}</td>
            <td><span class="badge badge-siswa">${kl?.nama || "—"}</span></td>
            <td>Jam ${j.jamKe}</td>
            <td>${m?.nama || "—"}</td>
            <td style="font-size:var(--text-sm)">${g?.nama || "—"}</td>
            <td style="max-width:180px;font-size:var(--text-sm)">
              <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.materi || "—"}</div>
            </td>
            <td>
              <div style="font-size:var(--text-xs);display:flex;flex-direction:column;gap:2px">
                <span style="color:var(--success)">✓ ${j.jumlahHadir || 0} hadir</span>
                <span style="color:var(--danger)">✗ ${j.jumlahSakit || 0} sakit</span>
                <span style="color:var(--warning)">~ ${j.jumlahIzin || 0} izin</span>
                <span style="color:var(--gray-400)">? ${j.jumlahAlpha || 0} alpha</span>
              </div>
            </td>
            <td style="font-size:var(--text-xs);color:var(--gray-500)">${u?.nama || "—"}</td>
          </tr>`;
        })
        .join("")
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
  sel.innerHTML =
    `<option value="">Semua Guru</option>` +
    gurus.map((g) => `<option value="${g.id}">${g.nama}</option>`).join("");
}

function renderRekapKonfirmasi() {
  const dari = document.getElementById("filterKonfDari").value;
  const sampai = document.getElementById("filterKonfSampai").value;
  const guruId = document.getElementById("filterKonfGuru").value;
  const tampilkan = document.getElementById("filterKonfTampilkan")?.value || "konfirmasi";

  const guruMasterList = getGuruMaster();
  const getNIP = (userId) => {
    const gm = guruMasterList.find((g) => g.userId === userId);
    return gm?.nip || "—";
  };

  if (tampilkan === "semua") {
    const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    let dateFrom = dari;
    let dateTo = sampai;
    if (!dateFrom && !dateTo) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5);
      dateFrom = monday.toISOString().slice(0, 10);
      dateTo = saturday.toISOString().slice(0, 10);
    }
    if (!dateFrom) dateFrom = dateTo;
    if (!dateTo) dateTo = dateFrom;

    const diffDays = Math.ceil((new Date(dateTo) - new Date(dateFrom)) / 86400000);
    if (diffDays > 60) {
      showToast("Rentang tanggal terlalu luas. Maksimal 60 hari.", "warning");
      return;
    }

    const semuaTanggal = [];
    const d = new Date(dateFrom);
    const end = new Date(dateTo);
    while (d <= end) {
      semuaTanggal.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }

    const semuaJadwal = dbGetAll(DB_KEYS.jadwal);
    const semuaKonfirmasi = dbGetAll(DB_KEYS.konfirmasi);
    let rows = [];

    semuaTanggal.forEach((tanggal) => {
      const hariIdx = new Date(tanggal).getDay();
      const hariNama = HARI[hariIdx];
      const hariLibur = dbGetAll(DB_KEYS.hariLibur);
      if (hariLibur.some((h) => h.tanggal === tanggal)) return;

      const jadwalHariIni = semuaJadwal.filter((j) => j.hari === hariNama && j.aktif !== false);
      jadwalHariIni.forEach((jadwal) => {
        if (guruId && jadwal.guruId !== guruId) return;
        const konfirmasi = semuaKonfirmasi.find((k) => k.jadwalId === jadwal.id && k.tanggal === tanggal);
        const guru = dbGetById(DB_KEYS.users, jadwal.guruId);
        const kelas = dbGetById(DB_KEYS.kelas, jadwal.kelasId);
        const mapel = dbGetById(DB_KEYS.mapel, jadwal.mapelId);
        const statusHarian = getStatusGuru(jadwal.guruId, tanggal);
        rows.push({ tanggal, jadwal, konfirmasi, guru, kelas, mapel, nip: getNIP(jadwal.guruId), statusHarian: statusHarian || "hadir" });
      });
    });

    rows.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    document.getElementById("rekapKonfirmasiBody").innerHTML = rows.length
      ? rows.map((r) => {
          const isKonfirmasi = !!r.konfirmasi;
          const isIzin = r.statusHarian === "izin";
          const isDinasLuar = r.statusHarian === "din";
          let rowBg = "", statusBadge = "";
          if (isKonfirmasi) { statusBadge = '<span class="badge badge-success">Terkonfirmasi</span>'; }
          else if (isIzin) { rowBg = "background: #f0f9ff;"; statusBadge = '<span class="badge" style="background:#DBEAFE;color:#1E40AF"><i class="fas fa-envelope"></i> Izin</span>'; }
          else if (isDinasLuar) { rowBg = "background: #fefce8;"; statusBadge = '<span class="badge badge-warning">Belum (Dinas Luar)</span>'; }
          else { rowBg = "background: #FEF2F2;"; statusBadge = '<span class="badge badge-danger">Belum Konfirmasi</span>'; }
          const k = r.konfirmasi;
          return `
          <tr style="${rowBg}">
            <td style="white-space:nowrap;font-size:var(--text-sm)">${formatTanggal(r.tanggal)}</td>
            <td>${r.guru?.nama || "—"}</td>
            <td><code style="font-size:var(--text-xs)">${r.nip}</code></td>
            <td><span class="badge badge-guru">${r.kelas?.nama || "—"}</span></td>
            <td>${r.mapel?.nama || "—"}</td>
            <td>Jam ${r.jadwal?.jamKe?.join(", ") || "—"}</td>
            <td>${isKonfirmasi ? `<span class="badge badge-info"><i class="fas fa-clock"></i> ${k.waktuKonfirmasi || "—"}</span>` : "—"}</td>
            <td>${isKonfirmasi && k.lokasi ? `<div style="font-size:var(--text-xs);max-width:150px"><div style="color:var(--success);font-weight:600"><i class="fas fa-location-dot"></i> ±${k.lokasi.akurasi}m</div><div style="color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k.lokasi.alamat}</div></div>` : "—"}</td>
            <td>${isKonfirmasi && k.foto ? `<img src="${k.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--success)" onclick="lihatFoto('${k.id}')"/>` : "—"}</td>
            <td>${statusBadge}</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="10" style="text-align:center;color:var(--gray-400);padding:32px">Tidak ada data jadwal.</td></tr>`;

    updateRekapKonfirmasiStatsTU(rows);
  } else {
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
            <td><code style="font-size:var(--text-xs)">${getNIP(k.guruId)}</code></td>
            <td><span class="badge badge-guru">${kl?.nama || "—"}</span></td>
            <td>${m?.nama || "—"}</td>
            <td>Jam ${j?.jamKe?.join(", ") || "—"}</td>
            <td><span class="badge badge-info"><i class="fas fa-clock"></i> ${k.waktuKonfirmasi || "—"}</span></td>
            <td>${k.lokasi ? `<div style="font-size:var(--text-xs);max-width:150px"><div style="color:var(--success);font-weight:600"><i class="fas fa-location-dot"></i> ±${k.lokasi.akurasi}m</div><div style="color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k.lokasi.alamat}</div></div>` : `<span class="badge badge-gray">Tidak ada</span>`}</td>
            <td>${k.foto ? `<img src="${k.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--success)" onclick="lihatFoto('${k.id}')"/>` : `<span class="badge badge-gray">Tidak ada</span>`}</td>
            <td><span class="badge badge-success">Terkonfirmasi</span></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="10" style="text-align:center;color:var(--gray-400);padding:32px">Belum ada konfirmasi.</td></tr>`;

    const statsEl = document.getElementById("rekapKonfirmasiStats");
    if (statsEl) statsEl.innerHTML = "";
  }
}

function updateRekapKonfirmasiStatsTU(rows) {
  const statsEl = document.getElementById("rekapKonfirmasiStats");
  if (!statsEl) return;
  const total = rows.length;
  const konfirmasi = rows.filter((r) => r.konfirmasi).length;
  const izin = rows.filter((r) => !r.konfirmasi && r.statusHarian === "izin").length;
  const dinasLuar = rows.filter((r) => !r.konfirmasi && r.statusHarian === "din").length;
  const belum = total - konfirmasi - izin - dinasLuar;
  statsEl.innerHTML = `
    <div class="badge" style="background:#ECFDF5;color:#065F46;padding:8px 14px;font-size:var(--text-sm)"><i class="fas fa-circle-check"></i> <strong>${konfirmasi}</strong> Terkonfirmasi</div>
    <div class="badge" style="background:#FEF2F2;color:#991B1B;padding:8px 14px;font-size:var(--text-sm)"><i class="fas fa-circle-xmark"></i> <strong>${belum}</strong> Belum</div>
    <div class="badge" style="background:#DBEAFE;color:#1E40AF;padding:8px 14px;font-size:var(--text-sm)"><i class="fas fa-envelope"></i> <strong>${izin}</strong> Izin</div>
    <div class="badge" style="background:#FEFCE8;color:#854D0E;padding:8px 14px;font-size:var(--text-sm)"><i class="fas fa-briefcase"></i> <strong>${dinasLuar}</strong> Dinas Luar</div>
    <div class="badge" style="background:var(--gray-100);color:var(--gray-700);padding:8px 14px;font-size:var(--text-sm)">Total: <strong>${total}</strong></div>
  `;
}

function clearFilterKonf() {
  document.getElementById("filterKonfDari").value = "";
  document.getElementById("filterKonfSampai").value = "";
  document.getElementById("filterKonfGuru").value = "";
  const tampilkanEl = document.getElementById("filterKonfTampilkan");
  if (tampilkanEl) tampilkanEl.value = "konfirmasi";
  const statsEl = document.getElementById("rekapKonfirmasiStats");
  if (statsEl) statsEl.innerHTML = "";
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
