// src/types/index.ts
export interface Profile {
  id: string;
  name: string;
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakAfter: number; // number of sessions
  color: string;
  isCustom: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileSettings {
  autoStartNextSession: boolean;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
}

export interface AppSettings {
  profiles: Profile[];
  activeProfileId: string;
  settings: ProfileSettings;
}
