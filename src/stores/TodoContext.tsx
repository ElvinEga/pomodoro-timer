import React, { createContext, useContext, ReactNode } from 'react';
import { useTodos } from '@/hooks/useTodos';

interface TodoContextType extends ReturnType<typeof useTodos> {}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const todoData = useTodos();

  return (
    <TodoContext.Provider value={todoData}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
