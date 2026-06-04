import React, { useState, useEffect } from "react";
import {
  Timer,
  Flag,
  Check,
  X,
  Map,
  ArrowRight,
  ArrowLeft,
  Award,
  AlertCircle,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizSet, UserStats } from "../types";
import { quizSets } from "../data/quizzes";

interface QuizProps {
  quizId: string;
  stats: UserStats;
  onQuizComplete: (quizId: string, score: number, xpReward: number) => void;
  onExitQuiz: () => void;
}

export default function Quiz({
  quizId,
  stats,
  onQuizComplete,
  onExitQuiz
}: QuizProps) {
  const quizSet = quizSets.find((q) => q.id === quizId) || quizSets[0];
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Mapping states: index -> selectedOption index
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  // Question marked/flagged for review: index -> boolean
  const [flags, setFlags] = useState<{ [key: number]: boolean }>({});
  // Confirmed answered: index -> boolean (locks checking and reveals feedback instantly)
  const [confirmed, setConfirmed] = useState<{ [key: number]: boolean }>({});

  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds count per question
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Countdown timer logic
  useEffect(() => {
    if (!started || quizFinished) return;
    
    // If user confirmed option, suspend timer for that question so they can read explanation
    if (confirmed[currentIdx]) return;

    if (timeLeft <= 0) {
      // Auto confirm to skip/fail if timer ends
      handleConfirmAnswer(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft, confirmed, currentIdx, quizFinished]);

  // Whenever question index changes, reset count timer to 30
  useEffect(() => {
    if (started && !confirmed[currentIdx]) {
      setTimeLeft(30);
    }
  }, [currentIdx, started]);

  const handleStartQuiz = () => {
    setStarted(true);
    setCurrentIdx(0);
    setAnswers({});
    setFlags({});
    setConfirmed({});
    setQuizFinished(false);
    setTimeLeft(30);
  };

  const handleSelectOption = (optIdx: number) => {
    if (confirmed[currentIdx]) return; // locked
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleToggleFlag = () => {
    setFlags((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleConfirmAnswer = (customOpt?: number) => {
    const selected = customOpt !== undefined ? customOpt : answers[currentIdx];
    
    // Lock answer
    setConfirmed((prev) => ({
      ...prev,
      [currentIdx]: true
    }));
  };

  const handleNext = () => {
    if (currentIdx < quizSet.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      // Retrieve already confirmed state or reset
      if (confirmed[currentIdx + 1]) {
        // no-op, timer suspended
      } else {
        setTimeLeft(30);
      }
    } else {
      // Calculate final score
      let correctCount = 0;
      quizSet.questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswerIndex) {
          correctCount++;
        }
      });
      const score = Math.round((correctCount / quizSet.questions.length) * 100);
      setFinalScore(score);
      setQuizFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const finishQuizAndClaim = () => {
    onQuizComplete(quizSet.id, finalScore, quizSet.xpReward);
  };

  const currentQuestion = quizSet.questions[currentIdx];
  const isQuestionAnswered = answers[currentIdx] !== undefined;
  const isQuestionConfirmed = confirmed[currentIdx] === true;

  // Tiny custom confetti layout loop helper
  const confettiParticles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    color: ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"][i % 5],
    xPercent: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3
  }));

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <AnimatePresence mode="wait">
        {!started ? (
          // Welcome Card
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient blur background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10" />

            <div className="p-4 bg-blue-900/10 border border-blue-500/10 text-blue-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <Timer size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-white">
                {quizSet.title}
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                {quizSet.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto pt-4 text-xs font-mono">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl">
                <span className="text-zinc-500 block mb-1">Total Soal</span>
                <strong className="text-white text-base font-bold">{quizSet.questions.length} Soal</strong>
              </div>
              <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl">
                <span className="text-zinc-500 block mb-1">Durasi per Soal</span>
                <strong className="text-white text-base font-bold">30 Detik</strong>
              </div>
              <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl col-span-2 md:col-span-1">
                <span className="text-zinc-500 block mb-1">Urusan Hadiah</span>
                <strong className="text-emerald-400 text-base font-bold">+{quizSet.xpReward} XP</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-6">
              <button
                onClick={onExitQuiz}
                className="w-full sm:w-auto px-6 py-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 rounded-xl text-sm transition-all cursor-pointer"
              >
                Kembali ke Portal
              </button>
              <button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                Mulai Ujian Sekarang
              </button>
            </div>
          </motion.div>
        ) : quizFinished ? (
          // Final Score Results View
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-8 overflow-hidden text-center"
          >
            {/* Standard HTML-based Confetti loop render if passing mark! */}
            {finalScore >= 60 && (
              <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                {confettiParticles.map((pt) => (
                  <div
                    key={pt.id}
                    className="absolute w-2 h-4 rounded-sm animate-bounce"
                    style={{
                      left: `${pt.xPercent}%`,
                      top: "-20px",
                      backgroundColor: pt.color,
                      opacity: 0.8,
                      transform: `rotate(${pt.id * 15}deg)`,
                      animation: `fall ${pt.duration}s linear infinite`,
                      animationDelay: `${pt.delay}s`
                    }}
                  />
                ))}
                {/* CSS animation styles inline */}
                <style>{`
                  @keyframes fall {
                    0% { top: -20px; transform: translateY(0) rotate(0deg); }
                    100% { top: 120%; transform: translateY(800px) rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            <div className="p-4 bg-emerald-900/10 border border-emerald-500/10 text-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                Ujian Rampung Terjawab
              </span>
              <h2 className="text-3xl font-sans font-extrabold text-white">
                Hasil Akhir Kuis
              </h2>
              <p className="text-zinc-400 text-xs">
                Skor kelulusan nominal adalah 60%. Mari lihat penilaian logis Anda.
              </p>
            </div>

            {/* Score Big Display */}
            <div className="py-6 max-w-xs mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-inner space-y-1">
              <div
                className={`text-5xl md:text-6xl font-extrabold font-sans ${
                  finalScore >= 60 ? "text-emerald-400" : "text-amber-500"
                }`}
              >
                {finalScore}%
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {finalScore >= 90
                  ? "Akurasi Master (Sempurna!)"
                  : finalScore >= 60
                  ? "Lolos (Logika Cukup Tangguh)"
                  : "Belum Lolos (Butuh Belajar Lagi)"}
              </span>
            </div>

            {/* Progress xp and store log metrics */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl max-w-md mx-auto flex items-center justify-between text-xs font-sans">
              <div className="text-left">
                <span className="text-zinc-500 block">Bonus level didapat</span>
                <strong className="text-emerald-400 font-bold text-sm">+{quizSet.xpReward} XP</strong>
              </div>
              <div className="h-8 border-l border-zinc-800" />
              <div className="text-right">
                <span className="text-zinc-500 block">Koin didapat</span>
                <strong className="text-amber-400 font-bold text-sm">
                  +{Math.round(quizSet.xpReward / 2)} Koin
                </strong>
              </div>
            </div>

            <div className="relative py-2 items-center flex">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-zinc-500 text-xs font-mono">DETAIL SOAL TERJAWAB</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Questions review map list */}
            <div className="space-y-3 max-w-2xl mx-auto text-left">
              {quizSet.questions.map((q, idx) => {
                const userChoice = answers[idx];
                const isCorrect = userChoice === q.correctAnswerIndex;
                return (
                  <div
                    key={q.id}
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between hover:border-zinc-850 transition-all text-xs"
                  >
                    <div className="space-y-1 pr-4">
                      <span className="text-zinc-500 block font-mono font-bold">Soal {idx + 1}</span>
                      <p className="text-zinc-300 pointer-events-none line-clamp-1">{q.question}</p>
                    </div>
                    <div>
                      {isCorrect ? (
                        <span className="bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono">
                          <Check size={12} /> Benar
                        </span>
                      ) : (
                        <span className="bg-red-950/50 border border-red-800/50 text-red-400 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono">
                          <X size={12} /> Salah
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action footer */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleStartQuiz}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-medium rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={14} /> Ulangi Kuis
              </button>
              <button
                onClick={finishQuizAndClaim}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                Klaim Hadiah & Selesai
              </button>
            </div>
          </motion.div>
        ) : (
          // Active gameplay View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Main Question Frame (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Question card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                {/* Header indicators row */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <span className="text-xs text-zinc-400 font-mono font-medium">
                    Soal <strong className="text-white">{currentIdx + 1}</strong> dari {quizSet.questions.length}
                  </span>

                  {/* Timer meter */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono border ${
                      isQuestionConfirmed
                        ? "bg-zinc-950 border-zinc-800 text-zinc-400"
                        : timeLeft <= 10
                        ? "bg-red-950/50 border-red-800 text-red-400 animate-pulse"
                        : "bg-blue-950/50 border-blue-900/50 text-blue-400"
                    }`}
                  >
                    <Timer size={14} />
                    <span>{isQuestionConfirmed ? "Kunci" : `${timeLeft}s`}</span>
                  </div>
                </div>

                {/* Progress helper timer line */}
                {!isQuestionConfirmed && (
                  <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        timeLeft <= 10 ? "bg-red-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${(timeLeft / 30) * 100}%` }}
                    />
                  </div>
                )}

                {/* The Question Text */}
                <h3 className="text-lg font-sans font-bold text-white tracking-tight leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Options list */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentIdx] === idx;
                    const isCorrectOption = idx === currentQuestion.correctAnswerIndex;

                    // Compute dynamic option border coloring for feedback mode
                    let optionStyle = "border-zinc-800 text-zinc-300 bg-zinc-950 hover:bg-zinc-900/40";
                    if (isQuestionConfirmed) {
                      if (isCorrectOption) {
                        optionStyle = "bg-emerald-950/40 border-emerald-500/80 text-emerald-400";
                      } else if (isSelected) {
                        optionStyle = "bg-red-950/40 border-red-500/60 text-red-500";
                      } else {
                        optionStyle = "border-zinc-800/40 opacity-40 text-zinc-500 bg-zinc-950/50";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-blue-950 border-blue-500 text-white font-medium";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isQuestionConfirmed}
                        className={`w-full p-4 border rounded-xl text-left text-xs transition-all flex items-start gap-3 justify-between ${optionStyle} ${
                          !isQuestionConfirmed && "active:scale-[0.99] cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Circle alpha index letter indicator */}
                          <span
                            className={`flex h-5 w-5 rounded-full border items-center justify-center font-mono font-semibold text-[10px] mt-0.5 ${
                              isSelected
                                ? isQuestionConfirmed
                                  ? isCorrectOption
                                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                    : "bg-red-500 border-red-400 text-slate-950"
                                  : "bg-blue-500 border-blue-400 text-slate-950"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>

                        {/* Ticks and icon markers */}
                        {isQuestionConfirmed && isCorrectOption && (
                          <div className="p-1 bg-emerald-500 rounded-full text-slate-950">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                        {isQuestionConfirmed && !isCorrectOption && isSelected && (
                          <div className="p-1 bg-red-500 rounded-full text-slate-950">
                            <X size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Confirm option button launcher */}
                {!isQuestionConfirmed && (
                  <button
                    onClick={() => handleConfirmAnswer()}
                    disabled={!isQuestionAnswered}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Kunci Jawaban Saya
                  </button>
                )}

                {/* Expandable Explanation block post-confirmation */}
                {isQuestionConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-zinc-950 border-l-[3px] border-blue-500 rounded-r-xl space-y-1 text-xs leading-relaxed text-zinc-400"
                  >
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
                      <AlertCircle size={14} />
                      💡 Penjelasan Logika:
                    </div>
                    <p>{currentQuestion.explanation}</p>
                  </motion.div>
                )}
              </div>

              {/* Back / Next controllers */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} /> Soal Sebelumnya
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs transition-all cursor-pointer ${
                      flags[currentIdx]
                        ? "bg-amber-950 border-amber-600 text-amber-400 font-semibold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-455 hover:text-white"
                    }`}
                  >
                    <Flag size={14} fill={flags[currentIdx] ? "currentColor" : "none"} />
                    {flags[currentIdx] ? "Ditandai Rujukan" : "Tandai Soal"}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!isQuestionConfirmed}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    {currentIdx === quizSet.questions.length - 1 ? "Selesaikan Kuis" : "Soal Berikutnya"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Question Map index (1 col) */}
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h4 className="text-white font-sans font-bold text-xs flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Map size={14} className="text-blue-500" />
                  Peta Navigasi Soal
                </h4>

                <div className="grid grid-cols-5 gap-2 pb-2">
                  {quizSet.questions.map((_, i) => {
                    const isCurrent = i === currentIdx;
                    const isAnswered = answers[i] !== undefined;
                    const isFlagged = flags[i] === true;
                    const isConfirmedAns = confirmed[i] === true;

                    // Establish button color profile
                    let mapCircleStyle = "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700";
                    if (isCurrent) {
                      mapCircleStyle = "bg-blue-600 border-blue-500 text-white font-extrabold focus:ring-1 ring-blue-400";
                    } else if (isFlagged) {
                      mapCircleStyle = "bg-amber-950/70 border-amber-500/80 text-amber-400";
                    } else if (isConfirmedAns) {
                      mapCircleStyle = "bg-indigo-950 border-indigo-700 text-indigo-400 font-semibold";
                    } else if (isAnswered) {
                      mapCircleStyle = "bg-zinc-800 border-zinc-700 text-zinc-300";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIdx(i)}
                        className={`h-9 w-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer`}
                      >
                        <span className={mapCircleStyle + " h-full w-full rounded-lg flex items-center justify-center"}>{i + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Map legends */}
                <div className="space-y-2 border-t border-zinc-800/80 pt-3 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-blue-600 border border-blue-500" />
                    <span>Halaman Aktif</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-indigo-950 border border-indigo-700" />
                    <span>Sudah Terkunci Fakta</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-amber-950/70 border border-amber-500/80" />
                    <span>Ditandai untuk Diperiksa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-zinc-950 border border-zinc-800" />
                    <span>Belum Disentuh</span>
                  </div>
                </div>

                {/* Exit button */}
                <button
                  onClick={onExitQuiz}
                  className="w-full mt-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-red-500 hover:text-red-400 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  Keluar dari Ujian
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
