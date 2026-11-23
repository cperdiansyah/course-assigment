import {
  BookOpen,
  CalendarDays,
  Database,
  GanttChart,
  ListTodo,
  Minus,
  Moon,
  Plus,
  Route,
  Search,
  Sun,
} from 'lucide-react';
import { TaskStatus, TaskType, ViewMode } from '../types';
import { formatShortDate } from '../utils/date';

interface HeaderProps {
  today: Date;
  stats: {
    total: number;
    urgent: number;
    inProgress: number;
    completed: number;
  };
  isDark: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterType: 'ALL' | TaskType;
  onFilterTypeChange: (t: 'ALL' | TaskType) => void;
  filterStatus: 'ALL' | TaskStatus;
  onFilterStatusChange: (s: 'ALL' | TaskStatus) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScrollToday: () => void;
  onAddTask: () => void;
  onOpenCourses: () => void;
  onOpenData: () => void;
}

export function Header({
  today,
  stats,
  isDark,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  viewMode,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
  onScrollToday,
  onAddTask,
  onOpenCourses,
  onOpenData,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-[#121417] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
      <div className="max-w-full mx-auto px-3 sm:px-6">
        {/* Top Row: Brand, Inline Summary & Primary Actions */}
        <div className="h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-[13px] sm:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  Timeline Tugas
                </h1>
                <span className="hidden md:inline text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {formatShortDate(today)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums truncate">
                {stats.total} tugas
                <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">·</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{stats.inProgress} berjalan</span>
                {stats.urgent > 0 && (
                  <span className="hidden sm:inline">
                    <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      {stats.urgent} deadline &le;7h
                    </span>
                  </span>
                )}
                <span className="hidden md:inline">
                  <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">·</span>
                  {stats.completed} selesai
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop View Switcher */}
            <div
              className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/70"
              role="group"
              aria-label="Mode Tampilan"
            >
              <button
                type="button"
                onClick={() => onViewModeChange('timeline')}
                className={`h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.97] cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <GanttChart className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('agenda')}
                className={`h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.97] cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('journey')}
                className={`h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.97] cursor-pointer ${
                  viewMode === 'journey'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Perjalanan</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenCourses}
              className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.97] cursor-pointer"
              title="Kelola Mata Kuliah"
              aria-label="Kelola Mata Kuliah"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matkul</span>
            </button>

            <button
              type="button"
              onClick={onOpenData}
              className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors duration-150 active:scale-[0.97] cursor-pointer"
              title="Backup & Restore Data"
              aria-label="Backup & Restore Data"
            >
              <Database className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors duration-150 active:scale-[0.97] cursor-pointer"
              title="Ganti Tema (Terang/Gelap)"
              aria-label="Ganti Tema"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onAddTask}
              className="h-8 px-2.5 sm:px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors duration-150 active:scale-[0.97] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden min-[380px]:inline">Tugas</span>
            </button>
          </div>
        </div>

        {/* Filter & Controls Row */}
        <div className="py-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <div className="relative w-full sm:w-52">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari tugas, matkul, sesi..."
                aria-label="Cari tugas atau sesi"
                className="w-full h-8 pl-8 pr-3 text-base sm:text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value as 'ALL' | TaskType)}
              aria-label="Filter tipe tugas"
              className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-200 cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="ALL">Semua tipe</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value as 'ALL' | TaskStatus)}
              aria-label="Filter status tugas"
              className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-200 cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="ALL">Semua status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            {/* Mobile View Switcher */}
            <div
              className="flex md:hidden items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/70"
              role="group"
              aria-label="Mode Tampilan"
            >
              <button
                type="button"
                onClick={() => onViewModeChange('timeline')}
                title="Timeline"
                className={`h-7 px-2 text-xs font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <GanttChart className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('agenda')}
                title="Agenda"
                className={`h-7 px-2 text-xs font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('journey')}
                title="Perjalanan"
                className={`h-7 px-2 text-xs font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'journey'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
              </button>
            </div>

            {viewMode === 'timeline' && (
              <>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/70">
                  <button
                    type="button"
                    onClick={onZoomOut}
                    title="Perkecil Skala"
                    aria-label="Perkecil Skala"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Zoom</span>
                  <button
                    type="button"
                    onClick={onZoomIn}
                    title="Perbesar Skala"
                    aria-label="Perbesar Skala"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onScrollToday}
                  className="h-8 px-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/8 hover:bg-rose-500/15 border border-rose-500/20 rounded-lg transition-colors duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap"
                >
                  Hari ini
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
