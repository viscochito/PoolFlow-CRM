import { useState, useEffect, useCallback } from 'react';
import { Task, TaskChannel } from '@/types';
import {
  fetchTasks,
  fetchTasksByDateRange,
  createTask,
  updateTask,
  deleteTask,
  markTaskAsDone,
  rescheduleTask,
} from '@/services/tasksService';
import { supabase } from '@/lib/supabase';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar tareas iniciales
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedTasks = await fetchTasks();
        setTasks(loadedTasks);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Error al cargar las tareas. Verifica tu conexión a Supabase.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Suscripción Realtime para cambios en tareas
  useEffect(() => {
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        async (payload) => {
          console.log('Task change detected:', payload.eventType);

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            try {
              const { data: taskData } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', payload.new.id)
                .single();

              if (taskData) {
                const updatedTask: Task = {
                  id: taskData.id,
                  leadId: taskData.lead_id,
                  date: taskData.date,
                  action: taskData.action,
                  channel: taskData.channel as TaskChannel,
                  status: taskData.status as Task['status'],
                  note: taskData.note || undefined,
                  rescheduledTo: taskData.rescheduled_to || undefined,
                  createdAt: taskData.created_at,
                  updatedAt: taskData.updated_at,
                  userId: taskData.user_id || undefined,
                };

                setTasks((prev) => {
                  const existingIndex = prev.findIndex((t) => t.id === updatedTask.id);
                  if (existingIndex >= 0) {
                    const newTasks = [...prev];
                    newTasks[existingIndex] = updatedTask;
                    return newTasks;
                  } else {
                    return [updatedTask, ...prev];
                  }
                });
              }
            } catch (err) {
              console.error('Error syncing task:', err);
            }
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      tasksChannel.unsubscribe();
    };
  }, []);

  const addTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      setError(null);
      const newTask = await createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Error al crear la tarea. Intenta nuevamente.');
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await updateTask(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Error al actualizar la tarea. Intenta nuevamente.');
      throw err;
    }
  }, []);

  const removeTask = useCallback(async (taskId: string) => {
    try {
      setError(null);
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Error al eliminar la tarea. Intenta nuevamente.');
      throw err;
    }
  }, []);

  const markAsDone = useCallback(async (taskId: string) => {
    try {
      setError(null);
      const updatedTask = await markTaskAsDone(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      console.error('Error marking task as done:', err);
      setError('Error al marcar la tarea como hecha. Intenta nuevamente.');
      throw err;
    }
  }, []);

  const reschedule = useCallback(async (taskId: string, newDate: string) => {
    try {
      setError(null);
      const updatedTask = await rescheduleTask(taskId, newDate);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      console.error('Error rescheduling task:', err);
      setError('Error al reprogramar la tarea. Intenta nuevamente.');
      throw err;
    }
  }, []);

  // Obtener tareas por fecha
  const getTasksByDate = useCallback((date: string): Task[] => {
    return tasks.filter((task) => {
      if (task.status === 'rescheduled' && task.rescheduledTo) {
        return task.rescheduledTo === date;
      }
      return task.date === date && task.status !== 'rescheduled';
    });
  }, [tasks]);

  // Obtener tareas pendientes por fecha
  const getPendingTasksByDate = useCallback((date: string): Task[] => {
    return getTasksByDate(date).filter((task) => task.status === 'pending');
  }, [getTasksByDate]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    removeTask,
    markAsDone,
    reschedule,
    getTasksByDate,
    getPendingTasksByDate,
    clearError: () => setError(null),
  };
};

