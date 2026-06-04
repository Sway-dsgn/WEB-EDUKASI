import React from "react";
import {
  Flame,
  Award,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Play
} from "lucide-react";
import { motion } from "motion/react";
import { UserStats } from "../types";

interface DashboardProps {
  stats: UserStats;
  onNavigate: (tab: string) => void;
  onResumeModule: (moduleId: string) => void;
  onStartQuiz: (quizId: string) => void;
  onDailyCheckIn: () => void;
  onUpdateStats: (newFields: Partial<UserStats>) => void;
}

export default function Dashboard({
  stats,
  onNavigate,
  onResumeModule,
  onStartQuiz,
  onDailyCheckIn,
  onUpdateStats
}: DashboardProps) {
  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = stats.lastCheckInDate === today;
  // Determine time-of-day greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Selamat Pagi";
    if (hours < 17) return "Selamat Siang";
    if (hours < 21) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Safe percentage calculator for XP bar
  const xpPercentage = Math.min(100, Math.floor((stats.xp % 100)));

  // Mocked analytics activities logic
  const weeklyActivity = [
    { day: "Sen", progress: 30, active: true },
    { day: "Sel", progress: 60, active: true },
    { day: "Rab", progress: stats.xp > 50 ? 90 : 15, active: true },
    { day: "Kam", progress: stats.level > 1 ? 75 : 0, active: false },
    { day: "Jum", progress: stats.points > 200 ? 100 : 0, active: false },
    { day: "Sab", progress: stats.completedModules.length > 0 ? 50 : 0, active: false },
    { day: "Min", progress: 0, active: false }
  ];

  const upcomingTasks = [
    {
      id: "ut-1",
      title: "Pahami 'Strawman Fallacy'",
      desc: "Bagian dari Kelas Kesesatan Berpikir",
      duration: "5 menit",
      module: "logical-fallacies"
    },
    {
      id: "ut-2",
      title: "Uraikan Rujukan Korelasi Es Krim",
      desc: "Metode Ilmiah dlm Keseharian",
      duration: "10 menit",
      module: "scientific-method"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between overflow-hidden gap-6"
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs tracking-wider uppercase">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Edisi Pelajar Aktif
          </div>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">
            {getGreeting()},{" "}
            <span className="text-blue-500 capitalize">
              {stats.username.replace(/_/g, " ")}!
            </span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg">
            Sisa hari ini masih panjang untuk mempertajam pikiran dari manipulasi & bias kognitif. Mari lanjutkan latihan rasionalisasi Anda!
          </p>
        </div>

        {/* Quick Launch Action Button */}
        <div className="flex flex-shrink-0">
          <button
            onClick={() => onNavigate("materi")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-95 text-sm"
          >
            <Play size={16} fill="white" />
            Mulai Belajar Sekarang
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>

      {/* Grid Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LEVEL STATCARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs font-medium">Level Belajar</span>
            <div className="p-2 bg-blue-900/10 text-blue-400 rounded-xl border border-blue-500/10">
              <Award size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-sans">Level {stats.level}</div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>{stats.xp % 100} / 100 XP</span>
              <span>Level Selanjutnya</span>
            </div>
          </div>
          {/* Dynamic XP Progress Line */}
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </motion.div>

        {/* STREAK STATCARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-medium">Streak Belajar</span>
              <div className="p-2 bg-orange-900/10 text-orange-400 rounded-xl border border-orange-500/10">
                <Flame size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white font-sans">{stats.streak} Hari</div>
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 select-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStats({ streak: Math.max(0, stats.streak - 1) });
                    }}
                    className="w-6 h-6 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    title="Kurangi Streak"
                  >
                    -
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStats({ streak: stats.streak + 1 });
                    }}
                    className="w-6 h-6 rounded-md bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    title="Tambah Streak"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-zinc-400 text-xs">
                {hasCheckedInToday
                  ? "✓ Absen harian Anda sudah terisi aman untuk hari ini!"
                  : "Absen harian belum diisi. Klaim dlm check-in atau pelajari materi/kuis."}
              </p>
            </div>
            <div className="flex gap-1 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                <div
                  key={dayNum}
                  className={`flex-1 h-1.5 rounded-full ${
                    dayNum <= stats.streak
                      ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                      : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            {hasCheckedInToday ? (
              <span className="inline-flex w-full items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 border border-emerald-800/30 text-emerald-400">
                ✓ Absen Hari Ini Sempurna
              </span>
            ) : (
              <button
                onClick={onDailyCheckIn}
                className="w-full py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-zinc-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 cursor-pointer"
              >
                🔥 Klaim Check-In Harian (+25 Koin)
              </button>
            )}
          </div>
        </motion.div>

        {/* REWARD POINTS STATCARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs font-medium">Logistik Koin (Poin Toko)</span>
            <div className="p-2 bg-amber-900/10 text-amber-500 rounded-xl border border-amber-500/10">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white font-sans">{stats.points} Koin</div>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 select-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStats({ points: Math.max(0, stats.points - 50) });
                  }}
                  className="px-1.5 h-6 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                  title="Kurangi 50 Koin"
                >
                  -50
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStats({ points: stats.points + 50 });
                  }}
                  className="px-1.5 h-6 rounded-md bg-amber-600/20 text-amber-505 hover:bg-amber-600 hover:text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                  title="Tambah 50 Koin"
                >
                  +50
                </button>
              </div>
            </div>
            <p className="text-zinc-400 text-xs">Dapat ditukarkan dengan Voucher & Sertifikasi khusus.</p>
          </div>
          <button
            onClick={() => onNavigate("store")}
            className="text-xs text-amber-500 font-semibold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
          >
            Kunjungi Toko Hadiah <ArrowRight size={12} />
          </button>
        </motion.div>

        {/* PROGRESS COMPLETED */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs font-medium">Modul Selesai</span>
            <div className="p-2 bg-indigo-900/10 text-indigo-400 rounded-xl border border-indigo-500/10">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-sans">
              {stats.completedModules.length} / 6 Modul
            </div>
            <p className="text-zinc-400 text-xs">Menguasai pemahaman dasar hingga tingkat analisis bias.</p>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              style={{ width: `${(stats.completedModules.length / 6) * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Main Dual Component Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Activity Chart (SVG-based) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-white font-sans font-bold text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Aktivitas Belajar Mingguan
              </h3>
              <p className="text-zinc-400 text-xs">Kemajuan konsumsi materi kognitif & pengerjaan kuis.</p>
            </div>
            <span className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-lg flex items-center gap-1.5 font-mono">
              <Calendar size={12} />
              Mei 24 - Mei 30
            </span>
          </div>

          {/* Clean Custom SVG Bar Chart */}
          <div className="relative pt-4">
            <div className="flex h-48 items-end justify-between px-2 sm:px-6 relative border-b border-zinc-800 pb-1">
              {/* Horizontal Help guidelines */}
              <div className="absolute left-0 right-0 top-0 border-t border-dashed border-zinc-800/60 text-[10px] text-zinc-650 font-mono pl-1">100%</div>
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-zinc-800/60 text-[10px] text-zinc-650 font-mono pl-1">50%</div>

              {weeklyActivity.map((act, index) => (
                <div key={index} className="flex flex-col items-center gap-2 w-1/8 group">
                  {/* Floating tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-zinc-950 text-white text-[10px] px-2 py-0.5 rounded border border-zinc-800 transition-opacity font-mono">
                    {act.progress}%
                  </span>
                  
                  {/* Outer Bar wrapper */}
                  <div className="w-full bg-zinc-950 rounded-md h-36 flex items-end overflow-hidden max-w-[28px]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${act.progress}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className={`w-full rounded-b-md ${
                        act.progress === 100
                          ? "bg-emerald-500 shadow-[0_-4px_10px_rgba(16,185,129,0.3)]"
                          : act.progress > 60
                          ? "bg-blue-500 shadow-[0_-4px_10px_rgba(59,130,246,0.3)]"
                          : act.progress > 0
                          ? "bg-indigo-500 shadow-[0_-4px_10px_rgba(99,102,241,0.3)]"
                          : "bg-zinc-800/50"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-505 font-medium">{act.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right upcoming tasks & diagnostic launcher */}
        <div className="space-y-6">
          {/* TKA SPECIAL BANNER */}
          <div className="bg-gradient-to-br from-indigo-950 to-zinc-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-48 shadow-lg shadow-indigo-500/5">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                Level Evaluasi Master
              </span>
              <h4 className="text-white font-sans font-extrabold text-lg">
                Ujian TKA Campuran (10 Soal)
              </h4>
              <p className="text-zinc-400 text-xs">
                Asah logika murni, kuasai silogisme lengkap, raih 150 XP instan.
              </p>
            </div>

            <button
              onClick={() => onStartQuiz("quiz-tka-master")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white font-medium py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1 px-4 cursor-pointer"
            >
              Mulai Ujian Simulasi
              <ArrowRight size={14} />
            </button>
          </div>

          {/* UPCOMING AGENDA */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-sans font-bold text-sm flex items-center gap-1.5">
                <Clock size={16} className="text-zinc-400" />
                Upcoming Agenda
              </h4>
              <span className="text-[10px] text-zinc-505 font-mono">2 Tugas</span>
            </div>

            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between hover:border-zinc-800 transition-all group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950 border border-blue-900/50 px-2 py-0.5 rounded-md">
                      {task.duration}
                    </span>
                    <h5 className="font-semibold text-white text-xs mt-1.5">
                      {task.title}
                    </h5>
                    <p className="text-zinc-505 text-[11px]">{task.desc}</p>
                  </div>
                  <button
                    onClick={() => onResumeModule(task.module)}
                    className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-white rounded-lg transition-colors group-hover:bg-blue-600 group-hover:border-blue-500 cursor-pointer"
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historic Logs / Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-sans font-bold text-base flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-500" />
          Log Aktivitas Terkini
        </h3>
        
        <div className="divide-y divide-zinc-800/60">
          {stats.activityLog.length === 0 ? (
            <div className="text-zinc-500 text-xs py-4 text-center">
              Belum ada aktivitas terekam. Mari selesaikan kuis pertama Anda!
            </div>
          ) : (
            stats.activityLog.slice(-4).reverse().map((log, i) => (
              <div key={i} className="py-3 flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-white text-xs font-medium">{log.description}</p>
                  <span className="text-[10px] text-zinc-500">{log.date}</span>
                </div>
                <div className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-950/40 px-2 py-1 rounded">
                  +{log.xpGained} XP
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
