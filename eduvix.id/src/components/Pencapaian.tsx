import React from "react";
import {
  BookOpen,
  Award,
  Flame,
  Zap,
  CheckCircle,
  ChevronUp,
  ShoppingBag,
  Trophy,
  Icon
} from "lucide-react";
import { motion } from "motion/react";
import { Achievement, UserStats } from "../types";
import { achievements } from "../data/achievements";

interface PencapaianProps {
  stats: UserStats;
  onClaimReward: (badgeId: string, pointReward: number) => void;
}

export default function Pencapaian({ stats, onClaimReward }: PencapaianProps) {
  // Translate string iconName to active JSX Lucide icons
  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    let strokeColor = isUnlocked ? "text-amber-400" : "text-zinc-600";
    let size = 28;
    switch (iconName) {
      case "BookOpen":
        return <BookOpen size={size} className={strokeColor} />;
      case "Award":
        return <Award size={size} className={strokeColor} />;
      case "Flame":
        return <Flame size={size} className={strokeColor} />;
      case "Zap":
        return <Zap size={size} className={strokeColor} />;
      case "CheckCircle":
        return <CheckCircle size={size} className={strokeColor} />;
      case "ChevronUp":
        return <ChevronUp size={size} className={strokeColor} />;
      case "ShoppingBag":
        return <ShoppingBag size={size} className={strokeColor} />;
      default:
        return <Trophy size={size} className={strokeColor} />;
    }
  };

  // Helper evaluator to check if milestone thresholds are met
  const getAchievementStatus = (ach: Achievement) => {
    let currentProgress = 0;
    let target = ach.threshold;

    switch (ach.category) {
      case "materi":
        currentProgress = stats.completedModules.length;
        break;
      case "streak":
        currentProgress = stats.streak;
        break;
      case "level":
        currentProgress = stats.level;
        break;
      case "quiz":
        // Find maximum score across completed quizzes
        const scores = Object.values(stats.completedQuizzes);
        currentProgress = scores.length > 0 ? Math.max(...scores) : 0;
        break;
      case "belanja":
        currentProgress = stats.purchasedItems.length;
        break;
    }

    const isQualified = currentProgress >= target;
    const isAlreadyClaimed = stats.earnedBadges.includes(ach.id);

    return {
      currentProgress,
      target,
      isQualified,
      isAlreadyClaimed
    };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="relative">
        <h2 className="text-2xl font-bold font-sans text-white">Galeri Pencapaian & Lencana</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Kumpulkan lencana prestisius dengan menyelesaikan rangkaian studi kritis dan klaim bonus Koin.
        </p>
      </div>

      {/* Main Grid display list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((ach, i) => {
          const { currentProgress, target, isQualified, isAlreadyClaimed } =
            getAchievementStatus(ach);
          
          const isUnlocked = isQualified || isAlreadyClaimed;

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-5 rounded-2xl border flex gap-5 transition-all relative overflow-hidden ${
                isAlreadyClaimed
                  ? "bg-zinc-900/60 border-zinc-800"
                  : isQualified
                  ? "bg-zinc-900 border-amber-500/25 shadow-lg shadow-amber-500/5 animate-pulse-subtle"
                  : "bg-zinc-950/20 border-zinc-900"
              }`}
            >
              {/* Highlight background panel glow for unlocked items */}
              {isUnlocked && (
                <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Left Column icon layout container */}
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${
                  isAlreadyClaimed
                    ? "bg-zinc-950 border-zinc-800"
                    : isQualified
                    ? "bg-amber-950/30 border-amber-500/40"
                    : "bg-zinc-950/40 border-zinc-900"
                }`}
              >
                {renderBadgeIcon(ach.iconName, isUnlocked)}
              </div>

              {/* Right Column layout container info and buttons */}
              <div className="flex-grow flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold font-sans ${
                        isUnlocked ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {ach.title}
                    </h4>
                    {isAlreadyClaimed && (
                      <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/45 px-2 rounded-md">
                        TERKLAIM
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isUnlocked ? "text-zinc-400" : "text-zinc-650"}`}>
                    {ach.description}
                  </p>
                </div>

                {/* Progress detail block & claim controller */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/40">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-mono block">Progres</span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {Math.min(target, currentProgress)} / {target}{" "}
                      <span className="text-zinc-650 text-[10px]">
                        ({ach.category})
                      </span>
                    </span>
                  </div>

                  {/* Claim Button Logic */}
                  {isQualified && !isAlreadyClaimed ? (
                    <button
                      onClick={() => onClaimReward(ach.id, ach.pointsReward)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-sans rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Klaim +{ach.pointsReward} Koin!
                    </button>
                  ) : isAlreadyClaimed ? (
                    <div className="text-xs text-zinc-500 font-medium">Lencana Aktif</div>
                  ) : (
                    <div className="text-xs text-zinc-600 font-mono">Belum Memenuhi Syarat</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
