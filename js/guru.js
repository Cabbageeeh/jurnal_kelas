// ============================================
// js/guru.js — Dashboard Guru v2.0
// Hanya tampil jadwal aktif saat ini
// ============================================

let currentSession = null;
let streamKamera = null;
let fotoDataUrl = null;
let jadwalKonfirmId = null; // jadwal yang sedang dikonfirmasi
let autoRefreshTimer = null;

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  currentSession = requireAuth("guru");
  if (!currentSession) return;

  document.getElementById("sidebarName").textContent = currentSession.nama;
  document.getElementById("sidebarAvatar").textContent = currentSession.nama
    .charAt(0)
    .toUpperCase();

  // Tanggal & jam realtime
  updateWaktu();
  setInterval(updateWaktu, 30000); // update setiap 30 detik

  // Default halaman: jadwal aktif
  showPage("jadwal-aktif");

  // Auto refresh jadwal aktif setiap 1 menit
  // agar otomatis muncul/hilang saat jam berganti
  autoRefreshTimer = setInterval(() => {
    const activePage = document.querySelector('[id^="page-"]:not(.hidden)');
    if (activePage?.id === "page-jadwal-aktif") {
      renderJadwalAktif();
    }
  }, 60000);
});

// ── Waktu Realtime ────────────────────────────────────────

function updateWaktu() {
  const now = new Date();

  document.getElementById("topbarDate").textContent = now.toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  document.getElementById("topbarTime").textContent = now.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

// ── Banner Hari Libur ─────────────────────────────────────

function renderBannerLibur(libur) {
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
          color:var(--color-guru);margin-bottom:8px">
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
          Konfirmasi kehadiran tidak tersedia.
        </div>
      </div>
    </div>
  `;
}

// ── Navigasi ──────────────────────────────────────────────

const PAGE_TITLES_GURU = {
  "jadwal-aktif": "Jadwal Aktif",
  "jadwal-hari-ini": "Jadwal Hari Ini",
  riwayat: "Riwayat Konfirmasi",
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
    PAGE_TITLES_GURU[page] || "";

  const actions = {
    "jadwal-aktif": renderJadwalAktif,
    "jadwal-hari-ini": renderJadwalHariIni,
    riwayat: renderRiwayat,
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

// ── PAGE: JADWAL AKTIF ────────────────────────────────────

function renderJadwalAktif() {
  const libur = cekHariIniLibur();
  if (libur) {
    document.getElementById("statusJamSekarang").innerHTML = "";
    document.getElementById("jadwalAktifContainer").innerHTML =
      renderBannerLibur(libur);
    document.getElementById("jadwalAktifTitle").textContent = "Jadwal Saat Ini";
    document.getElementById("jadwalAktifSubtitle").textContent =
      "Hari ini adalah hari libur";
    return; // ← stop di sini, tidak lanjut ke bawah
  }
  const hariIni = getHariIni();
  const jamAktif = getJamAktifSekarang();
  const jamSekarang = getJamSekarang();
  const container = document.getElementById("jadwalAktifContainer");
  const statusEl = document.getElementById("statusJamSekarang");

  // Update subtitle
  document.getElementById("jadwalAktifTitle").textContent =
    `Jadwal Saat Ini — ${hariIni}`;
  document.getElementById("jadwalAktifSubtitle").textContent =
    `Pukul ${jamSekarang} • Hanya menampilkan jam yang sedang berlangsung`;

  // Tampilkan status jam
  if (jamAktif.length > 0) {
    statusEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;
        padding:12px 16px;background:#ECFDF5;border:1px solid #6EE7B7;
        border-radius:var(--radius-md);margin-bottom:4px">
        <span style="width:10px;height:10px;border-radius:50%;
          background:var(--success);display:inline-block;
          animation:pulse 1.5s infinite"></span>
        <span style="font-size:var(--text-sm);font-weight:600;
          color:#065F46">
          Jam ke-${jamAktif.join(", ")} sedang berlangsung
        </span>
      </div>
    `;
  } else {
    // Cari jam berikutnya
    const jamBerikutnya = getJamBerikutnya();
    statusEl.innerHTML = jamBerikutnya
      ? `<div style="padding:12px 16px;background:#FEF3C7;
          border:1px solid #FCD34D;border-radius:var(--radius-md);
          font-size:var(--text-sm);color:#92400E;margin-bottom:4px">
          <i class="fas fa-clock"></i>
          Tidak ada jam aktif saat ini.
          Jam ke-${jamBerikutnya.ke} berikutnya pukul
          <strong>${jamBerikutnya.mulai}</strong>
         </div>`
      : `<div style="padding:12px 16px;background:var(--gray-100);
          border-radius:var(--radius-md);font-size:var(--text-sm);
          color:var(--gray-500);margin-bottom:4px">
          <i class="fas fa-moon"></i>
          Tidak ada lagi jam pelajaran hari ini.
         </div>`;
  }

  // Ambil jadwal aktif guru saat ini
  const jadwalAktif = getJadwalAktifGuru(currentSession.id);

  if (jadwalAktif.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-calendar-xmark"></i>
            <p>
              Tidak ada jadwal mengajar Anda yang berlangsung saat ini.<br/>
              <span style="font-size:var(--text-xs)">
                Jadwal hanya muncul saat jam pelajaran berlangsung.
              </span>
            </p>
          </div>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = jadwalAktif
    .map((j) => renderKartuJadwalAktif(j))
    .join("");
}

function renderKartuJadwalAktif(j) {
  const kelas = dbGetById(DB_KEYS.kelas, j.kelasId);
  const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
  const konfirmasi = getKonfirmasiHariIni(j.id);
  const rentang = formatRentangJam(j.jamKe);

  return `
    <div class="card mb-4" style="border:2px solid ${
      konfirmasi ? "var(--success)" : "var(--color-guru)"
    }">
      <div class="card-body" style="padding:28px">

        <!-- Header kartu -->
        <div style="display:flex;justify-content:space-between;
          align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <div style="font-size:var(--text-2xl);font-weight:700;
              color:var(--gray-800);margin-bottom:6px">
              ${mapel?.nama || "—"}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span class="badge badge-guru" style="font-size:13px;padding:4px 12px">
                <i class="fas fa-chalkboard"></i> ${kelas?.nama || "—"}
              </span>
              <span class="badge badge-gray">
                <i class="fas fa-clock"></i>
                Jam ${j.jamKe.join(" & ")} • ${rentang}
              </span>
            </div>
          </div>
          <span class="badge ${konfirmasi ? "badge-success" : "badge-warning"}"
            style="font-size:13px;padding:6px 14px">
            ${
              konfirmasi
                ? `<i class="fas fa-circle-check"></i> Terkonfirmasi`
                : `<i class="fas fa-clock"></i> Belum Konfirmasi`
            }
          </span>
        </div>

        ${
          konfirmasi
            ? `<!-- Sudah konfirmasi -->
             <div style="background:#ECFDF5;border-radius:var(--radius-md);
               padding:16px;display:flex;align-items:center;gap:16px">
               ${
                 konfirmasi.foto
                   ? `<img src="${konfirmasi.foto}"
                     style="width:64px;height:64px;border-radius:50%;
                     object-fit:cover;border:3px solid var(--success);
                     cursor:pointer;flex-shrink:0"
                     onclick="lihatFotoGuru('${konfirmasi.id}')"
                     title="Klik untuk memperbesar"/>`
                   : `<div style="width:64px;height:64px;border-radius:50%;
                     background:var(--success);display:flex;align-items:center;
                     justify-content:center;color:white;font-size:24px;
                     flex-shrink:0">
                     <i class="fas fa-check"></i>
                    </div>`
               }
               <div>
                 <div style="font-weight:600;color:#065F46;margin-bottom:4px">
                   ✅ Kehadiran Terkonfirmasi
                 </div>
                 <div style="font-size:var(--text-sm);color:#047857">
                   Dikonfirmasi pukul
                   <strong>${konfirmasi.waktuKonfirmasi}</strong>
                 </div>
                 <div style="font-size:var(--text-xs);color:var(--gray-400);
                   margin-top:4px">
                   ${
                     konfirmasi.foto
                       ? '<i class="fas fa-image"></i> Foto tersimpan'
                       : '<i class="fas fa-image-slash"></i> Tanpa foto'
                   }
                 </div>
               </div>
             </div>`
            : `<!-- Belum konfirmasi -->
             <div style="text-align:center;padding:8px 0">
               <p style="color:var(--gray-500);font-size:var(--text-sm);
                 margin-bottom:20px">
                 Silakan konfirmasi kehadiran Anda untuk jam pelajaran ini.
                 Foto selfie akan disimpan sebagai bukti.
               </p>
               <button class="btn btn-guru btn-lg"
                 onclick="bukaKonfirmasi('${j.id}')"
                 style="padding:14px 32px;font-size:var(--text-base)">
                 <i class="fas fa-camera"></i>
                 Konfirmasi Kehadiran Sekarang
               </button>
             </div>`
        }
      </div>
    </div>
  `;
}

// ── PAGE: JADWAL HARI INI ─────────────────────────────────

function renderJadwalHariIni() {
  const libur = cekHariIniLibur();
  if (libur) {
    document.getElementById("jadwalHariIniSubtitle").textContent =
      "Hari ini adalah hari libur";
    document.getElementById("jadwalHariIniContainer").innerHTML =
      renderBannerLibur(libur);
    return;
  }
  const hariIni = getHariIni();
  const jadwal = getJadwalHariIniGuru(currentSession.id);
  const container = document.getElementById("jadwalHariIniContainer");
  const jams = dbGetAll(DB_KEYS.jamPelajaran);

  document.getElementById("jadwalHariIniSubtitle").textContent =
    `${hariIni}, ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} — ${jadwal.length} sesi mengajar`;

  if (jadwal.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-calendar-xmark"></i>
            <p>Tidak ada jadwal mengajar hari ${hariIni}.</p>
          </div>
        </div>
      </div>`;
    return;
  }

  // Tampilkan semua jadwal hari ini dalam timeline
  container.innerHTML = `
    <div class="card">
      <div class="card-body" style="padding:0">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Jam</th>
                <th>Waktu</th>
                <th>Kelas</th>
                <th>Mata Pelajaran</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${jadwal
                .map((j) => {
                  const kelas = dbGetById(DB_KEYS.kelas, j.kelasId);
                  const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
                  const konf = getKonfirmasiHariIni(j.id);
                  const rentang = formatRentangJam(j.jamKe);
                  const jamAktif = getJamAktifSekarang();
                  const sedangBerlangsung = j.jamKe.some((ke) =>
                    jamAktif.includes(ke),
                  );

                  return `
                  <tr style="${sedangBerlangsung ? "background:#ECFEFF;" : ""}">
                    <td>
                      <span class="badge badge-guru">
                        Jam ${j.jamKe.join(", ")}
                      </span>
                      ${
                        sedangBerlangsung
                          ? `<span style="display:block;font-size:10px;
                            color:var(--color-guru);margin-top:4px;
                            font-weight:600">
                            ● BERLANGSUNG
                           </span>`
                          : ""
                      }
                    </td>
                    <td style="font-size:var(--text-xs);white-space:nowrap">
                      ${rentang}
                    </td>
                    <td>
                      <strong>${kelas?.nama || "—"}</strong>
                    </td>
                    <td>${mapel?.nama || "—"}</td>
                    <td>
                      ${
                        konf
                          ? `<span class="badge badge-success">
                            <i class="fas fa-circle-check"></i>
                            Terkonfirmasi ${konf.waktuKonfirmasi}
                           </span>`
                          : sedangBerlangsung
                            ? `<button class="btn btn-sm btn-guru"
                              onclick="bukaKonfirmasi('${j.id}')">
                              <i class="fas fa-camera"></i> Konfirmasi
                             </button>`
                            : `<span class="badge badge-gray">Menunggu</span>`
                      }
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ── KONFIRMASI KEHADIRAN ──────────────────────────────────

function bukaKonfirmasi(jadwalId) {
  // Cek ulang apakah jam masih aktif
  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalId);
  const jamAktif = getJamAktifSekarang();

  if (!jadwal.jamKe.some((ke) => jamAktif.includes(ke))) {
    showToast(
      "Jam pelajaran sudah tidak berlangsung. Konfirmasi ditolak.",
      "error",
      5000,
    );
    return;
  }

  // Cek apakah sudah dikonfirmasi
  if (getKonfirmasiHariIni(jadwalId)) {
    showToast("Jadwal ini sudah dikonfirmasi hari ini.", "info");
    return;
  }

  jadwalKonfirmId = jadwalId;
  fotoDataUrl = null;

  // Reset modal
  const kelas = dbGetById(DB_KEYS.kelas, jadwal.kelasId);
  const mapel = dbGetById(DB_KEYS.mapel, jadwal.mapelId);

  document.getElementById("konfirmasiInfo").innerHTML = `
    <i class="fas fa-circle-info"></i>
    <div>
      <strong>${mapel?.nama || "—"}</strong> —
      ${kelas?.nama || "—"}<br/>
      <span style="font-size:var(--text-xs)">
        Jam ${jadwal.jamKe.join(", ")} •
        ${formatRentangJam(jadwal.jamKe)}
      </span>
    </div>
  `;

  // Reset kamera
  resetKameraUI();
  document.getElementById("konfirmasiError").classList.add("hidden");
  document.getElementById("btnSimpanKonfirmasi").disabled = true;

  openModal("modalKonfirmasi");
}

function resetKameraUI() {
  document.getElementById("videoElement").style.display = "block";
  document.getElementById("fotoResult").style.display = "none";
  document.getElementById("kameraPlaceholder").style.display = "flex";
  document.getElementById("btnAktifkanKamera").classList.remove("hidden");
  document.getElementById("btnAmbilFoto").classList.add("hidden");
  document.getElementById("btnRetake").classList.add("hidden");
  document.getElementById("btnSimpanKonfirmasi").disabled = true;
  fotoDataUrl = null;
}

async function aktifkanKamera() {
  try {
    streamKamera = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 },
      audio: false,
    });

    const video = document.getElementById("videoElement");
    video.srcObject = streamKamera;

    // Sembunyikan placeholder
    document.getElementById("kameraPlaceholder").style.display = "none";
    document.getElementById("btnAktifkanKamera").classList.add("hidden");
    document.getElementById("btnAmbilFoto").classList.remove("hidden");

    showToast("Kamera aktif! Siap mengambil foto.", "info");
  } catch (err) {
    // Jika kamera tidak tersedia, konfirmasi tetap bisa tanpa foto
    showToast(
      "Kamera tidak tersedia. Konfirmasi akan dilakukan tanpa foto.",
      "warning",
      4000,
    );
    document.getElementById("kameraPlaceholder").innerHTML = `
      <i class="fas fa-camera-slash"
        style="font-size:48px;opacity:0.5;color:white"></i>
      <p style="font-size:var(--text-sm);opacity:0.7;color:white">
        Kamera tidak tersedia
      </p>
    `;
    document.getElementById("btnAktifkanKamera").classList.add("hidden");
    // Aktifkan tombol simpan meski tanpa foto
    document.getElementById("btnSimpanKonfirmasi").disabled = false;
  }
}

function ambilFoto() {
  const video = document.getElementById("videoElement");
  const canvas = document.getElementById("canvasElement");
  const result = document.getElementById("fotoResult");

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");
  // Mirror horizontal agar tidak terbalik
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  fotoDataUrl = canvas.toDataURL("image/jpeg", 0.7);

  // Tampilkan preview foto
  result.src = fotoDataUrl;
  result.style.display = "block";
  video.style.display = "none";

  // Update tombol
  document.getElementById("btnAmbilFoto").classList.add("hidden");
  document.getElementById("btnRetake").classList.remove("hidden");
  document.getElementById("btnSimpanKonfirmasi").disabled = false;

  // Hentikan kamera
  hentikanKamera();
  showToast("Foto berhasil diambil!", "success");
}

function retakeFoto() {
  fotoDataUrl = null;
  document.getElementById("fotoResult").style.display = "none";
  document.getElementById("videoElement").style.display = "block";
  document.getElementById("btnRetake").classList.add("hidden");
  document.getElementById("btnAmbilFoto").classList.remove("hidden");
  document.getElementById("btnAktifkanKamera").classList.remove("hidden");
  document.getElementById("btnSimpanKonfirmasi").disabled = true;

  // Sembunyikan placeholder lagi
  document.getElementById("kameraPlaceholder").style.display = "none";
  aktifkanKamera();
}

function hentikanKamera() {
  if (streamKamera) {
    streamKamera.getTracks().forEach((track) => track.stop());
    streamKamera = null;
  }
}

function batalKonfirmasi() {
  hentikanKamera();
  closeModal("modalKonfirmasi");
}

function simpanKonfirmasi() {
  // Cek ulang jam masih aktif saat tombol simpan ditekan
  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalKonfirmId);
  const jamAktif = getJamAktifSekarang();

  if (!jadwal.jamKe.some((ke) => jamAktif.includes(ke))) {
    document.getElementById("konfirmasiError").innerHTML =
      `<i class="fas fa-circle-exclamation"></i>
       Jam pelajaran sudah berakhir saat Anda mencoba menyimpan.
       Konfirmasi ditolak.`;
    document.getElementById("konfirmasiError").classList.remove("hidden");
    return;
  }

  const sudahKonfirmasi = getKonfirmasiHariIni(jadwalKonfirmId);
  if (sudahKonfirmasi) {
    hentikanKamera();
    closeModal("modalKonfirmasi");
    showToast("Jadwal ini sudah dikonfirmasi sebelumnya.", "info", 4000);
    renderJadwalAktif();
    return;
  }

  const now = new Date();
  const waktu = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Simpan konfirmasi
  dbInsert(DB_KEYS.konfirmasi, {
    id: generateId("knf"),
    jadwalId: jadwalKonfirmId,
    guruId: currentSession.id,
    tanggal: getTodayStr(),
    waktuKonfirmasi: waktu,
    foto: fotoDataUrl || null,
    createdAt: now.toISOString(),
  });

  hentikanKamera();
  closeModal("modalKonfirmasi");

  showToast(`Kehadiran terkonfirmasi pukul ${waktu}! ✅`, "success", 4000);

  // Refresh tampilan
  renderJadwalAktif();
}

// ── PAGE: RIWAYAT ─────────────────────────────────────────

function renderRiwayat() {
  const dari = document.getElementById("riwayatDari").value;
  const sampai = document.getElementById("riwayatSampai").value;

  let data = dbGetAll(DB_KEYS.konfirmasi).filter(
    (k) => k.guruId === currentSession.id,
  );

  if (dari) data = data.filter((k) => k.tanggal >= dari);
  if (sampai) data = data.filter((k) => k.tanggal <= sampai);

  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  document.getElementById("riwayatTableBody").innerHTML = data.length
    ? data
        .map((k) => {
          const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
          const kelas = dbGetById(DB_KEYS.kelas, j?.kelasId);
          const mapel = dbGetById(DB_KEYS.mapel, j?.mapelId);
          return `
          <tr>
            <td style="white-space:nowrap;font-size:var(--text-sm)">
              ${formatTanggal(k.tanggal)}
            </td>
            <td>${j?.hari || "—"}</td>
            <td>
              <span class="badge badge-guru">
                Jam ${j?.jamKe?.join(", ") || "—"}
              </span>
            </td>
            <td style="font-size:var(--text-xs);white-space:nowrap">
              ${j ? formatRentangJam(j.jamKe) : "—"}
            </td>
            <td><strong>${kelas?.nama || "—"}</strong></td>
            <td>${mapel?.nama || "—"}</td>
            <td>
              <span class="badge badge-info">
                <i class="fas fa-clock"></i>
                ${k.waktuKonfirmasi || "—"}
              </span>
            </td>
            <td>
              ${
                k.foto
                  ? `<img src="${k.foto}"
                    style="width:36px;height:36px;border-radius:50%;
                    object-fit:cover;cursor:pointer;
                    border:2px solid var(--success)"
                    onclick="lihatFotoGuru('${k.id}')"
                    title="Klik untuk memperbesar"/>`
                  : `<span class="badge badge-gray">
                    <i class="fas fa-image-slash"></i> Tanpa foto
                   </span>`
              }
            </td>
          </tr>
        `;
        })
        .join("")
    : `<tr><td colspan="8" style="text-align:center;
        color:var(--gray-400);padding:32px">
        Belum ada riwayat konfirmasi.
       </td></tr>`;
}

function clearRiwayatFilter() {
  document.getElementById("riwayatDari").value = "";
  document.getElementById("riwayatSampai").value = "";
  renderRiwayat();
}

// ── Lihat Foto ────────────────────────────────────────────

function lihatFotoGuru(konfId) {
  const k = dbGetById(DB_KEYS.konfirmasi, konfId);
  const j = dbGetById(DB_KEYS.jadwal, k?.jadwalId);
  const kelas = dbGetById(DB_KEYS.kelas, j?.kelasId);
  const mapel = dbGetById(DB_KEYS.mapel, j?.mapelId);

  document.getElementById("lihatFotoImg").src = k?.foto || "";
  document.getElementById("lihatFotoInfo").innerHTML = `
    <strong>${mapel?.nama || "—"}</strong> —
    ${kelas?.nama || "—"}<br/>
    ${formatTanggal(k?.tanggal)} •
    Pukul ${k?.waktuKonfirmasi || "—"}
  `;
  openModal("modalLihatFoto");
}

// ── Helper: Jam Berikutnya ────────────────────────────────

function getJamBerikutnya() {
  const jamSekarang = getJamSekarang();
  const jams = dbGetAll(DB_KEYS.jamPelajaran)
    .filter((j) => j.tipe === "pelajaran")
    .sort((a, b) => a.mulai.localeCompare(b.mulai));

  return jams.find((j) => j.mulai > jamSekarang) || null;
}

// ── CSS Animasi Pulse (inject) ────────────────────────────

const styleEl = document.createElement("style");
styleEl.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.3); }
  }
`;
document.head.appendChild(styleEl);
