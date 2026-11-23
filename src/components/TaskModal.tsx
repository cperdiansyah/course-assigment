import { useEffect, useId, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { computeAutoStatus } from '../data/seed';
import { Course, Task, TaskCategory, TaskStatus, TaskType } from '../types';
import { getCountdownText, toLocalDateTimeInput } from '../utils/date';
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

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledBy={titleId}>
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
        <div className="min-w-0 pr-2">
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 mb-1 truncate max-w-full">
            {task ? selectedCourse?.name ?? 'Mata Kuliah' : 'Tugas Baru'}
          </span>
          <h1 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {task ? `${task.name} (${task.session})` : 'Tambah Tugas ke Timeline'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Mata Kuliah
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Status Pengerjaan
              </label>
              {manualStatus && start && due && (
                <button
                  type="button"
                  onClick={() => {
                    setManualStatus(false);
                    setStatus(computeAutoStatus(start, due, today));
                  }}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Auto-sync tanggal
                </button>
              )}
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as TaskStatus);
                setManualStatus(true);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nama Tugas
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Personal Assignment 1"
              required
              autoFocus
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sesi</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="Contoh: Session 3"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tipe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Bobot Nilai
            </label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="20%"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => handleStartChange(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={due}
              onChange={(e) => handleDueChange(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Catatan (opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Link submission, anggota kelompok, atau detail penting..."
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 resize-none"
          />
        </div>

        {task && countdown && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Sisa waktu dari hari ini:</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{countdown.text}</strong>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {task ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
                >
                  Konfirmasi Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tugas</span>
              </button>
            )
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </div>
      </form>
    </ModalDialog>
  );
}
