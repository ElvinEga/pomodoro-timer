// src/components/ActivityLog/StatisticsCharts.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStatistics } from "@/hooks/useStatistics";
import { BarChart3, TrendingUp, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function StatisticsCharts() {
  const { categoryStats, productivityTrend, mostProductiveTime } =
    useStatistics();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length > 0 ? (
            <div className="space-y-4">
              {categoryStats.slice(0, 5).map(({ category, count }, index) => {
                const percentage =
                  (count / categoryStats.reduce((sum, c) => sum + c.count, 0)) *
                  100;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-primary-foreground capitalize">
                        {category}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/20 text-orange-300"
                      >
                        {count} sessions
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2 bg-[#2a2a2a]" />
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity data yet</p>
              <p className="text-sm">
                Complete some focus sessions to see category breakdown
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productivity Trends */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            7-Day Productivity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productivityTrend.some((day) => day.sessions > 0) ? (
            <div className="space-y-4">
              {productivityTrend.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary-foreground w-12">
                      {day.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {day.minutes}m
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.round(day.productivity)
                              ? "bg-orange-500"
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-[#2a2a2a] text-gray-300"
                    >
                      {day.sessions} sessions
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No productivity data yet</p>
              <p className="text-sm">
                Complete some rated sessions to see trends
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Productive Time */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <Target className="w-5 h-5" />
            Peak Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-orange-500 mb-2">
              {mostProductiveTime}
            </div>
            <p className="text-sm text-muted-foreground">
              Your most productive time of day
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
              {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                <div
                  key={time}
                  className={`p-2 rounded-lg text-center ${
                    time === mostProductiveTime
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "bg-[#2a2a2a] text-muted-foreground"
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">
                {categoryStats.length > 0
                  ? categoryStats[0]?.category || "—"
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Top Category</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">
                {productivityTrend.reduce((sum, day) => sum + day.sessions, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Week Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">
                {Math.round(
                  productivityTrend.reduce((sum, day) => sum + day.minutes, 0) /
                    60
                )}
                h
              </div>
              <div className="text-xs text-muted-foreground">Week Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">
                {productivityTrend.filter((day) => day.sessions > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
