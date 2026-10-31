# Getaran yang Berjalan — Gelombang (Fisika Umum)

Video edukasi (2K, 30 FPS) · **SCIENTIAN — Explore Science with Yayan** · disusun oleh **Septian Anugrah Dwi Putra**. Seri Fisika Umum #6 (sebelumnya: Usaha & Energi, Fluida Statis, Fluida Dinamis, Momentum, Osilasi). Dibuat dengan [Remotion](https://remotion.dev).

Gaya visual seri **"Lab"** bernuansa gelombang: tali, riak, dan cahaya merambat sesuai rumus, titik medium naik-turun di tempat, gelombang berdiri dengan simpul–perut. Bagian kimia menjembatani ke kimia kuantum (difraksi sinar-X, gelombang materi de Broglie, elektron sebagai gelombang berdiri). Tanpa intro terpisah: judul pembuka memuat logo S + "Explore Science with Yayan".

## Isi

| Bagian | Bab |
|---|---|
| Pembuka | Riak kolam, senar gitar, cahaya matahari · judul · peta video |
| 1 · Konsep | 01 Getaran yang merambat · 02 λ, f, v · 03 Persamaan gelombang · 04 Cepat rambat pada tali · 05 Interferensi · 06 Gelombang berdiri · 07 Bunyi & Doppler |
| 2 · Gelombang di dunia kimia | 08 Cahaya · 09 Difraksi sinar-X · 10 Gelombang materi · 11 Jembatan ke kuantum |
| 3 · Penerapan | 12 Alat musik · 13 Ultrasonografi · 14 Peredam bising |
| Penutup | 15 Rangkuman · outro |

## Render (tombol ditekan sendiri, tab **Actions**)

- **Belum ada suara?** Jalankan **Render Gelombang 2K 30FPS → Run workflow** dengan isian bawaan → versi musik + subtitle (`gelombang-tanpa-narasi-2k-30fps`).
- **Dengan narasi:** **Buat voice-over + render 2K → Run workflow**, pilih `mesin`:
  - `elevenlabs` — suara klon. Isi secret `ELEVENLABS_API_KEY` dan `ELEVENLABS_VOICE_ID` (Settings → Secrets and variables → Actions), atau isi voice ID di form. ±19 ribu karakter untuk seluruh naskah (muat dalam kuota Starter 30 ribu/bulan).
  - `edge` — gratis, tanpa kunci (suara Microsoft `id-ID-ArdiNeural` laki-laki / `id-ID-GadisNeural` perempuan).
  Workflow membuat suara per baris, menyesuaikan timeline/subtitle/musik dengan durasi suara asli, menyimpannya ke repo, lalu merender versi **dengan narasi** dan **tanpa narasi**.
- Setelah suara jadi, disarankan **Cek pengucapan narasi (Whisper)**.
- Unduh artefak di halaman run (iPad: tekan lama nama artefak → *Unduh Tautan Tertaut*).

Baris yang teksnya diubah: hapus `public/voiceover/<kode>.mp3` agar dibuat ulang (workflow hanya membuat baris yang belum ada). Rekaman suara sendiri: simpan per baris dengan kode di `naskah/NASKAH_VOICEOVER.md`, lalu `npm run voiceover -- --measure`.

## Menjalankan sendiri

```bash
npm ci
npm run dev                # Remotion Studio: "Gelombang", "Gelombang2K", atau folder "Adegan"
npm run timeline           # perbarui naskah VO, SRT, BAB_YOUTUBE, peta musik
npm run music              # sintesis ulang musik (python3 + numpy + ffmpeg)
npm run lint               # cek tipe TypeScript
```

## Struktur

```
src/script.ts           naskah per adegan (teks, kata kunci, jeda, ejaan TTS opsional)
src/tts.ts              teks ramah-TTS (ejaan huruf & simbol)
src/timeline.ts         waktu baris & kata (estimasi suku kata, atau durasi rekaman asli)
src/components/         latar cetak biru, subtitle, heading bab, primitif rumus, komponen fisika (batang energi, pegas, balok, grafik) + fluida (air bergelombang, tangki, panah tekanan, gelembung)
src/scenes/             23 adegan
scripts/                voice-over (ElevenLabs/Edge), musik orisinal (numpy), cek pengucapan, render potongan & gabung, QA still
```
