import { GanttChart, ListTodo, Route } from 'lucide-react';
import { ViewMode } from '../types';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const NAV_ITEMS: { id: ViewMode; label: string; Icon: typeof GanttChart }[] = [
  { id: 'timeline', label: 'Timeline', Icon: GanttChart },
  { id: 'agenda', label: 'Agenda', Icon: ListTodo },
  { id: 'journey', label: 'Perjalanan', Icon: Route },
];

export function MobileBottomNav({ viewMode, onViewModeChange }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navigasi tampilan"
      className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-3 h-14">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = viewMode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewModeChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 active:scale-[0.96] cursor-pointer ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 w-8 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                />
              )}
              <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[11px] leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
