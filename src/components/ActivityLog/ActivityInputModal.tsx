// src/components/ActivityLog/ActivityInputModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Zap,
  Clock,
  CheckCircle,
  Coffee,
  Brain,
  BookOpen,
  Palette,
  Heart,
  Briefcase,
  Gamepad2,
  Dumbbell,
} from "lucide-react";
import { useActivityContext } from "@/stores/ActivityContext";
import { ActivityInput } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const categories = [
  { id: "work", name: "Work", icon: Briefcase, color: "bg-blue-500" },
  { id: "learning", name: "Learning", icon: BookOpen, color: "bg-green-500" },
  { id: "creative", name: "Creative", icon: Palette, color: "bg-purple-500" },
  { id: "personal", name: "Personal", icon: Heart, color: "bg-pink-500" },
  { id: "exercise", name: "Exercise", icon: Dumbbell, color: "bg-orange-500" },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "bg-red-500" },
  { id: "break", name: "Break", icon: Coffee, color: "bg-gray-500" },
  { id: "other", name: "Other", icon: Brain, color: "bg-indigo-500" },
];

interface ActivityInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: "focus" | "short-break" | "long-break";
  duration: number;
  profileName: string;
  onSubmit: (input: ActivityInput) => void;
}

export function ActivityInputModal({
  open,
  onOpenChange,
  sessionType,
  duration,
  profileName,
  onSubmit,
}: ActivityInputModalProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("work");
  const [productivity, setProductivity] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!description.trim()) return;

    const input: ActivityInput = {
      description: description.trim(),
      category,
      productivity,
      energy,
      notes: notes.trim() || undefined,
    };

    onSubmit(input);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setDescription("");
    setCategory("work");
    setProductivity(3);
    setEnergy(3);
    setNotes("");
  };

  const sessionConfig = {
    focus: {
      title: "What did you accomplish?",
      icon: CheckCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    "short-break": {
      title: "How was your short break?",
      icon: Coffee,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    "long-break": {
      title: "How was your long break?",
      icon: Coffee,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  };

  // FIX: Handle undefined sessionType with fallback
  const effectiveSessionType = sessionType || "focus";
  const config = sessionConfig[effectiveSessionType] || sessionConfig["focus"];

  // FIX: Don't render if modal shouldn't be open
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]  text-primary-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
            >
              <config.icon className={`w-5 h-5 ${config.color}`} />
            </motion.div>
            <div>
              <DialogTitle className="text-xl">{config.title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {profileName} • {duration} minutes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-primary-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                sessionType === "focus"
                  ? "e.g., Completed project proposal, studied React hooks..."
                  : "e.g., Took a walk, had coffee, relaxed..."
              }
              className="bg-[#2a2a2a] border-[#3a3a3a] text-primary-foreground placeholder-gray-400 min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-primary-foreground">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    category === cat.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-[#3a3a3a] hover:border-[#4a4a4a]",
                  )}
                >
                  <cat.icon className="w-5 h-5" />
                  <span className="text-xs">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Productivity */}
            <div className="space-y-2">
              <Label className="text-primary-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Productivity
              </Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <motion.button
                    key={rating}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setProductivity(rating)}
                    className={cn(
                      "p-1 rounded transition-all",
                      productivity >= rating
                        ? "text-yellow-500"
                        : "text-gray-600 hover:text-muted-foreground",
                    )}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </motion.button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {productivity === 1 && "Not productive"}
                {productivity === 2 && "Slightly productive"}
                {productivity === 3 && "Moderately productive"}
                {productivity === 4 && "Very productive"}
                {productivity === 5 && "Extremely productive"}
              </span>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <Label className="text-primary-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energy Level
              </Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <motion.button
                    key={rating}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEnergy(rating)}
                    className={cn(
                      "p-1 rounded transition-all",
                      energy >= rating
                        ? "text-orange-500"
                        : "text-gray-600 hover:text-muted-foreground",
                    )}
                  >
                    <Zap className="w-5 h-5 fill-current" />
                  </motion.button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {energy === 1 && "Very low energy"}
                {energy === 2 && "Low energy"}
                {energy === 3 && "Moderate energy"}
                {energy === 4 && "High energy"}
                {energy === 5 && "Very high energy"}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-primary-foreground">
              Additional Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts or observations..."
              className="bg-[#2a2a2a] border-[#3a3a3a] text-primary-foreground placeholder-gray-400 min-h-[60px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Log Activity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
