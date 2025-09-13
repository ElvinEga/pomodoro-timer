// src/stores/ActivityContext.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Activity, ActivityInput, DailySummary, ActivityStats } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import {
  format,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  subDays,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ActivityContextType {
  activities: Activity[];
  dailySummaries: DailySummary[];
  stats: ActivityStats;
  isLoading: boolean;
  error: string | null;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getDailySummary: (date: Date) => DailySummary | null;
  getActivitiesForDate: (date: Date) => Activity[];
  exportActivities: (startDate: Date, endDate: Date) => Promise<string>;
  clearOldActivities: (daysToKeep: number) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

function useActivityStore() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load activities from disk
  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await invoke<string>("read_activities");
      const parsed = JSON.parse(data) as Activity[];
      const activitiesWithDates = parsed.map((a) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
      setActivities(activitiesWithDates);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load activities"
      );
      console.error("Failed to load activities:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save activities to disk
  const saveActivities = useCallback(async (newActivities: Activity[]) => {
    try {
      await invoke("write_activities", { data: JSON.stringify(newActivities) });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save activities"
      );
      throw err;
    }
  }, []);

  // Add new activity
  const addActivity = useCallback(
    async (activityData: Omit<Activity, "id" | "timestamp">) => {
      const newActivity: Activity = {
        ...activityData,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      const newActivities = [...activities, newActivity];
      setActivities(newActivities);
      await saveActivities(newActivities);

      toast({
        title: "Activity logged",
        description: "Your session has been recorded.",
        className: " text-primary-foreground",
      });
    },
    [activities, saveActivities, toast]
  );

  // Update activity
  const updateActivity = useCallback(
    async (id: string, updates: Partial<Activity>) => {
      const newActivities = activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      );
      setActivities(newActivities);
      await saveActivities(newActivities);
    },
    [activities, saveActivities]
  );

  // Delete activity
  const deleteActivity = useCallback(
    async (id: string) => {
      const newActivities = activities.filter((a) => a.id !== id);
      setActivities(newActivities);
      await saveActivities(newActivities);

      toast({
        title: "Activity deleted",
        description: "The activity has been removed.",
        className: " text-primary-foreground",
      });
    },
    [activities, saveActivities, toast]
  );

  // Get activities for specific date
  const getActivitiesForDate = useCallback(
    (date: Date) => {
      const start = startOfDay(date);
      const end = endOfDay(date);
      return activities.filter(
        (a) => a.timestamp >= start && a.timestamp <= end
      );
    },
    [activities]
  );

  // Calculate daily summary
  const getDailySummary = useCallback(
    (date: Date) => {
      const dayActivities = getActivitiesForDate(date);
      if (dayActivities.length === 0) return null;

      const focusActivities = dayActivities.filter(
        (a) => a.sessionType === "focus"
      );
      const breakActivities = dayActivities.filter(
        (a) => a.sessionType !== "focus"
      );

      const totalFocusTime = focusActivities.reduce(
        (sum, a) => sum + a.duration,
        0
      );
      const totalBreakTime = breakActivities.reduce(
        (sum, a) => sum + a.duration,
        0
      );
      const sessionsCompleted = focusActivities.length;

      // Calculate average productivity and energy from activities with ratings
      const activitiesWithProductivity = dayActivities.filter(
        (a) => a.productivity !== undefined && a.productivity > 0
      );
      const activitiesWithEnergy = dayActivities.filter(
        (a) => a.energy !== undefined && a.energy > 0
      );

      const avgProductivity =
        activitiesWithProductivity.length > 0
          ? activitiesWithProductivity.reduce(
              (sum, a) => sum + (a.productivity || 0),
              0
            ) / activitiesWithProductivity.length
          : 0;

      const avgEnergy =
        activitiesWithEnergy.length > 0
          ? activitiesWithEnergy.reduce((sum, a) => sum + (a.energy || 0), 0) /
            activitiesWithEnergy.length
          : 0;

      return {
        date,
        totalFocusTime,
        totalBreakTime,
        sessionsCompleted,
        activities: dayActivities,
        productivity: Math.round(avgProductivity * 10) / 10, // Round to 1 decimal
        energy: Math.round(avgEnergy * 10) / 10, // Round to 1 decimal
      };
    },
    [getActivitiesForDate]
  );

  // Calculate daily summaries for date range
  const dailySummaries = useCallback(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days
      .map((day) => getDailySummary(day))
      .filter(Boolean) as DailySummary[];
  }, [getDailySummary]);

  // Calculate statistics
  const stats = useCallback(() => {
    const focusActivities = activities.filter((a) => a.sessionType === "focus");
    const totalFocusTime = focusActivities.reduce(
      (sum, a) => sum + a.duration,
      0
    );
    const totalBreakTime = activities
      .filter((a) => a.sessionType !== "focus")
      .reduce((sum, a) => sum + a.duration, 0);

    // Calculate streak
    const sortedDates = [
      ...new Set(
        activities
          .filter((a) => a.sessionType === "focus")
          .map((a) => format(startOfDay(a.timestamp), "yyyy-MM-dd"))
      ),
    ]
      .sort()
      .reverse();

    let streakDays = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    let currentDate = today;

    for (const date of sortedDates) {
      if (
        date === currentDate ||
        date === format(subDays(new Date(currentDate), 1), "yyyy-MM-dd")
      ) {
        streakDays++;
        currentDate = date;
      } else {
        break;
      }
    }

    return {
      totalSessions: activities.length,
      totalFocusTime,
      totalBreakTime,
      averageSessionLength:
        focusActivities.length > 0
          ? totalFocusTime / focusActivities.length
          : 0,
      streakDays,
      mostProductiveTime: "Morning", // This would need more sophisticated analysis
      favoriteCategory: "Work", // This would need category analysis
      // The ActivityStats interface now includes weekly and monthly goal progress.
      // These are placeholder values; implement real calculations later.
      weeklyGoalProgress: 0,
      monthlyGoalProgress: 0,
    };
  }, [activities]);

  // Export activities as JSON
  const exportActivities = useCallback(
    async (startDate: Date, endDate: Date) => {
      const filteredActivities = activities.filter((a) => {
        const activityDate = startOfDay(a.timestamp);
        return (
          activityDate >= startOfDay(startDate) &&
          activityDate <= endOfDay(endDate)
        );
      });

      const exportData = {
        exportDate: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        activities: filteredActivities,
        summary: {
          totalActivities: filteredActivities.length,
          totalFocusTime: filteredActivities
            .filter((a) => a.sessionType === "focus")
            .reduce((sum, a) => sum + a.duration, 0),
          totalBreakTime: filteredActivities
            .filter((a) => a.sessionType !== "focus")
            .reduce((sum, a) => sum + a.duration, 0),
        },
      };

      return JSON.stringify(exportData, null, 2);
    },
    [activities]
  );

  // Clear old activities
  const clearOldActivities = useCallback(
    async (daysToKeep: number) => {
      const cutoffDate = subDays(new Date(), daysToKeep);
      const newActivities = activities.filter((a) => a.timestamp >= cutoffDate);

      setActivities(newActivities);
      await saveActivities(newActivities);

      toast({
        title: "Old activities cleared",
        description: `Activities older than ${daysToKeep} days have been removed.`,
        className: " text-primary-foreground",
      });
    },
    [activities, saveActivities, toast]
  );

  // Load on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    dailySummaries: dailySummaries(),
    stats: stats(),
    isLoading,
    error,
    addActivity,
    updateActivity,
    deleteActivity,
    getDailySummary,
    getActivitiesForDate,
    exportActivities,
    clearOldActivities,
  };
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const activityData = useActivityStore();

  return (
    <ActivityContext.Provider value={activityData}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error(
      "useActivityContext must be used within an ActivityProvider"
    );
  }
  return context;
}
