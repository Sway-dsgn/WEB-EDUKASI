import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Gem,
  Award,
  Users,
  ShoppingBag,
  Flame,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronUp,
  Clock,
  ExternalLink,
  User,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { UserStats, CommunityMaterial } from "./types";
import { initialCommunityMaterials } from "./data/community";
import { achievements } from "./data/achievements";
import { storeItems } from "./data/store";

// Sub Components
import LoginRegister from "./components/LoginRegister";
import Dashboard from "./components/Dashboard";
import Materi from "./components/Materi";
import Quiz from "./components/Quiz";
import ProgressTracker from "./components/ProgressTracker";
import Pencapaian from "./components/Pencapaian";
import MateriKomunitas from "./components/MateriKomunitas";
import Store from "./components/Store";
import EduvixLogo from "./components/EduvixLogo";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [communityMaterials, setCommunityMaterials] = useState<CommunityMaterial[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Quiz specific states
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Level up celebrate modal states
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState(1);

  // System notification banner popup state
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("eduvix_user_stats");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserStats;
        // Make sure stats has all correct default fields
        if (parsed && typeof parsed.xp === "number") {
          // If the cached stats contain the old legacy demo values, reset them instantly to 0 for a clean start!
          let modified = false;
          if (parsed.points === 100) {
            parsed.points = 0;
            modified = true;
          }
          if (parsed.streak === 5) {
            parsed.streak = 0;
            modified = true;
          }
          if (modified) {
            localStorage.setItem("eduvix_user_stats", JSON.stringify(parsed));
            if (parsed.username) {
              localStorage.setItem(`eduvix_user_stats_${parsed.username.toLowerCase()}`, JSON.stringify(parsed));
            }
          }
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.error("Failed to restore stats session logs", e);
      }
    }

    // Community materials restoration
    const savedComm = localStorage.getItem("eduvix_community_materials");
    if (savedComm) {
      try {
        setCommunityMaterials(JSON.parse(savedComm));
      } catch (e) {
        setCommunityMaterials(initialCommunityMaterials);
      }
    } else {
      setCommunityMaterials(initialCommunityMaterials);
      localStorage.setItem(
        "eduvix_community_materials",
        JSON.stringify(initialCommunityMaterials)
      );
    }
  }, []);

  // Time-Spent ticking accumulator hook (persists every 10 seconds of active platform usage)
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          studyTimeSeconds: prev.studyTimeSeconds + 10
        };
        localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
        if (updated.username) {
          localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
        }
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Clean-up notifications automatically after 4 seconds
  useEffect(() => {
    if (notificationMsg) {
      const timer = setTimeout(() => {
        setNotificationMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationMsg]);

  // Auth logins success handler
  const handleLoginSuccess = (username: string, email: string) => {
    const cleanUsername = username.toLowerCase().replace(/\s+/g, "_");
    const key = `eduvix_user_stats_${cleanUsername}`;
    const savedUser = localStorage.getItem(key);

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserStats;
        if (parsed && typeof parsed.xp === "number") {
          setCurrentUser(parsed);
          localStorage.setItem("eduvix_user_stats", JSON.stringify(parsed));
          setNotificationMsg(`Sesi belajar Anda berhasil dipulihkan sebagai ${parsed.username}!`);
          return;
        }
      } catch (e) {
        console.error("Failed to restore stats session logs", e);
      }
    }

    const defaultStats: UserStats = {
      username: username,
      email: email,
      level: 1,
      xp: 0,
      points: 0, // starter coins from 0
      streak: 0, // initial starting streak value from 0
      lastLoginDate: new Date().toISOString().split("T")[0],
      completedModules: [],
      completedQuizzes: {},
      earnedBadges: [],
      purchasedItems: [],
      activityLog: [
        {
          date: new Date().toISOString().split("T")[0],
          xpGained: 0,
          description: "Mendaftarkan diri & Masuk Portal Akurasi EDUVIX"
        }
      ],
      studyTimeSeconds: 0,
      equippedAvatar: undefined,
      equippedBorder: undefined
    };

    setCurrentUser(defaultStats);
    localStorage.setItem("eduvix_user_stats", JSON.stringify(defaultStats));
    localStorage.setItem(key, JSON.stringify(defaultStats));
    setNotificationMsg("Selamat Datang! Sesi belajar berhasil diautentikasi.");
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari EDUVIX.ID?")) {
      setCurrentUser(null);
      localStorage.removeItem("eduvix_user_stats");
      setActiveTab("dashboard");
      setActiveQuizId(null);
      setActiveModuleId(null);
    }
  };

  // Helper experience points dispenser with auto leveling rules
  const earnXP = (xpAmount: number, description: string, koinReward = 0) => {
    if (!currentUser) return;

    setCurrentUser((prev) => {
      if (!prev) return prev;

      const newXP = prev.xp + xpAmount;
      const targetLevel = Math.floor(newXP / 100) + 1; // 100 XP per level increments
      const hasLeveledUp = targetLevel > prev.level;

      const updatedCoins = prev.points + (koinReward > 0 ? koinReward : Math.round(xpAmount / 2));

      // Append log entry
      const activityLogCopy = [...prev.activityLog];
      activityLogCopy.push({
        date: new Date().toISOString().split("T")[0],
        xpGained: xpAmount,
        description: description
      });

      // Update achievements completedModules checks
      const unlockedBadges = [...prev.earnedBadges];

      // "materi-1" / "materi-6" evaluations inside level hooks or save triggers

      const updatedStats: UserStats = {
        ...prev,
        xp: newXP,
        level: targetLevel,
        points: updatedCoins,
        activityLog: activityLogCopy,
        earnedBadges: unlockedBadges
      };

      if (hasLeveledUp) {
        setCelebrationLevel(targetLevel);
        setShowLevelUpCelebration(true);
        setNotificationMsg(`🎉 Luar Biasa! Level Anda naik ke: Level ${targetLevel}!`);
      }

      localStorage.setItem("eduvix_user_stats", JSON.stringify(updatedStats));
      if (updatedStats.username) {
        localStorage.setItem(`eduvix_user_stats_${updatedStats.username.toLowerCase()}`, JSON.stringify(updatedStats));
      }
      return updatedStats;
    });
  };

  // Claim achievement rewards point dispenser
  const handleClaimReward = (badgeId: string, pointReward: number) => {
    if (!currentUser) return;

    setCurrentUser((prev) => {
      if (!prev) return prev;
      if (prev.earnedBadges.includes(badgeId)) return prev;

      const updatedStats: UserStats = {
        ...prev,
        points: prev.points + pointReward,
        earnedBadges: [...prev.earnedBadges, badgeId]
      };

      setNotificationMsg(`⭐ Lencana didapatkan! +${pointReward} Koin bertumpu ke tabungan Anda.`);
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updatedStats));
      if (updatedStats.username) {
        localStorage.setItem(`eduvix_user_stats_${updatedStats.username.toLowerCase()}`, JSON.stringify(updatedStats));
      }
      return updatedStats;
    });
  };

  // Complete module action dispatcher
  const handleCompleteModule = (moduleId: string, xpReward: number) => {
    if (!currentUser) return;

    setCurrentUser((prev) => {
      if (!prev) return prev;
      if (prev.completedModules.includes(moduleId)) return prev; // already done

      const newCompleted = [...prev.completedModules, moduleId];
      const earns = prev.xp + xpReward;
      const calculatedLevel = Math.floor(earns / 100) + 1;
      const hasLeveledUp = calculatedLevel > prev.level;

      const today = new Date().toISOString().split("T")[0];
      const log = [
        ...prev.activityLog,
        {
          date: today,
          xpGained: xpReward,
          description: `Selesai Menelaah Materi Modul: "${moduleId}"`
        }
      ];

      // Increase streak if not checked/logged today
      let newStreak = prev.streak;
      if (prev.lastCheckInDate !== today) {
        newStreak = prev.streak + 1;
      }

      // Auto check badge unlocking target triggers
      const currentEarnedBadges = [...prev.earnedBadges];
      
      // Checking for Pelajar Pemula
      if (newCompleted.length >= 1 && !currentEarnedBadges.includes("materi-1")) {
        // no claim, keep it unlockable in panel
      }

      // Module completion gives +20 BONUS coins/points too!
      const bonusCoins = 20;

      const updated: UserStats = {
        ...prev,
        completedModules: newCompleted,
        xp: earns,
        points: prev.points + bonusCoins,
        streak: newStreak,
        lastCheckInDate: today,
        lastLoginDate: today,
        level: calculatedLevel,
        activityLog: log
      };

      if (hasLeveledUp) {
        setCelebrationLevel(calculatedLevel);
        setShowLevelUpCelebration(true);
      }

      setNotificationMsg(`📖 Modul tuntas dipahami! +${xpReward} XP & +${bonusCoins} Koin ditambahkan ke simpanan Anda.`);
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Completions of quiz solvers hook
  const handleQuizComplete = (quizId: string, score: number, xpReward: number) => {
    if (!currentUser) return;

    setCurrentUser((prev) => {
      if (!prev) return prev;

      // Update quiz score history
      const existingScores = { ...prev.completedQuizzes };
      const previousBest = existingScores[quizId] || 0;
      existingScores[quizId] = Math.max(previousBest, score);

      const today = new Date().toISOString().split("T")[0];

      // Only grant XP reward fully on high accuracy
      const xpGained = score >= 60 ? xpReward : Math.round(xpReward / 4);
      const logMsg = score >= 60
        ? `Menuntaskan Kuis: "${quizId}" dengan Skor Luar Biasa: ${score}%`
        : `Mengerjakan Kuis: "${quizId}" dengan Evaluasi Akhir: ${score}%`;

      const newXP = prev.xp + xpGained;
      const bonusCoins = score >= 60 ? Math.round(xpReward / 2) : 10;
      const calculatedLevel = Math.floor(newXP / 100) + 1;
      const hasLeveledUp = calculatedLevel > prev.level;

      // Increase streak if not active/checked today
      let newStreak = prev.streak;
      if (prev.lastCheckInDate !== today) {
        newStreak = prev.streak + 1;
      }

      const log = [
        ...prev.activityLog,
        {
          date: today,
          xpGained,
          description: logMsg
        }
      ];

      const updated: UserStats = {
        ...prev,
        completedQuizzes: existingScores,
        xp: newXP,
        points: prev.points + bonusCoins,
        streak: newStreak,
        lastCheckInDate: today,
        lastLoginDate: today,
        level: calculatedLevel,
        activityLog: log
      };

      if (hasLeveledUp) {
        setCelebrationLevel(calculatedLevel);
        setShowLevelUpCelebration(true);
      }

      setNotificationMsg(`🎯 Tes evaluasi selesai! Skor: ${score}%. +${xpGained} XP & +${bonusCoins} Koin diraih.`);
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });

    setActiveQuizId(null);
  };

  // Purchasing items
  const handlePurchaseItem = (itemId: string, cost: number) => {
    if (!currentUser) return;

    setCurrentUser((prev) => {
      if (!prev) return prev;
      if (prev.purchasedItems.includes(itemId)) return prev;

      const updated: UserStats = {
        ...prev,
        points: prev.points - cost,
        purchasedItems: [...prev.purchasedItems, itemId]
      };

      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Equip or un-equip items (Avatar & Borders decorative accessories)
  const handleEquipItem = (itemId: string, category: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      
      const updated = { ...prev };
      if (category === "avatar") {
        // Toggle if already equipped
        if (updated.equippedAvatar === itemId) {
          updated.equippedAvatar = undefined;
        } else {
          updated.equippedAvatar = itemId;
        }
      } else {
        // Toggle if already equipped
        if (updated.equippedBorder === itemId) {
          updated.equippedBorder = undefined;
        } else {
          updated.equippedBorder = itemId;
        }
      }
      
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
    setNotificationMsg("✨ Aksesoris lencana / profil Anda berhasil dipasang!");
  };

  // Daily Check-in handler
  const handleDailyCheckIn = () => {
    if (!currentUser) return;
    const today = new Date().toISOString().split("T")[0];

    if (currentUser.lastCheckInDate === today) {
      setNotificationMsg("Anda sudah melakukan check-in hari ini!");
      return;
    }

    setCurrentUser((prev) => {
      if (!prev) return prev;

      // Determine streak update
      let newStreak = prev.streak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (prev.lastCheckInDate === yesterdayStr) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = prev.streak + 1;
      }

      const updatedCoins = prev.points + 25; // Good bonus: 25 coins for check-in!
      const updatedXP = prev.xp + 15; // 15 XP too!
      const calculatedLevel = Math.floor(updatedXP / 100) + 1;
      const hasLeveledUp = calculatedLevel > prev.level;

      const log = [
        ...prev.activityLog,
        {
          date: today,
          xpGained: 15,
          description: `Absen Kehadiran Harian (Streak: ${newStreak} Hari!)`
        }
      ];

      const updated: UserStats = {
        ...prev,
        points: updatedCoins,
        streak: newStreak,
        lastCheckInDate: today,
        lastLoginDate: today,
        xp: updatedXP,
        level: calculatedLevel,
        activityLog: log
      };

      if (hasLeveledUp) {
        setCelebrationLevel(calculatedLevel);
        setShowLevelUpCelebration(true);
      }

      setNotificationMsg(`🔥 Absen harian sukses! Streak Anda bertambah menjadi ${newStreak} Hari. +25 Koin & +15 XP didapatkan!`);
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Helper to directly update any stats properties for dynamic testing and simulations
  const handleUpdateStats = (newFields: Partial<UserStats>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...newFields };
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
    setNotificationMsg("⚙️ Simulasi diperbarui! Nilai statistik berhasil disesuaikan.");
  };

  // Action to reset all user stats to absolute 0
  const handleResetAllData = () => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated: UserStats = {
        ...prev,
        points: 0,
        streak: 0,
        xp: 0,
        level: 1,
        completedModules: [],
        completedQuizzes: {},
        earnedBadges: [],
        purchasedItems: [],
        lastCheckInDate: undefined,
        activityLog: [
          {
            date: new Date().toISOString().split("T")[0],
            xpGained: 0,
            description: "Sesi belajar diatur ulang sepenuhnya dari 0"
          }
        ],
        studyTimeSeconds: 0
      };
      localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
      if (updated.username) {
        localStorage.setItem(`eduvix_user_stats_${updated.username.toLowerCase()}`, JSON.stringify(updated));
      }
      return updated;
    });
    setNotificationMsg("🔥 Sesi & Koin Anda telah di-reset sepenuhnya ke 0!");
  };

  // New materials submitter from user community forms
  const handleAddCommunityMaterial = (newMat: CommunityMaterial) => {
    const updated = [newMat, ...communityMaterials];
    setCommunityMaterials(updated);
    localStorage.setItem("eduvix_community_materials", JSON.stringify(updated));

    // Award bonus XP
    earnXP(40, `Mempublikasikan Riset di Komunitas: "${newMat.title}"`, 20);
    setNotificationMsg("📝 Artikel berhasil diterbitkan! +40 XP & +20 Koin diberikan.");
  };

  // Like / Upvote community material updater
  const handleLikeCommunityMaterial = (id: string) => {
    const updated = communityMaterials.map((mat) => {
      if (mat.id === id) {
        const liked = mat.hasLiked;
        return {
          ...mat,
          likes: liked ? mat.likes - 1 : mat.likes + 1,
          hasLiked: !liked
        };
      }
      return mat;
    });
    setCommunityMaterials(updated);
    localStorage.setItem("eduvix_community_materials", JSON.stringify(updated));
  };

  // Navigation callbacks
  const handleResumeModuleFromDashboard = (modId: string) => {
    setActiveModuleId(modId);
    setActiveTab("materi");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", shortLabel: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "materi", label: "Materi Kelas", shortLabel: "Materi", icon: <BookOpen size={18} /> },
    { id: "progress", label: "Statistik Progres", shortLabel: "Progres", icon: <Clock size={18} /> },
    { id: "achievement", label: "Lencana & Badge", shortLabel: "Lencana", icon: <Award size={18} /> },
    { id: "community", label: "Materi Komunitas", shortLabel: "Komunitas", icon: <Users size={18} /> },
    { id: "store", label: "Toko Hadiah", shortLabel: "Toko", icon: <ShoppingBag size={18} /> }
  ];

  if (!currentUser) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-40 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setActiveTab("dashboard");
              setActiveQuizId(null);
            }}
            className="cursor-pointer"
          >
            <EduvixLogo size={42} />
          </div>
        </div>

        {/* Real-time stats pill badges row */}
        <div className="flex items-center gap-3.5">
          {/* Streak indicator */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs select-none">
            <span className="text-sm">🔥</span>
            <span className="text-zinc-300 font-sans font-semibold tracking-wide uppercase leading-none">{currentUser.streak} Hari</span>
          </div>

          {/* Points indicator */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs select-none">
            <span className="text-sm">⭐</span>
            <span className="text-zinc-300 font-sans font-semibold tracking-wide leading-none">{currentUser.points} Koin</span>
          </div>

          {/* Dynamic Interactive Avatar Layout */}
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="relative group/avatar cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Buka Menu Profil & Aksesoris"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm select-none transition-all ${
                currentUser.equippedBorder === "rainbow_infinity"
                  ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] border border-pink-400"
                  : currentUser.equippedAvatar === "royal_crown"
                  ? "bg-amber-950 text-amber-400 border border-amber-500"
                  : currentUser.equippedAvatar === "ninja_avatar"
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "bg-indigo-600 text-white border border-indigo-500"
              }`}
            >
              {currentUser.equippedAvatar === "ninja_avatar" ? "🥷" : currentUser.equippedAvatar === "royal_crown" ? "👑" : currentUser.username.charAt(0).toUpperCase()}
            </div>
            {/* Corner badge indicating active Level */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-zinc-900 font-sans font-black text-[9px] text-zinc-950 flex items-center justify-center shadow-lg">
              {currentUser.level}
            </div>
          </div>
        </div>
      </header>

      {/* Main Structural Layout (Sidebar + Content Canvas) */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Static Left Sidebar for Desktop Screens */}
        <aside className="hidden md:flex md:w-64 bg-zinc-950 border-r border-zinc-800 flex-col justify-between p-4 flex-shrink-0">
          <div className="space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id && !activeQuizId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setActiveQuizId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-zinc-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pb-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 font-mono text-[9px] text-zinc-500 leading-relaxed text-center select-none">
              <span className="font-bold text-zinc-400 block mb-1">Misi Berpikir Kritis</span>
              Gunakan koin ganjil toko untuk sertifikasi resmi portofolio.
            </div>
          </div>
        </aside>

        {/* Sticky Bottom Tab Bar for Mobile Devices */}
        <nav id="mobile-bottom-tabs" className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 h-16 flex items-center justify-around z-40 px-1 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id && !activeQuizId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setActiveQuizId(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-sans font-semibold transition-all cursor-pointer ${
                  isActive ? "text-blue-500" : "text-zinc-500"
                }`}
              >
                <span className={`mb-1 ${isActive ? "text-blue-500" : "text-zinc-500"}`}>
                  {item.icon}
                </span>
                <span className="truncate max-w-[55px]">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Main interactive viewport panels */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* Render Active Diagnostic Quiz Solver Overlay */}
          {activeQuizId ? (
            <Quiz
              quizId={activeQuizId}
              stats={currentUser}
              onQuizComplete={handleQuizComplete}
              onExitQuiz={() => setActiveQuizId(null)}
            />
          ) : (
            // Render basic standard modules
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  stats={currentUser}
                  onNavigate={setActiveTab}
                  onResumeModule={handleResumeModuleFromDashboard}
                  onStartQuiz={setActiveQuizId}
                  onDailyCheckIn={handleDailyCheckIn}
                  onUpdateStats={handleUpdateStats}
                />
              )}

              {activeTab === "materi" && (
                <Materi
                  stats={currentUser}
                  onCompleteModule={handleCompleteModule}
                  onStartQuiz={setActiveQuizId}
                  activeModuleId={activeModuleId}
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              )}

              {activeTab === "progress" && (
                <ProgressTracker
                  stats={currentUser}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === "achievement" && (
                <Pencapaian stats={currentUser} onClaimReward={handleClaimReward} />
              )}

              {activeTab === "community" && (
                <MateriKomunitas
                  stats={currentUser}
                  materials={communityMaterials}
                  onAddMaterial={handleAddCommunityMaterial}
                  onLikeMaterial={handleLikeCommunityMaterial}
                />
              )}

              {activeTab === "store" && (
                <Store
                  stats={currentUser}
                  onPurchaseItem={handlePurchaseItem}
                  onEquipItem={handleEquipItem}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Celebratory Level-Up Fullscreen Overlay popup Modal */}
      <AnimatePresence>
        {showLevelUpCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 relative overflow-hidden"
            >
              {/* Outer decorative halo gold spots */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl -z-10" />

              <div className="p-4 bg-amber-500 rounded-2xl w-20 h-20 flex items-center justify-center text-zinc-950 mx-auto animate-bounce shadow-xl shadow-amber-500/20 border border-amber-400">
                <ChevronUp size={44} strokeWidth={3} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  TINGKATAN BARU DICAPAI
                </span>
                <h3 className="text-2xl font-sans font-black text-white">
                  Selamat! Naik Level!
                </h3>
                <p className="text-zinc-400 text-xs">
                  Anda baru saja melompat ke <strong className="text-white text-sm block mt-1">Level {celebrationLevel} Pemikir</strong> dengan ketangguhan nalar yang semakin tajam!
                </p>
              </div>

              {/* Coins stats update summary metrics */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl max-w-xs mx-auto text-xs font-mono">
                <span className="text-zinc-500">Kedaulatan Hadiah</span>
                <strong className="text-amber-400 font-bold block mt-0.5">+50 Koin Bonus Level</strong>
              </div>

              <button
                onClick={() => {
                  setShowLevelUpCelebration(false);
                  // Disburse 50 coin bonus once celebration is acknowledged
                  setCurrentUser((prev) => {
                    if (!prev) return prev;
                    const updated = { ...prev, points: prev.points + 50 };
                    localStorage.setItem("eduvix_user_stats", JSON.stringify(updated));
                    return updated;
                  });
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 rounded-xl transition-all font-sans text-xs shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                Klaim & Lanjutkan Berlatih
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Detail & Customization Modal */}
      <AnimatePresence>
        {isProfileOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 md:p-8 relative overflow-hidden space-y-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 hover:bg-zinc-800/60 rounded-xl transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X size={18} />
              </button>

              {/* Title */}
              <div className="space-y-1">
                <h3 className="text-lg font-black font-sans text-white flex items-center gap-2">
                  <User size={20} className="text-blue-500 animate-pulse" />
                  Profil & Aksesoris Anda
                </h3>
                <p className="text-xs text-zinc-500">
                  Kelola identitas, pasang lencana profil, atau atur ulang kemajuan belajar Anda.
                </p>
              </div>

              {/* User Identity Highlight Card */}
              <div className="bg-zinc-950 border border-zinc-800/80 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl select-none transition-all ${
                    currentUser.equippedBorder === "rainbow_infinity"
                      ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)] border-2 border-pink-400 animate-pulse"
                      : currentUser.equippedAvatar === "royal_crown"
                      ? "bg-amber-950 text-amber-400 border-2 border-amber-500"
                      : currentUser.equippedAvatar === "ninja_avatar"
                      ? "bg-zinc-800 text-white border-2 border-zinc-700"
                      : "bg-indigo-600 text-white border-2 border-indigo-500"
                  }`}
                >
                  {currentUser.equippedAvatar === "ninja_avatar" ? "🥷" : currentUser.equippedAvatar === "royal_crown" ? "👑" : currentUser.username.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-base tracking-tight font-sans">
                      {currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)}
                    </span>
                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/10 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      Level {currentUser.level}
                    </span>
                  </div>
                  
                  {/* Stats info */}
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><span className="text-amber-500">⭐</span> {currentUser.points} Koin</span>
                    <span className="flex items-center gap-1"><span className="text-red-500">🔥</span> {currentUser.streak} Hari</span>
                  </div>
                </div>
              </div>

              {/* Accessories Customization List */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 font-sans block">
                  Aksesoris Profil yang Dimiliki
                </span>

                <div className="bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-xl max-h-48 overflow-y-auto space-y-2">
                  {/* Map avatar & border category items */}
                  {storeItems
                    .filter(item => item.category === "avatar")
                    .map(item => {
                      const isOwned = currentUser.purchasedItems.includes(item.id);
                      const isEquipped =
                        (item.id === "rainbow_infinity" && currentUser.equippedBorder === item.id) ||
                        (item.id !== "rainbow_infinity" && currentUser.equippedAvatar === item.id);

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 border rounded-xl transition-all ${
                            isOwned ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-950 border-zinc-900/40 opacity-40 select-none"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                              {item.id === "ninja_avatar" ? "🥷" : item.id === "royal_crown" ? "👑" : item.id === "rainbow_infinity" ? "🌈" : "🏷️"}
                            </span>
                            <div className="leading-tight">
                              <span className="text-xs font-bold text-zinc-200 block">{item.title}</span>
                              <span className="text-[10px] text-zinc-500 block line-clamp-1">
                                {isOwned ? "Siap dipasang di profil" : "Belum Anda miliki di Toko Hadiah"}
                              </span>
                            </div>
                          </div>

                          {isOwned ? (
                            <button
                              onClick={() => {
                                handleEquipItem(item.id, item.id === "rainbow_infinity" ? "border" : "avatar");
                              }}
                              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black tracking-wide font-sans transition-all cursor-pointer ${
                                isEquipped
                                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
                              }`}
                            >
                              {isEquipped ? "LEPAS" : "PAKAI"}
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-650 font-semibold px-2 py-1 bg-zinc-900 border border-zinc-800/50 rounded-lg">
                              Terkunci
                            </span>
                          )}
                        </div>
                      );
                    })}

                  {/* Suggest shopping if no accessories match */}
                  {currentUser.purchasedItems.filter(id => storeItems.some(i => i.id === id && i.category === "avatar")).length === 0 && (
                    <div className="text-center py-4 space-y-1.5">
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Anda belum memiliki aksesoris profil apapun di koin inventori.
                      </p>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveTab("store");
                        }}
                        className="text-[11px] font-black text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Beli di Toko Hadiah 🛍️
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Redirection / action buttons panel layout */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-3">
                {/* Reset Progress trigger button */}
                <button
                  onClick={() => {
                    if (confirm("Apakah Anda yakin ingin menyetel ulang semua koin, streak, dan progres belajar ke 0?")) {
                      handleResetAllData();
                      setIsProfileOpen(false);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-amber-500 hover:text-amber-400 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                >
                  ♻️ Reset Progres Belajar
                </button>

                {/* Log Out option button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsProfileOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/15 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                >
                  <LogOut size={14} /> Keluar dari Akun
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global high-level notifications alerts toast */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-zinc-900 border border-zinc-800 px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 max-w-sm cursor-pointer"
            onClick={() => setNotificationMsg("")}
          >
            <div className="p-1 px-2.5 bg-blue-900/40 text-blue-400 text-xs rounded-full font-bold font-mono">
              i
            </div>
            <p className="text-zinc-300 text-xs font-medium leading-relaxed">
              {notificationMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
