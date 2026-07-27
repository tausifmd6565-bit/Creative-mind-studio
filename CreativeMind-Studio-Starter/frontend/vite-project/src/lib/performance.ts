/**
 * performance.ts
 *
 * Shared performance hooks and utilities for CreativeMind Studio.
 *
 * Exports:
 *   useDebounce          — debounces a value by N ms
 *   useDebouncedCallback — debounces a callback
 *   useVirtualList       — simple windowed list hook (no external dep)
 *   usePagination        — cursor/page-based pagination state
 *   useQueryCache        — tiny in-memory read cache with TTL
 *   useInfiniteScroll    — intersection-observer based infinite scroll trigger
 *   useStableCallback    — stable ref-based callback (no re-render on update)
 *   useThrottle          — throttle a value
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ─── useDebounce ──────────────────────────────────────────────────────────────

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * silence.  Use this to avoid running expensive filters/searches on every
 * keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// ─── useDebouncedCallback ─────────────────────────────────────────────────────

/**
 * Returns a stable debounced version of `fn`.  The returned function will
 * only call `fn` after `delay` ms of inactivity.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay = 300,
): (...args: TArgs) => void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: TArgs) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fnRef.current(...args), delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
}

// ─── useThrottle ─────────────────────────────────────────────────────────────

/**
 * Returns a throttled copy of `value` that updates at most once per `limit` ms.
 */
export function useThrottle<T>(value: T, limit = 150): T {
  const [throttled, setThrottled] = useState<T>(value);
  const lastUpdated = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= limit) {
      lastUpdated.current = now;
      setThrottled(value);
    } else {
      const id = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottled(value);
      }, limit - (now - lastUpdated.current));
      return () => clearTimeout(id);
    }
  }, [value, limit]);

  return throttled;
}

// ─── useStableCallback ────────────────────────────────────────────────────────

/**
 * Returns a stable function reference whose identity never changes, but always
 * calls the latest version of `fn`.  Prevents child components from re-rendering
 * just because a callback prop was recreated in the parent.
 */
export function useStableCallback<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: TArgs) => ref.current(...args), []);
}

// ─── useVirtualList ───────────────────────────────────────────────────────────

interface UseVirtualListOptions {
  /** Total number of items */
  itemCount: number;
  /** Fixed item height in px */
  itemHeight: number;
  /** Height of the visible container in px */
  containerHeight: number;
  /** Extra items to render above/below visible window (default: 3) */
  overscan?: number;
}

interface UseVirtualListReturn {
  /** Indexes of items to render */
  visibleRange: { start: number; end: number };
  /** Total scroll height in px (set as container height) */
  totalHeight: number;
  /** Offset of the first rendered item from the top in px */
  offsetY: number;
  /** Ref to attach to the scrollable outer container */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Minimal virtual list implementation — no external library required.
 * Renders only the visible slice of a long list plus an overscan buffer.
 *
 * Usage:
 *   const { visibleRange, totalHeight, offsetY, containerRef } = useVirtualList({…});
 *   <div ref={containerRef} style={{ height: containerHeight, overflowY: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       <div style={{ position: 'absolute', top: offsetY, width: '100%' }}>
 *         {items.slice(visibleRange.start, visibleRange.end).map(…)}
 *       </div>
 *     </div>
 *   </div>
 */
export function useVirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualListOptions): UseVirtualListReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const { visibleRange, offsetY } = useMemo(() => {
    const startRaw = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, startRaw - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(itemCount, startRaw + visibleCount + overscan);
    return {
      visibleRange: { start, end },
      offsetY: start * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  return {
    visibleRange,
    totalHeight: itemCount * itemHeight,
    offsetY,
    containerRef,
  };
}

// ─── usePagination ────────────────────────────────────────────────────────────

interface UsePaginationOptions {
  /** Total number of items */
  total: number;
  /** Items per page (default: 20) */
  pageSize?: number;
  /** Initial page (default: 1) */
  initialPage?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (p: number) => void;
  reset: () => void;
  /** Slice a flat array to the current page */
  slice: <T>(items: T[]) => T[];
}

export function usePagination({
  total,
  pageSize = 20,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const clamp = (p: number) => Math.max(1, Math.min(totalPages, p));

  const goNext = useCallback(() => setPage(p => clamp(p + 1)), [totalPages]);
  const goPrev = useCallback(() => setPage(p => clamp(p - 1)), []);
  const goTo   = useCallback((p: number) => setPage(clamp(p)), [totalPages]);
  const reset  = useCallback(() => setPage(initialPage), [initialPage]);

  // Clamp page when total changes
  useEffect(() => {
    setPage(p => clamp(p));
  }, [totalPages]);

  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goNext,
    goPrev,
    goTo,
    reset,
    slice: <T,>(items: T[]) => items.slice(offset, offset + pageSize),
  };
}

// ─── useInfiniteScroll ────────────────────────────────────────────────────────

/**
 * Fires `onLoadMore` when the sentinel element enters the viewport.
 * Attach `sentinelRef` to a `<div>` at the bottom of your list.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  options?: { threshold?: number; enabled?: boolean },
) {
  const { threshold = 0.1, enabled = true } = options ?? {};
  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) callbackRef.current();
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, enabled]);

  return { sentinelRef };
}

// ─── useQueryCache ────────────────────────────────────────────────────────────

type CacheEntry<T> = { data: T; expiry: number };

/**
 * Tiny in-memory cache for derived / async data.
 * Prevents re-computing or re-fetching expensive results within a TTL window.
 *
 * Useful for caching filtered/sorted lists computed from large mock datasets.
 */
class QueryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs = 30_000): void {
    this.store.set(key, { data, expiry: Date.now() + ttlMs });
  }

  invalidate(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

/** Singleton app-level query cache */
export const queryCache = new QueryCache();

/**
 * React hook that wraps a synchronous selector with the in-memory cache.
 * Re-runs `selector` only when `deps` change.  Useful for expensive
 * filter+sort operations on large static datasets.
 */
export function useCachedSelector<T>(
  cacheKey: string,
  selector: () => T,
  deps: React.DependencyList,
  ttlMs = 30_000,
): T {
  const result = useMemo(() => {
    const cached = queryCache.get<T>(cacheKey);
    if (cached !== undefined) return cached;
    const computed = selector();
    queryCache.set(cacheKey, computed, ttlMs);
    return computed;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result;
}

// ─── Memoize helper ───────────────────────────────────────────────────────────

/**
 * Creates a memoized version of a pure function using a simple Map cache.
 * The key is derived by JSON-stringifying the arguments.
 *
 * ⚠️  Only use for pure, deterministic functions with serialisable arguments.
 */
export function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  const cache = new Map<string, TResult>();
  return (...args: TArgs): TResult => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
