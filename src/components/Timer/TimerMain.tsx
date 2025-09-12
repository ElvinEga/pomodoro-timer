import React from "react";
import { useTimer } from "@/hooks/useTimer";
import { CircularProgress } from "./CircularProgress";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TimerMain() {
  const { state, start, pause, resume, reset } = useTimer();

  const totalDuration =
    state.currentSession === "focus"
      ? state.currentProfile.focusDuration * 60
      : state.currentSession === "short-break"
        ? state.currentProfile.shortBreakDuration * 60
        : state.currentProfile.longBreakDuration * 60;

  const progress =
    ((totalDuration - state.timeRemaining) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">Pomodoro Timer</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative mb-8">
          <CircularProgress progress={progress} />
          <div className="absolute inset-0 flex items-center justify-center">
            <TimerDisplay
              timeRemaining={state.timeRemaining}
              currentSession={state.currentSession}
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
        />
      </div>

      {/* Profile Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          Profile:{" "}
          <span className="text-orange-500 font-medium">
            {state.currentProfile.name}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Sessions completed: {state.sessionsCompleted}
        </p>
      </div>
    </div>
  );
}
