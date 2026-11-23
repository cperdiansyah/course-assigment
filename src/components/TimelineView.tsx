import { Check, CircleDot } from 'lucide-react';
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
  const [leftColWidth, setLeftColWidth] = useState<number>(260);
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

  useEffect(() => {
    const el = cornerHeaderRef.current;
    if (!el) return;
    const updateWidth = () => setLeftColWidth(el.getBoundingClientRect().width);
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const offsetDays = (today.getTime() - minDate.getTime()) / MS_PER_DAY;
    const targetX = Math.max(0, offsetDays * dayWidth - 80);
    container.scrollTo({ left: targetX, behavior: 'smooth' });
  }, [scrollTrigger, minDate, dayWidth, today]);

  const todayOffsetDays = (today.getTime() - minDate.getTime()) / MS_PER_DAY;
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays <= totalDays;
  const laneHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 38 : 40;

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
    <div className="bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 rounded-xl flex-1 flex flex-col overflow-hidden relative">
      {/* Compact Legend Bar (Desktop/Tablet) */}
      <div className="hidden sm:flex px-4 py-2 bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">Kategori:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span>Personal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400" />
            <span>Team</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
            <span>Quiz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>LAB / Practicum</span>
          </div>
        </div>
        <div className="text-zinc-400 dark:text-zinc-500 hidden md:block">
          Klik bar untuk detail atau ubah status manual
        </div>
      </div>

      {/* Scrollable Timeline Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto relative select-none">
        <div className="relative min-w-max">
          {/* Sticky Timeline Header */}
          <div className="sticky top-0 z-20 flex bg-white dark:bg-[#121417] border-b border-zinc-200 dark:border-zinc-800">
            <div
              ref={cornerHeaderRef}
              className="sticky left-0 z-30 w-28 sm:w-52 md:w-64 shrink-0 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 px-2.5 sm:px-4 py-2.5 flex items-center justify-between"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Mata kuliah</span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">Progres</span>
            </div>

            <div className="relative flex flex-col">
              <div
                style={{ width: `${timelineWidth}px` }}
                className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 h-7"
              >
                {monthGroups.map((mg) => (
                  <div
                    key={mg.label}
                    style={{ width: `${mg.count * dayWidth}px` }}
                    className="shrink-0 border-r border-zinc-200 dark:border-zinc-800 px-2.5 flex items-center text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 truncate"
                  >
                    {mg.label}
                  </div>
                ))}
              </div>
              <div style={{ width: `${timelineWidth}px` }} className="flex h-7 bg-white dark:bg-[#121417]">
                {days.map((d, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${dayWidth}px` }}
                    className={`shrink-0 border-r border-zinc-100 dark:border-zinc-800/70 flex items-center justify-center text-[11px] tabular-nums ${d.isToday
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                      : d.isWeekend
                        ? 'bg-zinc-50/80 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                  >
                    {d.date.getDate()}
                  </div>
                ))}
              </div>

              {showTodayLine && (
                <div
                  style={{ left: `${todayOffsetDays * dayWidth}px` }}
                  className="absolute top-0.5 z-10 pointer-events-none"
                >
                  <span className="inline-block bg-rose-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-r-md whitespace-nowrap tabular-nums">
                    Hari ini ({formatDayMonth(today)})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Body */}
          <div className="relative divide-y divide-zinc-200 dark:divide-zinc-800">
            {courses.map((course) => {
              const colorStyle = COURSE_COLOR_STYLES[course.color] ?? COURSE_COLOR_STYLES.indigo;
              const courseAllTasks = allTasks.filter((t) => t.courseId === course.id);
              const courseFilteredTasks = filteredTasks.filter((t) => t.courseId === course.id);
              const completedCount = courseAllTasks.filter((t) => t.status === 'Completed').length;
              const progressPct = courseAllTasks.length
                ? Math.round((completedCount / courseAllTasks.length) * 100)
                : 0;

              const { packedTasks, laneCount } = assignLanes(courseFilteredTasks);
              const rowHeight = Math.max(76, laneCount * laneHeight + 20);

              return (
                <div
                  key={course.id}
                  style={{ minHeight: `${rowHeight}px` }}
                  className="flex group hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  {/* Sticky Left Course Column */}
                  <div className="sticky left-0 z-20 w-28 sm:w-52 md:w-64 shrink-0 bg-white dark:bg-[#121417] group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-2.5 sm:px-4 flex flex-col justify-center transition-colors">
                    <div className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.bar} shrink-0 mt-1.5`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono-num text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                            {course.code}
                          </span>
                          <span className="text-[10px] sm:text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400 shrink-0">
                            {completedCount}/{courseAllTasks.length}
                          </span>
                        </div>
                        <h2
                          className="text-[11px] sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight break-words line-clamp-2 mt-0.5"
                          title={course.name}
                        >
                          {course.name}
                        </h2>
                        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
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
                    <div className="absolute inset-0 flex pointer-events-none">
                      {days.map((d, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${dayWidth}px` }}
                          className={`shrink-0 h-full border-r border-zinc-100 dark:border-zinc-800/50 ${d.isWeekend ? 'bg-zinc-50/70 dark:bg-zinc-900/35' : ''
                            }`}
                        />
                      ))}
                    </div>

                    {packedTasks.map((task) => {
                      const startMs = new Date(task.start).getTime();
                      const dueMs = new Date(task.due).getTime();
                      const offsetDays = Math.max(0, (startMs - minDate.getTime()) / MS_PER_DAY);
                      const durationDays = Math.max(1.2, (dueMs - startMs) / MS_PER_DAY);

                      const leftPx = offsetDays * dayWidth;
                      const widthPx = Math.max(48, durationDays * dayWidth);
                      const topPx = 10 + task.lane * laneHeight;

                      const style = getCategoryStyle(task.category, task.status);

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
                          className={`absolute h-7 sm:h-8 rounded-lg border ${style.bar} px-2 sm:px-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors duration-150 hover:z-15 overflow-clip text-left`}
                        >
                          <div className="sticky left-[118px] sm:left-[214px] md:left-[262px] flex items-center gap-1.5 min-w-0">
                            {task.status === 'Completed' ? (
                              <Check className="w-3 h-3 shrink-0 opacity-75" />
                            ) : task.status === 'In Progress' ? (
                              <CircleDot className={`w-3 h-3 shrink-0 ${style.meta}`} />
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                            )}
                            <span
                              className={`text-[11px] sm:text-xs font-medium truncate ${task.status === 'Completed' ? 'line-through' : ''
                                }`}
                            >
                              {task.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`hidden sm:inline text-[10px] ${style.meta}`}>{task.session}</span>
                            {widthPx >= 90 && (
                              <span className={`font-mono-num text-[10px] font-semibold ${style.meta}`}>
                                {task.weight}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today Marker Vertical Line (sits under sticky left column z-20 and sticky header z-20) */}
          {showTodayLine && (
            <div
              style={{ left: `${leftColWidth + todayOffsetDays * dayWidth}px` }}
              className="absolute top-0 bottom-0 z-[5] pointer-events-none border-l border-rose-500/80"
            />
          )}
        </div>
      </div>

      {/* Desktop Hover Tooltip */}
      {tooltip && (
        <div
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          className="fixed z-40 pointer-events-none bg-zinc-900 dark:bg-zinc-800 text-zinc-100 text-xs rounded-xl p-3 shadow-lg max-w-xs border border-zinc-700/80"
        >
          <div className="font-semibold text-[13px] mb-0.5">{tooltip.task.name}</div>
          <div className="text-zinc-400 text-[11px] mb-2">
            {tooltip.courseName} · {tooltip.task.session}
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] border-t border-zinc-800 dark:border-zinc-700 pt-2 tabular-nums">
            <span className="text-zinc-400">Mulai</span>
            <span>{formatDateIndo(tooltip.task.start)}</span>
            <span className="text-zinc-400">Deadline</span>
            <span className="text-amber-300 font-medium">{formatDateIndo(tooltip.task.due)}</span>
            <span className="text-zinc-400">Bobot / Tipe</span>
            <span>
              {tooltip.task.weight} · {tooltip.task.type}
            </span>
            <span className="text-zinc-400">Status</span>
            <span>{tooltip.task.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
