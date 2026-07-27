/**
 * NotificationFeed.tsx — Right / main panel
 *
 * Performance enhancements:
 *  - All filter / sort / search logic is memoised with useMemo so it only
 *    recomputes when the relevant inputs change (not on every parent render).
 *  - Search is received as an already-debounced string from the parent
 *    (NotificationsWorkspace uses useDebounce before passing it here).
 *  - Pagination via usePagination: renders PAGE_SIZE cards per page.
 *  - "Load more" infinite-scroll sentinel fires the next page.
 *  - unreadCount derived once from the sorted array, not twice.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Inbox, ChevronDown } from 'lucide-react';
import { NotificationCard } from './NotificationCard';
import type { Notification, FilterTab, SortOrder } from '../types';
import { useInfiniteScroll, usePagination } from '../../../../lib/performance';

// ─── Filter & sort logic (hoisted outside component — stable refs) ────────────

function applyFilter(notifications: Notification[], filter: FilterTab): Notification[] {
  switch (filter) {
    case 'unread':      return notifications.filter(n => !n.isRead);
    case 'assignments': return notifications.filter(n => n.category === 'assignment');
    case 'mentions':    return notifications.filter(n => n.category === 'mention');
    case 'ai-agents':   return notifications.filter(n => n.category === 'ai-agent');
    case 'deadlines':   return notifications.filter(n => n.category === 'deadline');
    case 'approvals':   return notifications.filter(n => n.category === 'approval-request');
    case 'warnings':    return notifications.filter(n => n.category === 'rights-warning');
    default:            return notifications;
  }
}

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };

function applySort(notifications: Notification[], sort: SortOrder): Notification[] {
  const copy = [...notifications];
  switch (sort) {
    case 'oldest':   return copy.sort((a, b) => a.timestampISO.localeCompare(b.timestampISO));
    case 'priority': return copy.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    default:         return copy.sort((a, b) => b.timestampISO.localeCompare(a.timestampISO));
  }
}

function applySearch(notifications: Notification[], query: string): Notification[] {
  if (!query.trim()) return notifications;
  const q = query.toLowerCase();
  return notifications.filter(
    n =>
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.projectName.toLowerCase().includes(q) ||
      n.actor.name.toLowerCase().includes(q),
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationFeedProps {
  notifications:  Notification[];
  activeFilter:   FilterTab;
  /** Already debounced by the parent (NotificationsWorkspace) */
  searchQuery:    string;
  sortOrder:      SortOrder;
  onMarkRead:     (id: string) => void;
  onDelete:       (id: string) => void;
}

// ─── Section header (date group) ─────────────────────────────────────────────

const SectionLabel: React.FC<{ label: string }> = React.memo(({ label }) => (
  <div className="flex items-center gap-3 py-2">
    <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 font-mono">{label}</span>
    <div className="flex-1 h-px bg-white/[0.05]" />
  </div>
));
SectionLabel.displayName = 'SectionLabel';

// ─── Page size ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  notifications,
  activeFilter,
  searchQuery,
  sortOrder,
  onMarkRead,
  onDelete,
}) => {
  // All derived data is memoised — recomputes only when inputs change
  const sorted = useMemo(() => {
    const filtered = applyFilter(notifications, activeFilter);
    const searched = applySearch(filtered, searchQuery);
    return applySort(searched, sortOrder);
  }, [notifications, activeFilter, searchQuery, sortOrder]);

  const unreadCount = useMemo(
    () => sorted.filter(n => !n.isRead).length,
    [sorted],
  );

  // Group into "Today" and "Earlier" — memoised
  const todayDateStr = useMemo(() => new Date().toDateString(), []);
  const { todayItems, earlierItems } = useMemo(() => ({
    todayItems:   sorted.filter(n => new Date(n.timestampISO).toDateString() === todayDateStr),
    earlierItems: sorted.filter(n => new Date(n.timestampISO).toDateString() !== todayDateStr),
  }), [sorted, todayDateStr]);

  // Pagination — renders PAGE_SIZE items at a time, growing with "load more"
  const pagination = usePagination({ total: sorted.length, pageSize: PAGE_SIZE });
  const visibleItems = useMemo(() => sorted.slice(0, pagination.page * PAGE_SIZE), [sorted, pagination.page]);

  // Slice today / earlier from the visible window
  const visibleTodayItems   = useMemo(
    () => visibleItems.filter(n => todayItems.some(t => t.id === n.id)),
    [visibleItems, todayItems],
  );
  const visibleEarlierItems = useMemo(
    () => visibleItems.filter(n => earlierItems.some(e => e.id === n.id)),
    [visibleItems, earlierItems],
  );

  // Infinite scroll sentinel
  const { sentinelRef } = useInfiniteScroll(
    () => { if (pagination.hasNext) pagination.goNext(); },
    { enabled: pagination.hasNext },
  );

  return (
    <div className="h-full flex flex-col bg-[#09090F]">

      {/* ── Feed header ── */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="font-display font-semibold text-slate-200 text-sm tracking-wide">
            Activity Feed
          </h3>
          {sorted.length > 0 && (
            <span className="text-[11px] text-slate-600 font-mono">
              {sorted.length} {sorted.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[11px] font-mono font-medium text-brand-electric bg-brand-purple/15 border border-brand-purple/20 rounded-full px-2.5 py-0.5"
          >
            {unreadCount} unread
          </motion.span>
        )}
      </div>

      {/* ── Feed body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm font-display font-medium text-slate-400">No notifications found</p>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              {searchQuery ? 'Try a different search term' : "You're all caught up!"}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Today's notifications */}
            {visibleTodayItems.length > 0 && (
              <>
                <SectionLabel label="Today" />
                <AnimatePresence initial={false}>
                  {visibleTodayItems.map((n, i) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onMarkRead={onMarkRead}
                      onDelete={onDelete}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}

            {/* Earlier notifications */}
            {visibleEarlierItems.length > 0 && (
              <div className={visibleTodayItems.length > 0 ? 'pt-3' : ''}>
                <SectionLabel label="Earlier" />
                <AnimatePresence initial={false}>
                  {visibleEarlierItems.map((n, i) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onMarkRead={onMarkRead}
                      onDelete={onDelete}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Infinite-scroll sentinel / load-more fallback */}
            {pagination.hasNext && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                <button
                  type="button"
                  onClick={pagination.goNext}
                  className="flex items-center gap-2 text-[11px] font-mono text-slate-600
                    hover:text-slate-400 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  Load more ({sorted.length - visibleItems.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
