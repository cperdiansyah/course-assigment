import { useEffect, useMemo, useState } from 'react';
import { AgendaView } from './components/AgendaView';
import { CourseModal } from './components/CourseModal';
import { DataModal } from './components/DataModal';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';
import { TimelineView } from './components/TimelineView';
import { DEFAULT_COURSES, getSeedTasks } from './data/seed';
import { useTheme } from './hooks/useTheme';
import { Course, Task, TaskStatus, TaskType, ViewMode } from './types';
import { MS_PER_DAY } from './utils/date';
import { loadAppState, saveAppState } from './utils/storage';

export default function App() {
  const [today] = useState<Date>(() => new Date());
  const [{ courses, tasks }, setAppState] = useState(() => loadAppState(today));
  const { isDark, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TaskType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'agenda' : 'timeline',
  );
  const [dayWidth, setDayWidth] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 22 : 28,
  );
  const [scrollTrigger, setScrollTrigger] = useState(0);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Persist to LocalStorage whenever courses or tasks change
  useEffect(() => {
    saveAppState(courses, tasks);
  }, [courses, tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const urgent = tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      const diffDays = (new Date(t.due).getTime() - today.getTime()) / MS_PER_DAY;
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    return { total, completed, inProgress, urgent };
  }, [tasks, today]);

  const courseNameMap = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const courseName = courseNameMap.get(t.courseId) ?? '';
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.session.toLowerCase().includes(q) ||
        courseName.toLowerCase().includes(q);
      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [tasks, searchQuery, filterType, filterStatus, courseNameMap]);

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (data: Omit<Task, 'id'>, existingId?: number) => {
    setAppState((prev) => {
      if (existingId !== undefined) {
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === existingId ? { ...t, ...data } : t)),
        };
      }
      const nextId = prev.tasks.length ? Math.max(...prev.tasks.map((t) => t.id)) + 1 : 1;
      return {
        ...prev,
        tasks: [...prev.tasks, { id: nextId, ...data }],
      };
    });
    setTaskModalOpen(false);
  };

  const handleDeleteTask = (id: number) => {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    setTaskModalOpen(false);
  };

  const handleQuickToggleStatus = (task: Task, nextStatus: TaskStatus) => {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === task.id ? { ...t, status: nextStatus, manualStatus: true } : t,
      ),
    }));
  };

  const handleSaveCourse = (course: Course, isNew: boolean) => {
    setAppState((prev) => ({
      ...prev,
      courses: isNew
        ? [...prev.courses, course]
        : prev.courses.map((c) => (c.id === course.id ? course : c)),
    }));
  };

  const handleDeleteCourse = (courseId: string) => {
    setAppState((prev) => ({
      courses: prev.courses.filter((c) => c.id !== courseId),
      tasks: prev.tasks.filter((t) => t.courseId !== courseId),
    }));
  };

  const handleImportData = (importedCourses: Course[], importedTasks: Task[]) => {
    setAppState({ courses: importedCourses, tasks: importedTasks });
  };

  const handleResetDefault = () => {
    setAppState({ courses: DEFAULT_COURSES, tasks: getSeedTasks(today) });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        today={today}
        stats={stats}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onZoomIn={() => setDayWidth((w) => Math.min(56, w + 6))}
        onZoomOut={() => setDayWidth((w) => Math.max(14, w - 6))}
        onScrollToday={() => setScrollTrigger((n) => n + 1)}
        onAddTask={handleOpenNewTask}
        onOpenCourses={() => setCourseModalOpen(true)}
        onOpenData={() => setDataModalOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden p-2.5 sm:p-6">
        {viewMode === 'timeline' ? (
          <TimelineView
            courses={courses}
            allTasks={tasks}
            filteredTasks={filteredTasks}
            today={today}
            dayWidth={dayWidth}
            scrollTrigger={scrollTrigger}
            onSelectTask={handleSelectTask}
          />
        ) : (
          <AgendaView
            courses={courses}
            filteredTasks={filteredTasks}
            today={today}
            onSelectTask={handleSelectTask}
            onQuickToggleStatus={handleQuickToggleStatus}
          />
        )}
      </main>

      <TaskModal
        open={taskModalOpen}
        task={editingTask}
        courses={courses}
        today={today}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <CourseModal
        open={courseModalOpen}
        courses={courses}
        tasks={tasks}
        onClose={() => setCourseModalOpen(false)}
        onSaveCourse={handleSaveCourse}
        onDeleteCourse={handleDeleteCourse}
      />

      <DataModal
        open={dataModalOpen}
        courses={courses}
        tasks={tasks}
        onClose={() => setDataModalOpen(false)}
        onImport={handleImportData}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
}
