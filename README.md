# EduNexus

**Ekosistem Kolaborasi & Gamifikasi Pendidikan** — belajar jadi petualangan, mengajar jadi lebih 

![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-axum-000000?logo=rust&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

EduNexus memadukan **gamifikasi** (XP, level, streak, misi harian, lencana), **kolaborasi kelas** (kuis, diskusi, Tantangan Kelas), **alat bantu guru** (statistik kuis), dan **modul penilaian juri** (rubrik berbobot, podium, sertifikat, rekap CSV) dalam satu aplikasi web yang ringan.

## Coba langsung

> **Demo:** [TAUTAN-DEMO]
>
> | Peran | Masuk satu klik |
> |---|---|
> | Juri | [TAUTAN-DEMO]/?demo=juri |
> | Siswa | [TAUTAN-DEMO]/?demo=siswa |
> | Guru | [TAUTAN-DEMO]/?demo=guru |
>
> Bukaan pertama bisa memakan waktu sekitar satu menit bila server gratis sedang "tidur". Mohon ditunggu sebentar.

## Daftar isi

- [Fitur](#fitur)
- [Struktur proyek](#struktur-proyek)
- [Menjalankan di komputer sendiri](#menjalankan-di-komputer-sendiri)
- [Akun demo](#akun-demo)
- [Konfigurasi](#konfigurasi)
- [Aturan gamifikasi](#aturan-gamifikasi)
- [Penilaian juri](#penilaian-juri)
- [API](#api)
- [Deploy dan pengumpulan lomba](#deploy-dan-pengumpulan-lomba)
- [Keamanan](#keamanan)
- [Rencana pengembangan](#rencana-pengembangan)
- [Tangkapan layar](#tangkapan-layar)
- [Lisensi dan kontak](#lisensi-dan-kontak)

## Fitur

**Untuk siswa**
- XP, level bergelar (Pemula → Legenda), streak harian, 3 misi harian, dan 8 lencana.
- Kuis dengan penghitung waktu, pembahasan jawaban, dan **bonus kecepatan** hingga +10 XP.
- Gabung kelas dengan kode, diskusi, dan apresiasi (like).
- Papan peringkat siswa dan **Tantangan Kelas** (total XP seluruh anggota kelas).
- Kirim karya proyek dan lihat hasil penilaian juri.

**Untuk guru**
- Membuat kelas dan kuis sendiri (1-10 soal, 2-5 pilihan).
- **Statistik kuis:** jumlah siswa yang mengerjakan, rata-rata nilai, persentase benar per soal, soal tersulit, dan hasil tiap siswa.
- Mengelola dan menghapus kuis, diskusi, dan kelas miliknya.

**Untuk juri**
- Menilai karya pada 5 kriteria berbobot (skala 1-10) disertai komentar.
- Podium juara otomatis, **sertifikat** yang bisa dicetak, dan **rekap nilai CSV**.
- **Tur juri 5 menit**, tautan masuk satu klik, dan menu **Cek sistem** (kesehatan layanan, waktu tanggap, waktu muat halaman).
- Log audit transparan dari layanan Rust.

**Teknis**
- Data tersimpan permanen dalam satu berkas JSON (penulisan atomik).
- JWT, kontrol akses berbasis peran (siswa, guru, juri), sandi Argon2id.
- Antarmuka tanpa framework dan aman dari XSS, responsif untuk telepon seluler.

## Struktur proyek

```
.
├── gateway/              Go — API, JWT, peran, gamifikasi, kuis, juri, penyimpanan
│   ├── main.go           rute, middleware, penyimpanan otomatis
│   ├── handlers.go       penangan HTTP
│   ├── store.go          model data, XP, lencana, kelas, kuis, diskusi
│   ├── jury.go           karya, rubrik, peringkat
│   ├── auth.go           JWT HS256 dan pembatasan peran
│   ├── hasher.go         klien layanan Rust
│   ├── persist.go        simpan dan muat data (JSON)
│   └── seed.go           data demo
├── hasher/               Rust (axum) — hash Argon2id dan audit log
├── web/                  antarmuka (HTML, CSS, JavaScript)
├── tools/seed_teddy.py   contoh skrip pembuat kelas dan kuis lewat API
├── docs/                 UPGRADE.md dan DEPLOY.md
├── docker-compose.yml    dua layanan: gateway dan hasher
├── Dockerfile.single     satu container berisi Go dan Rust (untuk hosting)
├── start.sh              skrip awal untuk Dockerfile.single
├── Makefile              pintasan perintah
└── .env.example          contoh variabel lingkungan
```

## Menjalankan di komputer sendiri

**Opsi 1 — Docker (paling mudah, Go dan Rust sekaligus)**

```bash
git clone https://github.com/msyafiqakmal2-oss/Learning_Pang.git
cd Learning_Pang
cp .env.example .env        # lalu ganti JWT_SECRET dan JURY_CODE
docker compose up -d --build
```

Buka **http://localhost:8080**. Lihat log dengan `docker compose logs -f gateway` dan hentikan dengan `docker compose down`.

> Jangan memakai `docker compose down -v` kecuali Anda memang ingin menghapus data tersimpan.

**Opsi 2 — Tanpa Docker**

Butuh Go 1.22+ (dan Rust bila ingin layanan keamanan lengkap).

```bash
make dev                    # Go saja, hash kata sandi memakai cadangan sederhana (khusus pengembangan)
# atau lengkap, di dua terminal:
make rust                   # layanan Rust di :8081
make go                     # gateway Go di :8080
```

Pemeriksaan kode: `make test` (menjalankan `go vet`).

## Akun demo

Data contoh dibuat otomatis saat pertama kali server menyala (`SEED_DEMO=true`).

| Peran | Nama pengguna | Kata sandi |
|---|---|---|
| Guru | `bu_sari` | `demo12345` |
| Siswa | `rina`, `putri`, `dimas`, `bayu`, `citra` | `demo12345` |
| Juri | `juri1`, `juri2` | `demo12345` |

Kode kelas contoh: `MTK7A` dan `ENG8B`. Kode untuk mendaftar sebagai juri baru ditentukan oleh `JURY_CODE` (bawaan: `JURI2026`, **wajib diganti** di server publik).

> Akun demo bersifat publik dan hanya untuk peragaan. Jangan menyimpan data nyata di server demo.

## Konfigurasi

Seluruhnya melalui variabel lingkungan.

| Variabel | Fungsi | Bawaan |
|---|---|---|
| `JWT_SECRET` | Rahasia penandatangan token sesi | nilai pengembangan (**ganti!**) |
| `JURY_CODE` | Kode untuk mendaftar sebagai juri | `JURI2026` |
| `SEED_DEMO` | Isi data demo saat penyimpanan masih kosong | `true` |
| `DATA_FILE` | Lokasi berkas data (`off` untuk menonaktifkan) | `edunexus.json` |
| `PORT` | Port gateway | `8080` |
| `HASHER_URL` | Alamat layanan Rust (kosong = mode pengembangan) | kosong |
| `WEB_DIR` | Lokasi berkas antarmuka | `../web` |
| `ADDR` | Alamat dengar layanan Rust | `0.0.0.0:8081` |

## Aturan gamifikasi

**Perolehan XP**

| Aktivitas | XP |
|---|---|
| Kuis (hanya percobaan pertama) | hadiah kuis × proporsi jawaban benar |
| Semua jawaban benar | +10 |
| Bonus kecepatan (semua benar dan cepat; waktu dihitung server) | hingga +10 |
| Menulis diskusi | +5 |
| Tulisan mendapat apresiasi | +2 untuk penulis, per apresiasi |
| Mengirim karya | +30 |

**Level:** setiap 100 XP naik satu level. Gelar: Pemula, Penjelajah, Petualang, Pendekar, Ahli, Master, Legenda (level 7+).

**Misi harian:** kerjakan 1 kuis (+25), tulis 1 diskusi (+15), beri 2 apresiasi (+10).

**Lencana:** Langkah Pertama, Nilai Sempurna, Kolaborator, Api Semangat (3 hari), Bintang Kelas (5 apresiasi pada satu tulisan), Pencipta Karya, Kilat, Konsisten (7 hari).

## Penilaian juri

Skor akhir 0-100 adalah rata-rata skor semua juri, dengan bobot:

| Kriteria | Bobot |
|---|---|
| Inovasi | 25% |
| Dampak Pendidikan | 25% |
| Kolaborasi | 20% |
| Desain & UX | 15% |
| Kualitas Teknis | 15% |

Alur singkat juri: buka tautan juri → ikuti **Tur juri** di Beranda → menu **Penilaian** → beri skor dan komentar → lihat podium → buka sertifikat atau unduh rekap CSV.

## API

Semua titik akhir berada di bawah `/api`. Kecuali pendaftaran dan masuk, setiap permintaan membawa header `Authorization: Bearer <token>`.

| Metode | Jalur | Akses |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | publik |
| GET | `/me`, `/stats`, `/leaderboard` | pengguna masuk |
| GET, POST | `/classes` | pengguna masuk, guru (POST) |
| POST | `/classes/join` | siswa |
| DELETE | `/classes/{id}` | guru pemilik |
| GET, POST | `/classes/{id}/quizzes` | anggota kelas, guru, juri / guru pemilik |
| DELETE | `/quizzes/{id}` | guru pemilik |
| POST | `/quizzes/{id}/start`, `/quizzes/{id}/attempt` | siswa |
| GET | `/quizzes/{id}/stats` | guru pemilik |
| GET, POST | `/classes/{id}/posts` | pengguna masuk (juri hanya membaca) |
| POST, DELETE | `/posts/{id}/like`, `/posts/{id}` | pengguna masuk / penulis atau guru kelas |
| GET, POST | `/projects` | pengguna masuk / siswa |
| DELETE | `/projects/{id}` | pemilik atau guru |
| POST | `/projects/{id}/score` | juri |
| GET | `/projects/export` | guru, juri |
| GET | `/audit` | guru, juri |
| GET | `/healthz` (tanpa awalan `/api`) | publik |

## Deploy dan pengumpulan lomba

Panduan lengkap ada di [`docs/DEPLOY.md`](docs/DEPLOY.md). Ringkasannya:

1. **Hosting.** Pilih VPS dengan `docker-compose.yml`, atau layanan hosting container dengan `Dockerfile.single` (Go dan Rust dalam satu container). Atur health check ke `/healthz`.
2. **Variabel wajib di server publik:** `JWT_SECRET`, `JURY_CODE`, dan `SEED_DEMO=true`.
3. **Tautan juri:** `https://DOMAIN/?demo=juri` — langsung masuk tanpa mengetik apa pun.
4. **Sebelum penilaian:** buka tautan beberapa menit sebelumnya, lalu jalankan menu **Panduan → Cek sistem**.

Catatan hosting paket gratis: layanan dapat "tidur" saat sepi dan penyimpanan lokal umumnya tidak permanen, sehingga data dapat kembali ke data demo setelah layanan restart.

## Keamanan

- Kata sandi disandikan Argon2id oleh layanan Rust dan tidak pernah dikirim kembali ke klien.
- Token sesi JWT (HMAC-SHA256) berlaku 12 jam.
- Pembatasan akses berdasarkan peran diperiksa di server pada setiap permintaan.
- Kunci jawaban kuis tidak dikirim ke peramban sebelum jawaban dikirim; bonus kecepatan dihitung server.
- Antarmuka menyusun konten pengguna lewat API DOM (bukan HTML mentah) untuk mencegah XSS.
- Ekspor CSV diamankan dari injeksi rumus.
- Aktivitas penting dicatat di log audit.

**Belum ada / dalam rencana:** pembatasan percobaan masuk, kuki HttpOnly dengan token penyegar, verifikasi akun guru, dan log audit yang permanen (saat ini disimpan di memori layanan Rust). Ganti `JWT_SECRET` dan `JURY_CODE` sebelum dipakai di server publik.

## Rencana pengembangan

Rincian per modul ada di [`docs/UPGRADE.md`](docs/UPGRADE.md).

- [ ] Pembatasan percobaan masuk dan kuki HttpOnly
- [ ] Opsi menyembunyikan nama dari papan peringkat
- [ ] Komentar pada diskusi dan pengumuman guru
- [ ] Pengacakan urutan soal dan pilihan jawaban
- [ ] Mode gelap
- [ ] Migrasi penyimpanan ke PostgreSQL
- [ ] Tipe soal baru (isian, bergambar) dan bank soal
- [ ] Kuis waktu nyata untuk seluruh kelas
- [ ] Laporan perkembangan siswa dan ekspor PDF
- [ ] Mode luring terbatas (PWA)

## Tangkapan layar

Simpan gambar di `docs/screenshots/` lalu tampilkan di sini, misalnya:

```markdown
![Halaman masuk](docs/screenshots/login.png)
![Beranda siswa](docs/screenshots/beranda.png)
![Statistik kuis guru](docs/screenshots/statistik.png)
![Podium juara](docs/screenshots/podium.png)
```

## Lisensi dan kontak

- **Lisensi:** [PILIH LISENSI, misalnya MIT — tambahkan berkas `LICENSE`]
- **Penyusun:** [NAMA TIM / PENYUSUN] · [NAMA SEKOLAH / INSTITUSI]
- **Kontak:** [SUREL ATAU TAUTAN]

Terima kasih telah mencoba EduNexus. Kritik dan saran sangat kami harapkan.
