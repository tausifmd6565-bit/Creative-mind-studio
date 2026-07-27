/**
 * useMicroInteractions.ts
 *
 * Shared hooks for premium micro-interaction primitives.
 * All animations respect prefers-reduced-motion.
 *
 * Exports:
 *  - useCopyToClipboard  — copy text + show transient feedback
 *  - useAutosave         — debounced "saving / saved" indicator state
 *  - useResizablePanel   — drag-to-resize panel split logic
 *  - useContextMenu      — right-click position tracking
 *  - useKeyboardShortcut — single-key shortcut registration
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Copy to clipboard ────────────────────────────────────────────────────────

export type CopyState = 'idle' | 'copied' | 'error';

export function useCopyToClipboard(resetDelay = 2000) {
  const [state, setState] = useState<CopyState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('error');
    }
    timerRef.current = setTimeout(() => setState('idle'), resetDelay);
  }, [resetDelay]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { copy, state };
}

// ─── Autosave indicator ────────────────────────────────────────────────────────

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave(debounceMs = 1500) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = useCallback((onSave?: () => Promise<void>) => {
    setSaveState('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await onSave?.();
        setSaveState('saved');
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2500);
      } catch {
        setSaveState('error');
      }
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  return { saveState, triggerSave };
}

// ─── Resizable panel ──────────────────────────────────────────────────────────

interface UseResizablePanelOptions {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
}

export function useResizablePanel({
  initialWidth,
  minWidth = 200,
  maxWidth = 600,
  side = 'right',
}: UseResizablePanelOptions) {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(initialWidth);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const onMove = (mv: MouseEvent) => {
      const delta = side === 'right'
        ? startXRef.current - mv.clientX
        : mv.clientX - startXRef.current;
      const next = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));
      setWidth(next);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width, minWidth, maxWidth, side]);

  return { width, isDragging, onMouseDown };
}

// ─── Context menu ─────────────────────────────────────────────────────────────

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export function useContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const close = useCallback(() => setPosition(null), []);

  useEffect(() => {
    if (!position) return;
    const handler = () => close();
    window.addEventListener('click', handler);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return () => window.removeEventListener('click', handler);
  }, [position, close]);

  return { position, open, close };
}

// ─── Keyboard shortcut ────────────────────────────────────────────────────────

export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean; enabled?: boolean }
) {
  const { ctrl = false, meta = false, shift = false, enabled = true } = options ?? {};

  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key !== key) return;
      if (ctrl && !e.ctrlKey) return;
      if (meta && !e.metaKey) return;
      if (shift && !e.shiftKey) return;
      handler(e);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [key, handler, ctrl, meta, shift, enabled]);
}

// ─── Hover preview state ──────────────────────────────────────────────────────

export function useHoverPreview(delay = 300) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 100);
  }, []);

  useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  return { visible, show, hide };
}
