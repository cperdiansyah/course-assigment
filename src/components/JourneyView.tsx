import { CheckCircle2, Circle, Clock, Flag, MapPin, PlayCircle } from 'lucide-react';
import { Fragment } from 'react';
import { COURSE_COLOR_STYLES } from '../data/seed';
import { Course, Task, TaskStatus } from '../types';
import { formatDateIndo, formatShortDate, getCategoryStyle, getCountdownText } from '../utils/date';

interface JourneyViewProps {
  courses: Course[];
  filteredTasks: Task[];
  allTasks: Task[];
  today: Date;
  onSelectTask: (task: Task) => void;
  onQuickToggleStatus: (task: Task, nextStatus: TaskStatus) => void;
}

export function JourneyView({
  courses,
  filteredTasks,
  allTasks,
  today,
  onSelectTask,
  onQuickToggleStatus,
}: JourneyViewProps) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Sort chronologically by due date (oldest -> newest) like a journey timeline
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
  );

  const completedTotal = allTasks.filter((t) => t.status === 'Completed').length;
  const progressPct = allTasks.length ? Math.round((completedTotal / allTasks.length) * 100) : 0;

  if (sortedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex-1 flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Tidak ada tugas yang cocok dengan filter saat ini.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ubah kata kunci pencarian atau filter untuk melihat riwayat perjalanan tugas.
        </p>
      </div>
    );
  }

  const todayMs = today.getTime();
  // Find index where today marker should be placed
  const todayInsertIndex = sortedTasks.findIndex((t) => new Date(t.due).getTime() >= todayMs);

  const renderTodayMarker = () => (
    <div key="today-marker" className="relative flex items-center gap-4 py-2">
      <div className="relative z-10 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 ring-4 ring-white dark:ring-slate-900 shrink-0">
        <MapPin className="w-4 h-4" />
      </div>
      <div className="flex-1 flex items-center gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
          Posisi Saat Ini • {formatShortDate(today)}
        </span>
        <div className="h-px flex-1 bg-rose-300/70 dark:bg-rose-800/70" />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Journey Header Summary */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Riwayat & Jejak Perjalanan Tugas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {completedTotal} dari {allTasks.length} milestone selesai ({progressPct}%)
              </p>
            </div>
          </div>
          <div className="w-full sm:w-44">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vertical Timeline Track */}
        <div className="relative space-y-4">
          {/* Continuous Vertical Spine */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-slate-200 dark:bg-slate-800"
          />

          {sortedTasks.map((task, idx) => {
            const course = courseMap.get(task.courseId);
            const courseStyle = course
              ? COURSE_COLOR_STYLES[course.color] ?? COURSE_COLOR_STYLES.indigo
              : COURSE_COLOR_STYLES.indigo;
            const catStyle = getCategoryStyle(task.category, task.status);
            const countdown = getCountdownText(task.due, today);
            const isPast = new Date(task.due).getTime() < todayMs;
            const nextStatus: TaskStatus =
              task.status === 'Completed'
                ? 'In Progress'
                : task.status === 'In Progress'
                  ? 'Completed'
                  : 'In Progress';

            const nodeClasses =
              task.status === 'Completed'
                ? 'bg-emerald-500 text-white ring-4 ring-white dark:ring-slate-900'
                : countdown.isOverdue
                  ? 'bg-rose-500 text-white ring-4 ring-white dark:ring-slate-900'
                  : task.status === 'In Progress'
                    ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                    : 'bg-white dark:bg-slate-900 text-slate-400 border-2 border-slate-300 dark:border-slate-700 ring-4 ring-white dark:ring-slate-900';

            return (
              <Fragment key={task.id}>
                {todayInsertIndex === idx && renderTodayMarker()}

                <div className="relative flex items-start gap-4">
                  {/* Timeline Node */}
                  <button
                    type="button"
                    onClick={() => onQuickToggleStatus(task, nextStatus)}
                    title={`Ubah status ke ${nextStatus}`}
                    aria-label={`Ubah status ${task.name} ke ${nextStatus}`}
                    className={`relative z-10 mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer ${nodeClasses}`}
                  >
                    {task.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : task.status === 'In Progress' ? (
                      <PlayCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Stop Card */}
                  <div
                    className={`flex-1 rounded-2xl border p-3.5 sm:p-4 transition-colors ${
                      task.status === 'Completed'
                        ? 'bg-slate-50/80 dark:bg-slate-800/35 border-slate-200/80 dark:border-slate-800/80'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDateIndo(task.due)}</span>
                      </div>

                      {task.status === 'Completed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Selesai {isPast ? `• ${countdown.text}` : ''}
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            countdown.isOverdue
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : countdown.isUrgent
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {countdown.text}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="w-full text-left group cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {course && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${courseStyle.badge}`}
                          >
                            {course.code}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${catStyle.badge}`}
                        >
                          {task.category}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {task.weight}
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition ${
                          task.status === 'Completed' ? 'line-through text-slate-500 dark:text-slate-400' : ''
                        }`}
                      >
                        {task.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {course?.name ?? 'Mata Kuliah'} • {task.session} • {task.type}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-lg px-2.5 py-1.5 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </button>
                  </div>
                </div>
              </Fragment>
            );
          })}

          {todayInsertIndex === -1 && renderTodayMarker()}
        </div>
      </div>
    </div>
  );
}
