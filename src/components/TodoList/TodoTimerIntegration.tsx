import React, { useState } from 'react';
import { useTodoContext } from '@/stores/TodoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TodoTimerIntegrationProps {
  className?: string;
  compact?: boolean;
}

export function TodoTimerIntegration({ className, compact = false }: TodoTimerIntegrationProps) {
  const { activeList, toggleTodo, incrementPomodoro } = useTodoContext();
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);

  if (!activeList) {
    return (
      <Card className={cn("bg-[#1a1a1a] border-[#2a2a2a]", className)}>
        <CardContent className="p-6 text-center text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Create a todo list to track tasks during Pomodoro sessions</p>
        </CardContent>
      </Card>
    );
  }

  const incompleteTodos = activeList.todos.filter(t => !t.completed);
  const activeTodo = activeList.todos.find(t => t.id === activeTodoId);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Active Todo */}
      {activeTodo && (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-orange-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-orange-500" />
                Currently Working On
              </CardTitle>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTodo(activeList.id, activeTodo.id)}
                className="flex-shrink-0"
              >
                <Circle className="w-6 h-6 text-orange-500 hover:text-orange-400" />
              </button>
              <div className="flex-1">
                <p className="text-white font-medium">{activeTodo.text}</p>
                {activeTodo.pomodoroCount && (
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {activeTodo.completedPomodoros || 0}/{activeTodo.pomodoroCount} 🍅 completed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Tasks */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-white text-sm">
            {compact ? "Current Tasks" : "Upcoming Tasks"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {incompleteTodos.slice(0, compact ? 2 : 3).map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                    todo.id === activeTodoId
                      ? "border-orange-500/50 bg-orange-500/10"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a]",
                    index === 0 && !activeTodo && "border-orange-500/30"
                  )}
                  onClick={() => setActiveTodoId(todo.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTodo(activeList.id, todo.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <Circle className="w-5 h-5 text-gray-400 hover:text-green-500" />
                  </button>
                  <div className="flex-1">
                    <p className="text-white text-sm">{todo.text}</p>
                    {todo.pomodoroCount && (
                      <span className="text-xs text-gray-400">
                        {todo.pomodoroCount} 🍅
                      </span>
                    )}
                  </div>
                  {index === 0 && !activeTodo && (
                    <ArrowRight className="w-4 h-4 text-orange-500" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {incompleteTodos.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>All tasks completed! 🎉</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {!compact && (
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Progress: {activeList.todos.filter(t => t.completed).length}/{activeList.todos.length}
            </div>
            <div className="text-orange-500">
              {incompleteTodos.length} remaining
            </div>
          </div>
          <div className="mt-2 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
              initial={{ width: 0 }}
              animate={{ width: `${activeList.todos.length > 0 ? (activeList.todos.filter(t => t.completed).length / activeList.todos.length) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
