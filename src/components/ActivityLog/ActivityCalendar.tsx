// src/components/ActivityLog/ActivityCalendar.tsx
import React, { useState } from "react";
import { useActivityContext } from "@/stores/ActivityContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export function ActivityCalendar({
  onDateSelect,
  selectedDate,
}: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { dailySummaries } = useActivityContext();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getDaySummary = (date: Date) => {
    return dailySummaries.find((ds) => isSameDay(ds.date, date));
  };

  const getActivityLevel = (date: Date) => {
    const summary = getDaySummary(date);
    if (!summary || summary.sessionsCompleted === 0) return 0;
    if (summary.sessionsCompleted <= 2) return 1;
    if (summary.sessionsCompleted <= 4) return 2;
    if (summary.sessionsCompleted <= 6) return 3;
    return 4;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1),
    );
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(new Date());
  };

  return (
    <Card className="">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-primary-foreground">
            Activity Calendar
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={goToToday}
            className="bg-primary border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
          >
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigateMonth("prev")}
            className="text-muted-foreground hover:text-primary-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <h3 className="text-lg font-semibold text-primary-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigateMonth("next")}
            className="text-muted-foreground hover:text-primary-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs text-muted-foreground font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          <AnimatePresence>
            {calendarDays.map((day, index) => {
              const activityLevel = getActivityLevel(day);
              const summary = getDaySummary(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <motion.button
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    "relative aspect-square rounded-lg border transition-all",
                    "flex flex-col items-center justify-center p-1",
                    isSelected
                      ? "border-orange-500 bg-orange-500/20"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a]",
                    !isCurrentMonth && "opacity-30",
                    isToday(day) && "ring-2 ring-orange-500/50",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary-foreground" : "text-gray-300",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Activity indicators */}
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-1 rounded-full",
                          activityLevel > i ? "bg-orange-500" : "bg-gray-700",
                        )}
                      />
                    ))}
                  </div>

                  {/* Tooltip on hover */}
                  {summary && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-[#2a2a2a] text-primary-foreground text-xs rounded-lg p-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      <div className="font-medium">{format(day, "MMM d")}</div>
                      <div>{summary.sessionsCompleted} sessions</div>
                      <div>{summary.totalFocusTime}min focus</div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className="flex gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        level > i ? "bg-orange-500" : "bg-gray-700",
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
