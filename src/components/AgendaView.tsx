import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { COURSE_COLOR_STYLES } from '../data/seed';
import { Course, Task, TaskStatus } from '../types';
import { MS_PER_DAY, formatDateIndo, getCountdownText } from '../utils/date';

interface AgendaViewProps {
  courses: Course[];
  filteredTasks: Task[];
  today: Date;
  onSelectTask: (task: Task) => void;
  onQuickToggleStatus: (task: Task, nextStatus: TaskStatus) => void;
}

interface TaskGroup {
  id: string;
  title: string;
  items: Task[];
}

export function AgendaView({
  courses,
  filteredTasks,
  today,
  onSelectTask,
  onQuickToggleStatus,
}: AgendaViewProps) {
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const groups: TaskGroup[] = (() => {
    const urgent: Task[] = [];
    const active: Task[] = [];
    const completed: Task[] = [];

    const sorted = [...filteredTasks].sort(
      (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
    );

    for (const task of sorted) {
      if (task.status === 'Completed') {
        completed.push(task);
        continue;
      }
      const diffDays = (new Date(task.due).getTime() - today.getTime()) / MS_PER_DAY;
      if (diffDays <= 7) {
        urgent.push(task);
      } else {
        active.push(task);
      }
    }

    return [
      { id: 'urgent', title: 'Mendesak & Terlewat (≤ 7 hari)', items: urgent },
      { id: 'active', title: 'Berjalan & Mendatang', items: active },
      { id: 'completed', title: 'Selesai', items: completed },
    ].filter((g) => g.items.length > 0);
  })();

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center flex-1 flex flex-col items-center justify-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Tidak ada tugas yang cocok dengan filter saat ini.
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Ubah kata kunci pencarian atau filter untuk melihat tugas lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-5 pb-6">
        {groups.map((group) => (
          <section key={group.id}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{group.title}</h2>
              <span className="font-mono-num text-[11px] text-zinc-400 dark:text-zinc-500">
                {group.items.length}
              </span>
            </div>

            <div className="bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-hidden">
              {group.items.map((task) => {
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
                  <div
                    key={task.id}
                    className={`px-3.5 sm:px-4 py-3 flex items-center gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors ${
                      task.status === 'Completed' ? 'opacity-60' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onQuickToggleStatus(task, nextStatus)}
                      title={`Ubah status ke ${nextStatus}`}
                      aria-label={`Ubah status ${task.name} ke ${nextStatus}`}
                      className="p-1 -ml-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : task.status === 'In Progress' ? (
                        <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="flex-1 min-w-0 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${courseStyle.dot} shrink-0`} />
                          <span
                            className={`text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate ${
                              task.status === 'Completed' ? 'line-through text-zinc-500 dark:text-zinc-400' : ''
                            }`}
                          >
                            {task.name}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate pl-3.5 mt-0.5">
                          {course?.name ?? 'Mata Kuliah'} · {task.session} · {task.type}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pl-3.5 sm:pl-0 shrink-0 tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num text-xs text-zinc-500 dark:text-zinc-400">
                            {task.weight}
                          </span>
                          <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDateIndo(task.due)}
                          </span>
                        </div>
                        {task.status !== 'Completed' && (
                          <span
                            className={`text-xs font-medium min-w-[72px] text-right ${
                              countdown.isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : countdown.isUrgent
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {countdown.text}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
