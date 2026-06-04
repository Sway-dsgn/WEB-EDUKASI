import { QuizSet } from "../types";

export const quizSets: QuizSet[] = [
  {
    id: "quiz-tka-master",
    title: "Simulasi Ujian TKA Berpikir Kritis (10 Soal)",
    description: "Evaluasi berpikir kritis komprehensif dengan waktu terbatas. Mencakup penalaran silogisme, analisis data, deteksi bias, cacat logika, dan rujukan argumen akademis.",
    xpReward: 150,
    questions: [
      {
        id: "tka-1",
        question: "Semua mahasiswa yang berprestasi sering membaca buku ilmiah. Beberapa mahasiswa yang sering membaca buku ilmiah menyukai kopi hitam. Manakah kesimpulan yang mutlak benar?",
        options: [
          "Beberapa mahasiswa yang berprestasi menyukai kopi hitam.",
          "Semua penyuka kopi hitam adalah mahasiswa yang membaca buku ilmiah.",
          "Mungkin ada mahasiswa berprestasi yang menyukai kopi hitam.",
          "Semua mahasiswa berprestasi tidak menyukai kopi hitam.",
          "Semua penyuka kopi hitam pasti tidak pernah membaca buku ilmiah."
        ],
        correctAnswerIndex: 2,
        explanation: "Pernyataan 'Semua mahasiswa berprestasi sering membaca buku ilmiah' dan 'Beberapa pembaca buku menyukai kopi hitam' tidak menjamin irisan langsung antara berprestasi dengan kopi hitam. Maka, kesimpulan yang mutlak benar adalah kemungkinan ('Mungkin ada') bahwa mahasiswa berprestasi menyukai kopi hitam."
      },
      {
        id: "tka-2",
        question: "Jika musim hujan tiba, ladang Pak Tono basah. Saat ini ladang Pak Tono kering. Kesimpulan logis apa yang bisa ditarik?",
        options: [
          "Saat ini musim kemarau.",
          "Saat ini bukan musim hujan.",
          "Ladang Pak Tono sedang disiram.",
          "Musim hujan akan tiba besok.",
          "Pak Tono baru saja menjual ladangnya."
        ],
        correctAnswerIndex: 1,
        explanation: "Menggunakan aturan Modus Tollens: Jika P maka Q (Hujan -> Basah). Tidak Q (~Basah / Kering). Kesimpulan: Tidak P (~Hujan / Bukan musim hujan). Kita tidak bisa langsung menyimpulkan 'musim kemarau' karena bisa jadi musim pancaroba."
      },
      {
        id: "tka-3",
        question: "Seseorang beralasan: 'Kita tidak boleh menaikkan harga BBM, sebab jika harga BBM naik maka inflasi naik, semua barang mahal, orang tidak sanggup beli makan, kelaparan merajalela, dan terjadi kekacauan nasional.' Cacat logika apa ini?",
        options: [
          "Ad Hominem",
          "Strawman Fallacy",
          "Slippery Slope",
          "False Dilemma",
          "Circular Reasoning"
        ],
        correctAnswerIndex: 2,
        explanation: "Slippery Slope terjadi ketika seseorang mengasumsikan konsekuensi berantai yang sangat ekstrem dari suatu keputusan kecil tanpa melampirkan bukti logis atas terjadinya efek berantai tersebut."
      },
      {
        id: "tka-4",
        question: "Suatu studi menemukan bahwa di kota-kota dengan jumlah gereja tinggi, tingkat kriminalitas juga tinggi. Seseorang menyimpulkan keberadaan gereja memicu kejahatan. Apa kesalahan analisis ini?",
        options: [
          "Mengabaikan variabel pengganggu berupa kepadatan penduduk (korelasi vs kausalitas).",
          "Sampel penelitian terlalu sedikit.",
          "Melakukan bias konfirmasi terhadap tempat ibadah.",
          "Salah menggunakan logika deduktif murni.",
          "Menggunakan argumen Strawman."
        ],
        correctAnswerIndex: 0,
        explanation: "Ini kebingungan klasik antara korelasi dengan kausalitas. Kota yang besar memiliki penduduk yang padat, yang secara alami menaikkan baik jumlah gereja (tempat ibadah) maupun jumlah kasus kriminalitas secara bersamaan. Kepadatan penduduk adalah variabel pengganggu utama."
      },
      {
        id: "tka-5",
        question: "Selama kampanye, seorang kandidat berkata: 'Lawan politik saya ingin memangkas anggaran militer sebesar 5%. Dia jelas-jelas ingin membiarkan negara kita dijajah oleh musuh asing tanpa pertahanan!' Manakah fallacy yang dilakukan?",
        options: [
          "Ad Hominem",
          "Strawman Fallacy",
          "Appeal to Authority",
          "Bandwagon Fallacy",
          "False Cause"
        ],
        correctAnswerIndex: 1,
        explanation: "Kandidat tersebut menyederhanakan dan memutarbalikkan pemotongan anggaran militer 5% menjadi 'membiarkan negara dijajah tanpa pertahanan' (membuat argumen jerami) untuk kemudian diserang dengan mudah."
      },
      {
        id: "tka-6",
        question: "Jika Anda ingin menguji hipotesis 'Kafein meningkatkan konsentrasi belajar mahasiswa', kelompok manakah yang menjadi kelompok kontrol terbaik dalam eksperimen double-blind?",
        options: [
          "Kelompok mahasiswa yang tidak diberi minum apa pun.",
          "Kelompok mahasiswa yang diberi minum air dengan gelas transparan.",
          "Kelompok mahasiswa yang diberi kopi decaf (tanpa kafein) beraroma mirip kopi asli tanpa diberi tahu.",
          "Kelompok mahasiswa yang diizinkan tidur sebelum tes.",
          "Kelompok dosen yang mengawasi jalannya tes konsentrasi."
        ],
        correctAnswerIndex: 2,
        explanation: "Dalam riset terkontrol (control group), kelompok kontrol harus diberi plasebo yang menyerupai obat/zat asli semirip mungkin (kopi decaf) agar efek sugesti psikologis dapat dinetralisir."
      },
      {
        id: "tka-7",
        question: "Analisis data penjualan ponsel menunjukkan: Merek X paling banyak dibeli oleh remaja usia 15-20 tahun. Merek Y paling banyak dibeli oleh pekerja kantoran usia 25-40 tahun. Kesimpulan manakah yang paling valid mendasarkan fakta di atas?",
        options: [
          "Merek X memiliki harga lebih murah dibandingkan merek Y.",
          "Pekerja kantoran membenci merek X dibanding merek Y.",
          "Target pasar merek X adalah remaja, sedangkan merek Y adalah pekerja kantoran.",
          "Fitur kamera merek X lebih disukai remaja daripada merek Y.",
          "Remaja berusia 15-20 tahun memiliki kecenderungan membeli merek X, sedangkan pekerja usia 25-40 cenderung membeli merek Y."
        ],
        correctAnswerIndex: 4,
        explanation: "Pilihan terakhir adalah kesimpulan yang paling objektif dan aman karena langsung mendeskripsikan tren data yang ada, tanpa mengasumsikan alasan di balik perilaku tersebut (harga, fitur, atau kebencian)."
      },
      {
        id: "tka-8",
        question: "Budi mengklaim vaksin flu aman. Anita membalas: 'Tentu saja kamu bicara begitu, pamanmu kan bekerja di perusahaan farmasi raksasa produsen vaksin.' Cacat logika Anita adalah...",
        options: [
          "Ad Hominem (Circumstantial)",
          "Slippery Slope",
          "Appeal to Emotion",
          "Post Hoc Ergo Propter Hoc",
          "Tu Quoque"
        ],
        correctAnswerIndex: 0,
        explanation: "Anita menyerang latar belakang keluarga Budi (paman bekerja di farmasi) alih-alih merujuk data klinis atau bukti empiris tentang keamanan vaksin flu tersebut."
      },
      {
        id: "tka-9",
        question: "Seorang dokter spesialis kulit merekomendasikan produk pelembab merek Z. Orang-orang langsung berbondong-bondong membelinya tanpa memeriksa bahan kimianya. Taktik persuasi dominan yang bekerja di sini adalah...",
        options: [
          "Pathos (Emosi kemanusiaan)",
          "Ethos (Kredibilitas dan keahlian profesi)",
          "Logos (Perhitungan zat kimia)",
          "Ad Populum (Ikut-ikutan tren)",
          "False Dilemma"
        ],
        correctAnswerIndex: 1,
        explanation: "Masyarakat percaya karena rekomendasi datang dari seorang dokter spesialis kulit (sosok ahli). Rekomendasi berdasarkan otoritas keahlian adalah pemanfaatan taktik Ethos."
      },
      {
        id: "tka-10",
        question: "Budi membeli gadget mahal karena ada diskon kilat (flash sale) dari Rp10 juta menjadi Rp4 juta. Di kepalanya terngiang-ngiang: 'Kapan lagi hemat Rp6 juta!'. Padahal ia tidak membutuhkannya dan menguras tabungannya. Bias kognitif apa yang dialami Budi?",
        options: [
          "Confirmation Bias",
          "Anchoring Bias (terpaku pada angka Rp10 juta)",
          "Dunning-Kruger Effect",
          "Halo Effect",
          "Availability Heuristic"
        ],
        correctAnswerIndex: 1,
        explanation: "Budi terkena Anchoring Bias. Nilai jangkar pertama (Rp10 juta) membuat harga Rp4 juta terlihat seperti keuntungan besar, melumpuhkan pemikiran realistisnya apakah barang itu bernilai beli tinggi dan sesuai kebutuhan."
      }
    ]
  },
  {
    id: "quiz-logic",
    title: "Kuis Dasar Logika",
    description: "Evaluasi pemahaman Anda mengenai silogisme, penalaran deduktif vs induktif secara ringkas.",
    xpReward: 30,
    questions: [
      {
        id: "l-1",
        question: "Pernyataan mana yang menunjukkan argumen deduktif?",
        options: [
          "Tiga kucing tetangga saya bulunya halus, jadi semua kucing pasti halus.",
          "Semua logam memuai jika dipanaskan. Besi adalah logam. Besi memuai jika dipanaskan.",
          "Matahari terbit setiap pagi, jadi besok pagi matahari pasti terbit lagi.",
          "Saya selalu mendapat nilai A untuk tugas kuis, jadi UAS nanti saya pasti dapat A."
        ],
        correctAnswerIndex: 1,
        explanation: "Pilihan 2 menggunakan argumen deduktif yang terbukti sound (premis umum ke simpulan khusus mutlak)."
      },
      {
        id: "l-2",
        question: "Jika struktur suatu argumen logis secara runtut, namun salah satu premisnya faktanya salah, maka argumen tersebut dikatakan...",
        options: [
          "Valid, tetapi Unsound (tidak tangguh)",
          "Invalid dan Unsound",
          "Valid dan Sound",
          "Slippery Slope"
        ],
        correctAnswerIndex: 0,
        explanation: "Argumen terstruktur secara logis adalah valid. Tetapi jika ada fakta premis yang keliru, maka argumen itu tidak tangguh (unsound)."
      }
    ]
  },
  {
    id: "quiz-biases",
    title: "Kuis Bias Kognitif",
    description: "Uji kejelian Anda mengenali ilusi pikiran sehari-hari.",
    xpReward: 35,
    questions: [
      {
        id: "b-1",
        question: "Seseorang yang hanya membaca portal berita yang disukai dan langsung menutup opini yang berlawanan merupakan wujud...",
        options: [
          "Anchoring Bias",
          "Confirmation Bias",
          "Dunning-Kruger Effect",
          "Sunk Cost Fallacy"
        ],
        correctAnswerIndex: 1,
        explanation: "Kecenderungan memilah informasi yang searah dengan pemikiran sendiri adalah bias konfirmasi."
      },
      {
        id: "b-2",
        question: "Orang pemula yang baru belajar investasi saham 2 hari merasa panduannya jauh melompati kemampuan fund manager profesional. Ini adalah contoh...",
        options: [
          "Halo Effect",
          "Availability Heuristic",
          "Dunning-Kruger Effect",
          "Sunk Cost Fallacy"
        ],
        correctAnswerIndex: 2,
        explanation: "Efek Dunning-Kruger adalah keyakinan tinggi seorang pemula karena tidak sadar betapa luas dan kompleksnya bidang tersebut."
      }
    ]
  },
  {
    id: "quiz-fallacies",
    title: "Kuis Kesesatan Berpikir",
    description: "Bisakah Anda memergoki cacat logika terselubung?",
    xpReward: 40,
    questions: [
      {
        id: "f-1",
        question: "'Pemerintah melarang kerumunan karena risiko virus. Lawan bicara berujar: Ooh, jadi kalian mau membunuh mata pencaharian semua pedagang kecil secara sengaja?!' Ini adalah...",
        options: [
          "Ad Hominem",
          "Strawman Fallacy",
          "False Dilemma",
          "Slippery Slope"
        ],
        correctAnswerIndex: 1,
        explanation: "Membengkokkan aturan penanggulangan virus seakan dituduh memiliki niat jahat melumpuhkan pedagang kecil adalah Strawman Fallacy."
      },
      {
        id: "f-2",
        question: "'Kalau kamu tidak setuju memakai seragam biru ini, berarti kamu ingin kelompok kita hancur lebur.' Cacat logika ini adalah...",
        options: [
          "Slippery Slope",
          "Bandwagon Fallacy",
          "False Dilemma / Black-or-White",
          "Ad Hominem"
        ],
        correctAnswerIndex: 2,
        explanation: "Membatasi pilihan seakan hanya ada seragam biru atau kehancuran total adalah dilema palsu."
      }
    ]
  },
  {
    id: "quiz-rhetoric",
    title: "Kuis Analisis Retorika",
    description: "Latihan menimbang bobot persuasi dari ethos, pathos, dan logos.",
    xpReward: 35,
    questions: [
      {
        id: "r-1",
        question: "Iklan asuransi menampilkan anak yatim-piatu yang menangis sedih di pemakaman agar pemirsa segera membeli produk perlindungan jiwa. Taktik persuasi utamanya adalah...",
        options: [
          "Logos",
          "Ethos",
          "Pathos",
          "Strawman"
        ],
        correctAnswerIndex: 2,
        explanation: "Memanfaatkan pancingan emosi kesedihan mendalam adalah penerapan taktik Pathos."
      }
    ]
  },
  {
    id: "quiz-scientific",
    title: "Kuis Metode Ilmiah",
    description: "Latihan mendesain eksperimen logis dan memisahkan sebab akibat.",
    xpReward: 40,
    questions: [
      {
        id: "s-1",
        question: "Variabel yang sengaja diubah oleh peneliti untuk mengamati dampaknya disebut...",
        options: [
          "Variabel Terikat",
          "Variabel Bebas (Independent Variable)",
          "Variabel Kontrol",
          "Variabel Pengganggu"
        ],
        correctAnswerIndex: 1,
        explanation: "Variabel bebas (independent) adalah faktor yang sengaja dimanipulasi atau diubah peneliti."
      }
    ]
  },
  {
    id: "quiz-decision",
    title: "Kuis Pengambilan Keputusan",
    description: "Evaluasi kerangka SWOT dan matriks keputusan kuantitatif.",
    xpReward: 40,
    questions: [
      {
        id: "d-1",
        question: "Dalam analisis SWOT, peluang eksternal yang dapat dimanfaatkan untuk kemajuan organisasi dimasukkan ke dalam pilar...",
        options: [
          "Strengths",
          "Weaknesses",
          "Opportunities",
          "Threats"
        ],
        correctAnswerIndex: 2,
        explanation: "Peluang eksternal yang menguntungkan disebut Opportunities."
      }
    ]
  }
];
