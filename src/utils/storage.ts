import { AppDataExport, Course, Task } from '../types';
import { DEFAULT_COURSES, computeAutoStatus, getSeedTasks } from '../data/seed';

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
    const courses = Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : DEFAULT_COURSES;
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

export function exportAppData(courses: Course[], tasks: Task[]): void {
  const payload: AppDataExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    courses,
    tasks,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `course-timeline-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseImportedData(jsonText: string): { courses: Course[]; tasks: Task[] } {
  const parsed = JSON.parse(jsonText) as Partial<AppDataExport>;
  if (!Array.isArray(parsed.courses) || !Array.isArray(parsed.tasks)) {
    throw new Error('Format JSON tidak valid: harus memiliki array "courses" dan "tasks".');
  }
  return {
    courses: parsed.courses,
    tasks: parsed.tasks,
  };
}
