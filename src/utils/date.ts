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
    bar: 'bg-blue-500/10 hover:bg-blue-500/15 dark:bg-blue-400/12 dark:hover:bg-blue-400/20 border-blue-500/25 dark:border-blue-400/25 text-blue-950 dark:text-blue-100',
    dot: 'bg-blue-600 dark:bg-blue-400',
    meta: 'text-blue-700/80 dark:text-blue-300/80',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  };

  if (category.includes('Team') && !category.includes('LAB')) {
    base = {
      bar: 'bg-violet-500/10 hover:bg-violet-500/15 dark:bg-violet-400/12 dark:hover:bg-violet-400/20 border-violet-500/25 dark:border-violet-400/25 text-violet-950 dark:text-violet-100',
      dot: 'bg-violet-600 dark:bg-violet-400',
      meta: 'text-violet-700/80 dark:text-violet-300/80',
      badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    };
  } else if (category.includes('Quiz')) {
    base = {
      bar: 'bg-amber-500/12 hover:bg-amber-500/18 dark:bg-amber-400/12 dark:hover:bg-amber-400/20 border-amber-500/30 dark:border-amber-400/25 text-amber-950 dark:text-amber-100',
      dot: 'bg-amber-600 dark:bg-amber-400',
      meta: 'text-amber-800/80 dark:text-amber-300/80',
      badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25',
    };
  } else if (category.includes('LAB')) {
    base = {
      bar: 'bg-emerald-500/10 hover:bg-emerald-500/15 dark:bg-emerald-400/12 dark:hover:bg-emerald-400/20 border-emerald-500/25 dark:border-emerald-400/25 text-emerald-950 dark:text-emerald-100',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
      meta: 'text-emerald-700/80 dark:text-emerald-300/80',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    };
  }

  if (status === 'Completed') {
    base.bar =
      'bg-zinc-100 hover:bg-zinc-200/70 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/70 text-zinc-500 dark:text-zinc-400';
    base.dot = 'bg-zinc-400 dark:bg-zinc-500';
    base.meta = 'text-zinc-400 dark:text-zinc-500';
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
