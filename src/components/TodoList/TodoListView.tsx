import React, { useState } from 'react';
import { useTodoContext } from '@/stores/TodoContext';
import { Todo } from '@/types';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock,
  Flag,
  MoreVertical,
  Edit2,
  Save,
  X,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoListViewProps {
  className?: string;
}

export function TodoListView({ className }: TodoListViewProps) {
  const { lists, activeList, createList, addTodo, toggleTodo, deleteTodo, setActiveList, updateTodo } = useTodoContext();
  const [newTodoText, setNewTodoText] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim() || !activeList) return;

    addTodo(activeList.id, newTodoText.trim());
    setNewTodoText('');
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    createList(newListName.trim());
    setNewListName('');
    setIsAddingList(false);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = (listId: string, todoId: string) => {
    if (!editText.trim()) return;
    
    updateTodo(listId, todoId, { text: editText.trim() });
    setEditingTodo(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* List Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {lists.map((list) => (
          <Button
            key={list.id}
            size="sm"
            variant={activeList?.id === list.id ? "default" : "outline"}
            onClick={() => setActiveList(list.id)}
            className={cn(
              "gap-2",
              activeList?.id === list.id && "bg-gradient-to-r from-orange-500 to-orange-600"
            )}
            style={{
              borderColor: activeList?.id === list.id ? undefined : list.color,
            }}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: list.color }}
            />
            {list.name}
            <span className="text-xs opacity-75">({list.todos.length})</span>
          </Button>
        ))}
        
        {/* Add List Button */}
        {isAddingList ? (
          <form onSubmit={handleCreateList} className="flex gap-2">
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              className="bg-[#2a2a2a] border-[#3a3a3a] text-white h-8 text-sm w-32"
              autoFocus
            />
            <Button type="submit" size="sm" variant="ghost">
              <Save className="w-4 h-4" />
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost"
              onClick={() => {
                setIsAddingList(false);
                setNewListName('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingList(true)}
            className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"
          >
            <Plus className="w-4 h-4 mr-1" />
            New List
          </Button>
        )}
      </div>

      {/* Active List Content */}
      {activeList && (
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: activeList.color }}
                />
                {activeList.name}
              </CardTitle>
              <Badge variant="secondary" className="bg-[#2a2a2a] text-gray-300">
                {activeList.todos.filter(t => !t.completed).length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Todo Form */}
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new task..."
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
              <Button type="submit" size="icon" className="bg-gradient-to-r from-orange-500 to-orange-600">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            {/* Todo Items */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {activeList.todos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      todo.completed 
                        ? "bg-[#2a2a2a] border-[#3a3a3a] opacity-60" 
                        : "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]"
                    )}
                  >
                    <button
                      onClick={() => toggleTodo(activeList.id, todo.id)}
                      className="flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingTodo === todo.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="bg-[#2a2a2a] border-[#3a3a3a] text-white text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(activeList.id, todo.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTodo(null);
                                setEditText('');
                              }}
                              className="border-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={cn(
                            "text-white break-words",
                            todo.completed && "line-through text-gray-400"
                          )}>
                            {todo.text}
                          </p>
                          {todo.pomodoroCount && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {todo.completedPomodoros || 0}/{todo.pomodoroCount} 🍅
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {todo.priority && (
                        <Flag className={cn("w-4 h-4", getPriorityColor(todo.priority))} />
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#2a2a2a] border-[#3a3a3a] text-white">
                          <DropdownMenuItem 
                            onClick={() => handleEditTodo(todo)}
                            className="hover:bg-[#3a3a3a] focus:bg-[#3a3a3a]"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteTodo(activeList.id, todo.id)}
                            className="hover:bg-[#3a3a3a] focus:bg-[#3a3a3a] text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {activeList.todos.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Coffee className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks yet. Add one to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {activeList && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {activeList.todos.length}
              </div>
              <div className="text-sm text-gray-400">Total Tasks</div>
            </div>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {activeList.todos.filter(t => t.completed).length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {activeList.todos.reduce((sum, t) => sum + (t.completedPomodoros || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">🍅 Completed</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
