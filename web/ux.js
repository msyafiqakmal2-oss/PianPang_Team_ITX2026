// ux.js — tambahan kenyamanan halaman masuk. Dimuat SETELAH app.js.
(() => {
  // ---------- isi panduan (dipakai di kartu login dan tombol bantuan) ----------
  const CAPS = [
    ["🎒", "Siswa", "Ikut kelas, kerjakan kuis, kumpulkan XP, kirim karya."],
    ["🧑‍🏫", "Guru", "Buat kelas dan kuis, lihat statistik siswa."],
    ["⚖️", "Juri", "Menilai karya dan melihat podium juara."],
  ];
  const way = (ico, title, text) =>
    h("div", { class: "way" }, h("div", { class: "ico" }, ico), h("div", {}, h("b", {}, title), h("small", {}, text)));

  function guide() {
    return h("div", {},
      way("⚡", "1. Coba tanpa daftar", "Klik Siswa, Guru, atau Juri di bagian “coba langsung”. Anda langsung masuk memakai akun demo."),
      way("📝", "2. Buat akun sendiri", "Klik tab Daftar, pilih peran, isi nama panggilan dan kata sandi (minimal 8 karakter). Peran Juri butuh kode dari panitia."),
      way("🔑", "3. Sudah punya akun", "Klik tab Masuk, isi nama pengguna dan kata sandi, lalu tekan Masuk."),
      way("🆘", "Lupa kata sandi?", "Belum ada pengaturan ulang otomatis. Buat akun baru dengan nama lain, atau hubungi guru/panitia."),
      h("div", { class: "way" }, h("div", { class: "ico" }, "👥"),
        h("div", {}, h("b", {}, "Apa bedanya peran?"),
          CAPS.map(([i, n, d]) => h("small", { style: "display:block" }, `${i} ${n}: ${d}`)))));
  }

  // 1) Panduan "Cara masuk" di bawah tombol demo
  document.querySelector(".demo").after(
    h("details", { class: "howto" }, h("summary", {}, "❓ Bingung mulai dari mana? Lihat cara masuk"), guide()));

  // 2) Keterangan singkat pada tombol demo
  const tips = { rina: "Lihat aplikasi sebagai siswa (akun rina)", bu_sari: "Lihat aplikasi sebagai guru (akun bu_sari)", juri1: "Lihat aplikasi sebagai juri (akun juri1)" };
  document.querySelectorAll("[data-demo]").forEach((b) => (b.title = tips[b.dataset.demo] || ""));

  // 3) Tombol tampilkan/sembunyikan kata sandi
  ["password", "password2"].forEach((id) => {
    const input = $(id);
    const wrap = h("span", { class: "pw" });
    input.before(wrap);
    const eye = h("button", { type: "button", class: "eye", "aria-label": "Tampilkan kata sandi", title: "Tampilkan / sembunyikan" }, "👁");
    eye.onclick = () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      eye.textContent = show ? "🙈" : "👁";
      eye.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    };
    wrap.append(input, eye);
  });

  // 4) Keterangan peran + 5) meteran kekuatan kata sandi (hanya saat Daftar)
  const ROLE_TXT = {
    siswa: "🎒 Ikut kelas, kerjakan kuis, kumpulkan XP, dan kirim karya.",
    guru: "🧑‍🏫 Membuat kelas dan kuis, melihat statistik siswa.",
    juri: "⚖️ Menilai karya peserta. Butuh kode dari panitia.",
  };
  const roleHint = h("p", { class: "rolehint" });
  $("role-wrap").after(roleHint);
  const meterBar = h("i");
  const meter = h("div", { class: "meter", hidden: true }, meterBar);
  const meterT = h("p", { class: "meter-t", hidden: true });
  $("password").closest("label").after(meter, meterT);

  function strength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }
  const LEVELS = [["#FF6B5B", "Lemah"], ["#FF6B5B", "Lemah"], ["#FFC931", "Cukup"], ["#1FBF8F", "Bagus"], ["#1FBF8F", "Kuat"]];
  function refresh() {
    const reg = mode === "register";
    roleHint.hidden = !reg;
    roleHint.textContent = ROLE_TXT[roleVal()];
    const p = $("password").value;
    meter.hidden = meterT.hidden = !reg || !p;
    const s = strength(p), [color, label] = LEVELS[s];
    meterBar.style.width = Math.max(10, s * 25) + "%";
    meterBar.style.background = color;
    meterT.textContent = p.length < 8 ? "Minimal 8 karakter" : "Kekuatan: " + label;
  }
  $("password").addEventListener("input", refresh);
  document.querySelectorAll('input[name="role"]').forEach((r) => r.addEventListener("change", refresh));

  // 6) setMode: segarkan keterangan dan fokus otomatis (hanya di perangkat dengan mouse)
  const _setMode = setMode;
  setMode = function (m) {
    _setMode(m);
    refresh();
    if (matchMedia("(pointer:fine)").matches) $("username").focus();
  };

  // 7) Ingat nama pengguna terakhir yang diketik di formulir
  const KEY = "edu_last_user";
  try { const u = localStorage.getItem(KEY); if (u && !$("username").value) $("username").value = u; } catch {}
  $("auth-form").addEventListener("submit", () => {
    try { if (mode === "login" && $("username").value.trim().length >= 3) localStorage.setItem(KEY, $("username").value.trim()); } catch {}
  });

  // 8) Status "memproses" + peringatan bila server (paket gratis) lambat bangun
  const _doAuth = doAuth;
  doAuth = async function (m, u, p) {
    const btns = document.querySelectorAll("#auth-submit,[data-demo]");
    const submit = $("auth-submit"), label = submit.textContent, msg = $("auth-msg");
    btns.forEach((b) => (b.disabled = true));
    submit.textContent = "Memproses…";
    const t = setTimeout(() => {
      msg.className = "msg info";
      msg.textContent = "⏳ Server gratis mungkin sedang bangun. Mohon tunggu hingga 1 menit dan jangan tutup halaman ini.";
    }, 4000);
    try { return await _doAuth(m, u, p); }
    finally {
      clearTimeout(t);
      btns.forEach((b) => (b.disabled = false));
      submit.textContent = label;
      if (msg.classList.contains("info")) { msg.className = "msg"; msg.textContent = ""; }
    }
  };

  // 9) Sambutan "3 langkah pertama" setelah masuk (sekali per peran per perangkat)
  const STEPS = {
    siswa: ["Buka menu Kelas lalu gabung dengan kode kelas (demo: MTK7A atau ENG8B).",
      "Kerjakan kuis. Jawab semua benar dengan cepat untuk bonus ⚡ hingga +10 XP.",
      "Pantau misi harian, level, dan lencana di Beranda; lihat posisimu di Peringkat."],
    guru: ["Buka Kelas Saya, buat kelas, lalu bagikan kode kelas ke siswa.",
      "Masuk ke kelas dan klik + Buat kuis untuk menyusun soal.",
      "Setelah siswa mengerjakan, klik 📊 Statistik untuk melihat soal tersulit."],
    juri: ["Ikuti Tur juri 5 menit di Beranda.",
      "Buka menu Penilaian, pilih karya, lalu beri skor 5 kriteria.",
      "Lihat podium, buka sertifikat, unduh rekap CSV, dan coba Panduan → Cek sistem."],
  };
  const GOTO = { siswa: ["kelas", "Buka Kelas"], guru: ["kelas", "Buka Kelas Saya"], juri: ["karya", "Mulai menilai"] };
  function welcome() {
    const r = S.me.role, [tab, label] = GOTO[r];
    const close = modal(h("div", {},
      h("h2", {}, `🎉 Selamat datang, ${S.me.username}!`),
      h("p", { class: "muted", style: "margin-top:0" }, "Tiga langkah pertama:"),
      h("ol", { class: "steps" }, STEPS[r].map((t) => h("li", {}, t))),
      h("div", { class: "row", style: "justify-content:flex-end" },
        h("button", { class: "btn", onclick: () => close() }, "Nanti saja"),
        h("button", { class: "btn primary", onclick: () => { close(); go(tab); } }, label + " →"))));
  }
  const _start = start;
  start = async function (fresh) {
    await _start(fresh);
    if (fresh && S.me) {
      const k = "welcome_" + S.me.role;
      let seen = false;
      try { seen = !!localStorage.getItem(k); localStorage.setItem(k, "1"); } catch {}
      if (!seen) welcome();
    }
  };

  // 10) Tombol bantuan "?" (di halaman masuk dan di dalam aplikasi)
  document.body.append(h("button", {
    class: "help-fab", title: "Bantuan", "aria-label": "Bantuan",
    onclick: () => (S.me ? welcome() : modal(h("div", {}, h("h2", {}, "🧭 Bantuan cara masuk"), guide()))),
  }, "?"));

  refresh();
})();
