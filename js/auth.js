// ============================================
// js/auth.js — Login & Session (FINAL)
// Session pakai sessionStorage — hilang saat browser ditutup
// ============================================

const SESSION_KEY = "jk_session";

// ── Session ───────────────────────────────────────────────

function saveSession(user) {
  const { password, ...safeUser } = user;
  // sessionStorage: otomatis hilang saat browser/tab ditutup
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
}

function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
  return getSession() !== null;
}

// ── Proteksi Halaman ──────────────────────────────────────

function requireAuth(requiredRole) {
  const session = getSession();

  if (!session) {
    // Simpan halaman tujuan agar bisa redirect balik setelah login
    sessionStorage.setItem("jk_redirect", window.location.pathname);
    window.location.replace("index.html");
    return null;
  }

  if (session.role !== requiredRole) {
    redirectToDashboard(session.role);
    return null;
  }

  return session;
}

function redirectToDashboard(role) {
  const routes = {
    admin: "dashboard-admin.html",
    guru: "dashboard-guru.html",
    siswa: "dashboard-siswa.html",
  };
  window.location.replace(routes[role] || "index.html");
}

// ── Login ─────────────────────────────────────────────────

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("btnLogin");

  btn.classList.add("loading");
  hideAlert();

  setTimeout(() => {
    const users = dbGetAll(DB_KEYS.users);

    const user = users.find(
      (u) =>
        u.username === username && u.password === password && u.aktif === true,
    );

    btn.classList.remove("loading");

    if (user) {
      saveSession(user);
      redirectToDashboard(user.role);
    } else {
      const nonaktif = users.find(
        (u) => u.username === username && u.password === password && !u.aktif,
      );
      const msg = nonaktif
        ? "Akun Anda telah dinonaktifkan. Hubungi Admin."
        : "Username atau password salah. Silakan coba lagi.";

      showAlert(msg);
      document.getElementById("loginForm").classList.add("shake");
      setTimeout(() => {
        document.getElementById("loginForm").classList.remove("shake");
      }, 400);
    }
  }, 500);
}

function showAlert(msg) {
  const el = document.getElementById("loginAlert");
  document.getElementById("loginAlertMsg").innerHTML = msg;
  el.classList.remove("hidden");
}

function hideAlert() {
  const el = document.getElementById("loginAlert");
  if (el) el.classList.add("hidden");
}

// ── UI Helpers ────────────────────────────────────────────

function togglePasswordVisibility() {
  const input = document.getElementById("password");
  const icon = document.getElementById("togglePassword");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// ── Logout ────────────────────────────────────────────────

function logout() {
  const session = getSession();
  if (!session) {
    window.location.replace("index.html");
    return;
  }

  // Isi info user di modal
  const avatarEl = document.getElementById("logoutAvatar");
  const namaEl = document.getElementById("logoutNama");
  const roleEl = document.getElementById("logoutRole");

  if (avatarEl) {
    avatarEl.textContent = session.nama.charAt(0).toUpperCase();
    avatarEl.className = `user-avatar ${session.role}`;
  }
  if (namaEl) namaEl.textContent = session.nama;
  if (roleEl) {
    const roleLabel = {
      admin: "🛡️ Administrator",
      guru: "👨‍🏫 Guru",
      siswa: `🎓 ${session.jabatan === "ketua" ? "Ketua Kelas" : "Sekretaris"}`,
    };
    roleEl.textContent = roleLabel[session.role] || session.role;
  }

  // Buka modal
  const overlay = document.getElementById("modalLogout");
  if (overlay) {
    overlay.classList.add("active");
  } else {
    // Fallback jika modal tidak ada
    if (confirm("Yakin ingin keluar?")) {
      clearSession();
      window.location.replace("index.html");
    }
  }
}

function konfirmasiLogout() {
  // Animasi tombol loading
  const btn = document.querySelector("#modalLogout .btn-danger");
  if (btn) {
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Keluar...`;
    btn.disabled = true;
  }

  setTimeout(() => {
    clearSession();
    window.location.replace("index.html");
  }, 600);
}

// ── Init Halaman Login ────────────────────────────────────

(function initLoginPage() {
  if (!document.getElementById("loginForm")) return;

  const session = getSession();
  if (session) {
    redirectToDashboard(session.role);
    return;
  }

  // Load profil sekolah ke halaman login
  loadProfilKeLogin();
})();

function loadProfilKeLogin() {
  const profil = getProfilSekolah();

  // Nama sekolah
  const elNama = document.getElementById("loginNamaSekolah");
  if (elNama) elNama.textContent = profil.namaSekolah || "Jurnal Kelas Digital";

  // Alamat
  const elAlamat = document.getElementById("loginAlamatSekolah");
  if (elAlamat) elAlamat.textContent = profil.alamat || "";

  // Logo
  const elLogo = document.getElementById("loginLogo");
  const elLogoDefault = document.getElementById("loginLogoDefault");
  if (elLogo && profil.logo) {
    elLogo.src = profil.logo;
    elLogo.style.display = "block";
    if (elLogoDefault) elLogoDefault.style.display = "none";
  }
}
