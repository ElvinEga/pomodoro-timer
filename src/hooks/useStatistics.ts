// src/hooks/useStatistics.ts
import { useMemo } from "react";
import { useActivityContext } from "@/stores/ActivityContext";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  subDays,
  startOfDay,
} from "date-fns";

export interface PeriodStats {
  sessions: number;
  focusMinutes: number;
  averageRating: number;
  streakDays: number;
  totalDays: number;
}

export function useStatistics() {
  const { activities } = useActivityContext();

  const calculatePeriodStats = useMemo(() => {
    return (period: "week" | "month" | "year"): PeriodStats => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "year":
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
      }

      // Filter activities for the period
      const periodActivities = activities.filter((activity) =>
        isWithinInterval(activity.timestamp, { start: startDate, end: endDate })
      );

      const focusActivities = periodActivities.filter(
        (a) => a.sessionType === "focus"
      );

      // Calculate basic stats
      const sessions = focusActivities.length;
      const focusMinutes = focusActivities.reduce(
        (sum, a) => sum + a.duration,
        0
      );

      // Calculate average rating (productivity)
      const ratingsSum = focusActivities
        .filter((a) => a.productivity !== undefined)
        .reduce((sum, a) => sum + (a.productivity || 0), 0);
      const ratingsCount = focusActivities.filter(
        (a) => a.productivity !== undefined
      ).length;
      const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

      // Calculate streak days for the period
      const uniqueDates = [
        ...new Set(
          focusActivities.map((a) =>
            format(startOfDay(a.timestamp), "yyyy-MM-dd")
          )
        ),
      ].sort();

      let streakDays = 0;
      if (uniqueDates.length > 0) {
        // Count consecutive days from the most recent date
        const sortedDates = uniqueDates.reverse();
        const today = format(now, "yyyy-MM-dd");
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
      }

      // Calculate total active days in period
      const totalDays = uniqueDates.length;

      return {
        sessions,
        focusMinutes,
        averageRating: Math.round(averageRating * 10) / 10,
        streakDays,
        totalDays,
      };
    };
  }, [activities]);

  const weekStats = useMemo(
    () => calculatePeriodStats("week"),
    [calculatePeriodStats]
  );
  const monthStats = useMemo(
    () => calculatePeriodStats("month"),
    [calculatePeriodStats]
  );
  const yearStats = useMemo(
    () => calculatePeriodStats("year"),
    [calculatePeriodStats]
  );

  // Calculate category distribution
  const categoryStats = useMemo(() => {
    const focusActivities = activities.filter((a) => a.sessionType === "focus");
    const categoryCount: Record<string, number> = {};

    focusActivities.forEach((activity) => {
      categoryCount[activity.category] =
        (categoryCount[activity.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }, [activities]);

  // Calculate most productive time of day
  const mostProductiveTime = useMemo(() => {
    const focusActivities = activities.filter((a) => a.sessionType === "focus");
    const hourCounts: Record<string, number> = {};

    focusActivities.forEach((activity) => {
      const hour = activity.timestamp.getHours();
      let timeOfDay: string;

      if (hour >= 5 && hour < 12) {
        timeOfDay = "Morning";
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = "Afternoon";
      } else if (hour >= 17 && hour < 21) {
        timeOfDay = "Evening";
      } else {
        timeOfDay = "Night";
      }

      hourCounts[timeOfDay] = (hourCounts[timeOfDay] || 0) + 1;
    });

    const mostProductive = Object.entries(hourCounts).reduce(
      (max, [time, count]) => (count > max.count ? { time, count } : max),
      { time: "Morning", count: 0 }
    );

    return mostProductive.time;
  }, [activities]);

  // Calculate productivity trends (last 7 days)
  const productivityTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayActivities = activities.filter(
        (a) =>
          a.sessionType === "focus" &&
          format(a.timestamp, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );

      const totalMinutes = dayActivities.reduce(
        (sum, a) => sum + a.duration,
        0
      );
      const avgProductivity =
        dayActivities.length > 0
          ? dayActivities
              .filter((a) => a.productivity !== undefined)
              .reduce((sum, a) => sum + (a.productivity || 0), 0) /
            dayActivities.length
          : 0;

      return {
        date: format(date, "MMM dd"),
        minutes: totalMinutes,
        productivity: Math.round(avgProductivity * 10) / 10,
        sessions: dayActivities.length,
      };
    }).reverse();

    return last7Days;
  }, [activities]);

  return {
    weekStats,
    monthStats,
    yearStats,
    categoryStats,
    mostProductiveTime,
    productivityTrend,
    totalActivities: activities.length,
    totalFocusActivities: activities.filter((a) => a.sessionType === "focus")
      .length,
  };
}
