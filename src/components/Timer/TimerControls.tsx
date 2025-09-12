import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  className?: string;
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  className,
}: TimerControlsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8"
        >
          <Play className="w-5 h-5 mr-2" />
          START
        </Button>
      ) : (
        <>
          {isPaused ? (
            <Button
              onClick={onResume}
              size="lg"
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              RESUME
            </Button>
          ) : (
            <Button
              onClick={onPause}
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold px-8"
            >
              <Pause className="w-5 h-5 mr-2" />
              PAUSE
            </Button>
          )}
          <Button
            onClick={onReset}
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
