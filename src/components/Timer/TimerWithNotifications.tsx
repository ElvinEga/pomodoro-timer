// src/components/Timer/TimerWithNotifications.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useTimer } from "@/hooks/useTimer";
import { useProfileContext, ProfileProvider } from "@/stores/ProfileContext";
import { useActivityContext, ActivityProvider } from "@/stores/ActivityContext";
import { TodoProvider } from "@/stores/TodoContext";
import { CircularProgress } from "./CircularProgress";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { EnhancedProfileSelector } from "@/components/Settings/EnhancedProfileSelector";
import { ActivityInputModal } from "@/components/ActivityLog/ActivityInputModal";
import { DailyLog } from "@/components/ActivityLog/DailyLog";
import { ActivityCalendar } from "@/components/ActivityLog/ActivityCalendar";
import { StatisticsCharts } from "@/components/ActivityLog/StatisticsCharts";
import { EnhancedSettingsModal } from "@/components/Settings/EnhancedSettingsModal";
import { TodoListView } from "@/components/TodoList/TodoListView";
import { TodoTimerIntegration } from "@/components/TodoList/TodoTimerIntegration";
import {
  Settings,
  Minimize2,
  Calendar,
  Activity,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Clock,
  ChevronLeftCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { audioNotification } from "@/utils/audio";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";
import { useStatistics } from "@/hooks/useStatistics";

function TimerContent() {
  const { activeProfile, settings, updateSettings } = useProfileContext();
  const { addActivity } = useActivityContext();
  const { state, start, pause, resume, reset, setProfile, completeSession } =
    useTimer();
  const [showActivityInput, setShowActivityInput] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showActivityView, setShowActivityView] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();
  const { weekStats, monthStats, yearStats } = useStatistics();

  // Update timer when profile changes
  React.useEffect(() => {
    setProfile(activeProfile);
  }, [activeProfile, setProfile]);

  // Handle session completion with notifications
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      const completedSession = state.currentSession;
      const completedDuration =
        completedSession === "focus"
          ? state.currentProfile.focusDuration
          : completedSession === "short-break"
          ? state.currentProfile.shortBreakDuration
          : state.currentProfile.longBreakDuration;
      completeSession();
      handleSessionComplete(completedSession, completedDuration);
    }
  }, [
    state.timeRemaining,
    state.isRunning,
    state.currentSession,
    state.currentProfile,
    completeSession,
  ]);

  // ADD THE MISSING FUNCTION HERE
  const handleSettingChange = useCallback(
    async (key: keyof typeof settings, value: any) => {
      try {
        await updateSettings({ [key]: value });

        if (key === "soundAlerts" && value) {
          audioNotification.playSound("notification");
        }

        toast({
          title: "Setting updated",
          description: `${key} has been ${value ? "enabled" : "disabled"}.`,
          className: " text-primary-foreground",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update setting.",
          variant: "destructive",
        });
      }
    },
    [settings, updateSettings, toast]
  );

  const handleSessionComplete = useCallback(
    async (
      sessionType: "focus" | "short-break" | "long-break",
      duration: number
    ) => {
      // Play sound notification
      if (settings.soundAlerts) {
        if (sessionType === "focus") {
          audioNotification.playCompleteSequence();
        } else {
          audioNotification.playSound("break");
        }
      }

      // Show desktop notification
      if (settings.desktopNotifications) {
        try {
          const title =
            sessionType === "focus" ? "Focus Complete!" : "Break Time Over!";
          const body =
            sessionType === "focus"
              ? `Great job! Time for a ${
                  state.currentSession === "long-break" ? "long" : "short"
                } break.`
              : "Ready to focus again? Let's get back to work!";

          await invoke("show_notification", { title, body });
        } catch (error) {
          console.warn("Failed to show notification:", error);
        }
      }

      // Show in-app notification
      toast({
        title:
          sessionType === "focus"
            ? "Focus session complete!"
            : "Break time over!",
        description:
          sessionType === "focus"
            ? "Time for a well-deserved break."
            : "Ready to focus again?",
        duration: 5000,
        className: " text-primary-foreground",
      });

      // Show activity input for focus sessions
      if (sessionType === "focus") {
        setTimeout(() => {
          setPendingActivity({
            sessionType,
            duration,
            profileName: state.currentProfile.name,
            profileId: state.currentProfile.id,
          });
          setShowActivityInput(true);
        }, 1000);
      }

      // Auto-start next session if enabled
      if (settings.autoStartNextSession && sessionType !== "focus") {
        setTimeout(() => {
          start();
        }, 1000);
      }
    },
    [state, settings, audioNotification, toast, start]
  );

  const handleMinimizeToTray = async () => {
    if (settings.minimizeToTray) {
      try {
        await invoke("minimize_to_tray");
        setIsMinimized(true);
        toast({
          title: "Minimized to tray",
          description: "App is running in the background.",
          className: " text-primary-foreground",
        });
      } catch (error) {
        console.warn("Failed to minimize to tray:", error);
      }
    }
  };

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
              className="w-8 h-8 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/logo.svg" alt="Lockyn Timer" className="w-8 h-8" />
            </motion.div>
            <h1 className="text-xl hidden sm:block font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Lockyn Timer
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound indicator */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleSettingChange("soundAlerts", !settings.soundAlerts)
                }
                className={cn(
                  "text-muted-foreground hover:text-primary-foreground",
                  settings.soundAlerts && "text-orange-500"
                )}
              >
                {settings.soundAlerts ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </motion.div>

            {/* Notification indicator */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleSettingChange(
                    "desktopNotifications",
                    !settings.desktopNotifications
                  )
                }
                className={cn(
                  "text-muted-foreground hover:text-primary-foreground",
                  settings.desktopNotifications && "text-orange-500"
                )}
              >
                {settings.desktopNotifications ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </Button>
            </motion.div>

            {/* Activity view toggle */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowActivityView(!showActivityView)}
                className={cn(
                  "text-muted-foreground hover:text-primary-foreground",
                  showActivityView && "text-orange-500 bg-orange-500/10"
                )}
              >
                <Activity className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Minimize to tray */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimizeToTray}
                className="text-muted-foreground hover:text-primary-foreground"
                disabled={!settings.minimizeToTray}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Settings */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary-foreground"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </motion.div>
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

              {/* Quick Settings Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center gap-4 p-3 glass rounded-lg"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Session {state.sessionsCompleted + 1}</span>
                </div>
                <div className="w-px h-4 bg-gray-600" />
                <div className="flex items-center gap-2">
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
                            : "bg-gray-600"
                        )}
                        whileHover={{ scale: 1.2 }}
                      />
                    )
                  )}
                </div>
              </motion.div>

              {/* Todo Integration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full max-w-md space-y-4"
              >
                {/* Quick Todo View */}
                <TodoTimerIntegration />
                
                {/* Full Todo List */}
                <TodoListView />
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
                  <h2 className="text-xl font-bold text-primary-foreground">
                    Activity Tracking
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    View your productivity patterns
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowActivityView(false)}
                  className="bg-primary border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  <ArrowLeft /> Back
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
                  <Card className="bg-[#1a1a1a] border-[#2a2a2a] h-full">
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

              {/* Period Statistics */}
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">
                    Period Statistics
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
                            {weekStats.sessions}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {weekStats.focusMinutes}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus Min
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {weekStats.averageRating > 0
                              ? weekStats.averageRating.toFixed(1)
                              : "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {weekStats.streakDays}
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
                            {monthStats.sessions}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {monthStats.focusMinutes.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus Min
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {monthStats.averageRating > 0
                              ? monthStats.averageRating.toFixed(1)
                              : "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {monthStats.totalDays}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Days
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="year" className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {yearStats.sessions}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {yearStats.focusMinutes.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Focus Min
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {yearStats.averageRating > 0
                              ? yearStats.averageRating.toFixed(1)
                              : "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-foreground">
                            {yearStats.totalDays}
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

              {/* Additional Statistics Charts */}
              <StatisticsCharts />
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

        <EnhancedSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </div>
    </div>
  );
}

export function TimerWithNotifications() {
  return (
    <TodoProvider>
      <ActivityProvider>
        <ProfileProvider>
          <TimerContent />
        </ProfileProvider>
      </ActivityProvider>
    </TodoProvider>
  );
}
