// ============================================
// js/export.js — Export PDF & XLSX v3.0
// ============================================

console.log("export.js loaded successfully");

// ── Wrapper Functions untuk onclick (karena async) ────────

function exportRekapAdminWrapper(type, format) {
  exportRekapAdmin(type, format).catch(err => {
    console.error('Export error:', err);
    showToast('Terjadi kesalahan saat export', 'error');
  });
}

function exportDataWrapper(type, format) {
  exportData(type, format).catch(err => {
    console.error('Export error:', err);
    showToast('Terjadi kesalahan saat export', 'error');
  });
}

function exportRiwayatGuruWrapper(format) {
  exportRiwayatGuru(format).catch(err => {
    console.error('Export error:', err);
    showToast('Terjadi kesalahan saat export', 'error');
  });
}

function exportRiwayatSiswaWrapper(format) {
  exportRiwayatSiswa(format).catch(err => {
    console.error('Export error:', err);
    showToast('Terjadi kesalahan saat export', 'error');
  });
}

// ── ADMIN: Export dengan filter yang sedang aktif ─────────

async function exportRekapAdmin(type, format) {
  if (type === "jurnal") {
    const dari = document.getElementById("filterJurnalDari")?.value || "";
    const sampai = document.getElementById("filterJurnalSampai")?.value || "";
    const kelasId = document.getElementById("filterJurnalKelas")?.value || "";

    // Wajib pilih minimal salah satu filter
    if (!dari && !sampai && !kelasId) {
      showToast(
        "Silakan pilih filter (tanggal atau kelas) sebelum export.",
        "warning",
        4000,
      );
      return;
    }

    let data = dbGetAll(DB_KEYS.jurnal);
    if (dari) data = data.filter((j) => j.tanggal >= dari);
    if (sampai) data = data.filter((j) => j.tanggal <= sampai);
    if (kelasId) data = data.filter((j) => j.kelasId === kelasId);
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (data.length === 0) {
      showToast("Tidak ada data untuk diexport.", "warning");
      return;
    }

    const namaKelas = kelasId
      ? dbGetById(DB_KEYS.kelas, kelasId)?.nama
      : "Semua Kelas";

    const filter = [
      dari || sampai ? `Periode: ${dari || "—"} s/d ${sampai || "—"}` : "",
      `Kelas: ${namaKelas}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const headers = [
      "Tanggal",
      "Kelas",
      "Jam",
      "Mapel",
      "Guru",
      "Materi",
      "Hadir",
      "Sakit",
      "Izin",
      "Alpha",
      "Keterangan",
      "Diisi Oleh",
    ];

    const rows = data.map((j) => {
      const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
      const m = dbGetById(DB_KEYS.mapel, j.mapelId);
      const g = dbGetById(DB_KEYS.users, j.guruId);
      const u = dbGetById(DB_KEYS.users, j.userId);
      return [
        formatTanggal(j.tanggal),
        kl?.nama || "—",
        `Jam ke-${j.jamKe}`,
        m?.nama || "—",
        g?.nama || "—",
        j.materi || "—",
        j.jumlahHadir || 0,
        j.jumlahSakit || 0,
        j.jumlahIzin || 0,
        j.jumlahAlpha || 0,
        j.keterangan || "—",
        u?.nama || "—",
      ];
    });

    if (format === "xlsx") {
      exportXLSX({
        filename: `rekap_jurnal_${namaKelas}_${dari || "semua"}`,
        sheetName: "Jurnal Kelas",
        title: `REKAP JURNAL KELAS — ${namaKelas.toUpperCase()}`,
        filter,
        headers,
        rows,
      });
    } else {
      await exportPDF({
        filename: `rekap_jurnal_${namaKelas}_${dari || "semua"}`,
        title: `REKAP JURNAL KELAS — ${namaKelas.toUpperCase()}`,
        orientation: "landscape",
        filter,
        headers,
        rows,
      });
    }
  }

  if (type === "konfirmasi") {
    const dari = document.getElementById("filterKonfDari")?.value || "";
    const sampai = document.getElementById("filterKonfSampai")?.value || "";
    const guruId = document.getElementById("filterKonfGuru")?.value || "";

    // Wajib pilih minimal salah satu filter
    if (!dari && !sampai && !guruId) {
      showToast(
        "Silakan pilih filter (tanggal atau guru) sebelum export.",
        "warning",
        4000,
      );
      return;
    }

    let data = dbGetAll(DB_KEYS.konfirmasi);
    if (dari) data = data.filter((k) => k.tanggal >= dari);
    if (sampai) data = data.filter((k) => k.tanggal <= sampai);
    if (guruId) data = data.filter((k) => k.guruId === guruId);
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (data.length === 0) {
      showToast("Tidak ada data untuk diexport.", "warning");
      return;
    }

    const namaGuru = guruId
      ? dbGetById(DB_KEYS.users, guruId)?.nama
      : "Semua Guru";

    const filter = [
      dari || sampai ? `Periode: ${dari || "—"} s/d ${sampai || "—"}` : "",
      `Guru: ${namaGuru}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const headers = [
      "Tanggal",
      "Guru",
      "Kelas",
      "Mapel",
      "Jam",
      "Waktu Konfirmasi",
      "Ada Foto",
    ];

    const rows = data.map((k) => {
      const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
      const g = dbGetById(DB_KEYS.users, k.guruId);
      const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
      const m = dbGetById(DB_KEYS.mapel, j?.mapelId);
      return [
        formatTanggal(k.tanggal),
        g?.nama || "—",
        kl?.nama || "—",
        m?.nama || "—",
        `Jam ${j?.jamKe?.join(", ") || "—"}`,
        k.waktuKonfirmasi || "—",
        k.foto ? "Ya" : "Tidak",
      ];
    });

    if (format === "xlsx") {
      exportXLSX({
        filename: `rekap_konfirmasi_${namaGuru}_${dari || "semua"}`,
        sheetName: "Konfirmasi Kehadiran",
        title: `REKAP KONFIRMASI — ${namaGuru.toUpperCase()}`,
        filter,
        headers,
        rows,
      });
    } else {
      await exportPDF({
        filename: `rekap_konfirmasi_${namaGuru}_${dari || "semua"}`,
        title: `REKAP KONFIRMASI — ${namaGuru.toUpperCase()}`,
        orientation: "landscape",
        filter,
        headers,
        rows,
      });
    }
  }
}

function getNamaSekolah() {
  const profil = getProfilSekolah();
  return profil.namaSekolah || "SMAN 15 Surabaya";
}

function getTanggalExport() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── ADMIN: Export Jurnal & Konfirmasi ─────────────────────

async function exportData(type, format) {
  // ── JURNAL ──────────────────────────────────────────────
  if (type === "jurnal") {
    const dari = document.getElementById("filterJurnalDari")?.value || "";
    const sampai = document.getElementById("filterJurnalSampai")?.value || "";
    const kelasId = document.getElementById("filterJurnalKelas")?.value || "";

    let data = dbGetAll(DB_KEYS.jurnal);
    if (dari) data = data.filter((j) => j.tanggal >= dari);
    if (sampai) data = data.filter((j) => j.tanggal <= sampai);
    if (kelasId) data = data.filter((j) => j.kelasId === kelasId);
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (data.length === 0) {
      showToast("Tidak ada data untuk diexport.", "warning");
      return;
    }

    const headers = [
      "Tanggal",
      "Kelas",
      "Jam",
      "Mapel",
      "Guru",
      "Materi",
      "Hadir",
      "Sakit",
      "Izin",
      "Alpha",
      "Keterangan",
      "Diisi Oleh",
    ];

    const rows = data.map((j) => {
      const kl = dbGetById(DB_KEYS.kelas, j.kelasId);
      const m = dbGetById(DB_KEYS.mapel, j.mapelId);
      const g = dbGetById(DB_KEYS.users, j.guruId);
      const u = dbGetById(DB_KEYS.users, j.userId);
      return [
        formatTanggal(j.tanggal),
        kl?.nama || "—",
        `Jam ke-${j.jamKe}`,
        m?.nama || "—",
        g?.nama || "—",
        j.materi || "—",
        j.jumlahHadir || 0,
        j.jumlahSakit || 0,
        j.jumlahIzin || 0,
        j.jumlahAlpha || 0,
        j.keterangan || "—",
        u?.nama || "—",
      ];
    });

    const namaKelas = kelasId
      ? dbGetById(DB_KEYS.kelas, kelasId)?.nama
      : "Semua Kelas";

    const filter =
      [
        dari || sampai ? `Periode: ${dari || "—"} s/d ${sampai || "—"}` : "",
        `Kelas: ${namaKelas}`,
      ]
        .filter(Boolean)
        .join(" | ") || "Semua Data";

    if (format === "xlsx") {
      exportXLSX({
        filename: `rekap_jurnal_${dari || "semua"}`,
        sheetName: "Jurnal Kelas",
        title: "REKAP JURNAL KELAS",
        filter,
        headers,
        rows,
      });
    } else {
      await exportPDF({
        filename: `rekap_jurnal_${dari || "semua"}`,
        title: "REKAP JURNAL KELAS",
        orientation: "landscape",
        filter,
        headers,
        rows,
      });
    }
  }

  // ── KONFIRMASI ───────────────────────────────────────────
  if (type === "konfirmasi") {
    const dari = document.getElementById("filterKonfDari")?.value || "";
    const sampai = document.getElementById("filterKonfSampai")?.value || "";
    const guruId = document.getElementById("filterKonfGuru")?.value || "";

    let data = dbGetAll(DB_KEYS.konfirmasi);
    if (dari) data = data.filter((k) => k.tanggal >= dari);
    if (sampai) data = data.filter((k) => k.tanggal <= sampai);
    if (guruId) data = data.filter((k) => k.guruId === guruId);
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (data.length === 0) {
      showToast("Tidak ada data untuk diexport.", "warning");
      return;
    }

    const headers = [
      "Tanggal",
      "Guru",
      "Kelas",
      "Mapel",
      "Jam",
      "Waktu Konfirmasi",
      "Ada Foto",
    ];

    const rows = data.map((k) => {
      const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
      const g = dbGetById(DB_KEYS.users, k.guruId);
      const kl = dbGetById(DB_KEYS.kelas, j?.kelasId);
      const m = dbGetById(DB_KEYS.mapel, j?.mapelId);
      return [
        formatTanggal(k.tanggal),
        g?.nama || "—",
        kl?.nama || "—",
        m?.nama || "—",
        `Jam ${j?.jamKe?.join(", ") || "—"}`,
        k.waktuKonfirmasi || "—",
        k.foto ? "Ya" : "Tidak",
      ];
    });

    const namaGuru = guruId
      ? dbGetById(DB_KEYS.users, guruId)?.nama
      : "Semua Guru";

    const filter =
      [
        dari || sampai ? `Periode: ${dari || "—"} s/d ${sampai || "—"}` : "",
        `Guru: ${namaGuru}`,
      ]
        .filter(Boolean)
        .join(" | ") || "Semua Data";

    if (format === "xlsx") {
      exportXLSX({
        filename: `rekap_konfirmasi_${dari || "semua"}`,
        sheetName: "Konfirmasi Kehadiran",
        title: "REKAP KONFIRMASI KEHADIRAN GURU",
        filter,
        headers,
        rows,
      });
    } else {
      await exportPDF({
        filename: `rekap_konfirmasi_${dari || "semua"}`,
        title: "REKAP KONFIRMASI KEHADIRAN GURU",
        orientation: "landscape",
        filter,
        headers,
        rows,
      });
    }
  }
}

// ── GURU: Export Riwayat ──────────────────────────────────

async function exportRiwayatGuru(format) {
  const session = getSession();
  const dari = document.getElementById("riwayatDari")?.value || "";
  const sampai = document.getElementById("riwayatSampai")?.value || "";

  let data = dbGetAll(DB_KEYS.konfirmasi).filter(
    (k) => k.guruId === session.id,
  );
  if (dari) data = data.filter((k) => k.tanggal >= dari);
  if (sampai) data = data.filter((k) => k.tanggal <= sampai);
  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  if (data.length === 0) {
    showToast("Tidak ada data untuk diexport.", "warning");
    return;
  }

  const headers = [
    "Tanggal",
    "Hari",
    "Jam",
    "Waktu",
    "Kelas",
    "Mapel",
    "Konfirmasi Pukul",
    "Ada Foto",
  ];

  const rows = data.map((k) => {
    const j = dbGetById(DB_KEYS.jadwal, k.jadwalId);
    const kelas = dbGetById(DB_KEYS.kelas, j?.kelasId);
    const mapel = dbGetById(DB_KEYS.mapel, j?.mapelId);
    return [
      formatTanggal(k.tanggal),
      j?.hari || "—",
      `Jam ${j?.jamKe?.join(", ") || "—"}`,
      j ? formatRentangJam(j.jamKe) : "—",
      kelas?.nama || "—",
      mapel?.nama || "—",
      k.waktuKonfirmasi || "—",
      k.foto ? "Ya" : "Tidak",
    ];
  });

  const filter =
    dari || sampai
      ? `Periode: ${dari || "—"} s/d ${sampai || "—"}`
      : "Semua Periode";

  const title = `RIWAYAT KONFIRMASI — ${session.nama.toUpperCase()}`;

  if (format === "xlsx") {
    exportXLSX({
      filename: `riwayat_konfirmasi_${session.username}`,
      sheetName: "Riwayat Konfirmasi",
      title,
      filter,
      headers,
      rows,
    });
  } else {
    await exportPDF({
      filename: `riwayat_konfirmasi_${session.username}`,
      orientation: "landscape",
      title,
      filter,
      headers,
      rows,
    });
  }
}

// ── SISWA: Export Riwayat Jurnal ──────────────────────────

async function exportRiwayatSiswa(format) {
  const session = getSession();
  const dari = document.getElementById("riwayatDari")?.value || "";
  const sampai = document.getElementById("riwayatSampai")?.value || "";
  const kelas = dbGetById(DB_KEYS.kelas, session.kelasId);
  const jams = dbGetAll(DB_KEYS.jamPelajaran);

  let data = dbGetAll(DB_KEYS.jurnal).filter(
    (j) => j.kelasId === session.kelasId,
  );
  if (dari) data = data.filter((j) => j.tanggal >= dari);
  if (sampai) data = data.filter((j) => j.tanggal <= sampai);
  data.sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal) || a.jamKe - b.jamKe,
  );

  if (data.length === 0) {
    showToast("Tidak ada data untuk diexport.", "warning");
    return;
  }

  const headers = [
    "Tanggal",
    "Jam",
    "Waktu",
    "Mapel",
    "Guru",
    "Materi",
    "Hadir",
    "Sakit",
    "Izin",
    "Alpha",
    "Keterangan",
    "Diisi Oleh",
  ];

  const rows = data.map((j) => {
    const m = dbGetById(DB_KEYS.mapel, j.mapelId);
    const g = dbGetById(DB_KEYS.users, j.guruId);
    const u = dbGetById(DB_KEYS.users, j.userId);
    const jam = jams.find((jp) => jp.ke === j.jamKe && jp.tipe === "pelajaran");
    return [
      formatTanggal(j.tanggal),
      `Jam ke-${j.jamKe}`,
      jam ? `${jam.mulai}–${jam.selesai}` : "—",
      m?.nama || "—",
      g?.nama || "—",
      j.materi || "—",
      j.jumlahHadir || 0,
      j.jumlahSakit || 0,
      j.jumlahIzin || 0,
      j.jumlahAlpha || 0,
      j.keterangan || "—",
      u?.nama || "—",
    ];
  });

  const filter =
    dari || sampai
      ? `Periode: ${dari || "—"} s/d ${sampai || "—"}`
      : "Semua Periode";

  const title = `JURNAL KELAS — ${(kelas?.nama || "").toUpperCase()}`;

  if (format === "xlsx") {
    exportXLSX({
      filename: `jurnal_${kelas?.nama || "kelas"}_${dari || "semua"}`,
      sheetName: "Jurnal Kelas",
      title,
      filter,
      headers,
      rows,
    });
  } else {
    await exportPDF({
      filename: `jurnal_${kelas?.nama || "kelas"}_${dari || "semua"}`,
      orientation: "landscape",
      title,
      filter,
      headers,
      rows,
    });
  }
}

// ── Core: XLSX ────────────────────────────────────────────

function exportXLSX({ filename, sheetName, title, filter, headers, rows }) {
  const wb = XLSX.utils.book_new();
  const profil = getProfilSekolah();

  // Header yang lebih elegan dan profesional
  const sheetData = [
    // Baris 1: Nama Sekolah (Bold, Large, Centered)
    [profil.namaSekolah || "SMA NEGERI 15 SURABAYA"],
    // Baris 2: Alamat
    [profil.alamat || ""],
    // Baris 3: Kontak
    [
      [
        profil.telepon ? `☎ ${profil.telepon}` : "",
        profil.email ? `✉ ${profil.email}` : "",
        profil.website ? `🌐 ${profil.website}` : ""
      ]
        .filter(Boolean)
        .join("  •  ") || "",
    ],
    // Baris 4: NPSN & Kepala Sekolah
    [
      [
        profil.npsn ? `NPSN: ${profil.npsn}` : "",
        profil.kepalaSekolah ? `Kepala Sekolah: ${profil.kepalaSekolah}` : ""
      ]
        .filter(Boolean)
        .join("  |  ") || ""
    ],
    [], // Baris kosong
    // Baris 6: Title (Bold, Centered, Colored)
    [title],
    // Baris 7: Filter
    [`📋 ${filter}`],
    // Baris 8: Tanggal Export
    [`📅 Diekspor: ${getTanggalExport()}`],
    [], // Baris kosong
    // Baris 10: Table headers
    headers,
    // Data rows
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Auto lebar kolom dengan padding lebih besar
  ws["!cols"] = headers.map((h, i) => ({
    wch: Math.min(
      Math.max(h.length, ...rows.map((r) => String(r[i] || "").length)) + 6,
      50,
    ),
  }));

  // Merge sel header untuk tampilan yang lebih rapi
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Nama sekolah
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Alamat
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Kontak
    { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }, // NPSN & Kepsek
    { s: { r: 5, c: 0 }, e: { r: 5, c: headers.length - 1 } }, // Title
    { s: { r: 6, c: 0 }, e: { r: 6, c: headers.length - 1 } }, // Filter
    { s: { r: 7, c: 0 }, e: { r: 7, c: headers.length - 1 } }, // Tanggal Export
  ];

  // ═══════════════════════════════════════════════════════
  // STYLING - Elegant & Professional
  // ═══════════════════════════════════════════════════════

  // Style untuk Nama Sekolah (Row 1)
  const schoolNameStyle = {
    font: { bold: true, sz: 16, color: { rgb: "1F2937" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "F3F4F6" } },
    border: {
      bottom: { style: "medium", color: { rgb: "4F46E5" } },
    },
  };

  // Style untuk Alamat & Kontak (Row 2-3)
  const subHeaderStyle = {
    font: { sz: 10, color: { rgb: "6B7280" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "F9FAFB" } },
  };

  // Style untuk NPSN & Kepala Sekolah (Row 4)
  const infoStyle = {
    font: { bold: true, sz: 9, color: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "EEF2FF" } },
  };

  // Style untuk Title (Row 6)
  const titleStyle = {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "4F46E5" } },
    border: {
      top: { style: "medium", color: { rgb: "4338CA" } },
      bottom: { style: "medium", color: { rgb: "4338CA" } },
      left: { style: "medium", color: { rgb: "4338CA" } },
      right: { style: "medium", color: { rgb: "4338CA" } },
    },
  };

  // Style untuk Filter & Export info (Row 7-8)
  const filterStyle = {
    font: { sz: 9, color: { rgb: "374151" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "FFFFFF" } },
    border: {
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
    },
  };

  // Style untuk Table Headers (Row 10)
  const tableHeaderStyle = {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    fill: { fgColor: { rgb: "4F46E5" } },
    border: {
      top: { style: "medium", color: { rgb: "4338CA" } },
      bottom: { style: "medium", color: { rgb: "4338CA" } },
      left: { style: "thin", color: { rgb: "6366F1" } },
      right: { style: "thin", color: { rgb: "6366F1" } },
    },
  };

  // Style untuk Data Cells
  const dataCellStyle = {
    font: { sz: 10, color: { rgb: "1F2937" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } },
    },
  };

  // Apply styles
  if (ws["A1"]) ws["A1"].s = schoolNameStyle;
  if (ws["A2"]) ws["A2"].s = subHeaderStyle;
  if (ws["A3"]) ws["A3"].s = subHeaderStyle;
  if (ws["A4"]) ws["A4"].s = infoStyle;
  if (ws["A6"]) ws["A6"].s = titleStyle;
  if (ws["A7"]) ws["A7"].s = filterStyle;
  if (ws["A8"]) ws["A8"].s = filterStyle;

  // Style table headers (Row 10)
  headers.forEach((_, i) => {
    const cell = XLSX.utils.encode_cell({ r: 9, c: i });
    if (!ws[cell]) ws[cell] = { t: "s", v: "" };
    ws[cell].s = tableHeaderStyle;
  });

  // Style data cells dengan alternating colors
  rows.forEach((row, rowIdx) => {
    const isEven = rowIdx % 2 === 0;
    row.forEach((_, colIdx) => {
      const cell = XLSX.utils.encode_cell({ r: 10 + rowIdx, c: colIdx });
      if (ws[cell]) {
        ws[cell].s = {
          ...dataCellStyle,
          fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F9FAFB" } },
        };
      }
    });
  });

  // Set row heights untuk tampilan yang lebih baik
  ws["!rows"] = [
    { hpt: 32 }, // Row 1 - Nama sekolah (lebih tinggi)
    { hpt: 18 }, // Row 2 - Alamat
    { hpt: 16 }, // Row 3 - Kontak
    { hpt: 16 }, // Row 4 - NPSN & Kepsek
    { hpt: 10 }, // Row 5 - Kosong
    { hpt: 24 }, // Row 6 - Title (lebih tinggi)
    { hpt: 16 }, // Row 7 - Filter
    { hpt: 16 }, // Row 8 - Tanggal
    { hpt: 10 }, // Row 9 - Kosong
    { hpt: 22 }, // Row 10 - Table header (lebih tinggi)
  ];

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
  showToast("File XLSX berhasil didownload!", "success");
}

console.log("exportXLSX function defined");

// ── Helper: Kompresi Gambar untuk PDF ────────────────────

function compressImageForPDF(base64Image, maxWidth, maxHeight, quality = 0.85) {
  try {
    // Jika bukan base64, return as is
    if (!base64Image || !base64Image.startsWith('data:image')) {
      return base64Image;
    }

    // Buat canvas untuk resize dan kompresi
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Konversi ke promise untuk handling async
    return new Promise((resolve) => {
      img.onload = function() {
        // Hitung dimensi baru dengan mempertahankan aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Resize jika lebih besar dari max
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // PENTING: Isi background putih untuk transparansi PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image dengan smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert ke JPEG dengan kompresi (gunakan quality yang diberikan)
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      
      img.onerror = function() {
        // Jika error, return original
        resolve(base64Image);
      };
      
      img.src = base64Image;
    });
  } catch (e) {
    console.error('Error compressing image:', e);
    return base64Image;
  }
}

// ── Helper: Convert Image Path/URL to Base64 ─────────────

async function imageToBase64(imagePath) {
  return new Promise((resolve, reject) => {
    // Jika sudah base64, return langsung
    if (imagePath && imagePath.startsWith('data:image')) {
      resolve(imagePath);
      return;
    }

    // Jika kosong, return null
    if (!imagePath) {
      resolve(null);
      return;
    }

    // Load image dan convert ke base64
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Untuk menghindari CORS issue
    
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      
      // Fill white background untuk transparansi
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      } catch (e) {
        console.error('Error converting to base64:', e);
        resolve(null);
      }
    };
    
    img.onerror = function(e) {
      console.error('Error loading image:', e);
      resolve(null);
    };
    
    img.src = imagePath;
  });
}

// ── Core: PDF ─────────────────────────────────────────────

async function exportPDF({
  filename,
  title,
  filter,
  headers,
  rows,
  orientation = "landscape",
}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  const profil = getProfilSekolah();

  // ═══════════════════════════════════════════════════════
  // HEADER SECTION - Simple & Clean
  // ═══════════════════════════════════════════════════════

  // Logo (jika ada) - dengan kompresi seimbang
  if (profil.logo) {
    try {
      let logoBase64 = profil.logo;
      if (!profil.logo.startsWith('data:image')) {
        logoBase64 = await imageToBase64(profil.logo);
      }
      if (logoBase64) {
        // PENTING: Kompresi logo untuk mengurangi ukuran file PDF
        // Resize ke ukuran lebih besar dengan kualitas tinggi
        const logoSize = 20;
        const compressedLogo = await compressImageForPDF(logoBase64, 160, 160, 0.85);
        doc.addImage(compressedLogo, "JPEG", 14, y, logoSize, logoSize);
      }
    } catch (e) {
      console.error("Logo error:", e);
    }
  }

  // Nama Sekolah
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(profil.namaSekolah || "SMA Negeri 15 Surabaya", pageW / 2, y + 5, { align: "center" });

  // Alamat
  if (profil.alamat) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(profil.alamat, pageW / 2, y + 10, { align: "center" });
  }

  // Kontak
  const kontakParts = [];
  if (profil.telepon) kontakParts.push(`Telp: ${profil.telepon}`);
  if (profil.email) kontakParts.push(`Email: ${profil.email}`);
  
  if (kontakParts.length > 0) {
    doc.setFontSize(8);
    doc.text(kontakParts.join(" | "), pageW / 2, y + 15, { align: "center" });
  }

  y += 22;

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageW / 2, y, { align: "center" });
  y += 7;

  // Filter
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(filter, pageW / 2, y, { align: "center" });
  y += 7;

  // Tanggal Export
  doc.setFontSize(8);
  doc.text(`Diekspor: ${getTanggalExport()}`, pageW / 2, y, { align: "center" });
  y += 8;

  // ═══════════════════════════════════════════════════════
  // TABLE SECTION
  // ═══════════════════════════════════════════════════════

  doc.autoTable({
    startY: y,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      
      // Halaman
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        pageW / 2,
        pageHeight - 10,
        { align: "center" }
      );
      
      // Nama sekolah di footer
      doc.setFontSize(7);
      doc.text(
        profil.namaSekolah || "SMA Negeri 15 Surabaya",
        14,
        pageHeight - 10
      );
      
      // Tanggal di kanan
      doc.text(
        new Date().toLocaleDateString("id-ID"),
        pageW - 14,
        pageHeight - 10,
        { align: "right" }
      );
    },
  });

  doc.save(`${filename}.pdf`);
  showToast("File PDF berhasil didownload!", "success");
}

// ── Rekap Bulanan PDF ──────────────────────────────────────

function openModalRekapBulanan() {
  // Set default ke bulan ini
  const now = new Date();
  const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  document.getElementById("rekapBulananBulan").value = bulan;
  openModal("modalRekapBulanan");
}

async function cetakRekapBulananPDF() {
  const bulanInput = document.getElementById("rekapBulananBulan").value;
  if (!bulanInput) {
    showToast("Pilih bulan terlebih dahulu.", "error");
    return;
  }

  const [tahun, bulan] = bulanInput.split("-").map(Number);
  const namaBulan = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ][bulan];

  // Generate tanggal dalam bulan
  const tglMulai = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
  const lastDay = new Date(tahun, bulan, 0).getDate();
  const tglAkhir = `${tahun}-${String(bulan).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Ambil data
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const semuaJadwal = dbGetAll(DB_KEYS.jadwal);
  const semuaKonfirmasi = dbGetAll(DB_KEYS.konfirmasi);
  const hariLibur = dbGetAll(DB_KEYS.hariLibur).map((h) => h.tanggal);
  const guruMasterList = getGuruMaster();

  // Generate semua tanggal dalam bulan
  const semuaTanggal = [];
  for (let d = 1; d <= lastDay; d++) {
    semuaTanggal.push(`${tahun}-${String(bulan).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  // Hitung hari efektif (exclude minggu & libur)
  const hariEfektif = semuaTanggal.filter((tgl) => {
    const hari = new Date(tgl).getDay();
    return hari !== 0 && !hariLibur.includes(tgl);
  });

  // Build per-guru data
  const guruData = {};
  semuaTanggal.forEach((tanggal) => {
    const hariIdx = new Date(tanggal).getDay();
    const hariNama = HARI[hariIdx];
    if (hariIdx === 0 || hariLibur.includes(tanggal)) return;

    const jadwalHariIni = semuaJadwal.filter((j) => j.hari === hariNama && j.aktif !== false);
    jadwalHariIni.forEach((jadwal) => {
      if (!guruData[jadwal.guruId]) {
        const guru = dbGetById(DB_KEYS.users, jadwal.guruId);
        const gm = guruMasterList.find((g) => g.userId === jadwal.guruId);
        guruData[jadwal.guruId] = {
          nama: guru?.nama || "—",
          nip: gm?.nip || "—",
          totalJadwal: 0,
          sudahKonfirmasi: 0,
          belum: 0,
          izin: 0,
          dinasLuar: 0,
        };
      }

      const statusHarian = getStatusGuru(jadwal.guruId, tanggal);
      const konfirmasi = semuaKonfirmasi.find((k) => k.jadwalId === jadwal.id && k.tanggal === tanggal);

      guruData[jadwal.guruId].totalJadwal++;

      if (statusHarian === "izin") {
        guruData[jadwal.guruId].izin++;
      } else if (statusHarian === "din") {
        guruData[jadwal.guruId].dinasLuar++;
      } else if (konfirmasi) {
        guruData[jadwal.guruId].sudahKonfirmasi++;
      } else {
        guruData[jadwal.guruId].belum++;
      }
    });
  });

  // Convert ke array & hitung persentase
  const rows = Object.values(guruData).map((g, i) => {
    const kehadiran = g.totalJadwal > 0
      ? Math.round(((g.sudahKonfirmasi + g.dinasLuar) / g.totalJadwal) * 100)
      : 0;
    const perluPerhatian = kehadiran < 80 ? "⚠️ Ya" : "";
    return [
      i + 1,
      g.nip,
      g.nama,
      g.totalJadwal,
      g.sudahKonfirmasi,
      g.belum,
      g.izin,
      g.dinasLuar,
      `${kehadiran}%`,
      perluPerhatian,
    ];
  });

  // Hitung total kehadiran
  const totalGuru = rows.length;
  const totalSudah = rows.reduce((s, r) => s + Number(r[4]), 0);
  const totalBelum = rows.reduce((s, r) => s + Number(r[5]), 0);
  const totalIzin = rows.reduce((s, r) => s + Number(r[6]), 0);
  const totalDL = rows.reduce((s, r) => s + Number(r[7]), 0);
  const totalJadwal = rows.reduce((s, r) => s + Number(r[3]), 0);
  const tingkatKehadiran = totalJadwal > 0
    ? Math.round(((totalSudah + totalDL) / totalJadwal) * 100)
    : 0;

  // Generate PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 15;
  const profil = getProfilSekolah();

  // ── Kop Surat ──
  if (profil.logo) {
    try {
      let logoBase64 = profil.logo;
      if (!profil.logo.startsWith("data:image")) logoBase64 = await imageToBase64(profil.logo);
      if (logoBase64) {
        const compressed = await compressImageForPDF(logoBase64, 160, 160, 0.85);
        doc.addImage(compressed, "JPEG", 14, y, 20, 20);
      }
    } catch (e) { console.error(e); }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(profil.namaSekolah || "SMA Negeri 15 Surabaya", pageW / 2, y + 5, { align: "center" });

  if (profil.alamat) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(profil.alamat, pageW / 2, y + 10, { align: "center" });
  }

  const kontak = [];
  if (profil.telepon) kontak.push(`Telp: ${profil.telepon}`);
  if (profil.email) kontak.push(`Email: ${profil.email}`);
  if (kontak.length) {
    doc.setFontSize(8);
    doc.text(kontak.join(" | "), pageW / 2, y + 15, { align: "center" });
  }

  y += 22;
  doc.setLineWidth(0.5);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  // ── Judul ──
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN KEHADIRAN GURU", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(11);
  doc.text(`Bulan ${namaBulan} ${tahun}`, pageW / 2, y, { align: "center" });
  y += 8;

  // ── Ringkasan ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: 1 - ${lastDay} ${namaBulan} ${tahun}`, 14, y);
  doc.text(`Hari Efektif: ${hariEfektif.length} hari`, 14, y + 5);
  doc.text(`Total Guru: ${totalGuru}`, 14, y + 10);
  doc.text(`Tingkat Kehadiran: ${tingkatKehadiran}%`, 14, y + 15);

  doc.text(`Total Jadwal: ${totalJadwal}`, pageW / 2, y);
  doc.text(`Sudah Konfirmasi: ${totalSudah}`, pageW / 2, y + 5);
  doc.text(`Belum Konfirmasi: ${totalBelum}`, pageW / 2, y + 10);

  doc.text(`Izin: ${totalIzin}`, pageW - 80, y);
  doc.text(`Dinas Luar: ${totalDL}`, pageW - 80, y + 5);

  y += 22;

  // ── Tabel ──
  doc.autoTable({
    startY: y,
    head: [["No", "NIP", "Nama Guru", "Total Jadwal", "Sudah", "Belum", "Izin", "Dinas Luar", "% Hadir", "Perhatian"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold", halign: "center", fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 35 },
      2: { cellWidth: 50 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "center", cellWidth: 14 },
      5: { halign: "center", cellWidth: 14 },
      6: { halign: "center", cellWidth: 12 },
      7: { halign: "center", cellWidth: 18 },
      8: { halign: "center", cellWidth: 14 },
      9: { halign: "center", cellWidth: 18 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, pageW / 2, pageH - 10, { align: "center" });
      doc.text(profil.namaSekolah || "SMAN 15 Surabaya", 14, pageH - 10);
    },
  });

  // ── Tanda Tangan (halaman terakhir) ──
  const finalY = doc.lastAutoTable.finalY + 15;

  if (finalY > pageH - 50) {
    doc.addPage();
  }

  const signY = finalY > pageH - 50 ? 20 : finalY;
  const signX = pageW - 80;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Surabaya, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, signX, signY);
  doc.text("Kepala Sekolah,", signX, signY + 5);

  // Tanda tangan image
  if (profil.ttdKepsek) {
    try {
      let ttdBase64 = profil.ttdKepsek;
      if (!ttdBase64.startsWith("data:image")) ttdBase64 = await imageToBase64(ttdBase64);
      if (ttdBase64) {
        doc.addImage(ttdBase64, "PNG", signX + 5, signY + 8, 30, 15);
      }
    } catch (e) { console.error(e); }
  }

  doc.setFont("helvetica", "bold");
  doc.text(profil.kepalaSekolah || "—", signX, signY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // NIP dari guru master jika ada
  const kepsekMaster = guruMasterList.find((g) => {
    const user = dbGetById(DB_KEYS.users, g.userId);
    return user?.nama === profil.kepalaSekolah;
  });
  doc.text(`NIP: ${kepsekMaster?.nip || "—"}`, signX, signY + 33);

  // Catatan guru perlu perhatian
  const perluPerhatian = rows.filter((r) => r[9]);
  if (perluPerhatian.length > 0) {
    const catY = signY + 40;
    if (catY > pageH - 20) {
      doc.addPage();
    }
    const noteY = catY > pageH - 20 ? 20 : catY;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Catatan: Guru dengan kehadiran < 80% (perlu perhatian):", 14, noteY);
    doc.setFont("helvetica", "normal");
    perluPerhatian.forEach((r, i) => {
      doc.text(`  ${i + 1}. ${r[2]} (NIP: ${r[1]}) — Kehadiran: ${r[8]}`, 14, noteY + 5 + i * 4);
    });
  }

  const filename = `Rekap_Kehadiran_Guru_${namaBulan}_${tahun}`;
  doc.save(`${filename}.pdf`);
  closeModal("modalRekapBulanan");
  showToast("PDF Rekap Bulanan berhasil didownload!", "success");
}

console.log("exportPDF function defined");
