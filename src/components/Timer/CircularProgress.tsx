// src/components/Timer/CircularProgress.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  isRunning?: boolean;
}

export function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 12,
  className,
  isRunning = false,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(42, 42, 42, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
          className="drop-shadow-sm"
        />

        {/* Progress circle with gradient and animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000 ease-out",
            isRunning && "animate-pulse",
          )}
          style={{
            filter: isRunning
              ? "drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))"
              : "none",
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" />
            <stop offset="50%" stopColor="#ff8c42" />
            <stop offset="100%" stopColor="#f7931e" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
