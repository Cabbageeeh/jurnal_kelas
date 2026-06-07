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
            <td style="white-space:nowrap;font-size:var(--text-sm)">${formatTanggal(k.tanggal)}</td>
            <td>${g?.nama || "—"}</td>
            <td><span class="badge badge-guru">${kl?.nama || "—"}</span></td>
            <td>${m?.nama || "—"}</td>
            <td>Jam ${j?.jamKe?.join(", ") || "—"}</td>
            <td><span class="badge badge-info"><i class="fas fa-clock"></i> ${k.waktuKonfirmasi || "—"}</span></td>
            <td>
              ${
                k.lokasi
                  ? `<div style="font-size:var(--text-xs);max-width:150px">
                      <div style="color:var(--success);font-weight:600;margin-bottom:2px"><i class="fas fa-location-dot"></i> ±${k.lokasi.akurasi}m</div>
                      <div style="color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${k.lokasi.alamat}">${k.lokasi.alamat}</div>
                     </div>`
                  : `<span class="badge badge-gray"><i class="fas fa-location-slash"></i> Tidak ada</span>`
              }
            </td>
            <td>${k.foto ? `<img src="${k.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--success)" onclick="lihatFoto('${k.id}')" title="Klik untuk memperbesar"/>` : `<span class="badge badge-gray">Tidak ada</span>`}</td>
            <td><span class="badge badge-success">Terkonfirmasi</span></td>
          </tr>`;
        })
        .join("")
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
