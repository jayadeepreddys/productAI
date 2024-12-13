"use client";

"use client";

import { useState } from 'react';
import { TodoList } from '../components/todo-list';
import { TodoForm } from '../components/todo-form';
import { Todo } from '../types/todo';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Todo List</h1>
        <TodoForm onAddTodo={addTodo} />
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </main>
  );
}