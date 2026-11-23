import { useId, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { COURSE_COLOR_STYLES } from '../data/seed';
import { Course, CourseColorKey, Task } from '../types';
import { ModalDialog } from './ModalDialog';

interface CourseModalProps {
  open: boolean;
  courses: Course[];
  tasks: Task[];
  onClose: () => void;
  onSaveCourse: (course: Course, isNew: boolean) => void;
  onDeleteCourse: (courseId: string) => void;
}

const COLOR_KEYS = Object.keys(COURSE_COLOR_STYLES) as CourseColorKey[];

export function CourseModal({
  open,
  courses,
  tasks,
  onClose,
  onSaveCourse,
  onDeleteCourse,
}: CourseModalProps) {
  const titleId = useId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState<CourseColorKey>('indigo');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setColor('indigo');
  };

  const handleEdit = (c: Course) => {
    setEditingId(c.id);
    setName(c.name);
    setCode(c.code);
    setColor(c.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    const id =
      editingId ??
      `${code
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    onSaveCourse(
      {
        id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
      },
      !editingId,
    );
    resetForm();
  };

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledBy={titleId} maxWidthClass="max-w-xl">
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
        <div>
          <h1 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Kelola Mata Kuliah
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tambah, ubah nama/warna, atau hapus mata kuliah.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {editingId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Mata Kuliah"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kode (cth: ALGO)"
                maxLength={12}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Warna:</span>
              {COLOR_KEYS.map((key) => {
                const st = COURSE_COLOR_STYLES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    aria-label={`Pilih warna ${st.label}`}
                    className={`w-6 h-6 rounded-full ${st.dot} transition cursor-pointer ${
                      color === key
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingId ? 'Update' : 'Tambah'}</span>
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          {courses.map((c) => {
            const st = COURSE_COLOR_STYLES[c.color] ?? COURSE_COLOR_STYLES.indigo;
            const taskCount = tasks.filter((t) => t.courseId === c.id).length;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2.5 h-8 rounded-full ${st.bar} shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${st.badge}`}>
                        {c.code}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{taskCount} tugas</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                      {c.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    title="Edit mata kuliah"
                    aria-label={`Edit ${c.name}`}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={courses.length <= 1}
                    onClick={() => {
                      if (
                        taskCount === 0 ||
                        window.confirm(`Hapus "${c.name}" beserta ${taskCount} tugas di dalamnya?`)
                      ) {
                        onDeleteCourse(c.id);
                        if (editingId === c.id) resetForm();
                      }
                    }}
                    title={courses.length <= 1 ? 'Minimal 1 mata kuliah harus ada' : 'Hapus mata kuliah'}
                    aria-label={`Hapus ${c.name}`}
                    className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModalDialog>
  );
}
