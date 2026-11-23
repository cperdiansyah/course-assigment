import { CheckCircle2, Circle, Clock, PlayCircle } from 'lucide-react';
import { COURSE_COLOR_STYLES } from '../data/seed';
import { Course, Task, TaskStatus } from '../types';
import { formatDateIndo, getCategoryStyle, getCountdownText } from '../utils/date';

interface AgendaViewProps {
  courses: Course[];
  filteredTasks: Task[];
  today: Date;
  onSelectTask: (task: Task) => void;
  onQuickToggleStatus: (task: Task, nextStatus: TaskStatus) => void;
}

export function AgendaView({
  courses,
  filteredTasks,
  today,
  onSelectTask,
  onQuickToggleStatus,
}: AgendaViewProps) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    return new Date(a.due).getTime() - new Date(b.due).getTime();
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex-1 flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Tidak ada tugas yang cocok dengan filter saat ini.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ubah kata kunci pencarian atau filter status/tipe untuk melihat tugas lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex-1 overflow-auto p-3 sm:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sortedTasks.map((task) => {
          const course = courseMap.get(task.courseId);
          const courseStyle = course
            ? COURSE_COLOR_STYLES[course.color] ?? COURSE_COLOR_STYLES.indigo
            : COURSE_COLOR_STYLES.indigo;
          const catStyle = getCategoryStyle(task.category, task.status);
          const countdown = getCountdownText(task.due, today);
          const nextStatus: TaskStatus =
            task.status === 'Completed'
              ? 'In Progress'
              : task.status === 'In Progress'
                ? 'Completed'
                : 'In Progress';

          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-colors ${
                task.status === 'Completed'
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {course && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${courseStyle.badge}`}
                      >
                        {course.code}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${catStyle.badge}`}>
                      {task.category}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.weight}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="text-left group cursor-pointer"
                  >
                    <h3
                      className={`text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition ${
                        task.status === 'Completed' ? 'line-through' : ''
                      }`}
                    >
                      {task.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {course?.name ?? 'Mata Kuliah'} • {task.session} • {task.type}
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onQuickToggleStatus(task, nextStatus)}
                  title={`Ubah status ke ${nextStatus}`}
                  aria-label={`Ubah status ${task.name} ke ${nextStatus}`}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                >
                  {task.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : task.status === 'In Progress' ? (
                    <PlayCircle className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{formatDateIndo(task.due)}</span>
                </div>
                {task.status !== 'Completed' ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                      countdown.isOverdue
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : countdown.isUrgent
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {countdown.text}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                    Selesai
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
