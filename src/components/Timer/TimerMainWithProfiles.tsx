// src/components/Timer/TimerMainWithProfiles.tsx
import React, { useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { CircularProgress } from "./CircularProgress";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { EnhancedProfileSelector } from "@/components/Settings/EnhancedProfileSelector";
import { Settings, BarChart3, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ProfileProvider, useProfileContext } from "@/stores/ProfileContext";
import { SettingsModal } from "@/components/Settings/SettingsModal";
import { cn } from "@/lib/utils";

function TimerContent() {
  const { activeProfile, settings } = useProfileContext();
  const { state, start, pause, resume, reset, setProfile } = useTimer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Update timer when profile changes
  React.useEffect(() => {
    setProfile(activeProfile);
  }, [activeProfile, setProfile]);

  // Auto-start next session if enabled
  React.useEffect(() => {
    if (
      state.timeRemaining === 0 &&
      state.isRunning &&
      settings.autoStartNextSession
    ) {
      const timer = setTimeout(() => {
        start();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    state.timeRemaining,
    state.isRunning,
    settings.autoStartNextSession,
    start,
  ]);

  const totalDuration =
    state.currentSession === "focus"
      ? state.currentProfile.focusDuration * 60
      : state.currentSession === "short-break"
      ? state.currentProfile.shortBreakDuration * 60
      : state.currentProfile.longBreakDuration * 60;

  const progress =
    ((totalDuration - state.timeRemaining) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-primary-foreground p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-600/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-primary-foreground font-bold text-sm">
                P
              </span>
            </motion.div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Lockyn Timer
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary-foreground hover:bg-white/10"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary-foreground hover:bg-white/10"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary-foreground hover:bg-white/10"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Timer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="relative mb-12">
            <CircularProgress
              progress={progress}
              isRunning={state.isRunning && !state.isPaused}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <TimerDisplay
                timeRemaining={state.timeRemaining}
                currentSession={state.currentSession}
                sessionsCompleted={state.sessionsCompleted}
              />
            </div>
          </div>

          <TimerControls
            isRunning={state.isRunning}
            isPaused={state.isPaused}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            className="mb-8"
          />

          {/* Profile Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs"
          >
            <EnhancedProfileSelector />
          </motion.div>
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pt-8 text-center"
        >
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Current Session:{" "}
              <span className="text-primary-foreground font-medium">
                {state.sessionsCompleted + 1}
              </span>
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(state.currentProfile.longBreakAfter)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    i <
                      state.sessionsCompleted %
                        state.currentProfile.longBreakAfter
                      ? "bg-orange-500 scale-110"
                      : i ===
                        state.sessionsCompleted %
                          state.currentProfile.longBreakAfter
                      ? "bg-orange-500/50 scale-105"
                      : "bg-gray-600"
                  )}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export function TimerMainWithProfiles() {
  return (
    <ProfileProvider>
      <TimerContent />
    </ProfileProvider>
  );
}
