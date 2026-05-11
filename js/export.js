// ============================================
// js/export.js — Export PDF & XLSX v2.0
// ============================================

// ── ADMIN: Export dengan filter yang sedang aktif ─────────

function exportRekapAdmin(type, format) {
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
      exportPDF({
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
      exportPDF({
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
  return "Jurnal Kelas Digital";
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

function exportData(type, format) {
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
      exportPDF({
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
      exportPDF({
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

function exportRiwayatGuru(format) {
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
    exportPDF({
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

function exportRiwayatSiswa(format) {
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
    exportPDF({
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

  const sheetData = [
    // Header dengan styling
    [profil.namaSekolah || "Jurnal Kelas Digital"],
    [profil.alamat || ""],
    [
      [profil.telepon, profil.email, profil.website]
        .filter(Boolean)
        .join(" | ") || "",
    ],
    [`NPSN: ${profil.npsn || "—"}`],
    [], // baris kosong
    [title],
    [filter],
    [`Kepala Sekolah: ${profil.kepalaSekolah || "—"}`],
    [`Diekspor: ${getTanggalExport()}`],
    [], // baris kosong
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Auto lebar kolom
  ws["!cols"] = headers.map((h, i) => ({
    wch: Math.min(
      Math.max(h.length, ...rows.map((r) => String(r[i] || "").length)) + 4,
      40,
    ),
  }));

  // Merge sel header
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Nama sekolah
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Alamat
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }, // Kontak
    { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }, // NPSN
    { s: { r: 5, c: 0 }, e: { r: 5, c: headers.length - 1 } }, // Title
    { s: { r: 6, c: 0 }, e: { r: 6, c: headers.length - 1 } }, // Filter
    { s: { r: 7, c: 0 }, e: { r: 7, c: headers.length - 1 } }, // Kepala Sekolah
    { s: { r: 8, c: 0 }, e: { r: 8, c: headers.length - 1 } }, // Tanggal Export
  ];

  // Styling header
  const headerStyle = {
    font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "EEF2FF" } },
  };

  const subHeaderStyle = {
    font: { sz: 9, color: { rgb: "6B7280" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const titleStyle = {
    font: { bold: true, sz: 12, color: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "EEF2FF" } },
  };

  const tableHeaderStyle = {
    font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "4F46E5" } },
    border: {
      top: { style: "thin", color: { rgb: "4F46E5" } },
      bottom: { style: "thin", color: { rgb: "4F46E5" } },
      left: { style: "thin", color: { rgb: "4F46E5" } },
      right: { style: "thin", color: { rgb: "4F46E5" } },
    },
  };

  // Apply styles
  ws["A1"].s = headerStyle;
  ws["A2"].s = subHeaderStyle;
  ws["A3"].s = subHeaderStyle;
  ws["A4"].s = subHeaderStyle;
  ws["A6"].s = titleStyle;
  ws["A7"].s = subHeaderStyle;
  ws["A8"].s = subHeaderStyle;
  ws["A9"].s = subHeaderStyle;

  // Style table headers
  headers.forEach((_, i) => {
    const cell = XLSX.utils.encode_cell({ r: 10, c: i });
    if (!ws[cell]) ws[cell] = { t: "s", v: "" };
    ws[cell].s = tableHeaderStyle;
  });

  // Set row heights
  ws["!rows"] = [
    { hpt: 24 }, // Row 1 - Nama sekolah
    { hpt: 16 }, // Row 2 - Alamat
    { hpt: 14 }, // Row 3 - Kontak
    { hpt: 14 }, // Row 4 - NPSN
    { hpt: 8 }, // Row 5 - Kosong
    { hpt: 20 }, // Row 6 - Title
    { hpt: 14 }, // Row 7 - Filter
    { hpt: 14 }, // Row 8 - Kepala Sekolah
    { hpt: 14 }, // Row 9 - Tanggal
    { hpt: 8 }, // Row 10 - Kosong
    { hpt: 18 }, // Row 11 - Table header
  ];

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
  showToast("File XLSX berhasil didownload!", "success");
}

// ── Core: PDF ─────────────────────────────────────────────

function exportPDF({
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
  let y = 12;

  const profil = getProfilSekolah();
  const logoSize = 24;
  const headerHeight = 42;

  // ═══════════════════════════════════════════════════════
  // HEADER SECTION - Modern Design
  // ═══════════════════════════════════════════════════════

  // Background header dengan gradient effect (simulasi dengan rectangle)
  doc.setFillColor(238, 242, 255); // Light indigo
  doc.rect(0, 0, pageW, headerHeight, "F");

  // Garis atas accent (indigo bold)
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.line(0, 0, pageW, 0);

  y = 10;

  // Logo di kiri (jika ada)
  let logoX = 16;
  if (profil.logo) {
    try {
      // Border putih untuk logo
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(logoX - 1, y - 1, logoSize + 2, logoSize + 2, 2, 2, "F");

      doc.addImage(profil.logo, "JPEG", logoX, y, logoSize, logoSize);
    } catch (e) {
      console.error("Logo error:", e);
    }
  }

  // Konten header di sebelah kanan logo
  const contentX = profil.logo ? logoX + logoSize + 8 : logoX;
  const contentY = y + 3;

  // Nama Sekolah (Bold, Large)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55); // Gray-800
  doc.text(profil.namaSekolah || "Jurnal Kelas Digital", contentX, contentY);

  // Alamat
  if (profil.alamat) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // Gray-600
    const alamatLines = doc.splitTextToSize(profil.alamat, pageW - contentX - 20);
    doc.text(alamatLines[0], contentX, contentY + 6);
  }

  // Kontak (Telepon, Email, Website)
  const kontakInfo = [profil.telepon, profil.email, profil.website]
    .filter(Boolean)
    .join("  •  ");

  if (kontakInfo) {
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(kontakInfo, contentX, contentY + 11);
  }

  // NPSN di pojok kanan atas
  if (profil.npsn) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`NPSN: ${profil.npsn}`, pageW - 16, y + 4, { align: "right" });
  }

  // Kepala Sekolah di pojok kanan
  if (profil.kepalaSekolah) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Kepala Sekolah:", pageW - 16, y + 10, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99);
    doc.text(profil.kepalaSekolah, pageW - 16, y + 14, { align: "right" });
  }

  y = headerHeight + 2;

  // Garis pemisah dengan shadow effect
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageW - 14, y);

  doc.setDrawColor(203, 213, 225); // Gray-300
  doc.setLineWidth(0.3);
  doc.line(14, y + 0.5, pageW - 14, y + 0.5);

  y += 6;

  // ═══════════════════════════════════════════════════════
  // TITLE & INFO SECTION
  // ═══════════════════════════════════════════════════════

  // Judul Laporan (Bold, Centered, dengan background)
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(14, y - 3, pageW - 28, 10, 2, 2, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(title, pageW / 2, y + 3, { align: "center" });

  y += 12;

  // Filter & Info (dalam box)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y - 2, pageW - 28, 12, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99); // Gray-600

  // Filter
  doc.setFont("helvetica", "bold");
  doc.text("Filter: ", 18, y + 3);
  doc.setFont("helvetica", "normal");
  doc.text(filter, 32, y + 3);

  // Tanggal Export
  const tanggalExport = getTanggalExport();
  doc.setFont("helvetica", "bold");
  doc.text("Diekspor: ", 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(tanggalExport, 35, y + 7);

  y += 15;

  // Reset text color untuk tabel
  doc.setTextColor(0, 0, 0);

  // ═══════════════════════════════════════════════════════
  // TABLE SECTION
  // ═══════════════════════════════════════════════════════

  doc.autoTable({
    startY: y,
    head: [headers],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [79, 70, 229], // Indigo
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [67, 56, 202], // Indigo-700
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [31, 41, 55], // Gray-800
      lineWidth: 0.1,
      lineColor: [229, 231, 235], // Gray-200
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray-50
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Background footer
      doc.setFillColor(249, 250, 251);
      doc.rect(0, pageHeight - 12, pageW, 12, "F");

      // Garis atas footer
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(0, pageHeight - 12, pageW, pageHeight - 12);

      // Teks footer
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128); // Gray-500

      // Nama sekolah di kiri
      doc.text(
        profil.namaSekolah || "Jurnal Kelas Digital",
        14,
        pageHeight - 6,
      );

      // Nomor halaman di tengah
      doc.setFont("helvetica", "bold");
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        pageW / 2,
        pageHeight - 6,
        { align: "center" },
      );

      // Tanggal di kanan
      doc.setFont("helvetica", "normal");
      doc.text(
        new Date().toLocaleDateString("id-ID"),
        pageW - 14,
        pageHeight - 6,
        { align: "right" },
      );
    },
  });

  doc.save(`${filename}.pdf`);
  showToast("File PDF berhasil didownload!", "success");
}
