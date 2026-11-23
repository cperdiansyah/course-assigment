import { ReactNode, useEffect, useRef } from 'react';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  ariaLabelledBy: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function ModalDialog({
  open,
  onClose,
  ariaLabelledBy,
  children,
  maxWidthClass = 'sm:max-w-lg',
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };
    dialog.addEventListener('close', handleClose);

    // Fallback light-dismiss for browsers without HTMLDialogElement.prototype.closedBy
    let cleanupFallback: (() => void) | undefined;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      cleanupFallback?.();
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={ariaLabelledBy}
      {...({ closedby: 'any' } as Record<string, string>)}
      className={`mt-auto mb-0 mx-0 w-full max-w-full rounded-t-2xl rounded-b-none pb-[env(safe-area-inset-bottom)] sm:m-auto sm:w-[calc(100%-2rem)] ${maxWidthClass} sm:rounded-xl sm:pb-0 bg-white dark:bg-[#121417] text-zinc-900 dark:text-zinc-100 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl p-0 overflow-hidden`}
    >
      <div className="sm:hidden flex justify-center pt-2 pb-0.5 bg-zinc-50/70 dark:bg-zinc-900/60" aria-hidden="true">
        <span className="w-9 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      </div>
      {open ? children : null}
    </dialog>
  );
}
