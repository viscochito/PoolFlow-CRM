import { supabase } from '@/lib/supabase';
import { Task, TaskChannel, TaskStatus } from '@/types';

// Obtener el usuario actual
async function getCurrentUserId(): Promise<string | undefined> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

interface TaskRow {
  id: string;
  lead_id: string;
  date: string;
  action: string;
  channel: string;
  status: string;
  note: string | null;
  rescheduled_to: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    leadId: row.lead_id,
    date: row.date,
    action: row.action,
    channel: row.channel as TaskChannel,
    status: row.status as TaskStatus,
    note: row.note || undefined,
    rescheduledTo: row.rescheduled_to || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id || undefined,
  };
}

function taskToRow(task: Partial<Task>): Partial<TaskRow> {
  return {
    lead_id: task.leadId,
    date: task.date,
    action: task.action,
    channel: task.channel,
    status: task.status,
    note: task.note || null,
    rescheduled_to: task.rescheduledTo || null,
  };
}

// Obtener todas las tareas
export async function fetchTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching tasks:', error);
      // Mensaje más claro según el tipo de error
      if (error.code === '42P01') {
        throw new Error('La tabla de tareas no existe. Ejecuta el script SQL en Supabase.');
      }
      throw error;
    }
    if (!data) return [];

    return data.map(rowToTask);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    // Si ya es un Error con mensaje, re-lanzarlo
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al cargar las tareas');
  }
}

// Obtener tareas por rango de fechas
export async function fetchTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map(rowToTask);
  } catch (error) {
    console.error('Error fetching tasks by date range:', error);
    throw error;
  }
}

// Crear una tarea
export async function createTask(task: Partial<Task>): Promise<Task> {
  try {
    const userId = await getCurrentUserId();
    const row = taskToRow(task);
    
    // Validar campos requeridos
    if (!row.lead_id || !row.date || !row.action || !row.channel) {
      throw new Error('Faltan campos requeridos para crear la tarea');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...row, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating task:', error);
      // Mensaje más claro según el tipo de error
      if (error.code === '42P01') {
        throw new Error('La tabla de tareas no existe. Ejecuta el script SQL en Supabase.');
      } else if (error.code === '23503') {
        throw new Error('El lead seleccionado no existe.');
      } else {
        throw new Error(error.message || 'Error al crear la tarea');
      }
    }
    
    if (!data) {
      throw new Error('No se recibió respuesta al crear la tarea');
    }
    
    return rowToTask(data);
  } catch (error: any) {
    console.error('Error creating task:', error);
    // Si ya es un Error con mensaje, re-lanzarlo
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al crear la tarea');
  }
}

// Actualizar una tarea
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  try {
    const row = taskToRow(updates);
    const { data, error } = await supabase
      .from('tasks')
      .update(row)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return rowToTask(data);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Eliminar una tarea
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Marcar tarea como hecha
export async function markTaskAsDone(taskId: string): Promise<Task> {
  return updateTask(taskId, { status: 'done' });
}

// Reprogramar tarea
export async function rescheduleTask(taskId: string, newDate: string): Promise<Task> {
  return updateTask(taskId, { 
    status: 'rescheduled',
    rescheduledTo: newDate 
  });
}

