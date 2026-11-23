import { Course, CourseColorKey, Task, TaskStatus } from '../types';

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

export const DEFAULT_COURSES: Course[] = [
  { id: 'entr', name: 'Entrepreneurship', code: 'ENTR', color: 'indigo' },
  { id: 'calc', name: 'Calculus and Scientific Computing', code: 'CALC', color: 'sky' },
  { id: 'swd-lec', name: 'Software Design (LEC)', code: 'SWD-LEC', color: 'violet' },
  { id: 'swd-lab', name: 'Software Design (LAB)', code: 'SWD-LAB', color: 'emerald' },
];

export function computeAutoStatus(startStr: string, dueStr: string, now: Date = new Date()): TaskStatus {
  const start = new Date(startStr);
  const due = new Date(dueStr);
  if (now > due) return 'Completed';
  if (now >= start && now <= due) return 'In Progress';
  return 'Not Started';
}

const RAW_SEED_TASKS: Omit<Task, 'status'>[] = [
  { id: 1, courseId: 'entr', category: 'Personal Assignment', session: 'Session 3', name: 'Personal Assignment', type: 'Individual', start: '2026-11-16T00:00', due: '2026-11-30T12:00', weight: '20%' },
  { id: 2, courseId: 'calc', category: 'Personal Assignment', session: 'Session 3', name: 'Personal Assignment 1', type: 'Individual', start: '2026-11-16T00:00', due: '2026-11-30T12:00', weight: '20%' },
  { id: 3, courseId: 'swd-lec', category: 'Personal Assignment', session: 'Session 3', name: 'Personal Assignment 1', type: 'Individual', start: '2026-11-16T00:00', due: '2026-11-30T12:00', weight: '12%' },
  { id: 4, courseId: 'calc', category: 'Team Assignment', session: 'Session 4', name: 'Team Assignment 1', type: 'Group', start: '2026-11-16T00:00', due: '2026-12-07T12:00', weight: '15%' },
  { id: 5, courseId: 'swd-lec', category: 'Team Assignment', session: 'Session 7', name: 'Team Assignment 1', type: 'Group', start: '2026-11-16T00:00', due: '2026-12-07T12:00', weight: '9%' },
  { id: 6, courseId: 'calc', category: 'Team Assignment', session: 'Session 5', name: 'Team Assignment 2', type: 'Group', start: '2026-11-16T00:00', due: '2026-12-14T12:00', weight: '15%' },
  { id: 7, courseId: 'swd-lec', category: 'Team Assignment', session: 'Session 8', name: 'Team Assignment 2', type: 'Group', start: '2026-11-16T00:00', due: '2026-12-14T12:00', weight: '9%' },
  { id: 8, courseId: 'entr', category: 'Quiz', session: 'Session 6', name: 'Quiz 1', type: 'Individual', start: '2026-12-14T00:00', due: '2026-12-21T12:00', weight: '15%' },
  { id: 9, courseId: 'calc', category: 'Quiz', session: 'Session 6', name: 'Quiz 1', type: 'Individual', start: '2026-12-14T00:00', due: '2026-12-21T12:00', weight: '15%' },
  { id: 10, courseId: 'swd-lec', category: 'Quiz', session: 'Session 9', name: 'Quiz 1', type: 'Individual', start: '2026-12-14T00:00', due: '2026-12-21T12:00', weight: '9%' },
  { id: 11, courseId: 'swd-lab', category: 'LAB Team Assignment', session: 'Session 15', name: 'Team Assignment Practicum 1', type: 'Group', start: '2026-11-16T00:00', due: '2027-01-11T12:00', weight: '20%' },
  { id: 12, courseId: 'entr', category: 'Team Assignment', session: 'Session 11', name: 'Team Assignment 1', type: 'Group', start: '2026-11-16T00:00', due: '2027-01-18T12:00', weight: '15%' },
  { id: 13, courseId: 'calc', category: 'Personal Assignment', session: 'Session 11', name: 'Personal Assignment 2', type: 'Individual', start: '2026-11-16T00:00', due: '2027-01-18T12:00', weight: '20%' },
  { id: 14, courseId: 'swd-lec', category: 'Personal Assignment', session: 'Session 16', name: 'Personal Assignment 2', type: 'Individual', start: '2026-11-16T00:00', due: '2027-01-18T12:00', weight: '12%' },
  { id: 15, courseId: 'calc', category: 'Team Assignment', session: 'Session 12', name: 'Team Assignment 3', type: 'Group', start: '2026-11-16T00:00', due: '2027-01-25T12:00', weight: '15%' },
  { id: 16, courseId: 'swd-lab', category: 'LAB Team Assignment', session: 'Session 18', name: 'Team Assignment Practicum 2', type: 'Group', start: '2026-11-16T00:00', due: '2027-01-25T12:00', weight: '20%' },
  { id: 17, courseId: 'entr', category: 'Team Assignment', session: 'Session 13', name: 'Team Assignment 2', type: 'Group', start: '2026-11-16T00:00', due: '2027-02-01T12:00', weight: '15%' },
  { id: 18, courseId: 'swd-lec', category: 'Team Assignment', session: 'Session 21', name: 'Team Assignment 3', type: 'Group', start: '2026-11-16T00:00', due: '2027-02-01T12:00', weight: '9%' },
  { id: 19, courseId: 'entr', category: 'Quiz', session: 'Session 14', name: 'Quiz 2', type: 'Individual', start: '2027-02-01T00:00', due: '2027-02-08T12:00', weight: '15%' },
  { id: 20, courseId: 'calc', category: 'Quiz', session: 'Session 14', name: 'Quiz 2', type: 'Individual', start: '2027-02-01T00:00', due: '2027-02-08T12:00', weight: '15%' },
  { id: 21, courseId: 'swd-lec', category: 'Quiz', session: 'Session 25', name: 'Quiz 2', type: 'Individual', start: '2027-02-01T00:00', due: '2027-02-08T12:00', weight: '9%' },
  { id: 22, courseId: 'swd-lab', category: 'LAB Project Team', session: 'Session 26', name: 'Team Project Practicum', type: 'Group', start: '2026-11-16T00:00', due: '2027-02-08T12:00', weight: '20%' },
];

export function getSeedTasks(now: Date = new Date()): Task[] {
  return RAW_SEED_TASKS.map((t) => ({
    ...t,
    status: computeAutoStatus(t.start, t.due, now),
    manualStatus: false,
  }));
}
