import {
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  Database,
  GanttChart,
  ListTodo,
  Moon,
  Plus,
  Route,
  Search,
  Sun,
  Zap,
  ClipboardList,
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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          {/* Brand, Title & Mobile Quick Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950/60 shrink-0">
                <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Timeline Tugas Kuliah
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Hari ini:{' '}
                  <strong className="text-slate-700 dark:text-slate-200 font-medium">
                    {formatShortDate(today)}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={onOpenCourses}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Kelola Mata Kuliah"
                aria-label="Kelola Mata Kuliah"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenData}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Backup & Restore Data"
                aria-label="Backup & Restore Data"
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Ganti Tema (Terang/Gelap)"
                aria-label="Ganti Tema"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stats Pills + Desktop Secondary Actions */}
          <div className="flex items-center gap-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 flex-1 lg:flex-initial">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Total Tugas
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">{stats.total}</p>
                </div>
                <span className="p-1.5 bg-slate-200/60 dark:bg-slate-700/70 rounded-lg text-slate-600 dark:text-slate-300">
                  <ClipboardList className="w-4 h-4" />
                </span>
              </div>

              <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase">
                    Deadline &le; 7d
                  </p>
                  <p className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300">{stats.urgent}</p>
                </div>
                <span className="p-1.5 bg-amber-200/60 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>

              <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-blue-700 dark:text-blue-400 uppercase">
                    In Progress
                  </p>
                  <p className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-300">{stats.inProgress}</p>
                </div>
                <span className="p-1.5 bg-blue-200/60 dark:bg-blue-900/50 rounded-lg text-blue-700 dark:text-blue-400">
                  <Zap className="w-4 h-4" />
                </span>
              </div>

              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase">
                    Selesai
                  </p>
                  <p className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-300">
                    {stats.completed}
                  </p>
                </div>
                <span className="p-1.5 bg-emerald-200/60 dark:bg-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCourses}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer"
                title="Kelola Mata Kuliah"
              >
                <BookOpen className="w-4 h-4" />
                <span>Matkul</span>
              </button>
              <button
                type="button"
                onClick={onOpenData}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Backup & Restore Data"
                aria-label="Backup & Restore Data"
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Ganti Tema (Terang/Gelap)"
                aria-label="Ganti Tema"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Action Toolbar */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <div className="relative col-span-2 sm:col-span-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari tugas atau sesi..."
                aria-label="Cari tugas atau sesi"
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2 pointer-events-none" />
            </div>

            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value as 'ALL' | TaskType)}
              aria-label="Filter tipe tugas"
              className="w-full sm:w-auto py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value as 'ALL' | TaskStatus)}
              aria-label="Filter status tugas"
              className="w-full sm:w-auto py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            {/* View Mode Toggle */}
            <div
              className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700"
              role="group"
              aria-label="Mode Tampilan"
            >
              <button
                type="button"
                onClick={() => onViewModeChange('timeline')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <GanttChart className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('agenda')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('journey')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'journey'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Perjalanan</span>
              </button>
            </div>

            {viewMode === 'timeline' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onZoomOut}
                  title="Perkecil Skala"
                  aria-label="Perkecil Skala"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Zoom
                </span>
                <button
                  type="button"
                  onClick={onZoomIn}
                  title="Perbesar Skala"
                  aria-label="Perbesar Skala"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition cursor-pointer"
                >
                  +
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {viewMode === 'timeline' && (
                <button
                  type="button"
                  onClick={onScrollToday}
                  className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/70 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Hari Ini</span>
                </button>
              )}
              <button
                type="button"
                onClick={onAddTask}
                className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-indigo-950/60 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
