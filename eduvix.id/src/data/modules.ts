import { LearningModule } from "../types";

export const learningModules: LearningModule[] = [
  {
    id: "logic-basics",
    title: "Dasar Logika & Penalaran",
    description: "Pelajari perbedaan mendasar antara penalaran deduktif, induktif, dan cara membentuk fondasi argumen yang kokoh.",
    durationMinutes: 15,
    difficulty: "Dasar",
    xpReward: 50,
    quizId: "quiz-logic",
    pages: [
      {
        title: "Apa itu Berpikir Kritis?",
        content: `### Mengapa Berpikir Kritis Sangat Penting?
Berpikir kritis bukanlah sekadar mendebat atau menyangkal pendapat orang lain. Berpikir kritis adalah **proses intelektual yang disiplin** untuk secara aktif dan terampil mengonseptualisasikan, menerapkan, menganalisis, mensintesis, dan mengevaluasi informasi yang dikumpulkan dari pengamatan, pengalaman, refleksi, penalaran, atau komunikasi.

Tanpa kemampuan ini, kita mudah terjebak oleh informasi bohong (hoax), manipulasi media, dan pengambilan keputusan yang impulsif.

#### 3 Komponen Utama Berpikir Kritis:
1. **Curiosity (Keingintahuan):** Selalu bertanya "Mengapa?" dan "Bagaimana kita bisa tahu?"
2. **Skepticism (Skeptisisme Sehat):** Tidak langsung mempercayai klaim tanpa bukti nyata.
3. **Humility (Kerendahan Hati):** Bersedia mengakui kesalahan saat bukti baru menunjukkan bahwa pandangan kita salah.`
      },
      {
        title: "Penalaran Deduktif vs Induktif",
        content: `### Memahami Metode Penalaran

Untuk membikin kesimpulan yang benar, kita harus memahami dua metode penalaran utama:

#### 1. Penalaran Deduktif (Umum ke Khusus)
Menarik kesimpulan spesifik berdasarkan premis-premis umum yang dianggap benar. Jika semua premis benar dan logis, kesimpulan **pasti** benar.
*   **Premis 1:** Semua manusia berakal budi. (Umum)
*   **Premis 2:** Budi adalah seorang manusia. (Spesifik)
*   **Kesimpulan:** Budi berakal budi. (Pasti benar)

#### 2. Penalaran Induktif (Khusus ke Umum)
Menarik kesimpulan umum berdasarkan pengamatan-pengamatan spesifik. Kesimpulan induktif bersifat **probabilitas** (bisa jadi benar, tapi belum tentu mutlak).
*   **Pengamatan 1:** Angsa di danau A berwarna putih.
*   **Pengamatan 2:** Angsa di danau B berwarna putih.
*   **Kesimpulan:** Semua angsa di dunia berwarna putih. *(Kesimpulan ini salah jika kita menemukan angsa hitam di Australia, menunjukkan sifat probabilistik induksi).*`
      },
      {
        title: "Menilai Argumen Secara Valid & Kuat",
        content: `### Struktur Sebuah Argumen

Sebuah argumen yang logis terdiri dari dua hal utama: **Premis** (pernyataan pendukung/bukti) dan **Konklusi** (kesimpulan akhir).

#### Cara Memverifikasi Argumen:
*   **Validitas (Valid):** Apakah struktur logisnya benar? Jika premisnya benar, kesimpulan harus mengikuti premis tersebut secara otomatis.
*   **Kebenaran Faktual:** Apakah premis-premis tersebut didasarkan pada data dan kenyataan empiris, bukan sekadar opini atau asumsi?
*   **Sounness (Ketangguhan):** Argumen dikatakan *Sound* hanya jika strukturnya valid **DAN** semua premisnya benar secara faktual.`
      }
    ]
  },
  {
    id: "cognitive-biases",
    title: "Mengenal Bias Kognitif",
    description: "Pahami bagaimana otak kita sering melakukan 'jalan pintas' mental yang berujung pada kesalahan keputusan yang fatal.",
    durationMinutes: 20,
    difficulty: "Dasar",
    xpReward: 60,
    quizId: "quiz-biases",
    pages: [
      {
        title: "Sistem 1 & Sistem 2 Otak Kita",
        content: `### Bagaimana Otak Kita Berpikir?
Menurut psikolog Daniel Kahneman (pemenang Nobel), otak manusia bekerja dalam dua sistem utama:

#### 1. Sistem 1 (Cepat, Otomatis, Intuitif)
Sistem ini beroperasi secara instan tanpa usaha keras. Sangat bagus untuk bertahan hidup (misalnya, menghindar dari mobil yang melaju), tetapi rentan terhadap **Bias Kognitif**.

#### 2. Sistem 2 (Lambat, Analitis, Reflektif)
Sistem ini membutuhkan energi, konsentrasi, dan usaha sadar. Digunakan saat menghitung matematika rumit, membandingkan dua opsi investasi, atau membaca argumen filosofis.`
      },
      {
        title: "3 Bias Kognitif Terpopuler",
        content: `### Bias-Bias yang Sering Menipu Kita

Berikut adalah bias kognitif yang paling sering mengaburkan rasionalitas kita sehari-hari:

#### 1. Confirmation Bias (Bias Konfirmasi)
Kecenderungan untuk mencari, menafsirkan, dan mengingat informasi yang hanya mendukung keyakinan awal kita, sambil mengabaikan bukti yang berlawanan.
*   *Contoh:* Membaca artikel berita yang sepaham saja dan langsung membuang berita yang mengkritik tokoh favorit Anda.

#### 2. Anchoring Bias (Bias Jangkar)
Kecenderungan terlalu bergantung pada informasi pertama yang diterima (jangkar) saat membuat keputusan selanjutnya.
*   *Contoh:* Sebuah kaos ditandai seharga Rp1.000.000 lalu didiskon jadi Rp300.000. Anda menganggapnya sangat murah, padahal harga aslinya memang Rp200.000.

#### 3. Dunning-Kruger Effect
Fenomena di mana orang yang tidak kompeten merasa dirinya sangat cerdas dan menguasai segalanya, sementara para ahli justru merasa ragu-ragu karena tahu betapa kompleksnya masalah tersebut.`
      }
    ]
  },
  {
    id: "logical-fallacies",
    title: "Kesesatan Berpikir (Logical Fallacies)",
    description: "Pelajari aneka cacat logika dalam argumen yang sengaja atau tidak sengaja digunakan untuk manipulasi opini.",
    durationMinutes: 25,
    difficulty: "Menengah",
    xpReward: 70,
    quizId: "quiz-fallacies",
    pages: [
      {
        title: "Apa itu Logical Fallacy?",
        content: `### Cacat Logika dalam Berargumen

**Logical Fallacy** adalah argumen yang terdengar meyakinkan atau persuasif, tetapi sebenarnya memiliki kesalahan dalam struktur logisnya sehingga kesimpulannya menjadi tidak sah.

Mengetahui tipe-tipe fallacy membantu Anda mendeteksi manipulasi dalam debat politik, iklan pemasaran, atau argumen online sehari-hari.`
      },
      {
        title: "Fallacy Populer - Bagian 1",
        content: `### 3 Fallacy yang Sering Dijumpai

#### 1. Ad Hominem (Menyerang Pribadi)
Menolak suatu argumen dengan cara menyerang karakter, latar belakang, atau fisik orang yang menyampaikan argumen, bukannya membahas isi argumen itu sendiri.
*   *Contoh:* "Kamu kan cuma mahasiswa biasa, tahu apa soal ekonomi makro negara kita?"

#### 2. Strawman Fallacy (Manusia Jerami)
Membengkokkan atau menyederhanakan argumen lawan secara berlebihan agar menjadi terlihat bodoh atau ekstrem, lalu menyerang argumen hasil modifikasi tersebut.
*   *Contoh:* 
    *   *A:* "Menurut saya, anggaran riset edukasi di sekolah perlu ditingkatkan."
    *   *B:* "Ooh, jadi kamu mau memotong semua gaji guru hanya untuk membeli alat lab canggih?!"

#### 3. Slippery Slope
Mengasumsikan bahwa jika langkah kecil A diambil, maka kejadian ekstrem Z pasti akan terjadi sebagai akibat berantai, tanpa menyertakan bukti logis atas efek berantai tersebut.
*   *Contoh:* "Kalau anak-anak diperbolehkan main game di akhir pekan, besok mereka tidak mau sekolah, nanti putus sekolah, jadi kriminal, dan masuk penjara."`
      },
      {
        title: "Fallacy Populer - Bagian 2",
        content: `### Menemukan Cacat Logika Lebih Dalam

#### 4. Black or White (False Dilemma)
Menyajikan situasi seolah-olah hanya ada dua pilihan ekstrem, padahal kenyataannya ada banyak alternatif pilihan lain di tengah-tengahnya.
*   *Contoh:* "Kalau kamu tidak mendukung keputusan walikota, berarti kamu musuh masyarakat kota ini!"

#### 5. Bandwagon Fallacy (Ad Populum)
Mengklaim bahwa sesuatu itu benar atau baik hanya karena banyak orang mempercayai atau melakukannya.
*   *Contoh:* "Obat diet herbal ini pasti aman dan mujarab sekali, buktinya dipakai oleh jutaan orang di seluruh Indonesia!"`
      }
    ]
  },
  {
    id: "rhetoric-analysis",
    title: "Menganalisis Argumen & Retorika",
    description: "Pelajari segitiga retorika klasik Aristoteles: Ethos, Pathos, dan Logos untuk membedakan persuasi logis & emosional.",
    durationMinutes: 18,
    difficulty: "Menengah",
    xpReward: 65,
    quizId: "quiz-rhetoric",
    pages: [
      {
        title: "Segitiga Retorika Aristoteles",
        content: `### Retorika: Seni Persuasi

Lebih dari 2000 tahun lalu, Aristoteles menjabarkan tiga tiang utama dalam memengaruhi orang lain melalui perkataan:

1. **Ethos (Kredibilitas/Karakter):** Membujuk pendengar melalui otoritas, moralitas, keahlian, dan reputasi pembicara. 
2. **Pathos (Emosi):** Menggunakan narasi, visual imajinatif, atau kata-kata emosional untuk memicu empati, rasa takut, marah, atau cinta pada audiens.
3. **Logos (Logika/Bukti):** Menggunakan fakta, data statistik, analisis rasional, dan penalaran runtut untuk membuktikan klaim.

#### Proporsi Seimbang:
Pembujuk yang handal namun manipulatif sering kali menumpuk **Pathos** (emosi) setinggi mungkin sambil mengosongkan **Logos** (data), membuat audiens setuju secara emosional tanpa landasan logika yang solid.`
      },
      {
        title: "Mendeteksi Taktik Retorika Manipulatif",
        content: `### Lindungi Pikiran Anda dari Propaganda

#### Taktik Pengalihan Isu yang Sering Digunakan:
*   **Red Herring (Ikan Merah):** Memperkenalkan topik sekunder yang sama sekali tidak relevan guna mengalihkan perhatian dari isu utama yang sedang dibahas.
*   **Whataboutism:** Menghindari kritik dengan cara menuduh lawan melakukan hal buruk yang sama atau lebih buruk ("Bagaimana dengan negara X yang melakukan itu juga?").
*   **Loaded Language:** Memilih kata-kata berbobot emosi sangat negatif atau sangat positif untuk melabeli sesuatu tanpa menyajikan argumen objektif.`
      }
    ]
  },
  {
    id: "scientific-method",
    title: "Metode Ilmiah dlm Keseharian",
    description: "Bagaimana cara ilmuwan menguji hipotesis, dan bagaimana Anda bisa mengadopsi cara berpikir ini untuk memecahkan masalah sehari-hari.",
    durationMinutes: 20,
    difficulty: "Mahir",
    xpReward: 80,
    quizId: "quiz-scientific",
    pages: [
      {
        title: "Cara Berpikir Seperti Ilmuwan",
        content: `### Sains Bukan Sekadar Kumpulan Rumus

Metode ilmiah adalah proses sistematis empiris untuk mengeksplorasi pengamatan, menjawab pertanyaan, dan menguji dugaan (hipotesis).

#### Siklus Langkah Metode Ilmiah:
1.  **Observasi:** Mengamati sekeliling. *Contoh:* Lampu minyak di ruang tamu tiba-tiba redup.
2.  **Mengajukan Pertanyaan:** Mengapa lampu meredup?
3.  **Hipotesis:** Membuat dugaan sementara yang dapat diuji. "Minyak di dalam tabung lampu sudah habis."
4.  **Eksperimen / Pengujian:** Memeriksa isi minyak.
5.  **Analisis Data & Kesimpulan:** Ternyata minyak masih penuh. Berarti hipotesis salah, saatnya merumuskan hipotesis baru (misalnya sumbu lampu kotor/pendek).`
      },
      {
        title: "Korelasi vs Kausalitas",
        content: `### Jangan Tertukar: Hubungan vs Sebab-Akibat

Salah satu kesalahan paling umum dalam menafsirkan data ilmiah maupun berita harian adalah menganggap korelasi sebagai kausalitas (sebab-akibat).

*   **Korelasi:** Dua variabel berubah bersamaan.
*   **Kausalitas:** Perubahan pada satu variabel secara langsung mengakibatkan variabel kedua berubah.

#### Contoh Klasik:
*   *Pengamatan:* Penjualan es krim meningkat pesat di musim panas. Pada saat yang sama, angka serangan hiu di pantai juga meningkat drastis.
*   *Kesimpulan Salah (Kausalitas Palsu):* Makan es krim membuat orang diserang hiu, atau digigit hiu membuat orang lapar es krim.
*   *Penyebab Sebenarnya (Variabel Pengganggu):* Cuaca panas (musim panas) membuat orang lebih banyak makan es krim **DAN** lebih banyak pergi berenang ke laut!`
      }
    ]
  },
  {
    id: "decision-making",
    title: "Pengambilan Keputusan Berbasis Data",
    description: "Gunakan Decision Matrix dan analisis SWOT untuk memilah pilihan karir, bisnis, maupun keputusan personal penting lainnya.",
    durationMinutes: 22,
    difficulty: "Mahir",
    xpReward: 85,
    quizId: "quiz-decision",
    pages: [
      {
        title: "Alat Pengambilan Keputusan: SWOT",
        content: `### Menganalisis Pilihan Anda Secara Objektif

Ketika diperhadapkan pada pilihan besar yang membingungkan, coretan acak di kertas jarang membantu. Kita memerlukan kerangka analisis terstruktur.

#### Analisis SWOT:
*   **Strengths (Kekuatan):** Faktor internal positif yang menguntungkan pilihan Anda.
*   **Weaknesses (Kelemahan):** Hambatan internal yang perlu diperbaiki atau diantisipasi.
*   **Opportunities (Peluang):** Tren eksternal atau situasi menguntungkan yang bisa dimanfaatkan.
*   **Threats (Ancaman):** Risiko eksternal di luar kendali Anda yang berpotensi menggagalkan rencana.`
      },
      {
        title: "Menggunakan Matrix Keputusan Berbobot",
        content: `### Masalah Kompleks? Pakai Decision Matrix!

Jika Anda bingung memilih antara 3 tawaran kerja atau 3 ide bisnis, ikuti prosedur kuantitatif ini:

1.  **Daftar Opsi:** Opsi A, B, C.
2.  **Tentukan Kriteria:** Gaji, Fleksibilitas Waktu, Jarak, Peluang Belajar.
3.  **Berikan Bobot Kriteria (1-5):** Gaji sangat penting (bobot 5), lokasi cukup penting (bobot 3).
4.  **Skor Setiap Opsi:** Nilai kriteria opsi A, B, dan C dari skala 1 sampai 10.
5.  **Kalikan Skor dengan Bobot:** Jumlahkan seluruh totalnya. Opsi dengan total nilai tertinggi adalah pemenangnya secara logis dan terstruktur.`
      }
    ]
  }
];
