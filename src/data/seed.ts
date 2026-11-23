import { Course, CourseColorKey, Task } from '../types';
import { computeAutoStatus, parseCsvToAppData } from '../utils/csv';
import seedCsvRaw from './seed-assignments.csv?raw';

export { computeAutoStatus };

export const COURSE_COLOR_STYLES: Record<
  CourseColorKey,
  { label: string; dot: string; bar: string; badge: string }
> = {
  indigo: {
    label: 'Indigo',
    dot: 'bg-indigo-600',
    bar: 'bg-indigo-600',
    badge:
      'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70',
  },
  sky: {
    label: 'Sky',
    dot: 'bg-sky-600',
    bar: 'bg-sky-600',
    badge:
      'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/70',
  },
  violet: {
    label: 'Violet',
    dot: 'bg-violet-600',
    bar: 'bg-violet-600',
    badge:
      'bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/70',
  },
  emerald: {
    label: 'Emerald',
    dot: 'bg-emerald-600',
    bar: 'bg-emerald-600',
    badge:
      'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
  },
  rose: {
    label: 'Rose',
    dot: 'bg-rose-600',
    bar: 'bg-rose-600',
    badge:
      'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70',
  },
  amber: {
    label: 'Amber',
    dot: 'bg-amber-600',
    bar: 'bg-amber-600',
    badge:
      'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70',
  },
  teal: {
    label: 'Teal',
    dot: 'bg-teal-600',
    bar: 'bg-teal-600',
    badge:
      'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/70',
  },
  fuchsia: {
    label: 'Fuchsia',
    dot: 'bg-fuchsia-600',
    bar: 'bg-fuchsia-600',
    badge:
      'bg-fuchsia-50 dark:bg-fuchsia-950/80 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800/70',
  },
};

export function getSeedData(now: Date = new Date()): { courses: Course[]; tasks: Task[] } {
  return parseCsvToAppData(seedCsvRaw, now);
}

export const DEFAULT_COURSES: Course[] = getSeedData().courses;

export function getSeedTasks(now: Date = new Date()): Task[] {
  return getSeedData(now).tasks;
}
