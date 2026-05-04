// ============================================================
//  PENGUMUMAN KELULUSAN SMK - Main Script
//  ⚠️  Ganti APPS_SCRIPT_URL dengan URL deploy Apps Script Anda
// ============================================================

const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxMw5swYRRE3lXVzU7hGB8fxQofcmx_eLAc5i36h7DI2y2acxbCcepQrLiDEhUisXTd5w/exec";

// ── Event listener: Enter key pada input ─────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("nisn-input");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") cekKelulusan();
        });
    }
});

// ── Fungsi utama cek kelulusan ───────────────────────────────
async function cekKelulusan() {
    const nisn = document.getElementById("nisn-input").value.trim();
    const resultEl = document.getElementById("result");
    const loadingEl = document.getElementById("loading");

    // Validasi input
    if (!nisn) {
        tampilkanPesan("Harap masukkan Nomor NISN terlebih dahulu.", "warning");
        return;
    }
    if (!/^\d{10}$/.test(nisn)) {
        tampilkanPesan("NISN harus terdiri dari 10 digit angka.", "warning");
        return;
    }

    // Tampilkan loading, sembunyikan result
    resultEl.classList.add("hidden");
    loadingEl.classList.remove("hidden");
    loadingEl.classList.add("flex");

    try {
        const url = `${APPS_SCRIPT_URL}?nisn=${encodeURIComponent(nisn)}`;
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) throw new Error("Respons server tidak valid.");

        const data = await response.json();
        loadingEl.classList.add("hidden");
        tampilkanHasil(data);
    } catch (err) {
        loadingEl.classList.add("hidden");
        tampilkanPesan(
            "Gagal terhubung ke server. Periksa koneksi internet Anda.",
            "error",
        );
        console.error(err);
    }
}

// ── Tampilkan hasil pencarian ────────────────────────────────
function tampilkanHasil(data) {
    const resultEl = document.getElementById("result");
    resultEl.classList.remove("hidden");
    resultEl.innerHTML = "";

    if (data.status === "found") {
        const keterangan = String(data.keterangan).toUpperCase();
        const isLulus = keterangan.includes("LULUS");

        const colorClass = isLulus ? "result-lulus" : "result-tidak";
        const stampColor = isLulus ? "text-emerald-400" : "text-red-400";
        const stampText = isLulus ? "LULUS" : "TIDAK LULUS";
        const icon = isLulus
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
         </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
         </svg>`;

        resultEl.innerHTML = `
      <div class="${colorClass} border rounded-xl p-5 animate-pop space-y-4">
        <div class="flex items-center gap-3">
          ${icon}
          <div>
            <p class="text-cream/60 text-xs tracking-widest uppercase">Hasil Pengumuman</p>
            <p class="text-cream font-semibold text-base">${escHtml(data.nama)}</p>
          </div>
        </div>
        <div class="divider-gold opacity-40"></div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-cream/50 text-xs mb-0.5">NISN</p>
            <p class="text-cream font-semibold tracking-widest">${escHtml(data.nisn)}</p>
          </div>
          <div>
            <p class="text-cream/50 text-xs mb-0.5">Keterangan</p>
            <p class="font-semibold ${isLulus ? "text-emerald-300" : "text-red-300"}">${escHtml(data.keterangan)}</p>
          </div>
        </div>
        <div class="flex justify-end">
          <span class="stamp ${stampColor} text-xs font-display font-black px-3 py-1 text-sm opacity-80">
            ${stampText}
          </span>
        </div>
      </div>
    `;
    } else if (data.status === "not_found") {
        resultEl.innerHTML = `
      <div class="result-not-found border rounded-xl p-5 animate-pop text-center space-y-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gold/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
        </svg>
        <p class="text-cream font-semibold">Data Tidak Ditemukan</p>
        <p class="text-cream/50 text-sm">NISN yang Anda masukkan tidak terdaftar.<br/>Periksa kembali atau hubungi pihak sekolah.</p>
      </div>
    `;
    } else {
        tampilkanPesan(data.pesan || "Terjadi kesalahan pada server.", "error");
    }
}

// ── Tampilkan pesan error / warning ─────────────────────────
function tampilkanPesan(pesan, tipe) {
    const resultEl = document.getElementById("result");
    resultEl.classList.remove("hidden");

    const styles = {
        warning: "bg-yellow-900/40 border-yellow-500/40 text-yellow-200",
        error: "bg-red-900/40 border-red-500/40 text-red-200",
    };

    resultEl.innerHTML = `
    <div class="border rounded-xl px-4 py-3.5 text-sm text-center animate-pop ${styles[tipe] || styles.error}">
      ${escHtml(pesan)}
    </div>
  `;
}

// ── Helper: escape HTML untuk mencegah XSS ───────────────────
function escHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
