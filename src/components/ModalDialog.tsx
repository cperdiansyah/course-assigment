import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

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
  const isClosingRef = useRef(false);
  const [rendered, setRendered] = useState(open);

  const closeWithAnimation = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open || isClosingRef.current) return;

    isClosingRef.current = true;
    dialog.setAttribute('data-closing', '');
    // Flush style so the browser starts the exit transition before querying getAnimations()
    getComputedStyle(dialog).transform;

    const animations = dialog.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => window.setTimeout(r, 450)),
      ]);
    } else {
      await new Promise((r) => window.setTimeout(r, 300));
    }

    dialog.removeAttribute('data-closing');
    if (dialog.open) {
      dialog.close();
    }
    isClosingRef.current = false;
    setRendered(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      isClosingRef.current = false;
      dialog.removeAttribute('data-closing');
      setRendered(true);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      void closeWithAnimation();
    } else {
      setRendered(false);
    }
  }, [open, closeWithAnimation]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      void closeWithAnimation().then(() => {
        onClose();
      });
    };

    const handleClose = () => {
      dialog.returnValue = '';
      if (!isClosingRef.current) {
        setRendered(false);
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
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
          void closeWithAnimation().then(() => {
            onClose();
          });
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
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      cleanupFallback?.();
    };
  }, [onClose, closeWithAnimation]);

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
      {rendered ? children : null}
    </dialog>
  );
}
