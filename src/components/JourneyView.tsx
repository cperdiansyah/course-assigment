import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { Fragment } from 'react';
import { COURSE_COLOR_STYLES } from '../data/seed';
import { Course, Task, TaskStatus } from '../types';
import { formatDateIndo, formatShortDate, getCountdownText } from '../utils/date';

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

  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
  );

  const completedTotal = allTasks.filter((t) => t.status === 'Completed').length;
  const progressPct = allTasks.length ? Math.round((completedTotal / allTasks.length) * 100) : 0;

  if (sortedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center flex-1 flex flex-col items-center justify-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Tidak ada tugas yang cocok dengan filter saat ini.
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Ubah kata kunci pencarian atau filter untuk melihat riwayat perjalanan tugas.
        </p>
      </div>
    );
  }

  const todayMs = today.getTime();
  const todayInsertIndex = sortedTasks.findIndex((t) => new Date(t.due).getTime() >= todayMs);

  const renderTodayMarker = () => (
    <div key="today-marker" className="relative flex items-center gap-3 sm:gap-4 py-2">
      <div className="hidden sm:block w-32 text-right text-[11px] font-medium text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
        {formatShortDate(today)}
      </div>
      <div className="relative z-10 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center ring-4 ring-[#FAFAFA] dark:ring-[#0B0C0E] shrink-0">
        <span className="w-2 h-2 rounded-full bg-white" />
      </div>
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Posisi saat ini</span>
        <div className="h-px flex-1 bg-rose-300/70 dark:bg-rose-800/70" />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto pb-8">
        {/* Compact Journey Progress Header */}
        <div className="mb-5 px-4 py-3 rounded-xl bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Jejak Perjalanan Tugas
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              {completedTotal} dari {allTasks.length} milestone selesai ({progressPct}%)
            </p>
          </div>
          <div className="w-full sm:w-44 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Editorial Vertical Timeline */}
        <div className="relative space-y-3">
          <div
            aria-hidden="true"
            className="absolute left-3 sm:left-[147px] top-3 bottom-3 w-px bg-zinc-200 dark:bg-zinc-800"
          />

          {sortedTasks.map((task, idx) => {
            const course = courseMap.get(task.courseId);
            const courseStyle = course
              ? COURSE_COLOR_STYLES[course.color] ?? COURSE_COLOR_STYLES.indigo
              : COURSE_COLOR_STYLES.indigo;
            const countdown = getCountdownText(task.due, today);
            const nextStatus: TaskStatus =
              task.status === 'Completed'
                ? 'In Progress'
                : task.status === 'In Progress'
                  ? 'Completed'
                  : 'In Progress';

            return (
              <Fragment key={task.id}>
                {todayInsertIndex === idx && renderTodayMarker()}

                <div className="relative flex items-start gap-3 sm:gap-4">
                  {/* Date Gutter (Desktop) */}
                  <div className="hidden sm:block w-32 pt-2.5 text-right shrink-0 tabular-nums">
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {formatDateIndo(task.due).split(',')[0]}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {formatDateIndo(task.due).split(',')[1]?.trim()}
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <button
                    type="button"
                    onClick={() => onQuickToggleStatus(task, nextStatus)}
                    title={`Ubah status ke ${nextStatus}`}
                    aria-label={`Ubah status ${task.name} ke ${nextStatus}`}
                    className="relative z-10 mt-2.5 w-6 h-6 rounded-full bg-[#FAFAFA] dark:bg-[#0B0C0E] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {task.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : task.status === 'In Progress' ? (
                      <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </button>

                  {/* Milestone Row Card */}
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className={`flex-1 text-left rounded-xl border px-3.5 py-3 transition-colors duration-150 cursor-pointer ${
                      task.status === 'Completed'
                        ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/70 opacity-70 hover:opacity-100'
                        : 'bg-white dark:bg-[#121417] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${courseStyle.dot} shrink-0`} />
                          <span className="font-mono-num text-[11px] text-zinc-500 dark:text-zinc-400">
                            {course?.code ?? 'CRS'}
                          </span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">·</span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {task.session}
                          </span>
                        </div>
                        <h3
                          className={`text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1 ${
                            task.status === 'Completed' ? 'line-through text-zinc-500 dark:text-zinc-400' : ''
                          }`}
                        >
                          {task.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:hidden tabular-nums">
                          {formatDateIndo(task.due)}
                        </p>
                        {task.notes && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 tabular-nums">
                        <div className="font-mono-num text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {task.weight}
                        </div>
                        {task.status !== 'Completed' && (
                          <div
                            className={`text-[11px] font-medium mt-0.5 ${
                              countdown.isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : countdown.isUrgent
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                          >
                            {countdown.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
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
