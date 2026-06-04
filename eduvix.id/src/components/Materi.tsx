import React, { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LearningModule, UserStats } from "../types";
import { learningModules } from "../data/modules";

interface MateriProps {
  stats: UserStats;
  onCompleteModule: (moduleId: string, xpReward: number) => void;
  onStartQuiz: (quizId: string) => void;
  activeModuleId?: string | null;
  onBackToDashboard: () => void;
}

export default function Materi({
  stats,
  onCompleteModule,
  onStartQuiz,
  activeModuleId,
  onBackToDashboard
}: MateriProps) {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(
    activeModuleId ? learningModules.find(m => m.id === activeModuleId) || null : null
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const startReading = (mod: LearningModule) => {
    setSelectedModule(mod);
    setCurrentPageIndex(0);
  };

  const handleNextPage = () => {
    if (!selectedModule) return;
    if (currentPageIndex < selectedModule.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const finishModule = () => {
    if (!selectedModule) return;
    onCompleteModule(selectedModule.id, selectedModule.xpReward);
    // Let's ask starting associate quiz
    const associatedQuizId = selectedModule.quizId;
    setSelectedModule(null);
    onStartQuiz(associatedQuizId);
  };

  // Quick formatter to turn text chunks into customized markup blocks
  const renderReadableContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={idx} className="text-xl font-bold font-sans text-white mt-6 mb-3">
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("####")) {
        return (
          <h4 key={idx} className="text-base font-bold font-sans text-blue-400 mt-4 mb-2">
            {trimmed.replace("####", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("*   **") || trimmed.startsWith("* **")) {
        // Bullet list with bold label
        const match = trimmed.match(/\* \*\*(.*?)\*\*(.*)/) || trimmed.match(/\*   \*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div key={idx} className="pl-6 py-1 flex items-start gap-2 text-zinc-300 text-sm">
              <span className="text-blue-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <p>
                <strong className="text-white">{match[1]}</strong>
                {match[2]}
              </p>
            </div>
          );
        }
      }
      if (trimmed.startsWith("*")) {
        return (
          <div key={idx} className="pl-6 py-1 flex items-start gap-2 text-zinc-300 text-sm">
            <span className="text-blue-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            <p>{trimmed.replace("*", "").trim()}</p>
          </div>
        );
      }
      if (trimmed.startsWith("1. **") || trimmed.startsWith("1.   **")) {
        const match = trimmed.match(/\d+\. \*\*(.*?)\*\*(.*)/) || trimmed.match(/\d+\.   \*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div key={idx} className="pl-6 py-1.5 flex items-start gap-2.5 text-zinc-300 text-sm font-sans">
              <span className="text-indigo-400 font-mono font-bold">{idx + 1}.</span>
              <p>
                <strong className="text-white">{match[1]}</strong>
                {match[2]}
              </p>
            </div>
          );
        }
      }
      if (trimmed.startsWith("1.")) {
        return (
          <div key={idx} className="pl-6 py-1 flex items-start gap-2 text-zinc-300 text-sm">
            <span className="text-indigo-500 font-bold">{idx + 1}.</span>
            <p>{trimmed.replace(/^\d+\./, "").trim()}</p>
          </div>
        );
      }
      // Check blockquote style or example italic look
      if (trimmed.startsWith("*Contoh:*") || trimmed.startsWith("*   *Contoh:*")) {
        return (
          <div key={idx} className="my-3 p-3.5 bg-zinc-950 border-l-[3px] border-amber-500 text-zinc-300 rounded-r-xl italic text-[13px] leading-relaxed">
            {trimmed.replace(/\*Contoh:\*/, "💡 Contoh:").replace(/\*/g, "").trim()}
          </div>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      // Standard line
      return (
        <p key={idx} className="text-zinc-300 text-sm leading-relaxed mb-3">
          {trimmed.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
      );
    });
  };

  const difficultyColors = {
    Dasar: "bg-emerald-950 border-emerald-800 text-emerald-400",
    Menengah: "bg-blue-950 border-blue-800 text-blue-400",
    Mahir: "bg-purple-950 border-purple-800 text-purple-400"
  };

  return (
    <div className="pb-12">
      <AnimatePresence mode="wait">
        {!selectedModule ? (
          // index list
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold font-sans text-white">
                Kurikulum Pembelajaran Berpikir Kritis
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Ikuti alur modul di bawah, naikkan Level Anda, kumpulkan Poin dan jalankan kuis final terkait.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningModules.map((mod, i) => {
                const isCompleted = stats.completedModules.includes(mod.id);
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Badge Difficulty and status */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border ${
                            difficultyColors[mod.difficulty]
                          }`}
                        >
                          {mod.difficulty}
                        </span>
                        {isCompleted ? (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold font-mono">
                            <CheckCircle size={14} /> Selesai
                          </div>
                        ) : (
                          <div className="text-zinc-500 text-xs font-mono">
                            +{mod.xpReward} XP
                          </div>
                        )}
                      </div>

                      {/* Header Title */}
                      <div className="space-y-1.5">
                        <h4 className="text-white font-sans font-bold text-base leading-tight group-hover:text-blue-400">
                          {mod.title}
                        </h4>
                        <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                        <Clock size={14} />
                        <span>{mod.durationMinutes} menit bacaan</span>
                      </div>
                      
                      <button
                        onClick={() => startReading(mod)}
                        className={`text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-zinc-950 hover:bg-zinc-850 text-zinc-300 border border-zinc-850"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10"
                        }`}
                      >
                        {isCompleted ? "Baca Lagi" : "Mulai Belajar"}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Diagnostic helper warning bottom */}
            <div className="p-4 bg-blue-950/20 border border-blue-500/10 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-zinc-400 leading-relaxed">
                <span className="font-bold text-white">Logika Kurikulum:</span> Setiap kali Anda menyelesaikan membaca modul materi secara penuh sampai halaman akhir, Anda akan langsung dihadiahi bonus sebesar <strong className="text-white">XP Modul</strong> yang melipatgandakan progres Level, kemudian halaman kuis interaktif yang sesuai akan terbuka secara otomatis!
              </div>
            </div>
          </motion.div>
        ) : (
          // active reading reader view
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Nav Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors text-xs font-medium cursor-pointer"
              >
                <ArrowLeft size={16} /> Kembali ke Pilihan Modul
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-blue-950/50 text-blue-400 border border-blue-900/40 px-2.5 py-0.5 rounded-full">
                  Halaman {currentPageIndex + 1} dari {selectedModule.pages.length}
                </span>
              </div>
            </div>

            {/* Main Reading Canvas */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl space-y-6">
              {/* Module Metadata display */}
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-blue-500" />
                <span className="text-xs text-zinc-400 font-mono">Modul Belajar: {selectedModule.title}</span>
              </div>

              {/* Active Sub Title */}
              <h2 className="text-2xl md:text-3xl font-bold font-sans text-white tracking-tight border-b border-zinc-800 pb-4">
                {selectedModule.pages[currentPageIndex].title}
              </h2>

              {/* Content Reader */}
              <div className="space-y-4 pt-2">
                {renderReadableContent(selectedModule.pages[currentPageIndex].content)}
              </div>
            </div>

            {/* Bottom Nav Controller */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 bg-zinc-900 text-zinc-300 rounded-xl hover:bg-zinc-800 active:scale-95 text-xs transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ArrowLeft size={14} />
                Sebelumnya
              </button>

              {/* Horizontal Page Dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {selectedModule.pages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentPageIndex ? "w-6 bg-blue-500" : "w-2 bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

              {currentPageIndex < selectedModule.pages.length - 1 ? (
                <button
                  onClick={handleNextPage}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 active:scale-95 text-xs font-semibold transition-all cursor-pointer"
                >
                  Selanjutnya
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={finishModule}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 active:scale-95 text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 border border-emerald-500/20 cursor-pointer animate-pulse"
                >
                  Selesai & Mulai Kuis! (+{selectedModule.xpReward} XP)
                  <Award size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
