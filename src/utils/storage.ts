import { AppDataExport, Course, Task } from '../types';
import { DEFAULT_COURSES, computeAutoStatus, getSeedTasks } from '../data/seed';
import { EXAMPLE_CSV_CONTENT, parseCsvToAppData, serializeToCsv } from './csv';

const STORAGE_KEY_V1 = 'course-timeline-tracker:v1';

interface StoredState {
  version: number;
  courses: Course[];
  tasks: Task[];
}

export function loadAppState(now: Date = new Date()): { courses: Course[]; tasks: Task[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) {
      return { courses: DEFAULT_COURSES, tasks: getSeedTasks(now) };
    }
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const courses =
      Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : DEFAULT_COURSES;
    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.map((t) => ({
          ...t,
          status: t.manualStatus ? t.status : computeAutoStatus(t.start, t.due, now),
        }))
      : getSeedTasks(now);
    return { courses, tasks };
  } catch {
    return { courses: DEFAULT_COURSES, tasks: getSeedTasks(now) };
  }
}

export function saveAppState(courses: Course[], tasks: Task[]): void {
  try {
    const payload: StoredState = {
      version: 1,
      courses,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAppCsv(courses: Course[], tasks: Task[]): void {
  const csv = serializeToCsv(courses, tasks);
  triggerDownload(
    csv,
    `course-timeline-${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;',
  );
}

export function downloadExampleCsv(): void {
  triggerDownload(
    `\uFEFF${EXAMPLE_CSV_CONTENT}`,
    'example-assignments.csv',
    'text/csv;charset=utf-8;',
  );
}

export function exportAppJson(courses: Course[], tasks: Task[]): void {
  const payload: AppDataExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    courses,
    tasks,
  };
  triggerDownload(
    JSON.stringify(payload, null, 2),
    `course-timeline-backup-${new Date().toISOString().slice(0, 10)}.json`,
    'application/json',
  );
}

export function parseImportedFile(
  fileName: string,
  content: string,
  now: Date = new Date(),
): { courses: Course[]; tasks: Task[] } {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json') || content.trim().startsWith('{')) {
    const parsed = JSON.parse(content) as Partial<AppDataExport>;
    if (!Array.isArray(parsed.courses) || !Array.isArray(parsed.tasks)) {
      throw new Error('Format JSON tidak valid: harus memiliki array "courses" dan "tasks".');
    }
    return {
      courses: parsed.courses,
      tasks: parsed.tasks,
    };
  }
  return parseCsvToAppData(content, now);
}

/**
 * Merge imported courses & tasks into existing state without ID collisions.
 */
export function mergeAppData(
  existingCourses: Course[],
  existingTasks: Task[],
  importedCourses: Course[],
  importedTasks: Task[],
): { courses: Course[]; tasks: Task[]; addedCount: number } {
  const nextCourses = [...existingCourses];
  const courseIdRemap = new Map<string, string>();

  for (const inc of importedCourses) {
    const matchByCode = nextCourses.find(
      (c) => c.code.toLowerCase() === inc.code.toLowerCase() || c.id === inc.id,
    );
    if (matchByCode) {
      courseIdRemap.set(inc.id, matchByCode.id);
    } else {
      let newId = inc.id;
      while (nextCourses.some((c) => c.id === newId)) {
        newId = `${inc.id}-${Math.random().toString(36).slice(2, 6)}`;
      }
      nextCourses.push({ ...inc, id: newId });
      courseIdRemap.set(inc.id, newId);
    }
  }

  let nextTaskId = existingTasks.length ? Math.max(...existingTasks.map((t) => t.id)) + 1 : 1;
  const appendedTasks: Task[] = importedTasks.map((t) => ({
    ...t,
    id: nextTaskId++,
    courseId: courseIdRemap.get(t.courseId) ?? t.courseId,
  }));

  return {
    courses: nextCourses,
    tasks: [...existingTasks, ...appendedTasks],
    addedCount: appendedTasks.length,
  };
}
