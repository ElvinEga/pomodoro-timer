// src/components/Timer/TimerMain.tsx
import React, { useState, useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { CircularProgress } from "./CircularProgress";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { ProfileSelector } from "@/components/Settings/ProfileSelector";
import { Settings, BarChart3, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function TimerMain() {
  const { state, start, pause, resume, reset, setProfile } = useTimer();
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const { toast } = useToast();

  const totalDuration =
    state.currentSession === "focus"
      ? state.currentProfile.focusDuration * 60
      : state.currentSession === "short-break"
        ? state.currentProfile.shortBreakDuration * 60
        : state.currentProfile.longBreakDuration * 60;

  const progress =
    ((totalDuration - state.timeRemaining) / totalDuration) * 100;

  // Session completion notification
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      toast({
        title:
          state.currentSession === "focus"
            ? "Focus session complete!"
            : "Break time over!",
        description:
          state.currentSession === "focus"
            ? "Time for a well-deserved break."
            : "Ready to focus again?",
        duration: 5000,
        className: "bg-[#1a1a1a] border-[#2a2a2a] text-white",
      });
    }
  }, [state.timeRemaining, state.isRunning, state.currentSession, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-600/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pomodoro Timer
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
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
            <ProfileSelector
              currentProfile={state.currentProfile}
              onProfileSelect={setProfile}
            />
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
            <p className="text-sm text-gray-400">
              Current Session:{" "}
              <span className="text-white font-medium">
                {state.sessionsCompleted + 1}
              </span>
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(state.currentProfile.longBreakAfter)].map((_, i) => (
                <div
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
                        : "bg-gray-600",
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
