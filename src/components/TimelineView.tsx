import { useEffect, useMemo, useRef, useState } from 'react';
import { COURSE_COLOR_STYLES } from '../data/seed';
import { Course, Task } from '../types';
import {
  MS_PER_DAY,
  assignLanes,
  formatDateIndo,
  formatDayMonth,
  getCategoryStyle,
  getDynamicTimelineBounds,
  getMonthLabel,
} from '../utils/date';

interface TimelineViewProps {
  courses: Course[];
  allTasks: Task[];
  filteredTasks: Task[];
  today: Date;
  dayWidth: number;
  scrollTrigger: number;
  onSelectTask: (task: Task) => void;
}

interface TooltipState {
  task: Task;
  courseName: string;
  x: number;
  y: number;
}

export function TimelineView({
  courses,
  allTasks,
  filteredTasks,
  today,
  dayWidth,
  scrollTrigger,
  onSelectTask,
}: TimelineViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cornerHeaderRef = useRef<HTMLDivElement>(null);
  const [leftColWidth, setLeftColWidth] = useState<number>(288);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { minDate, maxDate } = useMemo(
    () => getDynamicTimelineBounds(allTasks, today),
    [allTasks, today],
  );

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / MS_PER_DAY);
  const timelineWidth = totalDays * dayWidth;

  const { days, monthGroups } = useMemo(() => {
    const daysArr: { date: Date; isWeekend: boolean; isToday: boolean }[] = [];
    const groups: { label: string; count: number }[] = [];
    let currentMonthKey = '';
    const todayStr = today.toDateString();

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate.getTime() + i * MS_PER_DAY);
      const mKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (mKey !== currentMonthKey) {
        currentMonthKey = mKey;
        groups.push({ label: getMonthLabel(d), count: 1 });
      } else {
        groups[groups.length - 1].count++;
      }
      daysArr.push({
        date: d,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        isToday: d.toDateString() === todayStr,
      });
    }

    return { days: daysArr, monthGroups: groups };
  }, [minDate, totalDays, today]);

  // Measure sticky left column width accurately via ResizeObserver
  useEffect(() => {
    const el = cornerHeaderRef.current;
    if (!el) return;
    const updateWidth = () => setLeftColWidth(el.getBoundingClientRect().width);
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll to today whenever scrollTrigger increments or on initial mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const offsetDays = (today.getTime() - minDate.getTime()) / MS_PER_DAY;
    const targetX = Math.max(0, offsetDays * dayWidth - 80);
    container.scrollTo({ left: targetX, behavior: 'smooth' });
  }, [scrollTrigger, minDate, dayWidth, today]);

  const todayOffsetDays = (today.getTime() - minDate.getTime()) / MS_PER_DAY;
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays <= totalDays;
  const laneHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 44 : 46;

  const handleMouseEnter = (e: React.MouseEvent, task: Task, courseName: string) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setTooltip({
      task,
      courseName,
      x: Math.min(window.innerWidth - 280, e.clientX + 14),
      y: Math.min(window.innerHeight - 160, e.clientY + 14),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tooltip) return;
    setTooltip((prev) =>
      prev
        ? {
            ...prev,
            x: Math.min(window.innerWidth - 280, e.clientX + 14),
            y: Math.min(window.innerHeight - 160, e.clientY + 14),
          }
        : null,
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden relative transition-colors">
      {/* Legend Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Kategori:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-300">Personal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-300">Team</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Quiz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">LAB / Practicum</span>
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-500 italic hidden md:block">
          Status otomatis mengikuti tanggal hari ini • Klik bar untuk detail/override manual
        </div>
      </div>

      {/* Scrollable Timeline Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto relative select-none">
        <div className="relative min-w-max">
          {/* Sticky Timeline Header */}
          <div className="sticky top-0 z-20 flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
            <div
              ref={cornerHeaderRef}
              className="sticky left-0 z-30 w-36 sm:w-56 md:w-72 shrink-0 bg-slate-50 dark:bg-slate-800/95 border-r border-slate-200 dark:border-slate-700 px-2.5 sm:px-4 py-3 flex items-center justify-between"
            >
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Mata Kuliah
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                Progress
              </span>
            </div>

            <div className="relative flex flex-col">
              <div
                style={{ width: `${timelineWidth}px` }}
                className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 h-7"
              >
                {monthGroups.map((mg) => (
                  <div
                    key={mg.label}
                    style={{ width: `${mg.count * dayWidth}px` }}
                    className="shrink-0 border-r border-slate-200 dark:border-slate-700/80 px-2 sm:px-3 flex items-center text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 truncate"
                  >
                    {mg.label}
                  </div>
                ))}
              </div>
              <div style={{ width: `${timelineWidth}px` }} className="flex h-8 bg-white dark:bg-slate-900">
                {days.map((d, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${dayWidth}px` }}
                    className={`shrink-0 border-r border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-[10px] sm:text-[11px] font-medium ${
                      d.isToday
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                        : d.isWeekend
                          ? 'bg-slate-50/90 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'
                          : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d.date.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Body */}
          <div className="relative divide-y divide-slate-200 dark:divide-slate-800">
            {courses.map((course) => {
              const colorStyle = COURSE_COLOR_STYLES[course.color] ?? COURSE_COLOR_STYLES.indigo;
              const courseAllTasks = allTasks.filter((t) => t.courseId === course.id);
              const courseFilteredTasks = filteredTasks.filter((t) => t.courseId === course.id);
              const completedCount = courseAllTasks.filter((t) => t.status === 'Completed').length;
              const progressPct = courseAllTasks.length
                ? Math.round((completedCount / courseAllTasks.length) * 100)
                : 0;

              const { packedTasks, laneCount } = assignLanes(courseFilteredTasks);
              const rowHeight = Math.max(82, laneCount * laneHeight + 24);

              return (
                <div
                  key={course.id}
                  style={{ minHeight: `${rowHeight}px` }}
                  className="flex group hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                >
                  {/* Sticky Left Course Column */}
                  <div className="sticky left-0 z-10 w-36 sm:w-56 md:w-72 shrink-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/90 border-r border-slate-200 dark:border-slate-800 p-2.5 sm:p-4 flex flex-col justify-center transition-colors shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.4)]">
                    <div className="flex items-start gap-2 sm:gap-2.5">
                      <span className={`w-1.5 sm:w-2 h-8 sm:h-9 rounded-full ${colorStyle.bar} shrink-0 mt-0.5`} />
                      <div className="min-w-0 flex-1">
                        <span
                          className={`inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md border ${colorStyle.badge} mb-0.5 sm:mb-1`}
                        >
                          {course.code}
                        </span>
                        <h2
                          className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2"
                          title={course.name}
                        >
                          {course.name}
                        </h2>
                        <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            {completedCount}/{courseAllTasks.length}{' '}
                            <span className="hidden sm:inline">selesai</span>
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{progressPct}%</span>
                        </div>
                        <div className="w-full h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${colorStyle.bar} rounded-full transition-all duration-300`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Timeline Track */}
                  <div
                    style={{ width: `${timelineWidth}px`, height: `${rowHeight}px` }}
                    className="relative shrink-0"
                  >
                    {/* Background Grid */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {days.map((d, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${dayWidth}px` }}
                          className={`shrink-0 h-full border-r border-slate-100/90 dark:border-slate-800/60 ${
                            d.isWeekend ? 'bg-slate-50/60 dark:bg-slate-800/25' : ''
                          }`}
                        />
                      ))}
                    </div>

                    {/* Task Bars */}
                    {packedTasks.map((task) => {
                      const startMs = new Date(task.start).getTime();
                      const dueMs = new Date(task.due).getTime();
                      const offsetDays = Math.max(0, (startMs - minDate.getTime()) / MS_PER_DAY);
                      const durationDays = Math.max(1.2, (dueMs - startMs) / MS_PER_DAY);

                      const leftPx = offsetDays * dayWidth;
                      const widthPx = Math.max(44, durationDays * dayWidth);
                      const topPx = 12 + task.lane * laneHeight;

                      const style = getCategoryStyle(task.category, task.status);
                      const statusIcon =
                        task.status === 'Completed' ? '✓' : task.status === 'In Progress' ? '⚡' : '';

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => {
                            setTooltip(null);
                            onSelectTask(task);
                          }}
                          onMouseEnter={(e) => handleMouseEnter(e, task, course.name)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={() => setTooltip(null)}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                            top: `${topPx}px`,
                          }}
                          className={`absolute h-8 sm:h-9 rounded-xl ${style.bg} ${style.text} border ${style.border} shadow-xs px-2 sm:px-2.5 flex items-center justify-between gap-1.5 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md hover:z-20 overflow-hidden text-left`}
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                            {statusIcon && (
                              <span className="text-[10px] sm:text-xs font-bold shrink-0">{statusIcon}</span>
                            )}
                            <span
                              className={`text-[11px] sm:text-xs font-semibold truncate ${
                                task.status === 'Completed' ? 'line-through' : ''
                              }`}
                            >
                              {task.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-md ${style.pill}`}
                            >
                              {task.session}
                            </span>
                            <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md bg-black/20">
                              {task.weight}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today Marker Vertical Line */}
          {showTodayLine && (
            <div
              style={{ left: `${leftColWidth + todayOffsetDays * dayWidth}px` }}
              className="absolute top-0 bottom-0 z-10 pointer-events-none border-l-2 border-rose-500"
            >
              <div className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-r-md shadow-xs whitespace-nowrap mt-15">
                HARI INI ({formatDayMonth(today)})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Hover Tooltip */}
      {tooltip && (
        <div
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          className="fixed z-40 pointer-events-none bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl max-w-xs border border-slate-700"
        >
          <div className="font-bold text-sm mb-1">
            {tooltip.task.name} ({tooltip.task.session})
          </div>
          <div className="text-slate-300 text-[11px] mb-2">{tooltip.courseName}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] border-t border-slate-700 pt-1.5">
            <span className="text-slate-400">Mulai:</span>
            <span className="font-medium">{formatDateIndo(tooltip.task.start)}</span>
            <span className="text-slate-400">Deadline:</span>
            <span className="font-medium text-amber-300">{formatDateIndo(tooltip.task.due)}</span>
            <span className="text-slate-400">Bobot / Tipe:</span>
            <span className="font-medium">
              {tooltip.task.weight} • {tooltip.task.type}
            </span>
            <span className="text-slate-400">Status:</span>
            <span className="font-medium">{tooltip.task.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
