const EYE_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.4 20.4 0 0 1 5.06-6.06"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>`;

const form = document.getElementById("regForm");
const successBanner = document.getElementById("successBanner");

const fields = {
  nama: {
    input: document.getElementById("nama"),
    wrap: document.querySelector('[data-field="nama"]'),
    hint: document.getElementById("namaHint"),
    defaultHint: "Minimal 3 karakter.",
    validate(value) {
      const v = value.trim();
      if (v.length === 0) return { valid: false, message: "Nama lengkap tidak boleh kosong." };
      if (v.length < 3) return { valid: false, message: "Nama minimal 3 karakter." };
      return { valid: true, message: "Nama terlihat baik." };
    },
  },
  email: {
    input: document.getElementById("email"),
    wrap: document.querySelector('[data-field="email"]'),
    hint: document.getElementById("emailHint"),
    defaultHint: "Gunakan format email yang benar.",
    validate(value) {
      const v = value.trim();
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (v.length === 0) return { valid: false, message: "Email tidak boleh kosong." };
      if (!pattern.test(v)) return { valid: false, message: "Format email tidak valid." };
      return { valid: true, message: "Format email valid." };
    },
  },
  password: {
    input: document.getElementById("password"),
    wrap: document.querySelector('[data-field="password"]'),
    hint: document.getElementById("passwordHint"),
    defaultHint: "Minimal 8 karakter.",
    validate(value) {
      if (value.length === 0) return { valid: false, message: "Password tidak boleh kosong." };
      if (value.length < 8) return { valid: false, message: "Password minimal 8 karakter." };
      return { valid: true, message: "Password sudah cukup kuat." };
    },
  },
  confirm: {
    input: document.getElementById("confirm"),
    wrap: document.querySelector('[data-field="confirm"]'),
    hint: document.getElementById("confirmHint"),
    defaultHint: "Harus sama dengan password di atas.",
    validate(value) {
      const pass = fields.password.input.value;
      if (value.length === 0) return { valid: false, message: "Konfirmasi password tidak boleh kosong." };
      if (value !== pass) return { valid: false, message: "Konfirmasi password tidak sama." };
      return { valid: true, message: "Password cocok." };
    },
  },
  ekskul: {
    input: document.getElementById("ekskul"),
    wrap: document.querySelector('[data-field="ekskul"]'),
    hint: document.getElementById("ekskulHint"),
    defaultHint: "Pilih salah satu ekstrakurikuler.",
    validate(value) {
      if (!value) return { valid: false, message: "Pilih salah satu ekstrakurikuler." };
      return { valid: true, message: "Pilihan tersimpan." };
    },
  },
};

function applyResult(field, result, silent) {
  field.wrap.classList.remove("is-invalid", "is-valid");

  if (silent) {
    field.hint.textContent = field.defaultHint;
    return;
  }

  if (result.valid) {
    field.wrap.classList.add("is-valid");
  } else {
    field.wrap.classList.add("is-invalid");
  }
  field.hint.textContent = result.message;
}

function validateField(key, silent = false) {
  const field = fields[key];
  const result = field.validate(field.input.value);
  applyResult(field, result, silent);
  return result.valid;
}

Object.keys(fields).forEach((key) => {
  const field = fields[key];
  const eventName = field.input.tagName === "SELECT" ? "change" : "input";
  field.input.addEventListener(eventName, () => validateField(key));
  field.input.addEventListener("blur", () => validateField(key));
});

// Re-check confirmation whenever the password itself changes
fields.password.input.addEventListener("input", () => {
  if (fields.confirm.input.value.length > 0) validateField("confirm");
});

// Show / hide password
document.querySelectorAll(".toggle-eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";
    btn.innerHTML = willShow ? EYE_OFF_ICON : EYE_ICON;
    btn.setAttribute("aria-label", willShow ? "Sembunyikan password" : "Tampilkan password");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // mencegah reload halaman
  successBanner.hidden = true;

  let allValid = true;

  Object.keys(fields).forEach((key) => {
    const valid = validateField(key);
    if (!valid) {
      allValid = false;
      const wrap = fields[key].wrap;
      wrap.classList.add("shake");
      setTimeout(() => wrap.classList.remove("shake"), 350);
    }
  });

  if (allValid) {
    successBanner.hidden = false;
    successBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.reset();
    Object.keys(fields).forEach((key) => validateField(key, true));
  } else {
    const firstInvalidKey = Object.keys(fields).find((key) =>
      fields[key].wrap.classList.contains("is-invalid")
    );
    if (firstInvalidKey) fields[firstInvalidKey].input.focus();
  }
});



/* =====================================================
   CHATBOT — asisten pendaftaran ekstrakurikuler
   Berbasis aturan (rule-based): berjalan langsung di browser,
   tanpa server dan tanpa API key.
   ===================================================== */

/* CHATBOT:LOGIC-START */
const EKSKUL = [
  { name: "Kepramukaan",  cat: "sosial",   keys: ["pramuka", "kepramukaan"],               desc: "Melatih kemandirian, kerja sama tim, dan keterampilan berkegiatan di alam." },
  { name: "PMR",          cat: "sosial",   keys: ["pmr", "palang merah"],                  desc: "Belajar pertolongan pertama dan kegiatan kepedulian kemanusiaan." },
  { name: "Paskibra",     cat: "olahraga", keys: ["paskibra", "pengibar"],                 desc: "Latihan baris-berbaris dan kedisiplinan, termasuk tugas pengibaran bendera." },
  { name: "Rohis",        cat: "sosial",   keys: ["rohis", "rohani"],                      desc: "Kegiatan keagamaan Islam seperti kajian, pembinaan akhlak, dan kegiatan sosial." },
  { name: "Pencak Silat", cat: "olahraga", keys: ["pencak silat", "silat", "pencak"],      desc: "Seni bela diri tradisional Indonesia yang melatih fisik, teknik, dan mental." },
  { name: "Drumband",     cat: "seni",     keys: ["drumband", "drumdband", "drum band"],   desc: "Bermain alat musik perkusi dan tiup dalam formasi barisan." },
  { name: "Jurnalistik",  cat: "bahasa",   keys: ["jurnalistik", "jurnalis"],              desc: "Belajar menulis berita, meliput kegiatan sekolah, dan mengelola media sekolah." },
  { name: "Paduan Suara", cat: "seni",     keys: ["paduan suara", "padus"],                desc: "Latihan olah vokal dan bernyanyi bersama dalam harmoni." },
  { name: "Rebana",       cat: "seni",     keys: ["rebana", "hadroh"],                     desc: "Memainkan rebana dan melantunkan shalawat atau lagu bernuansa Islami." },
  { name: "Bahasa Jepang",cat: "bahasa",   keys: ["bahasa jepang", "jepang", "nihongo"],   desc: "Belajar dasar bahasa Jepang, aksara, dan budaya Jepang." },
  { name: "Seni Tari",    cat: "seni",     keys: ["seni tari", "tari", "menari"],          desc: "Belajar gerak dan ekspresi lewat tari tradisional maupun modern." },
];

const CATEGORY_TITLES = {
  olahraga: "Olahraga & disiplin",
  seni: "Seni & musik",
  bahasa: "Bahasa & media",
  sosial: "Sosial & kepemimpinan",
};

const CATEGORY_CHIPS = Object.values(CATEGORY_TITLES);

const DEFAULT_CHIPS = ["Daftar ekskul", "Cara daftar", "Aturan password", "Bingung pilih ekskul", "Cek formulir saya"];

const FORM_LABELS = {
  nama: "Nama Lengkap",
  email: "Email",
  password: "Password",
  confirm: "Konfirmasi Password",
  ekskul: "Pilihan Ekstrakurikuler",
};

function categoryReply(cat) {
  const items = EKSKUL.filter((e) => e.cat === cat).map((e) => "• " + e.name + " — " + e.desc);
  return (
    "Untuk bidang " + CATEGORY_TITLES[cat] + ", ada:\n" +
    items.join("\n") +
    "\n\nKetik nama ekskulnya kalau mau tahu cara memilihnya."
  );
}

// Membaca isian formulir saat ini tanpa mengubah tampilan formulir
function checkForm() {
  const problems = [];
  Object.keys(fields).forEach((key) => {
    const f = fields[key];
    const result = f.validate(f.input.value);
    if (!result.valid) problems.push("• " + FORM_LABELS[key] + ": " + result.message);
  });
  if (problems.length === 0) {
    return "Semua kolom sudah terisi dengan benar. Tinggal klik \"Daftar Sekarang\"!";
  }
  return "Masih ada yang perlu dilengkapi:\n" + problems.join("\n");
}

/*
  keys : kata kunci. Kata tunggal harus sama persis dengan satu kata di pertanyaan,
         frasa (ada spasi) dicocokkan sebagai rangkaian kata, dan kata berakhiran "*"
         dicocokkan sebagai awalan (mis. "daftar*" cocok dengan "daftarkan").
  Frasa bernilai 2 poin, kata tunggal 1 poin. Jika skor sama, intent yang
  lebih dulu di daftar ini yang dipilih.
*/
const INTENTS = [
  {
    keys: ["halo", "hallo", "hai", "hei", "hi", "hello", "permisi", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "assalamualaikum"],
    reply: () => "Halo! Ada yang bisa kubantu soal pendaftaran ekstrakurikuler?",
    chips: DEFAULT_CHIPS,
  },
  {
    keys: ["terima kasih", "terimakasih", "makasih", "thanks", "thx", "trims"],
    reply: () => "Sama-sama! Kalau ada yang masih membingungkan, tanya saja ya.",
    chips: ["Cek formulir saya", "Cara daftar"],
  },
  {
    keys: ["siapa kamu", "kamu siapa", "nama kamu", "namamu", "kamu bot", "robot", "bantuan", "help", "bisa apa", "kamu bisa apa", "fitur"],
    reply: () =>
      "Aku asisten virtual untuk pendaftaran ekstrakurikuler. Aku bisa menjelaskan cara mengisi formulir, aturan tiap kolom, pilihan ekskul, dan memeriksa isianmu.\n\nJawabanku berdasarkan aturan yang sudah diprogram, jadi belum semua pertanyaan bisa kujawab.",
    chips: DEFAULT_CHIPS,
  },
  {
    keys: ["cek", "cek formulir", "cek isian", "periksa", "periksa formulir", "periksa isian", "sudah benar", "sudah lengkap", "isian"],
    reply: () => checkForm(),
    chips: ["Cara daftar", "Aturan password"],
  },
  {
    keys: ["konfirmasi", "ulangi", "tidak sama"],
    reply: () =>
      "Konfirmasi Password harus sama persis dengan Password di atas, termasuk huruf besar dan kecilnya. Kalau kamu mengubah password, konfirmasinya ikut diperiksa ulang.",
    chips: ["Aturan password", "Cek formulir saya"],
  },
  {
    keys: ["password", "kata sandi", "sandi", "katasandi"],
    reply: () =>
      "Aturan password:\n• Minimal 8 karakter.\n• Kolom Konfirmasi Password harus sama persis.\n• Klik ikon mata di kanan kolom untuk menampilkan atau menyembunyikan isinya.",
    chips: ["Cara daftar", "Cek formulir saya"],
  },
  {
    keys: ["email", "e mail", "surel"],
    reply: () =>
      "Gunakan format email yang benar, misalnya ayu@sekolah.sch.id. Email harus memuat tanda @ dan domain, serta tidak boleh mengandung spasi.",
    chips: ["Cara daftar", "Cek formulir saya"],
  },
  {
    keys: ["nama", "namanya"],
    reply: () => "Isi Nama Lengkap minimal 3 karakter. Spasi di awal dan akhir nama diabaikan.",
    chips: ["Cara daftar", "Cek formulir saya"],
  },
  {
    keys: ["apa saja", "ada berapa", "pilihan", "macam", "jenis", "tersedia", "daftar ekskul", "daftar ekstrakurikuler", "ekskul apa", "ekstrakurikuler apa", "list"],
    reply: () =>
      "Ada " + EKSKUL.length + " pilihan ekstrakurikuler di formulir ini:\n" +
      EKSKUL.map((e) => "• " + e.name).join("\n") +
      "\n\nKetik nama ekskul untuk melihat penjelasan singkatnya.",
    chips: ["Bingung pilih ekskul", "Cara daftar"],
  },
  {
    keys: ["bingung", "rekomendasi", "rekomendasikan", "saran", "sarankan", "cocok", "minat", "hobi", "pilih apa", "enaknya"],
    reply: () => "Pilih sesuai minatmu ya. Kamu lebih tertarik ke bidang yang mana?",
    chips: CATEGORY_CHIPS,
  },
  {
    keys: ["olahraga", "bela diri", "fisik", "disiplin", "atletik"],
    reply: () => categoryReply("olahraga"),
    chips: ["Bidang lain", "Cara daftar"],
  },
  {
    keys: ["seni", "musik", "alat musik", "menyanyi", "bernyanyi", "nyanyi", "menari", "drum"],
    reply: () => categoryReply("seni"),
    chips: ["Bidang lain", "Cara daftar"],
  },
  {
    keys: ["bahasa", "menulis", "media", "berita", "wartawan", "literasi"],
    reply: () => categoryReply("bahasa"),
    chips: ["Bidang lain", "Cara daftar"],
  },
  {
    keys: ["sosial", "kepemimpinan", "organisasi", "alam", "kemanusiaan", "agama", "religi", "relawan"],
    reply: () => categoryReply("sosial"),
    chips: ["Bidang lain", "Cara daftar"],
  },
  {
    keys: ["bidang lain"],
    reply: () => "Silakan pilih bidang yang ingin kamu lihat.",
    chips: CATEGORY_CHIPS,
  },
  {
    keys: ["jadwal*", "biaya*", "bayar*", "gratis", "iuran*", "pembina*", "pelatih*", "lokasi*", "tempat", "kuota*", "seragam*", "seleksi*", "kapan", "deadline", "ditutup", "dibuka", "batas waktu", "jam", "hari"],
    reply: () =>
      "Informasi seperti jadwal, biaya, pembina, kuota, atau batas waktu belum tercantum di formulir ini, jadi aku tidak bisa memastikannya. Sebaiknya tanyakan langsung ke pembina ekstrakurikuler atau pihak sekolah.",
    chips: ["Daftar ekskul", "Cara daftar"],
  },
  {
    keys: ["tahun ajaran", "tahun", "2026", "2027", "periode"],
    reply: () => "Formulir ini untuk Tahun Ajaran 2026/2027.",
    chips: DEFAULT_CHIPS,
  },
  {
    keys: ["cara", "bagaimana", "gimana", "bagaimana cara", "langkah", "alur", "prosedur", "syarat", "persyaratan", "mendaftar", "pendaftaran", "daftar", "mengisi", "isi formulir", "kirim", "submit"],
    reply: () =>
      "Cara mendaftar:\n1. Isi Nama Lengkap (minimal 3 karakter).\n2. Isi Email dengan format yang benar.\n3. Buat Password minimal 8 karakter, lalu ulangi di Konfirmasi Password.\n4. Pilih satu ekstrakurikuler.\n5. Klik \"Daftar Sekarang\".\n\nSetiap kolom diperiksa otomatis saat kamu mengisinya.",
    chips: ["Aturan password", "Daftar ekskul", "Cek formulir saya"],
  },
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchesKey(norm, words, key) {
  if (key.includes(" ")) return (" " + norm + " ").includes(" " + key + " ");
  if (key.endsWith("*")) {
    const stem = key.slice(0, -1);
    return words.some((w) => w.startsWith(stem));
  }
  return words.includes(key);
}

// Mengembalikan { text, chips } untuk pertanyaan apa pun
function getReply(text) {
  const norm = normalize(text);
  const words = norm.split(" ");

  // 1) Pertanyaan tentang ekskul tertentu
  const hits = EKSKUL.filter((e) => e.keys.some((k) => matchesKey(norm, words, k)));
  if (hits.length > 0) {
    const detail = hits.map((e) => e.name + " — " + e.desc).join("\n\n");
    const how =
      hits.length === 1
        ? "Untuk memilihnya, pilih \"" + hits[0].name + "\" pada kolom Pilihan Ekstrakurikuler."
        : "Pilih salah satunya pada kolom Pilihan Ekstrakurikuler.";
    return { text: detail + "\n\n" + how, chips: ["Daftar ekskul", "Cara daftar", "Cek formulir saya"] };
  }

  // 2) Topik umum: intent dengan skor tertinggi
  let best = null;
  let bestScore = 0;
  INTENTS.forEach((intent) => {
    const score = intent.keys.reduce(
      (sum, k) => sum + (matchesKey(norm, words, k) ? (k.includes(" ") ? 2 : 1) : 0),
      0
    );
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  });

  if (best) return { text: best.reply(), chips: best.chips };

  // 3) Tidak dikenali
  return {
    text: "Maaf, aku belum paham pertanyaan itu. Aku bisa membantu soal cara mengisi formulir dan pilihan ekstrakurikuler. Coba salah satu topik di bawah ini ya.",
    chips: DEFAULT_CHIPS,
  };
}
/* CHATBOT:LOGIC-END */

(function initChatbot() {
  const root = document.getElementById("chatbot");
  if (!root) return;

  const fab = document.getElementById("chatFab");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("chatClose");
  const messages = document.getElementById("chatMessages");
  const chipsBox = document.getElementById("chatChips");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  let started = false;
  let busy = false;

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(role, text) {
    const el = document.createElement("div");
    el.className = "chat-msg chat-msg--" + role;
    el.textContent = text; // textContent: aman dari HTML injection
    messages.appendChild(el);
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "chat-typing";
    el.setAttribute("aria-label", "Asisten sedang mengetik");
    el.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function renderChips(list) {
    chipsBox.innerHTML = "";
    list.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-chip";
      btn.textContent = label;
      btn.addEventListener("click", () => sendMessage(label));
      chipsBox.appendChild(btn);
    });
    scrollToBottom(); // area chip mengubah tinggi daftar pesan
  }

  function sendMessage(text) {
    const clean = text.trim();
    if (!clean || busy) return;

    busy = true;
    addMessage("user", clean);
    chatInput.value = "";
    renderChips([]);

    const typing = showTyping();
    const reply = getReply(clean);
    const delay = 450 + Math.min(reply.text.length * 5, 650);

    setTimeout(() => {
      typing.remove();
      addMessage("bot", reply.text);
      renderChips(reply.chips);
      busy = false;
    }, delay);
  }

  function openChat() {
    panel.hidden = false;
    root.classList.add("is-open");
    fab.setAttribute("aria-expanded", "true");
    fab.setAttribute("aria-label", "Tutup chat asisten");

    if (!started) {
      started = true;
      addMessage(
        "bot",
        "Halo! Aku asisten pendaftaran ekstrakurikuler. Aku bisa bantu soal cara mengisi formulir dan pilihan ekskul. Mau tanya apa?"
      );
      renderChips(DEFAULT_CHIPS);
    }
    chatInput.focus();
  }

  function closeChat(returnFocus) {
    panel.hidden = true;
    root.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-label", "Buka chat asisten");
    if (returnFocus) fab.focus();
  }

  fab.addEventListener("click", () => (panel.hidden ? openChat() : closeChat(false)));
  closeBtn.addEventListener("click", () => closeChat(true));

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closeChat(true);
  });
})();