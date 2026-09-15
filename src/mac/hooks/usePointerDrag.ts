import { useCallback, useRef, useState, type PointerEvent } from "react";

interface Handlers<T extends HTMLElement> {
  onPointerDown: (e: PointerEvent<T>) => void;
  onPointerMove: (e: PointerEvent<T>) => void;
  onPointerUp: (e: PointerEvent<T>) => void;
  onPointerCancel: (e: PointerEvent<T>) => void;
}

/**
 * Pointer-capture drag helper shared by windows and desktop icons.
 * `onStart` may return false to veto the drag. `onMove` receives the
 * total delta from the pointer-down point.
 */
export function usePointerDrag<T extends HTMLElement>(opts: {
  onStart?: (e: PointerEvent<T>) => boolean | void;
  onMove: (dx: number, dy: number, e: PointerEvent<T>) => void;
  onEnd?: (dx: number, dy: number, moved: boolean) => void;
  threshold?: number;
}): { dragging: boolean; handlers: Handlers<T> } {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const last = useRef({ dx: 0, dy: 0 });
  const [dragging, setDragging] = useState(false);
  const threshold = opts.threshold ?? 3;

  const onPointerDown = useCallback(
    (e: PointerEvent<T>) => {
      if (e.button !== 0) return;
      if (opts.onStart && opts.onStart(e) === false) return;
      origin.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
      last.current = { dx: 0, dy: 0 };
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    },
    [opts]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<T>) => {
      if (!origin.current) return;
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;
      if (!moved.current && Math.hypot(dx, dy) < threshold) return;
      moved.current = true;
      last.current = { dx, dy };
      opts.onMove(dx, dy, e);
    },
    [opts, threshold]
  );

  const end = useCallback(
    (e: PointerEvent<T>) => {
      if (!origin.current) return;
      origin.current = null;
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      opts.onEnd?.(last.current.dx, last.current.dy, moved.current);
    },
    [opts]
  );

  return { dragging, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } };
}
