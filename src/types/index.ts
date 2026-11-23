export type TaskType = 'Individual' | 'Group';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export type TaskCategory =
  | 'Personal Assignment'
  | 'Team Assignment'
  | 'Quiz'
  | 'LAB Team Assignment'
  | 'LAB Project Team';

export type CourseColorKey =
  | 'indigo'
  | 'sky'
  | 'violet'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'teal'
  | 'fuchsia';

export interface Course {
  id: string;
  name: string;
  code: string;
  color: CourseColorKey;
}

export interface Task {
  id: number;
  courseId: string;
  category: TaskCategory;
  session: string;
  name: string;
  type: TaskType;
  start: string; // YYYY-MM-DDTHH:mm
  due: string;   // YYYY-MM-DDTHH:mm
  weight: string;
  status: TaskStatus;
  manualStatus?: boolean;
  notes?: string;
}

export interface AppDataExport {
  version: number;
  exportedAt: string;
  courses: Course[];
  tasks: Task[];
}

export type ViewMode = 'timeline' | 'agenda' | 'journey';
