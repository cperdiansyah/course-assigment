import { Task, TaskCategory, TaskStatus } from '../types';

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function formatDateIndo(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function getMonthLabel(date: Date): string {
  return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

export function toLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Compute dynamic timeline bounds from tasks + today, with comfortable padding.
 */
export function getDynamicTimelineBounds(tasks: Task[], today: Date): { minDate: Date; maxDate: Date } {
  const timestamps: number[] = [today.getTime()];
  for (const t of tasks) {
    const s = new Date(t.start).getTime();
    const d = new Date(t.due).getTime();
    if (!Number.isNaN(s)) timestamps.push(s);
    if (!Number.isNaN(d)) timestamps.push(d);
  }

  const minMs = Math.min(...timestamps);
  const maxMs = Math.max(...timestamps);

  const minDate = new Date(minMs);
  minDate.setDate(minDate.getDate() - 3);
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(maxMs);
  maxDate.setDate(maxDate.getDate() + 5);
  maxDate.setHours(23, 59, 59, 999);

  // Ensure at least 14 days span
  if (maxDate.getTime() - minDate.getTime() < 14 * MS_PER_DAY) {
    maxDate.setTime(minDate.getTime() + 14 * MS_PER_DAY);
  }

  return { minDate, maxDate };
}

export interface PackedTask extends Task {
  lane: number;
}

/**
 * Pack overlapping tasks into non-colliding horizontal lanes.
 */
export function assignLanes(courseTasks: Task[]): { packedTasks: PackedTask[]; laneCount: number } {
  const sorted = [...courseTasks].sort(
    (a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime() ||
      new Date(a.due).getTime() - new Date(b.due).getTime(),
  );

  const lanes: number[] = [];
  const packedTasks: PackedTask[] = [];

  for (const task of sorted) {
    const startMs = new Date(task.start).getTime();
    const dueMs = new Date(task.due).getTime();
    let assignedLane = -1;

    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i] + MS_PER_DAY * 0.3 <= startMs) {
        assignedLane = i;
        lanes[i] = dueMs;
        break;
      }
    }

    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push(dueMs);
    }

    packedTasks.push({ ...task, lane: assignedLane });
  }

  return { packedTasks, laneCount: Math.max(1, lanes.length) };
}

export function getCategoryStyle(category: TaskCategory, status: TaskStatus) {
  let base = {
    bg: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500',
    border: 'border-blue-600 dark:border-blue-400/50',
    text: 'text-white',
    pill: 'bg-blue-700/60 dark:bg-blue-900/70',
    badge: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };

  if (category.includes('Team') && !category.includes('LAB')) {
    base = {
      bg: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500',
      border: 'border-purple-600 dark:border-purple-400/50',
      text: 'text-white',
      pill: 'bg-purple-700/60 dark:bg-purple-900/70',
      badge: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    };
  } else if (category.includes('Quiz')) {
    base = {
      bg: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500',
      border: 'border-amber-600 dark:border-amber-400/50',
      text: 'text-white',
      pill: 'bg-amber-700/60 dark:bg-amber-900/70',
      badge: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    };
  } else if (category.includes('LAB')) {
    base = {
      bg: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500',
      border: 'border-emerald-600 dark:border-emerald-400/50',
      text: 'text-white',
      pill: 'bg-emerald-700/60 dark:bg-emerald-900/70',
      badge: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    };
  }

  if (status === 'Completed') {
    base.bg += ' opacity-65 saturate-50';
  }

  return base;
}

export function getCountdownText(dueStr: string, today: Date): { text: string; isUrgent: boolean; isOverdue: boolean } {
  const diffMs = new Date(dueStr).getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / MS_PER_DAY);
  if (diffMs < 0) {
    return { text: `Terlewat ${Math.abs(diffDays)} hari`, isUrgent: false, isOverdue: true };
  }
  if (diffDays === 0) {
    return { text: 'Hari ini!', isUrgent: true, isOverdue: false };
  }
  return { text: `${diffDays} hari lagi`, isUrgent: diffDays <= 7, isOverdue: false };
}
