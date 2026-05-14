// ============================================
// js/data.js — Database (localStorage)
// Versi 2.0 — Sistem Periode & Jadwal Permanen
// ============================================

const DB_KEYS = {
  users: "jk_users",
  kelas: "jk_kelas",
  mapel: "jk_mapel",
  periode: "jk_periode",
  jadwal: "jk_jadwal",
  jamPelajaran: "jk_jam_pelajaran",
  konfirmasi: "jk_konfirmasi",
  jurnal: "jk_jurnal",
  profil: "jk_profil",
  hariLibur: "jk_hari_libur",
  siswa: "jk_siswa",
};

// ── Data Awal ─────────────────────────────────────────────

const INITIAL_USERS = [
  // Admin
  {
    id: "u001",
    nama: "Administrator",
    username: "admin",
    password: "admin123",
    role: "admin",
    aktif: true,
    createdAt: new Date().toISOString(),
  },

  // Guru — sekarang punya array jadwalIds (dikelola via jadwal)
  {
    id: "u002",
    nama: "Budi Santoso, S.Pd",
    username: "budi",
    password: "guru123",
    role: "guru",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u003",
    nama: "Siti Rahayu, S.Pd",
    username: "siti",
    password: "guru123",
    role: "guru",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u004",
    nama: "Ahmad Fauzi, M.Pd",
    username: "ahmad",
    password: "guru123",
    role: "guru",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u005",
    nama: "Dewi Lestari, S.Pd",
    username: "dewi",
    password: "guru123",
    role: "guru",
    aktif: true,
    createdAt: new Date().toISOString(),
  },

  // Siswa — ketua & sekretaris
  {
    id: "u006",
    nama: "Rina Wulandari",
    username: "rina",
    password: "siswa123",
    role: "siswa",
    jabatan: "ketua",
    kelasId: "kls001",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u007",
    nama: "Dedi Kurniawan",
    username: "dedi",
    password: "siswa123",
    role: "siswa",
    jabatan: "sekretaris",
    kelasId: "kls001",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u008",
    nama: "Maya Sari",
    username: "maya",
    password: "siswa123",
    role: "siswa",
    jabatan: "ketua",
    kelasId: "kls002",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u009",
    nama: "Fajar Nugroho",
    username: "fajar",
    password: "siswa123",
    role: "siswa",
    jabatan: "sekretaris",
    kelasId: "kls002",
    aktif: true,
    createdAt: new Date().toISOString(),
  },

  // Siswa tambahan untuk X-2 (total 35 siswa)
  ...Array.from({ length: 33 }, (_, i) => ({
    id: `u${String(100 + i).padStart(3, "0")}`,
    nama: `Siswa ${i + 1} X-2`,
    username: `siswa${i + 1}`,
    password: "siswa123",
    role: "siswa",
    jabatan: null,
    kelasId: "kls002",
    aktif: true,
    createdAt: new Date().toISOString(),
  })),
];

const INITIAL_KELAS = [
  {
    id: "kls001",
    nama: "X-1",
    tingkat: "X",
    jurusan: "",
    jumlahSiswa: 2,
    aktif: true,
  },
  {
    id: "kls002",
    nama: "X-2",
    tingkat: "X",
    jurusan: "",
    jumlahSiswa: 35,
    aktif: true,
  },
  {
    id: "kls003",
    nama: "X-3",
    tingkat: "X",
    jurusan: "",
    jumlahSiswa: 0,
    aktif: true,
  },
  {
    id: "kls004",
    nama: "XI-A",
    tingkat: "XI",
    jurusan: "A",
    jumlahSiswa: 0,
    aktif: true,
  },
  {
    id: "kls005",
    nama: "XI-B",
    tingkat: "XI",
    jurusan: "B",
    jumlahSiswa: 0,
    aktif: true,
  },
  {
    id: "kls006",
    nama: "XII-A",
    tingkat: "XII",
    jurusan: "A",
    jumlahSiswa: 0,
    aktif: true,
  },
];

const INITIAL_MAPEL = [
  { id: "mp001", nama: "Matematika", kode: "MTK", aktif: true },
  { id: "mp002", nama: "Bahasa Indonesia", kode: "BIND", aktif: true },
  { id: "mp003", nama: "Fisika", kode: "FIS", aktif: true },
  { id: "mp004", nama: "Kimia", kode: "KIM", aktif: true },
  { id: "mp005", nama: "Biologi", kode: "BIO", aktif: true },
  { id: "mp006", nama: "Bahasa Inggris", kode: "BING", aktif: true },
  { id: "mp007", nama: "Sejarah", kode: "SEJ", aktif: true },
  { id: "mp008", nama: "Ekonomi", kode: "EKO", aktif: true },
];

// Periode/Semester
const INITIAL_PERIODE = [
  {
    id: "per001",
    nama: "Semester Ganjil 2025/2026",
    mulai: "2025-07-14",
    selesai: "2025-12-20",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
];

// Jam pelajaran — bisa diedit admin
// tipe: 'pelajaran' | 'istirahat'
const INITIAL_JAM = [
  {
    id: "jp01",
    ke: 1,
    mulai: "07:00",
    selesai: "07:40",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp02",
    ke: 2,
    mulai: "07:40",
    selesai: "08:20",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp03",
    ke: 3,
    mulai: "08:20",
    selesai: "09:00",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp04",
    ke: null,
    mulai: "09:00",
    selesai: "09:15",
    tipe: "istirahat",
    label: "Istirahat 1",
  },
  {
    id: "jp05",
    ke: 4,
    mulai: "09:15",
    selesai: "09:55",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp06",
    ke: 5,
    mulai: "09:55",
    selesai: "10:35",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp07",
    ke: 6,
    mulai: "10:35",
    selesai: "11:15",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp08",
    ke: null,
    mulai: "11:15",
    selesai: "11:30",
    tipe: "istirahat",
    label: "Istirahat 2",
  },
  {
    id: "jp09",
    ke: 7,
    mulai: "11:30",
    selesai: "12:10",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp10",
    ke: 8,
    mulai: "12:10",
    selesai: "12:50",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp11",
    ke: null,
    mulai: "12:50",
    selesai: "13:30",
    tipe: "istirahat",
    label: "Istirahat 3",
  },
  {
    id: "jp12",
    ke: 9,
    mulai: "13:30",
    selesai: "14:10",
    tipe: "pelajaran",
    label: "",
  },
  {
    id: "jp13",
    ke: 10,
    mulai: "14:10",
    selesai: "14:50",
    tipe: "pelajaran",
    label: "",
  },
];

// Jadwal permanen — dibuat admin, terikat periode
// jamKe: array jam pelajaran yang diampu
const INITIAL_JADWAL = [
  // Pak Budi — Matematika X IPA 1, Senin jam 1-2
  {
    id: "jdw001",
    periodeId: "per001",
    hari: "Senin",
    jamKe: [1, 2],
    guruId: "u002",
    kelasId: "kls001",
    mapelId: "mp001",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  // Pak Budi — Fisika XI IPA 1, Senin jam 6-7
  {
    id: "jdw002",
    periodeId: "per001",
    hari: "Senin",
    jamKe: [6, 7],
    guruId: "u002",
    kelasId: "kls004",
    mapelId: "mp003",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  // Pak Budi — Matematika X IPA 2, Selasa jam 1-2
  {
    id: "jdw003",
    periodeId: "per001",
    hari: "Selasa",
    jamKe: [1, 2],
    guruId: "u002",
    kelasId: "kls002",
    mapelId: "mp001",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  // Bu Siti — Bahasa Indonesia X IPA 1, Senin jam 3
  {
    id: "jdw004",
    periodeId: "per001",
    hari: "Senin",
    jamKe: [3],
    guruId: "u003",
    kelasId: "kls001",
    mapelId: "mp002",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  // Pak Ahmad — Kimia XI IPA 1, Rabu jam 4-5
  {
    id: "jdw005",
    periodeId: "per001",
    hari: "Rabu",
    jamKe: [4, 5],
    guruId: "u004",
    kelasId: "kls004",
    mapelId: "mp004",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
  // Bu Dewi — Biologi X IPA 1, Kamis jam 1-2
  {
    id: "jdw006",
    periodeId: "per001",
    hari: "Kamis",
    jamKe: [1, 2],
    guruId: "u005",
    kelasId: "kls001",
    mapelId: "mp005",
    aktif: true,
    createdAt: new Date().toISOString(),
  },
];

// ── Inisialisasi DB ───────────────────────────────────────

function initDB() {
  if (!localStorage.getItem(DB_KEYS.users)) {
    localStorage.setItem(DB_KEYS.users, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(DB_KEYS.kelas)) {
    localStorage.setItem(DB_KEYS.kelas, JSON.stringify(INITIAL_KELAS));
  }
  if (!localStorage.getItem(DB_KEYS.mapel)) {
    localStorage.setItem(DB_KEYS.mapel, JSON.stringify(INITIAL_MAPEL));
  }
  if (!localStorage.getItem(DB_KEYS.periode)) {
    localStorage.setItem(DB_KEYS.periode, JSON.stringify(INITIAL_PERIODE));
  }
  if (!localStorage.getItem(DB_KEYS.jamPelajaran)) {
    localStorage.setItem(DB_KEYS.jamPelajaran, JSON.stringify(INITIAL_JAM));
  }
  if (!localStorage.getItem(DB_KEYS.jadwal)) {
    localStorage.setItem(DB_KEYS.jadwal, JSON.stringify(INITIAL_JADWAL));
  }
  if (!localStorage.getItem(DB_KEYS.konfirmasi)) {
    localStorage.setItem(DB_KEYS.konfirmasi, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.jurnal)) {
    localStorage.setItem(DB_KEYS.jurnal, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.profil)) {
    localStorage.setItem(DB_KEYS.profil, JSON.stringify(INITIAL_PROFIL));
  }
  if (!localStorage.getItem(DB_KEYS.siswa)) {
    localStorage.setItem(DB_KEYS.siswa, JSON.stringify([]));
  }
}

// ── CRUD Generik ──────────────────────────────────────────

function dbGetAll(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function dbSetAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function dbGetById(key, id) {
  return dbGetAll(key).find((item) => item.id === id) || null;
}

function dbInsert(key, newItem) {
  const data = dbGetAll(key);
  data.push(newItem);
  dbSetAll(key, data);
  return newItem;
}

function dbUpdate(key, id, updatedFields) {
  const data = dbGetAll(key).map((item) =>
    item.id === id ? { ...item, ...updatedFields } : item,
  );
  dbSetAll(key, data);
}

function dbDelete(key, id) {
  const data = dbGetAll(key).filter((item) => item.id !== id);
  dbSetAll(key, data);
}

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Helper Jadwal ─────────────────────────────────────────

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Ambil nama hari ini dalam bahasa Indonesia */
function getHariIni() {
  return HARI_LIST[new Date().getDay() - 1] || "Minggu";
}

/** Ambil jam sekarang format HH:MM */
function getJamSekarang() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * Cek apakah jam sekarang masuk dalam rentang jam pelajaran ke-X
 * Toleransi: guru bisa konfirmasi mulai 5 menit sebelum jam mulai
 */
function getJamAktifSekarang() {
  const now = new Date();
  const menitSekarang = now.getHours() * 60 + now.getMinutes();

  const jams = dbGetAll(DB_KEYS.jamPelajaran).filter(
    (j) => j.tipe === "pelajaran" && j.ke !== null,
  );

  const hariIni = getHariIni();
  const periode = getPeriodeAktif();
  if (!periode) return [];

  const jadwalHariIni = dbGetAll(DB_KEYS.jadwal).filter(
    (j) => j.periodeId === periode.id && j.hari === hariIni && j.aktif === true,
  );

  const jamAktif = [];

  jadwalHariIni.forEach((jadwal) => {
    const jamKeList = jadwal.jamKe;
    if (jamKeList.length === 0) return;

    const jamObjs = jamKeList
      .map((ke) => jams.find((j) => j.ke === ke))
      .filter(Boolean);

    if (jamObjs.length === 0) return;

    // Jam pertama (mulai paling awal)
    const jamPertama = jamObjs.reduce((a, b) => {
      const [ah, am] = a.mulai.split(":").map(Number);
      const [bh, bm] = b.mulai.split(":").map(Number);
      return ah * 60 + am < bh * 60 + bm ? a : b;
    });

    // Jam terakhir (selesai paling akhir)
    const jamTerakhir = jamObjs.reduce((a, b) => {
      const [ah, am] = a.selesai.split(":").map(Number);
      const [bh, bm] = b.selesai.split(":").map(Number);
      return ah * 60 + am > bh * 60 + bm ? a : b;
    });

    const [h1, m1] = jamPertama.mulai.split(":").map(Number);
    const [h2, m2] = jamTerakhir.selesai.split(":").map(Number);

    // Toleransi 5 menit sebelum mulai
    const menitMulai = h1 * 60 + m1 - 5;
    const menitSelesai = h2 * 60 + m2;

    if (menitSekarang >= menitMulai && menitSekarang < menitSelesai) {
      jamKeList.forEach((ke) => jamAktif.push(ke));
    }
  });

  return [...new Set(jamAktif)];
}

/**
 * Cek apakah jadwal sudah terlewat (jam pelajaran sudah selesai)
 * @param {array} jamKeArr - array jam pelajaran [1,2,3]
 * @returns {boolean}
 */
function isJadwalTerlewat(jamKeArr) {
  const jamSekarang = getJamSekarang();
  const jams = dbGetAll(DB_KEYS.jamPelajaran).filter(
    (j) => j.tipe === "pelajaran",
  );

  // Ambil jam terakhir dari jadwal
  const jamTerakhir = Math.max(...jamKeArr);
  const infoJamTerakhir = jams.find((j) => j.ke === jamTerakhir);

  if (!infoJamTerakhir) return false;

  // Jadwal terlewat jika jam sekarang sudah melewati jam selesai
  return jamSekarang > infoJamTerakhir.selesai;
}

/**
 * Ambil jadwal aktif untuk guru tertentu hari ini
 * Hanya jadwal yang jamnya sedang berlangsung
 */
function getJadwalAktifGuru(guruId) {
  const periodeAktif = dbGetAll(DB_KEYS.periode).find((p) => p.aktif);
  if (!periodeAktif) return [];

  const hariIni = getHariIni();
  const jamAktif = getJamAktifSekarang();

  return dbGetAll(DB_KEYS.jadwal).filter(
    (j) =>
      j.periodeId === periodeAktif.id &&
      j.guruId === guruId &&
      j.hari === hariIni &&
      j.aktif === true &&
      // Cek apakah ada irisan jam aktif dengan jam jadwal
      j.jamKe.some((ke) => jamAktif.includes(ke)),
  );
}

/**
 * Ambil SEMUA jadwal guru hari ini (untuk tampilan riwayat hari ini)
 * Tanpa filter jam aktif
 */
function getJadwalHariIniGuru(guruId) {
  const periodeAktif = dbGetAll(DB_KEYS.periode).find((p) => p.aktif);
  if (!periodeAktif) return [];

  const hariIni = getHariIni();

  return dbGetAll(DB_KEYS.jadwal)
    .filter(
      (j) =>
        j.periodeId === periodeAktif.id &&
        j.guruId === guruId &&
        j.hari === hariIni &&
        j.aktif === true,
    )
    .sort((a, b) => Math.min(...a.jamKe) - Math.min(...b.jamKe));
}

/**
 * Ambil jadwal kelas hari ini (untuk siswa)
 */
function getJadwalHariIniKelas(kelasId) {
  const periodeAktif = dbGetAll(DB_KEYS.periode).find((p) => p.aktif);
  if (!periodeAktif) return [];

  const hariIni = getHariIni();

  return dbGetAll(DB_KEYS.jadwal)
    .filter(
      (j) =>
        j.periodeId === periodeAktif.id &&
        j.kelasId === kelasId &&
        j.hari === hariIni &&
        j.aktif === true,
    )
    .sort((a, b) => Math.min(...a.jamKe) - Math.min(...b.jamKe));
}

/**
 * Cek apakah jadwal sudah dikonfirmasi hari ini
 */
function getKonfirmasiHariIni(jadwalId) {
  const today = getTodayStr();
  return (
    dbGetAll(DB_KEYS.konfirmasi).find(
      (k) => k.jadwalId === jadwalId && k.tanggal === today,
    ) || null
  );
}

/**
 * Ambil info jam pelajaran berdasarkan ke-X
 */
function getInfoJam(ke) {
  return (
    dbGetAll(DB_KEYS.jamPelajaran).find(
      (j) => j.ke === ke && j.tipe === "pelajaran",
    ) || null
  );
}

/**
 * Format rentang jam dari array jamKe
 * cth: [1,2] → "07:00 – 08:20"
 */
function formatRentangJam(jamKeArr) {
  const jams = dbGetAll(DB_KEYS.jamPelajaran).filter(
    (j) => j.tipe === "pelajaran",
  );

  const sorted = [...jamKeArr].sort((a, b) => a - b);
  const first = jams.find((j) => j.ke === sorted[0]);
  const last = jams.find((j) => j.ke === sorted[sorted.length - 1]);

  if (!first || !last) return "—";
  return `${first.mulai} – ${last.selesai}`;
}

// ── Helper Umum ───────────────────────────────────────────

function formatTanggal(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getPeriodeAktif() {
  return dbGetAll(DB_KEYS.periode).find((p) => p.aktif) || null;
}

/** Ambil profil sekolah */
function getProfilSekolah() {
  const raw = localStorage.getItem(DB_KEYS.profil);
  return raw ? JSON.parse(raw) : INITIAL_PROFIL;
}

/** Simpan profil sekolah */
function saveProfilSekolah(data) {
  localStorage.setItem(DB_KEYS.profil, JSON.stringify(data));
}

// ── Helper Hari Libur ─────────────────────────────────────

/**
 * Cek apakah tanggal tertentu adalah hari libur
 * @param {string} tanggalStr - format YYYY-MM-DD
 * @returns {object|null} - data hari libur atau null
 */
function cekHariLibur(tanggalStr) {
  const date = new Date(tanggalStr);
  const hari = date.getDay(); // 0=Minggu, 6=Sabtu

  // Cek hari Minggu
  if (hari === 0) {
    return {
      id: "minggu",
      tanggal: tanggalStr,
      nama: "Hari Minggu",
      tipe: "mingguan",
    };
  }

  // Cek hari libur di database
  const liburList = dbGetAll(DB_KEYS.hariLibur);
  return liburList.find((l) => l.tanggal === tanggalStr && l.aktif) || null;
}

/**
 * Cek apakah hari ini hari libur
 */
function cekHariIniLibur() {
  return cekHariLibur(getTodayStr());
}

/**
 * Ambil semua hari libur dalam rentang tanggal
 */
function getHariLiburDalamRentang(dari, sampai) {
  return dbGetAll(DB_KEYS.hariLibur).filter(
    (l) => l.tanggal >= dari && l.tanggal <= sampai && l.aktif,
  );
}

function resetDB() {
  Object.values(DB_KEYS).forEach((k) => localStorage.removeItem(k));
  initDB();
  console.log("✅ Database direset ke data awal.");
}

function resetDataTransaksi() {
  localStorage.removeItem(DB_KEYS.jurnal);
  localStorage.removeItem(DB_KEYS.konfirmasi);
  localStorage.removeItem(DB_KEYS.jadwal);
  initDB();
  console.log("✅ Data transaksi direset.");
}

const INITIAL_PROFIL = {
  namaSekolah: "SMA Negeri 15 Surabaya",
  alamat:
    "Jl. Dukuh Menanggal Sel. No.103, Dukuh Menanggal, Kec. Gayungan, Surabaya, Jawa Timur 60234",
  telepon: "(031) 5678910",
  email: "info@sman15-sby.sch.id",
  website: "www.sman15-sby.sch.id",
  kepalaSekolah: "Drs. Ahmad Subarjo, M.Pd",
  npsn: "20533015",
  logo: "assets/img/Logo_Sekolah_Final-SMAN 15 Surabaya.png", // Path logo sekolah
};

const INITIAL_HARI_LIBUR = [
  {
    id: "hl001",
    tanggal: "2025-08-17",
    nama: "Hari Kemerdekaan RI",
    tipe: "nasional",
    aktif: true,
  },
  {
    id: "hl002",
    tanggal: "2025-12-25",
    nama: "Hari Natal",
    tipe: "nasional",
    aktif: true,
  },
  {
    id: "hl003",
    tanggal: "2025-12-20",
    nama: "Libur Akhir Semester Ganjil",
    tipe: "sekolah",
    aktif: true,
  },
];

// Jalankan inisialisasi
initDB();
if (!localStorage.getItem(DB_KEYS.hariLibur)) {
  localStorage.setItem(DB_KEYS.hariLibur, JSON.stringify(INITIAL_HARI_LIBUR));
}
