import React, { createContext, useContext, ReactNode } from "react";
import { useProfiles } from "@/hooks/useProfiles";
import { Profile, ProfileSettings } from "@/types";

interface ProfileContextType {
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

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profiles = useProfiles();

  return (
    <ProfileContext.Provider value={profiles}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
