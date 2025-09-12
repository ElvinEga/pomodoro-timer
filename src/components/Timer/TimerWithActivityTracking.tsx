// src/components/Timer/TimerWithActivityTracking.tsx
import React, { useState, useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { ProfileProvider, useProfileContext } from "@/stores/ProfileContext";
import { ActivityProvider, useActivityContext } from "@/stores/ActivityContext";
import { CircularProgress } from "./CircularProgress";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { EnhancedProfileSelector } from "@/components/Settings/EnhancedProfileSelector";
import { ActivityInputModal } from "@/components/ActivityLog/ActivityInputModal";
import { DailyLog } from "@/components/ActivityLog/DailyLog";
import { ActivityCalendar } from "@/components/ActivityLog/ActivityCalendar";
import {
  Settings,
  BarChart3,
  Minimize2,
  Calendar,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "@/components/Settings/SettingsModal";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function TimerContent() {
  const { activeProfile, settings } = useProfileContext();
  const { addActivity } = useActivityContext();
  const { state, start, pause, resume, reset, setProfile } = useTimer();
  const [showActivityInput, setShowActivityInput] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showActivityView, setShowActivityView] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Update timer when profile changes
  React.useEffect(() => {
    setProfile(activeProfile);
  }, [activeProfile, setProfile]);

  // Handle session completion
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      // Show activity input for focus sessions
      if (state.currentSession === "focus") {
        setTimeout(() => {
          setPendingActivity({
            sessionType: state.currentSession,
            duration: state.currentProfile.focusDuration,
            profileName: state.currentProfile.name,
            profileId: state.currentProfile.id,
          });
          setShowActivityInput(true);
        }, 1000);
      }

      // Auto-start next session if enabled
      if (settings.autoStartNextSession && state.currentSession !== "focus") {
        setTimeout(() => {
          start();
        }, 3000);
      }
    }
  }, [
    state.timeRemaining,
    state.isRunning,
    state.currentSession,
    state.currentProfile,
    settings.autoStartNextSession,
    start,
    toast,
  ]);

  const totalDuration =
    state.currentSession === "focus"
      ? state.currentProfile.focusDuration * 60
      : state.currentSession === "short-break"
        ? state.currentProfile.shortBreakDuration * 60
        : state.currentProfile.longBreakDuration * 60;

  const progress =
    ((totalDuration - state.timeRemaining) / totalDuration) * 100;

  const handleActivitySubmit = (input: any) => {
    if (pendingActivity) {
      addActivity({
        ...pendingActivity,
        description: input.description,
        category: input.category,
        productivity: input.productivity,
        energy: input.energy,
        notes: input.notes,
      });
      setPendingActivity(null);
    }
  };

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
              Pomodoro Timer
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowActivityView(!showActivityView)}
              className={cn(
                "text-muted-foreground hover:text-primary-foreground hover:bg-white/10",
                showActivityView && "text-orange-500 bg-orange-500/10",
              )}
            >
              <Activity className="w-5 h-5" />
            </Button>
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

        <AnimatePresence mode="wait">
          {!showActivityView ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              {/* Timer Section */}
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
                    {[...Array(state.currentProfile.longBreakAfter)].map(
                      (_, i) => (
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
                                : "bg-gray-600",
                          )}
                          whileHover={{ scale: 1.2 }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 space-y-6"
            >
              {/* Activity View Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary-foreground">
                    Activity Tracking
                  </h2>
                  <p className="text-muted-foreground">
                    View your productivity patterns
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowActivityView(false)}
                  className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  Back to Timer
                </Button>
              </div>

              {/* Calendar and Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ActivityCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Card className=" h-full">
                    <CardHeader>
                      <CardTitle className="text-primary-foreground flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {format(selectedDate, "MMMM d, yyyy")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DailyLog
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Weekly/Monthly Stats */}
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="week" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2a]">
                      <TabsTrigger
                        value="week"
                        className="data-[state=active]:bg-orange-500"
                      >
                        Week
                      </TabsTrigger>
                      <TabsTrigger
                        value="month"
                        className="data-[state=active]:bg-orange-500"
                      >
                        Month
                      </TabsTrigger>
                      <TabsTrigger
                        value="year"
                        className="data-[state=active]:bg-orange-500"
                      >
                        Year
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="week" className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            12
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            300
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus Min
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            4.2
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            7
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Day Streak
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="month" className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            48
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            1,200
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus Min
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            4.1
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            21
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Day Streak
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="year" className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            576
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            14,400
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus Min
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            4.3
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            156
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Days
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Input Modal */}
        <ActivityInputModal
          open={showActivityInput}
          onOpenChange={setShowActivityInput}
          sessionType={pendingActivity?.sessionType}
          duration={pendingActivity?.duration}
          profileName={pendingActivity?.profileName}
          onSubmit={handleActivitySubmit}
        />

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  );
}

export function TimerWithActivityTracking() {
  return (
    <ActivityProvider>
      <ProfileProvider>
        <TimerContent />
      </ProfileProvider>
    </ActivityProvider>
  );
}
