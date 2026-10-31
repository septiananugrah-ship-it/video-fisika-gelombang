# Konteks repo (untuk asisten AI)

- Video **"Getaran yang Berjalan" — Gelombang** (Fisika Umum, S1 Kimia UNESA, RPS minggu 9) milik **Yayan** (Septian Anugrah Dwi Putra), seri Fisika Umum #6. Seri #1 `video-fisika-energi`, #2 `video-fisika-fluida-statis`, #3 `video-fisika-fluida-dinamis`, #4 `video-fisika-momentum`, #5 `video-fisika-osilasi` (mesin, komponen, dan alur kerja disalin dari #5). Arah seri: fondasi fisika untuk kimia kuantum (Osilasi → Gelombang → Termofisika → Listrik → Magnet → Fisika Atom); setiap video punya bagian "di dunia kimia" yang menjembatani ke kuantum. Aturan umum & pelajaran teknis: repo `septiananugrah-ship-it/science-intro` → `CLAUDE.md`.
- Angka yang dipakai dicek di `naskah/AUDIT.md`.
- Branding: **tanpa intro SCIENTIAN terpisah** — judul menampilkan kapsul logo S + "Explore Science with Yayan"; outro SCIENTIAN + "Disusun oleh Septian Anugrah Dwi Putra" + "Berikutnya: Termofisika".
- Gaya seri **"Lab"** (malam biru tinta + kisi cetak biru, Space Grotesk/Inter/JetBrains Mono/Source Serif 4) dengan nuansa **gelombang**: tali, riak, dan cahaya yang merambat sesuai rumus (y = A sin(kx − ωt) per frame), titik medium yang hanya naik-turun di tempat, simpul–perut gelombang berdiri.
- **Kode warna**: gelombang/simpangan y = toska `C.cyan`, panjang gelombang λ = merah muda `C.press`, cepat rambat v = hijau `C.work`, frekuensi/fase = emas `C.gold`, gelombang kedua & gelombang materi (elektron) = ungu `C.spr`, hasil superposisi = putih, simpul = merah `C.heat`; cahaya memakai warna panjang gelombangnya.
- Komponen: `physics.tsx` (Crate, Ball, Car, Person, Spring, EnergyBars, Plot…), `flow.tsx`, `fluid.tsx`, `primitives.tsx` (Arrow berdenyut, Spark trail, Ripple, Card, Formula…).
- **Semua adegan harus terus bergerak** — panduan lengkap `naskah/POLISH.md`.
- **Claude tidak menjalankan workflow GitHub Actions.** Setelah merge ke `main`, berhenti dan minta pengguna menekan *Run workflow* sendiri; beri link & isian.
- Narasi: menyusul (ElevenLabs suara klon, atau Edge TTS gratis lewat input `mesin`). Selalu sediakan versi tanpa narasi.

## Aturan konten & tata letak

- Rumus utama ≥ 56 px (`Formula`), satu kartu per momen; zona subtitle (bawah 180 px) selalu bebas; margin ≥ 80 px. Komponen HTML di luar `<Stage>`.
- Bunyi di udara ≈ 340 m/s, c = 3×10⁸ m/s. "≈" untuk perkiraan. Koma desimal.
- Fisika gelombang harus benar: pola maju dengan v = λf sedangkan titik medium hanya berosilasi di tempat; gelombang berdiri punya simpul tetap pada jarak λ/2; Doppler: mendekat → nada naik (λ pendek), menjauh → turun.
- Teks TTS terpisah dari subtitle (`src/tts.ts`; huruf tunggal & nama tokoh dieja otomatis).
- Kemulusan: `EASE` lembut, fade keluar `EASE_IN_OUT`; tanpa ganti berdasarkan ambang (silang-pudar); tanpa CSS blur; tanpa filter pada garis lurus.

## QA

- `CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/qa-moments.mjs out/x adegan:baris:offset ...` lalu `python3 scripts/contact.py out/x out/x-sheets 6` (offset positif = detik setelah baris mulai).
- `scripts/qa-lines.mjs` = still di akhir setiap baris narasi (audit menyeluruh); `scripts/qa-audit.mjs` = awal/tengah/akhir + transisi.
- Uji kemulusan: `node scripts/qa-film.mjs out/a.mp4 <frameAwal> <frameAkhir> 0.25` lalu `python3 scripts/qa-glitch.py out/a.mp4 <frameAwal>`.
