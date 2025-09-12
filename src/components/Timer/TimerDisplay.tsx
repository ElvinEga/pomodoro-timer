import React from "react";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  timeRemaining: number; // in seconds
  currentSession: "focus" | "short-break" | "long-break";
  className?: string;
}

export function TimerDisplay({
  timeRemaining,
  currentSession,
  className,
}: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const sessionLabels = {
    focus: "FOCUS",
    "short-break": "SHORT BREAK",
    "long-break": "LONG BREAK",
  };

  return (
    <div className={cn("text-center", className)}>
      <div className="font-mono text-6xl font-bold text-white mb-2">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        {sessionLabels[currentSession]}
      </div>
    </div>
  );
}
