// ============================================
// js/dashboard-siswa.js — Dashboard Siswa
// ============================================

let currentSession = null;

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  currentSession = requireAuth("siswa");
  if (!currentSession) return;

  // Info user di sidebar
  document.getElementById("sidebarName").textContent = currentSession.nama;
  document.getElementById("sidebarAvatar").textContent = currentSession.nama
    .charAt(0)
    .toUpperCase();

  const jabatanLabel =
    currentSession.jabatan === "ketua"
      ? "Ketua Kelas"
      : currentSession.jabatan === "sekretaris"
        ? "Sekretaris"
        : "Siswa";
  document.getElementById("sidebarJabatan").textContent = jabatanLabel;

  const kelas = dbGetById(DB_KEYS.kelas, currentSession.kelasId);
  document.getElementById("sidebarKelas").textContent = kelas?.nama || "—";

  // Tanggal topbar
  document.getElementById("topbarDate").textContent =
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Default halaman
  showPage("beranda");

  // Auto-refresh setiap 60 detik untuk update kondisi fallback
  setInterval(() => {
    const activePage = document.querySelector('[id^="page-"]:not(.hidden)');
    if (activePage?.id === "page-jurnal-hari-ini") renderJurnalHariIni();
    else if (activePage?.id === "page-beranda") renderBeranda();
  }, 60000);
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
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.remove("hidden");

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

// ── PAGE: BERANDA ─────────────────────────────────────────

function renderBeranda() {
  const kelas = dbGetById(DB_KEYS.kelas, currentSession.kelasId);
  const hariIni = getHariIni();
  const today = getTodayStr();

  // Greeting
  const jam = new Date().getHours();
  let salam = "Selamat Datang";
  if (jam < 12) salam = "Selamat Pagi";
  else if (jam < 15) salam = "Selamat Siang";
  else if (jam < 18) salam = "Selamat Sore";
  else salam = "Selamat Malam";

  document.getElementById("siswaGreeting").textContent =
    `${salam}, ${currentSession.nama} 👋`;
  document.getElementById("siswaSubtitle").textContent =
    `${kelas?.nama || "—"} • ${formatTanggal(today)}`;

  // Stats
  renderBerandaStats(kelas);

  // Jadwal hari ini
  renderDashJadwalKelas(kelas);

  // Jurnal hari ini
  renderDashJurnalHariIni(kelas);
}

function renderBerandaStats(kelas) {
  const container = document.getElementById("siswaStatsGrid");
  const today = getTodayStr();
  const hariIni = getHariIni();
  const periode = getPeriodeAktif();

  // Hitung jadwal hari ini
  const jadwalHariIni = periode
    ? dbGetAll(DB_KEYS.jadwal).filter(
        (j) =>
          j.periodeId === periode.id &&
          j.kelasId === currentSession.kelasId &&
          j.hari === hariIni &&
          j.aktif === true,
      )
    : [];

  // Hitung jurnal hari ini
  const jurnalHariIni = dbGetAll(DB_KEYS.jurnal).filter(
    (j) =>
      j.kelasId === currentSession.kelasId &&
      j.tanggal === today,
  );

  // Total jurnal minggu ini
  const seninIni = getSeninMingguIni();
  const jurnalMingguIni = dbGetAll(DB_KEYS.jurnal).filter(
    (j) =>
      j.kelasId === currentSession.kelasId &&
      j.tanggal >= seninIni,
  );

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#EEF2FF;color:#4F46E5">
        <i class="fas fa-calendar-day"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Jadwal Hari Ini</div>
        <div class="stat-value">${jadwalHariIni.length}</div>
        <div class="stat-desc">Mata pelajaran</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#ECFDF5;color:#059669">
        <i class="fas fa-file-pen"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Jurnal Hari Ini</div>
        <div class="stat-value">${jurnalHariIni.length}</div>
        <div class="stat-desc">Sudah diisi</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#FEF3C7;color:#D97706">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Total Siswa</div>
        <div class="stat-value">${kelas?.jumlahSiswa || 0}</div>
        <div class="stat-desc">Di kelas ${kelas?.nama || "—"}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#DBEAFE;color:#1E40AF">
        <i class="fas fa-clock-rotate-left"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Jurnal Minggu Ini</div>
        <div class="stat-value">${jurnalMingguIni.length}</div>
        <div class="stat-desc">Sejak Senin</div>
      </div>
    </div>
  `;
}

function renderDashJadwalKelas(kelas) {
  const container = document.getElementById("dashJadwalKelas");
  const hariIni = getHariIni();
  const periode = getPeriodeAktif();

  if (!periode) {
    container.innerHTML = `<p style="color:var(--gray-400);text-align:center;padding:16px">Tidak ada periode aktif.</p>`;
    return;
  }

  const jadwal = dbGetAll(DB_KEYS.jadwal)
    .filter(
      (j) =>
        j.periodeId === periode.id &&
        j.kelasId === currentSession.kelasId &&
        j.hari === hariIni &&
        j.aktif === true,
    )
    .sort((a, b) => Math.min(...a.jamKe) - Math.min(...b.jamKe));

  if (jadwal.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--gray-400)">
        <i class="fas fa-calendar-xmark" style="font-size:32px;margin-bottom:8px;opacity:0.5"></i>
        <p>Tidak ada jadwal kelas hari ${hariIni}.</p>
      </div>`;
    return;
  }

  const jams = dbGetAll(DB_KEYS.jamPelajaran);

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px">
      ${jadwal
        .map((j) => {
          const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
          const guru = dbGetById(DB_KEYS.users, j.guruId);
          const rentang = formatRentangJam(j.jamKe);
          return `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;
              background:var(--gray-50);border-radius:var(--radius-sm);
              border-left:3px solid var(--color-siswa, #059669)">
              <div style="min-width:48px;text-align:center">
                <span class="badge badge-siswa" style="font-size:11px">
                  Jam ${j.jamKe.join(",")}
                </span>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:var(--text-sm);color:var(--gray-800)">
                  ${mapel?.nama || "—"}
                </div>
                <div style="font-size:var(--text-xs);color:var(--gray-500)">
                  ${guru?.nama || "—"} • ${rentang}
                </div>
              </div>
            </div>`;
        })
        .join("")}
    </div>`;
}

function renderDashJurnalHariIni(kelas) {
  const container = document.getElementById("dashJurnalHariIni");
  const today = getTodayStr();

  const jurnalList = dbGetAll(DB_KEYS.jurnal)
    .filter(
      (j) =>
        j.kelasId === currentSession.kelasId &&
        j.tanggal === today,
    )
    .sort((a, b) => a.jamKe - b.jamKe);

  if (jurnalList.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--gray-400)">
        <i class="fas fa-file-circle-plus" style="font-size:32px;margin-bottom:8px;opacity:0.5"></i>
        <p>Belum ada jurnal yang diisi hari ini.</p>
        <button class="btn btn-sm btn-siswa" style="margin-top:8px"
          onclick="showPage('jurnal-hari-ini')">
          <i class="fas fa-file-pen"></i> Isi Jurnal Sekarang
        </button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px">
      ${jurnalList
        .map((j) => {
          const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
          const guru = dbGetById(DB_KEYS.users, j.guruId);
          const badgeTanpaGuru = j.tanpaKonfirmasiGuru
            ? `<span style="display:inline-block;margin-left:6px;padding:1px 6px;background:#FEF3C7;
                color:#92400E;border-radius:3px;font-size:9px;font-weight:600;vertical-align:middle">
                <i class="fas fa-triangle-exclamation" style="font-size:8px"></i> Tanpa Guru
              </span>` : "";
          return `
            <div style="padding:10px 12px;background:var(--gray-50);
              border-radius:var(--radius-sm);border-left:3px solid var(--success)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-weight:600;font-size:var(--text-sm);color:var(--gray-800)">
                  ${mapel?.nama || "—"} ${badgeTanpaGuru}
                </span>
                <span class="badge badge-gray" style="font-size:10px">Jam ${j.jamKe}</span>
              </div>
              <div style="font-size:var(--text-xs);color:var(--gray-500);margin-bottom:4px">
                ${guru?.nama || "—"}
              </div>
              <div style="font-size:var(--text-xs);color:var(--gray-600)">
                ${j.materi ? j.materi.substring(0, 60) + (j.materi.length > 60 ? "..." : "") : "<i>Belum ada materi</i>"}
              </div>
              <div style="display:flex;gap:8px;margin-top:6px;font-size:var(--text-xs)">
                <span style="color:var(--success)">
                  <i class="fas fa-user-check"></i> ${j.jumlahHadir || 0}
                </span>
                ${(j.jumlahSakit || 0) > 0 ? `<span style="color:var(--danger)"><i class="fas fa-circle-xmark"></i> ${j.jumlahSakit}</span>` : ""}
                ${(j.jumlahIzin || 0) > 0 ? `<span style="color:var(--warning)"><i class="fas fa-circle-minus"></i> ${j.jumlahIzin}</span>` : ""}
                ${(j.jumlahAlpha || 0) > 0 ? `<span style="color:var(--gray-400)"><i class="fas fa-circle-question"></i> ${j.jumlahAlpha}</span>` : ""}
              </div>
            </div>`;
        })
        .join("")}
    </div>`;
}

// ── PAGE: JURNAL HARI INI ─────────────────────────────────

function renderJurnalHariIni() {
  const kelas = dbGetById(DB_KEYS.kelas, currentSession.kelasId);
  const hariIni = getHariIni();
  const today = getTodayStr();
  const periode = getPeriodeAktif();

  // Info kelas
  document.getElementById("infoKelasText").textContent =
    `${kelas?.nama || "—"} • ${hariIni}, ${formatTanggal(today)} • ${kelas?.jumlahSiswa || 0} siswa`;

  const container = document.getElementById("jurnalSesiContainer");

  if (!periode) {
    container.innerHTML = `
      <div class="card"><div class="card-body">
        <div class="empty-state">
          <i class="fas fa-circle-exclamation"></i>
          <p>Tidak ada periode aktif.</p>
        </div>
      </div></div>`;
    return;
  }

  // Cek hari libur
  const libur = cekHariIniLibur();
  if (libur) {
    container.innerHTML = `
      <div class="card"><div class="card-body">
        <div class="empty-state">
          <i class="fas fa-umbrella-beach" style="font-size:48px;color:var(--warning);margin-bottom:12px"></i>
          <h3>Hari Libur</h3>
          <p style="color:var(--gray-500)">${libur.nama}</p>
          <p style="font-size:var(--text-xs);color:var(--gray-400);margin-top:8px">
            Tidak ada kegiatan belajar mengajar hari ini.
          </p>
        </div>
      </div></div>`;
    return;
  }

  // Ambil jadwal kelas hari ini
  const jadwalList = dbGetAll(DB_KEYS.jadwal)
    .filter(
      (j) =>
        j.periodeId === periode.id &&
        j.kelasId === currentSession.kelasId &&
        j.hari === hariIni &&
        j.aktif === true,
    )
    .sort((a, b) => Math.min(...a.jamKe) - Math.min(...b.jamKe));

  if (jadwalList.length === 0) {
    container.innerHTML = `
      <div class="card"><div class="card-body">
        <div class="empty-state">
          <i class="fas fa-calendar-xmark" style="font-size:48px;color:var(--gray-300);margin-bottom:12px"></i>
          <p>Tidak ada jadwal kelas hari ${hariIni}.</p>
        </div>
      </div></div>`;
    return;
  }

  // Ambil semua jurnal hari ini untuk kelas ini
  const jurnalHariIni = dbGetAll(DB_KEYS.jurnal).filter(
    (j) =>
      j.kelasId === currentSession.kelasId &&
      j.tanggal === today,
  );

  container.innerHTML = jadwalList
    .map((jadwal) => {
      const mapel = dbGetById(DB_KEYS.mapel, jadwal.mapelId);
      const guru = dbGetById(DB_KEYS.users, jadwal.guruId);
      const rentang = formatRentangJam(jadwal.jamKe);

      // Cari jurnal untuk setiap jam
      const jurnalPerJam = jadwal.jamKe.map((ke) =>
        jurnalHariIni.find((j) => j.jamKe === ke),
      );

      return `
        <div class="card mb-4">
          <div class="card-header">
            <div>
              <span class="card-title">
                <i class="fas fa-book-open"></i>
                ${mapel?.nama || "—"}
              </span>
              <div style="font-size:var(--text-xs);color:var(--gray-500);margin-top:4px">
                ${guru?.nama || "—"} • Jam ${jadwal.jamKe.join(", ")} • ${rentang}
              </div>
            </div>
          </div>
          <div class="card-body">
            ${jadwal.jamKe
              .map((ke, idx) => {
                const jurnal = jurnalPerJam[idx];
                const jamInfo = getInfoJam(ke);
                const terlewat = isJadwalTerlewat([ke]);

                if (jurnal) {
                  // Sudah diisi
                  const badgeTanpaGuru = jurnal.tanpaKonfirmasiGuru
                    ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;background:#FEF3C7;
                        color:#92400E;border-radius:4px;font-size:10px;font-weight:600">
                        <i class="fas fa-triangle-exclamation"></i> Tanpa Konfirmasi Guru
                      </span>` : "";

                  return `
                    <div style="padding:12px;background:#ECFDF5;border-radius:var(--radius-sm);
                      border:1px solid #A7F3D0;margin-bottom:${idx < jadwal.jamKe.length - 1 ? "8px" : "0"}">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <span style="font-weight:600;font-size:var(--text-sm);color:#065F46">
                          <i class="fas fa-circle-check"></i> Jam ke-${ke}
                          ${jamInfo ? `(${jamInfo.mulai}–${jamInfo.selesai})` : ""}
                          ${badgeTanpaGuru}
                        </span>
                        <div style="display:flex;gap:4px">
                          <button class="btn btn-sm btn-outline" onclick="editJurnal('${jurnal.id}')"
                            title="Edit" style="padding:4px 8px">
                            <i class="fas fa-pen" style="font-size:11px"></i>
                          </button>
                          <button class="btn btn-sm btn-danger" onclick="hapusJurnal('${jurnal.id}')"
                            title="Hapus" style="padding:4px 8px">
                            <i class="fas fa-trash" style="font-size:11px"></i>
                          </button>
                        </div>
                      </div>
                      <div style="font-size:var(--text-sm);color:#047857;margin-bottom:4px">
                        <strong>Materi:</strong> ${jurnal.materi || "—"}
                      </div>
                      <div style="display:flex;gap:12px;font-size:var(--text-xs);color:#065F46">
                        <span><i class="fas fa-user-check"></i> Hadir: ${jurnal.jumlahHadir || 0}</span>
                        ${(jurnal.jumlahSakit || 0) > 0 ? `<span><i class="fas fa-circle-xmark"></i> Sakit: ${jurnal.jumlahSakit}</span>` : ""}
                        ${(jurnal.jumlahIzin || 0) > 0 ? `<span><i class="fas fa-circle-minus"></i> Izin: ${jurnal.jumlahIzin}</span>` : ""}
                        ${(jurnal.jumlahAlpha || 0) > 0 ? `<span><i class="fas fa-circle-question"></i> Alpha: ${jurnal.jumlahAlpha}</span>` : ""}
                      </div>
                      ${jurnal.keterangan ? `<div style="font-size:var(--text-xs);color:var(--gray-500);margin-top:4px"><i class="fas fa-comment"></i> ${jurnal.keterangan}</div>` : ""}
                    </div>`;
                } else {
                  // Belum diisi — cek kondisi
                  const guruSudahKonfirmasi = dbGetAll(DB_KEYS.konfirmasi).some(
                    (k) => k.jadwalId === jadwal.id && k.tanggal === today,
                  );
                  // Cek status guru: jika izin → fallback langsung aktif
                  const statusGuruPengajar = guru ? getStatusGuru(guru.id, today) : null;
                  const guruIzin = statusGuruPengajar === "izin";
                  const bolehFallback = guruIzin || isBolehIsiTanpaGuru(jadwal.jamKe, jadwal.id);

                  if (guruSudahKonfirmasi) {
                    // Guru sudah konfirmasi → boleh isi normal
                    return `
                      <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius-sm);
                        border:1px dashed var(--gray-300);margin-bottom:${idx < jadwal.jamKe.length - 1 ? "8px" : "0"};
                        display:flex;justify-content:space-between;align-items:center">
                        <div>
                          <span style="font-weight:600;font-size:var(--text-sm);color:var(--gray-600)">
                            <i class="fas fa-circle" style="color:var(--gray-300)"></i> Jam ke-${ke}
                            ${jamInfo ? `(${jamInfo.mulai}–${jamInfo.selesai})` : ""}
                          </span>
                          <span style="font-size:var(--text-xs);color:var(--gray-400);margin-left:8px">
                            • Belum diisi
                          </span>
                        </div>
                        <button class="btn btn-sm btn-siswa" onclick="bukaFormJurnal('${jadwal.id}', ${ke}, false)">
                          <i class="fas fa-file-pen"></i> Isi Jurnal
                        </button>
                      </div>`;
                  } else if (bolehFallback) {
                    // Waktu fallback aktif → boleh isi dengan peringatan
                    const alasanFallback = guruIzin
                      ? `Guru <strong>${guru?.nama || "—"}</strong> berstatus <strong>Izin/Sakit</strong> hari ini.`
                      : `Guru <strong>${guru?.nama || "—"}</strong> belum konfirmasi kehadiran (30 menit terakhir).`;
                    return `
                      <div style="padding:12px;background:#FEF3C7;border-radius:var(--radius-sm);
                        border:1px dashed #F59E0B;margin-bottom:${idx < jadwal.jamKe.length - 1 ? "8px" : "0"}">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                          <div>
                            <span style="font-weight:600;font-size:var(--text-sm);color:#92400E">
                              <i class="fas fa-circle" style="color:#F59E0B"></i> Jam ke-${ke}
                              ${jamInfo ? `(${jamInfo.mulai}–${jamInfo.selesai})` : ""}
                            </span>
                            <span style="font-size:var(--text-xs);color:#B45309;margin-left:8px">
                              • ${guruIzin ? "Guru Izin" : "Guru belum konfirmasi"}
                            </span>
                          </div>
                          <button class="btn btn-sm" style="background:#F59E0B;color:white"
                            onclick="bukaFormJurnal('${jadwal.id}', ${ke}, true)">
                            <i class="fas fa-file-pen"></i> Isi Jurnal (Fallback)
                          </button>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;
                          background:#FFFBEB;border-radius:4px;font-size:var(--text-xs);color:#92400E">
                          <i class="fas fa-triangle-exclamation"></i>
                          <span>${alasanFallback}
                            Kamu bisa mengisi jurnal sebagai ketua kelas/sekretaris.
                            Entri ini akan ditandai <em>"Tanpa Konfirmasi Guru"</em>.
                          </span>
                        </div>
                      </div>`;
                  } else {
                    // Belum waktunya → tampilkan pesan menunggu
                    const guruDinasLuar = statusGuruPengajar === "dinas_luar";
                    // Hitung estimasi waktu fallback
                    const jamAkhir = jadwal.jamKe.reduce((a, b) => Math.max(a, b), 0);
                    const infoAkhir = dbGetAll(DB_KEYS.jamPelajaran).find((j) => j.ke === jamAkhir && j.tipe === "pelajaran");
                    let estimasiFallback = "";
                    if (infoAkhir) {
                      const [ah, am] = infoAkhir.selesai.split(":").map(Number);
                      const menitFallback = (ah * 60 + am) - 30;
                      const jamF = Math.floor(menitFallback / 60);
                      const menitF = menitFallback % 60;
                      estimasiFallback = `pukul ${String(jamF).padStart(2,"0")}:${String(menitF).padStart(2,"0")}`;
                    }

                    return `
                      <div style="padding:12px;background:var(--gray-50);border-radius:var(--radius-sm);
                        border:1px dashed var(--gray-300);margin-bottom:${idx < jadwal.jamKe.length - 1 ? "8px" : "0"};
                        display:flex;justify-content:space-between;align-items:center">
                        <div>
                          <span style="font-weight:600;font-size:var(--text-sm);color:var(--gray-600)">
                            <i class="fas fa-circle" style="color:var(--gray-300)"></i> Jam ke-${ke}
                            ${jamInfo ? `(${jamInfo.mulai}–${jamInfo.selesai})` : ""}
                          </span>
                          <span style="font-size:var(--text-xs);color:var(--gray-400);margin-left:8px">
                            • ${guruDinasLuar ? "Guru sedang dinas luar" : "Menunggu konfirmasi guru"}
                          </span>
                        </div>
                        <div style="text-align:right">
                          <span style="font-size:var(--text-xs);color:var(--gray-400)">
                            <i class="fas fa-lock" style="margin-right:4px"></i>
                            ${terlewat ? "Terlewat" : estimasiFallback ? `Fallback ${estimasiFallback}` : "Menunggu guru"}
                          </span>
                        </div>
                      </div>`;
                  }
                }
              })
              .join("")}
          </div>
        </div>`;
    })
    .join("");
}

// ── Form Jurnal ───────────────────────────────────────────

let editJurnalId = null;
let isModeFallback = false;

function bukaFormJurnal(jadwalId, jamKe, tanpaGuru = false) {
  editJurnalId = null;
  isModeFallback = tanpaGuru;

  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalId);
  const kelas = dbGetById(DB_KEYS.kelas, jadwal.kelasId);
  const mapel = dbGetById(DB_KEYS.mapel, jadwal.mapelId);
  const guru = dbGetById(DB_KEYS.users, jadwal.guruId);
  const jamInfo = getInfoJam(jamKe);

  document.getElementById("modalJurnalTitle").textContent = "Isi Jurnal";
  document.getElementById("jurnalId").value = "";
  document.getElementById("jurnalJadwalId").value = jadwalId;
  document.getElementById("jurnalJamKe").value = jamKe;

  // Info sesi
  document.getElementById("jurnalSesiInfo").innerHTML = `
    <div style="font-size:var(--text-sm)">
      <strong>${mapel?.nama || "—"}</strong> — ${guru?.nama || "—"}<br/>
      <span style="color:var(--gray-500)">
        ${kelas?.nama || "—"} • Jam ke-${jamKe}
        ${jamInfo ? `(${jamInfo.mulai}–${jamInfo.selesai})` : ""}
        • ${formatTanggal(getTodayStr())}
      </span>
    </div>
    ${tanpaGuru ? `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;
      background:#FEF3C7;border:1px solid #F59E0B;border-radius:var(--radius-md);
      margin-top:10px">
      <i class="fas fa-triangle-exclamation" style="color:#D97706;font-size:16px;flex-shrink:0"></i>
      <div style="font-size:var(--text-xs);color:#92400E">
        <strong>Mode Fallback:</strong> Guru belum konfirmasi kehadiran.
        Jurnal ini akan ditandai <em>"Tanpa Konfirmasi Guru"</em> untuk ditinjau admin.
      </div>
    </div>` : ""}`;

  // Total siswa
  document.getElementById("totalSiswaKelas").textContent =
    kelas?.jumlahSiswa || 0;
  document.getElementById("totalSiswaRingkas").textContent =
    kelas?.jumlahSiswa || 0;

  // Reset form
  document.getElementById("formJurnalMateri").value = "";
  document.getElementById("formJurnalSakit").value = "0";
  document.getElementById("formJurnalIzin").value = "0";
  document.getElementById("formJurnalAlpha").value = "0";
  document.getElementById("formJurnalKeterangan").value = "";
  document.getElementById("jurnalFormError").classList.add("hidden");

  // Reset list siswa tidak hadir
  document.getElementById("listSiswaSakit").innerHTML = "";
  document.getElementById("listSiswaIzin").innerHTML = "";
  document.getElementById("listSiswaAlpha").innerHTML = "";

  // Populate dropdown siswa
  populateDropdownSiswa("formJurnalSiswaSakit");
  populateDropdownSiswa("formJurnalSiswaIzin");
  populateDropdownSiswa("formJurnalSiswaAlpha");

  // Update ringkasan
  updateRingkasanKehadiran();

  openModal("modalJurnal");
}

function editJurnal(jurnalId) {
  const jurnal = dbGetById(DB_KEYS.jurnal, jurnalId);
  if (!jurnal) return;

  editJurnalId = jurnalId;

  const jadwal = dbGetById(DB_KEYS.jadwal, jurnal.jadwalId);
  const kelas = dbGetById(DB_KEYS.kelas, jurnal.kelasId);
  const mapel = dbGetById(DB_KEYS.mapel, jurnal.mapelId);
  const guru = dbGetById(DB_KEYS.users, jurnal.guruId);
  const jamInfo = getInfoJam(jurnal.jamKe);

  document.getElementById("modalJurnalTitle").textContent = "Edit Jurnal";
  document.getElementById("jurnalId").value = jurnalId;
  document.getElementById("jurnalJadwalId").value = jurnal.jadwalId || "";
  document.getElementById("jurnalJamKe").value = jurnal.jamKe;

  document.getElementById("jurnalSesiInfo").innerHTML = `
    <div style="font-size:var(--text-sm)">
      <strong>${mapel?.nama || "—"}</strong> — ${guru?.nama || "—"}<br/>
      <span style="color:var(--gray-500)">
        ${kelas?.nama || "—"} • Jam ke-${jurnal.jamKe}
        ${jamInfo ? `(${jamInfo.mulai}–${jamInfo.selesai})` : ""}
        • ${formatTanggal(jurnal.tanggal)}
      </span>
    </div>`;

  document.getElementById("totalSiswaKelas").textContent =
    kelas?.jumlahSiswa || 0;
  document.getElementById("totalSiswaRingkas").textContent =
    kelas?.jumlahSiswa || 0;

  document.getElementById("formJurnalMateri").value = jurnal.materi || "";
  document.getElementById("formJurnalKeterangan").value =
    jurnal.keterangan || "";
  document.getElementById("jurnalFormError").classList.add("hidden");

  // Reset list
  document.getElementById("listSiswaSakit").innerHTML = "";
  document.getElementById("listSiswaIzin").innerHTML = "";
  document.getElementById("listSiswaAlpha").innerHTML = "";

  // Populate dropdown
  populateDropdownSiswa("formJurnalSiswaSakit");
  populateDropdownSiswa("formJurnalSiswaIzin");
  populateDropdownSiswa("formJurnalSiswaAlpha");

  // Load existing absensi
  if (jurnal.absensi) {
    if (jurnal.absensi.sakit) {
      jurnal.absensi.sakit.forEach((s) =>
        tambahSiswaTidakHadirFromData("sakit", s),
      );
    }
    if (jurnal.absensi.izin) {
      jurnal.absensi.izin.forEach((s) =>
        tambahSiswaTidakHadirFromData("izin", s),
      );
    }
    if (jurnal.absensi.alpha) {
      jurnal.absensi.alpha.forEach((s) =>
        tambahSiswaTidakHadirFromData("alpha", s),
      );
    }
  }

  document.getElementById("formJurnalSakit").value = jurnal.jumlahSakit || 0;
  document.getElementById("formJurnalIzin").value = jurnal.jumlahIzin || 0;
  document.getElementById("formJurnalAlpha").value = jurnal.jumlahAlpha || 0;

  updateRingkasanKehadiran();
  openModal("modalJurnal");
}

function populateDropdownSiswa(selectId) {
  const select = document.getElementById(selectId);
  const siswaList = dbGetAll(DB_KEYS.siswa).filter(
    (s) => s.kelasId === currentSession.kelasId && s.aktif,
  );

  const labelMap = {
    formJurnalSiswaSakit: "Sakit",
    formJurnalSiswaIzin: "Izin",
    formJurnalSiswaAlpha: "Alpha",
  };
  const label = labelMap[selectId] || "";

  select.innerHTML = `<option value="">-- Pilih Siswa ${label} --</option>` +
    siswaList
      .map((s) => `<option value="${s.nis}">${s.nama}</option>`)
      .join("");
}

function tambahSiswaTidakHadir(status) {
  const selectId = {
    sakit: "formJurnalSiswaSakit",
    izin: "formJurnalSiswaIzin",
    alpha: "formJurnalSiswaAlpha",
  }[status];

  const select = document.getElementById(selectId);
  const selectedOption = select.options[select.selectedIndex];

  if (!select.value) {
    showToast("Pilih siswa terlebih dahulu!", "warning");
    return;
  }

  const nis = select.value;
  const nama = selectedOption.textContent;

  // Cek duplikat
  const listEl = document.getElementById(
    {
      sakit: "listSiswaSakit",
      izin: "listSiswaIzin",
      alpha: "listSiswaAlpha",
    }[status],
  );
  if (listEl.querySelector(`[data-nis="${nis}"]`)) {
    showToast("Siswa sudah ditambahkan!", "warning");
    return;
  }

  tambahSiswaTidakHadirFromData(status, { nis, nama });

  // Reset dropdown
  select.value = "";
}

function tambahSiswaTidakHadirFromData(status, siswaData) {
  const listId = {
    sakit: "listSiswaSakit",
    izin: "listSiswaIzin",
    alpha: "listSiswaAlpha",
  }[status];

  const hiddenId = {
    sakit: "formJurnalSakit",
    izin: "formJurnalIzin",
    alpha: "formJurnalAlpha",
  }[status];

  const listEl = document.getElementById(listId);
  const div = document.createElement("div");
  div.setAttribute("data-nis", siswaData.nis);
  div.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:var(--gray-50);border-radius:var(--radius-sm);margin-bottom:4px;font-size:var(--text-sm)";
  div.innerHTML = `
    <span>${siswaData.nama} <code style="font-size:var(--text-xs)">${siswaData.nis}</code></span>
    <button type="button" class="btn btn-sm" style="padding:2px 6px;background:var(--gray-200);color:var(--gray-600)"
      onclick="this.parentElement.remove();updateJumlahFromList('${status}')">
      <i class="fas fa-xmark" style="font-size:10px"></i>
    </button>`;
  listEl.appendChild(div);

  updateJumlahFromList(status);
}

function updateJumlahFromList(status) {
  const listId = {
    sakit: "listSiswaSakit",
    izin: "listSiswaIzin",
    alpha: "listSiswaAlpha",
  }[status];

  const hiddenId = {
    sakit: "formJurnalSakit",
    izin: "formJurnalIzin",
    alpha: "formJurnalAlpha",
  }[status];

  const count = document.getElementById(listId).children.length;
  document.getElementById(hiddenId).value = count;
  updateRingkasanKehadiran();
}

function updateRingkasanKehadiran() {
  const kelas = dbGetById(DB_KEYS.kelas, currentSession.kelasId);
  const total = kelas?.jumlahSiswa || 0;
  const sakit = parseInt(document.getElementById("formJurnalSakit").value) || 0;
  const izin = parseInt(document.getElementById("formJurnalIzin").value) || 0;
  const alpha = parseInt(document.getElementById("formJurnalAlpha").value) || 0;
  const hadir = total - sakit - izin - alpha;

  document.getElementById("ringkasHadir").textContent = Math.max(0, hadir);
  document.getElementById("ringkasSakit").textContent = sakit;
  document.getElementById("ringkasIzin").textContent = izin;
  document.getElementById("ringkasAlpha").textContent = alpha;
}

function simpanJurnal() {
  const jadwalId = document.getElementById("jurnalJadwalId").value;
  const jamKe = parseInt(document.getElementById("jurnalJamKe").value);
  const materi = document.getElementById("formJurnalMateri").value.trim();
  const keterangan = document.getElementById("formJurnalKeterangan").value.trim();
  const jumlahSakit = parseInt(document.getElementById("formJurnalSakit").value) || 0;
  const jumlahIzin = parseInt(document.getElementById("formJurnalIzin").value) || 0;
  const jumlahAlpha = parseInt(document.getElementById("formJurnalAlpha").value) || 0;

  // Validasi
  if (!materi) {
    document.getElementById("jurnalFormError").textContent =
      "Materi yang diajarkan wajib diisi!";
    document.getElementById("jurnalFormError").classList.remove("hidden");
    return;
  }

  const kelas = dbGetById(DB_KEYS.kelas, currentSession.kelasId);
  const totalSiswa = kelas?.jumlahSiswa || 0;
  const jumlahHadir = totalSiswa - jumlahSakit - jumlahIzin - jumlahAlpha;

  if (jumlahHadir < 0) {
    document.getElementById("jurnalFormError").textContent =
      "Jumlah siswa tidak hadir melebihi total siswa!";
    document.getElementById("jurnalFormError").classList.remove("hidden");
    return;
  }

  // Kumpulkan absensi detail
  const absensi = {
    sakit: getAbsensiDetail("listSiswaSakit"),
    izin: getAbsensiDetail("listSiswaIzin"),
    alpha: getAbsensiDetail("listSiswaAlpha"),
  };

  const jadwal = dbGetById(DB_KEYS.jadwal, jadwalId);

  const dataJurnal = {
    jadwalId,
    jamKe,
    tanggal: getTodayStr(),
    kelasId: currentSession.kelasId,
    mapelId: jadwal?.mapelId || "",
    guruId: jadwal?.guruId || "",
    userId: currentSession.id,
    materi,
    keterangan,
    jumlahHadir,
    jumlahSakit,
    jumlahIzin,
    jumlahAlpha,
    absensi,
    tanpaKonfirmasiGuru: isModeFallback,
  };

  if (editJurnalId) {
    dbUpdate(DB_KEYS.jurnal, editJurnalId, dataJurnal);
    showToast("Jurnal berhasil diupdate!", "success");
  } else {
    dataJurnal.id = generateId("jrn");
    dataJurnal.createdAt = new Date().toISOString();
    dbInsert(DB_KEYS.jurnal, dataJurnal);
    showToast("Jurnal berhasil disimpan!", "success");
  }

  closeModal("modalJurnal");
  editJurnalId = null;

  // Refresh halaman yang aktif
  const activePage = document.querySelector('[id^="page-"]:not(.hidden)');
  if (activePage?.id === "page-jurnal-hari-ini") renderJurnalHariIni();
  else if (activePage?.id === "page-beranda") renderBeranda();
}

function getAbsensiDetail(listId) {
  const items = document.getElementById(listId).children;
  return Array.from(items).map((item) => ({
    nis: item.getAttribute("data-nis"),
    nama: item.querySelector("span").textContent.split(" ")[0],
  }));
}

function hapusJurnal(jurnalId) {
  const jurnal = dbGetById(DB_KEYS.jurnal, jurnalId);
  if (!jurnal) return;

  if (!confirm("Hapus jurnal ini?")) return;

  dbDelete(DB_KEYS.jurnal, jurnalId);
  showToast("Jurnal berhasil dihapus!", "success");

  // Refresh
  const activePage = document.querySelector('[id^="page-"]:not(.hidden)');
  if (activePage?.id === "page-jurnal-hari-ini") renderJurnalHariIni();
  else if (activePage?.id === "page-beranda") renderBeranda();
}

// ── PAGE: RIWAYAT JURNAL ──────────────────────────────────

function renderRiwayat() {
  const dari = document.getElementById("riwayatDari").value;
  const sampai = document.getElementById("riwayatSampai").value;

  let data = dbGetAll(DB_KEYS.jurnal).filter(
    (j) => j.kelasId === currentSession.kelasId,
  );

  if (dari) data = data.filter((j) => j.tanggal >= dari);
  if (sampai) data = data.filter((j) => j.tanggal <= sampai);

  data.sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal) || a.jamKe - b.jamKe,
  );

  const tbody = document.getElementById("riwayatTableBody");
  const jams = dbGetAll(DB_KEYS.jamPelajaran);

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:32px;color:var(--gray-400)">
          <i class="fas fa-file-circle-xmark" style="font-size:48px;margin-bottom:12px;opacity:0.5"></i>
          <p>Belum ada riwayat jurnal.</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((j) => {
      const mapel = dbGetById(DB_KEYS.mapel, j.mapelId);
      const guru = dbGetById(DB_KEYS.users, j.guruId);
      const user = dbGetById(DB_KEYS.users, j.userId);
      const jam = jams.find(
        (jp) => jp.ke === j.jamKe && jp.tipe === "pelajaran",
      );
      const badgeTanpaGuru = j.tanpaKonfirmasiGuru
        ? `<span style="display:inline-block;margin-left:4px;padding:1px 5px;background:#FEF3C7;
            color:#92400E;border-radius:3px;font-size:9px;font-weight:600">
            <i class="fas fa-triangle-exclamation" style="font-size:8px"></i>
          </span>` : "";

      return `
        <tr>
          <td style="white-space:nowrap;font-size:var(--text-sm)">
            ${formatTanggal(j.tanggal)}
          </td>
          <td>
            <span class="badge badge-siswa">Jam ${j.jamKe}</span>
            ${badgeTanpaGuru}
          </td>
          <td style="font-size:var(--text-xs);white-space:nowrap">
            ${jam ? `${jam.mulai}–${jam.selesai}` : "—"}
          </td>
          <td>${mapel?.nama || "—"}</td>
          <td>${guru?.nama || "—"}</td>
          <td style="max-width:200px">
            ${j.materi
              ? j.materi.length > 50
                ? j.materi.substring(0, 50) + "..."
                : j.materi
              : "—"}
          </td>
          <td>
            <div style="display:flex;gap:6px;font-size:var(--text-xs)">
              <span style="color:var(--success)">
                <i class="fas fa-user-check"></i> ${j.jumlahHadir || 0}
              </span>
              ${(j.jumlahSakit || 0) > 0 ? `<span style="color:var(--danger)" title="Sakit"><i class="fas fa-circle-xmark"></i> ${j.jumlahSakit}</span>` : ""}
              ${(j.jumlahIzin || 0) > 0 ? `<span style="color:var(--warning)" title="Izin"><i class="fas fa-circle-minus"></i> ${j.jumlahIzin}</span>` : ""}
              ${(j.jumlahAlpha || 0) > 0 ? `<span style="color:var(--gray-400)" title="Alpha"><i class="fas fa-circle-question"></i> ${j.jumlahAlpha}</span>` : ""}
            </div>
          </td>
          <td style="font-size:var(--text-xs)">${user?.nama || "—"}</td>
        </tr>`;
    })
    .join("");
}

function clearRiwayatFilter() {
  document.getElementById("riwayatDari").value = "";
  document.getElementById("riwayatSampai").value = "";
  renderRiwayat();
}

// ── Helper ────────────────────────────────────────────────

function getSeninMingguIni() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const senin = new Date(now);
  senin.setDate(now.getDate() - diff);
  return senin.toISOString().split("T")[0];
}
