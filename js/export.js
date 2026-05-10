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
    // ← UPDATE baris pertama pakai nama sekolah dari profil
    [profil.namaSekolah || "Jurnal Kelas Digital"],
    [profil.alamat || ""],
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
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: headers.length - 1 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: headers.length - 1 } },
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
  let y = 15;

  const profil = getProfilSekolah();
  const logoSize = 28;

  // Garis atas
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(14, y, pageW - 14, y);
  y += 4;

  // Logo di kiri (jika ada)
  if (profil.logo) {
    try {
      doc.addImage(profil.logo, "JPEG", 14, y, logoSize, logoSize);
    } catch (e) {}
  }

  // Teks di tengah-kanan
  const textX = profil.logo ? pageW / 2 : pageW / 2;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(profil.namaSekolah || "Jurnal Kelas Digital", textX, y + 8, {
    align: "center",
  });

  if (profil.alamat || profil.telepon) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const subInfo = [profil.alamat, profil.telepon].filter(Boolean).join(" | ");
    doc.text(subInfo, textX, y + 15, { align: "center" });
  }

  if (profil.npsn || profil.email) {
    doc.setFontSize(7.5);
    doc.setTextColor(120);
    const subInfo2 = [
      profil.npsn ? `NPSN: ${profil.npsn}` : "",
      profil.email || "",
    ]
      .filter(Boolean)
      .join(" | ");
    doc.text(subInfo2, textX, y + 21, { align: "center" });
  }

  y += logoSize + 4;

  // Garis pemisah tebal bawah header
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageW - 14, y);
  y += 5;

  // Judul laporan
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(title, pageW / 2, y, { align: "center" });
  y += 6;

  // Filter
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(filter, pageW / 2, y, { align: "center" });
  y += 5;

  // Kepala sekolah & tanggal export
  doc.text(
    `Kepala Sekolah: ${profil.kepalaSekolah || "—"}` +
      `   |   Diekspor: ${getTanggalExport()}`,
    pageW / 2,
    y,
    { align: "center" },
  );
  y += 6;

  // Garis bawah tipis
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);
  y += 4;
  doc.setTextColor(0);

  doc.autoTable({
    startY: y,
    head: [headers],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: 40,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" },
      );
      doc.text(getNamaSekolah(), 14, doc.internal.pageSize.getHeight() - 8);
    },
  });

  doc.save(`${filename}.pdf`);
  showToast("File PDF berhasil didownload!", "success");
}
