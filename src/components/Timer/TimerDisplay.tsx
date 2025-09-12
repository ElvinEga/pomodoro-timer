// src/components/Timer/TimerDisplay.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimerDisplayProps {
  timeRemaining: number; // in seconds
  currentSession: "focus" | "short-break" | "long-break";
  sessionsCompleted: number;
  className?: string;
}

export function TimerDisplay({
  timeRemaining,
  currentSession,
  sessionsCompleted,
  className,
}: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const sessionConfig = {
    focus: {
      label: "Focus Session",
      color: "bg-orange-500",
      textColor: "text-orange-500",
    },
    "short-break": {
      label: "Short Break",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    "long-break": {
      label: "Long Break",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
  };

  const config = sessionConfig[currentSession];

  return (
    <div className={cn("text-center space-y-4", className)}>
      {/* Session indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn("w-2 h-2 rounded-full animate-pulse", config.color)}
        />
        <span
          className={cn(
            "text-sm font-medium uppercase tracking-wider",
            config.textColor,
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Timer display */}
      <div className="relative">
        <div className="font-mono text-7xl font-bold text-white mb-2 tabular-nums">
          {String(minutes).padStart(2, "0")}
          <span className="animate-pulse">:</span>
          {String(seconds).padStart(2, "0")}
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 blur-xl opacity-30 pointer-events-none">
          <div className="font-mono text-7xl font-bold text-orange-500 tabular-nums">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Session counter */}
      <div className="flex items-center justify-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              i < sessionsCompleted % 4
                ? "bg-orange-500 scale-110"
                : "bg-gray-600",
            )}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400">
          {sessionsCompleted} completed
        </span>
      </div>
    </div>
  );
}
