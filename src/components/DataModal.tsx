import { useId, useRef, useState } from 'react';
import { Download, RotateCcw, Upload, X } from 'lucide-react';
import { Course, Task } from '../types';
import { exportAppData, parseImportedData } from '../utils/storage';
import { ModalDialog } from './ModalDialog';

interface DataModalProps {
  open: boolean;
  courses: Course[];
  tasks: Task[];
  onClose: () => void;
  onImport: (courses: Course[], tasks: Task[]) => void;
  onResetDefault: () => void;
}

export function DataModal({
  open,
  courses,
  tasks,
  onClose,
  onImport,
  onResetDefault,
}: DataModalProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedData(text);
      onImport(imported.courses, imported.tasks);
      setFeedback({
        type: 'ok',
        text: `Berhasil mengimpor ${imported.courses.length} mata kuliah dan ${imported.tasks.length} tugas.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal membaca file JSON.',
      });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledBy={titleId} maxWidthClass="max-w-md">
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
        <div>
          <h1 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Backup & Restore Data
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data tersimpan otomatis di browser (LocalStorage).
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-3">
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium border ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            exportAppData(courses, tasks);
            setFeedback({ type: 'ok', text: 'File backup JSON berhasil diunduh.' });
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-left cursor-pointer"
        >
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Export JSON</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Unduh semua mata kuliah & tugas sebagai file backup
            </div>
          </div>
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-left cursor-pointer"
        >
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Import JSON</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Pulihkan data dari file backup yang pernah diunduh
            </div>
          </div>
          <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </button>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {confirmReset ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
                Yakin reset ke data awal?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetDefault();
                    setConfirmReset(false);
                    setFeedback({ type: 'ok', text: 'Data berhasil dikembalikan ke bawaan awal.' });
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
            >
              <div>
                <div className="text-sm font-semibold text-rose-700 dark:text-rose-400">Reset ke Default</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Kembalikan daftar mata kuliah & tugas ke template awal
                </div>
              </div>
              <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </ModalDialog>
  );
}
