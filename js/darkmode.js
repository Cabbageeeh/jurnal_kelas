// ============================================
// js/darkmode.js — Toggle Dark Mode
// ============================================

const DARK_MODE_KEY = "jk_dark_mode";

/** Terapkan tema sesuai preferensi tersimpan */
function initDarkMode() {
  const saved = localStorage.getItem(DARK_MODE_KEY);

  // Cek preferensi sistem jika belum pernah diset
  const preferDark =
    saved !== null
      ? saved === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(preferDark);
}

/** Toggle dark/light mode */
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  applyTheme(!isDark);
  localStorage.setItem(DARK_MODE_KEY, String(!isDark));
}

/** Terapkan tema */
function applyTheme(isDark) {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  updateToggleIcon(isDark);
}

/** Update icon tombol */
function updateToggleIcon(isDark) {
  const btn = document.getElementById("darkModeBtn");
  const icon = btn?.querySelector("i");
  if (!icon) return;

  if (isDark) {
    icon.className = "fas fa-sun";
    btn.title = "Mode Terang";
  } else {
    icon.className = "fas fa-moon";
    btn.title = "Mode Gelap";
  }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", initDarkMode);
