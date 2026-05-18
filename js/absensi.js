// ============================================
// js/absensi.js — Rekap Absensi Siswa
// ============================================

// ── Render Halaman Rekap Absensi ──────────────────────────

function renderRekapAbsensi() {
  const bulan = document.getElementById("filterAbsensiBulan").value;
  const kelasId = document.getElementById("filterAbsensiKelas").value;
  const status = document.getElementById("filterAbsensiStatus").value;
  const sortBy = document.getElementById("sortAbsensi")?.value || "total";

  if (!bulan) {
    document.getElementById("rekapAbsensiBody").innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)">
          <i class="fas fa-calendar-days" style="font-size:48px;margin-bottom:12px;opacity:0.5"></i>
          <p>Pilih bulan untuk melihat rekap absensi</p>
        </td>
      </tr>
    `;
    document.getElementById("statsAbsensi").innerHTML = "";
    document.getElementById("waliKelasInfoAbsensi").innerHTML = "";
    return;
  }

  // Parse bulan dan tahun
  const [tahun, bulanNum] = bulan.split("-").map(Number);
  const dariTanggal = `${tahun}-${String(bulanNum).padStart(2, "0")}-01`;
  const sampaiTanggal = new Date(tahun, bulanNum, 0).toISOString().split("T")[0];

  // Ambil semua jurnal dalam rentang bulan
  const jurnalList = dbGetAll(DB_KEYS.jurnal).filter((j) => {
    const tanggal = j.tanggal;
    return tanggal >= dariTanggal && tanggal <= sampaiTanggal;
  });

  // Ambil semua siswa
  let siswaList = dbGetAll(DB_KEYS.siswa).filter((s) => s.aktif);

  // Filter berdasarkan kelas jika dipilih
  if (kelasId) {
    siswaList = siswaList.filter((s) => s.kelasId === kelasId);
  }

  // Tampilkan info wali kelas jika ada filter kelas
  const waliKelasInfoEl = document.getElementById("waliKelasInfoAbsensi");
  if (kelasId) {
    const kelas = dbGetById(DB_KEYS.kelas, kelasId);
    const waliKelas = kelas?.waliKelasId ? dbGetById(DB_KEYS.users, kelas.waliKelasId) : null;
    
    if (waliKelas) {
      waliKelasInfoEl.innerHTML = `
        <div class="alert alert-info" style="margin-bottom: 16px">
          <i class="fas fa-chalkboard-user"></i>
          <span>
            <strong>Wali Kelas ${kelas.nama}:</strong> ${waliKelas.nama}
          </span>
        </div>
      `;
    } else {
      waliKelasInfoEl.innerHTML = `
        <div class="alert alert-warning" style="margin-bottom: 16px">
          <i class="fas fa-circle-exclamation"></i>
          <span>
            Kelas <strong>${kelas?.nama || '—'}</strong> belum memiliki wali kelas.
          </span>
        </div>
      `;
    }
  } else {
    waliKelasInfoEl.innerHTML = '';
  }

  // Hitung absensi per siswa
  const rekapData = siswaList.map((siswa) => {
    const kelas = dbGetById(DB_KEYS.kelas, siswa.kelasId);
    
    // Hitung ketidakhadiran dari jurnal
    let sakit = 0;
    let izin = 0;
    let alpha = 0;

    jurnalList.forEach((jurnal) => {
      // Cek apakah jurnal untuk kelas siswa ini
      if (jurnal.kelasId !== siswa.kelasId) return;

      // Parse absensi dari jurnal
      const absensi = jurnal.absensi || {};
      
      // Cek apakah siswa tidak hadir
      if (absensi.sakit && Array.isArray(absensi.sakit)) {
        if (absensi.sakit.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
          sakit++;
        }
      }
      
      if (absensi.izin && Array.isArray(absensi.izin)) {
        if (absensi.izin.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
          izin++;
        }
      }
      
      if (absensi.alpha && Array.isArray(absensi.alpha)) {
        if (absensi.alpha.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
          alpha++;
        }
      }
    });

    const total = sakit + izin + alpha;

    return {
      siswa,
      kelas,
      sakit,
      izin,
      alpha,
      total,
    };
  });

  // Filter berdasarkan status jika dipilih
  let filteredData = rekapData;
  if (status) {
    filteredData = rekapData.filter((r) => r[status] > 0);
  }

  // Sort berdasarkan pilihan
  switch (sortBy) {
    case "nama":
      filteredData.sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));
      break;
    case "nis":
      filteredData.sort((a, b) => a.siswa.nis.localeCompare(b.siswa.nis));
      break;
    case "kelas":
      filteredData.sort((a, b) => {
        const kelasA = a.kelas?.nama || "";
        const kelasB = b.kelas?.nama || "";
        return kelasA.localeCompare(kelasB);
      });
      break;
    case "total":
      filteredData.sort((a, b) => b.total - a.total);
      break;
    case "sakit":
      filteredData.sort((a, b) => b.sakit - a.sakit);
      break;
    case "izin":
      filteredData.sort((a, b) => b.izin - a.izin);
      break;
    case "alpha":
      filteredData.sort((a, b) => b.alpha - a.alpha);
      break;
    default:
      filteredData.sort((a, b) => b.total - a.total);
  }

  // Render statistik
  renderStatsAbsensi(rekapData, bulan);

  // Render tabel
  const tbody = document.getElementById("rekapAbsensiBody");
  
  if (filteredData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)">
          <i class="fas fa-circle-check" style="font-size:48px;margin-bottom:12px;opacity:0.5;color:var(--success)"></i>
          <p>Tidak ada data ketidakhadiran siswa</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredData
    .map(
      (r, i) => {
        const genderBadge =
          r.siswa.gender === "L"
            ? '<span class="badge" style="background:#DBEAFE;color:#1E40AF"><i class="fas fa-mars"></i> L</span>'
            : r.siswa.gender === "P"
              ? '<span class="badge" style="background:#FCE7F3;color:#BE185D"><i class="fas fa-venus"></i> P</span>'
              : '<span class="badge badge-danger">—</span>';

        return `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div style="font-weight:600;color:var(--gray-800)">${r.siswa.nama}</div>
        </td>
        <td><code style="font-size:var(--text-xs)">${r.siswa.nis}</code></td>
        <td>${genderBadge}</td>
        <td><span class="badge badge-admin">${r.kelas?.nama || "—"}</span></td>
        <td>
          ${
            r.sakit > 0
              ? `<span class="badge badge-warning">${r.sakit}x</span>`
              : `<span style="color:var(--gray-300)">—</span>`
          }
        </td>
        <td>
          ${
            r.izin > 0
              ? `<span class="badge badge-info">${r.izin}x</span>`
              : `<span style="color:var(--gray-300)">—</span>`
          }
        </td>
        <td>
          ${
            r.alpha > 0
              ? `<span class="badge badge-danger">${r.alpha}x</span>`
              : `<span style="color:var(--gray-300)">—</span>`
          }
        </td>
        <td>
          <strong style="color:${r.total > 5 ? "var(--danger)" : r.total > 3 ? "var(--warning)" : "var(--gray-600)"}">
            ${r.total}x
          </strong>
        </td>
        <td>
          <button 
            class="btn btn-sm btn-outline" 
            onclick="lihatDetailAbsensi('${r.siswa.id}', '${bulan}')"
            title="Lihat detail">
            <i class="fas fa-eye"></i>
          </button>
          <button 
            class="btn btn-sm btn-danger" 
            onclick="hapusDataSiswa('${r.siswa.id}')"
            title="Hapus siswa">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
      }
    )
    .join("");
}

function renderStatsAbsensi(rekapData, bulan) {
  const totalSiswa = rekapData.length;
  const siswaHadir = rekapData.filter((r) => r.total === 0).length;
  const siswaTidakHadir = totalSiswa - siswaHadir;
  
  const totalSakit = rekapData.reduce((sum, r) => sum + r.sakit, 0);
  const totalIzin = rekapData.reduce((sum, r) => sum + r.izin, 0);
  const totalAlpha = rekapData.reduce((sum, r) => sum + r.alpha, 0);
  const totalKetidakhadiran = totalSakit + totalIzin + totalAlpha;

  // Format bulan
  const [tahun, bulanNum] = bulan.split("-");
  const namaBulan = new Date(tahun, bulanNum - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  document.getElementById("statsAbsensi").innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#EEF2FF;color:#4F46E5">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Total Siswa</div>
        <div class="stat-value">${totalSiswa}</div>
        <div class="stat-desc">${namaBulan}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#ECFDF5;color:#059669">
        <i class="fas fa-circle-check"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Siswa Hadir Penuh</div>
        <div class="stat-value">${siswaHadir}</div>
        <div class="stat-desc">${totalSiswa > 0 ? Math.round((siswaHadir / totalSiswa) * 100) : 0}% dari total</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#FEF3C7;color:#D97706">
        <i class="fas fa-user-clock"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Siswa Tidak Hadir</div>
        <div class="stat-value">${siswaTidakHadir}</div>
        <div class="stat-desc">Minimal 1x tidak hadir</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#FEE2E2;color:#DC2626">
        <i class="fas fa-clipboard-user"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">Total Ketidakhadiran</div>
        <div class="stat-value">${totalKetidakhadiran}</div>
        <div class="stat-desc">
          <span class="badge badge-warning" style="font-size:10px;padding:2px 6px">S: ${totalSakit}</span>
          <span class="badge badge-info" style="font-size:10px;padding:2px 6px">I: ${totalIzin}</span>
          <span class="badge badge-danger" style="font-size:10px;padding:2px 6px">A: ${totalAlpha}</span>
        </div>
      </div>
    </div>
  `;
}

// ── Detail Absensi Siswa ──────────────────────────────────

function lihatDetailAbsensi(siswaId, bulan) {
  const siswa = dbGetById(DB_KEYS.siswa, siswaId);
  if (!siswa) return;

  const kelas = dbGetById(DB_KEYS.kelas, siswa.kelasId);

  // Parse bulan
  const [tahun, bulanNum] = bulan.split("-").map(Number);
  const dariTanggal = `${tahun}-${String(bulanNum).padStart(2, "0")}-01`;
  const sampaiTanggal = new Date(tahun, bulanNum, 0).toISOString().split("T")[0];

  // Ambil jurnal kelas siswa dalam bulan tersebut
  const jurnalList = dbGetAll(DB_KEYS.jurnal)
    .filter((j) => {
      return (
        j.kelasId === siswa.kelasId &&
        j.tanggal >= dariTanggal &&
        j.tanggal <= sampaiTanggal
      );
    })
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  // Cari ketidakhadiran siswa
  const ketidakhadiran = [];
  jurnalList.forEach((jurnal) => {
    const absensi = jurnal.absensi || {};
    let statusAbsen = null;

    if (absensi.sakit && Array.isArray(absensi.sakit)) {
      if (absensi.sakit.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
        statusAbsen = "sakit";
      }
    }

    if (absensi.izin && Array.isArray(absensi.izin)) {
      if (absensi.izin.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
        statusAbsen = "izin";
      }
    }

    if (absensi.alpha && Array.isArray(absensi.alpha)) {
      if (absensi.alpha.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
        statusAbsen = "alpha";
      }
    }

    if (statusAbsen) {
      const mapel = dbGetById(DB_KEYS.mapel, jurnal.mapelId);
      ketidakhadiran.push({
        tanggal: jurnal.tanggal,
        mapel: mapel?.nama || "—",
        jamKe: jurnal.jamKe,
        status: statusAbsen,
        keterangan: jurnal.keterangan || "—",
      });
    }
  });

  // Format bulan
  const namaBulan = new Date(tahun, bulanNum - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Hitung total per status
  const totalSakit = ketidakhadiran.filter((k) => k.status === "sakit").length;
  const totalIzin = ketidakhadiran.filter((k) => k.status === "izin").length;
  const totalAlpha = ketidakhadiran.filter((k) => k.status === "alpha").length;

  document.getElementById("modalDetailAbsensiTitle").textContent = 
    `Detail Absensi - ${siswa.nama}`;

  document.getElementById("detailAbsensiContent").innerHTML = `
    <!-- Info Siswa -->
    <div style="background:var(--gray-50);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <div style="font-size:var(--text-xs);color:var(--gray-400);margin-bottom:4px">Nama Siswa</div>
          <div style="font-weight:600;color:var(--gray-800)">${siswa.nama}</div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--gray-400);margin-bottom:4px">NIS</div>
          <div style="font-weight:600;color:var(--gray-800)">${siswa.nis}</div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--gray-400);margin-bottom:4px">Kelas</div>
          <div><span class="badge badge-admin">${kelas?.nama || "—"}</span></div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--gray-400);margin-bottom:4px">Periode</div>
          <div style="font-weight:600;color:var(--gray-800)">${namaBulan}</div>
        </div>
      </div>
    </div>

    <!-- Statistik -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      <div style="background:#FEF3C7;border-radius:var(--radius-md);padding:16px;text-align:center">
        <div style="font-size:var(--text-xs);color:#92400E;margin-bottom:4px">Sakit</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:#D97706">${totalSakit}</div>
      </div>
      <div style="background:#DBEAFE;border-radius:var(--radius-md);padding:16px;text-align:center">
        <div style="font-size:var(--text-xs);color:#1E40AF;margin-bottom:4px">Izin</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:#2563EB">${totalIzin}</div>
      </div>
      <div style="background:#FEE2E2;border-radius:var(--radius-md);padding:16px;text-align:center">
        <div style="font-size:var(--text-xs);color:#991B1B;margin-bottom:4px">Alpha</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:#DC2626">${totalAlpha}</div>
      </div>
      <div style="background:#EEF2FF;border-radius:var(--radius-md);padding:16px;text-align:center">
        <div style="font-size:var(--text-xs);color:#3730A3;margin-bottom:4px">Total</div>
        <div style="font-size:var(--text-2xl);font-weight:700;color:#4F46E5">${ketidakhadiran.length}</div>
      </div>
    </div>

    <!-- Riwayat Ketidakhadiran -->
    <div>
      <h4 style="font-size:var(--text-base);font-weight:600;color:var(--gray-800);margin-bottom:12px">
        <i class="fas fa-list"></i> Riwayat Ketidakhadiran
      </h4>
      ${
        ketidakhadiran.length === 0
          ? `<div style="text-align:center;padding:32px;color:var(--gray-400)">
              <i class="fas fa-circle-check" style="font-size:48px;margin-bottom:12px;opacity:0.5;color:var(--success)"></i>
              <p>Tidak ada ketidakhadiran di bulan ini</p>
            </div>`
          : `<div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Mata Pelajaran</th>
                    <th>Jam</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${ketidakhadiran
                    .map(
                      (k) => `
                    <tr>
                      <td>${formatTanggal(k.tanggal)}</td>
                      <td>${k.mapel}</td>
                      <td><span class="badge badge-gray">Jam ${k.jamKe}</span></td>
                      <td>
                        ${
                          k.status === "sakit"
                            ? '<span class="badge badge-warning">Sakit</span>'
                            : k.status === "izin"
                              ? '<span class="badge badge-info">Izin</span>'
                              : '<span class="badge badge-danger">Alpha</span>'
                        }
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
      }
    </div>
  `;

  openModal("modalDetailAbsensi");
}

// ── Filter & Export ───────────────────────────────────────

function clearFilterAbsensi() {
  const now = new Date();
  const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  
  document.getElementById("filterAbsensiBulan").value = bulanIni;
  document.getElementById("filterAbsensiKelas").value = "";
  document.getElementById("filterAbsensiStatus").value = "";
  document.getElementById("sortAbsensi").value = "total";
  renderRekapAbsensi();
}

async function exportRekapAbsensi(format) {
  const bulan = document.getElementById("filterAbsensiBulan").value;
  
  if (!bulan) {
    showToast("Pilih bulan terlebih dahulu", "warning");
    return;
  }

  // Parse bulan
  const [tahun, bulanNum] = bulan.split("-").map(Number);
  const dariTanggal = `${tahun}-${String(bulanNum).padStart(2, "0")}-01`;
  const sampaiTanggal = new Date(tahun, bulanNum, 0).toISOString().split("T")[0];
  const namaBulan = new Date(tahun, bulanNum - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Ambil data rekap
  const kelasId = document.getElementById("filterAbsensiKelas").value;
  let siswaList = dbGetAll(DB_KEYS.siswa).filter((s) => s.aktif);
  
  if (kelasId) {
    siswaList = siswaList.filter((s) => s.kelasId === kelasId);
  }

  const jurnalList = dbGetAll(DB_KEYS.jurnal).filter((j) => {
    return j.tanggal >= dariTanggal && j.tanggal <= sampaiTanggal;
  });

  const rekapData = siswaList.map((siswa) => {
    const kelas = dbGetById(DB_KEYS.kelas, siswa.kelasId);
    
    let sakit = 0;
    let izin = 0;
    let alpha = 0;

    jurnalList.forEach((jurnal) => {
      if (jurnal.kelasId !== siswa.kelasId) return;
      const absensi = jurnal.absensi || {};
      
      if (absensi.sakit && Array.isArray(absensi.sakit)) {
        if (absensi.sakit.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
          sakit++;
        }
      }
      
      if (absensi.izin && Array.isArray(absensi.izin)) {
        if (absensi.izin.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
          izin++;
        }
      }
      
      if (absensi.alpha && Array.isArray(absensi.alpha)) {
        if (absensi.alpha.some(s => s.nis === siswa.nis || s.nama === siswa.nama)) {
          alpha++;
        }
      }
    });

    return {
      nis: siswa.nis,
      nama: siswa.nama,
      gender: siswa.gender === "L" ? "Laki-laki" : siswa.gender === "P" ? "Perempuan" : "—",
      kelas: kelas?.nama || "—",
      sakit,
      izin,
      alpha,
      total: sakit + izin + alpha,
    };
  });

  // Sort berdasarkan total
  rekapData.sort((a, b) => b.total - a.total);

  if (rekapData.length === 0) {
    showToast("Tidak ada data untuk diexport.", "warning");
    return;
  }

  // Prepare data untuk export
  const namaKelas = kelasId
    ? dbGetById(DB_KEYS.kelas, kelasId)?.nama
    : "Semua Kelas";

  // Ambil info wali kelas jika export per-kelas
  let waliKelasInfo = null;
  if (kelasId) {
    const kelas = dbGetById(DB_KEYS.kelas, kelasId);
    const waliKelas = kelas?.waliKelasId ? dbGetById(DB_KEYS.users, kelas.waliKelasId) : null;
    waliKelasInfo = waliKelas?.nama || null;
  }

  // Build filter dengan wali kelas (jika ada)
  let filter = `Periode: ${namaBulan} | Kelas: ${namaKelas}`;
  if (waliKelasInfo) {
    filter += ` | Wali Kelas: ${waliKelasInfo}`;
  }

  const headers = [
    "No",
    "NIS",
    "Nama Siswa",
    "Gender",
    "Kelas",
    "Sakit",
    "Izin",
    "Alpha",
    "Total Tidak Hadir",
  ];

  const rows = rekapData.map((r, i) => [
    i + 1,
    r.nis,
    r.nama,
    r.gender,
    r.kelas,
    r.sakit,
    r.izin,
    r.alpha,
    r.total,
  ]);

  const title = `REKAP ABSENSI SISWA — ${namaBulan.toUpperCase()}`;
  const filename = `Rekap_Absensi_${namaBulan.replace(/ /g, "_")}`;

  try {
    if (format === "xlsx") {
      exportXLSX({
        filename,
        sheetName: "Rekap Absensi",
        title,
        filter,
        headers,
        rows,
      });
    } else if (format === "pdf") {
      await exportPDF({
        filename,
        title,
        orientation: "portrait",
        filter,
        headers,
        rows,
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    showToast("Terjadi kesalahan saat export: " + error.message, "error");
  }
}

// ── Inisialisasi Filter ───────────────────────────────────

function initFilterAbsensi() {
  // Set bulan default ke bulan ini
  const now = new Date();
  const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  document.getElementById("filterAbsensiBulan").value = bulanIni;

  // Populate filter kelas
  const kelasList = dbGetAll(DB_KEYS.kelas).filter((k) => k.aktif);
  const filterKelas = document.getElementById("filterAbsensiKelas");
  
  filterKelas.innerHTML = '<option value="">Semua Kelas</option>';
  kelasList.forEach((k) => {
    const opt = document.createElement("option");
    opt.value = k.id;
    opt.textContent = k.nama;
    filterKelas.appendChild(opt);
  });
}

// ── Hapus Data Siswa ──────────────────────────────────────

let siswaYangAkanDihapus = null;

function hapusDataSiswa(siswaId) {
  const siswa = dbGetById(DB_KEYS.siswa, siswaId);
  
  if (!siswa) {
    showToast("Data siswa tidak ditemukan", "error");
    return;
  }

  // Simpan data siswa untuk proses hapus
  siswaYangAkanDihapus = siswa;

  // Isi data ke modal
  document.getElementById("hapusSiswaNama").textContent = siswa.nama;
  document.getElementById("hapusSiswaNis").textContent = siswa.nis;
  document.getElementById("hapusSiswaKelas").textContent = 
    dbGetById(DB_KEYS.kelas, siswa.kelasId)?.nama || "—";

  // Reset input konfirmasi
  document.getElementById("konfirmasiHapusInput").value = "";
  document.getElementById("btnKonfirmasiHapus").disabled = true;

  // Setup event listener untuk input konfirmasi
  const input = document.getElementById("konfirmasiHapusInput");
  input.oninput = function() {
    document.getElementById("btnKonfirmasiHapus").disabled = 
      this.value !== "HAPUS";
  };

  // Buka modal
  openModal("modalKonfirmasiHapusSiswa");
}

function eksekusiHapusSiswa() {
  if (!siswaYangAkanDihapus) {
    showToast("Data siswa tidak ditemukan", "error");
    return;
  }

  const siswa = siswaYangAkanDihapus;

  try {
    // 1. Hapus data absensi siswa dari semua jurnal
    const allJurnal = dbGetAll(DB_KEYS.jurnal);
    let jurnalDiubah = 0;
    
    allJurnal.forEach(jurnal => {
      let updated = false;
      
      if (jurnal.absensi) {
        // Hapus dari sakit
        if (jurnal.absensi.sakit && Array.isArray(jurnal.absensi.sakit)) {
          const before = jurnal.absensi.sakit.length;
          jurnal.absensi.sakit = jurnal.absensi.sakit.filter(
            s => s.nis !== siswa.nis && s.nama !== siswa.nama
          );
          if (jurnal.absensi.sakit.length !== before) {
            updated = true;
            jurnal.jumlahSakit = jurnal.absensi.sakit.length;
          }
        }
        
        // Hapus dari izin
        if (jurnal.absensi.izin && Array.isArray(jurnal.absensi.izin)) {
          const before = jurnal.absensi.izin.length;
          jurnal.absensi.izin = jurnal.absensi.izin.filter(
            s => s.nis !== siswa.nis && s.nama !== siswa.nama
          );
          if (jurnal.absensi.izin.length !== before) {
            updated = true;
            jurnal.jumlahIzin = jurnal.absensi.izin.length;
          }
        }
        
        // Hapus dari alpha
        if (jurnal.absensi.alpha && Array.isArray(jurnal.absensi.alpha)) {
          const before = jurnal.absensi.alpha.length;
          jurnal.absensi.alpha = jurnal.absensi.alpha.filter(
            s => s.nis !== siswa.nis && s.nama !== siswa.nama
          );
          if (jurnal.absensi.alpha.length !== before) {
            updated = true;
            jurnal.jumlahAlpha = jurnal.absensi.alpha.length;
          }
        }
        
        // Recalculate jumlahHadir
        if (updated) {
          const kelas = dbGetById(DB_KEYS.kelas, jurnal.kelasId);
          if (kelas) {
            jurnal.jumlahHadir = kelas.jumlahSiswa - 
              (jurnal.jumlahSakit + jurnal.jumlahIzin + jurnal.jumlahAlpha);
          }
          
          dbUpdate(DB_KEYS.jurnal, jurnal.id, jurnal);
          jurnalDiubah++;
        }
      }
    });

    // 2. Hapus akun user siswa (jika ada)
    const userSiswa = dbGetAll(DB_KEYS.users).find(
      u => u.role === 'siswa' && u.username === siswa.nis
    );
    
    if (userSiswa) {
      dbDelete(DB_KEYS.users, userSiswa.id);
    }

    // 3. Hapus data siswa dari master
    dbDelete(DB_KEYS.siswa, siswa.id);

    // 4. Update jumlah siswa di kelas
    const kelas = dbGetById(DB_KEYS.kelas, siswa.kelasId);
    if (kelas) {
      const siswaAktif = dbGetAll(DB_KEYS.siswa).filter(
        s => s.kelasId === kelas.id && s.aktif
      );
      kelas.jumlahSiswa = siswaAktif.length;
      dbUpdate(DB_KEYS.kelas, kelas.id, kelas);
    }

    // Tutup modal konfirmasi
    closeModal("modalKonfirmasiHapusSiswa");

    // Tampilkan hasil
    document.getElementById("hasilHapusContent").innerHTML = `
      <div style="text-align: center; padding: 20px">
        <div style="font-size: 64px; color: var(--success); margin-bottom: 16px">
          <i class="fas fa-circle-check"></i>
        </div>
        <h3 style="color: var(--gray-800); margin-bottom: 8px">Data Berhasil Dihapus!</h3>
        <p style="color: var(--gray-600); margin-bottom: 20px">Berikut ringkasan penghapusan:</p>
      </div>
      <div style="background: var(--gray-50); padding: 16px; border-radius: var(--radius-md)">
        <div style="display: grid; gap: 10px; font-size: var(--text-sm)">
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-user" style="color: var(--primary)"></i> Nama Siswa:</span>
            <strong>${siswa.nama}</strong>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-id-card" style="color: var(--primary)"></i> NIS:</span>
            <strong>${siswa.nis}</strong>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-chalkboard" style="color: var(--primary)"></i> Kelas:</span>
            <strong>${kelas?.nama || "—"}</strong>
          </div>
          <hr style="margin: 8px 0; border-color: var(--gray-200)">
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-file-lines" style="color: var(--success)"></i> Jurnal Diupdate:</span>
            <strong style="color: var(--success)">${jurnalDiubah} jurnal</strong>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span><i class="fas fa-user-xmark" style="color: var(--success)"></i> Akun User:</span>
            <strong style="color: var(--success)">${userSiswa ? 'Dihapus' : 'Tidak ada'}</strong>
          </div>
        </div>
      </div>
    `;

    openModal("modalHasilHapus");

    // Refresh tampilan
    renderRekapAbsensi();
    siswaYangAkanDihapus = null;
    
  } catch (error) {
    console.error("Error hapus data siswa:", error);
    closeModal("modalKonfirmasiHapusSiswa");
    showToast("Gagal menghapus data siswa: " + error.message, "error");
  }
}
