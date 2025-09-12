// src/components/ActivityLog/DailyLog.tsx
import React, { useState } from "react";
import { useActivityContext } from "@/stores/ActivityContext";
import { format, isToday, isYesterday } from "date-fns";
import {
  Clock,
  TrendingUp,
  Zap,
  Trash2,
  Edit3,
  Calendar,
  BarChart3,
  Filter,
  Star,
  BookOpen,
  Palette,
  Heart,
  Dumbbell,
  Gamepad2,
  Coffee,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DailyLogProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DailyLog({ selectedDate, onDateChange }: DailyLogProps) {
  const { getActivitiesForDate, deleteActivity, dailySummaries } =
    useActivityContext();
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const activities = getActivitiesForDate(selectedDate);
  const filteredActivities =
    filterCategory === "all"
      ? activities
      : activities.filter((a) => a.category === filterCategory);

  const summary = dailySummaries.find(
    (ds) =>
      format(ds.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
  );

  const categories = [...new Set(activities.map((a) => a.category))];

  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  const getActivityIcon = (category: string) => {
    const icons = {
      work: BarChart3,
      learning: BookOpen,
      creative: Palette,
      personal: Heart,
      exercise: Dumbbell,
      gaming: Gamepad2,
      break: Coffee,
      other: Brain,
    };
    return icons[category as keyof typeof icons] || Brain;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: "bg-blue-500",
      learning: "bg-green-500",
      creative: "bg-purple-500",
      personal: "bg-pink-500",
      exercise: "bg-orange-500",
      gaming: "bg-red-500",
      break: "bg-gray-500",
      other: "bg-indigo-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-muted-foreground">
            {activities.length} activities • {summary?.totalFocusTime || 0}min
            focus time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterCategory === "all" ? "All Categories" : filterCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" text-primary-foreground">
              <DropdownMenuItem
                onClick={() => setFilterCategory("all")}
                className="hover:bg-[#2a2a2a]"
              >
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className="hover:bg-[#2a2a2a]"
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-foreground">
                {summary.totalFocusTime} min
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary.sessionsCompleted} sessions
              </p>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-foreground">
                {summary.productivity > 0 ? `${summary.productivity}/5` : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average rating</p>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energy Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-foreground">
                {summary.energy > 0 ? `${summary.energy}/5` : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average rating</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No activities for this day
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </motion.div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className=" hover:border-[#3a3a3a] transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start gap-4">
                        {/* Icon and time */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${getCategoryColor(activity.category)}`}
                          />
                          <div className="text-sm text-muted-foreground">
                            {format(activity.timestamp, "HH:mm")}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 sm:justify-start">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteActivity(activity.id)}
                            className="text-muted-foreground hover:text-red-400 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-primary-foreground font-medium">
                              {activity.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Badge
                                variant="secondary"
                                className="bg-[#2a2a2a] text-gray-300"
                              >
                                {activity.category}
                              </Badge>
                              <span className="text-gray-500">
                                {activity.duration} min • {activity.profileName}
                              </span>
                              {activity.sessionType === "focus" && (
                                <Badge className="bg-orange-500/20 text-orange-500">
                                  Focus
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ratings */}
                        {(activity as any).productivity && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Productivity:
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-3 h-3",
                                      i < (activity as any).productivity
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-600",
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            {(activity as any).energy && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Energy:
                                </span>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Zap
                                      key={i}
                                      className={cn(
                                        "w-3 h-3",
                                        i < (activity as any).energy
                                          ? "text-orange-500 fill-current"
                                          : "text-gray-600",
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {(activity as any).notes && (
                          <p className="text-sm text-muted-foreground italic">
                            "{(activity as any).notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
