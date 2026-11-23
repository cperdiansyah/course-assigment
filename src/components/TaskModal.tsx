import { useEffect, useId, useState } from 'react';
import {
  CalendarPlus,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  Pencil,
  PlayCircle,
  Trash2,
  X,
} from 'lucide-react';
import { COURSE_COLOR_STYLES, computeAutoStatus } from '../data/seed';
import { Course, Task, TaskCategory, TaskStatus, TaskType } from '../types';
import { downloadTaskIcs, getGoogleCalendarUrl } from '../utils/calendar';
import { formatDateIndo, getCategoryStyle, getCountdownText, toLocalDateTimeInput } from '../utils/date';
import { ModalDialog } from './ModalDialog';

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  courses: Course[];
  today: Date;
  onClose: () => void;
  onSave: (data: Omit<Task, 'id'>, existingId?: number) => void;
  onDelete: (id: number) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Personal Assignment',
  'Team Assignment',
  'Quiz',
  'LAB Team Assignment',
  'LAB Project Team',
];

export function TaskModal({
  open,
  task,
  courses,
  today,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const titleId = useId();
  const [mode, setMode] = useState<'read' | 'edit'>('read');

  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [manualStatus, setManualStatus] = useState(false);
  const [name, setName] = useState('');
  const [session, setSession] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Personal Assignment');
  const [type, setType] = useState<TaskType>('Individual');
  const [weight, setWeight] = useState('10%');
  const [start, setStart] = useState('');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    if (task) {
      setMode('read');
      setCourseId(task.courseId);
      setStatus(task.status);
      setManualStatus(Boolean(task.manualStatus));
      setName(task.name);
      setSession(task.session);
      setCategory(task.category);
      setType(task.type);
      setWeight(task.weight);
      setStart(task.start);
      setDue(task.due);
      setNotes(task.notes ?? '');
    } else {
      setMode('edit');
      const defaultStart = new Date(today);
      defaultStart.setHours(0, 0, 0, 0);
      const defaultDue = new Date(today);
      defaultDue.setDate(defaultDue.getDate() + 7);
      defaultDue.setHours(12, 0, 0, 0);
      const startStr = toLocalDateTimeInput(defaultStart);
      const dueStr = toLocalDateTimeInput(defaultDue);

      setCourseId(courses[0]?.id ?? '');
      setName('');
      setSession('');
      setCategory('Personal Assignment');
      setType('Individual');
      setWeight('10%');
      setStart(startStr);
      setDue(dueStr);
      setStatus(computeAutoStatus(startStr, dueStr, today));
      setManualStatus(false);
      setNotes('');
    }
  }, [open, task, courses, today]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const countdown = due ? getCountdownText(due, today) : null;

  const handleStartChange = (val: string) => {
    setStart(val);
    if (!manualStatus && val && due) {
      setStatus(computeAutoStatus(val, due, today));
    }
  };

  const handleDueChange = (val: string) => {
    setDue(val);
    if (!manualStatus && start && val) {
      setStatus(computeAutoStatus(start, val, today));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    onSave(
      {
        courseId,
        status,
        manualStatus,
        name: name.trim(),
        session: session.trim(),
        category,
        type,
        weight: weight.trim(),
        start,
        due,
        notes: notes.trim() || undefined,
      },
      task?.id,
    );
  };

  const courseStyle = selectedCourse
    ? COURSE_COLOR_STYLES[selectedCourse.color] ?? COURSE_COLOR_STYLES.indigo
    : COURSE_COLOR_STYLES.indigo;
  const catStyle = getCategoryStyle(category, status);

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledBy={titleId}>
      <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/60">
        <div className="min-w-0 pr-2">
          <h1 id={titleId} className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {task ? task.name : 'Tambah Tugas ke Timeline'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {task
              ? `${selectedCourse?.name ?? 'Mata Kuliah'} · ${task.session}`
              : 'Isi detail tugas baru'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {mode === 'read' && task ? (
        <div className="p-4 sm:p-5 space-y-4 max-h-[82dvh] overflow-y-auto">
          {/* Focal Deadline & Weight Strip */}
          <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Deadline</div>
              <div className="text-sm sm:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
                {formatDateIndo(task.due)}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums mt-0.5">
                Mulai {formatDateIndo(task.start)}
              </div>
            </div>

            <div className="text-right shrink-0 tabular-nums">
              <div className="font-mono-num text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {task.weight}
              </div>
              {task.status !== 'Completed' && countdown ? (
                <div
                  className={`text-xs font-medium mt-0.5 ${
                    countdown.isOverdue
                      ? 'text-rose-600 dark:text-rose-400'
                      : countdown.isUrgent
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {countdown.text}
                </div>
              ) : (
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Selesai
                </div>
              )}
            </div>
          </div>

          {/* Flat Key-Value Metadata (no nested box) */}
          <dl className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
            <div className="py-2 flex items-center justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                {task.status === 'Completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : task.status === 'In Progress' ? (
                  <PlayCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>{task.status}</span>
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Mata Kuliah</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-right">
                <span className={`w-1.5 h-1.5 rounded-full ${courseStyle.dot} shrink-0`} />
                <span>{selectedCourse?.name ?? '-'}</span>
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Kategori</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot} shrink-0`} />
                <span>{task.category}</span>
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Tipe</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{task.type}</dd>
            </div>
          </dl>

          {task.notes && (
            <div className="pt-1">
              <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1">Catatan</div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words bg-zinc-50 dark:bg-zinc-900/60 rounded-lg px-3 py-2">
                {task.notes}
              </p>
            </div>
          )}

          {/* Compact Side-by-Side Calendar Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Tambahkan ke kalender</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={getGoogleCalendarUrl(task, selectedCourse)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
              >
                <span>Google Calendar</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => downloadTaskIcs(task, selectedCourse)}
                className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>File .ICS</span>
              </button>
            </div>
          </div>

          {/* Read Mode Footer */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                >
                  Konfirmasi Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-2 py-1.5 -ml-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-8 px-3 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="h-8 px-3.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors active:scale-[0.97] flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[78dvh] sm:max-h-[82dvh]">
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5 overflow-y-auto flex-1">
            {/* Primary Task Identity */}
            <div className="space-y-3">
              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Nama Tugas
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Personal Assignment 1"
                  required
                  autoFocus
                  className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Mata Kuliah
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Status
                    </label>
                    {manualStatus && start && due && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualStatus(false);
                          setStatus(computeAutoStatus(start, due, today));
                        }}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Auto-sync
                      </button>
                    )}
                  </div>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as TaskStatus);
                      setManualStatus(true);
                    }}
                    className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 font-medium text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Sesi
                  </label>
                  <input
                    type="text"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    placeholder="Session 3"
                    required
                    className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Bobot Nilai
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="20%"
                    required
                    className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm font-mono-num border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Tipe
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TaskType)}
                    className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Mulai
                </label>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => handleStartChange(e.target.value)}
                  required
                  className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm tabular-nums border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={due}
                  onChange={(e) => handleDueChange(e.target.value)}
                  required
                  className="w-full min-w-0 h-10 sm:h-9 px-3 text-base sm:text-sm tabular-nums border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Catatan (opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Link submission, anggota kelompok, atau detail penting..."
                className="w-full px-3 py-2 text-base sm:text-sm border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/70 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 resize-none transition-colors"
              />
            </div>
          </div>

          {/* Sticky Mobile-Friendly Action Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121417] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => (task ? setMode('read') : onClose())}
              className="h-10 sm:h-8 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer flex-1 sm:flex-initial"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 sm:h-8 px-5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors active:scale-[0.97] cursor-pointer flex-1 sm:flex-initial"
            >
              Simpan
            </button>
          </div>
        </form>
      )}
    </ModalDialog>
  );
}
