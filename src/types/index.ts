// Base types for the Pomodoro Timer application

/**
 * Profile configuration for different Pomodoro timing setups
 */
export interface Profile {
  id: string;
  name: string;
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakAfter: number; // number of sessions
  color: string; // hex color code
  isCustom: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Activity logged during or after Pomodoro sessions
 */
export interface Activity {
  id: string;
  description: string;
  category: string;
  sessionType: "focus" | "short-break" | "long-break";
  duration: number; // in minutes
  timestamp: Date;
  profileId: string;
  profileName: string;
  productivity?: number; // 1-5 rating
  energy?: number; // 1-5 rating
  notes?: string;
}

/**
 * User input for activity logging
 */
export interface ActivityInput {
  description: string;
  category: string;
  productivity: number; // 1-5 rating
  energy: number; // 1-5 rating
  notes?: string;
}

/**
 * Daily summary of activities and productivity metrics
 */
export interface DailySummary {
  date: Date;
  totalFocusTime: number; // in minutes
  totalBreakTime: number; // in minutes
  sessionsCompleted: number;
  activities: Activity[];
  productivity: number; // average rating (1-5)
  energy: number; // average rating (1-5)
}

/**
 * Timer state for Pomodoro sessions
 */
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentSession: "focus" | "short-break" | "long-break";
  timeRemaining: number; // in seconds
  sessionsCompleted: number;
  currentProfile: Profile;
}

/**
 * Application settings and preferences
 */
export interface ProfileSettings {
  autoStartNextSession: boolean;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  soundVolume: number; // 0-100
}

/**
 * Complete application settings structure
 */
export interface AppSettings {
  profiles: Profile[];
  activeProfileId: string;
  settings: ProfileSettings;
}

/**
 * Activity statistics and analytics
 */
export interface ActivityStats {
  totalSessions: number;
  totalFocusTime: number; // in minutes
  totalBreakTime: number; // in minutes
  averageSessionLength: number; // in minutes
  streakDays: number;
  mostProductiveTime: string;
  favoriteCategory: string;
  weeklyGoalProgress: number; // percentage
  monthlyGoalProgress: number; // percentage
}

/**
 * Export data structure for backup/restore
 */
export interface ExportData {
  exportDate: string;
  dateRange: {
    start: string;
    end: string;
  };
  activities: Activity[];
  profiles: Profile[];
  settings: AppSettings;
  summary: {
    totalActivities: number;
    totalFocusTime: number;
    totalBreakTime: number;
    dateRange: string;
  };
}

/**
 * Notification preferences
 */
export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  breakReminders: boolean;
  focusReminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

/**
 * Timer configuration for different session types
 */
export interface TimerConfig {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakAfter: number;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
}

/**
 * Window state and preferences
 */
export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isMinimized: boolean;
}

/**
 * Keyboard shortcuts configuration
 */
export interface KeyboardShortcuts {
  startPause: string;
  reset: string;
  skip: string;
  toggleAlwaysOnTop: string;
  minimizeToTray: string;
  showSettings: string;
  showActivityLog: string;
}

/**
 * System tray configuration
 */
export interface SystemTrayConfig {
  enabled: boolean;
  showOnClose: boolean;
  startWithSystem: boolean;
  menuItems: string[];
}

/**
 * Data backup configuration
 */
export interface BackupConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  maxBackups: number;
  includeActivities: boolean;
  includeProfiles: boolean;
  includeSettings: boolean;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * File operation results
 */
export interface FileOperationResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Category definitions for activities
 */
export const ActivityCategories = [
  { id: "work", name: "Work", icon: "briefcase", color: "#3b82f6" },
  { id: "learning", name: "Learning", icon: "book-open", color: "#10b981" },
  { id: "creative", name: "Creative", icon: "palette", color: "#8b5cf6" },
  { id: "personal", name: "Personal", icon: "heart", color: "#ec4899" },
  { id: "exercise", name: "Exercise", icon: "dumbbell", color: "#f59e0b" },
  { id: "gaming", name: "Gaming", icon: "gamepad", color: "#ef4444" },
  { id: "break", name: "Break", icon: "coffee", color: "#6b7280" },
  { id: "other", name: "Other", icon: "brain", color: "#6366f1" },
] as const;

export type ActivityCategory = (typeof ActivityCategories)[number]["id"];

/**
 * Sound types for audio notifications
 */
export type SoundType =
  | "start"
  | "pause"
  | "complete"
  | "break"
  | "notification";

/**
 * Export format types
 */
export type ExportFormat = "json" | "csv" | "pdf";

/**
 * Import source types
 */
export type ImportSource = "activities" | "profiles" | "settings" | "all";

/**
 * Timer action types for state management
 */
export type TimerAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" }
  | { type: "SESSION_COMPLETE" }
  | { type: "SET_PROFILE"; payload: Profile }
  | { type: "SKIP_SESSION" };

/**
 * Session state for tracking
 */
export interface SessionState {
  id: string;
  type: "focus" | "short-break" | "long-break";
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
  profileId: string;
  activityId?: string;
}

/**
 * Goal tracking
 */
export interface Goal {
  id: string;
  type: "daily" | "weekly" | "monthly";
  target: number; // target minutes or sessions
  targetType: "time" | "sessions";
  category?: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Goal progress
 */
export interface GoalProgress {
  goalId: string;
  current: number;
  target: number;
  percentage: number;
  remaining: number;
  period: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  language: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  weekStartsOn: "sunday" | "monday";
  theme: "dark" | "light" | "auto";
  reduceMotion: boolean;
  highContrast: boolean;
}

/**
 * App metadata
 */
export interface AppMetadata {
  version: string;
  buildDate: string;
  platform: string;
  architecture: string;
}

/**
 * Error types
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

/**
 * Loading states
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Default values and constants
export const DEFAULT_PROFILE: Profile = {
  id: "work",
  name: "Work",
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakAfter: 4,
  color: "#ff6b35",
  isCustom: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const DEFAULT_SETTINGS: ProfileSettings = {
  autoStartNextSession: false,
  soundAlerts: true,
  desktopNotifications: true,
  alwaysOnTop: false,
  minimizeToTray: true,
  soundVolume: 50,
};

export const DEFAULT_GOALS: Goal[] = [
  {
    id: "daily-focus",
    type: "daily",
    target: 120, // 2 hours
    targetType: "time",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "weekly-sessions",
    type: "weekly",
    target: 20, // 20 sessions
    targetType: "sessions",
    isActive: true,
    createdAt: new Date(),
  },
];

export const MAX_SESSION_DURATION = 180; // 3 hours
export const MIN_SESSION_DURATION = 1; // 1 minute
export const MAX_STREAK_DAYS = 365;
export const EXPORT_LIMIT = 10000; // Maximum items to export at once

// Validation rules
export const ValidationRules = {
  profileName: { min: 1, max: 50 },
  activityDescription: { min: 1, max: 500 },
  activityNotes: { max: 1000 },
  exportName: { min: 1, max: 100 },
} as const;

// Local storage keys
export const StorageKeys = {
  PROFILES: "pomodoro-profiles",
  ACTIVITIES: "pomodoro-activities",
  SETTINGS: "pomodoro-settings",
  WINDOW_STATE: "pomodoro-window-state",
  USER_PREFERENCES: "pomodoro-user-preferences",
  GOALS: "pomodoro-goals",
  BACKUP_CONFIG: "pomodoro-backup-config",
} as const;

// Event names
export const EventNames = {
  SESSION_START: "session-start",
  SESSION_END: "session-end",
  SESSION_COMPLETE: "session-complete",
  PROFILE_CHANGED: "profile-changed",
  SETTINGS_UPDATED: "settings-updated",
  ACTIVITY_LOGGED: "activity-logged",
  GOAL_ACHIEVED: "goal-achieved",
  STREAK_BROKEN: "streak-broken",
  NOTIFICATION_CLICKED: "notification-clicked",
  TRAY_MENU_CLICKED: "tray-menu-clicked",
} as const;
