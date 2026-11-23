import { Course, CourseColorKey, Task, TaskCategory, TaskStatus, TaskType } from '../types';

const VALID_COLORS: CourseColorKey[] = [
  'indigo',
  'sky',
  'violet',
  'emerald',
  'rose',
  'amber',
  'teal',
  'fuchsia',
];

const VALID_CATEGORIES: TaskCategory[] = [
  'Personal Assignment',
  'Team Assignment',
  'Quiz',
  'LAB Team Assignment',
  'LAB Project Team',
];

export function computeAutoStatus(startStr: string, dueStr: string, now: Date = new Date()): TaskStatus {
  const start = new Date(startStr);
  const due = new Date(dueStr);
  if (now > due) return 'Completed';
  if (now >= start && now <= due) return 'In Progress';
  return 'Not Started';
}

function normalizeDateTime(raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  // Support "YYYY-MM-DD" or "YYYY-MM-DD HH:mm" -> "YYYY-MM-DDTHH:mm"
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T12:00`;
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(v)) return v.replace(/\s+/, 'T').slice(0, 16);
  return v.slice(0, 16);
}

/**
 * Parse RFC 4180 CSV text into rows of strings.
 */
export function parseCsvRows(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      if (clean[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export function parseCsvToAppData(
  csvText: string,
  now: Date = new Date(),
): { courses: Course[]; tasks: Task[] } {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('CSV kosong atau tidak memiliki baris data.');
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = (name: string, fallback?: string) => {
    const idx = headers.indexOf(name);
    if (idx !== -1) return idx;
    return fallback ? headers.indexOf(fallback) : -1;
  };

  const idxCourseCode = colIndex('course_code', 'code');
  const idxCourseName = colIndex('course_name', 'course');
  const idxCourseColor = colIndex('course_color', 'color');
  const idxCategory = colIndex('category');
  const idxSession = colIndex('session');
  const idxName = colIndex('name', 'task');
  const idxType = colIndex('type');
  const idxStart = colIndex('start');
  const idxDue = colIndex('due');
  const idxWeight = colIndex('weight');
  const idxStatus = colIndex('status');
  const idxNotes = colIndex('notes');

  if (idxName === -1 || idxStart === -1 || idxDue === -1) {
    throw new Error('Header CSV wajib memiliki minimal kolom: name, start, due.');
  }

  const coursesMap = new Map<string, Course>();
  const tasks: Task[] = [];
  let nextId = 1;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const get = (idx: number) => (idx >= 0 && idx < r.length ? r[idx].trim() : '');

    const taskName = get(idxName);
    const start = normalizeDateTime(get(idxStart));
    const due = normalizeDateTime(get(idxDue));
    if (!taskName || !start || !due) continue;

    const rawCode = get(idxCourseCode) || 'GENERAL';
    const rawCourseName = get(idxCourseName) || rawCode;
    const courseId = rawCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!coursesMap.has(courseId)) {
      const rawColor = get(idxCourseColor).toLowerCase() as CourseColorKey;
      const color = VALID_COLORS.includes(rawColor)
        ? rawColor
        : VALID_COLORS[coursesMap.size % VALID_COLORS.length];

      coursesMap.set(courseId, {
        id: courseId,
        code: rawCode.toUpperCase(),
        name: rawCourseName,
        color,
      });
    }

    const rawCat = get(idxCategory) as TaskCategory;
    const category: TaskCategory = VALID_CATEGORIES.includes(rawCat)
      ? rawCat
      : 'Personal Assignment';

    const rawType = get(idxType);
    const type: TaskType = rawType.toLowerCase() === 'group' ? 'Group' : 'Individual';

    const rawStatus = get(idxStatus);
    const isExplicitStatus =
      rawStatus === 'Not Started' || rawStatus === 'In Progress' || rawStatus === 'Completed';
    const status = isExplicitStatus ? rawStatus : computeAutoStatus(start, due, now);

    tasks.push({
      id: nextId++,
      courseId,
      category,
      session: get(idxSession) || '-',
      name: taskName,
      type,
      start,
      due,
      weight: get(idxWeight) || '0%',
      status,
      manualStatus: isExplicitStatus,
      notes: get(idxNotes) || undefined,
    });
  }

  if (tasks.length === 0) {
    throw new Error('Tidak ada baris tugas yang valid ditemukan di CSV.');
  }

  return {
    courses: Array.from(coursesMap.values()),
    tasks,
  };
}

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function serializeToCsv(courses: Course[], tasks: Task[]): string {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const header = [
    'course_code',
    'course_name',
    'course_color',
    'category',
    'session',
    'name',
    'type',
    'start',
    'due',
    'weight',
    'status',
    'notes',
  ].join(',');

  const lines = tasks.map((t) => {
    const course = courseMap.get(t.courseId);
    const row = [
      course?.code ?? 'CRS',
      course?.name ?? 'Mata Kuliah',
      course?.color ?? 'indigo',
      t.category,
      t.session,
      t.name,
      t.type,
      t.start,
      t.due,
      t.weight,
      t.manualStatus ? t.status : '',
      t.notes ?? '',
    ];
    return row.map((cell) => escapeCsvField(String(cell))).join(',');
  });

  return `\uFEFF${[header, ...lines].join('\r\n')}\r\n`;
}

export const EXAMPLE_CSV_CONTENT = `course_code,course_name,course_color,category,session,name,type,start,due,weight,status,notes
ALGO,Algorithm & Data Structures,indigo,Personal Assignment,Session 2,Tugas 1: Big-O & Sorting,Individual,2026-11-25T00:00,2026-12-05T23:59,15%,,Kumpulkan PDF ke LMS
ALGO,Algorithm & Data Structures,indigo,Quiz,Session 5,Quiz 1: Trees & Graphs,Individual,2026-12-10T08:00,2026-12-12T23:59,20%,,
DBSYS,Database Systems,emerald,LAB Team Assignment,Session 4,Practicum: ERD & Normalization,Group,2026-11-28T00:00,2026-12-14T18:00,25%,In Progress,Kelompok 3
`;
