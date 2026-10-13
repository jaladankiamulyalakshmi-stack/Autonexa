/**
 * AUTONEXA Timezone and Runtime Date Utilities
 * Default timezone: Asia/Kolkata (IST)
 */

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Format ISO date string into human-readable date & time in IST
 */
export function formatDateTimeIST(isoString?: string | null): string {
  if (!isoString) return 'Not available';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: DEFAULT_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d) + ' IST';
  } catch {
    return 'Not available';
  }
}

/**
 * Format ISO date string into human-readable date in IST
 */
export function formatDateIST(isoString?: string | null): string {
  if (!isoString) return 'Not available';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: DEFAULT_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return 'Not available';
  }
}

/**
 * Get current runtime date formatted in IST
 */
export function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: DEFAULT_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

/**
 * Calculate dynamic overdue status:
 * A task is overdue ONLY if its due timestamp has passed Date.now()
 * AND its status is NOT completed or cancelled.
 */
export function isTaskOverdue(dueDate: string, status: string): boolean {
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  const dueTime = new Date(dueDate).getTime();
  if (isNaN(dueTime)) return false;
  return dueTime < Date.now();
}

/**
 * Check if a task is due today in Asia/Kolkata timezone
 */
export function isTaskDueToday(dueDate: string, status: string): boolean {
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  const taskDate = new Date(dueDate);
  if (isNaN(taskDate.getTime())) return false;

  const now = new Date();
  const taskDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TIMEZONE }).format(taskDate);
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TIMEZONE }).format(now);

  return taskDateStr === todayStr && !isTaskOverdue(dueDate, status);
}

/**
 * Check if a task is upcoming (due in the future)
 */
export function isTaskUpcoming(dueDate: string, status: string): boolean {
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  const taskDate = new Date(dueDate);
  if (isNaN(taskDate.getTime())) return false;
  const now = new Date();
  const taskDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TIMEZONE }).format(taskDate);
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TIMEZONE }).format(now);

  return taskDateStr > todayStr;
}

/**
 * Calculate dynamic days inactive from last interaction date to current runtime Date.now()
 */
export function getDaysInactive(lastInteractionDate?: string | null): number {
  if (!lastInteractionDate) return 0;
  const lastTime = new Date(lastInteractionDate).getTime();
  if (isNaN(lastTime)) return 0;
  const diffMs = Date.now() - lastTime;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
