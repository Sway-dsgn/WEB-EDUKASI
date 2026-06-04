import { Achievement } from "../types";

export const achievements: Achievement[] = [
  {
    id: "materi-1",
    title: "Pelajar Pemula",
    description: "Selesaikan 1 modul materi berpikir kritis.",
    category: "materi",
    threshold: 1,
    iconName: "BookOpen",
    pointsReward: 100
  },
  {
    id: "materi-6",
    title: "Master Logika",
    description: "Selesaikan semua 6 modul berpikir kritis.",
    category: "materi",
    threshold: 6,
    iconName: "Award",
    pointsReward: 500
  },
  {
    id: "streak-3",
    title: "Skeptisisme Rutin",
    description: "Pertahankan 3 hari streak belajar berturut-turut.",
    category: "streak",
    threshold: 3,
    iconName: "Flame",
    pointsReward: 150
  },
  {
    id: "streak-7",
    title: "Disiplin Intelektual",
    description: "Pertahankan 7 hari streak belajar berturut-turut.",
    category: "streak",
    threshold: 7,
    iconName: "Zap",
    pointsReward: 300
  },
  {
    id: "quiz-perfect",
    title: "Akurasi Sempurna",
    description: "Selesaikan ujian/kuis master dengan skor maksimal.",
    category: "quiz",
    threshold: 100,
    iconName: "CheckCircle",
    pointsReward: 250
  },
  {
    id: "level-5",
    title: "Pemikir Kritis Berbakat",
    description: "Mencapai Level 5.",
    category: "level",
    threshold: 5,
    iconName: "ChevronUp",
    pointsReward: 200
  },
  {
    id: "belanja-1",
    title: "Kolektor Hadiah",
    description: "Beli 1 produk bermanfaat di Toko Hadiah.",
    category: "belanja",
    threshold: 1,
    iconName: "ShoppingBag",
    pointsReward: 100
  }
];
