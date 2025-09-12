import { useState, useEffect, useCallback } from "react";
import { Profile, AppSettings, ProfileSettings } from "@/types";
import { invoke } from "@tauri-apps/api/core";

interface UseProfilesReturn {
  profiles: Profile[];
  activeProfile: Profile;
  settings: ProfileSettings;
  isLoading: boolean;
  error: string | null;
  createProfile: (
    profile: Omit<Profile, "id" | "isCustom" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
}

const defaultProfile: Profile = {
  id: "work",
  name: "Work",
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakAfter: 4,
  color: "#ff6b35",
  isCustom: false,
};

const defaultSettings: ProfileSettings = {
  autoStartNextSession: false,
  soundAlerts: true,
  desktopNotifications: true,
  alwaysOnTop: false,
  minimizeToTray: true,
  soundVolume: 50,
};

export function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile>(defaultProfile);
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profiles from disk
  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await invoke<string>("read_profiles");
      const parsed = JSON.parse(data) as AppSettings;

      setProfiles(parsed.profiles);
      const active =
        parsed.profiles.find((p) => p.id === parsed.activeProfileId) ||
        parsed.profiles[0];
      setActiveProfile(active);
      setSettings(parsed.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
      console.error("Failed to load profiles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profiles to disk
  const saveProfiles = useCallback(
    async (
      newProfiles: Profile[],
      newActiveId?: string,
      newSettings?: ProfileSettings,
    ) => {
      try {
        const data: AppSettings = {
          profiles: newProfiles,
          activeProfileId: newActiveId || activeProfile.id,
          settings: newSettings || settings,
        };
        await invoke("write_profiles", { data: JSON.stringify(data) });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save profiles",
        );
        throw err;
      }
    },
    [activeProfile.id, settings],
  );

  // Create new profile
  const createProfile = useCallback(
    async (
      profileData: Omit<Profile, "id" | "isCustom" | "createdAt" | "updatedAt">,
    ) => {
      const newProfile: Profile = {
        ...profileData,
        id: `custom-${Date.now()}`,
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newProfiles = [...profiles, newProfile];
      setProfiles(newProfiles);
      await saveProfiles(newProfiles, newProfile.id);
      setActiveProfile(newProfile);
    },
    [profiles, saveProfiles],
  );

  // Update profile
  const updateProfile = useCallback(
    async (id: string, updates: Partial<Profile>) => {
      const newProfiles = profiles.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p,
      );
      setProfiles(newProfiles);
      await saveProfiles(newProfiles);

      if (activeProfile.id === id) {
        setActiveProfile({ ...activeProfile, ...updates });
      }
    },
    [profiles, activeProfile, saveProfiles],
  );

  // Delete profile
  const deleteProfile = useCallback(
    async (id: string) => {
      if (profiles.length <= 1) {
        throw new Error("Cannot delete the last profile");
      }

      const newProfiles = profiles.filter((p) => p.id !== id);
      setProfiles(newProfiles);

      if (activeProfile.id === id) {
        const newActive = newProfiles[0];
        setActiveProfile(newActive);
        await saveProfiles(newProfiles, newActive.id);
      } else {
        await saveProfiles(newProfiles);
      }
    },
    [profiles, activeProfile, saveProfiles],
  );

  // Set active profile
  const setActiveProfileById = useCallback(
    async (id: string) => {
      const profile = profiles.find((p) => p.id === id);
      if (!profile) {
        throw new Error("Profile not found");
      }

      setActiveProfile(profile);
      await saveProfiles(profiles, id);
    },
    [profiles, saveProfiles],
  );

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<ProfileSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await saveProfiles(profiles, activeProfile.id, updatedSettings);
    },
    [profiles, activeProfile.id, settings, saveProfiles],
  );

  // Load on mount
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    activeProfile,
    settings,
    isLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile: setActiveProfileById,
    updateSettings,
  };
}
