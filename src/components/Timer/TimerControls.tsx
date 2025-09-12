// src/components/Timer/TimerControls.tsx
import React, { useState } from "react";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isPressed, setIsPressed] = useState(false);

  const buttonVariants = {
    idle: { scale: 1 },
    pressed: { scale: 0.95 },
    hover: { scale: 1.05 },
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <AnimatePresence mode="wait">
        {!isRunning ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={onStart}
              size="lg"
              className={cn(
                "relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600",
                "hover:from-orange-600 hover:to-orange-700 text-primary-foreground font-semibold px-12 py-6",
                "text-lg rounded-full shadow-lg hover:shadow-orange-500/25",
                "transition-all duration-300 transform hover:scale-105",
                "animate-float",
              )}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
            >
              <Play className="w-6 h-6 mr-3" />
              START
              {/* Ripple effect */}
              <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity rounded-full" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-4"
          >
            {isPaused ? (
              <Button
                onClick={onResume}
                size="lg"
                variant="outline"
                className={cn(
                  "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-primary-foreground",
                  "font-semibold px-8 py-6 rounded-full transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25",
                )}
              >
                <Play className="w-5 h-5 mr-2" />
                RESUME
              </Button>
            ) : (
              <Button
                onClick={onPause}
                size="lg"
                variant="outline"
                className={cn(
                  "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-primary-foreground",
                  "font-semibold px-8 py-6 rounded-full transition-all duration-300",
                  "hover:scale-105",
                )}
              >
                <Pause className="w-5 h-5 mr-2" />
                PAUSE
              </Button>
            )}

            <Button
              onClick={onReset}
              size="icon"
              variant="ghost"
              className="w-14 h-14 text-muted-foreground hover:text-primary-foreground hover:bg-gray-800 rounded-full transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
