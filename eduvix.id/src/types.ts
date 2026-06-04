export interface UserStats {
  username: string;
  email: string;
  level: number;
  xp: number;
  points: number; // For spending in the rewards store
  streak: number;
  lastLoginDate: string;
  lastCheckInDate?: string;
  completedModules: string[]; // Module IDs completed
  completedQuizzes: { [key: string]: number }; // quizId -> score
  earnedBadges: string[]; // Badge IDs
  purchasedItems: string[]; // Store item IDs purchased
  activityLog: { date: string; xpGained: number; description: string }[];
  studyTimeSeconds: number; // Time spent on pages
  equippedAvatar?: string; // Custom avatar icon/avatar identity equipped
  equippedBorder?: string; // Custom border style equipped
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  questions: QuizQuestion[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: "Dasar" | "Menengah" | "Mahir";
  pages: {
    title: string;
    content: string; // Markdown/HTML content
    illustration?: string;
  }[];
  xpReward: number;
  quizId: string; // Associated final quiz ID
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "streak" | "materi" | "quiz" | "belanja" | "level";
  threshold: number;
  iconName: string;
  pointsReward: number;
}

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "avatar" | "sertifikat" | "kupon" | "merchandise";
  imageUrl: string;
  isUnlocked?: boolean;
}

export interface CommunityMaterial {
  id: string;
  title: string;
  author: string;
  summary: string;
  content: string;
  likes: number;
  category: string;
  createdAt: string;
  hasLiked?: boolean;
}
