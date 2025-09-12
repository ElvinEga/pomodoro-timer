// src/types/index.ts
export interface Activity {
  id: string;
  description: string;
  category: string;
  sessionType: "focus" | "short-break" | "long-break";
  duration: number; // in minutes
  timestamp: Date;
  profileId: string;
  profileName: string;
}

export interface ActivityInput {
  description: string;
  category: string;
  productivity: number; // 1-5 rating
  energy: number; // 1-5 rating
  notes?: string;
}

export interface DailySummary {
  date: Date;
  totalFocusTime: number;
  totalBreakTime: number;
  sessionsCompleted: number;
  activities: Activity[];
  productivity: number; // average rating
  energy: number; // average rating
}

export interface ActivityStats {
  totalSessions: number;
  totalFocusTime: number;
  totalBreakTime: number;
  averageSessionLength: number;
  streakDays: number;
  mostProductiveTime: string;
  favoriteCategory: string;
}
