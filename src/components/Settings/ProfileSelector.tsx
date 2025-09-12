// src/components/Settings/ProfileSelector.tsx
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileSelectorProps {
  currentProfile: Profile;
  onProfileSelect: (profile: Profile) => void;
  className?: string;
}

const defaultProfiles: Profile[] = [
  {
    id: "work",
    name: "Work",
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakAfter: 4,
    color: "#ff6b35",
    isCustom: false,
  },
  {
    id: "reading",
    name: "Reading",
    focusDuration: 45,
    shortBreakDuration: 10,
    longBreakDuration: 20,
    longBreakAfter: 3,
    color: "#8b5cf6",
    isCustom: false,
  },
  {
    id: "study",
    name: "Study",
    focusDuration: 30,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakAfter: 4,
    color: "#10b981",
    isCustom: false,
  },
  {
    id: "creative",
    name: "Creative",
    focusDuration: 90,
    shortBreakDuration: 15,
    longBreakDuration: 30,
    longBreakAfter: 2,
    color: "#f59e0b",
    isCustom: false,
  },
];

export function ProfileSelector({
  currentProfile,
  onProfileSelect,
  className,
}: ProfileSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between w-full max-w-xs bg-[#1a1a1a] border-[#2a2a2a]",
            "text-white hover:bg-[#2a2a2a] hover:text-white",
            className,
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentProfile.color }}
            />
            <span>{currentProfile.name}</span>
            <span className="text-xs text-gray-400">
              ({currentProfile.focusDuration}m)
            </span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-[#1a1a1a] border-[#2a2a2a] text-white"
        align="center"
      >
        {defaultProfiles.map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            onClick={() => onProfileSelect(profile)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 cursor-pointer",
              "hover:bg-[#2a2a2a] focus:bg-[#2a2a2a]",
              currentProfile.id === profile.id && "bg-[#2a2a2a]",
            )}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: profile.color }}
            />
            <div className="flex-1">
              <div className="font-medium">{profile.name}</div>
              <div className="text-xs text-gray-400">
                {profile.focusDuration}/{profile.shortBreakDuration}/
                {profile.longBreakAfter}
              </div>
            </div>
            {currentProfile.id === profile.id && (
              <div className="w-2 h-2 rounded-full bg-orange-500" />
            )}
          </DropdownMenuItem>
        ))}

        <div className="border-t border-[#2a2a2a] my-1" />

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a]">
          <Plus className="w-4 h-4" />
          <span>Create Custom Profile</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
