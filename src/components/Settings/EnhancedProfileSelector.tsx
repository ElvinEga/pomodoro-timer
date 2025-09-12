// src/components/Settings/EnhancedProfileSelector.tsx
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Settings, BarChart3, Check } from "lucide-react";
import { useProfileContext } from "@/stores/ProfileContext";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileManager } from "@/components/Settings/ProfileManager";

interface EnhancedProfileSelectorProps {
  className?: string;
}

export function EnhancedProfileSelector({
  className,
}: EnhancedProfileSelectorProps) {
  const { profiles, activeProfile, setActiveProfile } = useProfileContext();
  const [showManager, setShowManager] = useState(false);

  const handleProfileSelect = async (profile: Profile) => {
    try {
      await setActiveProfile(profile.id);
    } catch (error) {
      console.error("Failed to switch profile:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-between w-full max-w-xs ",
              "text-primary-foreground hover:bg-[#2a2a2a] hover:text-primary-foreground transition-all duration-200",
              "group hover:border-orange-500/50",
              className,
            )}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeProfile.color }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              />
              <span className="font-medium">{activeProfile.name}</span>
              <Badge
                variant="secondary"
                className="text-xs bg-[#2a2a2a] text-muted-foreground"
              >
                {activeProfile.focusDuration}m
              </Badge>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80  text-primary-foreground p-2"
          align="center"
        >
          <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Pomodoro Profiles
          </DropdownMenuLabel>

          <div className="space-y-1 mt-2">
            <AnimatePresence>
              {profiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg",
                    "hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] outline-none",
                    "transition-all duration-200",
                    activeProfile.id === profile.id &&
                      "bg-[#2a2a2a] border border-orange-500/30",
                  )}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: profile.color }}
                    animate={{
                      scale: activeProfile.id === profile.id ? 1.2 : 1,
                    }}
                  />

                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {profile.name}
                      {!profile.isCustom && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-700 text-gray-300"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {profile.focusDuration}m work •{" "}
                      {profile.shortBreakDuration}m break •{" "}
                      {profile.longBreakAfter} sessions
                    </div>
                  </div>

                  {activeProfile.id === profile.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </DropdownMenuItem>
              ))}
            </AnimatePresence>
          </div>

          <DropdownMenuSeparator className="bg-[#2a2a2a]" />

          <DropdownMenuItem
            onClick={() => setShowManager(true)}
            className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Profiles</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Manager Modal */}
      <ProfileManagerDialog open={showManager} onOpenChange={setShowManager} />
    </>
  );
}

// Separate dialog component for profile management
function ProfileManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    createProfile,
    updateProfile,
    deleteProfile,
  } = useProfileContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]  text-primary-foreground max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Profile Manager</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create and manage your Pomodoro profiles
          </DialogDescription>
        </DialogHeader>

        <ProfileManager />
      </DialogContent>
    </Dialog>
  );
}
