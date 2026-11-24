import { Clock, X } from 'lucide-react';

interface UrgentStripProps {
  urgentCount: number;
  active: boolean;
  onToggle: () => void;
}

export function UrgentStrip({ urgentCount, active, onToggle }: UrgentStripProps) {
  if (urgentCount === 0 && !active) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`mb-2.5 sm:mb-3 w-full px-3 sm:px-3.5 py-2 rounded-lg border flex items-center justify-between gap-2 text-left transition-colors duration-150 active:scale-[0.995] cursor-pointer ${
        active
          ? 'bg-amber-500/15 dark:bg-amber-400/15 border-amber-500/50 dark:border-amber-400/40 text-amber-950 dark:text-amber-100'
          : 'bg-amber-500/[0.06] dark:bg-amber-400/[0.06] border-amber-500/25 dark:border-amber-400/20 hover:bg-amber-500/10 dark:hover:bg-amber-400/10 text-zinc-800 dark:text-zinc-200'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
        <span className="text-xs font-medium truncate">
          Ada <strong className="font-semibold tabular-nums">{urgentCount}</strong> deadline &le; 7 hari
        </span>
      </div>

      <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1 shrink-0">
        {active ? (
          <>
            <span>Filter aktif</span>
            <X className="w-3 h-3" />
          </>
        ) : (
          <span>Lihat semua</span>
        )}
      </span>
    </button>
  );
}
