export interface Profile {
  id: string;
  name: string;
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakAfter: number; // number of sessions
  color: string;
  isCustom: boolean;
}

export interface Activity {
  id: string;
  description: string;
  category: string;
  sessionType: "focus" | "short-break" | "long-break";
  duration: number; // in minutes
  timestamp: Date;
  profileId: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentSession: "focus" | "short-break" | "long-break";
  timeRemaining: number; // in seconds
  sessionsCompleted: number;
  currentProfile: Profile;
}

export type TimerAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" }
  | { type: "SESSION_COMPLETE" }
  | { type: "SET_PROFILE"; payload: Profile };
