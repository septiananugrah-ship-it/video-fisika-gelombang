// Naskah narasi "Getaran yang Berjalan" — Fisika Umum: Gelombang.
// Setiap adegan berisi baris narasi. Durasi baris dihitung otomatis dari jumlah
// suku kata (lihat timeline.ts) atau dari rekaman suara bila sudah ada,
// jadi cukup ubah teks di sini: visual, subtitle, dan musik ikut menyesuaikan.
//
// Aturan menulis teks narasi (dibaca mesin TTS):
//  - angka & simbol ditulis sebagai kata ("dua puluh meter per detik"),
//  - rumus ditulis sebagai kalimat; rumus rapi tampil di layar (komponen Formula).
// Angka sudah dicek di naskah/AUDIT.md (g = 10 m/s², ρ air = 1000 kg/m³, p_atm = 100 kPa, kecuali disebut lain).
//
// hl     : kata/frasa yang disorot pada subtitle
// pause  : jeda (detik) SETELAH baris dibacakan
// lead   : jeda (detik) sebelum baris pertama adegan
// tail   : jeda (detik) setelah baris terakhir adegan
// fixed  : durasi tetap (detik) untuk adegan tanpa narasi

export type Line = {
  text: string;
  /** Teks khusus TTS (opsional). Bila kosong, dibuat otomatis oleh src/tts.ts. */
  tts?: string;
  hl?: string[];
  pause?: number;
};

export type SceneScript = {
  id: string;
  chapter: string; // nomor bab di heading, "" untuk tanpa heading
  part?: 1 | 2 | 3; // 1 konsep, 2 gelombang di dunia kimia & jembatan kuantum, 3 penerapan
  title: string;
  lines: Line[];
  lead?: number;
  tail?: number;
  fixed?: number;
  mood: 'mystery' | 'title' | 'wonder' | 'build' | 'tension' | 'bright' | 'resolve' | 'outro';
};

export const SCRIPT: SceneScript[] = [
  {
    "id": "hook",
    "chapter": "",
    "title": "Riak, senar, dan cahaya",
    "mood": "mystery",
    "lead": 1.6,
    "tail": 1.2,
    "lines": [
      {
        "text": "Jatuhkan sebutir kerikil ke kolam. Riak menyebar ke segala arah, tetapi daun yang mengapung hanya naik-turun di tempat.",
        "hl": [
          "hanya naik-turun di tempat"
        ],
        "pause": 0.7
      },
      {
        "text": "Petik senar gitar. Senar bergetar, dan beberapa saat kemudian telinga kita mendengar nada.",
        "hl": [
          "mendengar nada"
        ],
        "pause": 0.7
      },
      {
        "text": "Cahaya matahari menempuh seratus lima puluh juta kilometer ruang hampa untuk sampai ke mata kita.",
        "hl": [
          "ruang hampa"
        ],
        "pause": 0.8
      },
      {
        "text": "Ketiganya adalah gelombang:",
        "pause": 0.4
      },
      {
        "text": "getaran yang berjalan, membawa energi tanpa membawa materinya.",
        "hl": [
          "membawa energi tanpa membawa materinya"
        ],
        "pause": 0.9
      },
      {
        "text": "Dan di dunia kuantum, elektron pun ternyata berperilaku seperti gelombang.",
        "hl": [
          "elektron pun"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "title",
    "chapter": "",
    "title": "Getaran yang Berjalan",
    "mood": "title",
    "fixed": 8,
    "lines": []
  },
  {
    "id": "roadmap",
    "chapter": "",
    "title": "Peta video",
    "mood": "wonder",
    "lead": 0.8,
    "tail": 1.4,
    "lines": [
      {
        "text": "Video ini membahas gelombang dalam tiga bagian.",
        "hl": [
          "gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian pertama, konsep: jenis gelombang, besaran gelombang, persamaan gelombang, cepat rambat, interferensi, gelombang berdiri, dan bunyi.",
        "hl": [
          "konsep"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian kedua, gelombang di dunia kimia: cahaya, difraksi sinar-X pada kristal, gelombang materi, dan jembatan ke kuantum.",
        "hl": [
          "dunia kimia"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian ketiga, penerapan: alat musik, ultrasonografi, dan peredam bising.",
        "hl": [
          "penerapan"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "kinds",
    "chapter": "01",
    "title": "Getaran yang merambat",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Gelombang lahir dari osilasi. Ketika satu bagian medium bergetar, ia menarik tetangganya ikut bergetar, sedikit terlambat.",
        "hl": [
          "sedikit terlambat"
        ],
        "pause": 0.7
      },
      {
        "text": "Getaran itu diteruskan dari satu titik ke titik berikutnya. Yang berjalan adalah polanya, bukan mediumnya.",
        "hl": [
          "bukan mediumnya"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila medium bergetar tegak lurus arah rambat, seperti tali yang dikibaskan, gelombangnya disebut gelombang transversal.",
        "hl": [
          "gelombang transversal"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila medium bergetar searah arah rambat, membentuk rapatan dan renggangan seperti pegas slinki, gelombangnya disebut gelombang longitudinal.",
        "hl": [
          "gelombang longitudinal"
        ],
        "pause": 0.7
      },
      {
        "text": "Bunyi di udara adalah gelombang longitudinal. Gelombang pada senar adalah gelombang transversal.",
        "hl": [
          "Bunyi di udara"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "quantities",
    "chapter": "02",
    "title": "Panjang gelombang, frekuensi, dan cepat rambat",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Jarak antara dua puncak yang berurutan disebut panjang gelombang, lambda.",
        "hl": [
          "panjang gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Banyaknya puncak yang lewat setiap detik adalah frekuensi, f. Waktu antarpuncak adalah periode, T.",
        "hl": [
          "frekuensi"
        ],
        "pause": 0.7
      },
      {
        "text": "Dalam satu periode, gelombang maju tepat satu panjang gelombang. Jadi cepat rambatnya v sama dengan lambda kali f.",
        "hl": [
          "v sama dengan lambda kali f"
        ],
        "pause": 0.7
      },
      {
        "text": "Bunyi di udara merambat sekitar tiga ratus empat puluh meter per detik.",
        "hl": [
          "tiga ratus empat puluh"
        ],
        "pause": 0.7
      },
      {
        "text": "Nada empat ratus empat puluh hertz, nada A untuk menyetem alat musik, punya panjang gelombang sekitar tujuh puluh tujuh sentimeter.",
        "hl": [
          "tujuh puluh tujuh sentimeter"
        ],
        "pause": 0.7
      },
      {
        "text": "Cepat rambat ditentukan oleh medium. Frekuensi ditentukan oleh sumber getarnya.",
        "hl": [
          "ditentukan oleh medium",
          "ditentukan oleh sumber"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "equation",
    "chapter": "03",
    "title": "Persamaan gelombang",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bagaimana menuliskan gelombang yang berjalan sebagai rumus?",
        "hl": [
          "sebagai rumus"
        ],
        "pause": 0.7
      },
      {
        "text": "Simpangan setiap titik bergantung pada dua hal sekaligus: posisinya, x, dan waktunya, t.",
        "hl": [
          "posisinya",
          "waktunya"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk gelombang sinus yang berjalan ke kanan: y sama dengan A sinus, k x dikurangi omega t.",
        "hl": [
          "k x dikurangi omega t"
        ],
        "pause": 0.7
      },
      {
        "text": "k adalah bilangan gelombang, dua pi per lambda. Omega adalah frekuensi sudut, dua pi f, sama seperti pada osilasi.",
        "hl": [
          "bilangan gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Bekukan waktunya, dan kita melihat foto gelombang di sepanjang tali. Bekukan posisinya, dan satu titik itu hanya berosilasi harmonik.",
        "hl": [
          "foto gelombang",
          "berosilasi harmonik"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "speed",
    "chapter": "04",
    "title": "Cepat rambat pada tali",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Gelombang pada tali merambat lebih cepat bila talinya lebih tegang, dan lebih lambat bila talinya lebih berat.",
        "hl": [
          "lebih tegang",
          "lebih berat"
        ],
        "pause": 0.7
      },
      {
        "text": "Cepat rambatnya akar dari tegangan dibagi massa per satuan panjang: v sama dengan akar F per mu.",
        "hl": [
          "akar F per mu"
        ],
        "pause": 0.7
      },
      {
        "text": "Ini mirip osilasi pegas: tegangan berperan sebagai kekakuan, massa per panjang berperan sebagai kelembaman.",
        "hl": [
          "kekakuan",
          "kelembaman"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena itu senar gitar yang tebal menghasilkan nada rendah, dan memutar penyetem untuk mengencangkan senar menaikkan nadanya.",
        "hl": [
          "menaikkan nadanya"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "interference",
    "chapter": "05",
    "title": "Superposisi dan interferensi",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Dua gelombang dapat melewati tempat yang sama tanpa saling menghancurkan.",
        "hl": [
          "tanpa saling menghancurkan"
        ],
        "pause": 0.7
      },
      {
        "text": "Di tempat bertemu, simpangannya dijumlahkan. Inilah prinsip superposisi.",
        "hl": [
          "prinsip superposisi"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila puncak bertemu puncak, simpangannya saling menguatkan: interferensi konstruktif.",
        "hl": [
          "interferensi konstruktif"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila puncak bertemu lembah, simpangannya saling meniadakan: interferensi destruktif.",
        "hl": [
          "interferensi destruktif"
        ],
        "pause": 0.7
      },
      {
        "text": "Setelah berpapasan, masing-masing gelombang melanjutkan perjalanannya seolah tidak pernah bertemu.",
        "hl": [
          "seolah tidak pernah bertemu"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "standing",
    "chapter": "06",
    "title": "Gelombang berdiri",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Sekarang ikat kedua ujung tali. Gelombang memantul bolak-balik dan bertumpang tindih dengan pantulannya sendiri.",
        "hl": [
          "pantulannya sendiri"
        ],
        "pause": 0.7
      },
      {
        "text": "Hasilnya gelombang berdiri: ada titik yang tidak pernah bergerak, disebut simpul, dan titik yang bergetar paling kuat, disebut perut.",
        "hl": [
          "simpul",
          "perut"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena kedua ujung harus menjadi simpul, hanya gelombang tertentu yang muat: panjang tali harus kelipatan setengah panjang gelombang.",
        "hl": [
          "setengah panjang gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Lambda ke-n sama dengan dua L per n, dan frekuensinya n kali frekuensi dasar.",
        "hl": [
          "n kali frekuensi dasar"
        ],
        "pause": 0.7
      },
      {
        "text": "Tali tidak bisa bergetar dengan frekuensi sembarang. Hanya frekuensi tertentu yang diizinkan.",
        "hl": [
          "Hanya frekuensi tertentu"
        ],
        "pause": 0.7
      },
      {
        "text": "Batasan membuat pilihan menjadi diskret. Ingat gagasan ini, karena inilah inti kuantisasi.",
        "hl": [
          "inti kuantisasi"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "sound",
    "chapter": "07",
    "title": "Bunyi dan efek Doppler",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bunyi adalah rapatan dan renggangan udara yang merambat. Tinggi nada ditentukan frekuensi, keras bunyi ditentukan amplitudo.",
        "hl": [
          "frekuensi",
          "amplitudo"
        ],
        "pause": 0.7
      },
      {
        "text": "Telinga manusia mendengar sekitar dua puluh hingga dua puluh ribu hertz.",
        "hl": [
          "dua puluh ribu hertz"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila sumber bunyi mendekat, puncak-puncaknya berdesakan di depan: panjang gelombang memendek dan nadanya naik.",
        "hl": [
          "nadanya naik"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila sumber menjauh, puncaknya merenggang dan nadanya turun. Inilah efek Doppler, seperti sirene ambulans yang lewat.",
        "hl": [
          "efek Doppler"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "light",
    "chapter": "08",
    "title": "Cahaya: gelombang elektromagnetik",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Cahaya juga gelombang, tetapi yang bergetar bukan medium, melainkan medan listrik dan medan magnet.",
        "hl": [
          "medan listrik dan medan magnet"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena itu cahaya dapat merambat di ruang hampa, dengan kecepatan tiga ratus juta meter per detik.",
        "hl": [
          "tiga ratus juta meter per detik"
        ],
        "pause": 0.7
      },
      {
        "text": "Rumusnya sama: c sama dengan lambda kali nu. Cahaya hijau lima ratus nanometer bergetar enam kali sepuluh pangkat empat belas kali per detik.",
        "hl": [
          "enam kali sepuluh pangkat empat belas"
        ],
        "pause": 0.7
      },
      {
        "text": "Dari gelombang radio, gelombang mikro, inframerah, cahaya tampak, ultraungu, sampai sinar-X, semuanya gelombang yang sama dengan panjang gelombang berbeda.",
        "hl": [
          "panjang gelombang berbeda"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada tahun delapan belas nol satu, Thomas Young menyinari dua celah sempit, dan di layar muncul pita terang-gelap: bukti bahwa cahaya berinterferensi.",
        "hl": [
          "Thomas Young"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "xray",
    "chapter": "09",
    "title": "Difraksi sinar-X pada kristal",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bagaimana kimiawan mengetahui susunan atom di dalam kristal garam, padahal atom terlalu kecil untuk dilihat?",
        "hl": [
          "susunan atom"
        ],
        "pause": 0.7
      },
      {
        "text": "Jarak antarbidang atom dalam kristal hanya sepersekian nanometer, seukuran panjang gelombang sinar-X.",
        "hl": [
          "seukuran panjang gelombang sinar-X"
        ],
        "pause": 0.7
      },
      {
        "text": "Sinar-X yang dipantulkan bidang-bidang atom berinterferensi. Pantulan saling menguatkan hanya bila selisih lintasannya kelipatan bulat panjang gelombang.",
        "hl": [
          "kelipatan bulat"
        ],
        "pause": 0.7
      },
      {
        "text": "Inilah hukum Bragg: n lambda sama dengan dua d sinus theta.",
        "hl": [
          "hukum Bragg"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk natrium klorida dengan sinar-X tembaga, puncak terkuatnya muncul pada sudut sekitar enam belas derajat, sesuai jarak antarbidang nol koma dua delapan nanometer.",
        "hl": [
          "enam belas derajat"
        ],
        "pause": 0.7
      },
      {
        "text": "Dari pola titik-titik terang itulah struktur garam, protein, bahkan DNA berhasil diungkap.",
        "hl": [
          "DNA"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "matter",
    "chapter": "10",
    "title": "Gelombang materi",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Pada tahun sembilan belas dua puluh empat, Louis de Broglie mengajukan gagasan berani: bila cahaya bisa bersifat partikel, partikel juga bisa bersifat gelombang.",
        "hl": [
          "de Broglie"
        ],
        "pause": 0.7
      },
      {
        "text": "Panjang gelombangnya lambda sama dengan h per p, tetapan Planck dibagi momentum.",
        "hl": [
          "h per p"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektron dengan energi lima puluh empat elektronvolt punya panjang gelombang sekitar nol koma satu tujuh nanometer, seukuran jarak antaratom.",
        "hl": [
          "nol koma satu tujuh nanometer"
        ],
        "pause": 0.7
      },
      {
        "text": "Tahun sembilan belas dua puluh tujuh, Davisson dan Germer menembakkan elektron ke kristal nikel, dan elektron itu berdifraksi persis seperti sinar-X.",
        "hl": [
          "berdifraksi"
        ],
        "pause": 0.7
      },
      {
        "text": "Bola kasti yang dilempar empat puluh meter per detik juga punya panjang gelombang, tetapi hanya sekitar sepuluh pangkat minus tiga puluh empat meter, terlalu kecil untuk teramati.",
        "hl": [
          "terlalu kecil untuk teramati"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "bridge",
    "chapter": "11",
    "title": "Jembatan ke dunia kuantum",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Sekarang gabungkan dua gagasan: elektron adalah gelombang, dan gelombang yang dikurung hanya boleh berbentuk tertentu.",
        "hl": [
          "dikurung"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektron yang terkurung dalam sebuah kotak harus membentuk gelombang berdiri, sama seperti tali yang kedua ujungnya terikat.",
        "hl": [
          "gelombang berdiri"
        ],
        "pause": 0.7
      },
      {
        "text": "Hanya panjang gelombang tertentu yang muat, jadi hanya momentum tertentu, dan hanya energi tertentu yang diizinkan.",
        "hl": [
          "hanya energi tertentu"
        ],
        "pause": 0.7
      },
      {
        "text": "Inilah asal tingkat energi diskret pada atom dan molekul. Orbital atom tidak lain adalah gelombang berdiri tiga dimensi dari elektron.",
        "hl": [
          "gelombang berdiri tiga dimensi"
        ],
        "pause": 0.7
      },
      {
        "text": "Persamaan Schrödinger, yang menjadi dasar kimia kuantum, adalah persamaan gelombang untuk materi.",
        "hl": [
          "persamaan gelombang untuk materi"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "music",
    "chapter": "12",
    "title": "Alat musik",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Senar gitar adalah tali dengan kedua ujung terikat, jadi ia bergetar dalam gelombang berdiri.",
        "hl": [
          "gelombang berdiri"
        ],
        "pause": 0.7
      },
      {
        "text": "Senar A sepanjang enam puluh lima sentimeter bergetar dengan nada dasar seratus sepuluh hertz.",
        "hl": [
          "seratus sepuluh hertz"
        ],
        "pause": 0.7
      },
      {
        "text": "Bersamaan dengan itu, ia juga bergetar pada harmonik dua ratus dua puluh, tiga ratus tiga puluh hertz, dan seterusnya. Campuran harmonik inilah yang memberi warna suara.",
        "hl": [
          "warna suara"
        ],
        "pause": 0.7
      },
      {
        "text": "Menekan senar pada fret memperpendek bagian yang bergetar, sehingga panjang gelombang memendek dan nadanya naik.",
        "hl": [
          "nadanya naik"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "ultrasound",
    "chapter": "13",
    "title": "Ultrasonografi",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Ultrasonografi memakai bunyi berfrekuensi jutaan hertz, jauh di atas batas pendengaran.",
        "hl": [
          "jutaan hertz"
        ],
        "pause": 0.7
      },
      {
        "text": "Gelombang ini merambat dalam jaringan tubuh sekitar seribu lima ratus empat puluh meter per detik, lalu sebagian memantul di setiap batas jaringan.",
        "hl": [
          "memantul"
        ],
        "pause": 0.7
      },
      {
        "text": "Alat mengukur waktu pantulan. Gema yang kembali setelah enam puluh lima mikrodetik berasal dari kedalaman sekitar lima sentimeter.",
        "hl": [
          "lima sentimeter"
        ],
        "pause": 0.7
      },
      {
        "text": "Dari ribuan gema itu, komputer menyusun gambar janin atau organ, tanpa radiasi pengion.",
        "hl": [
          "tanpa radiasi pengion"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "anc",
    "chapter": "14",
    "title": "Peredam bising",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Headphone peredam bising punya mikrofon kecil yang terus mendengarkan suara sekitar.",
        "hl": [
          "mikrofon kecil"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektroniknya membuat gelombang tandingan dengan bentuk sama tetapi terbalik: puncak di tempat lembah.",
        "hl": [
          "terbalik"
        ],
        "pause": 0.7
      },
      {
        "text": "Kedua gelombang berinterferensi destruktif, dan bising yang sampai ke telinga jauh berkurang.",
        "hl": [
          "interferensi destruktif"
        ],
        "pause": 0.7
      },
      {
        "text": "Cara ini paling efektif untuk dengung rendah yang teratur, seperti suara mesin pesawat.",
        "hl": [
          "dengung rendah"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "recap",
    "chapter": "15",
    "title": "Rangkuman",
    "mood": "resolve",
    "lead": 1.0,
    "tail": 1.6,
    "lines": [
      {
        "text": "Mari rangkum.",
        "pause": 0.5
      },
      {
        "text": "Gelombang adalah osilasi yang merambat, membawa energi tanpa membawa medium. Cepat rambatnya v sama dengan lambda kali f.",
        "hl": [
          "v sama dengan lambda kali f"
        ],
        "pause": 0.7
      },
      {
        "text": "Gelombang yang bertemu dijumlahkan: saling menguatkan atau saling meniadakan.",
        "hl": [
          "dijumlahkan"
        ],
        "pause": 0.7
      },
      {
        "text": "Gelombang yang dikurung membentuk gelombang berdiri, dan hanya frekuensi tertentu yang diizinkan.",
        "hl": [
          "hanya frekuensi tertentu"
        ],
        "pause": 0.7
      },
      {
        "text": "Cahaya adalah gelombang elektromagnetik, sinar-X mengungkap susunan atom, dan elektron pun adalah gelombang dengan lambda sama dengan h per p.",
        "hl": [
          "elektron pun adalah gelombang"
        ],
        "pause": 0.7
      },
      {
        "text": "Jadi, setiap kali melihat sesuatu yang berulang dan merambat, tanyakan: berapa panjang gelombangnya, dan apa yang membatasinya?",
        "hl": [
          "apa yang membatasinya"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "outro",
    "chapter": "",
    "title": "Penutup",
    "mood": "outro",
    "fixed": 16,
    "lines": []
  }
];
