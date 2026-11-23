import { useId, useRef, useState } from 'react';
import { Download, FileSpreadsheet, RotateCcw, Upload, X } from 'lucide-react';
import { Course, Task } from '../types';
import {
  downloadExampleCsv,
  exportAppCsv,
  exportAppJson,
  parseImportedFile,
} from '../utils/storage';
import { ModalDialog } from './ModalDialog';

export type ImportMode = 'append' | 'flush';

interface DataModalProps {
  open: boolean;
  courses: Course[];
  tasks: Task[];
  today: Date;
  onClose: () => void;
  onImport: (courses: Course[], tasks: Task[], mode: ImportMode) => number;
  onResetDefault: () => void;
}

export function DataModal({
  open,
  courses,
  tasks,
  today,
  onClose,
  onImport,
  onResetDefault,
}: DataModalProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<ImportMode>('append');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedFile(file.name, text, today);
      const count = onImport(imported.courses, imported.tasks, importMode);
      setFeedback({
        type: 'ok',
        text:
          importMode === 'flush'
            ? `Data lama dihapus & diganti dengan ${imported.courses.length} matkul dan ${count} tugas.`
            : `Berhasil menambahkan ${count} tugas baru ke data yang sudah ada.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal membaca file.',
      });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledBy={titleId} maxWidthClass="sm:max-w-md">
      <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/60">
        <div>
          <h1 id={titleId} className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Data, Import & Export
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Semua perubahan tersimpan otomatis di LocalStorage browser.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Import Section */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Import Data (CSV / JSON)
            </span>
            <button
              type="button"
              onClick={() => {
                downloadExampleCsv();
                setFeedback({ type: 'ok', text: 'File example-assignments.csv berhasil diunduh.' });
              }}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Download Example CSV
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                importMode === 'append'
                  ? 'bg-white dark:bg-zinc-900 border-indigo-500/60 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="import-mode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium">Tambah saja (Append)</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Pertahankan data lama, lalu tambahkan mata kuliah & tugas dari file.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                importMode === 'flush'
                  ? 'bg-white dark:bg-zinc-900 border-rose-500/60 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="import-mode"
                value="flush"
                checked={importMode === 'flush'}
                onChange={() => setImportMode('flush')}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium">Hapus data lama & ganti (Flush)</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Hapus seluruh data saat ini, lalu isi ulang dengan data dari file.
                </div>
              </div>
            </label>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pilih File CSV atau JSON</span>
          </button>
        </div>

        {/* Export Section */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              exportAppCsv(courses, tasks);
              setFeedback({ type: 'ok', text: 'Data berhasil diekspor ke file CSV.' });
            }}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Export CSV</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Edit di Excel/Sheets</div>
            </div>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              exportAppJson(courses, tasks);
              setFeedback({ type: 'ok', text: 'File backup JSON berhasil diunduh.' });
            }}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Export JSON</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Backup lengkap</div>
            </div>
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          </button>
        </div>

        {/* Reset Section */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {confirmReset ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
                Reset ke data seeder awal?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetDefault();
                    setConfirmReset(false);
                    setFeedback({ type: 'ok', text: 'Data berhasil dikembalikan ke seeder CSV awal.' });
                  }}
                  className="px-3 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  Reset ke Seeder Awal
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Muat ulang data bawaan dari seeder CSV
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
