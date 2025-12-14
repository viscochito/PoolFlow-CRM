/**
 * Utilidades para manejo de fechas en el calendario
 */

/**
 * Obtiene el primer día del mes
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtiene el último día del mes
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Obtiene todos los días del mes en una matriz de semanas
 */
export function getDaysInMonth(date: Date): Date[][] {
  const firstDay = getFirstDayOfMonth(date);
  const lastDay = getLastDayOfMonth(date);
  const days: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Agregar días del mes anterior para completar la primera semana
  const startDayOfWeek = firstDay.getDay(); // 0 = Domingo, 6 = Sábado
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
  const daysInPrevMonth = getLastDayOfMonth(prevMonth).getDate();
  
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    currentWeek.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i));
  }
  
  // Agregar días del mes actual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
    currentWeek.push(currentDate);
    
    if (currentWeek.length === 7) {
      days.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Agregar días del mes siguiente para completar la última semana
  if (currentWeek.length > 0) {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
    let day = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
      day++;
    }
    days.push(currentWeek);
  }
  
  return days;
}

/**
 * Compara dos fechas solo por año, mes y día (ignora hora)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Verifica si una fecha es del mes actual
 */
export function isCurrentMonth(date: Date, currentMonth: Date): boolean {
  return (
    date.getFullYear() === currentMonth.getFullYear() &&
    date.getMonth() === currentMonth.getMonth()
  );
}

/**
 * Formatea una fecha como string YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea un string YYYY-MM-DD a Date
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(date: Date): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[date.getMonth()];
}

/**
 * Obtiene el nombre abreviado del día de la semana
 */
export function getDayName(date: Date): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}

/**
 * Agrega meses a una fecha
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Obtiene el inicio del día (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtiene el fin del día (23:59:59)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Obtiene el primer día de la semana (domingo)
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Domingo, 6 = Sábado
  const diff = result.getDate() - day; // Restar días para llegar al domingo
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtiene el último día de la semana (sábado)
 */
export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Obtiene todos los días de la semana
 */
export function getDaysInWeek(date: Date): Date[] {
  const start = getStartOfWeek(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Agrega semanas a una fecha
 */
export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + (weeks * 7));
  return result;
}

/**
 * Formatea el rango de fechas de una semana
 */
export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const startMonth = getMonthName(startDate);
  const endMonth = getMonthName(endDate);
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()} - ${endDate.getDate()} de ${startMonth} ${startDate.getFullYear()}`;
  } else {
    return `${startDate.getDate()} de ${startMonth} - ${endDate.getDate()} de ${endMonth} ${startDate.getFullYear()}`;
  }
}

/**
 * Obtiene los próximos N días desde hoy
 */
export function getNextDays(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

