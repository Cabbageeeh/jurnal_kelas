// ============================================
// js/utils.js — Utilitas Global
// Toast notification, helpers UI
// ============================================

// ── Toast Notification ────────────────────────────────────

/**
 * Tampilkan notifikasi toast
 * @param {string} msg     - Pesan
 * @param {string} type    - 'success' | 'error' | 'info' | 'warning'
 * @param {number} duration - Durasi ms (default 3000)
 */
function showToast(msg, type = "success", duration = 3000) {
  // Buat container jika belum ada
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    info: "fa-circle-info",
    warning: "fa-triangle-exclamation",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <span>${msg}</span>
  `;

  // Klik untuk tutup
  toast.addEventListener("click", () => dismissToast(toast));
  container.appendChild(toast);

  // Auto dismiss
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  toast.classList.add("toast-hide");
  setTimeout(() => toast.remove(), 300);
}

// ── Konfirmasi Dialog Kustom ──────────────────────────────

/**
 * Dialog konfirmasi yang lebih bagus dari window.confirm
 * Mengembalikan Promise<boolean>
 */
function showConfirm(message, title = "Konfirmasi") {
  return new Promise((resolve) => {
    // Buat modal konfirmasi dinamis
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
        </div>
        <div class="modal-body">
          <p style="color:var(--gray-600);line-height:1.7">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="confirmNo">Batal</button>
          <button class="btn btn-danger" id="confirmYes">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#confirmYes").onclick = () => {
      overlay.remove();
      resolve(true);
    };
    overlay.querySelector("#confirmNo").onclick = () => {
      overlay.remove();
      resolve(false);
    };
  });
}

// ── Format Helpers ────────────────────────────────────────

/** Singkat nama panjang */
function shortName(nama, maxLength = 20) {
  if (!nama) return "—";
  return nama.length > maxLength ? nama.substring(0, maxLength) + "..." : nama;
}

/** Format angka dengan titik ribuan */
function formatNumber(num) {
  return num?.toLocaleString("id-ID") || "0";
}

/** Hitung selisih hari dari hari ini */
function hariLalu(dateStr) {
  const diff = Math.floor(
    (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return `${diff} hari lalu`;
}

// ── Table Scroll Indicator ────────────────────────────────

/** Tambah indikator scroll pada tabel yang overflow */
function initTableScroll() {
  document.querySelectorAll(".table-wrapper").forEach((wrapper) => {
    const check = () => {
      wrapper.classList.toggle(
        "scrollable",
        wrapper.scrollWidth > wrapper.clientWidth,
      );
    };
    check();
    wrapper.addEventListener("scroll", check);
    window.addEventListener("resize", check);
  });
}

// Jalankan saat DOM siap
document.addEventListener("DOMContentLoaded", initTableScroll);
