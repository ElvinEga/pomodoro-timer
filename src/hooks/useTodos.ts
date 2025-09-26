import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoList, TodoStats } from '@/types';
import { invoke } from '@tauri-apps/api/tauri';
import { v4 as uuidv4 } from 'uuid';

interface UseTodosReturn {
  lists: TodoList[];
  activeList: TodoList | null;
  stats: TodoStats;
  isLoading: boolean;
  error: string | null;
  createList: (name: string, color?: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  setActiveList: (listId: string) => Promise<void>;
  addTodo: (listId: string, text: string, options?: Partial<Todo>) => Promise<void>;
  toggleTodo: (listId: string, todoId: string) => Promise<void>;
  deleteTodo: (listId: string, todoId: string) => Promise<void>;
  updateTodo: (listId: string, todoId: string, updates: Partial<Todo>) => Promise<void>;
  incrementPomodoro: (listId: string, todoId: string) => Promise<void>;
}

const defaultColors = [
  '#ff6b35', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
];

export function useTodos(): UseTodosReturn {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [activeList, setActiveListState] = useState<TodoList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from disk
  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await invoke<string>('read_todos');
      const parsed = JSON.parse(data);
      const loadedLists = parsed.lists || [];
      
      // Parse dates
      const processedLists = loadedLists.map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        todos: list.todos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }))
      }));

      setLists(processedLists);
      
      // Set active list
      const active = processedLists.find(l => l.isActive) || processedLists[0] || null;
      setActiveListState(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      console.error('Failed to load todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save todos to disk
  const saveTodos = useCallback(async (newLists: TodoList[]) => {
    try {
      const data = { lists: newLists };
      await invoke('write_todos', { data: JSON.stringify(data) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save todos');
      throw err;
    }
  }, []);

  // Create new list
  const createList = useCallback(async (name: string, color?: string) => {
    const newList: TodoList = {
      id: uuidv4(),
      name,
      todos: [],
      color: color || defaultColors[Math.floor(Math.random() * defaultColors.length)],
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newLists = [...lists, newList];
    setLists(newLists);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Delete list
  const deleteList = useCallback(async (listId: string) => {
    const newLists = lists.filter(l => l.id !== listId);
    setLists(newLists);
    
    // Update active list if needed
    if (activeList?.id === listId) {
      const newActive = newLists[0] || null;
      setActiveListState(newActive);
      if (newActive) {
        const updatedLists = newLists.map(l => 
          l.id === newActive.id ? { ...l, isActive: true } : { ...l, isActive: false }
        );
        setLists(updatedLists);
        await saveTodos(updatedLists);
      } else {
        await saveTodos(newLists);
      }
    } else {
      await saveTodos(newLists);
    }
  }, [lists, activeList, saveTodos]);

  // Set active list
  const setActiveList = useCallback(async (listId: string) => {
    const newLists = lists.map(l => ({
      ...l,
      isActive: l.id === listId
    }));
    
    setLists(newLists);
    const active = newLists.find(l => l.id === listId) || null;
    setActiveListState(active);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Add todo
  const addTodo = useCallback(async (listId: string, text: string, options?: Partial<Todo>) => {
    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
      priority: 'medium',
      pomodoroCount: 1,
      completedPomodoros: 0,
      createdAt: new Date(),
      tags: [],
      ...options,
    };

    const newLists = lists.map(list => 
      list.id === listId 
        ? { ...list, todos: [...list.todos, newTodo], updatedAt: new Date() }
        : list
    );

    setLists(newLists);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Toggle todo completion
  const toggleTodo = useCallback(async (listId: string, todoId: string) => {
    const newLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            todos: list.todos.map(todo =>
              todo.id === todoId
                ? { 
                    ...todo, 
                    completed: !todo.completed,
                    completedAt: !todo.completed ? new Date() : undefined,
                    completedPomodoros: !todo.completed ? todo.completedPomodoros : 0
                  }
                : todo
            ),
            updatedAt: new Date()
          }
        : list
    );

    setLists(newLists);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Delete todo
  const deleteTodo = useCallback(async (listId: string, todoId: string) => {
    const newLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            todos: list.todos.filter(todo => todo.id !== todoId),
            updatedAt: new Date()
          }
        : list
    );

    setLists(newLists);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Update todo
  const updateTodo = useCallback(async (listId: string, todoId: string, updates: Partial<Todo>) => {
    const newLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            todos: list.todos.map(todo =>
              todo.id === todoId ? { ...todo, ...updates } : todo
            ),
            updatedAt: new Date()
          }
        : list
    );

    setLists(newLists);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Increment pomodoro count
  const incrementPomodoro = useCallback(async (listId: string, todoId: string) => {
    const newLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            todos: list.todos.map(todo =>
              todo.id === todoId
                ? { ...todo, completedPomodoros: (todo.completedPomodoros || 0) + 1 }
                : todo
            ),
            updatedAt: new Date()
          }
        : list
    );

    setLists(newLists);
    await saveTodos(newLists);
  }, [lists, saveTodos]);

  // Calculate stats
  const stats = useCallback((): TodoStats => {
    const allTodos = lists.flatMap(l => l.todos);
    const completedTodos = allTodos.filter(t => t.completed);
    
    return {
      totalTodos: allTodos.length,
      completedTodos: completedTodos.length,
      completionRate: allTodos.length > 0 ? (completedTodos.length / allTodos.length) * 100 : 0,
      activeLists: lists.filter(l => l.isActive).length,
      totalPomodoros: allTodos.reduce((sum, t) => sum + (t.pomodoroCount || 0), 0),
      completedPomodoros: allTodos.reduce((sum, t) => sum + (t.completedPomodoros || 0), 0),
    };
  }, [lists]);

  // Load on mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    lists,
    activeList,
    stats: stats(),
    isLoading,
    error,
    createList,
    deleteList,
    setActiveList,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    incrementPomodoro,
  };
}
